import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContainerInsideComponent } from '../../shared/components/container-inside/container-inside.component';
import { Oauth2Guard } from './../../shared/guards/oauth2.guard';

// tslint:disable: max-line-length

import { DialogUbigeoComponent } from './JefaturaATC/Reclutamiento/dialog-ubigeo/dialog-ubigeo.component';
import { ContactacionComponent } from './JefaturaATC/Reclutamiento/contactacion/contactacion.component';
import { EvaluacionComponent } from './JefaturaATC/Reclutamiento/evaluacion/evaluacion.component';
import { FichatecnicaComponent } from './JefaturaATC/Reclutamiento/fichatecnica/fichatecnica.component';
import { FidelizacionComponent } from './JefaturaATC/Reclutamiento/fidelizacion/fidelizacion.component';
import { FidDocumentoComponent } from './JefaturaATC/Reclutamiento/fidelizacion/fid-documento/fid-documento.component';
import { FidVisorComponent } from './JefaturaATC/Reclutamiento/fidelizacion/fid-visor/fid-visor.component';
import { FidEnviarComponent } from './JefaturaATC/Reclutamiento/fidelizacion/fid-enviar/fid-enviar.component';
import { FidListaEnviarComponent } from './JefaturaATC/Reclutamiento/fidelizacion/fid-lista-enviar/fid-lista-enviar.component';
import { HistoricoComponent } from './JefaturaATC/Reclutamiento/historico/historico.component';
import { SelPostulantesComponent } from './JefaturaATC/Reclutamiento/sel-postulantes/sel-postulantes.component';
import { SelPostulantesVisorComponent } from './JefaturaATC/Reclutamiento/sel-postulantes/sel-postulantes-visor/sel-postulantes-visor.component';

//#region Jefatura AP

import { PersonalComponent } from './../comercial/requerimiento/personal/personal.component';

// Control de personal
import { ControlpComponent } from './JefaturaAP/Administracion/controlp/controlp.component';
import { ControlpNewComponent } from './JefaturaAP/Administracion/controlp/Modals/controlp-new/controlp-new.component';
import { ControlpReclutComponent } from './JefaturaAP/Administracion/controlp/Modals/controlp-reclut/controlp-reclut.component';
import { ControlpViewComponent } from './JefaturaAP/Administracion/controlp/Modals/controlp-view/controlp-view.component';
import { ControlpRemComponent } from './JefaturaAP/Administracion/controlp/Modals/controlp-rem/controlp-rem.component';

// Atencion de personal
import { AtencionpComponent } from './JefaturaAP/Atencion/atencionp/atencionp.component';
import { AtencionpSearchComponent } from './JefaturaAP/Atencion/atencionp/Modals/atencionp-search/atencionp-search.component';
import { AtencionpBoletasComponent } from './JefaturaAP/Atencion/atencionp/Modals/atencionp-boletas/atencionp-boletas.component';
import { AtencionpRenunciaComponent } from './JefaturaAP/Atencion/atencionp/Modals/atencionp-renuncia/atencionp-renuncia.component';
import { AtencionpRemuneracionesComponent } from './JefaturaAP/Atencion/atencionp/Modals/atencionp-remuneraciones/atencionp-remuneraciones.component';
import { AtencionpDescuentosComponent } from './JefaturaAP/Atencion/atencionp/Modals/atencionp-descuentos/atencionp-descuentos.component';

// Contratos
import { GestioncComponent } from './JefaturaAP/Contratos/gestionc/gestionc.component';
import { GestioncDetailComponent } from './JefaturaAP/Contratos/gestionc/Modals/gestionc-detail/gestionc-detail.component';
import { GestioncIncidenciaComponent } from './JefaturaAP/Contratos/gestionc/Modals/gestionc-incidencia/gestionc-incidencia.component';

import { ControlcComponent } from './JefaturaAP/Contratos/controlc/controlc.component';
import { ControlcDetailComponent } from './JefaturaAP/Contratos/controlc/Modals/controlc-detail/controlc-detail.component';
import { ControlcSearchComponent } from './JefaturaAP/Contratos/controlc/Modals/controlc-search/controlc-search.component';

// Subsidio
import { ControlsComponent } from './JefaturaAP/Administracion/controls/controls.component';

// Control descuentos
import { ControldComponent } from './JefaturaAP/Administracion/controld/controld.component';
import { ControldScannerComponent } from './JefaturaAP/Administracion/controld/Modals/controld-scanner/controld-scanner.component';

// Digitalización de documento
import { DigidocComponent } from './JefaturaAP/ApoyoTecnico/digidoc/digidoc.component';
import { DigidocSearchComponent } from './JefaturaAP/ApoyoTecnico/digidoc/Modals/digidoc-search/digidoc-search.component';
import { DigidocScannerComponent } from './JefaturaAP/ApoyoTecnico/digidoc/Modals/digidoc-scanner/digidoc-scanner.component';

import { BoletaspComponent } from './JefaturaAP/BoletasPago/boletasp/boletasp.component';

// Control de asistencia personal
import { ControlapComponent } from './JefaturaAP/Administracion/controlap/controlap.component';
import { ControlapContactpComponent } from './JefaturaAP/Administracion/controlap/Modals/controlap-contactp/controlap-contactp.component';
import { ControlapDetailpComponent } from './JefaturaAP/Administracion/controlap/Modals/controlap-detailp/controlap-detailp.component';
import { ControlapContactrComponent } from './JefaturaAP/Administracion/controlap/Modals/controlap-contactr/controlap-contactr.component';
import { ControlapRejectionComponent } from './JefaturaAP/Administracion/controlap/Modals/controlap-rejection/controlap-rejection.component';

// Cuentas banco
import { CuentasbComponent } from './JefaturaAP/Administracion/cuentasb/cuentasb.component';
import { CuentasbSearchComponent } from './JefaturaAP/Administracion/cuentasb/Modals/cuentasb-search/cuentasb-search.component';
import { CuentasbDetailComponent } from './JefaturaAP/Administracion/cuentasb/Modals/cuentasb-detail/cuentasb-detail.component';
import { CuentasbCuentaComponent } from './JefaturaAP/Administracion/cuentasb/Modals/cuentasb-cuenta/cuentasb-cuenta.component';
import { CuentasbExportComponent } from './JefaturaAP/Administracion/cuentasb/Modals/cuentasb-export/cuentasb-export.component';
import { CuentasbImportComponent } from './JefaturaAP/Administracion/cuentasb/Modals/cuentasb-import/cuentasb-import.component';
import { CuentasbReplaceComponent } from './JefaturaAP/Administracion/cuentasb/Modals/cuentasb-replace/cuentasb-replace.component';

// Exámenes médicos
import { GestionemComponent } from './JefaturaAP/SeguridadSaludT/gestionem/gestionem.component';
import { GestionemDetailComponent } from './JefaturaAP/SeguridadSaludT/gestionem/Modals/gestionem-detail/gestionem-detail.component';
import { GestionemCitasComponent } from './JefaturaAP/SeguridadSaludT/gestionem/Modals/gestionem-citas/gestionem-citas.component';
import { ControlemComponent } from './JefaturaAP/SeguridadSaludT/controlem/controlem.component';
import { ControlemDetailrComponent } from './JefaturaAP/SeguridadSaludT/controlem/Modals/controlem-detailr/controlem-detailr.component';
import { ControlemRangeComponent } from './JefaturaAP/SeguridadSaludT/controlem/Modals/controlem-range/controlem-range.component';
import { ControlemDetailpComponent } from './JefaturaAP/SeguridadSaludT/controlem/Modals/controlem-detailp/controlem-detailp.component';
import { ControlemExamenmComponent } from './JefaturaAP/SeguridadSaludT/controlem/Modals/controlem-examenm/controlem-examenm.component';

// Declaraciones
import { DeclaracionpComponent } from './JefaturaAP/Declaraciones/declaracionp/declaracionp.component';
import { DeclaracionpVersusComponent } from './JefaturaAP/Declaraciones/declaracionp/Modals/declaracionp-versus/declaracionp-versus.component';

import { DeclaracionaComponent } from './JefaturaAP/Declaraciones/declaraciona/declaraciona.component';
import { DeclaracionaExportComponent } from './JefaturaAP/Declaraciones/declaraciona/Modals/declaraciona-export/declaraciona-export.component';
import { DeclaracionaCompareComponent } from './JefaturaAP/Declaraciones/declaraciona/Modals/declaraciona-compare/declaraciona-compare.component';

// Prestacion alimentaria
import { ControlpaComponent } from './JefaturaAP/Administracion/controlpa/controlpa.component';
import { ControlpaDepositoComponent } from './JefaturaAP/Administracion/controlpa/Modals/controlpa-deposito/controlpa-deposito.component';
import { ControlpaDetailComponent } from './JefaturaAP/Administracion/controlpa/Modals/controlpa-detail/controlpa-detail.component';
import { ControlpaDetailpComponent } from './JefaturaAP/Administracion/controlpa/Modals/controlpa-detailp/controlpa-detailp.component';

// Vacaciones
import { ControlvComponent } from './JefaturaAP/Vacaciones/controlv/controlv.component';
import { ControvDetalleComponent } from './JefaturaAP/Vacaciones/controlv/Modals/controv-detalle/controv-detalle.component';
import { ControvViewComponent } from './JefaturaAP/Vacaciones/controlv/Modals/controv-view/controv-view.component';
import {ControvSearchComponent} from './JefaturaAP/Vacaciones/controlv/Modals/controv-search/controv-search.component';

import { SolicitudvComponent } from './JefaturaAP/Vacaciones/solicitudv/solicitudv.component';
import { GestionvComponent } from './JefaturaAP/Vacaciones/gestionv/gestionv.component';
import { ControvScannerComponent } from './JefaturaAP/Vacaciones/controlv/Modals/controv-scanner/controv-scanner.component';

// Control de retención judicial
import { ControlrjComponent } from './JefaturaAP/Administracion/controlrj/controlrj.component';
import { ControlrjSearchComponent } from './JefaturaAP/Administracion/controlrj/Modals/controlrj-search/controlrj-search.component';
import { ControlrjDetalleComponent } from './JefaturaAP/Administracion/controlrj/Modals/controlrj-detalle/controlrj-detalle.component';
import { ControlrjDepositosComponent } from './JefaturaAP/Administracion/controlrj/Modals/controlrj-depositos/controlrj-depositos.component';
import { ControlrjPersonalComponent } from './JefaturaAP/Administracion/controlrj/Modals/controlrj-personal/controlrj-personal.component';
import { ControlrjGenerardComponent } from './JefaturaAP/Administracion/controlrj/Modals/controlrj-generard/controlrj-generard.component';
import { ControlrjRegistrardComponent } from './JefaturaAP/Administracion/controlrj/Modals/controlrj-registrard/controlrj-registrard.component';

// Asistencia Manual
import { AsistenciaManualComponent } from './JefaturaAP/Asistencia/asistencia-manual/asistencia-manual.component';
import { AsistenciaPersonalComponent } from './JefaturaAP/Asistencia/asistencia-manual/Modals/asistencia-personal/asistencia-personal.component';
import { DialogNuevaContactacionComponent } from './JefaturaATC/Reclutamiento/dialog-nueva-contactacion/dialog-nueva-contactacion.component';

// Datos basicos
import { AtcMatrizGcpComponent } from './JefaturaATC/Reclutamiento/datos-basicos/atc-matriz-gcp/atc-matriz-gcp.component';
import { AtcMatrizGcpModalComponent } from './JefaturaATC/Reclutamiento/datos-basicos/atc-matriz-gcp/atc-matriz-gcp-modal/atc-matriz-gcp-modal.component';
import { AtcMatrizPuestoRfbComponent } from './JefaturaATC/Reclutamiento/datos-basicos/atc-matriz-puesto-rfb/atc-matriz-puesto-rfb.component';
import { AtcMatrizPuestoRfbModalComponent } from './JefaturaATC/Reclutamiento/datos-basicos/atc-matriz-puesto-rfb/atc-matriz-puesto-rfb-modal/atc-matriz-puesto-rfb-modal.component';

// Liquidaciones
import { LiquidacionPersonalComponent } from './JefaturaAP/Liquidaciones/liquidacion-personal/liquidacion-personal.component';
import { CalculolPeriodoComponent } from './JefaturaAP/Liquidaciones/liquidacion-personal/Modals/calculol-periodo/calculol-periodo.component';
import { CalculogPeriodoComponent } from './JefaturaAP/Liquidaciones/liquidacion-personal/Modals/calculog-periodo/calculog-periodo.component';

// Esquemas
import { EsquemaComponent } from './JefaturaAP/Esquemas/esquema/esquema.component';
import { EsquemaAfpnetComponent } from './JefaturaAP/Esquemas/esquema/Modals/esquema-afpnet/esquema-afpnet.component';

// Inasistencia
import { GestioniComponent } from './JefaturaAP/Asistencia/gestioni/gestioni.component';
import { GestioniManagementComponent } from './JefaturaAP/Asistencia/gestioni/modals/gestioni-management/gestioni-management.component';
import { GestioniDetailComponent } from './JefaturaAP/Asistencia/gestioni/modals/gestioni-detail/gestioni-detail.component';
import { ControliComponent } from './JefaturaAP/Asistencia/controli/controli.component';
import { ControliManagementComponent } from './JefaturaAP/Asistencia/controli/modals/controli-management/controli-management.component';
import { ControliChangesComponent } from './JefaturaAP/Asistencia/controli/modals/controli-changes/controli-changes.component';
import { ControliSearchComponent } from './JefaturaAP/Asistencia/controli/modals/controli-search/controli-search.component';
import { GestioniInformacionPersonalComponent } from './JefaturaAP/Asistencia/gestioni/componentes/gestioni-informacion-personal/gestioni-informacion-personal.component';

// Nomina
import { CalculopComponent } from './JefaturaAP/Administracion/calculop/calculop.component';
import { CalculopDevengueComponent } from './JefaturaAP/Administracion/calculop/Modals/calculop-devengue/calculop-devengue.component';
import { CalculopResultComponent } from './JefaturaAP/Administracion/calculop/Modals/calculop-result/calculop-result.component';
import { CalculopDepositComponent } from './JefaturaAP/Administracion/calculop/Modals/calculop-deposit/calculop-deposit.component';
import { EsquemaInfopersonalComponent } from './JefaturaAP/Esquemas/esquema/Modals/esquema-infopersonal/esquema-infopersonal.component';

// Costo Empresa
import { GestionceComponent } from './JefaturaAP/CostoEmpresa/gestionce/gestionce.component';
import { GestionceGenerarComponent } from './JefaturaAP/CostoEmpresa/gestionce/Modals/gestionce-generar/gestionce-generar.component';
import { GestionceParamComponent } from './JefaturaAP/CostoEmpresa/gestionce/Modals/gestionce-param/gestionce-param.component';
import { GestionceAddParamComponent } from './JefaturaAP/CostoEmpresa/gestionce/Modals/gestionce-add-param/gestionce-add-param.component';

//#endregion

export const EGY_HUMANA_RUTAS_COMPONENTES = [
  ContactacionComponent,
  EvaluacionComponent,
  FichatecnicaComponent,
  FidelizacionComponent,
  FidDocumentoComponent,
  FidEnviarComponent,
  FidVisorComponent,
  FidListaEnviarComponent,
  HistoricoComponent,
  ControlpComponent,
  ControlpNewComponent,
  ControlpReclutComponent,
  ControlpViewComponent,
  ControlpRemComponent,
  DialogUbigeoComponent,
  DialogNuevaContactacionComponent,
  AtencionpComponent,
  AtencionpSearchComponent,
  AtencionpBoletasComponent,
  AtencionpRenunciaComponent,
  AtencionpRemuneracionesComponent,
  AtencionpDescuentosComponent,
  ControlsComponent,
  CuentasbComponent,
  CuentasbSearchComponent,
  CuentasbDetailComponent,
  CuentasbCuentaComponent,
  CuentasbExportComponent,
  CuentasbImportComponent,
  CuentasbReplaceComponent,
  ControldComponent,
  ControldScannerComponent,
  SolicitudvComponent,
  GestionvComponent,
  ControlvComponent,
  CalculopComponent,
  ControvScannerComponent,
  DigidocComponent,
  DigidocSearchComponent,
  DigidocScannerComponent,
  GestioncComponent,
  GestioncDetailComponent,
  GestioncIncidenciaComponent,
  ControlcComponent,
  ControlcDetailComponent,
  ControlcSearchComponent,
  BoletaspComponent,
  ControlapComponent,
  ControlapContactpComponent,
  ControlapDetailpComponent,
  ControlapContactrComponent,
  ControlapRejectionComponent,
  GestionemComponent,
  GestionemDetailComponent,
  GestionemCitasComponent,
  ControlemComponent,
  ControlemDetailrComponent,
  ControlemRangeComponent,
  ControlemDetailpComponent,
  ControlemExamenmComponent,
  DeclaracionpComponent,
  DeclaracionpVersusComponent,
  DeclaracionaComponent,
  DeclaracionaExportComponent,
  DeclaracionaCompareComponent,
  ControlpaComponent,
  ControlpaDepositoComponent,
  ControlpaDetailComponent,
  ControlpaDetailpComponent,
  ControvDetalleComponent,
  ControvViewComponent,
  ControvSearchComponent,
  ControlrjComponent,
  ControlrjSearchComponent,
  ControlrjDetalleComponent,
  ControlrjDepositosComponent,
  ControlrjPersonalComponent,
  ControlrjGenerardComponent,
  ControlrjRegistrardComponent,
  AsistenciaManualComponent,
  AsistenciaPersonalComponent,
  SelPostulantesComponent,
  SelPostulantesVisorComponent,
  LiquidacionPersonalComponent,
  CalculolPeriodoComponent,
  AtcMatrizGcpComponent,
  AtcMatrizGcpModalComponent,
  AtcMatrizPuestoRfbComponent,
  AtcMatrizPuestoRfbModalComponent,
  CalculogPeriodoComponent,
  EsquemaComponent,
  EsquemaAfpnetComponent,
  GestioniComponent,
  GestioniManagementComponent,
  GestioniDetailComponent,
  ControliComponent,
  ControliManagementComponent,
  ControliChangesComponent,
  ControliSearchComponent,
  GestioniInformacionPersonalComponent,
  CalculopDevengueComponent,
  CalculopResultComponent,
  CalculopDepositComponent,
  EsquemaInfopersonalComponent,
  GestionceComponent,
  GestionceGenerarComponent,
  GestionceParamComponent,
  GestionceAddParamComponent
];

const routes: Routes = [
  {
    path: 'eyh',
    component: ContainerInsideComponent,
    canActivate: [Oauth2Guard],
    children: [
      {
        path: 'atracciontalento',
        component: null,
        children: [
          {
            path: 'personal',
            component: PersonalComponent,
          },
          {
            path: 'contactacion',
            component: ContactacionComponent,
          },
          {
            path: 'evaluacion',
            component: EvaluacionComponent,
          },
          {
            path: 'fidelizacion',
            component: FidelizacionComponent,
          },
          {
            path: 'postulantes',
            component: SelPostulantesComponent,
          },
          {
            path: 'datos-basicos',
            component: null,
            children: [
              {
                path: 'atc-matriz-puesto-rfb',
                component: AtcMatrizPuestoRfbComponent
              },
              {
                path: 'atc-matriz-gcp',
                component: AtcMatrizGcpComponent
              },


            ]
          }
        ],
      },
      {
        path: 'administracionpersonal',
        component: null,
        children: [
          {
            path: 'planillas',
            component: null,
            children: [
              {
                path: 'controlpersonal',
                component: ControlpComponent,
              },
              {
                path: 'controlsubsidio',
                component: ControlsComponent,
              },
              {
                path: 'cuentasbanco',
                component: CuentasbComponent,
              },
              {
                path: 'controldescuento',
                component: ControldComponent,
              },
              {
                path: 'calculoperiodo',
                component: CalculopComponent,
              },
              {
                path: 'controlap',
                component: ControlapComponent,
              },
              {
                path: 'controlpa',
                component: ControlpaComponent,
              },
              {
                path: 'controlrj',
                component: ControlrjComponent,
              },
            ],
          },
          {
            path: 'atencion',
            component: null,
            children: [
              {
                path: 'atencionpersonal',
                component: AtencionpComponent,
              },
            ],
          },
          {
            path: 'vacaciones',
            component: null,
            children: [
              {
                path: 'solicitudvacaciones',
                component: SolicitudvComponent,
              },
              {
                path: 'gestionvacaciones',
                component: GestionvComponent,
              },
              {
                path: 'controlvacaciones',
                component: ControlvComponent,
              },
            ],
          },
          {
            path: 'apoyotecnico',
            component: null,
            children: [
              {
                path: 'digidoc',
                component: DigidocComponent,
              },
            ],
          },
          {
            path: 'contratos',
            component: null,
            children: [
              {
                path: 'gestioncontratos',
                component: GestioncComponent,
              },
              {
                path: 'controlcontratos',
                component: ControlcComponent,
              },
            ],
          },
          {
            path: 'boletasp',
            component: BoletaspComponent,
          },
          {
            path: 'esquema',
            component: EsquemaComponent,
          },
          {
            path: 'declaraciones',
            component: null,
            children: [
              {
                path: 'declaracionp',
                component: DeclaracionpComponent,
              },
              {
                path: 'declaraciona',
                component: DeclaracionaComponent,
              },
            ],
          },
          {
            path: 'asistencia',
            component: null,
            children: [
              {
                path: 'asistenciam',
                component: AsistenciaManualComponent,
              },
              {
                path: 'gestioni',
                component: GestioniComponent,
              },
              {
                path: 'controli',
                component: ControliComponent,
              }
            ],
          },
          {
            path: 'liquidacion',
            component: null,
            children: [
              {
                path: 'liquidacionp',
                component: LiquidacionPersonalComponent,
              },
            ],
          },

          {
            path: 'seguridadsaludt',
            component: null,
            children: [
              {
                path: 'gestionexamenesmedicos',
                component: GestionemComponent,
              },
              {
                path: 'controlexamenesmedicos',
                component: ControlemComponent,
              },
            ],
          },
          {
            path: 'costoempresa',
            component: null,
            children: [
              {
                path: 'gestionce',
                component: GestionceComponent
              }
            ]
          }
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class EGyHumanaRutasModule { }
