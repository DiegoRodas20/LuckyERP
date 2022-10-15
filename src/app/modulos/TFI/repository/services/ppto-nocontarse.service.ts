import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PPTONOCONSIDERAR_URL } from '../utils/url_constants';
import { WebApiResponse } from '../models/general/apiResponse';
import { Empresa, PptoNoConsiderarDto, Presupuesto, PresupuestoxEmpresa } from '../models/ppto-nocontarse/pptoNoConsiderarDto';
import { ValorRetorno } from '../models/general/parametros';

@Injectable({
    providedIn: 'root'
})

export class PptonoContarseService {

    constructor(private http: HttpClient) { }

    getPptonoConsiderar(param: string) {

        const url = `${PPTONOCONSIDERAR_URL}/PresupuestoNoConsiderado?${param}`

        return this.http.get<WebApiResponse<PptoNoConsiderarDto[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getEmpresas(param: string) {

        const url = `${PPTONOCONSIDERAR_URL}/Empresa?${param}`

        return this.http.get<WebApiResponse<Empresa[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getPresupuestos(param: string) {

        const url = `${PPTONOCONSIDERAR_URL}/Presupuesto?${param}`

        return this.http.get<WebApiResponse<Presupuesto[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getPresupuestosxEmpresa(param: string) {

        const url = `${PPTONOCONSIDERAR_URL}/PresupuestoxEmpresa?${param}`

        return this.http.get<WebApiResponse<PresupuestoxEmpresa[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    InsertPptonoConsiderar(data: any) {

        const url = `${PPTONOCONSIDERAR_URL}/InsertPptonoConsiderar`

        return this.http.post<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    InsertPresupuestoxEmpresa(data: any) {

        const url = `${PPTONOCONSIDERAR_URL}/InsertPresupuestoxEmpresa`

        return this.http.post<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    DeletePresupuestoxEmpresa(param: any) {

        const url = `${PPTONOCONSIDERAR_URL}/DeletePresupuestoxEmpresa?${param}`

        return this.http.delete<WebApiResponse<ValorRetorno[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    ValidarEmpresaxAnio(data: any) {

        const url = `${PPTONOCONSIDERAR_URL}/ValidarEmpresaxAnio`

        return this.http.post<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    GetPresupuestosxEmpresaXLS(param: string): Observable<any> {

        const url = `${PPTONOCONSIDERAR_URL}/XLSPresupuestosxEmpresa?${param}`
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        return this.http.get(url,
            {
                headers: httpHeaders,
                responseType: 'blob'
            });
    }


    getHeaders(): HttpHeaders {
        let httpHeaders: HttpHeaders = new HttpHeaders();
        return httpHeaders;
    }



}