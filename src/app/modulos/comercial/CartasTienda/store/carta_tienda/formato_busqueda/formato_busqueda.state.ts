import { State, Action, StateContext, Selector } from "@ngxs/store";
import {
  FormatoBusqueda,
  FormatoBusquedaStateModel,
} from "./formato_busqueda.model";
import {
  AgregarFormatoBusqueda,
  CargarFormatoBusqueda,
} from "./formato_busqueda.actions";
import { Injectable } from "@angular/core";
import { CartaTiendaService } from "../../../service/carta-tienda.service";

@State({
  name: "formatosBusqueda",
  defaults: {
    formatosBusqueda: [],
  },
})
@Injectable()
export class FormatoBusquedaState {
  constructor(private cartaTiendaService: CartaTiendaService) {}

  @Selector()
  static obtenerFormatosBusqueda(state: FormatoBusquedaStateModel) {
    return state.formatosBusqueda;
  }

  /**
   * Agrega un nuevo formato a la busqueda
   */
  @Action(AgregarFormatoBusqueda)
  add(
    { getState, patchState }: StateContext<FormatoBusquedaStateModel>,
    { payload }: AgregarFormatoBusqueda
  ) {
    const state = getState();
    patchState({
      formatosBusqueda: [payload, ...state.formatosBusqueda],
    });
  }

  /**
   * Obtener datos de la API
   */
  @Action(CargarFormatoBusqueda)
  loadData(
    { getState, patchState, setState }: StateContext<FormatoBusquedaStateModel>,
    { carta_id }: CargarFormatoBusqueda
  ) {
    const state = getState();

    let pParametro = [];
    pParametro.push(carta_id);
    this.cartaTiendaService
      .crudFormato(8, pParametro)
      .then((formatos: FormatoBusqueda[]) => {
        setState({
          ...state,
          formatosBusqueda: formatos,
        });
      });
  }
}
