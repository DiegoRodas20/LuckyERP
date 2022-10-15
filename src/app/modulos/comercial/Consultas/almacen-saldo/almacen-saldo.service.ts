import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlmacenSaldoService {

  constructor(private http: HttpClient) { }

  //#region Service Almacen Saldo
  fnAlmacenSaldo(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string) {
    const urlEndpoint = url + 'ErpComercialAlmacenSaldo/almacen_saldo';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }

    return this.http.post<any>(urlEndpoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnAlmacenSaldoExcel(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string) {
    const urlEndpoint = url + 'ErpComercialAlmacenSaldo/almacen_saldo/descargarExcel';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const responseType = 'blob' as 'json';

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo,
      nEmpresa: pParametro[0]
    }

    return this.http.post<Blob>(urlEndpoint, JSON.stringify(params), { headers: httpHeaders, responseType: responseType  }).toPromise();
  }
  //#endregion
}
