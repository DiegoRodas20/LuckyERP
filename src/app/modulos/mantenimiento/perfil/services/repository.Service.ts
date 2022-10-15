import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RepostitoryPerfilService {

  constructor(private http : HttpClient) { }

 
   savePerfil(pOpcion: number, pParametro: any){
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { 
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),       
      }
    return this.http.post(environment.BASE_URL+'MantenimientoService/Perfil',JSON.stringify(params),{ headers: httpHeaders });
   }

   
   GetAllModulo(pOpcion: number, pParametro: any){
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = { 
        pOpcion: pOpcion,
        pParametro: pParametro.join('|'),       
      }
    return this.http.post(environment.BASE_URL+'MantenimientoService/Modulo',JSON.stringify(params),{ headers: httpHeaders });
   }
}