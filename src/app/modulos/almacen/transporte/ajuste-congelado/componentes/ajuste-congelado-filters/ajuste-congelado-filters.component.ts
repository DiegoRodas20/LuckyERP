import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import moment from 'moment';
import { IFiltersAjusteCongelado } from '../../../models/ajusteCongelado';
import { ISelectItem } from '../../../models/constantes';

@Component({
  selector: 'app-ajuste-congelado-filters',
  templateUrl: './ajuste-congelado-filters.component.html',
  styleUrls: ['./ajuste-congelado-filters.component.css']
})
export class AjusteCongeladoFiltersComponent {
  @Input() empresas: ISelectItem[];
  @Input() presupuestos: ISelectItem[];
  form: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nIdEmpresa: [Number(localStorage.getItem('Empresa'))],
      sNroTransporte: [''],
      nIdPresupuesto: [null],
      dtFecha: [moment()]
    });
  }

  /* #region  Método de retorno de valores del formulario */
  get filters(): IFiltersAjusteCongelado {
    return this.form.value;
  }
  /* #endregion */

  /* #region  FormControls */
  get txtCodTransporte(): FormControl {
    return this.form.get('sNroTransporte') as FormControl;
  }

  get txtFecha(): FormControl {
    return this.form.get('dtFecha') as FormControl;
  }
  /* #endregion */

  /* #region  Método de limpieza del filtro de código de transporte y de la fecha */
  fnCleanCodTransporte(): void {
    this.txtCodTransporte.setValue('');
  }

  fnCleanFecha(): void {
    this.txtFecha.setValue(null);
  }
  /* #endregion */

  /* #region  Método de limpieza de los filtros */
  fnCleanFilters(): void {
    this.form.patchValue({
      nIdEmpresa: Number(localStorage.getItem('Empresa')),
      sNroTransporte: '',
      nIdPresupuesto: null,
      dtFecha: moment()
    });
  }
  /* #endregion */
}
