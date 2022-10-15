import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ControlpaService {
  urlBase = "";

  constructor(private http: HttpClient, @Inject("BASE_URL") baseUrl: string) {
    this.urlBase = baseUrl;
  }

  async _loadSP(pOpcion: number, pParametro: any): Promise<any> {
    const urlEndPoint =
      this.urlBase + "AdminPersonalService/GetControlPrestaciona";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _crudCPA(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/GetCrudCPA";
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
