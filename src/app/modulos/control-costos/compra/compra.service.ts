import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { OrdenCompraGeneradoExport } from './models/ordenCompraExport.model';
import { ListaIDGasto } from './compra-reporte/oc-generados/oc-generados.component';
import { ReporteHistoricoExport } from './models/reporteHistoricoExport.model';
import { ParametroProcedureInterface } from '../datobasico/interfaces/parametroProcedure';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  private myUrl: string;
  constructor(private http: HttpClient,@Inject('BASE_URL') baseUrl: string) { 
    this.myUrl = baseUrl + 'ErpController/';
  }

  fnDatoBasico(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string, detalle: any): Observable<any> {
    const urlEndpoint = url + 'ErpCompras/DatoBasico';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo,
      oDetalle: detalle //envio de detalle de informacion (si es que tubiera detalle)
    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnconsultarSunat(termino, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpConsultaSunat/datoBasico';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      RUC: termino
    }
    console.log(params)
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnDatosArticulo(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpointEnt = url + 'ErpCompras/ArticuloBasico';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo,
    }
    return this.http.post(urlEndpointEnt, JSON.stringify(params), { headers: httpHeaders })
  }
  fnDatosArticuloIMG(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string) {
    const urlEndpointEnt = url + 'ErpCompras/ArticuloBasico';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo,
    }
    return this.http.post(urlEndpointEnt, JSON.stringify(params), { headers: httpHeaders })
  }


  fnDatosBasicosCompras(pEntidad: string, pOpcion: string, pParametro: any, pTipo: string, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpCompras/datosBasicoCompras';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnDatosOrdenCompras(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpCompras/datosOrdenCompras';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo,

    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }
  fnDatosOrdenComprasDet(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string, pDetalle: any): Observable<any> {
    const urlEndpoint = url + 'ErpCompras/datosOrdenCompras';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo,
      oDetalle: pDetalle
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnOrdenCompraInforme(pEntidad: string, pOpcion: string, pParametro: any, pTipo: string, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpCompras/informeOrdenCompra';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnOrdenCompraHistorialEstados(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Promise<any> {
    const urlEndpoint = url + 'ErpCompras/datosOrdenCompras';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnDescargarArchivo(pEntidad: number, pOpcion: number, pTipo: number, nEmpresa: string, url: string, pParametro: any): Observable<any> {
    const urlEndpoint = url + 'ErpCompras/descargarArchivos';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pTipo: pTipo,
      nEmpresa: nEmpresa,
      pParametro: pParametro.join(',')
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnDescargarExcelOrdenCompra(lista: any[], url: string, nEmpresa: string, pEntidad: number, pOpcion: number, pTipo: number, pParametro: any, seDescargaFacturas: boolean): Promise<any> {

    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const urlEndpoint = url + 'ErpCompras/DescargarExcelOrden/';

    let listaExport: OrdenCompraGeneradoExport[] = []
    lista.forEach(ordenCompra => {
      listaExport.push({
        Fecha_Envio: ordenCompra.sFechaEnvio,
        Centro_Costo: ordenCompra.sCentroCosto,
        Documento: ordenCompra.sDocumento,
        Titulo_OC: ordenCompra.sTituloOC,
        Tipo_OC: ordenCompra.sTipoOC,
        Codigo_Cliente: ordenCompra.sCodigoCliente,
        Cliente: ordenCompra.sDescCliente,
        Comprador: ordenCompra.sDescComprador,
        Proveedor: ordenCompra.sDescProveedor,
        Solicitante: ordenCompra.sDescSolicitante,
        Fecha_Creado: ordenCompra.sFechaCreado,
        Fecha_Modificado: ordenCompra.sFechaModificado,
        Estado: ordenCompra.sEstado,
        Moneda: ordenCompra.sTipoMoneda,
        Total: ordenCompra.nTotal,
        Factura: ordenCompra.sDescFactura,
        Fecha_Factura: ordenCompra.sFechaFactura,
        Factura_Limite: ordenCompra.sFacturaLimite,
        Factura_Documento: ordenCompra.sFacturaDocumento,
        VB_GerenteDoc: ordenCompra.sVBGerenteDoc,
      })
    });

    let params;

    // Metodo de descarga ZIP con Azure
    if(seDescargaFacturas){
      params = {
        lista: listaExport,
        nEmpresa: nEmpresa,
        bas: {
          pEntidad: pEntidad,
          pOpcion: pOpcion,
          pTipo: pTipo,
          nEmpresa: nEmpresa,
          pParametro: pParametro.join(',')
        }
      }
      return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
    }
    // Nuevo metodo de descarga del Excel (Con blob)
    else{

      const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
      const responseType = 'blob' as 'json';

      params = {
        lista: listaExport,
        nEmpresa: nEmpresa,
        bas: null
      }
      return this.http.post<Blob>(urlEndpoint, JSON.stringify(params), { headers: httpHeaders, responseType: responseType }).toPromise();
    }
  }

  async exportAsExcelFile(json: any[], excelFileName: string) {
    let vLista = []
    json.forEach(ordenCompra => {
      vLista.push({
        'Fecha envio': ordenCompra.sFechaEnvio,
        'Centro de Costo': ordenCompra.sCentroCosto,
        'Documento': ordenCompra.sDocumento,
        'Titulo OC': ordenCompra.sTituloOC,
        'Tipo OC': ordenCompra.sTipoOC,
        'Cod. Cliente': ordenCompra.sCodigoCliente,
        'Cliente': ordenCompra.sDescCliente,
        'Comprador': ordenCompra.sDescComprador,
        'Proveedor': ordenCompra.sDescProveedor,
        'Solicitante': ordenCompra.sDescSolicitante,
        'Fecha creado': ordenCompra.sFechaCreado,
        'Fecha mod.': ordenCompra.sFechaModificado,
        'Estado': ordenCompra.sEstado,
        'Moneda': ordenCompra.sTipoMoneda,
        'Total': ordenCompra.nTotal,
        'Factura': ordenCompra.sDescFactura,
        'Fecha Fact.': ordenCompra.sFechaFactura,
        'Limite Fact.': ordenCompra.sFacturaLimite,
        'Doc. Fact.': ordenCompra.sFacturaDocumento,
        'VB. Gerente.': ordenCompra.sVBGerenteDoc,
      })
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(vLista);
    const workbook: XLSX.WorkBook = { Sheets: { 'Informe': worksheet }, SheetNames: ['Informe'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);

  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_Excel_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  //Reporte de Precios Historico Servicios

  fnCompraReporteHistorico(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpCompras/informeComprasReporte';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnDescargarExcelReporteHistorico(lista: any[], url: string, nEmpresa: string): Observable<any> {

    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const urlEndpoint = url + 'ErpCompras/DescargarExcelRpPrecios/';
    let listaExport: ReporteHistoricoExport[] = []
    lista.forEach(reporteHistorico => {
      listaExport.push({
        // fechaOc: reporteHistorico.fechaOc,
        // nCantidad: reporteHistorico.nCantidad,
        // nIdArticulo: reporteHistorico.nIdArticulo,
        // nIdProveedor: reporteHistorico.nIdProveedor,
        // nPrecio: reporteHistorico.nPrecio,
        // nroOC: reporteHistorico.nroOC,
        // sCentroCosto: reporteHistorico.sCentroCosto,
        // sCodArticulo: reporteHistorico.sCodArticulo,
        // sNombreProducto: reporteHistorico.sNombreProducto,
        // sRazonSocial: reporteHistorico.sRazonSocial,
        // sRuc: reporteHistorico.sRuc,
        // sTipoDoc: reporteHistorico.sTipoDoc
        Fecha: reporteHistorico.fechaOc,
        Ppto_Costo: reporteHistorico.sCentroCosto,
        Doc: reporteHistorico.sTipoDoc,
        NroOC: reporteHistorico.nroOC,
        Proveedor: reporteHistorico.sRuc,
        RazonSocial: reporteHistorico.sRazonSocial,
        Articulo: reporteHistorico.sCodArticulo,
        ArticuloNombre: reporteHistorico.sNombreProducto,
        Cantidad: reporteHistorico.nCantidad,
        Precio: reporteHistorico.nPrecio
      })
    });

    const params = {
      lista: listaExport,
      nEmpresa: nEmpresa
    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

  ////#region  Exportal Excel
  exportarExcelCatologoArticulo(pParametro: any,url: string ): Promise<any> {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const responseType = 'blob' as 'json';
    const params = {
      pEntidad: 0,
      pOpcion: 1,
      pParametro: pParametro.join('|'),
      pTipo: 1,
    }
    const urlEndpointEnt = url + 'ErpCompras/ArticuloBasico';
    return this.http.post(urlEndpointEnt, JSON.stringify(params), { headers: httpHeaders, responseType: responseType}).toPromise();
   }

   //#region Orden Detallada
  obtenerInformacionReportOrdenDetallada(pTipo: number, pParametro: string)
  {
    let body = {
      pEntidad: 1,
      pTipo: pTipo,
      pOpcion: 1,
      pParametro: pParametro
    };
    const url = this.myUrl + 'ReportOrden';
    return this.http.post(url, body).toPromise();
  }

  exportarExcelOrdenCompraDetallada(pTipo: number,pParametro: string) {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const responseType = 'blob' as 'json';
    const params = {
      pEntidad: 1,
      pOpcion: 2,
      pParametro: pParametro,
      pTipo: pTipo,
    }
    const url = this.myUrl + 'ReportOrden';
    return this.http.post(url, params, { headers: httpHeaders, responseType: responseType}).toPromise();
  }

   //#endregion


}


