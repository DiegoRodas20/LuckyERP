import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarDateFormatter, CalendarEvent, CalendarMonthViewDay, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { colorsDetail, ISelectItem, ModalOptions, Question, SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { CustomDateFormatter } from '../../../../Config/configCalendar';
import { AbsenceDto, AbsenceRequest, EAbsenceAction } from '../../../../Model/Igestioni';
import { EControlAbsenceEstado } from '../../../../Model/lcontroli';
import { ControliService } from '../../../../Services/controli.service';
import { GestioniService } from '../../../../Services/gestioni.service';
import { ControliChangesComponent } from '../../../controli/modals/controli-changes/controli-changes.component';

@Component({
  selector: 'app-gestioni-management',
  templateUrl: './gestioni-management.component.html',
  styleUrls: ['./gestioni-management.component.css', './gestioni-management.component.scss'],
  providers: [{ provide: CalendarDateFormatter, useClass: CustomDateFormatter }],
  animations: [adminpAnimations]
})

export class GestioniManagementComponent implements OnInit {
  @Input() data: {
    personal: any,
    nIdResponsable: number,
    eventos: CalendarEvent<AbsenceDto>[],
    dvActual: Date,
    motivos: ISelectItem[],
    estados: ISelectItem[],
    absence: AbsenceDto
  };
  storageData: SecurityErp = new SecurityErp();
  viewDate: Date;
  refresh: Subject<any> = new Subject();
  daySelected: Date;
  eventList: CalendarEvent<AbsenceDto>[];
  action: EAbsenceAction;
  canRegister: boolean = false;
  form: FormGroup;
  seleccionado: AbsenceDto;
  colores = colorsDetail;

  /* #region  Calendar properties */
  locale = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  /* #endregion */


  /* #region  fab container */
  fbDetail = [
    { icon: 'edit', tool: 'Editar' },
    { icon: 'delete', tool: 'Eliminar' },
    { icon: 'save', tool: 'Guardar' },
    { icon: 'history', tool: 'Ver historial de estados' },
    { icon: 'close', tool: 'Cancelar' },

  ];
  abDetail = [];
  tsDetail = 'inactive';
  /* #endregion */

  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private gestioniService: GestioniService,
    private controliService: ControliService,
    private spinner: NgxSpinnerService,
    private ngbModal: NgbModal
  ) {
    this.form = this.fb.group({
      nId: [null],
      nIdMotivo: [{ value: '', disabled: true }, Validators.required],
      sObservacion: [{ value: '', disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
    this.onToggleFab(1, 1);
    this.viewDate = this.data.dvActual;
    this.eventList = this.data.eventos;
    const auxAbsence = this.eventList.find(x => moment(x.start).format('DD-MM-YYYY') == moment().format('DD-MM-YYYY'))?.meta;
    this.dayClicked(null, this.data.absence ? this.data.absence : auxAbsence);
  }

  /* #region  Bloqueo de opciones del Fab */
  disableFab(index: number): boolean {
    switch (index) {
      case 0: return !this.daySelected || this.action == EAbsenceAction.REGISTRAR || this.seleccionado?.nIdEstado != EControlAbsenceEstado.PENDIENTE;
      case 1: return !this.daySelected || this.action == EAbsenceAction.REGISTRAR || !this.canDelete;
      case 2: return !this.daySelected || this.action == EAbsenceAction.MODIFICAR || !this.canRegister;
      case 3: return !this.seleccionado;
      case 4: return !this.daySelected || this.action == EAbsenceAction.MODIFICAR || !this.canRegister || (this.nIdMotivoCtrl.invalid && this.sObservacionCtrl.invalid);
    }
  }
  /* #endregion */

  get canDelete(): boolean { return moment().diff(this.daySelected, 'days') <= 1 }
  checkDate(start: Date, end: Date): boolean {
    const fechaFin = end && moment(end).isBefore(this.data.dvActual) ? end : this.data.dvActual;
    return moment(this.daySelected).isBetween(start, fechaFin, undefined, '[]');
  }

  /* #region  FormControls */
  get nIdCtrl(): FormControl { return this.form.get('nId') as FormControl }
  get nIdMotivoCtrl(): FormControl { return this.form.get('nIdMotivo') as FormControl }
  get sObservacionCtrl(): FormControl { return this.form.get('sObservacion') as FormControl }
  /* #endregion */

  /* #region Validaciones */
  get nIdMotivoError(): string { return this.nIdMotivoCtrl.hasError('required') ? '.Obligatorio' : null }
  get sObservacionError(): string { return this.sObservacionCtrl.hasError('required') ? '.Obligatorio' : null }
  /* #endregion */

  /* #region  ToogleButton */
  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = stat === -1 ? (this.abDetail.length > 0 ? 0 : 1) : stat;
        this.tsDetail = stat === 0 ? "inactive" : "active";
        this.abDetail = stat === 0 ? [] : this.fbDetail;
        break;
    }
  }
  /* #endregion */

  /* #region  Acciones de los botones */
  clickFab(index: number) {
    switch (index) {
      case 0: this.editAbsence()
        break;
      case 1: this.deleteAbsence()
        break;
      case 2: this.saveAbsence()
        break;
      case 3: this.openHistorico()
        break;
      default: this.fnClean()
    }
  }
  /* #endregion */

  /* #region  método de que realiza una acción cuando se da click a un día del calendario o termina un método del crud */
  dayClicked(event: CalendarMonthViewDay, absence?: AbsenceDto): void {
    this.daySelected = event ? event.date : absence ? absence.dFecha : this.daySelected;
    this.canRegister = this.checkDate(this.data.personal.dFechaIni, this.data.personal.dFechaFin);
    if (event?.events?.length > 0 || absence) {
      this.seleccionado = absence ? absence : event.events[0].meta;
      this.seleccionado.color = colorsDetail[this.seleccionado.nIdEstado - EControlAbsenceEstado.PENDIENTE].primary;
      this.action = EAbsenceAction.MODIFICAR;
      const { dFecha, sMotivo, ...item } = this.seleccionado;
      this.fnBlock();
      this.form.patchValue(item);
    } else {
      this.seleccionado = null;
      this.canRegister ? this.editAbsence() : this.fnBlock();
      this.form.reset();
    }
  }
  /* #endregion */

  /* #region  Inicia el modo actualización */
  editAbsence(): void {
    this.action = EAbsenceAction.REGISTRAR;
    Object.values(this.form.controls).map(control => { control.enable() });
  }
  /* #endregion */

  /* #region  Método que elimina una inasistencia elimina una inasistencia */
  deleteAbsence(): void {
    const pregunta = '¿ Está seguro de eliminar la inasistencia ?';
    Swal.fire(new Question(pregunta) as unknown).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show("spi_new");
        const id = Number(this.nIdCtrl.value);
        this.gestioniService.delete(id).then(
          res => {
            if (res) {
              Swal.fire({ icon: 'success', title: ('Correcto'), text: `Se eliminó exitosamente`, showConfirmButton: false, timer: 2000 });
              this.fnLoadAbsences(null);
            }
          }
        ).finally(() => this.spinner.hide("spi_new"));
      }
    });
  }
  /* #endregion */

  /* #region  Método que registra o actualiza una inasistencia */
  saveAbsence(): void {
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach(control => { control.markAllAsTouched() })
    }
    const id = Number(this.nIdCtrl.value);
    const request = new AbsenceRequest(this.form.value, this.storageData, this.data.personal.nIdPersonal, this.data.nIdResponsable, this.daySelected)
    this.spinner.show("spi_new");
    (id == 0 ? this.gestioniService.create(request) : this.gestioniService.update(request, id)).then(res => {
      if (res) {
        if (id == 0) {
          Swal.fire({ icon: 'success', title: ('Correcto'), text: `Se registró exitosamente`, showConfirmButton: false, timer: 2000 });
        }
        else {
          res.nIdEstado = EControlAbsenceEstado.PENDIENTE;
          Swal.fire({ icon: 'success', title: ('Correcto'), text: `Se actualizó exitosamente`, showConfirmButton: false, timer: 2000 });
        }
        this.fnLoadAbsences(res);
      }
    }).finally(() => this.spinner.hide("spi_new"));
  }
  /* #endregion */

  /* #region  método que carga las inasistencias del personal */
  fnLoadAbsences(absence?: AbsenceDto): void {
    this.spinner.show('spi_new');
    this.gestioniService.GetAbsencesByPersonal(this.data.personal.nIdPersonal).then(res => {
      this.eventList = this.gestioniService.fnMapCalendarEvent(res ? res : []);
      this.refresh.next();
      this.dayClicked(null, absence);
    }).finally(() => this.spinner.hide('spi_new'));
  }
  /* #endregion */

  fnBlock(): void {
    Object.values(this.form.controls).map(control => { control.disable() });
  }

  fnClean(): void {
    if (this.seleccionado) {
      const { dFecha, sMotivo, ...item } = this.seleccionado;
      this.form.reset(item);
      this.dayClicked(null, this.seleccionado);
    } else {
      this.form.reset();
    }
  }

  fnCloseModal(): void {
    this.activeModal.close();
  }

  /* #region  métod que apertura el histórico de cambios que tiene una inasistencia */
  openHistorico(): void {
    this.spinner.show('spi_new');
    this.controliService.GetAbsenceChanges(this.seleccionado.nId).then(
      res => {
        const modalChanges = this.ngbModal.open(ControliChangesComponent, new ModalOptions('lg'));
        modalChanges.componentInstance.data = {
          'changes': res ? res : [],
          'daySelected': this.daySelected
        };
      }
    ).finally(() => this.spinner.hide('spi_new'));
  }
  /* #endregion */
}
