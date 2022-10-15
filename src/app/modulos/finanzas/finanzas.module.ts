import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppMaterialModule } from "src/app/shared/material/app-material.module";
import { NgxSpinnerModule } from "ngx-spinner";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgSelectModule } from "@ng-select/ng-select";
import { NgxDocViewerModule } from "ngx-doc-viewer";
import {
  FINANZAS_RUTAS_COMPOMENTES,
  FinanzasRutasModule,
} from "./finanzas-rutas.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

const libreria = [
  AppMaterialModule,
  NgxSpinnerModule,
  NgbModule,
  MatMomentDateModule,
  DragDropModule,
  NgxDocViewerModule,
  NgSelectModule
];

@NgModule({
  imports: [
    CommonModule,
    FinanzasRutasModule,
    ReactiveFormsModule,
    FormsModule,
    libreria
  ],
  declarations: [FINANZAS_RUTAS_COMPOMENTES]
})
export class FinanzasModule {}
