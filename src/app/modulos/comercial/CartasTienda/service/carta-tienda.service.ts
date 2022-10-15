import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class CartaTiendaService {
  private baseUrl = "";
  constructor(private http: HttpClient, @Inject("BASE_URL") baseUrl: string) {
    this.baseUrl = baseUrl + "api/carta_tienda";
    //console.log(this.baseUrl);
  }

  async crudTipoCampo(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.baseUrl + "/tipo_campo";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async crudCampo(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.baseUrl + "/campo";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async crudFormato(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.baseUrl + "/formato";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async crudFormatoCampo(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.baseUrl + "/formato_campo";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("*"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async crudCarta(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.baseUrl + "/carta";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async crudCartaFormato(pOpcion: number, pParametro: any, simbolo: any) {
    const urlEndPoint = this.baseUrl + "/carta_formato";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join(simbolo),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async crudPersonal(pOpcion: number, pParametro: any, simbolo: any) {
    const urlEndPoint = this.baseUrl + "/personal";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join(simbolo),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async crudPersonalCampo(pOpcion: number, pParametro: any, simbolo: any) {
    const urlEndPoint = this.baseUrl + "/personal_campo";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join(simbolo),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async crudCampoDesplegable(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.baseUrl + "/campo_desplegable";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async consultaRRHH(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.baseUrl + "/consulta_rrhh";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join("|"),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async combos(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.baseUrl + "/combos";
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
