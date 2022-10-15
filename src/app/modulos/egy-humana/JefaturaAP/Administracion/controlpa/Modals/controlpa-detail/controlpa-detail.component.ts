import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import printJS from "print-js";
import Swal from "sweetalert2";

import { adminpAnimations } from "../../../../Animations/adminp.animations";
import {
  InfoDeposito,
  IOpcionFb,
  IPersonalDetalleDeposito,
} from "../../../../Model/Icontrolpa";
import { ControlpaService } from "../../../../Services/controlpa.service";

moment.locale("es");

@Component({
  selector: "app-controlpa-detail",
  templateUrl: "./controlpa-detail.component.html",
  styleUrls: [
    "./controlpa-detail.component.css",
    "./controlpa-detail.component.scss",
  ],
  animations: [adminpAnimations],
})
export class ControlpaDetailComponent implements OnInit {
  //#region INPUT
  @Input() nIdDP = 0;
  @Input() personal: IPersonalDetalleDeposito[] = [];

  //#endregion

  //#region GENERAL
  recargarAlCerrar = false;
  private _meses = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
  };
  public get meses() {
    return this._meses;
  }
  public set meses(value) {
    this._meses = value;
  }
  //#endregion

  //#region INFORMACION DEL DEPOSITO
  nIdHDP: number = 0;
  urlDocumento: string = "";
  infoDeposito: FormGroup = this.formBuilder.group({
    sNombresUser: [{ value: null, disabled: true }],
    sRegDeposito: [{ value: null, disabled: true }],
    sDescPlla: [{ value: null, disabled: true }],
    sDevengue: [{ value: null, disabled: true }],
    sTipo: [{ value: null, disabled: true }],
    sEstadoDeposito: [{ value: null, disabled: true }],
  });
  //#endregion

  //#region FB

  public deshabilitarFb = false;
  private _estadoFb = 2;
  private _animacionFb: string = "inactive";
  private _opcionesFb: IOpcionFb[] = [];
  private _cancelarFb: IOpcionFb[] = [
    {
      icon: "money_off",
      tool: "Cancelar deposito",
      disabled: false,
    },
  ];
  private _imprimirFb: IOpcionFb[] = [
    {
      icon: "print",
      tool: "Imprimir",
      disabled: false,
    },
  ];

  public get cancelarFb(): IOpcionFb[] {
    return this._cancelarFb;
  }
  public set cancelarFb(value: IOpcionFb[]) {
    this._cancelarFb = value;
  }
  public get imprimirFb(): IOpcionFb[] {
    return this._imprimirFb;
  }
  public set imprimirFb(value: IOpcionFb[]) {
    this._imprimirFb = value;
  }

  public get opcionesFb(): IOpcionFb[] {
    return this._opcionesFb;
  }
  public set opcionesFb(value: IOpcionFb[]) {
    this._opcionesFb = value;
  }

  public get estadoFb() {
    return this._estadoFb;
  }
  public set estadoFb(value) {
    this._estadoFb = value;
  }
  public get animacionFb(): string {
    return this._animacionFb;
  }
  public set animacionFb(value: string) {
    this._animacionFb = value;
  }
  //#endregion

  //#region TABLA DE PERSONAL

  expandedMore: IPersonalDetalleDeposito | null;
  private _tablaPersonalDC = [
    "sNombres",
    "planilla",
    "tipo",
    "documento",
    "importe",
  ];

  private _tablaPersonalDS: MatTableDataSource<IPersonalDetalleDeposito> = new MatTableDataSource<IPersonalDetalleDeposito>(
    []
  );

  public get tablaPersonalDC() {
    return this._tablaPersonalDC;
  }
  public set tablaPersonalDC(value) {
    this._tablaPersonalDC = value;
  }
  public get tablaPersonalDS(): MatTableDataSource<IPersonalDetalleDeposito> {
    return this._tablaPersonalDS;
  }
  public set tablaPersonalDS(
    value: MatTableDataSource<IPersonalDetalleDeposito>
  ) {
    this._tablaPersonalDS = value;
  }
  @ViewChild("pagPersonalDetalleDepositoTabla", { static: true })
  private _pagTablaPersonal: MatPaginator;
  //#endregion

  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private servicio: ControlpaService,
    private spi: NgxSpinnerService
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_modal_controlpa_detalle_deposito");
    this._tablaPersonalServicio();
    await this._cargarInformacionDepositoServicio();
    this.spi.hide("spi_modal_controlpa_detalle_deposito");
  }

  //#region INFORMACION DEPOSITO
  private async _cargarInformacionDepositoServicio() {
    const params = [];
    params.push("0¡DP.nIdDP!" + this.nIdDP);
    const data: InfoDeposito = await this.servicio._loadSP(11, params);

    this.infoDeposito.patchValue({
      sNombresUser: data.sNombresUser,
      sRegDeposito: moment(data.dtRegDeposito).format("DD/MM/YYYY, h:mm:ss a"),
      sDescPlla: data.sDescPlla,
      sDevengue: this.meses[data.nMes] + " del " + data.nEjercicio,
      sTipo: data.bTipo ? "Renovacion" : "Nuevo",
      sEstadoDeposito: data.sEstadoDeposito,
    });

    //this.urlDocumento = data.sFileSustento;
    this.urlDocumento = "";

    // Realizado
    if (data.nIdEstadoDeposito === 2358) {
      this.estadoFb = 0;
      this.animacionFb = "active";
      this.opcionesFb = this.imprimirFb;
    }

    // Pendiente
    if (data.nIdEstadoDeposito === 2357) {
      this.estadoFb = 1;
      this.animacionFb = "active";
      this.opcionesFb = this.cancelarFb;
    }

    //Cancelado -2359
    if (data.nIdEstadoDeposito === 2359) {
      this.estadoFb = 2;
      this.animacionFb = "inactive";
      this.opcionesFb = [];
      this.deshabilitarFb = true;
    }

    this.nIdHDP = data.nIdHistDeposito;
  }
  //#endregion

  //#region FB

  public clickGrupoFb() {
    if (this.estadoFb === 0) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.imprimirFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === 1) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.cancelarFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === 2) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = [];
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }
  }

  public clickOpcionFb(indice: number) {
    if (this.estadoFb === 0) {
      this._imprimirDeposito();
      return;
    }
    if (this.estadoFb === 1) {
      this._cancelarDeposito();
      return;
    }
  }
  //#endregion

  //#region TABLA DEL PERSONAL
  private _tablaPersonalServicio() {
    this.tablaPersonalDS = new MatTableDataSource(this.personal);
    this.tablaPersonalDS.paginator = this._pagTablaPersonal;
  }

  public clickExpandedPersona(item: IPersonalDetalleDeposito) {
    this.expandedMore = this.expandedMore === item ? null : item;

    if (this.expandedMore !== null) {
      //await this._subTablaServicio(item);
    }
  }
  //#endregion

  //#region MODAL
  public cerrarModal() {
    const oReturn = new Object();
    oReturn["recargar"] = this.recargarAlCerrar;
    this.activeModal.close(oReturn);
  }
  //#endregion

  //#region  DEPOSITO
  private _imprimirDeposito() {
    printJS({
      printable: this.urlDocumento,
      type: "pdf",
      showModal: true,
      modalMessage: "Recuperando documento",
      onLoadingEnd: () => {
        //this.spi.hide("spi_main");
      },
    });
  }
  private async _cancelarDeposito() {
    if (
      await this._swalConfirm(
        "¿ Estas seguro de cancelar ?",
        "El deposito sera cancelado y permanecerá de manera histórica.",
        "Confirmar"
      )
    ) {
      this.spi.show("spi_modal_controlpa_detalle_deposito");
      const params = [];
      params.push("T1¡nIdHistDeposito!" + this.nIdHDP);
      params.push("T1¡nIdEstado!" + 2359);
      await this.servicio._crudCPA(3, params);
      this.estadoFb = 0;
      this.animacionFb = "inactive";
      this.opcionesFb = [];
      this.recargarAlCerrar = true;
      this.spi.hide("spi_modal_controlpa_detalle_deposito");
      this._swalSucces("Cancelado", "El deposito fue cancelado");
      this.cerrarModal();
    }
  }
  //#endregion

  //#region GENERAL

  private _swalSucces(title: string, msg: string) {
    Swal.fire({
      title: title,
      text: msg,
      icon: "success",
      confirmButtonText: "Esta bien",
    });
  }

  private async _swalConfirm(
    title: string,
    msg: string,
    confirmText: string
  ): Promise<boolean> {
    const resp = await Swal.fire({
      title: title,
      text: msg,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4081",
      confirmButtonText: confirmText,
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
    });

    return resp.isConfirmed;
  }
  //#endregion
}
