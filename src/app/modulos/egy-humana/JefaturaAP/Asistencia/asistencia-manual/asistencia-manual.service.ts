import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class AsistenciaManualService {
  urlBase = '';

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
      this.urlBase = baseUrl;
  }

  async _loadSP(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetAsistenciaManual';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _crudAM(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetCrudAM';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _loadDevengue(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetControlAsistenciap';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pOpcion: pOpcion,
        pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _loadCiudad(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetControlSubsidio';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }


}



interface IListaCompareAFP{
  sNroOrden: number;
  nIdTipoDoc: number;
  sTipoDocumento: string;
  sDocumento: string;
  sApePa: string;
  sApeMa: string;
  sNombres: string;
  sCodPlla: string;
  sFec_Ingreso: string;
}
