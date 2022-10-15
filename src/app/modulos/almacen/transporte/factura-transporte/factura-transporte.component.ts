import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { isNullOrUndefined } from 'util';
import { ISelectItem } from '../models/constantes';
import { E_Factura_Transporte } from '../models/facturaTransporte';
import { TransporteService } from '../transporte.service';
import { FacturaDirectaTransporteComponent } from './components/factura-directa-transporte/factura-directa-transporte.component';
import { FacturaTransporteAsignarComponent } from './components/factura-transporte-asignar/factura-transporte-asignar.component';
import { FacturaTransporteHeaderComponent } from './components/factura-transporte-header/factura-transporte-header.component';
import { FacturaTransporteTableComponent } from './components/factura-transporte-table/factura-transporte-table.component';

@Component({
  selector: 'app-factura-transporte',
  templateUrl: './factura-transporte.component.html',
  styleUrls: ['./factura-transporte.component.css']
})
export class FacturaTransporteComponent implements OnInit {
  @ViewChild(FacturaTransporteHeaderComponent, { static: true }) compHeader: FacturaTransporteHeaderComponent;
  @ViewChild(FacturaTransporteTableComponent, { static: true }) compBody: FacturaTransporteTableComponent;

  @ViewChild(FacturaDirectaTransporteComponent, { static: true }) compFacturaDirecta: FacturaDirectaTransporteComponent;

  empresas: ISelectItem[];
  clientes: ISelectItem[];
  sucursales: ISelectItem[];
  proveedores: ISelectItem[];

  operaciones: E_Factura_Transporte[];
  idPais: string;
  idEmpresa: string;

  constructor(
    private transporService: TransporteService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
  ) {
    this.idPais = localStorage.getItem('Pais');
    this.idEmpresa = localStorage.getItem('Empresa');
  }

  ngOnInit(): void {
    /* #region  Inicialización con consumo paralelo de servicios */
    this.spinner.show();
    forkJoin({
      resEmpresas: this.transporService.fnFacturaTransporte(1, 2, this.idPais, 2),
      resClientes: this.transporService.fnFacturaTransporte(1, 2, this.idPais, 3),
      resSucursales: this.transporService.fnFacturaTransporte(1, 2, `${this.idPais}|${this.idEmpresa}`, 4),
    }).subscribe(
      ({ resEmpresas, resClientes, resSucursales }) => {
        this.spinner.hide();
        this.empresas = resEmpresas ? resEmpresas.lista : [];
        this.clientes = resClientes ? resClientes.lista : [];
        this.sucursales = resSucursales ? resSucursales.lista : [];
        if (this.sucursales.length > 0) {
          this.compHeader.nSucCodField.setValue(this.sucursales[0].nId)
        }
      }
    );
    /* #endregion */
  }

  fnChangeDistribucion(param: string): void {
    this.operaciones = [];
    this.compBody.sumaPrecio = 0;
    this.compBody.isDistribucion = param == 'DIST' ? true : false;
    param == 'DIST' ? this.compBody.addColumn() : this.compBody.hideColumn();
  }

  fnGetSucursales(nIdEmp: number): void {
    this.spinner.show();
    this.transporService.fnFacturaTransporte(1, 2, `${this.idPais}|${nIdEmp}`, 4).subscribe(res => {
      this.spinner.hide();
      this.sucursales = res ? res.lista : [];
      if (this.sucursales.length > 0) {
        this.compHeader.nSucCodField.setValue(res.lista[0].nId)
      }
    });
  }

  /* #region  Método de búsqueda con filtros */
  fnGetOperaciones(): void {
    let valorForm = this.compHeader.form.value;
    if (valorForm.dInicio > valorForm.dFin) {
      Swal.fire('Advertencia!', 'La fecha de inicio no puede ser mayor a la fecha fin.', 'warning');
      return;
    }

    this.spinner.show();
    let concatenado = '';
    Object.values(this.compHeader.form.controls).forEach(
      (control: FormControl, index) => {
        const vFiltro = index > 1 ? control.value : moment(control.value).format("YYYY-MM-DD");
        concatenado += `${vFiltro ?? ''}|`;
      });
    const parameter = concatenado.substring(0, concatenado.length - 1);
    this.transporService.fnFacturaTransporte(1, 2, parameter, 1).subscribe(res => {
      this.spinner.hide();
      this.operaciones = res ? res.lista : [];
      this.compBody.sumaPrecio = 0;
    },
      (error) => {
        this.spinner.hide();
        console.log(error.message);
      });
  }
  /* #endregion */

  /* #region  Método de obtención de una lista de artículos por Guía */
  fnOpenModal(): void {
    if (!this.compBody.concatIdOperMovField.value?.trim()) {
      Swal.fire({ title: 'Debe seleccionar mínimo una operación para asignar', icon: 'info' });
      return;
    }

    this.spinner.show();
    this.transporService.fnFacturaTransporte(1, 2, '', 5).subscribe(res => {
      this.spinner.hide();
      const dialog = this.dialog.open(FacturaTransporteAsignarComponent, {
        width: '80%',
        height: 'auto',
        disableClose: true,
        data: {
          'sTipoEnvio': this.compHeader.tiposEnvio.find(x => x.nId == this.compHeader.sTipoEnvioField.value)?.sDescripcion,
          'sEmpresa': this.empresas.find(x => x.nId == this.compHeader.nIdEmpresaField.value)?.sDescripcion,
          'nPrecio': this.compBody.txtSumaPrecioField.value,
          'nIdEmpresa': this.compHeader.nIdEmpresaField.value,
          'operMovIds': this.compBody.concatIdOperMovField.value,
          'proveedores': this.proveedores = res ? res.lista : []
        }
      });

      dialog.componentInstance.actualizarOperaciones.subscribe(data => {
        if (data == 1) {
          this.fnGetOperaciones();
          this.compFacturaDirecta.fnListarFacturas();
        }
      })
    });
  }
  /* #endregion */

}
