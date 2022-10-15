import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WebApiResponse } from "../models/general/apiResponse";
import { RegistroVentaDto } from "../models/registro-venta/registroVentaDto";
import { REGISTROVENTA_URL } from "../utils/url_constants";

@Injectable({
    providedIn: 'root'
})

export class RegistroVentasService {

    constructor(private http: HttpClient) { }


    getRegistrosVenta(idEmpresa: number, fechaInicio: string, fechaFin: string) {

        const url = `${REGISTROVENTA_URL}/RegistroVenta?idEmpresa=${idEmpresa}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`

        return this.http.get<WebApiResponse<RegistroVentaDto[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    GetRegistrosVentaXLS(idEmpresa: number, fechaInicio: string, fechaFin: string) {

        const url = `${REGISTROVENTA_URL}/XLSRegistroVenta?idEmpresa=${idEmpresa}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`

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