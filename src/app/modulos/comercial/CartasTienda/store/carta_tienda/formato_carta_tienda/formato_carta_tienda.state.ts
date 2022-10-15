import { State, Action, StateContext, Selector } from '@ngxs/store';
import { FormatoCartaTiendaStateModel } from './formato_carta_tienda.model';
import {
  AgregarFormatoAFormatoCartaTienda,
  EliminarFormatoAFormatoCartaTienda,
  ReemplazarFormatoAFormatoCartaTienda,
} from './formato_carta_tienda.actions';
import { Injectable } from '@angular/core';

@State({
  name: 'formatosCartaTienda',
  defaults: {
    formatosCarta: [],
  },
})
@Injectable()
export class FormatoDeFormatoCartaTiendaState {
  @Selector()
  static obtenerFormatosDeFormatosCartaTienda(
    state: FormatoCartaTiendaStateModel
  ) {
    return state.formatosCarta;
  }

  /**
   * Agrega un nuevo formato
   */
  @Action(AgregarFormatoAFormatoCartaTienda)
  addFormato(
    { getState, patchState }: StateContext<FormatoCartaTiendaStateModel>,
    { payload }: AgregarFormatoAFormatoCartaTienda
  ) {
    const state = getState();
    patchState({
      formatosCarta: [payload, ...state.formatosCarta],
    });
  }

  /**
   * Reemplazar toda la data
   */
  @Action(ReemplazarFormatoAFormatoCartaTienda)
  reemplazarFormato(
    {
      getState,
      patchState,
      setState,
    }: StateContext<FormatoCartaTiendaStateModel>,
    { payload }: ReemplazarFormatoAFormatoCartaTienda
  ) {
    const state = getState();
    setState({
      formatosCarta: [...payload],
    });
  }

  /**
   * Eliminar un formato
   */
  @Action(EliminarFormatoAFormatoCartaTienda)
  removeFormatoCarta(
    { getState, patchState }: StateContext<FormatoCartaTiendaStateModel>,
    { payload }: EliminarFormatoAFormatoCartaTienda
  ) {
    const state = getState();
    patchState({
      formatosCarta: state.formatosCarta.filter((e) => e.pId !== payload.pId),
    });
  }
}
