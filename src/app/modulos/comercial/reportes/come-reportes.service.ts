import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ComeReportesService {

  constructor(private http: HttpClient) {

  }

  fnReportesComercial(pOpcion: number, pParametro: any, url: string) {

    const urlEndpoint = url + 'ComercialService/ComercialReportes';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),

    };

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }


  fnDescargarReporteExcel(pOpcion: number, pParametro: any, url: string): Observable<any> {
    const urlEndpoint = url + 'ComercialService/ReportesExcel';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const params = '?pOpcion=' + pOpcion + '&pParametro=' + pParametro.join('|');

    return this.http.get(urlEndpoint + params, { headers: httpHeaders, responseType: 'blob' });
  }
}
