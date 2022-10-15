import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TipoElemento } from '../CostoEmpresa/model/tipoElemento';
import { ParamCostoEmpresa } from '../CostoEmpresa/model/paramCostoEmpresa';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CostoEmpresaService {

  urlBase = '';

  constructor(private http: HttpClient, @Inject('BASE_URL_EyGH') baseUrl: string) {
    this.urlBase = baseUrl;
  }

  async cargarCostoEmpresa(IdDevengue: string, IdEmp: number) {
    const urlEndPoint = this.urlBase + 'CostoEmpresa';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = "?IdDevengue=" + IdDevengue + "&IdEmp=" + IdEmp;
    return await this.http.get(urlEndPoint + params, { headers: httpHeaders }).toPromise();
  }

  async GetCompanyCost(accrueId: number) {
    try {
      const params = new HttpParams()
        .set('accrueId', JSON.stringify(accrueId));
      const response = await this.http.get(`${this.urlBase}CostoEmpresa/CompanyCost`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async PostInsertCompanyCost(CompanyCost: {}) {
    try {
      const response = await this.http.post(`${this.urlBase}CostoEmpresa/InsertCompanyCost`, CompanyCost).toPromise();
      return response;

    } catch (error) {
      console.log('Error Status: ', error);
    }
  }

  async cargarPlanillasCostoEmpresa(IdEmp: number) {
    const urlEndPoint = this.urlBase + 'CostoEmpresa/Planillas';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = "?IdEmp=" + IdEmp;
    return await this.http.get(urlEndPoint + params, { headers: httpHeaders }).toPromise();
  }

  async cargarPersonal(IdEmp: number) {
    const urlEndPoint = this.urlBase + 'CostoEmpresa/Personal';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = "?IdEmp=" + IdEmp;
    return await this.http.get(urlEndPoint + params, { headers: httpHeaders }).toPromise();
  }

  async cargarTipoElemento(countryId: string, tableId: number) {
    const urlEndPoint = this.urlBase + 'CeTipoElemento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = "?countryId=" + countryId + "&tableId=" + tableId;

    return await this.http.get(urlEndPoint + params, { headers: httpHeaders }).toPromise();
  }

  async agregarTipoElemento(pParametro: TipoElemento) {

    const urlEndPoint = this.urlBase + 'CeTipoElemento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      codigoId: pParametro.codigoId,
      descripcion: pParametro.descripcion,
      parametro: pParametro.parametro,
      pais: pParametro.pais,
    }
    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async actualizarTipoElemento(pParametro: TipoElemento) {

    const urlEndPoint = this.urlBase + 'CeTipoElemento/' + pParametro.codigoId;
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      codigoId: pParametro.codigoId,
      descripcion: pParametro.descripcion,
      parametro: pParametro.parametro,
      pais: pParametro.pais,
    }
    return this.http.put(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async eliminarTipoElemento(pParametro: TipoElemento) {

    const urlEndPoint = this.urlBase + 'CeTipoElemento/' + pParametro.codigoId;
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.delete(urlEndPoint, { headers: httpHeaders }).toPromise();
  }

  async cargarParamCostoEmpresa(countryId: string, tableId: number) {
    const urlEndPoint = this.urlBase + 'ParamCostoEmpresa';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = "?countryId=" + countryId + "&tableId=" + tableId;

    return await this.http.get(urlEndPoint + params, { headers: httpHeaders }).toPromise();
  }

  async cargarConceptos(countryId: string, tableId: number) {
    const urlEndPoint = this.urlBase + 'ParamCostoEmpresa/Conceptos';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = "?countryId=" + countryId + "&tableId=" + tableId;

    return await this.http.get(urlEndPoint + params, { headers: httpHeaders }).toPromise();
  }

  async cargarPlanillas() {
    const urlEndPoint = this.urlBase + 'ParamCostoEmpresa/Planillas';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return await this.http.get(urlEndPoint, { headers: httpHeaders }).toPromise();
  }


  async agregarParamCostoEmpresa(pParametro: ParamCostoEmpresa) {

    const urlEndPoint = this.urlBase + 'ParamCostoEmpresa';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      codigoId: pParametro.codigoId,
      planillaId: pParametro.planillaId,
      elementoId: pParametro.elementoId,
      porcentaje: pParametro.porcentaje,
      formula: pParametro.formula,
      concepto: pParametro.concepto
    }
    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async actualizarParamCostoEmpresa(pParametro: ParamCostoEmpresa) {

    const urlEndPoint = this.urlBase + 'ParamCostoEmpresa/' + pParametro.codigoId;
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      codigoId: pParametro.codigoId,
      planillaId: pParametro.planillaId,
      elementoId: pParametro.elementoId,
      porcentaje: pParametro.porcentaje,
      formula: pParametro.formula,
      concepto: pParametro.concepto
    }
    return this.http.put(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async eliminarParamCostoEmpresa(pParametro: ParamCostoEmpresa) {

    const urlEndPoint = this.urlBase + 'ParamCostoEmpresa/' + pParametro.codigoId;
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.delete(urlEndPoint, { headers: httpHeaders }).toPromise();
  }

  async cargarDevengue(employeeId: any) {
    const urlEndPoint = this.urlBase + 'ParamCostoEmpresa/Devengue';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = "?employeeId=" + employeeId;
    return await this.http.get(urlEndPoint + params, { headers: httpHeaders }).toPromise();
  }

  async cargarConceptosId(countryId: string, codigoId: number) {
    const urlEndPoint = this.urlBase + 'ParamCostoEmpresa/ConceptosId';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = "?countryId=" + countryId + "&codigoId=" + codigoId;

    return await this.http.get(urlEndPoint + params, { headers: httpHeaders }).toPromise();
  }

  guardarCostoEmpresa(pParametro: any, pParametro2: any): Observable<any> {
    const urlEndPoint = this.urlBase + 'CostoEmpresa/RegistrarCostoEmpresa';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      Cabecera: pParametro,
      Detalles: pParametro2
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders });
  }

  async ListarCostoEmpresa(nIdEmp: any) {
    const urlEndPoint = this.urlBase + 'CostoEmpresa/ListarCostoEmpresa';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = "?nIdEmp=" + nIdEmp;
    return await this.http.get(urlEndPoint + params , { headers: httpHeaders }).toPromise();
  }

}
