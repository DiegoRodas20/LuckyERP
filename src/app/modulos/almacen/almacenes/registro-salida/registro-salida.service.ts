import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegistroSalidaService {

  constructor(private http: HttpClient) { }

  fnRegistroSalida(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, pParametroDet: any, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpLogisticaSalida/registroSalida';
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
}
