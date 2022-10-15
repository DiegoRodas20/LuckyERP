import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject  } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';   
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class SerPresupuestoService {

  constructor(private http: HttpClient) { }
 

  async fnPresupuesto(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'ComercialService/Presupuesto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }
    
  fnPresupuestoCrud(pOpcion: string, pParametro: any, url: string): Observable<any> {

    const urlEndpoint = url + 'ComercialService/Presupuesto';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = { 
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    }

    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders });
  }

  fnExcelDownload(pOpcion: string, pParametro: any, url: string): Observable<any> {
    const urlEndpoint = url + 'ComercialService/dowloandExcelPre';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const params = '?pOpcion=' + pOpcion + '&pParametro=' + pParametro.join('|') ; 
 
    return this.http.get(urlEndpoint+ params, { headers: httpHeaders, responseType: 'blob'});
  } 

  fnExcelDownloadTwo(pOpcion: string, pParametro: any, url: string): Observable<any> {
    const urlEndpoint = url + 'ComercialService/dowloandExcelPre';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const params = '?pOpcion=' + pOpcion + '&pParametro=' + pParametro.join('|') ; 
 
    return this.http.get(urlEndpoint+ params, {
      headers: httpHeaders, // Any custom client side headers like Authorization
      observe: 'response',
      responseType: 'arraybuffer'
    });
  } 

  async exportAsExcelFile(json: any[], excelFileName: string){
    let vLista = [] 
    json.forEach(historico => { 
      vLista.push({
        'Nro Ppto': historico.pCodCC,
        'Nombre del Ppto': historico.pDescCC,
        'F.Inicio': historico.pdFecIni,
        'F.Fin': historico.pdFecFin, 
        'RUC Cliente': historico.sRuc, 
        'R.Social Client': historico.pNomCom, 
        'Canal': historico.sCanal,
        'Sub Canal': historico.sSubCanal, 
        'Servicio': historico.pServicio, 
        'Dir. General': historico.sDirGen,
        'Dir.Cuentas': historico.sDirCue, 
        'Ger. Cuentas': historico.sGerCue,
        'Ejecutivo 1': historico.sEje, 
        'Cant. ciudades': historico.pCantidad,
        'Costo Total': historico.cCosto, 
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
