import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GestionpService {
  urlBase = '';
  urlBase2 = '';

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string, @Inject('BASE_URL_Comercial') baseUrl2: string ) {
    this.urlBase = baseUrl;
    this.urlBase2 = baseUrl2;
  }

  async UsuarioLogueo(nCodUser: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetResponsable?nCodUser=${nCodUser}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
  async ListaPlanningPersonal(nIdResp: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetPersonalPlanning?nIdResp=${nIdResp}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
  async GetPerfil(nIdEmp: number, sCodCC: string, nIdSucursal: number, nIdPartida: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetPerfil?nIdEmp=${nIdEmp}&sCodCC=${sCodCC}&nIdSucursal=${nIdSucursal}
      &nIdPartida=${nIdPartida}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
  async GetCanal(nIdEmp: number, sCodCC: string, nIdSucursal: number, nIdPartida: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetCanal?nIdEmp=${nIdEmp}&sCodCC=${sCodCC}&nIdSucursal=${nIdSucursal}
      &nIdPartida=${nIdPartida}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
  async InsertPlanning(nIdResp: number, dFechIni: string, dFechFin: string,
    nIdCentroCosto: number, nIdRegUser: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/InsertPlanning?nIdResp=${nIdResp}&dFechIni=${dFechIni}
      &dFechFin=${dFechFin}&nIdCentroCosto=${nIdCentroCosto}&nIdRegUser=${nIdRegUser}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async InsertDetPlanning(nIdPlanning: number, nIdPersonal: number, nIdCanal: number, nIdPerfil: number
    , nIdRegUser: number, nIdSucursal: number, nIdCargo: number, nIdPuesto: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/InsertDetPlanning?nIdPlanning=${nIdPlanning}&nIdPersonal=${nIdPersonal}
      &nIdCanal=${nIdCanal}&nIdPerfil=${nIdPerfil}&nIdRegUser=${nIdRegUser}&nIdSucursal=${nIdSucursal}&nIdCargo=${nIdCargo}&nIdPuesto=${nIdPuesto}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetCrucesPlanning(nIdPersonal: number, dFechaIni: string, dFechaFin: string) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetCrucesPlanning?nIdPersonal=${nIdPersonal}
      &dFechaIni=${dFechaIni}&dFechaFin=${dFechaFin}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetConsultaAsistencia(nIdDPP: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetConsultaAsistencia?nIdDPP=${nIdDPP}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetDetallePersonalPlanning(nIdPlanning: number ) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetDetallePersonalPlanning?nIdPlanning=${nIdPlanning}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetPlanning(nIdUser: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetPlanning?nIdUser=${nIdUser}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetUbigeo(nIdStore: number, nId: string) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetUbigeo?nIdStore=${nIdStore}&nId=${nId}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetTienda(sIdUbigeo: string) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetTienda?sIdUbigeo=${sIdUbigeo}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async InsertAsistencia(nIdDPP: number, dFecha: string, nIdDia: number, nImporte: number, nIdRegUser: number,
    tIni: string, tFin: string ) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/InsertAsistencia?nIdDPP=${nIdDPP}&&dFecha=${dFecha}&&nIdDia=${nIdDia}
      &&nImporte=${nImporte}&&nIdRegUser=${nIdRegUser}&&tIni=${tIni}&&tFin=${tFin}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async InsertRuta(nIdAsistencia: number, nIdTienda: number, nIdRegUser: number, nOrden: number, ) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/InsertRutas?nIdAsistencia=${nIdAsistencia}&&nIdTienda=${nIdTienda}
      &&nIdRegUser=${nIdRegUser}&&nOrden=${nOrden}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetAsistencias(nIdDPP: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetAsistencias?nIdDPP=${nIdDPP}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async GetRutas(nIdAsistencia: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/GetRutas?nIdAsistencia=${nIdAsistencia}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async DeleteAsistencia(nIdAsistencia: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/DeleteAsistencia?nIdAsistencia=${nIdAsistencia}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
  async DeleteRuta(nIdAsistencia: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/DeleteRuta?nIdAsistencia=${nIdAsistencia}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }
  async GetDatosCentroCosto(nIdCentroCosto: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/DatosCentroCosto?nIdCentroCosto=${nIdCentroCosto}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async ResponsablesPermitidos(nIdCentroCosto: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/ResponsablesPermitidos?nIdCentroCosto=${nIdCentroCosto}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async ValidarDias(nIdDPP: number) {
    try {
      const response = await this.http.get(`${this.urlBase2}GestionPlanning/ValidarDias?nIdDPP=${nIdDPP}`,
      { observe: 'response' }).toPromise();
      return response;
    } catch (error) {
      console.log('Error Status: ', error.status);
    }
  }

  async _loadPlanning(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminComercialService/GetPlanning';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _ServicePlanning(pOpcion: number, pParametro: any) {
    const urlEndPoint = this.urlBase + 'AdminComercialService/GestionPlanning';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _loadSP(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminComercialService/GetKpiBonoT';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _crudKI(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminComercialService/GetCrudKBT';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _uploadFile(
    file: any,
    nArea: number,
    sName: string,
    sTipo: string,
    url: string
  ) {
    const urlEndPoint = url + 'AdminComercialService/UploadFile';
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

  _deleteFile(
    sName: string,
    sTipo: string,
    nArea: number,
    url: string
  ): Observable<any> {
    const urlEndPoint = url + 'AdminComercialService/DeleteFile';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      File: sName,
      Tipo: sTipo,
      Area: nArea,
    };
    return this.http.post(urlEndPoint, JSON.stringify(params), {
      headers: httpHeaders,
    });
  }

  _downloadFile(
    sName: string,
    sTipo: string,
    nArea: number,
    url: string
  ): Observable<any> {
    const urlEndPoint = url + 'AdminComercialService/DownloadFile';
    const params = '?filename=' + sName + '&type=' + sTipo + '&area=' + nArea;

    return this.http.get(urlEndPoint + params, { responseType: 'blob' });
  }
}
