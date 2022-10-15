import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarDateFormatter, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import moment, { Moment } from 'moment';
import { colorsDetail, ISelectItem } from 'src/app/modulos/AAHelpers';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { CustomDateFormatter } from '../../../../Config/configCalendar';
import { AbsenceHistoricoDto } from '../../../../Model/Igestioni';

@Component({
  selector: 'app-gestioni-detail',
  templateUrl: './gestioni-detail.component.html',
  styleUrls: ['./gestioni-detail.component.css', './gestioni-detail.component.scss'],
  providers: [{ provide: CalendarDateFormatter, useClass: CustomDateFormatter }],
  animations: [adminpAnimations]
})
export class GestioniDetailComponent implements OnInit {
  @Input() data: { personal: any, historico: AbsenceHistoricoDto[], motivos: ISelectItem[], estados: ISelectItem[] };
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource: MatTableDataSource<AbsenceHistoricoDto>;
  columns: string[];
  expandedMore = null;
  form: FormGroup;
  colores = colorsDetail;

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Devengue', field: 'sDevengue', type: null, width: '100', align: 'center' },
    { header: 'Nro. Inasistencias', field: 'nCantIna', type: null, width: '200', align: 'center' },
    { header: '', field: 'dropdown', type: 'dropdown', width: '50', align: 'center' }
  ];
  /* #endregion */

  /* #region  Calendar properties */
  locale = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.SUNDAY];
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  /* #endregion */

  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      dFecha: null,
      nIdMotivo: ''
    });
    this.columns = this.cols.map(col => col.field);
  }

  ngOnInit(): void {
    this.changeFilter();
    this.dataSource = new MatTableDataSource<AbsenceHistoricoDto>(this.data.historico);
    this.dataSource.paginator = this.paginator;
    this.loadFilters();
  }

  get hideMessageEmpty(): boolean { return this.dataSource && this.dataSource.filteredData.length > 0 }
  get dFechaCtrl(): FormControl { return this.form.get('dFecha') as FormControl }

  /* #region  Suscripción a los cambios que se realicen en los filtros */
  changeFilter() {
    this.form.valueChanges.subscribe(filter => {
      this.dataSource.filter = { ...filter } as string
    });
  }
  /* #endregion */

  /* #region  Designación de predicados para el filtro */
  loadFilters(): void {
    this.dataSource.filterPredicate = (data, filter: any) => {
      const f1 = !filter.nIdMotivo || data.inasistencias.filter(item => item.nIdMotivo === filter.nIdMotivo)?.length > 0;
      const f2 = !filter.dFecha || moment(data.dViewdate).format('MM/YYYY') == moment(filter.dFecha.toDate()).format('MM/YYYY')
      return f1 && f2;
    };
  }
  /* #endregion */

  chosenYearHandler(normalizedYear: Moment) {
    let ctrlValue = !this.dFechaCtrl.value ? moment() : this.dFechaCtrl.value;
    ctrlValue.year(normalizedYear.year());
    this.dFechaCtrl.setValue(ctrlValue, { emitEvent: false });
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = !this.dFechaCtrl.value ? moment() : this.dFechaCtrl.value;
    ctrlValue.month(normalizedMonth.month());
    this.dFechaCtrl.setValue(ctrlValue);
    const devengue = this.data.historico.find(item => moment(item.dViewdate).format('MM/YYYY') == moment(ctrlValue.toDate()).format('MM/YYYY'))
    this.clickExpanded(devengue);
    datepicker.close();
  }

  /* #region  Método de expandir detalle */
  clickExpanded(row: AbsenceHistoricoDto): void { this.expandedMore = this.expandedMore == row ? null : row }
  /* #endregion */

  fnCloseModal(): void {
    this.activeModal.close();
  }

  /* #region  Método de limpieza del auto filtrado */
  fnCleanFecha(): void {
    this.form.controls['dFecha'].setValue(null);
    this.expandedMore = null;
  }
  /* #endregion */
}
