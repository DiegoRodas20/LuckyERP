import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OBJETIVOFACTURACION_URL } from '../utils/url_constants';
import { Cliente, ClienteGrupo, Direccion, Ejecutivo, Mes, ObjetivoEjecutivo, ObjetivoFacturacionDto, ObjetivoMensual } from '../models/objetivos-facturacion/objetivoFacturacionDto';
import { WebApiResponse } from '../models/general/apiResponse';
import { ValorRetorno } from '../models/general/parametros';

@Injectable({
    providedIn: 'root'
})

export class ObjetivosFacturacionService {

    constructor(private http: HttpClient) { }

    //#region Listas General
    getObjetivosFacturacion(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/ObjetivoFacturacion?${param}`

        return this.http.get<WebApiResponse<ObjetivoFacturacionDto[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getDireccion(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/Direccion?${param}`

        return this.http.get<WebApiResponse<Direccion[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getMeses(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/Mes?${param}`

        return this.http.get<WebApiResponse<Mes[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getClientes(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/Cliente?${param}`

        return this.http.get<WebApiResponse<Cliente[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getEjecutivos(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/Ejecutivo?${param}`

        return this.http.get<WebApiResponse<Ejecutivo[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    //#endregion

    //#region Objetivo Mensual

    getGruposMensuales(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/ObjetivoMensual?${param}`

        return this.http.get<WebApiResponse<ObjetivoMensual[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    InsertObjetivoMensual(data: any) {

        const url = `${OBJETIVOFACTURACION_URL}/InsertObjetivoMensual`

        return this.http.post<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getObjetivoMensualxID(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/ObjetivoMensualxID?${param}`

        return this.http.get<WebApiResponse<ObjetivoMensual[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    UpdateObjetivoMensual(data: any) {

        const url = `${OBJETIVOFACTURACION_URL}/UpdateObjetivoMensual`

        return this.http.put<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    DeleteObjetivoMensual(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/DeleteObjetivoMensual?${param}`

        return this.http.delete<WebApiResponse<ValorRetorno[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    //#endregion

    //#region Cliente Grupo

    getClientesGrupos(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/ClienteGrupo?${param}`

        return this.http.get<WebApiResponse<ClienteGrupo[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    InsertClienteGrupo(data: any) {

        const url = `${OBJETIVOFACTURACION_URL}/InsertClienteGrupo`

        return this.http.post<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    DeleteClienteGrupo(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/DeleteClienteGrupo?${param}`

        return this.http.delete<WebApiResponse<ValorRetorno[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    //#endregion

    //#region Objetivo Ejecutivo

    getObjetivosEjecutivo(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/ObjetivoEjecutivo?${param}`

        return this.http.get<WebApiResponse<ObjetivoEjecutivo[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    InsertObjetivoEjecutivo(data: any) {

        const url = `${OBJETIVOFACTURACION_URL}/InsertObjetivoEjecutivo`

        return this.http.post<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getObjetivoEjecutivoxID(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/GetObjetivoEjecutivoxID?${param}`

        return this.http.get<WebApiResponse<ObjetivoEjecutivo[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    UpdateObjetivoEjecutivo(data: any) {

        const url = `${OBJETIVOFACTURACION_URL}/UpdateObjetivoEjecutivo`

        return this.http.put<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    DeleteObjetivoEjecutivo(param: string) {

        const url = `${OBJETIVOFACTURACION_URL}/DeleteObjetivoEjecutivo?${param}`

        return this.http.delete<WebApiResponse<ValorRetorno[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    //#endregion

    //#region Validar Registro
    ValidarRegistro(data: any) {
        const url = `${OBJETIVOFACTURACION_URL}/ValidarRegistro`

        return this.http.post<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }
    //#endregion

    //#region Reportes XLS
    GetObjetivosMensualesExcel(param: string): Observable<any> {

        const url = `${OBJETIVOFACTURACION_URL}/XLSObjetivos?${param}`
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        return this.http.get(url,
            {
                headers: httpHeaders,
                responseType: 'blob'
            });
    }

    //#endregion

    getHeaders(): HttpHeaders {
        let httpHeaders: HttpHeaders = new HttpHeaders();
        return httpHeaders;
    }

}