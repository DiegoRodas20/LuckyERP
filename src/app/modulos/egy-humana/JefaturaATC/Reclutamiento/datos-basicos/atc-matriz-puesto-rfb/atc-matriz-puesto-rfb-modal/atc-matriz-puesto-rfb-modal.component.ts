
import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";

import { AtcMatrizPuestoRfbService } from "./../atc-matriz-puesto-rfb.service";
import { FormControl } from '@angular/forms';
import Swal from "sweetalert2";


@Component({
  selector: 'app-atc-matriz-puesto-rfb-modal',
  templateUrl: './atc-matriz-puesto-rfb-modal.component.html',
  styleUrls: ['./atc-matriz-puesto-rfb-modal.component.css']
})
export class AtcMatrizPuestoRfbModalComponent implements OnInit {


  url: string;


  nTipoModal: number;
  nOpcionModal: number;

  sTituloModal: string;
  sNombreMatriz: string;

  fNombre = new FormControl();


  constructor(
    public dialogRef: MatDialogRef<AtcMatrizPuestoRfbModalComponent>,
    @Inject("BASE_URL") baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private vSerAtcMatrizRFB: AtcMatrizPuestoRfbService) {
    this.url = baseUrl;
  }

  ngOnInit(): void {

    this.nTipoModal = this.data.tipomodal;

    this.fnDefinirModal(this.nTipoModal);

  }

  //#region Definir Titulo y Label
  async fnDefinirModal(nTipoModal) {

    switch (nTipoModal) {
      case 1:
        this.sTituloModal = 'Requisito';
        this.sNombreMatriz = 'Nuevo Requisito'
        break;

      case 2:
        this.sTituloModal = 'Función';
        this.sNombreMatriz = 'Nueva Función'
        break;

      case 3:
        this.sTituloModal = 'Beneficio';
        this.sNombreMatriz = 'Nuevo Beneficio'
        break;

      case 92:
        this.sTituloModal = 'Lugar de Trabajo';
        this.sNombreMatriz = 'Nuevo Lugar de Trabajo'
        break;

      default:
        break;
    }
  }
  //#endregion


  async fnGrabar() {

    let result: any;
    let sMensaje: string = '';

    if (this.fNombre.value == null || this.fNombre.value == '') {
      return Swal.fire({
        icon: "warning",
        title: `Digite el campo ${this.sNombreMatriz} si desea grabar.`,
      });
    }
    else {

      let pParametro = [];
      pParametro.push(this.nTipoModal);
      pParametro.push(this.fNombre.value);

      await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(13, pParametro, this.url).then(
        (res: any) => {

          console.log(res.cod)
          console.log(res.mensaje)

          switch (this.nTipoModal) {
            case 1:
              sMensaje = `El Requisito "${this.fNombre.value}" se registró con éxito`;
              break;

            case 2:
              sMensaje = `La función "${this.fNombre.value}" se registró con éxito`;
              break;

            case 3:
              sMensaje = `El Beneficio "${this.fNombre.value}" se registró con éxito`;
              break;

            case 92:
              sMensaje = `El Lugar de Trabajo "${this.fNombre.value}" se registró con éxito`;
              break;

            default:
              break;
          }


          //Mostrar Dialogo
          if (res.cod > 0) {
            Swal.fire({
              icon: "success",
              title: sMensaje,
            });

            result = {
              nIdParametro: res.cod,
              sDescripcion: res.mensaje
            };

            this.dialogRef.close(result);
          }
          else {
            return Swal.fire({
              icon: "error",
              title: res.mensaje,
            });
          }

        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  //#region Cerrar
  fnCerrarModal() {
    this.dialogRef.close();
  }
  //#endregion

}




export interface DialogData {
  tipomodal: number;
}
