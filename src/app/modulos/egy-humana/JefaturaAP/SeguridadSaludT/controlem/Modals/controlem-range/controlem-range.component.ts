import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatPaginator } from "@angular/material/paginator";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CalendarDateFormatter } from "angular-calendar";
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";

import { adminpAnimations } from "../../../../Animations/adminp.animations";
import { CustomDateFormatter } from "../../../../Config/configCalendar";
import { ControlemService } from "../../../../Services/controlem.service";
import CalendarioRangoRgCEM from "../../Utils/ControlemRange/CalendarioRango/CalendarioRangoRgCEM";
import FbRgCEM from "../../Utils/ControlemRange/FbRgCEM";
import InfoResponsableRgCEM from "../../Utils/ControlemRange/InformacionResponsable/InfoResponsableRgCEM";
import PersonalDelResponsableTablaRgCEM from "../../Utils/ControlemRange/PersonalDelResponsableTabla/PersonalDelResponsableTablaRgCEM";
import RangoFechasRgCEM from "../../Utils/ControlemRange/RangoFechas/RangoFechasRgCEM";
import ResponsableDataTablaRgCEM from "../../Utils/ControlemRange/ResponsablesTabla/ResponsableDataTablaRgCEM";

class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: "app-controlem-range",
  templateUrl: "./controlem-range.component.html",
  styleUrls: [
    "./controlem-range.component.css",
    "./controlem-range.component.scss",
  ],
  providers: [
    { provide: CalendarDateFormatter, useClass: CustomDateFormatter },
  ],
  animations: [adminpAnimations],
})
export class ControlemRangeComponent implements OnInit {
  @Input() nIdResponsable: number = 0;
  @Input() sFechaDevengueSeleccionado: string = "";

  matcher = new MyErrorStateMatcher();

  fb: FbRgCEM = new FbRgCEM(this);
  infoResp: InfoResponsableRgCEM = new InfoResponsableRgCEM(this);
  calendario: CalendarioRangoRgCEM = new CalendarioRangoRgCEM(this);
  nuevoRango: RangoFechasRgCEM = new RangoFechasRgCEM(this);

  @ViewChild("paginacionResponsablesTabla", { static: true })
  paginacionResponsablesTabla: MatPaginator;
  resposablesTabla: ResponsableDataTablaRgCEM = new ResponsableDataTablaRgCEM(
    this
  );

  @ViewChild("paginacionPersonalDelResponsableTabla", { static: true })
  paginacionPersonalDelResponsableTabla: MatPaginator;
  personalRespTabla: PersonalDelResponsableTablaRgCEM = new PersonalDelResponsableTablaRgCEM(
    this
  );

  panelControl: boolean = true;

  constructor(
    public service: ControlemService,
    public activeModal: NgbActiveModal,
    public spi: NgxSpinnerService,
    public snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_reject");
    await this.infoResp.cargarInformacionServicio();
    await this.personalRespTabla.cargarDataServicio();
    await this.calendario.misRangosServicio();
    this.spi.hide("spi_reject");
  }

  public closeModal(estado: boolean) {
    const oReturn = new Object();
    oReturn["status"] = estado;
    this.activeModal.close(oReturn);
  }
}
