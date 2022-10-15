
import { Component, Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AnyAaaaRecord } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class DatoBasicoService {

  constructor(private http: HttpClient) { }

  //Funcion para los Datos Basicos del proceso de Presupuesto
  fnDatoBasico(pEntidad: any, pOpcion: any, pParametro: any, pTipo: any, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/DatoBasico';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnTarifario(pEntidad: number, pOpcion: number, pParametro: any, pDetalle1: any, pDetalle2: any, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/Tarifa';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        oDetalle1: pDetalle1,
        lisDetalle2: pDetalle2
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
    //.pipe(map((response) => response));
  }

   //Funcion para los los cargos de aprobacion
  fnCargoAprobacion(pEntidad: string, pOpcion: string, pParametro: any, pTipo: string, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/CargoAprobacion';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
    //.pipe(map((response) => response));
  }

  fndatoBasicoSucursal(pEntidad: string, pOpcion: string, pParametro: any, pTipo: string, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/datoBasicoSucursal';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnDatoMatriz(pEntidad: string, pOpcion: string, pParametro: any, pTipo: string, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/matrizPresupuestos';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnParametroConcar(pEntidad: string, pOpcion: string, pParametro: any, pTipo: string, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/ParametroConcar';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }
  //Crear funcion de servicio para conectarser al nuevo bloque de controlador que tambien se debe crear

  fnTipoDispositivoPartida(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpPresupuestoPartidaDispositivo/partidaDispositivo';
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
