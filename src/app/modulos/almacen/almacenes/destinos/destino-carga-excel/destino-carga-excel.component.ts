import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-destino-carga-excel',
  templateUrl: './destino-carga-excel.component.html',
  styleUrls: ['./destino-carga-excel.component.css']
})
export class DialogDestinoCargaExcelComponent {
  form: FormGroup
  vArchivoSeleccionado: File;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogDestinoCargaExcelComponent>
  ) {
    this.form = this.fb.group({
      fileUpload: ['', Validators.required]
    });
  }

  get nameLabel(): string { // devuelve el label de la caja de texto del archivo
    return this.form.invalid ? 'Seleccione Archivo:' : this.vArchivoSeleccionado?.name;
  }

  get fileUploadField(): FormControl { // Retorna el FormControl del fileUpload
    return this.form.get('fileUpload') as FormControl;
  }

  get fileUploadError(): string { // Retorna el mensaje de error del fileUpload
    return this.fileUploadField.hasError('required') && this.fileUploadField.touched ? '.Obligatorio' : null;
  }

  /* #region  Obtiene el archivo */
  fnSeleccionarArchivo(event: any): void {
    const allowedExtensions = /(.xls|.xlsx|.xlsm)$/i; // Especifica que extensiones están permitidas
    if (!allowedExtensions.exec(this.fileUploadField.value)) { // Valida la extensión en el nombre del archivo
      Swal.fire("Error:", "Solo son permitidos archivos con las extensiones .xls/.xlsx/.xlsm", "error");
      this.fileUploadField.setValue('');
      return;
    }

    this.vArchivoSeleccionado = event.target.files[0] as File;
  }
  /* #endregion */

  /* #region  Sube el archivo */
  fnUploadFile(): void {
    if (this.form.invalid) {
      Swal.fire("Error:", "No seleccionó ningún archivo", "error");
      return Object.values(this.form.controls).forEach((controls) => {
        controls.markAllAsTouched();
      });
    }
    this.dialogRef.close(this.vArchivoSeleccionado);
  }
  /* #endregion */

}
