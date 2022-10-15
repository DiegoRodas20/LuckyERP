import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeclaracionpService {
  urlBase: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.urlBase = baseUrl;
  }

  async _loadSP(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetImpuestosyDeclaraciones';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async print(pOpcion: number, pParametro: any) {

    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetImpuestosyDeclaraciones';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' }).toPromise();
  }

  generarArchivo(pOpcion: number, pParametro: any): Observable<any> {
    //debugger;

    const urlEndPoint = this.urlBase + 'AdminPersonalService/GetImpuestosyDeclaraciones';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' });
  }

  async readFileReport1(urlFileBlobStorage: string) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/ReadFileReport1";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      urlFile: urlFileBlobStorage
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async readFileReport2(urlFileBlobStorage: string) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/ReadFileReport2";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      urlFile: urlFileBlobStorage
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async readFileReport3(urlFileBlobStorage: string) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/ReadFileReport3";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      urlFile: urlFileBlobStorage
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }


  async readFileReport4(urlFileBlobStorage: string) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/ReadFileReport4";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      urlFile: urlFileBlobStorage
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }


  async readFileReport5(urlFileBlobStorage: string) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/ReadFileReport5";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

    const params = {
      urlFile: urlFileBlobStorage
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async _uploadFile(
    file: any,
    nArea: number,
    sName: string,
    sTipo: string
  ) {
    const urlEndPoint = this.urlBase + "AdminPersonalService/UploadFile";
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const params = {
      File: file,
      Tipo: sTipo,
      Area: nArea,
      FileName: sName,
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  // async _excel(pOpcion: number, pParametro: any) {
  //   const urlEndPoint = this.urlBase + "AdminPersonalService/excel_export_p";
  //   const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

  //   const params = {
  //     pOpcion: pOpcion,
  //     pParametro: pParametro.join('|'),
  //   };

  //   return await this.http
  //     .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
  //     .toPromise();
  // }
  // async _eliminarExcel(urlExcel: string, tipo: string) {
  //   const urlEndPoint = this.urlBase + "AdminPersonalService/DeleteFile";
  //   const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });

  //   const params = {
  //     File: urlExcel,
  //     Tipo: tipo,
  //     Area: 8,
  //   };

  //   return await this.http
  //     .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
  //     .toPromise();
  // }
}
