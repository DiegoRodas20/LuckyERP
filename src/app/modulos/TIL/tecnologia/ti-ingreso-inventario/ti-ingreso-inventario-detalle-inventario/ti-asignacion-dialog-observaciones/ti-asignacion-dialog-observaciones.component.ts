import { Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { AsignacionDirectaSeleccionDetalleArchivoDTO } from '../../../api/models/asignacionDirectaDTO';

@Component({
  selector: 'app-ti-asignacion-dialog-observaciones',
  templateUrl: './ti-asignacion-dialog-observaciones.component.html',
  styleUrls: ['./ti-asignacion-dialog-observaciones.component.css']
})
export class TiAsignacionDialogObservacionesComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Formulario
  formObservaciones: FormGroup;

  // Archivo
  nombreArchivo: String = 'Seleccione un archivo' // Nombre por defecto

  // Imagen
  @ViewChild('imageFile') imageFile: ElementRef;

  // Evento para devolver la observación
  guardarObservacion = new EventEmitter();

  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TiAsignacionDialogObservacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 

    this.fnCrearFormulario();
  }

  ngOnInit(): void {
    this.spinner.hide();
  }


  //#region Formulario
  fnCrearFormulario(){
    this.formObservaciones = this.fb.group(
      {
        imagenObservacion: [null, Validators.compose([Validators.required])],
      }
    );
  }
  //#endregion

  //#region Subida de archivo

  fnSeleccionArchivo(){

    const targetInputFile = this.imageFile.nativeElement;
    
    const target: DataTransfer = <DataTransfer>(targetInputFile);

    if (target.files.length !== 1) {
      // Limpiamos el input file
      this.nombreArchivo = 'Seleccione un archivo';
      this.imageFile.nativeElement.value = '';
      return;
    }

    this.nombreArchivo = target.files[0].name;

    return target.files[0];
  }

  async fnCargarArchivo(){


    const file = this.fnSeleccionArchivo();

    if(file){
      const base64 = await this.fnImagenABase64(file)

      const confirma = await Swal.fire({
        text: 'Ingrese la observación encontrada en el artículo',
        input: 'textarea',
        inputPlaceholder: "Detalle brevemente la observación vista en la imagen",
        imageUrl: base64, 
        imageHeight: 250,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      });
  
      const { value: mensaje } = confirma;
  
      // No se debe guardar si no se confirma
      if (!confirma.isConfirmed) {
        return;
      }
  
      // No se debe guardar si no hay observacion
      if(mensaje == '' || mensaje == null){
        Swal.fire("Alerta", "Debe ingresar una observación", "warning");
        return;
      }    
  
      // Guardamos la observacion con la imagen para insercion
      const imagenObservacion: AsignacionDirectaSeleccionDetalleArchivoDTO = {
  
        nIdDetActivoAsignaArchivo: 0,
        nIdDetActivoAsigna: 0,
        nIdActivo: this.data.nIdActivo,
        nTipoAccion: this.data.tipoAccion,
        sRutaArchivo: null,
        nNumero: 1,
        sObservacion: mensaje.toString(),
  
        // Archivo temporalmente guardado para insercion al Azure
        sBase64: base64
                      .replace('data:image/png;base64,', '')
                      .replace('data:image/jpeg;base64,', '')
                      .replace('data:image/gif;base64,', ''),
        file: file,
        nTipoObservacion: 1 // Esta creando una nueva observacion
      }
  
      this.guardarObservacion.emit(imagenObservacion);
  
      // Limpiamos el input file
      this.nombreArchivo = 'Seleccione un archivo';
      this.imageFile.nativeElement.value = '';
      return;
    }
  }

  // Volver la imagen a base 64
  fnImagenABase64(file): Promise<any>{
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // async fnVerImagenObservacion(observacion: AsignacionDirectaSeleccionDetalleArchivoDTO){

  //   const urlImagen = observacion.sRutaArchivo || await this.fnImagenABase64(observacion.file);
  //   const indice = this.chipElementsObservaciones.findIndex(imagen => imagen == observacion);

  //   Swal.fire({
  //     title: 'Observacion N° ' + (Number(indice) + 1),
  //     text: observacion.sObservacion,
  //     imageUrl: urlImagen, 
  //     imageHeight: 250,
  //   });
  // }

  //#endregion
  
  fnSalir(){
    this.dialogRef.close();
  }
}
