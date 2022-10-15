import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { ListaSctr } from '../model/Isctr';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class SctrService {

  constructor(private http: HttpClient) { }

  async fnSctrV2(pOpcion: number, pParametro: any, url: string) {
    const urlEndpoint = url + 'RequerimientoService/rqSctr';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnSctr(pOpcion: number, pParametro: any, url: string): Observable<any> {
    const urlEndpoint = url + 'RequerimientoService/rqSctr';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }


  async exportAsExcelFile(json: any[], excelFileName: string) {
    let vLista = []
    json.forEach(historico => {
      vLista.push({
        'PPTO': historico.sCodCC,
        'Nombre PPTO': historico.sDescCC,
        'Nro': historico.nNumero,
        'Titulo': historico.sTitulo,
        'Enviado': historico.dFechaEnvio,
        'Mes': historico.mes,
        'Total': historico.total.slice(-10, -2),
        'Estado': historico.cEleNam
      })
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(vLista);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);

  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    let hoy: Date = new Date();
    let dia: Number = hoy.getDate();
    let mes: Number = hoy.getMonth() + 1;
    let anio: Number = hoy.getFullYear();
    FileSaver.saveAs(data, fileName + '_Excel_' + dia + "-" + mes + "-" + anio + EXCEL_EXTENSION);
  }

  fnDescargarExcelBrocker(pOpcion: number, pParametro: any, url: string): Observable<any> {
    const urlEndpoint = url + 'RequerimientoService/SctrBrockerExcel';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const params = '?pOpcion=' + pOpcion + '&pParametro=' + pParametro.join('|');

    return this.http.get(urlEndpoint + params, { headers: httpHeaders, responseType: 'blob' });
  }

  //Funcion para cargar el archivo a Azure mediante el controller 
  fnUploadFile(name:string, file: any, type: any, area: any, url: string): Observable<HttpEvent<{}>> {
    const urlEndpoint = url + 'ErpController/uploadFileAzure';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      archivo: file,
      type: type,
      area: area,
      name:name
    }

    const req = new HttpRequest('POST', urlEndpoint, JSON.stringify(params), {
      headers: httpHeaders,
      reportProgress: true
    });

    return this.http.request(req);
  }

  fnDeleteFileAzure(urlEndPoint: string, urlFile: string, area:number): Observable<any> {
    urlEndPoint = urlEndPoint + 'ErpController/deleteFileAzure';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      url: urlFile,
      area: area
    };
    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders });
  }

}
