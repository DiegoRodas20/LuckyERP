import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BusquedaArticuloComponent } from '../busqueda-articulo/busqueda-articulo.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { InventarioService } from '../../../inventario.service';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-report-excel',
  templateUrl: './report-excel.component.html',
  styleUrls: ['./report-excel.component.css'],
  animations: [asistenciapAnimations]
})
export class ReportExcelComponent implements OnInit {

  abLista = [];
  tsLista = 'inactive';
  fbLista = [
    { icon: 'save', tool: 'Crear' }
  ];
  formReporte: FormGroup;
  listaClientes: any;
  listaArticulo: any;
  listaPasillos: any;
  listaEmpresa: any;
  idPais: string;
  idEmp: string;
  nombreAlmacenBase: string;
  idAlmacenBase: number;
  step = 0;
  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    public diaglogRef: MatDialogRef<BusquedaArticuloComponent>,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

  async ngOnInit() {
    this.idPais = localStorage.getItem('Pais');
    this.idEmp = localStorage.getItem('Empresa');
    this.idAlmacenBase = this.data.idAlmacenBase;
    this.crearFomulario();
    const pasillos = this.data.listaPasillo;
    this.nombreAlmacenBase = this.data.nombreAlmacenBase;
    this.listaPasillos = this.añadirCampoLista(pasillos);
    this.listaClientes = await this.inventarioService.obtenerInformacionReporteExcel(1, `${this.idPais}|`, '');
    this.listaArticulo = await this.inventarioService.listaInformacionInventario(5, `${this.idPais}`);
    this.listaEmpresa = await this.inventarioService.listaInformacionInventario(2, `${this.idPais}`);
    this.inicializarEmpresa();
    this.onToggleFab(1, -1)
  }

  inicializarEmpresa() {
    const idEmpresa = Number.parseInt(this.idEmp);
    this.formReporte.controls.empresa.setValue(idEmpresa);
  }

  crearFomulario() {
    this.formReporte = this.fb.group({
      'ordenar': ['1', Validators.required],
      'buscar': [null, Validators.required],
      'cliente': [null, Validators.required],
      'articulo': [null],
      'empresa': [null]
    })
  }

  // Aquí agregaremos todos los pasillos
  añadirCampoLista(pasillos: any): any {
    let listaPasillos: any[] = [];
    // listaPasillos =  pasillos;
    listaPasillos.push({
      'idUbicacion': 0,
      'codigo': "",
      'imagen': "",
      'nombre': "Todos los pasillos",
    })
    listaPasillos.push(...pasillos);
    return listaPasillos;
  }

  async generarExcel() {

    // Validar campos
    if (this.formReporte.invalid) {
      return Object.values(this.formReporte.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }
    const nombreEmpresa = localStorage.getItem('NomEmpresa');
    const cliente = this.formReporte.get('cliente').value;
    const ordenar = this.formReporte.get('ordenar').value;
    const buscar = this.formReporte.get('buscar').value;
    const articulo = this.formReporte.get('articulo').value === null ? '' : this.formReporte.get('articulo').value;
    const response: any = await this.inventarioService.obtenerInformacionReporteExcel(2, `${cliente}|${ordenar}|${buscar}|${articulo}|${this.idAlmacenBase}`, nombreEmpresa);

    if (response === null) {
      return Swal.fire({
        title: '¡Atención!',
        text: 'No se encuentran registros en el excel',
        icon: 'warning',
      })
    } else {
      // Descargar el Excel
      const data = response;
      const fileName = `Reporte Inventario.xlsx`;
      if (window.navigator && window.navigator['msSaveOrOpenBlob']) {
        window.navigator['msSaveOrOpenBlob'](data, fileName);
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

  }

  async generarReporteDiferenciaUbicacion() {
    this.spinner.show();
    const empresa = this.formReporte.get('empresa').value;
    if (empresa === '' || empresa === null) {
      this.spinner.hide();
      return Swal.fire({
        text: 'Por favor seleccione la empresa',
        title: '¡Atención!',
        icon: 'warning',
      })
    }
    const resp: any = await this.inventarioService.generarReporteUbicacionKardex(1, `${empresa}|`, '');
    if (resp === null) {
      this.spinner.hide();
      return Swal.fire({
        text: 'No se encuentran registros en el excel',
        title: '¡Atención!',
        icon: 'warning',
      })
    } else {
      // Descargar el Excel
      const data = resp;
      const fileName = `Reporte de ubicación sin saldo del sistema.xlsx`;
      if (window.navigator && window.navigator['msSaveOrOpenBlob']) {
        window.navigator['msSaveOrOpenBlob'](data, fileName);
        return;
      }
      const objectUrl = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      // Trigger de descarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      this.spinner.hide();
      Swal.fire({
        title: 'El Excel ha sido generado',
        html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
        icon: 'success',
        showCloseButton: true
      })
    }

  }

  async generarReporteDiferenciaKardex() {
    this.spinner.show();
    const empresa = this.formReporte.get('empresa').value;
    if (empresa === '' || empresa === null) {
      this.spinner.hide();
      return Swal.fire({
        title: '¡Atención!',
        text: 'Por favor seleccione la empresa',
        icon: 'warning',
      })
    }
    const resp: any = await this.inventarioService.generarReporteUbicacionKardex(2, `${empresa}|`, '');
    if (resp === null) {
      this.spinner.hide();
      return Swal.fire({
        title: '¡Atención!',
        text: 'No se encuentran registros en el excel',
        icon: 'warning',
      })
    } else {
      // Descargar el Excel
      const data = resp;
      const fileName = `Reporte del saldo sistema sin ubicación.xlsx`;
      if (window.navigator && window.navigator['msSaveOrOpenBlob']) {
        window.navigator['msSaveOrOpenBlob'](data, fileName);
        return;
      }
      const objectUrl = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      // Trigger de descarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      this.spinner.hide();
      Swal.fire({
        title: 'El Excel ha sido generado',
        html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
        icon: 'success',
        showCloseButton: true
      })
    }

  }

  salir() {
    this.diaglogRef.close();
  }

  setStep(index: number) {
    this.step = index;
  }

  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;

  }

  get ordenarPorNoValido() {
    return this.formReporte.get('ordenar').invalid && this.formReporte.get('ordenar').touched;
  }

  get buscarPorNoValido() {
    return this.formReporte.get('buscar').invalid && this.formReporte.get('buscar').touched;
  }

  get clienteNoValido() {
    return this.formReporte.get('cliente').invalid && this.formReporte.get('cliente').touched;
  }

  get empresaNoValido() {
    return this.formReporte.get('empresa').invalid && this.formReporte.get('empresa').touched;
  }

}
