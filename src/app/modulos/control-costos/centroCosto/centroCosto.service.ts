import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { ParametroProcedureInterface } from '../datobasico/interfaces/parametroProcedure';

@Injectable({
  providedIn: 'root'
})
export class CentroCostoService {

  pPais;
  private urlInformeControlCosto: string;
  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.pPais = localStorage.getItem('Pais');
    this.urlInformeControlCosto = baseUrl + 'ErpController/';
  }

  fnCentroCosto(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/CentroCosto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    pParametro.push(this.pPais);

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnAsignacionPres(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/asignacionPresupuesto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    pParametro.push(this.pPais);

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }


  fnAsignacionPresPromise(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Promise<object> {
    const urlEndpoint = url + 'ErpController/asignacionPresupuesto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    pParametro.push(this.pPais);

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnGenerarExcelAsignaPresupuesto(tipo: number, pParametro: string): Promise<any> {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const responseType = 'blob' as 'json';

    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 2,
      pOpcion: 2,
      pTipo: tipo,
      pParametro: pParametro,
      pParametroDet: ''
    };

    const url = this.urlInformeControlCosto + 'informeGasto';
    return this.http.post<Blob>(url, JSON.stringify(parametro), { headers: httpHeaders, responseType: responseType}).toPromise();
  }

  fnCentroCosto2(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string) {
    const urlEndpoint = url + 'ErpController/CentroCosto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnCierreMes(pEntidad: string, pOpcion: string, pParametro: any, pTipo: string, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/cierreMesCentroCosto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });


    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  ////////////// Informe Control Costo /////////////////////////
  obtenerInformacionInformeControlCosto(tipo: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 2,
      pOpcion: 1,
      pTipo: tipo,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.urlInformeControlCosto + 'informeGasto';
    return this.http.post<any[]>(url, parametro).toPromise();
  }

  generarExcelInformeGasto(tipo: number, pParametro: string): Promise<any>  {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const responseType = 'blob' as 'json';
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 2,
      pOpcion: 2,
      pTipo: tipo,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.urlInformeControlCosto + 'informeGasto';
    return this.http.post<Blob>(url, JSON.stringify(parametro), { headers: httpHeaders, responseType: responseType}).toPromise();
  }
}
