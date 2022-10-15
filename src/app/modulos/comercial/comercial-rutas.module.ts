import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ContainerInsideComponent } from "../../shared/components/container-inside/container-inside.component";
import { Oauth2Guard } from "./../../shared/guards/oauth2.guard";

import { PresupuestoComponent } from "./presupuesto/presupuesto.component";
import { DigpartidaComponent } from "./presupuesto/digpartida/digpartida.component";
import { DigcomentarioaprobacionComponent } from "./presupuesto/digcomentarioaprobacion/digcomentarioaprobacion.component";
import { DigcopiaComponent } from "./presupuesto/digCopia/digcopia.component";
import { ClientexMarcaComponent } from "./Cuentas/Matenimientos/clientex-marca/clientex-marca.component";
import { CrearpresupuestoComponent } from "./presupuesto/crearpresupuesto/crearpresupuesto.component";
import { DetPartidaPreComponent } from "./presupuesto/Detalle/DetallePartida/detpartidapre.component";
import { DetPartidaGenericaComponent } from "./presupuesto/Detalle/DetallePartidaGenerica/detpartidagenerica.component";
import { DetPartidaPersonalComponent } from "./presupuesto/Detalle/DetallePartidaPersonal/detpartidapersonal.component";
import { DigcontinuacionComponent } from "./presupuesto/digcontinuacion/digcontinuacion.component";
import { DigCambioEstadoComponent } from "./presupuesto/dig-cambio-estado/dig-cambio-estado.component";
import { DigFacturacionComponent } from "./presupuesto/dig-facturacion/dig-facturacion.component";

import { FotocheckComponent } from "./requerimiento/fotocheck/fotocheck.component";

//#region Sctr
import { DetsctrComponent } from "./requerimiento/sctr/detsctr/detsctr.component";
import { SctrComponent } from "./requerimiento/sctr/sctr.component";
import { ParametroSctrComponent } from "./Cuentas/Matenimientos/parametro-sctr/parametro-sctr.component";
import { DialogSctrComponent } from "./Cuentas/Matenimientos/parametro-sctr/dialog-sctr/dialog-sctr.component";
import { DialogconfirSctrComponent } from "./Cuentas/Matenimientos/parametro-sctr/dialogconfir-sctr/dialogconfir-sctr.component";
import { DialogAprobacionesComponent } from "./requerimiento/sctr/dialog-aprobaciones/dialog-aprobaciones.component";
import { DialogPdfComponent } from "./requerimiento/sctr/dialog-pdf/dialog-pdf.component";
import { DialogPdfVisorComponent } from "./requerimiento/sctr/dialog-pdf-visor/dialog-pdf-visor.component"
//#endregion

//#region tareo
import { MarcaComponent } from "./Cuentas/Matenimientos/marca/marca.component";
import { DialogCatalogoComponent } from "./Cuentas/Matenimientos/marca/marca-dialog.component";
//#endregion

//#region personal
import { PersonalComponent } from "./requerimiento/personal/personal.component";
import { ListaPostulanteComponent } from "./requerimiento/personal/listapersonal/listapostulante.component";
import { PortalModalComponent } from "./requerimiento/personal/portal-modal/portal-modal.component";

//#endregion

//#region Reembolso
import { ReembolsoComponent } from "./requerimiento/reembolso/reembolso.component";
import { DialogReembolsoComponent } from "./requerimiento/reembolso/dialog/dialog.component";
//#endregion

//#region AEFV
import { ConsultapComponent } from "./Consultas/consultap/consultap.component";
import { InformepComponent } from "./requerimiento/informep/informep.component";
import { AsistenciapComponent } from "./Asistencia/asistenciap/asistenciap.component";
import { GestionapComponent } from "./Asistencia/gestionap/gestionap.component";
import { KpiincentivoComponent } from "./requerimiento/kpipersonal/kpiincentivo/kpiincentivo.component";
import { KpiprovisComponent } from "./requerimiento/kpipersonal/kpiprovis/kpiprovis.component";
import { KpibonotrimestralComponent } from "./requerimiento/kpipersonal/kpibonotrimestral/kpibonotrimestral.component";
import { KpibonoresultadoComponent } from "./requerimiento/kpipersonal/kpibonoresultado/kpibonoresultado.component";
//#endregion

//#region cartas Tienda
import { CartaTiendaComponent } from "./CartasTienda/cartas/carta-tienda/carta-tienda.component";
import { TablaCartasComponent } from "./CartasTienda/cartas/tabla-cartas/tabla-cartas.component";

import { NuevoFormatoCartaTiendaComponent } from "./CartasTienda/formatos/nuevo-formato-carta-tienda/nuevo-formato-carta-tienda.component";
import { TablaFormatosComponent } from "./CartasTienda/formatos/tabla-formatos/tabla-formatos.component";

import { NuevoCampoFormatoCartaTiendaComponent } from "./CartasTienda/campos/nuevo-campo-formato-carta-tienda/nuevo-campo-formato-carta-tienda.component";
import { TablaCamposComponent } from "./CartasTienda/campos/tabla-campos/tabla-campos.component";

import { TablaPersonalComponent } from "./CartasTienda/personal/tabla-personal/tabla-personal.component";
import { EditarPersonalComponent } from "./CartasTienda/personal/editar-personal/editar-personal.component";
import { AgregarPersonalComponent } from "./CartasTienda/personal/agregar-personal/agregar-personal.component";
//#endregion

//#region COMPONENTES DINAMICOS
import { DesplegableCampoEmpleadoComponent } from "./CartasTienda/personal/campos/desplegable-campo-empleado/desplegable-campo-empleado.component";
import { AgregarDataDesplegableComponent } from "./CartasTienda/personal/campos/desplegable-campo-empleado/agregar-data-desplegable/agregar-data-desplegable.component";
import { NumeroCampoEmpleadoComponent } from "./CartasTienda/personal/campos/numero-campo-empleado/numero-campo-empleado.component";
import { TextoCampoEmpleadoComponent } from "./CartasTienda/personal/campos/texto-campo-empleado/texto-campo-empleado.component";
import { FechaCampoEmpleadoComponent } from "./CartasTienda/personal/campos/fecha-campo-empleado/fecha-campo-empleado.component";
import { HoraCampoEmpleadoComponent } from "./CartasTienda/personal/campos/hora-campo-empleado/hora-campo-empleado.component";
//#endregion

//region
import { PlantillaImprimirComponent } from "./CartasTienda/imprimir/plantilla-imprimir/plantilla-imprimir.component";

//#region
import { PrintLayoutComponent } from "./CartasTienda/imprimir/print-layout/print-layout.component";
import { DocumentoComponent } from "./CartasTienda/imprimir/documento/documento.component";
//#endregion

//#region Efectivo
import { EfectivoComponent } from "./requerimiento/efectivo/efectivo.component";
import { CrudefectivoComponent } from "./requerimiento/efectivo/crudefectivo/crudefectivo.component";
import { EstadoefectivoComponent } from "./requerimiento/efectivo/estadoefectivo/estadoefectivo.component";
//#endregion

//#region
import { SolicitudMovilidadComponent } from "./SolicitudMovilidad/solicitud-movilidad/solicitud-movilidad.component";
import { AsignacionMovilidadPersonalComponent } from "./SolicitudMovilidad/asignacion-movilidad-personal/asignacion-movilidad-personal.component";
import { DetalleSolicitudMovilidadComponent } from "./SolicitudMovilidad/detalle-solicitud-movilidad/detalle-solicitud-movilidad.component";
import { DetalleAddPersonalComponent } from "./SolicitudMovilidad/detalle-add-personal/detalle-add-personal.component";
// tslint:disable: max-line-length
// import { AprobacionSolicitudMovilidadComponent } from "./SolicitudMovilidad/aprobacion-solicitud-movilidad/aprobacion-solicitud-movilidad.component";
// import { AprobacionDetalleSolicitudMovilidadComponent } from "./SolicitudMovilidad/aprobacion-detalle-solicitud-movilidad/aprobacion-detalle-solicitud-movilidad.component";
// import { TareoStaffListComponent } from './Asistencia/tareo-staff/tareo-staff-list.component';
import { TareoListComponent } from "./Asistencia/tareo-staff/list/tareo-list.component";
import { TareoAddComponent } from "./Asistencia/tareo-staff/add/tareo-add.component";
import { TareoEditComponent } from "./Asistencia/tareo-staff/edit/tareo-edit.component";

import { DetalleCotizacionComponent } from "./requerimiento/SolicitudCotizacion/detalle-cotizacion/detalle-cotizacion.component";
import { ScVisorComponent } from "./requerimiento/SolicitudCotizacion/solicitud-cotizacion/sc/sc-visor/sc-visor.component";
import { SolicitudCotizacionComponent } from "./requerimiento/SolicitudCotizacion/solicitud-cotizacion/solicitud-cotizacion.component";
import { AddCotizacionComponent } from "./requerimiento/SolicitudCotizacion/add-cotizacion/add-cotizacion.component";
import { ScFileComponent } from "./requerimiento/SolicitudCotizacion/solicitud-cotizacion/sc/sc-file/sc-file.component";
import { HighlightPipe } from "./requerimiento/kpipersonal/kpiprovis/highlightPipe";

// Notas de Comercial a Logistica
import { NotasLogisticaComponent } from "./requerimiento/notas-logistica/notas-logistica.component";
import { NotaIngresoComponent } from "./requerimiento/notas-logistica/nota-ingreso/nota-ingreso.component";
import { NotaRecojoComponent } from "./requerimiento/notas-logistica/nota-recojo/nota-recojo.component";
import { NotaSalidaComponent } from "./requerimiento/notas-logistica/nota-salida/nota-salida.component";
import { NotaUtilesComponent } from "./requerimiento/notas-logistica/nota-utiles/nota-utiles.component";
import { NotaIngresoDetalleComponent } from "./requerimiento/notas-logistica/nota-ingreso/nota-ingreso-detalle/nota-ingreso-detalle.component";
import { NotaRecojoDetalleComponent } from "./requerimiento/notas-logistica/nota-recojo/nota-recojo-detalle/nota-recojo-detalle.component";
import { NotaSalidaDetalleComponent } from "./requerimiento/notas-logistica/nota-salida/nota-salida-detalle/nota-salida-detalle.component";
import { NotaUtilesDetalleComponent } from "./requerimiento/notas-logistica/nota-utiles/nota-utiles-detalle/nota-utiles-detalle.component";
import { NotaTrasladoComponent } from "./requerimiento/notas-logistica/nota-traslado/nota-traslado.component";
import { NotaTrasladoDetalleComponent } from "./requerimiento/notas-logistica/nota-traslado/nota-traslado-detalle/nota-traslado-detalle.component";
import { NotaHistorialComponent } from "./requerimiento/notas-logistica/nota-historial/nota-historial.component";

//Reporte de saldos y movimiento de la mercaderia en el almacén
import { AlmacenSaldoComponent } from "./Consultas/almacen-saldo/almacen-saldo.component";
import { DetalleSaldoComponent } from "./Consultas/almacen-saldo/detalle-saldo/detalle-saldo.component";
import { MsgVisorAlmacenSaldoComponent } from "./Consultas/almacen-saldo/detalle-saldo/msg-visor-almacen-saldo/msg-visor-almacen-saldo.component";
import { ComeArticuloPalletComponent } from "./Consultas/come-articulo-pallet/come-articulo-pallet.component";

import { CatalogoListComponent } from "./Cuentas/Matenimientos/catalogo-cliente/list/catalogo-list.component";
import { CatalogoAddComponent } from "./Cuentas/Matenimientos/catalogo-cliente/add/catalogo-add.component";
import { CatalogoEditComponent } from "./Cuentas/Matenimientos/catalogo-cliente/edit/catalogo-edit.component";

// KPI Bono Trimestral
import { KpibtResponsableComponent } from "./requerimiento/kpipersonal/Modals/kpibt-responsable/kpibt-responsable.component";
import { KpibtIncentivoComponent } from "./requerimiento/kpipersonal/Modals/kpibt-responsable/kpibt-incentivo/kpibt-incentivo/kpibt-incentivo.component";

// KPI Bono Resultado Modals
import { KpibrBonoRComponent } from "./requerimiento/kpipersonal/kpibonoresultado/Modals/kpibr-bonor/kpibr-bonor.component";
import { KpibrResponsableComponent } from "./requerimiento/kpipersonal/kpibonoresultado/Modals/kpibr-responsable/kpibr-responsable.component";

// Gestionp Planning
// import { GestionpComponent } from './Asistencia/gestionp/gestionp.component';
// import { GestionpDetailComponent } from './Asistencia/gestionp/Modals/gestionp-detail/gestionp-detail.component';
import { AplanningComponent } from "./Asistencia/aplanning/aplanning.component";
import { DetAplanningComponent } from "./Asistencia/aplanning/det-aplanning/det-aplanning.component";
import { AsistenciapPlanningComponent } from "./Asistencia/asistenciap/Modals/asistenciap-planning/asistenciap-planning.component";
import {
  AsistenciapSustentoComponent,
  BottomSheetPuntosAsistencia,
} from "./Asistencia/asistenciap/Modals/asistenciap-sustento/asistenciap-sustento.component";
import { GestionapPlanningComponent } from "./Asistencia/gestionap/Modals/gestionap-planning/gestionap-planning.component";
import { GestionapDetailComponent } from "./Asistencia/gestionap/Modals/gestionap-detail/gestionap-detail.component";
import { AsistenciapJustificacionComponent } from "./Asistencia/asistenciap/Modals/asistenciap-justificacion/asistenciap-justificacion.component";

//Reportes de Comercial
import { ComeReportesComponent } from "./reportes/come-reportes/come-reportes.component";
import { FacturacionComponent } from "./reportes/come-reportes/facturacion/facturacion.component";
import { GestionpComponent } from "./Asistencia/gestionp/gestionp.component";
import { GestionpDetailComponent } from "./Asistencia/gestionp/Modals/gestionp-detail/gestionp-detail.component";
import { GestionpDetail2Component } from "./Asistencia/gestionp/Modals/gestionp-detail2/gestionp-detail2.component";
import { GestionpRutaComponent } from './Asistencia/gestionp/Modals/gestionp-ruta/gestionp-ruta.component';

//Historico de Estado
import { HistoricoEstadoComponent } from "./Shared/HistoricoEstado/historico-estado.component"

//#endregion
const catalogo = [
  CatalogoListComponent,
  CatalogoAddComponent,
  CatalogoEditComponent,
];

const ordencompra = [
  SolicitudCotizacionComponent,
  DetalleCotizacionComponent,
  AddCotizacionComponent,
  ScFileComponent,
  ScVisorComponent,
];

const solicitudMovilidad = [
  SolicitudMovilidadComponent,
  AsignacionMovilidadPersonalComponent,
  DetalleSolicitudMovilidadComponent,
  DetalleAddPersonalComponent,
];

const efectivo = [
  EfectivoComponent,
  CrudefectivoComponent,
  EstadoefectivoComponent,
];

const cartatienda = [
  CartaTiendaComponent,
  TablaCartasComponent,
  NuevoFormatoCartaTiendaComponent,
  TablaFormatosComponent,
  NuevoCampoFormatoCartaTiendaComponent,
  TablaCamposComponent,
  TablaPersonalComponent,
  EditarPersonalComponent,
  AgregarPersonalComponent,
  DesplegableCampoEmpleadoComponent,
  NumeroCampoEmpleadoComponent,
  TextoCampoEmpleadoComponent,
  FechaCampoEmpleadoComponent,
  HoraCampoEmpleadoComponent,
  AgregarDataDesplegableComponent,
  PlantillaImprimirComponent,
  PrintLayoutComponent,
  DocumentoComponent,
];

const presupuesto = [
  PresupuestoComponent,
  DigcopiaComponent,
  DigpartidaComponent,
  DigcomentarioaprobacionComponent,
  CrearpresupuestoComponent,
  DetPartidaPreComponent,
  DetPartidaPersonalComponent,
  DetPartidaGenericaComponent,
  DigcontinuacionComponent,
  DigCambioEstadoComponent,
  DigFacturacionComponent,
];

const reembolso = [ReembolsoComponent, DialogReembolsoComponent];

const marca = [MarcaComponent, DialogCatalogoComponent];

const personal = [PersonalComponent, ListaPostulanteComponent, PortalModalComponent];

const tareostaff = [TareoListComponent, TareoAddComponent, TareoEditComponent]; // declarar los nuevo componentes

const almacenSaldo = [
  AlmacenSaldoComponent,
  DetalleSaldoComponent,
  MsgVisorAlmacenSaldoComponent,
];

const ComeArticuloPallet = [ComeArticuloPalletComponent];

const admincomercial = [
  ConsultapComponent,
  InformepComponent,
  AsistenciapComponent,
  AsistenciapPlanningComponent,
  AsistenciapSustentoComponent,
  AsistenciapJustificacionComponent,
  BottomSheetPuntosAsistencia,
  GestionapComponent,
  GestionpComponent,
  GestionpDetailComponent,
  GestionpDetail2Component,
  GestionpRutaComponent,
  GestionapPlanningComponent,
  GestionapDetailComponent,
  AplanningComponent,
  DetAplanningComponent,
  KpiincentivoComponent,
  KpiprovisComponent,
  KpibonotrimestralComponent,
  KpibonoresultadoComponent,
  HighlightPipe,
];

const sctr = [
  SctrComponent,
  ParametroSctrComponent,
  DialogSctrComponent,
  DialogconfirSctrComponent,
  DialogAprobacionesComponent,
  DialogPdfComponent,
  DetsctrComponent,
  DialogPdfVisorComponent
];

const fotocheck = [FotocheckComponent];

const notasLogistica = [
  NotasLogisticaComponent,
  NotaIngresoComponent,
  NotaRecojoComponent,
  NotaSalidaComponent,
  NotaUtilesComponent,
  NotaIngresoDetalleComponent,
  NotaRecojoDetalleComponent,
  NotaSalidaDetalleComponent,
  NotaUtilesDetalleComponent,
  NotaTrasladoComponent,
  NotaTrasladoDetalleComponent,
  NotaHistorialComponent,
];

const kpiBonoTrimestral = [KpibtResponsableComponent, KpibtIncentivoComponent];
const kpiBonoResultado = [KpibrBonoRComponent, KpibrResponsableComponent];

const reportesComercial = [ComeReportesComponent, FacturacionComponent];

const historicoEstado = [HistoricoEstadoComponent]

export const COMERCIAL_RUTAS_COMPONENTES = [
  presupuesto,
  ClientexMarcaComponent,
  fotocheck,
  sctr,
  marca,
  personal,
  tareostaff,
  admincomercial,
  reembolso,
  cartatienda,
  efectivo,
  solicitudMovilidad,
  ordencompra,
  notasLogistica,
  almacenSaldo,
  kpiBonoTrimestral,
  kpiBonoResultado,
  catalogo,
  ComeArticuloPallet,
  reportesComercial,
  historicoEstado
];

const routes: Routes = [
  {
    path: "comercial",
    component: ContainerInsideComponent,
    canActivate: [Oauth2Guard],
    children: [
      {
        path: "consultas",
        component: null,
        children: [
          {
            path: "consultapersonal",
            component: ConsultapComponent,
          },
          {
            path: "cartastienda",
            component: CartaTiendaComponent,
            children: [
              {
                path: "print",
                outlet: "print",
                component: PrintLayoutComponent,
                children: [
                  {
                    path: "documento/:documentoIds",
                    component: DocumentoComponent,
                  },
                ],
              },
            ],
          },

          {
            path: "cartastiendanuevo",
            component: NuevoFormatoCartaTiendaComponent,
          },
          {
            path: "cartastiendaimprimir",
            component: PlantillaImprimirComponent,
          },
          {
            path: "almacen-saldo",
            component: AlmacenSaldoComponent,
          },

          {
            path: "come-articulo-pallet",
            component: ComeArticuloPalletComponent,
          },
        ],
      },
      {
        path: "cuentas",
        component: null,
        children: [
          {
            path: "presupuesto",
            component: PresupuestoComponent,
          },
        ],
      },
      {
        path: "matenimiento",
        component: null,
        children: [
          {
            path: "catalogomarca",
            component: MarcaComponent,
          },
          {
            path: "cliente",
            component: ClientexMarcaComponent,
          },
          {
            path: "parametrosctr",
            component: ParametroSctrComponent,
          },
          {
            path: "catalago-list",
            component: CatalogoListComponent,
          },
          {
            path: "catalago-add",
            component: CatalogoAddComponent,
          },
          {
            path: "catalago-edit/:id",
            component: CatalogoEditComponent,
          },
        ],
      },
      {
        path: "requerimiento",
        component: null,
        children: [
          {
            path: "personal",
            component: PersonalComponent,
          },
          {
            path: "Fotocheck",
            component: FotocheckComponent,
          },
          {
            path: "sctr",
            component: SctrComponent,
          },
          {
            path: "notasLogistica",
            component: NotasLogisticaComponent,
          },
          {
            path: "informepersonal",
            component: InformepComponent,
          },
          {
            path: "reembolso",
            component: ReembolsoComponent,
          },
          {
            path: "efectivo",
            component: EfectivoComponent,
          },

          {
            path: "solicitud_movilidad",
            component: null,
            children: [
              {
                path: "ver",
                component: SolicitudMovilidadComponent,
              },
              {
                path: "asignacion",
                component: AsignacionMovilidadPersonalComponent,
              },
              {
                path: "detalle/:id",
                component: DetalleSolicitudMovilidadComponent,
              },
            ],
          },
          {
            path: "solicitud_cotizacion",
            component: null,
            children: [
              {
                path: "ver",
                component: SolicitudCotizacionComponent,
              },
              {
                path: "nuevo/:id",
                component: AddCotizacionComponent,
              },
              {
                path: "detalle/:id",
                component: DetalleCotizacionComponent,
              },
            ],
          },
          {
            path: "kpipersonal",
            component: null,
            children: [
              {
                path: "kpiincentivo",
                component: KpiincentivoComponent,
              },
              {
                path: "kpiprovis",
                component: KpiprovisComponent,
              },
              {
                path: "kpibonotrimestral",
                component: KpibonotrimestralComponent,
              },
              {
                path: "kpibonoresultado",
                component: KpibonoresultadoComponent,
              },
            ],
          },
        ],
      },
      {
        path: "asistencia",
        component: null,
        children: [
          {
            path: "asistenciapersonal",
            component: AsistenciapComponent,
          },
          {
            path: "gestionap",
            component: GestionapComponent,
          },
          {
            path: "gestionp",
            component: GestionpComponent,
          },
          {
            path: "tareo-list",
            component: TareoListComponent,
          },
          {
            path: "tareo-add",
            component: TareoAddComponent,
          },
          {
            path: "tareo-edit/:id/:idCargo/:idPersonal",
            component: TareoEditComponent,
          },
        ],
      },
      {
        path: "reportes",
        component: null,
        children: [
          {
            path: "come-reportes",
            component: ComeReportesComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [],
})
export class ComercialRutasModule { }
