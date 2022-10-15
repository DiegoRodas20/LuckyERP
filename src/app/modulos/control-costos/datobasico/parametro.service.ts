import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ParametroProcedureInterface, Partida } from './interfaces/parametroProcedure';

@Injectable({
  providedIn: 'root'
})
export class ParametroService {

  private myUrl: string;
  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string ) { 
    this.myUrl = baseUrl + 'ErpParametro/';
  }

  // Grupo
  listarPartidasGenericas(parametro: ParametroProcedureInterface) {
    const url = this.myUrl + 'partida';
    return this.http.post(url, parametro).toPromise();
  }

  listarItemsPartidaGenericaById(parametro: ParametroProcedureInterface) {
    const url = this.myUrl + 'partida';
    return this.http.post(url, parametro).toPromise();
  }

  listarGrupoTipoPartida(parametro: ParametroProcedureInterface) {
    const url = this.myUrl + 'partida';
    return this.http.post(url, parametro).toPromise();
  }

  // Partidas especificas

  listarPartidaEspecificaGenerida(parametro: ParametroProcedureInterface) {
    const url = this.myUrl + 'partida';
    return this.http.post(url, parametro).toPromise();
  }

  listarPartidaEspecificaGenericaItem(parametro: ParametroProcedureInterface){
    const url = this.myUrl + 'partida';
    return this.http.post(url, parametro).toPromise();
  }

  // Inserts o Update
  insertarGrupoPartida(parametro: ParametroProcedureInterface) {
    const url = this.myUrl + 'partida';
    return this.http.post(url, parametro).toPromise();
  }

  // --------------------------------------------------------------------------
  // Parametros Tope de gasto en Movilidades
  // --------------------------------------------------------------------------

   obtenerParametrosCRUD(opcion: number, pParametro: string ) {
    let parametro: ParametroProcedureInterface;
    /*
      POpcion
      1: Obtenemos data de parametros
      2: Obtenemos a los trabajadores
      3: Obtenemos los cargos que hay
      4: Obtenemos los clientes por país
      5: Obtenemos la lista de topes por persona
      6: Obtenemos la lista de topes por cargo
      7: Obtenemos la lista de topes por cliente
      8: Obtenemos los presupuesto costo fijo
    */
    parametro = {
      pEntidad: 3,
      pTipo: 1,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrl + 'parametros';
    return this.http.post(url, parametro).toPromise();
   }

   insertOrUpdateParametrosMovil(opcion: number, pParametro : string){
    let parametro: ParametroProcedureInterface;
    /*
      POpcion
      1: Cargo
      2: Personal
      3: Actualizar Parametros de movilidad
      4: Agregamos un cargo
      5: Insertar Clientes
      6: Actualizamos el tope diario y mensual de un cliente
      7: Actualizamos parametros de presupuesto
      8: Eliminar Cargo
    */
    parametro = {
      pEntidad: 3,
      pTipo: 2,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrl + 'parametros';
    return this.http.post(url, parametro).toPromise();
   }


}
