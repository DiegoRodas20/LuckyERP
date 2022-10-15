import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { NgxSpinnerService } from "ngx-spinner";
import { AsistenciapService } from "./asistenciap.service";
import {
  IDatoAsistencia,
  IJustificacionCombo,
  ListaPuntosU,
} from "./interface";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as moment from "moment";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import {
  AppDateAdapter,
  APP_DATE_FORMATS,
} from "../../../../shared/services/AppDateAdapter";
import { asistenciapAnimations } from "./asistenciap.animations";
import { DeviceDetectorService } from "ngx-device-detector";

import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { AsistenciapPlanningComponent } from "./Modals/asistenciap-planning/asistenciap-planning.component";
import { AsistenciapSustentoComponent } from "./Modals/asistenciap-sustento/asistenciap-sustento.component";
import Swal from "sweetalert2";
import { AsistenciapJustificacionComponent } from "./Modals/asistenciap-justificacion/asistenciap-justificacion.component";
import { IJustificacionPuntoAsistencia } from "../../requerimiento/model/Igestionap";

@Component({
  selector: "app-asistenciap",
  templateUrl: "./asistenciap.component.html",
  styleUrls: ["./asistenciap.component.css", "./asistenciap.component.scss"],
  providers: [
    AsistenciapService,
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  animations: [asistenciapAnimations],
})
export class AsistenciapComponent implements OnInit {
  //#region GENERALES
  url: string;
  fechaSeleccionada: Date = new Date();
  modoEscritorio: boolean = this.deviceService.isDesktop();
  nIdPersonal = 0;
  sTextoSpinner = '';
  sTemplateSpinner = '';
  //#endregion

  //#region MODAL
  private ngbModalOptions: NgbModalOptions = {
    size: "lg",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };
  //#endregion

  //#region PUNTOS DE ASISTENCIA
  listaDC: string[] = [
    "action",
    "sDireccion",
    "sDepartamento",
    "sProvincia",
    "sDistrito",
    "more",
  ];
  listaDS: MatTableDataSource<ListaPuntosU> =
    new MatTableDataSource<ListaPuntosU>([]);
  @ViewChild("listaP", { static: true }) listaP: MatPaginator;
  expandedMap: null;
  //#endregion

  //#region FB
  opcionesCambiarPlanning = [
    { icon: "today", tool: "Cambiar planning", dis: false },
    { icon: "subject", tool: "Justificacion", dis: false },
  ];
  abMain = [];
  tsMain = "inactive";
  ifMain = true;
  //#endregion

  //#region INFORMACION DEL PERSONAL
  fgInfoPerso: FormGroup = this.fb.group({
    nIdPersonal: 0,
    sTipoDoc: [{ value: "", disabled: true }],
    sDocumento: [{ value: "", disabled: true }],
    sNombres: [{ value: "", disabled: true }],
  });
  //#endregion

  //#region INFORMACION DE LA ASISTENCIA
  fgDatoAsist: FormGroup = this.fb.group({
    nIdPlanning: 0,
    dFecha: [{ value: new Date(), disabled: true }],
    sHoraIni: [{ value: "", disabled: true }],
    sHoraFin: [{ value: "", disabled: true }],
    sResponsable: [{ value: "", disabled: true }],
    sCliente: [{ value: "", disabled: true }],
  });
  //#endregion

  //#region MAPA
  zoom = 18;
  optionsMap: google.maps.MapOptions = {
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    streetViewControl: false,
    mapTypeControl: false,
  };

  showDirection = false;
  oDirection = { lat: 0, lng: 0 };
  dDirection = { lat: 0, lng: 0 };
  waypoints = [];
  //#endregion

  //#region JUSTIFICACION
  justificacionCombo: IJustificacionCombo[] = [];
  //#endregion

  constructor(
    @Inject("BASE_URL") baseUrl: string,
    private fb: FormBuilder,
    private spi: NgxSpinnerService,
    public service: AsistenciapService,
    private _snackBar: MatSnackBar,
    private deviceService: DeviceDetectorService,
    private modalService: NgbModal
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {

    moment.locale('es');

    this.spi.show("spi_lista");
    await this._cargaInicial();
    await this.justificacionServicio();
    this.loadRuta();
    this.spi.hide("spi_lista");
  }

  //#region GENERAL
  private async _cargaInicial() {
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    const param = [];
    param.push("0¡nCodUser!" + uid);
    const data: any[] = await this.service._loadSP(1, param, this.url);

    if (data.length > 0) {
      this.nIdPersonal = data[0].nIdPersonal;
      this._reemplazarInformacionPersonal(data[0]);
      this.fechaSeleccionada = new Date();
      const dFecha = moment(this.fechaSeleccionada).format("MM/DD/YYYY");
      await this.getListaPuntosU(this.nIdPersonal, dFecha);
    } else {
      this._snackBar.open(
        "Usuario no cuenta con relación de personal.",
        "Cerar",
        {
          duration: 2000,
          horizontalPosition: "right",
          verticalPosition: "top",
        }
      );
    }
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }
  //#endregion

  //#region INFORMACION DEL PERSONAL
  private _reemplazarInformacionPersonal(data: any) {
    this.fgInfoPerso.patchValue({
      nIdPersonal: data.nIdPersonal,
      sTipoDoc: data.sTipoDoc,
      sDocumento: data.sDocumento,
      sNombres: data.sNombres,
    });
  }

  public obtenerValorInfoPersonal(nombreCampo: string): any {
    return this.fgInfoPerso.controls[nombreCampo].value;
  }
  //#endregion

  //#region DATOS DE ASISTENCIA
  private _reemplazarDatosDeAsistencia(data: IDatoAsistencia) {
    this.fgDatoAsist.patchValue({
      nIdPlanning: data.nIdPlanning,
      dFecha: data.dFecha,
      sHoraIni: data.sHoraIni,
      sHoraFin: data.sHoraFin,
      sResponsable: data.sResponsable,
      sCliente: data.sCliente,
    });
  }

  public obtenerValorDatosAsistencia(nombreCampo: string): any {
    return this.fgDatoAsist.controls[nombreCampo].value;
  }
  //#endregion

  //#region FB
  onToggleFab() {
    if (this.tsMain === "inactive") {
      this.tsMain = "active";
      this.abMain = this.opcionesCambiarPlanning;
    } else {
      this.tsMain = "inactive";
      this.abMain = [];
    }
  }

  async clickFab(indice: number) {
    if (indice === 0) {
      this.seleccionarDiaAsistencia();
      return;
    }

    if (indice === 1) {
      this.crearJustificacionParaLosPuntos();
    }
  }

  public seleccionarDiaAsistencia() {

    const fechaForm = this.fgDatoAsist.controls["dFecha"].value;
    const dFecha = fechaForm === null ? new Date() : fechaForm;

    this.ngbModalOptions.size = "lg";
    const modal = this.modalService.open(
      AsistenciapPlanningComponent,
      this.ngbModalOptions
    );

    modal.componentInstance.dFecha = dFecha;

    modal.result.then(async (result) => {
      if (result.recargar) {
        this.spi.show("spi_lista");
        const dFecha = result.dFecha;
        this.fechaSeleccionada = moment(dFecha, "MM/DD/YYYY").toDate();
        await this.getListaPuntosU(this.nIdPersonal, dFecha);
        this.spi.hide("spi_lista");

        this.loadRuta();
      }
    });
  }
  //#endregion

  //#region JUSTIFICACION
  private async crearJustificacionParaLosPuntos() {
    this.spi.show("spi_lista");
    const res: boolean = await this.comprarContienePuntosFaltantes();
    this.spi.hide("spi_lista");

    if (res) {
      this.abrirAlertJustificacion();
    } else {
      this._snackBar.open("No tienes puntos por justificar.", "Cerar", {
        duration: 2000,
        horizontalPosition: "right",
        verticalPosition: "top",
      });
    }
  }

  private async comprarContienePuntosFaltantes(): Promise<boolean> {
    const sFecha = moment(this.fgDatoAsist.controls["dFecha"].value).format(
      "MM/DD/YYYY"
    );
    const params = [];
    params.push("0¡DPP.nIdPersonal!" + this.nIdPersonal);
    params.push("6¡ASISTENCIA.dFecha!" + sFecha);

    const data: IJustificacionPuntoAsistencia[] = await this.service._loadSP(
      4,
      params,
      this.url
    );

    return data.length > 0;
  }

  private async justificacionServicio() {
    const params = [];
    params.push("0¡nDadTipEle!1399");
    params.push("2¡nParam!1");
    this.justificacionCombo = await this.service._loadSP(5, params, this.url);
  }

  private abrirAlertJustificacion() {
    Swal.fire({
      title: "Justificacion",
      icon: "info",
      text: "Seleccione el tipo de justificacion.",
      input: "select",
      inputOptions: this.generandoInputSwalConComboJustificacion(),
      inputPlaceholder: "Seleccionar",
      showCancelButton: true,
      confirmButtonText: "Seleccionar",
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value === undefined || value === "") {
          return "Selección no válida.";
        }
      },
    }).then(async (resultado) => {
      if (resultado.isConfirmed) {
        const justificacion: IJustificacionCombo = this.justificacionCombo.find(
          (v) => v.nIdJustificacion === +resultado.value
        );
        this.abrirModalGenerarJustificacion(justificacion);
      }
    });
  }

  private generandoInputSwalConComboJustificacion(): any {
    const map = {};
    this.justificacionCombo.forEach((item) => {
      map[item.nIdJustificacion] = item.sJustificacion;
    });
    return map;
  }

  private abrirModalGenerarJustificacion(justificacion: IJustificacionCombo) {
    this.ngbModalOptions.size = "md";
    const modal = this.modalService.open(
      AsistenciapJustificacionComponent,
      this.ngbModalOptions
    );

    modal.componentInstance.nIdPersonal = this.nIdPersonal;
    modal.componentInstance.justificacion = justificacion;
    modal.componentInstance.sFecha = moment(
      this.fgDatoAsist.controls["dFecha"].value
    ).format("MM/DD/YYYY");

    modal.result.then(async (result) => {
      if (result.recargar) {
        this.spi.show("spi_lista");
        const dFecha = moment(
          this.obtenerValorDatosAsistencia("dFecha")
        ).format("MM/DD/YYYY");
        await this.getListaPuntosU(this.nIdPersonal, dFecha);
        this.loadRuta();
        this.spi.hide("spi_lista");
      }
    });
  }
  //#endregion

  //#region MAPA
  showMap(pushParam: any) {
    const position = {
      lat: pushParam.nLatitud,
      lng: pushParam.nLongitud,
    };
    return position;
  }

  public loadRuta() {
    const data = this.listaDS.data;
    const dataLength = data.length;

    if (dataLength > 0) {

      this.waypoints = [];

      switch (dataLength) {
        case 1:
          this.oDirection.lat = data[0].nLatitud;
          this.oDirection.lng = data[0].nLongitud;

          this.dDirection.lat = data[0].nLatitud;
          this.dDirection.lng = data[0].nLongitud;
          break;

        case 2:
          this.oDirection.lat = data[0].nLatitud;
          this.oDirection.lng = data[0].nLongitud;

          this.dDirection.lat = data[1].nLatitud;
          this.dDirection.lng = data[1].nLongitud;
          break;

        default:

          data.forEach((value, index) => {
            switch (index) {
              case 0:
                this.oDirection.lat = value.nLatitud;
                this.oDirection.lng = value.nLongitud;
                break;

              case (dataLength - 1):
                this.dDirection.lat = value.nLatitud;
                this.dDirection.lng = value.nLongitud;
                break;

              default:
                this.waypoints.push({
                  location: { lat: value.nLatitud, lng: value.nLongitud },
                });
                break;
            }
          });

          break;

      }

    }
    this.showDirection = dataLength > 0;
  }

  async getListaPuntosU(nIdPersonal: number, dFecha: string) {
    const params = [];
    params.push(
      "0¡DPP.nIdPersonal!" +
        nIdPersonal +
        "|6¡ASIS.dFecha!" +
        dFecha +
        "-0¡DPP.nIdPersonal!" +
        nIdPersonal +
        "|6¡ASIS.dFecha!" +
        dFecha
    );
    const data: any = await this.service._loadSP(2, params, this.url);

    const sDia = moment(this.fechaSeleccionada).format('LL');
    let bSpinner = false;

    if (data.lPlanning.nIdPlanning === 0 ) {
      this.sTextoSpinner = 'Día sin planiamiento : ' + sDia;
      this.sTemplateSpinner = '<img src="https://media.giphy.com/media/ISOckXUybVfQ4/giphy.gif"/>';
      bSpinner = true;
    } else {
      if (data.lPuntosU.length === 0) {
        this.sTextoSpinner = 'Día de descanso : ' + sDia;
        this.sTemplateSpinner = '<img src="https://media.giphy.com/media/mguPrVJAnEHIY/giphy.gif"/>';
        bSpinner = true;
      }
    }

    // Validamos la justificación
    // tslint:disable-next-line: max-line-length
    this.opcionesCambiarPlanning[1].dis = !(moment(new Date()).format('DD/MM/YYYY') === moment(this.fechaSeleccionada).format('DD/MM/YYYY'));

    if ( bSpinner === true) {
      this.spi.show('spi_');
    } else {
      this.spi.hide('spi_');
    }

    this._reemplazarDatosDeAsistencia(data.lPlanning);
    this.listaDS = new MatTableDataSource(data.lPuntosU);
    this.listaDS.paginator = this.listaP;

    this.fgDatoAsist.controls["dFecha"].setValue(this.fechaSeleccionada);
  }

  public validacionBotonAgregarSustento(item: ListaPuntosU) {
    return (
      moment(new Date()).format("DD/MM/YYYY") ===
      moment(item.dFechaAsistencia).format("DD/MM/YYYY")
    );
  }

  //#endregion

  //#region IMAGEN DE SUSTENTO
  viewImage(data: ListaPuntosU) {
    this.ngbModalOptions.size = "xl";
    const modal = this.modalService.open(
      AsistenciapSustentoComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.estadoInicial = data.nIdJustificacion === 0 ? 2 : 3;
    modal.componentInstance.nIdRuta = data.nIdRuta;
    modal.componentInstance.dFechaAsistencia = data.dFechaAsistencia;
    modal.componentInstance.nIdAsistencia = data.nIdAsistencia;
    modal.componentInstance.nIdJustificacion = data.nIdJustificacion;
    modal.componentInstance.nIdGestion = data.nIdGestion;
    modal.componentInstance.nIdPersonal = this.nIdPersonal;
    modal.componentInstance.listaRutas = this.listaDS.data;

    modal.result.then(async (result) => {
      if (result.recargar) {
        this.spi.show("spi_lista");
        const dFecha = moment(this.fgDatoAsist.controls["dFecha"].value).format(
          "MM/DD/YYYY"
        );
        await this.getListaPuntosU(this.nIdPersonal, dFecha);
        this.loadRuta();
        this.spi.hide("spi_lista");
      }
    });
  }
  //#endregion

  //#region PUNTOS DE ASISTENCIA
  public mostrarBotonSustentar(item: ListaPuntosU): boolean {
    return item.nIdEstado === 2390 && item.nIdJustificacion === 0;
  }

  public mostrarBotonVisualizar(item: ListaPuntosU): boolean {
    return item.nIdEstado !== 2390 || item.nIdJustificacion !== 0;
  }

  public abrirSustentoDeAsistencia(data: ListaPuntosU) {
    this.ngbModalOptions.size = "xl";

    const modal = this.modalService.open(
      AsistenciapSustentoComponent,
      this.ngbModalOptions
    );

    modal.componentInstance.estadoInicial = 1;
    modal.componentInstance.nIdRuta = data.nIdRuta;
    modal.componentInstance.dFechaAsistencia = data.dFechaAsistencia;
    modal.componentInstance.nIdAsistencia = data.nIdAsistencia;
    modal.componentInstance.nIdJustificacion = data.nIdJustificacion;
    modal.componentInstance.nIdGestion = data.nIdGestion;
    modal.componentInstance.nIdPersonal = this.nIdPersonal;

    modal.result.then(async (result) => {
      if (result.recargar) {
        const dFecha = moment(this.fgDatoAsist.controls["dFecha"].value).format(
          "MM/DD/YYYY"
        );

        this.spi.show("spi_lista");
        await this.getListaPuntosU(this.nIdPersonal, dFecha);
        this.spi.hide("spi_lista");
        this.loadRuta();
      }
    });
  }

  capitalizeFirstLetter(data: string) {
    return data.charAt(0).toUpperCase() + data.slice(1);
  }
  //#endregion
}
