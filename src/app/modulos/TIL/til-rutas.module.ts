import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ContainerInsideComponent } from "../../shared/components/container-inside/container-inside.component";
import { Oauth2Guard } from "./../../shared/guards/oauth2.guard";

//Tecnologia [Comunicaciones/Soporte] 
import { TiPerfilEquipoComponent } from "./tecnologia/ti-perfil-equipo/ti-perfil-equipo.component";
import { TiPerfilEquipoDetalleComponent } from "./tecnologia/ti-perfil-equipo/ti-perfil-equipo-detalle/ti-perfil-equipo-detalle.component";
import { TiPerfilEquipoPenalidadComponent } from "./tecnologia/ti-perfil-equipo/ti-perfil-equipo-detalle/ti-perfil-equipo-penalidad/ti-perfil-equipo-penalidad.component";
import { TiArticuloComponent } from "./tecnologia/ti-articulo/ti-articulo.component";
import { TiArticuloDetalleComponent } from './tecnologia/ti-articulo/ti-articulo-detalle/ti-articulo-detalle.component';

// Activos
import { TiIngresoInventarioComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario.component";
import { TiIngresoInventarioSimcardComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario-simcard/ti-ingreso-inventario-simcard.component";
import { TiIngresoInventarioMovilComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario-movil/ti-ingreso-inventario-movil.component";
import { TiIngresoInventarioLaptopDesktopComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario-laptop-desktop/ti-ingreso-inventario-laptop-desktop.component";
import { TiIngresoInventarioSimcardExcelComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario-simcard/ti-ingreso-inventario-simcard-excel/ti-ingreso-inventario-simcard-excel.component";
import { TiActivoAsignacionHistorialComponent } from "./tecnologia/ti-ingreso-inventario/ti-activo-asignacion-historial/ti-activo-asignacion-historial";
import { TiActivoLaptopDesktopExcelComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario-laptop-desktop/ti-activo-laptop-desktop-excel/ti-activo-laptop-desktop-excel.component";
import { TiActivoObservacionesAsignacionComponent } from "./tecnologia/ti-ingreso-inventario/ti-activo-asignacion-historial/ti-activo-observaciones-asignacion/ti-activo-observaciones-asignacion.component";
import { TiActivoResumenActivosComponent } from "./tecnologia/ti-ingreso-inventario/ti-activo-resumen-activos/ti-activo-resumen-activos.component";
import { TiActivoOtrosComponent } from "./tecnologia/ti-ingreso-inventario/ti-activo-otros/ti-activo-otros.component";
import { TiActivoRepotenciacionComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario-laptop-desktop/ti-activo-repotenciacion/ti-activo-repotenciacion.component";
import { TiActivoDescuentosPersonalComponent } from "./tecnologia/ti-ingreso-inventario/ti-activo-descuentos-personal/ti-activo-descuentos-personal.component";
import { TiActivoAsignacionExcelComponent } from "./tecnologia/ti-ingreso-inventario/ti-activo-asignacion-excel/ti-activo-asignacion-excel.component";

// Asignaciones
import { TiIngresoInventarioDetalleInventarioComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario-detalle-inventario/ti-ingreso-inventario-detalle-inventario.component";
import { TiAsignacionDialogCrearActivoComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario-detalle-inventario/ti-asignacion-dialog-crear-activo/ti-asignacion-dialog-crear-activo.component";
import { TiAsignacionDialogObservacionesComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario-detalle-inventario/ti-asignacion-dialog-observaciones/ti-asignacion-dialog-observaciones.component";
import { TiAsignacionDialogDescuentoComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario-detalle-inventario/ti-asignacion-dialog-descuento/ti-asignacion-dialog-descuento.component";
import { TiAsignacionAgregarParteComponent } from "./tecnologia/ti-ingreso-inventario/ti-ingreso-inventario-detalle-inventario/ti-asignacion-dialog-crear-activo/ti-asignacion-agregar-parte/ti-asignacion-agregar-parte.component";

//Tecnologia Activos de computo
import { TiAddendaComponent } from "./tecnologia/ti-addenda/ti-addenda.component";
import { TiDialogAddendaArchivoComponent } from "./tecnologia/ti-addenda/ti-addenda-detalle/ti-dialog-addenda-archivo/ti-dialog-addenda-archivo.component";
import { TiAddendaDetalleComponent } from "./tecnologia/ti-addenda/ti-addenda-detalle/ti-addenda-detalle.component";
import { TiAddendaDetalleActivosComponent } from "./tecnologia/ti-addenda/ti-addenda-detalle/ti-addenda-detalle-activos/ti-addenda-detalle-activos.component";
import { TiDialogActivoDetalleAddendaComponent } from "./tecnologia/ti-addenda/ti-addenda-detalle/ti-dialog-activo-detalle-addenda/ti-dialog-activo-detalle-addenda.component";
import { TiDialogArchivoAsignacionActivoComponent } from "./tecnologia/ti-rq-activo/ti-dialog-archivo-asignacion-activo/ti-dialog-archivo-asignacion-activo.component";

//Tecnologia parametros
import { TiSubFamiliaCaracteristicaComponent } from "./tecnologia/ti-parametros/ti-sub-familia-caracteristica/ti-sub-familia-caracteristica.component";
import { TiParametrosComponent } from "./tecnologia/ti-parametros/ti-parametros/ti-parametros.component";
import { TiDialogSubFamiliCaracteristicaComponent } from "./tecnologia/ti-parametros/ti-sub-familia-caracteristica/ti-dialog-sub-famili-caracteristica/ti-dialog-sub-famili-caracteristica.component";
import { TiCaracteristicaComponent } from "./tecnologia/ti-parametros/ti-sub-familia-caracteristica/ti-caracteristica/ti-caracteristica.component";
import { TiTipoDispositivoComponent } from "./tecnologia/ti-parametros/ti-sub-familia-caracteristica/ti-tipo-dispositivo/ti-tipo-dispositivo.component";
import { TiArticuloComponenteComponent } from './tecnologia/ti-articulo/ti-articulo-componente/ti-articulo-componente.component';
import { TiArticuloImagenComponent } from './tecnologia/ti-articulo/ti-articulo-imagen/ti-articulo-imagen.component';
import { TiArticuloPreciosComponent } from "./tecnologia/ti-articulo/ti-articulo-detalle/ti-articulo-precios/ti-articulo-precios.component";
import { TiRqActivoComponent } from "./tecnologia/ti-rq-activo/ti-rq-activo.component";
import { TiRqActivoDetalleComponent } from "./tecnologia/ti-rq-activo/ti-rq-activo-detalle/ti-rq-activo-detalle.component";
import { TiDialogRqRelacionActivoComponent } from "./tecnologia/ti-rq-activo/ti-dialog-rq-relacion-activo/ti-dialog-rq-relacion-activo.component";
import { TiDetalleActivoAsignaComponent } from "./tecnologia/ti-rq-activo/ti-detalle-activo-asigna/ti-detalle-activo-asigna.component";
import { TiRqAsignacionActivoComponent } from "./tecnologia/ti-rq-activo/ti-rq-asignacion-activo/ti-rq-asignacion-activo.component";
import { TiDialogRqAgregarActivoComponent } from "./tecnologia/ti-rq-activo/ti-dialog-rq-agregar-activo/ti-dialog-rq-agregar-activo.component";
import { TiDialogTipoDispositivoComponent } from "./tecnologia/ti-parametros/ti-sub-familia-caracteristica/ti-dialog-tipo-dispositivo/ti-dialog-tipo-dispositivo.component";
import { TiActivosAsignadosPersonalComponent } from "./tecnologia/ti-activos-asignados-personal/ti-activos-asignados-personal.component";
import { TiDialogActivosAsignadosPersonalComponent } from "./tecnologia/ti-activos-asignados-personal/ti-dialog-activos-asignados-personal/ti-dialog-activos-asignados-personal.component";
import { TiMatrizAddendaComponent } from "./tecnologia/ti-parametros/ti-matriz-addenda/ti-matriz-addenda.component";
import { TiDialogMatrizAddendaComponent } from "./tecnologia/ti-parametros/ti-matriz-addenda/ti-dialog-matriz-addenda/ti-dialog-matriz-addenda.component";
import { TiTicketComponent } from "./tecnologia/ti-ticket/ti-ticket.component";
import { TiTicketDetalleComponent } from "./tecnologia/ti-ticket/ti-ticket-detalle/ti-ticket-detalle.component";
import { TiTicketTiempoAtencionComponent } from "./tecnologia/ti-ticket/ti-ticket-detalle/ti-ticket-tiempo-atencion/ti-ticket-tiempo-atencion.component";
import { TiDialogActivosPersonalCargoComponent } from "./tecnologia/ti-activos-asignados-personal/ti-dialog-activos-personal-cargo/ti-dialog-activos-personal-cargo.component";
import { TiTicketReposicionComponent } from "./tecnologia/ti-ticket/ti-ticket-detalle/ti-ticket-reposicion/ti-ticket-reposicion.component";
import { TiDialogSolicitudTicketComponent } from "./tecnologia/ti-activos-asignados-personal/ti-dialog-solicitud-ticket/ti-dialog-solicitud-ticket.component";
import { TiRqActivoAsignaComponent } from "./tecnologia/ti-rq-activo-asigna/ti-rq-activo-asigna.component";
import { TiRqActivoAsignaDetalleComponent } from "./tecnologia/ti-rq-activo-asigna/ti-rq-activo-asigna-detalle/ti-rq-activo-asigna-detalle.component";
import { TiTipoTicketArticuloComponent } from "./tecnologia/ti-parametros/ti-tipo-ticket-articulo/ti-tipo-ticket-articulo.component";
import { TiDialogTipoTicketArticuloComponent } from "./tecnologia/ti-parametros/ti-tipo-ticket-articulo/ti-dialog-tipo-ticket-articulo/ti-dialog-tipo-ticket-articulo.component";
import { TiDialogTicketUsuarioComponent } from "./tecnologia/ti-activos-asignados-personal/ti-dialog-ticket-usuario/ti-dialog-ticket-usuario.component";
import { TiDialogDetalleRqHerramientaComponent } from "./tecnologia/ti-rq-activo-asigna/ti-rq-activo-asigna-detalle/ti-dialog-detalle-rq-herramienta/ti-dialog-detalle-rq-herramienta.component";
import { TiDialogHistorialEstadoRqHerramientaComponent } from "./tecnologia/ti-rq-activo-asigna/ti-rq-activo-asigna-detalle/ti-dialog-historial-estado-rq-herramienta/ti-dialog-historial-estado-rq-herramienta.component";
import { TiDialogDocumentoDescuentoRqAsignaComponent } from "./tecnologia/ti-rq-activo/ti-dialog-rq-agregar-activo/ti-dialog-documento-descuento-rq-asigna/ti-dialog-documento-descuento-rq-asigna.component";
import { TiDialogTicketSolicitudComponent } from "./tecnologia/ti-activos-asignados-personal/ti-dialog-activos-asignados-personal/ti-dialog-ticket-solicitud/ti-dialog-ticket-solicitud.component";
import { TiReposicionComponent } from "./tecnologia/ti-reposicion/ti-reposicion.component";


const perfilEquipo = [TiPerfilEquipoComponent, TiPerfilEquipoDetalleComponent, TiPerfilEquipoPenalidadComponent];
const articulo = [TiArticuloComponent, TiArticuloDetalleComponent, TiArticuloComponenteComponent, TiArticuloImagenComponent, TiArticuloPreciosComponent];
const ingresoInventario = [TiIngresoInventarioComponent, TiIngresoInventarioSimcardComponent, TiIngresoInventarioMovilComponent, TiIngresoInventarioLaptopDesktopComponent, TiIngresoInventarioSimcardExcelComponent, TiActivoAsignacionHistorialComponent, TiIngresoInventarioDetalleInventarioComponent, TiActivoLaptopDesktopExcelComponent, TiAsignacionDialogCrearActivoComponent, TiAsignacionDialogObservacionesComponent, TiActivoObservacionesAsignacionComponent, TiActivoResumenActivosComponent, TiActivoOtrosComponent, TiAsignacionDialogDescuentoComponent, TiActivoRepotenciacionComponent, TiActivoDescuentosPersonalComponent, TiActivoAsignacionExcelComponent, TiAsignacionAgregarParteComponent]

export const TIL_RUTAS_COMPOMENTES = [
  perfilEquipo,
  articulo,
  ingresoInventario,
  TiSubFamiliaCaracteristicaComponent,
  TiParametrosComponent,
  TiDialogSubFamiliCaracteristicaComponent,
  TiCaracteristicaComponent,
  TiTipoDispositivoComponent,
  TiDialogTipoDispositivoComponent,
  TiAddendaComponent,
  TiRqActivoComponent,
  TiAddendaDetalleComponent,
  TiRqActivoDetalleComponent,
  TiDialogRqRelacionActivoComponent,
  TiAddendaDetalleActivosComponent,
  TiDialogAddendaArchivoComponent,
  TiDetalleActivoAsignaComponent,
  TiRqAsignacionActivoComponent,
  TiDialogActivoDetalleAddendaComponent,
  TiDialogDocumentoDescuentoRqAsignaComponent,
  TiActivosAsignadosPersonalComponent,
  TiDialogActivosAsignadosPersonalComponent,
  TiDialogRqAgregarActivoComponent,
  TiDialogArchivoAsignacionActivoComponent,
  TiMatrizAddendaComponent,
  TiDialogMatrizAddendaComponent,
  TiTicketComponent,
  TiTicketDetalleComponent,
  TiTicketTiempoAtencionComponent,
  TiTicketReposicionComponent,
  TiDialogActivosPersonalCargoComponent,
  TiDialogSolicitudTicketComponent,
  TiDialogTicketUsuarioComponent,
  TiRqActivoAsignaComponent,
  TiTipoTicketArticuloComponent,
  TiRqActivoAsignaDetalleComponent,
  TiDialogTipoTicketArticuloComponent,
  TiDialogDetalleRqHerramientaComponent,
  TiDialogHistorialEstadoRqHerramientaComponent,
  TiDialogTicketSolicitudComponent,
  TiReposicionComponent,
];

const routes: Routes = [
  {
    path: "til",
    component: ContainerInsideComponent,
    canActivate: [Oauth2Guard],
    children: [
      {
        path: "tecnologia",
        component: null,
        children: [
          {
            path: "ti-perfil-equipo",
            component: TiPerfilEquipoComponent,
          },
          {
            path: "ti-articulo",
            component: TiArticuloComponent
          },
          {
            path: "ti-reposicion",
            component: TiReposicionComponent
          },
          {
            path: "ti-articulo-detalle",
            component: TiArticuloDetalleComponent,
          },
          {
            path: "ti-articulo-detalle/:id",
            component: TiArticuloDetalleComponent,
          },
          {
            path: "ti-Addenda",
            component: TiAddendaComponent,
          },
          {
            path: "ti-Ticket",
            component: TiTicketComponent,
          },
          {
            path: "ti-Ticket/detalle",
            component: TiTicketDetalleComponent,
          },
          {
            path: "ti-Ticket/detalle/:idTicket",
            component: TiTicketDetalleComponent,
          },
          {
            path: "ti-RqActivo",
            component: TiRqActivoComponent,
          },
          {
            path: "ti-RqActivo-Asigna",
            component: TiRqActivoAsignaComponent,
          },
          {
            path: "ti-RqActivo-Asigna/requerimiento",
            component: TiRqActivoAsignaDetalleComponent,
          },
          {
            path: "ti-RqActivo-Asigna/requerimiento/:idRequerimiento",
            component: TiRqActivoAsignaDetalleComponent,
          },
          {
            path: "ti-RqActivo-detalle",
            component: TiRqActivoDetalleComponent,
          },
          {
            path: "ti-RqActivo-detalle/:id",
            component: TiRqActivoDetalleComponent,
          },
          {
            path: "ti-ingreso-inventario",
            component: TiIngresoInventarioComponent,
          },
          {
            path: "ti-activos-asignados-personal",
            component: TiActivosAsignadosPersonalComponent,
          },
          {
            path: "ti-ingreso-inventario/activo/:idTipoActivo",
            component: null,
            children: [
              {
                path: "simcard",
                component: TiIngresoInventarioSimcardComponent,
              },
              {
                path: "simcard/:idActivo",
                component: TiIngresoInventarioSimcardComponent,
              },
              {
                path: "movil",
                component: TiIngresoInventarioMovilComponent,
              },
              {
                path: "movil/:idActivo",
                component: TiIngresoInventarioMovilComponent,
              },
              {
                path: "laptop",
                component: TiIngresoInventarioLaptopDesktopComponent,
              },
              {
                path: "laptop/:idActivo",
                component: TiIngresoInventarioLaptopDesktopComponent,
              },
              {
                path: "desktop",
                component: TiIngresoInventarioLaptopDesktopComponent,
              },
              {
                path: "desktop/:idActivo",
                component: TiIngresoInventarioLaptopDesktopComponent,
              },
            ]
          },
          {
            path: "ti-ingreso-inventario/asignacion",
            component: null,
            children: [
              {
                path: "directa",
                component: TiIngresoInventarioDetalleInventarioComponent,
              },
              {
                path: "directa/:idPersonal",
                component: TiIngresoInventarioDetalleInventarioComponent,
              }
            ]
          },
          {
            path: "ti-parametros",
            component: null,
            children: [
              {
                path: "ti-parametro",
                component: TiParametrosComponent,
              },
              {
                path: "ti-SubFamilia-caracteristica",
                component: TiSubFamiliaCaracteristicaComponent,
              },
              {
                path: "ti-matriz-addenda",
                component: TiMatrizAddendaComponent,
              },
              {
                path: "ti-tipoTicket-articulo",
                component: TiTipoTicketArticuloComponent,
              }
            ]
          },
          {
            path: "ti-reposicion",
            component: TiReposicionComponent,
          }
        ]
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [],
})
export class TILRutasModule { }
