import { State, Action, StateContext, Selector } from '@ngxs/store';
import { CampoCartaTiendaStateModel } from './campo_carta_tienda.model';
import {
  AgregarCampoAFormatoCartaTienda,
  EliminarCampoAFormatoCartaTienda,
  ReemplazarCampoAFormatoCartaTienda,
} from './campo_carta_tienda.actions';
import { Injectable } from '@angular/core';

@State({
  name: 'camposCartaTienda',
  defaults: {
    camposCarta: [],
  },
})
@Injectable()
export class CampoDeFormatoCartaTiendaState {
  @Selector()
  static obtenerCamposDeFormatosCartaTienda(state: CampoCartaTiendaStateModel) {
    return state.camposCarta;
  }

  /**
   * Agrega un nuevo campo
   */
  @Action(AgregarCampoAFormatoCartaTienda)
  addCampo(
    {
      getState,
      patchState,
      setState,
    }: StateContext<CampoCartaTiendaStateModel>,
    { payload }: AgregarCampoAFormatoCartaTienda
  ) {
    const state = getState();
    patchState({
      camposCarta: payload,
    });
  }

  /**
   * REEMPLAZAR LA DATA
   */
  @Action(ReemplazarCampoAFormatoCartaTienda)
  reemplazarCampo(
    {
      getState,
      patchState,
      setState,
    }: StateContext<CampoCartaTiendaStateModel>,
    { payload }: ReemplazarCampoAFormatoCartaTienda
  ) {
    const state = getState();
    setState({
      camposCarta: [...payload],
    });
  }

  /**
   * Eliminar campo
   */
  @Action(EliminarCampoAFormatoCartaTienda)
  removeCampoCartaTienda(
    {
      getState,
      patchState,
      setState,
    }: StateContext<CampoCartaTiendaStateModel>,
    { payload }: EliminarCampoAFormatoCartaTienda
  ) {
    const state = getState();

    patchState({
      camposCarta: payload,
    });
  }
}
