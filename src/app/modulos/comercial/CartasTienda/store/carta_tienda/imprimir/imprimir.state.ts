import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';

import { ImprimirModel, ImprimirStateModel } from './imprimir.model';
import { ReemplazarDataImprimir } from './imprimir.actions';

@State({
  name: 'imprimir',
  defaults: {
    documentos: [],
  },
})
@Injectable()
export class ImprimirState {
  constructor() {}

  @Selector()
  static obtenerDatosImpresion(state: ImprimirStateModel) {
    return state.documentos;
  }

  @Action(ReemplazarDataImprimir)
  reemplazarCartaTienda(
    { getState, setState }: StateContext<ImprimirStateModel>,
    { payload }: ReemplazarDataImprimir
  ) {
    const state = getState();

    setState({
      documentos: payload,
    });
  }
}
