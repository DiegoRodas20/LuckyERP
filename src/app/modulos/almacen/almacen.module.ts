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
import { NgxPrintModule } from "ngx-print";
import { NgQrScannerModule } from 'angular2-qrscanner';
import { ZXingScannerModule } from '@zxing/ngx-scanner';


const libreria = [
  AppMaterialModule,
  NgxSpinnerModule,
  NgbModule,
  MatMomentDateModule,
  DragDropModule,
  NgxDocViewerModule,
  NgSelectModule,
  DirectivesModule
];

// const parametroMovil = [
//   TopesPorPersonaComponent
// ];

import {
  AlmacenRutasModule,
  ALMACEN_RUTAS_COMPONENTES,
} from "./almacen-rutas.module"; 

import { ControlCostosModule } from "../control-costos/control-costos.module";
import { ComercialModule} from "../comercial/comercial.module";
import { DirectivesModule } from "src/app/shared/directives/directives.module";

@NgModule({
  imports: [ 
    CommonModule, 
    AlmacenRutasModule,
    ReactiveFormsModule,
    FormsModule,
    libreria,
    NgxPrintModule,
    NgQrScannerModule,
    ZXingScannerModule,
    ControlCostosModule,   //para ver los componeneste de otro modulo tenemos que importar el modulo  
    ComercialModule
  ],
  declarations: [
    ALMACEN_RUTAS_COMPONENTES,
  ],
})
export class AlmacenModule {}
