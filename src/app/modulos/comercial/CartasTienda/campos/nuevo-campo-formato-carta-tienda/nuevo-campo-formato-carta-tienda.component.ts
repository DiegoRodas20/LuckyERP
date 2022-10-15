import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CartaTiendaService } from '../../service/carta-tienda.service';
import { ITipoCampo } from '../../models/TipoCampo';

//#region STORE
import { Store, Select } from '@ngxs/store';
import { AgregarCampoBusqueda } from '../../store/carta_tienda/campo_busqueda/campo_busqueda.actions';
//#endregion

//#region MODELO DEL FORMULARIO PARA AGREGAR EL CAMPOS Y VALIDARLO
export class FormCampo {
  constructor(public tipo: number, public nombre: string) {}
}
//#endregion

@Component({
  selector: 'app-nuevo-campo-formato-carta-tienda',
  templateUrl: './nuevo-campo-formato-carta-tienda.component.html',
  styleUrls: ['./nuevo-campo-formato-carta-tienda.component.css'],
})
export class NuevoCampoFormatoCartaTiendaComponent implements OnInit {
  //#region LISTA DE TIPOS DE CAMPOS
  tiposCampo: ITipoCampo[];
  //#endregion

  //#region MODELO PARA CREAR UN NUEVO CAMPO
  model = new FormCampo(null, '');
  //#endregion

  //#region CONSTRUCTOR
  constructor(
    private store: Store,
    private _snackBar: MatSnackBar,
    private cartaTiendaService: CartaTiendaService
  ) {}
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.obtenerTiposCampo();
  }
  //#endregion

  //#region Obtener todos los tipos de campos del backend API
  obtenerTiposCampo() {
    this.cartaTiendaService.crudTipoCampo(0, []).then((tipos: ITipoCampo[]) => {
      this.tiposCampo = tipos;
    });
  }
  //#endregion

  //#region GUARDAR UN NUEVO CAMPO
  crearNuevoCampo(form: NgForm) {
    // Parametros para enviar al API
    let pParametro = [];
    pParametro.push(this.model.tipo);
    pParametro.push(this.model.nombre);

    this.cartaTiendaService.crudCampo(3, pParametro).then((id) => {
      // Agregando al store
      this.store.dispatch(
        new AgregarCampoBusqueda({
          pId: +id,
          pNombre: String(this.model.nombre),
          pTipo: Number(this.model.tipo),
        })
      );

      // Mostrando un snackbar de confirmacion
      form.resetForm();
      this.openSnackBar('Campo creado correctanente', 'Cerrar');
    });
  }
  //#endregion

  //#region Snackbar para confirmacion
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
  //#endregion
}
