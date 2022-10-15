import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class Oauth2Service {

  constructor(
    private http: HttpClient
  ) { }

  fnAuthenticate(pOpcion: number, pParametro: any, url: string): Observable<any> {

    const urlEndpoint = url + 'api/oautherp';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = { 
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    } 
    

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }
}
