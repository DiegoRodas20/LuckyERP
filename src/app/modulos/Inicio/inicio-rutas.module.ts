import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ContainerInsideComponent } from "../../shared/components/container-inside/container-inside.component";
import { Oauth2Guard} from "./../../shared/guards/oauth2.guard";

export const INICIO_RUTAS_COMPOMENTES = [];

const routes: Routes = [
  {
    path: "inicio",
    component: ContainerInsideComponent,
    canActivate:[Oauth2Guard],
    /*children: [
      {
        path: "",
        component: null,
      },
    ],*/
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [],
})
export class InicioRutasModule {}
