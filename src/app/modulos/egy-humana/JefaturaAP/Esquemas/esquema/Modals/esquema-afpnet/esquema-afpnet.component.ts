import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MatOption, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { EsquemasService } from '../../../../Services/esquemas.service';
import { EEsquema, EsquemaAfpNetFilter, EsquemaColumn } from '../../../../Model/esquemas';
import { ISelectItem, SecurityErp } from 'src/app/modulos/AAHelpers';
import { MatSelect } from '@angular/material/select';
import { MatListOption } from '@angular/material/list';
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-esquema-afpnet',
  templateUrl: './esquema-afpnet.component.html',
  styleUrls: ['./esquema-afpnet.component.css'],
  providers: [{
    provide: DateAdapter,
    useClass: MomentDateAdapter,
    deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
  },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },],
  animations: [adminpAnimations]
})

export class EsquemaAfpnetComponent implements OnInit {
  @Input() data: {
    nroEsquema: number;
    seleccionados: string[],
    fgFilter: unknown
  };
  storageData: SecurityErp = new SecurityErp();
  fieldsCtrl = new FormControl('');
  regPensionarios: ISelectItem[];
  usuarios: ISelectItem[];
  form: FormGroup;

  /* #region  Fab */
  fbDetail = [
    { icon: 'search', tool: 'Buscar', dis: false },
    { icon: 'cancel', tool: 'Cancelar', dis: false }
  ];
  abDetail = [];
  tsDetail = 'inactive';
  /* #endregion */

  constructor(
    private activeModal: NgbActiveModal,
    private spi: NgxSpinnerService,
    private fb: FormBuilder,
    private esquemaService: EsquemasService
  ) {
    this.form = this.fb.group({
      dFechaDesde: [null, Validators.required],
      dFechaHasta: [null, Validators.required],
      nRegPensionario: [null, Validators.required],
      nCodUser: [0]
    });
  }

  /* #region   Asignación nombres de campos y columnas*/
  fields: EsquemaColumn[] = [
    { header: 'Apellidos y Nombres', field: 'sNombreCompleto', type: 'title', width: 200, align: 'left', disable: true },
    { header: 'Tipo Doc.', field: 'sTipoDocumento', type: null, width: 80, align: 'center', disable: false },
    { header: 'Documento', field: 'sNumeroDocumento', type: null, width: 80, align: 'center', disable: false },
    {
      header: 'Periodo Laboral', field: 'sPeriodo',
      columns: [
        { header: 'F. Ingreso', field: 'sFechaIni', type: null, width: 80, align: 'center' },
        { header: 'F. Cese', field: 'sFechaFin', type: null, width: 80, align: 'center' }
      ]
    },
    { header: 'Planilla', field: 'sCodPlla', type: null, width: 50, align: 'center', disable: false },
    { header: 'Régimen Pensionario', field: 'sNombreAfp', type: null, width: 100, align: 'center', disable: true },
    { header: 'Cargo', field: 'sCargo', type: null, width: 100, align: 'left', disable: false },
    { header: 'Sucursal', field: 'sCiudad', type: null, width: 100, align: 'left', disable: false }
  ];

  permanentes: EsquemaColumn[] = [
    { header: 'Importe', field: 'nImporte', type: null, width: 100, align: 'center' },
    { header: 'Usuario', field: 'sUserReg', type: null, width: 100, align: 'center' },
    { header: 'Fecha', field: 'sFechaReg', type: null, width: 100, align: 'center' }
  ];
  /* #endregion */

  ngOnInit() {
    this.onToggleFab(1, 1);
    const p1 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.AfpNet.REGIMEN_PENSIONARIO);
    const p2 = this.esquemaService.getAllItems(this.data.nroEsquema, EEsquema.AfpNet.USUARIO);
    this.spi.show('spi_new');
    Promise.all([p1, p2]).then(
      ([resRegPensionarios, resUsuarios]) => {
        this.regPensionarios = resRegPensionarios ? resRegPensionarios : []
        this.usuarios = resUsuarios ? resUsuarios : []
        const lstReg = this.regPensionarios.map(item => Number(item.nId));
        lstReg.splice(0, 0, 0);
        this.nRegPensionarioCtrl.setValue(lstReg, { emitEvent: false });
        this.data.fgFilter ? this.form.patchValue(this.data.fgFilter) : null;
      }
    ).finally(() => { this.spi.hide('spi_new') });
    const lst = this.data.seleccionados?.length > 0 ? this.fields.filter(item => this.data.seleccionados.includes(item.field)) : this.fields.filter(item => item.disable);
    this.fieldsCtrl.setValue(lst, { emitEvent: false });
  }

  get dFechaDesdeCtrl(): FormControl { return this.form.get('dFechaDesde') as FormControl }
  get dFechaHastaCtrl(): FormControl { return this.form.get('dFechaHasta') as FormControl }
  get nRegPensionarioCtrl(): FormControl { return this.form.get('nRegPensionario') as FormControl }

  /* #region Validaciones */
  get nRegPensionarioError(): string { return this.nRegPensionarioCtrl.hasError('required') && this.nRegPensionarioCtrl.touched ? 'Seleccione mínimo un régimen pensionario' : null }
  get dFechaDesdeError(): string { return this.dFechaDesdeCtrl.hasError('required') && this.dFechaDesdeCtrl.touched ? 'Seleccione un inicio' : null }
  get dFechaHastaError(): string { return this.dFechaHastaCtrl.hasError('required') && this.dFechaHastaCtrl.touched ? 'Seleccione un fin' : null }
  /* #endregion */

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = (stat === -1) ? (this.abDetail.length > 0) ? 0 : 1 : stat;
        this.tsDetail = (stat === 0) ? 'inactive' : 'active';
        this.abDetail = (stat === 0) ? [] : this.fbDetail;
        break;
    }
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnSearch();
        break;
      case 1:
        this.activeModal.dismiss();
        break;
    }
  }

  chosenFecha(normalized: Moment, formControl: FormControl, datepicker?: MatDatepicker<Moment>) {
    let ctrlValue = !formControl.value ? moment() : formControl.value;
    datepicker ? ctrlValue.month(normalized.month()) : ctrlValue.year(normalized.year());
    formControl.setValue(ctrlValue, { emitEvent: false });
    datepicker?.close();
  }

  toggleAllSelectionField(allSelected: MatListOption) {
    if (allSelected.selected) {
      this.fieldsCtrl.patchValue([0, ...this.fields]);
    } else {
      const vFields = this.fields.filter(item => item.disable);
      this.fieldsCtrl.patchValue(vFields);
    }
  }

  toggleAllSelection(matSelect: MatSelect) {
    const isSelected = matSelect.options.filter((item: MatOption) => item.value === 0).map((item: MatOption) => item.selected)[0];
    if (isSelected) {
      matSelect.options.map((item: MatOption) => item.select());
    } else {
      matSelect.options.map((item: MatOption) => item.deselect());
    }
  }

  fnSearch(): void {
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach(control => { control.markAllAsTouched() })
    }
    const vFields = this.fieldsCtrl.value;
    isNaN(vFields[0]) ? null : vFields.splice(0, 1);
    this.permanentes.reduce((a, b) => { a.push(b); return a }, vFields)
    this.spi.show('spi_new');
    const filter = new EsquemaAfpNetFilter(this.form.value, this.storageData);
    this.esquemaService.GetSearchEsquemaAfpNet(filter).then(
      res => {
        const result = { 'fields': vFields, 'data': res ?? [], 'fgFilter': this.form.value }
        this.activeModal.close(result);
      }
    ).finally(() => this.spi.hide('spi_new'));
  }

  fnCloseModal(): void {
    this.activeModal.close();
  }
}
