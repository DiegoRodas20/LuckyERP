import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

//import { environment } from '../../environments/environment';

@Injectable({
  providedIn: "root",
})
export class SolicitudMovilidadService {
  private baseUrl = "";
  constructor(private http: HttpClient, @Inject("BASE_URL") baseUrl: string) {
    this.baseUrl = baseUrl + "api/solicitud_movilidad";
  }

  //private baseUrl = environment.apiUrl + 'solicitud_movilidad';
  //constructor(private http: HttpClient) {}

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

  async crudSolicitudesMovilidad(
    pOpcion: number,
    pParametro: any,
    simbolo: any
  ) {
    const urlEndPoint = this.baseUrl + "/solicitudes";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join(simbolo),
    };

    //console.log(params);

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }
}
