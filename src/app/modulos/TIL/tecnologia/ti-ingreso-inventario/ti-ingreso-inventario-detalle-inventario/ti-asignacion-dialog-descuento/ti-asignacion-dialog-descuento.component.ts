import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { AsignacionDirectaSeleccionDetalleDTO } from '../../../api/models/asignacionDirectaDTO';
import { AsignacionDirectaService } from '../../../api/services/asignacion-directa.service';

@Component({
  selector: 'app-ti-asignacion-dialog-descuento',
  templateUrl: './ti-asignacion-dialog-descuento.component.html',
  styleUrls: ['./ti-asignacion-dialog-descuento.component.css']
})
export class TiAsignacionDialogDescuentoComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Formulario
  formDescuento: FormGroup;

  // Archivo
  nombreArchivo: String = 'Seleccione un archivo' // Nombre por defecto
  tipoArchivo: string;
  bTipoDescuento: boolean;

  // Imagen
  @ViewChild('imageFile') imageFile: ElementRef;

  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TiAsignacionDialogDescuentoComponent>,
    private _asignacionDirectaService: AsignacionDirectaService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.bTipoDescuento = data.bTipoDescuento;
    this.fnCrearFormulario();
  }

  ngOnInit(): void {
    this.spinner.hide();
  }


  //#region Formulario
  fnCrearFormulario(){
    this.formDescuento = this.fb.group(
      {
        documentoDescuento: [null, Validators.compose([Validators.required])],
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
    this.tipoArchivo = target.files[0].type;

    return target.files[0];
  }

  async fnCargarArchivo(){

    const confirma = await Swal.fire({
      title: `Está apunto de realizar un descuento ¿Continuar?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirma.isConfirmed) {
      return;
    }

    this.spinner.show();

    const file = this.fnSeleccionArchivo();

    if(file){
      const base64 = await this.fnImagenABase64(file)

      const sBase64 = base64
                        .replace('data:image/png;base64,', '')
                        .replace('data:image/jpeg;base64,', '')
                        .replace('data:image/gif;base64,', '')
                        .replace('data:application/pdf;base64,', '');

      const model: AsignacionDirectaSeleccionDetalleDTO = {
        nIdDetActivoAsigna: this.data.nIdDetActivoAsigna,
        sBase64: sBase64,
        fileType: this.tipoArchivo,
        bTipoDescuento: this.bTipoDescuento
      }
      
      const result = await this._asignacionDirectaService.UpdateDocumentoDescuentoAsignacion(model);

      if (!result.success) {
        let mensaje = result.errors.map(item => {
          return item.message
        })
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: mensaje.join(', '),
        });
        this.spinner.hide();
        return;
      }

      this.spinner.hide();

      this.fnSalir(result.response.data[0] || false);

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

  //#endregion
  
  fnSalir(documentoCreado?: any){
    this.dialogRef.close(documentoCreado || false);
  }

}
