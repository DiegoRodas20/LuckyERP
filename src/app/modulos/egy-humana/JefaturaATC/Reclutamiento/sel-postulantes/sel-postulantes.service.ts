import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject  } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})

export class SelPostulantesService {

  constructor(private http: HttpClient) { }
 
  async fnReclutamiento(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AtraccionTalentoService/Reclutamiento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }
    
  fnReclutamientoCrud(pOpcion: string, pParametro: any, url: string): Observable<any> {

    const urlEndpoint = url + 'AtraccionTalentoService/Reclutamiento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = { 
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  } 

}
