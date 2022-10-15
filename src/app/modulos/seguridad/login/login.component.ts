import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { Oauth2Service } from '../../../shared/guards/oauth2.service';
import Swal from 'sweetalert2';
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  url: string;
  lLoginBoolean = true;
  hidePass = true;
  submitted = false;
  fLoginForm: FormGroup;
  //jose

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private vSerOauth: Oauth2Service,
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.url = baseUrl;
  }

  ngOnInit(): void {
    this.fLoginForm = this.formBuilder.group({
      pass: ['', Validators.required],
      user: ['', Validators.required]
    });

    localStorage.removeItem('currentUser');
    localStorage.removeItem('ListaEmpresa');
    localStorage.removeItem('ListaMenu');
    localStorage.removeItem('IdMenu');
    localStorage.removeItem('Name');
    localStorage.removeItem('Empresa');
    localStorage.removeItem('NomEmpresa');
    localStorage.removeItem('Pais');
  }

  fnLogIn() { 


    let vDatos;
    let pParametro = [];

    if (this.fLoginForm.controls.user.invalid) {
      Swal.fire('¡Mensaje!', 'Ingrese usuario Valido', 'info');
      return;
    } else if (this.fLoginForm.controls.pass.invalid) {
      Swal.fire('¡Mensaje!', 'Ingrese Contraseña', 'info');
      return;
    } else {
      vDatos = this.fLoginForm.value;

      if (vDatos.user.includes(' ') == true || vDatos.user.includes(';') == true
        || vDatos.user.includes('_') == true || vDatos.user.includes('*') == true
        || vDatos.user.includes('>') == true || vDatos.user.includes('.') == true) {
        Swal.fire('¡Mensaje!', 'Ingrese usuario Valido', 'info');
        return;
      }
      else if (vDatos.pass.includes(' ') == true || vDatos.pass.includes(';') == true
        || vDatos.pass.includes('_') == true || vDatos.pass.includes('*') == true
        || vDatos.pass.includes('>') == true || vDatos.pass.includes('.') == true) {
        Swal.fire('¡Mensaje!', 'Ingrese contraseña Valida', 'info');
        return;
      }
      pParametro.push(vDatos.user);
      pParametro.push(vDatos.pass);
      pParametro.push('');
      this.spinner.show();

      this.vSerOauth.fnAuthenticate(0, pParametro, this.url).subscribe(
        res => {

          if (res.token) {
            localStorage.setItem('currentUser', res.token);
            this.router.navigate(["/inicio"]);
            // this.changeMessage();
          }
        },
        err => { 


          if (err.error.id) {
            Swal.fire('Error', err.error.message, 'error');
            console.log(err.error.message);
          } else {
            console.log(err);
          }
          this.spinner.hide();

        },
        () => {
        }
      );
    }
  }


}
