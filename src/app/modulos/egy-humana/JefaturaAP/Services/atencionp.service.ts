import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as signalR from '@aspnet/signalr';

@Injectable({
    providedIn: 'root'
})
export class AtencionpService {
    urlBase = '';

    constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
        this.urlBase = baseUrl;
    }

    //#region SignalR

    private hubConnection: signalR.HubConnection;

    async startConnection(): Promise<any> {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this.urlBase + 'notification')
            .build();

        await this.hubConnection
            .start()
            .then(() => console.log('Connection started'))
            .catch(err => console.log('Error while starting connection: ' + err));

        return this.hubConnection;
    }

    async getIdConnection(): Promise<string> {
        let idConnection = '';
        await this.hubConnection.invoke('GetConnectionId')
            .then((id) => idConnection = id);
        return idConnection;
    }

    //#endregion

    async _loadSP(pOpcion: number, pParametro: any) {
        const urlEndPoint = this.urlBase + 'AdminPersonalService/GetAtencionPersonal';
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

        const params = {
            pOpcion: pOpcion,
            pParametro: pParametro.join('|')
        };

        return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
    }

    async print(pOpcion: number, pParametro: any) {
        // debugger;

        const urlEndPoint = this.urlBase + 'AdminPersonalService/GetAtencionPersonal';
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

        const params = {
            pOpcion: pOpcion,
            pParametro: pParametro.join('|')
        };
        return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders, responseType: 'blob' }).toPromise();
    }

    async notification(nId: number, sNombres: string, sMetodo: string) {
        const urlEndPoint = this.urlBase + 'Notification/SendNotification';
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

        const body = {
            nId: nId,
            sNombres: sNombres,
            sMetodo: sMetodo
        };

        return await this.http.post(urlEndPoint, JSON.stringify(body), { headers: httpHeaders }).toPromise();
    }

    async _crudAP(pOpcion: number, pParametro: any) {
        const urlEndPoint = this.urlBase + 'AdminPersonalService/GetCrudAP';
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

        const params = {
            pOpcion: pOpcion,
            pParametro: pParametro.join('|')
        };

        return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
    }
}
