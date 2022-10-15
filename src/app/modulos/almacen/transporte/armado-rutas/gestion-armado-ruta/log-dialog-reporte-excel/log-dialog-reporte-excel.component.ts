import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ISelectItem } from '../../../models/constantes';
import { TransporteService } from '../../../transporte.service';

@Component({
  templateUrl: './log-dialog-reporte-excel.component.html',
  styleUrls: ['./log-dialog-reporte-excel.component.css']
})
export class LogDialogReporteExcelComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private transporteService: TransporteService,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: { proveedores: ISelectItem[], clientes: ISelectItem[] },
  ) {
    this.form = this.fb.group({
      dFechaIni: [{ value: moment(), disabled: true }, [Validators.required]],
      dFechaFin: [{ value: moment(), disabled: true }, [Validators.required]],
      nIdCliente: [''],
      nIdProveedor: ['']
    });
  }

  get dateIniField(): FormControl { return this.form.get('dFechaIni') as FormControl }
  get dateFinField(): FormControl { return this.form.get('dFechaFin') as FormControl }

  get dFechaIniError(): string { return this.dateIniField.hasError('required') ? '.obligatorio' : null }
  get dFechaFinError(): string { return this.dateFinField.hasError('required') ? '.obligatorio' : null }

  fnGenerar(): void {
    const controls = Object.values(this.form.controls);
    if (this.form.invalid) {
      return controls.forEach(control => { control.markAllAsTouched() });
    }

    const concatenado = Object.keys(this.form.controls).reduce((acc, name) => acc +
      `${['dFechaIni', 'dFechaFin'].includes(name) ? moment(this.form.get(name).value).format("YYYY-MM-DD") : this.form.get(name).value}|`
      , '');

    this.spinner.show();
    this.transporteService.fnDownloadExcel(2, 1, concatenado).subscribe(res => {
      this.spinner.hide();
      const fileName = `Reporte Armado de Rutas.xlsx`;
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(res, fileName);
        return;
      }
      const objectUrl = window.URL.createObjectURL(res);
      const link = document.createElement('a') as HTMLAnchorElement;
      link.href = objectUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(objectUrl);
      }, 100);
    }, (error) => {
      this.spinner.hide();
      Swal.fire({ title: 'No se encontró registros. Aplique otros filtros', icon: 'info', showCloseButton: true });
    });
  }

}
