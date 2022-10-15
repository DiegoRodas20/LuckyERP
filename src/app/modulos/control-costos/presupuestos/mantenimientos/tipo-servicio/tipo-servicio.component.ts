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
import { getWeekYearWithOptions } from 'date-fns/fp';

export interface TipoServicio {
  nId: number;
  sCodigo: string;
  sDescripcion: string;
  sCodigoCuenta: string;
  nEstado: number;
  sEstado: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-tipo-servicio',
  templateUrl: './tipo-servicio.component.html',
  styleUrls: ['./tipo-servicio.component.css']
})
export class TipoServicioComponent implements OnInit {

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  vTipoServicioSeleccionado: TipoServicio;
  lTipoS: TipoServicio[];
  txtFiltro = new FormControl();
  formTipoServicio: FormGroup;
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<TipoServicio>;
  displayedColumns = ['nId', 'sCodigo', 'sDescripcion', 'sCodigoCuenta', 'sEstado'];
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

    this.formTipoServicio = this.formBuilder.group({
      txtCodigo: [''],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50)]],
      txtCodigoCuenta: ['', [Validators.required, Validators.maxLength(50), Validators.pattern("^[0-9]*$"),
      ]]
    })
    this.fnListarTipoS(1);
  }

  fnListarTipoS = function (opcion: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla


    pParametro.push(this.pPais);

    this.vMantenimientoService.fnMantenimientoPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lTipoS = res;
        this.nCodigo = 0;
        this.sCodigo = "";
        this.lTipoS.forEach(item => {
          if (parseInt(item.sCodigo) > this.nCodigo) { this.nCodigo = parseInt(item.sCodigo) }
        })
        this.nCodigo++;
        if (opcion == 1) {
          this.sCodigo = this.nCodigo.toString();
          if (this.sCodigo.length == 1) { this.sCodigo = '0' + this.sCodigo }
          this.formTipoServicio.controls.txtCodigo.setValue(this.sCodigo);
        }
        const tipoS = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(tipoS);
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

  fnAnadirTipoS = function () {
    if (this.formTipoServicio.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los campos ingresados', 'warning')
      return;
    }

    var vDatosTS = this.formTipoServicio.value;
    var descripcion: string = vDatosTS.txtDescripcion;
    var codigoCuenta = vDatosTS.txtCodigoCuenta;
    var codigoCuentaRepetido: TipoServicio;

    //Verificando si la descripcion ya existe
    if (this.lTipoS.findIndex(item => item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'La descripcion del servicio indicado ya existe', 'warning')
      return;
    }

    //Verificar que el codigo de cuenta no se repita
    for (var tipo of this.lTipoS) {
      if (tipo.sCodigoCuenta == codigoCuenta) {
        codigoCuentaRepetido = tipo;
      }
    }

    if (codigoCuentaRepetido != null) {
      Swal.fire('¡Verificar!', 'El codigo de cuenta indicado ya existe en el tipo servicio: ' + codigoCuentaRepetido.sDescripcion, 'warning')
      return;
    }
    //==============================

    var pEntidad = 1; //Cabecera de la TipoServicio
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(vDatosTS.txtDescripcion);
    pParametro.push(this.pPais);
    pParametro.push(vDatosTS.txtCodigoCuenta)

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
          this.formTipoServicio.controls.txtDescripcion.setValue("");
          this.formTipoServicio.controls.txtCodigoCuenta.setValue("");
          this.fnListarTipoS(1);
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

  fnGuardarTipoS=function() {

    if (this.formTipoServicio.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los campos ingresados', 'warning')
      return;
    }

    var vDatos = this.formTipoServicio.value;
    var codigoCuenta = vDatos.txtCodigoCuenta;
    //Verificar que el codigo de cuenta no se repita
    for (var tipo of this.lTipoS) {
      if (tipo.sCodigoCuenta == codigoCuenta && tipo.nId != this.vTipoServicioSeleccionado.nId) {
        Swal.fire('¡Verificar!', 'El codigo de cuenta indicado ya existe en el tipo servicio: ' + tipo.sDescripcion, 'warning')
        return;
      }
    }

    var pEntidad = 1; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    var vDatosTS = this.formTipoServicio.value;

    pParametro.push(this.vTipoServicioSeleccionado.nId);
    pParametro.push(vDatosTS.txtDescripcion);
    pParametro.push(this.cboEstado.value);
    pParametro.push(vDatosTS.txtCodigoCuenta);

    this.vMantenimientoService.fnMantenimientoPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          Swal.fire('Correcto', 'Se actualizo de manera correcta el registro', 'success')
          this.vTipoServicioSeleccionado.nEstado = this.cboEstado.value;
          this.formTipoServicio.get('txtDescripcion').disable();
          this.formTipoServicio.get('txtCodigoCuenta').disable();
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarTipoS(0);
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

  fnSeleccionarTipoS(row: TipoServicio) {
    this.vTipoServicioSeleccionado = row;
    this.formTipoServicio.controls.txtDescripcion.setValue(this.vTipoServicioSeleccionado.sDescripcion)
    this.formTipoServicio.controls.txtCodigo.setValue(this.vTipoServicioSeleccionado.sCodigo)
    this.formTipoServicio.controls.txtCodigoCuenta.setValue(this.vTipoServicioSeleccionado.sCodigoCuenta)

    this.formTipoServicio.get('txtDescripcion').disable();
    this.formTipoServicio.get('txtCodigoCuenta').disable();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalTS.nativeElement.click();
    this.title = 'Modificar Tipo Servicio';
    this.cboEstado.setValue(this.vTipoServicioSeleccionado.nEstado);
    this.cboEstado.disable();
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

  fnModificarTipoS() {
    this.pTipo = 2;
    this.formTipoServicio.get('txtDescripcion').enable();
    this.formTipoServicio.get('txtCodigoCuenta').enable();

    this.cboEstado.enable();
  }

  fnLimpiarModal() {
    this.formTipoServicio.controls.txtDescripcion.setValue('');
    this.formTipoServicio.controls.txtCodigo.setValue('');
    this.formTipoServicio.controls.txtCodigoCuenta.setValue('');
  }

  fnAbrirModal() {
    this.modalTS.nativeElement.click();
    this.pOpcion = 1;
    this.formTipoServicio.get('txtDescripcion').enable();
    this.formTipoServicio.controls.txtCodigoCuenta.enable();
    this.formTipoServicio.controls.txtCodigo.setValue(this.sCodigo);
    this.title = 'Añadir Tipo de servicio'
    this.cboEstado.disable();
  }

  fnEvitarEspacios() {
    var vDatosCC = this.formTipoServicio.value;
    var descripcion = vDatosCC.txtDescripcion;

    this.formTipoServicio.controls.txtDescripcion.setValue(descripcion.trimLeft())
  }

}
