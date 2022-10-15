import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-destino-validaciones',
  templateUrl: './destino-validaciones.component.html',
  styleUrls: ['./destino-validaciones.component.css']
})
export class DestinoValidacionesComponent {

  constructor(
    public dialogRef: MatDialogRef<DestinoValidacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { data: string[], data2: any[] }
  ) { }

  get hasData(): boolean { // Retorna verdadero si data está definido
    return this.data.data ? true : false;
  }

  get title(): string { // Retorna el título del modal
    return this.data.data ? 'Validaciones' : 'Observaciones';
  }

  observacion(item: any): string {
    return item.resp > 0 ? `Código ${item.resp} - ${item.observacion}` : `${item.observacion}`;
  }
}
