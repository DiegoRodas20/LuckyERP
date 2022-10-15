import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ReembolsoService {

  constructor(private http: HttpClient) { }

  fnSctr(pOpcion: number, pParametro: any, url: string): Observable<any> {
    const urlEndpoint = url + 'RequerimientoService/rqReembolso';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { 
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    } 
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }


  async exportAsExcelFile(json: any[], excelFileName: string){
    let vLista = [] 
    json.forEach(historico => { 
      vLista.push({
        'PPTO': historico.sCodCC,
        'Nombre PPTO': historico.sDescCC,
        'Nro': historico.nNumero,
        'Título': historico.sTitulo,
        'Enviado': historico.dFechaIni,
        'Total': historico.nReembolsable,
        'Estado': historico.cEleNam,
        })
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(vLista);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);

  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_Excel_' + new Date().getTime() + EXCEL_EXTENSION);
  }   
}
