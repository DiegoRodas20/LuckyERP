import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ControldeService {

  urlBase: string = "";

  constructor(private http: HttpClient) {
  }

  get(httpParams?: any) {
    debugger

    const urlEndPoint = environment.BASE_URL_TFI + '/depositos';
    const httpHeaders: HttpHeaders = this.getHeaders();

    const params = {};

    return this.http.get(urlEndPoint,
      {
        headers: httpHeaders,
        params: httpParams,
        observe: 'response'
      });
  }

  getHeaders(): HttpHeaders {
    let httpHeaders: HttpHeaders = new HttpHeaders();
    return httpHeaders;
  }
}
