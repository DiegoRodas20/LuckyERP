import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PresupuestosService } from '../presupuestos.service'
import { Router } from '@angular/router';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { NgxSpinnerService } from 'ngx-spinner';

import Swal from 'sweetalert2';
import { StringMapWithRename } from '@angular/compiler/src/compiler_facade_interface';

import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { validateVerticalPosition } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { VisorAsistenciaPersonalComponent } from './visor-asistencia-personal/visor-asistencia-personal.component';
import { Asistencia, CC_Sucursal, Presupuesto, PartidaPersonal } from './model';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-visor-asistencia',
  templateUrl: './visor-asistencia.component.html',
  styleUrls: ['./visor-asistencia.component.css']
})
export class VisorAsistenciaComponent implements OnInit {

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  formPresupuesto: FormGroup;
  formPartida: FormGroup;

  vPresupuesto: Presupuesto;
  lSucursal: CC_Sucursal[] = [];
  vSucursalSeleccionada: CC_Sucursal;
  lPartidaPersonal: PartidaPersonal[] = []
  lCanal: PartidaPersonal[] = []
  lCategoria: PartidaPersonal[] = []
  lAsistencia: Asistencia[] = [];
  cboSucursal = new FormControl();
  cboPartidas = new FormControl();

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Asistencia>;
  displayedColumns = [
    'sAnio', 'sMes', 'sPeriodo', 'sPersonalAsistencia', 'sQF', 'sTipo',
    'sDoc', 'sPlanilla', 'sUsr', 'sFechaRegistro', 'nTotalNeto',
    'nTotalPers', 'nTotalDias'
  ];
  matcher = new MyErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vPreService: PresupuestosService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formPresupuesto = this.formBuilder.group({
      txtCodigo: ['', [
        Validators.pattern("^[0-9]*$"),
        Validators.minLength(6),
        Validators.maxLength(6),]],
      txtDescripcion: [''],
      txtFechaInicio: [''],
      txtFechaFin: [''],
      txtCliente: [''],
      txtUserRegistro: [''],
      txtFechaRegistro: [''],
      txtHoraRegistro: [''],
    })

    this.formPartida = this.formBuilder.group({
      cboCategoria: [''],
      cboCanal: [''],
      txtPersonas: [''],
      txtDias: [''],
      txtTotalDias: ['']
    })

  }

  //==========Funciones de listado==========================
  fnListarPresupuesto = function () {

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vDatos = this.formPresupuesto.value;

    if (this.formPresupuesto.get('txtCodigo').hasError('pattern')) {
      return;
    }

    if (vDatos.txtCodigo == null) {
      this.formPresupuesto.controls.txtDescripcion.setValue('');
      this.formPresupuesto.controls.txtFechaInicio.setValue('');
      this.formPresupuesto.controls.txtFechaFin.setValue('');
      this.formPresupuesto.controls.txtCliente.setValue('');
      this.formPresupuesto.controls.txtUserRegistro.setValue('');
      this.formPresupuesto.controls.txtFechaRegistro.setValue('');
      this.formPresupuesto.controls.txtHoraRegistro.setValue('');
      this.cboSucursal.setValue('');
      this.lSucursal = [];
      this.lPartidaPersonal = [];
      this.lCanal = [];
      this.lCategoria = [];
      this.formPartida.controls.cboCategoria.setValue('');
      this.formPartida.controls.cboCanal.setValue('');
      this.formPartida.controls.txtPersonas.setValue('');
      this.formPartida.controls.txtDias.setValue('');
      this.formPartida.controls.txtTotalDias.setValue('');
      this.fnLimpiarTable();
      return;
    }

    if (vDatos.txtCodigo.toString().length != 6) {
      this.formPresupuesto.controls.txtDescripcion.setValue('');
      this.formPresupuesto.controls.txtFechaInicio.setValue('');
      this.formPresupuesto.controls.txtFechaFin.setValue('');
      this.formPresupuesto.controls.txtCliente.setValue('');
      this.formPresupuesto.controls.txtUserRegistro.setValue('');
      this.formPresupuesto.controls.txtFechaRegistro.setValue('');
      this.formPresupuesto.controls.txtHoraRegistro.setValue('');
      this.cboSucursal.setValue('');
      this.lSucursal = [];
      this.lPartidaPersonal = [];
      this.lCanal = [];
      this.lCategoria = [];
      this.formPartida.controls.cboCategoria.setValue('');
      this.formPartida.controls.cboCanal.setValue('');
      this.formPartida.controls.txtPersonas.setValue('');
      this.formPartida.controls.txtDias.setValue('');
      this.formPartida.controls.txtTotalDias.setValue('');
      this.fnLimpiarTable();
      return;
    }
    pParametro.push(vDatos.txtCodigo);
    pParametro.push(this.idEmp);

    this.spinner.show();

    this.vPreService.fnVisorAsistencia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res.length == 0) {
          Swal.fire('¡Verificar!', 'No se encontro presupuesto con el codigo asignado', 'warning')
          this.formPresupuesto.controls.txtDescripcion.setValue('');
          this.formPresupuesto.controls.txtFechaInicio.setValue('');
          this.formPresupuesto.controls.txtFechaFin.setValue('');
          this.formPresupuesto.controls.txtCliente.setValue('');
          this.formPresupuesto.controls.txtUserRegistro.setValue('');
          this.formPresupuesto.controls.txtFechaRegistro.setValue('');
          this.formPresupuesto.controls.txtHoraRegistro.setValue('');
          this.cboSucursal.setValue('');
          this.fnLimpiarTable();
          this.lSucursal = [];
          this.lPartidaPersonal = [];
          this.formPartida.controls.cboCategoria.setValue('');
          this.formPartida.controls.cboCanal.setValue('');
          this.formPartida.controls.txtPersonas.setValue('');
          this.formPartida.controls.txtDias.setValue('');
          this.formPartida.controls.txtTotalDias.setValue('');
        } else {
          this.vPresupuesto = res[0];
          this.formPresupuesto.controls.txtDescripcion.setValue(this.vPresupuesto.sPresupuesto);
          this.formPresupuesto.controls.txtFechaInicio.setValue(this.vPresupuesto.sFechaIni);
          this.formPresupuesto.controls.txtFechaFin.setValue(this.vPresupuesto.sFechaFin);
          this.formPresupuesto.controls.txtCliente.setValue(this.vPresupuesto.sCliente);
          this.formPresupuesto.controls.txtUserRegistro.setValue(this.vPresupuesto.sUserCreo);
          this.formPresupuesto.controls.txtFechaRegistro.setValue(this.vPresupuesto.sFechaCreo);
          this.formPresupuesto.controls.txtHoraRegistro.setValue(this.vPresupuesto.sHoraCreo);
          this.fnListarSucursal(this.vPresupuesto.nIdCentroCosto);
          this.cboSucursal.setValue('');
          this.fnLimpiarTable();

          //Vaciando las listas
          this.lPartidaPersonal = [];
          this.lCanal = [];
          this.lCategoria = [];

          this.cboPartidas.setValue('');
          this.formPartida.controls.cboCategoria.setValue('');
          this.formPartida.controls.cboCanal.setValue('');
          this.formPartida.controls.txtPersonas.setValue('');
          this.formPartida.controls.txtDias.setValue('');
          this.formPartida.controls.txtTotalDias.setValue('');
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

  fnListarSucursal = function (nIdCC: number) {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(nIdCC);


    this.vPreService.fnVisorAsistencia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lSucursal = res;
        if (this.lSucursal.length == 1) {
          this.cboSucursal.setValue(this.lSucursal[0]);
          this.fnListarPartidaPersonal(this.lSucursal[0]);
          this.vSucursalSeleccionada = this.lSucursal[0];
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

  fnListarPartidaPersonal = function (p: CC_Sucursal) {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.vPresupuesto.nIdCentroCosto);
    pParametro.push(p.nIdSucursal);

    this.vPreService.fnVisorAsistencia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        //Filtrando para que no se repita
        this.lPartidaPersonal = res;
        this.lCanal = [];
        this.lCategoria = [];

        this.lPartidaPersonal = [...new Map(this.lPartidaPersonal.map(item => [item.nIdPartida, item])).values()];
        if (this.lPartidaPersonal.length == 1) {
          this.cboPartidas.setValue(this.lPartidaPersonal[0].nIdPartida);
          this.fnListarCanalPartida(this.lPartidaPersonal[0]);
        } else {
          this.cboPartidas.setValue('');
          this.formPartida.controls.cboCategoria.setValue('');
          this.formPartida.controls.cboCanal.setValue('');
          this.formPartida.controls.txtPersonas.setValue('');
          this.formPartida.controls.txtDias.setValue('');
          this.formPartida.controls.txtTotalDias.setValue('');
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

  fnListarCanalPartida = function (p: PartidaPersonal) {
    this.spinner.show();

    var pEntidad = 5;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.vPresupuesto.nIdCentroCosto);
    pParametro.push(p.nIdPartida);
    pParametro.push(this.vSucursalSeleccionada.nIdSucursal);

    this.vPreService.fnVisorAsistencia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        //Filtrando para que no se repita
        this.lCanal = res;
        this.lCategoria = [];
        this.lCanal = [...new Map(this.lCanal.map(item => [item.nIdCanal, item])).values()];
        if (this.lCanal.length == 1) {
          this.formPartida.controls.cboCanal.setValue(this.lCanal[0].nIdCanal);
          this.fnListarCategoriaCanal(this.lCanal[0]);
        } else {
          this.formPartida.controls.cboCanal.setValue('');
          this.formPartida.controls.cboCategoria.setValue('');
          this.formPartida.controls.txtPersonas.setValue('');
          this.formPartida.controls.txtDias.setValue('');
          this.formPartida.controls.txtTotalDias.setValue('');
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

  fnListarCategoriaCanal = function (p: PartidaPersonal) {
    this.spinner.show();

    var pEntidad = 6;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.vPresupuesto.nIdCentroCosto);
    pParametro.push(p.nIdCanal);
    pParametro.push(this.vSucursalSeleccionada.nIdSucursal);
    pParametro.push(this.cboPartidas.value);

    this.vPreService.fnVisorAsistencia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        //Filtrando para que no se repita
        this.lCategoria = res;

        this.lCategoria = [...new Map(this.lCategoria.map(item => [item.nIdCategoria, item])).values()];
        if (this.lCategoria.length == 1) {
          this.formPartida.controls.cboCategoria.setValue(this.lCategoria[0].nIdCategoria);
          this.fnSeleccionarCategoria(this.lCategoria[0]);
          this.fnListarAsistencia(this.lCategoria[0]);
        } else {
          this.formPartida.controls.cboCategoria.setValue('');
          this.formPartida.controls.txtPersonas.setValue('');
          this.formPartida.controls.txtDias.setValue('');
          this.formPartida.controls.txtTotalDias.setValue('');
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

  fnListarAsistencia = function (categoria: PartidaPersonal) {
    this.spinner.show();

    var pEntidad = 7;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vDatos = this.formPartida.value;

    pParametro.push(this.vPresupuesto.nIdCentroCosto);
    pParametro.push(vDatos.cboCanal);
    pParametro.push(this.vSucursalSeleccionada.nIdSucursal);
    pParametro.push(this.cboPartidas.value);
    pParametro.push(categoria.nIdCategoria);

    this.vPreService.fnVisorAsistencia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lAsistencia = res;
        if (this.lAsistencia.length == 0) {
          this.fnLimpiarTable();
        } else {
          const asistencia = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
          this.dataSource = new MatTableDataSource(asistencia);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
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

  //==================================================================

  fnSeleccionarSucursal(p: CC_Sucursal) {
    this.vSucursalSeleccionada = p;
  }

  fnSeleccionarCategoria(p: PartidaPersonal) {
    this.formPartida.controls.txtPersonas.setValue(p.nCantPersonal);
    this.formPartida.controls.txtDias.setValue(p.nDias);
    this.formPartida.controls.txtTotalDias.setValue(p.nTotalDias);
  }

  fnLimpiarSucursal() {
    this.lCategoria = [];
    this.lCanal = [];
    this.lPartidaPersonal = [];
    this.fnLimpiarTable();
    this.cboPartidas.setValue('');
    this.formPartida.controls.cboCanal.setValue('');
    this.formPartida.controls.cboCategoria.setValue('');
    this.formPartida.controls.txtPersonas.setValue('');
    this.formPartida.controls.txtDias.setValue('');
    this.formPartida.controls.txtTotalDias.setValue('');
  }

  fnLimpiarPartida() {
    this.lCategoria = [];
    this.lCanal = [];
    this.formPartida.controls.cboCanal.setValue('');
    this.formPartida.controls.cboCategoria.setValue('');
    this.formPartida.controls.txtPersonas.setValue('');
    this.formPartida.controls.txtDias.setValue('');
    this.formPartida.controls.txtTotalDias.setValue('');
    this.fnLimpiarTable();
  }

  fnLimpiarCanal() {
    this.lCategoria = [];
    this.formPartida.controls.cboCategoria.setValue('');
    this.formPartida.controls.txtPersonas.setValue('');
    this.formPartida.controls.txtDias.setValue('');
    this.formPartida.controls.txtTotalDias.setValue('');
    this.fnLimpiarTable();
  }

  fnLimpiarCategoria() {
    this.formPartida.controls.txtPersonas.setValue('');
    this.formPartida.controls.txtDias.setValue('');
    this.formPartida.controls.txtTotalDias.setValue('');
    this.fnLimpiarTable();
  }

  fnLimpiarTable() {
    const asistencia = []; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
    this.dataSource = new MatTableDataSource(asistencia);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fnAbrirDialog() {
    const dialogRef = this.dialog.open(VisorAsistenciaPersonalComponent, {
      panelClass: 'dialog-responsive',
      data: this.vSucursalSeleccionada
    });
  }
}
