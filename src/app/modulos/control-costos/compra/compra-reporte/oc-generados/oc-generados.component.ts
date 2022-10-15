import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { StringMapWithRename } from '@angular/compiler/src/compiler_facade_interface';
import { CompraService } from '../../compra.service'
import { ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { validateVerticalPosition } from '@angular/cdk/overlay';
import * as moment from 'moment';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { OrdenCompraGeneradoExport } from '../../models/ordenCompraExport.model';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/services/AppDateAdapter';
import { UsuarioModel } from '../../models/usuarios.model';

export interface OrdenCompraGenerado {
  sFechaEnvio: string;
  sCentroCosto: string;
  sDocumento: string;
  sTituloOC: string;
  sTipoOC: string;
  sCodigoCliente: string;
  sDescCliente: string;
  sDescComprador: string;
  sDescProveedor: string;
  sDescSolicitante: string;
  sFechaCreado: string;
  sFechaModificado: string;
  sEstado: string;
  sTipoMoneda: string;
  nTotal: string;
  sDescFactura: string;
  sFechaFactura: string;
  sFacturaLimite: string;
  sFacturaDocumento: string;
  sVBGerenteDoc: string;
}

export interface Usuario {
  nId: number;
  sNombre: string;
}

export interface Anio {
  sDesc: string;
}

export interface ListaIDGasto {
  nIdGastoCosto: number;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-oc-generados',
  templateUrl: './oc-generados.component.html',
  styleUrls: ['./oc-generados.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {
      provide: DateAdapter, useClass: AppDateAdapter
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
  ],
})
export class OcGeneradosComponent implements OnInit {


  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  pNomEmp: string;
  nEmpresa: string // Obtener el nombre de la empresa

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<OrdenCompraGenerado>;
  displayedColumns = ['sFechaEnvio', 'sCentroCosto', 'sDocumento', 'sTituloOC', 'sTipoOC',
    'sCliente', 'sDescComprador', 'sDescProveedor', 'sDescSolicitante', 'sFechaCreado', 'sFechaModificado',
    'sEstado', 'sTipoMoneda', 'nTotal', 'sDescFactura', 'sFechaFactura', 'sFacturaLimite', 'sFacturaDocumento',
    'sVBGerenteDoc'
  ];

  nMostrar: number;
  formOrdenCompra: FormGroup;
  matcher = new ErrorStateMatcher();

  lMes = [
    { nCod: 1, sDesc: 'Enero' },
    { nCod: 2, sDesc: 'Febrero' },
    { nCod: 3, sDesc: 'Marzo' },
    { nCod: 4, sDesc: 'Abril' },
    { nCod: 5, sDesc: 'Mayo' },
    { nCod: 6, sDesc: 'Junio' },
    { nCod: 7, sDesc: 'Julio' },
    { nCod: 8, sDesc: 'Agosto' },
    { nCod: 9, sDesc: 'Septiembre' },
    { nCod: 10, sDesc: 'Octubre' },
    { nCod: 11, sDesc: 'Noviembre' },
    { nCod: 12, sDesc: 'Diciembre' },

  ]

  lAnio: Anio[] = [];
  lDia: string[] = [];
  lHora: string[] = [];
  lMinuto: string[] = [];

  lUSuario: Usuario[] = [];
  lOrdenCompra: OrdenCompraGenerado[] = [];

  vAyer;
  listaUsuario: UsuarioModel[] = [];
  pParametro = []

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private vCompraService: CompraService,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.url = baseUrl;
    this.nMostrar = 0;
  }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    localStorage.removeItem('NamEmpresa');

    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');
    //this.nEmpresa = "Lucky S.A.C.";

    //Tarer la descripcion de la empresa
    var lista = [];
    lista = JSON.parse(localStorage.ListaEmpresa)
    for (let index = 0; index < lista.length; index++) {
      if (lista[index].nIdEmp == this.idEmp) {
        this.nEmpresa = lista[index].sDespEmp;
      }
    }

    for (var i = 0; i <= 60; i++) {
      this.lMinuto.push(i.toString().length == 1 ? ('0' + i) : (i.toString()))
    }

    for (var i = 0; i <= 24; i++) {
      this.lHora.push(i.toString().length == 1 ? ('0' + i) : (i.toString()))
    }


    this.vAyer = moment().subtract(1, 'days')

    this.formOrdenCompra = this.formBuilder.group({
      rbPDF: [1],
      rbGerenteCostos: [1],
      cboAnio: ['', Validators.required],
      cbMes: [false],
      cboMes: [''],
      cbDia: [false],
      cboDia: [''],
      cbHora: [false],
      cboHora: ['00'],
      cboMinuto: ['00'],
      rbUsuario: [0],
      cboUsuario: [''],
      cbRango: [false],
      nusuario: [''],
      fechaInicio: [new Date()],
      fechaFin: [new Date()]
    })

    this.formOrdenCompra.controls.cboUsuario.disable();
    this.formOrdenCompra.controls.cboMes.disable();
    this.formOrdenCompra.controls.cbDia.disable();
    this.formOrdenCompra.controls.cboDia.disable();
    this.formOrdenCompra.controls.cbHora.disable();
    this.formOrdenCompra.controls.cboHora.disable();
    this.formOrdenCompra.controls.cboMinuto.disable();
    this.formOrdenCompra.controls.fechaInicio.disable();
    this.formOrdenCompra.controls.fechaFin.disable();
    this.formOrdenCompra.controls.nusuario.disable();

    this.fnListarUsuarios();
    this.fnListarAnios();
    this.fnListarUsuariosCombo();
  }

  fnListarAnios = function () {
    this.spinner.show();

    var pEntidad = 1; //Cabecera
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);

    this.vCompraService.fnOrdenCompraInforme(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lAnio = res;
        this.lAnio = this.lAnio.filter(item => item.sDesc != '')
        if (this.lAnio.length > 0) {
          this.formOrdenCompra.controls.cboAnio.setValue(this.lAnio[this.lAnio.length - 1].sDesc)
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

  fnListarUsuariosCombo = function () {
    this.spinner.show();

    var pEntidad = 1; //Cabecera
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 5;       //Listar todos los registros de la tabla

    this.vCompraService.fnOrdenCompraInforme(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.listaUsuario = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarUsuarios = function () {
    this.spinner.show();

    var pEntidad = 2; //Cabecera
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);

    this.vCompraService.fnOrdenCompraInforme(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lUSuario = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnGenerarReporte = function () {

    let vDatos = this.formOrdenCompra.value;
    let vAnio;
    let vMes;
    let vDia;
    let vHora;
    let vMin;
    let vUserId;
    let pTipo;
    var pParametro = []; //Parametros de campos vacios

    if (!vDatos.cbRango) {

      //Para el año
      if (vDatos.cboAnio == null || vDatos.cboAnio == '') {
        Swal.fire('¡Verificar!', 'Seleccione un año', 'warning')
        return;
      }
      vAnio = +vDatos.cboAnio;

      //Para el mes
      if (vDatos.cbMes == true || this.formOrdenCompra.controls.cboMes.enabled) {
        if (vDatos.cboMes == null || vDatos.cboMes == '') {
          Swal.fire('¡Verificar!', 'Seleccione un mes', 'warning')
          return;
        }
        vMes = +vDatos.cboMes;
      }
      if (this.formOrdenCompra.controls.cboMes.disabled) {
        vMes = '';
      }

      //Para el dia
      if (vDatos.cbDia == true || this.formOrdenCompra.controls.cboDia.enabled) {
        if (vDatos.cboDia == null || vDatos.cboDia == '') {
          Swal.fire('¡Verificar!', 'Seleccione un día', 'warning')
          return;
        }
        vDia = +vDatos.cboDia;
      }
      if (this.formOrdenCompra.controls.cboDia.disabled) {
        vDia = '';
      }

      //Para las horas
      vHora = +vDatos.cboHora;
      vMin = +vDatos.cboMinuto;
      if (this.formOrdenCompra.controls.cboHora.disabled) {
        vHora = 0;
        vMin = 0;
      }

      pTipo = 1;

      pParametro.push(this.idEmp);
      pParametro.push(vDatos.rbGerenteCostos);
      pParametro.push(vDatos.rbPDF);
      pParametro.push(vUserId);
      pParametro.push(vHora);
      pParametro.push(vMin);
      pParametro.push(vDia);
      pParametro.push(vMes);
      pParametro.push(vAnio);
      pParametro.push(vDatos.cbRango);

    } else {

      if (vDatos.fechaInicio == null || vDatos.fechaInicio == "" || vDatos.fechaFin == null || vDatos.fechaFin == "" || vDatos.nusuario == null || vDatos.nusuario == "") {
        Swal.fire('¡Verificar!', 'Seleccione un rango de Fecha y un Cliente', 'warning')
        return;
      } else {
        this.formOrdenCompra.controls.rbPDF.setValue(1);
        pTipo = 2;

        let fechaInicio = vDatos.fechaInicio.getDate() + "/" + (("0" + (vDatos.fechaInicio.getMonth() + 1)).slice(-2)) + "/" + vDatos.fechaInicio.getFullYear();
        let fechaFin = vDatos.fechaFin.getDate() + "/" + (("0" + (vDatos.fechaFin.getMonth() + 1)).slice(-2)) + "/" + vDatos.fechaFin.getFullYear();

        pParametro.push(this.idEmp);
        pParametro.push(vDatos.rbGerenteCostos);
        pParametro.push(vDatos.rbPDF);
        pParametro.push(vUserId);
        pParametro.push(vHora);
        pParametro.push(vMin);
        pParametro.push(vDia);
        pParametro.push(vMes);
        pParametro.push(vAnio);
        pParametro.push(vDatos.cbRango);
        pParametro.push(fechaInicio);
        pParametro.push(fechaFin);
        pParametro.push(vDatos.nusuario)

      }
    }

    //Para el usuario
    if (vDatos.rbUsuario == 0) {
      vUserId = '';
    }
    if (vDatos.rbUsuario == 1) {
      if (vDatos.cboUsuario == null || vDatos.cboUsuario == '') {
        Swal.fire('¡Verificar!', 'Seleccione un usuario', 'warning')
        return;
      }
      vUserId = vDatos.cboUsuario;

    }

    this.spinner.show();

    var pEntidad = 1; //Cabecera
    var pOpcion = 2;  //CRUD -> Listar

    //var pTipo = 1;       //Listar todos los registros de la tabla

    this.vCompraService.fnOrdenCompraInforme(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lOrdenCompra = res;
        if (this.lOrdenCompra.length == 0) {
          Swal.fire('¡Verificar!', 'No se encontraron registros', 'warning')
          const ordencompra = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k));

          this.nMostrar = 0;
          this.dataSource = new MatTableDataSource(ordencompra);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
        if (this.lOrdenCompra.length > 0) {
          const ordencompra = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k));

          this.nMostrar = 1;
          this.dataSource = new MatTableDataSource(ordencompra);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          if (vDatos.cbRango) {

            this.pParametro = []
            res.forEach(element => {
              this.pParametro.push(element.nIdGastoCosto);
            });

          }

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

  async fnDescargarArchivosExcel(pEntidad: number, pOpcion: number, pTipo: number, pParametro: any, seDescargaFacturas: boolean) {
    const resp = await this.vCompraService.fnDescargarExcelOrdenCompra(this.lOrdenCompra, this.url, this.nEmpresa, pEntidad, pOpcion, pTipo, pParametro, seDescargaFacturas)

    // Descarga de Zip con PDF
    if(seDescargaFacturas){
      // Descargar el Excel
      const data = resp.rutaAzure;
      var link = document.createElement('a');
      link.href = data;
      // Trigger de descarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return resp.response;
    }
    // Descarga del excel solamente
    else{
      // Descargar el Excel
      const data = resp;
      const fileName = `Factura Orden de Compra.xlsx`;
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(data, fileName);
        return;
      }
      const objectUrl = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      // Trigger de descarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return {objectUrl, fileName}
    }
  }


  fnDescargarArchivos(pEntidad: number, pOpcion: number, pTipo: number, nEmpresa: string, pParametro: any) {
    this.vCompraService.fnDescargarArchivo(pEntidad, pOpcion, pTipo, nEmpresa, this.url, pParametro).subscribe((resp) => {

      const data = resp.rutaAzure;
      var link = document.createElement('a');
      link.href = data;
      // Trigger de descarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    });
  }

  async fnDescargarExcel() {

    if (this.lOrdenCompra.length > 0) {

      // Si se selecciona la descarga de facturas de las ordenes de compra
      if (this.formOrdenCompra.controls.cbRango.value) {

        const fechaInicio = moment(this.formOrdenCompra.get("fechaInicio").value).format("DD/MM/YYYY");
        const fechaFin = moment(this.formOrdenCompra.get("fechaFin").value).format("DD/MM/YYYY");

        Swal.fire({
          title: '¿Desea descargar el Excel y las facturas adjuntas?',
          text: "Se descargaran las facturas comprendidas entre el " + fechaInicio + " y el " + fechaFin,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            this.spinner.show();
            // Descargar Excel y archivos
            const respuesta = await this.fnDescargarArchivosExcel(1, 2, 4, this.pParametro, true);

            // Descargar Archivos
            // this.fnDescargarArchivos(1, 2, 4, this.nEmpresa, this.pParametro);
            Swal.fire({
              icon: 'success',
              title: 'Correcto',
              text: respuesta + ". También se descargaron sus archivos correspondientes",
              showConfirmButton: false,
              timer: 4000
            });
            this.spinner.hide();
          }
        });
      }
      // Si no se selecciona solo descarga el Excel
      else{
        Swal.fire({
          title: '¿Desea descargar el Excel?',
          text: "Se descargará el Excel con los datos actuales de la tabla",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            this.spinner.show();
            const {objectUrl, fileName} = await this.fnDescargarArchivosExcel(1, 2, 4, this.pParametro, false);
            Swal.fire({
              title: 'El Excel ha sido generado',
              html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
              icon: 'success',
              showCloseButton: true,
            })
            this.spinner.hide();
          }
        });
      }

    } else {
      Swal.fire('¡Verificar!', 'No se encontraron registros', 'warning')
    }

  }

  fnCambiarUsuario(opcion: number) {

    if (opcion == 0) {
      this.formOrdenCompra.controls.cboUsuario.disable();
    }
    if (opcion == 1) {
      this.formOrdenCompra.controls.cboUsuario.enable();
    }
  }

  fnCambiarDias(mes: string) {
    let vMes = +mes;
    this.lDia = [];
    if (vMes == 2) {
      for (var i = 1; i <= 29; i++) {
        this.lDia.push(i.toString().length == 1 ? ('0' + i) : (i.toString()))
      }
      return;
    }
    else {
      for (var i = 1; i <= 31; i++) {
        this.lDia.push(i.toString().length == 1 ? ('0' + i) : (i.toString()))
      }
      return;
    }
  }

  fncbMes() {
    if (this.formOrdenCompra.controls.cbMes.value == true) {
      this.formOrdenCompra.controls.cboMes.enable();
      this.formOrdenCompra.controls.cbDia.enable();
    }
    if (this.formOrdenCompra.controls.cbMes.value == false) {
      this.formOrdenCompra.controls.cbDia.setValue(false);
      this.formOrdenCompra.controls.cbHora.setValue(false);
      this.formOrdenCompra.controls.cboMes.disable();
      this.formOrdenCompra.controls.cbDia.disable();
      this.formOrdenCompra.controls.cboDia.disable();
      this.formOrdenCompra.controls.cbHora.disable();
      this.formOrdenCompra.controls.cboHora.disable();
      this.formOrdenCompra.controls.cboMinuto.disable();
    }
  }

  fnRangoFecha(): void {

    // Ya que se esta intentando descargar los que tengan archivos PDF en un rango, limpiamos
    this.lOrdenCompra = [];
    this.dataSource = new MatTableDataSource(this.lOrdenCompra);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.nMostrar = 0;

    if (this.formOrdenCompra.controls.cbRango.value == true) {

      this.formOrdenCompra.controls.cboAnio.disable();
      this.formOrdenCompra.controls.cboMes.disable();
      this.formOrdenCompra.controls.cbDia.disable();
      this.formOrdenCompra.controls.cbDia.setValue(false);
      this.formOrdenCompra.controls.cbHora.setValue(false);
      this.formOrdenCompra.controls.cboMes.disable();
      this.formOrdenCompra.controls.cbDia.disable();
      this.formOrdenCompra.controls.cboDia.disable();
      this.formOrdenCompra.controls.cbHora.disable();
      this.formOrdenCompra.controls.cboHora.disable();
      this.formOrdenCompra.controls.cboMinuto.disable();
      this.formOrdenCompra.controls.fechaFin.enable();
      this.formOrdenCompra.controls.fechaInicio.enable();
      this.formOrdenCompra.controls.rbPDF.setValue(1);
      this.formOrdenCompra.controls.cbMes.disable();
      this.formOrdenCompra.controls.nusuario.enable();
    }

    else if (this.formOrdenCompra.controls.cbRango.value == false) {
      this.formOrdenCompra.controls.cboAnio.enable();
      this.formOrdenCompra.controls.fechaFin.disable();
      this.formOrdenCompra.controls.fechaInicio.disable();
      this.formOrdenCompra.controls.cbMes.enable();
      this.formOrdenCompra.controls.nusuario.disable();
    }
  }

  fncbDia() {
    if (this.formOrdenCompra.controls.cbDia.value == true) {
      this.formOrdenCompra.controls.cboDia.enable();
      this.formOrdenCompra.controls.cbHora.enable();
    }
    if (this.formOrdenCompra.controls.cbDia.value == false) {
      this.formOrdenCompra.controls.cbHora.setValue(false);
      this.formOrdenCompra.controls.cboDia.disable();
      this.formOrdenCompra.controls.cbHora.disable();
      this.formOrdenCompra.controls.cboHora.disable();
      this.formOrdenCompra.controls.cboMinuto.disable();
    }
  }

  fncbHora() {
    if (this.formOrdenCompra.controls.cbHora.value == true) {
      this.formOrdenCompra.controls.cboHora.enable();
      this.formOrdenCompra.controls.cboMinuto.enable();
    }
    if (this.formOrdenCompra.controls.cbHora.value == false) {
      this.formOrdenCompra.controls.cboHora.disable();
      this.formOrdenCompra.controls.cboMinuto.disable();
    }
  }

}
