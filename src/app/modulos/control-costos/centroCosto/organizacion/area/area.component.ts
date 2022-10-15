import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { CentroCostoService } from '../../centroCosto.service';
import { Area } from '../../Models/centroCostos/ICentroCosto';

// Importante para las validaciones
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css'],
  animations: [asistenciapAnimations]
})
export class AreaComponent implements OnInit {
  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nueva aréa' },
  ];
  abLista = [];

  dataSource: MatTableDataSource<Area>;
  displayedColumns = ['nIdArea', 'sCodigoArea', 'sDescripcion', 'sEstado'];
  // Asigancion para Paginar y ordedar las columnas de mi tabla 
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('modalArea') modalArea: ElementRef;

  formArea: FormGroup;
  lArea: Area[];
  txtFiltro = new FormControl();
  vAreaSeleccionada: Area;

  lEstados = [
    { nEstado: 1, sEstado: 'Activo' },
    { nEstado: 0, sEstado: 'Inactivo' },
  ]
  cboEstado = new FormControl();
  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar
  title = '';

  matcher = new MyErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vCentroCostoService: CentroCostoService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }


  ngOnInit(): void {
    this.onToggleFab(1, -1)

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formArea = this.formBuilder.group({
      txtCodigo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2), Validators.pattern('^[A-Za-z0-9]+$')]],
      txtDescripcion: ['', [Validators.required, , Validators.minLength(1), Validators.maxLength(50)]]
    })

    this.fnListarAreas();
  }

  fnListarAreas = function () {
    this.spinner.show();

    var pEntidad = 2; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vFiltro = " "

    pParametro.push(this.pPais);
    pParametro.push(vFiltro);

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lArea = res;
        const areas = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(areas);
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

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

  fnAnadirArea = function () {
    if (this.formArea.invalid) {
      Swal.fire('¡Verificar!', 'Existen datos obligatorios para guardar el área', 'warning')
      return;
    }

    this.spinner.show();

    var vDatosArea = this.formArea.value;

    var pEntidad1 = 2; //Cabecera de la area
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 2;       //Listar todos los registros de la tabla

    pParametro1.push(vDatosArea.txtCodigo);
    pParametro1.push(this.pPais);
    this.vCentroCostoService.fnCentroCosto(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).subscribe(
      res => {
        if (res.cod != "0") {
          this.spinner.hide();
          Swal.fire('¡Verificar!', 'El codigo de area indicado: ' + res.cod + ', ya se encuentra registrada, indique otro número.', 'warning');
          this.formArea.controls.txtCodigo.setValue("");
        }
        if (res.cod == "0") {
          var pEntidad = 2; //Cabecera de la area
          var pOpcion = 1;  //CRUD -> Insertar
          var pParametro = []; //Parametros de campos vacios
          var pTipo = 0;       //Listar todos los registros de la tabla

          var vDatosArea = this.formArea.value;
          pParametro.push(vDatosArea.txtCodigo);
          pParametro.push(vDatosArea.txtDescripcion);
          pParametro.push(this.pPais);

          this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
            res => {
              if (res == 0) {
                this.spinner.hide();
                Swal.fire(
                  'Error', //Titulo
                  'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
                  'error' //Tipo de mensaje
                ).then((result) => {
                });
              } else {
                //Registrado
                this.spinner.hide();
                Swal.fire({
                  icon: 'success',
                  title: 'Correcto',
                  text: 'Se guardo el area asignada.',
                  showConfirmButton: false,
                  timer: 1500
                });
                this.formArea.controls.txtCodigo.setValue("");
                this.formArea.controls.txtDescripcion.setValue("");
                this.fnListarAreas();
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
      },
      err => {
        console.log(err);
      }
    )

  }

  fnModificarArea() {
    this.formArea.get('txtDescripcion').enable();
    this.cboEstado.enable();
    this.pTipo = 2;
  }

  fnGuardarArea = function () {
    if (this.formArea.invalid) {
      Swal.fire('¡Verificar!', 'Existen datos obligatorios para guardar el area', 'warning')
      return;
    }

    var pEntidad = 2; //Cabecera de area
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    var vDatosArea = this.formArea.value;
    this.spinner.show();
    pParametro.push(this.vAreaSeleccionada.nIdArea);
    pParametro.push(vDatosArea.txtDescripcion.trim());
    pParametro.push(this.cboEstado.value);

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          this.spinner.hide();
          Swal.fire({
            icon: 'success',
            title: 'Correcto',
            text: 'Se actualizo de manera correcta el registro.',
            showConfirmButton: false,
            timer: 1500
          });
          this.vAreaSeleccionada.sDescripcion = vDatosArea.txtDescripcion.trim();
          this.formArea.get('txtCodigo').disable();
          this.formArea.get('txtDescripcion').disable();
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarAreas();
        } else {
          this.spinner.hide();
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar la actualizacion: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          )
        }
      },
      err => {
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );

  }

  fnSeleccionarArea(row: Area) {
    this.vAreaSeleccionada = row;
    this.formArea.controls.txtCodigo.setValue(this.vAreaSeleccionada.sCodigoArea)
    this.formArea.controls.txtDescripcion.setValue(this.vAreaSeleccionada.sDescripcion)

    this.formArea.get('txtCodigo').disable();
    this.formArea.get('txtDescripcion').disable();
    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalArea.nativeElement.click();
    this.title = 'Modificar Área'
    this.cboEstado.setValue(this.vAreaSeleccionada.bEstado);
    this.cboEstado.disable();
  }

  fnAbrirModal() {
    this.modalArea.nativeElement.click();
    this.title = 'Añadir Área'
    this.formArea.get('txtCodigo').enable();
    this.formArea.get('txtDescripcion').enable();
    this.pOpcion = 1;
    this.cboEstado.disable();
  }

  fnConvertirMay() {
    var vDatosArea = this.formArea.value;
    var vCodigo: string = vDatosArea.txtCodigo;
    if (vCodigo != null) {
      vCodigo = vCodigo.trim().toUpperCase();
      this.formArea.controls.txtCodigo.setValue(vCodigo);
    }
  }

  fnLimpiarModal() {
    this.formArea.controls.txtCodigo.setValue('');
    this.formArea.controls.txtDescripcion.setValue('');
  }

  fnEvitarEspacios() {
    var vDatosCC = this.formArea.value;
    var descripcion = vDatosCC.txtDescripcion;
    var codigo = vDatosCC.txtCodigo;

    this.formArea.controls.txtCodigo.setValue(codigo.trim())
    this.formArea.controls.txtDescripcion.setValue(descripcion.trimLeft())
  }

  //Botones Flotantes 
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnAbrirModal()
        break
      default:
        break
    }
  }
}
