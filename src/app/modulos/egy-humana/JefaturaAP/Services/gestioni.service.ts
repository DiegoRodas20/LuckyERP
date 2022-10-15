import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AbsenceDto, AbsenceHistoricoDto as AbsenceHistoricoDto, AbsenceRequest, EAbsence, FilterMain, PersonalGeneralDto } from '../Model/Igestioni';
import { colorsDetail, CustomResponse, ISelectItem } from 'src/app/modulos/AAHelpers';
import moment from 'moment';
import { CalendarEvent } from 'angular-calendar';
import { EControlAbsenceEstado } from '../Model/lcontroli';

@Injectable({
  providedIn: 'root'
})
export class GestioniService {

  url: string;

  constructor(private http: HttpClient, @Inject('BASE_URL_EyGH') baseUrl: string) {
    this.url = baseUrl + 'Absences';
  }

  async GetAllSearch(nCodUser: number, nIdEmp: number) {
    try {
      const params = new HttpParams()
        .set('nCodUser', JSON.stringify(nCodUser))
        .set('nIdEmp', JSON.stringify(nIdEmp));
      const res = await this.http.get<CustomResponse<PersonalGeneralDto>>(`${this.url}/GetAllSearch`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async getAllItems(absEnum: EAbsence, nIdEmp?: number) {
    try {
      const params = new HttpParams()
        .set('absEnum', JSON.stringify(absEnum))
        .set('nIdEmp', JSON.stringify(nIdEmp ? nIdEmp : 0))
      const res = await this.http.get<CustomResponse<ISelectItem[]>>(`${this.url}/GetAllItems`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async create(request: AbsenceRequest) {
    try {
      const res = await this.http.post<CustomResponse<AbsenceDto>>(`${this.url}/Create`, request).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async update(request: AbsenceRequest, nId: number) {
    try {
      const res = await this.http.put<CustomResponse<AbsenceDto>>(`${this.url}/Update/${nId}`, request).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async delete(nId: number) {
    try {
      const res = await this.http.delete<CustomResponse<boolean>>(`${this.url}/Delete/${nId}`).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAbsencesByPersonal(nIdPersonal: number, dDvActual?: Date) {
    try {
      const params = new HttpParams()
        .set('nIdPersonal', JSON.stringify(nIdPersonal))
        .set('dDvActual', dDvActual ? moment(dDvActual)?.format('YYYY-MM-DD') : '');
      const res = await this.http.get<CustomResponse<AbsenceDto[]>>(`${this.url}/GetAbsencesByPersonal`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAbsencesHistorico(nIdPersonal: number) {
    try {
      const params = new HttpParams()
        .set('nIdPersonal', JSON.stringify(nIdPersonal))
      const res = await this.http.get<CustomResponse<AbsenceHistoricoDto[]>>(`${this.url}/GetAbsencesHistorico`, { params }).toPromise();
      return res.data;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  fnMapCalendarEvent(inasistencias: AbsenceDto[]): CalendarEvent<AbsenceDto>[] {
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

  async _loadSP(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminPersonalService/GetGestionVacacion';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _getPayrollByAbsences(nIdEmp: number) {
    const urlEndPoint = `${this.url}/Payroll`;
    return await this.http.get(`${urlEndPoint}/${nIdEmp}`).toPromise();
  }

  async _getMain(filterMain: FilterMain) {
    const urlEndPoint = `${this.url}/Main?NCompanyId=${filterMain.nCompanyId}&NResponsibleId=${filterMain.nResponsibleId}`;

    return await this.http.get(urlEndPoint).toPromise();
  }

  async _getDevengue(nIdEmp: number) {
    const urlEndPoint = `${this.url}/Devengue`;
    return await this.http.get(`${urlEndPoint}/${nIdEmp}`).toPromise();
  }

  async _getMotive() {
    const urlEndPoint = `${this.url}/Motive`;
    // console.log(urlEndPoint);

    return await this.http.get(urlEndPoint).toPromise();
  }

  async _getHistory(nPersonalId: number) {
    const urlEndPoint = `${this.url}/History`;
    return await this.http.get(`${urlEndPoint}/${nPersonalId}`).toPromise();
  }

  async _crudGV(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminPersonalService/GetCrudGV';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async print(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminPersonalService/GetGestionInasistencia';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' }).toPromise();
  }

}
