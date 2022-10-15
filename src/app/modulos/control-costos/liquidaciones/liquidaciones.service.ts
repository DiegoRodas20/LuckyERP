import { Component, Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { LiquidacionExportExcel } from './models/liquidacionExportar.model';

@Injectable({
  providedIn: 'root'
})
export class LiquidacionesService {

  constructor(private http: HttpClient) { }

  fnExcelDownload(pOpcion: string, pParametro: any, url: string): Observable<any> {
    const urlEndpoint = url + 'AutoLiquidacionService/dowloandExcelAutoLiquidacion';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const params = '?pOpcion=' + pOpcion + '&pParametro=' + pParametro.join('|') ;
 
    return this.http.get(urlEndpoint+ params, { headers: httpHeaders, responseType: 'blob'});
   } 

  async _loadAutoLiquidacion(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AutoLiquidacionService/GetAutoLiquidacion';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnControlAval(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string) {
    const urlEndPoint = url + 'ErpController/ControlAval';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    };

    return  this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
  }

  fnControlAval2(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string) {
    const urlEndPoint = url + 'ErpController/ControlAval';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    };

    return  this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  fnLiquidaEfectivo(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, pDetalle: any, pDetalle2: any,  url: string) {
    const urlEndPoint = url + 'ErpController/LiquidaEfectivo';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    if(pDetalle == 0 )
    {
      const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo,
        listDetalle: pDetalle,
        pDetalle2: pDetalle2.join('|'),
      };
      //console.log(params)
      return  this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
    }
    else
    {
      const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo,
        oDetalle: pDetalle,
        pDetalle2: pDetalle2.join('|'),
      };
      // console.log(params)
      return  this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
    }
  }

  fnImpresionPorAsiento(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Promise<any>{
    const urlEndPoint = url + 'ErpController/ImpresionAsiento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
      pTipo: pTipo
    };
    //console.log(params)
    return this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();

  }

  fnDescargarExcelLiquidacion(lista: any[], url: string, nEmpresa: string): Promise<any> {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const responseType = 'blob' as 'json';
    const urlEndpoint = url + 'ErpController/DescargarExcelLiquidacion';

    let listaExport: LiquidacionExportExcel[] = []
    lista.forEach(liquidacion => {
      listaExport.push({
        Periodo: liquidacion.sAnio,
        Mes: liquidacion.sMes,
        Centro_Costo: liquidacion.sCentroCosto,
        Doc_Numero: liquidacion.sNumero,
        Doc_Solicitante: liquidacion.sDniSolicitante,
        Solicitante: liquidacion.sNombreSolicitante,
        Doc_Depositario: liquidacion.sDocDepositario,
        Depositario: liquidacion.sNombreCompletoDepositario,
        Sucursal: liquidacion.sSucursal,
        Nro_Rq_Nuevo: liquidacion.sNroRqNew,
        Concepto: liquidacion.sTitulo,
        Moneda: liquidacion.sMoneda,
        Total_RQ: liquidacion.nTotalRq,
        Liquidado: liquidacion.nLiquidado,
        Devolucion_Caja: liquidacion.nDevolucion,
        Devolucion_Banco: liquidacion.nDevolucionBanco,
        Descuento: liquidacion.nDescuento,
        Reembolso: liquidacion.nReembolsable,
        Debe: liquidacion.nDebe,
        Estado: liquidacion.sEstadoRq,
        Rq_Fecha_Ini: liquidacion.sFechaIni,
        Rq_Fecha_Fin: liquidacion.sFechaFin,
        Cliente: liquidacion.sCliente,
        Banco: liquidacion.sBanco,
        Cuenta: liquidacion.sCuenta,
        })
    });

    //console.log(lista)
    //console.log(listaExport)

    const params = {
      lista: listaExport,
      sEmpresa: nEmpresa
    }
    //console.log(params)
    return this.http.post<Blob>( urlEndpoint,  JSON.stringify(params) , { headers: httpHeaders, responseType: responseType}).toPromise();

  }

  async print(pEntidad: number,pOpcion: number, pParametro: any, pTipo: number, url: string) {
    const urlEndPoint = url + 'ErpController/GetControlDescuento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join("|"),
        pTipo: pTipo
    };
    console.log(params);
    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' }).toPromise();
  }

}


