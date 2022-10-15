import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { TransporteService } from '../../../transporte.service';
import * as moment from 'moment';
import { Moment } from 'moment';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
    
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}


@Component({
  selector: 'app-log-gasto-courier',
  templateUrl: './log-gasto-courier.component.html',
  styleUrls: ['./log-gasto-courier.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE,MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class LogGastoCourierComponent implements OnInit {

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  formGastos: FormGroup;
  listaEmpresa: any;
  listaCliente: any;
  listaPresupuesto: any;
  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vTransporteService: TransporteService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  async ngOnInit() {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formGastos = this.formBuilder.group({
      cboEmpresa: [''],
      rgTipoTraslado: [0],
      cboCliente: [null],
      cboPresupuesto: [null],
      cboFechaInicio: [''],
      cboFechaFin: [''],
    });
    this.obtenerCliente(this.pPais);
    this.obtenerEmpresa(this.pPais);
    this.inicializarEmpresa(this.idEmp);
    this.inicializarFechas();
  }

  async inicializarEmpresa(idEmpresa: string) {
    const empresaId = Number.parseInt(idEmpresa);
    this.formGastos.controls.cboEmpresa.setValue(empresaId);
    await this.obtenerListaPresupuesto(empresaId);
  }

  inicializarFechas() {
    let now: Moment = moment();
    this.formGastos.controls.cboFechaInicio.setValue(now);
    this.formGastos.controls.cboFechaFin.setValue(now);
  }

  generarReporteTrasnporteFactura() {
    this.spinner.show();
    Swal.fire({
      title: '¿Desea ver el reporte con más detalle?',
      showDenyButton: true,
      showCancelButton: true,
      icon: 'question',
      confirmButtonText: `Si, más detalle`,
      denyButtonText: `No, menos detalle`,
      denyButtonColor: `#D24B4C`,
      cancelButtonText: `Cancelar`
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.generarExcelReporteTransporteFactura();
      } else if (result.isDenied) {
        await this.generarExcelReporteTransporteFacturaReducido();
      }
    })
    this.spinner.hide();
  }

  async generarExcelReportePresupuestoMovil() {
    Swal.fire({
      title: '¿Desea generar el reporte?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Aceptar`,
      cancelButtonText: `Cancelar`
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        let valorFechaInicio: Moment = this.formGastos.get('cboFechaInicio').value;
        let valorFechaFin: Moment = this.formGastos.get('cboFechaFin').value;
        const fechaInicio = valorFechaInicio.format('yyyy-MM-DD');
        const fechaFin = valorFechaFin.format('yyyy-MM-DD');
        const parametro = `${this.pPais}|${fechaInicio}|${fechaFin}`;
        const response: any = await this.vTransporteService.generarReporteTransporteExcel(5,parametro);
        this.descargarExcel(response);
        this.spinner.hide();
      } 
    })
  }

  async generarExcelReporteTransporteFactura() {
    
    const cboEmpresa = this.formGastos.get('cboEmpresa').value;
    const rgTipoTraslado = this.formGastos.get('rgTipoTraslado').value;
    const cboCliente = this.formGastos.get('cboCliente').value === null ? '0' : this.formGastos.get('cboCliente').value;
    const cboPresupuesto = this.formGastos.get('cboPresupuesto').value === null ? '0' : this.formGastos.get('cboPresupuesto').value;
    let valorFechaInicio: Moment = this.formGastos.get('cboFechaInicio').value;
    let valorFechaFin: Moment = this.formGastos.get('cboFechaFin').value;
    const fechaInicio = valorFechaInicio.format('yyyy-MM-DD');
    const fechaFin = valorFechaFin.format('yyyy-MM-DD');
    const parametro = `${cboEmpresa}|${cboCliente}|${cboPresupuesto}|${fechaInicio}|${fechaFin}|${rgTipoTraslado}`;
    const response: any = await this.vTransporteService.generarReporteTransporteExcel(2,parametro);
    this.descargarExcel(response);
  }

  async generarExcelReporteTransporteFacturaReducido() {
    const cboEmpresa = this.formGastos.get('cboEmpresa').value;
    const rgTipoTraslado = this.formGastos.get('rgTipoTraslado').value;
    const cboCliente = this.formGastos.get('cboCliente').value === null ? '0' : this.formGastos.get('cboCliente').value;
    const cboPresupuesto = this.formGastos.get('cboPresupuesto').value === null ? '0' : this.formGastos.get('cboPresupuesto').value;
    let valorFechaInicio: Moment = this.formGastos.get('cboFechaInicio').value;
    let valorFechaFin: Moment = this.formGastos.get('cboFechaFin').value;
    const fechaInicio = valorFechaInicio.format('yyyy-MM-DD');
    const fechaFin = valorFechaFin.format('yyyy-MM-DD');

    const parametro = `${cboEmpresa}|${cboCliente}|${cboPresupuesto}|${fechaInicio}|${fechaFin}|${rgTipoTraslado}`;
    const response: any = await this.vTransporteService.generarReporteTransporteExcel(3,parametro);
    this.descargarExcel(response);
  }

  async generarExcelReporteLiquidacion() {
    Swal.fire({
      title: '¿Desea generar el reporte?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Aceptar`,
      cancelButtonText: `Cancelar`
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const cboEmpresa = this.formGastos.get('cboEmpresa').value;
        let valorFechaInicio: Moment = this.formGastos.get('cboFechaInicio').value;
        let valorFechaFin: Moment = this.formGastos.get('cboFechaFin').value;
        const fechaInicio = valorFechaInicio.format('yyyy-MM-DD');
        const fechaFin = valorFechaFin.format('yyyy-MM-DD');
        const parametro = `${cboEmpresa}|${fechaInicio}|${fechaFin}`;
        const response: any = await this.vTransporteService.generarReporteTransporteExcel(4,parametro);
        this.descargarExcel(response);
        this.spinner.hide();
      } 
    })
    
  }

  descargarExcel(response: any) {
    if(response === 0) {
      return Swal.fire({
        title: 'No se encuentran registros en el excel',
        icon: 'warning',
        timer: 1500
      })
    } else {
      // Descargar el Excel
      const data = response.filename;
      var link = document.createElement('a');
      link.href = data;
      // Trigger de descarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  
      Swal.fire({
        title: 'El Excel ha sido generado',
        html: `Si su descarga no ha comenzado, puede descargarlo <a href='${response.filename}' download>aquí</a>`,
        icon: 'success',
        showCloseButton: true
      })
    }
  }
  

  async cambioEmpresa(empresaId) {
    this.formGastos.controls.cboPresupuesto.setValue(null);
    await this.obtenerListaPresupuesto(empresaId);
  }


  async obtenerCliente(idPais: string) {
    this.listaCliente = await this.vTransporteService.listarOpcionesReporteTransporte(1,`${idPais}`);
  }

  async obtenerEmpresa(idPais: string) {
    this.listaEmpresa = await this.vTransporteService.listarOpcionesReporteTransporte(3,`${idPais}`);
  }

  async obtenerListaPresupuesto(idEmpresa: number) {
    this.listaPresupuesto = await this.vTransporteService.listarOpcionesReporteTransporte(4,`${idEmpresa}`);
  }

}
