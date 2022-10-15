import { Component, Inject, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RentabilidadPresupuestoService } from '../../../presupuestos/rentabilidad-reportes/rentabilidad-presupuesto.service';
import { InventarioService } from '../../../../almacen/inventario/inventario.service';
import { CompraService } from '../../compra.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { DateAdapter } from 'angular-calendar';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
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
  selector: 'app-com-oc-detallado',
  templateUrl: './com-oc-detallado.component.html',
  styleUrls: ['./com-oc-detallado.component.css'],
  animations: [asistenciapAnimations],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE,MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class ComOcDetalladoComponent implements OnInit {

  //Variables para la animación de botones laterales+
  tsLista = 'active';
  fbLista = [ // Lista de las opciones que se mostrarán
    {icon: 'article', tool: 'Generar Reporte'},
  ];
  abLista = [];
  ///////////////////////////////////
  step = 0;
  idPais: string;
  idEmpresa: string;
  listaMeses: any[];
  listaYear: any[];
  listaCliente: any;
  listaPresupuesto: any;
  listaArticulo: any;
  tipoCentroCostoCliente: boolean = false;
  url: string;
  formOrden: FormGroup;
  constructor(@Inject('BASE_URL') baseUrl: string,private spinner: NgxSpinnerService, private rentabilidadService: RentabilidadPresupuestoService,
  private inventarioService: InventarioService, private compraService: CompraService, private _snackBar: MatSnackBar,
  private fb: FormBuilder ) { 
    this.url = baseUrl;
    this.crearFormulario();
  }

  async ngOnInit() {
    this.idPais = localStorage.getItem('Pais');
    this.idEmpresa = localStorage.getItem('Empresa');
    this.onToggleFab(1,-1);
    await this.obtenerMeses();
    await this.obtenerCliente(this.idPais);
    await this.obtenerArticulo(this.idEmpresa);
    this.tipoCentroCostoCliente = true;
    let now = moment();
    this.formOrden.get('fechaInicio').setValue(now);
    this.formOrden.get('fechaFin').setValue(now);
    const tipoCentroCosto = this.formOrden.get('tipoCentroCosto').value;
    this.cambioTipoCentroCosto(tipoCentroCosto); // 
  }

  crearFormulario() {
    this.formOrden = this.fb.group({
      'tipoCentroCosto': ['2034'], // Iniciamos el formulario con presupuesto cliente
      'empresa': [null],
      'cliente': [null],
      'presupuesto': [null],
      'articulo': [null],
      'fechaInicio': [],
      'fechaFin': [],
    })
  }


  async cambioTipoCentroCosto(event) {
    console.log('EVENT',event);
    await this.obtenerPresupuesto(event);
    this.formOrden.get('presupuesto').setValue(null);

    if(event == '2034') {
      this.tipoCentroCostoCliente = true;
    }
    else if(event == '2033') {
      this.tipoCentroCostoCliente = false;
      const nombreEmpresa = localStorage.getItem('NomEmpresa');
      this.formOrden.get('empresa').setValue(nombreEmpresa);
    }
  }


  async generarReporte() {
    try {
      const empresaId = localStorage.getItem('Empresa');
      const clienteId = this.formOrden.get('cliente').value == null ? 0 : this.formOrden.get('cliente').value;
      const idCentroCosto = this.formOrden.get('presupuesto').value == null ? 0 : this.formOrden.get('presupuesto').value;
      const articuloId = this.formOrden.get('articulo').value == null ? 0 : this.formOrden.get('articulo').value;
      const valorFechaInicio: Moment = this.formOrden.get('fechaInicio').value;
      const valorFechaFin: Moment = this.formOrden.get('fechaFin').value;
      const fechaInicio = valorFechaInicio.format('yyyy-MM-DD');
      const fechaFin = valorFechaFin.format('yyyy-MM-DD');

      let param = `${empresaId}|${clienteId}|${idCentroCosto}|${articuloId}|${fechaInicio}|${fechaFin}`;
      const resp: any = await this.compraService.exportarExcelOrdenCompraDetallada(1,`${param}`);
      this.descargarExcel(resp,'Reporte Orden de Compra Detallada');
      this.spinner.hide();
    } catch (error) {
      this.spinner.hide();
      let respuesta: HttpResponse<any> = error;
      if(respuesta.status == 400) {
        Swal.fire({
          title: "El excel no contiene ningún resgistro",
          icon: 'warning',
          timer: 1500
        })
      }
    }
  }

  descargarExcel(response: any,nombreArchivo: string): void {
    // Descargar el Excel
    const data = response;
    const fileName = `${nombreArchivo}.xlsx`;
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

    Swal.fire({
      title: 'El Excel ha sido generado',
      html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
      icon: 'success',
      showCloseButton: true
    })
  }


  // ACCORDION 

  setStep(index: number) {
    this.step = index;
  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  clickFab(index: number) {
    switch(index) {
      case 0:
        this.generarReporte();
        break;
      default:
        break;
    }
  }

  // Data


  async obtenerMeses() {
    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;
    this.spinner.show();
    try {
      this.listaMeses = await this.rentabilidadService.fnReporteRentabilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.spinner.hide();
    } catch (error) {
      this.listaMeses = [];
      this.spinner.hide();
    }
  }

  async obtenerCliente(pais: string) {
    this.spinner.show();
    try {
      this.listaCliente = await this.compraService.obtenerInformacionReportOrdenDetallada(2,`${pais}`);
      
      this.spinner.hide();
    } catch (error) {
      console.error(error);
      this.spinner.hide();
    }
  }

  async obtenerArticulo(empresaId: string) {
    this.spinner.show();
    try {
      this.listaArticulo = await this.compraService.obtenerInformacionReportOrdenDetallada(3,`${empresaId}`);
      this.spinner.hide();
    } catch (error) {
      console.error(error);
      this.spinner.hide();
    }
  }

  async obtenerPresupuesto(nIdTipo: any) {
    this.spinner.show();
    try {
      this.listaPresupuesto = await this.compraService.obtenerInformacionReportOrdenDetallada(1,`${nIdTipo}`);
      this.spinner.hide();
    } catch (err) {
      let error = err as HttpErrorResponse;
      this.mostrarError(error.error);
      this.spinner.hide();
    }
  }

  mostrarError(msj: string) {
    this._snackBar.open(`Error: ${msj}`,'Close', { duration: 1500});
  }
}
