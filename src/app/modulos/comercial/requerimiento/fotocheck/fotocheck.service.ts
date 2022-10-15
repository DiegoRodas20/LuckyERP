import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 

@Injectable({
  providedIn: 'root'
})
export class FotocheckService {

  constructor(private http: HttpClient) { }

  async fnControlFotocheck(pOpcion: number, pParametro: any, url: string) {

    const urlEndPoint = url + 'RequerimientoService/Fotocheck';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
