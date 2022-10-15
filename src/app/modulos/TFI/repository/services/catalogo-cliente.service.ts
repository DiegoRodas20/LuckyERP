import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CatalogoClienteDto, DireccionCliente, Marca, MarcaCliente, NegocioActividad, TipoContribuyente, TipoDocumentoIdentidad, TipoEntidad, Ubigeo } from "../models/catalogo-cliente/catalogoClienteDto";
import { WebApiResponse } from "../models/general/apiResponse";
import { ValorRetorno } from "../models/general/parametros";
import { CATALOGOCLIENTE_URL } from "../utils/url_constants";

@Injectable({
    providedIn: 'root'
})

export class CatalogoClienteService {

    constructor(private http: HttpClient) { }

    getCatalogoClientes(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/CatalogoCliente?${param}`

        return this.http.get<WebApiResponse<CatalogoClienteDto[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getTiposEntidad(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/TipoEntidad?${param}`

        return this.http.get<WebApiResponse<TipoEntidad[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getTiposContribuyente(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/TipoContribuyente?${param}`

        return this.http.get<WebApiResponse<TipoContribuyente[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getTiposDocumentoIdentidad(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/TipoDocumentoIdentidad?${param}`

        return this.http.get<WebApiResponse<TipoDocumentoIdentidad[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getNegociosActividad(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/NegocioActividad?${param}`

        return this.http.get<WebApiResponse<NegocioActividad[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getUbigeo(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/Ubigeo?${param}`

        return this.http.get<WebApiResponse<Ubigeo[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getAreaTrabajo(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/AreaTrabajo?${param}`

        return this.http.get<WebApiResponse<ValorRetorno[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    InsertCliente(data: any) {

        const url = `${CATALOGOCLIENTE_URL}/InsertCliente`

        return this.http.post<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getClientexID(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/ClientexID?${param}`

        return this.http.get<WebApiResponse<CatalogoClienteDto[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    UpdateCliente(data: any) {

        const url = `${CATALOGOCLIENTE_URL}/UpdateCliente`

        return this.http.put<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });

    }

    UpdateEstadoCliente(data: any) {

        const url = `${CATALOGOCLIENTE_URL}/UpdateEstadoCliente`

        return this.http.put<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });

    }

    getDireccionesCliente(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/DireccionCliente?${param}`

        return this.http.get<WebApiResponse<DireccionCliente[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    InsertDireccionCliente(data: any) {

        const url = `${CATALOGOCLIENTE_URL}/InsertDireccionCliente`

        return this.http.post<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getDireccionxID(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/DireccionxID?${param}`

        return this.http.get<WebApiResponse<DireccionCliente[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    UpdateDireccionCliente(data: any) {

        const url = `${CATALOGOCLIENTE_URL}/UpdateDireccionCliente`

        return this.http.put<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });

    }

    UpdateEstadoDireccionCliente(data: any) {

        const url = `${CATALOGOCLIENTE_URL}/UpdateEstadoDireccionCliente`

        return this.http.put<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });

    }

    getMarcas(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/Marca?${param}`

        return this.http.get<WebApiResponse<Marca[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getMarcasCliente(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/MarcaCliente?${param}`

        return this.http.get<WebApiResponse<MarcaCliente[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    InsertMarcaCliente(data: any) {

        const url = `${CATALOGOCLIENTE_URL}/InsertMarcaCliente`

        return this.http.post<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    UpdateEstadoMarcaCliente(data: any) {

        const url = `${CATALOGOCLIENTE_URL}/UpdateEstadoMarcaCliente`

        return this.http.put<WebApiResponse<ValorRetorno[]>>(url, data,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });

    }

    ValidarRuc(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/ValidarRuc?${param}`

        return this.http.get<WebApiResponse<ValorRetorno[]>>(url,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    ValidarRazonSocial(param: string) {

        const url = `${CATALOGOCLIENTE_URL}/ValidarRazonSocial?${param}`

        return this.http.get<WebApiResponse<ValorRetorno[]>>(url,
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