import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { Oauth2Guard } from "./../../shared/guards/oauth2.guard";
import { ContainerInsideComponent } from "../../shared/components/container-inside/container-inside.component";

// Datos Basicos
import { PartidaComponent } from "./../control-costos/datobasico/partida/partida.component";
import { PartidaArticuloComponent } from "./../control-costos/datobasico/partidaArticulo/partidaArticulo.component";
import { TarifarioComponent } from "./../control-costos/datobasico/tarifario/tarifario.component";
import { CargoAprobacionComponent } from "./../control-costos/datobasico/cargo-aprobacion/cargo-aprobacion.component";
import { SucursalesComponent } from './../control-costos/datobasico/surcusales/sucursales.component'
import { SucursalesPaisComponent } from "./datobasico/surcusales/sucursales-pais/sucursales-pais.component";
import { SucursalesEmpresaComponent } from "./datobasico/surcusales/sucursales-empresa/sucursales-empresa.component";
import { UsuarioPresupuestoComponent } from "./datobasico/usuario-presupuesto/usuario-presupuesto.component";
import { MatrizCargoComponent } from "./datobasico/matriz-cargo/matriz-cargo.component";
import { CargoPartidaComponent } from "./datobasico/matriz-cargo/cargo-partida/cargo-partida.component";
import { PlanillaPartidaComponent } from "./datobasico/matriz-cargo/planilla-partida/planilla-partida.component";
import { PlanillaPartidaDetalleComponent } from "./datobasico/matriz-cargo/planilla-partida-detalle/planilla-partida-detalle.component";
import { ParametroConcarComponent } from "./datobasico/parametro-concar/parametro-concar.component";

import { ParametrosComponent } from './datobasico/parametros/parametros.component';
import { ParametroMovilComponent } from './datobasico/parametro-movil/parametro-movil.component';
import { GrupoPartidasComponent } from './datobasico/grupoPartidas/grupoPartidas.component';
import { GrupoPartidaComponent } from './datobasico/grupoPartidas/grupo-partida/grupo-partida.component';
import { TopesPorPersonaComponent } from './datobasico/parametro-movil/components/topes-por-persona/topes-por-persona.component';
import { TopesPorMovilidadComponent } from './datobasico/parametro-movil/components/topes-por-movilidad/topes-por-movilidad.component';
import { TopesPorCargoComponent } from './datobasico/parametro-movil/components/topes-por-cargo/topes-por-cargo.component';
import { TableCargosComponent } from './datobasico/parametro-movil/components/table-cargos/table-cargos.component';
import { DialogTopePersonaComponent } from './datobasico/parametro-movil/components/dialog-tope-persona/dialog-tope-persona.component';
import { DialogTopePersonaAddComponent } from './datobasico/parametro-movil/components/dialog-tope-persona/dialog-tope-persona-add/dialog-tope-persona-add.component';
import { DialogTopeCargoComponent } from './datobasico/parametro-movil/components/dialog-tope-cargo/dialog-tope-cargo.component';
import { DialogTopeCargoEditComponent } from './datobasico/parametro-movil/components/dialog-tope-cargo/dialog-tope-cargo-edit/dialog-tope-cargo-edit.component';
import { CuentasCargoComponent } from './datobasico/parametro-movil/components/cuentas-cargo/cuentas-cargo.component';
import { DialogCuentaCargoClienteComponent } from './datobasico/parametro-movil/components/cuentas-cargo/dialog-cuenta-cargo-cliente/dialog-cuenta-cargo-cliente.component';
import { TablePartidaComponent } from './datobasico/grupoPartidas/components/table-partida/table-partida.component';
import { DialogComponent } from './datobasico/grupoPartidas/dialog.component';
import { FormularioPartidaComponent } from './datobasico/grupoPartidas/components/formulario-partida/formulario-partida.component';
import { PptoPartidaDispositivoComponent } from "./datobasico/ppto-partida-dispositivo/ppto-partida-dispositivo.component";
import { PptoDialogPartidaDispositivoComponent } from "./datobasico/ppto-partida-dispositivo/ppto-dialog-partida-dispositivo/ppto-dialog-partida-dispositivo.component";

// Presupuestos
import { RegistroFacturaComponent } from "./../control-costos/presupuestos/registroFactura/registroFactura.component";
import { RegistroFacturaCrearComponent } from "./../control-costos/presupuestos/registroFactura/registroFacturaCrear/registroFacturaCrear.component";
import { ReporteGastoComponent } from "./presupuestos/registroFactura/registroFacturaCrear/reporte-gasto/reporte-gasto.component";
import { DialogFacturaHistorialEstadosComponent } from "./presupuestos/registroFactura/registroFacturaCrear/dialog-factura-historial-estados/dialog-factura-historial-estados.component";
import { FacturaFileComponent } from "./../control-costos/presupuestos/registroFactura/factura-file/factura-file.component";
//import { ResguardoComponent } from './../control-costos/presupuestos/resguardo/resguardo.component';
//import { ResguardoCrearComponent } from './../control-costos/presupuestos/resguardo/resguardo-crear/resguardo-crear.component';
import { CierreMasivoComponent } from './../control-costos/presupuestos/cierre-masivo/cierre-masivo.component';
import { TipoServicioComponent } from './../control-costos/presupuestos/mantenimientos/tipo-servicio/tipo-servicio.component';
import { OficinaOrdenanteComponent } from './../control-costos/presupuestos/mantenimientos/oficina-ordenante/oficina-ordenante.component';
import { CategoriaCargoComponent } from './../control-costos/presupuestos/mantenimientos/categoria-cargo/categoria-cargo.component';
import { CanalesComponent } from './../control-costos/presupuestos/mantenimientos/canales/canales.component';
import { SubCanalesComponent } from "./presupuestos/mantenimientos/canales/sub-canales/sub-canales.component";
import { TrasladoDocumentoComponent } from './../control-costos/presupuestos/traslado-documento/traslado-documento.component';
import { AprobacionComponent } from "./presupuestos/aprobacion/aprobacion.component";
import { VisorAsistenciaComponent } from "./presupuestos/visor-asistencia/visor-asistencia.component";
import { VisorAsistenciaPersonalComponent } from "./presupuestos/visor-asistencia/visor-asistencia-personal/visor-asistencia-personal.component";
import { ParametroComponent } from "./datobasico/parametros/parametro/parametro.component";
import { ResguardoComponent } from "./datobasico/parametros/resguardo/resguardo.component";
import { ResguardoCrearComponent } from "./datobasico/parametros/resguardo/resguardo-crear/resguardo-crear.component";
import { InformeRqComponent } from "./presupuestos/informe-rq/informe-rq.component";
import { DialogHistorialDocumentosComponent } from './presupuestos/aprobacion/components/dialog-historial-documentos/dialog-historial-documentos.component';
import { DialogInformeGastoComponent } from './presupuestos/registroFactura/dialog-informe-gasto/dialog-informe-gasto.component';

// Centro de Costos
import { CentroCostosComponent } from './../control-costos/centroCosto/centroCostos/centroCostos.component';
import { CentroCostoCrearComponent } from './centroCosto/centroCostos/centroCostoCrear/centroCostoCrear.component';
import { AsignaComponent } from './../control-costos/centroCosto/asigna/asigna.component';
import { AsignaCrearComponent } from './../control-costos/centroCosto/asigna/asigna-crear/asigna-crear.component';
import { AsigaVisorComponent } from './../control-costos/centroCosto/asigna/asiga-visor/asiga-visor.component'
import { DireccionComponent } from './../control-costos/centroCosto/organizacion/direccion/direccion.component';
import { AreaComponent } from './../control-costos/centroCosto/organizacion/area/area.component';
import { OrganizacionComponent } from './../control-costos/centroCosto/organizacion/organizacion.component';
import { CierreMesComponent } from "./centroCosto/cierre-mes/cierre-mes.component";
import { ControlCostoReporteComponent } from './centroCosto/reporte/control-costo-reporte/control-costo-reporte.component';
import { PptoReporteDashboardComponent } from './centroCosto/reporte/ppto-reporte-dashboard/ppto-reporte-dashboard.component';
// Compras
import { ProveedorComponent } from './../control-costos/compra/proveedor/proveedor.component';
import { ProveedorCrearComponent } from './compra/proveedor/proveedorCrear/proveedorCrear.component';
import { ProveedorDirecComponent } from './compra/proveedor/proveedorCrear/proveedorDirec/proveedorDirec.component';
import { ProveedorBancoComponent } from './compra/proveedor/proveedorCrear/proveedorBanco/proveedorBanco.component';
import { CrearArticuloComponent } from './../control-costos/compra/articulo/crear-articulo/crear-articulo.component';
import { ListaArticuloComponent } from './../control-costos/compra/articulo/lista-articulo/lista-articulo.component';
import { VisorImagenComponent } from "./compra/articulo/visor-imagen/visor-imagen.component";
import { GiroNegocioComponent } from './../control-costos/compra/datosBasicos/giro-negocio/giro-negocio.component';
import { OrdenCompraComponent } from './../control-costos/compra/orden-compra/orden-compra.component';
import { OrdenCompraCrearComponent } from './../control-costos/compra/orden-compra/orden-compra-crear/orden-compra-crear.component';
import { DialogOrdenCompraHistorialEstadosComponent } from "./compra/orden-compra/orden-compra-crear/dialog-orden-compra-historial-estados/dialog-orden-compra-historial-estados.component";
import { OrdenCompraFileComponent } from './../control-costos/compra/orden-compra/orden-compra-file/orden-compra-file.component';
import { OrdenCompraVisorComponent } from "./compra/orden-compra/orden-compra-visor/orden-compra-visor.component";
import { OcGeneradosComponent } from "./compra/compra-reporte/oc-generados/oc-generados.component";
import { OcDevolverComponent } from "./compra/oc-devolver/oc-devolver.component";
import { OcReporteComponent } from "./compra/orden-compra/orden-compra-crear/oc-reporte/oc-reporte.component";
import { OcDevolverDetalleComponent } from "./compra/oc-devolver/oc-devolver-detalle/oc-devolver-detalle.component";
import { OcDevolverFileComponent } from "./compra/oc-devolver/oc-devolver-file/oc-devolver-file.component";
import { OcDevolverVisorComponent } from "./compra/oc-devolver/oc-devolver-file/oc-devolver-visor/oc-devolver-visor.component";
import { ComOcDetalladoComponent } from "./compra/compra-reporte/com-oc-detallado/com-oc-detallado.component";
// Compras Dialog General
import { ComprasDialogComponent } from "./compra/compras-dialog/compras-dialog.component";


// Compras Sc
import { OrdenScAddComponent } from './compra/orden-compra-sc/add/orden-sc-add.component';
import { OrdenScEditComponent } from "./compra/orden-compra-sc/edit/orden-sc-edit.component";
import { OrdenScAudAddComponent } from "./compra/orden-compra-sc/add/orden-sc-aud-add.component";
import { OrdenCompraScComponent } from "./compra/orden-compra-sc/list/orden-compra-sc.component";
import { OcScReporteComponent } from "./compra/orden-compra-sc/sc-reporte-print/oc-sc-reporte.component";


// Liquidaciones
import { ControlAvalComponent } from './../control-costos/liquidaciones/control-aval/control-aval.component';
import { ControlVisorComponent } from './../control-costos/liquidaciones/control-aval/control-visor/control-visor.component';
import { PendienteLiquidarComponent } from './../control-costos/liquidaciones/control-aval/pendiente-liquidar/pendiente-liquidar.component'
import { LiquidacionEfectivoComponent } from './../control-costos/liquidaciones/liquidacionEfectivo/liquidacionEfectivo.component';
import { SolicitudEfectivoComponent } from './../control-costos/liquidaciones/liquidacionEfectivo/solicitud-efectivo/solicitud-efectivo.component';
import { LiquidacionComponent } from './../control-costos/liquidaciones/liquidacionEfectivo/liquidacion/liquidacion.component';
import { ReporteOCComponent } from "./liquidaciones/liquidacionEfectivo/liquidacion/reporte/reporte-oc/reporte-oc.component";
import { ReporteRqComponent } from "./liquidaciones/liquidacionEfectivo/liquidacion/reporte/reporte-rq/reporte-rq.component";
import { ReporteRrComponent } from "./liquidaciones/liquidacionEfectivo/liquidacion/reporte/reporte-rr/reporte-rr.component";
import { ReporteSmComponent } from "./liquidaciones/liquidacionEfectivo/liquidacion/reporte/reporte-sm/reporte-sm.component";
import { AutoliquidacionComponent } from "./liquidaciones/autoliquidacion/autoliquidacion.component";
import { AddAutoliquidacionComponent } from "./liquidaciones/autoliquidacion/add-autoliquidacion/add-autoliquidacion.component";
import { ReporteAsientoComponent } from "./liquidaciones/liquidacion-reporte/reporte-asiento/reporte-asiento.component";
import { DialogSubirArchivoControlAvalComponent } from "./liquidaciones/control-aval/control-visor/dialog-subir-archivo-control-aval/dialog-subir-archivo-control-aval.component";


//Canjes
import { BoletasComponent } from './../control-costos/canjes/boletas/boletas.component';
import { DialogListaArticuloComponent } from "./compra/articulo/dialog-lista-articulo/dialog-lista-articulo.component";
import { OrdenScAudEditComponent } from "./compra/orden-compra-sc/edit/orden-sc-aud-edit.component";
import { OrdenCompraScFileComponent } from "./compra/orden-compra-sc/orden-compra-sc-file/orden-compra-sc-file.component";
import { OrdenCompraScVisorComponent } from './compra/orden-compra-sc/orden-compra-sc-visor/orden-compra-sc-visor.component';

import { CompraReportePrecioComponent } from './compra/compra-reporte-precio/compra-reporte-precio.component';
import { OrdenCompraScReportComponent } from './compra/compra-reporte/prov-cta-corriente/report-orden-compra-sc.component';

//Reportes Presupuesto
import { ReportesComponent } from "./presupuestos/pptos-reportes/pptos-reportes.component";
import { PresupuestoPartidasSaldo } from "./presupuestos/pptos-reportes/pptos-partidas-saldos/pptos-partidas-saldos.component";
import { PresupuestoEstadoComponent } from "./presupuestos/pptos-reportes/pptos-estados/pptos-estados.component";
import { ReportePresupuestoEstadoComponent } from "./presupuestos/pptos-reportes/pptos-estados/reporte-dialog/reporte-ppto-estado.component";
import { ReporteInformeStaff } from "./presupuestos/pptos-reportes/pptos-informe-staff/pptos-informe-staff.component";
import { ReportePresupuestoComponent } from "./presupuestos/pptos-reportes/pptos-partidas-saldos/reporte-dialog/reporte-presupuesto.component";
import { ReporteStaffComponent } from "./presupuestos/pptos-reportes/pptos-informe-staff/reporte-dialog/reporte-staff.component";

//Reportes Reentabilidad Presupuesto
import { RentabilidadReportesComponent } from "./presupuestos/rentabilidad-reportes/rentabilidad-reportes.component";
import { RentabilidadComponent } from "./presupuestos/rentabilidad-reportes/rentabilidad/rentabilidad.component";
import { RentabilidadNivelesComponent } from "./presupuestos/rentabilidad-reportes/rentabilidad-niveles/rentabilidad-niveles.component";
import { PptoProrrateoComponent } from "./presupuestos/rentabilidad-reportes/ppto-prorrateo/ppto-prorrateo.component";
import { RentabilidadDetalleComponent } from "./presupuestos/rentabilidad-reportes/rentabilidad-niveles/rentabilidad-detalle/rentabilidad-detalle.component";

import { ReportepruebaComponent } from "./liquidaciones/liquidacion-reporte/reporteprueba/reporteprueba.component";
import { PptoReporteContratoComponent } from "./ppto-reporte-contrato/ppto-reporte-contrato.component";



export const CONTROL_COSTOS_RUTAS_COMPONENTES = [

  // Datos Basicos
  PartidaComponent,
  PartidaArticuloComponent,
  TarifarioComponent,
  CargoAprobacionComponent,
  SucursalesComponent,
  SucursalesPaisComponent,
  SucursalesEmpresaComponent,
  UsuarioPresupuestoComponent,
  MatrizCargoComponent,
  CargoPartidaComponent,
  PlanillaPartidaComponent,
  PlanillaPartidaDetalleComponent,
  ParametroConcarComponent,
  PptoPartidaDispositivoComponent,
  PptoDialogPartidaDispositivoComponent,
  
  //parametros
  ParametrosComponent,
  ParametroComponent,
  ResguardoComponent,
  ResguardoCrearComponent,
  ParametroMovilComponent,
  GrupoPartidasComponent,
  GrupoPartidaComponent,
  TopesPorPersonaComponent,
  TopesPorMovilidadComponent,
  TopesPorCargoComponent,
  TableCargosComponent,
  DialogTopePersonaComponent,
  DialogTopePersonaAddComponent,
  DialogTopeCargoComponent,
  DialogTopeCargoEditComponent,
  CuentasCargoComponent,
  DialogCuentaCargoClienteComponent,
  TablePartidaComponent,
  DialogComponent,
  FormularioPartidaComponent,
  TablePartidaComponent,

  // Presupuestos
  RegistroFacturaComponent,
  RegistroFacturaCrearComponent,
  ReporteGastoComponent,
  DialogFacturaHistorialEstadosComponent,
  FacturaFileComponent,
  ReportesComponent,
  PresupuestoPartidasSaldo,
  PresupuestoEstadoComponent,
  ReportePresupuestoEstadoComponent,
  ReporteInformeStaff,
  ReportePresupuestoComponent,
  ReporteStaffComponent,
  //ResguardoComponent,
  //ResguardoCrearComponent,
  CierreMasivoComponent,
  TipoServicioComponent,
  OficinaOrdenanteComponent,
  CategoriaCargoComponent,
  CanalesComponent,
  SubCanalesComponent,
  TrasladoDocumentoComponent,
  AprobacionComponent,
  VisorAsistenciaComponent,
  VisorAsistenciaPersonalComponent,
  InformeRqComponent,
  DialogHistorialDocumentosComponent,
  DialogInformeGastoComponent,
  RentabilidadReportesComponent,
  RentabilidadComponent,
  RentabilidadNivelesComponent,
  PptoProrrateoComponent,
  RentabilidadDetalleComponent,

  // Centro de Costos
  CentroCostosComponent,
  CentroCostoCrearComponent,
  AsignaComponent,
  AsignaCrearComponent,
  AsigaVisorComponent,
  DireccionComponent,
  AreaComponent,
  OrganizacionComponent,
  CierreMesComponent,
  ControlCostoReporteComponent,
  PptoReporteDashboardComponent,

  //Compras
  ProveedorComponent,
  ProveedorCrearComponent,
  ProveedorDirecComponent,
  ProveedorBancoComponent,
  CrearArticuloComponent,
  ListaArticuloComponent,
  DialogListaArticuloComponent,
  VisorImagenComponent,
  GiroNegocioComponent,
  OrdenCompraComponent,
  OrdenCompraCrearComponent,
  DialogOrdenCompraHistorialEstadosComponent,
  OrdenCompraFileComponent,
  OrdenCompraVisorComponent,
  OcGeneradosComponent,
  OcDevolverComponent,
  OcReporteComponent,
  OcDevolverFileComponent,
  OcDevolverVisorComponent,
  OcDevolverDetalleComponent,
  OrdenCompraScComponent,
  OrdenScAddComponent,
  OrdenScEditComponent,
  OcScReporteComponent,
  OrdenScAudAddComponent,
  OrdenScAudEditComponent,
  OrdenCompraScFileComponent,
  OrdenCompraScVisorComponent,
  OrdenCompraScReportComponent,
  CompraReportePrecioComponent,
  ComOcDetalladoComponent,

  // Liquidaciones
  LiquidacionEfectivoComponent,
  ReporteOCComponent,
  ReporteRqComponent,
  ReporteRrComponent,
  ReporteSmComponent,
  ControlAvalComponent,
  ControlVisorComponent,
  SolicitudEfectivoComponent,
  LiquidacionComponent,
  PendienteLiquidarComponent,
  AutoliquidacionComponent,
  AddAutoliquidacionComponent,
  ReporteAsientoComponent,
  DialogSubirArchivoControlAvalComponent,
  //Canjes
  BoletasComponent,

  // Compras Dialog General
  ComprasDialogComponent,

  ReportepruebaComponent,

  PptoReporteContratoComponent
];

const routes: Routes = [
  {
    path: "controlcostos",
    component: ContainerInsideComponent,
    canActivate: [Oauth2Guard],
    children: [
      {
        path: "datobasico",
        component: null,
        children: [
          {
            path: "partida",
            component: PartidaComponent,
          },
          {
            path: "partidaArticulo",
            component: PartidaArticuloComponent,
          },
          {
            path: "tarifario",
            component: TarifarioComponent,
          },
          {
            path: "cargo-aprobacion",
            component: CargoAprobacionComponent,
          },
          {
            path: "parametros",
            component: ParametrosComponent,
          },
          {
            path: "parametro-movil",
            component: ParametroMovilComponent,
          },
          {
            path: "grupoPartidas",
            component: GrupoPartidasComponent,
          },
          {
            path: "grupoPartidas/:id",
            component: GrupoPartidaComponent,
          },
          {
            path: "sucursales",
            component: SucursalesComponent,
          },
          {
            path: "usuario-presupuesto",
            component: UsuarioPresupuestoComponent,
          },

          {
            path: "matriz-cargo",
            component: MatrizCargoComponent,
          },
          {
            path: "parametro-concar",
            component: ParametroConcarComponent,
          },
          {
            path: "partida-dispositivo",
            component: PptoPartidaDispositivoComponent,
          },
        ]
      },

      {
        path: "presupuestos",
        component: null,
        children: [
          {
            path: "registroFactura",
            component: RegistroFacturaComponent,
          },
          /* {
             path: "resguardo",
             component: ResguardoComponent,
           }, */
          {
            path: "cierre-masivo",
            component: CierreMasivoComponent,
          },
          {
            path: "traslado-documento",
            component: TrasladoDocumentoComponent,
          },
          {
            path: "aprobacion",
            component: AprobacionComponent,
          },
          {
            path: "visor-asistencia",
            component: VisorAsistenciaComponent,
          },
          {
            path: "informe-rq",
            component: InformeRqComponent,
          },
          {
            path: "mantenimientos",
            component: null,
            children: [
              {
                path: "tipo-servicio",
                component: TipoServicioComponent,
              },
              {
                path: "oficina-ordenante",
                component: OficinaOrdenanteComponent,
              },
              {
                path: "categoria-cargo",
                component: CategoriaCargoComponent,
              },
              {
                path: "Canales",
                component: CanalesComponent,
              },
            ]
          },
          {
            path: "reportes",
            component: null,
            children: [
              {
                path: "ppto_reportes",
                component: ReportesComponent
              },
              {
                path: "rentabilidad-reportes",
                component: RentabilidadReportesComponent
              }
            ]
          },
        ]
      },

      {
        path: "centroCosto",
        component: null,
        children: [
          {
            path: "centroCostos",
            component: CentroCostosComponent,
          },
          {
            path: "asigna",
            component: AsignaComponent,
          },
          {
            path: "asigna/:id",
            component: AsignaComponent,
          },
          {
            path: "organizacion",
            component: OrganizacionComponent,
          },
          {
            path: "cierre-mes",
            component: CierreMesComponent,
          },
          {
            path: "mcf_reportes/cf_reportes",
            component: PptoReporteDashboardComponent
          }
        ]
      },
      {
        path: "compra",
        component: null,
        children: [
          {
            path: "proveedor",
            component: ProveedorComponent,
          },
          {
            path: "proveedor/:id",
            component: ProveedorCrearComponent,
          },
          {
            path: "lista-articulo",
            component: ListaArticuloComponent,
          },
          {
            path: "CrearArticulo/:id",
            component: CrearArticuloComponent,
          },
          {
            path: "orden-compra",
            component: OrdenCompraComponent,
          },
          {
            path: "CrearOC/:id",
            component: OrdenCompraCrearComponent,
          },
          {
            path: "oc-devolver",
            component: OcDevolverComponent,
          },

          {
            path: "orden-compra-sc",
            component: OrdenCompraScComponent
          },

          {
            path: "orden-sc-add",
            component: OrdenScAddComponent
          },

          {
            path: "orden-sc-edit/:id",
            component: OrdenScEditComponent
          },
          {
            path: "orden-sc-aud-add",
            component: OrdenScAudAddComponent
          },
          {
            path: "orden-sc-aud-edit/:id",
            component: OrdenScAudEditComponent
          },
          {
            path: "orden-sc-print/:id",
            component: OcScReporteComponent
          },
          {
            path: "orden-sc-print/:id",
            component: OcScReporteComponent
          },

          {
            path: "orden-sc-print/:id",
            component: OcScReporteComponent
          },

          {
            path: "datosBasicos",
            component: null,
            children: [
              {
                path: "giro-negocio",
                component: GiroNegocioComponent,
              },
            ]
          },
          {
            path: "compra-reportes",
            component: null,
            children: [
              {
                path: "comp-reporte-ctacteprov",
                component: OrdenCompraScReportComponent
              },
              {
                path: "reporte-compras-precio",
                component: CompraReportePrecioComponent
              },
              {
                path: "orden-compra-generados",
                component: OcGeneradosComponent,
              },
              {
                path: "reporte-oc-detallado",
                component: ComOcDetalladoComponent,
              },

            ]
          },

        ]
      },
      {
        path: "liquidaciones",
        component: null,
        children: [
          {
            path: "control-aval",
            component: ControlAvalComponent,
          },
          {
            path: "liquidacionEfectivo",
            component: LiquidacionEfectivoComponent,
          },
          {
            path: "autoliquidacion",
            component: AutoliquidacionComponent
          },

          {
            path: "liquidacion-reporte",
            component: null,
            children: [
              {
                path: "ReporteAsiento",
                component: ReporteAsientoComponent
              },
              {
                path: "liq-dashboard",
                component: ReportepruebaComponent
              }, 
            ]
          }
        ]
      },

      {
        path: "canjes",
        component: null,
        children: [
          {
            path: "boletas",
            component: BoletasComponent,
          },
        ]
      },
      {
        path:"ppto-reporte-contrato",
        component: PptoReporteContratoComponent
      }

    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [],
})
export class ControlCostosRutasModule { }
