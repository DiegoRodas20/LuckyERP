import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarDateFormatter, CalendarEvent, CalendarMonthViewDay, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { colors, colorsDetail, ISelectItem, ModalOptions, Question, SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { CustomDateFormatter } from '../../../../Config/configCalendar';
import { AbsenceRequest } from '../../../../Model/Igestioni';
import { ControlAbsenceDto, ControlAbsenceRequest, EControlAbsenceEstado } from '../../../../Model/lcontroli';
import { ControliService } from '../../../../Services/controli.service';
import { ControliChangesComponent } from '../controli-changes/controli-changes.component';

@Component({
  selector: 'app-controli-management',
  templateUrl: './controli-management.component.html',
  styleUrls: ['./controli-management.component.css', './controli-management.component.scss'],
  providers: [{ provide: CalendarDateFormatter, useClass: CustomDateFormatter }],
  animations: [adminpAnimations]
})
export class ControliManagementComponent implements OnInit {
  @Input() data: {
    personal: any,
    eventos: CalendarEvent<ControlAbsenceDto>[],
    estados: ISelectItem[],
    motivos: ISelectItem[],
    dDevengue: Date,
    isDevengueActual: boolean
  };
  storageData: SecurityErp = new SecurityErp();
  estadoCtrl = new FormControl('');
  eventList: CalendarEvent<ControlAbsenceDto>[];
  refresh: Subject<any> = new Subject();
  viewDate: Date;
  daySelected: Date;
  seleccionado: ControlAbsenceDto;
  colores = colorsDetail;
  form: FormGroup;
  isNew: boolean = false;

  /* #region  Calendar properties */
  locale = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  /* #endregion */

  /* #region  fab container */
  fbDetail = [
    { icon: 'thumb_up_alt', tool: 'Aprobar', show: true },
    { icon: 'thumb_down_alt', tool: 'Desestimar', show: true },
    { icon: 'history', tool: 'Ver historial de estados', show: true },
    { icon: 'playlist_add', tool: 'Agregar inasistencia', show: true },
    { icon: 'close', tool: 'Cancelar', show: true }
  ];
  abDetail = [];
  tsDetail = 'inactive';
  /* #endregion */

  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private controliService: ControliService,
    private spinner: NgxSpinnerService,
    private ngbModal: NgbModal
  ) {
    this.form = this.fb.group({
      nId: [null],
      nIdMotivo: ['', Validators.required],
      sObservacion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.onToggleFab(1, 1);
    this.abDetail = this.abDetail.map((x, index) => index == 2 ? x : { ...x, show: this.data.isDevengueActual });
    this.viewDate = this.data.dDevengue;
    this.eventList = this.data.eventos;
    this.changeEstadoCtrl();
    const lst = this.eventList.filter(item => item.meta.nIdEstado == EControlAbsenceEstado.PENDIENTE);
    const mostrarTodos = !(lst.length > 0 && this.data.isDevengueActual) ? '' : EControlAbsenceEstado.PENDIENTE;
    this.estadoCtrl.setValue(mostrarTodos);
  }

  changeEstadoCtrl(): void {
    this.estadoCtrl.valueChanges.subscribe((value: number) => {

      const changeColorNormal = (item: CalendarEvent<ControlAbsenceDto>) => { return { ...item, color: colorsDetail[item.meta.nIdEstado - EControlAbsenceEstado.PENDIENTE] } };
      const orderDate = (a: CalendarEvent, b: CalendarEvent) => moment(a.start, "MM-DD").unix() - moment(b.start, "MM-DD").unix();
      this.eventList = this.eventList.map(changeColorNormal).sort(orderDate);

      const changeColorNeutro = (item: CalendarEvent<ControlAbsenceDto>) => item.meta.nIdEstado == value ? item : { ...item, color: colors.neutro };
      this.eventList = value ? this.eventList.map(changeColorNeutro) : this.eventList;

      const lst = this.eventList.filter(item => item.meta.nIdEstado == value);
      const absence = value ? value == EControlAbsenceEstado.PENDIENTE ? lst[0]?.meta : lst[lst.length - 1]?.meta : null;
      this.dayClicked(null, absence);
    });
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

  clickFab(index: number) {
    switch (index) {
      case 0: this.fnReview(true);
        break;
      case 1: this.fnReview(false);
        break;
      case 2: this.openHistorico();
        break;
      case 3: this.isNew ? this.registrarAbsence() : this.iniciarRegistro();
        break;
      case 4: this.fnClean();
        break;
    }
  }

  /* #region  Bloqueo de opciones del Fab */
  disableFab(index: number): boolean {
    switch (index) {
      case 0: return !this.seleccionado || this.seleccionado.nIdEstado != EControlAbsenceEstado.PENDIENTE;
      case 1: return !this.seleccionado || this.seleccionado.nIdEstado != EControlAbsenceEstado.PENDIENTE;
      case 2: return !this.seleccionado;
      case 3: return !this.daySelected || this.seleccionado != null;
      case 4: return this.seleccionado && !this.isNew;
    }
  }
  /* #endregion */

  fnCloseModal(): void {
    this.activeModal.close();
  }

  dayClicked(event: CalendarMonthViewDay, absence?: ControlAbsenceDto): void {
    this.daySelected = event ? event.date : absence ? absence.dFecha : this.daySelected;
    if (event?.events?.length > 0 || absence) {
      this.seleccionado = absence ? absence : event.events[0].meta;
      this.seleccionado.color = colorsDetail[this.seleccionado.nIdEstado - EControlAbsenceEstado.PENDIENTE].primary;
    } else {
      this.seleccionado = null;
    }
  }

  fnReview(isApprove: boolean): void {
    const pregunta = `¿ Está seguro de ${isApprove ? 'aprobar' : 'desestimar'} la inasistencia ?`;
    Swal.fire(new Question(pregunta) as unknown).then((result) => {
      if (result.isConfirmed) {
        const request: ControlAbsenceRequest = {
          nIdInasistencia: this.seleccionado.nId,
          nIdEstado: isApprove ? 2612 : 2613,
          nCodUser: Number(this.storageData.getUsuarioId()),
          sIdPais: this.storageData.getPais()
        }
        this.spinner.show('spi_new');
        this.controliService.ReviewAbsence(request).then(
          res => {
            if (res) {
              Swal.fire({ icon: 'success', title: ('Correcto'), text: `Se ${isApprove ? 'aprobó' : 'desestimó'} exitosamente`, showConfirmButton: false, timer: 2000 });
              this.fnLoadAbsences();
            }
          }
        ).finally(() => this.spinner.hide('spi_new'));
      }
    });
  }

  fnLoadAbsences(nId?: number): void {
    this.spinner.show('spi_new');
    this.controliService.GetAbsencesByPersonal(this.data.personal.nIdPersonal, Number(this.storageData.getEmpresa()), this.data.dDevengue).then(res => {
      this.eventList = this.controliService.fnMapCalendarEvent(res ? res : []);
      this.refresh.next();
      if (nId) {
        const absence = res?.find(item => item.nId == nId);
        this.estadoCtrl.setValue('', { emitEvent: false });
        this.dayClicked(null, absence);
        this.fnClean();
        return;
      } else {
        const lst = this.eventList.filter(item => item.meta.nIdEstado == EControlAbsenceEstado.PENDIENTE);
        if (lst?.length == 0) {
          Swal.fire({ icon: 'success', title: ('Correcto'), text: `No hay mas inasistencias pendientes que revisar.`, showConfirmButton: true });
          this.estadoCtrl.setValue('');
          this.daySelected = null;
        } else {
          this.estadoCtrl.setValue(EControlAbsenceEstado.PENDIENTE);
        }
      }

    }).finally(() => this.spinner.hide('spi_new'));
  }

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

  iniciarRegistro(): void {
    this.isNew = true;
    this.estadoCtrl.setValue('');
    this.estadoCtrl.disable({ emitEvent: false });
    this.abDetail = this.abDetail.map((item, index) => index == 3 ? { ...item, icon: 'save', tool: 'Guardar' } : item);
  }

  registrarAbsence(): void {
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach(control => { control.markAllAsTouched() })
    }
    if (!this.daySelected) {
      Swal.fire({ icon: 'warning', title: ('Advertencia'), text: `Seleccione un día para el registro`, showConfirmButton: false, timer: 2000 });
      return;
    }
    const pregunta = `La inasistencia se registrará y aprobará automáticamente\n¿Está seguro de continuar?`;
    Swal.fire(new Question(pregunta) as unknown).then((result) => {
      if (result.isConfirmed) {
        const request = new AbsenceRequest(this.form.value, this.storageData, this.data.personal.nIdPersonal, this.data.personal.nIdResponsable, this.daySelected);
        this.controliService.CreateAbsenceFromPlla(request).then(
          res => {
            if (res) {
              Swal.fire({ icon: 'success', title: ('Correcto'), text: `Se registró y aprobó exitosamente`, showConfirmButton: false, timer: 2000 });
              this.fnLoadAbsences(res.nId);
            }
          }
        ).finally(() => this.spinner.hide('spi_new'));
      }
    });
  }

  fnClean(): void {
    this.isNew = false;
    this.abDetail = this.abDetail.map((item, index) => index == 3 ? { ...item, icon: 'playlist_add', tool: 'Registrar inasistencia' } : item);
    this.estadoCtrl.enable({ emitEvent: false });
    this.form.reset();
  }
}
