import { Injectable, Inject } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class AsistenciapService {
  constructor(private http: HttpClient) {}

  async _loadSP(pOpcion: number, pParametro: any, url: string): Promise<any> {
    const urlEndPoint = url + "AdminComercialService/GetAsistenciaPersonal";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _crudAP(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + "AdminComercialService/GetCrudAP";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _uploadFile(
    file: any,
    nArea: number,
    sName: string,
    sTipo: string,
    url: string
  ) {
    const urlEndPoint = url + "AdminComercialService/UploadFile";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      File: file,
      Area: nArea,
      FileName: sName,
      Tipo: sTipo,
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }
}
