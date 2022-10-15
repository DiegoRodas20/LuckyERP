import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import moment from 'moment';
import { colorsDetail, CustomResponse, ISelectItem } from 'src/app/modulos/AAHelpers';
import { AbsenceDto, AbsenceRequest } from '../Model/Igestioni';
import { ControlAbsenceDto, ControlAbsenceRequest, ControlIDto, ControlPersonalDto, EControlAbsence, EControlAbsenceEstado } from '../Model/lcontroli';

@Injectable({
  providedIn: 'root'
})
export class ControliService {

  url: string;

  constructor(private http: HttpClient, @Inject('BASE_URL_EyGH') baseUrl: string) {
    this.url = baseUrl + 'ControlAbsence';
  }

  async GetAllSearch(nIdEmpresa: number, dDevengue: Date) {
    try {
      const params = new HttpParams()
        .set('nIdEmpresa', JSON.stringify(nIdEmpresa))
        .set('dDevengue', dDevengue ? moment(dDevengue)?.format('YYYY-MM-DD') : '');
      const res = await this.http.get<CustomResponse<ControlIDto>>(`${this.url}/GetAllSearch`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async getAllItems(controlIEnum: EControlAbsence, nIdEmpresa: number, sIdPais: string) {
    try {
      const params = new HttpParams()
        .set('controlIEnum', JSON.stringify(controlIEnum))
        .set('nIdEmpresa', JSON.stringify(nIdEmpresa))
        .set('sIdPais', sIdPais);
      const res = await this.http.get<CustomResponse<ISelectItem[]>>(`${this.url}/GetAllItems`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAbsencesByPersonal(nIdPersonal: number, nIdEmpresa: number, dDevengue?: Date) {
    try {
      const params = new HttpParams()
        .set('nIdPersonal', JSON.stringify(nIdPersonal))
        .set('nIdEmpresa', JSON.stringify(nIdEmpresa))
        .set('dDevengue', dDevengue ? moment(dDevengue)?.format('YYYY-MM-DD') : '');
      const res = await this.http.get<CustomResponse<ControlAbsenceDto[]>>(`${this.url}/GetAbsencesByPersonal`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async ReviewAbsence(request: ControlAbsenceRequest) {
    try {
      const res = await this.http.post<CustomResponse<boolean>>(`${this.url}/ReviewAbsence`, request).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAbsenceChanges(nId: number) {
    try {
      const params = new HttpParams()
        .set('nId', JSON.stringify(nId))
      const res = await this.http.get<CustomResponse<ControlIDto>>(`${this.url}/GetAbsenceChanges`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async CreateAbsenceFromPlla(request: AbsenceRequest) {
    try {
      const res = await this.http.post<CustomResponse<AbsenceDto>>(`${this.url}/CreateAbsenceFromPlla`, request).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetSearchPersonal(nIdEmpresa: number) {
    try {
      const params = new HttpParams()
        .set('nIdEmpresa', JSON.stringify(nIdEmpresa))
      const res = await this.http.get<CustomResponse<ControlPersonalDto[]>>(`${this.url}/GetSearchPersonal`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  fnMapCalendarEvent(inasistencias: ControlAbsenceDto[]): CalendarEvent<ControlAbsenceDto>[] {
    return inasistencias.map(item => {
      const event: CalendarEvent = {
        start: moment(item.dFecha).toDate(),
        end: moment(item.dFecha).toDate(),
        color: colorsDetail[item.nIdEstado - EControlAbsenceEstado.PENDIENTE],
        title: item.sMotivo,
        allDay: true,
        draggable: false,
        meta: item
      }
      return event;
    });
  }
}
