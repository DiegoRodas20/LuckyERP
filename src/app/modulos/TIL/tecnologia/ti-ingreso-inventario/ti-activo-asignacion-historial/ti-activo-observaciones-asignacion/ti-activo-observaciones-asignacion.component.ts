import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { AsignacionDirectaSeleccionDetalleArchivoDTO } from '../../../api/models/asignacionDirectaDTO';
import { AsignacionDirectaService } from '../../../api/services/asignacion-directa.service';

@Component({
  selector: 'app-ti-activo-observaciones-asignacion',
  templateUrl: './ti-activo-observaciones-asignacion.component.html',
  styleUrls: ['./ti-activo-observaciones-asignacion.component.css']
})
export class TiActivoObservacionesAsignacionComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Archivo
  listaObservaciones: AsignacionDirectaSeleccionDetalleArchivoDTO[] = [];
  
  // Imagen
  rutaImagen = null;

  // Chiplist (Observaciones)
  chipElementsObservacionesEntrega: AsignacionDirectaSeleccionDetalleArchivoDTO[] = [];
  // Chiplist (Componentes)
  chipElementsObservacionesDevolucion: AsignacionDirectaSeleccionDetalleArchivoDTO[] = [];

  constructor(
    private _asignacionDirectaService: AsignacionDirectaService,
    public dialogRef: MatDialogRef<TiActivoObservacionesAsignacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog, // Declaracion del Dialog
  ) { }

  async ngOnInit(): Promise<void> {

    // Recuperar todas las observaciones de la asignacion
    await this.fnListarObservaciones();
  }

  async fnListarObservaciones(){

    const nIdDetActivoAsigna = this.data.nIdDetActivoAsigna;

    const result = await this._asignacionDirectaService.GetObservacionesByAsignacion(nIdDetActivoAsigna);

    if(result.success){
      
      result.response.data.map(observacion => {
        if(observacion.nTipoAccion == 1){
          this.chipElementsObservacionesEntrega.push(observacion);
        }
        else if(observacion.nTipoAccion == 2){
          this.chipElementsObservacionesDevolucion.push(observacion);
        }
      })
    }
  }

  async fnVerImagenObservacion(observacion: AsignacionDirectaSeleccionDetalleArchivoDTO){

    const urlImagen = observacion.sRutaArchivo;

    let indice = 0;
    
    if(observacion.nTipoAccion == 1){
      indice = this.chipElementsObservacionesEntrega.findIndex(imagen => imagen == observacion);
    }
    else if(observacion.nTipoAccion == 2){
      indice = this.chipElementsObservacionesDevolucion.findIndex(imagen => imagen == observacion);
    }

    Swal.fire({
      title: 'Observacion N° ' + (Number(indice) + 1),
      text: observacion.sObservacion,
      imageUrl: urlImagen, 
      imageHeight: 250,
    });
  }

  fnSalir(){
    this.dialogRef.close();
  }

}
