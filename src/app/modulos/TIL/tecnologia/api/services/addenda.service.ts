import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { WebApiResponse } from '../models/apiResponse';
import { BaseService } from '../base-service';
import { ProvedorAddendaTIDTO } from '../models/proveedorTIDTO';
import { ElementoTIDTO } from '../models/elementoTIDTO';
import { ArticuloTIDTO } from '../models/articuloDTO';
import { AddendaArchivoDTO, AddendaCabeceraTIDTO, AddendaTableTIDTO, AddendaUnoTIDTO, DetalleAddendaDetalleTableTIDTO, ParametroTIDTO, TipoDispositivoParteTIDTO } from '../models/addendaTIDTO';

@Injectable({
  providedIn: 'root'
})
export class AddendaService extends BaseService {

  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_TIL') baseUrl: string) {
    super();
    this.urlBase = baseUrl + 'Addenda';
  }

  async GetAllProveedor(countryId: string) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('countryId', countryId);

      return await this.http.get<WebApiResponse<ProvedorAddendaTIDTO>>(
        `${this.urlBase}/Proveedor`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ProvedorAddendaTIDTO>(error)
    }
  }

  async GetParametro(sIdPais: string) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('sIdPais', sIdPais);

      return await this.http.get<WebApiResponse<ParametroTIDTO>>(
        `${this.urlBase}/Parametro`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ParametroTIDTO>(error)
    }
  }

  async GetAllTipoArticulo() {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<ElementoTIDTO>>(
        `${this.urlBase}/TipoArticulo`,
        {
          headers: httpHeaders,
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ElementoTIDTO>(error)
    }
  }

  async GetAllTipoDispositivoParte(nIdTipoArticulo: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('nIdTipoArticulo', nIdTipoArticulo.toString())

      return await this.http.get<WebApiResponse<TipoDispositivoParteTIDTO>>(
        `${this.urlBase}/TipoDispositivoParte`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TipoDispositivoParteTIDTO>(error)
    }
  }


  async GetAllArticulo(sIdPais: string, nIdTipoActivo: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('sIdPais', sIdPais)
        .set('nIdTipoActivo', nIdTipoActivo.toString());

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

  async GetAllDetalleForArticulo(nIdDetAddenda: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdDetAddenda', nIdDetAddenda.toString())

      return await this.http.get<WebApiResponse<DetalleAddendaDetalleTableTIDTO>>(
        `${this.urlBase}/GetAllDetalleForArticulo`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<DetalleAddendaDetalleTableTIDTO>(error)
    }
  }

  async GetArchivoAddenda(nIdAddenda: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdAddenda', nIdAddenda.toString());

      return await this.http.get<WebApiResponse<AddendaArchivoDTO>>(
        `${this.urlBase}/Archivo`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AddendaArchivoDTO>(error)
    }
  }

  async InsertTransaction(model: AddendaCabeceraTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<AddendaUnoTIDTO>>(
        `${this.urlBase}/InsertTransaction`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AddendaUnoTIDTO>(error)
    }
  }

  async UpdateTransaction(model: AddendaCabeceraTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<AddendaUnoTIDTO>>(
        `${this.urlBase}/${model.nIdAddenda}`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AddendaUnoTIDTO>(error)
    }
  }

  async InsertArchivo(model: AddendaArchivoDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<AddendaArchivoDTO>>(
        `${this.urlBase}/InsertArchivo`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AddendaArchivoDTO>(error)
    }
  }

  async GetAll(sIdPais: string) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<AddendaTableTIDTO>>(
        `${this.urlBase}?sIdPais=${sIdPais}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AddendaTableTIDTO>(error)
    }
  }

  async GetById(id: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<AddendaUnoTIDTO>>(
        `${this.urlBase}/${id}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AddendaUnoTIDTO>(error)
    }
  }
}
