import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RepostitoryService {

  constructor(private http: HttpClient) { }

  GetAllEmpresa(pOpcion: number, pParametro: any) {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    }
    return this.http.post(environment.BASE_URL + 'MantenimientoService/Empresa', JSON.stringify(params), { headers: httpHeaders });
  }

  GetAllPersonal(pOpcion: number, pParametro: any) {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    }
    return this.http.post(environment.BASE_URL + 'MantenimientoService/Personal', JSON.stringify(params), { headers: httpHeaders });
  }

  GetByUser(pOpcion: number, pParametro: any) {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    }
    return this.http.post(environment.BASE_URL + 'MantenimientoService/Usuario', JSON.stringify(params), { headers: httpHeaders });
  }

}