import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { BaseService } from "../base-service";
import { WebApiResponse } from "../models/apiResponse";
import { ReposicionDTO } from "../models/reposicionTIDTO";

@Injectable({
    providedIn: 'root'
})

export class ReposicionService extends BaseService {

    urlBase: string;

    constructor(private http: HttpClient, @Inject('BASE_URL_TIL') baseUrl: string) {
        super();
        this.urlBase = baseUrl + 'Reposicion';
    }

    GetAllReposicion() {

        return this.http.get<WebApiResponse<ReposicionDTO>>(`${this.urlBase}/Reposicion`,
            {
                headers: this.getHeaders(),
                observe: 'response'
            });
    }

    getHeaders(): HttpHeaders {
        let httpHeaders: HttpHeaders = new HttpHeaders();
        return httpHeaders;
    }



}