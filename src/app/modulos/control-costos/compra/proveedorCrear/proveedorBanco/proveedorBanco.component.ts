import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { CompraService } from '../../compra.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-proveedorBanco',
  templateUrl: './proveedorBanco.component.html',
})
export class ProveedorBancoComponent implements OnInit {

  banco: any[] = []
  moneda: any[] = []
  forma = new FormGroup({});

  pEntidad = 1; //Cabecera del movimiento
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pTipo = 1;       //Listar Solo Guias de ingreso
  pDetalle = []
  url: string;
  smoneda: string
  sbanco: string
  sDatos: any[] = []
  @Output() oDatos: EventEmitter<any> = new EventEmitter()
  constructor(private fb: FormBuilder, private rutas: CompraService, @Inject('BASE_URL') baseUrl: string, private dialogRef: MatDialogRef<ProveedorBancoComponent>
    , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.url = baseUrl;
  }

  ngOnInit(): void {
    this.createFormulario();
    this.listabanco();
    this.listaMoneda();
    console.log(this.data["IdProveedor"])
    if (this.data["data"] != 0) {
      this.listaGeneral(this.data["data"])
    }
  }

  get bancoNoValido() {

    return this.forma.get('nBanco').invalid && this.forma.get('nBanco').touched
  }
  get cuentaNoValido() {

    return this.forma.get('sCuenta').invalid && this.forma.get('sCuenta').touched
  }
  get cuentaInterNoValido() {

    return this.forma.get('sCuentaInter').invalid && this.forma.get('sCuentaInter').touched
  }
  get monedaNoValido() {

    return this.forma.get('nMoneda').invalid && this.forma.get('nMoneda').touched
  }


  createFormulario() {
    this.forma = this.fb.group({
      nId: [0],
      nBanco: ['', Validators.required],
      sCuenta: ['', [Validators.required, Validators.minLength(3)]],
      sCuentaInter: ['', [Validators.required, Validators.minLength(3)]],
      nMoneda: ['', Validators.required],
    })
  }
  listabanco() {
    this.pOpcion = 2
    this.pTipo = 5;
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {

      this.banco = data
    })
  }

  listaMoneda() {
    this.pOpcion = 2
    this.pTipo = 9;
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {
      this.moneda = data
    })
  }
  listaGeneral(termino) {
    this.pEntidad = 3;
    this.pTipo = 0;
    this.pOpcion = 3;
    this.pParametro.push(termino)
    this.rutas.fnDatoBasico(this.pEntidad, 3, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((resp: any) => {

      this.forma = this.fb.group({
        nId: resp[0].nId,
        nBanco: resp[0].nBanco,
        sCuenta: resp[0].sCuenta,
        sCuentaInter: resp[0].sCuentaInter,
        nMoneda: resp[0].nMoneda

      })
      this.smoneda = resp[0].sMoneda
      this.sbanco = resp[0].sBanco
    })
  }
  guardar() {
    if (this.forma.invalid) {
      return Object.values(this.forma.controls).forEach(control => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach(control => control.markAsTouched());
          console.log("entro aqui validado")

        } else {
          control.markAsTouched();
        }
      });
    }
    if ((this.data["IdProveedor"]) != 0) {
      this.pEntidad = 3;
      this.pOpcion = 1
      this.pParametro = []
      this.pTipo = 0

      this.pParametro.push(this.data["IdProveedor"])
      this.pParametro.push(this.data["data"])
      this.pParametro.push(this.forma.value.nBanco)
      this.pParametro.push(this.forma.value.sCuenta)
      this.pParametro.push(this.forma.value.sCuentaInter)
      this.pParametro.push(this.forma.value.nMoneda)

      this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe(rest => {
        console.log(rest)
      })
    }
    this.sDatos.push({
      "nId": this.forma.value.nId,
      "nBanco": this.forma.value.nBanco,
      "sBanco": this.sbanco,
      "sCuenta": this.forma.value.sCuenta,
      "sCuentaInter": this.forma.value.sCuentaInter,
      "nMoneda": this.forma.value.nMoneda,
      "sMoneda": this.smoneda
    })

    this.oDatos.next(this.sDatos[0])
    this.dialogRef.close();



  }
  salir() {
    this.dialogRef.close();
  }
  capturarBanco(event) {
    this.sbanco = event.source.triggerValue

  }
  capturarMoneda(event) {
    this.smoneda = event.source.triggerValue

  }
}
