import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import Swal from 'sweetalert2';
import { isNullOrUndefined } from 'util';
import { HelpersService } from '../../../helpers.service';
import { ISelectItem, Question } from '../../../models/constantes';
import { E_Liquidacion_Transporte } from '../../../models/liquidacionTransporte';

@Component({
  selector: 'app-liquidacion-transporte-header',
  templateUrl: './liquidacion-transporte-header.component.html',
  styleUrls: ['./liquidacion-transporte-header.component.css']
})
export class LiquidacionTransporteHeaderComponent {
  @Output() sendCodTransporte: EventEmitter<string> = new EventEmitter<string>();
  @Output() sendParameter: EventEmitter<string> = new EventEmitter<string>();
  @Output() sendGuias: EventEmitter<void> = new EventEmitter<void>();
  @Output() sendAnio: EventEmitter<number> = new EventEmitter<number>();
  @Output() sendOperModal: EventEmitter<string> = new EventEmitter<string>();
  @Output() sendVerModal: EventEmitter<string> = new EventEmitter<string>();
  @Output() sendLiberar: EventEmitter<string> = new EventEmitter<string>();
  @Input() motivos: ISelectItem[];
  @Input() codigos: ISelectItem[];
  @Input() anios: ISelectItem[];
  @Input() liquidacion: E_Liquidacion_Transporte;
  @Input() hasGuias: boolean;
  sCodTransporteField = new FormControl('', [Validators.required, Validators.minLength(7), Validators.pattern('^\\d+$')]);
  nAnioField = new FormControl(moment().year());
  form: FormGroup;
  maxNroTransporte: number = 7;
  hasChanges: boolean = false;
  isTotalLiquidado: boolean = false;

  constructor(
    private fb: FormBuilder,
    private helper: HelpersService
  ) {
    const validatorPrice = Validators.pattern('^[0-9]*(\\.[0-9]{1,4})?$');
    this.form = this.fb.group({
      nPreBase: [{ value: null, disabled: true }, [Validators.required, validatorPrice, this.helper.mayorACero]],
      nPreCarreta: [{ value: null, disabled: true }, validatorPrice],
      nPrePeaje: [{ value: null, disabled: true }, validatorPrice],
      nPreEstacion: [{ value: null, disabled: true }, validatorPrice],
      nPreAyudante: [{ value: null, disabled: true }, validatorPrice],
      nTotal: { value: null, disabled: true },
      nMotivo: { value: 0, disabled: true }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.liquidacion == null) {
      this.fnClean();
    }
    if (changes.liquidacion && this.liquidacion) {
      this.form.patchValue({
        nPreBase: this.liquidacion.nPrecioBase.toFixed(4),
        nPreCarreta: this.liquidacion.nPrecioCarreta.toFixed(4),
        nPrePeaje: this.liquidacion.nPrecioPeaje.toFixed(4),
        nPreEstacion: this.liquidacion.nPrecioEstacionamiento.toFixed(4),
        nPreAyudante: this.liquidacion.nPrecioAyudante.toFixed(4),
        nTotal: this.liquidacion.nPrecioTotal.toFixed(4),
        nMotivo: this.liquidacion.nIdMotivoCambioPrecio
      });
      Object.values(this.form.controls).forEach(control => {
        this.liquidacion.bTerminado ? control.disable() : control.enable();
      });
      if (this.liquidacion.nPrecioTotal == 0) { this.fnPlusValues() };
    }
  }

  /* #region  FormControls */
  get nPreBaseField(): FormControl { return this.form.get('nPreBase') as FormControl }
  get nPreCarretaField(): FormControl { return this.form.get('nPreCarreta') as FormControl }
  get nPrePeajeField(): FormControl { return this.form.get('nPrePeaje') as FormControl }
  get nPreEstacionField(): FormControl { return this.form.get('nPreEstacion') as FormControl }
  get nPreAyudanteField(): FormControl { return this.form.get('nPreAyudante') as FormControl }
  get nTotalField(): FormControl { return this.form.get('nTotal') as FormControl }
  get nMotivoField(): FormControl { return this.form.get('nMotivo') as FormControl }
  /* #endregion */

  /* #region Validaciones */
  get sCodTransporteError(): string {
    return this.sCodTransporteField.hasError('required') ? 'Obligatorio' :
      this.sCodTransporteField.hasError('pattern') ? 'Solo números' :
        this.sCodTransporteField.hasError('minlength') ? '7 dígitos requeridos' : null;
  }
  get nPreBaseError(): string {
    return this.nPreBaseField.hasError('required') ? 'Obligatorio' :
      this.nPreBaseField.hasError('pattern') ? 'Formato Incorrecto' :
        this.nPreBaseField.hasError('mayorACeroValidator') ? this.nPreBaseField.errors.mayorACeroValidator : null;
  }
  get nPreCarretaError(): string { return this.nPreCarretaField.hasError('pattern') ? 'Formato Incorrecto' : null }
  get nPrePeajeError(): string { return this.nPrePeajeField.hasError('pattern') ? 'Formato Incorrecto' : null }
  get nPreEstacionError(): string { return this.nPreEstacionField.hasError('pattern') ? 'Formato Incorrecto' : null }
  get nPreAyudanteError(): string { return this.nPreAyudanteField.hasError('pattern') ? 'Formato Incorrecto' : null }
  /* #endregion */

  /* #region  Método de envío del código del transporte */
  fnGetLiquidacion(): void {
    if (this.sCodTransporteField.invalid) {
      return this.sCodTransporteField.markAllAsTouched();
    }
    this.sendCodTransporte.emit(this.sCodTransporteField.value);
  }
  /* #endregion */

  /* #region  Función que suma automáticamente los precios y retorna un total */
  fnPlusValues(): void {
    const suma = Object.values(this.form.controls).reduce((acumulador, control, index) =>
      acumulador + (index < 5 && control.valid ? Number(control.value) : 0)
      , 0);
    this.nTotalField.setValue(suma.toFixed(4));
  }
  /* #endregion */

  /* #region  Método de envío de los valores del formulario concatenados */
  fnGuardar(): void {
    if (this.form.invalid) {
      return Object.values(this.form.controls).forEach(control => { control.markAllAsTouched() })
    }
    const datos = Object.values(this.form.controls).reduce((acc, control) => {
      acc.push(isNullOrUndefined(control.value) ? 0 : control.value); return acc
    }, []);
    const parameters = `${this.liquidacion.nId}|${datos.join('|')}`;
    this.sendParameter.emit(parameters);
  }
  /* #endregion */

  fnLiquidar(): void {
    if (this.liquidacion.sChofer == null) {
      Swal.fire({ title: 'EL transporte requiere registrar un chofer', icon: 'warning', timer: 2000 });
      return;
    }
    this.sendGuias.emit(this.sCodTransporteField.value);
  }
  fnChangeAnio(): void {
    this.sendAnio.emit(this.nAnioField.value);
  }
  fnTerminar(): void {
    this.sendOperModal.emit(this.sCodTransporteField.value);
  }
  fnVerProrrateos(): void {
    this.sendVerModal.emit(this.sCodTransporteField.value);
  }
  fnLiberar(): void {
    Swal.fire(new Question() as unknown).then((result) => {
      if (result.isConfirmed) {
        this.sendLiberar.emit(this.sCodTransporteField.value);
      }
    });
  }

  /* #region  Método de limpieza del formulario */
  fnClean(): void { this.form.reset() }
  /* #endregion */

  get hasData(): boolean { return this.liquidacion ? true : false }
  get isTerminado(): boolean { return this.liquidacion.bTerminado }

  /* #region  Método de limpieza del filtro de código de transporte */
  fnCleanCodTransporte(): void { this.sCodTransporteField.setValue('') }
  /* #endregion */

  /* #region  Método que modifica el estado del transporte en el select */
  fnUpdateEstado(sEstado: string) {
    this.codigos.find(item => item.nId == this.sCodTransporteField.value).sDescripcion = sEstado;
    this.liquidacion.sEstado = sEstado;
  }
  /* #endregion */
}
