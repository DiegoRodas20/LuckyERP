import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class KpipService {
  urlBase = '';
  urlBase2 = '';
  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string, @Inject('BASE_URL_Comercial') baseUrl2: string ) {
    this.urlBase = baseUrl;
    this.urlBase2 = baseUrl2;
  }

  async _loadSP(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminComercialService/GetKpiProvis';
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), {headers: httpHeaders}).toPromise();
  }

  async _crudKP(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminComercialService/GetCrudKP';
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), {headers: httpHeaders}).toPromise();
  }

  async _loadPersonal(nIdResp: number, sEjMes: string) {
    try {
      const response = await this.http.get(`${this.urlBase2}Provis/GetPersonalProvis?nIdResp=${nIdResp}&fecha=${sEjMes}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async _ValidarExisteCC(nIdEmp: number, sCodCC: string) {
    try {
      const response = await this.http.get(`${this.urlBase2}ValidacionesComercial/ValidarExisteCC?nIdEmp=${nIdEmp}&sCodCC=${sCodCC}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
  async _ValidarEstadoCC(nIdEmp: number, sCodCC: string) {
    try {
      const response = await this.http.get(`${this.urlBase2}ValidacionesComercial/ValidarEstadoCC?nIdEmp=${nIdEmp}&sCodCC=${sCodCC}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async _ValidarTipoCC(nIdEmp: number, sCodCC: string) {
    try {
      const response = await this.http.get(`${this.urlBase2}ValidacionesComercial/ValidarTipoCC?nIdEmp=${nIdEmp}&sCodCC=${sCodCC}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async _ValidarAprobacionCC(nIdEmp: number, sCodCC: string) {
    try {
      const response = await this.http.get(`${this.urlBase2}ValidacionesComercial/ValidarAprobacionCC?nIdEmp=${nIdEmp}&sCodCC=${sCodCC}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async _GetPersonalCC(nIdCentroCosto: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}ValidacionesComercial/GetPersonalCC?nIdCentroCosto=${nIdCentroCosto}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
}
