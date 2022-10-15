import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ti-dialog-archivo-asignacion-activo',
  templateUrl: './ti-dialog-archivo-asignacion-activo.component.html',
  styleUrls: ['./ti-dialog-archivo-asignacion-activo.component.css']
})
export class TiDialogArchivoAsignacionActivoComponent implements OnInit {

  formArchivo: FormGroup;
  vArchivoSeleccioado: File[] = [];
  fileString = '';
  extension = '';
  urlImage;
  constructor(
    private formBuilder: FormBuilder,
    private domSanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<TiDialogArchivoAsignacionActivoComponent>,
  ) { }

  ngOnInit(): void {
    this.formArchivo = this.formBuilder.group({
      fileUpload: ['', Validators.required]
    });
  }

  async fnSeleccionarArchivo(event, lbl: any) {
    this.vArchivoSeleccioado = event.target.files;
    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    if (this.vArchivoSeleccioado.length != 0) {
      document.getElementById(lbl).innerHTML = this.vArchivoSeleccioado[0].name;
      var nombre = this.vArchivoSeleccioado[0].name.split('.');
      this.extension = nombre[nombre.length - 1]
      reader.readAsBinaryString(this.vArchivoSeleccioado[0]);
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;

    this.fileString = btoa(binaryString);
    //this.urlImage = this.domSanitizer.bypassSecurityTrustUrl('data:image/' + this.extension + ';base64,' + this.fileString)
  }


  async fnAgregarImagen() {
    if (this.fileString == '') {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Seleccione una imagen.',
      });
      return;
    }

    const { value: observacion, isConfirmed } = await Swal.fire({
      text: 'Ingrese la observación encontrada en el artículo',
      input: 'textarea',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar',
      cancelButtonColor: '#d33',
      imageUrl: 'data:image/' + this.extension + ';base64,' + this.fileString,
      imageWidth: 250,
      imageHeight: 250,
      allowOutsideClick: () => { return false },
    })

    if (isConfirmed) {
      let data = {
        fileString: this.fileString,
        extension: this.extension,
        urlImage: this.urlImage,
        sObservacion: observacion
      }
      this.dialogRef.close(data)
    }

  }
}
