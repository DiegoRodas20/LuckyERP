import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule,FormsModule } from "@angular/forms";

import { AppMaterialModule } from "../../shared/material/app-material.module";
import { NgxSpinnerModule } from 'ngx-spinner';

const libreria = [
  AppMaterialModule,
  NgxSpinnerModule
];

import {
  SeguridadRutasModule,
  SEGURIDAD_RUTAS_COMPONENTES,
} from "../seguridad/seguridad-rutas.module";

@NgModule({
  imports: [  
    CommonModule, 
    SeguridadRutasModule, 
    FormsModule,
    ReactiveFormsModule,
    libreria
  ],
  declarations: [SEGURIDAD_RUTAS_COMPONENTES],
})
export class SeguridadModule {}
