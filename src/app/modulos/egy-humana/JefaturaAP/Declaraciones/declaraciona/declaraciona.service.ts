import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class DeclaracionaService {
  urlBase = '';

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
      this.urlBase = baseUrl;
  }

  async _loadSP(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetDeclaracionA';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _crudDA(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetCrudDA';
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

  async _excel(pOpcion: number, pParametro: any ) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/excel_export_afp";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    };
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' }).toPromise();
    // return await this.http
    //   .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
    //   .toPromise();
  }

  async _excelPlla(pParametro: IListaCompareAFP[] ) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/excel_export_compare";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    // const params = {
    //   pOpcion: pOpcion,
    //   pParametro: pParametro.join('|'),
    // };
    return await this.http.post(urlEndPoint, pParametro, { headers: httpHeaders, responseType: 'blob' }).toPromise();
    // return await this.http
    //   .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
    //   .toPromise();
  }

  async _eliminarExcel(urlExcel: string, tipo: string) {
    const urlEndPoint = this.urlBase  + "AdminPersonalService/DeleteFile";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      File: urlExcel,
      Tipo: tipo,
      Area: 8,
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _uploadFile(file: any, nArea: number, sName: string, sTipo: string) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/UploadFile';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
        File: file,
        Tipo: sTipo,
        Area: nArea,
        FileName: sName
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders}).toPromise();
  }

  async _UploadFileDAComparar(param: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/UploadCompararafp';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return await this.http.post(urlEndPoint, param, { headers: httpHeaders}).toPromise();
  }

  async _loadSPDevengue(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetCalculoPeriodo';
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
