import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CentroCostoService } from '../../centroCosto.service';
import { Anio, CentroCosto_Asig, Detalle_CCPresS, Detalle_CCPresSMes } from '../../Models/asignar/IAsignar';
import { DetalleCC } from '../../Models/centroCostos/ICentroCosto';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-asiga-visor',
  templateUrl: './asiga-visor.component.html',
  styleUrls: ['./asiga-visor.component.css']
})
export class AsigaVisorComponent implements OnInit {

  displayedColumns = ['sCodPartida', 'sDescPartida', 'nResguardo']

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Detalle_CCPresS>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  ccPresMesForm: FormGroup;

  lMesId = [
    1456,//Enero
    1457,
    1458,
    1459,
    1460,
    1461,
    1462,
    1463,
    1464,
    1465,
    1466,
    1467 //Diciembre
  ]

  lAnio: Anio[] = [];
  lDetalleCC: DetalleCC[] = [];
  lDetalleCC_PresSMes: Detalle_CCPresSMes[] = [];
  vCentroCostoSeleccionado: CentroCosto_Asig;
  nImporteSel: number;
  sDescPartidaSel: string;

  nIdPartidaSeleccionada: number;
  cboAnio = new FormControl();
  txtImporte = new FormControl();
  cboSucursal = new FormControl();

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual


  vAnioActual: string;
  matcher = new MyErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vCentroCostoService: CentroCostoService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string,

    public dialogRef: MatDialogRef<AsigaVisorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CentroCosto_Asig
  ) { this.url = baseUrl; }

  ngOnInit(): void {
    this.vCentroCostoSeleccionado = this.data;

    this.vAnioActual = new Date().getFullYear().toString();
    this.fnListarAnios();
    this.fnListarCCDetalle(this.vCentroCostoSeleccionado.nIdCC);

    this.lMesId.forEach(item => {
      this.lDetalleCC_PresSMes.push({
        nIdDetCCSMes: 0, nIdDetCCS: 0, nImporte: 0, nIdMes: item, sCodMes: '', sDescMes: ''
      })
    })

    this.ccPresMesForm = this.formBuilder.group({
      txtEnero: [0, [Validators.required, Validators.min(0)]],
      txtFebrero: [0, [Validators.required, Validators.min(0)]],
      txtMarzo: [0, [Validators.required, Validators.min(0)]],
      txtAbril: [0, [Validators.required, Validators.min(0)]],
      txtMayo: [0, [Validators.required, Validators.min(0)]],
      txtJunio: [0, [Validators.required, Validators.min(0)]],
      txtJulio: [0, [Validators.required, Validators.min(0)]],
      txtAgosto: [0, [Validators.required, Validators.min(0)]],
      txtSeptiembre: [0, [Validators.required, Validators.min(0)]],
      txtOctubre: [0, [Validators.required, Validators.min(0)]],
      txtNoviembre: [0, [Validators.required, Validators.min(0)]],
      txtDiciembre: [0, [Validators.required, Validators.min(0)]],
    })
  }

  ngAfterContentChecked() {

    this.cdr.detectChanges();

  }

  //Funciones para listar
  fnListarAnios = function () {

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(this.vCentroCostoSeleccionado.nIdCC);


    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lAnio = res
        if (this.lAnio.length != 0) {
          if (this.lAnio.findIndex(item => item.sAnio == this.vAnioActual) == -1) {
            this.fnListarImporte(this.lAnio[this.lAnio.length - 1]?.sAnio);
            this.cboAnio.setValue(this.lAnio[this.lAnio.length - 1]?.sAnio)
          } else {
            this.fnListarImporte(this.vAnioActual);
            this.cboAnio.setValue(this.vAnioActual);
          }
        }
      },
      err => {
        console.log(err);
      },
      () => {
      }
    );
  }

  fnListarCCDetalle = function (idCC: number) {
    var pEntidad = 8;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vFiltro = " "

    pParametro.push(this.idEmp);
    pParametro.push(idCC)
    pParametro.push(vFiltro);

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lDetalleCC = res;
        if (this.lDetalleCC.length != 0) {
          this.cboSucursal.setValue(this.lDetalleCC[0]?.nIdCCS);
          this.fnListarDetalleCCSPres(this.lDetalleCC[0]?.nIdCCS)
        }
      },
      err => {
        console.log(err);
      },
      () => {
      }
    );
  }

  fnListarImporte = function (p: string) {
    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los registros de la tabla


    pParametro.push(this.vCentroCostoSeleccionado.nIdCC);
    pParametro.push(p)

    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.nImporteSel = this.fnRedondear(+res.mensaje)
        this.txtImporte.setValue(this.nImporteSel)
      },
      err => {
        console.log(err);
      },
      () => {
      }
    );
  }

  fnListarDetalleCCSPres_Mes(idCCSPres: number, sDesc: string) {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla
    this.sDescPartidaSel = sDesc;
    this.nIdPartidaSeleccionada = idCCSPres;
    pParametro.push(idCCSPres);
    pParametro.push(this.cboAnio.value);
    this.fnVaciarInputMeses();
    this.fnVaciarMeses();
    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.fnPartirMeses(res)
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarDetalleCCSPres = function (idCCS: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    this.fnVaciarInputMeses();
    this.fnVaciarMeses();
    pParametro.push(idCCS);
    pParametro.push(this.cboAnio.value);
    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lDetalleCC_PresS = res
        const detalleCCPresS = res
        this.dataSource = new MatTableDataSource(detalleCCPresS);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.fnListarDetalleCCSPres_Mes(this.lDetalleCC_PresS[0]?.nIdDCCPreS, this.lDetalleCC_PresS[0]?.sDescPartida)

      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }


  //Funciones varias

  fnPartirMeses(res: Detalle_CCPresSMes[]) {
    //Asignanado los valores de los meses a cada input 
    res.forEach(item => {
      switch (item.nIdMes) {
        case this.lMesId[0]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtEnero.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        case this.lMesId[1]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtFebrero.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        case this.lMesId[2]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtMarzo.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        case this.lMesId[3]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtAbril.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        case this.lMesId[4]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtMayo.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        case this.lMesId[5]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtJunio.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        case this.lMesId[6]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtJulio.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        case this.lMesId[7]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtAgosto.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        case this.lMesId[8]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtSeptiembre.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        case this.lMesId[9]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtOctubre.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        case this.lMesId[10]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtNoviembre.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        case this.lMesId[11]: {
          let index = this.lDetalleCC_PresSMes.findIndex(x => x.nIdMes == item.nIdMes)
          this.lDetalleCC_PresSMes[index].nIdDetCCSMes = item.nIdDetCCSMes;
          this.lDetalleCC_PresSMes[index].nImporte = item.nImporte;
          this.ccPresMesForm.controls.txtDiciembre.setValue(this.fnRedondear(item.nImporte));
          break;
        }
        default: {
          break;
        }

      }
    })
  }

  fnRedondear(num) {
    var pow = Math.pow(10, 2);
    return Math.round(num * pow) / pow;
  }

  fnVaciarInputMeses() {
    this.ccPresMesForm.controls.txtEnero.setValue(0);
    this.ccPresMesForm.controls.txtFebrero.setValue(0);
    this.ccPresMesForm.controls.txtMarzo.setValue(0);
    this.ccPresMesForm.controls.txtAbril.setValue(0);
    this.ccPresMesForm.controls.txtMayo.setValue(0);
    this.ccPresMesForm.controls.txtJunio.setValue(0);
    this.ccPresMesForm.controls.txtJulio.setValue(0);
    this.ccPresMesForm.controls.txtAgosto.setValue(0);
    this.ccPresMesForm.controls.txtSeptiembre.setValue(0);
    this.ccPresMesForm.controls.txtOctubre.setValue(0);
    this.ccPresMesForm.controls.txtNoviembre.setValue(0);
    this.ccPresMesForm.controls.txtDiciembre.setValue(0);
  }

  fnVaciarMeses() {
    this.lDetalleCC_PresSMes.forEach(item => {
      item.nIdDetCCSMes = 0;
      item.nImporte = 0;
    })
  }
}
