import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BaseService } from '../base-service';
import { WebApiResponse } from '../models/apiResponse';
import { ArticuloRqHerramientaDTO, HistorialEstadoRqHerramienta, PartidaRqHerramientaDTO, PersonalRqHerramientaDTO, PresupuestoRqHerramientaDTO, RequerimientoHerramientaCabeceraDTO, RequerimientoHerramientaTableDTO, RequerimientoHerramientaUnoDTO, RqHerramientaEstado } from '../models/requerimientoHerramienta.model';

@Injectable({
  providedIn: 'root'
})
export class RequerimientoHerramientaService extends BaseService {

  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_TIL') baseUrl: string) {
    super();
    this.urlBase = baseUrl + 'RequerimientoHerramienta';
  }

  async GetSolicitante(nIdUsuario: number, nIdEmpresa: number, nIdCentroCosto: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdUsuario', nIdUsuario.toString())
        .set('nIdEmpresa', nIdEmpresa.toString())
        .set('nIdCentroCosto', nIdCentroCosto.toString())


      return await this.http.get<WebApiResponse<PersonalRqHerramientaDTO>>(
        `${this.urlBase}/Solicitante`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<PersonalRqHerramientaDTO>(error)
    }
  }


  async GetPersonalActual(nIdUsuario: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdUsuario', nIdUsuario.toString())

      return await this.http.get<WebApiResponse<PersonalRqHerramientaDTO>>(
        `${this.urlBase}/PersonalActual`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<PersonalRqHerramientaDTO>(error)
    }
  }

  async GetAnios() {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.get<WebApiResponse<string>>(
        `${this.urlBase}/Anios`,
        {
          headers: httpHeaders,
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<string>(error)
    }
  }

  async GetHistorialEstado(nIdGastoCosto: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdGastoCosto', nIdGastoCosto.toString())

      return await this.http.get<WebApiResponse<HistorialEstadoRqHerramienta>>(
        `${this.urlBase}/HistorialEstado`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<HistorialEstadoRqHerramienta>(error)
    }
  }

  async GetPresupuestoBySolicitante(nIdPersonal: number, nIdCentroCosto: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdPersonal', nIdPersonal.toString())
        .set('nIdCentroCosto', (nIdCentroCosto ?? 0).toString());

      return await this.http.get<WebApiResponse<PresupuestoRqHerramientaDTO>>(
        `${this.urlBase}/Presupuesto`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<PresupuestoRqHerramientaDTO>(error)
    }
  }

  async GetAll(nIdEmpresa: number, nIdEstado: number, nIdUsuario: number, sAnio: string) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdEmpresa', nIdEmpresa.toString())
        .set('nIdEstado', nIdEstado.toString())
        .set('nIdUsuario', nIdUsuario.toString())
        .set('sAnio', sAnio);

      return await this.http.get<WebApiResponse<RequerimientoHerramientaTableDTO>>(
        `${this.urlBase}`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<RequerimientoHerramientaTableDTO>(error)
    }
  }

  async GetById(nIdEmpresa: number, nIdRq: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdEmpresa', nIdEmpresa.toString());

      return await this.http.get<WebApiResponse<RequerimientoHerramientaUnoDTO>>(
        `${this.urlBase}/${nIdRq}`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<RequerimientoHerramientaUnoDTO>(error)
    }
  }

  async GetArticulos(nIdCargo: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdCargo', nIdCargo.toString());

      return await this.http.get<WebApiResponse<ArticuloRqHerramientaDTO>>(
        `${this.urlBase}/Articulo`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ArticuloRqHerramientaDTO>(error)
    }
  }

  async GetPartidaByArticulo(nIdArticulo: number, sIdPais: string) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdArticulo', nIdArticulo.toString())
        .set('sIdPais', sIdPais.toString());

      return await this.http.get<WebApiResponse<PartidaRqHerramientaDTO>>(
        `${this.urlBase}/Partida`,
        {
          headers: httpHeaders,
          params
        }
      ).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<PartidaRqHerramientaDTO>(error)
    }
  }

  async ValidarSaldoPpto(nIdCentroCosto: number, nIdSucursal: number, nIdPartida: number,
    sAnio: string, nMes: number, nTotal: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdCentroCosto', nIdCentroCosto.toString())
        .set('nIdSucursal', nIdSucursal.toString())
        .set('nIdPartida', nIdPartida.toString())
        .set('sAnio', sAnio.toString())
        .set('nMes', nMes.toString())
        .set('nTotal', nTotal.toString())

      return await this.http.get<WebApiResponse<string>>(
        `${this.urlBase}/ValidacionSaldoPpto`,
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

  async ValidacionActivoAsignado(nIdPersonal: number, nIdArticulo: number) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = new HttpParams().set('nIdPersonal', nIdPersonal.toString())
        .set('nIdArticulo', nIdArticulo.toString())

      return await this.http.get<WebApiResponse<string>>(
        `${this.urlBase}/ValidacionActivoAsignado`,
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

  async InsertRqHerramienta(model: RequerimientoHerramientaCabeceraDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.post<WebApiResponse<RequerimientoHerramientaCabeceraDTO>>(
        `${this.urlBase}/Requerimiento`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<RequerimientoHerramientaCabeceraDTO>(error)
    }
  }

  async UpdateRQHerramienta(model: RequerimientoHerramientaCabeceraDTO) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<RequerimientoHerramientaCabeceraDTO>>(
        `${this.urlBase}/Requerimiento`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<RequerimientoHerramientaCabeceraDTO>(error)
    }
  }
  //RqHerramientaEstado
  async EnviarRqHerramienta(model: RqHerramientaEstado) {
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      return await this.http.put<WebApiResponse<RqHerramientaEstado>>(
        `${this.urlBase}/Enviar`,
        JSON.stringify(model),
        { headers: httpHeaders }).toPromise();

    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<RqHerramientaEstado>(error)
    }
  }
}
