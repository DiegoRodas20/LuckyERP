import { Injectable, Inject } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class GestionapService {
  constructor(private http: HttpClient) {}

  async _loadSP(pOpcion: number, pParametro: any, url: string): Promise<any> {
    const urlEndPoint = url + "AdminComercialService/GetGestionAsistenciap";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _crudGA(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + "AdminComercialService/GetCrudGA";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }
}
