import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoElementoDto } from '../Model/controld';

@Injectable({
  providedIn: 'root'
})
export class TipoElementoService {

  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_TFI') baseUrl: string) {
    this.urlBase = baseUrl;
  }

  async GetAll(countryId: string, tableId: string) {
    try {
      const response = await this.http.get(`${this.urlBase}TiposDeElementos?countryId=${countryId}&tableId=${tableId}`, { observe: 'response' }).toPromise();
      console.log('Response Status: ', response.status);
      console.log('Response Body: ', response.body);

      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async Get(id: number) {
    try {
      const response = await this.http.get(`${this.urlBase}TiposDeElementos/${id}`, { observe: 'response' }).toPromise();
      console.log('Response Status: ', response.status);
      console.log('Response Body: ', response.body);

      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async Save(entity: TipoElementoDto) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/*+json' });

      const response = await this.http.post(`${this.urlBase}TiposDeElementos`, JSON.stringify(entity), { headers: httpHeaders, observe: 'response' }).toPromise();
      console.log('Response Status: ', response.status);
      console.log('Response Body: ', response.body);

      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async Update(id: number, entity: TipoElementoDto) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/*+json' });

      const response = await this.http.put(`${this.urlBase}TiposDeElementos/${id}`, JSON.stringify(entity), { headers: httpHeaders, observe: 'response' }).toPromise();
      console.log('Response Status: ', response.status);
      console.log('Response Body: ', response.body);

      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async Delete(id: number) {
    try {
      const response = await this.http.delete(`${this.urlBase}TiposDeElementos/${id}`, { observe: 'response' }).toPromise();
      console.log('Response Status: ', response.status);
      console.log('Response Body: ', response.body);

      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }


}