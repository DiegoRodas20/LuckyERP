import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class CatalogoClienteService {
    constructor(private http: HttpClient) { }

  
    fnCatalogoClientev2(pOpcion: number, pParametro: any, url: string): Observable<any> {

        const urlEndpoint = url + 'ComercialService/CatalogoCliente';
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
        const params = {            
            pOpcion: pOpcion,
            pParametro: pParametro.join('|'),            
        }
        // console.log(JSON.stringify(params))
        return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
    }

}

