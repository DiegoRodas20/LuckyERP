import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MantenimientosService {

  constructor(private http: HttpClient) { }

  fnMantenimientoPres(pEntidad: string, pOpcion: string, pParametro: any, pTipo: string, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/mantenimientoPresupuesto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    
    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }
}
