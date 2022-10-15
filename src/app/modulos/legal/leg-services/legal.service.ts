import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ParametroProcedureInterface } from '../../control-costos/datobasico/interfaces/parametroProcedure';

@Injectable({
  providedIn: 'root'
})
export class LegalService {

  private urlLegal : string;
  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) { 
    this.urlLegal = baseUrl + 'ErpLegal/';
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
    const url = this.urlLegal + 'contratoLegal';
    return this.http.post<any>(url,parametro).toPromise();
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
    const url = this.urlLegal + 'contratoLegal';
    return this.http.post<any>(url,parametro).toPromise();
  }

  generarReporteContrato(tipo: number, pParametro: string): Promise<any> {

    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //const responseType = 'blob' as 'json';

    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 1,
      pOpcion: 3,
      pTipo: tipo,
      pParametro: pParametro,
      pParametroDet: ''
    };
    console.log(JSON.stringify(parametro));
    const url = this.urlLegal + 'contratoLegalExcel';
    const params = '?pEntidad=' + 1 + '&pOpcion=' + 3 + '&pTipo=' + tipo + '&pParametro=' + pParametro; 
    return this.http.get(url + params, /* JSON.stringify(parametro), */ { headers: httpHeaders, responseType: 'blob' }).toPromise();
  }


}
