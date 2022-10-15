import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ControlemService {
  urlBase = "";

  constructor(private http: HttpClient, @Inject("BASE_URL") baseUrl: string) {
    this.urlBase = baseUrl;
  }

  async _loadSP(pOpcion: number, pParametro: any) {
    const urlEndPoint =
      this.urlBase + "AdminPersonalService/GetControlExamenMedico";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _crudEM(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/GetCrudCEM";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _uploadFile(file: any, nArea: number, sName: string, sTipo: string) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/UploadFile";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      File: file,
      Tipo: sTipo,
      Area: nArea,
      FileName: sName,
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _deleteFile(nombreConExtencion: string, nArea: number, sTipo: string) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/DeleteFile";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      File: nombreConExtencion,
      Tipo: sTipo,
      Area: nArea,
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }
}
