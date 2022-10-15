import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParametroSctrService {

  constructor(private http: HttpClient) { }

  fnUsuario(pOpcion: number, pParametro: any, url: string): Observable<any> { 

    const urlEndpoint = url + 'RequerimientoService/rqSctr';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = { 
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    } 
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }
}
