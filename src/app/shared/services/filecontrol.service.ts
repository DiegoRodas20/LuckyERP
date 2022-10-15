
import { Component, Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FilecontrolService {

  constructor(private http: HttpClient) { }

  //Funcion para cargar el archivo a Azure mediante el controller 
  fnUploadFile(file: any, type: any, area: any,  url: string): Observable<HttpEvent<{}>> {
    const urlEndpoint = url + 'ErpController/uploadFile';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      archivo: file,
      type: type,
      area: area,
    }
    
    const req = new HttpRequest('POST', urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
      reportProgress: true
    });

    return this.http.request(req);
  }

  //Funcion para descargar el archivo de Azure mediante el controller
  fnDownload(file: string, type: string, area: any, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpController/dowloandFiles';

    const params = '?filename=' + file + '&type=' + type + '&area=' + area;
    return this.http.get(urlEndpoint + params, { responseType: "blob" });
  }

  fnUploadFileIMG(file: any, type: any, area: any,  url: string){
    const urlEndpoint = url + 'ErpController/uploadFile';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      archivo: file,
      type: type,
      area: area,
    }
    
    const req = new HttpRequest('POST', urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
      reportProgress: true
    });

    return this.http.request(req);
  }
}
