import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { CampoTipoEnum } from "../../shared/CampoTipoEnum";

// Store
import { Store, Select } from "@ngxs/store";
import { CampoFormatoCartaTienda } from "../../store/carta_tienda/formato_carta_tienda/formato_carta_tienda.model";

import {
  AgregarPersonalAFormatoCartaTienda,
  EditarPersonalFormatoCartaTienda,
} from "../../store/carta_tienda/personal_carta_tienda/personal_carta_tienda.actions";

@Component({
  selector: "app-editar-personal",
  templateUrl: "./editar-personal.component.html",
  styleUrls: ["./editar-personal.component.css"],
})
export class EditarPersonalComponent implements OnInit {
  cerrarModal = false;
  public listaCamposComunes: Observable<CampoFormatoCartaTienda[]>;
  public listaCamposComunesEstaticos: CampoFormatoCartaTienda[];
  dataPersona: any;
  dataOriginal: any;
  campoTipoEnum = CampoTipoEnum;

  constructor(
    private store: Store,
    public dialogRef: MatDialogRef<EditarPersonalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataPersona = Object.assign({}, data);
    this.dataOriginal = data;
  }

  ngOnInit(): void {
    this.listaCamposComunes = this.store.select(
      (state) => state.camposCartaTienda.camposCarta
    );

    this.listaCamposComunes.subscribe((campos) => {
      this.listaCamposComunesEstaticos = campos;
    });
  }

  editarPersonal() {
    this.listaCamposComunesEstaticos.forEach((campo) => {
      //this.dataOriginal[campo.pIdCampo] = this.dataPersona[campo.pIdCampo];
    });
    this.store.dispatch(
      new EditarPersonalFormatoCartaTienda(this.dataOriginal, this.dataPersona)
    );
    console.log(this.dataPersona);
    this.dialogRef.close();
  }

  validarBotonActualizar(): boolean {
    var flag = true;
    var aux = null;

    this.listaCamposComunesEstaticos.forEach((campo) => {
      aux = this.dataPersona[campo.pIdCampo];
      if (aux === null || aux === undefined || aux === 0 || aux === "") {
        flag = false;
      }
    });
    return flag;
  }
}
