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
import { Almacen_Usuario_Permiso, Lista_Alm_Usr_Permiso, Direccion_Alm_Usr_Permiso } from '../models/almacen-usuario-permiso.model';
import { ParametroLogisticaService } from '../parametro-logistica.service';

@Component({
  selector: 'app-log-satelite-usuario',
  templateUrl: './log-satelite-usuario.component.html',
  styleUrls: ['./log-satelite-usuario.component.css'],
  animations: [asistenciapAnimations]
})

export class LogSateliteUsuarioComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista oculta
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'note_add', tool: 'Nuevo almacén permiso' }
  ];
  abLista = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  //Forms
  formUsuarioPermiso: FormGroup;
  formUsuarioPermisoAct: FormGroup;


  lUsarioPermiso: Almacen_Usuario_Permiso[] = [];
  lAlmacen: Direccion_Alm_Usr_Permiso[] = [];
  lUsuario: Lista_Alm_Usr_Permiso[] = [];
  lCliente: Lista_Alm_Usr_Permiso[] = [];

  vUsuarioPermisoSeleccionado: Almacen_Usuario_Permiso;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Almacen_Usuario_Permiso>;
  displayedColumns = ['opcion', 'sAlmacen', 'sUbicacion', 'sDireccion', 'sUsuario', 'sOperBaja', 'sEstado'];

  @ViewChild('modalAlmacenUsr') modalAlmacenUsr: ElementRef;
  title = '';

  txtFiltro = new FormControl();
  rbEstado = new FormControl();
  cboCliente = new FormControl();
  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar

  lEstado = [
    { nId: 1, sDescripcion: 'Activo' },
    { nId: 0, sDescripcion: 'Inactivo' },
  ]

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vParLogisticaService: ParametroLogisticaService,
    private cdr: ChangeDetectorRef,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formUsuarioPermiso = this.formBuilder.group({
      cboUsuario: ['', Validators.required],
      cboAlmacen: ['', Validators.required],
      txtDireccion: [''],
      txtUbicacion: [''],
      stOperBaja: [false],
    })


    this.formUsuarioPermisoAct = this.formBuilder.group({
      txtUsuario: [''],
      txtAlmacen: [''],
      txtDireccion: [''],
      txtUbicacion: [''],
      cboEstado: ['', Validators.required],
      stOperBaja: [false],
    })

    this.rbEstado.setValue(1);
    await this.fnListarCliente();

    if (this.lCliente.length > 0) {
      this.cboCliente.setValue(this.lCliente[0].nId);
      await this.fnListarAlmacenUsuario(1, this.lCliente[0].nId);
    }

    this.onToggleFab(1, -1)
  }


  //#region  Listados
  async fnListarAlmacenUsuario(nEstado: number, nIdCliente: number) {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);
    pParametro.push(this.pPais);
    pParametro.push(nEstado);
    pParametro.push(nIdCliente);

    try {
      const lUsuarioPer = await this.vParLogisticaService.fnAlmacenUsuarioPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      this.spinner.hide();
      this.lUsarioPermiso = lUsuarioPer
      this.dataSource = new MatTableDataSource(this.lUsarioPermiso);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrar();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }
  }

  async fnListarAlmacen(nIdCliente: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);
    pParametro.push(nIdCliente);

    try {
      const almacenes = await this.vParLogisticaService.fnAlmacenUsuarioPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      this.spinner.hide();
      this.lAlmacen = almacenes

    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }
  }

  async fnListarUsuario() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);

    try {
      const usuarios = await this.vParLogisticaService.fnAlmacenUsuarioPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      this.spinner.hide();
      this.lUsuario = usuarios

    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }
  }

  async fnListarCliente() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(this.pPais);

    try {
      const client = await this.vParLogisticaService.fnAlmacenUsuarioPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      this.spinner.hide();
      this.lCliente = client

    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }
  }

  //#endregion

  //#region Guardados BD
  async fnAnadirAlmUsr() {
    if (this.formUsuarioPermiso.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var vDatosCC = this.formUsuarioPermiso.value;
    var usuario: number = vDatosCC.cboUsuario;
    var almacen: number = vDatosCC.cboAlmacen;

    //Validando
    let validar: Lista_Alm_Usr_Permiso;
    try {
      validar = await this.fnValidarExistenteAnadir(almacen, usuario)
    } catch (error) {
      console.log(error);
      this.spinner.hide();
      return;
    }

    //Verificando si el registro ya existe
    if (validar.nId != 0) {
      Swal.fire('¡Verificar!', `${validar.sDescripcion}`, 'warning')
      //this.formUsuarioPermiso.controls.cboUsuario.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad = 2; //Cabecera de  usuario-almacen.
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(vDatosCC.cboAlmacen);
    pParametro.push(vDatosCC.cboUsuario);
    pParametro.push(vDatosCC.stOperBaja == false ? 0 : 1);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);

    try {
      const res = await this.vParLogisticaService.fnAlmacenUsuarioPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      if (res == 0) {
        Swal.fire(
          'Error', //Titulo
          'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
          'error' //Tipo de mensaje
        )
      } else {
        //Registrado
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Correcto',
          text: 'Se guardo el almacén - usuario.',
          showConfirmButton: false,
          timer: 1500
        });
        //Swal.fire('Correcto', 'Se guardo el almacén - usuario.', 'success');
        this.formUsuarioPermiso.controls.cboUsuario.setValue('');
        this.formUsuarioPermiso.controls.cboAlmacen.setValue('');
        this.formUsuarioPermiso.controls.txtDireccion.setValue('');
        this.formUsuarioPermiso.controls.txtUbicacion.setValue('');
        this.formUsuarioPermiso.controls.stOperBaja.setValue(false);

        this.fnListarAlmacenUsuario(this.rbEstado.value, this.cboCliente.value ?? 0);
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnGuardarAlmUsr() {
    if (this.formUsuarioPermisoAct.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var vDatosCC = this.formUsuarioPermisoAct.value;

    //Validando
    // let validar: Lista_Alm_Usr_Permiso;
    // try {
    //   validar = await this.fnValidarExistenteModificar(
    //     this.vUsuarioPermisoSeleccionado.nIdDireccion,
    //     this.vUsuarioPermisoSeleccionado.nIdUsuario,
    //     this.vUsuarioPermisoSeleccionado.nIdAlmacenUsuario
    //   )
    // } catch (error) {
    //   console.log(error);
    //   this.spinner.hide();
    //   return;
    // }

    // //Verificando si el usuario tiene un registro activo
    // if (validar.nId != 0 && vDatosCC.cboEstado == 1) {
    //   Swal.fire('¡Verificar!', `${validar.sDescripcion}`, 'warning')
    //   //this.formUsuarioPermiso.controls.cboUsuario.setValue('');
    //   this.spinner.hide();
    //   return;
    // }

    var pEntidad = 2; //Cabecera de  usuario-almacen.
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vUsuarioPermisoSeleccionado.nIdAlmacenUsuario);
    pParametro.push(vDatosCC.stOperBaja == false ? 0 : 1);
    pParametro.push(vDatosCC.cboEstado);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);

    try {
      const res = await this.vParLogisticaService.fnAlmacenUsuarioPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      if (res == 0) {
        Swal.fire(
          'Error', //Titulo
          'No se pudo realizar la actualización: Verifique su conexion a Internet', //Mensaje html
          'error' //Tipo de mensaje
        )
      } else {
        //Actualizado
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Correcto',
          text: 'Se realizo la actualización.',
          showConfirmButton: false,
          timer: 1500
        });
        this.formUsuarioPermisoAct.get('cboEstado').disable();
        this.formUsuarioPermisoAct.get('stOperBaja').disable();
        this.pOpcion = 2;
        this.pTipo = 1;

        this.fnListarAlmacenUsuario(this.rbEstado.value, this.cboCliente.value ?? 0);
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  //#endregion

  //#region funciones del modal
  fnLimpiarModal() {
    this.lAlmacen = [];
    this.lUsuario = [];

    this.formUsuarioPermiso.controls.cboUsuario.setValue('');
    this.formUsuarioPermiso.controls.cboAlmacen.setValue('');
    this.formUsuarioPermiso.controls.txtDireccion.setValue('');
    this.formUsuarioPermiso.controls.txtUbicacion.setValue('');
    this.formUsuarioPermiso.controls.stOperBaja.setValue(false);

    this.formUsuarioPermisoAct.controls.txtUsuario.setValue('');
    this.formUsuarioPermisoAct.controls.txtAlmacen.setValue('');
    this.formUsuarioPermisoAct.controls.txtDireccion.setValue('');
    this.formUsuarioPermisoAct.controls.txtUbicacion.setValue('');
    this.formUsuarioPermisoAct.controls.cboEstado.setValue('');
    this.formUsuarioPermisoAct.controls.stOperBaja.setValue(false);

    this.fnListarAlmacenUsuario(this.rbEstado.value, this.cboCliente.value ?? 0);
  }

  fnAbrirModal() {
    if (this.cboCliente.value == '' || this.cboCliente.value == null) {
      Swal.fire('¡Verificar!', `Seleccione un cliente para continuar.`, 'warning')
      return;
    }
    let cliente = this.lCliente.find(item => item.nId == this.cboCliente.value);
    this.modalAlmacenUsr.nativeElement.click();
    this.pOpcion = 1;
    this.fnListarAlmacen(this.cboCliente.value ?? 0);
    this.fnListarUsuario();
    this.title = 'Añadir Almacén - Usuario - ' + cliente.sDescripcion
  }

  fnSeleccionarRegistro(row: Almacen_Usuario_Permiso) {
    this.vUsuarioPermisoSeleccionado = row;

    this.formUsuarioPermisoAct.controls.txtUsuario.setValue(row.sUsuario);
    this.formUsuarioPermisoAct.controls.txtAlmacen.setValue(row.sAlmacen);
    this.formUsuarioPermisoAct.controls.txtDireccion.setValue(row.sDireccion);
    this.formUsuarioPermisoAct.controls.txtUbicacion.setValue(row.sUbicacion);
    this.formUsuarioPermisoAct.controls.cboEstado.setValue(row.nEstado);
    this.formUsuarioPermisoAct.controls.stOperBaja.setValue(row.nOperBaja == 0 ? false : true);

    let cliente = this.lCliente.find(item => item.nId == this.cboCliente.value);

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalAlmacenUsr.nativeElement.click();
    this.title = 'Modificar Almacén - Usuario - ' + cliente.sDescripcion;
    this.formUsuarioPermisoAct.controls.cboEstado.disable();
    this.formUsuarioPermisoAct.controls.stOperBaja.disable();
  }

  fnModificarAlmUsr() {
    this.pTipo = 2;
    this.formUsuarioPermisoAct.get('cboEstado').enable();
    this.formUsuarioPermisoAct.get('stOperBaja').enable();
  }

  fnSeleccionarAlmacen(pIdDireccion: number) {
    let direccion = this.lAlmacen.find(item => pIdDireccion == item.nIdDireccion);
    if (direccion) {
      this.formUsuarioPermiso.controls.txtDireccion.setValue(direccion.sDireccion);
      this.formUsuarioPermiso.controls.txtUbicacion.setValue(direccion.sUbicacion);
    }
  }

  //#endregion

  //#region Filtrado
  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }
  //#endregion

  //#region Funcion validacion
  async fnValidarExistenteAnadir(nIdAlmacen: number, nIdUsuario: number): Promise<Lista_Alm_Usr_Permiso> {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los registros de la tabla

    pParametro.push(nIdAlmacen);
    pParametro.push(nIdUsuario);

    try {
      const validacion = await this.vParLogisticaService.fnAlmacenUsuarioPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      this.spinner.hide();
      return validacion[0];

    } catch (err) {
      console.log(err);
      this.spinner.hide();
      throw err;
    }
  }

  async fnValidarExistenteModificar(nIdAlmacen: number, nIdUsuario: number, nIdAlmacenUsuario: number): Promise<Lista_Alm_Usr_Permiso> {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;       //Listar todos los registros de la tabla

    pParametro.push(nIdAlmacen);
    pParametro.push(nIdUsuario);
    pParametro.push(nIdAlmacenUsuario);

    try {
      const validacion = await this.vParLogisticaService.fnAlmacenUsuarioPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();
      this.spinner.hide();
      return validacion[0];

    } catch (err) {
      console.log(err);
      this.spinner.hide();
      throw err;
    }
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
