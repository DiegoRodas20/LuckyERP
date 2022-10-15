import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ParametroProcedureInterface } from '../datobasico/interfaces/parametroProcedure';

@Injectable({
  providedIn: 'root'
})
export class TrasladoDocumentoService {

  private myUrl: string;
  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string ) { 
    this.myUrl = baseUrl + 'ErpParametro/';
  }

  // Centro Costo
  listarCabeceraDocumentos(opcion: number, pParametro: string ) {
    let parametro: ParametroProcedureInterface;
    /*
      1: Obtenemos los documentos de cabecera
      2: Obtenemos los documentos del detalle de la cabecera
      5: Obtenemos el nombre, estado y cliente del centro de costo
      6: Validar presupuesto
      7: Obtenemos los presupuesto del cliente
    */
   parametro = {
    pEntidad: 1,
    pTipo: 1,
    pOpcion: opcion,
    pParametro: pParametro,
    pParametroDet: ''
  };
    const url = this.myUrl + 'trasladoDocumento';
    return this.http.post(url, parametro).toPromise();
  }

  actualizarPresupuesto(opcion: number, pParametro: string, pParametroDet: string ) {
    let parametro: ParametroProcedureInterface;
    /*
      1: Actualizar Presupuesto
    */
    parametro = {
      pEntidad: 1,
      pTipo: 2,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: pParametroDet
    };
    const url = this.myUrl + 'trasladoDocumento';
    return this.http.post(url, parametro).toPromise();
  }

}
