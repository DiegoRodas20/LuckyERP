import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
} from "@ng-bootstrap/ng-bootstrap";
import { data } from "jquery";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import {
  IDatosAsistencia,
  IInfoAsistencia,
  IInfoPersonal,
  IJustificacionCombo,
  IPuntoAsistencia,
  IPuntosA,
} from "src/app/modulos/comercial/requerimiento/model/Igestionap";
import Swal from "sweetalert2";
import { IGestionCombo } from "../../../asistenciap/interface";
import { gestionapAnimations } from "../../gestionap.animations";
import { GestionapService } from "../../gestionap.service";
import { GestionapDetailComponent } from "../gestionap-detail/gestionap-detail.component";

interface IOpcionFb {
  icon: string;
  tool: string;
  disabled: boolean;
}

enum EstadosPuntoAsistenciaEnum {
  NUEVO = 2390,
  PENDIENTE = 2327,
  APROBADO = 2328,
  DESESTIMADO = 2329,
  CONFIRMADO = 2330,
  INVALIDADO = 2331,
}

enum EstadosFbEnum {
  EDITAR = 1,
  GUARDAR = 2,
}

@Component({
  selector: "app-gestionap-planning",
  templateUrl: "./gestionap-planning.component.html",
  styleUrls: [
    "./gestionap-planning.component.css",
    "./gestionap-planning.component.scss",
  ],
  animations: [gestionapAnimations],
})
export class GestionapPlanningComponent implements OnInit {
  //#region INPUT
  @Input() nIdPersonal: number;
  @Input() dFecha: Date;
  //#endregion

  //#region GENERAL
  url: string;
  stepperEstado = true;
  //#endregion

  //#region FB
  estadosFbEnum = EstadosFbEnum;
  estadoFb = 1;
  animacionFb: string = "active";
  opcionesEditarCancelar: IOpcionFb[] = [
    {
      icon: "edit",
      tool: "Editar",
      disabled: false,
    },
    {
      icon: "close",
      tool: "Cancelar",
      disabled: false,
    },
  ];
  opcionesGuardarCancelar: IOpcionFb[] = [
    {
      icon: "save",
      tool: "Guardar",
      disabled: false,
    },
    {
      icon: "close",
      tool: "Cancelar",
      disabled: false,
    },
  ];
  opcionesFb: IOpcionFb[] = this.opcionesEditarCancelar;

  //#endregion

  //#region MODAL
  recargarDataModal = false;
  private ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };
  //#endregion

  //#region INFORMACION DEL PERSONAL
  infoPersonal: FormGroup = this.formBuilder.group({
    nombres: [{ value: null, disabled: true }],
    tipoDocumento: [{ value: null, disabled: true }],
    nroDocumento: [{ value: null, disabled: true }],
  });
  //#endregion

  //#region DATOS DE ASISTENCIA
  datosAsistencia: FormGroup = this.formBuilder.group({
    fecha: [{ value: null, disabled: true }],
    horaEntrada: [{ value: null, disabled: true }],
    horaSalida: [{ value: null, disabled: true }],
    responsable: [{ value: null, disabled: true }],
    clienteArea: [{ value: null, disabled: true }],
  });
  //#endregion

  //#region PUNTOS DE ASISTENCIA
  tiempoDelayPuntoAsistenciaFb: number = 250;
  puntoAsistenciaSeleccionado: IPuntoAsistencia = {
    nIdRuta: 0,
    nIdTienda: 0,
    sDireccion: "",
    sDepartamento: "",
    sProvincia: "",
    sDistrito: "",
    nIdEstado: 0,
    puntoVisualizado: false,
    modificable: false,
    sFileSustento: "",
    nIdGestion: 0,
    nIdJustificacion: 0,
    sTexto: "",
    sJustificacion: "",
    sGestion: "",
  };

  puntoAsistenciaFb: IOpcionFb[] = [];
  opcionesVisualizarPaFb: IOpcionFb[] = [
    {
      icon: "visibility",
      tool: "Visualizar",
      disabled: false,
    },
  ];
  opcionesVisualizarAprobarDesestimarPaFb: IOpcionFb[] = [
    {
      icon: "visibility",
      tool: "Visualizar",
      disabled: false,
    },
    {
      icon: "thumb_up",
      tool: "Aprobar",
      disabled: false,
    },
    {
      icon: "thumb_down",
      tool: "Desestimar",
      disabled: false,
    },
  ];
  opcionesVisualizarCancelarPaFb: IOpcionFb[] = [
    {
      icon: "visibility",
      tool: "Visualizar",
      disabled: false,
    },
    {
      icon: "close",
      tool: "Cancelar",
      disabled: false,
    },
  ];

  estadosPuntoAsistenciaEnum = EstadosPuntoAsistenciaEnum;
  puntosAsistenciaRespaldo: IPuntoAsistencia[] = [];

  expandedMore: IPuntoAsistencia | null;
  formExpanded: FormGroup = this.formBuilder.group({
    nIdGestion: [{ value: null, disabled: true }],
    gestionToogle: [{ value: false, disabled: true }],
    nIdJustificacion: [{ value: null, disabled: true }],
    justificacionToogle: [{ value: false, disabled: true }],
  });

  puntosaDC: string[] = [
    "action",
    "sDireccion",
    "sDepartamento",
    "sProvincia",
    "sDistrito",
    "gestion",
    "justificacion",
    "more",
  ];

  @ViewChild("tablaPuntosAP", { static: false })
  tablaPuntosAP: MatTable<IPuntoAsistencia>;
  puntosaDS: MatTableDataSource<IPuntoAsistencia> = new MatTableDataSource([]);
  //#endregion

  //#region JUSTIFICACION
  comboJustificacion: IJustificacionCombo[] = [];
  //#endregion

  //#region GESTION
  comboGestion: IGestionCombo[] = [];
  //#endregion

  //#region GENERAL

  //#endregion
  constructor(
    @Inject("BASE_URL") baseUrl: string,
    private formBuilder: FormBuilder,
    private spi: NgxSpinnerService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private _snackBar: MatSnackBar,
    public service: GestionapService
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("gestionap_planning_modal");
    await this.justificacionServicio();
    await this.gestionServicio();
    await this.informacionPersonalServicio();
    await this.datosAsistenciaServicio();
    await this.puntosAsistenciaServicio();
    this.spi.hide("gestionap_planning_modal");
  }

  //#region JUSTIFICACION
  public async justificacionServicio() {
    const params = [];
    params.push("0¡nDadTipEle!1399");
    this.comboJustificacion = await this.service._loadSP(10, params, this.url);
  }
  //#endregion

  //#region GESTION
  public async gestionServicio() {
    const params = [];
    this.comboGestion = await this.service._loadSP(11, params, this.url);
  }
  //#endregion

  //#region FB
  public accionGroupFb() {
    if (this.estadoFb === this.estadosFbEnum.EDITAR) {
      if (this.animacionFb === "active") {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
        return;
      }

      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.opcionesEditarCancelar;
        return;
      }

      return;
    }

    if (this.estadoFb === this.estadosFbEnum.GUARDAR) {
      if (this.animacionFb === "active") {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
        return;
      }

      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.opcionesGuardarCancelar;
        return;
      }

      return;
    }
  }

  public accionesOpcionesFb(indice: number) {
    if (this.estadoFb === this.estadosFbEnum.EDITAR) {
      if (indice === 0) {
        this.editarPuntosAsistencia();
        return;
      }

      if (indice === 1) {
        this.cerrarModalPuntosAsistencia();
        return;
      }
      return;
    }

    if (this.estadoFb === this.estadosFbEnum.GUARDAR) {
      if (indice === 0) {
        this.guardarPuntosAsistencia();
        return;
      }

      if (indice === 1) {
        this.cancelarEdicionPuntosAsistencia();
        return;
      }
      return;
    }
  }

  //#endregion

  //#region FLUJO DE ESTADO DE LOS BOTONES
  private async editarPuntosAsistencia() {
    if (
      !(await this._swalConfirm(
        "¿Seguro que editar?",
        "Para poder aprobar o rechazar, primero necesitas ver el sustento.",
        "Aceptar"
      ))
    ) {
      return;
    }

    this.estadoFb = this.estadosFbEnum.GUARDAR;
    this.opcionesFb = this.opcionesGuardarCancelar;
    this.puntosAsistenciaRespaldo = [];
    this.puntosaDS.data.forEach((val) =>
      this.puntosAsistenciaRespaldo.push(Object.assign({}, val))
    );

    this.puntoAsistenciaFb = [];
    this.puntoAsistenciaSeleccionado = {
      nIdRuta: 0,
      nIdTienda: 0,
      sDireccion: "",
      sDepartamento: "",
      sProvincia: "",
      sDistrito: "",
      nIdEstado: 0,
      puntoVisualizado: false,
      modificable: false,
      sFileSustento: "",
      nIdGestion: 0,
      nIdJustificacion: 0,
      sTexto: "",
      sJustificacion: "",
      sGestion: "",
    };

    return;
  }

  private cerrarModalPuntosAsistencia() {
    this.cerrarModal();
  }

  private async guardarPuntosAsistencia() {
    if (
      !(await this._swalConfirm(
        "¿Seguro que desea guardar?",
        "Una vez guardado no podra mofificar.",
        "Guardar"
      ))
    ) {
      return;
    }

    this.spi.show("gestionap_planning_modal");
    // Enviando los datos
    await this.actualizandoEstadoPuntosAsistencia();
    // Llamar de nuevo la data
    await this.puntosAsistenciaServicio();
    this.recargarDataModal = true;
    this.estadoFb = this.estadosFbEnum.EDITAR;
    this.opcionesFb = this.opcionesEditarCancelar;
    this.puntoAsistenciaFb = [];
    this.puntoAsistenciaSeleccionado.nIdRuta = 0;
    this.spi.hide("gestionap_planning_modal");

    Swal.fire("Guardado", "Las modificacions fueron guardadas!", "success");
  }

  private cancelarEdicionPuntosAsistencia() {
    this.estadoFb = this.estadosFbEnum.EDITAR;
    this.opcionesFb = this.opcionesEditarCancelar;

    this.puntosaDS = new MatTableDataSource(this.puntosAsistenciaRespaldo);
    this.tablaPuntosAP.renderRows();

    this.puntoAsistenciaFb = [];
    this.puntoAsistenciaSeleccionado = {
      nIdRuta: 0,
      nIdTienda: 0,
      sDireccion: "",
      sDepartamento: "",
      sProvincia: "",
      sDistrito: "",
      nIdEstado: 0,
      puntoVisualizado: false,
      modificable: false,
      sFileSustento: "",
      nIdGestion: 0,
      nIdJustificacion: 0,
      sTexto: "",
      sJustificacion: "",
      sGestion: "",
    };
  }

  //-----------------------

  public puntoAsistenciaIconGroupFb(item: IPuntoAsistencia): string {
    if (this.estadoFb === this.estadosFbEnum.EDITAR) {
      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.NUEVO) {
        return "location_off";
      }
      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.PENDIENTE) {
        if (item.nIdJustificacion === 0) {
          return "visibility";
        }

        if (item.nIdJustificacion !== 0) {
          return "help_outline";
        }
      }
      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.APROBADO) {
        return "thumb_up";
      }
      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.INVALIDADO) {
        return "thumb_up";
      }

      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.DESESTIMADO) {
        return "thumb_down";
      }
      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.CONFIRMADO) {
        return "thumb_down";
      }

      return "";
    }

    if (this.estadoFb === this.estadosFbEnum.GUARDAR) {
      // JUSTIFICACION
      if (this.estadoJustificacion(item)) {
        return "help_outline";
      }

      // SUSTENTO
      if (this.estadoSustento(item)) {
        if (!item.puntoVisualizado) {
          return "visibility";
        }

        if (item.puntoVisualizado) {
          return "help_outline";
        }
      }

      //APROBADO
      if (this.estadoAprobadoInvalidado(item)) {
        return "thumb_up";
      }

      //DESESTIMADO
      if (this.estadoDesestimadoConfirmado(item)) {
        return "thumb_down";
      }

      // SIN SUSTENTO NI JUSTIFICACION
      if (this.estadoSinJustificacionSinSustento(item)) {
        return "location_off";
      }

      return "";
    }
  }

  public puntoAsistenciaGroupFb(item: IPuntoAsistencia) {
    if (this.estadoFb === this.estadosFbEnum.EDITAR) {
      if (this.estadoSustento(item)) {
        this.visualizarPuntoAsistencia(item);
        return;
      }

      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.APROBADO) {
        if (this.puntoAsistenciaSeleccionado.nIdRuta === item.nIdRuta) {
          if (this.puntoAsistenciaFb.length > 0) {
            this.puntoAsistenciaFb = [];
          } else {
            this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
          }
        } else {
          this.puntoAsistenciaSeleccionado = item;
          this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
        }
        return;
      }
      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.INVALIDADO) {
        if (this.puntoAsistenciaSeleccionado.nIdRuta === item.nIdRuta) {
          if (this.puntoAsistenciaFb.length > 0) {
            this.puntoAsistenciaFb = [];
          } else {
            this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
          }
        } else {
          this.puntoAsistenciaSeleccionado = item;
          this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
        }
        return;
      }

      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.DESESTIMADO) {
        if (this.puntoAsistenciaSeleccionado.nIdRuta === item.nIdRuta) {
          if (this.puntoAsistenciaFb.length > 0) {
            this.puntoAsistenciaFb = [];
          } else {
            this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
          }
        } else {
          this.puntoAsistenciaSeleccionado = item;
          this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
        }
        return;
      }
      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.CONFIRMADO) {
        if (this.puntoAsistenciaSeleccionado.nIdRuta === item.nIdRuta) {
          if (this.puntoAsistenciaFb.length > 0) {
            this.puntoAsistenciaFb = [];
          } else {
            this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
          }
        } else {
          this.puntoAsistenciaSeleccionado = item;
          this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
        }
        return;
      }

      return;
    }

    if (this.estadoFb === this.estadosFbEnum.GUARDAR) {
      // JUSTIFICACION
      if (this.estadoJustificacion(item)) {
        if (this.puntoAsistenciaSeleccionado.nIdRuta === item.nIdRuta) {
          if (this.puntoAsistenciaFb.length > 0) {
            this.puntoAsistenciaFb = [];
          } else {
            this.puntoAsistenciaFb =
              this.opcionesVisualizarAprobarDesestimarPaFb;
            this.puntoAsistenciaFb[0].disabled = true;
          }
        } else {
          this.puntoAsistenciaSeleccionado = item;
          this.puntoAsistenciaFb = this.opcionesVisualizarAprobarDesestimarPaFb;
          this.puntoAsistenciaFb[0].disabled = true;
        }
        return;
      }

      // SUSTENTO
      if (this.estadoSustento(item)) {
        if (this.puntoAsistenciaSeleccionado.nIdRuta === item.nIdRuta) {
          if (!item.puntoVisualizado) {
            if (this.puntoAsistenciaFb.length > 0) {
              this.puntoAsistenciaFb = [];
            } else {
              alert("Abriendo modal");
              item.puntoVisualizado = true;
              this.puntoAsistenciaFb =
                this.opcionesVisualizarAprobarDesestimarPaFb;
              this.puntoAsistenciaFb[0].disabled = false;
            }
            return;
          }

          if (item.puntoVisualizado) {
            if (this.puntoAsistenciaFb.length > 0) {
              this.puntoAsistenciaFb = [];
            } else {
              this.puntoAsistenciaFb =
                this.opcionesVisualizarAprobarDesestimarPaFb;
              this.puntoAsistenciaFb[0].disabled = false;
            }
            return;
          }
        } else {
          if (!item.puntoVisualizado) {
            alert("abrir modal");
            item.puntoVisualizado = true;
            this.puntoAsistenciaSeleccionado = item;
            this.puntoAsistenciaFb =
              this.opcionesVisualizarAprobarDesestimarPaFb;
            this.puntoAsistenciaFb[0].disabled = false;
            return;
          }

          if (item.puntoVisualizado) {
            this.puntoAsistenciaSeleccionado = item;
            this.puntoAsistenciaFb =
              this.opcionesVisualizarAprobarDesestimarPaFb;
            this.puntoAsistenciaFb[0].disabled = false;
            return;
          }
        }
      }

      // APROBADO
      if (this.estadoAprobadoInvalidado(item)) {
        if (item.modificable) {
          if (this.puntoAsistenciaSeleccionado.nIdRuta === item.nIdRuta) {
            if (this.puntoAsistenciaFb.length > 0) {
              this.puntoAsistenciaFb = [];
            } else {
              this.puntoAsistenciaFb = this.opcionesVisualizarCancelarPaFb;
              this.puntoAsistenciaFb[0].disabled =
                item.sTexto === "" && item.nIdJustificacion !== 0;
            }
          } else {
            this.puntoAsistenciaSeleccionado = item;
            this.puntoAsistenciaFb = this.opcionesVisualizarCancelarPaFb;
            this.puntoAsistenciaFb[0].disabled =
              item.sTexto === "" && item.nIdJustificacion !== 0;
          }
          return;
        }

        if (!item.modificable) {
          if (this.puntoAsistenciaSeleccionado.nIdRuta === item.nIdRuta) {
            if (this.puntoAsistenciaFb.length > 0) {
              this.puntoAsistenciaFb = [];
            } else {
              this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
              this.puntoAsistenciaFb[0].disabled =
                item.sTexto === "" && item.nIdJustificacion !== 0;
            }
          } else {
            this.puntoAsistenciaSeleccionado = item;
            this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
            this.puntoAsistenciaFb[0].disabled =
              item.sTexto === "" && item.nIdJustificacion !== 0;
          }
        }
      }

      // DESESTIMADO
      if (this.estadoDesestimadoConfirmado(item)) {
        if (item.modificable) {
          if (this.puntoAsistenciaSeleccionado.nIdRuta === item.nIdRuta) {
            if (this.puntoAsistenciaFb.length > 0) {
              this.puntoAsistenciaFb = [];
            } else {
              this.puntoAsistenciaFb = this.opcionesVisualizarCancelarPaFb;
              this.puntoAsistenciaFb[0].disabled =
                item.sTexto === "" && item.nIdJustificacion !== 0;
            }
          } else {
            this.puntoAsistenciaSeleccionado = item;
            this.puntoAsistenciaFb = this.opcionesVisualizarCancelarPaFb;
            this.puntoAsistenciaFb[0].disabled =
              item.sTexto === "" && item.nIdJustificacion !== 0;
          }
        }

        if (!item.modificable) {
          if (this.puntoAsistenciaSeleccionado.nIdRuta === item.nIdRuta) {
            if (this.puntoAsistenciaFb.length > 0) {
              this.puntoAsistenciaFb = [];
            } else {
              this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
              this.puntoAsistenciaFb[0].disabled =
                item.sTexto === "" && item.nIdJustificacion !== 0;
            }
          } else {
            this.puntoAsistenciaSeleccionado = item;
            this.puntoAsistenciaFb = this.opcionesVisualizarPaFb;
            this.puntoAsistenciaFb[0].disabled =
              item.sTexto === "" && item.nIdJustificacion !== 0;
          }
        }
      }
    }
  }

  public async accionPuntoAsistenciaFb(indice: number, item: IPuntoAsistencia) {
    // EDITAR ----------------------------------------
    if (this.estadoFb === this.estadosFbEnum.EDITAR) {
      if (indice === 0) {
        this.verSustento(item);
        return;
      }
      return;
    }

    // GUARDAR ----------------------------------------
    if (this.estadoFb === this.estadosFbEnum.GUARDAR) {
      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.PENDIENTE) {
        if (item.nIdJustificacion === 0) {
          if (indice === 0) {
            this.visualizarPuntoAsistencia(item);
            return;
          }

          if (indice === 1) {
            item.nIdEstado = this.estadosPuntoAsistenciaEnum.APROBADO;
            item.sTexto = "";
            this.puntoAsistenciaFb = [];
            return;
          }

          if (indice === 2) {
            const { value: text } = await Swal.fire({
              title: "Detallar el porque de su decisión",
              input: "textarea",
              inputPlaceholder: "Escribir el detalle aquí...",
              confirmButtonColor: "#ff4081",
              confirmButtonText: "Guardar",
              cancelButtonText: "Cancelar",
              showCancelButton: true,
            });

            if (text) {
              item.sTexto = text.toString();
            } else {
              Swal.fire("Atencion!", "Debes ingresar una observacion", "info");
              return;
            }

            item.nIdEstado = this.estadosPuntoAsistenciaEnum.DESESTIMADO;
            this.puntoAsistenciaFb = [];
            return;
          }
        }

        if (item.nIdJustificacion !== 0) {
          if (indice === 1) {
            item.nIdEstado = this.estadosPuntoAsistenciaEnum.APROBADO;
            item.sTexto = "";
            this.puntoAsistenciaFb = [];
            return;
          }

          if (indice === 2) {
            const { value: text } = await Swal.fire({
              title: "Observación",
              input: "textarea",
              inputPlaceholder: "Ingresa tu observacion aqui...",
              inputAttributes: {
                "aria-label": "Type your message here",
              },
              cancelButtonText: "Cancelar",
              confirmButtonText: "Aceptar",
              showCancelButton: true,
            });

            if (text) {
              item.sTexto = text.toString();
            } else {
              Swal.fire("Atencion!", "Debes ingresar una observacion", "info");
              return;
            }

            item.nIdEstado = this.estadosPuntoAsistenciaEnum.DESESTIMADO;
            this.puntoAsistenciaFb = [];
            return;
          }
        }
      }

      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.APROBADO) {
        if (item.modificable) {
          if (indice === 0) {
            this.verSustento(item);
            return;
          }

          if (indice === 1) {
            if (item.nIdJustificacion === 0) {
              item.nIdEstado = this.estadosPuntoAsistenciaEnum.PENDIENTE;
            }

            if (item.nIdJustificacion !== 0) {
              item.nIdEstado = this.estadosPuntoAsistenciaEnum.PENDIENTE;
            }

            this.puntoAsistenciaFb = [];
            this.delay(this.tiempoDelayPuntoAsistenciaFb).then(() => {
              this.puntoAsistenciaFb =
                this.opcionesVisualizarAprobarDesestimarPaFb;
            });

            return;
          }
        }

        if (!item.modificable) {
          if (indice === 0) {
            this.verSustento(item);
            return;
          }
          return;
        }
      }
      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.INVALIDADO) {
        if (indice === 0) {
          this.verSustento(item);
          return;
        }
      }

      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.DESESTIMADO) {
        if (item.modificable) {
          if (indice === 0) {
            this.verSustento(item);
            return;
          }

          if (indice === 1) {
            if (item.nIdJustificacion === 0) {
              item.nIdEstado = this.estadosPuntoAsistenciaEnum.PENDIENTE;
            }

            if (item.nIdJustificacion !== 0) {
              item.nIdEstado = this.estadosPuntoAsistenciaEnum.PENDIENTE;
            }
            item.sTexto = "";
            this.puntoAsistenciaFb = [];
            this.delay(this.tiempoDelayPuntoAsistenciaFb).then(() => {
              this.puntoAsistenciaFb =
                this.opcionesVisualizarAprobarDesestimarPaFb;
            });

            return;
          }
          return;
        }

        if (!item.modificable) {
          if (indice === 0) {
            this.verSustento(item);
            return;
          }
        }
      }
      if (item.nIdEstado === this.estadosPuntoAsistenciaEnum.CONFIRMADO) {
        if (indice === 0) {
          this.verSustento(item);
          return;
        }
      }
    }
  }

  private verSustento(item: IPuntoAsistencia) {
    if (item.sFileSustento === null) {
      this.clickExpanded(item);
      return;
    }

    if (item.sFileSustento !== null) {
      this.visualizarPuntoAsistencia(item);
    }
  }

  private estadoJustificacion(item: IPuntoAsistencia): boolean {
    return (
      item.nIdJustificacion !== 0 &&
      item.nIdEstado === this.estadosPuntoAsistenciaEnum.PENDIENTE
    );
  }

  private estadoSustento(item: IPuntoAsistencia): boolean {
    return (
      item.sFileSustento !== null &&
      item.nIdEstado === this.estadosPuntoAsistenciaEnum.PENDIENTE
    );
  }

  public estadoSinJustificacionSinSustento(item: IPuntoAsistencia) {
    return (
      item.nIdEstado === this.estadosPuntoAsistenciaEnum.NUEVO &&
      item.nIdJustificacion === 0
    );
  }

  private estadoAprobadoInvalidado(item: IPuntoAsistencia) {
    return (
      item.nIdEstado === this.estadosPuntoAsistenciaEnum.APROBADO ||
      item.nIdEstado === this.estadosPuntoAsistenciaEnum.INVALIDADO
    );
  }

  private estadoDesestimadoConfirmado(item: IPuntoAsistencia) {
    return (
      item.nIdEstado === this.estadosPuntoAsistenciaEnum.DESESTIMADO ||
      item.nIdEstado === this.estadosPuntoAsistenciaEnum.CONFIRMADO
    );
  }
  //#endregion

  //#region INFORMACION DEL PERSONAL
  private async informacionPersonalServicio() {
    const params = [];
    params.push("0¡A.nIdPersonal!" + this.nIdPersonal);
    const data: any = await this.service._loadSP(12, params, this.url);
    this.setDataInfoPersonal(data);
  }

  public setDataInfoPersonal(data: IInfoPersonal) {
    this.infoPersonal.patchValue({
      nombres: data.sNombres,
      tipoDocumento: data.sTipoDoc,
      nroDocumento: data.sDocumento,
    });
  }

  public getDataInfoPersonal(campo: string): any {
    return this.infoPersonal.controls.campo.value;
  }
  //#endregion

  //#region DATOS DE ASISTENCIA
  private async datosAsistenciaServicio() {
    const sFecha = moment(this.dFecha).format("MM/DD/YYYY");

    const params = [];
    params.push("6¡ASISTENCIA.dFecha!" + sFecha);
    params.push("0¡DPP.nIdPersonal!" + this.nIdPersonal);

    const data: IDatosAsistencia = await this.service._loadSP(
      6,
      params,
      this.url
    );
    this.setDataDatosAsistencia(data);
  }

  public setDataDatosAsistencia(data: IDatosAsistencia) {
    this.datosAsistencia.patchValue({
      fecha: data.dFecha,
      horaEntrada: data.sHoraIni,
      horaSalida: data.sHoraFin,
      responsable: data.sResponsable,
      clienteArea: data.sCliente,
    });
  }

  public getDataDatosAsistencia(campo: string): any {
    return this.datosAsistencia.controls.campo.value;
  }
  //#endregion

  //#region PUNTOS DE ASISTENCIA
  public async puntosAsistenciaServicio() {
    const sFecha = moment(this.dFecha).format("MM/DD/YYYY");
    const params = [];
    params.push("0¡DPP.nIdPersonal!" + this.nIdPersonal);
    params.push("6¡ASISTENCIA.dFecha!" + sFecha);
    var data: IPuntoAsistencia[] = await this.service._loadSP(
      7,
      params,
      this.url
    );

    data = data.map((v) => {
      v.sTexto = v.sTexto ? v.sTexto : "";
      v.puntoVisualizado = false;
      v.modificable = this.calcularModificacionPunto(v);
      return v;
    });

    this.puntosaDS = new MatTableDataSource(data);
    this.desactivandoBtnEditar(data);
  }

  private desactivandoBtnEditar(data: IPuntoAsistencia[]) {
    if (
      !data.some(
        (v) => v.nIdEstado === this.estadosPuntoAsistenciaEnum.PENDIENTE
      )
    ) {
      this.opcionesFb[0].disabled = true;
    }
  }

  private calcularModificacionPunto(v: IPuntoAsistencia): boolean {
    if (
      v.nIdEstado === this.estadosPuntoAsistenciaEnum.CONFIRMADO ||
      v.nIdEstado === this.estadosPuntoAsistenciaEnum.DESESTIMADO ||
      v.nIdEstado === this.estadosPuntoAsistenciaEnum.INVALIDADO ||
      v.nIdEstado === this.estadosPuntoAsistenciaEnum.APROBADO
    ) {
      return false;
    }

    if (v.sFileSustento !== null) {
      return true;
    }

    if (v.nIdJustificacion !== 0) {
      return true;
    }

    return false;
  }

  public visualizarPuntoAsistencia(item: IPuntoAsistencia) {
    const modal = this.modalService.open(
      GestionapDetailComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.nIdRuta = item.nIdRuta;
    modal.componentInstance.nIdTienda = item.nIdTienda;
    modal.componentInstance.sDireccion = item.sDireccion;

    modal.result.then(async (result) => {
      if (result.recargar) {
        this.recargarDataModal = true;
      }
    });
  }

  private async actualizandoEstadoPuntosAsistencia() {
    const data = this.puntosaDS.data.filter((v) => v.modificable);
    const dataNoDesestimado = data.filter(
      (v) => v.nIdEstado !== this.estadosPuntoAsistenciaEnum.DESESTIMADO
    );
    const dataDesestimado = data.filter(
      (v) => v.nIdEstado === this.estadosPuntoAsistenciaEnum.DESESTIMADO
    );

    var params = [];
    await Promise.all(
      dataNoDesestimado.map(async (item) => {
        params = [];
        params.push("T1¡nIdRuta!" + item.nIdRuta);
        params.push("T1¡nIdEstado!" + item.nIdEstado);
        await this.service._crudGA(1, params, this.url);
      })
    );

    var params2 = [];
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    await Promise.all(
      dataDesestimado.map(async (item) => {
        params2 = [];
        // Agregando parametros
        params2.push("T1¡nIdRuta!" + item.nIdRuta);
        params2.push("T1¡nIdUser!" + uid);
        params2.push("T1¡dtReg!GETDATE()");
        params2.push("T1¡nIdEstado!" + item.nIdEstado);
        params2.push("T1¡sTexto!" + item.sTexto);

        params2.push("W2¡nIdRuta!" + item.nIdRuta);
        params2.push("S2¡nIdEstado!" + item.nIdEstado);

        await this.service._crudGA(2, params2, this.url);
      })
    );
  }

  public async clickExpanded(item: IPuntoAsistencia) {
    this.expandedMore = this.expandedMore === item ? null : item;
    this.formExpanded.patchValue({
      nIdGestion: item.nIdGestion,
      gestionToogle: item.nIdGestion !== 0,
      nIdJustificacion: item.nIdJustificacion,
      justificacionToogle: item.nIdJustificacion !== 0,
    });
  }

  public cantidadRegistros(): string {
    const cantidad = this.puntosaDS.data.length;
    return cantidad === 0 ? "N/A" : cantidad.toString();
  }
  //#endregion

  //#region MODAL
  public cerrarModal() {
    const oReturn = new Object();
    oReturn["recargar"] = this.recargarDataModal;
    this.activeModal.close(oReturn);
  }
  //#endregion

  //#region GENERAL
  public capitalizeFirstLetter(data: string) {
    return data.charAt(0).toUpperCase() + data.slice(1);
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
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
