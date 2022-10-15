import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AtcMatrizPuestoRfbService {

  constructor(private http: HttpClient) { }

  async fnMatrizPuestoRFB(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AtraccionTalentoService/DatosBasicos/PuestoReqFunBen';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }
}
