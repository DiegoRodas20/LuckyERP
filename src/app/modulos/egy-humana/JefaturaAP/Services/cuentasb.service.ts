import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class CuentasbService {
  constructor(private http: HttpClient) {}

  async _loadSP(pOpcion: number, pParametro: any, url: string): Promise<any> {
    const urlEndPoint = url + "AdminPersonalService/GetCuentasBanco";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _crudCB(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + "AdminPersonalService/GetCrudCB";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _excel(
    pOpcion: number,
    { empresaId, listaPersonal, bancoId }: any,
    url: string
  ) {
    const urlEndPoint = url + "AdminPersonalService/excel_export";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      empresaId: empresaId,
      bancoId: bancoId,
      listaPersonal: listaPersonal,
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
    const urlEndPoint = url + "AdminPersonalService/UploadFile";
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

  async _importExcel(
    urlFileExcelBlobStorage: string,
    url: string,
    bancoId: number,
    tipoCuentaId: number,
    empresaId: number
  ) {
    const urlEndPoint = url + "AdminPersonalService/excel_import";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      urlFile: urlFileExcelBlobStorage,
      bancoId,
      tipoCuentaId,
      empresaId,
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _eliminarExcel(urlExcel: string, tipo: string, url: string) {
    const urlEndPoint = url + "AdminPersonalService/DeleteFile";
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
}
