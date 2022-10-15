import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DAYS_OF_WEEK } from "angular-calendar";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { Subject } from "rxjs";
import { comercialAnimations } from "src/app/modulos/comercial/Animations/comercial.animations";

@Component({
  selector: "app-asistenciap-planning",
  templateUrl: "./asistenciap-planning.component.html",
  styleUrls: [
    "./asistenciap-planning.component.css",
    "./asistenciap-planning.component.scss",
  ],
  animations: [comercialAnimations],
})
export class AsistenciapPlanningComponent implements OnInit {
  //#region Input
  @Input() dFecha: Date;
  //#endregion

  //#region Fb
  public animacionFb: string = "active";
  public opcionesCambioCancelarFb: any[] = [
    { icon: "published_with_changes", tool: "Aceptar cambio" },
    { icon: "cancel", tool: "Cancelar" },
  ];
  public opcionesFb: any[] = this.opcionesCambioCancelarFb;
  //#endregion

  //#region Calendario
  locale = "es";
  refresh: Subject<any> = new Subject();
  events = [];
  iEvent = -1;
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  viewDate: Date = new Date();
  clickedDate: Date = new Date();
  //#endregion

  constructor(
    private formBuilder: FormBuilder,
    private spi: NgxSpinnerService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.spi.show("spi_main_controlpa");
    this.clickedDate = this.dFecha;
    this.events.push({
      start: this.clickedDate,
      end: this.clickedDate,
      title: "Día seleccionado",
      allDay: true,
      draggable: false,
    });
    this.spi.hide("spi_main_controlpa");
  }

  //#region FB
  public clickGrupoFb() {
    if (this.animacionFb === "inactive") {
      this.animacionFb = "active";
      this.opcionesFb = this.opcionesCambioCancelarFb;
    } else {
      this.animacionFb = "inactive";
      this.opcionesFb = [];
    }
  }

  public async clickOpcionFb(indice: number) {
    if (indice === 0) {
      const aParam = [];
      const dFecha = moment(this.clickedDate).format("MM/DD/YYYY");
      const oReturn = new Object();
      oReturn["recargar"] = "cambio_aceptado";
      oReturn["dFecha"] = dFecha;
      this.activeModal.close(oReturn);
      return;
    }

    if (indice === 1) {
      this.cerrarModal();
    }
  }
  //#endregion

  //#region Calendario
  dayClick(event?, dFecha?: Date) {
    if (event === undefined) {
      this.clickedDate = dFecha;
    } else {
      this.clickedDate = event.day.date;
      const sClickDaye = moment(this.clickedDate).locale("es").format("LL");
      this._snackBar.open("Seleccionaste : " + sClickDaye, "Cerrar", {
        duration: 2000,
        horizontalPosition: "right",
        verticalPosition: "top",
      });
    }
    const diffDays = moment(this.clickedDate).diff(new Date(), "days");

    this.events = [];
    this.events.push({
      start: this.clickedDate,
      end: this.clickedDate,
      title: "Día seleccionado",
      allDay: true,
      draggable: false,
    });
  }
  //#endregion

  //#region MODAL
  public cerrarModal() {
    const oReturn = new Object();
    oReturn["recargar"] = false;
    this.activeModal.close(oReturn);
  }
  //#endregion
}
