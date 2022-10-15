import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { GRUPO_DESTINO_CABECERA } from "../../models/grupoDestino-cabecera.model";
import { Datos_Guia, GRUPO_DESTINO_DETALLE } from "../../models/grupoDestino-detalle.model";
import { VehiculoModel } from "../../models/vehiculo.model";
import { TransporteService } from "../../transporte.service";
import { DialogGestionVehiculoComponent } from "../dialog-gestion-vehiculo/dialog-gestion-vehiculo.component";
import Swal from "sweetalert2";
import { DialogNotasComponent } from "../dialog-notas/dialog-notas.component";
import { E_Detalle_Reporte_Transportista } from "../../models/reporte-detalle-rutas.model";
import { E_Cabecera_Reporte_Ruta } from "../../models/reporte-cabecera-rutas.model";
import { E_Reporte_Cabecera_Movilidad } from "../../models/reporte-cabecera-movilidad.model";
import { E_Reporte_Detalle_Movilidad, E_Reporte_Deta_Punto_Movilidad } from "../../models/reporte-detalle-movilidad-model";
import { forkJoin } from "rxjs";
import { E_Nota } from "../../models/notas.model";
import { LogDialogSelectChoferComponent } from "./log-dialog-select-chofer/log-dialog-select-chofer.component";
import { ISelectItem, Question } from "../../models/constantes";
import { isNullOrUndefined } from "util";
import moment from "moment";
import { LogDialogReporteExcelComponent } from "./log-dialog-reporte-excel/log-dialog-reporte-excel.component";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { HelpersService } from "../../helpers.service";

export interface VehiculoDetalle {
  contador: number;
  pesoRestante: number;
  volumenRestante: number;
}

@Component({
  selector: "app-gestion-armado-rutas",
  templateUrl: "./gestion-armado-ruta.component.html",
  styleUrls: ["./gestion-armado-ruta.component.css"],
  animations: [asistenciapAnimations]
})
export class GestionArmadoRutasComponent implements OnInit {
  listaVehiculo: VehiculoModel[] = [];
  dsVehiculo: MatTableDataSource<VehiculoModel>;
  grupoDestino: GRUPO_DESTINO_CABECERA;
  grupoDestinoDetalle: GRUPO_DESTINO_DETALLE[];
  nIdGrupo: number;
  nPunto: number;
  formCabecera: FormGroup;
  formVehiculoDetalle: FormGroup;
  formGuia: FormGroup;
  dsDetalle: MatTableDataSource<GRUPO_DESTINO_DETALLE>;
  hideButtonAsignar: boolean = true;
  idDetTransporte: number;
  objDetalleVehiculo: VehiculoDetalle;
  sCodTransporte: string;
  vhSelected: VehiculoModel;

  cabReporteTranporte: E_Cabecera_Reporte_Ruta;
  detReporteTransporte: E_Detalle_Reporte_Transportista[];
  cabReporteMovilidad: E_Reporte_Cabecera_Movilidad;
  detPuntoReportePunto: E_Reporte_Deta_Punto_Movilidad[];
  detReporteMovilidad: E_Reporte_Detalle_Movilidad[];

  @ViewChild('paginatorVehiculos', { static: true }) paginatorVehiculos: MatPaginator;
  @ViewChild('sortVehiculos', { static: true }) sortVehiculos: MatSort;
  displayedColumns: string[];
  vehiculoCols: any[] = [
    { header: 'Opción', field: 'opcion', type: 'opcion', width: '50', align: 'center', sticky: true },
    { header: 'Asignar', field: 'asignar', type: 'asignar', width: '50', align: 'center', sticky: true },
    { header: 'Código', field: 'sCodTransporte', type: null, width: '80', align: 'center', sticky: false },
    { header: 'Estado', field: 'sEstado', type: 'bEstado', width: '80', align: 'left', sticky: false },
    { header: 'Nro puntos', field: 'nCantPunto', type: null, width: '80', align: 'center', sticky: false },
    { header: 'Placa', field: 'sPLaca', type: null, width: '100', align: 'center', sticky: false },
    { header: 'Descripción', field: 'sDescripcion', type: null, width: '400', align: 'left', sticky: false },
    { header: 'Modelo', field: 'sModelo', type: null, width: '120', align: 'left', sticky: false },
    { header: 'Tipo Vehículo', field: 'sTipoVehiculo', type: null, width: '150', align: 'left', sticky: false },
    { header: '¿De Lucky?', field: 'bLucky', type: 'bLucky', width: '70', align: 'center', sticky: false }
  ];

  @ViewChild('paginatorPuntos', { static: true }) paginatorPuntos: MatPaginator;
  @ViewChild('sortPuntos', { static: true }) sortPuntos: MatSort;
  displayedColumnsDetalle: string[] = [
    "opcion",
    "sPunto",
    "sNroTransporte",
    "sCadenaOrigen",
    "sSucursalOrigen",
    "sCadenaDestino",
    "sSucursalDestino",
    "sCono",
    "nCantidad",
    "nPeso",
    "nVolumen",
    "sZona",
  ];

  initFormCabecera(): void {
    this.formCabecera = this.fb.group({
      ruta: [""],
      fecha: [""],
      estado: [""],
    });
  }

  initFormDetalleVehiculo(): void {
    this.formVehiculoDetalle = this.fb.group({
      chofer: [""],
      totalpeso: [""],
      totalVolumen: [""],
      pesoRestante: [""],
      volumenRestante: [""],
    });
  }

  initFormGuia(): void {
    this.formGuia = this.fb.group({
      sCodSerie: ['', [Validators.required, Validators.pattern('^\\d*$'), this.helper.mayorACero, Validators.maxLength(4)]],
      nNumeroGuia: ['', [Validators.required, Validators.pattern('^\\d*$'), this.helper.mayorACero, Validators.maxLength(7)]]
    });
  }

  get serieField(): FormControl { return this.formGuia.get('sCodSerie') as FormControl }
  get numeroGuiaField(): FormControl { return this.formGuia.get('nNumeroGuia') as FormControl }

  get serieError(): string {
    return this.serieField.hasError('required') ? '.Obligatorio' :
      this.serieField.hasError('pattern') ? `Solo números` :
        this.serieField.hasError('maxlength') ? 'máx. 4 dígitos' :
          this.serieField.hasError('mayorACeroValidator') ? this.serieField.errors.mayorACeroValidator : null
  }
  get numeroGuiaError(): string {
    return this.numeroGuiaField.hasError('required') ? '.Obligatorio' :
      this.numeroGuiaField.hasError('pattern') ? `Solo números` :
        this.numeroGuiaField.hasError('maxlength') ? 'máx. 7 dígitos' :
          this.numeroGuiaField.hasError('mayorACeroValidator') ? this.numeroGuiaField.errors.mayorACeroValidator : null
  }

  // Variables para las opciones
  tsLista = 'inactive';
  fbLista = [
    { icon: 'save', tool: 'Grabar', color: '' },
    { icon: 'edit', tool: 'Editar', color: '' },
    { icon: 'text_snippet', tool: 'Reporte', color: '' },
    { icon: 'exit_to_app', tool: 'Cancelar', color: 'warn' }
  ];
  abLista = [];

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private transporteService: TransporteService,
    private helper: HelpersService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder
  ) {
    this.displayedColumns = this.vehiculoCols.map(({ field }) => field);
    this.initFormCabecera();
    this.initFormDetalleVehiculo();
    this.initFormGuia();
  }

  ngOnInit(): void {
    this.onToggleFab(-1);
    this.route.params.subscribe((params) => {
      if (params["id"] != 0) {
        this.nIdGrupo = params["id"];
        this.obtenerCabecera(this.nIdGrupo);
        this.obtenerDetalle(this.nIdGrupo);
        this.listarVehiculos();
      } else {
        this.retornarVistaPrincipal();
      }
    });

    this.serieField.valueChanges.subscribe(res => {
      const newValue = this.fnChangeValue(res, 4);
      this.serieField.setValue(newValue, { emitEvent: false });
    });

    this.numeroGuiaField.valueChanges.subscribe(res => {
      const newValue = this.fnChangeValue(res, 7);
      this.numeroGuiaField.setValue(newValue, { emitEvent: false });
    });
  }

  fnChangeValue(param: any, len: number): string {
    if (isNaN(param)) {
      return param;
    } else {
      const aux = Number(param);
      return aux.toString().padStart(len, '0');
    }
  }

  getColor(param: boolean): string { return param ? 'red' : 'green' }

  //#region Funcion que busca en la tabla de vehículos
  applyFilterVh(filter: string): void {
    this.dsVehiculo.filter = filter.trim().toLowerCase();
  }
  //#endregion

  //#region Funcion que busca en la tabla detalle
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsDetalle.filter = filterValue.trim().toLowerCase();
  }
  //#endregion

  //#region Funcion que obtiene la cabecera
  obtenerCabecera(nIdGrupo: number): void {
    this.spinner.show();
    this.transporteService.fnArmadoRuta(1, 2, 5, `${nIdGrupo}`).subscribe((resp) => {
      this.grupoDestino = resp.data;
      this.spinner.hide();
      if (Object.keys(this.grupoDestino).length === 0) {
        this.retornarVistaPrincipal();
      } else {
        this.formCabecera.reset({
          ruta: this.grupoDestino.sNumero,
          fecha: this.grupoDestino.dFecha,
          estado: this.grupoDestino.bEstado ? "Pendiente" : "Activo",
        });
      }
    });
  }
  //#endregion

  //#region Funcion que trae los vehiculos
  listarVehiculos(idDeta?: number): void {
    this.transporteService.fnArmadoRuta(1, 2, 8, `${this.nIdGrupo}`).subscribe((resp) => {
      this.spinner.hide();
      this.listaVehiculo = resp.lista;
      this.dsVehiculo = new MatTableDataSource(this.listaVehiculo);
      this.dsVehiculo.paginator = this.paginatorVehiculos;
      this.dsVehiculo.sort = this.sortVehiculos;
      if (idDeta) {
        const vehiculo = this.listaVehiculo.find(x => x.nIdDetTransporte == idDeta);
        this.detalleVehiculo(vehiculo);
      }
    });
  }
  //#endregion

  //#region Funcion que obtiene el detalle
  obtenerDetalle(nIdGrupo: number): void {
    this.spinner.show();
    this.transporteService.fnArmadoRuta(1, 2, 6, `${nIdGrupo}`).subscribe((resp) => {
      this.spinner.hide();
      this.grupoDestinoDetalle = resp.lista;
      if (this.grupoDestinoDetalle == []) {
        this.retornarVistaPrincipal();
      } else {
        this.dsDetalle = new MatTableDataSource(this.grupoDestinoDetalle);
        this.dsDetalle.paginator = this.paginatorPuntos;
        this.dsDetalle.sort = this.sortPuntos;
      }
    });
  }
  //#endregion

  /* #regionGrupo  opciones de para tabla Vehículos agregados a la ruta */

  /* #region1  Función que apertura una nueva pestaña con la ruta de liquidación de transporte */
  fnOpenTabLiquidacion(row: VehiculoModel) {
    const url = this.router.createUrlTree(["/almacen/transporte/liquidacion-transporte", row.sCodTransporte]);
    window.open(url.toString(), '_blank');
  }
  /* #endregion */

  /* #region2  Función que muestra el modal para agregar un vehiculo */
  abrirModalVehiculo(row: VehiculoModel, isNew: boolean): void {
    this.dialog.open(DialogGestionVehiculoComponent, {
      //disableClose: true,
      autoFocus: false,
      width: '1000px',
      data: { 'nIdGrupo': this.nIdGrupo, 'lista': this.listaVehiculo, 'vehiculo': row, 'isNew': isNew }
    }).afterClosed().subscribe((result: number) => {
      if (result) {
        this.listarVehiculos(result);
      }
    });
  }
  /* #endregion */

  /* #region3  Función que retira un vehículo de la lista de los mismos*/
  retirarVehiculo(row: VehiculoModel, index: number): void {
    Swal.fire({
      title: "", text: "¿Desea retirar este vehículo?", icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6", cancelButtonColor: "#d33",
      confirmButtonText: "Sí", cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.transporteService.fnArmadoRuta(1, 1, 3, `${row.nIdDetTransporte}`).subscribe(res => {
          this.spinner.hide();
          if (res.result == 0) {
            Swal.fire({ title: 'Hubo un error en la solicitud', icon: 'warning', timer: 2000 });
          } else if (res.result == 2) {
            Swal.fire({ title: 'El vehículo tiene notas liquidadas', icon: 'error', timer: 2000 });
          }
          else {
            Swal.fire({ title: 'Se ha actualizado de manera exitosa', icon: 'success', timer: 2000 });
            this.dsVehiculo.data.splice(index, 1);
            this.dsVehiculo._updateChangeSubscription();
            this.grupoDestinoDetalle = this.grupoDestinoDetalle.map(item => item.sNroTransporte == row.sCodTransporte ? { ...item, sNroTransporte: '' } : item);
            this.dsDetalle.data = this.grupoDestinoDetalle;
            this.vhSelected = null;
          }
        });
      }
    });
  }
  /* #endregion */

  /* #region4  Función que abre el modal de asignación de chofer */
  asignarChofer(row: VehiculoModel): void {
    this.spinner.show();
    this.transporteService.fnArmadoRuta(1, 2, 7, `${row.nIdEmpresaTrans}`).subscribe(res => {//retorna la lista de choferes por empresa
      this.spinner.hide();
      this.dialog.open(LogDialogSelectChoferComponent, {
        disableClose: true, autoFocus: false, width: '450px', data: { 'choferes': res.lista as ISelectItem[], 'vehiculo': row }
      })
        .afterClosed().subscribe((nIdChofer: number) => {
          if (nIdChofer) {
            this.spinner.show();
            const parameters = `${row.nIdDetTransporte}|${nIdChofer}`;
            this.transporteService.fnArmadoRuta(1, 1, 5, parameters).subscribe(res => {//actualiza el chofer de la fila seleccionada
              this.spinner.hide();
              if (res.result == 0) {
                Swal.fire({ title: 'Hubo un error en la actualización', icon: 'warning', timer: 2000 });
              } else {
                Swal.fire({ title: 'Se ha actualizado de manera exitosa', icon: 'success', timer: 2000 });
                this.listarVehiculos(row.nIdDetTransporte);
              }
            }, (error) => { this.spinner.hide(); console.log(error); });
          }
        });
    });
  }
  /* #endregion */

  /* #endregion */

  //#region Función que retorna datos extras de un registro de vehículo
  detalleVehiculo(row: VehiculoModel): void {
    this.vhSelected = row;
    const isCodTransporte = (item: GRUPO_DESTINO_DETALLE) => item.sNroTransporte == row.sCodTransporte;
    const pesoTotalAsignado = this.grupoDestinoDetalle.filter(isCodTransporte).reduce((a, b) => a + b.nPeso, 0);
    const volumenTotalAsignado = this.grupoDestinoDetalle.filter(isCodTransporte).reduce((a, b) => a + b.nVolumen, 0);
    this.vhSelected.nPesoRestante = this.vhSelected.nPesoCarga - pesoTotalAsignado;
    this.vhSelected.nVolumenRestante = this.vhSelected.nVolumen - volumenTotalAsignado;
  }
  //#endregion

  //#region Funcion que retonar a la pantalla inicial
  retornarVistaPrincipal(): void { this.router.navigate(["/almacen/transporte/armado-rutas"]) }
  //#endregion

  asignarVehiculo(row: GRUPO_DESTINO_DETALLE): void {
    if (!this.hasVehiculos) {
      Swal.fire("Atención", "Debe agregar vehículos para asignar", "info"); return;
    }
    window.scroll(0, 0);
    this.hideButtonAsignar = false;
    this.nPunto = row.nPunto;
  }

  asignarTransporte(row: VehiculoModel): void {
    this.spinner.show();
    const parameters = `${this.nIdGrupo}|${this.nPunto}|${row.sCodTransporte}`;
    this.transporteService.fnArmadoRuta(1, 1, 4, parameters).subscribe(res => {
      if (res.result == 0) {
        Swal.fire({ title: 'Hubo un error en la solicitud', icon: 'warning', timer: 2000 });
      } else {
        Swal.fire({ title: 'Se ha asignado de manera exitosa', icon: 'success', timer: 2000 });
        this.obtenerDetalle(this.nIdGrupo);
        this.listarVehiculos(row.nIdDetTransporte);
        this.formVehiculoDetalle.reset();
        this.hideButtonAsignar = true;
      }
    }, (error) => { this.spinner.hide(); console.log(error); }
    );
  }

  cancelAsignar(): void {
    this.hideButtonAsignar = true;
    window.scrollBy(0, 500);
  }

  get hasVehiculos(): boolean { return this.listaVehiculo.length > 0 ? true : false }

  retirarVehiculoPunto(row: GRUPO_DESTINO_DETALLE): void {
    const pregunta = new Question('¿Desea retirar de este punto el vehículo?');
    Swal.fire(pregunta as unknown).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const parameters = `${row.nIdGrupo}|${row.nPunto}`;
        this.transporteService.fnArmadoRuta(1, 1, 7, parameters).subscribe(res => {
          this.spinner.hide();
          if (res.result == 0) {
            Swal.fire({ title: 'Hubo un error en la solicitud', icon: 'warning', timer: 2000 });
          } else if (res.result == 2) {
            Swal.fire({ title: 'El vehículo tiene notas liquidadas con este punto', icon: 'error', timer: 2000 });
          }
          else {
            Swal.fire({ title: 'Se ha actualizado de manera exitosa', icon: 'success', timer: 2000 });
            this.obtenerDetalle(row.nIdGrupo);
            const vhAux = this.fnSearchVehiculo(row.sNroTransporte);
            if (!isNullOrUndefined(this.vhSelected)) {
              this.listarVehiculos(this.vhSelected.nIdDetTransporte);
            } else {
              this.listarVehiculos();
            }
          }
        }, (error) => { this.spinner.hide(); console.log(error); });
      }
    });

  }

  fnLoadNotas(row: GRUPO_DESTINO_DETALLE, guia?: string) {
    const vhAux = this.fnSearchVehiculo(row.sNroTransporte);
    const lstPuntos = this.fnLoadPuntosDiponibles(row.sPunto);
    const parameters = `${row.nIdGrupo}|${row.nPunto}`;
    this.spinner.show();
    this.transporteService.fnArmadoRuta(1, 2, 12, parameters).subscribe((res) => {
      this.spinner.hide();
      const lst = res ? res.lista as E_Nota[] : [];
      this.dialog.open(DialogNotasComponent, {
        disableClose: true,
        autoFocus: false,
        data: {
          'notaList': lst, 'detaGrupo': row, 'grupoDestino': this.grupoDestino, 'puntoList': lstPuntos,
          'isLiquidado': vhAux?.bEstado, 'filtro': guia ? guia : ''
        }
      }).afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.obtenerDetalle(row.nIdGrupo);
          if (!isNullOrUndefined(this.vhSelected)) {
            this.detalleVehiculo(vhAux);
          }
        }
      });
    });
  }

  fnLoadDataReport(sCodTransporte: string): void {
    this.spinner.show();
    forkJoin({
      resTransporte: this.transporteService.fnArmadoRuta(1, 2, 13, sCodTransporte),
      resMovilidad: this.transporteService.fnArmadoRuta(1, 2, 15, sCodTransporte)
    }).subscribe(({ resTransporte, resMovilidad }) => {
      this.spinner.hide();
      this.cabReporteTranporte = resTransporte.data;
      this.detReporteTransporte = resTransporte ? resTransporte.lista : [];
      this.cabReporteMovilidad = resMovilidad.data;
      this.detPuntoReportePunto = resMovilidad ? resMovilidad.listaPunto : [];
      this.detReporteMovilidad = resMovilidad ? resMovilidad.lista : [];
    }, (error) => { this.spinner.hide(); console.log(error); });
  }

  fnLoadPuntosDiponibles(punto: string): GRUPO_DESTINO_DETALLE[] {
    const esPendiente = (item: VehiculoModel) => !item.bEstado;
    const obtenerCodTransporte = (item: VehiculoModel) => item.sCodTransporte;
    const lstCodigos = this.listaVehiculo.filter(esPendiente).map(obtenerCodTransporte);
    return this.grupoDestinoDetalle.filter(obj => (lstCodigos.includes(obj.sNroTransporte) || !obj.sNroTransporte?.trim()) && obj.sPunto != punto);
  }

  fnSearchVehiculo(codTransporte: string): VehiculoModel {
    return this.dsVehiculo.data.find(item => item.sCodTransporte == codTransporte);
  }

  fnAddPuntos(): void {
    const fecha = moment(moment(this.grupoDestino.dFecha, 'DD/MM/YYYY').toDate()).format("YYYY-MM-DD");
    const parameters = `${this.grupoDestino.nIdSucursal}|${fecha}`;
    this.spinner.show();
    this.transporteService.fnArmadoRuta(1, 2, 19, parameters).subscribe(res => {
      this.spinner.hide();
      const lst = res ? res.lista as E_Nota[] : [];
      if (lst.length == 0) {
        Swal.fire({ title: `No se encontraron notas que agregar.`, icon: 'info', timer: 2000 });
        return;
      }
      this.createNewPuntos(parameters, lst.length);
    });
  }

  createNewPuntos(params: string, cantidad: number): void {
    const pregunta = `Se encuentra${cantidad > 1 ? 'n' : ''} ${cantidad} registro${cantidad > 1 ? 's' : ''} para actualizar del día: 
                      ${this.grupoDestino.dFecha}  
                      Sucursal: ${this.grupoDestino.sSucursal}
                      ¿Desea actualizar este armado de ruta?`;
    Swal.fire(new Question(pregunta) as unknown).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const parameters = `${params}|${this.grupoDestino.nIdGrupo}`;
        this.transporteService.fnArmadoRuta(1, 1, 12, parameters).subscribe(res => {
          this.spinner.hide();
          if (res.result == 0) {
            Swal.fire({ title: 'Hubo un error en la actualización', icon: 'warning', timer: 2000 });
          }
          else if (res.result == 2) {
            Swal.fire({ title: 'No se encontraron notas qué agregar', icon: 'info', timer: 2000 });
          } else {
            Swal.fire({ title: 'Se han agregado los puntos de manera exitosa', icon: 'success', timer: 2000 });
            this.obtenerDetalle(this.nIdGrupo);
          }
        }, (error) => { this.spinner.hide(); console.log(error); });
      }
    });
  }

  fnDownloadReporte(): void {
    this.spinner.show();
    forkJoin({
      resCli: this.transporteService.fnFacturaTransporte(1, 2, localStorage.getItem("Pais"), 3),
      resProv: this.transporteService.fnFacturaTransporte(1, 2, '', 5)
    }).subscribe(({ resCli, resProv }) => {
      this.spinner.hide();
      this.dialog.open(LogDialogReporteExcelComponent, {
        disableClose: true,
        autoFocus: false,
        width: '550px',
        data: { 'clientes': resCli.lista, 'proveedores': resProv.lista }
      }).afterClosed().subscribe((result: boolean) => {
        if (result) { }
      });
    }, (error) => { this.spinner.hide(); console.log(error); });
  }

  fnBuscarGuia(): void {
    if (this.formGuia.invalid) {
      return Object.values(this.formGuia.controls).forEach(control => { control.markAllAsTouched() })
    }
    this.spinner.show();
    const parameters = `${this.serieField.value}|${Number(this.numeroGuiaField.value)}`;
    this.transporteService.fnArmadoRuta(1, 2, 21, parameters).subscribe(res => {
      this.spinner.hide();
      const data_guia = res ? res.data as Datos_Guia : res;
      let message = 'Guía no registrada.';
      const guia = `GR-${this.serieField.value}-${this.numeroGuiaField.value}`;
      if (data_guia == null) {
        Swal.fire({ title: message, icon: 'info', timer: 2000 });
      }
      else if (data_guia.nIdGrupo == this.nIdGrupo) {
        message = `La guía ${guia} \nse encuentra en el punto ${data_guia.sPunto} \nde origen ${data_guia.sOrigen} \ny destino ${data_guia.sDestino}.\n¿Desea abrir el punto?`;
        const pregunta = new Question(message);
        Swal.fire(pregunta as unknown).then((result) => {
          if (result.isConfirmed) {
            const item =  this.grupoDestinoDetalle.find(item=> item.nIdGrupo == data_guia.nIdGrupo && item.nPunto == data_guia.nPunto);
            this.fnLoadNotas(item, guia);
          }
        });
      } else {
        message = `La guía ${guia} se encuentra en el armado ${data_guia.sNumero} \nde fecha ${data_guia.sFecha} \nestado ${data_guia.sEstado}`;
        Swal.fire({ title: message, icon: 'info' });
      }
    }, (error) => { this.spinner.hide() });
  }

  /* #region  Método de limpieza del auto filtrado de vehículos*/
  fnCleanVh(): void {
    if (this.dsVehiculo) { this.dsVehiculo.filter = '' }
  }
  /* #endregion */

  /* #region  Método de limpieza del auto filtrado de puntos*/
  fnCleanDet(): void { if (this.dsDetalle) { this.dsDetalle.filter = '' } }
  /* #endregion */

  onToggleFab(stat: number) {
    stat = stat === -1 ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0: null; break;
      case 1: this.fnAddPuntos(); break;
      case 2: this.fnDownloadReporte(); break;
      default: this.retornarVistaPrincipal();
    }
  }
}
