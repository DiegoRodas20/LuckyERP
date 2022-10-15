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
  LEGAL_RUTAS_COMPOMENTES,
  LegalRutasModule,
} from "./legal-rutas.module";
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
    LegalRutasModule,
    ReactiveFormsModule,
    FormsModule,
    libreria
  ],
  declarations: [LEGAL_RUTAS_COMPOMENTES],
})
export class LegalModule {}
