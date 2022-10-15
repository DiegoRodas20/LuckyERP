
import { Injectable, Inject } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { ParametroProcedureInterface } from '../../control-costos/datobasico/interfaces/parametroProcedure';
@Injectable({
  providedIn: "root",
})
export class TransporteService {
  private myUrlReporte: string;
  constructor(private http: HttpClient,@Inject('BASE_URL') baseUrl: string) { 
    this.myUrlReporte = baseUrl + 'ErpLogisticaController/';
  }

  fnEmpresaTransporte(
    pEntidad: number,
    pOpcion: number,
    pParametro: any,
    pTipo: number,
    url: string
  ): Observable<any> {
    const urlEndpoint = url + "ErpLogisticaController/empresaTransporte";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
      pTipo: pTipo,
    };

    return this.http.post(urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
    });
  }

  fnTarifaMovilidad(
    pEntidad: number,
    pOpcion: number,
    pParametro: any,
    pTipo: number,
    url: string
  ): Observable<any> {
    const urlEndpoint = url + "ErpLogisticaController/tarifarioMovilidad";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
      pTipo: pTipo,
    };

    return this.http.post(urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
    });
  }

  //#region Armado de Rutas
  ArmadoRuta(
    pEntidad: number,
    pOpcion: number,
    pTipo: number,
    pParametro: any
  ): Observable<any> {
    const urlEndpoint =
      environment.BASE_URL + "ErpLogisticaController/ArmadoRutas";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
      pTipo: pTipo,
    };

    return this.http.post(urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
    });
  }
  //#endregion

  //#region Armado de Rutas
  fnArmadoRuta(pEntidad: number, pOpcion: number, pTipo: number, pParametro?: string, pParametroDet?: string): Observable<any> {
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const url = this.myUrlReporte + 'ArmadoRutas';
    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro,
      pTipo: pTipo,
      pParametroDet: pParametroDet
    };
    return this.http.post(url, JSON.stringify(params), { headers: httpHeaders });
  }
  //#endregion

  /* #region Ajuste Congelado */
  fnAjusteCongelado(pEntidad: number, pOpcion: number, pParametro: string, pTipo: number): Observable<any> {
    const urlEndpoint = environment.BASE_URL + "ErpLogisticaController/AjusteCongelado";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro,
      pTipo: pTipo,
    };
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }
  /* #endregion */

  /* #region Liquidacion Transporte */
  fnLiquidacionTransporte(pEntidad: number, pOpcion: number, pParametro: string, pTipo: number, pParametroDet?: string): Observable<any> {
    const urlEndpoint = environment.BASE_URL + "ErpLogisticaController/LiquidacionTransporte";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro,
      pTipo: pTipo,
      pParametroDet: pParametroDet
    };
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }
  /* #endregion */

  /* #region Factura Transporte */
  fnFacturaTransporte(pEntidad: number, pOpcion: number, pParametro: string, pTipo: number, pParametroDet?: string): Observable<any> {
    const urlEndpoint = environment.BASE_URL + "ErpLogisticaController/FacturaTransporte";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro,
      pTipo: pTipo,
      pParametroDet: pParametroDet
    };
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }
  /* #endregion */

  /* #region  Descarga de archivo */
  fnDownloadExcel(pEntidad: number, pOpcion: number, pParametro: string): Observable<Blob> {
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const responseType = 'blob' as 'json';
    const url = this.myUrlReporte + 'ArmadoRutas';
    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro,
    };
    return this.http.post<Blob>(url, JSON.stringify(params), { headers: httpHeaders, responseType: responseType });
  }
  /* #endregion */
  
  listarOpcionesReporteTransporte(tipo: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 1,
      pTipo: tipo,
      pOpcion: 1,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlReporte + 'ReporteTransporte';
    return this.http.post(url,parametro).toPromise();
  }

  generarReporteTransporteExcel(tipo: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 1,
      pTipo: tipo,
      pOpcion: 2,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlReporte + 'ReporteTransporte';
    return this.http.post(url,parametro).toPromise();
  }
}
