import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { adminpAnimations } from "src/app/modulos/egy-humana/JefaturaAP/Animations/adminp.animations";
import { GestionpService } from "../../services/gestionp.service";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";

import { nsGestionPlanning } from "../../../gestionap/Models/nsGestionPlanning";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import {
  DAYS_OF_WEEK,
  CalendarEvent,
  CalendarMonthViewDay,
} from "angular-calendar";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DeviceDetectorService } from "ngx-device-detector";
import * as moment from "moment";
import Swal from "sweetalert2";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatStepper } from "@angular/material/stepper";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";

const colors: any = {
  pink: {
    primary: "#ff4081b0",
    secondary: "#FAE3E3",
  },
  blue: {
    primary: "#1e90ffd1",
    secondary: "#D1E8FF",
  },
};

@Component({
  selector: "app-gestionp-detail",
  templateUrl: "./gestionp-detail.component.html",
  styleUrls: [
    "./gestionp-detail.component.css",
    "./gestionp-detail.component.scss",
  ],
  animations: [adminpAnimations],
  providers: [GestionpService],
})
export class GestionpDetailComponent implements OnInit {
  //#region Variables

  @Input() fromParent;

  selectedMonthViewDay: CalendarMonthViewDay;
  selectedDays: any = [];

  // Tabla
  TableDt: MatTableDataSource<nsGestionPlanning.E_Lista_Detalle_Persona> =
    new MatTableDataSource([]);
  @ViewChild("pagExpanded", { static: false }) paginator: MatPaginator;
  @ViewChild("stepperExpand", { static: false }) stepper: MatStepper;
  MainDC: string[] = [
    "sNombreCompleto",
    "nIdPlla",
    "sTDoc",
    "sDocumento",
    "sSucursal",
    "sHoraIni",
    "sHoraFin",
    "sCanal",
    "sPerfil",
    "nDias",
    "more",
  ];
  lista_persona: nsGestionPlanning.E_Lista_Detalle_Persona[] = [];
  expandedMore: nsGestionPlanning.E_Lista_Detalle_Persona;

  modoEscritorio: boolean = this.deviceService.isDesktop();

  tgSeleccion = true;
  tadaIncentivo = "inactive";
  toggleIncentivo = 0;
  tsIncentivo = "active";
  abIncentivo = [];
  abPerso = [];
  abExpand = [];
  tsPerso = "inactive";
  tsExpand = "inactive";

  fbView = [
    { icon: "cancel", tool: "Cancelar", dis: false },
    { icon: "save", tool: "Guardar", dis: false },
  ];

  fbPerso = [
    { icon: "person_add", tool: "Añadir" },
    { icon: "cleaning_services", tool: "Limpiar" },
  ];

  fbExpand = [
    { icon: "home", tool: "Inicio" },
    { icon: "calendar_today", tool: "Calendario Laboral" },
    { icon: "cleaning_services", tool: "Descanso" },
    { icon: "cleaning_services", tool: "Horario laboral" },
  ];

  centro: nsGestionPlanning.ICentro_Costo;
  person: nsGestionPlanning.ILista_Persona[] = [];
  person2: nsGestionPlanning.ILista_Persona[] = [];
  categoria: nsGestionPlanning.ILista_Categoria[] = [];
  canal: nsGestionPlanning.ILista_Canal[] = [];

  // Fecha
  viewDate: Date = new Date();
  locale = "es";
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [
    {
      start: new Date(),
      end: new Date(),
      title: "sss",
    },
  ];

  // Segunda Fecha
  viewDateExpan: Date = new Date();
  weekStartsOnExpand: number = DAYS_OF_WEEK.MONDAY;
  weekendDaysExpand: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  refreshExpand: Subject<any> = new Subject();
  eventsExpand: CalendarEvent[] = [
    {
      start: new Date(),
      end: new Date(),
      title: "sss",
    },
  ];

  // Calendario
  eventCalendarSelecion: CalendarEvent[] = [];

  // Horario
  cboIngreso: nsGestionPlanning.E_Lista_Horario[] = [];
  cboSalida: nsGestionPlanning.E_Lista_Horario[] = [];

  havePerson: boolean = false;

  lista_datos: any[];
  listaPerson2:  any[] = [];

  // Formularios
  formPresupuesto: FormGroup;
  formInfoPerso: FormGroup;
  formDocumento: FormGroup;
  formFecha: FormGroup;
  formDetalle: FormGroup;
  formCalendar: FormGroup;
  formInfoResponsable: FormGroup;
  formAutoMatico: FormGroup;

  // Variables de uso Temporal
  cantidad_dias: number = 0;
  titulo: string = "Información del planning :";
  boolAutomatico: boolean = true;
  boolToggle: boolean = true;
  initFormPresupuesto(): void {
    this.formPresupuesto = this._fb.group({
      nIdPptos: 0,
      nPptos: 0,
      sCampania: "",
      sCliente: "",
    });
  }

  initFormDocumento(): void {
    this.formDocumento = this._fb.group({
      sTipo: "",
      documento: "",
    });
  }

  initFormPerso(): void {
    this.formInfoPerso = this._fb.group({
      cliente: ["", [Validators.required]],
      Perfil: ["", [Validators.required]],
      Canal: ["", [Validators.required]],
      Ingreso: ["", [Validators.required]],
      Salida: ["", [Validators.required]],
    });
  }

  initFormFecha(): void {
    this.formFecha = this._fb.group({
      sFechaIni: [{ value: "" }, Validators.required],
      sFechaFin: [{ value: "" }, Validators.required],
    });
  }

  initFormDetalle(): void {
    this.formDetalle = this._fb.group({
      ciudad: "",
      Ingreso: "",
      Cese: "",
    });
  }

  initFormCalendar(): void {
    this.formCalendar = this._fb.group({
      tiposeleccion: ["", [Validators.required]],
      cantDias: [0, [Validators.required]],
    });
  }

  initFormResponsable(): void {
    this.formInfoResponsable = this._fb.group({
      sNombreCompleto: 'Angel Flores',
      sTipo: 'DNI',
      sDocumento: '60648214',
      sCiudad: 'Lima',
      sIngreso: '02/02/20',
      sCese: '' ,
    });
  }

  initFormAutomatico(): void {
    this.formAutoMatico = this._fb.group({
      auto: [0, [Validators.required]],
      Ingreso: [{ value: '', disabled: true }, [Validators.required]],
      Salida: [{ value: '', disabled: true }, [Validators.required]],
    });
  }

  //#endregion

  constructor(
    // @Inject(MAT_DIALOG_DATA) private data: any,
    //  public dialogRef: MatDialogRef<GestionpDetailComponent>,
    private deviceService: DeviceDetectorService,
    public activeModal: NgbActiveModal,
    public _service: GestionpService,
    private _fb: FormBuilder
  ) {
    this.initFormPresupuesto();
    this.initFormDocumento();
    this.initFormPerso();
    this.initFormFecha();
    this.initFormDetalle();
    this.initFormCalendar();
    this.initFormResponsable();
    this.initFormAutomatico();
  }

  ngOnInit() {
    this.centro = this.fromParent.centro;

    const listaPerson = this.fromParent.personal;
    const distinctPerson = [...new Set(listaPerson.map(x=>x.nIdPersonal))];
    listaPerson.forEach( x => {
      const val = this.listaPerson2.filter( a => a.nIdPersonal === x.nIdPersonal).length;
        if (val === 0) {
          this.listaPerson2.push(x);
        }
    });
    this.person = this.fromParent.personal;
    this.person2 = this.listaPerson2;
    this.getCentroCosto();
    this.getCategoria();
    this.getCanal();
    this.fnHorario(0);
    this.fnHorario(1);
  }

  fnHorario(val: number): void {
    let pParametro = [];
    pParametro.push(val);
    this._service
      ._ServicePlanning(10, pParametro)
      .then((res: nsGestionPlanning.E_Lista_Horario[]) => {
        if (val == 0) {
          this.cboIngreso = res;
        } else if (val == 1) {
          this.cboSalida = res;
        }
      });
  }

  getCategoria(): void {
    const category: nsGestionPlanning.ILista_Categoria[] = [];
    this.person.forEach((x) => {
      category.push({
        nCategoria: x.nCategoria,
        sCategoria: x.sCategoria,
      });
    });

    let unique = [];
    unique = category.filter((x) =>
      unique[x.nCategoria] ? false : (unique[x.nCategoria] = true)
    );
    unique.forEach((x) => {
      this.categoria.push(x);
    });
  }

  getCanal(): void {
    let persona: nsGestionPlanning.ILista_Canal[] = [];
    this.person.forEach((x) => {
      persona.push({
        nCanal: x.nCanal,
        sCanal: x.sCanal,
      });
    });

    let unique = [];
    unique = persona.filter((x) =>
      unique[x.nCanal] ? false : (unique[x.nCanal] = true)
    );
    unique.forEach((x) => {
      this.canal.push(x);
    });
  }

  getCentroCosto(): void {
    this.formPresupuesto.reset({
      nIdPptos: this.centro.nIdCentroCosto,
      nPptos: this.centro.sCodCC,
      sCampania: this.centro.sCentroCosto,
      sCliente: this.centro.sCliente,
    });
  }

  clickFlipCard() {
    let Infoper = this.formInfoPerso.value;
    let Iper = Infoper.cliente;
    console.log(Iper);
    if (Iper === null || Iper.value === "") {
      this.onToggleFab(1, 0);
    } else {
      this.tgSeleccion = this.tgSeleccion === true ? false : true;
      (function ($) {
        $("#card_inner2").toggleClass("is-flipped");
      })(jQuery);
    }
  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 0:
        stat = stat === -1 ? (this.abIncentivo.length > 0 ? 0 : 1) : stat;
        this.tsIncentivo = stat === 0 ? "inactive" : "active";
        this.abIncentivo = stat === 0 ? [] : this.fbView;
        break;
      case 1:
        stat = stat === -1 ? (this.abPerso.length > 0 ? 0 : 1) : stat;
        this.tsPerso = stat === 0 ? "inactive" : "active";
        this.abPerso = stat === 0 ? [] : this.fbPerso;
        break;
      case 2:
        stat = stat === -1 ? (this.abExpand.length > 0 ? 0 : 1) : stat;
        this.tsExpand = stat === 0 ? "inactive" : "active";
        this.abExpand = stat === 0 ? [] : this.fbExpand;
        break;
    }
  }

  async clickFab(opc: number, index: number) {
    switch (opc) {
      case 0:
        this.closemodal();
        break;
      case 1:
        switch (index) {
          case 0:
            this.addPerson();
            break;
          case 1:
            this.fnLimpiar(0);
            this.onToggleFab(1, 0);
            this.havePerson = false;
            break;
        }
        break;
      case 2:
        switch (index) {
          case 0:
            this.stepper.selectedIndex = 0;
            break;
          case 1:
            this.stepper.selectedIndex = 1;
            break;
          case 2:
            this.stepper.selectedIndex = 2;
            break;
          case 3:
            this.stepper.selectedIndex = 3;
            break;
        }
    }
  }

  addPerson() {
    let Infoper = this.formInfoPerso.value;
    console.log(this.formInfoPerso.value);
    console.log(this.formInfoPerso);
    if (this.formInfoPerso.invalid) {
      Swal.fire({
        icon: "info",
        title: "!Atencion!",
        text: "Falta ingresar datos del personal",
      });
      return Object.values(this.formInfoPerso.controls).forEach((controls) => {
        controls.markAllAsTouched();
      });
    }

    if (this.formFecha.invalid) {
      Swal.fire({
        icon: "info",
        title: "!Atencion!",
        text: "Falta ingresar fecha del planning",
      });
      return Object.values(this.formFecha.controls).forEach((controls) => {
        controls.markAllAsTouched();
      });
    }

    let fechaini = moment(this.formFecha.get("sFechaIni").value);
    let fechafin = moment(this.formFecha.get("sFechaFin").value);

    this.cantidad_dias = fechafin.diff(fechaini, "days");

    let persona: nsGestionPlanning.E_Lista_Detalle_Persona = {
      nIdPersonal: Infoper.cliente.nIdPersonal,
      sNombreCompleto: Infoper.cliente.sNombre,
      nIdPlla: Infoper.cliente.sCodPlla,
      sTDoc: Infoper.cliente.sTDoc,
      sDocumento: "string",
      sSucursal: Infoper.cliente.sSucursal,
      sHoraIni: Infoper.Ingreso,
      sHoraFin: Infoper.Salida,
      nCanal: Infoper.cliente.nCanal,
      sCanal: Infoper.cliente.sCanal,
      nIdCargo: Infoper.cliente.nCategoria,
      sPerfil: Infoper.cliente.sCategoria,
      nDias: this.cantidad_dias,
    };

    if (this.lista_persona.length > 0) {
      this.lista_persona.filter((x) => {
        console.log(x.nIdPersonal);
        console.log(persona.nIdPersonal);
        if (x.nIdPersonal === persona.nIdPersonal) {
          Swal.fire({
            icon: "info",
            title: "!Atencion!",
            text: "Ya ingreso esta persona",
          });
          return;
        } else {
          this.lista_persona.push(persona);
          this.TableDt = new MatTableDataSource(this.lista_persona);
          this.TableDt.paginator = this.paginator;
        }
      });
    } else {
      this.lista_persona.push(persona);
      this.TableDt = new MatTableDataSource(this.lista_persona);
      this.TableDt.paginator = this.paginator;
    }
  }

  closemodal(): void {
    this.activeModal.close();
  }

  getCliente(): void {
    let Infoper = this.formInfoPerso.value;
    let Iper = Infoper.cliente;

    if (Iper === null || Iper.value === "") {
      this.onToggleFab(1, 0);
      this.fnLimpiar(0);
      this.havePerson = false;
    } else {
      if (!this.havePerson) {
        this.onToggleFab(1, -1);
      }
      this.havePerson = true;
      this.formDocumento.controls.sTipo.setValue(Iper.sTDoc);
      //this.formDocumento.controls.documento.setValue(Iper.sDoc);
      this.formDetalle.controls.ciudad.setValue(Iper.sSucursal);
      this.formDetalle.controls.Ingreso.setValue(
        moment(Iper.sIngreso).format("MM/DD/YYYY")
      );
      this.formDetalle.controls.Cese.setValue("");
    }
  }

  fnLimpiar(op: number) {
    if (op === 0) {
      this.formDocumento.reset();
      this.formDetalle.reset();
      this.formInfoPerso.reset();

      if (!this.tgSeleccion) {
        this.tgSeleccion = this.tgSeleccion === true ? false : true;
        (function ($) {
          $("#card_inner2").toggleClass("is-flipped");
        })(jQuery);
      }
    } else {
      this.formDocumento.reset();
      this.formDetalle.reset();
      this.formInfoPerso.controls.Perfil.setValue("");
      this.formInfoPerso.controls.Canal.setValue("");
    }
  }

  async clickExpanded(row: nsGestionPlanning.E_Lista_Detalle_Persona) {
    if (this.expandedMore === row) {
      this.expandedMore = null;
      this.onToggleFab(2, 0);
      // Limpiar
    } else {
      this.expandedMore = row;
      this.onToggleFab(2, -1);
    }
  }

  changeSelected(event) {
    if (event.value === "Automatico") {
      const dFechIni = moment(this.formFecha.get("sFechaIni").value).toDate();
      const dFechFin = moment(this.formFecha.get("sFechaFin").value).toDate();
      this.eventCalendarSelecion = [];
      this.eventCalendarSelecion.push({
        start: dFechIni,
        end: dFechFin,
        color: colors.pink,
        title: "",
        allDay: true,
        draggable: false,
      });

      this.formCalendar.reset({
        tiposeleccion: "Automatico",
        cantDias: this.cantidad_dias,
      });
    } else {
      this.eventCalendarSelecion = [];
      this.formCalendar.reset({
        tiposeleccion: "Manual",
        cantDias: 0,
      });
    }
  }

  dayClicked(day: CalendarMonthViewDay): void {
    this.selectedMonthViewDay = day;
    const fecha = moment(this.selectedMonthViewDay.date);
    const events: CalendarEvent[] = [];

    const dFechIni = moment(this.formFecha.get("sFechaIni").value);
    const dFechFin = moment(this.formFecha.get("sFechaFin").value);

    if (fecha.isBetween(dFechIni, dFechFin)) {
      const selectedDateTime = this.selectedMonthViewDay.date.getTime();
      const dateIndex = this.selectedDays.findIndex(
        (selectedDay) => selectedDay.date.getTime() === selectedDateTime
      );

      console.log(dateIndex);

      this.selectedDays.push(this.selectedMonthViewDay);
      this.selectedDays.forEach((x) => {
        events.push({
          start: x.date,
          end: x.date,
          title: "Inicio : " + moment(x.date).format("DD/MM/YYYY"),
          allDay: true,
          draggable: false,
          cssClass: "cal-day-selected",
        });
      });

      this.eventCalendarSelecion = events;

      const dias = this.selectedDays.length;
      this.formCalendar.get("cantDias").setValue(dias);
    } else {
      Swal.fire(
        "Atencion",
        "Este dia esta fuera de la fecha del planning",
        "info"
      );
      return;
    }
  }
}
