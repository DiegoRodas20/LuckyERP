import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ControlvService {

  urlBase = '';

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.urlBase = baseUrl;
  }

  async _loadCombo(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetControlContrato';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pOpcion: pOpcion,
        pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _loadSP(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetControlVacacion';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _crudCV(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetCrudCV';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async print(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminPersonalService/GetControlVacacion';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pOpcion: pOpcion,
        pParametro: pParametro.join('|')
    };
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' }).toPromise();
  }

async _getDatosQRControlV(pOpcion: number, pParametro: any) {
  // console.log(url);
  const urlEndPoint =  this.urlBase + 'AdminPersonalService/getDatosQRControlV';
  const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  const params = {
    pOpcion: pOpcion,
    pParametro: pParametro.join('|')
  };

  return await this.http.post(urlEndPoint, JSON.stringify(params),{ headers: httpHeaders } ).toPromise();
}

async _loadDevengue(pOpcion: number, pParametro: any) {
  const urlEndPoint = this.urlBase + 'AdminPersonalService/GetControlAsistenciap';
  const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
  };

  return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
}


async _loadTodoPersonal(pOpcion: number, pParametro: any) {
  const urlEndPoint = this.urlBase + 'AdminPersonalService/GetControlContrato';
  const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
  };

  return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
}


}

