import { DecimalPipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { PptoPartidaSolicitud } from '../../../api/models/activoAsignadoPersonalDTO';
import { PartidaRqHerramientaDTO, PresupuestoRqHerramientaDTO } from '../../../api/models/requerimientoHerramienta.model';
import { ActivoAsignadoPersonalService } from '../../../api/services/activo-asignado-personal.service';
import { RequerimientoHerramientaService } from '../../../api/services/requerimiento-herramienta.service';

@Component({
  selector: 'app-ti-dialog-ticket-solicitud',
  templateUrl: './ti-dialog-ticket-solicitud.component.html',
  styleUrls: ['./ti-dialog-ticket-solicitud.component.css'],
  providers: [DecimalPipe]
})
export class TiDialogTicketSolicitudComponent implements OnInit {

  dataSourcePpto: MatTableDataSource<any>;
  @ViewChild('paginatorPpto', { static: true }) paginatorPpto: MatPaginator;
  @ViewChild('sortPpto', { static: true }) sortPpto: MatSort;
  displayedColumnsPpto: string[] = ['opcion', 'sPresupuesto', 'sSucursal', 'sPartida', 'nMonto'];

  listaPresupuestos: PresupuestoRqHerramientaDTO[] = [];
  listaPartida: PartidaRqHerramientaDTO[] = [];

  listaSolicitud: PptoPartidaSolicitud[] = [];

  formSolicitud: FormGroup;
  storageData: SecurityErp;

  // Variables
  valorTipoCambio: number // Valor actual de la moneda del pais en dolares

  constructor(
    public dialogRef: MatDialogRef<TiDialogTicketSolicitudComponent>,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private _activoAsignadoPersonalService: ActivoAsignadoPersonalService,
    private _requerimientoHerramientaService: RequerimientoHerramientaService,
    private _decimalPipe: DecimalPipe,
    @Inject(MAT_DIALOG_DATA) public data: {
      idPersonal: number, idArticulo: number, precioPenalizacion: number,
      idSucursal: number, sSucursal: string
    },
  ) {
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.storageData = new SecurityErp();
  }

  inicializarForm() {
    this.formSolicitud = this.formBuilder.group({
      presupuesto: [null, Validators.required],
      partida: [null, Validators.required],
      total: null,
      totalSoles: null,
      pendiente: null,
      monto: [0, [Validators.required, Validators.min(0)]]
    })
  }
  async ngAfterViewInit() {
    await timer(250).pipe(take(1)).toPromise(); //timer para renderize el componente

    this.spinner.show();
    this.GetPresupuestoBySolicitantes(this.data.idPersonal);
    this.GetPartida(this.data.idArticulo);

    // Recuperamos el tipo de cambio del pais
    const result = await this._activoAsignadoPersonalService.GetTipoCambioActual(this.storageData.getPais())
    this.valorTipoCambio = Number(result.response.data[0].sDescripcion);

    this.formSolicitud.patchValue({
      total: this._decimalPipe.transform(this.data.precioPenalizacion, '1.4-4'),
      totalSoles: this._decimalPipe.transform(this.data.precioPenalizacion * this.valorTipoCambio, '1.4-4'),
      pendiente: this._decimalPipe.transform(this.data.precioPenalizacion * this.valorTipoCambio, '1.4-4'),
    })
    this.spinner.hide();
  }

  async GetPresupuestoBySolicitantes(nIdPersonal: number) {

    let response = await this._requerimientoHerramientaService.GetPresupuestoBySolicitante(nIdPersonal, 0)
    this.listaPresupuestos = response.response.data
  }

  async GetPartida(nIdArticulo: number) {
    this.listaPartida = [];

    let response = await this._requerimientoHerramientaService.GetPartidaByArticulo(nIdArticulo, this.storageData.getPais())
    this.listaPartida = response.response.data
  }

  async fnValidarSaldo(nIdPartida: number, montoTotal: number) {

    let datos = this.formSolicitud.value;
    let fechaActual = moment();

    let total = montoTotal;

    this.listaSolicitud.forEach(item => {
      if (item.nIdPartida == nIdPartida && item.nIdPresupuesto == datos.presupuesto) {
        total += item.nMonto;
      }
    })

    this.spinner.show()

    let response = await this._requerimientoHerramientaService.ValidarSaldoPpto(
      datos.presupuesto, this.data.idSucursal,
      nIdPartida, fechaActual.year().toString(), fechaActual.month() + 1,
      total
    );

    this.spinner.hide()

    return response.response.data[0]
  }

  async fnGuardar() {

    let montoPendiente = this.fnMontoPendiente()
    if (montoPendiente > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        html: `Aún tiene un monto de ${montoPendiente} por agregar.`,
      });
      return;
    }

    this.dialogRef.close(this.listaSolicitud)

  }

  async fnAgregarItem() {

    if (this.formSolicitud.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        html: 'Revise los datos.',
      });
      this.formSolicitud.markAllAsTouched();
      return;
    }

    let datos = this.formSolicitud.value
    let validacionRow = this.listaSolicitud.find(item => item.nIdPartida == datos.partida && item.nIdPresupuesto == datos.presupuesto)

    if (validacionRow) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        html: `Ya hay un registro con el presupuesto y partida indicado.`,
      });
      return;
    }

    if (datos.monto <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        html: `El monto no puede ser menor o igual que 0.`,
      });
      return;
    }

    let montoPendiente = this.fnMontoPendiente()
    if (montoPendiente < datos.monto) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        html: `El monto que quiere ingresar es mayor al monto pendiente.`,
      });
      return;
    }


    let validacion = await this.fnValidarSaldo(datos.partida, datos.monto);
    if (validacion != '') {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        html: validacion,
      });
      return;
    }

    let maxId = 0;
    this.listaSolicitud.forEach(item => {
      if (item.nId > maxId) {
        maxId = item.nId;
      }
    })

    let presupuesto = this.listaPresupuestos.find(item => item.nIdCentroCosto == datos.presupuesto)
    let partida = this.listaPartida.find(item => item.nIdPartida == datos.partida)

    let row: PptoPartidaSolicitud = {
      nId: maxId + 1,
      nIdPresupuesto: datos.presupuesto,
      sPresupuesto: presupuesto.sCentroCosto,
      sSucursal: this.data.sSucursal,
      nIdPartida: datos.partida,
      sPartida: partida.sCodPartida + ' - ' + partida.sPartida,
      nMonto: datos.monto
    }

    this.listaSolicitud.push(row);
    this.fnLlenarTabla();

    this.formSolicitud.patchValue({
      presupuesto: null,
      partida: null,
      monto: 0,
      pendiente: this._decimalPipe.transform(this.fnMontoPendiente())
    })
    this.formSolicitud.markAsUntouched()
  }

  fnLlenarTabla() {
    this.dataSourcePpto = new MatTableDataSource(this.listaSolicitud);
    this.dataSourcePpto.paginator = this.paginatorPpto;
    this.dataSourcePpto.sort = this.sortPpto;
  }

  fnMontoPendiente() {
    let montoActual = this.listaSolicitud.reduce((sum, currentValue) => sum + currentValue.nMonto, 0);
    return (this.data.precioPenalizacion * this.valorTipoCambio) - montoActual;
  }

  fnQuitarItem(row: PptoPartidaSolicitud) {
    this.listaSolicitud = this.listaSolicitud.filter(item => item.nId != row.nId)
    this.formSolicitud.patchValue({
      pendiente: this.fnMontoPendiente()
    })
    this.fnLlenarTabla();
  }
}
