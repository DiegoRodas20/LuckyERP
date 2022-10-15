import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-aprobacion',
  templateUrl: './dialog-edit-aprobacion.component.html',
  styleUrls: ['./dialog-edit-aprobacion.component.css']
})
export class DialogEditAprobacionComponent implements OnInit {
  
  tipoDocumento: number;
  dataCabecera: any;
  constructor(public dialogRef: MatDialogRef<DialogEditAprobacionComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { 
    
    this.tipoDocumento = data.tipo;
    this.dataCabecera = data.data;
  }

  ngOnInit(): void {
  }

  actualizarCampo(event){
    this.dialogRef.close();
  }

}
