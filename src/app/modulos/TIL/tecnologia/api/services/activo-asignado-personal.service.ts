import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BaseService } from '../base-service';
import { ActivoAsignadoPersonalSelectItemDTO, ActivosPersonalDTO, ComponentesActivoDTO, PersonalCargoDTO, PersonalSolicitudTicketDTO, SolicitudTicketDTO, TicketUsuarioDTO } from '../models/activoAsignadoPersonalDTO';
import { WebApiResponse } from '../models/apiResponse';
import { ArticuloTIDTO } from '../models/articuloDTO';
import { ElementoTIDTO } from '../models/elementoTIDTO';

@Injectable({
  providedIn: 'root'
})
export class ActivoAsignadoPersonalService extends BaseService {

  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_TIL') baseUrl: string) {
    super();
    this.urlBase = baseUrl + 'ActivoAsignadoPersonal';
  }

  async GetActivosByPersonal(nIdUsuario: number, nIdPersonal?: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('nIdPersonal', (nIdPersonal ?? 0).toString())

      return await this.http.get<WebApiResponse<ActivosPersonalDTO>>(
        `${this.urlBase}/${nIdUsuario}`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivosPersonalDTO>(error)
    }
  }

  async GetPersonalCargo(nIdUsuario: number, nIdEmpresa: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdUsuario', nIdUsuario.toString())
        .set('nIdEmpresa', nIdEmpresa.toString())

      return await this.http.get<WebApiResponse<PersonalCargoDTO>>(
        `${this.urlBase}/Personal`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<PersonalCargoDTO>(error)
    }
  }

  async GetComponentesByActivo(nIdActivo: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('nIdActivo', nIdActivo.toString())


      return await this.http.get<WebApiResponse<ComponentesActivoDTO>>(
        `${this.urlBase}/Componente`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      //Objeto de error
      return this.handError<ComponentesActivoDTO>(error)
    }
  }

  async GetTipoTicket() {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      //const params = new HttpParams().set('nIdActivo', nIdActivo.toString())


      return await this.http.get<WebApiResponse<ElementoTIDTO>>(
        `${this.urlBase}/TipoTicket`,
        {
          headers: httpHeaders,
          //params
        }
      ).toPromise();

    } catch (error) {
      //Objeto de error
      return this.handError<ElementoTIDTO>(error)
    }
  }

  async GetArticuloByTipoTicket(nIdTipoTicket: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('nIdTipoTicket', nIdTipoTicket.toString())


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

  async GetPersonalSolicitud(nIdUsuario: number, nIdEmpresa: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('nIdUsuario', nIdUsuario.toString())
        .set('nIdEmpresa', nIdEmpresa.toString())

      return await this.http.get<WebApiResponse<PersonalSolicitudTicketDTO>>(
        `${this.urlBase}/PersonalSolicitud`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      //Objeto de error
      return this.handError<PersonalSolicitudTicketDTO>(error)
    }
  }

  async GetTicketSolicitados(nIdUsuario: number, nIdEstado: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('nIdUsuario', nIdUsuario.toString())
      .set('nIdEstado', nIdEstado.toString())

      return await this.http.get<WebApiResponse<TicketUsuarioDTO>>(
        `${this.urlBase}/TicketSolicitado`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      //Objeto de error
      return this.handError<TicketUsuarioDTO>(error)
    }
  }

  async ValidacionTicket(nIdActivo: number, nIdAsignado: number, nIdArticulo: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const params = new HttpParams().set('nIdActivo', nIdActivo.toString())
        .set('nIdAsignado', nIdAsignado.toString())
        .set('nIdArticulo', nIdArticulo.toString());

      return await this.http.get<WebApiResponse<string>>(
        `${this.urlBase}/ValidacionTicket`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<string>(error)
    }
  }

  async InsertTicket(model: SolicitudTicketDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<SolicitudTicketDTO>>(
        `${this.urlBase}/Ticket`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<SolicitudTicketDTO>(error)
    }
  }

  async GetTipoCambioActual(sPais: string): Promise<WebApiResponse<ActivoAsignadoPersonalSelectItemDTO>> {
    try {
      const params = new HttpParams()
        .set('sPais', sPais)
      return (await this.http.get<WebApiResponse<ActivoAsignadoPersonalSelectItemDTO>>(`${this.urlBase}/GetTipoCambioActual`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  
}
