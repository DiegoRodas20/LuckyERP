import { Component, OnInit, Injectable, Inject, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { SerReclutamientoService } from './../../Service/reclutamiento.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../../shared/services/AppDateAdapter';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ],
})

export class HistoricoComponent implements OnInit {
  url: string;
  pais: string;
  fecIni: string = '';
  fecFin: string = '';
  Mensaje: string = '';
  op: number;
  titulo: string = '';
  Val: boolean = true;

  HistoricoForm: FormGroup;
  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private _adapter: DateAdapter<any>,
    private vSerReclutamiento: SerReclutamientoService,
    public dialogRef: MatDialogRef<HistoricoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject('BASE_URL') baseUrl: string) {
    this.url = baseUrl;
  }

  ngOnInit(): void {
    this.op = this.data.op;
    this.titulo = this.data.titulo;
    this._adapter.setLocale('fi');
    this._adapter.setLocale('ff');
    this.pais = localStorage.getItem('Pais');

    this.HistoricoForm = this.formBuilder.group({
      Fechaini: [{ value: '', disabled: true }, Validators.required],
      FechaFin: [{ value: '', disabled: true }, Validators.required]
    });

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async fnExcel() {
    let pParametro = [];

    pParametro.push(this.pais);
    pParametro.push(moment(this.fecIni, 'MM-DD-YYYY HH:mm:ss', true).format("YYYY-MM-DD"));
    pParametro.push(moment(this.fecFin, 'MM-DD-YYYY HH:mm:ss', true).format("YYYY-MM-DD"));


    if (this.Val == false) {
    }
    else {
      Swal.fire({
        icon: 'error',
        text: 'Ingrese el rango de fecha',
      })
      this.Val = true;
      return;
    }

    this.spinner.show('spi_lista');
    await this.vSerReclutamiento.fnReclutamiento(13, pParametro, this.url).then((value: any[]) => {
      if (this.op === 0) {
        this.vSerReclutamiento.exportAsExcelFileHistorico(value, 'historico')
      }
      else {
        this.vSerReclutamiento.exportAsExcelFileindicadores(value, 'indicadores')
      }

    }, error => {
      console.log(error);
    });
    this.spinner.hide('spi_lista');
  }


  fnfecha(op: number, fecha) {
    if (op == 0) {
      this.fecIni = fecha
    }
    else {
      this.fecFin = fecha
    }

    if (this.fecIni == '' || this.fecFin == '' || (this.fecIni > this.fecFin)) {
      this.Val = true;
      this.Mensaje = 'Ingrese el rango de fecha';
      return;
    } else {
      this.Val = false;
    }
  }
}
