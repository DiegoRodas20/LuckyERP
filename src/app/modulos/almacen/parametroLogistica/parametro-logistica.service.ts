import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Parametro } from './models/parametro.model';
@Injectable({
  providedIn: 'root'
})
export class ParametroLogisticaService {

  constructor(private http: HttpClient) { }

  fnFamiliaArticulo(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpLogisticaController/familiaArticulo';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

  fnMatrizPermiso(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpLogisticaController/matrizPermiso';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

  fnOperacionLogistica(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpLogisticaController/operacionLogistica';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

  fnNumeradorGuia(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpLogisticaController/numeradorGuia';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

  fnParametro(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string) {
    const urlEndpoint = url + 'ErpLogisticaController/parametro';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post<any>(urlEndpoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnAlmacenUsuarioPermiso(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpLogisticaController/almacenUsuarioPermiso';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }
}
