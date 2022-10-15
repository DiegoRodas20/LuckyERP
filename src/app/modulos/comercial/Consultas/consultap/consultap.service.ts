import { Injectable, Inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ParametroProcedureInterface } from '../../../control-costos/datobasico/interfaces/parametroProcedure';

@Injectable({
    providedIn: 'root'
})

export class ConsultapService {
    private urlConsultaGasto: string;
    constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
        this.urlConsultaGasto = baseUrl + 'ComercialService/';
    }

    async _loadSP(pOpcion: number, pParametro: any, url: string) {
        const urlEndPoint = url + 'AdminComercialService/GetConsultaPersonal';
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

        const params = {
            pOpcion: pOpcion,
            pParametro: pParametro.join('|')
        };

        return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
    }

    obtenerReporte(tipo: number, pParametro: string) {
        let parametro: ParametroProcedureInterface;
        parametro = {
            pEntidad: 1,
            pOpcion: 1,
            pTipo: tipo,
            pParametro: pParametro,
            pParametroDet: ''
        }
        const url = this.urlConsultaGasto + 'CatalogoConsulta';
        return this.http.post<any[]>(url,parametro).toPromise();
    }

}
