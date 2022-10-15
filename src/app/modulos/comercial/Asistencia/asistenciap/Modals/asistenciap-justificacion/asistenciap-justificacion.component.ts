import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { SelectionModel } from "@angular/cdk/collections";
import { comercialAnimations } from "src/app/modulos/comercial/Animations/comercial.animations";
import { IJustificacionPuntoAsistencia } from "src/app/modulos/comercial/requerimiento/model/Igestionap";
import { IJustificacionCombo } from "../../interface";
import { AsistenciapService } from "../../asistenciap.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-asistenciap-justificacion",
  templateUrl: "./asistenciap-justificacion.component.html",
  styleUrls: [
    "./asistenciap-justificacion.component.css",
    "./asistenciap-justificacion.component.scss",
  ],
  animations: [comercialAnimations],
})
export class AsistenciapJustificacionComponent implements OnInit {
  //#region INPUT
  @Input() nIdPersonal: number = 0;
  @Input() sFecha: string = "";
  @Input() justificacion: IJustificacionCombo = {
    nIdJustificacion: 0,
    sJustificacion: null,
  };
  //#endregion

  //#region GENERAL
  url: string = "";
  //#endregion

  //#region FB
  public animacionFb: string = "inactive";
  public opcionesGuardarCancelarFb: any[] = [
    { icon: "save", tool: "Guardar", disabled: false },
    { icon: "close", tool: "Cancelar", disabled: false },
  ];
  public opcionesFb: any[] = this.opcionesGuardarCancelarFb;
  //#endregion

  //#region PUNTOS DE ASISTENCIA
  puntosaDC: string[] = [
    "action",
    "titulo",
    "sDepartamento",
    "sProvincia",
    "sDistrito",
  ];
  puntosaDS: MatTableDataSource<IJustificacionPuntoAsistencia> =
    new MatTableDataSource([]);
  selection = new SelectionModel<IJustificacionPuntoAsistencia>(true, []);
  @ViewChild("puntosaP", { static: true }) puntosaP: MatPaginator;
  //#endregion

  constructor(
    @Inject("BASE_URL") baseUrl: string,
    private formBuilder: FormBuilder,
    private spi: NgxSpinnerService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private _snackBar: MatSnackBar,
    public service: AsistenciapService
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_asistenciap_justificacion");
    await this.puntosAsistenciaServicio();
    this.spi.hide("spi_asistenciap_justificacion");
  }

  //#region GENERAL
  //#endregion

  //#region FB
  public clickGrupoFb() {
    if (this.animacionFb === "inactive") {
      this.animacionFb = "active";
      this.opcionesFb = this.opcionesGuardarCancelarFb;
    } else {
      this.animacionFb = "inactive";
      this.opcionesFb = [];
    }
  }

  public async clickOpcionFb(indice: number) {
    if (indice === 0) {
      await this.guardarJustificacion();
      return;
    }

    if (indice === 1) {
      this.cerrarModal();
    }
  }

  //#endregion

  //#region PUNTOS DE ASISTENCIA

  private async guardarJustificacion() {
    if (
      !(await this._swalConfirm(
        "Justificar",
        "¿Estas seguro de justificar los puntos de asistencia?",
        "Aceptar"
      ))
    ) {
      return;
    }

    this.spi.show("spi_asistenciap_justificacion");
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;
    var params = [];

    await Promise.all(
      this.selection.selected.map(async (item) => {
        params = [];
        params.push("T1¡nIdRuta!" + item.nIdRuta);
        params.push("T1¡nIdUser!" + uid);
        params.push("T1¡dtReg!GETDATE()");
        params.push("T1¡nIdEstado!" + 2327);
        params.push("T1¡sTexto!" + "Cambiando a Pendiente");

        params.push("W2¡nIdRuta!" + item.nIdRuta);
        params.push(
          "S2¡nIdJustificacion!" + this.justificacion.nIdJustificacion
        );
        params.push("S2¡nIdEstado!2327");

        await this.service._crudAP(3, params, this.url);
      })
    );

    if (this.selection.selected.length > 0) {
      const ruta = this.selection.selected[0];
      const params2 = [];
      params2.push("T1¡nIdAsistencia!" + ruta.nIdAsistencia);
      params2.push("T1¡nIdDia!2335");
      const resul2 = await this.service._crudAP(2, params2, this.url);
    }
    this.spi.hide("spi_asistenciap_justificacion");

    Swal.fire("Justificacion", "La justificacion fue creada", "success");

    const oReturn = new Object();
    oReturn["recargar"] = true;
    this.activeModal.close(oReturn);
  }

  private async puntosAsistenciaServicio() {
    const params = [];
    params.push("0¡DPP.nIdPersonal!" + this.nIdPersonal);
    params.push("6¡ASISTENCIA.dFecha!" + this.sFecha);

    const data: IJustificacionPuntoAsistencia[] = await this.service._loadSP(
      4,
      params,
      this.url
    );

    if (data.length === 0) {
      this.opcionesGuardarCancelarFb[0].disabled = true;
    }

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

  //#region MODAL
  public cerrarModal() {
    const oReturn = new Object();
    //oReturn["recargar"] = this.recargarDataCerrarModal;
    this.activeModal.close(oReturn);
  }
  //#endregion

  //#region ALERTS

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
