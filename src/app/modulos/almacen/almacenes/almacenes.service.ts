import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ParametroProcedureInterface } from '../../control-costos/datobasico/interfaces/parametroProcedure';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlmacenesService {

  private myUrlAprobacion: string;
  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl) {
    this.myUrlAprobacion = baseUrl + 'ErpLogisticaAlmacen/';
  }

  listarInformacionAlmacen(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    /*
      1: Nos muestra los almacenes de ubicaciones reales direccion y ubigeo, importante el filtro por Pais, ya que todas las empresas del grmismo pais utilizar los mismos almacenes
      2: Nos muestra los almacenes físicos
    */
    parametro = {
      pEntidad: 1,
      pTipo: 1,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'logisticaAlmacen';
    return this.http.post(url, parametro).toPromise();
  }

  listaOpcionesAlmacen(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    /*
      1: Muestra la lista de los tipo de uso
      2: Muestra la lista de los tipo de almacen
      3: Muestra la lista de los estados
      4: Muestra la lista de la ubicación
    */
    parametro = {
      pEntidad: 1,
      pTipo: 2,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'logisticaAlmacen';
    return this.http.post(url, parametro).toPromise();
  }

  insertOrUpdateAlmacen(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    /*
      1: Nos muestra los almacenes de ubicaciones reales direccion y ubigeo, importante el filtro por Pais, ya que todas las empresas del grmismo pais utilizar los mismos almacenes
      2: Nos muestra los almacenes físicos
    */
    parametro = {
      pEntidad: 1,
      pTipo: 1,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'logisticaAlmacen';
    return this.http.post(url, parametro).toPromise();
  }

  /*
    **************************************************
    *************** UNIDAD DE MEDIDA ****************
    **************************************************
  */

  listarInformacionUnidadMedida(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 1,
      pTipo: 1,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'unidadMedida';
    return this.http.post(url, parametro).toPromise();
  }

  insertOrUpdateUnidadMedida(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 1,
      pTipo: 2,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'unidadMedida';
    return this.http.post(url, parametro).toPromise();
  }


  /*
    **************************************************
    ************* DIRECCION DE DESTINO ***************
    **************************************************
  */
    fnDireccionDestino(pEntidad: number, pOpcion: number, pTipo: number, pParametro?: string, pParametroDet?: string): Observable<any> {
      const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
      const url = this.myUrlAprobacion + 'direccionDestino';
      const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro,
        pTipo: pTipo,
        pParametroDet: pParametroDet
      };
      return this.http.post(url, JSON.stringify(params), { headers: httpHeaders });
    }

  obtenerInformacionDireccionDestino(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 1,
      pTipo: 1,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'direccionDestino';
    return this.http.post(url, parametro).toPromise();
  }

  insertOrUpdateDireccionDestino(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 1,
      pTipo: 2,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'direccionDestino';
    return this.http.post(url, parametro).toPromise();
  }

  async fnDestino(
    file: File,
    numDocumento: string
  ) {
    const url = this.myUrlAprobacion + 'saveExcel';

    const formData = new FormData();

    formData.append("file", file);
    formData.append("numDocumento", numDocumento);

    const resp = await fetch(url, { method: "POST", body: formData, });
    return resp.json();
  }

  guardarExcel(
    fileName: string,
    pEntidad: number,
    pTipo: number,
    pOpcion: number,
    pParametro: string): Observable<any> {
    const url = this.myUrlAprobacion + 'direccionDestino';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      fileName: fileName,
      pEntidad: pEntidad,
      pTipo: pTipo,
      pOpcion: pOpcion,
      pParametro: pParametro,
    }
    return this.http.post(url, JSON.stringify(params), { headers: httpHeaders });
  }


  /*
    **************************************************
    ************* Ubicación de Almacen ***************
    **************************************************
  */

  obtenerInformacionUbicacionAlmacen(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 2,
      pTipo: 1,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'logisticaAlmacen';
    return this.http.post(url, parametro).toPromise();
  }

  insertOrUpdateUbicacionAlmacen(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 2,
      pTipo: 2,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'logisticaAlmacen';
    return this.http.post(url, parametro).toPromise();
  }

  validarExistenciaUbicacion(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 2,
      pTipo: 3,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'logisticaAlmacen';
    return this.http.post(url, parametro).toPromise();
  }

  obtenemosInformacionDireccionDeLaEmpresa(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 2,
      pTipo: 4,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'logisticaAlmacen';
    return this.http.post(url, parametro).toPromise();
  }

  obtenemosInformacionUbicacionExtra(opcion: number, pParametro: string) {
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 2,
      pTipo: 5,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlAprobacion + 'logisticaAlmacen';
    return this.http.post(url, parametro).toPromise();
  }






}
