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

export interface OficinaOrdenante {
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
  selector: 'app-oficina-ordenante',
  templateUrl: './oficina-ordenante.component.html',
  styleUrls: ['./oficina-ordenante.component.css']
})
export class OficinaOrdenanteComponent implements OnInit {


  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  vOficinaOSeleccionado: OficinaOrdenante;
  lOficinaOrd: OficinaOrdenante[] = [];
  txtFiltro = new FormControl();
  formOficinaO: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<OficinaOrdenante>;
  displayedColumns = ['nId', 'sCodigo', 'sDescripcion', 'sEstado'];
  @ViewChild('modalCC') modalOfic: ElementRef;

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

    this.formOficinaO = this.formBuilder.group({
      txtCodigo: ['', [Validators.required]],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50)]]
    })
    this.fnListarOficinaOrd(1);
  }

  fnListarOficinaOrd = function (opcion: number) {
    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);


    this.vMantenimientoService.fnMantenimientoPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lOficinaOrd = res;
        this.nCodigo = 0;
        this.sCodigo = "";
        this.lOficinaOrd.forEach(item => {
          if (parseInt(item.sCodigo) > this.nCodigo) { this.nCodigo = parseInt(item.sCodigo) }
        })
        this.nCodigo++;
        if (opcion == 1) {
          this.sCodigo = this.nCodigo.toString();
          if (this.sCodigo.length == 1) { this.sCodigo = '00' + this.sCodigo }
          if (this.sCodigo.length == 2) { this.sCodigo = '0' + this.sCodigo }
          this.formOficinaO.controls.txtCodigo.setValue(this.sCodigo);
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

  fnAnadirOficinaOrd = function () {
    if (this.formOficinaO.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la descripcion', 'warning')
      return;
    }

    var vDatosCC = this.formOficinaO.value;
    var descripcion: string = vDatosCC.txtDescripcion;

    //Verificando si la descripcion ya existe
    if (this.lOficinaOrd.findIndex(item => item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'La oficina ordenante indicada ya existe', 'warning')
      this.formOficinaO.controls.txtDescripcion.setValue('');
      return;
    }

    var pEntidad = 3; //Cabecera de la ofic. ordenante
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

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
          Swal.fire('Correcto', 'Se guardo el tipo de servicio asignado.', 'success');
          this.formOficinaO.controls.txtDescripcion.setValue("");
          this.fnListarOficinaOrd(1);
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

  fnGuardarOficinaOrd = function () {
    if (this.formOficinaO.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la descripcion', 'warning')
      return;
    }

    var pEntidad = 3; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    var vDatosCC = this.formOficinaO.value;

    pParametro.push(this.vOficinaOSeleccionado.nId);
    pParametro.push(vDatosCC.txtDescripcion);
    pParametro.push(this.cboEstado.value);

    this.vMantenimientoService.fnMantenimientoPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          Swal.fire('Correcto', 'Se actualizo de manera correcta el registro', 'success')
          this.vOficinaOSeleccionado.nEstado = this.cboEstado.value;
          this.formOficinaO.get('txtDescripcion').disable();
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarOficinaOrd(0);
          this.formOficinaO.controls.txtCodigo.setValue(this.vOficinaOSeleccionado.sCodigo);

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

  fnModificarOficinaOrd() {
    this.pTipo = 2;
    this.formOficinaO.get('txtDescripcion').enable();
    this.cboEstado.enable();
  }

  fnLimpiarModal() {
    this.formOficinaO.controls.txtDescripcion.setValue('');
    this.formOficinaO.controls.txtCodigo.setValue('');
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
    this.modalOfic.nativeElement.click();
    this.pOpcion = 1;
    this.formOficinaO.get('txtDescripcion').enable();
    this.formOficinaO.controls.txtCodigo.setValue(this.sCodigo);


    this.title = 'Añadir Oficina ordenante'
    this.cboEstado.disable();
  }

  fnSeleccionarOficinaOrd(row: OficinaOrdenante) {
    this.vOficinaOSeleccionado = row;

    this.formOficinaO.controls.txtCodigo.setValue(this.vOficinaOSeleccionado.sCodigo)
    this.formOficinaO.controls.txtDescripcion.setValue(this.vOficinaOSeleccionado.sDescripcion)

    this.formOficinaO.get('txtDescripcion').disable();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalOfic.nativeElement.click();
    this.title = 'Modificar Oficina ordenante';
    this.cboEstado.setValue(this.vOficinaOSeleccionado.nEstado);
    this.cboEstado.disable();
  }

  fnEvitarEspacios(){
    var vDatosCC = this.formOficinaO.value;
    var descripcion = vDatosCC.txtDescripcion;

    this.formOficinaO.controls.txtDescripcion.setValue(descripcion.trimLeft())
  }

}
