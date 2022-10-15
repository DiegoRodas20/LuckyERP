import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpHeaders, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AzureSCService {
  private baseUrl = '';

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl + 'ErpController';
  }

  fnUploadFile(file: any, type: any, name: any): Observable<any> {
    const urlEndPoint = this.baseUrl + '/uploadFileSC';
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    const params = {
      archivo: file,
      type: type,
      name: name
    };
    return this.http.post(urlEndPoint, JSON.stringify(params), {headers: httpHeaders});
  }
  fnDeleteFile(url: string): Observable<any> {
    const urlEndPoint = this.baseUrl + '/deleteFileSC';
    const httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    const params = {
      url: url
    };
    return this.http.post(urlEndPoint, JSON.stringify(params), {headers: httpHeaders});
  }
}
