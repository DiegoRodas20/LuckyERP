import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CustomResponse, ISelectItem, SecurityErp } from 'src/app/modulos/AAHelpers';
import { Esquema, EsquemaAfpNetDto, EsquemaAfpNetFilter, Ubigeo } from '../Model/esquemas';
import moment from 'moment';
import { fil } from 'date-fns/locale';




@Injectable({
  providedIn: 'root'
})

export class EsquemasService {
  storageData: SecurityErp = new SecurityErp();
  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_EyGH') baseUrl: string) {
    this.urlBase = baseUrl + 'Esquema';
  }

  async GetSearchEsquemaAfpNet(filter: EsquemaAfpNetFilter) {
    try {
      const params = new HttpParams()
        .set('dFechaDesde', filter.dFechaDesde)
        .set('dFechaHasta', filter.dFechaHasta)
        .set('sRegPensionarios', filter.sRegPensionarios)
        .set('nCodUser', JSON.stringify(filter.nCodUser))
        .set('sIdPais', filter.sIdPais)
        .set('nIdEmpresa', JSON.stringify(filter.nIdEmpresa));
      const res = await this.http.get<CustomResponse<EsquemaAfpNetDto[]>>(`${this.urlBase}/GetSearchEsquemaAfpNet`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetSearchEsquemaInfoPersonal(filter: Esquema.InfoPersonalFilter) {
    try {
      const params = new HttpParams()
        .set('sIdPais', this.storageData.getPais())
        .set('nIdEmpresa', this.storageData.getEmpresa());
      const res = await this.http.get<CustomResponse<Esquema.InfoPersonalDto[]>>(`${this.urlBase}/GetSearchInfoPersonal`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async getAllItems(nroEsquema: number, nNumero: number, nTipo?: number) {
    try {
      const params = new HttpParams()
        .set('nroEsquema', JSON.stringify(nroEsquema))
        .set('nNumero', JSON.stringify(nNumero))
        .set('sIdPais', this.storageData.getPais())
        .set('nIdEmpresa', this.storageData.getEmpresa())
        .set('nTipo', JSON.stringify(nTipo ?? 0));
      const res = await this.http.get<CustomResponse<ISelectItem[]>>(`${this.urlBase}/GetAllItems`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllUbigeo() {
    try {
      const res = await this.http.get<CustomResponse<Ubigeo.DepaDto[]>>(`${this.urlBase}/GetAllUbigeo/${this.storageData.getPais()}`).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
}