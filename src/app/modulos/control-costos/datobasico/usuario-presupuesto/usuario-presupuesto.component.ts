import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { DatoBasicoService } from '../datobasico.service';
import { LugarEntrega } from '../../compra/orden-compra-sc/models/general.entity';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';

export interface UsuarioPersonal {
  nId: number;
  sEmail: string;
  sNombreUsuario: string;
  sNombre: number;
  sTelefono: string;
}

export interface UsuarioPresupuesto {
  nId: number;
  sFechaRegistro: string;
  sNombreUsuario: string;
  nIdUsuario: number;
  sNombre: string;
  nEstado: string;
  sEstado: string;
  bReabreTodo: number;
  sReabreTodo: number;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-usuario-presupuesto',
  templateUrl: './usuario-presupuesto.component.html',
  styleUrls: ['./usuario-presupuesto.component.css'],
  animations: [asistenciapAnimations]
})
export class UsuarioPresupuestoComponent implements OnInit {

  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nuevo usuario presupuesto' },
  ];
  abLista = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  vUsuarioSeleccionado: UsuarioPresupuesto;
  lUsuarioPres: UsuarioPresupuesto[] = [];
  lUsuarioPer: UsuarioPersonal[] = [];
  txtFiltro = new FormControl();
  txtNombreUsuario = new FormControl();
  formUsuarioPres: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<UsuarioPresupuesto>;
  displayedColumns = ['nId', 'sNombreUsuario', 'sNombre', 'sReabreTodo', 'sEstado'];
  @ViewChild('modalUsuarioPres') modalUsuario: ElementRef;

  cboEstado = new FormControl();
  reabrirPpto = new FormControl();
  title: string;

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
    this.onToggleFab(1, -1)

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formUsuarioPres = this.formBuilder.group({
      cboNombre: ['', [Validators.required]],
      txtNombreUsuario: [''],
      txtEmail: [''],
      txtTelefono: [''],
      reabrirPpto: [false]
    })
    this.fnListarUsuarioPresupuesto();
    this.fnListarUsuarioPersonal();
  }

  fnListarUsuarioPresupuesto = function () {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);


    this.vDatoBasicoService.fnDatoMatriz(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lUsuarioPres = res;
        const usuarioPres = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(usuarioPres);
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

  fnListarUsuarioPersonal = function () {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);


    this.vDatoBasicoService.fnDatoMatriz(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lUsuarioPer = res;
        // console.log('VEAMOS', res)

      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnAnadirUsuarioPres = function () {
    if (this.formUsuarioPres.invalid) {
      Swal.fire('¡Verificar!', 'Seleccione un usuario para guardar', 'warning')
      return;
    }
    this.spinner.show();

    var vDatos = this.formUsuarioPres.value;

    var pEntidad1 = 2; //Cabecera 
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 2;       //Listar un registro

    pParametro1.push(vDatos.cboNombre);

    this.vDatoBasicoService.fnDatoMatriz(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).subscribe(
      res => {
        if (res.cod != "0") {
          this.spinner.hide();
          Swal.fire('¡Verificar!', 'El usuario indicado ya se encuentra registrado, indique otro usuario', 'warning');
          this.formUsuarioPres.controls.cboNombre.setValue("");
          this.formUsuarioPres.controls.txtNombreUsuario.setValue("");
          this.formUsuarioPres.controls.txtEmail.setValue("");
          this.formUsuarioPres.controls.txtTelefono.setValue("");
        }
        if (res.cod == "0") {
          var pEntidad = 2; //Cabecera 
          var pOpcion = 1;  //CRUD -> Insertar
          var pParametro = []; //Parametros de campos vacios
          var pTipo = 0;

          var vDatos1 = this.formUsuarioPres.value;
          pParametro.push(vDatos1.cboNombre);
          pParametro.push(this.idUser);
          pParametro.push(this.pPais);
          pParametro.push(vDatos1.reabrirPpto === true ? 1 : 0);

          this.vDatoBasicoService.fnDatoMatriz(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
                  text: 'Se guardo el usuario asignado.',
                  showConfirmButton: false,
                  timer: 1500
                });

                this.formUsuarioPres.controls.cboNombre.setValue("");
                this.formUsuarioPres.controls.txtNombreUsuario.setValue("");
                this.formUsuarioPres.controls.txtEmail.setValue("");
                this.formUsuarioPres.controls.txtTelefono.setValue("");

                this.fnListarUsuarioPresupuesto();
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
      },
      err => {
        this.spinner.hide();
        console.log(err);
      }
    )
  }

  fnGuardarUsuarioPres = function () {

    var pEntidad = 2; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    this.spinner.show();

    pParametro.push(this.vUsuarioSeleccionado.nId);
    pParametro.push(this.cboEstado.value);
    pParametro.push(this.reabrirPpto.value === true ? 1 : 0);

    this.vDatoBasicoService.fnDatoMatriz(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
          this.vUsuarioSeleccionado.nEstado = this.cboEstado.value;
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarUsuarioPresupuesto();
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

  fnModificarUsuarioPres() {
    this.pTipo = 2;
    this.cboEstado.enable();
    this.reabrirPpto.enable();
  }

  // fnSeleccionarUsuarioPersonal(p: UsuarioPersonal) {
  fnSeleccionarUsuarioPersonal(id: number) {

    const usuario: UsuarioPersonal = this.lUsuarioPer.filter(item => item.nId === id)[0];
    this.formUsuarioPres.controls.txtNombreUsuario.setValue(usuario.sNombreUsuario);
    this.formUsuarioPres.controls.txtEmail.setValue(usuario.sEmail);
    this.formUsuarioPres.controls.txtTelefono.setValue(usuario.sTelefono);
  }

  fnSeleccionarUsuarioPresupuesto(row: UsuarioPresupuesto) {
    this.vUsuarioSeleccionado = row;

    this.formUsuarioPres.controls.cboNombre.setValue(this.vUsuarioSeleccionado.nIdUsuario)
    this.formUsuarioPres.controls.cboNombre.disable();
    var lUsuario = this.lUsuarioPer.find(item => item.nId == this.vUsuarioSeleccionado.nIdUsuario)
    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalUsuario.nativeElement.click();
    this.title = 'Modificar Usuario';
    this.formUsuarioPres.controls.txtTelefono.setValue(lUsuario.sTelefono);
    this.txtNombreUsuario.setValue(this.vUsuarioSeleccionado.sNombreUsuario);
    this.cboEstado.setValue(this.vUsuarioSeleccionado.nEstado);
    this.cboEstado.disable();
    this.reabrirPpto.setValue(this.vUsuarioSeleccionado.bReabreTodo === 0 ? false : true);
    this.reabrirPpto.disable();
  }

  fnLimpiarModal() {
    this.formUsuarioPres.controls.cboNombre.setValue('');
    this.formUsuarioPres.controls.txtNombreUsuario.setValue('');
    this.formUsuarioPres.controls.txtEmail.setValue('');
    this.formUsuarioPres.controls.txtTelefono.setValue('');
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

  fnAbrirModal() {
    this.modalUsuario.nativeElement.click();
    this.pOpcion = 1;
    this.formUsuarioPres.get('cboNombre').enable();

    this.title = 'Añadir usuario'
    this.cboEstado.disable();
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
