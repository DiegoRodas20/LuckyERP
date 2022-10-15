import { CdkVirtualForOf } from '@angular/cdk/scrolling';
import { ChangeDetectorRef, Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { ScannerComponent } from 'src/app/modulos/almacen/inventario/inventario-central/scanner/scanner.component';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ActivoCaracteristicasDTO, ActivoCodigoLaptopDesktopDTO, ActivoDesktopTIDTO, ActivoDetalleAddendaDTO, ActivoDetalleDesktopDTO, ActivoLaptopDesktopTIDTO, ActivoRegistroDesktopDTO, ActivoRegistroDTO, ActivoSelectItemAddendaDTO, ActivoSelectItemArticuloDTO, ActivoSelectItemDTO } from '../../api/models/activoDTO';
import { WebApiResponse } from '../../api/models/apiResponse';
import { ActivoService } from '../../api/services/activo.service';
import { TiActivoLaptopDesktopExcelComponent } from './ti-activo-laptop-desktop-excel/ti-activo-laptop-desktop-excel.component';
import { TiActivoRepotenciacionComponent } from './ti-activo-repotenciacion/ti-activo-repotenciacion.component';

@Component({
  selector: 'app-ti-ingreso-inventario-laptop-desktop',
  templateUrl: './ti-ingreso-inventario-laptop-desktop.component.html',
  styleUrls: ['./ti-ingreso-inventario-laptop-desktop.component.css'],
  animations: [asistenciapAnimations]
})
export class TiIngresoInventarioLaptopDesktopComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables auxiliares
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada
  tipoActivo = 0; // Guardamos el tipo de activo para el registro
  nIdActivo = 0; // El Id del Activo para ver el detalle
  nIdEstado = 0; // El Id del Estado del Activo

  // Variables del chip (Componentes)
  chipElementsComponentes: ActivoCaracteristicasDTO[] = [];

  // Formulario
  formLaptopDesktop: FormGroup;

  // Combobox
  listaProveedores: ActivoSelectItemDTO[] = [];
  listaAddendas: ActivoSelectItemAddendaDTO[] = [];
  listaArticulos: ActivoSelectItemArticuloDTO [] = [];

  // Mat-Table (Desktop)
  dataSource: MatTableDataSource<ActivoDetalleDesktopDTO>;
  listaDetalleActivosDesktop: ActivoDetalleDesktopDTO[] = [];
  displayedColumns: string[] = ["sTipoParte", "sArticulo", "sNumeroParte", "sSerie", "sImagen"];
  @ViewChild('inputModificaTabla', { static: false }) inputModificaTabla: ElementRef;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'save', tool: 'Guarda Activo', state: false, color: 'secondary'},
    {icon: 'edit', tool: 'Editar Activo', state: false, color: 'secondary'},
    {icon: 'close', tool: 'Cancelar', state: false, color: 'secondary'},
    {icon: 'image', tool: 'Ver imagen', state: false, color: 'secondary'},
    {icon: 'cloud_upload', tool: 'Adición multiple', state: false, color: 'secondary'},
    {icon: 'assignment', tool: 'Cargas Pendientes', state: true, color: 'secondary'},
    {icon: 'thumb_down_alt', tool: 'Dar de baja', state: true, color: 'secondary'},
    {icon: 'settings', tool: 'Repotenciar Activo', state: true, color: 'secondary'},
    {icon: 'exit_to_app', tool: 'Salir', state: true, color: 'secondary'}
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Flags
  estaEditando = false; // Flag para activar/desactivar el modo edicion
  estaCreando = false; // Flag para activar/desactivar el modo creacion
  tieneImagen = false;
  tieneImagenTabla = false;

  // Variables en memoria
  titulo = "";
  tituloPanelTabla = "";
  imagenActual;
  numeroCodigoActual; // Numero del codigo (Sin prefijo) para llenado automatico de excels
  prefijoCodigoActual; // Prefijo para llenado automatico de excels
  registroAModificar = { // Seleccion de registro a modificar
    sSerie: null,
    sNumeroParte: null
  };

  // Variables para dialog
  private dialogRef = null;
  private data;
  modoDialog = false;

  @ViewChild("tablePanel") tablePanel: MatExpansionPanel;
  @ViewChild("formPanel") formPanel: MatExpansionPanel;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private _activoService: ActivoService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog, // Declaracion del Dialog
    private injector: Injector
  ) { 
    // Crear formulario
    this.fnCrearFormulario();

    // Injectar en caso de querer usar como Dialog
    this.dialogRef = this.injector.get(MatDialogRef, null);
    this.data = this.injector.get(MAT_DIALOG_DATA, null);

    // Si se abre de un modal
    if(this.data){
      this.modoDialog = true;
      this.tipoActivo = this.data.tipoActivo;
      this.nIdActivo = this.data.nIdActivo;
      this.titulo = `Detalle del Activo`
    }
    // Si se abre como pagina
    else{
      this.tipoActivo = Number(this.activatedRoute.snapshot.paramMap.get('idTipoActivo'));
      this.nIdActivo = Number(this.activatedRoute.snapshot.paramMap.get('idActivo'));
      this.titulo = `Ingreso de inventario - ${this.tipoActivo == 2500 ? 'Laptop' : (this.tipoActivo == 2501 ? 'Desktop' : '')}`; 
    }

    this.tituloPanelTabla = `Partes - ${this.tipoActivo == 2500 ? 'Laptop' : (this.tipoActivo == 2501 ? 'Desktop' : '')}`;

    // Inicializar tablas
    this.dataSource = new MatTableDataSource(this.listaDetalleActivosDesktop);
  }

  async ngOnInit(): Promise<void> {
    !this.data ? this.spinner.show() : null; // Inicializar el spinner solo si no es un Dialog

    this.onToggleFab(1, -1);
    
    // Si no hay tipo de activo o el tipo de activo no corresponde, redireccionas a la tabla princiapl
    if(this.tipoActivo == 0 || (this.tipoActivo != 2500 && this.tipoActivo != 2501)){
      this.fnSalir();
    }

    // Llenado de controles
    await this.fnLlenarComboboxProveedores();
    

    // Seleccionar modo detalle o modo creacion
    if(this.nIdActivo){
      // Visualizacion del detalle
      const existeActivo = await this.fnModoVerDetalle();
      // Si no existe el activo, volvemos a la tabla principal
      !existeActivo ? this.fnSalir() : null;
    }
    else{
      // Creacion de activo
      this.fnModoCreacionActivo();
    }

    this.estaCargado = true;

    this.spinner.hide();
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

      // Crear o modificar dependiendo de si es un laptop o desktop
        if(this.estaCreando){
          if(this.tipoActivo == 2500){
            await this.fnCrearActivoLaptop()
          }
          else if(this.tipoActivo == 2501){
            await this.fnCrearActivoDesktop()
          }
        }
        else{
          if(this.tipoActivo == 2500){
            await this.fnGuardarActivoLaptop()
          }
          else if(this.tipoActivo == 2501){
            await this.fnGuardarActivoDesktop()
          }
        }
        break;
      case 1:
        this.fnModoEditar();
        break;
      case 2:
        this.fnCancelar();
        break;
      case 3:
        this.fnVerImagen();
        break;
      case 4:
        this.fnAdicionMultiple(1);
        break;
      case 5:
        this.fnAdicionMultiple(2);
        break;
      case 6:
        this.fnDarBaja();
        break;
      case 7:
        this.fnRepotenciarActivo();
        break;
      case 8:
        this.fnSalir();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){

    this.fbLista[0].state = (this.estaEditando || this.estaCreando)  && this.nIdEstado != 2591;
    this.fbLista[1].state = (!this.estaEditando)  && this.nIdEstado != 2591;
    this.fbLista[2].state = (this.estaEditando)  && this.nIdEstado != 2591;
    this.fbLista[3].state = this.tieneImagen;
    this.fbLista[4].state = this.estaCreando;
    this.fbLista[5].state = this.estaCreando;
    this.fbLista[6].state = this.nIdEstado == 2587 || this.nIdEstado == 2589; // En stock = 2587 o es stock provincia = 2589
    this.fbLista[7].state = !this.estaCreando && this.nIdEstado != 2592;
    this.fbLista[8].state = true;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Formulario

  fnCrearFormulario() {
    this.formLaptopDesktop = this.fb.group(
      {
        proveedor: [null, Validators.compose([Validators.required])],
        addenda: [null, Validators.compose([Validators.required])],
        cantidadPendiente: [null],
        fechaInicio: [null],
        fechaFin: [null],
        codigoEquipo: [null],
        articulo: [null, Validators.compose([Validators.required])],
        partNumber: [null],
        numeroSerie: [null, Validators.compose([Validators.required])],
        productKey: [null],

        fechaAlta: [new Date(), Validators.compose([Validators.required])],
        fechaBaja: [null], // Agregando un dia al dia actual en milisegundos

        // Auditoria
        usuarioCreacion: null,
        fechaCreacion: null,
        usuarioModificacion: null,
        fechaModificacion: null,
        usuarioBaja: null,
        estado: null,
      }
    );
  }

  //#endregion

  //#region Controles

  async fnLlenarComboboxProveedores(){
    try{
      const result = await this._activoService.GetAllProveedores();
      this.listaProveedores = result.response.data;
    }
    catch(err){
      console.log(err);
    }
  }

  async fnLlenarComboboxAddendas(tipo: Number){
    try{
      this.spinner.show();
      const nIdProveedor = this.formLaptopDesktop.get("proveedor").value;
      // El tipo de dispositivo depende del tipo de activo
      // Activo Laptop / 2500 => Tipo Dispotivo => 2516
      // Activo Desktop / 2501 => Tipo Dispotivo => 2517
      const nIdTipoDispositivo = this.tipoActivo == 2500 ? 2516 : (this.tipoActivo == 2501 ? 2517 : 0);
      
      if(nIdTipoDispositivo){
        const result = await this._activoService.GetAllAddendasByProveedor(nIdProveedor, nIdTipoDispositivo);
        this.listaAddendas = result.response.data;

        if(tipo == 1) { // Esta editando / creando
          // Limpiar controlador
          this.formLaptopDesktop.get("addenda").setValue(null);
          await this.fnLimpiarDetalleComboboxAddendas();
        }
      }
      tipo == 1 ? this.spinner.hide() : null; // Si se esta editando, no ocultar el spinner
    }
    catch(err){
      console.log(err);
    }
  }

  async fnActualizarDetallesComboboxAddendas(){
    this.spinner.show();
    await this.fnDetalleComboboxAddendas();
    await this.fnLlenarComboboxArticulos(1);
    this.spinner.hide();
  }

  async fnDetalleComboboxAddendas(){
    try{
      const nIdAddenda = this.formLaptopDesktop.get("addenda").value;
      // El tipo de dispositivo depende del tipo de activo
      // Activo Laptop / 2500 => Tipo Dispotivo => 2516
      // Activo Desktop / 2501 => Tipo Dispotivo => 2517
      const nIdTipoDispositivo = this.tipoActivo == 2500 ? 2516 : (this.tipoActivo == 2501 ? 2517 : 0);
      
      if(nIdAddenda && nIdTipoDispositivo){
        const result = await this._activoService.GetDetalleByAddenda(nIdAddenda, nIdTipoDispositivo);
        const detalle: ActivoDetalleAddendaDTO = result.response.data[0]
        this.formLaptopDesktop.patchValue({
          cantidadPendiente: detalle.sCantidad,
          fechaInicio: detalle.dFechaInicio,
          fechaFin: detalle.dFechaFin
        })
      }
    }
    catch(err){
      console.log(err);
    }
  }

  async fnLimpiarDetalleComboboxAddendas(){
    this.formLaptopDesktop.patchValue({
      cantidadPendiente: null,
      fechaInicio: null,
      fechaFin: null,
      articulo: null
    })
    // Limpiamos los articulos
    this.listaArticulos = [];
    // Limpiamos los subArticulos de la tabla
    this.listaDetalleActivosDesktop.map(detalle => {
      detalle.nIdArticulo = 0;
      detalle.sArticulo = null;
      detalle.sRutaArchivo = null;
      detalle.sNumeroParte = null;
    })

    // Limpiamos las caracteristicas del articulo y el part number
    await this.fnLlenarChipListCaracteristicasArticulo();
    // Desactivamos la columna de las imagenes
    this.tieneImagenTabla = false;
  }

  async fnLlenarComboboxArticulos(tipo: number){
    try{

      if(tipo == 1){
        this.formLaptopDesktop.get("articulo").setValue(null);
        // Limpiamos la tabla
        this.listaDetalleActivosDesktop.map(detalle => {
          detalle.nIdArticulo = 0;
          detalle.sArticulo = null;
          detalle.sRutaArchivo = null;
          detalle.sNumeroParte = null;
        })
        await this.fnLlenarChipListCaracteristicasArticulo();

        this.tieneImagenTabla = false;
      }

      const nIdAddenda = this.formLaptopDesktop.get("addenda").value;
      // El tipo de dispositivo depende del tipo de activo
      // Activo Laptop / 2500 => Tipo Dispotivo => 2516
      // Activo Desktop / 2501 => Tipo Dispotivo => 2517
      const nIdTipoDispositivo = this.tipoActivo == 2500 ? 2516 : (this.tipoActivo == 2501 ? 2517 : 0);
      
      if(nIdTipoDispositivo){
        const result = await this._activoService.GetAllArticulosByAddenda(nIdAddenda, nIdTipoDispositivo);
        this.listaArticulos = result.response.data;

        // Si solo hay un articulo en la Addenda, seleccionamos ese unico articulo
        if(this.listaArticulos.length == 1){
          this.formLaptopDesktop.get("articulo").setValue(this.listaArticulos[0].nId);
          await this.fnLlenarChipListCaracteristicasArticulo();
          await this.fnActualizarTablaDetalleDesktop(2);
        }
      }
    }
    catch(err){
      console.log(err);
    }
  }

  // Al seleccionar el Articulo dispositivo (Dispositivo laptop / desktop), se muestran los componentes
  // Tambien se llena el campo de partNumber
  async fnLlenarChipListCaracteristicasArticulo(){

    try{
      const nIdArticulo = Number(this.formLaptopDesktop.get("articulo").value);

      if(nIdArticulo) {
        const result = await this._activoService.GetAllCaracteristicas(nIdArticulo);
        this.chipElementsComponentes = result.response.data;

        const articuloSeleccionado = this.listaArticulos.find(articulo => articulo.nId == nIdArticulo);
        this.formLaptopDesktop.get("partNumber").setValue(articuloSeleccionado.sNumeroParte);

        // Si el activo tiene id, se busca tambien las caracteristicas de sus activos repotenciadores
        if(this.nIdActivo != null && this.nIdActivo != 0){

          const resultRepotenciacion = await this._activoService.GetAllCaracteristicasRepotenciacion(this.nIdActivo);
          const chipsRepotenciacion = resultRepotenciacion.response.data;

          // Unimos las caracteristicas de repotenciacion al chiplist
          this.chipElementsComponentes = this.chipElementsComponentes.concat(chipsRepotenciacion);

          // Ordenamos las caracteristicas alfabeticamente
          this.chipElementsComponentes = Array.from(this.chipElementsComponentes).sort((a, b) => (a.sDescripcion > b.sDescripcion) ? 1 : ((b.sDescripcion > a.sDescripcion) ? -1 : 0))
        }
      }
      else{
        this.chipElementsComponentes = [];
        this.formLaptopDesktop.get("partNumber").setValue(null);
      }
      
    }
    catch(err){
      console.log(err);
    }
  }

  fnRecuperarFotoArticulo(){
    
    const articuloLaptopDesktop = this.formLaptopDesktop.get("articulo").value;

    this.imagenActual = this.listaArticulos.find((articulo)=> articulo.nId == articuloLaptopDesktop).sRutaArchivo;

    this.tieneImagen = true;
    
    this.fnControlFab();
  }

  fnBloquearControles(): void {
    this.estaEditando = false;
    Object.values(this.formLaptopDesktop.controls).forEach(control => { control.disable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  fnDesbloquearControles(): void {
    this.estaEditando = true;
    Object.values(this.formLaptopDesktop.controls).forEach(control => { control.enable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  //#endregion

  //#region Tabla (Detalle Desktop)

  async fnLlenarTablaDetalleDesktop(tipo: number){

    /**
     * Tipo 1 = Llenar tabla con campos vacios (Modo creacion)
     * Tipo 2 = Llenar tabla con el detalle (Modo edicion)
     */
    if(tipo == 1){
      const partesDesktop = (await this._activoService.GetAllPartesDesktop()).response.data;
      const listaDetalle: ActivoDetalleDesktopDTO[] = []

      partesDesktop.map((parte: ActivoSelectItemDTO) =>{
        const itemDetalle: ActivoDetalleDesktopDTO = {
          nIdDetActivo: 0,
          nIdActivo: 0,
          nIdArticulo: 0,
          nIdTipoParte: parte.nId,
          sTipoParte: parte.sDescripcion,
          sArticulo: '',
          sSerie: '',
          sNumeroParte: '',
          sRutaArchivo: ''
        }
        listaDetalle.push(itemDetalle)
      })

      this.listaDetalleActivosDesktop = listaDetalle;

      this.fnCrearTablaDetalleDesktop();
    }
    else if(tipo == 2){

      this.listaDetalleActivosDesktop = (await this._activoService.GetDetalleDesktopByActivo(this.nIdActivo)).response.data;

      this.fnCrearTablaDetalleDesktop();
    }
  }

  fnCrearTablaDetalleDesktop(){
    this.dataSource.data = this.listaDetalleActivosDesktop;
  }

  async fnActualizarTablaDetalleDesktop(tipo: number) {

    this.spinner.show();

    // Recuperamos los sub articulos ligados al articulo principal escogido de la Addenda
    const articuloSeleccionado = Number(this.formLaptopDesktop.get("articulo").value);
    const articulo = this.listaArticulos.find((articuloItem) => articuloItem.nId = articuloSeleccionado);

    const result = await this._activoService.GetAllSubArticulosDesktop(articulo.nIdDetAddenda);

    if(result.success){

      if(this.tipoActivo == 2501){
    
        // Si se encuentran articulos, remplazamos todos los campos articulo de la tabla
        
        const listaSubArticulo = result.response.data;
        this.listaDetalleActivosDesktop.map(detalle => {
  
          const subArticulo = listaSubArticulo.find(sub => sub.sTipoParte == detalle.sTipoParte);
  
          detalle.nIdArticulo = subArticulo.nIdArticulo;
          detalle.sArticulo = subArticulo.sArticulo;
          detalle.sRutaArchivo = subArticulo.sRutaArchivo
          detalle.sNumeroParte = subArticulo.sNumeroParte;
        })

        this.tieneImagenTabla = true;
    
        this.fnCrearTablaDetalleDesktop();
        
      }
      else if(this.tipoActivo == 2500) {
        this.listaDetalleActivosDesktop = result.response.data;

        this.tieneImagenTabla = true;

        this.fnCrearTablaDetalleDesktop();
      }
    }

    tipo == 1 ? this.spinner.hide() : null; // Si se esta editando, no ocultar el spinner;
  }

  /**
   * Modificacion de campos
   * Tipo 1: Cambiar el estado de numero de serie
   * Tipo 2: Cambiar el estado de part-number
   */

  fnModificarCampo(registro, tipo: number){
    if(this.estaCreando || this.estaEditando){
      tipo == 1 ? this.registroAModificar.sSerie = registro : null;
      tipo == 2 ? this.registroAModificar.sNumeroParte = registro : null;
      setTimeout(() => this.inputModificaTabla.nativeElement.focus());
    }
  }

  async fnGuardarCampoSerie (registro, valor: string){

    // Recuperamos el indice
    let indice = this.listaDetalleActivosDesktop.indexOf(registro);

    if(this.registroAModificar.sSerie == registro){
      this.registroAModificar.sSerie = null;
    }
    else {
      return;
    }

    // Validamos que el numero de serie no exista
    if(!await this.fnValidarNumeroSerie(valor)){
      return;
    }

    // Validar que no haya numero de serie repetido
    for(let [index, detalle] of this.listaDetalleActivosDesktop.entries()){
      if(detalle.sSerie == valor && index != indice && (valor != null && valor != '')){
        Swal.fire("Alerta", "No puede haber campos repetidos del numero de serie en el detalle", "warning");
        return;
      }
    }

    // Guardar el valor en el indice recuperado del registro seleccionado
    this.listaDetalleActivosDesktop[indice].sSerie = valor;
    this.fnCrearTablaDetalleDesktop();
  }

  async fnGuardarPartNumber (registro, valor: string){

    // Recuperamos el indice
    let indice = this.listaDetalleActivosDesktop.indexOf(registro);

    if(this.registroAModificar.sNumeroParte == registro){
      this.registroAModificar.sNumeroParte = null;
    }
    else {
      return;
    }

    // Validamos que el part number no exista
    if(!await this.fnValidarPartNumber(valor)){
      return;
    }

    // Validar que no haya numero de serie repetido
    for(let [index, detalle] of this.listaDetalleActivosDesktop.entries()){
      if(detalle.sNumeroParte == valor && index != indice && (valor != null && valor != '')){
        Swal.fire("Alerta", "No puede haber campos repetidos del part number en el detalle", "warning");
        return;
      }
    }

    // Guardar el valor en el indice recuperado del registro seleccionado
    this.listaDetalleActivosDesktop[indice].sNumeroParte = valor;
    this.fnCrearTablaDetalleDesktop();
  }

  async fnValidarPartNumber(partNumber: string){
    const validation = await this._activoService.ValidatePartNumber(partNumber);
    if(!validation.success){
      let mensaje = validation.errors.map(item => {
        return item.message
      })
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: mensaje.join(', '),
      });
      this.spinner.hide();
      return false;
    }

    return true;
  }

  async fnValidarNumeroSerie(numeroSerie: string){
    const validation = await this._activoService.ValidateNumeroSerie(numeroSerie);
    if(!validation.success){
      let mensaje = validation.errors.map(item => {
        return item.message
      })
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: mensaje.join(', '),
      });
      this.spinner.hide();
      return false;
    }

    return true;
  }

  async fnValidarTablaDetalleDesktop(): Promise<boolean>{
    return new Promise((resolve, reject) => {
      for(let detalleActivo of this.listaDetalleActivosDesktop){
        if(detalleActivo.sSerie == null || detalleActivo.sSerie ==  ''){
          resolve(false);
        }
        else if(detalleActivo.sNumeroParte == null || detalleActivo.sNumeroParte ==  ''){
          resolve(false);
        }
      }
      resolve(true);
    })
  }

  fnVerImagenTabla(row: ActivoDetalleDesktopDTO){

    if(row.sArticulo != null && row.sArticulo != ''){
      // Obtenemos el codigo y el nombre del articulo
      const descripcionArticulo = row.sArticulo;
      const codigoArticulo = descripcionArticulo.split(' ')[0];
      const nombreArticulo = descripcionArticulo.slice(codigoArticulo.length + 2, descripcionArticulo.length);
      const urlImagen = row.sRutaArchivo == '' || row.sRutaArchivo == null ? '/assets/img/SinImagen.jpg' : row.sRutaArchivo
      
      Swal.fire({ title: codigoArticulo, text: nombreArticulo, imageUrl: urlImagen, imageHeight: 250 });
    }
  }

  //#endregion

  //#region Inicializacion

  // Activar el modo de creacion del activo
  async fnModoCreacionActivo(){

    this.estaCreando = true;
    this.tieneImagen = false;
    this.tieneImagenTabla = false;
    this.fnDesbloquearControles();

    this.formLaptopDesktop.patchValue({
      usuarioCreacion: this.storageData.getLoginUsuario(),
      fechaCreacion: moment(new Date()).format("DD/MM/YYYY, h:mm:ss"),
      estado: 'Pendiente'
    })
    
    this.formLaptopDesktop.get("fechaBaja").disable(); // Deshabilitar la fecha de baja

    if(this.tipoActivo == 2501){
      this.formLaptopDesktop.get("partNumber").clearValidators();
      this.formLaptopDesktop.get("partNumber").updateValueAndValidity();
      this.formLaptopDesktop.get("numeroSerie").clearValidators();
      this.formLaptopDesktop.get("numeroSerie").updateValueAndValidity();
    }

    // Llenar tabla del detalle si es desktop
    if(this.tipoActivo == 2501){
      await this.fnLlenarTablaDetalleDesktop(1);
    }

    this.fnControlFab();
  }

  // Activar el modo de vista previa
  async fnModoVerDetalle(){

    const result: WebApiResponse<ActivoRegistroDTO> = (await this._activoService.GetActivoById(this.nIdActivo));

    // Si no encuentra el activo o es un activo de tipo diferente, da error y no continua
    if (!result.success || (result.response.data[0].nIdTipo != 2500 && result.response.data[0].nIdTipo != 2501)) {
      this.spinner.hide();
      Swal.fire({icon: 'warning', title: 'Advertencia', text: 'No se encontró el activo'});
      return false;
    }

    const data = result.response.data[0];

    this.estaCreando = false;
    this.tieneImagenTabla = true;
    this.fnBloquearControles();

    this.formLaptopDesktop.patchValue({
      proveedor: data.nIdProveedor,
      codigoEquipo: data.sCodActivo,
      numeroSerie: data.sSerie,
      productKey: data.nProductoKey,
      fechaAlta: data.dFechaAlta,
      fechaBaja: data.dFechaBaja,

      // Auditoria
      usuarioCreacion: data.sNombreUsuarioCrea,
      fechaCreacion: moment(data.dFechaCrea).format("DD/MM/YYYY, h:mm:ss"),
      usuarioModificacion: data.sNombreUsuarioModifica,
      fechaModificacion: moment(data.dFechaModifica).format("DD/MM/YYYY, h:mm:ss"),
      usuarioBaja: data.sNombreUsuarioBaja,
      estado: data.sEstado,
    })

    this.nIdEstado = data.nIdEstado;
    console.log(this.nIdEstado);

    // Llenado de combobox en cascada addendas (detalle)
    await this.fnLlenarComboboxAddendas(2);
    this.formLaptopDesktop.patchValue({
      addenda: data.nIdAddenda,
    })

    // Llenado de combobox en cascada articulos (detalle)
    await this.fnLlenarComboboxArticulos(2);
    this.formLaptopDesktop.patchValue({
      articulo: data.nIdArticulo,
    })
    await this.fnDetalleComboboxAddendas();
    await this.fnLlenarChipListCaracteristicasArticulo();
    this.fnRecuperarFotoArticulo();

    if(this.tipoActivo == 2501){
      this.formLaptopDesktop.get("partNumber").clearValidators();
      this.formLaptopDesktop.get("partNumber").updateValueAndValidity();
      this.formLaptopDesktop.get("numeroSerie").clearValidators();
      this.formLaptopDesktop.get("numeroSerie").updateValueAndValidity();
    }

    // Llenamos la tabla del detalle solo si es desktop
    if(this.tipoActivo == 2501){
      await this.fnLlenarTablaDetalleDesktop(2);
    }
    else{
      await this.fnActualizarTablaDetalleDesktop(2);
    }

    this.fnControlFab();

    return true;
  }

  // Activar el modo de edicion
  fnModoEditar(){
    this.fnDesbloquearControles();
  }

  //#endregion

  //#region Acciones

  async fnCrearActivoLaptop(){

    if(this.formLaptopDesktop.valid){

      const data = this.formLaptopDesktop.value;
      const tipoActivo = this.tipoActivo == 2500 ? 'Laptop' : (this.tipoActivo == 2501 ? 'Desktop' : '');

      const confirma = await Swal.fire({
        title: '¿Desea guardar el activo?',
        html: `Se creará el activo (${tipoActivo})`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      });
  
      if (!confirma.isConfirmed) {
        return;
      }
      
      const model: ActivoLaptopDesktopTIDTO = {
        nIdActivo: 0,
        nIdTipo: this.tipoActivo,
        nIdAddenda: data.addenda,
        nIdArticulo: data.articulo,
        sCodActivo: data.codigoEquipo,
        sNumeroParte: data.partNumber,
        sSerie: data.numeroSerie,
        dFechaAlta: data.fechaAlta,
        dFechaBaja: data.fechaBaja,
        nIdUsuarioCrea: this.storageData.getUsuarioId(),
        dFechaCrea: moment(data.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
        nIdUsuarioModifica: this.storageData.getUsuarioId(),
        dFechaModifica: moment(data.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
        nIdEstado: 1
      }

      try{

        this.spinner.show();

        if(!await this.fnValidarCantidadPendiente()){
          await this.fnDetalleComboboxAddendas();
          this.spinner.hide();
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Ya no hay articulos disponibles de la addenda',
          });
          return;
        }

        const result: WebApiResponse<ActivoRegistroDTO> = (await this._activoService.CreateActivoLaptopDesktop(model));

        if (!result.success) {
          let mensaje = result.errors.map(item => {
            return item.message
          })
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: mensaje.join(', '),
          });
          this.spinner.hide();
          return;
        }
  
        const activoResponse: ActivoRegistroDTO = result.response.data[0];

        this.formLaptopDesktop.markAsUntouched();
        
        this.spinner.hide();

        Swal.fire({
          icon: 'success',
          title: ('Correcto'),
          text: 'Se creó el registro',
          showConfirmButton: true
        });
  
        // Recargar la pagina para ver el detalle
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', this.tipoActivo ,tipoActivo.toLowerCase(), activoResponse.nIdActivo]);  
    
        
      }
      catch(err){
        console.log(err);
      }
    }
    else{
      this.formLaptopDesktop.markAllAsTouched();
    }

    this.fnControlFab();

  }

  async fnGuardarActivoLaptop(){

    if(this.formLaptopDesktop.valid){

      const data = this.formLaptopDesktop.value;
      const tipoActivo = this.tipoActivo == 2500 ? 'Laptop' : (this.tipoActivo == 2501 ? 'Desktop' : '');

      const confirma = await Swal.fire({
        title: '¿Desea guardar el activo?',
        html: `Se modificará el activo (${tipoActivo}) del dispositivo`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      });
  
      if (!confirma.isConfirmed) {
        return;
      }
      
      const model: ActivoLaptopDesktopTIDTO = {
        nIdActivo: this.nIdActivo,
        nIdTipo: this.tipoActivo,
        nIdAddenda: data.addenda,
        nIdArticulo: data.articulo,
        sCodActivo: data.codigoEquipo,
        sNumeroParte: data.partNumber,
        sSerie: data.numeroSerie,
        dFechaAlta: data.fechaAlta,
        dFechaBaja: data.fechaBaja,
        nIdUsuarioCrea: this.storageData.getUsuarioId(),
        dFechaCrea: moment(data.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
        nIdUsuarioModifica: this.storageData.getUsuarioId(),
        dFechaModifica: moment(data.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
        nIdEstado: this.nIdEstado == 2592 ? 2587 : this.nIdEstado
      }

      try{

        this.spinner.show();

        const result: WebApiResponse<ActivoRegistroDTO> = (await this._activoService.UpdateActivoLaptopDesktop(model));

        if (!result.success) {
          let mensaje = result.errors.map(item => {
            return item.message
          })
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: mensaje.join(', '),
          });
          this.spinner.hide();
          return;
        }
  
        // Volver a modo detalle para ver vista previa
        await this.fnModoVerDetalle();  

        this.spinner.hide();

        Swal.fire({
          icon: 'success',
          title: ('Correcto'),
          text: 'Se actualizó el registro',
          showConfirmButton: false,
          timer: 1500
        });
    
        this.formLaptopDesktop.markAsUntouched();
      }
      catch(err){
        console.log(err);
      }
      
    }
    else{
      this.formLaptopDesktop.markAllAsTouched();
    }

    this.fnControlFab();
  }

  async fnCrearActivoDesktop(){
    if(this.formLaptopDesktop.valid){

      // Validamos la cantidad de articulos pendientes de la addenda
      if(!await this.fnValidarCantidadPendiente()){
        await this.fnDetalleComboboxAddendas();
        this.spinner.hide();
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Ya no hay articulos disponibles de la addenda',
        });
        return;
      }

      // Validamos si la tabla detalle ha sido llenada apropiadamente
      if(!await this.fnValidarTablaDetalleDesktop()){
        this.spinner.hide();
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Falta llenar campos en el detalle del activo',
        });
        // Abrir formulario
        this.formPanel.close();
        this.tipoActivo == 2501 ? this.tablePanel.open() : null;
        return;
      }

      const data = this.formLaptopDesktop.value;
      const tipoActivo = this.tipoActivo == 2500 ? 'Laptop' : (this.tipoActivo == 2501 ? 'Desktop' : '');

      const confirma = await Swal.fire({
        title: '¿Desea guardar el activo?',
        html: `Se creará el activo (${tipoActivo})`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      });
  
      if (!confirma.isConfirmed) {
        return;
      }
      
      const model: ActivoDesktopTIDTO = {
        nIdActivo: 0,
        nIdTipo: this.tipoActivo,
        nIdAddenda: data.addenda,
        nIdArticulo: data.articulo,
        sCodActivo: data.codigoEquipo,
        dFechaAlta: data.fechaAlta,
        dFechaBaja: data.fechaBaja,
        nProductoKey: data.productKey,
        nIdUsuarioCrea: this.storageData.getUsuarioId(),
        dFechaCrea: moment(data.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
        nIdUsuarioModifica: this.storageData.getUsuarioId(),
        dFechaModifica: moment(data.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
        nIdEstado: 2587,
        detalle: this.listaDetalleActivosDesktop
      }

      try{

        this.spinner.show();

        const result: WebApiResponse<ActivoRegistroDesktopDTO> = (await this._activoService.CreateActivoDesktop(model));

        if (!result.success) {
          let mensaje = result.errors.map(item => {
            return item.message
          })
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: mensaje.join(', '),
          });
          this.spinner.hide();
          return;
        }
  
        const activoResponse: ActivoRegistroDesktopDTO = result.response.data[0];

        this.formLaptopDesktop.markAsUntouched();
        
        this.spinner.hide();

        Swal.fire({
          icon: 'success',
          title: ('Correcto'),
          text: 'Se creó el registro',
          showConfirmButton: true
        });
  
        // Recargar la pagina para ver el detalle
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', this.tipoActivo ,tipoActivo.toLowerCase(), activoResponse.nIdActivo]);  
    
        
      }
      catch(err){
        console.log(err);
      }
    }
    else{
      this.formLaptopDesktop.markAllAsTouched();
      this.formPanel.open();
      this.tipoActivo == 2501 ? this.tablePanel.close() : null;
    }

    this.fnControlFab();
  }

  async fnGuardarActivoDesktop(){
    if(this.formLaptopDesktop.valid){

      // Validamos si la tabla detalle ha sido llenada apropiadamente
      if(!await this.fnValidarTablaDetalleDesktop()){
        this.spinner.hide();
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Falta llenar campos en el detalle del activo',
        });
        this.formPanel.close();
        this.tipoActivo == 2501 ? this.tablePanel.open() : null;
        return;
      }

      const data = this.formLaptopDesktop.value;
      const tipoActivo = this.tipoActivo == 2500 ? 'Laptop' : (this.tipoActivo == 2501 ? 'Desktop' : '');

      const confirma = await Swal.fire({
        title: '¿Desea guardar el activo?',
        html: `Se modificará el activo (${tipoActivo}) del dispositivo`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      });
  
      if (!confirma.isConfirmed) {
        return;
      }
      
      const model: ActivoDesktopTIDTO = {
        nIdActivo: this.nIdActivo,
        nIdTipo: this.tipoActivo,
        nIdAddenda: data.addenda,
        nIdArticulo: data.articulo,
        sCodActivo: data.codigoEquipo,
        nProductoKey: data.productKey,
        dFechaAlta: data.fechaAlta,
        dFechaBaja: data.fechaBaja,
        nIdUsuarioCrea: this.storageData.getUsuarioId(),
        dFechaCrea: moment(data.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
        nIdUsuarioModifica: this.storageData.getUsuarioId(),
        dFechaModifica: moment(data.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
        nIdEstado: this.nIdEstado == 2592 ? 2587 : this.nIdEstado,
        detalle: this.listaDetalleActivosDesktop
      }

      try{

        this.spinner.show();

        const result: WebApiResponse<ActivoRegistroDesktopDTO> = (await this._activoService.UpdateActivoDesktop(model));

        if (!result.success) {
          let mensaje = result.errors.map(item => {
            return item.message
          })
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: mensaje.join(', '),
          });
          return;
        }
  
        // Volver a modo detalle para ver vista previa
        await this.fnModoVerDetalle();  

        this.spinner.hide();

        Swal.fire({
          icon: 'success',
          title: ('Correcto'),
          text: 'Se actualizó el registro',
          showConfirmButton: false,
          timer: 1500
        });
    
        this.formLaptopDesktop.markAsUntouched();
      }
      catch(err){
        console.log(err);
      }
      
    }
    else{
      this.formLaptopDesktop.markAllAsTouched();
      this.formPanel.open();
      this.tipoActivo == 2501 ? this.tablePanel.close() : null;
    }

    this.fnControlFab();
  }

  async fnValidarCantidadPendiente(){
    // Obtenemos las cantidades pendientes al crear
    const nIdAddenda = this.formLaptopDesktop.get("addenda").value;
    // El tipo de dispositivo depende del tipo de activo
    // Activo Laptop / 2500 => Tipo Dispotivo => 2516
    // Activo Desktop / 2501 => Tipo Dispotivo => 2517
    const nIdTipoDispositivo = this.tipoActivo == 2500 ? 2516 : (this.tipoActivo == 2501 ? 2517 : 0);
    const detalleAddenda: ActivoDetalleAddendaDTO = (await this._activoService.GetDetalleByAddenda(nIdAddenda, nIdTipoDispositivo)).response.data[0];
    const cantidadPendiente = Number(detalleAddenda.sCantidad.split(" ")[0]);

    return cantidadPendiente > 0
  }

  async fnCancelar(){

    const modo = this.estaCreando ? 'creación' : (this.estaEditando ? 'edición' : null); // Mostrar en el mensaje si se esta editando o creando

    if(modo){
      const confirma = await Swal.fire({
        title: `¿Desea cancelar la ${modo}?`,
        text: `Se perderán todos los cambios realizados`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      });
  
      if (!confirma.isConfirmed) {
        return;
      }
      else{
        if(this.estaCreando){
          this.fnSalir()
        }
        else if(this.estaEditando){
          this.spinner.show();
          await this.fnModoVerDetalle();
          this.spinner.hide();
        }
      }
    }
  }

  async fnAdicionMultiple(tipoAccion: number){
    this.spinner.show(); // Inicio de spinner

    const data = this.formLaptopDesktop.value;

    // Validar que los campos necesarios para la creacion del Excel esten llenos
    if((data.proveedor && data.addenda && data.articulo) || tipoAccion == 2){

      this.mostrarBotones = false; // Ocultar botones de opciones

      const proveedor = this.listaProveedores.find(proveedor => proveedor.nId == data.proveedor);
      const addenda = this.listaAddendas.find(addenda => addenda.nId == data.addenda);
      const articulo = this.listaArticulos.find(articulo => articulo.nId == data.articulo);
      const codigoArticulo = articulo ? articulo.sDescripcion.split(" ")[0] : null;
      const descripcionArticulo = articulo ? articulo.sDescripcion.slice(codigoArticulo.length + 3, articulo.sDescripcion.length) : null;
      const cantidadPendiente = data.cantidadPendiente

      // Si no hay articulos disponibles en la addenda, no se puede crear una nueva carga
      if(cantidadPendiente){
        if(Number(data.cantidadPendiente.split(" ")[0]) == 0 && tipoAccion == 1){
          this.mostrarBotones = true;
          this.spinner.hide();
          Swal.fire("Alerta", "Ya no quedan artículos disponibles en esa Addenda", "warning")
          return;
        }
      }

      const dialogRef = this.dialog.open(TiActivoLaptopDesktopExcelComponent, {
        width: '1250px',
        autoFocus: false,
        disableClose: true,
        data: {

          // El nombre de los campos a llenar en el Excel
          excelActivo: {
            proveedor: proveedor ? proveedor.sDescripcion : null,
            addenda: addenda ? addenda.sDescripcion : null,
            tipoActivo: this.tipoActivo == 2500 ? 'Laptop' : (this.tipoActivo == 2501 ? 'Desktop' : ''),
            codigoArticulo: codigoArticulo,
            descripcionArticulo: descripcionArticulo,
            cantidadPendiente: cantidadPendiente ? Number(data.cantidadPendiente.split(" ")[0]) : null
          },
          nIdDetAddenda: articulo ? articulo.nIdDetAddenda : null,
          controlesActivo: data, // Los id de todos los campos a llenar
          tipoActivo: this.tipoActivo, // El tipo de activo para el tipo de insersion masiva
          partNumber: data.partNumber, // Part-Number para subida de laptop
          accion: tipoAccion // El tipo de accion (Si se va a crear una adicion masiva o subirla)
        }
      });

      dialogRef.componentInstance.validarFormulario.subscribe(() => {
        this.formLaptopDesktop.get("proveedor").markAsTouched();
        this.formLaptopDesktop.get("addenda").markAsTouched();
        this.formLaptopDesktop.get("cantidadPendiente").markAsTouched();
        this.formLaptopDesktop.get("articulo").markAsTouched();
      });

      dialogRef.beforeClosed().subscribe(async result => {
        if(result){

          // Si aun no se realiza la carga masiva, actualizamos el detalle de las addendas
          if(!result.cargaMasivaSubida){
            await this.fnDetalleComboboxAddendas();
          }
        }
        // Mostrar nuevamente los botones
        this.mostrarBotones = true;
      });
    }
    else{
      this.formLaptopDesktop.get("proveedor").markAsTouched();
      this.formLaptopDesktop.get("addenda").markAsTouched();
      this.formLaptopDesktop.get("articulo").markAsTouched();
      this.spinner.hide();
      Swal.fire("Alerta", "Faltan campos por llenar en el formulario principal", "warning");
    }
    
  }

  fnLeerCodigoBarras(row: ActivoDetalleDesktopDTO, tipo: number){
    const dialogRef = this.dialog.open(ScannerComponent, {
      width: '90%',
      height: '90%',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(async respuesta => {
      if (respuesta) {
        if (respuesta === false) {
          return;
        }

        // Actualizar part-number
        if(tipo == 1){
          row.sNumeroParte  = respuesta;
        }
        // Actualizar numero serie
        else if(tipo == 2){
          row.sSerie  = respuesta;
        }
      }
    });
  }

  fnVerImagen(){
    if(this.imagenActual != null && this.imagenActual != ''){
      const {
        articulo
      } = this.formLaptopDesktop.value;

      // Obtenemos el codigo y el nombre del articulo
      const descripcionArticulo = this.listaArticulos.find(articuloElement => articuloElement.nId == articulo).sDescripcion;
      const codigoArticulo = descripcionArticulo.split(' ')[0];
      const nombreArticulo = descripcionArticulo.slice(codigoArticulo.length + 2, descripcionArticulo.length);

      Swal.fire({ title: codigoArticulo, text: nombreArticulo, imageUrl: this.imagenActual, imageHeight: 250 });
    }
    else{
      Swal.fire({ icon: 'warning', title: ('No hay imagen'), text: `Este artículo no tiene imagen`});
    }
  }

  async fnDarBaja(){

    const confirma = await Swal.fire({
      title: '¿Desea dar de baja este activo?',
      text: `Esta acción no se puede revertir`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirma.isConfirmed) {
      return;
    }
    else{
      const sPais = this.storageData.getPais();
      const nIdUsuario = this.storageData.getUsuarioId();

      const model: ActivoRegistroDTO = {
        nIdActivo: this.nIdActivo,
        nIdUsuarioBaja: nIdUsuario,
        sPais: sPais,
      }
      await this._activoService.UpdateActivoDarBaja(model);

      // Volver a cargar el detalle
      await this.fnModoVerDetalle();
      this.spinner.hide();
    }
  }

  fnRepotenciarActivo(){

    this.mostrarBotones = false;

    const dialogRef = this.dialog.open(TiActivoRepotenciacionComponent, {
      width: '1250px',
      autoFocus: false,
      disableClose: true,
      data: {
        nIdActivo: this.nIdActivo,
        sCodActivo: this.formLaptopDesktop.get("codigoEquipo").value
      }
    });

    dialogRef.afterClosed().subscribe(async respuesta => {
      this.mostrarBotones = true;
      await this.fnLlenarChipListCaracteristicasArticulo();
    });
  }

  //#endregion

  // Salir a la tabla principal
  fnSalir(){
    this.route.navigate(['til/tecnologia/ti-ingreso-inventario/']);
  }

}
