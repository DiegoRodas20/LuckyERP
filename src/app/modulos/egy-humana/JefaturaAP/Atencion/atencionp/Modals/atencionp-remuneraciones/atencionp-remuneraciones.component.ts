import { AttrAst } from "@angular/compiler";
import { Component, Input, OnInit, Type, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal, NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarView,
  DAYS_OF_WEEK,
} from "angular-calendar";
import * as moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { Subject } from "rxjs";
import { adminpAnimations } from "../../../../Animations/adminp.animations";
import { CustomDateFormatter } from "../../../../Config/configCalendar";
import { nsAtencionp } from "../../../../Model/Iatencionp";
import { AtencionpService } from "../../../../Services/atencionp.service";
import { AtencionpDescuentosComponent } from "../atencionp-descuentos/atencionp-descuentos.component";

// Modals
const MODALS: { [name: string]: Type<any> } = {
  descuentos: AtencionpDescuentosComponent
};

const colors: any = {
  pink: {
    primary: "#F5A9A9",
    secondary: "#FAE3E3",
  },
  blue: {
    primary: "#58ACFA",
    secondary: "#D1E8FF",
  },
  red: {
    primary: "#F78181",
    secondary: "#FAAC58",
  },
  green: {
    primary: "#2EFE2E",
    secondary: "#0B610B",
  },
  yellow: {
    primary: "#F4FA58",
    secondary: "#FFFF00",
  },
  black: {
    primary: "#A4A4A4",
    secondary: "#000000",
  },
};

@Component({
  selector: "app-atencionp-remuneraciones",
  templateUrl: "./atencionp-remuneraciones.component.html",
  styleUrls: ["./atencionp-remuneraciones.component.css"],
  providers: [
    { provide: CalendarDateFormatter, useClass: CustomDateFormatter },
  ],
  animations: [adminpAnimations],
})
export class AtencionpRemuneracionesComponent implements OnInit {
  @Input() fromParent: { nIdPersonal: any; nIdEmp: any };

  expandedMore: nsAtencionp.IRemuneracionCabecera;
  //expandedMore: null;

  //#region Variables
  aParam = [];

  fbDetail = [{ icon: "info", tool: "Ir a descuentos", disabled: "false" }];
  abDetail = [];
  tsDetail = "inactive";

  // Mat Table
  searchBC: string[] = ["periodo", "tipo", "dias", "importe", "more"];
  searchBS: MatTableDataSource<nsAtencionp.IRemuneracionCabecera>;
  @ViewChild("searchB", { static: true }) searchB: MatPaginator;
  @ViewChild(MatSort, { static: true }) tableSortB: MatSort;

  // DetailDC: string[] = ["action", "sTipoSub", "dFechIni", "dFechFin"];
  // DetailDS: MatTableDataSource<nsAtencionp.IExpandedAsistencia>;

  ExpandedDC1: string[] = ["supervisor", "cliente", "dias"];
  ExpandedDS1: MatTableDataSource<nsAtencionp.IExpandedAsistencia> = new MatTableDataSource(
    []
  );

  ExpandedDC2: string[] = ["tipo", "fechaInicio", "fechaFin", "dias"];
  ExpandedDS2: MatTableDataSource<nsAtencionp.IExpandedSubsidio> = new MatTableDataSource(
    []
  );

  ExpandedDC3: string[] = ["responsable", "fechaInicio", "fechaFin", "dias"];
  ExpandedDS3: MatTableDataSource<nsAtencionp.IExpandedVacaciones> = new MatTableDataSource(
    []
  );

  ExpandedDC4: string[] = ["tipo", "campania", "cliente", "importe"];
  ExpandedDS4: MatTableDataSource<nsAtencionp.IExpandedKPI> = new MatTableDataSource(
    []
  );

  // FormGroup
  frmGrpPeriodoLaboral: FormGroup;
  frmGrpDevengue: FormGroup;
  frmGrpTipoRemuneracion: FormGroup;

  // Progress Bar
  pbRemuneraciones: boolean;

  // Calendar properties
  locale = "es";
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;
  events: CalendarEvent[] = [];

  // Calendar setup
  viewDate: Date = new Date();
  eventMain: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();

  subDate: Date = new Date();
  eventSub: CalendarEvent[] = [];
  refreshSub: Subject<any> = new Subject();

  data: nsAtencionp.IRemuneracion;
  dataRemuneracion: Array<nsAtencionp.IRemuneracionData> = new Array();
  dataRemuneracionCabecera: Array<nsAtencionp.IRemuneracionCabecera> = new Array();
  lstRemuneracionCabecera: Array<nsAtencionp.IRemuneracionCabecera> = new Array();

  // Listas de detalle de remuneraciones
  lstAsistenciaDetalle: Array<nsAtencionp.IExpandedAsistencia> = new Array();
  lstSubsidioDetalle: Array<nsAtencionp.IExpandedSubsidio> = new Array();
  lstVacacionesDetalle: Array<nsAtencionp.IExpandedVacaciones> = new Array();
  lstKPIDetalle: Array<nsAtencionp.IExpandedKPI> = new Array();

  lstAnios: Array<nsAtencionp.IAnio> = new Array();
  lstMeses: Array<nsAtencionp.IMes> = new Array();
  lstTiposPeriodo: Array<nsAtencionp.ITipoPeriodo> = new Array();
  lstTiposRemuneracion: Array<nsAtencionp.ITipoRemuneracion> = [
    { id: 0, descripcion: "Todos" },
    { id: 1, descripcion: "Asistencia" },
    { id: 2, descripcion: "Subsidio" },
    { id: 3, descripcion: "Vacaciones" },
    { id: 4, descripcion: "KPI" },
  ];

  lstPeriodosLaborales: Array<nsAtencionp.IPeriodoLaboral> = new Array();
  lstAniosUnicos: Array<nsAtencionp.IPeriodosCalculados> = new Array();

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  constructor(
    public activeModal: NgbActiveModal,
    private spi: NgxSpinnerService,
    private fb: FormBuilder,
    private atencionService: AtencionpService,
    private _modalService: NgbModal
  ) {
    //this.searchBS = new MatTableDataSource();

    this.onInitFrmGrpPeriodoLaboral();
    this.onInitFrmGrpDevengue();
    this.onInitFrmGrpTipoRemuneracion();

    this.expandedMore = null;

    this.delay(250).then((any) => {
      this.tsDetail = "active";
      this.abDetail = this.fbDetail;
    });
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_remuneraciones");

    this.pbRemuneraciones = true;

    // const aGroup: nsAtencionp.IRemuneracionCabecera[] = [];

    // aGroup.push({
    //   periodo: "Periodo",
    //   tipoId: 1,
    //   tipo: "tipo",
    //   dias: 10,
    //   importe: 1000,
    // });

    //this.searchBS = new MatTableDataSource(aGroup);
    this.searchBS = new MatTableDataSource();

    // const aExpanded: nsAtencionp.IExpandedAsistencia[] = [];
    // aExpanded.push({
    //   supervisor: "Angel Flores",
    //   cliente: "Cliente abc",
    //   dias: 10,
    // });

    //this.ExpandedDS1 = new MatTableDataSource(aExpanded);
    //this.DetailDS = new MatTableDataSource(aExpanded);

    this.ExpandedDS1 = new MatTableDataSource();
    this.ExpandedDS2 = new MatTableDataSource();
    this.ExpandedDS3 = new MatTableDataSource();
    this.ExpandedDS4 = new MatTableDataSource();

    await this.cargarPeriodosCalculadosDePersonal();
    this.frmGrpDevengue.get("selTipoPeriodo").setValue("0");

    const periodoLaboralId = this.lstPeriodosLaborales[0].periodoLaboralId;
    this.frmGrpPeriodoLaboral
      .get("selPeriodoLaboral")
      .setValue(periodoLaboralId);

    this.onChangePeriodoLaboral(periodoLaboralId);

    const anio = this.data.periodosCalculados[0].anio;
    this.frmGrpDevengue.get("selAnio").setValue(anio);
    this.onChangeAnio(anio);

    const nroMes = this.data.periodosCalculados[0].nroMes;
    this.frmGrpDevengue.get("selMes").setValue(nroMes);
    this.onChangeMes(nroMes.toString());

    this.frmGrpTipoRemuneracion.get("selTipoRemuneracion").setValue(0);

    this.pbRemuneraciones = false;

    this.spi.hide("spi_remuneraciones");
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  onInitFrmGrpPeriodoLaboral() {
    this.frmGrpPeriodoLaboral = this.fb.group({
      selPeriodoLaboral: "",
    });
  }

  onInitFrmGrpDevengue() {
    this.frmGrpDevengue = this.fb.group({
      selAnio: "",
      selMes: "",
      selTipoPeriodo: "",
    });
  }

  onInitFrmGrpTipoRemuneracion() {
    this.frmGrpTipoRemuneracion = this.fb.group({
      selTipoRemuneracion: "",
    });
  }

  async cargarPeriodosCalculadosDePersonal() {
    // debugger;

    const param = [];

    // let nIdEmp = JSON.parse(localStorage.getItem('ListaEmpresa'))[0].nIdEmp;
    // let nIdPersonal = this.fgInfo.controls['nIdPersonal'].value;

    const nIdPersonal = this.fromParent.nIdPersonal;
    const nIdEmp = this.fromParent.nIdEmp;

    param.push(
      "0¡nIdPersonal!" +
      nIdPersonal +
      "-0¡dev.nIdEmp!" +
      nIdEmp +
      "|0¡dev.nIdEstado!2"
    );

    // param.push('0¡nIdPersonal!171-0¡dev.nIdEmp!1|0¡dev.nIdEstado!2');

    // this.pbMain = true;

    await this.atencionService._loadSP(11, param).then((data: any) => {
      // debugger

      console.log(data);

      this.data = data;

      this.data.periodosLaborales.forEach((elem) => {
        console.log(elem.sFechIni);
        this.lstPeriodosLaborales.push({
          periodoLaboralId: elem.periodoLaboralId,
          fechaInicio: elem.sFechIni,
          fechaFin: elem.sFechFin,
        });
      });

      this.lstTiposPeriodo = new Array();
      this.lstTiposPeriodo = data.tiposPeriodo;
    });

    // this.pbMain = false;
  }

  onChangePeriodoLaboral(periodoLaboralId: number) {
    // debugger;

    this.pbRemuneraciones = true;

    console.log(periodoLaboralId);

    this.lstAnios = new Array();

    this.lstAniosUnicos = this.data.periodosCalculados
      .filter((x) => x.periodoLaboralId === periodoLaboralId)
      .filter(
        (value, index, arr) =>
          arr.findIndex((x) => x.anio === value.anio) === index
      );

    this.lstAniosUnicos.forEach((elem) => {
      this.lstAnios.push({
        value: elem.anio,
        text: elem.anio,
        periodoLaboralId: elem.periodoLaboralId,
      });
    });

    this.pbRemuneraciones = false;
  }

  onChangeAnio(anio: string) {
    this.pbRemuneraciones = true;

    this.lstMeses = new Array();

    let lstMesesUnicos: Array<nsAtencionp.IPeriodosCalculados> = new Array();

    const periodoLaboralId = this.frmGrpPeriodoLaboral.get("selPeriodoLaboral")
      .value;

    lstMesesUnicos = this.data.periodosCalculados
      .filter((x) => x.periodoLaboralId === periodoLaboralId && x.anio === anio)
      .filter(
        (value, index, arr) =>
          arr.findIndex((x) => x.nroMes === value.nroMes) === index
      );

    lstMesesUnicos.forEach((elem) => {
      this.lstMeses.push({
        value: elem.nroMes,
        text: elem.mes,
        anio: elem.anio,
      });
    });

    const mes = this.frmGrpDevengue.get("selMes").value;
    const tipo = this.frmGrpDevengue.get("selTipoPeriodo").value;

    this.onCargarRemuneraciones(anio, mes, tipo);

    this.pbRemuneraciones = false;
  }

  onChangeMes(mes: string) {
    this.pbRemuneraciones = true;

    const anio = this.frmGrpDevengue.get("selAnio").value;
    const tipo = this.frmGrpDevengue.get("selTipoPeriodo").value;

    this.onCargarRemuneraciones(anio, mes, tipo);

    this.pbRemuneraciones = false;
  }

  onChangeTipoPeriodo(tipoPeriodo: string) {
    this.pbRemuneraciones = true;

    const anio = this.frmGrpDevengue.get("selAnio").value;
    const mes = this.frmGrpDevengue.get("selMes").value;

    this.frmGrpTipoRemuneracion.get("selTipoRemuneracion").setValue(0);

    this.onCargarRemuneraciones(anio, mes, tipoPeriodo);

    this.pbRemuneraciones = false;
  }

  async onCargarRemuneraciones(anio: string, mes: string, tipoPeriodo: string) {
    const param = [];

    param.push("");

    await this.atencionService._loadSP(12, param).then((data: any) => {
      this.dataRemuneracion = data;

      this.onConstruirCalendario(anio, mes, tipoPeriodo);
      this.onConstruirData(tipoPeriodo);

      this.ExpandedDS1.filterPredicate = function (data, filter: string): boolean {
        return data.periodo.trim().toLowerCase().includes(filter.toLowerCase());
      };
    });

    this.onCargarCabecerasRemuneraciones(0);
  }

  onConstruirCalendario(anio: string, mes: string, tipoPeriodo: string) {
    const events = [];
    let calendar = new Date();
    const dFechIni = moment(mes + "-01-" + anio, "MM-DD-YYYY");
    calendar = dFechIni.toDate();

    this.dataRemuneracion.forEach((elem) => {
      let start = require('moment');
      let end = require('moment');

      if (tipoPeriodo === "0") {
        start = moment(elem.fechaInicio, "MM-DD-YYYY");
        end = moment(elem.fechaFin, "MM-DD-YYYY");
      }
      else {
        if (tipoPeriodo === "1") {
          start = moment(elem.fechaInicio, "MM-DD-YYYY");
          end = moment(elem.fechaInicio, "MM-DD-YYYY").date(14);
        }
        else {
          if (tipoPeriodo === "2") {
            start = moment(elem.fechaFin, "MM-DD-YYYY").date(15);
            end = moment(elem.fechaFin, "MM-DD-YYYY");
          }
        }
      }

      events.push({
        start: start,
        end: end,
        color:
          elem.tipo === "Asistencia"
            ? colors.pink
            : elem.tipo === "Subsidio"
              ? colors.blue
              : elem.tipo === "Vacaciones"
                ? colors.red
                : elem.tipo === "Incentivo"
                  ? colors.green
                  : elem.tipo === "Provisión"
                    ? colors.yellow
                    : colors.black,
        title: "",
        allDay: true,
        draggable: false
      });
    });

    this.subDate = calendar;
    this.eventSub = events;
    this.refreshSub.next();
  }

  onConstruirData(tipoPeriodo: string) {
    // debugger

    let diasAsistenciaQuincena: number = 0;
    let totalAsistenciaQuincena: number = 0;
    let diasAsistenciaFinDeMes: number = 0;
    let totalAsistenciaFinDeMes: number = 0;

    let diasSubsidioQuincena: number = 0;
    let totalSubsidioQuincena: number = 0;
    let diasSubsidioFinDeMes: number = 0;
    let totalSubsidioFinDeMes: number = 0;

    let diasVacacionesQuincena: number = 0;
    let totalVacacionesQuincena: number = 0;
    let diasVacacionesFinDeMes: number = 0;
    let totalVacacionesFinDeMes: number = 0;

    let diasKPIQuincena: number = 0;
    let totalKPIQuincena: number = 0;
    let diasKPIFinDeMes: number = 0;
    let totalKPIFinDeMes: number = 0;

    // Arrays para la data de segundo nivel.
    let lstAsistenciaAgrupada: Array<nsAtencionp.IExpandedAsistencia> = new Array();
    let lstSubsidioAgrupada: Array<nsAtencionp.IExpandedSubsidio> = new Array();
    let lstVacacionesAgrupada: Array<nsAtencionp.IExpandedVacaciones> = new Array();
    let lstKPIAgrupada: Array<nsAtencionp.IExpandedKPI> = new Array();

    this.dataRemuneracion.forEach((elem) => {
      const fechaInicio = moment(elem.fechaInicio, 'MM-DD-YYYY');
      const fechaFin = moment(elem.fechaFin, 'MM-DD-YYYY');
      const fechaQuincena = moment(elem.fechaInicio, 'MM-DD-YYYY').date(15);

      const diferencia = fechaFin.diff(fechaInicio, 'days') + 1;
      const importePorDia = elem.importe / diferencia;
      let difQuincena: number = 0;
      let difFinDeMes: number = 0;

      if (elem.tipo === "Asistencia") {
        if (fechaInicio.isSameOrBefore(fechaQuincena)) {
          diasAsistenciaQuincena++;
          totalAsistenciaQuincena += elem.importe;

          lstAsistenciaAgrupada.push({
            periodo: "Primera quincena",
            supervisor: elem.valor1,
            cliente: elem.valor2,
            dias: 1,
          });
        } else {
          diasAsistenciaFinDeMes++;
          totalAsistenciaFinDeMes += elem.importe;

          lstAsistenciaAgrupada.push({
            periodo: "Fin de mes",
            supervisor: elem.valor1,
            cliente: elem.valor2,
            dias: 1,
          });
        }
      }

      if (elem.tipo === "Subsidio") {
        if (fechaInicio.isSameOrBefore(fechaQuincena) && fechaFin.isSameOrAfter(fechaQuincena)) {
          difQuincena = fechaQuincena.diff(fechaInicio, 'days') + 1;
          difFinDeMes = fechaFin.diff(fechaQuincena, 'days');

          diasSubsidioQuincena += difQuincena;
          diasSubsidioFinDeMes += difFinDeMes;

          lstSubsidioAgrupada.push({
            periodo: "Primera quincena",
            tipo: elem.valor1,
            fechaInicio: fechaInicio.format('DD/MM/YYYY'),
            fechaFin: fechaQuincena.format('DD/MM/YYYY'),
            dias: difQuincena
          });

          lstSubsidioAgrupada.push({
            periodo: "Fin de mes",
            tipo: elem.valor1,
            fechaInicio: fechaQuincena.add(1, 'days').format('DD/MM/YYYY'),
            fechaFin: fechaFin.format('DD/MM/YYYY'),
            dias: difFinDeMes
          });
        }

        if (fechaInicio.isSameOrBefore(fechaQuincena) && fechaFin.isSameOrBefore(fechaQuincena)) {
          difQuincena = fechaFin.diff(fechaInicio, 'days') + 1;
          diasSubsidioQuincena += difQuincena;

          lstSubsidioAgrupada.push({
            periodo: "Primera quincena",
            tipo: elem.valor1,
            fechaInicio: fechaInicio.format('DD/MM/YYYY'),
            fechaFin: fechaQuincena.format('DD/MM/YYYY'),
            dias: difQuincena
          });
        }

        if (fechaInicio.isAfter(fechaQuincena) && fechaFin.isAfter(fechaQuincena)) {
          difFinDeMes = fechaFin.diff(fechaInicio, 'days') + 1;
          diasSubsidioFinDeMes += difFinDeMes;

          lstSubsidioAgrupada.push({
            periodo: "Fin de mes",
            tipo: elem.valor1,
            fechaInicio: fechaQuincena.add(1, 'days').format('DD/MM/YYYY'),
            fechaFin: fechaFin.format('DD/MM/YYYY'),
            dias: difFinDeMes
          });
        }

        totalSubsidioQuincena += importePorDia * difQuincena;
        totalSubsidioFinDeMes += importePorDia * difFinDeMes;
      }

      if (elem.tipo === "Vacaciones") {
        if (fechaInicio.isSameOrBefore(fechaQuincena) && fechaFin.isSameOrAfter(fechaQuincena)) {
          difQuincena = fechaQuincena.diff(fechaInicio, 'days') + 1;
          difFinDeMes = fechaFin.diff(fechaQuincena, 'days');

          diasVacacionesQuincena += difQuincena;
          diasVacacionesFinDeMes += difFinDeMes;

          lstVacacionesAgrupada.push({
            periodo: "Primera quincena",
            responsable: elem.valor1,
            fechaInicio: fechaInicio.format('DD/MM/YYYY'),
            fechaFin: fechaQuincena.format('DD/MM/YYYY'),
            dias: difQuincena
          });

          lstVacacionesAgrupada.push({
            periodo: "Fin de mes",
            responsable: elem.valor1,
            fechaInicio: fechaQuincena.add(1, 'days').format('DD/MM/YYYY'),
            fechaFin: fechaFin.format('DD/MM/YYYY'),
            dias: difFinDeMes
          });
        }

        if (fechaInicio.isSameOrBefore(fechaQuincena) && fechaFin.isSameOrBefore(fechaQuincena)) {
          difQuincena = fechaFin.diff(fechaInicio, 'days') + 1;
          diasVacacionesQuincena += difQuincena;

          lstVacacionesAgrupada.push({
            periodo: "Primera quincena",
            responsable: elem.valor1,
            fechaInicio: fechaInicio.format('DD/MM/YYYY'),
            fechaFin: fechaQuincena.format('DD/MM/YYYY'),
            dias: difQuincena
          });
        }

        if (fechaInicio.isAfter(fechaQuincena) && fechaFin.isAfter(fechaQuincena)) {
          difFinDeMes = fechaFin.diff(fechaInicio, 'days') + 1;
          diasVacacionesFinDeMes += difFinDeMes;

          lstVacacionesAgrupada.push({
            periodo: "Fin de mes",
            responsable: elem.valor1,
            fechaInicio: fechaQuincena.add(1, 'days').format('DD/MM/YYYY'),
            fechaFin: fechaFin.format('DD/MM/YYYY'),
            dias: difFinDeMes
          });
        }

        totalVacacionesQuincena += importePorDia * difQuincena;
        totalVacacionesFinDeMes += importePorDia * difFinDeMes;
      }

      if (elem.tipo === "Incentivo" || elem.tipo === "Provisión") {
        if (fechaInicio.isSameOrBefore(fechaQuincena) && fechaFin.isSameOrAfter(fechaQuincena)) {
          difQuincena = fechaQuincena.diff(fechaInicio, 'days') + 1;
          difFinDeMes = fechaFin.diff(fechaQuincena, 'days');

          diasKPIQuincena += difQuincena;
          diasKPIFinDeMes += difFinDeMes;

          let diferencia = fechaFin.diff(fechaInicio, 'days') + 1

          lstKPIAgrupada.push({
            periodo: "Primera quincena",
            tipo: elem.tipo,
            campania: elem.valor1,
            cliente: elem.valor2,
            importe: (elem.importe / diferencia) * difQuincena,
          });

          lstKPIAgrupada.push({
            periodo: "Fin de mes",
            tipo: elem.tipo,
            campania: elem.valor1,
            cliente: elem.valor2,
            importe: (elem.importe / diferencia) * difFinDeMes,
          });
        }

        if (fechaInicio.isSameOrBefore(fechaQuincena) && fechaFin.isSameOrBefore(fechaQuincena)) {
          difQuincena = fechaFin.diff(fechaInicio, 'days') + 1;
          diasKPIQuincena += difQuincena;

          lstKPIAgrupada.push({
            periodo: "Primera quincena",
            tipo: elem.tipo,
            campania: elem.valor1,
            cliente: elem.valor2,
            importe: elem.importe,
          });
        }

        if (fechaInicio.isAfter(fechaQuincena) && fechaFin.isAfter(fechaQuincena)) {
          difFinDeMes = fechaFin.diff(fechaInicio, 'days') + 1;
          diasKPIFinDeMes += difFinDeMes;

          lstKPIAgrupada.push({
            periodo: "Fin de mes",
            tipo: elem.tipo,
            campania: elem.valor1,
            cliente: elem.valor2,
            importe: elem.importe,
          });
        }

        totalKPIQuincena += importePorDia * difQuincena;
        totalKPIFinDeMes += importePorDia * difFinDeMes;
      }
    });

    // debugger

    let _periodo: string = '';
    let _supervisor: string = '';
    let _cliente: string = '';
    let _dias: number = 0;
    let _tipo: string = '';
    let _fechaInicio: string = '';
    let _fechaFin: string = '';
    let _responsable: string = '';
    let _campania: string = '';
    let _importe: number = 0;

    // Asistencia: Construcción de array de detalle.
    if (lstAsistenciaAgrupada.length > 0) {
      _periodo = lstAsistenciaAgrupada[0].periodo;
      _supervisor = lstAsistenciaAgrupada[0].supervisor;
      _cliente = lstAsistenciaAgrupada[0].cliente;
      _dias = 0;

      this.lstAsistenciaDetalle = new Array();

      lstAsistenciaAgrupada.forEach((elem) => {
        if (elem.periodo === _periodo && elem.supervisor === _supervisor && elem.cliente === _cliente) {
          _dias++;
        }
        else {
          this.lstAsistenciaDetalle.push({
            periodo: _periodo,
            supervisor: _supervisor,
            cliente: _cliente,
            dias: _dias
          });

          _periodo = elem.periodo;
          _supervisor = elem.supervisor;
          _cliente = elem.cliente;

          _dias = 1;
        }
      });

      this.lstAsistenciaDetalle.push({
        periodo: _periodo,
        supervisor: _supervisor,
        cliente: _cliente,
        dias: _dias
      });
    }

    // Subsidio: Construcción de array de detalle.
    if (lstSubsidioAgrupada.length > 0) {
      _periodo = lstSubsidioAgrupada[0].periodo;
      _tipo = lstSubsidioAgrupada[0].tipo;
      _fechaInicio = lstSubsidioAgrupada[0].fechaInicio;
      _fechaFin = lstSubsidioAgrupada[0].fechaFin;
      _dias = 0;

      this.lstSubsidioDetalle = new Array();

      lstSubsidioAgrupada.forEach((elem) => {
        if (elem.periodo === _periodo && elem.tipo === _tipo) {
          _dias += elem.dias;
        }
        else {
          this.lstSubsidioDetalle.push({
            periodo: _periodo,
            tipo: _tipo,
            fechaInicio: _fechaInicio,
            fechaFin: _fechaFin,
            dias: _dias
          });

          _periodo = elem.periodo;
          _tipo = elem.tipo;
          _fechaInicio = elem.fechaInicio;
          _fechaFin = elem.fechaFin;
          _dias = elem.dias;
        }
      });

      this.lstSubsidioDetalle.push({
        periodo: _periodo,
        tipo: _tipo,
        fechaInicio: _fechaInicio,
        fechaFin: _fechaFin,
        dias: _dias
      });
    }

    // Vacaciones: Construcción de array de detalle.
    if (lstVacacionesAgrupada.length > 0) {
      _periodo = lstVacacionesAgrupada[0].periodo;
      _responsable = lstVacacionesAgrupada[0].responsable;
      _fechaInicio = lstVacacionesAgrupada[0].fechaInicio;
      _fechaFin = lstVacacionesAgrupada[0].fechaFin;
      _dias = 0;

      this.lstVacacionesDetalle = new Array();

      lstVacacionesAgrupada.forEach((elem) => {
        if (elem.periodo === _periodo && elem.responsable === _responsable) {
          _dias += elem.dias;
        }
        else {
          this.lstVacacionesDetalle.push({
            periodo: _periodo,
            responsable: _responsable,
            fechaInicio: _fechaInicio,
            fechaFin: _fechaFin,
            dias: _dias
          });

          _periodo = elem.periodo;
          _responsable = elem.responsable;
          _fechaInicio = elem.fechaInicio;
          _fechaFin = elem.fechaFin;
          _dias = elem.dias;
        }
      });

      this.lstVacacionesDetalle.push({
        periodo: _periodo,
        responsable: _responsable,
        fechaInicio: _fechaInicio,
        fechaFin: _fechaFin,
        dias: _dias
      });
    }

    // KPI: Construcción de array de detalle.
    if (lstKPIAgrupada.length > 0) {
      _periodo = lstKPIAgrupada[0].periodo;
      _tipo = lstKPIAgrupada[0].tipo;
      _campania = lstKPIAgrupada[0].campania;
      _cliente = lstKPIAgrupada[0].cliente;
      _importe = 0;

      this.lstKPIDetalle = new Array();

      lstKPIAgrupada.forEach((elem) => {
        if (elem.periodo === _periodo && elem.tipo === _tipo && elem.campania === _campania && elem.cliente === _cliente) {
          _importe += elem.importe;
        }
        else {
          this.lstKPIDetalle.push({
            periodo: _periodo,
            tipo: _tipo,
            campania: _campania,
            cliente: _cliente,
            importe: _importe
          });

          _periodo = elem.periodo;
          _tipo = elem.tipo;
          _campania = elem.campania;
          _cliente = elem.cliente;
          _importe = elem.importe;
        }
      });

      this.lstKPIDetalle.push({
        periodo: _periodo,
        tipo: _tipo,
        campania: _campania,
        cliente: _cliente,
        importe: _importe
      });
    }

    this.dataRemuneracionCabecera = new Array();

    if (tipoPeriodo === "0" || tipoPeriodo === "1") {
      this.dataRemuneracionCabecera.push({
        periodo: "Primera quincena",
        tipoId: 1,
        tipo: "Asistencia",
        dias: diasAsistenciaQuincena,
        importe: totalAsistenciaQuincena,
      });

      this.dataRemuneracionCabecera.push({
        periodo: "Primera quincena",
        tipoId: 2,
        tipo: "Subsidio",
        dias: diasSubsidioQuincena,
        importe: totalSubsidioQuincena,
      });

      this.dataRemuneracionCabecera.push({
        periodo: "Primera quincena",
        tipoId: 3,
        tipo: "Vacaciones",
        dias: diasVacacionesQuincena,
        importe: totalVacacionesQuincena,
      });

      this.dataRemuneracionCabecera.push({
        periodo: "Primera quincena",
        tipoId: 4,
        tipo: "KPI",
        dias: diasKPIQuincena,
        importe: totalKPIQuincena,
      });
    }

    if (tipoPeriodo === "0" || tipoPeriodo === "2") {
      this.dataRemuneracionCabecera.push({
        periodo: "Fin de mes",
        tipoId: 1,
        tipo: "Asistencia",
        dias: diasAsistenciaFinDeMes,
        importe: totalAsistenciaFinDeMes,
      });

      this.dataRemuneracionCabecera.push({
        periodo: "Fin de mes",
        tipoId: 2,
        tipo: "Subsidio",
        dias: diasSubsidioFinDeMes,
        importe: totalSubsidioFinDeMes,
      });

      this.dataRemuneracionCabecera.push({
        periodo: "Fin de mes",
        tipoId: 3,
        tipo: "Vacaciones",
        dias: diasVacacionesFinDeMes,
        importe: totalVacacionesFinDeMes,
      }); 9

      this.dataRemuneracionCabecera.push({
        periodo: "Fin de mes",
        tipoId: 4,
        tipo: "KPI",
        dias: diasKPIFinDeMes,
        importe: totalKPIFinDeMes,
      });
    }

    //this.dataRemuneracionCabecera.sort((a, b) => (a.tipoId - b.tipoId));
  }

  onCargarCabecerasRemuneraciones(tipo: number) {
    //debugger;

    this.pbRemuneraciones = true;

    const anio = this.frmGrpDevengue.get("selAnio").value;
    const mes = this.frmGrpDevengue.get("selMes").value;

    this.lstRemuneracionCabecera = this.dataRemuneracionCabecera.filter(
      (x) => x.tipoId === tipo || tipo === 0
    );

    this.searchBS = new MatTableDataSource(this.lstRemuneracionCabecera);

    this.searchBS.paginator = this.searchB;
    this.searchBS.sort = this.tableSortB;
    this.searchBS.filterPredicate = function (
      data: nsAtencionp.IRemuneracionDetalle,
      filter: string
    ): boolean {
      return data.tipoId.toString().trim().toLowerCase().includes(filter);
    };

    this.searchBS.filterPredicate = ((
      data: nsAtencionp.IRemuneracionDetalle,
      filter: nsAtencionp.IRemuneracionDetalle
    ) => {
      // tslint:disable-next-line: max-line-length
      const a =
        !filter.tipoId || data.tipoId.toString().toLowerCase().includes(filter.tipo);
      //const b = !filter.mes || data.mes.toLowerCase().includes(filter.mes);
      //return a && b;
      return a;
    }) as (PeriodicElement, string) => boolean;

    this.pbRemuneraciones = false;
  }

  onChangeTipoRemuneracion(tipo: number) {
    //debugger;

    this.onCargarCabecerasRemuneraciones(tipo);
  }

  onToggleFab(stat: number) {
    // debugger
    stat = stat === -1 ? (this.abDetail.length > 0 ? 0 : 1) : stat;
    this.tsDetail = stat === 0 ? "inactive" : "active";
    this.abDetail = stat === 0 ? [] : this.fbDetail;
  }

  async clickFab(index: number) {
    switch (index) {
      case 0:
        console.log("Ir a descuentos");

        this.onVisualizarDescuentos();

        break;
    }
  }

  onVisualizarDescuentos() {
    this.delay(250).then((any) => {
      this.abDetail = [];
      this.tsDetail = "inactive";
    });

    // (function ($) {
    //   $('#ModalSearch').modal('hide');
    // })(jQuery);
    //this.activeModal.close();
    this.activeModal.dismiss();

    this.ngbModalOptions.size = 'xl';
    this.openModal('descuentos');
  }

  async onClickExpanded(row: nsAtencionp.IRemuneracionCabecera) {
    //debugger

    if (this.expandedMore === row) {
      // Inicializa los datasource cuando se contrae el expanded.
      this.expandedMore = null;
      this.ExpandedDS1 = new MatTableDataSource([]);
      this.ExpandedDS2 = new MatTableDataSource([]);
      this.ExpandedDS3 = new MatTableDataSource([]);
      this.ExpandedDS4 = new MatTableDataSource([]);
    } else {

      if (row.tipoId === 1) {
        let lstAsistenciaFiltrada: nsAtencionp.IExpandedAsistencia[] = this.lstAsistenciaDetalle.filter(elem => elem.periodo === row.periodo && row.tipoId == 1);
        this.ExpandedDS1 = new MatTableDataSource(lstAsistenciaFiltrada);
      }

      if (row.tipoId === 2) {
        let lstSubsidioFiltrada: nsAtencionp.IExpandedSubsidio[] = this.lstSubsidioDetalle.filter(elem => elem.periodo === row.periodo && row.tipoId == 2);
        this.ExpandedDS2 = new MatTableDataSource(lstSubsidioFiltrada);
      }

      if (row.tipoId === 3) {
        let lstVacacionesFiltrada: nsAtencionp.IExpandedVacaciones[] = this.lstVacacionesDetalle.filter(elem => elem.periodo === row.periodo && row.tipoId == 3);
        this.ExpandedDS3 = new MatTableDataSource(lstVacacionesFiltrada);
      }

      if (row.tipoId === 4) {
        let lstKPIFiltrada: nsAtencionp.IExpandedKPI[] = this.lstKPIDetalle.filter(elem => elem.periodo === row.periodo && row.tipoId == 4);
        this.ExpandedDS4 = new MatTableDataSource(lstKPIFiltrada);
      }

      this.expandedMore = row;
    }
  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);

    const obj = new Object();
    const nIdPersonal = 171;//this.fgInfo.controls['nIdPersonal'].value; TODO
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    switch (name) {
      case 'descuentos':
        obj['nIdPersonal'] = nIdPersonal;
        obj['nIdEmp'] = nIdEmp;

        modalRef.componentInstance.fromParent = obj;
        break;
    }
  }
}
