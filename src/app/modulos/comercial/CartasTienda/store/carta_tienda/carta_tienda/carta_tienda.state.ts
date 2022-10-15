import { State, Action, StateContext, Selector } from "@ngxs/store";
import { CartaTiendaStateModel } from "./carta_tienda.model";
import { ReemplazarCartaTienda } from "./carta_tienda.actions";
import { Injectable } from "@angular/core";

@State({
  name: "cartaTienda",
  defaults: {
    cartaTienda: {
      carta_id: 0,
      cadena_id: 0,
      tienda_id: 0,
      supervisor_id: 0,
    },
  },
})
@Injectable()
export class CartaTiendaState {
  @Selector()
  static obtenerFormatosBusqueda(state: CartaTiendaStateModel) {
    return state.cartaTienda;
  }

  /**
   * Reemplzar los datos de los campos generales
   */
  @Action(ReemplazarCartaTienda)
  reemplazarCartaTienda(
    { getState, patchState, setState }: StateContext<CartaTiendaStateModel>,
    { payload }: ReemplazarCartaTienda
  ) {
    const state = getState();

    setState({
      cartaTienda: payload,
    });
  }
}
