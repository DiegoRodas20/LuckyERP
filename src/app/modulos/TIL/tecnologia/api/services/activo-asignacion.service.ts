import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BaseService } from '../base-service';
import { ActivoAsignacionTableTIDTO, ActivoAsignaUnoTIDTO, ArticuloAsignacionActivoTableTIDTO, AsignacionActivoTIDTO, DetalleAsignacionActivoArchivoTIDTO, DetalleAsignacionActivoTIDTO, DetalleDocumentoAsignacionActivoTIDTO } from '../models/activoAsignacionTITDO';
import { WebApiResponse } from '../models/apiResponse';
import { ArticuloRqActivoTIDTO } from '../models/articuloDTO';
import { TipoElementoDto } from '../models/tipoElementoDTO';

@Injectable({
  providedIn: 'root'
})
export class ActivoAsignacionService extends BaseService {

  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_TIL') baseUrl: string) {
    super();
    this.urlBase = baseUrl + 'ActivoAsignacion';
  }

  async GetAll(nIdEstado: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdEstado', nIdEstado.toString());

      return await this.http.get<WebApiResponse<ActivoAsignacionTableTIDTO>>(
        `${this.urlBase}`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoAsignacionTableTIDTO>(error)
    }
  }

  async GetById(id: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<ActivoAsignaUnoTIDTO>>(
        `${this.urlBase}/${id}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoAsignaUnoTIDTO>(error)
    }
  }

  async GetAllTipoDispositivo(nIdCargo: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<TipoElementoDto>>(
        `${this.urlBase}/TipoDispositivo?nIdCargo=${nIdCargo}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TipoElementoDto>(error)
    }
  }

  async GetAllArticulo(nIdSubFamilia: number, nIdCargo: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('nIdSubFamilia', nIdSubFamilia.toString())
        .set('nIdCargo', nIdCargo.toString());

      return await this.http.get<WebApiResponse<ArticuloRqActivoTIDTO>>(
        `${this.urlBase}/Articulo`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      //Objeto de error
      return this.handError<ArticuloRqActivoTIDTO>(error)
    }
  }

  async GetActivosByPersonal(nIdPersonal: number, nIdActivoAsigna: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('nIdPersonal', nIdPersonal.toString())
        .set('nIdActivoAsigna', nIdActivoAsigna.toString());

      return await this.http.get<WebApiResponse<ArticuloAsignacionActivoTableTIDTO>>(
        `${this.urlBase}/DetalleActivo`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      //Objeto de error
      return this.handError<ArticuloAsignacionActivoTableTIDTO>(error)
    }
  }

  async GetArchivosByActivo(nIdDetActivoAsigna: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('nIdDetActivoAsigna', nIdDetActivoAsigna.toString());

      return await this.http.get<WebApiResponse<DetalleAsignacionActivoArchivoTIDTO>>(
        `${this.urlBase}/Archivo`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      //Objeto de error
      return this.handError<DetalleAsignacionActivoArchivoTIDTO>(error)
    }
  }

  async InsertDetalle(model: DetalleAsignacionActivoTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<DetalleAsignacionActivoTIDTO>>(
        `${this.urlBase}/InsertDetalle`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<DetalleAsignacionActivoTIDTO>(error)
    }
  }

  async UpdateDetalle(model: DetalleAsignacionActivoTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<DetalleAsignacionActivoTIDTO>>(
        `${this.urlBase}/UpdateDetalle`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<DetalleAsignacionActivoTIDTO>(error)
    }
  }

  async UpdateDocumentoDetalle(model: DetalleDocumentoAsignacionActivoTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<DetalleDocumentoAsignacionActivoTIDTO>>(
        `${this.urlBase}/UpdateDocumentoDetalle`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<DetalleDocumentoAsignacionActivoTIDTO>(error)
    }
  }

  async UpdateCabecera(model: AsignacionActivoTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<AsignacionActivoTIDTO>>(
        `${this.urlBase}/UpdateCabecera`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AsignacionActivoTIDTO>(error)
    }
  }

}
