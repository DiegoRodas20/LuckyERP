import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CustomResponse } from 'src/app/modulos/AAHelpers';
import { BoletaDevengueDto, PersonalDto } from '../Model/Iboletap';

@Injectable({
  providedIn: 'root'
})
export class BoletaspService {
  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_EyGH') baseUrl: string) {
    this.urlBase = baseUrl + 'BoletaPago';
  }

  async getInfoWorker(nCodUser: number) {
    try {
      const params = new HttpParams().set('nCodUser', JSON.stringify(nCodUser));
      const res = await this.http.get<CustomResponse<PersonalDto>>(`${this.urlBase}/GetInfoWorker`, { params }).toPromise();
      return res;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async getFileBoleta(sFileBoleta: string) {
    try {
      const responseType = 'blob' as 'json';
      const params = new HttpParams().set('sFileBoleta', sFileBoleta);
      const res = await this.http.get<Blob>(`${this.urlBase}/GetFileBoleta`, { params, responseType },).toPromise();
      return res;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async insertView(nId: number, nIdUser: number, sIdPais: string) {
    try {
      const params = {
        nIdDevPer: nId,
        nIdUser: nIdUser,
        sIdPais: sIdPais
      };
      const res = await this.http.post<CustomResponse<Boolean>>(`${this.urlBase}/InsertView`, params).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async downloadFile(sNroDocumento: string, lst: BoletaDevengueDto[]) {

    const files = lst.map(item => {
      const file = { sMes: item.sMes, nAnio: item.nAnio, sFileBoleta: item.sFileBoleta }
      return file;
    });

    const params = {
      sNroDocumento: sNroDocumento,
      files: files
    };
    return await this.http.post(`${this.urlBase}/GetCompressedFile`, params, { responseType: 'blob' }).toPromise();
  }

  // async _loadSP(pOpcion: number, pParametro: any) {
  //   const urlEndPoint = this.urlBase + 'AdminPersonalService/GetBoletaPago';
  //   const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  //   const params = {
  //     pOpcion: pOpcion,
  //     pParametro: pParametro.join('|')
  //   };

  //   return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  // }

  // async print(pOpcion: number, pParametro: any) {
  //   // debugger;

  //   const urlEndPoint = this.urlBase + 'AdminPersonalService/GetBoletaPago';
  //   const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  //   const params = {
  //     pOpcion: pOpcion,
  //     pParametro: pParametro.join('|')
  //   };
  //   return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' }).toPromise();
  // }

  // async _crudBP(pOpcion: number, pParametro: any) {
  //   const urlEndPoint = this.urlBase + 'AdminPersonalService/GetCrudBP';
  //   const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  //   const params = {
  //     pOpcion: pOpcion,
  //     pParametro: pParametro.join('|')
  //   };

  //   return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  // }
}
