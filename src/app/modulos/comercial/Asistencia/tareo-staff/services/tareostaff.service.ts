import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class TareoStaffService {
  constructor(private http: HttpClient) { }
  ngOnInit(): void {

  }

  fnTareoStaffService(pOpcion: number, parametro: any, url: string): Observable<any> {
    const urlEndpoint = url + 'AsistenciaService/TareoStaff';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pOpcion: pOpcion,
      pParametro: parametro.join('|')
    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

}