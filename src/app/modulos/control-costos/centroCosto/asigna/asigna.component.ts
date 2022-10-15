import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { CentroCostoService } from '../centroCosto.service';
import { Anio, CentroCosto_Asig } from '../Models/asignar/IAsignar';
import { Area, Direccion } from '../Models/centroCostos/ICentroCosto';
import { AsigaVisorComponent } from './asiga-visor/asiga-visor.component';
import { AsignaCrearComponent } from './asigna-crear/asigna-crear.component';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-asigna',
  templateUrl: './asigna.component.html',
  styleUrls: ['./asigna.component.css'],
  animations: [asistenciapAnimations]
})
export class AsignaComponent implements OnInit {

  tsLista = 'inactive';
  nListaLength = 0;

  dataSource: MatTableDataSource<CentroCosto_Asig>;

  displayedColumns = ['nIdCC', 'sCodCC', 'sDescCC', 'sDescDireccion', 'sDescArea', 'sSubCargo',
    'sDescMoneda', 'nImporte', 'sEstadoCC'
  ];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(AsignaCrearComponent) asignacrearComp: AsignaCrearComponent;

  vCentroCostoSeleccionado: CentroCosto_Asig;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  estaCargado: boolean = false; // Variable para ver cuando la pagina este completamente cargada

  //Datos
  lCentroCosto: CentroCosto_Asig [];
  lDireccion: Direccion;
  lArea: Area;

  cbDireccion = new FormControl();
  cbArea = new FormControl();

  vPrincipal: boolean = true;
  vSecundario: boolean = false;

  sAnioActual = (new Date().getFullYear()).toString();
  lAnio: Anio[] = [];
  matcher = new MyErrorStateMatcher();
  cboAnio = new FormControl();
  txtFiltro = new FormControl();
  codCentrodeCosto = null; // Codigo del presupuesto si viene por parametro del URL

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private vCentroCostoService: CentroCostoService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.url = baseUrl;

    // Asignacion del codigo de presupuestos por URL
    const pCentroDeCosto = this.route.snapshot.params.id;

    if (pCentroDeCosto != 0 && pCentroDeCosto != undefined && pCentroDeCosto != '') {
      this.codCentrodeCosto = pCentroDeCosto;
    }
  }


  ngAfterContentChecked() {

    this.cdr.detectChanges();

  }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    //this.fnListarDirecciones();
    await this.fnListarAnios();
  }

  //#region Funciones de listado Deprecated===
  fnListarDirecciones = function () {
    this.spinner.show();

    var pEntidad = 5; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla


    pParametro.push(this.idEmp);

    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lDireccion = [...new Map(res.map(item => [item.nIdDireccion, item])).values()];
        this.cbDireccion.setValue(this.lDireccion[0].nIdDireccion);
        this.fnListarAreas(this.lDireccion[0]);
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarAreas = function (p: Direccion) {
    this.spinner.show();

    var pEntidad = 6; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);
    pParametro.push(p.nIdDireccion);

    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lArea = [...new Map(res.map(item => [item.nIdArea, item])).values()];
        this.cbArea.setValue(this.lArea[0].nIdArea);
        this.fnListarCC(this.lArea[0])
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarCC = function (p: Area) {
    this.spinner.show();


    let vDireccion = this.cbDireccion.value;

    var pEntidad = 4; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(vDireccion);
    pParametro.push(p.nIdArea);
    pParametro.push(this.idEmp);
    pParametro.push(this.sAnioActual);


    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lCentroCosto = res;

        const centroCostos = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k));
        this.dataSource = new MatTableDataSource(centroCostos);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  //#endregion
  
  //#region Listados nuevos
  fnListarAnios() {

    this.spinner.show();
    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 6;

    pParametro.push(this.idEmp);

    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      async res => {
        this.lAnio = res;
        if (this.lAnio.findIndex(item => item.sAnio == this.sAnioActual) == -1) {
          this.lAnio.push({ sAnio: this.sAnioActual });
        }
        this.cboAnio.setValue(this.sAnioActual)
        await this.fnListarCCNuevo(this.sAnioActual)
      },
      err => {
        console.log(err);
      },
      () => {
      }
    );
  }

  fnListarCCNuevo(sAnio: string) {
    this.spinner.show();

    var pEntidad = 4; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);
    pParametro.push(sAnio);

    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lCentroCosto = res;

        const centroCostos = res;
        this.dataSource = new MatTableDataSource(centroCostos);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.fnFiltrar();

        // Si hay un parametro en el URL, ver el detalle del presupuesto
        if(this.codCentrodeCosto){
          const row = this.lCentroCosto.find((presupuesto) => presupuesto.nIdCC == this.codCentrodeCosto);
          if(row){
            this.fnVerDetalle(row);
          }
        }
        else{
          this.estaCargado = true;
          this.spinner.hide();
        }

      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }
  //#endregion

  //===Funciones de interaccion
  fnVerDetalle(row) {
    this.vSecundario = true;
    this.vCentroCostoSeleccionado = row;
    this.vPrincipal = false;

    if (this.tsLista != 'active') {
      this.onToggleFab(1, -1)
    }

    this.estaCargado = true;
    this.spinner.hide();
  }

  fnSalir() {

    if(this.codCentrodeCosto){
      this.router.navigateByUrl('/controlcostos/centroCosto/asigna');
    }
    else{
      this.vSecundario = false;
      this.vPrincipal = true;
      this.fnListarCCNuevo(this.cboAnio.value);
    }
  }

  fnAbrirDialog(p: CentroCosto_Asig) {
    const dialogRef = this.dialog.open(AsigaVisorComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: p
    });
  }

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.nListaLength > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.nListaLength = (stat === 0) ? 0 : 3;

  }

  async fnDescargarExcel() {
    const sAnio = this.cboAnio.value;

    this.spinner.show();
    const presupuesto = 0; //0 para listar todos los presupuestos
    const response: any = await this.vCentroCostoService.fnGenerarExcelAsignaPresupuesto(1, `${this.idEmp}|${sAnio}|${presupuesto}`);

    if(response){
      // Descargar el Excel
      const data = response;
      const fileName = `Reporte Control Costo.xlsx`;
      if (window.navigator && window.navigator['msSaveOrOpenBlob']) {
        window.navigator['msSaveOrOpenBlob'](data, fileName);
        return;
      }
      const objectUrl = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      // Trigger de descarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

      Swal.fire({
        title: 'El Excel ha sido generado',
        html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
        icon: 'success',
        showCloseButton: true
      })
    }
    else{
      Swal.fire('¡Verificar!', 'No se encontraron registros', 'warning')
    }
    this.spinner.hide();
  }
}
