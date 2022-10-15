import { Component, OnInit } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DateAdapter } from 'angular-calendar';
import { ConsultapService } from '../consultap/consultap.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import moment, { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from '../../Asistencia/asistenciap/asistenciap.animations';



export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',

  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}

@Component({
  selector: 'app-come-articulo-pallet',
  templateUrl: './come-articulo-pallet.component.html',
  styleUrls: ['./come-articulo-pallet.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ],
  animations: [asistenciapAnimations]
})

export class ComeArticuloPalletComponent implements OnInit {

  // Botones Flotantes
  tsLista = 'active';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'cloud_download', tool: 'Generar Reporte' },
  ];
  abLista = [];

  reporte: any;
  formularioReporte: FormGroup;

  todayDate: Moment;

  constructor(private consultaService: ConsultapService, private fb: FormBuilder, private spinner: NgxSpinnerService) {
    this.crearFormulario();
  }

  ngOnInit() {
    this.onToggleFab(1, -1)

  }

  crearFormulario() {
    this.formularioReporte = this.fb.group({
      fechaInicio: [moment()],
      fechaFin: [moment()]
    })
  }

  async generarReporte() {

    this.spinner.show();

    let valorInicio: Moment = this.formularioReporte.controls.fechaInicio.value;

    console.log(valorInicio)

    const fechaIngreso = valorInicio.format('yyyy-MM-DD');

    let valorFin: Moment = this.formularioReporte.controls.fechaFin.value;
    const fechaFin = valorFin.format('yyyy-MM-DD');

    const resp: any = await this.consultaService.obtenerReporte(1, `${fechaIngreso}|${fechaFin}`);

    if (resp === 0) {
      this.spinner.hide();
      return Swal.fire({
        title: 'No se encuentran registros en el excel',
        icon: 'warning',
        timer: 1500
      })
    } else {
      const data = resp.filename;
      var link = document.createElement('a');
      link.href = data;
      // Trigger de escarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      this.spinner.hide();
      Swal.fire({
        title: 'El Excel ha sido generado',
        html: `Si su descarga no ha comenzado, puede descargarlo <a href='${resp.filename}' download>aquí</a>`,
        icon: 'success',
        showCloseButton: true
      })
    }
    this.spinner.hide();
    // console.log('REPORTE',this.reporte);


  }

  //Botones Flotantes
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.generarReporte()
        break
      default:
        break
    }
  }
}
