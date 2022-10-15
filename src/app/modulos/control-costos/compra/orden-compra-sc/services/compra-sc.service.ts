import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { RptCuentaCorriente } from "../models/reporte.entity";

@Injectable({
  providedIn: "root",
})
export class CompraScService {
  constructor(private http: HttpClient) { }


  fnDatosOrdenCompras(pOpcion: number, pParametro: any): Observable<any> {
    const urlEndpoint =
      environment.BASE_URL + "api/SolicitudCotizacionCompra/CosultaGeneral";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };
    return this.http.post(urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
    });
  }

  fnReporte(pOpcion: number, pParametro: any): Observable<any> {
    const urlEndpoint =
      environment.BASE_URL + "api/SolicitudCotizacionCompra/Reportes";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };
    return this.http.post(urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
    });
  }


  fnGuardar(pOpcion: number, pParametro: any): Observable<any> {
    const urlEndpoint =
      environment.BASE_URL + "api/SolicitudCotizacionCompra/guardar";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };
    return this.http.post(urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
    });
  }

  fnListadoComprasSc(pParametro: any): Observable<any> {
    const urlEndpoint =
      environment.BASE_URL + "api/SolicitudCotizacionCompra/listado";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      pOpcion: 15,
      pParametro: pParametro.join("|"),
    };
    return this.http.post(urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
    });
  }

  fnConsultaComprasSc(pParametro: any): Observable<any> {
    const urlEndpoint =
      environment.BASE_URL + "api/SolicitudCotizacionCompra/consultaCompraSc";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      pOpcion: 16,
      pParametro: pParametro.join("|"),
    };
    return this.http.post(urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
    });
  }

  fnConsultaDetallesComprasSc(pParametro: any): Observable<any> {
    const urlEndpoint =
      environment.BASE_URL +
      "api/SolicitudCotizacionCompra/consultaDetalleCompraSc";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      pOpcion: 17,
      pParametro: pParametro.join("|"),
    };
    return this.http.post(urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
    });
  }

  fnDescargarExcelReporteSc(pOpcion: number, pParametro: any, url: string): Observable<any>  {

    const urlEndpoint = 'https://localhost:5001/api/SolicitudCotizacionCompra/Descargar';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const params = '?pOpcion=' + pOpcion + '&pParametro=' + pParametro.join('|') ; 
 
    return this.http.get(urlEndpoint+ params, { headers: httpHeaders, responseType: 'blob'});
  }
}
