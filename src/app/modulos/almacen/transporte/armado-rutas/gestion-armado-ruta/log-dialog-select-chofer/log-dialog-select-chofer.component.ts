import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ISelectItem } from '../../../models/constantes';
import { VehiculoModel } from '../../../models/vehiculo.model';

@Component({
  templateUrl: './log-dialog-select-chofer.component.html',
  styleUrls: ['./log-dialog-select-chofer.component.css']
})
export class LogDialogSelectChoferComponent {
  nIdChoferField = new FormControl('', [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<LogDialogSelectChoferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { choferes: ISelectItem[], vehiculo: VehiculoModel },
    private router: Router
  ) {
    const vIdChofer = data.vehiculo.nIdChofer == 0 ? '' : data.vehiculo.nIdChofer;
    this.nIdChoferField.setValue(vIdChofer);
  }

  get nIdChoferError(): string {
    return this.nIdChoferField.hasError('required') && this.nIdChoferField.touched ? 'Seleccione un chofer' : null;
  }

  fnGuardar(): void {
    if (this.nIdChoferField.invalid) {
      return this.nIdChoferField.markAllAsTouched();
    }
    this.dialogRef.close(this.nIdChoferField.value);
  }

  fnOpenRegistroChofer(): void {
    const url = this.router.createUrlTree(["/almacen/transporte/Mantenimiento/empresa-transporte", this.data.vehiculo.nIdEmpresaTrans, false]);
    window.open(url.toString(), '_blank');
    this.dialogRef.close();
  }
}
