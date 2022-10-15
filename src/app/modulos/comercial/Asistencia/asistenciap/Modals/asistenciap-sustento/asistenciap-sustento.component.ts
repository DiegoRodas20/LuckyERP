import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  MatBottomSheet,
  MatBottomSheetRef,
} from "@angular/material/bottom-sheet";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import moment from "moment";
import { SelectionModel } from "@angular/cdk/collections";
import { DeviceDetectorService } from "ngx-device-detector";
import { NgxSpinnerService } from "ngx-spinner";
import { comercialAnimations } from "src/app/modulos/comercial/Animations/comercial.animations";
import { IJustificacionPuntoAsistencia } from "src/app/modulos/comercial/requerimiento/model/Igestionap";
import Swal from "sweetalert2";
import { MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";
import { AsistenciapService } from "../../asistenciap.service";
import {
  IGestionCombo,
  IInfoPuntoAsistencia,
  IJustificacionCombo,
  ListaPuntosU,
} from "../../interface";

var listaPuntoAsistenciaSheet: IJustificacionPuntoAsistencia[] = [];

enum EstadoFbEnum {
  subirFoto = 0,
  guardarLimpiarFoto = 1,
  editar = 2,
  subirEdicion = 3,
  guardarEdicion = 4,
  cancelarJustificacion = 5,
}

class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: "app-asistenciap-sustento",
  templateUrl: "./asistenciap-sustento.component.html",
  styleUrls: [
    "./asistenciap-sustento.component.css",
    "./asistenciap-sustento.component.scss",
  ],
  animations: [comercialAnimations],
})
export class AsistenciapSustentoComponent implements OnInit {
  //#region INPUT
  @Input() estadoInicial: number = 0;
  @Input() nIdRuta: number = 0;
  @Input() dFechaAsistencia: Date;
  @Input() nIdAsistencia = 0;
  @Input() nIdJustificacion = 0;
  @Input() nIdGestion = 0;
  @Input() nIdPersonal = 0;

  @Input() listaRutas: ListaPuntosU[] = [];
  //#endregion

  //#region GENERAL
  matcher = new MyErrorStateMatcher();
  url: string;
  urlImagen: any = "../../../../../../assets/img/noImage.png";
  recargarDataCerrarModal = false;
  modoEscritorio: boolean = this.deviceService.isDesktop();
  //#endregion

  //#region Fb
  estadosFb = EstadoFbEnum;
  public estadoFb: number = -1;

  public animacionFb: string = "inactive";
  private opcionesTomasSubirCerrarFb: any[] = [
    {
      icon: "add_a_photo",
      tool: "Subir foto",
      dis: false,
    },
    { icon: "close", tool: "Cerrar", dis: false },
  ];

  private opcionesGuardarLimpiarFb: any[] = [
    { icon: "save", tool: "Guardar", dis: false },
    { icon: "cleaning_services", tool: "Limpiar", dis: false },
  ];

  private opcionesEditarFb: any[] = [
    { icon: "edit", tool: "Editar", dis: false },
    { icon: "close", tool: "Cerrar", dis: false },
  ];

  private opcionesEdicionTomarSubirCancelarFb: any[] = [
    {
      icon: "add_a_photo",
      tool: "Subir foto",
      dis: false,
    },
    { icon: "save", tool: "Guardar", dis: false },
    { icon: "close", tool: "Cerrar", dis: false },
  ];

  private opcionesEdicionGuardarCancelar: any[] = [
    { icon: "save", tool: "Guardar", dis: false },
    { icon: "cleaning_services", tool: "Limpiar", dis: false },
  ];

  private opcionesDejustificarCancelar: any[] = [
    { icon: "do_disturb_on", tool: "Cancelar justificacion", dis: false },
    { icon: "close", tool: "Limpiar", dis: false },
  ];

  public opcionesFb: any[] = [];
  //#endregion

  //#region INFORMACION DEL PUNTO DE ASISTENCIA
  formInfoPuntoVenta: FormGroup = this.formBuilder.group({
    dia: [{ value: null, disabled: true }],
    responsable: [{ value: null, disabled: true }],
    cliente: [{ value: null, disabled: true }],
    direccion: [{ value: null, disabled: true }],
  });
  //#endregion

  //#region JUSTIFICACION
  comboJustificacion: IJustificacionCombo[] = [];
  comboGestion: IGestionCombo[] = [];

  estadoSlideToggleJustificacionForm: FormGroup = this.formBuilder.group({
    justificacion: [
      {
        value: null,
        disabled: true,
      },
    ],
    nIdJustificacion: [{ value: null, disabled: true }, [Validators.required]],
  });

  estadoSlideToggleGestionForm: FormGroup = this.formBuilder.group({
    gestion: [
      {
        value: false,
        disabled: true,
      },
    ],
    nIdGestion: [{ value: null, disabled: true }, [Validators.required]],
  });
  //#endregion

  //#region SUBIR IMAGEN
  fileImage: File;
  pbImg: boolean;
  //#endregion

  //#region EDITAR SUSTENTO
  private photoRespaldo = "";
  //#endregion

  //#region BUTTON SHEET
  estadoButtonSheet = false;
  //#endregion

  constructor(
    @Inject("BASE_URL") baseUrl: string,
    private formBuilder: FormBuilder,
    private spi: NgxSpinnerService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private _snackBar: MatSnackBar,
    private deviceService: DeviceDetectorService,
    public service: AsistenciapService,
    private _bottomSheet: MatBottomSheet
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    listaPuntoAsistenciaSheet = [];
    this.spi.show("spi_asistenciap_sustento");
    await this._infoPuntosDeVentaServicio();
    await this.justificacionServicio();
    await this.gestionServicio();
    this.inicializarCancelarJustificacion();
    this.inicializarCrearSustento();
    this.inicializarEditarSustento();
    this.configuracionInicialGestionJustificacion();
    this.spi.hide("spi_asistenciap_sustento");
  }

  //#region GENERAL
  private configuracionInicialGestionJustificacion() {
    this.estadoSlideToggleJustificacionForm.controls.nIdJustificacion.patchValue(
      this.nIdJustificacion
    );
    if (this.nIdJustificacion > 0) {
      this.estadoSlideToggleJustificacionForm.controls.justificacion.patchValue(
        true
      );
    }

    this.estadoSlideToggleGestionForm.controls.nIdGestion.patchValue(
      this.nIdGestion
    );

    if (this.nIdGestion > 0) {
      this.estadoSlideToggleGestionForm.controls.gestion.patchValue(true);
    }
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

  //#region FB
  validacionMostrarElFb(): boolean {
    return (
      moment(new Date()).format("DD/MM/YYYY") ===
      moment(this.dFechaAsistencia).format("DD/MM/YYYY")
    );
  }

  public clickGrupoFb() {
    if (this.estadoFb === this.estadosFb.subirFoto) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.opcionesTomasSubirCerrarFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === this.estadosFb.guardarLimpiarFoto) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.opcionesGuardarLimpiarFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === this.estadosFb.editar) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.opcionesEditarFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === this.estadosFb.subirEdicion) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.opcionesEdicionTomarSubirCancelarFb;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === this.estadosFb.guardarEdicion) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.opcionesEdicionGuardarCancelar;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }

    if (this.estadoFb === this.estadosFb.cancelarJustificacion) {
      if (this.animacionFb === "inactive") {
        this.animacionFb = "active";
        this.opcionesFb = this.opcionesDejustificarCancelar;
      } else {
        this.animacionFb = "inactive";
        this.opcionesFb = [];
      }
      return;
    }
  }

  public async clickOpcionFb(indice: number) {
    if (this.estadoFb === this.estadosFb.subirFoto) {
      if (indice === 0) {
        Swal.fire({
          title: "Elegir un modo",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: "Tomar foto",
          confirmButtonColor: "#e83e8c",
          denyButtonColor: "#334d6e",
          denyButtonText: "Subir imagen",
        }).then((result) => {
          if (result.isConfirmed) {
            if (this.deviceService.isDesktop) {
              Swal.fire(
                "Atencion",
                "No se encuentra en un dispositivo movil",
                "info"
              );
            } else {
              this.tomarFotoAccionFb();
            }
          } else if (result.isDenied) {
            this.subirFotoAccionFb();
          }
        });
        return;
      }

      if (indice === 1) {
        this.cerrarModal();
        return;
      }
    }

    if (this.estadoFb === this.estadosFb.guardarLimpiarFoto) {
      if (indice === 0) {
        if (
          await this._swalConfirm(
            "Guardar",
            "¿Seguro que deseas guardar ?",
            "Si"
          )
        ) {
          this.guardarFotoAccionFb();
          if (this.estadoButtonSheet) {
            await this.guardarJustificacion();
          }
        }
        return;
      }

      if (indice === 1) {
        this.limpiarFotoAccionFb();
        return;
      }
    }

    if (this.estadoFb === this.estadosFb.editar) {
      if (indice === 0) {
        if (
          await this._swalConfirm(
            "Editar asistencia",
            "¿Seguro que deseas editar ?",
            "Si"
          )
        ) {
          if (this.nIdGestion === 1398) {
            this.estadoButtonSheet = true;
          }

          this.opcionesFb = [];
          this.delay(250).then(() => {
            this.opcionesFb = this.opcionesEdicionTomarSubirCancelarFb;
            this.estadoFb = this.estadosFb.subirEdicion;
          });

          this.estadoSlideToggleGestionForm.controls.gestion.enable();
          if (this.nIdGestion > 0) {
            this.estadoSlideToggleGestionForm.controls.gestion.patchValue(true);
            this.estadoSlideToggleGestionForm.controls.nIdGestion.enable();
          } else {
            this.estadoSlideToggleGestionForm.controls.gestion.patchValue(
              false
            );
            this.estadoSlideToggleGestionForm.controls.nIdGestion.disable();
          }
        }

        return;
      }

      if (indice === 1) {
        this.cerrarModal();
        return;
      }
      return;
    }

    if (this.estadoFb === this.estadosFb.subirEdicion) {
      if (indice === 0) {
        Swal.fire({
          title: "Elegir un modo",
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: "Tomar foto",
          confirmButtonColor: "#e83e8c",
          denyButtonColor: "#334d6e",
          denyButtonText: "Subir imagen",
        }).then((result) => {
          if (result.isConfirmed) {
            if (this.deviceService.isDesktop) {
              Swal.fire(
                "Atencion",
                "No se encuentra en un dispositivo movil",
                "info"
              );
            } else {
              this.tomarFotoAccionFb();
            }
          } else if (result.isDenied) {
            this.subirFotoAccionFb();
          }
        });
        return;
      }
      if (indice === 1) {
        if (
          !(await this._swalConfirm(
            "¿Seguro que desea guardar?",
            "Si cambia de opinion podra editarlo.",
            "Guardar"
          ))
        ) {
          return;
        }
        this.pbImg = true;
        await this.editarGestionPuntoAsistencia();
        await this.guardarJustificacion();
        this.pbImg = false;
        //if (this.estadoButtonSheet) {
        //}
        return;
      }

      if (indice === 2) {
        this.opcionesFb = [];
        this.delay(250).then(() => {
          this.opcionesFb = this.opcionesEditarFb;
          this.estadoFb = this.estadosFb.editar;
        });

        this.estadoButtonSheet = false;
        this.estadoSlideToggleGestionForm.controls.gestion.enable();
        this.estadoSlideToggleGestionForm.controls.nIdGestion.patchValue(
          this.nIdGestion
        );
        this.estadoSlideToggleGestionForm.controls.nIdGestion.disable();
        this.estadoSlideToggleGestionForm.controls.gestion.patchValue(
          this.nIdGestion > 0
        );
        return;
      }
      return;
    }

    if (this.estadoFb === this.estadosFb.guardarEdicion) {
      if (indice === 0) {
        if (
          await this._swalConfirm(
            "Guardar",
            "¿Seguro que deseas guardar ?",
            "Si"
          )
        ) {
          this.editarFotoAccionFb();
          if (this.estadoButtonSheet) {
            await this.guardarJustificacion();
          }
        }
        return;
      }

      if (indice === 1) {
        this.urlImagen = this.photoRespaldo;
        this.photoRespaldo = null;
        this.opcionesFb = [];
        this.delay(250).then(() => {
          this.opcionesFb = this.opcionesEdicionTomarSubirCancelarFb;
          this.estadoFb = this.estadosFb.subirEdicion;
        });
        return;
      }
      return;
    }

    if (this.estadoFb === this.estadosFb.cancelarJustificacion) {
      if (indice === 0) {
        this.cancelarJustificacion();
      }

      if (indice === 1) {
        this.cerrarModal();
      }
    }
  }
  //#endregion

  //#region INFORMACION DEL PUNTO DE ASISTENCIA
  private async _infoPuntosDeVentaServicio() {
    const params = [];
    params.push("0¡RUTA.nIdRuta!" + this.nIdRuta);

    const data: IInfoPuntoAsistencia = await this.service._loadSP(
      3,
      params,
      this.url
    );

    this.formInfoPuntoVenta.patchValue({
      dia: moment(data.dFecha).format("DD/MM/YYYY"),
      responsable: data.sResponsable,
      cliente: data.sCliente,
      direccion: data.sDireccion,
    });

    if (data.sFileSustento !== null) this.urlImagen = data.sFileSustento;
  }

  private _getInfoPuntoAsistencia(nombre: string) {
    return this.formInfoPuntoVenta.controls[nombre].value;
  }
  //#endregion

  //#region JUSTIFICACION
  public async justificacionServicio() {
    const params = [];
    params.push("0¡nDadTipEle!1399");
    this.comboJustificacion = await this.service._loadSP(5, params, this.url);
  }

  private async guardarJustificacion() {
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;
    var params = [];

    await Promise.all(
      listaPuntoAsistenciaSheet.map(async (item) => {
        params = [];
        params.push("T1¡nIdRuta!" + item.nIdRuta);
        params.push("T1¡nIdUser!" + uid);
        params.push("T1¡dtReg!GETDATE()");
        params.push("T1¡nIdEstado!" + 2327);
        params.push("T1¡sTexto!" + "Justificando");

        params.push("W2¡nIdRuta!" + item.nIdRuta);
        params.push("S2¡nIdEstado!2327");
        params.push("S2¡nIdJustificacion!" + 1407);

        await this.service._crudAP(3, params, this.url);
      })
    );
    listaPuntoAsistenciaSheet = [];
  }
  //#endregion

  //#region GESTION
  public gestionSeleccionada(data: any) {
    this.estadoButtonSheet = data === 1398;
    if (data === 1398) {
      this.openBottomSheet();
    }
  }

  public async editarGestionPuntoAsistencia() {
    var nIdGestion =
      this.estadoSlideToggleGestionForm.controls.nIdGestion.value;

    nIdGestion = nIdGestion === undefined ? null : nIdGestion;
    const aParam = [];

    aParam.push("T1¡nIdRuta!" + this.nIdRuta);
    aParam.push("T1¡nIdGestion!" + nIdGestion);

    await this.service._crudAP(1, aParam, this.url);

    Swal.fire("Guardado", "Se guardo correctamente.", "success");

    this.opcionesFb = [];
    this.delay(250).then(() => {
      this.opcionesFb = this.opcionesEditarFb;
      this.estadoFb = this.estadosFb.editar;
    });
    this.recargarDataCerrarModal = true;
    this.nIdGestion = nIdGestion;

    this.estadoButtonSheet = false;
    this.estadoSlideToggleGestionForm.controls.nIdGestion.disable();
    this.estadoSlideToggleGestionForm.controls.gestion.disable();
    this.estadoSlideToggleGestionForm.controls.gestion.patchValue(
      nIdGestion > 0
    );
  }

  public async gestionServicio() {
    const params = [];
    this.comboGestion = await this.service._loadSP(6, params, this.url);
  }

  public deshabilitarGestion() {
    if (
      this.estadoFb === this.estadosFb.guardarEdicion ||
      this.estadoFb === this.estadosFb.subirEdicion ||
      this.estadoFb === this.estadosFb.guardarLimpiarFoto
    ) {
      this.estadoSlideToggleGestionForm.controls.nIdGestion.patchValue(
        this.nIdGestion
      );
      this.estadoSlideToggleGestionForm.controls.nIdGestion.disable();
      this.estadoSlideToggleGestionForm.controls.gestion.patchValue(false);
      this.estadoSlideToggleGestionForm.controls.gestion.disable();
    } else {
      this.estadoSlideToggleGestionForm.controls.gestion.enable();
    }
  }

  public activarFormularioJustificacion() {
    if (this.estadoSlideToggleGestionForm.controls.gestion.value) {
      this.estadoSlideToggleGestionForm.controls.nIdGestion.enable();
    } else {
      this.estadoSlideToggleGestionForm.controls.nIdGestion.patchValue(
        this.nIdGestion
      );
      this.estadoSlideToggleGestionForm.controls.nIdGestion.disable();
    }
  }
  //#endregion

  //#region SUBIR IMAGEN
  private tomarFotoAccionFb() {
    var x = document.createElement("input");
    x.setAttribute("type", "file");
    x.accept = "image/*";
    x.setAttribute("capture", "camera");
    x.click();

    x.addEventListener(
      "change",
      async () => {
        this.uploadImage(x.files[0]);
      },
      false
    );
  }

  private subirFotoAccionFb() {
    var x = document.createElement("input");
    x.setAttribute("type", "file");
    x.accept = "image/*";
    x.click();

    x.addEventListener(
      "change",
      async () => {
        this.uploadImage(x.files[0]);
      },
      false
    );
  }

  private uploadImage(file) {
    if (file) {
      this.loadImagenCrearSustento(file);
      this.loadImagenEditarSustento(file);
    }
  }

  private limpiarFotoAccionFb() {
    this.urlImagen = "../../../../../assets/img/noImage.png";
    this.opcionesFb = [];
    this.delay(250).then((any) => {
      this.estadoFb = this.estadosFb.subirFoto;
      this.opcionesFb = this.opcionesTomasSubirCerrarFb;
      this.animacionFb = "active";
    });

    this.deshabilitarGestion();
  }
  //#endregion

  //#region CANCELAR JUSTIFICACION
  private inicializarCancelarJustificacion() {
    if (!(this.estadoInicial === 3)) return;
    this.delay(250).then(() => {
      this.opcionesFb = this.opcionesDejustificarCancelar;
      this.animacionFb = "active";
      this.estadoFb = this.estadosFb.cancelarJustificacion;
      this.estadoInicial = 1;
    });
  }

  private async cancelarJustificacion() {
    if (
      !(await this._swalConfirm(
        "¿Eliminar justificacion?",
        "Se le quitara la justficacion a este punto de asistencia.",
        "Aceptar"
      ))
    ) {
      return;
    }

    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;
    const params = [];

    params.push("T1¡nIdRuta!" + this.nIdRuta);
    params.push("T1¡nIdUser!" + uid);
    params.push("T1¡dtReg!GETDATE()");
    params.push("T1¡nIdEstado!2390");
    params.push("T1¡sTexto!" + "Eliminando justificacion");

    params.push("W2¡nIdRuta!" + this.nIdRuta);
    params.push("S2¡nIdEstado!2390");
    params.push("S2¡nIdJustificacion!NULL");

    const resp = await this.service._crudAP(3, params, this.url);

    await this.cambiarEstadoAsistencia();
    Swal.fire(
      "Justificacion cancelada",
      "Se cancelo con exito el punto de asistencia.",
      "success"
    );

    this.estadoSlideToggleJustificacionForm.controls.nIdJustificacion.reset();
    this.estadoSlideToggleJustificacionForm.controls.justificacion.patchValue(
      false
    );

    this.estadoFb = this.estadosFb.subirFoto;
    this.opcionesFb = this.opcionesTomasSubirCerrarFb;
    this.recargarDataCerrarModal = true;
  }

  private async cambiarEstadoAsistencia() {
    const listaOtrasRutas = this.listaRutas.filter(
      (v) => v.nIdRuta !== this.nIdRuta
    );
    if (
      !listaOtrasRutas.some(
        (v) => v.nIdJustificacion > 0 || v.sFileSustento !== null
      )
    ) {
      const params = [];
      params.push("T1¡nIdAsistencia!" + this.nIdAsistencia);
      params.push("T1¡nIdDia!2366");
      const resul2 = await this.service._crudAP(2, params, this.url);
    }
  }
  //#endregion

  //#region CREAR SUSTENTO
  private inicializarCrearSustento() {
    if (!(this.estadoInicial === 1)) return;
    this.delay(250).then(() => {
      this.opcionesFb = this.opcionesTomasSubirCerrarFb;
      this.animacionFb = "active";
      this.estadoFb = this.estadosFb.subirFoto;
    });
  }

  private async guardarFotoAccionFb() {
    if (navigator.geolocation) {
      this.pbImg = true;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const resp = await this.guardarsustentoDelPunto(pos);
          this.cerrarModal();
          return;
          if (resp) {
            this.deshabilitarGestion();
            this.opcionesFb = [];
            this.delay(250).then(() => {
              this.opcionesFb = this.opcionesEditarFb;
              this.estadoFb = this.estadosFb.editar;
            });
          }
          this.pbImg = false;
        },
        (error) => {
          this._snackBar.open(error.message, "Cerrar", {
            horizontalPosition: "right",
            verticalPosition: "top",
          });
          this.pbImg = false;
        },
        {
          enableHighAccuracy: true,
        }
      );
    } else {
      this._snackBar.open("Geolocalización no soportada.", "Cerrar", {
        horizontalPosition: "right",
        verticalPosition: "top",
      });
    }
  }

  async guardarsustentoDelPunto(pos: any): Promise<boolean> {
    const nIdGestion =
      this.estadoSlideToggleGestionForm.controls.nIdGestion.value;
    const sFile = this.urlImagen as string;
    const iFile = sFile.indexOf(",") + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);
    const UploadImage: any = await this.service._uploadFile(
      sFileSustento,
      5,
      "AsistenciaPersonal",
      "image/jpeg",
      this.url
    );

    const aParam = [];
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    aParam.push("T1¡nIdRuta!" + this.nIdRuta);
    aParam.push("T1¡nIdUser!" + uid);
    aParam.push("T1¡dtReg!GETDATE()");
    aParam.push("T1¡nIdEstado!" + 2327);
    aParam.push("T1¡sTexto!" + "Cambiando a Pendiente");

    aParam.push("W2¡nIdRuta!" + this.nIdRuta);
    aParam.push("S2¡nIdEstado!2327");
    aParam.push("S2¡nLatitud!" + pos.lat);
    aParam.push("S2¡nLongitud!" + pos.lng);
    aParam.push("S2¡sFileSustento!" + UploadImage.fileUrl);
    aParam.push("S2¡nIdGestion!" + nIdGestion);

    const result = await this.service._crudAP(3, aParam, this.url);

    const params = [];
    params.push("T1¡nIdAsistencia!" + this.nIdAsistencia);
    params.push("T1¡nIdDia!2335");
    const resul2 = await this.service._crudAP(2, params, this.url);

    this.nIdGestion = nIdGestion;

    Swal.fire("Guardado", "Se guardo correctamente.", "success");

    this.pbImg = false;

    const resp: boolean =
      result[0].split("!")[0] === "nIdHER" && resul2[0] === "";
    this.recargarDataCerrarModal = resp;

    return resp;
  }

  private loadImagenCrearSustento(file: any) {
    if (!(this.estadoInicial === 1)) return;

    this.pbImg = true;
    this.opcionesFb = [];

    this.delay(250).then(() => {
      this.estadoFb = this.estadosFb.guardarLimpiarFoto;
      this.opcionesFb = this.opcionesGuardarLimpiarFb;
      this.animacionFb = "inactive";
    });

    this.deshabilitarGestion();

    this.fileImage = file;
    const self = this;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      self.urlImagen = reader.result;
      self.pbImg = false;
    };
  }
  //#endregion

  //#region EDITAR SUSTENTO
  private inicializarEditarSustento() {
    if (!(this.estadoInicial === 2)) return;

    this.delay(250).then(() => {
      this.opcionesFb = this.opcionesEditarFb;
      this.animacionFb = "active";
      this.estadoFb = this.estadosFb.editar;
    });

    this.photoRespaldo = this.urlImagen;
  }

  private loadImagenEditarSustento(file: any) {
    if (!(this.estadoInicial === 2)) return;

    this.pbImg = true;
    this.opcionesFb = [];
    this.delay(250).then(() => {
      this.opcionesFb = this.opcionesEdicionGuardarCancelar;
      this.estadoFb = this.estadosFb.guardarEdicion;
    });

    this.fileImage = file;
    const self = this;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      self.photoRespaldo = self.urlImagen;
      self.urlImagen = reader.result;
      self.pbImg = false;
    };
  }

  private async editarFotoAccionFb() {
    if (navigator.geolocation) {
      this.pbImg = true;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          await this.editarsustentoDelPunto(pos);

          this.opcionesFb = [];
          this.delay(250).then(() => {
            this.opcionesFb = this.opcionesEditarFb;
            this.estadoFb = this.estadosFb.editar;
          });
          this.pbImg = false;
        },
        (error) => {
          this._snackBar.open(error.message, "Cerrar", {
            horizontalPosition: "right",
            verticalPosition: "top",
          });
          this.pbImg = false;
        },
        {
          enableHighAccuracy: true,
        }
      );
    } else {
      this._snackBar.open("Geolocalización no soportada.", "Cerrar", {
        horizontalPosition: "right",
        verticalPosition: "top",
      });
    }
  }

  async editarsustentoDelPunto(pos: any): Promise<boolean> {
    const nIdGestion =
      this.estadoSlideToggleGestionForm.controls.nIdGestion.value;
    const sFile = this.urlImagen as string;
    const iFile = sFile.indexOf(",") + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);
    const UploadImage: any = await this.service._uploadFile(
      sFileSustento,
      5,
      "AsistenciaPersonal",
      "image/jpeg",
      this.url
    );

    const aParam = [];
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

    aParam.push("T1¡nIdRuta!" + this.nIdRuta);
    aParam.push("T1¡nIdUser!" + uid);
    aParam.push("T1¡dtReg!GETDATE()");
    aParam.push("T1¡nIdEstado!" + 2327);
    aParam.push("T1¡sTexto!" + "Edicion de sustento");

    aParam.push("W2¡nIdRuta!" + this.nIdRuta);
    aParam.push("S2¡nIdEstado!2327");
    aParam.push("S2¡sFileSustento!" + UploadImage.fileUrl);
    aParam.push("S2¡nIdGestion!" + nIdGestion);

    const result = await this.service._crudAP(3, aParam, this.url);

    Swal.fire("Guardado", "Se guardo correctamente.", "success");

    this.pbImg = false;

    this.nIdGestion = nIdGestion;
    this.estadoSlideToggleGestionForm.controls.gestion.patchValue(
      nIdGestion > 0
    );
    this.estadoSlideToggleGestionForm.controls.gestion.disable();
    this.estadoSlideToggleGestionForm.controls.nIdGestion.disable();
    this.estadoButtonSheet = false;

    const resp: boolean = result[0].split("!")[0] === "nIdHER";
    this.recargarDataCerrarModal = resp;

    return resp;
  }
  //#endregion

  //#region MODAL
  public cerrarModal() {
    const oReturn = new Object();
    oReturn["recargar"] = this.recargarDataCerrarModal;
    this.activeModal.close(oReturn);
  }
  //#endregion

  //#region BUTTON SHEET
  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetPuntosAsistencia, {
      data: {
        fecha: this.dFechaAsistencia,
        nIdPersonal: this.nIdPersonal,
        nIdRuta: this.nIdRuta,
      },
    });
  }

  public obtenerCantidadSeleccionados(): number {
    return listaPuntoAsistenciaSheet.length;
  }
  //#endregion
}

@Component({
  selector: "bottom-sheet-puntos-asistencia",
  templateUrl: "bottom-sheet-puntos-asistencia.html",
  styleUrls: ["./bottom-sheet-puntos-asistencia.css"],
  animations: [comercialAnimations],
})
export class BottomSheetPuntosAsistencia implements OnInit {
  //#region GENERAL
  url: string = "";
  dFecha: Date = new Date();
  nIdPersonal: number = 0;
  nIdRuta: number = 0;
  //#endregion

  //#region TABLA DE PUNTOS DE ASISTENCIA
  puntosaDC: string[] = ["select", "sDireccion"];
  puntosaDS: MatTableDataSource<IJustificacionPuntoAsistencia> =
    new MatTableDataSource([]);
  selection = new SelectionModel<IJustificacionPuntoAsistencia>(true, []);
  @ViewChild("puntosaP", { static: true }) puntosaP: MatPaginator;
  //#endregion

  constructor(
    @Inject("BASE_URL") baseUrl: string,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: { fecha: Date; nIdPersonal: number; nIdRuta: number },
    private _bottomSheetRef: MatBottomSheetRef<BottomSheetPuntosAsistencia>,
    public service: AsistenciapService
  ) {
    this.url = baseUrl;
    this.dFecha = data.fecha;
    this.nIdPersonal = data.nIdPersonal;
    this.nIdRuta = data.nIdRuta;
  }
  async ngOnInit(): Promise<void> {
    //listaPuntoAsistenciaSheet = [];

    await this.puntosAsistenciaServicio();
    this.selection.changed.subscribe((valor) => {
      listaPuntoAsistenciaSheet = valor.source.selected;
    });

    this.puntosaDS.data.forEach((row) => {
      if (listaPuntoAsistenciaSheet.some((v) => v.nIdRuta === row.nIdRuta)) {
        this.selection.select(row);
      }
    });
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  //#region PUNTOS DE ASISTENCIA

  private async puntosAsistenciaServicio() {
    const sFecha = moment(this.dFecha).format("MM/DD/YYYY");
    const params = [];
    params.push("0¡DPP.nIdPersonal!" + this.nIdPersonal);
    params.push("6¡ASISTENCIA.dFecha!" + sFecha);

    var data: IJustificacionPuntoAsistencia[] = await this.service._loadSP(
      4,
      params,
      this.url
    );
    data = data.filter((v) => v.nIdRuta !== this.nIdRuta);
    this.puntosaDS = new MatTableDataSource(data);
    this.puntosaDS.paginator = this.puntosaP;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.puntosaDS.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.puntosaDS.data.forEach((row) => this.selection.select(row));
  }

  capitalizeFirstLetter(data: string) {
    return data.charAt(0).toUpperCase() + data.slice(1);
  }
  //#endregion
}
