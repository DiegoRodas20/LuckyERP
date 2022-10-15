import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppMaterialModule } from '../../shared/material/app-material.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { GoogleMapsModule } from '@angular/google-maps';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';
import { NgSelectModule } from '@ng-select/ng-select';

import { registerLocaleData, DatePipe } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { DirectivesModule } from 'src/app/shared/directives/directives.module';

import { SnotifyModule } from 'ng-snotify';

registerLocaleData(localeEs);

const libreria = [
  AppMaterialModule,
  NgxSpinnerModule,
  NgbModule,
  MatMomentDateModule,
  DragDropModule,
  NgxDocViewerModule,
  GoogleMapsModule,
  NgbModalModule,
  NgSelectModule,
  SnotifyModule,
  AgmCoreModule.forRoot({
    apiKey: 'AIzaSyAnhgdkj9TZsfVSYC5EnVOSOxIdlneAuHw'
  }),
  CalendarModule.forRoot({
    provide: DateAdapter,
    useFactory: adapterFactory,
  })
];

import {
  EGyHumanaRutasModule,
  EGY_HUMANA_RUTAS_COMPONENTES,
} from './egy-humana-rutas.module';

@NgModule({
  imports: [
    libreria,
    CommonModule,
    EGyHumanaRutasModule,
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule
  ],
  providers: [ DatePipe ],
  declarations: [EGY_HUMANA_RUTAS_COMPONENTES]
})
export class EGyHumanaModule { }
