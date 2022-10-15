import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {

  constructor(private http: HttpClient) { }
  
  async fnRequerimientoPersonal(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoiint=url + 'RequerimientoService/RequerimientoPersonal'
    const httpHeaders = new HttpHeaders({'Content-Type':'application/json'});

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    }
    
    return await this.http.post(urlEndPoiint, JSON.stringify(params),{headers: httpHeaders}).toPromise();

  }
}
