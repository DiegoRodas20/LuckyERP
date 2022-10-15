import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 

@Injectable({
  providedIn: 'root'
})
export class NotasLogisticaService {

  constructor(private http: HttpClient) {   }

  fnControlNotaLogistica(pEntidad: number,pTipo: number , pParametro: any, url: string) {

    const urlEndPoint = url + 'RequerimientoService/NotasLogistica/';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pTipo: pTipo, 
      pParametro: pParametro.join('|') 
     
    };
    
    return  this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnControlNotaSalida(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, pParametroDet:any, url: string) {

    const urlEndPoint = url + 'RequerimientoService/NotasLogistica/NotaSalida';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo, 
      pParametroDet: pParametroDet.join('/')
    };
    
    return  this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnControlNotaUtiles(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, pParametroDet:any, url: string) {

    const urlEndPoint = url + 'RequerimientoService/NotasLogistica/NotaUtiles';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo, 
      pParametroDet: pParametroDet.join('/')
    };
    
    return  this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnControlNotaRecojo(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, pParametroDet:any, url: string) {

    const urlEndPoint = url + 'RequerimientoService/NotasLogistica/NotaRecojo';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo, 
      pParametroDet: pParametroDet.join('/')
    };
    
    return  this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnControlNotaTraslado(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, pParametroDet:any, url: string) {

    const urlEndPoint = url + 'RequerimientoService/NotasLogistica/NotaTraslado';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo, 
      pParametroDet: pParametroDet.join('/')
    };
    
    return  this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnControlNotaIngreso(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, pParametroDet:any, url: string) {

    const urlEndPoint = url + 'RequerimientoService/NotasLogistica/NotaIngreso';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo, 
      pParametroDet: pParametroDet.join('/')
    };
    
    return  this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnControlVisorDeHistorial(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, pParametroDet:any, url: string) {
    const urlEndPoint = url + 'RequerimientoService/NotasLogistica';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo, 
      pParametroDet: pParametroDet.join('/')
    };
    return  this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

}
