import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ParametroProcedureInterface } from '../../control-costos/datobasico/interfaces/parametroProcedure';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private myUrlInventario: string;
  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl) {
    this.myUrlInventario = baseUrl + 'ErpLogisticaInventario/';
  }

  listaInformacionInventario(opcion: number,pParametro: string) {
    /*
      opcion 1: OBTENEMOS LOS ARTÍCULOS POR UBICACIÓN (PALLET)
      opcion 2: OBTENEMOS LAS EMPRESAS POR PAÍS
      opcion 3: OBTENEMOS LOS ALMACENES POR USUARIO Y PAÍS
      opcion 4: OBTENEMOS LOS PRESUPUESTOS POR EMPRESA
      opcion 5: OBTENEMOS LOS ARTÍCULOS POR PAÍS
      opcion 6: OBTENEMOS EL ÚLTIMO REGISTRO DE UN ARTÍCULO EN LA  TABLA ANTEAS DE TRASLADARLO
      opcion 7: Buscar artículos  y mostrar la cantidad que hay en cada ubicación
      opcion:8: Obtener los artículos agrupados en presupuesto ( Pallet )
      opcion 9: Buscar artículos  y mostrar la cantidad que hay en cada ubicación ( Agrupados por presupuesto )
      opcion 10: Obtenemos los almacenes base por usuario
      opcion 11: Validamos la diferencia entre ubicacion articulo y kardex
    */
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 1,
      pTipo: 1,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlInventario + 'logisticaInventario';
    return this.http.post(url,parametro).toPromise();
  }

  insertOrUpdateArticuloInventario(opcion: number,pParametro: string) {
    /*
      opcion 1: Registro de Ingreso o Salida de artículos
    */
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 1,
      pTipo: 2,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: ''
    };
    const url = this.myUrlInventario + 'logisticaInventario';
    return this.http.post(url,parametro).toPromise();
  }

  /*
    **************************************************
    ******************** KARDEX **********************
    **************************************************
  */

  llenarComboboxKardex(tipo: number, parametro: string) {
    /*
      Tipos:
			- 1. Combobox para Clientes por Pais
			- 2. Combobox para Presupuestos por empresa
			- 3. Combobox para Articulos, por Pais
			- 4. Combobox para Almacenes, por Pais
			- 5. Combobox para operaciones logísticas
			- 6. Combobox para direccion (destino) por entidad
			- 7. Combobox para entidad (destino) por pais
      - 10. Combobox para Meses
    */
    let request: ParametroProcedureInterface = {
      pEntidad: 1,
      pTipo: tipo,
      pOpcion: 2,
      pParametro: parametro,
      pParametroDet: ''
    };
    //console.log(request);

    const url = this.myUrlInventario + 'kardex';
    return this.http.post<[]>(url, request).toPromise();
  }

  listarKardex(tipo: number, parametro: string) {
    /*
      Tipos:
			- 8. Listado de la tabla total filtrada
    */
    let request = {
      pEntidad: 1,
      pTipo: tipo,
      pOpcion: 2,
      pParametro: parametro
    };

    const url = this.myUrlInventario + 'kardex';
    return this.http.post<[]>(url, request).toPromise();
  }

  descargarExcelKardex(tipo: number, parametro: string, nEmpresa: string) {
    /*
      Tipos:
			- 9. Creacion y descarga del Excel
    */

    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const responseType = 'blob' as 'json';

    let request = {
      pEntidad: 1,
      pTipo: tipo,
      pOpcion: 2,
      pParametro: parametro,
      nEmpresa: nEmpresa
    };

    const url = this.myUrlInventario + 'kardex/descargarExcel';
    return this.http.post<Blob>(url, request, { headers: httpHeaders, responseType: responseType }).toPromise();
  }

  /*
    **************************************************
    ******************** SALDOS **********************
    **************************************************
  */

  listarSaldo(tipo: number, parametro: string) {
    /*
      Tipos:
			- 1. Listado de la tabla total filtrada
    */
    let request = {
      pEntidad: 2,
      pTipo: tipo,
      pOpcion: 2,
      pParametro: parametro
    };

    const url = this.myUrlInventario + 'kardex';
    return this.http.post<[]>(url, request).toPromise();
  }

  listarIngresosSalidas(tipo: number, parametro: string) {
    /*
      Tipos:
			- 1. Listado de la tabla total filtrada
    */
    let request = {
      pEntidad: 3,
      pTipo: tipo,
      pOpcion: 2,
      pParametro: parametro
    };

    const url = this.myUrlInventario + 'kardex';
    return this.http.post<[]>(url, request).toPromise();
  }

  descargarExcelSaldo(tipo: number, parametro: string, nEmpresa: string) {
    /*
      Tipos:
			- 2. Creacion y descarga del Excel
    */

    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const responseType = 'blob' as 'json';

    let request = {
      pEntidad: 2,
      pTipo: tipo,
      pOpcion: 2,
      pParametro: parametro,
      nEmpresa: nEmpresa
    };
    const url = this.myUrlInventario + 'kardex/descargarExcel';
    return this.http.post<Blob>(url, request, { headers: httpHeaders, responseType: responseType }).toPromise();
  }

  descargarExcelIS(tipo: number, parametro: string, nEmpresa: string) {
    /*
      Tipos:
			- 2. Creacion y descarga del Excel
    */

    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const responseType = 'blob' as 'json';

    let request = {
      pEntidad: 3,
      pTipo: tipo,
      pOpcion: 2,
      pParametro: parametro,
      nEmpresa: nEmpresa
    };
    const url = this.myUrlInventario + 'kardex/descargarExcel';
    return this.http.post<Blob>(url, request, { headers: httpHeaders, responseType: responseType }).toPromise();
  }

  /*
    *****************************************************************************
    ******************** Reporte de excel para ubicaciones **********************
    *****************************************************************************
  */

  obtenerInformacionReporteExcel(opcion: number,pParametro: string,pParametroDet: string) {
    /*
      opcion 1: Obtenemos los clientes para filtrar el reporte
    */
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const responseType = 'blob' as 'json';
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 2,
      pTipo: 1,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: pParametroDet
    };
    const url = this.myUrlInventario + 'logisticaInventario';

    if(opcion == 1){
      // Devuelve la lista del Excel para verificar si hay elementos
      return this.http.post(url,parametro).toPromise();
    }
    else{
      // Devuelve el blob del Excel
      return this.http.post<Blob>(url, parametro, { headers: httpHeaders, responseType: responseType }).toPromise();
    }
  }

  generarReporteUbicacionKardex(opcion: number,pParametro,pParametroDet: string) {
    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const responseType = 'blob' as 'json';
    let parametro: ParametroProcedureInterface;
    parametro = {
      pEntidad: 2,
      pTipo: 0,
      pOpcion: opcion,
      pParametro: pParametro,
      pParametroDet: pParametroDet
    };
    const url = this.myUrlInventario + 'logisticaInventario';
    return this.http.post<Blob>(url, parametro, { headers: httpHeaders, responseType: responseType }).toPromise();
  }


  /*
    *******************************************************************************
    ******************** SALDO DE PRESUPUESTOS DE ALMACENAJE **********************
    *******************************************************************************
  */

    fnSaldoPresupuestoAlmacenaje(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Promise<any> {
      const urlEndpoint = url + 'ErpLogisticaInventario/saldoPresupuestosAlmacenaje';
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo
      }

      return this.http.post<any>(urlEndpoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
    }

  /*
    *******************************************************************************
    ************************** VOLUMEN DEL MOVIMIENTO *****************************
    *******************************************************************************
  */

    fnVolumenMovimiento(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Promise<any> {
      const urlEndpoint = url + 'ErpLogisticaInventario/volumenMovimiento';
      const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

      const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo
      }

      return this.http.post<any>(urlEndpoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
    }

    fnVolumenMovimientoExcel(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Promise<any> {

      const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
      const responseType = 'blob' as 'json';
      const urlEndpoint = url + 'ErpLogisticaInventario/volumenMovimiento/descargarExcel';

      const params = {
        pEntidad: pEntidad,
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),
        pTipo: pTipo
      }

      return this.http.post<Blob>(urlEndpoint, JSON.stringify(params), { headers: httpHeaders, responseType: responseType }).toPromise();
    }
}
