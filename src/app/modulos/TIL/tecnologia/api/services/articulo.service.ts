import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BaseService } from '../base-service';
import { CustomResponse, WebApiResponse } from '../models/apiResponse';
import { ArticuloDto, ArticuloTI, ArticuloTIPrecioDTO, ArticuloTIResponse } from '../models/articuloDTO';
import { SelecItem } from '../models/tipoElementoDTO';

@Injectable({
  providedIn: 'root'
})
export class ArticuloService extends BaseService{
  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_TIL') baseUrl: string) {
    super();
    this.urlBase = baseUrl + 'Articulo';
  }

  async getAllSearch(sIdPais: string) {
    try {
      const params = new HttpParams().set('sIdPais', sIdPais);
      return (await this.http.get<CustomResponse<ArticuloDto[]>>(`${this.urlBase}/GetAllSearch`, { params }).toPromise()).data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async getAllItem(nParam: number) {
    try {
      const params = new HttpParams().set('artEnum', JSON.stringify(nParam));
      return (await this.http.get<CustomResponse<SelecItem[]>>(`${this.urlBase}/GetAllItem`, { params }).toPromise()).data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllTipoDispositivo(nIdSubFamilia: number) {
    try {
      const params = new HttpParams().set('nIdSubFamilia', JSON.stringify(nIdSubFamilia));
      return (await this.http.get<CustomResponse<SelecItem[]>>(`${this.urlBase}/GetAllTipoDispositivo`, { params }).toPromise()).data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAllPreciosArticulo(nIdArticulo: Number):  Promise<WebApiResponse<ArticuloTIPrecioDTO>> { 
    try {
      const params = new HttpParams().set('nIdArticulo', nIdArticulo.toString());
      return (await this.http.get<WebApiResponse<ArticuloTIPrecioDTO>>(`${this.urlBase}/GetAllPreciosArticulo`, { params }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async getOne(sIdPais: string, nId: number) {
    try {
      const params = new HttpParams().set('sIdPais', sIdPais);
      return (await this.http.get<CustomResponse<ArticuloTI>>(`${this.urlBase}/GetOne/${nId}`, { params }).toPromise()).data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async create(request: ArticuloTI) {
    try {
      const res = await this.http.post<CustomResponse<ArticuloTIResponse>>(`${this.urlBase}/Create`, request).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async update(id: number, request: ArticuloTI) {
    try {
      const res = await this.http.patch<CustomResponse<string>>(`${this.urlBase}/Update/${id}`, request).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async CreatePrecioArticulo(model: ArticuloTIPrecioDTO):  Promise<WebApiResponse<ArticuloTIPrecioDTO>> { 
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return (await this.http.post<WebApiResponse<ArticuloTIPrecioDTO>>(`${this.urlBase}/CreatePrecioArticulo`, JSON.stringify(model),
      { headers: httpHeaders }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error.status);
      return this.handError<ArticuloTIPrecioDTO>(error)
    }
  }

  async GenerarExcelListaArticulos(sIdPais: string, bTieneImagen: boolean): Promise<Blob>{
    try {
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const responseType = 'blob' as 'json';
      return (await this.http.post<Blob>(`${this.urlBase}/GenerarExcelListaArticulos/${sIdPais}`, null,
      { headers: httpHeaders, responseType: responseType }).toPromise());
    } catch (error) {
      console.log('Error Status: ', error);
    }
  }
  
}
