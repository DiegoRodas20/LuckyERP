import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { AppMaterialModule } from "../../shared/material/app-material.module";
import { NgxSpinnerModule } from "ngx-spinner";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgxDocViewerModule } from "ngx-doc-viewer";
import { NgSelectModule } from "@ng-select/ng-select";
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

const libreria = [
  AppMaterialModule,
  NgxSpinnerModule,
  MatMomentDateModule,
  NgbModule,
  DragDropModule,
  NgxDocViewerModule,
  NgSelectModule
];


import {
  TfiRutasModule,
  TESORERIA_RUTAS_COMPOMENTES,
  FACTURACION_RUTAS_COMPONENTES,
} from "./tfi-rutas.module";
import { PptoPendienteFacturarComponent } from "./facturacion/reportes/ppto-pendiente-facturar/ppto-pendiente-facturar.component";
import { RegistroVentasComponent } from "./facturacion/reportes/registro-ventas/registro-ventas.component";
import { IndicadorCobranzaComponent } from "./facturacion/reportes/indicador-cobranza/indicador-cobranza.component";
import { ExpRegistroVentasComponent } from "./facturacion/reportes/exp-registro-ventas/exp-registro-ventas.component";

@NgModule({
  imports: [
    CommonModule,
    TfiRutasModule,
    ReactiveFormsModule,
    FormsModule,
    libreria,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
  ],

  exports:[
    PptoPendienteFacturarComponent,
    RegistroVentasComponent,
    IndicadorCobranzaComponent,
    ExpRegistroVentasComponent
  ],

  declarations: [
    FACTURACION_RUTAS_COMPONENTES, TESORERIA_RUTAS_COMPOMENTES,
    PptoPendienteFacturarComponent,
    RegistroVentasComponent,
    IndicadorCobranzaComponent,
    ExpRegistroVentasComponent
  ],
})
export class TfiModule { }
