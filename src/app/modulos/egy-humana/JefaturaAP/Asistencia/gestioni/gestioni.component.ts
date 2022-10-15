import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarDateFormatter, CalendarEvent, CalendarMonthViewDay, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { colorsDetail, ISelectItem, ModalOptions, Question, SecurityErp } from 'src/app/modulos/AAHelpers';
import { adminpAnimations } from '../../Animations/adminp.animations';
import Swal from 'sweetalert2';
import { CustomDateFormatter } from '../../Config/configCalendar';
import { AbsenceDto, EAbsence, EModalAbsence, PersonalIDto, ResponsableDto } from '../../Model/Igestioni';
import { EControlAbsence } from '../../Model/lcontroli';
import { ControliService } from '../../Services/controli.service';
import { GestioniService } from '../../Services/gestioni.service';
import { GestioniDetailComponent } from './modals/gestioni-detail/gestioni-detail.component';
import { GestioniManagementComponent } from './modals/gestioni-management/gestioni-management.component';

@Component({
  selector: 'app-gestioni',
  templateUrl: './gestioni.component.html',
  styleUrls: ['./gestioni.component.css', './gestioni.component.scss'],
  providers: [{ provide: CalendarDateFormatter, useClass: CustomDateFormatter }],
  animations: [adminpAnimations]
})
export class GestioniComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  storageData: SecurityErp = new SecurityErp();
  form: FormGroup;
  dataSource: MatTableDataSource<PersonalIDto>;
  displayedColumns: string[];
  planillas: ISelectItem[];
  estados: ISelectItem[];
  responsable: ResponsableDto;
  colores = colorsDetail;
  expandedMore = null;
  viewDate: Date = new Date();

  /* #region  Calendar properties */
  locale = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  /* #endregion */

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Opción', field: 'accion', type: 'accion', width: '70', align: 'center', hide: false },
    { header: 'Apellidos y nombres', field: 'sNombreCompleto', type: 'font', width: '300', align: 'left', hide: true },
    { header: 'Planilla', field: 'sCodPlla', type: null, width: '50', align: 'center', hide: true },
    { header: 'Tipo Doc.', field: 'sTipoDoc', type: null, width: '80', align: 'left', hide: true },
    { header: 'Documento', field: 'sDocumento', type: null, width: '80', align: 'left', hide: true },
    { header: 'F. Ingreso', field: 'sFechaIni', type: null, width: '100', align: 'center', hide: true },
    { header: 'F. Cese', field: 'sFechaFin', type: null, width: '100', align: 'center', hide: true },
  ];
  /* #endregion */

  constructor(
    public fb: FormBuilder,
    private gestioniService: GestioniService,
    private controliService: ControliService,
    private spinner: NgxSpinnerService,
    private ngbModal: NgbModal
  ) {
    this.initForm();
    this.displayedColumns = this.cols.map(col => col.field);
    this.displayedColumns.push('dropdown');
  }

  ngOnInit(): void {
    this.loadItems();
    this.fnGetInfoResponsable();
  }

  get sNomOrDocCtrl(): FormControl { return this.form.get('sNomOrDoc') as FormControl }
  get hideMessageEmpty(): boolean { return this.dataSource && this.dataSource.filteredData.length > 0 }

  /* #region  Inicialización del form */
  initForm() {
    this.form = this.fb.group({
      sNomOrDoc: '',
      sCodPlla: ''
    });
    this.form.valueChanges.subscribe(value => {
      this.applyFilter(value);
    });
  }
  /* #endregion */

  /* #region  Designación de predicados para el filtro */
  loadFilters(): void {
    this.dataSource.filterPredicate = (data, filter: any) => {
      const f1 = !filter.sNomOrDoc || data.sNombreCompleto.toLowerCase().includes(filter.sNomOrDoc) || data.sDocumento.includes(filter.sNomOrDoc);
      const f2 = !filter.sCodPlla || data.sCodPlla == filter.sCodPlla;
      return f1 && f2;
    };
  }
  /* #endregion */

  /* #region  Método de filtración */
  applyFilter(filterValue: any) { this.dataSource.filter = { ...filterValue } as string }
  /* #endregion */

  /* #region  Carga de data principal */
  fnGetInfoResponsable(): void {
    const codUser = Number(this.storageData.getUsuarioId());
    const nIdEmp = Number(this.storageData.getEmpresa());
    this.spinner.show('spi_new');
    this.gestioniService.GetAllSearch(codUser, nIdEmp).then(
      res => {
        if (res) {
          this.viewDate = moment(res.dDevengueActual).toDate();
          this.responsable = res.responsable;
          let lstPersonal = res.personalList ? res.personalList : [];
          lstPersonal = lstPersonal.map(item => item = { ...item, eventos: this.gestioniService.fnMapCalendarEvent(item.inasistencias) });
          this.dataSource = new MatTableDataSource<PersonalIDto>(lstPersonal);
          this.dataSource.paginator = this.paginator;
          this.loadFilters();
        }
      }
    ).finally(() => { this.spinner.hide('spi_new') });
  }
  /* #endregion */

  /* #region  carga de planillas y estados */
  loadItems() {
    const nIdEmpresa = Number(this.storageData.getEmpresa());
    const p1 = this.gestioniService.getAllItems(EAbsence.PLANILLA, nIdEmpresa);
    const p2 = this.controliService.getAllItems(EControlAbsence.ESTADO, nIdEmpresa, this.storageData.getPais());
    this.spinner.show('spi_new');
    Promise.all([p1, p2]).then(
      ([resPlanillas, resEstados]) => {
        this.planillas = resPlanillas ? resPlanillas : [];
        this.estados = resEstados ? resEstados : [];
      }).finally(() => { this.spinner.hide('spi_new') });
  }
  /* #endregion */

  /* #region  método que lista las inasistencias de un personal */
  loadAbsencesByPersonal(nIdPersonal: number): void {
    this.spinner.show('spi_new');
    this.gestioniService.GetAbsencesByPersonal(nIdPersonal, this.viewDate).then(res => {
      const newLstEvent = this.gestioniService.fnMapCalendarEvent(res);
      this.dataSource.data = this.dataSource.data.map(item => item.nIdPersonal == nIdPersonal ? { ...item, eventos: newLstEvent } : item);
    }).finally(() => { this.spinner.hide('spi_new') });
  }
  /* #endregion */

  showCalendar(eventos: CalendarEvent<AbsenceDto>[]): unknown { return { 'display': eventos?.length == 0 ? 'none' : 'flex' } }

  /* #region  Método que carga un tipo de modal */
  showModal(type: EModalAbsence, row: PersonalIDto, nIdAbsence?: number): void {
    const p1 = this.gestioniService.getAllItems(EAbsence.MOTIVO);
    const p2 = this.gestioniService.GetAbsencesByPersonal(row.nIdPersonal);
    const p3 = this.gestioniService.GetAbsencesHistorico(row.nIdPersonal);

    const { inasistencias, eventos, ...dataMainPersonal } = row
    switch (type) {
      case EModalAbsence.CRUD:
        this.spinner.show('spi_new');
        Promise.all([p1, p2]).then(
          ([resMotivos, resAbsences]) => {
            const paramEvents = this.gestioniService.fnMapCalendarEvent(resAbsences ? resAbsences : []);
            const modalCrud = this.ngbModal.open(GestioniManagementComponent, new ModalOptions());
            const absence = resAbsences?.find(item => item.nId == nIdAbsence);
            modalCrud.componentInstance.data = {
              'personal': dataMainPersonal,
              'nIdResponsable': this.responsable.nIdResponsable,
              'eventos': paramEvents,
              'dvActual': this.viewDate,
              'motivos': resMotivos ? resMotivos : [],
              'estados': this.estados,
              'absence': absence
            };
            modalCrud.result.then(() => { this.loadAbsencesByPersonal(row.nIdPersonal) });
          }
        ).finally(() => { this.spinner.hide('spi_new') });
        break;
      case 2:
        this.spinner.show('spi_new');
        Promise.all([p1, p3]).then(
          ([resMotivos, resHistorico]) => {
            const lstHistorico = resHistorico.map(item => {
              return {
                ...item,
                dViewdate: moment(`${item.nAnio}-${item.nMes}-01`).toDate(),
                eventos: this.gestioniService.fnMapCalendarEvent(item.inasistencias)
              }
            });
            const modalDetail = this.ngbModal.open(GestioniDetailComponent, new ModalOptions());
            modalDetail.componentInstance.data = {
              'personal': dataMainPersonal,
              'historico': lstHistorico,
              'motivos': resMotivos ? resMotivos : [],
              'estados': this.estados,
            };
            modalDetail.result.then(() => { this.loadAbsencesByPersonal(row.nIdPersonal) });
          }
        ).finally(() => { this.spinner.hide('spi_new') });
        break;
    }
  }
  /* #endregion */

  /* #region  Método de expandir detalle */
  clickExpanded(row: PersonalIDto): void { this.expandedMore = this.expandedMore == row ? null : row }
  /* #endregion */

  /* #region  Click en el día para abrir su detalle */
  dayClicked(event: CalendarMonthViewDay<AbsenceDto>, row: PersonalIDto): void {
    if (event.events.length > 0) {
      const pregunta = '¿ Desea ver el detalle de esta inasistencia ?';
      Swal.fire(new Question(pregunta) as unknown).then((result) => {
        if (result.isConfirmed) {
          const nIdAbsence = event.events[0].meta.nId;
          this.showModal(EModalAbsence.CRUD, row, nIdAbsence);
        }
      });
    }
  }
  /* #endregion */
}
