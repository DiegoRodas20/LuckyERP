import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CalculopService {

  urlBase = '';

  constructor(private http: HttpClient, @Inject('BASE_URL_EyGH') baseUrl: string) {
    this.urlBase = baseUrl;
  }

  async _loadSP(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminPersonalService/GetCalculoPeriodo';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async calcular(nEj: number, nMes: number, nEmp: number, nPlla: number, nTipoPeriodo: number, url: string ) {
    const urlEndPoint = url + 'AdminPersonalService/GetCalculoPersonal';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      nEjercicio: nEj,
      nMes: nMes,
      nIdEmp: nEmp,
      nIdPlla: nPlla,
      nIdTipoPeriodo: nTipoPeriodo
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  // Nomina
  async GetAccrue(companyId: number) {
    try {
      const params = new HttpParams()
        .set('companyId', JSON.stringify(companyId));
      const response = await this.http.get(`${this.urlBase}Payroll/Accrue`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPlanilla(companyId: number, state: string) {
    try {
      const params = new HttpParams()
        .set('companyId', JSON.stringify(companyId))
        .set('state', state);
      const response = await this.http.get(`${this.urlBase}Payroll/Planilla`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetMain(companyId: number, YearMonth: string) {
    try {
      const params = new HttpParams()
        .set('companyId', JSON.stringify(companyId))
        .set('YearMonth', YearMonth);
      const response = await this.http.get(`${this.urlBase}Payroll/Main`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetElementType(countryId: string, tableId: number, state: string) {
    try {
      const params = new HttpParams()
        .set('countryId', countryId)
        .set('tableId', JSON.stringify(tableId))
        .set('state', state);
      const response = await this.http.get(`${this.urlBase}Payroll/ElementType`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPeriod(countryId: string) {
    try {
      const params = new HttpParams()
        .set('countryId', countryId);
      const response = await this.http.get(`${this.urlBase}Payroll/Period`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetDetail(accrueId: number) {
    try {
      const params = new HttpParams()
        .set('accrueId', JSON.stringify(accrueId));
      const response = await this.http.get(`${this.urlBase}Payroll/Detail`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetRegPen(countryId: string, state: string) {
    try {
      const params = new HttpParams()
        .set('countryId', countryId)
        .set('state', state);
      const response = await this.http.get(`${this.urlBase}Payroll/RegimenPensionario`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetOptionPeriod(option: number, periodId: number, accrueId: number) {
    try {
      const params = new HttpParams()
        .set('option', JSON.stringify(option))
        .set('periodId', JSON.stringify(periodId))
        .set('accrueId', JSON.stringify(accrueId));
      const response = await this.http.get(`${this.urlBase}Payroll/OptionPeriod`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPeriodCalculate(pllaId: number, periodId: number, accrueId: number) {
    try {
      const params = new HttpParams()
      .set('pllaId', JSON.stringify(pllaId))
      .set('periodId', JSON.stringify(periodId))
      .set('accrueId', JSON.stringify(accrueId));
      const response = await this.http.get(`${this.urlBase}Payroll/PeriodCalculate`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPeriodDeposit(accrueId: number, periodId: number, pllaId: number) {
    try {
      const params = new HttpParams()
      .set('accrueId', JSON.stringify(accrueId))
      .set('periodId', JSON.stringify(periodId))
      .set('pllaId', JSON.stringify(pllaId));
      const response = await this.http.get(`${this.urlBase}Payroll/PeriodDeposit`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetDepositBank(accrueId: number, periodId: number, pllaId: number) {
    try {
      const params = new HttpParams()
      .set('accrueId', JSON.stringify(accrueId))
      .set('periodId', JSON.stringify(periodId))
      .set('pllaId', JSON.stringify(pllaId));
      const response = await this.http.get(`${this.urlBase}Payroll/DepositBank`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetDepositList(depositPeriodId: number, bankId: number) {
    try {
      const params = new HttpParams()
      .set('depositPeriodId', JSON.stringify(depositPeriodId))
      .set('bankId', JSON.stringify(bankId));
      const response = await this.http.get(`${this.urlBase}Payroll/DepositList`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPeriodInfo(accrueId: number, periodId: number, pllaId: number) {
    try {
      const params = new HttpParams()
      .set('accrueId', JSON.stringify(accrueId))
      .set('periodId', JSON.stringify(periodId))
      .set('pllaId', JSON.stringify(pllaId));
      const response = await this.http.get(`${this.urlBase}Payroll/PeriodInfo`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPeriodList(accrueId: number, periodId: number, pllaId: number) {
    try {
      const params = new HttpParams()
      .set('accrueId', JSON.stringify(accrueId))
      .set('periodId', JSON.stringify(periodId))
      .set('pllaId', JSON.stringify(pllaId));
      const response = await this.http.get(`${this.urlBase}Payroll/PeriodList`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPersonConcept(periodPersonId: number) {
    try {
      const params = new HttpParams()
      .set('periodPersonId', JSON.stringify(periodPersonId));
      const response = await this.http.get(`${this.urlBase}Payroll/PersonConcept`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPersonSalary(personId: number, YearMonth: string, ) {
    try {
      const params = new HttpParams()
      .set('personId', JSON.stringify(personId))
      .set('YearMonth', YearMonth);
      const response = await this.http.get(`${this.urlBase}Payroll/PersonSalary`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPersonDeposit(personId: number, accrueId: number) {
    try {
      const params = new HttpParams()
      .set('personId', JSON.stringify(personId))
      .set('accrueId', JSON.stringify(accrueId));
      const response = await this.http.get(`${this.urlBase}Payroll/PersonDeposit`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }


}
