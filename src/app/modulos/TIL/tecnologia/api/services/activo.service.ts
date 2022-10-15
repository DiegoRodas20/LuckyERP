import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { WebApiResponse } from '../models/apiResponse';
import { ActivoDTO, ActivoTipoDTO, ActivoSelectItemDTO, ActivoSimcardTIDTO, ActivoRegistroDTO, ActivoMovilTIDTO, ActivoSelectItemArticuloDTO, ActivoLaptopDesktopTIDTO, ActivoDetalleAddendaDTO, ActivoPlanDatosOperadorDTO, ActivoHistorialAsignacionDTO, ActivoSelectItemAddendaDTO, ActivoCodigoLaptopDesktopDTO, ActivoDesktopTIDTO, ActivoRegistroDesktopDTO, ActivoDetalleDesktopDTO, ActivoExcelLaptopDesktopDTO, ActivoExcelLaptopDesktopCabeceraDTO, ActivoExcelSimcardDTO, ActivoResumenDTO, ActivoRelacionadoDTO, ActivoDescuentosPersonalDTO, ActivoCaracteristicasDTO } from '../models/activoDTO';
import { BaseService } from '../base-service';

@Injectable({
  providedIn: 'root'
})
export class ActivoService extends BaseService {
  
  private urlController: string = "";

  /**
   * Variables globales
   * Variables que se utilizan para pasar datos relacionados entre dos ventanas
   */
  nIdTipoActivo = 0;
  nTipoRegistro = 1; // Si es ingreso de activo (1) o asignacion (2)

  constructor(private http: HttpClient, @Inject('BASE_URL_TIL') baseUrl: string) {
    super();
    this.urlController = baseUrl + 'Activo';
  }

  async GetAll(nIdTipoActivo: number, nIdEstado: number,): Promise<WebApiResponse<ActivoDTO>> {
    try {
      const params = new HttpParams()
        .set('nIdTipoActivo', nIdTipoActivo.toString())
        .set('nIdEstado', nIdEstado.toString());
      return (await this.http.get<WebApiResponse<ActivoDTO>>(`${this.urlController}/GetAll`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetActivoById(id: Number): Promise<WebApiResponse<ActivoRegistroDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoRegistroDTO>>(`${this.urlController}/GetActivoById/${id}`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDTO>(error)
    }
  }

  async GetAllTipos(): Promise<WebApiResponse<ActivoTipoDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoTipoDTO>>(`${this.urlController}/GetAllTipos`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetHistorialAsignacionPorActivo(nIdActivo: Number): Promise<WebApiResponse<ActivoHistorialAsignacionDTO>> {
    try {
      const params = new HttpParams().set('nIdActivo', nIdActivo.toString());
      return (await this.http.get<WebApiResponse<ActivoHistorialAsignacionDTO>>(`${this.urlController}/GetHistorialAsignacionPorActivo`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllOperadores(): Promise<WebApiResponse<ActivoSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoSelectItemDTO>>(`${this.urlController}/GetAllOperadores`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllPlanDatos(nIdOperador: Number): Promise<WebApiResponse<ActivoSelectItemDTO>> {
    try {
      const params = new HttpParams().set('nIdOperador', nIdOperador.toString());
      return (await this.http.get<WebApiResponse<ActivoSelectItemDTO>>(`${this.urlController}/GetAllPlanDatos`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllCaracteristicasPaquete(nIdArticulo: Number):  Promise<WebApiResponse<string>> { 
    try {
      const params = new HttpParams().set('nIdArticulo', nIdArticulo.toString());
      return (await this.http.get<WebApiResponse<string>>(`${this.urlController}/GetAllCaracteristicasPaquete`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllDispositivosMoviles(): Promise<WebApiResponse<ActivoSelectItemArticuloDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoSelectItemArticuloDTO>>(`${this.urlController}/GetAllDispositivosMoviles`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllCaracteristicas(nIdArticulo: Number):  Promise<WebApiResponse<ActivoCaracteristicasDTO>> { 
    try {
      const params = new HttpParams().set('nIdArticulo', nIdArticulo.toString());
      return (await this.http.get<WebApiResponse<ActivoCaracteristicasDTO>>(`${this.urlController}/GetAllCaracteristicas`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllNumerosSimcard(nIdActivo: Number): Promise<WebApiResponse<ActivoSelectItemDTO>> {
    try {
      const params = new HttpParams().set('nIdActivo', nIdActivo.toString());
      return (await this.http.get<WebApiResponse<ActivoSelectItemDTO>>(`${this.urlController}/GetAllNumerosSimcard`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPlanDatosByNumeroSimcard(id: Number): Promise<WebApiResponse<ActivoSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoSelectItemDTO>>(`${this.urlController}/GetPlanDatosByNumeroSimcard/${id}`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllProveedores(): Promise<WebApiResponse<ActivoSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoSelectItemDTO>>(`${this.urlController}/GetAllProveedores`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllAddendasByProveedor(nIdProveedor: Number, nIdTipoDispositivo: Number): Promise<WebApiResponse<ActivoSelectItemAddendaDTO>> {
    try {
      const params = new HttpParams()
        .set('nIdProveedor', nIdProveedor.toString())
        .set('nIdTipoDispositivo', nIdTipoDispositivo.toString());
      return (await this.http.get<WebApiResponse<ActivoSelectItemAddendaDTO>>(`${this.urlController}/GetAllAddendasByProveedor/`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetDetalleByAddenda(nIdAddenda: Number, nIdTipoDispositivo: Number): Promise<WebApiResponse<ActivoDetalleAddendaDTO>> {
    try {
      const params = new HttpParams()
        .set('nIdAddenda', nIdAddenda.toString())
        .set('nIdTipoDispositivo', nIdTipoDispositivo.toString());
      return (await this.http.get<WebApiResponse<ActivoDetalleAddendaDTO>>(`${this.urlController}/GetDetalleByAddenda/`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
  async GetAllArticulosByAddenda(nIdAddenda: Number, nIdTipoDispositivo: Number): Promise<WebApiResponse<ActivoSelectItemArticuloDTO>> {
    try {
      const params = new HttpParams()
        .set('nIdAddenda', nIdAddenda.toString())
        .set('nIdTipoDispositivo', nIdTipoDispositivo.toString());
      return (await this.http.get<WebApiResponse<ActivoSelectItemArticuloDTO>>(`${this.urlController}/GetAllArticulosByAddenda/`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllPlanDatosOperadores(): Promise<WebApiResponse<ActivoPlanDatosOperadorDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoPlanDatosOperadorDTO>>(`${this.urlController}/GetAllPlanDatosOperadores/`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllPartesDesktop(): Promise<WebApiResponse<ActivoSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoSelectItemDTO>>(`${this.urlController}/GetAllPartesDesktop`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetDetalleDesktopByActivo(nIdActivo: number): Promise<WebApiResponse<ActivoDetalleDesktopDTO>> {
    try {
      const params = new HttpParams().set('nIdActivo', nIdActivo.toString());
      return (await this.http.get<WebApiResponse<ActivoDetalleDesktopDTO>>(`${this.urlController}/GetDetalleDesktopByActivo`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllCargaMasivaPendientes(nIdTipoActivo: number): Promise<WebApiResponse<ActivoExcelLaptopDesktopCabeceraDTO>> {
    try {
      const params = new HttpParams().set("nIdTipoActivo", nIdTipoActivo.toString());
      return (await this.http.get<WebApiResponse<ActivoExcelLaptopDesktopCabeceraDTO>>(`${this.urlController}/GetAllCargaMasivaPendientes`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllElementosCargaMasiva(nIdAddenda: number, nIdTipoActivo): Promise<WebApiResponse<ActivoExcelLaptopDesktopDTO>> {
    try {
      const params = new HttpParams()
        .set('nIdAddenda', nIdAddenda.toString())
        .set('nIdTipoActivo', nIdTipoActivo.toString());
      return (await this.http.get<WebApiResponse<ActivoExcelLaptopDesktopDTO>>(`${this.urlController}/GetAllElementosCargaMasiva`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllSubArticulosDesktop(nIdDetAddenda: number): Promise<WebApiResponse<ActivoDetalleDesktopDTO>> {
    try {
      const params = new HttpParams().set('nIdDetAddenda', nIdDetAddenda.toString());
      return (await this.http.get<WebApiResponse<ActivoDetalleDesktopDTO>>(`${this.urlController}/GetAllSubArticulosDesktop`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoDetalleDesktopDTO>(error);
    }
  }

  async GetAllResumenActivos(): Promise<WebApiResponse<ActivoResumenDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoResumenDTO>>(`${this.urlController}/GetAllResumenActivos`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoResumenDTO>(error);
    }
  }

  async GetAllArticulosByTipoDispositivo(nIdTipoDispositivo: number): Promise<WebApiResponse<ActivoSelectItemArticuloDTO>> {
    try {
      const params = new HttpParams().set("nIdTipoDispositivo", nIdTipoDispositivo.toString());
      return (await this.http.get<WebApiResponse<ActivoSelectItemArticuloDTO>>(`${this.urlController}/GetAllArticulosByTipoDispositivo`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoSelectItemArticuloDTO>(error);
    }
  }

  async GetAllEstadosActivo(): Promise<WebApiResponse<ActivoSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoSelectItemDTO>>(`${this.urlController}/GetAllEstadosActivo`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetDescripcionActivo(nIdActivo: number): Promise<WebApiResponse<string>> {
    try {
      const params = new HttpParams().set("nIdActivo", nIdActivo.toString());
      return (await this.http.get<WebApiResponse<string>>(`${this.urlController}/GetDescripcionActivo`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetActivosRelacionadosByActivo(nIdActivo: number): Promise<WebApiResponse<ActivoExcelLaptopDesktopCabeceraDTO>> {
    try {
      const params = new HttpParams().set("nIdActivo", nIdActivo.toString());
      return (await this.http.get<WebApiResponse<ActivoExcelLaptopDesktopCabeceraDTO>>(`${this.urlController}/GetActivosRelacionadosByActivo`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllTipoActivosRepotenciacion(): Promise<WebApiResponse<ActivoSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoSelectItemDTO>>(`${this.urlController}/GetAllTipoActivosRepotenciacion`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllPersonal(): Promise<WebApiResponse<ActivoSelectItemDTO>> {
    try {
      const params = new HttpParams();
      return (await this.http.get<WebApiResponse<ActivoSelectItemDTO>>(`${this.urlController}/GetAllPersonal`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllCaracteristicasRepotenciacion(nIdActivo: Number):  Promise<WebApiResponse<ActivoCaracteristicasDTO>> { 
    try {
      const params = new HttpParams().set('nIdActivo', nIdActivo.toString());
      return (await this.http.get<WebApiResponse<ActivoCaracteristicasDTO>>(`${this.urlController}/GetAllCaracteristicasRepotenciacion`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async ValidateNumeroSerie(sSerie: string): Promise<WebApiResponse<boolean>> {
    try {
      const params = new HttpParams().set('sSerie', sSerie.toString());
      return (await this.http.get<WebApiResponse<boolean>>(`${this.urlController}/ValidateNumeroSerie`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<boolean>(error);
    }
  }

  async ValidatePartNumber(sNumeroParte: string): Promise<WebApiResponse<boolean>> {
    try {
      const params = new HttpParams().set('sNumeroParte', sNumeroParte.toString());
      return (await this.http.get<WebApiResponse<boolean>>(`${this.urlController}/ValidatePartNumber`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<boolean>(error);
    }
  }

  async CreateActivoSimcard(model: ActivoSimcardTIDTO):  Promise<WebApiResponse<ActivoRegistroDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<ActivoRegistroDTO>>(`${this.urlController}/CreateActivoSimcard`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDTO>(error)
    }
  }

  async UpdateActivoSimcard(model: ActivoSimcardTIDTO):  Promise<WebApiResponse<ActivoRegistroDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<ActivoRegistroDTO>>(`${this.urlController}/UpdateActivoSimcard/${model.nIdActivo}`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDTO>(error)
    }
  }

  async CreateActivoMovil(model: ActivoMovilTIDTO):  Promise<WebApiResponse<ActivoRegistroDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<ActivoRegistroDTO>>(`${this.urlController}/CreateActivoMovil`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDTO>(error)
    }
  }

  async UpdateActivoMovil(model: ActivoMovilTIDTO):  Promise<WebApiResponse<ActivoRegistroDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<ActivoRegistroDTO>>(`${this.urlController}/UpdateActivoMovil/${model.nIdActivo}`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDTO>(error)
    }
  }

  async CreateActivoLaptopDesktop(model: ActivoLaptopDesktopTIDTO):  Promise<WebApiResponse<ActivoRegistroDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<ActivoRegistroDTO>>(`${this.urlController}/CreateActivoLaptopDesktop`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDTO>(error)
    }
  }

  async UpdateActivoLaptopDesktop(model: ActivoLaptopDesktopTIDTO):  Promise<WebApiResponse<ActivoRegistroDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<ActivoRegistroDTO>>(`${this.urlController}/UpdateActivoLaptopDesktop/${model.nIdActivo}`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDTO>(error)
    }
  }

  async CreateActivoLaptopDesktopMasivo(list: ActivoLaptopDesktopTIDTO[]):  Promise<WebApiResponse<ActivoRegistroDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<ActivoRegistroDTO>>(`${this.urlController}/CreateActivoLaptopDesktopMasivo`, JSON.stringify(list),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDTO>(error)
    }
  }

  async UpdateActivoLaptopDesktopMasivo(list: ActivoLaptopDesktopTIDTO[]):  Promise<WebApiResponse<ActivoRegistroDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<ActivoRegistroDTO>>(`${this.urlController}/UpdateActivoLaptopDesktopMasivo`, JSON.stringify(list),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<ActivoRegistroDTO>(error)
    }
  }

  async CreateActivoDesktop(model: ActivoDesktopTIDTO):  Promise<WebApiResponse<ActivoRegistroDesktopDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<ActivoRegistroDesktopDTO>>(`${this.urlController}/CreateActivoDesktop`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDesktopDTO>(error)
    }
  }

  async CreateActivoDesktopMasivo(list: ActivoDesktopTIDTO[]):  Promise<WebApiResponse<ActivoRegistroDesktopDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<ActivoRegistroDesktopDTO>>(`${this.urlController}/CreateActivoDesktopMasivo`, JSON.stringify(list),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDesktopDTO>(error)
    }
  }

  async UpdateActivoDesktop(model: ActivoDesktopTIDTO):  Promise<WebApiResponse<ActivoRegistroDesktopDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<ActivoRegistroDesktopDTO>>(`${this.urlController}/UpdateActivoDesktop/${model.nIdActivo}`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDesktopDTO>(error)
    }
  }

  async UpdateActivoDesktopMasivo(list: ActivoDesktopTIDTO[]):  Promise<WebApiResponse<ActivoRegistroDesktopDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<ActivoRegistroDesktopDTO>>(`${this.urlController}/UpdateActivoDesktopMasivo`, JSON.stringify(list),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<ActivoRegistroDesktopDTO>(error)
    }
  }

  async UpdateActivoDarBaja(activo: ActivoRegistroDTO):  Promise<WebApiResponse<ActivoRegistroDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<ActivoRegistroDTO>>(`${this.urlController}/UpdateActivoDarBaja/`, JSON.stringify(activo),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRegistroDTO>(error)
    }
  }

  async CreateActivoOtros(list: ActivoRegistroDTO[]):  Promise<WebApiResponse<ActivoRegistroDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<ActivoRegistroDTO>>(`${this.urlController}/CreateActivoOtros`, JSON.stringify(list),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return this.handError<ActivoRegistroDTO>(error)
    }
  }

  async CreateActivoRelacionado(model: ActivoRelacionadoDTO):  Promise<WebApiResponse<ActivoRelacionadoDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<ActivoRelacionadoDTO>>(`${this.urlController}/CreateActivoRelacionado`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRelacionadoDTO>(error)
    }
  }

  async UpdateActivoRelacionado(model: ActivoRelacionadoDTO):  Promise<WebApiResponse<ActivoRelacionadoDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.put<WebApiResponse<ActivoRelacionadoDTO>>(`${this.urlController}/UpdateActivoRelacionado`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ActivoRelacionadoDTO>(error)
    }
  }

  async GenerarExcelLaptopDesktop(data: ActivoExcelLaptopDesktopDTO[], nIdTipoActivo: number): Promise<Blob>{
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const responseType = 'blob' as 'json';
      return (await this.http.post<Blob>(`${this.urlController}/GenerarExcelLaptopDesktop/${nIdTipoActivo}`, data,
      { headers: httpHeaders, responseType: responseType }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
    }
  }

  async GenerarExcelSimcard(data: ActivoExcelSimcardDTO[]): Promise<Blob>{
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const responseType = 'blob' as 'json';
      return (await this.http.post<Blob>(`${this.urlController}/GenerarExcelSimcard/`, data,
      { headers: httpHeaders, responseType: responseType }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
    }
  }

  async GenerarExcelDescuentosPersonalActivos(data: ActivoDescuentosPersonalDTO): Promise<Blob>{
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const responseType = 'blob' as 'json';
      return (await this.http.post<Blob>(`${this.urlController}/GenerarExcelDescuentosPersonalActivos/`, data,
      { headers: httpHeaders, responseType: responseType }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return null;
    }
  }

  async GenerarExcelAsignaciones(nIdTipo: number): Promise<Blob>{
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const responseType = 'blob' as 'json';
      return (await this.http.post<Blob>(`${this.urlController}/GenerarExcelAsignaciones/`, nIdTipo,
      { headers: httpHeaders, responseType: responseType }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
      return null;
    }
  }
}

