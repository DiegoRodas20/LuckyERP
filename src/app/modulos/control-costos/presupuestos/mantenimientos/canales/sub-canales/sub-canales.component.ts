import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild, ViewChildren, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MantenimientosService } from '../../mantenimientos.service';
import { Router } from '@angular/router';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { StringMapWithRename } from '@angular/compiler/src/compiler_facade_interface';

import { ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { validateVerticalPosition } from '@angular/cdk/overlay';
import { Canal } from '../canales.component';

export interface SubCanal {
  nId: number;
  sCodigo: string;
  sDescripcion: string;
  nEstado: number;
  sEstado: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-sub-canales',
  templateUrl: './sub-canales.component.html',
  styleUrls: ['./sub-canales.component.css']
})
export class SubCanalesComponent implements OnInit {


  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  vSubCanalSeleccionado: SubCanal;
  lSubCanal: SubCanal[] = [];
  txtFiltro = new FormControl();
  formSubCanal: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<SubCanal>;
  displayedColumns = ['nId', 'sCodigo', 'sDescripcion', 'sEstado'];
  @ViewChild('modalSubCanal') modalSubCanal: ElementRef;

  @Input() pCanal: Canal;
  @Output() pMostrar = new EventEmitter<number>();

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
    private vMantenimientoService: MantenimientosService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formSubCanal = this.formBuilder.group({
      txtCodigo: ['', [Validators.required]],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50)]]
    })
    this.fnListarSubCanal(1, this.pCanal);
  }

  fnListarSubCanal = function (opcion: number, p: Canal) {
    this.spinner.show();

    var pEntidad = 8;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(p.nId);

    this.vMantenimientoService.fnMantenimientoPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lSubCanal = res;
        this.nCodigo = 0;
        this.sCodigo = "";
        this.lSubCanal.forEach(item => {
          if (parseInt(item.sCodigo) > this.nCodigo) { this.nCodigo = parseInt(item.sCodigo) }
        })
        this.nCodigo++;
        if (opcion == 1) {
          this.sCodigo = this.nCodigo.toString();
          if (this.sCodigo.length == 1) { this.sCodigo = '0' + this.sCodigo }
          this.formSubCanal.controls.txtCodigo.setValue(this.sCodigo);
        }
        const subCanal = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(subCanal);
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

  fnAnadirSubCanal = function () {
    if (this.formSubCanal.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la descripcion', 'warning')
      return;
    }

    var vDatos = this.formSubCanal.value;
    var descripcion: string = vDatos.txtDescripcion;

    //Verificando si la descripcion ya existe
    if (this.lSubCanal.findIndex(item => item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'El sub canal indicado ya existe', 'warning')
      this.formSubCanal.controls.txtDescripcion.setValue('');
      return;
    }

    var pEntidad = 8; //Cabecera de canal
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(vDatos.txtDescripcion);
    pParametro.push(this.pCanal.nId);

    this.vMantenimientoService.fnMantenimientoPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
          Swal.fire('Correcto', 'Se guardo el sub canal canal asignado.', 'success');
          this.formSubCanal.controls.txtDescripcion.setValue("");
          this.fnListarSubCanal(1, this.pCanal);
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

  fnGuardarSubCanal = function () {
    if (this.formSubCanal.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la descripcion', 'warning')
      return;
    }

    var pEntidad = 8; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    var vDatosCC = this.formSubCanal.value;

    pParametro.push(this.vSubCanalSeleccionado.nId);
    pParametro.push(vDatosCC.txtDescripcion);
    pParametro.push(this.cboEstado.value);

    this.vMantenimientoService.fnMantenimientoPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          Swal.fire('Correcto', 'Se actualizo de manera correcta el registro', 'success')
          this.vSubCanalSeleccionado.nEstado = this.cboEstado.value;
          this.formSubCanal.get('txtDescripcion').disable();
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarSubCanal(0, this.pCanal);
          this.formSubCanal.controls.txtCodigo.setValue(this.vSubCanalSeleccionado.sCodigo);

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

  fnModificarSubCanal() {
    this.pTipo = 2;
    this.formSubCanal.get('txtDescripcion').enable();
    this.cboEstado.enable();
  }

  fnSeleccionarSubCanal(row: SubCanal) {
    this.vSubCanalSeleccionado = row;

    this.formSubCanal.controls.txtCodigo.setValue(this.vSubCanalSeleccionado.sCodigo)
    this.formSubCanal.controls.txtDescripcion.setValue(this.vSubCanalSeleccionado.sDescripcion)
    this.formSubCanal.get('txtDescripcion').disable();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalSubCanal.nativeElement.click();
    this.title = 'Modificar Sub Canal';
    this.cboEstado.setValue(this.vSubCanalSeleccionado.nEstado);
    this.cboEstado.disable();
  }

  fnLimpiarModal() {
    this.formSubCanal.controls.txtDescripcion.setValue('');
    this.formSubCanal.controls.txtCodigo.setValue('');
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
    this.modalSubCanal.nativeElement.click();
    this.pOpcion = 1;
    this.formSubCanal.get('txtDescripcion').enable();
    this.formSubCanal.controls.txtCodigo.setValue(this.sCodigo);

    this.title = 'Añadir Sub Canal'
    this.cboEstado.disable();
  }

  fnEvitarEspacios() {
    var vDatos = this.formSubCanal.value;
    var descripcion = vDatos.txtDescripcion;

    this.formSubCanal.controls.txtDescripcion.setValue(descripcion.trimLeft())

  }

  fnRegresar() {
    this.pMostrar.emit(0);
  }
}
