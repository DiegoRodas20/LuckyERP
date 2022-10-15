import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { Oauth2Guard } from "./../../shared/guards/oauth2.guard";
import { ContainerInsideComponent } from "../../shared/components/container-inside/container-inside.component";

//Almacenes
import { ArticuloComponent } from "./almacenes/articulo/articulo.component";
import { AlmacenComponent } from "./almacenes/almacen/almacen.component";
import { AlmacenUbicacionesComponent } from "./almacenes/almacen/almacen-ubicaciones/almacen-ubicaciones.component";
import { DestinosComponent } from "./almacenes/destinos/destinos.component";
import { RegistroIngresoComponent } from "./almacenes/registro-ingreso/registro-ingreso.component";
import { RegistroIngresoDetalleComponent } from "./almacenes/registro-ingreso/registro-ingreso-detalle/registro-ingreso-detalle.component";
import { ArticuloModalNotaComponent } from "./almacenes/registro-ingreso/registro-ingreso-detalle/articulo-modal-nota/articulo-modal-nota.component";
import { NotaIngresoRIComponent } from "./almacenes/registro-ingreso/nota-ingreso-ri/nota-ingreso-ri.component";
import { RegistroSalidaComponent } from "./almacenes/registro-salida/registro-salida.component";
import { RegistroSalidaDetalleComponent } from "./almacenes/registro-salida/registro-salida-detalle/registro-salida-detalle.component";
import { GuiaSalidaFormatoComponent } from "./almacenes/registro-salida/registro-salida-detalle/guia-salida-formato/guia-salida-formato.component";
import { NotaSalidaRSComponent } from "./almacenes/registro-salida/nota-salida-rs/nota-salida-rs.component";
import { PrecioArticuloNSComponent } from "./almacenes/registro-salida/nota-salida-rs/precio-articulo-ns/precio-articulo-ns.component";
import { LogDialogModuloRegistroSalidaComponent } from "./almacenes/registro-salida/registro-salida-detalle/log-dialog-modulo-registro-salida/log-dialog-modulo-registro-salida.component";
import { ArticuloSalidaComponent } from "./almacenes/registro-salida/registro-salida-detalle/articulo-salida/articulo-salida.component";
import { ArticuloSalidaDetalleComponent } from "./almacenes/registro-salida/registro-salida-detalle/articulo-salida-detalle/articulo-salida-detalle.component";
import { PickingComponent } from "./almacenes/registro-salida/picking/picking.component";
import { ReportePickingSalidaComponent } from "./almacenes/registro-salida/picking/reporte-picking-salida/reporte-picking-salida.component";
import { RegistroTrasladoComponent } from "./almacenes/registro-traslado/registro-traslado.component";
import { RegistroTrasladoDetalleComponent } from "./almacenes/registro-traslado/registro-traslado-detalle/registro-traslado-detalle.component";
import { RegistroTrasladoMasivoComponent } from "./almacenes/registro-traslado/registro-traslado-masivo/registro-traslado-masivo.component";
import { ArticuloTrasladoComponent } from "./almacenes/registro-traslado/registro-traslado-detalle/articulo-traslado/articulo-traslado.component";
import { ArticuloTrasladoDetalleComponent } from "./almacenes/registro-traslado/registro-traslado-detalle/articulo-traslado-detalle/articulo-traslado-detalle.component";
import { MsgVisorComponent } from "./almacenes/registro-traslado/traslado-file/msg-visor/msg-visor.component";
import { GuiaSalidaFileComponent } from "./almacenes/registro-salida/guia-salida-file/guia-salida-file.component";
import { GuiaIngresoFileComponent } from "./almacenes/registro-ingreso/guia-ingreso-file/guia-ingreso-file.component";
import { TrasladoFileComponent } from "./almacenes/registro-traslado/traslado-file/traslado-file.component";
import { UnidadMedidaComponent } from "./almacenes/unidad-medida/unidad-medida.component";
import { RegistrarAlmacenUbicacionComponent } from "./almacenes/almacen/registrar-almacen-ubicacion/registrar-almacen-ubicacion.component";
import { DestinoDetalleComponent } from "./almacenes/destinos/destino-detalle/destino-detalle.component";
import { DialogDetalleDestinoComponent } from "./almacenes/destinos/dialog-detalle-destino/dialog-detalle-destino.component";
import { LogProveedorComponent } from "./almacenes/log-proveedor/log-proveedor.component";
import { LogMarcasComponent } from "./almacenes/log-marcas/log-marcas.component";
import { LogHistorialAsigCostoComponent } from "./almacenes/registro-salida/nota-salida-rs/log-historial-asig-costo/log-historial-asig-costo.component";
import { LogAccesoRestringidoComponent } from "./almacenes/log-acceso-restringido/log-acceso-restringido.component";

//Inventario
import { InventarioCentralComponent } from "./inventario/inventario-central/inventario-central.component";
import { InventarioSucursalComponent } from "./inventario/inventario-Sucursal/inventario-sucursal.component";
import { KardexComponent } from "./inventario/kardex/kardex.Component";
import { BusquedaArticuloComponent } from "./inventario/inventario-central/components/busqueda-articulo/busqueda-articulo.component";
import { SaldosComponent } from "./inventario/kardex/saldos/saldos.component";
import { IngresosSalidasComponent } from "./inventario/kardex/ingresos-salidas/ingresos-salidas.component";
import { ReportExcelComponent } from "./inventario/inventario-central/components/report-excel/report-excel.component";
import { InventarioTrasladoArticuloComponent } from "./inventario/inventario-central/components/inventario-traslado-articulo/inventario-traslado-articulo.component";
import { InventarioIngresoArticuloComponent } from "./inventario/inventario-central/components/inventario-ingreso-articulo/inventario-ingreso-articulo.component";
import { InventarioSalidaArticuloComponent } from "./inventario/inventario-central/components/inventario-salida-articulo/inventario-salida-articulo.component";
import { RegistroCantidadArticuloComponent } from "./inventario/inventario-central/components/registro-cantidad-articulo/registro-cantidad-articulo.component";
import { ScannerInventarioComponent } from "./inventario/inventario-central/scanner-inventario-central/scanner-inventario.component";
import { LogArticuloPalletComponent } from "./inventario/log-articulo-pallet/log-articulo-pallet.component";
import { LogSaldoPresupuestoAlmacenajeComponent } from "./inventario/log-saldo-presupuesto-almacenaje/log-saldo-presupuesto-almacenaje.component";
import { MovimientoVolmenComponent } from "./inventario/movimiento-volmen/movimiento-volmen.component";

//Parametro Logistica
import { FamiliaArticuloComponent } from "./parametroLogistica/familia-articulo/familia-articulo.component";
import { MatrizPermisoComponent } from "./parametroLogistica/matriz-permiso/matriz-permiso.component";
import { NumeradorGuiasComponent } from "./parametroLogistica/numerador-guias/numerador-guias.component";
import { OperacionLogisticaComponent } from "./parametroLogistica/operacion-logistica/operacion-logistica.component";
import { SubFamiliaArticuloComponent } from "./parametroLogistica/familia-articulo/sub-familia-articulo/sub-familia-articulo.component";
import { AlmacenDestinoAlmacenComponent } from "./parametroLogistica/matriz-permiso/almacen-destino-almacen/almacen-destino-almacen.component";
import { AlmacenOperacionComponent } from "./parametroLogistica/matriz-permiso/almacen-operacion/almacen-operacion.component";
import { AlmacenUsuarioComponent } from "./parametroLogistica/matriz-permiso/almacen-usuario/almacen-usuario.component";
import { DetalleNumeradorGuiaComponent } from "./parametroLogistica/numerador-guias/detalle-numerador-guia/detalle-numerador-guia.component";
import { AgregarAlmacenFisicoComponent } from "./almacenes/almacen/components/agregar-almacen-fisico/agregar-almacen-fisico.component";
import { AgregarUnidadMedidaComponent } from "./almacenes/unidad-medida/components/agregar-unidad-medida/agregar-unidad-medida.component";
import { ParametrosComponent } from "./parametroLogistica/parametros/parametros.component";
import { AlmacenParametrosComponent } from "./parametroLogistica/parametros/almacen-parametros/almacen-parametros.component";
import { ListaparametrosComponent } from "./parametroLogistica/parametros/lista-parametros/listaparametros.component";
import { PresupuestoParametrosComponent } from "./parametroLogistica/parametros/presupueto-parametros/presupuesto-parametros.component";
import { LogPermisosDeUsuarioArticulosDialogParametrosComponent } from "./parametroLogistica/parametros/log-permisos-de-usuario-articulos-dialog-parametros/log-permisos-de-usuario-articulos-dialog-parametros.component";
import { LogSateliteUsuarioComponent } from "./parametroLogistica/log-satelite-usuario/log-satelite-usuario.component";

// ../control-costos/datobasico/parametros/parametros.component";
//Tansporte
import { ArmadoRutasComponent } from "./transporte/armado-rutas/armado-rutas.component";
import { RutasTransporteComponent } from "./transporte/trans-reporte/log-reporte-trans/rutas-transporte/rutas-transporte.component";
import { ReporteRutaTransporteComponent } from "./transporte/trans-reporte/log-reporte-trans/rutas-transporte/reporte-ruta-transporte/reporte-ruta-transporte.component";
import { FacturaTransporteComponent } from "./transporte/factura-transporte/factura-transporte.component";
import { FacturaDirectaTransporteComponent } from "./transporte/factura-transporte/components/factura-directa-transporte/factura-directa-transporte.component";
import { LiquidacionTransporteComponent } from "./transporte/liquidacion-transporte/liquidacion-transporte.component";
import { EmpresaTransporteComponent } from "./transporte/Mantenimiento/empresa-transporte/empresa-transporte.component";
import { EmpresaTransporteDetalleComponent } from "./transporte/Mantenimiento/empresa-transporte/empresa-transporte-detalle/empresa-transporte-detalle.component";
import { VehiculoDetalleComponent } from "./transporte/Mantenimiento/empresa-transporte/empresa-transporte-detalle/vehiculo/vehiculo-detalle/vehiculo-detalle.component";
import { VehiculoArchivoVisorComponent } from "./transporte/Mantenimiento/empresa-transporte/empresa-transporte-detalle/vehiculo/vehiculo-archivo/vehiculo-archivo-visor/vehiculo-archivo-visor.component";
import { VehiculoArchivoComponent } from "./transporte/Mantenimiento/empresa-transporte/empresa-transporte-detalle/vehiculo/vehiculo-archivo/vehiculo-archivo.component";
import { ChoferComponent } from "./transporte/Mantenimiento/empresa-transporte/empresa-transporte-detalle/chofer/chofer.component";
import { VehiculoComponent } from "./transporte/Mantenimiento/empresa-transporte/empresa-transporte-detalle/vehiculo/vehiculo.component";
import { ChoferArchivoComponent } from "./transporte/Mantenimiento/empresa-transporte/empresa-transporte-detalle/chofer/chofer-archivo/chofer-archivo.component";
import { ChoferDetalleComponent } from "./transporte/Mantenimiento/empresa-transporte/empresa-transporte-detalle/chofer/chofer-detalle/chofer-detalle.component";
import { ChoferArchivoVisorComponent } from "./transporte/Mantenimiento/empresa-transporte/empresa-transporte-detalle/chofer/chofer-archivo/chofer-archivo-visor/chofer-archivo-visor.component";
import { TarifaMovilidadComponent } from "./transporte/Mantenimiento/tarifa-transporte/tarifa-movilidad/tarifa-movilidad.component";
import { TarifaTransporteComponent } from "./transporte/Mantenimiento/tarifa-transporte/tarifa-transporte.component";
import { TarifaEnvioComponent } from "./transporte/Mantenimiento/tarifa-transporte/tarifa-envio/tarifa-envio.component";
import { ArticuloModalComponent } from "./almacenes/registro-ingreso/registro-ingreso-detalle/articulo-modal/articulo-modal.component";
import { ArticuloModalDetalleComponent } from "./almacenes/registro-ingreso/registro-ingreso-detalle/articulo-modal-detalle/articulo-modal-detalle.component";
import { ArticuloImagenComponent } from "./almacenes/registro-ingreso/registro-ingreso-detalle/articulo-modal/articulo-imagen/articulo-imagen.component";
import { ArticuloUbicacionComponent } from "./almacenes/registro-ingreso/registro-ingreso-detalle/articulo-ubicacion/articulo-ubicacion.component";
import { DialogArmadoRutasComponent } from "./transporte/armado-rutas/dialog-armado-rutas/dialog-armado-rutas.component";
import { GestionArmadoRutasComponent } from "./transporte/armado-rutas/gestion-armado-ruta/gestion-armado-ruta.component";
import { DialogGestionVehiculoComponent } from "./transporte/armado-rutas/dialog-gestion-vehiculo/dialog-gestion-vehiculo.component";
import { DialogNotasComponent } from "./transporte/armado-rutas/dialog-notas/dialog-notas.component";
import { ScannerComponent } from "./inventario/inventario-central/scanner/scanner.component";
import { DialogDestinoCargaExcelComponent } from "./almacenes/destinos/destino-carga-excel/destino-carga-excel.component";
import { DestinoValidacionesComponent } from "./almacenes/destinos/destino-validaciones/destino-validaciones.component";
import { AjusteCongeladoComponent } from "./transporte/ajuste-congelado/ajuste-congelado.component";
import { HistorialUbicacionComponent } from "./inventario/inventario-central/components/historial-ubicacion/historial-ubicacion.component";
import { LogReporteTransComponent } from "./transporte/trans-reporte/log-reporte-trans/log-reporte-trans.component";

import { AjusteCongeladoFiltersComponent } from "./transporte/ajuste-congelado/componentes/ajuste-congelado-filters/ajuste-congelado-filters.component";
import { AjusteCongeladoTableComponent } from "./transporte/ajuste-congelado/componentes/ajuste-congelado-table/ajuste-congelado-table.component";
import { AjusteCongeladoGetComponent } from "./transporte/ajuste-congelado/componentes/ajuste-congelado-get/ajuste-congelado-get.component";
import { LiquidacionTransporteHeaderComponent } from "./transporte/liquidacion-transporte/componentes/liquidacion-transporte-header/liquidacion-transporte-header.component";
import { LiquidacionTransporteBodyComponent } from "./transporte/liquidacion-transporte/componentes/liquidacion-transporte-body/liquidacion-transporte-body.component";
import { LiquidacionTransporteBodyGuiaComponent } from './transporte/liquidacion-transporte/componentes/liquidacion-transporte-body-guia/liquidacion-transporte-body-guia.component';
import { LiquidacionTransporteBodyArticuloComponent } from './transporte/liquidacion-transporte/componentes/liquidacion-transporte-body-articulo/liquidacion-transporte-body-articulo.component';
import { FacturaTransporteHeaderComponent } from './transporte/factura-transporte/components/factura-transporte-header/factura-transporte-header.component';
import { FacturaTransporteTableComponent } from './transporte/factura-transporte/components/factura-transporte-table/factura-transporte-table.component';
import { ReporteCargaMovilidadComponent } from "./transporte/trans-reporte/log-reporte-trans/rutas-transporte/reporte-carga-movilidad/reporte-carga-movilidad.component";
import { DialogNotasRechazadasComponent } from "./transporte/armado-rutas/dialog-notas-rechazadas/dialog-notas-rechazadas.component";
import { FacturaTransporteAsignarComponent } from './transporte/factura-transporte/components/factura-transporte-asignar/factura-transporte-asignar.component';
import { DialogSelectPuntoComponent } from './transporte/armado-rutas/dialog-notas/dialog-select-punto/dialog-select-punto.component';
import { LogDialogSelectChoferComponent } from "./transporte/armado-rutas/gestion-armado-ruta/log-dialog-select-chofer/log-dialog-select-chofer.component";
import { LogDialogSelectNotaComponent } from './transporte/armado-rutas/dialog-notas/log-dialog-select-nota/log-dialog-select-nota.component';
import { LogGastoCourierComponent } from "./transporte/trans-reporte/log-reporte-trans/log-gasto-courier/log-gasto-courier.component";
import { LogGastoPptosComponent } from "./transporte/trans-reporte/log-reporte-trans/log-gasto-pptos/log-gasto-pptos.component";
import { LogDialogReporteExcelComponent } from './transporte/armado-rutas/gestion-armado-ruta/log-dialog-reporte-excel/log-dialog-reporte-excel.component';
import { LogDialogProrrateoPresupuestoComponent } from './transporte/liquidacion-transporte/dialogs/log-dialog-prorrateo-presupuesto/log-dialog-prorrateo-presupuesto.component';
import { LogDialogVerProrrateosComponent } from './transporte/liquidacion-transporte/dialogs/log-dialog-ver-prorrateos/log-dialog-ver-prorrateos.component';
import { LogDialogValidacionesComponent } from "./transporte/liquidacion-transporte/dialogs/log-dialog-validaciones/log-dialog-validaciones.component";
import { LogDialogAgregarVehiculoComponent } from './transporte/Mantenimiento/empresa-transporte/empresa-transporte-detalle/vehiculo/log-dialog-agregar-vehiculos/log-dialog-agregar-vehiculo.component';
import { LogDialogAgregarChoferComponent } from './transporte/Mantenimiento/empresa-transporte/empresa-transporte-detalle/chofer/log-dialog-agregar-chofer/log-dialog-agregar-chofer.component';

export const ALMACEN_RUTAS_COMPONENTES = [
  //Almacenes
  ArticuloComponent,
  AlmacenComponent,
  AlmacenUbicacionesComponent,
  DestinosComponent,
  RegistroIngresoComponent,
  RegistroIngresoDetalleComponent,
  NotaIngresoRIComponent,
  ArticuloModalComponent,
  ArticuloModalDetalleComponent,
  ArticuloModalNotaComponent,
  ArticuloImagenComponent,
  ArticuloUbicacionComponent,
  RegistroSalidaComponent,
  RegistroSalidaDetalleComponent,
  GuiaSalidaFormatoComponent,
  LogDialogModuloRegistroSalidaComponent,
  NotaSalidaRSComponent,
  PrecioArticuloNSComponent,
  ArticuloSalidaComponent,
  ArticuloSalidaDetalleComponent,
  PickingComponent,
  ReportePickingSalidaComponent,
  RegistroTrasladoComponent,
  RegistroTrasladoMasivoComponent,
  RegistroTrasladoDetalleComponent,
  ArticuloTrasladoComponent,
  ArticuloTrasladoDetalleComponent,
  GuiaSalidaFileComponent,
  GuiaIngresoFileComponent,
  TrasladoFileComponent,
  MsgVisorComponent,
  UnidadMedidaComponent,
  AgregarAlmacenFisicoComponent,
  AgregarUnidadMedidaComponent,
  DestinoDetalleComponent,
  DialogDetalleDestinoComponent,
  RegistrarAlmacenUbicacionComponent,
  ScannerInventarioComponent,
  DialogDestinoCargaExcelComponent,
  DestinoValidacionesComponent,
  LogProveedorComponent,
  LogMarcasComponent,
  LogHistorialAsigCostoComponent,
  LogAccesoRestringidoComponent,
  
  //Inventario
  InventarioCentralComponent,
  InventarioSucursalComponent,
  KardexComponent,
  InventarioTrasladoArticuloComponent,
  InventarioIngresoArticuloComponent,
  InventarioSalidaArticuloComponent,
  RegistroCantidadArticuloComponent,
  BusquedaArticuloComponent,
  ScannerComponent,
  SaldosComponent,
  IngresosSalidasComponent,
  HistorialUbicacionComponent,
  ReportExcelComponent,
  LogArticuloPalletComponent,
  LogSaldoPresupuestoAlmacenajeComponent,
  MovimientoVolmenComponent,

  //Parametro Logistica
  FamiliaArticuloComponent,
  SubFamiliaArticuloComponent,
  MatrizPermisoComponent,
  AlmacenUsuarioComponent,
  AlmacenOperacionComponent,
  AlmacenDestinoAlmacenComponent,
  OperacionLogisticaComponent,
  NumeradorGuiasComponent,
  DetalleNumeradorGuiaComponent,
  ParametrosComponent,
  AlmacenParametrosComponent,
  ListaparametrosComponent,
  PresupuestoParametrosComponent,
  LogPermisosDeUsuarioArticulosDialogParametrosComponent,
  LogSateliteUsuarioComponent,

  //transporte
  ArmadoRutasComponent,
  RutasTransporteComponent,
  DialogArmadoRutasComponent,
  DialogNotasRechazadasComponent,
  GestionArmadoRutasComponent,
  DialogGestionVehiculoComponent,
  ReporteRutaTransporteComponent,
  ReporteCargaMovilidadComponent,
  DialogNotasComponent,
  FacturaTransporteComponent,
  LiquidacionTransporteComponent,
  EmpresaTransporteComponent,
  EmpresaTransporteDetalleComponent,
  ChoferComponent,
  VehiculoComponent,
  TarifaMovilidadComponent,
  TarifaTransporteComponent,
  TarifaEnvioComponent,
  VehiculoDetalleComponent,
  VehiculoArchivoComponent,
  VehiculoArchivoVisorComponent,
  ChoferDetalleComponent,
  ChoferArchivoComponent,
  ChoferArchivoVisorComponent,
  AjusteCongeladoComponent,
  AjusteCongeladoFiltersComponent,
  AjusteCongeladoTableComponent,
  AjusteCongeladoGetComponent,
  LiquidacionTransporteHeaderComponent,
  LiquidacionTransporteBodyComponent,
  LiquidacionTransporteBodyGuiaComponent,
  LiquidacionTransporteBodyArticuloComponent,
  FacturaTransporteHeaderComponent,
  FacturaTransporteTableComponent,
  FacturaTransporteAsignarComponent,
  FacturaDirectaTransporteComponent,
  DialogSelectPuntoComponent,
  LogDialogSelectChoferComponent,
  LogDialogSelectNotaComponent,
  LogDialogReporteExcelComponent,
  LogReporteTransComponent,
  LogGastoCourierComponent,
  LogGastoPptosComponent,
  LogDialogProrrateoPresupuestoComponent,
  LogDialogVerProrrateosComponent,
  LogDialogValidacionesComponent,
  LogDialogAgregarVehiculoComponent,
  LogDialogAgregarChoferComponent
];

const routes: Routes = [
  {
    path: "almacen",
    component: ContainerInsideComponent,
    canActivate: [Oauth2Guard],
    children: [
      {
        path: "almacenes",
        component: null,
        children: [
          {
            path: "articulo",
            component: ArticuloComponent,
          },
          {
            path: "almacen",
            component: AlmacenComponent,
          },
          {
            path: "destinos",
            component: DestinosComponent,
          },
          {
            path: "registro-ingreso",
            component: RegistroIngresoComponent,
          },
          {
            path: "registro-salida",
            component: RegistroSalidaComponent,
          },
          {
            path: "registro-traslado",
            component: RegistroTrasladoComponent,
          },
          {
            path: "unidad-medida",
            component: UnidadMedidaComponent,
          },
          {
            path: "proveedor",
            component: LogProveedorComponent,
          },
          {
            path: "marcas",
            component: LogMarcasComponent,
          },
          {
            path: "acceso-restringido",
            component: LogAccesoRestringidoComponent,
          },
        ],
      },

      {
        path: "inventario",
        component: null,
        children: [
          {
            path: "inventario-central",
            component: InventarioCentralComponent,
          },
          {
            path: "inventario-sucursal",
            component: InventarioSucursalComponent,
          },
          {
            path: "kardex",
            component: KardexComponent,
          },
          {
            path: "articulo-Pallet",
            component: LogArticuloPalletComponent,
          },
          {
            path: "presupuesto-almacenaje",
            component: LogSaldoPresupuestoAlmacenajeComponent,
          },
          {
            path: "Movimiento-volmen",
            component: MovimientoVolmenComponent,
          },
          
        ],
      },

      {
        path: "parametroLogistica",
        component: null,
        children: [
          {
            path: "familia-articulo",
            component: FamiliaArticuloComponent,
          },
          {
            path: "matriz-permiso",
            component: MatrizPermisoComponent,
          },
          {
            path: "operacion-logistica",
            component: OperacionLogisticaComponent,
          },
          {
            path: "numerador-guias",
            component: NumeradorGuiasComponent,
          },
          {
            path: "parametros",
            component: ParametrosComponent,
          },
          {
            path: "satelite-usuario",
            component: LogSateliteUsuarioComponent,
          },
          
        ],
      },

      {
        path: "transporte",
        component: null,
        children: [
          {
            path: "armado-rutas",
            component: ArmadoRutasComponent,
          },
          {
            path: "trans-reportes",
            component: null,
            children:[
              {
                path: "reportes",
                component: LogReporteTransComponent
              }
            ]
          },
          {
            path: "gestion-armado-rutas/:id",
            component: GestionArmadoRutasComponent,
          },
          {
            path: "factura-transporte",
            component: FacturaTransporteComponent,
          },
          {
            path: "liquidacion-transporte",
            component: LiquidacionTransporteComponent,
          },
          {
            path: "liquidacion-transporte/:sCodTransporte",
            component: LiquidacionTransporteComponent,
          },
          {
            path: "ajuste-congelado",
            component: AjusteCongeladoComponent,
          },
          {
            path: "Mantenimiento",
            component: null,
            children: [
              {
                path: "empresa-transporte",
                component: EmpresaTransporteComponent,
              },
              {
                path: "Tarifa-Movilidad",
                component: TarifaTransporteComponent,
              },
              {
                path: "empresa-transporte/:nIdEmpTrans/:isVehiculo",
                component: EmpresaTransporteComponent,
              },
            ],
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
export class AlmacenRutasModule {}
