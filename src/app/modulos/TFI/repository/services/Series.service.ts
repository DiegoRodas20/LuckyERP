import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WebApiResponse } from "../models/general/apiResponse";
import { ValorRetorno } from "../models/general/parametros";

import { Empresa, NumeradorSerie, SerieDto, TipoDocumento } from "../models/series/serieDto";
import { SERIE_URL } from "../utils/url_constants";

@Injectable({
    providedIn: 'root'
})

export class SeriesService {

    constructor(private http: HttpClient) { }

    getSeries(param: string) {

        const url = `${SERIE_URL}/Serie?${param}`

        return this.http.get<WebApiResponse<SerieDto[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getEmpresas(param: string) {

        const url = `${SERIE_URL}/Empresa?${param}`

        return this.http.get<WebApiResponse<Empresa[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });

    }

    getTiposDocumento(param: string) {

        const url = `${SERIE_URL}/TipoDocumento?${param}`

        return this.http.get<WebApiResponse<TipoDocumento[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    InsertSerie(data: any) {

        const url = `${SERIE_URL}/InsertSerie`

        return this.http.post<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getSeriexID(param: string) {

        const url = `${SERIE_URL}/SeriexID?${param}`

        return this.http.get<WebApiResponse<SerieDto[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });

    }

    UpdateSerie(data: any) {

        const url = `${SERIE_URL}/UpdateSerie`

        return this.http.put<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });

    }

    getNumerador(param: string) {

        const url = `${SERIE_URL}/NumeradorSerie?${param}`

        return this.http.get<WebApiResponse<NumeradorSerie[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getHeaders(): HttpHeaders {
        let httpHeaders: HttpHeaders = new HttpHeaders();
        return httpHeaders;
    }
}