import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WebApiResponse } from "../models/general/apiResponse";
import { Anio, PptoPendienteFacturarDto } from "../models/ppto-pendiente-facturar/pptoPendienteFacturarDto";
import { PPTOPENDIENTEFACTURAR_URL } from "../utils/url_constants";

@Injectable({
    providedIn: 'root'
})

export class PptoPendienteFacturarService {

    constructor(private http: HttpClient) { }

    getAnios(param: string) {

        const url = `${PPTOPENDIENTEFACTURAR_URL}/Anio?idEmpresa=${param}`

        return this.http.get<WebApiResponse<Anio[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getPresupuestoPendienteFacturar(anio: number, idEmpresa: number) {

        const url = `${PPTOPENDIENTEFACTURAR_URL}/PresupuestoPendienteFacturar?anio=${anio}&idEmpresa=${idEmpresa}`

        return this.http.get<WebApiResponse<PptoPendienteFacturarDto[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    GetPresupuestoPendienteFacturarXLS(anio: number, idEmpresa: number) {

        const url = `${PPTOPENDIENTEFACTURAR_URL}/XLSPptoPendienteFacturar?anio=${anio}&idEmpresa=${idEmpresa}`
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