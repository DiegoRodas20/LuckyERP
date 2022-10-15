import { Injectable, Inject } from '@angular/core';
import { Observable, BehaviorSubject  } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private http: HttpClient) {}


  fnUsuario(pOpcion: number, pParametro: any, url: string): Observable<any> {

    const urlEndpoint = url + 'MantenimientoService/GetUsuarioCrud';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = { 
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    } 
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

  
}
