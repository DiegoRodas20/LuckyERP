import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ListasLogistica, OperacionLogistica, Tipo_Operaciones } from '../models/operacion-log.model';
import { ParametroLogisticaService } from '../parametro-logistica.service';


@Component({
  selector: 'app-operacion-logistica',
  templateUrl: './operacion-logistica.component.html',
  styleUrls: ['./operacion-logistica.component.css'],
  animations: [asistenciapAnimations]
})

export class OperacionLogisticaComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista oculta
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'note_add', tool: 'Nueva operación' }
  ];
  abLista = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  lOperacion: OperacionLogistica[] = [];
  vOperacionSeleccionada: OperacionLogistica;

  lEstado: ListasLogistica[] = [];
  lTipoOp: Tipo_Operaciones[] = [];
  vTipoOpSeleccionada: Tipo_Operaciones;
  lOperacionAuto: ListasLogistica[] = [];

  cboOperacionAuto = new FormControl();
  cboOperacionAutoAct = new FormControl();

  txtFiltro = new FormControl();

  //Form para registrar
  formOperacion: FormGroup;

  //Form para actualizar
  formOperacionActualizar: FormGroup;
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<OperacionLogistica>;
  displayedColumns = ['nId', 'sDescripcion', 'sTipoOp', 'sOperacionAuto', 'sAfectaUb', 'sEstado'];
  @ViewChild('modalOperacion') modalOperacion: ElementRef;

  title: string;

  //Se genera despues de escoger el maximo codigo y se le aumenta 1
  nCodigo: number = 0;
  sCodigo: string = "";
  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar

  pMostrar: number;

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vParLogisticaService: ParametroLogisticaService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; this.pMostrar = 0; }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formOperacion = this.formBuilder.group({
      txtCodigo: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10), this.caracterValidator]],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50), this.caracterValidator]],
      stAfectaUbicacion: [false],
      cboTipoOperacion: ['', Validators.required]
    })


    this.formOperacionActualizar = this.formBuilder.group({
      txtCodigo: [''],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50), this.caracterValidator]],
      stAfectaUbicacion: [false],
      cboTipoOperacion: ['', Validators.required],
      cboEstado: ['', Validators.required]
    })


    this.fnListarOperacion();
    this.onToggleFab(1, -1)

  }

  fnListarOperacion() {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    this.vParLogisticaService.fnOperacionLogistica(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lOperacion = res;

        const operacion = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(operacion);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.fnFiltrar();
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnListarTipoOp() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    try {
      this.lTipoOp = await this.vParLogisticaService.fnOperacionLogistica(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      this.spinner.hide();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
    }
  }

  fnListarEstado() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;       //Listar todos los registros de la tabla

    this.vParLogisticaService.fnOperacionLogistica(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lEstado = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnAnadirOperacion() {
    if (this.formOperacion.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    if (this.vTipoOpSeleccionada.nEsUnicaOp == 1) {
      Swal.fire('¡Verificar!', 'No se pueden agregar más operaciones del tipo operación seleccionado', 'warning')
      return;
    }

    this.spinner.show();

    var pEntidad1 = 2;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla

    try {
      this.lOperacion = await this.vParLogisticaService.fnOperacionLogistica(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }

    var vDatosCC = this.formOperacion.value;
    var codigo: string = vDatosCC.txtCodigo;
    var descripcion: string = vDatosCC.txtDescripcion;

    var vOperacionAuto = '';
    //Verificando si el codigo ya existe
    if (this.lOperacion.findIndex(item => item.sCodigo.trim().toUpperCase() == codigo.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'El código indicado ya existe', 'warning')
      this.formOperacion.controls.txtCodigo.setValue('');
      this.spinner.hide();
      return;
    }

    //Verificando si la descripcion ya existe
    if (this.lOperacion.findIndex(item => item.sDescripcion.toUpperCase() == descripcion.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'La descripción indicada ya existe', 'warning')
      this.formOperacion.controls.txtDescripcion.setValue('');
      this.spinner.hide();
      return;
    }

    //Verificando que si es de traslado por salida, tenga traslado por ingreso
    if (this.vTipoOpSeleccionada.nReqIngreso == 1) {
      if (this.cboOperacionAuto.value == '' || this.cboOperacionAuto.value == null) {
        Swal.fire('¡Verificar!', 'Seleccionar una operación automática.', 'warning')
        this.spinner.hide();
        return;
      } else {
        vOperacionAuto = this.cboOperacionAuto.value
      }
    }

    var pEntidad = 2; //Cabecera de operacion.
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(vDatosCC.txtCodigo);
    pParametro.push(vDatosCC.txtDescripcion.trim());
    pParametro.push(vDatosCC.cboTipoOperacion);
    pParametro.push(vDatosCC.stAfectaUbicacion == false ? 0 : 1);
    pParametro.push(vOperacionAuto);

    this.vParLogisticaService.fnOperacionLogistica(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
            position: 'center',
            icon: 'success',
            title: 'Correcto',
            text: 'Se guardo la operación asignada.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se guardo la operación asignada.', 'success');
          this.formOperacion.controls.txtDescripcion.setValue("");
          this.formOperacion.controls.txtCodigo.setValue("");
          this.formOperacion.controls.cboTipoOperacion.setValue("");
          this.formOperacion.controls.stAfectaUbicacion.setValue(false);
          this.cboOperacionAuto.setValue('');

          this.fnListarOperacion();
        }
        this.spinner.hide();
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnGuardarOperacion() {
    if (this.formOperacionActualizar.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    if (this.vTipoOpSeleccionada.nEsUnicaOp == 1) {
      Swal.fire('¡Verificar!', 'No se pueden modificar las operaciones del tipo operación seleccionado', 'warning')
      return;
    }

    this.spinner.show();
    var vDatosCC = this.formOperacionActualizar.value;

    var pParametro1 = [];
    pParametro1.push(this.vOperacionSeleccionada.nId);

    if (this.vOperacionSeleccionada.nIdTipoOp != vDatosCC.cboTipoOperacion) {
      try {
        const validacion = await this.vParLogisticaService.fnOperacionLogistica(1, 2, pParametro1, 4, this.url).toPromise();
        if (validacion == 1) {
          Swal.fire('¡Verificar!', 'La operación logistica ya tiene registros asignados, el tipo de operación no se puede cambiar', 'warning')
          this.spinner.hide();
          return;
        }
      } catch (err) {
        console.log(err);
        this.spinner.hide();
        return;
      }
    }

    var vOperacionAuto = '';

    if (this.vTipoOpSeleccionada.nReqIngreso == 1) {
      if (this.cboOperacionAutoAct.value == '' || this.cboOperacionAutoAct.value == null) {
        Swal.fire('¡Verificar!', 'Seleccionar una operación automática.', 'warning')
        this.spinner.hide();
        return;
      } else {
        vOperacionAuto = this.cboOperacionAutoAct.value
      }
    }



    var pEntidad = 2; //Cabecera de operacion
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vOperacionSeleccionada.nId);
    pParametro.push(vOperacionAuto);
    pParametro.push(vDatosCC.cboTipoOperacion);
    pParametro.push(vDatosCC.stAfectaUbicacion == false ? 0 : 1);
    pParametro.push(vDatosCC.cboEstado);
    pParametro.push(vDatosCC.txtDescripcion.trim());

    this.vParLogisticaService.fnOperacionLogistica(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Correcto',
            text: 'Se actualizo de manera correcta el registro.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se actualizo de manera correcta el registro', 'success')
          this.vOperacionSeleccionada.nIdEstado = this.formOperacionActualizar.controls.cboEstado.value;
          this.formOperacionActualizar.controls.stAfectaUbicacion.disable();
          this.formOperacionActualizar.controls.cboTipoOperacion.disable();
          this.formOperacionActualizar.controls.cboEstado.disable();
          this.cboOperacionAutoAct.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarOperacion();
        } else {
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar la actualizacion: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          )
        }
        this.spinner.hide();
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnModificarOperacion() {

    this.pTipo = 2;

    this.formOperacionActualizar.controls.stAfectaUbicacion.enable();
    this.formOperacionActualizar.controls.cboTipoOperacion.enable();
    this.formOperacionActualizar.controls.cboEstado.enable();
    this.cboOperacionAutoAct.enable();
  }

  fnAbrirModal() {
    this.modalOperacion.nativeElement.click();
    this.pOpcion = 1;
    this.formOperacion.get('txtDescripcion').enable();
    this.fnListarTipoOp();
    this.lOperacionAuto = this.lOperacion.filter(item => (item.nIdEstado == 589 && item.nIdTipoOp == 2190)).map(item => {
      return { nId: item.nId, sDescripcion: item.sCodigo + ' - ' + item.sDescripcion }
    });

    this.title = 'Añadir Operación logistíca'
  }

  async fnSeleccionarOperacion(row: OperacionLogistica) {
    this.vOperacionSeleccionada = row;
    await this.fnListarTipoOp();
    this.fnListarEstado();


    if (row.nIdTipoOp == 2333) { //Caso especial cuando es una salida por traslado de anulacion
      this.lOperacionAuto = this.lOperacion.filter(item => ((item.nId != row.nId) && item.nIdEstado == 589 && (item.nId == row.nIdOperacionAuto || item.nIdTipoOp == 2332)))
        .map(item => {
          return { nId: item.nId, sDescripcion: item.sCodigo + ' - ' + item.sDescripcion }
        });
    } else {
      this.lOperacionAuto = this.lOperacion.filter(item => ((item.nId != row.nId) && item.nIdEstado == 589 && (item.nId == row.nIdOperacionAuto || item.nIdTipoOp == 2190)))
        .map(item => {
          return { nId: item.nId, sDescripcion: item.sCodigo + ' - ' + item.sDescripcion }
        });
    }


    this.fnSeleccionarTipoOperacion(row.nIdTipoOp)

    this.formOperacionActualizar.controls.txtCodigo.setValue(this.vOperacionSeleccionada.sCodigo)
    this.formOperacionActualizar.controls.txtDescripcion.setValue(this.vOperacionSeleccionada.sDescripcion)

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalOperacion.nativeElement.click();
    this.title = 'Modificar Operación logistíca';
    this.formOperacionActualizar.controls.cboEstado.setValue(this.vOperacionSeleccionada.nIdEstado);
    this.formOperacionActualizar.controls.stAfectaUbicacion.setValue(this.vOperacionSeleccionada.nAfectaUb == 0 ? false : true);
    this.formOperacionActualizar.controls.cboTipoOperacion.setValue(this.vOperacionSeleccionada.nIdTipoOp);
    this.cboOperacionAutoAct.setValue(row.nIdOperacionAuto);

    this.formOperacionActualizar.controls.stAfectaUbicacion.disable();
    this.formOperacionActualizar.controls.cboTipoOperacion.disable();
    this.formOperacionActualizar.controls.cboEstado.disable();
    this.cboOperacionAutoAct.disable();

  }

  fnLimpiarModal() {

    this.lOperacionAuto = [];
    this.lEstado = [];
    this.lTipoOp = [];

    this.formOperacion.controls.txtCodigo.setValue('');
    this.formOperacion.controls.txtDescripcion.setValue('');
    this.formOperacion.controls.cboTipoOperacion.setValue('');
    this.formOperacion.controls.stAfectaUbicacion.setValue(false);
    this.cboOperacionAuto.setValue('');
    this.vTipoOpSeleccionada = null;
    this.fnListarOperacion();
  }

  fnEvitarEspacios() {
    var vDatos = this.formOperacion.value;
    var descripcion = vDatos.txtDescripcion;
    var codigo = vDatos.txtCodigo;

    if (descripcion != null) {
      this.formOperacion.controls.txtDescripcion.setValue(descripcion.trimLeft())
    }
    if (codigo != null) {
      this.formOperacion.controls.txtCodigo.setValue(codigo.trim().toUpperCase())
    }
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

  fnSeleccionarTipoOperacion(nIdTipoOp: number) {
    this.vTipoOpSeleccionada = this.lTipoOp.find(item => item.nId == nIdTipoOp);
    if (this.vTipoOpSeleccionada?.nId == 2333) { //Operacion especial--Salida por NU anulada
      this.lOperacionAuto = this.lOperacion.filter(item => (item.nIdTipoOp == 2332)).map(item => {
        return { nId: item.nId, sDescripcion: item.sCodigo + ' - ' + item.sDescripcion }
      });
    } else {
      this.lOperacionAuto = this.lOperacion.filter(item => (item.nIdEstado == 589 && item.nIdTipoOp == 2190)).map(item => {
        return { nId: item.nId, sDescripcion: item.sCodigo + ' - ' + item.sDescripcion }
      });
    }
  }

  //#region Funcion de validacion
  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { caracterValidator: 'El texto no debe contener: "/", "|", "?"' } : null;
  }
  //#endregion

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
