import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BaseService } from '../base-service';
import { WebApiResponse } from '../models/apiResponse';
import { ArticuloTIDTO } from '../models/articuloDTO';
import { DispositivoMatrizDTO } from '../models/dispositivoMatrizDTO';
import { CaracteristicaArticuloTIDTO, ElementoTIDTO, TipoDispositivoTIDTO } from '../models/elementoTIDTO';
import { SubFamiliaTIDto, TipoElementoDto } from '../models/tipoElementoDTO';
import { TipoTicketArticuloDTO } from '../models/tipoTicketArticuloDTO';


@Injectable({
  providedIn: 'root'
})
export class SubFamiliaCaracteristicaService extends BaseService {

  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_TIL') baseUrl: string) {
    super();
    this.urlBase = baseUrl + 'SubFamiliaCaracteristica';
  }

  async GetAllSubFamilias(sIdPais: string) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<SubFamiliaTIDto>>(
        `${this.urlBase}/SubFamilia?sIdPais=${sIdPais}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<SubFamiliaTIDto>(error)
    }
  }

  async GetAllCaracteristicas(nIdSubFamilia: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<CaracteristicaArticuloTIDTO>>(
        `${this.urlBase}/Caracteristica?nIdSubFamilia=${nIdSubFamilia}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<CaracteristicaArticuloTIDTO>(error)
    }
  }

  async GetAllTipoDispositivos(nIdSubFamilia: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<TipoDispositivoTIDTO>>(
        `${this.urlBase}/TipoDispositivo?nIdSubFamilia=${nIdSubFamilia}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TipoDispositivoTIDTO>(error)
    }
  }

  async InsertCaracteristica(model: CaracteristicaArticuloTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<CaracteristicaArticuloTIDTO>>(
        `${this.urlBase}/Caracteristica`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<CaracteristicaArticuloTIDTO>(error)
    }
  }

  async UpdateCaracteristica(model: CaracteristicaArticuloTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<CaracteristicaArticuloTIDTO>>(
        `${this.urlBase}/Caracteristica/${model.elementoId}`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<CaracteristicaArticuloTIDTO>(error)
    }
  }

  async InsertTipoDispositivo(model: TipoDispositivoTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<TipoDispositivoTIDTO>>(
        `${this.urlBase}/TipoDispositivo`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TipoDispositivoTIDTO>(error)
    }
  }

  async UpdateTipoDispositivo(model: TipoDispositivoTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<TipoDispositivoTIDTO>>(
        `${this.urlBase}/TipoDispositivo/${model.elementoId}`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TipoDispositivoTIDTO>(error)
    }
  }

  async InsertMatriz(model: DispositivoMatrizDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<DispositivoMatrizDTO>>(
        `${this.urlBase}/Matriz`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<DispositivoMatrizDTO>(error)
    }
  }

  async UpdateMatriz(model: DispositivoMatrizDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<DispositivoMatrizDTO>>(
        `${this.urlBase}/Matriz/${model.nIdDispositivoMatriz}`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<DispositivoMatrizDTO>(error)
    }
  }

  async GetAllMatriz() {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<DispositivoMatrizDTO>>(
        `${this.urlBase}/Matriz`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<DispositivoMatrizDTO>(error)
    }
  }

  async GetAllDispositivo() {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<ElementoTIDTO>>(
        `${this.urlBase}/Dispositivo`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ElementoTIDTO>(error)
    }
  }

  async GetAllTipoTicketArticulo() {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<TipoTicketArticuloDTO>>(
        `${this.urlBase}/TipoTicketArticulo`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TipoTicketArticuloDTO>(error)
    }
  }

  async UpdateTipoTicketArticulo(model: TipoTicketArticuloDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<TipoTicketArticuloDTO>>(
        `${this.urlBase}/TipoTicketArticulo/${model.nIdTipoTicketArticulo}`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TipoTicketArticuloDTO>(error)
    }
  }

  async InsertTipoTicketArticulo(model: TipoTicketArticuloDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<TipoTicketArticuloDTO>>(
        `${this.urlBase}/TipoTicketArticulo`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TipoTicketArticuloDTO>(error)
    }
  }

  async GetTipoTicket() {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<ElementoTIDTO>>(
        `${this.urlBase}/TipoTicket`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ElementoTIDTO>(error)
    }
  }

  async GetArticulo(sIdPais: string) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('sIdPais', sIdPais)

      return await this.http.get<WebApiResponse<ArticuloTIDTO>>(
        `${this.urlBase}/Articulo`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ArticuloTIDTO>(error)
    }
  }
}
