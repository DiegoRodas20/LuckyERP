import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject  } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SerevaluacionService {

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
}
