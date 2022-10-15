import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CustomResponse, ISelectItem } from 'src/app/modulos/AAHelpers';
import { EDevengue, IPersonalDto, PeriodoDto, PersonalResponse } from '../Model/lcalculop-devengue';

@Injectable({
  providedIn: 'root'
})
export class CalculopDevengueService {
  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_EyGH') baseUrl: string) {
    this.urlBase = baseUrl + 'DevenguePersonal';
  }

  async getAllSearch(nIdDevengue: number) {
    try {
      const params = new HttpParams().set('nIdDevengue', JSON.stringify(nIdDevengue));
      return await this.http.get<CustomResponse<IPersonalDto[]>>(`${this.urlBase}/GetAllSearch`, { params }).toPromise();
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async getAllPeriodos(nIdEmpresa: number) {
    try {
      const params = new HttpParams().set('nIdEmpresa', JSON.stringify(nIdEmpresa));
      const res = await this.http.get<CustomResponse<PeriodoDto>>(`${this.urlBase}/GetAllPeriodos`, { params }).toPromise();
      return res;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async getAllItems(devEnum: EDevengue, nIdEmpresa: number, sIdPais: string) {
    try {
      const params = new HttpParams()
        .set('devEnum', JSON.stringify(devEnum))
        .set('nIdEmpresa', JSON.stringify(nIdEmpresa))
        .set('sIdPais', sIdPais);
      const res = await this.http.get<CustomResponse<ISelectItem[]>>(`${this.urlBase}/GetAllItems`, { params }).toPromise();
      return res;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async closeAccrue(nIdUser: number, sIdPais: string, nIdDevengue: number) {
    try {
      const params = {
        nIdUser: nIdUser,
        sIdPais: sIdPais,
        nIdDevengue: nIdDevengue
      };
      const res = await this.http.patch<CustomResponse<PersonalResponse[]>>(`${this.urlBase}/CloseAccrue`, params).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
}
