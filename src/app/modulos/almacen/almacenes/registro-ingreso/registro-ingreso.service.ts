import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegistroIngresoService {

  constructor(private http: HttpClient) { }

  fnRegistroIngreso(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, pParametroDet: any, pParametroUbicacion: string, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpLogisticaIngreso/registroIngreso';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo,
      pParametroDet: pParametroDet ?? '',
      pParametroUbicacion: pParametroUbicacion ?? ''
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

  fnListarAnio(url: string) {
    const urlEndpoint = url + 'ErpLogisticaIngreso/registroIngreso';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: 1,
      pOpcion: 2,
      pParametro: '',
      pTipo: 26,
      pParametroDet: '',
      pParametroUbicacion: ''
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }
}
