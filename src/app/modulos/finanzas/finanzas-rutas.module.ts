import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ContainerInsideComponent } from "../../shared/components/container-inside/container-inside.component";
import { Oauth2Guard} from "./../../shared/guards/oauth2.guard";
import { AsientopllaComponent } from './asientoplla/asientoplla.component';
import { ModalMantenimientosComponent } from './Modals/modalMantenimientos/modalMantenimientos.component';
import { ModalAsientopllaComponent } from './Modals/modalAsientoplla/modalAsientoplla.component';
import { ModalMatrizComponent } from './Modals/modalMantenimientos/modalMatriz/modalMatriz.component';
import { ModalConceptoComponent } from './Modals/modalConcepto/modalConcepto.component';

export const FINANZAS_RUTAS_COMPOMENTES = [
  AsientopllaComponent, ModalMantenimientosComponent, ModalAsientopllaComponent, ModalMatrizComponent,
  ModalConceptoComponent
];

const routes: Routes = [
  {
    path: "AdministracionFinanzas",
    component: ContainerInsideComponent,
    canActivate:[Oauth2Guard],
    children: [
      {
        path: "contabilidad",
        component: null,
        children: [
          {
            path: "asientoplla",
            component: AsientopllaComponent,
          }
        ],
      }
    ],

  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [],
})
export class FinanzasRutasModule {}
