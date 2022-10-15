import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GestionceService {

  urlBase = '';

  constructor(private http: HttpClient, @Inject('BASE_URL_EyGH') baseUrl: string) {
    this.urlBase = baseUrl;
  }

  async GetAccrue(companyId: number) {
    try {
      const params = new HttpParams()
        .set('companyId', JSON.stringify(companyId));
      const response = await this.http.get(`${this.urlBase}CostoEmpresa/Accrue`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetHistory(companyId: number) {
    try {
      const params = new HttpParams()
        .set('companyId', JSON.stringify(companyId));
      const response = await this.http.get(`${this.urlBase}CostoEmpresa/History`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAccrualPending(companyId: number) {
    try {
      const params = new HttpParams()
        .set('companyId', JSON.stringify(companyId));
      const response = await this.http.get(`${this.urlBase}CostoEmpresa/AccrualPending`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetCompanyCost(accrueId: number) {
    try {
      const params = new HttpParams()
        .set('accrueId', JSON.stringify(accrueId));
      const response = await this.http.get(`${this.urlBase}CostoEmpresa/CompanyCost`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async PostInsertCompanyCost(CompanyCost: {}) {
    try {
      const response = await this.http.post(`${this.urlBase}CostoEmpresa/InsertCompanyCost`, CompanyCost).toPromise();
      return response;

    } catch (error) {
      console.log('Error Status: ', error);
    }
  }

  async GetParameter(companyId: number) {
    try {
      const params = new HttpParams()
        .set('companyId', JSON.stringify(companyId));
      const response = await this.http.get(`${this.urlBase}CostoEmpresa/Parameter`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async PostInsertParameter(Parameter: {}) {
    try {
      const response = await this.http.post(`${this.urlBase}CostoEmpresa/InsertParameter`, Parameter).toPromise();
      return response;

    } catch (error) {
      console.log('Error Status: ', error);
    }
  }

  async PostUpdateParameter(Parameter: {}) {
    try {
      const response = await this.http.post(`${this.urlBase}CostoEmpresa/UpdateParameter`, Parameter).toPromise();
      return response;

    } catch (error) {
      console.log('Error Status: ', error);
    }
  }

  async DeleteParameter(parameterId: number) {
    try {
      const params = new HttpParams()
        .set('parameterId', JSON.stringify(parameterId));
      const response = await this.http.delete(`${this.urlBase}CostoEmpresa/DeleteParameter`, { observe: 'response', params }).toPromise();
      return response;

    } catch (error) {
      console.log('Error Status: ', error);
    }
  }

  async GetGroup(countryId: string) {
    try {
      const params = new HttpParams()
        .set('countryId', countryId);
      const response = await this.http.get(`${this.urlBase}CostoEmpresa/Group`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetConcept(countryId: string) {
    try {
      const params = new HttpParams()
        .set('countryId', countryId);
      const response = await this.http.get(`${this.urlBase}CostoEmpresa/Concept`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetSpreadSheet(companyId: number) {
    try {
      const params = new HttpParams()
        .set('companyId', JSON.stringify(companyId));
      const response = await this.http.get(`${this.urlBase}CostoEmpresa/SpreadSheet`, { observe: 'response', params }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

}
