import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ContainerInsideComponent } from "../../shared/components/container-inside/container-inside.component";
import { Oauth2Guard } from './../../shared/guards/oauth2.guard';

import { ModuloComponent } from './modulo/modulo.component';
import { DialogModPriComponent } from './modulo/dialog/dialog.component';
import { PermisosComponent } from './permisos/permisos.component';
import { UsuarioComponent } from './usuario/usuario.component';
import { DialogComponent } from './usuario/dialog/dialog.component';
import { DialogEmpresaComponent } from './usuario/dialog-empresa/dialog-empresa.component';
import { DialogModuloComponent } from './usuario/dialog-modulo/dialog-modulo.component';
import { PerfilAddComponent } from './perfil/add/perfil-add.component';
import { GeneralSystElementsComponent } from "./tablas-generales/general-systelements/general-systelements.component";
import { DetalleSystElementsComponent } from "./tablas-generales/general-systelements/detalle-systelements/detalle-systelements.component";
import { DetalleSystElementsDialog } from "./tablas-generales/general-systelements/detalle-systelements/detalle-systelements-dialog/detalle-systelements-dialog.component";
import { GeneralSystElementsDialog } from "./tablas-generales/general-systelements/general-systelements-dialog/general-systelements-dialog.component";
import { SystemTipoElementoComponent } from "./tablas-generales/system-tipoelemento/system-tipoelemento.component";
import { SystemTipoElementoDialog } from "./tablas-generales/system-tipoelemento/system-tipoelemento-dialog/system-tipoelemento-dialog.component";
import { DetalleTipoElementoComponent } from "./tablas-generales/system-tipoelemento/detalle-tipoelemento/detalle-tipoelemento.component";
import { DetalleTipoElementoDialog } from "./tablas-generales/system-tipoelemento/detalle-tipoelemento/detalle-tipoelemento-dialog/detalle-tipoelemento-dialog.component";




export const MANTENIMIENTO_RUTAS_COMPONENTES = [
  ModuloComponent,
  DialogModPriComponent,
  PermisosComponent,
  UsuarioComponent,
  DialogComponent,
  PerfilAddComponent,
  DialogEmpresaComponent,
  DialogModuloComponent,
  GeneralSystElementsComponent,
  DetalleSystElementsComponent,
  DetalleSystElementsDialog,
  GeneralSystElementsDialog,
  SystemTipoElementoComponent,
  SystemTipoElementoDialog,
  DetalleTipoElementoComponent,
  DetalleTipoElementoDialog

];

const routes: Routes = [
  {
    path: "mantenimiento",
    component: ContainerInsideComponent,
    canActivate: [Oauth2Guard],
    children: [
      {
        path: "menu",
        component: ModuloComponent,
      },
      {
        path: "permiso",
        component: PermisosComponent,
      },
      {
        path: "usuario",
        component: UsuarioComponent,
      },
      {
        path: "Perfiles",
        component: PerfilAddComponent
      },
      {
        path: "tablas-generales",
        component: null,
        children: [
          {
            path: "general-systelements",
            component: GeneralSystElementsComponent
          },
          {
            path: "detalle-systelements/:id",
            component: DetalleSystElementsComponent
          },
          {
            path: "system-tipoelemento",
            component: SystemTipoElementoComponent
          },
          {
            path: "detalle-tipoelemento/:id",
            component: DetalleTipoElementoComponent
          },
        ]
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [],
})
export class MantenimientoRutasModule { }
