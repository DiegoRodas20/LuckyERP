import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  templateUrl: './ti-articulo-imagen.component.html',
  styleUrls: ['./ti-articulo-imagen.component.css']
})
export class TiArticuloImagenComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TiArticuloImagenComponent>
    ) {
    this.form = this.fb.group({
      sType: [''],
      sArchivo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  get sArchivoField(): FormControl { return this.form.get('sArchivo') as FormControl };
  get sTypeField(): FormControl { return this.form.get('sType') as FormControl };

  selectFile(file: File, lbl: any): void {
    if (file) {
      const allowedExtensions = /(.png|.jpg|.jpeg)$/i; // Especifica que extensiones están permitidas
      if (!allowedExtensions.exec(file.name)) { // Valida la extensión en el nombre del archivo
        Swal.fire('Error:', 'Solo son permitidos archivos con las extensiones .png/.jpg/.jpeg', 'error');
        document.getElementById(lbl.id).innerHTML = 'Seleccione Imagen:';
        return;
      }
      const reader = new FileReader();
      reader.onload = this._handleReaderLoaded.bind(this);
      this.sTypeField.setValue(file.type);
      document.getElementById(lbl.id).innerHTML = file.name;
      reader.readAsBinaryString(file);
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.sArchivoField.setValue(btoa(binaryString));
  }

  aceptar(): void {
    if(this.form.invalid){
      Swal.fire("Error:", "No seleccionó ningún archivo", "error");
      return;
    }
    this.dialogRef.close(this.form.value);
  }

}
