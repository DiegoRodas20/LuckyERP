import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";


import { Observable } from "rxjs";
import { buffer, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class BoletaService {
  pPais;
  constructor(private http: HttpClient) {
    this.pPais = localStorage.getItem("Pais");
  }

  // Metodo que llama al Api para subir el excel
  async fnBoleta(
    file: File,
    url: string
  ) {
    const urlEndpoint = url + "ErpController/saveExcel";

    const formData = new FormData();

    let ext = file.name.split(".").pop();


    formData.append("file", file);
    formData.append("ext", ext);

    const resp = await fetch(urlEndpoint, {
      method: "POST",
      body: formData,
    });


    return resp.json();

  }

  CrudBoleta(pEntidad: number, pOpcion: number, pParametroPush: any, pTipo: number, url: string, nEmpresa: string, ruta?: string, listaproducto?: any): Observable<any> {
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      ruta: ruta,
      listaproducto: listaproducto,
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pTipo: pTipo,
      pParametroPush: pParametroPush.join('|'),
      nEmpresa: nEmpresa,
      file: null
    }


    return this.http.post(`${url}ErpController/boleta`, JSON.stringify(params), { headers: httpHeaders });

  }

  ArchivoValidacionProducto(url: string, path: string, listaproducto: any): Observable<any> {

    return this.http.get(`${url}ErpController/${path}/${listaproducto}`, { responseType: 'blob' });

  }

  DescargarExcel(pEntidad: number, pOpcion: number, pParametroPush: any, pTipo: number, url: string, nEmpresa: string) {

    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const responseType = 'blob' as 'json';

    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pTipo: pTipo,
      pParametroPush: pParametroPush.join('|'),
      nEmpresa: nEmpresa
    }

    return this.http.post<Blob>(`${url}ErpController/descargarExcelCanje`, JSON.stringify(params), { headers: httpHeaders, responseType: responseType });

  }

  fnDescargarZip(pEntidad: number, pOpcion: number, pParametroPush: any, pTipo: number, url: string, nEmpresa: string, ruta?: string, listaproducto?: any, file?: string) {

    const httpHeaders = new HttpHeaders({ "Content-Type": "application/json" });
    const responseType = 'blob' as 'json';

    const params = {
      ruta: ruta,
      listaproducto: listaproducto,
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pTipo: pTipo,
      pParametroPush: pParametroPush.join('|'),
      nEmpresa: nEmpresa,
      file: file ?? null
    }
    return this.http.post<Blob>(`${url}ErpController/boleta`, JSON.stringify(params), { headers: httpHeaders, responseType: responseType });
  }

}
