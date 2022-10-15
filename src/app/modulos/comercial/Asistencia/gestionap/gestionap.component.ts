import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";

import { CustomDateFormatter } from "./configCalendar";
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarMonthViewDay,
  CalendarView,
  DAYS_OF_WEEK,
} from "angular-calendar";
import { gestionapAnimations } from "./gestionap.animations";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import {
  IAsistenciaPersonalDataBruta,
  IEstadoCombo,
  IInfoPersonal,
  IPlanillaCombo,
  IPlanning,
  IPuntosA,
} from "../../requerimiento/model/Igestionap";
import { GestionapService } from "./gestionap.service";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import {
  AppDateAdapter,
  APP_DATE_FORMATS,
} from "../../../../shared/services/AppDateAdapter";
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as moment from "moment";
import { MatExpansionPanel } from "@angular/material/expansion";
import Swal from "sweetalert2";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { GestionapPlanningComponent } from "./Modals/gestionap-planning/gestionap-planning.component";
import { startOfDay } from "date-fns";
import { param } from "jquery";

// Utilizar javascript [1]
declare var jQuery: any;

@Component({
  selector: "app-gestionap",
  templateUrl: "./gestionap.component.html",
  styleUrls: ["./gestionap.component.css", "gestionap.component.scss"],
  providers: [
    GestionapService,
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: CalendarDateFormatter, useClass: CustomDateFormatter },
  ],
  animations: [gestionapAnimations],
})
export class GestionapComponent implements OnInit {
  //#region GENERAL
  url: string;
  //#endregion

  //#region MODAL
  private ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };
  //#endregion

  //#region FB
  fbMain = [
    { icon: "groups", tool: "Cambiar responsable" },
    { icon: "history", tool: "Histórico ( Ex - miembros )" },
  ];
  abMain = [];
  tsMain = "inactive";
  ifMain = true;

  fbCompare = [
    { icon: "check", tool: "Aprobar" },
    { icon: "comment_bank", tool: "Desestimar" },
  ];

  fbCompare2 = [
    { icon: "save", tool: "Guardar" },
    { icon: "cancel", tool: "Cancelar" },
  ];
  abCompare = [];
  tsCompare = "inactive";
  //#endregion

  //#region INFO DE RESPONSABLE
  formResponsable: FormGroup = this.fb.group({
    nombres: [{ value: null, disabled: true }],
  });
  //#endregion

  //#region CALENDARIO
  colors: any = {
    red: {
      primary: "#ad2121",
      secondary: "#ffa3a3",
    },
    green: {
      primary: "#0ba800",
      secondary: "#95ff5c",
    },
    gray: {
      primary: "#686868",
      secondary: "#a9a9a9",
    },
    yellow: {
      primary: "#ffcf03",
      secondary: "#ffcf0357",
    },
  };

  locale = "es";
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [
    {
      id: 0,
      start: new Date(),
      end: new Date(),
      title: "Dia seleccionado",
      color: this.colors.gray,
    },
  ];
  iEvent = -1;
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  viewDate: Date = new Date();
  clickedDate: Date = new Date();
  clickedViewDay: CalendarMonthViewDay = null;
  view: CalendarView = CalendarView.Month;
  //#endregion

  //#region TABLA DE PERSONAL
  dataPersonal: IAsistenciaPersonalDataBruta[] = [];
  listaDC: string[] = [
    "action",
    "sNombres",
    "sCodPlla",
    "sTipo",
    "sDocumento",
    "dFechIni",
  ];
  listaDS: MatTableDataSource<IPlanning> = new MatTableDataSource([]);
  @ViewChild("listaP", { static: true }) listaP: MatPaginator;
  //#endregion

  //#region FILTRO
  aFiltro = null;
  bFiltro = null;
  cFiltro = null;
  dataModelFiltro: any = {
    nombresDocumento: null,
    sCodPlannilla: null,
    nIdEstado: null,
  };
  dataFiltro: IAsistenciaPersonalDataBruta[] = [];
  filtroForm = this.fb.group({
    nombresDocumento: null,
    sCodPlannilla: null,
    nIdEstado: null,
  });

  comboPlanilla: IPlanillaCombo[] = [];
  comboEstado: IEstadoCombo[] = [];

  nIdResponsable = null;
  //#endregion

  constructor(
    private fb: FormBuilder,
    public service: GestionapService,
    @Inject("BASE_URL") baseUrl: string,
    private spi: NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private modalService: NgbModal
  ) {
    // SERVICE GET && POST
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("gestionap_main");
    await this.planillaServicio();
    await this.estadoServicio();
    await this.formResponsableServicio();
    await this.dataAsistenciaServicio(this.nIdResponsable);
    this.inicializacionCalendario();
    this.spi.hide("gestionap_main");
  }

  //#region GENERAL
  public async dataAsistenciaServicio(idResponsable: number) {
    const params = [];
    params.push("0¡PLANNING.nIdResp!" + idResponsable.toString());
    this.dataPersonal = await this.service._loadSP(2, params, this.url);
  }
  //#endregion

  //#region FB
  onToggleFab() {
    if (this.tsMain === "inactive") {
      this.tsMain = "active";
      this.abMain = this.fbMain;
    } else {
      this.tsMain = "inactive";
      this.abMain = [];
    }
  }
  //#endregion

  //#region FILTRO
  private async estadoServicio() {
    this.comboEstado = [
      {
        nIdEstado: 1,
        sDesc: "Sin asistencia",
      },
      {
        nIdEstado: 2,
        sDesc: "Incompleto",
      },
      {
        nIdEstado: 3,
        sDesc: "Pendiente",
      },
      {
        nIdEstado: 4,
        sDesc: "Revisado",
      },
    ];
  }

  private async planillaServicio() {
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));

    const params = [];
    params.push("0¡nIdEmp!" + nIdEmp);
    params.push("0¡bEstado!1");
    this.comboPlanilla = await this.service._loadSP(3, params, this.url);
  }

  public filtrar() {
    this.dataFiltro = Object.assign(this.dataFiltro, this.dataPersonal);
    this.dataModelFiltro = this.filtroForm.value;

    this.dataFiltro = this.dataFiltro.filter((item) => {
      this.aFiltro =
        !this.dataModelFiltro.nombresDocumento ||
        item.sNombres
          .toLocaleLowerCase()
          .includes(
            this.dataModelFiltro.nombresDocumento.toString().toLocaleLowerCase()
          );

      this.bFiltro =
        !this.dataModelFiltro.sCodPlannilla ||
        this.dataModelFiltro.sCodPlannilla === item.sCodPlla;

      this.cFiltro =
        !this.dataModelFiltro.nIdEstado ||
        this.calcularEstado(
          item,
          this.dataModelFiltro.nIdEstado,
          this.dataFiltro
        );

      return this.aFiltro && this.bFiltro && this.cFiltro;
    });

    this.cambiarDataTablaPersonalPorFecha(this.dataFiltro, this.clickedDate);
    this.generandoEventosCalendario(this.dataFiltro);
  }

  private calcularEstado(
    item: IAsistenciaPersonalDataBruta,
    nIdEstadoSeleccionado: number,
    data: IAsistenciaPersonalDataBruta[]
  ): boolean {
    //Sin asistencia: Solo los que tienen estado planeamiento 2366
    if (nIdEstadoSeleccionado === 1) {
      return item.nIdDia === 2366;
    }

    // Incompleto: cuando tiene justificacion
    if (nIdEstadoSeleccionado === 2) {
      var data2 = data.filter((v) => v.nIdPersonal === item.nIdPersonal);
      var a = data2.some(
        (v) => v.sFileSustento !== null || v.nIdJustificacion !== 0
      );
      var b = data2.some(
        (v) => v.sFileSustento === null && v.nIdJustificacion === 0
      );
      return a && b;
    }

    // Pendiente : Personas que faltan revisar, se enctran en estado pendiente 2327
    if (nIdEstadoSeleccionado === 3) {
      return item.nIdEstado === 2327 || item.nIdEstado === 0;
    }

    // Revisado : Personas ya revisadas
    if (nIdEstadoSeleccionado === 4) {
      return item.nIdEstado !== 2327 && item.nIdEstado !== 0;
    }

    return true;
  }
  //#endregion

  //#region INFO RESPONSABLE
  private async formResponsableServicio() {
    const user = localStorage.getItem("currentUser");
    const uid = JSON.parse(window.atob(user.split(".")[1])).uid;
    const params = [];
    params.push("0¡nCodUser!" + uid);
    const data: IInfoPersonal = await this.service._loadSP(1, params, this.url);

    this.formResponsable.patchValue({
      nombres: data.sNombres,
    });

    this.nIdResponsable = data.nIdPersonal;
  }
  //#endregion

  //#region CALENDARIO
  private inicializacionCalendario() {
    this.cambiarDataTablaPersonalPorFecha(this.dataPersonal, new Date());
    this.generandoEventosCalendario(this.dataPersonal);
  }

  private generandoEventosCalendario(
    dataPersonal: IAsistenciaPersonalDataBruta[]
  ) {
    const data = dataPersonal;
    var listaFechas: Date[] = [];
    data.forEach((v) => {
      if (!listaFechas.some((f) => f === v.dFecha)) {
        listaFechas.push(v.dFecha);
      }
    });

    this.events = [];
    listaFechas.forEach((v) => {
      const tipo = this.determinarColorEstadoEventoCalendario(data, v);
      this.events = [
        ...this.events,
        {
          id: 1,
          start: startOfDay(new Date(v)),
          end: startOfDay(new Date(v)),
          title: tipo ? "Todos los puntos revisados" : "Puntos por revisar",
          color: tipo ? this.colors.green : this.colors.yellow,
          allDay: true,
          draggable: false,
        },
      ];
    });
  }

  private determinarColorEstadoEventoCalendario(
    data: IAsistenciaPersonalDataBruta[],
    fecha: Date
  ): boolean {
    var grupo = data.filter((v) => v.dFecha === fecha);
    var color = this.colors.green;
    var tipo = true;
    grupo.forEach((v) => {
      if (
        v.nIdEstado !== 2328 &&
        v.nIdEstado !== 2329 &&
        v.nIdEstado !== 2330 &&
        v.nIdEstado !== 2331
      ) {
        color = this.colors.yellow;
        tipo = false;
      }
    });

    return tipo;
  }

  public diaSeleccionado(day: CalendarMonthViewDay) {
    this.clickedDate = day.date;
    this.cambiarDataTablaPersonalPorFecha(this.dataPersonal, day.date);
    //this.viewDate = day.date;
    //this.events[0].start = day.date;
    //this.events[0].end = day.date;
    //this.refreshView();

    day.cssClass = "cal-day-selected";

    if (this.clickedViewDay !== null) {
      delete this.clickedViewDay.cssClass;
    }

    this.clickedViewDay = day;
  }

  refreshView(): void {
    this.refresh.next();
  }
  //#endregion

  //#region TABLA DE PERSONAL
  public async cambiarDataTablaPersonalPorFecha(
    dataPersonal: IAsistenciaPersonalDataBruta[],
    fecha: Date
  ) {
    const sFecha = moment(fecha).format("DD/MM/YYYY");
    var personal: IPlanning[] = [];
    dataPersonal.forEach((item) => {
      if (sFecha === moment(item.dFecha).format("DD/MM/YYYY")) {
        if (!personal.some((v) => v.nIdPersonal === item.nIdPersonal)) {
          personal.push({
            nIdPlanning: item.nIdPlanning,
            dFecha: item.dFecha,
            nIdPersonal: item.nIdPersonal,
            sNombres: item.sNombres,
            sCodPlla: item.sCodPlla,
            sTipo: item.sAbrev,
            sDocumento: item.sDocumento,
            dFechIni: item.dFechIni,
            sEstado: item.sRutaEstado,
          });
        }
      }
    });
    this.listaDS = new MatTableDataSource(personal);
    this.listaDS.paginator = this.listaP;
  }

  public verPuntos(data: IPlanning) {
    this.ngbModalOptions.size = "lg";
    const modal = this.modalService.open(
      GestionapPlanningComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.nIdPersonal = data.nIdPersonal;
    modal.componentInstance.dFecha = data.dFecha;

    modal.result.then(async (result) => {
      if (result.recargar) {
        this.spi.show("gestionap_main");
        await this.dataAsistenciaServicio(this.nIdResponsable);
        await this.cambiarDataTablaPersonalPorFecha(
          this.dataPersonal,
          this.clickedDate
        );
        await this.generandoEventosCalendario(this.dataPersonal);
        this.spi.hide("gestionap_main");
      }
    });
  }
  //#endregion
}
