import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PdfpteService {
  private baseUrl = '';
  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl + 'api/spdfcotizacion';
  }
  htmlInsert(html): Observable<any> {
    const urlEndPoint = this.baseUrl + '/spdf';
    return this.http.post(urlEndPoint, html, {responseType: 'blob'} );
  }
}
