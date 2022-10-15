import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Numerador, SerieExp, TipoDocumentoFacturacion } from "../models/exp-registro-ventas/expRegistroVentaDto";
import { WebApiResponse } from "../models/general/apiResponse";
import { Mes } from "../models/objetivos-facturacion/objetivoFacturacionDto";
import { Anio } from "../models/ppto-pendiente-facturar/pptoPendienteFacturarDto";
import { EXPREGISTROVENTA_URL } from "../utils/url_constants";

@Injectable({
    providedIn: 'root'
})

export class ExpRegistroVentasService {

    constructor(private http: HttpClient) { }

    getAnios(idEmpresa: number) {

        const url = `${EXPREGISTROVENTA_URL}/Anio?idEmpresa=${idEmpresa}`

        return this.http.get<WebApiResponse<Anio[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getMeses(anio: number,idEmpresa: number) { 
        
        const url = `${EXPREGISTROVENTA_URL}/Mes?anio=${anio}&idEmpresa=${idEmpresa}`

        return this.http.get<WebApiResponse<Mes[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getTiposDocumentoFacturacion(anio: number, mes: number ,idEmpresa:number) {

        const url = `${EXPREGISTROVENTA_URL}/TipoDocumentoFacturacion?anio=${anio}&mes=${mes}&idEmpresa=${idEmpresa}`

        return this.http.get<WebApiResponse<TipoDocumentoFacturacion[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getSeriesExp(idEmpresa: number,idTipoDocumento: number, anio: number, mes: number) {

        const url = `${EXPREGISTROVENTA_URL}/SerieExp?idEmpresa=${idEmpresa}&idTipoDocumento=${idTipoDocumento}&anio=${anio}&mes=${mes}`

        return this.http.get<WebApiResponse<SerieExp[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getNumeradores(idEmpresa: number,idTipoDocumento: number, idSerie:number, anio: number, mes: number) {

        const url = `${EXPREGISTROVENTA_URL}/Numerador?idEmpresa=${idEmpresa}&idTipoDocumento=${idTipoDocumento}&idSerie=${idSerie}&anio=${anio}&mes=${mes}`

        return this.http.get<WebApiResponse<Numerador[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    GetExpRegistrosVentaXLS(idEmpresa: number,anio: number,mes: number,tipoDocumento: number,serie: number,numeradorInicial: string,numeradorFinal: string,correlativo: number) {

        const url = `${EXPREGISTROVENTA_URL}/XLSExpRegistroVenta?idEmpresa=${idEmpresa}&anio=${anio}&mes=${mes}&idTipoDocumento=${tipoDocumento}&idSerie=${serie}&numeradorInicial=${numeradorInicial}&numeradorFinal=${numeradorFinal}&correlativo=${correlativo}`

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