import { State, Action, StateContext, Selector } from '@ngxs/store';
import { PersonalCartaTiendaStateModel } from './personal_carta_tienda.model';
import {
  AgregarPersonalAFormatoCartaTienda,
  EliminarPersonalAFormatoCartaTienda,
  EditarPersonalFormatoCartaTienda,
  ReemplazarTodoPersonalFormatoCartaTienda,
} from './personal_carta_tienda.actions';
import { Injectable } from '@angular/core';

@State({
  name: 'personalCartaTienda',
  defaults: {
    personalCarta: [],
  },
})
@Injectable()
export class PersonalDeFormatoCartaTiendaState {
  @Selector()
  static obtenerCamposDeFormatosCartaTienda(
    state: PersonalCartaTiendaStateModel
  ) {
    return state.personalCarta;
  }

  /**
   * Agrega un nuevo personal
   */
  @Action(AgregarPersonalAFormatoCartaTienda)
  addPersonal(
    { getState, patchState }: StateContext<PersonalCartaTiendaStateModel>,
    { payload }: AgregarPersonalAFormatoCartaTienda
  ) {
    const state = getState();
    patchState({
      personalCarta: [payload, ...state.personalCarta],
    });
  }

  /**
   * Reempleza la data Interna
   */
  @Action(ReemplazarTodoPersonalFormatoCartaTienda)
  reemplazarPersonal(
    {
      getState,
      patchState,
      setState,
    }: StateContext<PersonalCartaTiendaStateModel>,
    { payload }: ReemplazarTodoPersonalFormatoCartaTienda
  ) {
    const state = getState();
    setState({
      personalCarta: [...payload],
    });
  }

  /**
   * Elimina un personal
   */
  @Action(EditarPersonalFormatoCartaTienda)
  actualizarPersonal(
    { getState, setState }: StateContext<PersonalCartaTiendaStateModel>,
    { dataOriginal, dataNueva }: EditarPersonalFormatoCartaTienda
  ) {
    const state = getState();
    const newData = state.personalCarta.map((e) => {
      if (JSON.stringify(e) === JSON.stringify(dataOriginal)) {
        return dataNueva;
      } else {
        return e;
      }
    });

    setState({
      personalCarta: [...newData],
    });
  }

  /**
   * Elimina un personal
   */
  @Action(EliminarPersonalAFormatoCartaTienda)
  removePersonal(
    { getState, patchState }: StateContext<PersonalCartaTiendaStateModel>,
    { payload }: EliminarPersonalAFormatoCartaTienda
  ) {
    const state = getState();

    patchState({
      personalCarta: state.personalCarta.filter(
        (e) => JSON.stringify(e) !== JSON.stringify(payload)
      ),
    });
  }
}
