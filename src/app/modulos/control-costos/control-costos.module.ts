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

import { DirectivesModule } from 'src/app/shared/directives/directives.module';



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
  ControlCostosRutasModule,
  CONTROL_COSTOS_RUTAS_COMPONENTES,
} from "./control-costos-rutas.module";
import { DialogDetalleDocumentoComponent } from './presupuestos/traslado-documento/components/dialog-detalle-documento/dialog-detalle-documento.component';
import { DialogTrasladarDocumentoComponent } from './presupuestos/traslado-documento/components/dialog-trasladar-documento/dialog-trasladar-documento.component';
import { BoletaDetalleDialogComponent } from "./canjes/boletaDetalle-dialog/boletaDetalle-dialog.component";
import { RequerimientoSctrComponent } from "./presupuestos/aprobacion/components/requerimiento-sctr/requerimiento-sctr.component";
import { DialogEditAprobacionComponent } from "./presupuestos/aprobacion/components/dialog-edit-aprobacion/dialog-edit-aprobacion.component";
import { BoletaListaValidacionDialogComponent } from "./canjes/boletas-listavalidacion-dialog/boletas-listavalidacion-dialog.component";
import { RequerimientoSmComponent } from './presupuestos/aprobacion/components/requerimiento-sm/requerimiento-sm.component';
import { NgxPrintModule } from "ngx-print";
import { RequerimientoRrComponent } from './presupuestos/aprobacion/components/requerimiento-rr/requerimiento-rr.component';
import { RequerimientoReComponent } from './presupuestos/aprobacion/components/requerimiento-re/requerimiento-re.component';
import { RequerimientoRhComponent } from "./presupuestos/aprobacion/components/requerimiento-rh/requerimiento-rh.component";
import { ListaArticuloComponent } from "./compra/articulo/lista-articulo/lista-articulo.component";
import { RegistroFacturaComponent } from "./presupuestos/registroFactura/registroFactura.component";
import { DialogInformeGastoComponent } from './presupuestos/registroFactura/dialog-informe-gasto/dialog-informe-gasto.component';
import { ProveedorComponent } from "./compra/proveedor/proveedor.component";
import { ReportePresupuestoComponent } from "./presupuestos/pptos-reportes/pptos-partidas-saldos/reporte-dialog/reporte-presupuesto.component";
import { ReporteStaffComponent } from "./presupuestos/pptos-reportes/pptos-informe-staff/reporte-dialog/reporte-staff.component";
import { RequerimientoRpComponent } from "./presupuestos/aprobacion/components/requerimiento-rp/requerimiento-rp.component";

@NgModule({
  imports: [ 
    CommonModule, 
    ControlCostosRutasModule,
    ReactiveFormsModule,
    FormsModule,
    libreria,
    NgxPrintModule,
  ],

  //Para compartir componentes entre modulos, debe estar declarado en las exportancion y declaracion
  exports: [
    ListaArticuloComponent,
    RegistroFacturaComponent,
    ProveedorComponent,
    ReportePresupuestoComponent,
    ReporteStaffComponent
  ],

  declarations: [
    CONTROL_COSTOS_RUTAS_COMPONENTES,
    DialogDetalleDocumentoComponent,
    DialogTrasladarDocumentoComponent,
    DialogEditAprobacionComponent,
    RequerimientoSctrComponent,
    BoletaDetalleDialogComponent,
    BoletaListaValidacionDialogComponent,
    RequerimientoSmComponent,
    RequerimientoSmComponent,
    RequerimientoRrComponent,
    RequerimientoReComponent,
    RequerimientoRhComponent,
    RequerimientoRpComponent,
    ListaArticuloComponent, //importante para compartir el componente en otro modulo
    RegistroFacturaComponent, //importante para compartir el componente en otro modulo
    ProveedorComponent,//importante para compartir el componente en otro modulo
    ReportePresupuestoComponent,
    ReporteStaffComponent
  ],
  entryComponents: [
    DialogInformeGastoComponent
  ]
})
export class ControlCostosModule {}
