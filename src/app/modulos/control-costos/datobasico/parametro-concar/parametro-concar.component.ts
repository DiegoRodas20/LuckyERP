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
import { DatoBasicoService } from '../datobasico.service';

export interface ParametroConcar {
  nId: number;
  nIdPais: number;
  nIdEmp: number;
  sCodigo: string;
  sPeriodo: string;
  sTitulo: string;
  sCodigoCuenta: string;
  nEstado: number;
  sEstado: string;
  nPadre: number;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-parametro-concar',
  templateUrl: './parametro-concar.component.html',
  styleUrls: ['./parametro-concar.component.css'],
  animations: [asistenciapAnimations]
})
export class ParametroConcarComponent implements OnInit {


  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nuevo parametro concar' },
  ];
  abLista = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  vParametroConcarSeleccionado: ParametroConcar;
  lParametroConcar: ParametroConcar[];
  txtFiltro = new FormControl();
  formParametroConcar: FormGroup;
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<ParametroConcar>;
  displayedColumns = ['nId', 'sCodigo', 'sTitulo', 'sCodigoCuenta', 'sEstado'];
  @ViewChild('modalTS') modalTS: ElementRef;

  cboEstado = new FormControl();
  title: string;

  //Se genera despues de escoger el maximo codigo y se le aumenta 1
  nCodigo: number = 0;
  sCodigo: string = "";

  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar

  lEstados = [
    { nEstado: 1, sEstado: 'Activo' },
    { nEstado: 0, sEstado: 'Inactivo' },
  ]

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vDatoBasicoService: DatoBasicoService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  ngOnInit(): void {
    this.onToggleFab(1, -1);

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formParametroConcar = this.formBuilder.group({
      txtCodigo: [''],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50)]],
      txtCodigoConcar: ['', [Validators.required, Validators.maxLength(10), Validators.pattern("^[0-9]*$"),]],
      sPeriodo: ['']
    })
    this.fnListarParametroConcarS(1);
  }
  //LISTAR PARAMETRO CONCAR
  fnListarParametroConcarS = function (opcion: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);

    this.vDatoBasicoService.fnParametroConcar(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lConcar = res;
        this.nCodigo = 0;
        this.sCodigo = "";
        this.lConcar.forEach(item => {
          if (parseInt(item.sCodigo) > this.nCodigo) { this.nCodigo = parseInt(item.sCodigo) }
        })
        this.nCodigo++;
        if (opcion == 1) {
          this.sCodigo = this.nCodigo.toString();
          if (this.sCodigo.length == 1) { this.sCodigo = '0' + this.sCodigo }
          this.formParametroConcar.controls.txtCodigo.setValue(this.sCodigo);
        }
        const ConcaR = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(ConcaR);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        //console.log(ConcaR);
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  //AÑADIR PARAMETRO CONCAR
  fnAnadirParametroConcar = function () {
    if (this.formParametroConcar.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los campos ingresados', 'warning')
      return;
    }

    var vDatosTS = this.formParametroConcar.value;
    var descripcion: string = vDatosTS.txtDescripcion;
    var fecha = new Date();
    var ano = fecha.getFullYear();

    var periodo: string = ano.toString();
    var codigoConcar = vDatosTS.txtCodigoConcar;
    var codigoConcarRepetido: ParametroConcar;


    //Verificar que el codigo de concar no se repita
    for (var tipo of this.lConcar) {
      if (tipo.sCodigo == codigoConcar) {
        codigoConcarRepetido = tipo;
      }
    }

    if (codigoConcarRepetido != null) {
      Swal.fire('¡Verificar!', 'El codigo del Parametro Concar indicado ya existe: ' + codigoConcarRepetido.sCodigo, 'warning')
      return;
    }
    //==============================

    //Verificando si la descripcion ya existe
    if (this.lConcar.findIndex(item => item.sTitulo.trim().toUpperCase() == descripcion.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'La descripcion del Parametro Concar indicado ya existe.', 'warning')
      return;
    }

    //Verificando si el periodo ya existe.
    if (this.lConcar.findIndex(item => item.sPeriodo.trim().toUpperCase() == periodo.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'No puedes crear más de 1 Parametro Concar el mismo año.', 'warning')
      return;
    }
    //==============================

    var pEntidad = 1; //Cabecera de la ParametroConcar
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla
    pParametro.push(this.idEmp);
    pParametro.push(vDatosTS.txtCodigoConcar);
    pParametro.push(vDatosTS.txtDescripcion);
    pParametro.push(this.pPais);


    this.vDatoBasicoService.fnParametroConcar(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 0) {
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          ).then((result) => {
          });
        } else {
          //Registrado
          Swal.fire({
            icon: 'success',
            title: 'Correcto',
            text: 'Se guardo el parametro concar asignado.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se guardo el parametro concar asignado.', 'success');
          this.formParametroConcar.controls.txtDescripcion.setValue("");
          this.formParametroConcar.controls.txtCodigoConcar.setValue("");
          this.fnListarParametroConcarS(1);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        //this.spinner.hide();
      }
    );

  }

  //ACTUALIZAR PARAMETRO CONCAR
  fnGuardarConcaR = function () {

    if (this.formParametroConcar.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los campos ingresados', 'warning')
      return;
    }

    var vDatosTS = this.formParametroConcar.value;
    var anioConcareSleccionado = vDatosTS.sPeriodo;
    var descripcion: string = vDatosTS.txtDescripcion;
    var codigoConcar = vDatosTS.txtCodigoConcar;
    var codigoConcarRepetido: ParametroConcar;
    var tituloConcarRepetido: ParametroConcar;

    //Verificar que el codigo de concar no se repita
    for (var tipo of this.lConcar) {
      if (tipo.sCodigo == codigoConcar && anioConcareSleccionado != tipo.sPeriodo) {
        codigoConcarRepetido = tipo;
      }
    }

    if (codigoConcarRepetido != null) {
      Swal.fire('¡Verificar!', 'El codigo del Parametro Concar indicado ya existe: ' + codigoConcarRepetido.sCodigo, 'warning')
      return;
    }

    //==============================

    //Verificar que el titulo no se repita
    for (var tipo of this.lConcar) {
      if (tipo.sTitulo == descripcion && anioConcareSleccionado != tipo.sPeriodo) {
        tituloConcarRepetido = tipo;
      }
    }

    if (tituloConcarRepetido != null) {
      Swal.fire('¡Verificar!', 'La descripcion del Parametro Concar indicado ya existe: ' + tituloConcarRepetido.sTitulo, 'warning')
      return;
    }




    //==============================

    var pEntidad = 1; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    var vDatosTS = this.formParametroConcar.value;

    pParametro.push(this.vParametroConcarSeleccionado.nId);
    pParametro.push(vDatosTS.txtDescripcion);
    pParametro.push(vDatosTS.txtCodigoConcar);
    pParametro.push(this.cboEstado.value);


    this.vDatoBasicoService.fnParametroConcar(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          Swal.fire({
            icon: 'success',
            title: 'Correcto',
            text: 'Se actualizo de manera correcta el registro.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se actualizo de manera correcta el registro', 'success')
          this.vParametroConcarSeleccionado.nEstado = this.cboEstado.value;
          this.formParametroConcar.get('txtDescripcion').disable();
          this.formParametroConcar.get('txtCodigoConcar').disable();
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarParametroConcarS(1);
        } else {
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar la actualizacion: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          )

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
  //SELECCIONAR PARAMETRO CONCAR
  fnSeleccionarConcar(row: ParametroConcar) {
    //console.log(row);
    this.vParametroConcarSeleccionado = row;
    this.formParametroConcar.controls.txtCodigoConcar.setValue(this.vParametroConcarSeleccionado.sCodigo)
    this.formParametroConcar.controls.txtDescripcion.setValue(this.vParametroConcarSeleccionado.sTitulo)
    this.formParametroConcar.controls.sPeriodo.setValue(this.vParametroConcarSeleccionado.sPeriodo)
    //console.log(this.vParametroConcarSeleccionado.nEstado);
    this.cboEstado.setValue(this.vParametroConcarSeleccionado.nEstado);

    this.formParametroConcar.get('txtDescripcion').disable();
    this.formParametroConcar.get('txtCodigoConcar').disable();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalTS.nativeElement.click();
    this.title = 'Modificar Parametro Concar';

    this.cboEstado.disable();
  }


  //FILTRAR EN LA TABLA
  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }
  //MODIFICAR PARAMETRO CONCAR
  fnModificarConcaR() {
    this.pTipo = 2;
    this.formParametroConcar.get('txtDescripcion').enable();
    this.formParametroConcar.get('txtCodigoConcar').enable();

    this.cboEstado.enable();
  }
  //LIMPIAR MODAL
  fnLimpiarModal() {
    this.formParametroConcar.controls.txtDescripcion.setValue('');
    this.formParametroConcar.controls.txtCodigo.setValue('');
    this.formParametroConcar.controls.txtCodigoConcar.setValue('');
  }
  //ABRIR MODAL PARAMETRO CONCAR
  fnAbrirModal() {
    this.modalTS.nativeElement.click();
    this.pOpcion = 1;
    this.formParametroConcar.get('txtDescripcion').enable();
    this.formParametroConcar.controls.txtCodigoConcar.enable();
    this.formParametroConcar.controls.txtCodigo.setValue(this.sCodigo);
    this.title = 'Añadir Parametros Concar'
    this.cboEstado.disable();
  }
  //EVITAR ESPACIOS PARAMETRO CONCAR
  fnEvitarEspacios() {
    var vDatosCC = this.formParametroConcar.value;
    var descripcion = vDatosCC.txtDescripcion;

    this.formParametroConcar.controls.txtDescripcion.setValue(descripcion.trimLeft())
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
