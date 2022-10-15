import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { AppMaterialModule } from "../../shared/material/app-material.module";
import { NgxSpinnerModule } from "ngx-spinner";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgxDocViewerModule } from "ngx-doc-viewer";
import { NgSelectModule } from "@ng-select/ng-select";
import { GoogleMapsModule } from "@angular/google-maps";

import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { AgmCoreModule, GoogleMapsAPIWrapper } from "@agm/core";
import { AgmDirectionModule } from "agm-direction";
import { NgImageFullscreenViewModule } from "ng-image-fullscreen-view";

import { BrowserModule } from "@angular/platform-browser";
import { registerLocaleData } from "@angular/common";
import localeEs from "@angular/common/locales/es";

import { DirectivesModule } from "src/app/shared/directives/directives.module";

registerLocaleData(localeEs);

//#region STORE
import { NgxPrintModule } from "ngx-print";
import { NgxsModule } from "@ngxs/store";
import { NgxsReduxDevtoolsPluginModule } from "@ngxs/devtools-plugin";
import { NgxsLoggerPluginModule } from "@ngxs/logger-plugin";
import { environment } from "src/environments/environment";

//------------------------------

import { AngularEditorModule } from "@kolkov/angular-editor";
//------------------------------
import { FormatoBusquedaState } from "./CartasTienda/store/carta_tienda/formato_busqueda/formato_busqueda.state";
import { FormatoDeFormatoCartaTiendaState } from "./CartasTienda/store/carta_tienda/formato_carta_tienda/formato_carta_tienda.state";
import { CampoDeFormatoCartaTiendaState } from "./CartasTienda/store/carta_tienda/campo_carta_tienda/campo_carta_tienda.state";
import { PersonalDeFormatoCartaTiendaState } from "./CartasTienda/store/carta_tienda/personal_carta_tienda/personal_carta_tienda.state";
import { CartaTiendaState } from "./CartasTienda/store/carta_tienda/carta_tienda/carta_tienda.state";
import { ImprimirState } from "./CartasTienda/store/carta_tienda/imprimir/imprimir.state";
import { CampoBusquedaState } from "./CartasTienda/store/carta_tienda/campo_busqueda/campo_busqueda.state";
//#endregion

const libreria = [
  AppMaterialModule,
  NgxSpinnerModule,
  NgbModule,
  MatMomentDateModule,
  DragDropModule,
  NgxDocViewerModule,
  NgSelectModule,
  GoogleMapsModule,
  AgmDirectionModule,
  CalendarModule.forRoot({
    provide: DateAdapter,
    useFactory: adapterFactory,
  }),
  AgmCoreModule.forRoot({
    apiKey: "AIzaSyAnhgdkj9TZsfVSYC5EnVOSOxIdlneAuHw",
  }),
  NgImageFullscreenViewModule,
];

import {
  ComercialRutasModule,
  COMERCIAL_RUTAS_COMPONENTES,
} from "./comercial-rutas.module";

//Rutas Exportadas
import { AlmacenSaldoComponent } from "./Consultas/almacen-saldo/almacen-saldo.component";
import { MarcaComponent } from "./Cuentas/Matenimientos/marca/marca.component";
import { BottomSheetPuntosAsistencia } from "./Asistencia/asistenciap/Modals/asistenciap-sustento/asistenciap-sustento.component";
import { ComeArticuloPalletComponent } from "./Consultas/come-articulo-pallet/come-articulo-pallet.component";

@NgModule({
  imports: [
    CommonModule,
    ComercialRutasModule,
    ReactiveFormsModule,
    FormsModule,
    libreria,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AngularEditorModule,

    NgxsModule.forRoot(
      [
        CampoBusquedaState,
        FormatoBusquedaState,
        FormatoDeFormatoCartaTiendaState,
        CampoDeFormatoCartaTiendaState,
        PersonalDeFormatoCartaTiendaState,
        CartaTiendaState,
        ImprimirState,
      ],
      { developmentMode: environment.production }
    ),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: !environment.production,
    }),
    NgxsLoggerPluginModule.forRoot({
      disabled: !environment.production,
    }),
    NgxPrintModule,
    DirectivesModule,
  ],

  //Para compartir componentes entre modulos, debe estar declarado en las exportancion y declaracion
  exports: [
    AlmacenSaldoComponent, 
    MarcaComponent,
    ComeArticuloPalletComponent,
  ],

  declarations: [
    COMERCIAL_RUTAS_COMPONENTES,
    //importante para compartir el componente en otro modulo
    AlmacenSaldoComponent,
    MarcaComponent,
    ComeArticuloPalletComponent,
  ],
  entryComponents: [BottomSheetPuntosAsistencia],

  providers: [GoogleMapsAPIWrapper],
})
export class ComercialModule {}
