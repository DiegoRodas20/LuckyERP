import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { ISelectItem } from '../models/constantes';
import { E_Liquidacion_Transporte, E_Liquidacion_Transporte_Guia, E_Liquidacion_Transporte_Punto } from '../models/liquidacionTransporte';
import { TransporteService } from '../transporte.service';
import { LiquidacionTransporteBodyArticuloComponent } from './componentes/liquidacion-transporte-body-articulo/liquidacion-transporte-body-articulo.component';
import { LiquidacionTransporteBodyGuiaComponent } from './componentes/liquidacion-transporte-body-guia/liquidacion-transporte-body-guia.component';
import { LiquidacionTransporteHeaderComponent } from './componentes/liquidacion-transporte-header/liquidacion-transporte-header.component';
import { LogDialogProrrateoPresupuestoComponent } from './dialogs/log-dialog-prorrateo-presupuesto/log-dialog-prorrateo-presupuesto.component';
import { LogDialogVerProrrateosComponent } from './dialogs/log-dialog-ver-prorrateos/log-dialog-ver-prorrateos.component';

@Component({
  selector: 'app-liquidacion-transporte',
  templateUrl: './liquidacion-transporte.component.html',
  styleUrls: ['./liquidacion-transporte.component.css']
})
export class LiquidacionTransporteComponent implements OnInit {
  @ViewChild(LiquidacionTransporteHeaderComponent, { static: true }) compHeader: LiquidacionTransporteHeaderComponent;
  @ViewChild(LiquidacionTransporteBodyGuiaComponent, { static: true }) compGuias: LiquidacionTransporteBodyGuiaComponent;
  liquidacion: E_Liquidacion_Transporte;
  guiaList: E_Liquidacion_Transporte_Guia[];
  guiasFilter: E_Liquidacion_Transporte_Guia[];
  motivos: ISelectItem[];
  codigos: ISelectItem[];
  anios: ISelectItem[];
  listEstadoIds: number[];
  listCostoCeroIds: number[];
  step: number = 0;
  block: boolean;
  titlePuntos: string;
  titleGuias: string;
  sIdPais: string;
  nIdEmpresa: number;
  nIdUser: number;
  pParameterEstadosDet: string;
  pParameterCostosDet: string;
  origenPunto: string;
  destinoPunto: string;

  constructor(
    private transporService: TransporteService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) {
    this.sIdPais = localStorage.getItem('Pais');
    this.nIdEmpresa = Number(localStorage.getItem('Empresa'));
    let user = localStorage.getItem("currentUser");
    this.nIdUser = JSON.parse(window.atob(user.split(".")[1])).uid;
  }

  ngOnInit(): void {
    const sCodTransporte = this.route.snapshot.paramMap.get('sCodTransporte');
    if (sCodTransporte) {
      this.compHeader.sCodTransporteField.setValue(sCodTransporte);
      this.compHeader.fnGetLiquidacion();
    }
    this.init();
  }

  /* #region  Servicios de inicialización del componente */
  init(): void {
    this.spinner.show();
    forkJoin({
      resMotivos: this.transporService.fnLiquidacionTransporte(1, 2, null, 5),
      resAnios: this.transporService.fnLiquidacionTransporte(1, 2, null, 7)
    }).subscribe(({ resMotivos, resAnios }) => {
      this.spinner.hide();
      this.motivos = resMotivos ? resMotivos.data : [];
      this.anios = resAnios ? resAnios.data : [];
      this.fnListarCodTransportes(moment().year());
    }, (error) => { this.spinner.hide() });
  }
  /* #endregion */

  /* #region  Método de obtención de una liquidación */
  fnObtenerLiquidacion(sCodTransporte: string): void {
    this.step = 0;
    this.titleGuias = null;
    this.block = false;
    this.spinner.show();
    const parameters = `${sCodTransporte}|${this.sIdPais}`;
    this.transporService.fnLiquidacionTransporte(1, 2, parameters, 1).subscribe(res => {
      this.spinner.hide();
      this.liquidacion = res.data;
      this.nextStep();
      this.fnObtenerGuias(sCodTransporte);
    });
  }
  /* #endregion */

  /* #region  Método que lista los códigos de transporte dependiendo el año que se registraron */
  fnListarCodTransportes(anio: number) {
    this.spinner.show();
    const parameters = `${this.sIdPais}|${anio}`;
    this.transporService.fnLiquidacionTransporte(1, 2, parameters, 6).subscribe(res => {
      this.spinner.hide();
      this.codigos = res ? res.data : [];
    });
  }
  /* #endregion */

  /* #region  Método de obtención de una lista de guías por Ruta */
  fnObtenerGuiaList(punto: E_Liquidacion_Transporte_Punto): void {
    this.guiasFilter = this.guiaList.filter(item => item.nPunto == punto.nPunto);
    this.titleGuias = `${this.spaces}Nro. Punto: ${punto.sPunto} ${this.spaces}`;
    this.origenPunto = `Origen: ${punto.sLugarOrigen}`;
    this.destinoPunto = `Destino: ${punto.sSucursalDestino}`;
    this.nextStep();
  }
  /* #endregion */

  /* #region  Método de obtención de una lista de artículos por Guía */
  fnObtenerArticuloList(guia: E_Liquidacion_Transporte_Guia): void {
    this.spinner.show();
    this.transporService.fnLiquidacionTransporte(1, 2, `${guia.nIdOperMov}`, 4).subscribe(res => {
      this.spinner.hide();
      this.dialog.open(LiquidacionTransporteBodyArticuloComponent, {
        autoFocus: false,
        width: '80%',
        height: 'auto',
        data: { 'list': res.data, 'concatenado': `${guia.sCodPresupuesto} - ${guia.sNota}` }
      })
    }, (error) => { this.spinner.hide() });
  }
  /* #endregion */

  /* #region  Método de actualización de liquidación del transporte */
  fnActualizarDatos(pParameter: string): void {
    this.spinner.show();
    this.transporService.fnLiquidacionTransporte(1, 3, pParameter, 1, this.pParameterCostosDet).subscribe(res => {
      this.spinner.hide();
      if (res.result == 1) {
        Swal.fire({ title: 'Se actualizó de manera exitosa', icon: 'success', timer: 2000 });
        this.liquidacion.nPrecioTotal = Number(this.compHeader.nTotalField.value);
      } else {
        Swal.fire({ title: 'Hubo un error en la actualización', icon: 'warning', timer: 2000 });
      }
    }, (error) => { this.spinner.hide() });
  }
  /* #endregion */

  /* #region  Método que liquida las guías seleccionadas. */
  fnLiquidar(sCodTransporte: string): void {
    this.spinner.show();
    const noLiquidadas = this.guiaList.filter(item => !item.bLiquidado).length;
    const bEstado = noLiquidadas > 0 ? 0 : 1;
    this.compHeader.fnUpdateEstado(bEstado == 0 ? 'Pendiente' : 'Liquidado');
    this.transporService.fnLiquidacionTransporte(1, 3, `${sCodTransporte}|${bEstado}`, 2, this.pParameterEstadosDet).subscribe(res => {
      this.spinner.hide();
      if (res.result == 1) {
        Swal.fire({ title: 'Se actualizó de manera exitosa', icon: 'success', timer: 2000 });
        this.fnObtenerGuias(sCodTransporte);
        this.prevStep();
      } else {
        Swal.fire({ title: 'Hubo un error en la actualización', icon: 'warning', timer: 2000 });
      }
    }, (error) => { this.spinner.hide() });
  }
  /* #endregion */

  /* #region  Método de obtención del listado de prorrateos por presupuesto del transporte */
  fnOpenDialogTerminar(sCodTransporte: string): void {
    if (this.liquidacion.nPrecioTotal == 0) {
      Swal.fire({ title: 'EL transporte requiere registrar un precio total', icon: 'warning', timer: 2000 });
      return;
    }
    if (this.liquidacion.sChofer == null) {
      Swal.fire({ title: 'EL transporte requiere registrar un chofer', icon: 'warning', timer: 2000 });
      return;
    }
    this.spinner.show();
    const parameters = `${sCodTransporte}|${this.nIdEmpresa}`;
    this.transporService.fnLiquidacionTransporte(1, 2, parameters, 8).subscribe(res => {
      this.spinner.hide();
      this.dialog.open(LogDialogProrrateoPresupuestoComponent, {
        disableClose: true, autoFocus: false, width: '900px', height: 'auto',
        data: { 'list': res.data, 'nPrecioTotal': this.compHeader.nTotalField.value, 'liquidacion': this.liquidacion, 'sIdPais': this.sIdPais, 'sCodTransporte': sCodTransporte }
      }).afterClosed().subscribe((result: string) => {
        if (result) {
          this.fnTerminar(result, sCodTransporte);
        }
      });
    }, (error) => { this.spinner.hide() });
  }
  /* #endregion */

  /* #region  Método de obtención del listado de histótico de prorrateos del transporte */
  fnVerProrrateos(sCodTransporte: string): void {
    this.spinner.show();
    this.transporService.fnLiquidacionTransporte(1, 2, `${sCodTransporte}`, 9).subscribe(res => {
      this.spinner.hide();
      this.dialog.open(LogDialogVerProrrateosComponent, {
        disableClose: true, autoFocus: false, width: '900px', height: 'auto',
        data: { 'list': res ? res.data : [], 'nPrecioTotal': this.compHeader.nTotalField.value }
      }).afterClosed().subscribe((result: string) => {
        if (result) { }
      });
    }, (error) => { this.spinner.hide() });
  }
  /* #endregion */

  /* #region  Método que registra los prorrateos del transporte */
  fnTerminar(parameterDet: string, sCodTransporte: string) {
    const pParameters = `${sCodTransporte}|${this.sIdPais}|${this.nIdUser}`;
    this.transporService.fnLiquidacionTransporte(1, 1, pParameters, 1, parameterDet).subscribe(res => {
      this.spinner.hide()
      if (res.result == 1) {
        Swal.fire({ title: 'Se ha registrado de manera exitosa', icon: 'success', timer: 2000 });
        this.compHeader.fnUpdateEstado('Terminado');
        this.fnObtenerLiquidacion(sCodTransporte);
      } else {
        Swal.fire({ title: 'Hubo un error en el registro', icon: 'error', timer: 2000 });
      }
    }, (error) => { this.spinner.hide() });
  }
  /* #endregion */

  /* #region  Método que obtiene las guías del transporte */
  fnObtenerGuias(sCodTransporte: string): void {
    const parameters = `${sCodTransporte}|${this.sIdPais}`;
    this.transporService.fnLiquidacionTransporte(1, 2, parameters, 3).subscribe(res => {
      this.guiaList = res ? res.data : [];
      const cantLiquidadas = this.guiaList.filter(item => item.bLiquidado).length;
      this.titlePuntos = `${this.spaces}Total Guías: ${this.guiaList.length} ${this.spaces}Liquidadas: ${cantLiquidadas}`;
      this.compHeader.isTotalLiquidado = this.guiaList.length == cantLiquidadas ? true : false;
      this.compHeader.hasChanges = false;
      this.listEstadoIds = [];
      this.listCostoCeroIds = [];
    })
  }
  /* #endregion */

  /* #region  Método que libera al transporte */
  fnLiberar(sCodTransporte: string): void {
    this.spinner.show();
    this.transporService.fnLiquidacionTransporte(1, 3, `${sCodTransporte}`, 3).subscribe(res => {
      this.spinner.hide();
      if (res.result == 1) {
        Swal.fire({ title: 'Se ha liberado de manera exitosa', icon: 'success', timer: 2000 });
        this.compHeader.fnUpdateEstado('Liquidado');
        this.fnObtenerLiquidacion(sCodTransporte);
      } else {
        Swal.fire({ title: 'Hubo un error en el registro', icon: 'error', timer: 2000 });
      }
    }, (error) => { this.spinner.hide() })
  }
  /* #endregion */

  /* #region  Método que concatena los nIdOperMov  de las guías a liquidar*/
  fnChangeEstado(param: number): void {
    const guia = this.guiaList.find(item => item.nIdOperMov == param);
    this.guiaList.find(item => item.nIdOperMov == param).bLiquidado = !guia.bLiquidado;
    const indice = this.listEstadoIds.indexOf(param);
    indice >= 0 ? this.listEstadoIds.splice(indice, 1) : this.listEstadoIds.push(param);
    if (this.listEstadoIds.length > 0) {
      this.compHeader.hasChanges = true;
      this.pParameterEstadosDet = this.listEstadoIds.join("|");
    } else {
      this.compHeader.hasChanges = false;
    }
  }
  /* #endregion */

  /* #region  Método que concatena los nIdOperMov de las guías a actualizar su costo cero*/
  fnChangeCostoCero(param: number): void {
    const guia = this.guiaList.find(item => item.nIdOperMov == param);
    this.guiaList.find(item => item.nIdOperMov == param).bCostoCero = !guia.bCostoCero;
    const indice = this.listCostoCeroIds.indexOf(param);
    indice >= 0 ? this.listCostoCeroIds.splice(indice, 1) : this.listCostoCeroIds.push(param);
    this.pParameterCostosDet = this.listCostoCeroIds.length > 0 ? this.listCostoCeroIds.join('|') : '';
  }
  /* #endregion */

  get spaces(): string { return Array(10).fill('\xa0').join('') }
  get titleSucursal(): string { return this.liquidacion ? ` ( Distribución - ${this.liquidacion.sSucursal})` : '' }

  nextStep() { this.step++ }

  prevStep() {
    this.titleGuias = null;
    this.step = 1;
  }
}
