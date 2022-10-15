import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ContainerInsideComponent } from "../../shared/components/container-inside/container-inside.component";
import { Oauth2Guard } from "../../shared/guards/oauth2.guard";

//#region Facturacion componente

//#region Catalogo Cliente
import { CatalogoListComponent } from "./facturacion/datos-basicos/catalogo-cliente/list/catalogo-list.component";
import { CatalogoAddComponent } from "./facturacion/datos-basicos/catalogo-cliente/add/catalogo-add.component";
import { CatalogoEditComponent } from "./facturacion/datos-basicos/catalogo-cliente/edit/catalogo-edit.component";
//#endregion

//#region Series
import { SerieAddComponent } from "./facturacion/datos-basicos/series/add/serie-add.component";
import { SerieListComponent } from "./facturacion/datos-basicos/series/list/serie-list.component";
import { SerieEditComponent } from "./facturacion/datos-basicos/series/edit/serie-edit.component";
//#endregion

//#region Comprobantes

import { ComprobanteAddComponent } from "./facturacion/comprobantes/add/comprobante-add.componet";
import { ComprobanteEditComponent } from "./facturacion/comprobantes/edit/comprobante-edit.componet";
import { ComprobanteListComponent } from "./facturacion/comprobantes/list/comprobante-list.componet";
import { DialogFechaPagoComponent } from "./facturacion/comprobantes/components/dialog-fecha-pago/dialog-fecha-pago.component";
import { DialogMaterialFacComponent } from "./facturacion/comprobantes/components/dialog-material-fac/dialog-material-fac.component";
//#endregion

//#region Objetivos Facturacion

import { ObjetivosFacturacionListComponent } from "./facturacion/objetivos-equipo/objetivos-facturacion/list/objetivos-facturacion-list.component";
import { ObjetivosFacturacionAddComponent } from "./facturacion/objetivos-equipo/objetivos-facturacion/add/objetivos-facturacion-add.component";
import { ObjetivosFacturacionEditComponent } from "./facturacion/objetivos-equipo/objetivos-facturacion/edit/objetivos-facturacion-edit.component";
import { ObjetivosDialogComponent } from "./facturacion/objetivos-equipo/objetivos-facturacion/edit/objetivos-dialog/objetivos-dialog.component";
import { ClientesDialogComponent } from "./facturacion/objetivos-equipo/objetivos-facturacion/edit/clientes-dialog/clientes-dialog.component";
import { EjecutivosDialogComponent } from "./facturacion/objetivos-equipo/objetivos-facturacion/edit/ejecutivos-dialog/ejecutivos-dialog.component";

//#endregion

//#region Notas de Credito

import { NotasCreditoAddComponent } from "./facturacion/notas-credito/add/notas-credito-add.component";
import { NotasCreditoEditComponent } from "./facturacion/notas-credito/edit/notas-credito-edit.component";
import { NotasCreditoListComponent } from "./facturacion/notas-credito/list/notas-credito-list.component";
import { HistorialEstadoComponent } from "./facturacion/notas-credito/dialogs/historial-estado/historial-estado.component";

//#endregion

//#region Presupuestos no considerado
import { PptonoConsideradoListComponent } from "./facturacion/objetivos-equipo/Ppto-nocontarse/list/ppto-noconsiderado-list.component";
import { PptonoConsideradoAddComponent } from "./facturacion/objetivos-equipo/Ppto-nocontarse/add/ppto-noconsiderado-add.component";
import { PptoModalComponent } from "./facturacion/objetivos-equipo/Ppto-nocontarse/add/pptoModal/pptoModal.component";
import { PptonoConsideradoEditComponent } from "./facturacion/objetivos-equipo/Ppto-nocontarse/edit/ppto-noconsiderado-edit.component";
import { PptoModalEditComponent } from "./facturacion/objetivos-equipo/Ppto-nocontarse/edit/pptoModal/pptoModalEdit.component";
//#endregion

//#region Reportes

import { ReportesComponent } from "./facturacion/reportes/reportes.component";
import { PptoPendienteFacturarComponent } from "./facturacion/reportes/ppto-pendiente-facturar/ppto-pendiente-facturar.component";
import { RegistroVentasComponent } from "./facturacion/reportes/registro-ventas/registro-ventas.component";
import { IndicadorCobranzaComponent } from "./facturacion/reportes/indicador-cobranza/indicador-cobranza.component";
import { ExpRegistroVentasComponent } from "./facturacion/reportes/exp-registro-ventas/exp-registro-ventas.component";

//#endregion

//#endregion

//#region Tesoreria componente

import { ControldComponent } from './tesoreria/controld/controld.component';
import { ControldDepositoComponent } from './tesoreria/controld/Modals/controld-deposito/controld-deposito.component';

import { DialogHistorialEstadoComponent } from './facturacion/comprobantes/components/dialog-historial-estado/dialog-historial-estado.component';
//#endregion

//Datos Basicos
const catalogoCliente = [CatalogoListComponent, CatalogoAddComponent, CatalogoEditComponent];
const serie = [SerieAddComponent, SerieListComponent, SerieEditComponent];

//Facturacion
const comprobantes = [ComprobanteListComponent, ComprobanteAddComponent, ComprobanteEditComponent, DialogHistorialEstadoComponent,DialogFechaPagoComponent,DialogMaterialFacComponent];
const objetivosFacturacion = [ObjetivosFacturacionListComponent, ObjetivosFacturacionAddComponent,ObjetivosFacturacionEditComponent, ObjetivosFacturacionEditComponent, ObjetivosDialogComponent, ClientesDialogComponent, EjecutivosDialogComponent]
const pptonoConsiderado = [PptonoConsideradoListComponent, PptonoConsideradoAddComponent, PptonoConsideradoEditComponent, PptoModalComponent, PptoModalEditComponent];
const notaCredito = [NotasCreditoListComponent, NotasCreditoAddComponent, NotasCreditoEditComponent, HistorialEstadoComponent]
const reportes = [ReportesComponent, PptoPendienteFacturarComponent, RegistroVentasComponent, IndicadorCobranzaComponent, ExpRegistroVentasComponent]
 
//#endregion


//tesoreria 
const controld = [ControldComponent];
//#endregion

export const TESORERIA_RUTAS_COMPOMENTES = [
  controld,
  ControldDepositoComponent
];

export const FACTURACION_RUTAS_COMPONENTES = [
  catalogoCliente,
  serie,
  comprobantes,
  pptonoConsiderado,
  objetivosFacturacion,
  notaCredito,
  reportes
];

const routes: Routes = [
  {
    path: "tfi",
    component: ContainerInsideComponent,
    canActivate: [Oauth2Guard],
    children: [
      {
        path: "facturacion",
        component: null,
        children: [
          {
            path: "Objetivos",
            component: null,
            children: [

              //#region Presupuestos no considerados

              {
                path: "pptosnoconsiderar",
                component: PptonoConsideradoListComponent,
              },
              {
                path: "pptosnoconsiderar/add",
                component: PptonoConsideradoAddComponent,
              },
              {
                path: "pptosnoconsiderar/edit/:id/:anio",
                component: PptonoConsideradoEditComponent,
              },
              {
                path: "pptmodal",
                component: PptoModalComponent,
              },
              {
                path: "pptmodaledit",
                component: PptoModalEditComponent,
              },

              //#endregion

              //#region  Objetivos Facturacion

              {
                path: "fact_objetivos",
                component: ObjetivosFacturacionListComponent,
              },
              {
                path: "fact_objetivos/add",
                component: ObjetivosFacturacionAddComponent
              },
              {
                path: "fact_objetivos/edit/:anio",
                component: ObjetivosFacturacionEditComponent
              },
              {
                path: "objetivos-dialog",
                component: ObjetivosDialogComponent
              },
              {
                path: "clientes-dialog",
                component: ClientesDialogComponent
              },
              {
                path: "ejecutivos-dialog",
                component: EjecutivosDialogComponent
              }

              //#endregion
            ]
          },
          {
            path: "comprobante",
            component: null,
            children: [
              {
                path: "list",
                component: ComprobanteListComponent
              },
              {
                path: "add",
                component: ComprobanteAddComponent
              },
              {
                path: "edit/:id",
                component: ComprobanteEditComponent
              },
            ]
          },
          {
            path: "fact-notas",
            component: null,
            children: [
              {
                path: "list",
                component: NotasCreditoListComponent
              },
              {
                path: "add",
                component: NotasCreditoAddComponent
              },
              {
                path: "edit/:id",
                component: NotasCreditoEditComponent
              },
            ]
          },
          {
            path: "datosbasicos",
            component: null,
            children: [

              //#region Catalogo Cliente

              {
                path: "catalagocliente",
                component: CatalogoListComponent,
              },
              {
                path: "catalagocliente/add",
                component: CatalogoAddComponent
              },
              {
                path: "catalagocliente/edit/:id",
                component: CatalogoEditComponent
              },

              //#endregion

              //#region Series

              {
                path: "serie",
                component: SerieListComponent,
              },
              {
                path: "serie/add",
                component: SerieAddComponent,
              },
              {
                path: "serie/edit/:id",
                component: SerieEditComponent,
              }

              //#endregion
            ],
          },
          {
            path: "fact-reportes",
            component: ReportesComponent
          }
        ],
      },
      {
        path: "tesoreria",
        component: null,
        children: [
          {
            path: "controld",
            component: ControldComponent
          }
        ]
      }, 
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class TfiRutasModule { }


