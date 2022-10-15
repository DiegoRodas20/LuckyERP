import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule,FormsModule } from "@angular/forms";

import { AppMaterialModule } from "../../shared/material/app-material.module";
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NgSelectModule } from '@ng-select/ng-select'; 


const libreria = [
  AppMaterialModule,
  NgxSpinnerModule,
  NgbModule,
  MatMomentDateModule,
  DragDropModule,
  NgxDocViewerModule,
  NgSelectModule
];

import {
  MantenimientoRutasModule,
  MANTENIMIENTO_RUTAS_COMPONENTES,
} from "./mantenimiento-rutas.module";

@NgModule({
  imports: [
    CommonModule, 
    MantenimientoRutasModule,
    ReactiveFormsModule,
    FormsModule  ,
    libreria],
  declarations: [MANTENIMIENTO_RUTAS_COMPONENTES],
})
export class MantenimientoModule {}
