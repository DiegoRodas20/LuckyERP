import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MantenimientosService } from '../mantenimientos.service';
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

export interface Canal {
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
  selector: 'app-canales',
  templateUrl: './canales.component.html',
  styleUrls: ['./canales.component.css']
})
export class CanalesComponent implements OnInit {


  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  vCanalSeleccionado: Canal;
  pCanal: Canal;
  lCanal: Canal[] = [];
  txtFiltro = new FormControl();
  formCanal: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Canal>;
  displayedColumns = ['nId', 'sCodigo', 'sDescripcion', 'sEstado'];
  @ViewChild('modalCanal') modalCanal: ElementRef;

  cboEstado = new FormControl();
  title: string;

  //Se genera despues de escoger el maximo codigo y se le aumenta 1
  nCodigo: number = 0;
  sCodigo: string = "";
  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar

  pMostrar: number;

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
  ) { this.url = baseUrl; this.pMostrar=0 }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formCanal = this.formBuilder.group({
      txtCodigo: ['', [Validators.required]],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50)]]
    })
    this.fnListarCanal(1);
  }

  fnListarCanal = function (opcion: number) {
    this.spinner.show();

    var pEntidad = 5;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(' ');


    this.vMantenimientoService.fnMantenimientoPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lCanal = res;
        this.nCodigo = 0;
        this.sCodigo = "";
        this.lCanal.forEach(item => {
          if (parseInt(item.sCodigo) > this.nCodigo) { this.nCodigo = parseInt(item.sCodigo) }
        })
        this.nCodigo++;
        if (opcion == 1) {
          this.sCodigo = this.nCodigo.toString();
          if (this.sCodigo.length == 1) { this.sCodigo = '00' + this.sCodigo }
          if (this.sCodigo.length == 2) { this.sCodigo = '0' + this.sCodigo }
          this.formCanal.controls.txtCodigo.setValue(this.sCodigo);
        }
        const categoriaC = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(categoriaC);
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

  fnAnadirCanal = function () {
    if (this.formCanal.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la descripcion', 'warning')
      return;
    }

    var vDatosCC = this.formCanal.value;
    var descripcion: string = vDatosCC.txtDescripcion;

    //Verificando si la descripcion ya existe
    if (this.lCanal.findIndex(item => item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'El canal indicado ya existe', 'warning')
      this.formCanal.controls.txtDescripcion.setValue('');
      return;
    }

    var pEntidad = 5; //Cabecera de canal
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(vDatosCC.txtDescripcion);


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
          Swal.fire('Correcto', 'Se guardo el canal asignado.', 'success');
          this.formCanal.controls.txtDescripcion.setValue("");
          this.fnListarCanal(1);
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

  fnGuardarCanal = function () {
    if (this.formCanal.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la descripcion', 'warning')
      return;
    }

    var pEntidad = 5; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    var vDatosCC = this.formCanal.value;

    pParametro.push(this.vCanalSeleccionado.nId);
    pParametro.push(vDatosCC.txtDescripcion);
    pParametro.push(this.cboEstado.value);

    this.vMantenimientoService.fnMantenimientoPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          Swal.fire('Correcto', 'Se actualizo de manera correcta el registro', 'success')
          this.vCanalSeleccionado.nEstado = this.cboEstado.value;
          this.formCanal.get('txtDescripcion').disable();
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarCanal(0);
          this.formCanal.controls.txtCodigo.setValue(this.vCanalSeleccionado.sCodigo);

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

  fnModificarCanal() {
    this.pTipo = 2;
    this.formCanal.get('txtDescripcion').enable();
    this.cboEstado.enable();
  }

  fnSeleccionarCanal(row: Canal) {
    this.vCanalSeleccionado = row;

    this.formCanal.controls.txtCodigo.setValue(this.vCanalSeleccionado.sCodigo)
    this.formCanal.controls.txtDescripcion.setValue(this.vCanalSeleccionado.sDescripcion)

    this.formCanal.get('txtDescripcion').disable();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalCanal.nativeElement.click();
    this.title = 'Modificar Canal Comercial';
    this.cboEstado.setValue(this.vCanalSeleccionado.nEstado);
    this.cboEstado.disable();
  }

  fnLimpiarModal() {
    this.formCanal.controls.txtDescripcion.setValue('');
    this.formCanal.controls.txtCodigo.setValue('');
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
    this.modalCanal.nativeElement.click();
    this.pOpcion = 1;
    this.formCanal.get('txtDescripcion').enable();
    this.formCanal.controls.txtCodigo.setValue(this.sCodigo);

    this.title = 'Añadir Canal comercial'
    this.cboEstado.disable();
  }

  fnEvitarEspacios() {
    var vDatos = this.formCanal.value;
    var descripcion = vDatos.txtDescripcion;

    this.formCanal.controls.txtDescripcion.setValue(descripcion.trimLeft())

  }

  fnOcultar(p: number){
    this.pMostrar=p;
  }

  fnSubCanal(row: Canal){
    this.pCanal = row;
    this.pMostrar = 1;
  }

}
