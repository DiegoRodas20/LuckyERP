import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BaseService } from '../base-service';
import { WebApiResponse } from '../models/apiResponse';
import { ActivoTicketCaracteristicasDTO, TicketAtencionReposicionValidacionDTO, TicketGarantiaActivoDTO, TicketImagenAsignacionDTO, TicketMontoDescuentoReposicionDTO, TicketSelectItemDTO, TicketSelectItemPersonalAsignadoDTO, TicketSelectItemPrioridadDTO, TicketTableDetalleAtencionDTO, TicketTableDetalleAtencionTiempoDTO, TicketTableDetalleDTO, TicketTableDTO, TicketTiempoAtencionDTO } from '../models/ticketDTO';

@Injectable({
  providedIn: 'root'
})
export class TicketService extends BaseService {

  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_TIL') baseUrl: string) {
    super();
    this.urlBase = baseUrl + 'Ticket';
  }

  async GetAll(nIdEstado: number, nIdPrioridad) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams()
        .set('nIdEstado', nIdEstado.toString())
        .set('nIdPrioridad', nIdPrioridad.toString())

      return await this.http.get<WebApiResponse<TicketTableDTO>>(
        `${this.urlBase}`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TicketTableDTO>(error)
    }
  }

  async GetById(nIdTicket: number): Promise<WebApiResponse<TicketTableDetalleDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<TicketTableDetalleDTO>>(`${this.urlBase}/GetById/${nIdTicket}`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
    }
  }

  async GetAllEmpresas(): Promise<WebApiResponse<TicketSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<TicketSelectItemDTO>>(`${this.urlBase}/GetAllEmpresas`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
    }
  }

  async GetAllTiposTicket(): Promise<WebApiResponse<TicketSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<TicketSelectItemDTO>>(`${this.urlBase}/GetAllTiposTicket`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
    }
  }

  async GetAllActivos(nIdArticulo: number, nIdActivo: number): Promise<WebApiResponse<TicketSelectItemDTO>> {
    try {
      const params = new HttpParams()
        .set("nIdArticulo", nIdArticulo.toString())
        .set("nIdActivo", nIdActivo.toString());
      return (await this.http.get<WebApiResponse<TicketSelectItemDTO>>(`${this.urlBase}/GetAllActivos`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
    }
  }

  async GetAllSolicitantes(): Promise<WebApiResponse<TicketSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<TicketSelectItemDTO>>(`${this.urlBase}/GetAllSolicitantes`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
    }
  }

  async GetAllPersonalAsignacion(): Promise<WebApiResponse<TicketSelectItemPersonalAsignadoDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<TicketSelectItemPersonalAsignadoDTO>>(`${this.urlBase}/GetAllPersonalAsignacion`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
    }
  }

  async GetAllPersonalTi(): Promise<WebApiResponse<TicketSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<TicketSelectItemDTO>>(`${this.urlBase}/GetAllPersonalTi`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
    }
  }

  async GetAllCaracteristicasActivo(nIdActivo: Number):  Promise<WebApiResponse<ActivoTicketCaracteristicasDTO>> { 
    try {
      const params = new HttpParams().set('nIdActivo', nIdActivo.toString());
      return (await this.http.get<WebApiResponse<ActivoTicketCaracteristicasDTO>>(`${this.urlBase}/GetAllCaracteristicasActivo`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllImagenesActivoAsignado(nIdActivo: Number):  Promise<WebApiResponse<TicketImagenAsignacionDTO>> { 
    try {
      const params = new HttpParams().set('nIdActivo', nIdActivo.toString());
      return (await this.http.get<WebApiResponse<TicketImagenAsignacionDTO>>(`${this.urlBase}/GetAllImagenesActivoAsignado`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllTiempoAtencion(nIdTicket: Number):  Promise<WebApiResponse<TicketTiempoAtencionDTO>> { 
    try {
      const params = new HttpParams().set('nIdTicket', nIdTicket.toString());
      return (await this.http.get<WebApiResponse<TicketTiempoAtencionDTO>>(`${this.urlBase}/GetAllTiempoAtencion`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllPrioridadesTicket():  Promise<WebApiResponse<TicketSelectItemPrioridadDTO>> { 
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<TicketSelectItemPrioridadDTO>>(`${this.urlBase}/GetAllPrioridadesTicket`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetMontoDescuentoReposicion(nIdTicket: number, nIdCargo: number): Promise<WebApiResponse<TicketMontoDescuentoReposicionDTO>> {
    try {
      const params = new HttpParams()
        .set("nIdTicket", nIdTicket.toString())
        .set("nIdCargo", nIdCargo.toString());
      return (await this.http.get<WebApiResponse<TicketMontoDescuentoReposicionDTO>>(`${this.urlBase}/GetMontoDescuentoReposicion/`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
    }
  }

  async ValidarAtencionReposicionDescuento(nIdTicket: number): Promise<WebApiResponse<TicketAtencionReposicionValidacionDTO>> {
    try {
      const params = new HttpParams()
        .set("nIdTicket", nIdTicket.toString())
      return (await this.http.get<WebApiResponse<TicketAtencionReposicionValidacionDTO>>(`${this.urlBase}/ValidarAtencionReposicionDescuento/`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
    }
  }

  async GetGarantiaActivoTicket(nIdTicket: number, sPais: string): Promise<WebApiResponse<TicketGarantiaActivoDTO>> {
    try {
      const params = new HttpParams()
        .set("nIdTicket", nIdTicket.toString())
        .set("sPais", sPais.toString())
      return (await this.http.get<WebApiResponse<TicketGarantiaActivoDTO>>(`${this.urlBase}/GetGarantiaActivoTicket/`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      console.log('Error: ', error);
    }
  }

  async GetCantidadTicketsRevisar(nIdPersonal: number): Promise<WebApiResponse<number>> {
    try {
      const params = new HttpParams().set("nIdPersonal", nIdPersonal.toString());
      return (await this.http.get<WebApiResponse<number>>(`${this.urlBase}/GetCantidadTicketsRevisar`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async UpdateTicket(model: TicketTableDetalleDTO):  Promise<WebApiResponse<TicketTableDetalleDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<TicketTableDetalleDTO>>(`${this.urlBase}/UpdateTicket`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<TicketTableDetalleDTO>(error)
    }
  }

  async UpdateTicketEstadoEnProceso(model: TicketTableDetalleAtencionTiempoDTO, nIdTicket: number):  Promise<WebApiResponse<TicketTableDetalleDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<TicketTableDetalleDTO>>(`${this.urlBase}/UpdateTicketEstadoEnProceso/${nIdTicket}`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TicketTableDetalleDTO>(error)
    }
  }

  async UpdateTicketEstadoAtendido(model: TicketTableDetalleAtencionTiempoDTO, nIdTicket: number):  Promise<WebApiResponse<TicketTableDetalleDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<TicketTableDetalleDTO>>(`${this.urlBase}/UpdateTicketEstadoAtendido/${nIdTicket}`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<TicketTableDetalleDTO>(error)
    }
  }

  async UpdateActivoTicketDevolver(nIdTicket: number):  Promise<WebApiResponse<TicketTableDetalleDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<TicketTableDetalleDTO>>(`${this.urlBase}/UpdateActivoTicketDevolver/${nIdTicket}`, null,
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<TicketTableDetalleDTO>(error)
    }
  }

  async CreateDescuentoReposicion(model: TicketMontoDescuentoReposicionDTO):  Promise<WebApiResponse<TicketMontoDescuentoReposicionDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<TicketTableDetalleDTO>>(`${this.urlBase}/CreateDescuentoReposicion/`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<TicketTableDetalleDTO>(error)
    }
  }

  async UpdateActivoReposicion(nIdTicket: number):  Promise<WebApiResponse<TicketTableDetalleDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<TicketTableDetalleDTO>>(`${this.urlBase}/UpdateActivoReposicion/${nIdTicket}`, null,
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<TicketTableDetalleDTO>(error)
    }
  }

  async UpdateTicketRevisado(nIdTicket: number):  Promise<WebApiResponse<boolean>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<boolean>>(`${this.urlBase}/UpdateTicketRevisado/${nIdTicket}`, null,
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<boolean>(error)
    }
  }
}
