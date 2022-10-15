import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatAccordion } from "@angular/material/expansion";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import Swal from "sweetalert2";

import { IDetail, IMain } from "../../../../Model/Icuentasb";
import { CuentasbService } from "../../../../Services/cuentasb.service";
import { adminpAnimations } from "../../../../Animations/adminp.animations";
import { CuentasbCuentaComponent } from "../cuentasb-cuenta/cuentasb-cuenta.component";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-cuentasb-detail",
  templateUrl: "./cuentasb-detail.component.html",
  styleUrls: [
    "./cuentasb-detail.component.css",
    "./cuentasb-detail.component.scss",
  ],
  animations: [adminpAnimations],
})
export class CuentasbDetailComponent implements OnInit {
  @Input() data: IMain;

  //#region GENERAL
  url: string;
  pbDetail: boolean;
  recargarCerrarModal = false;
  //#endregion

  //#region BOTON CON OPCIONES
  fbDetail = [{ icon: "add", tool: "Nueva cuenta" }];
  abDetail = [];
  tsDetail = "inactive";
  //#endregion

  //#region INFORMACION PERSONAL
  fgDetail: FormGroup = this.fb.group({
    nIdPersonal: 0,
    nIdPerLab: 0,
    sNombres: [{ value: "", disabled: true }],
    sCodPlla: [{ value: "", disabled: true }],
    nIdTipoDoc: 0,
    sTipo: [{ value: "", disabled: true }],
    sDocumento: [{ value: "", disabled: true }],
    dFechIni: [{ value: null, disabled: true }],
    dFechFin: [{ value: null, disabled: true }],
    sCiudad: [{ value: "", disabled: true }],
  });

  get getDetail() {
    return this.fgDetail.controls;
  }
  //#endregion

  //#region  TIPO DE CUENTAS
  hTipoCta = "";
  cboTipoCta: any;

  fgFilter: FormGroup = this.fb.group({
    sTipoCta: "",
  });
  @ViewChild("maDetail") maDetail: MatAccordion;

  get getFilter() {
    return this.fgFilter.controls;
  }
  //#endregion

  //#region HISTORIAL DE CUENTAS
  DetailDC: string[] = [
    "action",
    "sBanco",
    "sNroCuenta",
    "dFechIni",
    "sTipoCta",
  ];

  DetailDS: MatTableDataSource<IDetail>;

  @ViewChild("pagDetail", { static: true }) pagDetail: MatPaginator;
  //#endregion

  //#region MODAL
  ngbModalOptions: NgbModalOptions = {
    size: "md",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };
  //#endregion

  constructor(
    public spi: NgxSpinnerService,
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public service: CuentasbService,
    @Inject("BASE_URL") baseUrl: string
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_cuentasb_detail");
    await this.loadDetail(this.data);
    await this.fnGetTipoCta();
    await this.loadCuentas(this.data.nIdPerLab);
    this.spi.hide("spi_cuentasb_detail");
  }

  //#region BOTON CON OPCIONES
  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 3:
        stat = stat === -1 ? (this.abDetail.length > 0 ? 0 : 1) : stat;
        this.tsDetail = stat === 0 ? "inactive" : "active";
        this.abDetail = stat === 0 ? [] : this.fbDetail;
        break;

      default:
        break;
    }
  }

  async clickFab(opc: number, index: number) {
    switch (opc) {
      case 3:
        if (await this.validarSiTieneUnaCuentaEnEspera()) {
          Swal.fire({
            title: "Atencion!",
            text: "Ya tiene una cuenta en espera, modifiquela si quiere cambiar de cuenta.",
            icon: "info",
          });
          return;
        }

        const modalRefCuenta = this.modalService.open(
          CuentasbCuentaComponent,
          this.ngbModalOptions
        );

        // Abre el modal para agregar una nueva cuenta
        modalRefCuenta.componentInstance.fgDetail = this.fgDetail;
        modalRefCuenta.componentInstance.DetailDS = this.DetailDS.data;
        modalRefCuenta.componentInstance.DataPerson = this.data;

        modalRefCuenta.result.then(
          async (result) => {
            if (result.recargar) {
              this.recargarCerrarModal = true;
              this.fgFilter.controls.sTipoCta.setValue(result.tipo);
              this.spi.show("spi_cuentasb_detail");
              await this.loadCuentas(this.data.nIdPerLab);
              this.spi.hide("spi_cuentasb_detail");
            }
          },
          (reason) => {}
        );
        break;
    }
  }

  async validarSiTieneUnaCuentaEnEspera(): Promise<boolean> {
    // Obteniendo el ultimo devengue
    const paramDevengue = [];
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    paramDevengue.push("0¡nIdEmp!" + nIdEmp);
    paramDevengue.push("2¡nIdEstado!2");

    const ultimoRevengueActivo: any = await this.service._loadSP(
      8,
      paramDevengue,
      this.url
    );
    var fechaDevengue = new Date(
      ultimoRevengueActivo.nEjercicio,
      ultimoRevengueActivo.nMes - 1,
      1
    );

    fechaDevengue = moment(fechaDevengue).endOf("month").toDate();
    const tipoCuenta = this.fgFilter.controls["sTipoCta"].value;

    const data = this.DetailDS.data.filter((x) => {
      if (x.sTipoCta === tipoCuenta && new Date(x.dFechIni) > fechaDevengue) {
        return x;
      }
    });

    if (data.length > 0) {
      return true;
    }

    return false;
  }

  //#endregion

  //#region INFORMACION PERSONAL
  async loadDetail(pushParam: IMain) {
    const nIdPerLab = pushParam.nIdPerLab;
    this.fgDetail.patchValue({
      nIdPersonal: pushParam.nIdPersonal,
      nIdPerLab: nIdPerLab,
      sNombres: pushParam.sNombres,
      nIdTipoDoc: pushParam.nIdTipoDoc,
      sTipo: pushParam.sDscTipo,
      sDocumento: pushParam.sDocumento,
      sCiudad: pushParam.sCiudad,
      dFechIni: pushParam.dFechIni,
      dFechFin: pushParam.dFechFin,
      sCodPlla: pushParam.sCodPlla,
    });

    if (this.data.sTipoCta !== undefined) {
      this.fgFilter.controls["sTipoCta"].setValue(this.data.sTipoCta);
    }
  }

  //#endregion

  //#region TIPO DE CUENTAS
  async fnGetTipoCta() {
    const param = [];
    param.push("0¡nDadTipEle!425");
    const sIdPais = JSON.parse(localStorage.getItem("Pais"));
    param.push("0¡nIdPais!" + sIdPais);
    param.push("0¡bEstado!1");

    this.cboTipoCta = await this.service._loadSP(2, param, this.url);

    const primerTipo = this.cboTipoCta[0].sDesc;
    this.fgFilter.controls["sTipoCta"].setValue(primerTipo);

    this.delay(250).then((any) => {
      this.tsDetail = "active";
      this.abDetail = this.fbDetail;
    });
  }
  //#endregion

  //#region HISTORIAL DE CUENTAS
  async loadCuentas(nIdPerLab: number) {
    const param = [];
    param.push("0¡nIdPerLab!" + nIdPerLab);
    const data: IDetail[] = await this.service._loadSP(5, param, this.url);

    this.DetailDS = new MatTableDataSource(data);
    this.DetailDS.paginator = this.pagDetail;
    this.filtrar();
  }

  filtrar() {
    this.DetailDS.filterPredicate = ((data: IDetail, filter: any) => {
      // tslint:disable-next-line: max-line-length
      const a =
        !filter.sTipoCta ||
        data.sTipoCta.toLowerCase().includes(filter.sTipoCta.toLowerCase());
      return a;
    }) as (PeriodicElement, string) => boolean;

    this.DetailDS.filter = this.fgFilter.value;

    if (this.DetailDS.paginator) {
      this.DetailDS.paginator.firstPage();
    }
  }

  showModal(data: any) {
    const modalRefCuenta = this.modalService.open(
      CuentasbCuentaComponent,
      this.ngbModalOptions
    );

    // Abrir modalpara editar
    modalRefCuenta.componentInstance.data = data;
    modalRefCuenta.componentInstance.fgDetail = this.fgDetail;
    modalRefCuenta.componentInstance.DetailDS = this.DetailDS.data;

    modalRefCuenta.result.then(
      async (result) => {
        if (result.recargar) {
          this.recargarCerrarModal = true;
          this.fgFilter.controls.sTipoCta.setValue(result.tipo);
          this.spi.show("spi_cuentasb_detail");
          await this.loadCuentas(this.data.nIdPerLab);
          this.spi.hide("spi_cuentasb_detail");
        }
      },
      (reason) => {}
    );
  }
  //#endregion

  //#region GENERALES

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  closeModal() {
    const oReturn = new Object();

    oReturn["recargar"] = this.recargarCerrarModal;
    this.activeModal.close(oReturn);
  }
  //#endregion
}
