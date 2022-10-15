import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GestioncService {
  urlBase = '';

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
      this.urlBase = baseUrl;
  }

  async _loadSP(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetGestionContrato';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pOpcion: pOpcion,
        pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _crudGC(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetCrudGC';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
