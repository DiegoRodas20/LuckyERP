import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ISelectItem, ModalOptions, SecurityErp } from 'src/app/modulos/AAHelpers';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { EAbsence } from '../../Model/Igestioni';
import { ControlPersonalDto, EControlAbsence, EModalControlAbsence } from '../../Model/lcontroli';
import { ControliService } from '../../Services/controli.service';
import { GestioniService } from '../../Services/gestioni.service';
import { ControliManagementComponent } from './modals/controli-management/controli-management.component';
import { ControliSearchComponent } from './modals/controli-search/controli-search.component';

@Component({
  selector: 'app-controli',
  templateUrl: './controli.component.html',
  styleUrls: ['./controli.component.css', './controli.component.scss'],
  animations: [adminpAnimations]
})
export class ControliComponent implements OnInit {
  storageData: SecurityErp = new SecurityErp();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource: MatTableDataSource<ControlPersonalDto>;
  displayedColumns: string[];
  planillas: ISelectItem[];
  sucursales: ISelectItem[];
  dDevengueActual: Date = new Date();
  form: FormGroup;
  sIdPais: string;
  nIdEmpresa: number;
  isDevengueActual: boolean = true;

  fbMain = [
    { icon: 'person_add', tool: 'Buscar personal' }
  ];
  abMain = [];
  tsMain = 'inactive';

  /* #region   Asignación nombres de campos y columnas*/
  cols: any[] = [
    { header: 'Opción', field: 'accion', type: 'accion', width: '50', align: 'center', hide: false },
    { header: 'Apellidos y Nombres', field: 'sNombreCompleto', type: 'fNomOrDoc', width: '200', align: 'left', hide: true },
    { header: 'Planilla', field: 'sCodPlla', type: null, width: '50', align: 'center', hide: true },
    { header: 'Tipo Doc.', field: 'sTipoDoc', type: 'fNomOrDoc', width: '80', align: 'center', hide: true },
    { header: 'Documento', field: 'sDocumento', type: null, width: '80', align: 'center', hide: true },
    { header: 'F. Ingreso', field: 'sFechaIni', type: null, width: '80', align: 'center', hide: true },
    { header: 'F. Cese', field: 'sFechaFin', type: null, width: '80', align: 'center', hide: true },
    { header: 'Sucursal', field: 'sSucursal', type: null, width: '100', align: 'center', hide: true },
    { header: 'Responsable', field: 'sResponsable', type: 'fResponsable', width: '200', align: 'left', hide: true },
    { header: 'Inasistencias', field: 'nCantIna', type: null, width: '70', align: 'center', hide: false },
    { header: 'Estado', field: 'sEstado', type: null, width: '70', align: 'center', hide: false }
  ];
  /* #endregion */

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private controliService: ControliService,
    private gestioniService: GestioniService,
    private ngbModal: NgbModal
  ) {
    this.initForm();
    this.displayedColumns = this.cols.map(col => col.field);
    this.sIdPais = this.storageData.getPais();
    this.nIdEmpresa = Number(this.storageData.getEmpresa());
  }

  ngOnInit(): void {
    this.onToggleFab(1, 1);
    this.loadCombos();
    this.loadPersonal();
  }

  get dFechaCtrl(): FormControl { return this.form.get('dFecha') as FormControl }
  get sNomOrDocCtrl(): FormControl { return this.form.get('sNomOrDoc') as FormControl }
  get sResponsableCtrl(): FormControl { return this.form.get('sResponsable') as FormControl }
  get hideMessageEmpty(): boolean { return this.dataSource && this.dataSource.filteredData.length > 0 }


  /* #region  Inicialización del form */
  initForm(): void {
    this.form = this.fb.group({
      dFecha: null,
      sNomOrDoc: [''],
      sCodPlla: [''],
      nIdSucursal: [''],
      sResponsable: ['']
    });
    this.changeFilter();
  }
  /* #endregion */

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
      const f1 = !filter.sNomOrDoc || data.sNombreCompleto.toLowerCase().includes(filter.sNomOrDoc) || data.sDocumento.includes(filter.sNomOrDoc);
      const f2 = !filter.sCodPlla || data.sCodPlla == filter.sCodPlla;
      const f3 = !filter.nIdSucursal || data.nIdSucursal == Number(filter.nIdSucursal);
      const f4 = !filter.sResponsable || data.sResponsable.toLowerCase().includes(filter.sResponsable);
      return f1 && f2 && f3 && f4;
    };
  }
  /* #endregion */

  /* #region  ToogleButton */
  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = stat === -1 ? (this.abMain.length > 0 ? 0 : 1) : stat;
        this.tsMain = stat === 0 ? "inactive" : "active";
        this.abMain = stat === 0 ? [] : this.fbMain;
        break;
    }
  }
  /* #endregion */

  clickFab(index: number) {
    switch (index) {
      case 0: this.showModal(2);
        break;
    }
  }

  chosenYearHandler(normalizedYear: Moment) {
    let ctrlValue = !this.dFechaCtrl.value ? moment() : this.dFechaCtrl.value;
    ctrlValue.year(normalizedYear.year());
    this.dFechaCtrl.setValue(ctrlValue, { emitEvent: false });
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = !this.dFechaCtrl.value ? moment() : this.dFechaCtrl.value;
    ctrlValue.month(normalizedMonth.month());
    this.dFechaCtrl.setValue(ctrlValue);
    datepicker.close();
    this.isDevengueActual = moment(this.dDevengueActual).format('MM-YYYY') == moment(this.dFechaCtrl.value.toDate()).format('MM-YYYY')
    this.loadPersonal(ctrlValue.toDate());
  }

  loadPersonal(dDevengue?: Date): void {
    this.spinner.show('spi_new');
    this.controliService.GetAllSearch(this.nIdEmpresa, dDevengue).then(res => {
      this.dataSource = new MatTableDataSource<ControlPersonalDto>(res.personalList);
      this.dataSource.paginator = this.paginator;
      this.dDevengueActual = res.dDevengueActual ? res.dDevengueActual : this.dDevengueActual;
      !dDevengue ? this.dFechaCtrl.setValue(moment(this.dDevengueActual), { emitEvent: false }) : null;
      this.loadFilters();
    }).finally(() => this.spinner.hide('spi_new'))
  }

  /* #region  Carga de filtros en combo */
  async loadCombos() {
    this.spinner.show('spi_new');
    await this.controliService.getAllItems(EControlAbsence.PLANILLA, this.nIdEmpresa, this.sIdPais).then(
      res => { this.planillas = res });
    await this.controliService.getAllItems(EControlAbsence.SUCURSAL, this.nIdEmpresa, this.sIdPais).then(
      res => { this.sucursales = res });
  }
  /* #endregion */

  showModal(type: EModalControlAbsence, row?: ControlPersonalDto, isNew?: boolean): void {
    switch (type) {
      case EModalControlAbsence.REVIEW:
        const dDevengue = moment(this.dFechaCtrl.value).toDate();
        const p1 = isNew ? null : this.controliService.GetAbsencesByPersonal(row.nIdPersonal, this.nIdEmpresa, dDevengue);
        const p2 = this.controliService.getAllItems(EControlAbsence.ESTADO, this.nIdEmpresa, this.sIdPais);
        const p3 = this.gestioniService.getAllItems(EAbsence.MOTIVO);

        this.spinner.show('spi_new');
        Promise.all([p1, p2, p3]).then(
          ([resAbsences, resEstados, resMotivos]) => {
            const paramEvents = isNew ? [] : this.controliService.fnMapCalendarEvent(resAbsences ? resAbsences : []);
            const modal = this.ngbModal.open(ControliManagementComponent, new ModalOptions());
            modal.componentInstance.data = {
              'personal': row,
              'eventos': paramEvents,
              'dDevengue': dDevengue,
              'estados': resEstados,
              'motivos': resMotivos,
              'isDevengueActual': this.isDevengueActual
            };
            modal.result.then(() => { this.loadPersonal(this.dFechaCtrl.value.toDate()) });
          }
        ).finally(() => { this.spinner.hide('spi_new') });
        break;
      case EModalControlAbsence.SEARCH:
        this.spinner.show('spi_new');
        this.controliService.GetSearchPersonal(this.nIdEmpresa).then(
          res => {
            const modal = this.ngbModal.open(ControliSearchComponent, new ModalOptions());
            modal.componentInstance.data = res ? res : [];
            modal.result.then(() => { this.loadPersonal(this.dFechaCtrl.value.toDate()) });
          }
        ).finally(() => this.spinner.hide('spi_new'))
        break;
    }

  }

}
