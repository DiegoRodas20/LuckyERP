import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ControldService {

  urlBase = '';
  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.urlBase = baseUrl;
  }

  async _loadSP(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetControlDescuento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }



  async _crudCD(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetCrudCD';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async print(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminPersonalService/GetControlDescuento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pOpcion: pOpcion,
        pParametro: pParametro.join('|')
    };
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' }).toPromise();
  }

// nuevos service

  async _uploadFile(file: any, nArea: number, sName: string, sTipo: string) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/UploadFile';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
        File: file,
        Tipo: sTipo,
        Area: nArea,
        FileName: sName
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders}).toPromise();
  }

  async _deleteFile(sName: string, sTipo: string, nArea: number) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/DeleteFile';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
        File: sName,
        Tipo: sTipo,
        Area: nArea
    };
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders}).toPromise();
  }

  async _crudDD(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetCrudDD';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _loadSPDoc(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetDigiDocumento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }
}
