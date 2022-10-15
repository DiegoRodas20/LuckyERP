import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BaseService } from '../base-service';
import { WebApiResponse } from '../models/apiResponse';
import { ArticuloTIDTO, InformacionArticuloTIDTO } from '../models/articuloDTO';
import { ElementoTIDTO } from '../models/elementoTIDTO';
import { MonedaPerfilTIDTO, PerfilEquipoCabeceraTIDTO, PerfilEquipoEstadoTIDTO, PerfilEquipoPenalidadDTO, PerfilEquipoSelectItemDTO, PerfilEquipoTableTIDTO, PerfilEquipoUnoTIDTO } from '../models/perfilEquipoTIDTO';
import { TipoElementoDto } from '../models/tipoElementoDTO';

@Injectable({
  providedIn: 'root'
})
export class PerfilEquipoService extends BaseService {

  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_TIL') baseUrl: string) {
    super();
    this.urlBase = baseUrl + 'PerfilEquipo';
  }

  async GetById(id: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<PerfilEquipoUnoTIDTO>>(
        `${this.urlBase}/${id}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<PerfilEquipoUnoTIDTO>(error)
    }
  }

  async GetAll(sIdPais: string) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<PerfilEquipoTableTIDTO>>(
        `${this.urlBase}?sIdPais=${sIdPais}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<PerfilEquipoTableTIDTO>(error)
    }
  }

  async GetAllTipoElemento(countryId: string) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<TipoElementoDto>>(
        `${this.urlBase}/TiposElemento?countryId=${countryId}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TipoElementoDto>(error)
    }
  }

  async GetMoneda(sIdPais: string) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<MonedaPerfilTIDTO>>(
        `${this.urlBase}/Moneda?sIdPais=${sIdPais}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<MonedaPerfilTIDTO>(error)
    }
  }

  async GetTiposDispositivo(nIdSubFamilia: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<ElementoTIDTO>>(
        `${this.urlBase}/TipoDispositivo?nIdSubFamilia=${nIdSubFamilia}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ElementoTIDTO>(error)
    }
  }

  async GetAllArticulo(idSubFamilia: number, idTipoDispositivo?: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('idSubFamilia', (idSubFamilia ?? 0).toString())
        .set('idTipoDispositivo', (idTipoDispositivo ?? 0).toString());

      return await this.http.get<WebApiResponse<ArticuloTIDTO>>(
        `${this.urlBase}/Articulo`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      //Objeto de error
      return this.handError<ArticuloTIDTO>(error)
    }
  }

  async GetAllTipoElementoCargos(countryId: string) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<TipoElementoDto>>(
        `${this.urlBase}/Cargos?countryId=${countryId}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      //Objeto de error
      return this.handError<TipoElementoDto>(error)
    }
  }

  async GetInformacionArticulo(idArticulo: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<InformacionArticuloTIDTO>>(
        `${this.urlBase}/InformacionArticulo?idArticulo=${idArticulo}`,
        {
          headers: httpHeaders
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<InformacionArticuloTIDTO>(error)
    }
  }

  async GetPenalidad(nIdPenalidad: number): Promise<WebApiResponse<PerfilEquipoPenalidadDTO>> {
    try {
      const params = new HttpParams()
        .set('nIdPenalidad', nIdPenalidad.toString());
      return (await this.http.get<WebApiResponse<PerfilEquipoPenalidadDTO>>(`${this.urlBase}/GetPenalidad`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPenalidadesPasadas(nIdPerfilEquipo: number) {
    try {
      const params = new HttpParams()
        .set('nIdPerfilEquipo', nIdPerfilEquipo.toString());

      return await this.http.get<WebApiResponse<PerfilEquipoSelectItemDTO>>(`${this.urlBase}/GetPenalidadesPasadas`, { params }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<PerfilEquipoSelectItemDTO>(error)
    }
  }

  async InsertTransaction(model: PerfilEquipoCabeceraTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<PerfilEquipoUnoTIDTO>>(
        `${this.urlBase}/InsertTransaction`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<PerfilEquipoUnoTIDTO>(error)
    }
  }

  async UpdateTransaction(model: PerfilEquipoCabeceraTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<PerfilEquipoUnoTIDTO>>(
        `${this.urlBase}/${model.nIdPerfilEquipo}`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<PerfilEquipoUnoTIDTO>(error)
    }
  }


  async UpdateState(model: PerfilEquipoEstadoTIDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<PerfilEquipoUnoTIDTO>>(
        `${this.urlBase}/estado/${model.nIdPerfilEquipo}`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<PerfilEquipoUnoTIDTO>(error)
    }
  }

  async CreatePenalidad(model: PerfilEquipoPenalidadDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<PerfilEquipoPenalidadDTO>>(
        `${this.urlBase}/CreatePenalidad`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
      return this.handError<PerfilEquipoPenalidadDTO>(error)
    }
  }

  async CreatePenalidadLaptopDesktop(model: PerfilEquipoPenalidadDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<PerfilEquipoPenalidadDTO>>(
        `${this.urlBase}/CreatePenalidadLaptopDesktop`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
      return this.handError<PerfilEquipoPenalidadDTO>(error)
    }
  }

  async UpdateEstadoPenalidadInhabilitar(model: PerfilEquipoPenalidadDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<PerfilEquipoPenalidadDTO>>(
        `${this.urlBase}/UpdateEstadoPenalidadInhabilitar/`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
      return this.handError<PerfilEquipoPenalidadDTO>(error)
    }
  }
}
