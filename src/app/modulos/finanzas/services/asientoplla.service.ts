import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IMatriz } from '../Model/Iasientoplla';
import moment from 'moment';
@Injectable({
  providedIn: 'root'
})
export class AsientopllaService {

  urlBase = '';

  constructor(private http: HttpClient, @Inject('BASE_URL_FinLeg') baseUrl: string) {
    this.urlBase = baseUrl;
  }

  async cargarPlanilla(pParametro: any) {
    const urlEndPoint = this.urlBase + 'BookPayroll';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      Codigo: pParametro
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async cargarConceptos(pParametro: any) {
    const urlEndPoint = this.urlBase + 'BookPayroll/Conceptos';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      Codigo: pParametro
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async cargarTipos() {
    const urlEndPoint = this.urlBase + 'BookPayroll/Tipos';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    return await this.http.post(urlEndPoint, { headers: httpHeaders }).toPromise();
  }

  async obtenerCentroCostos(pParametro: any) {
    const urlEndPoint = this.urlBase + 'BookPayroll/CentroCosto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      Codigo: pParametro
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async cargarAsientos(pParametro: any, pParametro2: any) {
    const urlEndPoint = this.urlBase + 'BookPayroll/Asientos';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      Codigo: pParametro,
      Empresa: pParametro2
    };
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async cargarDetalles() {
    const urlEndPoint = this.urlBase + 'BookPayroll/AsientosDetalles';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    return await this.http.post(urlEndPoint, { headers: httpHeaders }).toPromise();
  }

  async cargarMatriz(pParametro: any) {
    const urlEndPoint = this.urlBase + 'BookPayroll/Matriz';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      Codigo: pParametro
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  agregarMatriz(pParametro: IMatriz): Observable<any> {

    const urlEndPoint = this.urlBase + 'BookPayroll/AgregarMatriz';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pOpcion: pParametro.accion,
      codigo: pParametro.codigo,
      codPlla: pParametro.codPlla,
      codConcepto: pParametro.codConcepto,
      tipo: pParametro.tipo,
      cuentaContable: pParametro.cuentaContable,
    }
    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders });
  }

  async cargarDevengue(pParametro: any) {
    const urlEndPoint = this.urlBase + 'BookPayroll/Devengue';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      Codigo: pParametro
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  guardarAsientoPlla(pParametro: any, pParametro2: any): Observable<any> {
    const urlEndPoint = this.urlBase + 'BookPayroll/RegistrarAsientos';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      Cabecera: pParametro,
      Detalles: pParametro2
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders });
  }

  async cargarTblAsientos(pParametro: any) {
    const urlEndPoint = this.urlBase + 'BookPayroll/TblAsientos';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      Empresa: pParametro
    };
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async cargarTblDetalles() {
    const urlEndPoint = this.urlBase + 'BookPayroll/TblAsientosDetalles';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    return await this.http.post(urlEndPoint, { headers: httpHeaders }).toPromise();
  }

  async cargarContador(pParametro: any) {
    const urlEndPoint = this.urlBase + 'BookPayroll/cargarContador';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      CodDevengue: pParametro
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async cargarConceptosSinCuenta(pParametro: any, pParametro2: any) {
    const urlEndPoint = this.urlBase + 'BookPayroll/cargarConceptosSinCuenta';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      CodDevengue: pParametro,
      Empresa: pParametro2
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  GetFileXlsx(dDevengue: Date, sCodPlla: string, sCuenta: string, nIdCentroCosto: number, nIdEmpresa: number) {
    const params = new HttpParams()
      .set('dDevengue', dDevengue ? moment(dDevengue)?.format('YYYY-MM-DD') : '')
      .set('sCodPlla', sCodPlla ? sCodPlla : '')
      .set('sCuenta', sCuenta)
      .set('nIdCentroCosto', nIdCentroCosto ? JSON.stringify(nIdCentroCosto) : '')
      .set('nIdEmpresa', JSON.stringify(nIdEmpresa));
    return this.http.get(`${this.urlBase}BookPayroll/GetFileXlsx`, { params, responseType: 'blob' });
  }
}
