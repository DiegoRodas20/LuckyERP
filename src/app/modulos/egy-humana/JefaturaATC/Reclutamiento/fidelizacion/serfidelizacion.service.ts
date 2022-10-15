import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject  } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 

@Injectable({
  providedIn: 'root'
})
export class SerfidelizacionService {

  constructor(private http: HttpClient) { }
  
  fnReclutamientoCrud(pOpcion: string, pParametro: any, url: string): Observable<any> {

    const urlEndpoint = url + 'AtraccionTalentoService/Reclutamiento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = { 
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

  async fnReclutamiento(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AtraccionTalentoService/Reclutamiento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnDownload(file: string, type: string, url: string): Observable<any> {
    const urlEndpoint = url + 'AtraccionTalentoService/dowloandFiles';

    const params = '?filename=' + file + '&type=' + type;

    return this.http.get(urlEndpoint + params, { responseType: "blob" });
  }
  
  fnDescargarExcelReporteFidelizacion(pOpcion: number, pParametro: any, url: string): Observable<any> {
    const urlEndpoint = url + 'AtraccionTalentoService/RPFidEnviadoExcel';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const params = '?pOpcion=' + pOpcion + '&pParametro=' + pParametro.join('|') ; 
 
    return this.http.get(urlEndpoint+ params, { headers: httpHeaders, responseType: 'blob'});
  }

}
