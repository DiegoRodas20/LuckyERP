import { Injectable, Inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as signalR from '@aspnet/signalr';

@Injectable({
  providedIn: 'root',
})
export class ControlpService {
  constructor(private http: HttpClient) {}

  //#region SignalR

  private hubConnection: signalR.HubConnection;

  async startConnection(url: string): Promise<any> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(url + 'notification')
      .build();

    await this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error while starting connection: ' + err));

    return this.hubConnection;
  }

  async getIdConnection(): Promise<string> {
    let idConnection = '';
    await this.hubConnection
      .invoke('GetConnectionId')
      .then((id) => (idConnection = id));
    return idConnection;
  }

  public testSignalR = () => {
    this.hubConnection.on('send', (data) => {
      alert(data);
    });
  }

  //#endregion

  async _loadSP(pOpcion: number, pParametro: any, url: string): Promise<any> {
    const urlEndPoint = url + 'AdminPersonalService/GetAdminPersonal';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  async _crudSP(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AdminPersonalService/GetCrudSP';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|'),
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders })
      .toPromise();
  }

  getImage(imageUrl: string) {
    return this.http.get(imageUrl, { responseType: 'blob' }).toPromise();
  }

  async _uploadFile(
    file: any,
    nArea: number,
    sName: string,
    sTipo: string,
    url: string
  ) {
    const urlEndPoint = url + 'AdminPersonalService/UploadFile';
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

  async notification(
    nId: number,
    sNombres: string,
    sMetodo: string,
    url: string
  ) {
    const urlEndPoint = url + 'Notification/SendNotification';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      nId: nId,
      sNombres: sNombres,
      sMetodo: sMetodo,
    };

    return await this.http
      .post(urlEndPoint, JSON.stringify(body), { headers: httpHeaders })
      .toPromise();
  }
}
