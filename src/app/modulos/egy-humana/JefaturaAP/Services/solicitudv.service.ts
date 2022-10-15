import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SolicitudvService {

  constructor(private http: HttpClient) {}

  async _loadSP(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminPersonalService/GetSolicitudVacacion';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _crudSV(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminPersonalService/GetCrudSV';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _ConfirmarSolicitudV(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminPersonalService/GetCrudCV';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async print(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminPersonalService/GetSolicitudVacacion';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pOpcion: pOpcion,
        pParametro: pParametro.join('|')
    };
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' }).toPromise();
  }

}
