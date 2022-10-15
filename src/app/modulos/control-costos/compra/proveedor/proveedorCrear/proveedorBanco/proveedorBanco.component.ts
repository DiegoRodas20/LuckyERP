import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { CompraService } from '../../../compra.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-proveedorBanco',
  templateUrl: './proveedorBanco.component.html',
  styleUrls: ['./proveedorBanco.component.css']
})
export class ProveedorBancoComponent implements OnInit {

  banco: any[] = []
  moneda: any[] = []
  listaTipoCuenta: any[] = [];
  forma = new FormGroup({});
  pPais: string;  //Codigo del Pais de la empresa Actual

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

    this.pPais = localStorage.getItem('Pais');
    this.createFormulario();
    this.listabanco();
    this.listaMoneda();
    this.obtenerTipoCuenta();
    if (this.data["data"] != null) {
      if (this.data["data"].nId == 0) {
        this.listaGeneralModificar()
      } else {
        this.listaGeneral(this.data["data"].nId)
      }
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
      sCuentaInter: ['',],
      nMoneda: ['', Validators.required],
      tipoCuenta: [null, Validators.required]
    })
  }

  listabanco() {
    this.pOpcion = 2
    this.pTipo = 5;
    this.pParametro = [];

    this.pParametro.push(this.pPais);
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {

      this.banco = data
    })
  }

  listaMoneda() {
    this.pOpcion = 2
    this.pTipo = 9;
    this.pParametro = [];
    this.pParametro.push(this.pPais);
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {
      this.moneda = data
    })
  }

  listaGeneralModificar() {
    this.forma = this.fb.group({
      nId: this.data["data"].nId,
      nBanco: [this.data["data"].nBanco, Validators.required],
      sCuenta: [this.data["data"].sCuenta, [Validators.required, Validators.minLength(3)]],
      sCuentaInter: this.data["data"].sCuentaInter,
      nMoneda: [this.data["data"].nMoneda, Validators.required],
      tipoCuenta: [this.data["data"].nIdTipoCuenta, Validators.required]
    })
    this.smoneda = this.data["data"].sMoneda
    this.sbanco = this.data["data"].sBanco
  }

  listaGeneral(termino) {
    this.pParametro = []
    this.pEntidad = 3;
    this.pTipo = 0;
    this.pOpcion = 3;
    this.pParametro.push(termino)
    this.rutas.fnDatoBasico(this.pEntidad, 3, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((resp: any) => {
      this.forma = this.fb.group({
        nId: resp[0].nId,
        nBanco: [resp[0].nBanco, Validators.required],
        sCuenta: [resp[0].sCuenta, [Validators.required, Validators.minLength(3)]],
        sCuentaInter: resp[0].sCuentaInter,
        nMoneda: [resp[0].nMoneda, Validators.required],
        tipoCuenta: [resp[0].nIdTipoCuenta, Validators.required]
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

        } else {
          control.markAsTouched();
        }
      });
    }

    var id = 0;
    if (this.data['data'] != null) {
      id = this.data['data'].nId
    }

    //Recogiendo el valor del tipo cuenta
    let sTipoCuenta = this.listaTipoCuenta.find(item => item.nIdTipEle == this.forma.get('tipoCuenta').value)?.sDescripcion

    this.sDatos.push({
      "nId": id,
      "nBanco": this.forma.value.nBanco,
      "sBanco": this.sbanco,
      "sCuenta": this.forma.value.sCuenta,
      "sCuentaInter": this.forma.value.sCuentaInter == "" ? "-" : this.forma.value.sCuentaInter,
      "nMoneda": this.forma.value.nMoneda,
      "sMoneda": this.smoneda,
      "tipoCuenta": sTipoCuenta,
      "nIdTipoCuenta": this.forma.get('tipoCuenta').value,
    })

    this.oDatos.next(this.sDatos[0])

    this.dialogRef.close(this.sDatos[0]);

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

  obtenerTipoCuenta() {
    this.pOpcion = 2
    this.pTipo = 13;
    this.pParametro = [];
    this.pParametro.push(this.pPais);
    this.rutas.fnDatoBasico(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url, this.pDetalle).subscribe((data: any) => {
      this.listaTipoCuenta = data
    })
  }
}
