import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Direccion_Proveedor } from '../../../registro-ingreso/models/listasIngreso.model';
import { input_ModalModulo } from '../../models/listasSalida.model';
import { RegistroSalidaService } from '../../registro-salida.service';


@Component({
  selector: 'app-log-dialog-modulo-registro-salida',
  templateUrl: './log-dialog-modulo-registro-salida.component.html',
  styleUrls: ['./log-dialog-modulo-registro-salida.component.css']
})
export class LogDialogModuloRegistroSalidaComponent implements OnInit {

  lPuntoRecup: Direccion_Proveedor[] = [];

  formModulo: FormGroup;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegSalida: RegistroSalidaService,
    @Inject(MAT_DIALOG_DATA) private data: input_ModalModulo,
    public dialogRef: MatDialogRef<LogDialogModuloRegistroSalidaComponent>,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');


    this.formModulo = this.formBuilder.group({
      cboPuntoRecup: [null, Validators.required],
      txtUbicación: [''],
      txtDireccion: [''],
    })
  }

  ngAfterViewInit() {
    setTimeout(async () => {

      //Para que no haya error de ngAfterContentChecked
      await this.fnListarDirecciones();
    });
  }

  fnLlenarDirecciones(nIdDireccion: number) {
    this.formModulo.controls.txtDireccion.setValue('');
    this.formModulo.controls.txtUbicación.setValue('');
    let p = this.lPuntoRecup.find(item => item.nId == nIdDireccion);
    if (p == null) {
      return;
    }
    this.formModulo.controls.txtDireccion.setValue(p.sDireccion);
    this.formModulo.controls.txtUbicación.setValue(`${p?.sDepartamento}, ${p?.sProvincia}, ${p?.sDistrito} - ${p?.sTipoZona}`);
  }

  async fnListarDirecciones() {

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 26;

    pParametro.push(this.data.nIdEntidad);
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(this.data.nIdAlmacen);

    try {
      this.lPuntoRecup = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnGuardar() {
    if (this.formModulo.invalid) {
      this.formModulo.markAllAsTouched();
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning');
      return;
    }

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 25;
    pParametro.push(this.data.nIdEntidad);
    pParametro.push(this.formModulo.controls.cboPuntoRecup.value);

    try {
      var result = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();

      if (Number(result) == 0) {
        Swal.fire('Error', 'No se pudo realizar el registro: Verifique su conexion a Internet', 'error');
        this.spinner.hide();
        return;
      }

      this.spinner.hide();

      this.dialogRef.close(result);

    } catch (err) {
      console.log(err);

      this.spinner.hide();
    }
  }


}
