import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ParametroProcedureInterface } from '../../control-costos/datobasico/interfaces/parametroProcedure';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class PptoReporteContratoService {

    private urlReporteContrato: string;

    constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
        this.urlReporteContrato = baseUrl + 'PptoReporteContratoController/';
    }

    obtenerInformacionLegal(tipo: number, pParametro: string): Promise<any> {
        let parametro: ParametroProcedureInterface;
        parametro = {
            pEntidad: 1,
            pOpcion: 1,
            pTipo: tipo,
            pParametro: pParametro,
            pParametroDet: ''
        };
        const url = this.urlReporteContrato + 'contratoLegal';
        return this.http.post<any>(url, parametro).toPromise();
    }

    insertOrUpdateContrato(tipo: number, pParametro: string): Promise<any> {
        let parametro: ParametroProcedureInterface;
        parametro = {
            pEntidad: 1,
            pOpcion: 2,
            pTipo: tipo,
            pParametro: pParametro,
            pParametroDet: ''
        };
        const url = this.urlReporteContrato + 'contratoLegal';
        return this.http.post<any>(url, parametro).toPromise();
    }

    generarReporteContrato(tipo: number, pParametro: string): Observable<any> {

        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        let parametro: ParametroProcedureInterface;
        parametro = {
            pEntidad: 1,
            pOpcion: 3,
            pTipo: tipo,
            pParametro: pParametro,
            pParametroDet: ''
        };
        console.log(JSON.stringify(parametro));
        const url = this.urlReporteContrato + 'ReporteContratoExcel';
        const params = '?pEntidad=' + 1 + '&pOpcion=' + 3 + '&pTipo=' + tipo + '&pParametro=' + pParametro;
        return this.http.get(url + params, { headers: httpHeaders, responseType: 'blob' })
    }


}
