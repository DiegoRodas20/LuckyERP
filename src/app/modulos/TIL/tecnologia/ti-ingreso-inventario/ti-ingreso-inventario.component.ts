import { OverlayContainer } from '@angular/cdk/overlay';
import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ActivoDTO, ActivoSelectItemDTO, ActivoTipoDTO } from '../api/models/activoDTO';
import { AsignacionDirectaCabeceraDTO } from '../api/models/asignacionDirectaDTO';
import { ActivoService } from '../api/services/activo.service';
import { AsignacionDirectaService } from '../api/services/asignacion-directa.service';
import { TiActivoAsignacionExcelComponent } from './ti-activo-asignacion-excel/ti-activo-asignacion-excel.component';
import { TiActivoAsignacionHistorialComponent } from './ti-activo-asignacion-historial/ti-activo-asignacion-historial';
import { TiActivoDescuentosPersonalComponent } from './ti-activo-descuentos-personal/ti-activo-descuentos-personal.component';
import { TiActivoOtrosComponent } from './ti-activo-otros/ti-activo-otros.component';
import { TiActivoResumenActivosComponent } from './ti-activo-resumen-activos/ti-activo-resumen-activos.component';

@Component({
  selector: 'app-ti-ingreso-inventario',
  templateUrl: './ti-ingreso-inventario.component.html',
  styleUrls: ['./ti-ingreso-inventario.component.css'],
  animations: [asistenciapAnimations]
})
export class TiIngresoInventarioComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables de ayuda
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada

  // Formulario
  formIngresoInventario: FormGroup;

  // Combobox
  listaTipoActivos: ActivoTipoDTO[] = [];
  listaEstadoActivos: ActivoSelectItemDTO[] = [];

  // Mat-Table (Gestion de activos)
  dataSource: MatTableDataSource<ActivoDTO>;
  listaActivos: ActivoDTO[] = [];
  displayedColumns: string[] = ["nIdActivo", "sTipo", "sCodActivo", "sDescripcion", "sEstado", "sAsignado", "sAddenda", "dFechaAlta", "dFechaBaja"];
  @ViewChild('paginatorActivo') paginatorActivo: MatPaginator;
  @ViewChild(MatSort, { static: false }) public sortActivo: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  // Mat-Table (Gestion de asinación)
  dataSourceAsignacion: MatTableDataSource<AsignacionDirectaCabeceraDTO>;
  listaAsignaciones: AsignacionDirectaCabeceraDTO[] = [];
  displayedColumnsAsignacion: string[] = ["nIdAsignacion", "sEmpresa", "sDocumento", "sNombreCompleto", "sTelefono", "sLaptop", "sCelular", "sCorreo", "sCanal"];
  @ViewChild('paginatorAsignacion') paginatorAsignacion: MatPaginator;
  @ViewChild(MatSort, { static: false }) public sortAsignacion: MatSort;
  txtFiltroAsignacion = new FormControl(); // Filtro de busqueda de la tabla

  pipeTable: DatePipe;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'add', tool: 'Crear Activo', state: true},
    {icon: 'assignment', tool: 'Resumen Activos', state: true},
    {icon: 'cloud_download', tool: 'Excel Descuentos', state: true},
    {icon: 'cloud_download', tool: 'Excel Asignaciones', state: true},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Flags
  tipoGestion = 1;

  constructor(
    private spinner: NgxSpinnerService,
    private _activoService: ActivoService,
    private _asignacionDirectaService: AsignacionDirectaService,
    private route: Router,
    private fb: FormBuilder,
    private dialog: MatDialog, // Declaracion del Dialog
    private overlayContainer: OverlayContainer
  ) {

    // Actualizamos los estilos para agregar un backdrop
    this.overlayContainer.getContainerElement().classList.add("multiDialog");

    // Crear formulario
    this.fnCrearFormulario();

    // Si en memoria esta guardado el tipo de registro como activos, mostrar la tabla de activos
    if(this._activoService.nTipoRegistro == 1){
      this.formIngresoInventario.get("activo").setValue(this._activoService.nIdTipoActivo != 0 ? this._activoService.nIdTipoActivo : null);
    }
    // Si no, mostrar la tabla de asignaciones
    else if(this._activoService.nTipoRegistro == 2){
      this.formIngresoInventario.get("tipoGestion").setValue(this._activoService.nTipoRegistro.toString());
    }

    // Inicializar tablas
    this.dataSource = new MatTableDataSource(this.listaActivos);
    this.dataSourceAsignacion = new MatTableDataSource(this.listaAsignaciones);

    // Dar formato a los dias
    this.pipeTable = new DatePipe('en');
    const defaultPredicate= this.dataSource.filterPredicate;
    this.dataSource.filterPredicate = (data, filter) =>{
      const formattedAlta = this.pipeTable.transform(data.dFechaAlta,'dd/MM/yyyy');
      const formattedBaja = this.pipeTable.transform(data.dFechaBaja,'dd/MM/yyyy');
      if(formattedBaja) 
        return formattedAlta.indexOf(filter) >= 0 || formattedBaja.indexOf(filter) >= 0 || defaultPredicate(data,filter);
      else 
        return formattedAlta.indexOf(filter) >= 0 || defaultPredicate(data,filter);
    }

    const defaultPredicateAsignacion= this.dataSourceAsignacion.filterPredicate;
    this.dataSourceAsignacion.filterPredicate = (data, filter) =>{
      const formattedIngreso = this.pipeTable.transform(data.dFechaIngreso,'dd/MM/yyyy');
      const formattedCese = this.pipeTable.transform(data.dFechaCese,'dd/MM/yyyy');
      if(formattedCese) 
        return formattedIngreso.indexOf(filter) >= 0 || formattedCese.indexOf(filter) >= 0 || defaultPredicateAsignacion(data,filter);
      else 
        return formattedIngreso.indexOf(filter) >= 0 || defaultPredicateAsignacion(data,filter);
    }
  }

  ngOnDestroy(){
    this.overlayContainer.getContainerElement().classList.remove("multiDialog");
  }

  async ngOnInit(): Promise<void> {
    this.spinner.show();

    this.onToggleFab(1, -1);

    await this.fnLlenarComboboxTipoActivos();
    await this.fnLlenarComboboxEstadoActivos();

    await this.fnMostrarTipoGestion();

    this.fnControlFab();

    this.estaCargado = true;
    this.spinner.hide();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginatorActivo;
    this.dataSource.sort = this.sortActivo;
  }

  //#region Botones

  // Metodo para abrir/cerrar menu de botones
  onToggleFab(fab: number, stat: number) {
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
  }

  // Metodo para utilizar las funciones del menu de botones
  async clickFab(index: number) {
    switch (index) {
      case 0:
        Number(this.formIngresoInventario.get("tipoGestion").value) == 1 ? this.fnCrearActivo() : this.fnCrearAsignacion();
        break;
      case 1:
        this.fnVerResumenActivos();
        break;
      case 2:
        this.fnDialogExcelDescuentos();
        break;
      case 3:
        this.fnDialogExcelAsignaciones();
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){
    // Creacion de detalle (Activos) solo si es tipo 1
    // Creacion de detalle (Asignacion) solo si es tipo 2
    this.fbLista[0].tool = Number(this.formIngresoInventario.get("tipoGestion").value) == 1 ? 'Crear Activo' : 'Crear Asignación'; 
    this.fbLista[1].state = this.formIngresoInventario.get("tipoGestion").value == '1'; 
    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Formulario

  fnCrearFormulario(){
    this.formIngresoInventario = this.fb.group({
      activo: null,
      estado: null,
      tipoGestion: '1'
    })
  }

  //#endregion

  //#region Tabla Activos

  // Llenado de la tabla Activos
  async fnLlenarTabla(){

    const tipoActivo = this.formIngresoInventario.get("activo").value || 0;
    const estadoActivo = this.formIngresoInventario.get("estado").value || 0;

    try{
      const result = await this._activoService.GetAll(tipoActivo, estadoActivo);
      this.listaActivos = result.response.data;
      this.dataSource.data = this.listaActivos;
      this.dataSource.paginator = this.paginatorActivo;
      this.dataSource.sort = this.sortActivo;
      // Primera pagina
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
    catch(err){
      console.log(err);
    }
  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async fnReiniciarFiltro(){

    this._activoService.nIdTipoActivo = Number(this.formIngresoInventario.get("activo").value);

    this.spinner.show();

    // Limpiar el filtro
    this.txtFiltro.setValue('');
    this.dataSource.filter = '';

    // Llenar nuevamente la tabla
    await this.fnLlenarTabla();

    this.spinner.hide();
  }

  async fnFiltrarCelularSimcard(sCodActivo: string){
    this.spinner.show();

    // Limpiar el filtro
    this.txtFiltro.setValue(sCodActivo);
    this.dataSource.filter = sCodActivo;
    this.formIngresoInventario.get("activo").setValue(null);

    // Llenar nuevamente la tabla
    await this.fnLlenarTabla();

    this.spinner.hide();
  }

  fnVerImagen(row: ActivoDTO){
    if(row.sRutaArchivo != null && row.sRutaArchivo != ''){

      // Obtenemos el codigo y el nombre del articulo
      const descripcionArticulo = row.sDescripcion;

      Swal.fire({ title: descripcionArticulo, imageUrl: row.sRutaArchivo, imageHeight: 250 });
    }
    else{
      Swal.fire({ icon: 'warning', title: ('No hay imagen'), text: `Este artículo no tiene imagen`});
    }
  }

  //#endregion

  //#region Tabla Asignacion
  async fnLlenarTablaAsignacion(){

    try{

      const result = await this._asignacionDirectaService.GetAllAsignacionesDirectas();
      this.listaAsignaciones = result.response.data;

      this.dataSourceAsignacion.data = this.listaAsignaciones;
      this.dataSourceAsignacion.paginator = this.paginatorAsignacion;
      this.dataSourceAsignacion.sort = this.sortAsignacion;
      // Primera pagina
      if (this.dataSourceAsignacion.paginator) {
        this.dataSourceAsignacion.paginator.firstPage();
      }
    }
    catch(err){
      console.log(err);
    }
  }

  fnFiltrarAsignacion(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceAsignacion.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceAsignacion.paginator) {
      this.dataSourceAsignacion.paginator.firstPage();
    }
  }

  async fnReiniciarFiltroAsignacion(){
    this.spinner.show();

    // Limpiar el filtro
    this.txtFiltroAsignacion.setValue('');
    this.dataSourceAsignacion.filter = '';

    // Llenar nuevamente la tabla
    await this.fnLlenarTablaAsignacion();

    this.spinner.hide();
  }
  //#endregion

  //#region Controles

  async fnLlenarComboboxTipoActivos(){
    try{
      const result = await this._activoService.GetAllTipos();
      this.listaTipoActivos = result.response.data;
    }
    catch(err){
      console.log(err);
    }
  }

  async fnLlenarComboboxEstadoActivos(){
    try{
      const result = await this._activoService.GetAllEstadosActivo();
      this.listaEstadoActivos = result.response.data;

      // if(this.listaEstadoActivos){
      //   // Si existe el estado 'En Stock', definirlo por defecto
      //   const existeEstadoStock = this.listaEstadoActivos.find(estado => estado.nId == 2587);
      //   if(existeEstadoStock){
      //     this.formIngresoInventario.get("estado").setValue(existeEstadoStock.nId)
      //   }
      // }
    }
    catch(err){
      console.log(err);
    }
  }

  // Guardar el tipo de gestion en una variable (flag) para validar que tabla se va a mostrar
  async fnMostrarTipoGestion(){
    this.spinner.show();
    
    this.tipoGestion = Number(this.formIngresoInventario.get("tipoGestion").value);

    // Se llena la tabla dependiendo del tipo de gestion
    if(this.tipoGestion == 1){
      await this.fnLlenarTabla();
    }
    else if(this.tipoGestion == 2){
      await this.fnLlenarTablaAsignacion();
    }

    this._activoService.nTipoRegistro = this.tipoGestion;

    this.fnControlFab();

    this.spinner.hide();
  }

  //#endregion

  //#region Detalle Activo

  fnCrearActivo(){

    const tipoActivo = this.formIngresoInventario.get("activo").value;

    switch(tipoActivo){
      case 2500:
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', tipoActivo ,'laptop']);  
        break;
      case 2501:
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', tipoActivo ,'desktop']);  
        break;
      case 2502:
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', tipoActivo ,'movil']);  
        break;
      case 2503:
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', tipoActivo ,'simcard']);  
        break;
      case 2505:
        this.fnAgregarOtroActivo();
        break;
      default:
        break;
    }
    
  }

  fnVerDetalle(row: ActivoDTO){

    switch(row.nIdTipo){
      case 2500:
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', row.nIdTipo ,'laptop', row.nIdActivo]);  
        break;
      case 2501:
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', row.nIdTipo ,'desktop', row.nIdActivo]);  
        break;
      case 2502:
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', row.nIdTipo ,'movil', row.nIdActivo]);  
        break;
      case 2503:
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', row.nIdTipo ,'simcard', row.nIdActivo]);  
        break;
      case 2505:
        this.fnVerDetalleOtroActivo(row.nIdActivo);
        break;
      default:
        break;
    }
  }

  fnCrearAsignacion(){
    this.route.navigate(['til/tecnologia/ti-ingreso-inventario/asignacion/directa']);  
  }

  fnVerDetalleAsignacion(row: AsignacionDirectaCabeceraDTO){
    this.route.navigate(['til/tecnologia/ti-ingreso-inventario/asignacion/directa', row.nIdPersonal]);  
  }

  fnVerResumenActivos(){

    this.spinner.show();

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(TiActivoResumenActivosComponent, {
      width: '1250px',
      autoFocus: false,
      disableClose: false,
      backdropClass: 'backdropBackground',
      data: {}
    });

    dialogRef.afterClosed().subscribe(async result => {
      this.mostrarBotones = true;
    });
  }

  fnAgregarOtroActivo(){

    this.spinner.show();

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(TiActivoOtrosComponent, {
      width: '1000px',
      autoFocus: false,
      disableClose: true,
      backdropClass: 'backdropBackground',
      data: {}
    });

    dialogRef.afterClosed().subscribe(async result => {
      if(result){
        await this.fnLlenarTabla();
      }
      this.mostrarBotones = true;
    });
  }

  fnVerDetalleOtroActivo(nIdActivo: number){

    this.spinner.show();

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(TiActivoOtrosComponent, {
      width: '1000px',
      autoFocus: false,
      disableClose: true,
      backdropClass: 'backdropBackground',
      data: {
        nIdActivo
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if(result){
        await this.fnLlenarTabla();
      }
      this.mostrarBotones = true;
    });
  }

  
  fnVerHistorialAsignaciones(row: ActivoDTO){
    this.spinner.show(); // Inicio de spinner

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(TiActivoAsignacionHistorialComponent, {
      width: '1200px',
      autoFocus: false,
      disableClose: true,
      //backdropClass: 'backdropBackground',
      data: {
        nIdActivo: row.nIdActivo,
        sTipoActivo: row.sTipo,
        sCodigo: row.sCodActivo
      }
    });

    dialogRef.beforeClosed().subscribe(result => {
      this.mostrarBotones = true;
    });
  }

  fnDialogExcelDescuentos(){
    this.spinner.show(); // Inicio de spinner

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(TiActivoDescuentosPersonalComponent, {
      width: '1200px',
      autoFocus: false,
      disableClose: true,
      //backdropClass: 'backdropBackground',
      data: {}
    });

    dialogRef.beforeClosed().subscribe(result => {
      this.mostrarBotones = true;
    });
  }

  fnDialogExcelAsignaciones(){
    this.spinner.show(); // Inicio de spinner

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(TiActivoAsignacionExcelComponent, {
      width: '1200px',
      autoFocus: false,
      disableClose: true,
      //backdropClass: 'backdropBackground',
      data: {}
    });

    dialogRef.beforeClosed().subscribe(result => {
      this.mostrarBotones = true;
    });
  }

  //#endregion


}
