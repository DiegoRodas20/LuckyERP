import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StringMapWithRename } from '@angular/compiler/src/compiler_facade_interface';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ControldService {

  urlBase: string = "";
  urlBase2: string = "";

  constructor(private http: HttpClient, @Inject('BASE_URL_TFI') baseUrl: string ,@Inject('BASE_URL') baseUrl2: string , ) {
    this.urlBase = baseUrl;
    this.urlBase2 = baseUrl2;
  }

  async _uploadFile(file: any, nArea: number, sName: string, sTipo: string) {
    const urlEndPoint = this.urlBase2 + 'AdminPersonalService/UploadFile';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
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

  async GetEmpresas(countryId: string) {
    try {
      const response = await this.http.get(`${this.urlBase}Depositos/Empresas?countryId=${countryId}`, { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetBancos(countryId: string) {
    try {
      const response = await this.http.get(`${this.urlBase}Depositos/Bancos?countryId=${countryId}`, { observe: 'response' }).toPromise();

      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetTiposDeElementos(countryId: string, tableId: number, nParam: number) {
    try {
      const response =
        await this.http.get(
          `${this.urlBase}Depositos/TiposElemento?countryId=${countryId}&tableId=${tableId}&nParam=${nParam}`, { observe: 'response' }
        ).toPromise();

      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetDetalleBancos(nIdHistDeposito: number) {
    try {
      const response =
        await this.http.get(
          `${this.urlBase}Depositos/DetalleBancos?nIdHistDeposito=${nIdHistDeposito}`, { observe: 'response' }
        ).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetElementos(tableId: number) {
    try {
      const response =
        await this.http.get(
          `${this.urlBase}Depositos/Elementos?tableId=${tableId}`, { observe: 'response' }
        ).toPromise();

      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetDepositos(countryId: string) {
    try {
      const response = await this.http.get(`${this.urlBase}Depositos?countryId=${countryId}`, { observe: 'response' }).toPromise();

      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
  async DetalleDepositos(nParam2Tabla: number, nId: number ) {
    try {
      const response = await this.http.get(`${this.urlBase}Depositos/GetDetalleDepositoGeneral?nParam2Tabla=${nParam2Tabla}&nId=${nId}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetnParamTabla(nIdHistDeposito: number ) {
    try {
      const response = await this.http.get(`${this.urlBase}Depositos/GetnParamTabla?nIdHistDeposito=${nIdHistDeposito}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetUsuariosControlD() {
    try {
      const response = await this.http.get(`${this.urlBase}Depositos/UsuariosControlD`, { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async InsertDetalleDeposito(nIdHistDeposito: number, nIdBanco: number, sFileSustento: string, nIdRegUser: number) {
    try {
      const response = await this.http.get(`${this.urlBase}Depositos/InsertDetalleDeposito?nIdHistDeposito=${nIdHistDeposito}&nIdBanco=${nIdBanco}&sFileSustento=${sFileSustento}&nIdRegUser=${nIdRegUser}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async UpdateHistoricoDeposito(nIdHistDeposito: number, nIdEstado: number) {
    try {
      const response = await this.http.get(`${this.urlBase}Depositos/UpdateHistoricoDeposito?nIdHistDeposito=${nIdHistDeposito}&nIdEstado=${nIdEstado}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

}
