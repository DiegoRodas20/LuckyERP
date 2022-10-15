import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";

import { adminpAnimations } from "../../../../Animations/adminp.animations";
import {
  IDepositoDetallePersonal,
  IImporteDetallePersonal,
  IInformacionDetallePersonal,
} from "../../../../Model/Icontrolpa";
import { ControlpaService } from "../../../../Services/controlpa.service";
import { ControlpaDetailComponent } from "../controlpa-detail/controlpa-detail.component";

@Component({
  selector: "app-controlpa-detailp",
  templateUrl: "./controlpa-detailp.component.html",
  styleUrls: [
    "./controlpa-detailp.component.css",
    "./controlpa-detailp.component.scss",
  ],
  animations: [adminpAnimations],
})
export class ControlpaDetailpComponent implements OnInit {
  @Input() nIdPersonal: number = 0;
  @Input() nIdDp: number = 0;

  //#region GENERAL
  urlDocumento = null;
  //#endregion

  //#region MODAL
  private _ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };
  public get ngbModalOptions(): NgbModalOptions {
    return this._ngbModalOptions;
  }
  public set ngbModalOptions(value: NgbModalOptions) {
    this._ngbModalOptions = value;
  }
  //#endregion

  //#region INFORMACION DE PERSONAL
  formInfoPeronal: FormGroup = this.formBuilder.group({
    sNombres: [{ value: "", disabled: true }],
    sCodPlla: [{ value: "", disabled: true }],
    sTipo: [{ value: "", disabled: true }],
    sDocumento: [{ value: "", disabled: true }],
    dFechIni: [{ value: null, disabled: true }],
    dFechFin: [{ value: null, disabled: true }],
    sCiudad: [{ value: "", disabled: true }],
    nIdPerlab: 0,
  });
  //#endregion

  //#region TABLA DE SUSTENTO DE DEPOSITO

  depositoSeleccionado: IDepositoDetallePersonal = {
    nIdDDP: 0,
    nIdHistDeposito: 0,
    sFileSustento: null,
    nIdDP: -1,
    nIdDevengue: 0,
    nEjercicio: 0,
    nMes: 0,
    nIdEstadoDeposito: 0,
    sEstadoDeposito: "",
    bTipo: true,
    dtRegDeposito: new Date(),
    nIdPlla: 0,
    sCodPlla: "0",
    sDescPlla: "",
    nImporte: 0,
  };
  expandedMore: IDepositoDetallePersonal | null;
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

  private _tablaSustentoDepositoDC = [
    "action",
    "devengue",
    "tipo",
    "fecha",
    "estado",
    "importe",
  ];
  private _tablaSustentoDepositoDS: MatTableDataSource<IDepositoDetallePersonal> = new MatTableDataSource<IDepositoDetallePersonal>(
    []
  );

  @ViewChild("pagSustentoDepositoTabla", { static: false })
  private _pagsustentoDepositoTabla: MatPaginator;

  public get tablaSustentoDepositoDS(): MatTableDataSource<IDepositoDetallePersonal> {
    return this._tablaSustentoDepositoDS;
  }
  public set tablaSustentoDepositoDS(
    value: MatTableDataSource<IDepositoDetallePersonal>
  ) {
    this._tablaSustentoDepositoDS = value;
  }

  public get pagsustentoDepositoTabla(): MatPaginator {
    return this._pagsustentoDepositoTabla;
  }
  public set pagsustentoDepositoTabla(value: MatPaginator) {
    this._pagsustentoDepositoTabla = value;
  }

  public get tablaSustentoDepositoDC() {
    return this._tablaSustentoDepositoDC;
  }
  public set tablaSustentoDepositoDC(value) {
    this._tablaSustentoDepositoDC = value;
  }

  //#endregion

  //#region SUSTENTO DE IMPORTE
  private _tablaSustentoImporteDC: string[] = [
    "tipo",
    "responsable",
    "direccionCliente",
    "campaniaArea",
    "importe",
  ];

  private _tablaSustentoImporteDS: MatTableDataSource<IImporteDetallePersonal> = new MatTableDataSource<IImporteDetallePersonal>(
    []
  );

  @ViewChild("pagSustentoImporteTabla", { static: false })
  private _pagSustentoImporteTabla: MatPaginator;

  //#region Getter/Setter
  public get tablaSustentoImporteDC(): string[] {
    return this._tablaSustentoImporteDC;
  }
  public set tablaSustentoImporteDC(value: string[]) {
    this._tablaSustentoImporteDC = value;
  }

  public get tablaSustentoImporteDS(): MatTableDataSource<IImporteDetallePersonal> {
    return this._tablaSustentoImporteDS;
  }
  public set tablaSustentoImporteDS(
    value: MatTableDataSource<IImporteDetallePersonal>
  ) {
    this._tablaSustentoImporteDS = value;
  }

  public get pagSustentoImporteTabla(): MatPaginator {
    return this._pagSustentoImporteTabla;
  }
  public set pagSustentoImporteTabla(value: MatPaginator) {
    this._pagSustentoImporteTabla = value;
  }
  //#endregion

  //#endregion

  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private servicio: ControlpaService,
    private modalService: NgbModal,
    private spi: NgxSpinnerService
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_detalle_personal_controlpa");
    await this._cargarDataInformacionPersonalServicio();
    await this._dataSustentoDepositoServicio();
    this.spi.hide("spi_detalle_personal_controlpa");
  }

  //#region INFORMACION DE PERSONAL
  private async _cargarDataInformacionPersonalServicio() {
    const params = [];
    params.push("0¡PER.nIdPersonal!" + this.nIdPersonal);
    const data: IInformacionDetallePersonal = await this.servicio._loadSP(
      12,
      params
    );

    this.formInfoPeronal.patchValue({
      sNombres: data.sNombres,
      sCodPlla: data.sCodPlla,
      sTipo: data.sDscTipo,
      sDocumento: data.sDocumento,
      dFechIni: data.dFechIni,
      dFechFin: data.dFechFin,
      sCiudad: data.sCiudad,
    });
  }
  //#endregion

  //#region TABLA SUSTENTO DE DEPOSITO
  private async _dataSustentoDepositoServicio() {
    const params = [];
    params.push("0¡DDP.nIdPersonal!" + this.nIdPersonal);
    const data: IDepositoDetallePersonal[] = await this.servicio._loadSP(
      13,
      params
    );
    this.tablaSustentoDepositoDS = new MatTableDataSource(data);
    this.tablaSustentoDepositoDS.paginator = this.pagsustentoDepositoTabla;

    this._busquedaDepositoTabla(this.nIdDp);
  }

  public mostrarDevengueTabla(deposito: IDepositoDetallePersonal): string {
    return moment([deposito.nEjercicio, deposito.nMes, 1]).format("MM/yyyy");
  }

  public clickExpanded(item: IDepositoDetallePersonal) {
    this.expandedMore = this.expandedMore === item ? null : item;

    if (this.expandedMore !== null) {
      //this.subTablaDS = new MatTableDataSource(item.personal);
      //this.subTablaDS.paginator = this.pagSubTabla;
      //this.mtExpanded.renderRows();
      this._dataSustentoImporteServicio(item.nIdDDP);
    }
  }

  private _busquedaDepositoTabla(nIdDp: number) {
    const data: IDepositoDetallePersonal[] = this.tablaSustentoDepositoDS.data;
    if (data.length === 0) return;

    const index = data.findIndex((v) => v.nIdDP == nIdDp);

    if (index === -1) return;

    this.depositoSeleccionado = data[index];

    const pagSize = this.pagsustentoDepositoTabla.pageSize;

    var numBloques = Math.ceil((index + 1) / pagSize);

    for (let i = 1; i < numBloques; i++) {
      this.tablaSustentoDepositoDS.paginator.nextPage();
    }
  }
  //#endregion

  //#region SUSTENTO DE IMPORTE
  private async _dataSustentoImporteServicio(nIdDDP: number) {
    const data: IImporteDetallePersonal[] = [
      {
        sTipo: "Renovacion",
        sNombresResponsable: "Nombre del responsable",
        sDireccionCliente: "Direccion",
        sCampaniaArea: "Campaña  y area",
        nImporte: 20.5,
      },
    ];

    this.tablaSustentoImporteDS = new MatTableDataSource(data);
    this.tablaSustentoDepositoDS.paginator = this.pagsustentoDepositoTabla;
  }
  //#endregion

  //#region MODAL
  public cerrarModal(recargar = false) {
    const oReturn = new Object();
    oReturn["recargar"] = recargar;
    this.activeModal.close(oReturn);
  }

  public abrirModalVerDatalle(item: IDepositoDetallePersonal) {
    const modal = this.modalService.open(
      ControlpaDetailComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.nIdDP = item.nIdDP;
    modal.componentInstance.personal = this.nIdPersonal;
  }
  //#endregion
}
