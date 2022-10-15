import { Component, Inject, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DeviceDetectorService } from "ngx-device-detector";
import { NgxSpinnerService } from "ngx-spinner";
import { comercialAnimations } from "src/app/modulos/comercial/Animations/comercial.animations";
import { IInfoAsistenciaTiendaRuta } from "src/app/modulos/comercial/requerimiento/model/Igestionap";
import Swal from "sweetalert2";
import { GestionapService } from "../../gestionap.service";

@Component({
  selector: "app-gestionap-detail",
  templateUrl: "./gestionap-detail.component.html",
  styleUrls: [
    "./gestionap-detail.component.css",
    "./gestionap-detail.component.scss",
  ],
  animations: [comercialAnimations],
})
export class GestionapDetailComponent implements OnInit {
  //#region INPUT
  @Input() nIdRuta: number;
  @Input() nIdTienda: number;
  @Input() sDireccion: string = "";
  //#endregion

  //#region GENERAL
  url: string;
  recargarAlCerrarModal: boolean = false;
  nombreDelEstado: string = "";
  modoEscritorio: boolean = this.deviceService.isDesktop();
  //#endregion

  //#region FB
  public animacionFb: string = "active";
  public estadoFb = 0;
  public opcionesAprobarDesestimarFb: any[] = [
    { icon: "published_with_changes", tool: "Aceptar cambio", disabled: false },
    { icon: "close", tool: "Cancelar", disabled: false },
  ];

  public opcionesCancelarFb: any[] = [
    {
      icon: "close",
      tool: "Cancelar",
      disabled: false,
    },
  ];

  public opcionesFb: any[] = [];
  //#endregion

  //#region PUNTOS DE UBICACION
  markerOption = {
    origin: {
      icon: "https://www.cucorent.com.mx/img/cms/GPS.png",
      draggable: true,
    },
    destination: {
      icon: "clear",
      label: "MARKER LABEL",
      opacity: 0.8,
    },
  };
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
  //#endregion

  //#region IMAGEN DE SUSTENTO
  srcImage: any = "../../../../../assets/img/noImage.png";
  //#endregion

  //#region INFORMACION DE LA TIENDA Y RUTA
  infoTiendaRuta: IInfoAsistenciaTiendaRuta = {
    nIdTienda: 0,
    nTiendaLatitud: 0,
    nTiendaLongitud: 0,
    nIdRuta: 0,
    nRutaLatitud: 0,
    nRutaLongitud: 0,
    sFileSustento: "../../../../../assets/img/noImage.png",
    nIdEstado: 0,
  };
  //#endregion

  constructor(
    @Inject("BASE_URL") baseUrl: string,
    private formBuilder: FormBuilder,
    private spi: NgxSpinnerService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private _snackBar: MatSnackBar,
    public service: GestionapService,
    private deviceService: DeviceDetectorService
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("gestionap_detail_modal");
    await this.dataServicio();
    await this.infoTiendaRutaServicio();
    this.spi.hide("gestionap_detail_modal");
  }

  //#region GENERAL
  private async dataServicio() {}

  public capitalizeFirstLetter(data: string) {
    return data.charAt(0).toUpperCase() + data.slice(1);
  }
  //#endregion

  //#region FB
  public clickGrupoFb() {
    if (this.estadoFb === 0) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.opcionesAprobarDesestimarFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === 1) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.opcionesCancelarFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }
  }

  public async clickOpcionFb(indice: number) {
    if (this.estadoFb === 0) {
      if (indice === 0) {
        this.aprobar();
        return;
      }

      if (indice === 1) {
        this.cerrarModal();
        return;
      }

      return;
    }

    if (this.estadoFb === 1) {
      if (indice === 0) {
        this.cerrarModal();
        return;
      }
      return;
    }
  }

  private async aprobar() {
    if (
      !(await this.swalConfirm(
        "¿Seguro que deseas aprobar la asistencia?",
        "Una vez aprobado, ya no podra deshacer esta accion",
        "Aprobar"
      ))
    ) {
      return;
    }

    const params = [];
    params.push("T1¡nIdRuta!" + this.nIdRuta);
    params.push("T1¡nIdEstado!2328");

    await this.service._crudGA(1, params, this.url);

    this.recargarAlCerrarModal = true;
    Swal.fire(
      "Aprobado",
      "Se aprobó correctamente el punto de asistencia.",
      "success"
    );

    this.opcionesFb = this.opcionesCancelarFb;
    this.estadoFb = 1;
    this.nombreDelEstado = "Aprobado";
  }

  private async rechazar() {}
  //#endregion

  //#region INFORMACION DE LA TIENDA Y RUTA
  public async infoTiendaRutaServicio() {
    const imageUrl = this.infoTiendaRuta.sFileSustento;
    const params = [];

    var sParam1 = "0¡RUTA.nIdRuta!" + this.nIdRuta;
    var sParam2 = "0¡TIENDA.nIdTienda!" + this.nIdTienda;
    params.push(sParam1 + "-" + sParam2);
    this.infoTiendaRuta = await this.service._loadSP(9, params, this.url);

    if (this.infoTiendaRuta.sFileSustento === null) {
      this.infoTiendaRuta.sFileSustento = imageUrl;
    }
    this.oDirection.lat = this.infoTiendaRuta.nTiendaLatitud;
    this.oDirection.lng = this.infoTiendaRuta.nTiendaLongitud;
    this.dDirection.lat = this.infoTiendaRuta.nRutaLatitud;
    this.dDirection.lng = this.infoTiendaRuta.nRutaLongitud;

    if (this.infoTiendaRuta.nIdEstado === 2328) {
      this.opcionesFb = this.opcionesCancelarFb;
      this.estadoFb = 1;
      this.nombreDelEstado = "Aprobado";
    } else {
      this.opcionesFb = this.opcionesAprobarDesestimarFb;
      this.estadoFb = 0;
      this.nombreDelEstado = "Pendiente";
    }
  }
  //#endregion

  //#region PUNTOS DE UBICACION
  public renderOptions = {
    suppressMarkers: true,
  };
  //#endregion

  //#region IMAGEN DE SUSTENTO
  //#endregion

  //#region MODAL
  public cerrarModal() {
    const oReturn = new Object();
    oReturn["recargar"] = this.recargarAlCerrarModal;
    this.activeModal.close(oReturn);
  }
  //#endregion

  //#region ALERTS
  private async swalConfirm(
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
