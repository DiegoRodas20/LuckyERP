import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { DesplegableCampo } from '../../../../models/DesplegableCampo';

import { CartaTiendaService } from '../../../../service/carta-tienda.service';

@Component({
  selector: 'app-agregar-data-desplegable',
  templateUrl: './agregar-data-desplegable.component.html',
  styleUrls: ['./agregar-data-desplegable.component.css'],
})
export class AgregarDataDesplegableComponent implements OnInit {
  constructor(
    private cartaTiendaService: CartaTiendaService,
    public dialogRef: MatDialogRef<AgregarDataDesplegableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DesplegableCampo
  ) {}

  ngOnInit(): void {}

  //#region
  enviarData() {
    let parametros = [];
    parametros.push();
    this.cartaTiendaService
      .crudCampoDesplegable(1, parametros)
      .then((id) => {});
  }
  //#endregion

  //#region CERRAR MODAL
  onNoClick(): void {
    this.dialogRef.close();
  }
  //#endregion
}
