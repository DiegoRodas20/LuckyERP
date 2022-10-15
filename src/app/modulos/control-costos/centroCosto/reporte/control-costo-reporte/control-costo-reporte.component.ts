import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CentroCostoService } from '../../centroCosto.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { asistenciapAnimations } from '../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-control-costo-reporte',
  templateUrl: './control-costo-reporte.component.html',
  styleUrls: ['./control-costo-reporte.component.css'],
  animations: [asistenciapAnimations]
})
export class ControlCostoReporteComponent implements OnInit {

  listaYear: any[];
  listaPresupuesto: any[];
  nIdEmpresa: string;
  formReporte: FormGroup;
  tsLista = 'active';
  fbLista = [
    {icon: 'article', tool: 'Generar Reporte Excel', color:'white'},
    {icon: 'exit_to_app', tool: 'Salir', color:'warn'}
  ];
  abLista = [];
  constructor(
    // public dialogRef: MatDialogRef<ControlCostoReporteComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any,
    private costoService: CentroCostoService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService
  ) {
    this.crearFormulario();
  }


  async ngOnInit() {
    this.nIdEmpresa = localStorage.getItem('Empresa');
    this.onToggleFab(1,-1);
    await this.obtenerListaPresupuesto();
    await this.obtenerListaYear();
    this.inicializarYear();
  }

  inicializarYear() {
    const year = this.listaYear[0].descripcion;
    this.formReporte.controls.year.setValue(year);
  }

  crearFormulario() {
    this.formReporte = this.fb.group({
      'presupuesto': [null],
      'year': [null]
    })
  }

  async generarReporteExcel() {
    const year = this.formReporte.get('year').value;
    if(year === null) {
      return Swal.fire({
        title: 'El campo de año es obligatorio',
        icon: 'warning',
        timer: 1500
      })
    }
    this.spinner.show();
    const presupuesto = this.formReporte.get('presupuesto').value === null ? 0 : this.formReporte.get('presupuesto').value;
    const response: any = await this.costoService.generarExcelInformeGasto(1,`${this.nIdEmpresa}|${year}|${presupuesto}`);

    if(response){
      // Descargar el Excel
      const data = response;
      const fileName = `Reporte Control Costo.xlsx`;
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(data, fileName);
        return;
      }
      const objectUrl = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      // Trigger de descarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

      Swal.fire({
        title: 'El Excel ha sido generado',
        html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
        icon: 'success',
        showCloseButton: true
      })
    }
    else{
      Swal.fire('¡Verificar!', 'No se encontraron registros', 'warning')
    }

    this.spinner.hide();
  }

  salir() {
    // this.dialogRef.close();
  }

  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;

  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.generarReporteExcel();
        break;
      case 1:
        this.salir();
      default:
        break;
    }
  }

  async obtenerListaPresupuesto() {
    this.listaPresupuesto = await this.costoService.obtenerInformacionInformeControlCosto(1,`${this.nIdEmpresa}`);
  }

  async obtenerListaYear() {
    this.listaYear = await this.costoService.obtenerInformacionInformeControlCosto(2,'');
    this.listaYear = this.listaYear.reverse()
  }

}
