import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { WebApiResponse } from '../models/apiResponse';
import { BaseService } from '../base-service';
import { AsignacionDirectaCabeceraDTO, AsignacionDirectaCambioPartesActivoDTO, AsignacionDirectaDetalleColaboradorDTO, AsignacionDirectaReposicionDTO, AsignacionDirectaSeleccionDetalleArchivoDTO, AsignacionDirectaSeleccionDetalleDTO, AsignacionDirectaSeleccionDTO, AsignacionDirectaSelectItemDTO } from '../models/asignacionDirectaDTO';

@Injectable({
  providedIn: 'root'
})
export class AsignacionDirectaService extends BaseService {

  private urlController: string = "";

  constructor(
    private http: HttpClient, 
    @Inject('BASE_URL_TIL') private baseUrl: string, 
    @Inject('BASE_URL') private baseUrlAntiguoBack: string) {
    super();
    this.urlController = baseUrl + 'AsignacionDirecta';
  }

  async GetAllAsignacionesDirectas(): Promise<WebApiResponse<AsignacionDirectaCabeceraDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<AsignacionDirectaCabeceraDTO>>(`${this.urlController}/GetAllAsignacionesDirectas`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAsignacionById(nIdPersonal: number): Promise<WebApiResponse<AsignacionDirectaSeleccionDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<AsignacionDirectaSeleccionDTO>>(`${this.urlController}/GetAsignacionById/${nIdPersonal}`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AsignacionDirectaSeleccionDTO>(error)
    }
  }

  async GetAllColaboradores(nIdPersonal: number, sPais: string): Promise<WebApiResponse<AsignacionDirectaSelectItemDTO>> {
    try {
      const params = new HttpParams().set("sPais", sPais);
      return (await this.http.get<WebApiResponse<AsignacionDirectaSelectItemDTO>>(`${this.urlController}/GetAllColaboradores/${nIdPersonal}`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetDetalleColaborador(nIdPersonal: number): Promise<WebApiResponse<AsignacionDirectaDetalleColaboradorDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<AsignacionDirectaDetalleColaboradorDTO>>(`${this.urlController}/GetDetalleColaborador/${nIdPersonal}`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AsignacionDirectaDetalleColaboradorDTO>(error)
    }
  }

  async GetAllActivosAsignacion(nIdTipo: number, nIdActivo: number): Promise<WebApiResponse<AsignacionDirectaSelectItemDTO>> {
    try {
      const params = new HttpParams().set("nIdActivo", nIdActivo.toString());
      return (await this.http.get<WebApiResponse<AsignacionDirectaSelectItemDTO>>(`${this.urlController}/GetAllActivosAsignacion/${nIdTipo}`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AsignacionDirectaSelectItemDTO>(error)
    }
  }

  async GetObservacionesByAsignacion(nIdDetActivoAsigna: number): Promise<WebApiResponse<AsignacionDirectaSeleccionDetalleArchivoDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<AsignacionDirectaSeleccionDetalleArchivoDTO>>(`${this.urlController}/GetObservacionesByAsignacion/${nIdDetActivoAsigna}`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AsignacionDirectaSeleccionDetalleArchivoDTO>(error)
    }
  }

  async GetPerfilUsuario(nIdUsuario: number, nIdEmp: number): Promise<WebApiResponse<number>> {
    try {
      const params = new HttpParams().set("nIdEmp", nIdEmp.toString());
      return (await this.http.get<WebApiResponse<number>>(`${this.urlController}/GetPerfilUsuario/${nIdUsuario}`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<number>(error)
    }
  }

  async GetImporteDescuentoInicial(nIdActivo: number, nIdCargo: number, sPais: string): Promise<WebApiResponse<number>> {
    try {
      const params = new HttpParams()
        .set("nIdActivo", nIdActivo.toString())
        .set("nIdCargo", nIdCargo.toString())
        .set("sPais", sPais);
      return (await this.http.get<WebApiResponse<number>>(`${this.urlController}/GetImporteDescuentoInicial`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<number>(error)
    }
  }

  async GetAllActivosParaCambioPartes(nIdTipo: number): Promise<WebApiResponse<AsignacionDirectaSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<AsignacionDirectaSelectItemDTO>>(`${this.urlController}/GetAllActivosParaCambioPartes/${nIdTipo}`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AsignacionDirectaSelectItemDTO>(error)
    }
  }

  async GetCambioPartesActivo(nIdActivoOriginal: number, nIdActivoCompartir: number): Promise<WebApiResponse<AsignacionDirectaCambioPartesActivoDTO>> {
    try {
      const params = new HttpParams()
        .set("nIdActivoOriginal", nIdActivoOriginal.toString())
        .set("nIdActivoCompartir", nIdActivoCompartir.toString());
      return (await this.http.get<WebApiResponse<AsignacionDirectaCambioPartesActivoDTO>>(`${this.urlController}/GetCambioPartesActivo/`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<AsignacionDirectaCambioPartesActivoDTO>(error)
    }
  }

  async CreateAsignacion(model: AsignacionDirectaSeleccionDTO):  Promise<WebApiResponse<AsignacionDirectaSeleccionDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<AsignacionDirectaSeleccionDTO>>(`${this.urlController}/CreateAsignacion`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<AsignacionDirectaSeleccionDTO>(error)
    }
  }

  async CreateAsignacionDetalle(model: AsignacionDirectaSeleccionDetalleDTO):  Promise<WebApiResponse<AsignacionDirectaSeleccionDetalleDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<AsignacionDirectaSeleccionDetalleDTO>>(`${this.urlController}/CreateAsignacionDetalle`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<AsignacionDirectaSeleccionDetalleDTO>(error)
    }
  }

  async UpdateAsignacionDetalle(model: AsignacionDirectaSeleccionDetalleDTO):  Promise<WebApiResponse<AsignacionDirectaSeleccionDetalleDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<AsignacionDirectaSeleccionDTO>>(`${this.urlController}/UpdateAsignacionDetalle/`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<AsignacionDirectaSeleccionDetalleDTO>(error)
    }
  }

  async UpdateDetalleAsignacionDevolucion(model: AsignacionDirectaSeleccionDetalleDTO):  Promise<WebApiResponse<AsignacionDirectaSeleccionDetalleDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<AsignacionDirectaSeleccionDetalleDTO>>(`${this.urlController}/UpdateDetalleAsignacionDevolucion`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<AsignacionDirectaSeleccionDetalleDTO>(error)
    }
  }

  async UpdateDocumentoDescuentoAsignacion(model: AsignacionDirectaSeleccionDetalleDTO):  Promise<WebApiResponse<AsignacionDirectaSeleccionDetalleDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<AsignacionDirectaSeleccionDetalleDTO>>(`${this.urlController}/UpdateDocumentoDescuentoAsignacion`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<AsignacionDirectaSeleccionDetalleDTO>(error)
    }
  }

  async CreateReposicionAsignacion (model: AsignacionDirectaReposicionDTO):  Promise<WebApiResponse<AsignacionDirectaReposicionDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<AsignacionDirectaReposicionDTO>>(`${this.urlController}/CreateReposicionAsignacion`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<AsignacionDirectaReposicionDTO>(error)
    }
  }

  async UpdateCambioPartesActivo(model: AsignacionDirectaCambioPartesActivoDTO):  Promise<WebApiResponse<AsignacionDirectaCambioPartesActivoDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<AsignacionDirectaCambioPartesActivoDTO>>(`${this.urlController}/UpdateCambioPartesActivo`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<AsignacionDirectaCambioPartesActivoDTO>(error)
    }
  }

  async UpdateDevolucionParteActivo(model: AsignacionDirectaCambioPartesActivoDTO):  Promise<WebApiResponse<AsignacionDirectaCambioPartesActivoDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<AsignacionDirectaCambioPartesActivoDTO>>(`${this.urlController}/UpdateDevolucionParteActivo`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<AsignacionDirectaCambioPartesActivoDTO>(error)
    }
  }

  /**
   * Metodo que consume en antiguo back
   */

  async fnDescargarPDFDescuento(pEntidad: number,pOpcion: number, pParametro: any, pTipo: number) {
    const urlEndPoint = this.baseUrlAntiguoBack + 'ErpController/GetControlDescuento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join("|"),
        pTipo: pTipo
    };
    console.log(params);
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' }).toPromise();
  }
}