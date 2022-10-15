import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { COMPROBANTE_URL, GENERICOS_URL, SERIE_URL, NOTACREDITO_URL } from "../utils/url_constants";
import { Observable } from "rxjs";
import { SerieQuery } from '../models/serieQuery.entity';
import { ComprobanteForCreation } from "../models/comprobanteForCreation.entity";
import { WebApiResponse } from "../models/general/apiResponse";
import { ICreditNotesChangeDTO, ICreditNotesDTO, ICreditNotesEditDTO } from "../models/notas-credito/creditNotesEntity";
import { BaseService } from './../../../TIL/tecnologia/api/base-service';
import { ValorRetorno } from "../models/general/parametros";

@Injectable({
  providedIn: 'root'
})

export class FacturacionService {
  constructor(private http: HttpClient) { }

  /* GET */
  get<T>(opcion: number, empresaId: any, year: string): Promise<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}/${opcion}/${empresaId}/${year}`; 
    return this.http.get<T>(url,
      {
        headers: this.getHeaders(),
        observe: 'response'
      }).toPromise();
  }

  getAllMateriales<T>(opcion: number): Observable<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}/Materiales/${opcion}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  getAllPresupuesto<T>(opcion: number, presupuesto: string, codigoEmpresa: string): Observable<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}/Presupuesto/${opcion}/${presupuesto}/${codigoEmpresa}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  getCalcularLineas<T>(opcion: number, opc: { totalPptos: number, aCuenta: number, importePorcenje: number, anadir: number }) {
    const url = `${COMPROBANTE_URL}/Presupuesto/CalculoLineas/${opcion}/${opc.totalPptos}/${opc.aCuenta}/${opc.importePorcenje}/${opc.anadir}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  getCalcularLineasVenta<T>(opcion: number, opc: { totalPptos: number, aCuenta: number, importePorcenje: number, anadir: number, valorVenta: number }) {
    const url = `${COMPROBANTE_URL}/Presupuesto/CalculoLineas/${opcion}/${opc.totalPptos}/${opc.aCuenta}/${opc.importePorcenje}/${opc.anadir}/${opc.valorVenta}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  getActualizarTotales<T>(opcion: number, opc: { totalAnadido: number, totalValorVenta: number, totalImpuesto: number, totalFinal: number }): Observable<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}/Presupuesto/ActualizarTotales/${opcion}/${opc.totalAnadido}/${opc.totalValorVenta}/${opc.totalImpuesto}/${opc.totalFinal}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  postCreateComprobante<T>(comprobante: ComprobanteForCreation): Observable<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}`
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    return this.http.post<T>(url, comprobante,
      {
        headers: headers,
        observe: 'response'
      });
  }

  getValidarNroOrden<T>(opcion: number, nOrden: string): Observable<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}/Presupuesto/ValidarNroOrden/${opcion}/${nOrden}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  getAllYearInComprobante<T>(opcion): Promise<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}/Year/${opcion}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();

  }

  getMultiAsync<T>(opcion: number, comprobanteId: number, empresaId: any): Observable<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}/multi/${opcion}/${comprobanteId}/${empresaId}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  //Servicio
  getMultiAsyncDetalle<T>(opcion: number, comprobanteId: number, empresaId: any): Observable<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}/multiDetalle/${opcion}/${comprobanteId}/${empresaId}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  getMultiAsyncDetalleMateriales<T>(opcion: number, comprobanteId: number): Observable<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}/multiDetalleMateriales/${opcion}/${comprobanteId}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }



  updateEstado<T>(body: { pOpcion: number, pParametro: string }): Promise<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}/UpdateEstado`;
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    return this.http.put<T>(url, body,
      {
        headers: headers,
        observe: 'response'
      }).toPromise();
  }

  //#region Documento
  getAllByIdDad<T>(opcion: number, parametro: string): Observable<HttpResponse<T>> {
    const url = `${GENERICOS_URL}/Documento?opcion=${opcion}&parametro=${parametro}`;
    const httpHeaders: HttpHeaders = this.getHeaders();
    return this.http.get<T>(url,
      {
        headers: httpHeaders,
        observe: 'response'
      });
  }

  getAllMoneda<T>(body: { opcion: number, tipoElemeneto: number, codigoPais: string }): Observable<HttpResponse<T>> {
    const url = `${GENERICOS_URL}/Moneda/${body.opcion}/${body.tipoElemeneto}/${body.codigoPais}`;
    return this.http.get<T>(url,
      {
        headers: this.getHeaders(),
        observe: 'response'
      });
  }

  getByIdTipoCambio<T>(body: { opcion: number, fecha: string, codigoPais: string }): Observable<HttpResponse<T>> {
    const url = `${GENERICOS_URL}/TipoCambio/${body.opcion}/${body.fecha}/${body.codigoPais}`;
    return this.http.get<T>(url,
      {
        headers: this.getHeaders(),
        observe: 'response'
      });
  }

  getAllDetraccion<T>(body: { opcion: number, tipoElemeneto: number, codigoPais: string }): Observable<HttpResponse<T>> {
    const url = `${GENERICOS_URL}/Detraccion/${body.opcion}/${body.tipoElemeneto}/${body.codigoPais}`;
    return this.http.get<T>(url,
      {
        headers: this.getHeaders(),
        observe: 'response'
      });
  }

  getAllAfectacion<T>(body: { opcion: number, tipoElemeneto: number, codigoPais: string }): Observable<HttpResponse<T>> {
    const url = `${GENERICOS_URL}/Moneda/${body.opcion}/${body.tipoElemeneto}/${body.codigoPais}`;
    return this.http.get<T>(url,
      {
        headers: this.getHeaders(),
        observe: 'response'
      });
  }

  getAllImpuesto<T>(body: { opcion: number, tipoElemeneto: number, codigoPais: string }): Observable<HttpResponse<T>> {
    const url = `${GENERICOS_URL}/Impuesto/${body.opcion}/${body.tipoElemeneto}/${body.codigoPais}`;
    return this.http.get<T>(url,
      {
        headers: this.getHeaders(),
        observe: 'response'
      });
  }

  getAllFormaPago<T>(): Observable<HttpResponse<T>> {
    const url = `${GENERICOS_URL}/FormaPago`;
    return this.http.get<T>(url,
      {
        headers: this.getHeaders(),
        observe: 'response'
      });
  }



  //#endregion

  //#region  Series
  getSerieComprobante<T>(opcion: number, parametro: any[]) {
    const param = parametro.join('%7C');
    const url = `${SERIE_URL}/ComprobanteSerie?opcion=${opcion}&parametro=${param}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    });
  }

  getNumeroSerie<T>(opcion: number, serie: SerieQuery): Observable<HttpResponse<T>> {
    const url = `${SERIE_URL}/Numerador/${opcion}`;
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
    return this.http.post<T>(url, JSON.stringify(serie), { headers: headers, observe: 'response' });
  }

  //#endregion

  //#region HistorialEstado

  getHistorialEstadoComprobante<T>(opcion: number, comprobanteId: number): Promise<HttpResponse<T>> {
    const url = `${COMPROBANTE_URL}/HistorialEstado/${opcion}/${comprobanteId}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }
  //#endregion

  //#region Notas de Credito

  getAllYearInCreditNotes<T>(): Promise<HttpResponse<T>> {
    const url = `${NOTACREDITO_URL}/Year`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  getAllListCreditNotes<T>(year: number, nIdTipoDocumento:number, dFechaInicio: any, dFechaFin: any): Promise<HttpResponse<T>> {
    let url = `${NOTACREDITO_URL}/ListCreditNotes/${year}/${nIdTipoDocumento}/${dFechaInicio}/${dFechaFin}`;

    if (dFechaInicio == '' && dFechaFin == '') {
      url = `${NOTACREDITO_URL}/ListCreditNotes/${year}/${nIdTipoDocumento}`;
    }
    else if (dFechaFin = '') {
      url = `${NOTACREDITO_URL}/ListCreditNotes/${year}/${nIdTipoDocumento}/${dFechaInicio}`;
    }
    else if (dFechaInicio == '' && dFechaFin != '') {
      url = `${NOTACREDITO_URL}/ListCreditNotes/${year}/${nIdTipoDocumento}/${dFechaFin}`;
    }


    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  getSerieCreditNotes<T>(nIdEmpresa: number, nIdTipoDocumento: number): Promise<HttpResponse<T>> {
    const url = `${NOTACREDITO_URL}/Serie/${nIdEmpresa}/${nIdTipoDocumento}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  getDocumentsCreditNotes<T>(): Promise<HttpResponse<T>> {
    const url = `${NOTACREDITO_URL}/Documents`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  getSerieDocumentCreditNotes<T>(nIdEmpresa: number, nIdTipoDocumento: number): Promise<HttpResponse<T>> {
    const url = `${NOTACREDITO_URL}/SerieDocument/${nIdEmpresa}/${nIdTipoDocumento}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  getNumberDocumentCreditNotes<T>(nIdEmpresa: number, nIdTipoDocumento: number, nIdSerie: number): Promise<HttpResponse<T>> {
    const url = `${NOTACREDITO_URL}/NumberDocument/${nIdEmpresa}/${nIdTipoDocumento}/${nIdSerie}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  getSubTypeCreditNotes<T>(): Promise<HttpResponse<T>> {
    const url = `${NOTACREDITO_URL}/SubType`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  getComprobanteCreditNotes<T>(nIdComprobante: number): Promise<HttpResponse<T>> {
    const url = `${NOTACREDITO_URL}/Comprobante/${nIdComprobante}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  getLinesComprobanteCreditNotes<T>(nIdComprobante: number, nIdTipoSerMat: number): Promise<HttpResponse<T>> {
    const url = `${NOTACREDITO_URL}/LinesComprobante/${nIdTipoSerMat}/${nIdComprobante}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  getMotiveCreditNotes<T>(nIdTipoDocumento:number): Promise<HttpResponse<T>> {
    const url = `${NOTACREDITO_URL}/Motive/${nIdTipoDocumento}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  async InsertTransaction(model: ICreditNotesDTO) {
    const url = `${NOTACREDITO_URL}/InsertTransaction`;

    
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<ICreditNotesDTO>>(
        url,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return  //this.handError<ICreditNotesDTO>(error)
    }
  }

  
  UpdateTransaction(model: ICreditNotesEditDTO) {

    const url = `${NOTACREDITO_URL}/UpdateTransaction`

    return this.http.put<WebApiResponse<ValorRetorno[]>>(url, model,
      {
        headers: this.getHeaders(),
        observe: 'response'
      });

  }


  getCreditNotesById<T>(nIdNotaCredito: number): Promise<HttpResponse<T>> {
    const url = `${NOTACREDITO_URL}/NoteById/${nIdNotaCredito}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  getHistorialCreditNotes<T>(nIdNotaCredito: number): Promise<HttpResponse<T>> {
    const url = `${NOTACREDITO_URL}/HistorialEstado/${nIdNotaCredito}`;
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      observe: 'response'
    }).toPromise();
  }

  CancelCreditNotes(model: ICreditNotesChangeDTO) {

    const url = `${NOTACREDITO_URL}/ChangeStateCreditNotes`

    return this.http.post<WebApiResponse<ValorRetorno[]>>(url, model,
      {
        headers: this.getHeaders(),
        observe: 'response'
      });

  }

  SendCreditNotes(model: ICreditNotesChangeDTO) {

    const url = `${NOTACREDITO_URL}/SendCreditNotes`

    return this.http.post<WebApiResponse<ValorRetorno[]>>(url, model,
      {
        headers: this.getHeaders(),
        observe: 'response'
      });

  }

  //#endregion

  getHeaders(): HttpHeaders {
    let httpHeaders: HttpHeaders = new HttpHeaders();
    return httpHeaders;
  }




}
