import { Injectable, Inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class InformepService {
    constructor(private http: HttpClient) {}

    async _loadSP(pOpcion: number, pParametro: any, url: string) {
        const urlEndPoint = url + 'AdminComercialService/GetInformePersonal';
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

        const params = {
            pOpcion: pOpcion,
            pParametro: pParametro.join('|')
        };

        return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
    }

    async _crudIP(pOpcion: number, pParametro: any, url: string) {
        const urlEndPoint = url + 'AdminComercialService/GetCrudIP';
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

        const params = {
          pOpcion: pOpcion,
          pParametro: pParametro.join('|')
        };

        return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
    }

    async print(pOpcion: number, pParametro: any, url: string) {
        const urlEndPoint = url + 'AdminComercialService/GetInformePersonal';
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

        const params = {
            pOpcion: pOpcion,
            pParametro: pParametro.join('|')
        };
        return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' }).toPromise();
    }
}
