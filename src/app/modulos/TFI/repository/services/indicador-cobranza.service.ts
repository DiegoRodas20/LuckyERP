import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WebApiResponse } from "../models/general/apiResponse";
import { IndicadorCobranzaDto } from "../models/indicador-cobranza/indicadorCobranzaDto";
import { Anio } from "../models/ppto-pendiente-facturar/pptoPendienteFacturarDto";
import { INDICADORCOBRANZA_URL } from "../utils/url_constants";

@Injectable({
    providedIn: 'root'
})

export class IndicadorCobranzaService {

    constructor(private http: HttpClient) { }

    getAnios(idEmpresa: number) {

        const url = `${INDICADORCOBRANZA_URL}/Anio?idEmpresa=${idEmpresa}`

        return this.http.get<WebApiResponse<Anio[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getIndicadoresCobranza(anio: number, idEmpresa: number) {

        const url = `${INDICADORCOBRANZA_URL}/IndicadorCobranza?anio=${anio}&idEmpresa=${idEmpresa}`

        return this.http.get<WebApiResponse<IndicadorCobranzaDto[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    GetIndicadoresCobranzaXLS(anio: number, idEmpresa: number) {

        const url = `${INDICADORCOBRANZA_URL}/XLSIndicadorCobranza?anio=${anio}&idEmpresa=${idEmpresa}`

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