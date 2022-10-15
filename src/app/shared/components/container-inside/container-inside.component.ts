import { Component, OnInit, Inject } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-container-inside',
  templateUrl: './container-inside.component.html',
  styleUrls: ['./container-inside.component.css']
})
export class ContainerInsideComponent implements OnInit {
  url: string;

  constructor(
    private router: Router,
    @Inject('BASE_URL') baseUrl: string,
    private http: HttpClient,    
  ) {
    this.url = baseUrl;
  }
  ngOnInit(): void {
    this.usuarioAuthenticado();
    this.fnTipoCambio();
  }

  fnTipoCambio() {
    //Implementacion
    // trae el tipo de cambio solo una vez al dia en el primer inicio de sesion

    let date: Date = new Date();
    var formatDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    this.fnDatoBasico(1, 1, formatDate, 0, this.url).subscribe(rest => {
      if (rest != 0) {
        console.log("tipo de cambio registrado exitosamente")
      } else {
        console.log("tipo de cambio registrado DB ")
      }
    })

  }
  fnDatoBasico(pEntidad: number, pOpcion: number, pParametro: any, pTipo: number, url: string): Observable<any> {
    const urlEndpoint = url + 'ErpCompras/TipoCambio';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = {
      pEntidad: pEntidad,
      pOpcion: pOpcion,
      pParametro: pParametro,
      pTipo: pTipo,
    }
    return this.http.post(urlEndpoint, JSON.stringify(params), { headers: httpHeaders })
  }
  usuarioAuthenticado() {
    let token: string = localStorage.getItem("currentUser");
    if (token) {
      return true;
    }
        else
      return false;
  }

}
