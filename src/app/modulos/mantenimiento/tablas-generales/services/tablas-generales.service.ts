import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class TablasGeneralesService {
    constructor(private http: HttpClient) { }

    fnTablasGenerales(pOpcion: number, pParametro: any, url: string): Observable<any> {

        const urlEndpoint = url + 'MantenimientoService/SystElements';
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
        const params = {
            pOpcion: pOpcion,
            pParametro: pParametro.join('|'),
        }

        return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
    }

    fnTipoElemento(pOpcion: number, pParametro: any, url: string): Observable<any> {

        const urlEndpoint = url + 'MantenimientoService/TipoElemento';
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
        const params = {
            pOpcion: pOpcion,
            pParametro: pParametro.join('|'),
        }

        return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
    }

}