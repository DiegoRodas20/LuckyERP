import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { Oauth2Interceptor } from './shared/guards/oauth2.interceptor';
import { Oauth2Service } from './shared/guards/oauth2.service';

import { AppRoutingModule, ROUTING_COMPONENTS } from './app-routing.module';
import { AppMaterialModule } from './shared/material/app-material.module';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ComercialModule } from './modulos/comercial/comercial.module';
import { ControlCostosModule } from './modulos/control-costos/control-costos.module';
import { EGyHumanaModule } from './modulos/egy-humana/egy-humana.module';
import { MantenimientoModule } from './modulos/mantenimiento/mantenimiento.module';
import { SeguridadModule } from './modulos/seguridad/seguridad.module';
import { InicioModule } from './modulos/Inicio/inicio.module';
import { AlmacenModule } from './modulos/almacen/almacen.module';
import { LegalModule } from './modulos/legal/legal.module'; 
import { TfiModule } from './modulos/TFI/tfi.module';
import { TilModule } from './modulos/TIL/til.module';
import { FinanzasModule } from './modulos/finanzas/finanzas.module';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { SnotifyService, ToastDefaults } from 'ng-snotify';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getSpanishPaginatorIntl } from './spanish-paginator-intl';


@NgModule({
  declarations: [AppComponent, ROUTING_COMPONENTS],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SeguridadModule,
    ComercialModule,
    TfiModule,
    ControlCostosModule, 
    EGyHumanaModule,
    MantenimientoModule,
    InicioModule,
    AlmacenModule,
    LegalModule, 
    TilModule,
    FinanzasModule,
    AppMaterialModule,
    NgxSpinnerModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),

  ],
  providers: [
    Oauth2Service, {
      provide: HTTP_INTERCEPTORS,
      useClass: Oauth2Interceptor,
      multi: true,
    },
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults },
    SnotifyService,
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() }

  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

