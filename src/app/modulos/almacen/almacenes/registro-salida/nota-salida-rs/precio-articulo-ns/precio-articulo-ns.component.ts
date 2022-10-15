import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Detalle_Articulo } from '../../models/registroSalida.model';
import { RegistroSalidaService } from '../../registro-salida.service';



export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-precio-articulo-ns',
  templateUrl: './precio-articulo-ns.component.html',
  styleUrls: ['./precio-articulo-ns.component.css']
})
export class PrecioArticuloNSComponent implements OnInit {


  vDetalle: Detalle_Articulo;
  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  matcher = new ErrorStateMatcher();

  formArticulo: FormGroup;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegSalida: RegistroSalidaService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private data: Detalle_Articulo,
    public dialogRef: MatDialogRef<PrecioArticuloNSComponent>,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; this.vDetalle = data; }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formArticulo = this.formBuilder.group({
      txtPrecioCourier: ['', [Validators.required, Validators.min(0)]],
    })
    this.formArticulo.controls.txtPrecioCourier.setValue(this.vDetalle.nCostoCourier)
  }

  fnGuardar() {
    if (this.formArticulo.invalid) {
      Swal.fire('¡Verificar!', 'Revise el precio', 'warning')
      return;
    }

    var precio = this.formArticulo.controls.txtPrecioCourier.value;
    if (precio <= 0) {
      Swal.fire('¡Verificar!', 'Revise el precio', 'warning')
      return;
    }

    this.dialogRef.close(precio);
  }

}
