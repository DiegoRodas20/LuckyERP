import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RentabilidadPresupuestoService {
  constructor(private http: HttpClient) { }


  fnReporteRentabilidad(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpPresupuestoRentabilidad/reporteRentabilidad';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo,
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

  fnDescargarExcel(pTipo: number, pParametro: any, url: string) {

    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const responseType = 'blob' as 'json';

    let request = {
      pEntidad: 1,
      pTipo: pTipo,
      pOpcion: 3,
      pParametro: pParametro.join('|'),
    };

    const urlEndpoint = url + 'ErpPresupuestoRentabilidad/reporteRentabilidad';
    return this.http.post<Blob>(urlEndpoint, request, { headers: httpHeaders, responseType: responseType }).toPromise();
  }

  fnDescargarExcelRentabilidadIndividual(pTipo: number, pParametro: any, url: string) {
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const responseType = 'blob' as 'json';

    let request = {
      pEntidad: 1,
      pTipo: pTipo,
      pOpcion: 4,
      pParametro: pParametro.join('|'),
    };
    const urlEndpoint = url + 'ErpPresupuestoRentabilidad/reporteRentabilidad';
    return this.http.post<Blob>(urlEndpoint, request, { headers: httpHeaders, responseType: responseType }).toPromise();
  }

  fnDescargarExcel7Niveles(pTipo: number, pParametro: any, url: string) {

    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const responseType = 'blob' as 'json';

    let request = {
      pEntidad: 2,
      pTipo: pTipo,
      pOpcion: 3,
      pParametro: pParametro.join('|'),
    };

    const urlEndpoint = url + 'ErpPresupuestoRentabilidad/reporteRentabilidad';
    return this.http.post<Blob>(urlEndpoint, request, { headers: httpHeaders, responseType: responseType }).toPromise();
  }

  fnDescargarExcelProrrateo(pTipo: number, pParametro: any, url: string) {

    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const responseType = 'blob' as 'json';

    let request = {
      pEntidad: 3,
      pTipo: pTipo,
      pOpcion: 1,
      pParametro: pParametro.join('|'),
    };

    const urlEndpoint = url + 'ErpPresupuestoRentabilidad/reporteRentabilidad';
    return this.http.post<Blob>(urlEndpoint, request, { headers: httpHeaders, responseType: responseType }).toPromise();
  }
}

