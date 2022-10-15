
import { Component, Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ParametroProcedureInterface } from '../datobasico/interfaces/parametroProcedure';
import { PresCierre, PresCierreExport } from './cierre-masivo/cierre-masivo.component';

@Injectable({
  providedIn: 'root'
})
export class PresupuestosService {

  private myUrlAprobacion: string;
  private urlInformeGasto: string;
  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.myUrlAprobacion = baseUrl + 'ErpPresupuestoAprobacion/';
    this.urlInformeGasto = baseUrl + 'ErpController/';
  }

  fnPresupuesto2(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string) {
    const urlEndPoint = url + 'ErpController/Factura';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    };

    return this.http.post<any>(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  //Funcion para las Facturas de Presupuesto
  fnPresupuesto(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, detalle: any, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/Factura';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    //console.log(detalle)

    if (detalle == 0) {

      const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo,
        ListDetalle: detalle

      }

      return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
    }
    else {
      const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo,
        oDetalle: detalle

      }
      return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })

    }


    //.pipe(map((response) => response));
  }

  //Funcion para actalizar el margen de resguardo General de cada ppto cliente
  fnMargenGeneral(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string) {
    const urlEndPoint = url + 'ErpController/ResguardoGeneral';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    };
    // console.log(params)
    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })//.toPromise();
  }

  fnCierreMasivo(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/CierreMasivo';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnDescargarExcelCierreMasivo(lista: PresCierre[], url: string, nEmpresa: string): Observable<any> {

    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const urlEndpoint = url + 'ErpController/DescargarExcelCierreMasivo';

    let listaExport: PresCierreExport[] = []
    lista.forEach(item => {
      listaExport.push({
        Codigo: item.sCodCC,
        Descripcion: item.sDesc,
        RUC_Cliente: item.sRUC,
        Cliente: item.sCliente,
        Servicio: item.sServicio,
        Ejecutivo_1: item.sEjecutivo,
        Director_General: item.sDirector,
      })
    });

    const params = {
      lista: listaExport,
      nEmpresa: nEmpresa
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });

  }

  fnVisorAsistencia(pEntidad: string, pOpcion: string, pParametro: any, pTipo: string, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/visorAsistencia';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  // Aprobacion de documentos
  listarDocumentosParaAprobacion(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    /*
      1: Obtenemos la lista de los documentos para la tabla
      2: Obtenemos la cabecera de un documento
      3: Obtenemos los detalles de un documento
      4: Obtenemos la lista de estados
    */
    parametro = {
      pEntidad: 1,
      pTipo: 1,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'presupuestoAprobacion';
    return this.http.post(url, parametro).toPromise();
  }

  actualizarDocumentoAprobar(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    /*
      1: Actualizar Presupuesto
    */
    parametro = {
      pEntidad: 1,
      pTipo: 2,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'presupuestoAprobacion';
    return this.http.post(url, parametro).toPromise();
  }

  /////////////////////////// FUNCIONES DE RQ INFORME

  gestionRQInforme(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/RQInforme';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  ////////////// Informe Gasto /////////////////////////
  obtenerInformacionInformeGasto(tipo: number, pParametro: string): Promise<any[]> {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 1,
      pOpcion: 1,
      pTipo: tipo,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.urlInformeGasto + 'informeGasto';
    return this.http.post<any[]>(url, parametro).toPromise();
  }

  fnGenerarExcelInformeGasto(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Promise<any> {
    const urlEndpoint = url + 'ErpController/informeGasto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const responseType = 'blob' as 'json';

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post<any>(urlEndpoint, JSON.stringify(params), { headers: httpHeaders, responseType: responseType  }).toPromise();
  }

  gafsaenerarExcelInformeGasto(tipo: number, pParametro: string): Promise<any[]> {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 1,
      pOpcion: 2,
      pTipo: tipo,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.urlInformeGasto + 'informeGasto';
    return this.http.post<any[]>(url, parametro).toPromise();
  }

  ////////////// Reporte Presupuestos Estados /////////////////////////
  fnPresupuestosEstados(pOpcion: number, pParametro: any, url: string): Observable<any> {

    const urlEndpoint = url + 'ErpController/RPEstado';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnDescargarExcelReportePresupuestoEstado(pOpcion: number, pParametro: any, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/RPEstadoExcel';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const params = '?pOpcion=' + pOpcion + '&pParametro=' + pParametro.join('|') ;

    return this.http.get(urlEndpoint+ params, { headers: httpHeaders, responseType: 'blob'});
  }

   ////////////// Reporte Presupuestos Partidas Saldos /////////////////////////
   fnPresupuestoReporte(pOpcion: number, pParametro: any, url: string): Observable<any> {

    const urlEndpoint = url + 'ErpController/RPPartidasSaldos';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnDescargarExcelReportePresupuesto(pOpcion: number, pParametro: any, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/RPPartidasSaldosExcel';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const params = '?pOpcion=' + pOpcion + '&pParametro=' + pParametro.join('|') ;

    return this.http.get(urlEndpoint+ params, { headers: httpHeaders, responseType: 'blob'});
  }

     ////////////// Informe Personal de Staff /////////////////////////
     fnInformePersonalStaff(pOpcion: number, pParametro: any, url: string): Observable<any> {

      const urlEndpoint = url + 'ErpController/RPPersonalStaff';
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = {
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
      }
      return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
    }

    fnInformePersonalStaffExcel(pOpcion: number, pParametro: any, url: string): Observable<any> {
      const urlEndpoint = url + 'ErpController/RPPersonalStaffExcel';
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const params = '?pOpcion=' + pOpcion + '&pParametro=' + pParametro.join('|') ;

      return this.http.get(urlEndpoint+ params, { headers: httpHeaders, responseType: 'blob'});
    }
}
