import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegistroTrasladoService {

  constructor(private http: HttpClient) { }

  fnRegistroTraslado(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, pParametroDet: any, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpLogisticaTraslado/registroTraslado';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo,
      pParametroDet: pParametroDet ?? ''
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

  fnListarTotales(url: string, nIdArticulo: number, nCantidad: number): Observable<any> {
    const urlEndpoint = url + 'ErpLogisticaTraslado/registroTraslado';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    //funcion para listar totales de un articulo en base a su 
    const params = {
      pEntidad: 1,
      pOpcion: 2,
      pParametro: nIdArticulo + '|' + nCantidad,
      pTipo: 19,
      pParametroDet: ''
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }
}
