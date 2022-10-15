import { State, Action, StateContext, Selector } from '@ngxs/store';
import { CampoBusqueda, CampoBusquedaStateModel } from './campo_busqueda.model';
import {
  AgregarCampoBusqueda,
  CargarCamposBusqueda,
} from './campo_busqueda.actions';
import { Injectable } from '@angular/core';

import { CartaTiendaService } from '../../../service/carta-tienda.service';

@State({
  name: 'camposBusqueda',
  defaults: {
    camposBusqueda: [],
  },
})
@Injectable()
export class CampoBusquedaState {
  constructor(private cartaTiendaService: CartaTiendaService) {}

  @Selector()
  static obtenerCamposBusqueda(state: CampoBusquedaStateModel) {
    return state.camposBusqueda;
  }

  /**
   * Agrega un nuevo campo a la busqueda
   */
  @Action(AgregarCampoBusqueda)
  add(
    { getState, patchState }: StateContext<CampoBusquedaStateModel>,
    { payload }: AgregarCampoBusqueda
  ) {
    const state = getState();
    patchState({
      camposBusqueda: [payload, ...state.camposBusqueda],
    });
  }

  /**
   * Obtener datos de la API
   */
  @Action(CargarCamposBusqueda)
  loadData(
    { getState, patchState, setState }: StateContext<CampoBusquedaStateModel>,
    { payload }: CargarCamposBusqueda
  ) {
    const state = getState();
    let pParametro = [];
    //pParametro.push("hola")
    this.cartaTiendaService.crudCampo(2, pParametro).then((val: any[]) => {
      setState({
        ...state,
        camposBusqueda: val,
      });
    });
  }
}
