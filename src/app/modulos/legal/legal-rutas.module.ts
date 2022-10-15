import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ContainerInsideComponent } from "../../shared/components/container-inside/container-inside.component";
import { Oauth2Guard} from "./../../shared/guards/oauth2.guard";
import { LegControlContratosComponent } from "./leg-control-contratos/leg-control-contratos.component";
import { LegDialogContratoComponent } from './leg-control-contratos/leg-dialog-contrato/leg-dialog-contrato.component';
import { LegControlContratosAgregarComponent } from './components/leg-control-contratos-agregar/leg-control-contratos-agregar.component';
import { LegReporteContratoComponent } from "./legal-reporte/leg-reporte-contrato/leg-reporte-contrato.component";
import { LegTipoContratoComponent } from "./leg-tipo-contrato/leg-tipo-contrato.component";

export const LEGAL_RUTAS_COMPOMENTES = [
  LegTipoContratoComponent,
  LegControlContratosComponent,

  // Control Contratos
  LegDialogContratoComponent,
  LegControlContratosAgregarComponent,
  LegReporteContratoComponent
];

const routes: Routes = [
  {
    path: "legal",
    component: ContainerInsideComponent,
    canActivate:[Oauth2Guard],
    children: [
      {
        path: "controlContratos",
        component: LegControlContratosComponent,
      },
      {
        path: "legal-TipoContrato",
        component: LegTipoContratoComponent,
      },
      
      {
        path: "legal-reporte",
        component: null,
        children: [
          {
            path: "leg-reporte-contato",
            component: LegReporteContratoComponent,
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
export class LegalRutasModule {}
