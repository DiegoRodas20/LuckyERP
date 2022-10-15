import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { E_Ajuste_Congelado } from '../../../models/ajusteCongelado';

@Component({
  selector: 'app-ajuste-congelado-get',
  templateUrl: './ajuste-congelado-get.component.html',
  styleUrls: ['./ajuste-congelado-get.component.css']
})
export class AjusteCongeladoGetComponent {
  nPrecio = new FormControl('', [Validators.required, Validators.pattern('^[0-9]*(\\.[0-9]{1,2})?$')]);

  constructor(
    public dialogRef: MatDialogRef<AjusteCongeladoGetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: E_Ajuste_Congelado
  ) { }

  /* #region  Método de envío del nuevo precio */
  fnGuardar() {
    if (this.nPrecio.invalid) {
      return this.nPrecio.markAllAsTouched();
    }
    this.dialogRef.close(this.nPrecio.value);
  }
  /* #endregion */

  /* #region  Validaciones */
  get nPrecioError(): string {
    return this.nPrecio.hasError('required') ? 'Obligatorio' :
      this.nPrecio.hasError('pattern') ? 'Formato incorrecto' : null;
  }
  /* #endregion */
}
