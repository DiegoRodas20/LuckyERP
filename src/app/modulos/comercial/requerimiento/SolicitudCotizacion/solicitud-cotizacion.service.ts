import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudCotizacionService {
  private baseUrl = '';

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl + 'api/solicitud_cotizacion';
  }

  public crudSolicitudCotizacion(pOpcion: number, pParametro: any, simbolo: any): Observable<any> {
    const urlEndPoint = this.baseUrl + '/cotizaciones';
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join(simbolo)
    };
    return this.http.post(urlEndPoint, JSON.stringify(params), {headers: httpHeaders});
  }
}
