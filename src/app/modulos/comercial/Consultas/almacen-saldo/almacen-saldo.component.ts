import { ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AlmacenSaldoService } from './almacen-saldo.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { DetalleSaldoComponent } from './detalle-saldo/detalle-saldo.component';
import moment from 'moment';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from '../../Asistencia/asistenciap/asistenciap.animations';

@Component({
  selector: 'app-almacen-saldo',
  templateUrl: './almacen-saldo.component.html',
  styleUrls: ['./almacen-saldo.component.css'],
  animations: [asistenciapAnimations]
})
export class AlmacenSaldoComponent implements OnInit {

  // Variables de sesion (LocalStorage)
  idEmpresa;
  idUsuario;
  idPais;
  estaCargado: boolean = false; // Variable para ver cuando la pagina este completamente cargada

  // Formulario
  formCabecera: FormGroup // Cabecera
  formSeleccionMultiple: FormGroup // Form de los checkbox a la hora de hacer seleccion multiple

  // Combobox
  familias = []
  almacenes = [];
  articulos = [];
  marcas = [];
  canales = [];

  // Perfiles
  idPerfil;
  lPerfilesInternos = [];
  esUnPerfilInterno: boolean; // Flag por si el perfil es un perfil interno o no para ocultar controles

  // Tabla
  dataSource:MatTableDataSource<any>;
  listaStockEnLinea = [];
  displayedColumns: string[] = ["kardex", "sAlmacenBase", "sCodAlmacen", "sCentroCosto", "sCanal", "sEjecutivo", "sCodArticulo", "sArticuloDescripcion", "nSaldo","sUnidadMedida", "sFechaVence", "sPrimerIngreso", "sTipoAlmacen", "sPagoAlmacen"];

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'search', tool: 'Buscar Saldos', state: true},
    {icon: 'ballot', tool: 'Seleccion múltiple', state: false},
    {icon: 'settings', tool: 'Ver detalle Kardex', state: false},
    {icon: 'text_snippet', tool: 'Generar Excel', state: false},
    {icon: 'store_mall_directory', tool: 'Ver almacenes satélite', state: false}, // Modo satelite temporalmente desactivado
    {icon: 'store_mall_directory', tool: 'Ver almacenes cliente', state: true},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('tableElement') tableElement: ElementRef;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla
  cbSeleccionarTodos = new FormControl() // Checkbox para seleccionar todos los items

  // Booleanos
  bMostrarSeleccionMultiple: boolean = false; // Indica si esta activa la opcion de seleccion multiple
  modoSatelite: boolean = false; // Indica si esta activa la posibilidad de ver almacenes satelite
  modoCliente: boolean = false; // Indica si esta activa la posibilidad de ver almacenes satelite

  constructor(private fb: FormBuilder,
              private almacenSaldoService: AlmacenSaldoService,
              @Inject('BASE_URL') private baseUrl: string,
              private dialog: MatDialog, // Declaracion del Dialog
              private spinner: NgxSpinnerService,
              protected _changeDetectorRef:ChangeDetectorRef )
  {}

  async ngOnInit(): Promise<void> {
    this.spinner.show();

    // Inicializando variables de sesion
    this.idEmpresa = localStorage.getItem("Empresa");
    const currentUserBase64 = localStorage.getItem("currentUser");
    this.idUsuario = JSON.parse(window.atob(currentUserBase64.split(".")[1])).uid;
    this.idPais = localStorage.getItem("Pais");

    this.crearFormularios();
    this.onToggleFab(1,-1);

    // Recuperamos los perfiles para esconder controles
    await this.fnListarPerfilesInternos()
    await this.fnRecuperarPerfilUsuario()
    this.fnOcultarControlesPerfilesInternos();

    // Llenamos los controles
    await this.llenarComboboxFamilia();
    await this.llenarComboboxAlmacen();
    await this.llenarComboboxCanal();
    await this.llenarComboboxMarca();
    await this.recuperarPresupuesto();

    // Inicializar tabla
    this.fnInicializarTabla();
    this.estaCargado = true;

    this.spinner.hide();
  }

  crearFormularios(){
    // Formulario de la cabecera
    this.formCabecera = this.fb.group({
      fechaActual: moment(new Date()).format("DD/MM/YYYY"),
      presupuesto: null,
      canal: null,
      familia: null,
      almacen: null,
      marca: null,
      articulo: null,
      estadoVencido: "0",
    });

    // Formulario de la seleccion multiple
    this.formSeleccionMultiple = this.fb.group({})
  }

  // Inicializar tabla
  fnInicializarTabla(){
    this.dataSource = new MatTableDataSource(this.listaStockEnLinea);
    this.dataSource.paginator = this.paginator;
  }
  //#region Botones

  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
  }

  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.modoSatelite ? this.llenarTablaModoSatelite() : this.llenarTabla(); // Si esta en modo satelite, cambia su forma de consulta de datos
        break;
      case 1:
        this.fnActivarSeleccionMultiple();
        break;
      case 2:
        this.fnOpenDialogKardex(0);
        break;
      case 3:
        this.modoSatelite ? this.fnGenerarExcelModoSatelite() : this.fnGenerarExcel();
        break;
      case 4:
        await this.fnActivarVistaAlmacenesSatelite();
        break;
      case 5:
        await this.fnActivarVistaAlmacenesCliente();
        break;
      default:
        break;
    }
  }

  fnControlFab(){

    /* El boton de buscar estara siempre activo por defecto */

    /**
     * 0. Boton busqueda
     * 1. Seleccion multiple
     * 2. Busqueda de multiples Kardex
     * 3. Generacion del Excel
     * 4. Ver almacenes satelite / principales
     * 5. Ver almacenes cliente / principales
     */

    // Si la lista esta llena, validamos que se muestre el boton de seleccion multiple y el del excel
    if(this.listaStockEnLinea.length > 0){

      // Si la seleccion multiple esta activa, alternamos entre el boton seleccion multiple y busqueda de multiples kardex
      if(this.bMostrarSeleccionMultiple){
        this.fbLista[1].state = false;
        this.fbLista[2].state = true;
      }
      else{
        this.fbLista[1].state = true;
        this.fbLista[2].state = false;
      }

      this.fbLista[3].state = true;
    }
    // Si la lista esta vacia, ocultamos todos los botones
    else{
      this.fbLista[1].state = false;
      this.fbLista[2].state = false;
      this.fbLista[3].state = false;
    }

    // Si no es un perfil interno
    if(!this.esUnPerfilInterno){
      // Si se esta en modo satelite, se cambiara el texto para ver almacenes principales
      if(this.modoSatelite){
        this.fbLista[4].tool = "Ver almacenes principales"
        this.fbLista[5].state = false // Desactivamos la opcion modo cliente
      }
      else if(this.modoCliente){
        this.fbLista[5].tool = "Ver almacenes principales"
        this.fbLista[4].state = false // Desactivamos la opcion modo satelite
      }
      else{
        this.fbLista[4].tool = "Ver almacenes satélite"
        this.fbLista[5].tool = "Ver almacenes cliente"
        this.fbLista[4].state = false // Modo satelite temporalmente desactivado
        this.fbLista[5].state = true
      }
    }
    else{
      this.fbLista[4].state = false;
      this.fbLista[5].state = false;
    }

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Llenado de Combobox (Modo normal)
  async llenarComboboxFamilia(){

    const pEntidad = 1; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 3;

    //Iniciarlizar Parametros
    pParametro.push(this.idPais);
    pParametro.push(this.esUnPerfilInterno ? 1 : 0); // Indicamos si es un perfil de la lista exclusiva

    this.familias = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

    if(this.familias.length == 1){
      this.formCabecera.get("familia").setValue(this.familias[0].nId);
    }
  }

  async llenarComboboxAlmacen(){

    const pEntidad = 1; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 4;

    //Iniciarlizar Parametros
    pParametro.push(this.idEmpresa);
    pParametro.push(this.idUsuario);
    pParametro.push(this.idPais);
    pParametro.push(this.esUnPerfilInterno ? 1 : 0); // Indicamos si es un perfil de la lista exclusiva

    this.almacenes = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

    if(this.esUnPerfilInterno){
      this.formCabecera.get("almacen").setValue(this.almacenes[0].nId);
    }
    if(this.almacenes.length == 1){
      this.formCabecera.get("almacen").setValue(this.almacenes[0].nId);
    }
  }

  // Listado en el combobox de los articulos
  async llenarComboboxArticulo(){
    const {familia, almacen} = this.formCabecera.value;
    if(familia && almacen){
      this.spinner.show();
      const pEntidad = 1; //Primera entidad
      const pOpcion = 2;  //CRUD -> Listar
      const pParametro = []; //Parametros de campos vacios
      const pTipo = 5;

      //Iniciarlizar Parametros
      pParametro.push(this.idEmpresa);
      pParametro.push(familia);
      pParametro.push(almacen);
      pParametro.push(this.esUnPerfilInterno ? 1 : 0); // Indicamos si es un perfil de la lista exclusiva

      this.articulos = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
      this.formCabecera.patchValue({articulo: null});
      this.spinner.hide();
    }
    else{
      this.articulos = [];
      this.formCabecera.patchValue({articulo: null});
    }
  }

  async llenarComboboxCanal(){

    const pEntidad = 1; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 6;

    //Iniciarlizar Parametros
    pParametro.push(this.idEmpresa);
    pParametro.push(this.idUsuario);
    this.canales = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

    if(this.canales.length == 1){
      this.formCabecera.get("canal").setValue(this.canales[0].nId);
    }

  }

  async llenarComboboxMarca(){

    const pEntidad = 1; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 7;

    //Iniciarlizar Parametros
    pParametro.push(this.idEmpresa);
    pParametro.push(this.idUsuario);
    this.marcas = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

    if(this.marcas.length == 1){
      this.formCabecera.get("marca").setValue(this.marcas[0].nId);
    }
  }

  // Si es un perfil exclusivo se recupera el presupuesto para mostrarlo
  async recuperarPresupuesto(){

    const pEntidad = 1; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 10;

    //Iniciarlizar Parametros
    pParametro.push(this.idEmpresa);
    const result = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
    this.formCabecera.get("presupuesto").setValue(result.presupuesto);
  }

  // Lista de los perfiles internos a los que se les ocultara combobox innecesarios
  async fnListarPerfilesInternos(){

    const pEntidad = 1; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 9;

    this.lPerfilesInternos = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
  }

  // Recuperar el perfil del usuario
  async fnRecuperarPerfilUsuario(){
    const pEntidad = 1; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 8;

    // Inicializando parametros
    pParametro.push(this.idEmpresa);
    pParametro.push(this.idUsuario);

    this.idPerfil = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
  }

  fnOcultarControlesPerfilesInternos(){
    const esUnPerfilInterno = this.lPerfilesInternos.find(perfil => perfil.nId == this.idPerfil);
    if(esUnPerfilInterno){
      this.esUnPerfilInterno = true;
    }
    else{
      this.esUnPerfilInterno = false;
    }
    this.fnControlFab();
  }
  //#endregion

  //#region Llenado de combobox (Modo satelite)

  async llenarComboboxFamiliaModoSatelite(){

    const pEntidad = 3; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 3;

    //Iniciarlizar Parametros
    pParametro.push(this.idPais);

    this.familias = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
  }

  async llenarComboboxAlmacenModoSatelite(){

    const pEntidad = 3; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 4;

    //Iniciarlizar Parametros
    pParametro.push(this.idEmpresa);
    pParametro.push(this.idUsuario);

    this.almacenes = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
  }

  // Listado en el combobox de los articulos
  async llenarComboboxArticuloModoSatelite(){
    const {familia, almacen} = this.formCabecera.value;
    // Mostrar los articulos solo si hay una familia o un almacen
    if(familia && almacen){
      this.spinner.show();
      const pEntidad = 3; //Primera entidad
      const pOpcion = 2;  //CRUD -> Listar
      const pParametro = []; //Parametros de campos vacios
      const pTipo = 5;

      //Iniciarlizar Parametros
      pParametro.push(this.idEmpresa);
      pParametro.push(familia);
      pParametro.push(almacen);

      this.articulos = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
      this.formCabecera.patchValue({articulo: null});
      this.spinner.hide();
    }
    else{
      this.articulos = [];
      this.formCabecera.patchValue({articulo: null});
    }
  }

  async llenarComboboxCanalModoSatelite(){

    const pEntidad = 3; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 6;

    //Iniciarlizar Parametros
    pParametro.push(this.idEmpresa);
    pParametro.push(this.idUsuario);
    this.canales = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
  }

  async llenarComboboxMarcaModoSatelite(){

    const pEntidad = 3; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 7;

    //Iniciarlizar Parametros
    pParametro.push(this.idEmpresa);
    pParametro.push(this.idUsuario);
    this.marcas = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
  }

  //#endregion

  //#region Llenado de combobox (Modo cliente)
  async llenarComboboxFamiliaModoCliente(){

    const pEntidad = 5; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 3;

    //Iniciarlizar Parametros
    pParametro.push(this.idPais);

    this.familias = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
  }

  async llenarComboboxAlmacenModoCliente(){

    const pEntidad = 5; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 4;

    //Iniciarlizar Parametros
    pParametro.push(this.idEmpresa);
    pParametro.push(this.idUsuario);

    this.almacenes = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
  }

  // Listado en el combobox de los articulos
  async llenarComboboxArticuloModoCliente(){
    const {familia, almacen} = this.formCabecera.value;
    // Mostrar los articulos solo si hay una familia o un almacen
    if(familia && almacen){
      this.spinner.show();
      const pEntidad = 5; //Primera entidad
      const pOpcion = 2;  //CRUD -> Listar
      const pParametro = []; //Parametros de campos vacios
      const pTipo = 5;

      //Iniciarlizar Parametros
      pParametro.push(this.idEmpresa);
      pParametro.push(familia);
      pParametro.push(almacen);

      this.articulos = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
      this.formCabecera.patchValue({articulo: null});
      this.spinner.hide();
    }
    else{
      this.articulos = [];
      this.formCabecera.patchValue({articulo: null});
    }
  }

  async llenarComboboxCanalModoCliente(){

    const pEntidad = 5; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 6;

    //Iniciarlizar Parametros
    pParametro.push(this.idEmpresa);
    pParametro.push(this.idUsuario);
    this.canales = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
  }

  async llenarComboboxMarcaModoCliente(){

    const pEntidad = 5; //Primera entidad
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = []; //Parametros de campos vacios
    const pTipo = 7;

    //Iniciarlizar Parametros
    pParametro.push(this.idEmpresa);
    pParametro.push(this.idUsuario);
    this.marcas = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
  }
  //#endregion

  //#region Tabla

  // Llenado de la tabla en base a los parametros de la cabecera para almacenes normales
  async llenarTabla(){
    if(this.formCabecera.valid){
      this.spinner.show();
      const pEntidad = 1; //Primera entidad
      const pOpcion = 2;  //CRUD -> Listar
      const pParametro = []; //Parametros de campos vacios
      const pTipo = 1;

      //Iniciarlizar Parametros
      const {familia, almacen, articulo, estadoVencido, canal, marca} = this.formCabecera.value;
      pParametro.push(this.idEmpresa);
      pParametro.push(canal || 0);
      pParametro.push(familia || 0);
      pParametro.push(almacen || 0);
      pParametro.push(marca || 0);
      pParametro.push(articulo || 0);
      pParametro.push(estadoVencido);
      pParametro.push(this.esUnPerfilInterno ? 1 : 0); // Indicamos si es un perfil de la lista exclusiva
      pParametro.push(this.idUsuario); // Id del Usuario

      this.listaStockEnLinea = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

      if(estadoVencido == 1){
        // Lista de vencidos
        const listaTemporal = this.listaStockEnLinea.filter(articulo =>  new Date() >= moment(articulo.sFechaVence, 'DD/MM/YYYY').toDate() || articulo.bTerminado)
        this.listaStockEnLinea = listaTemporal;
      }
      else if(estadoVencido == 2){
        // Lista de no vencidos
        const listaTemporal = this.listaStockEnLinea.filter(articulo =>  (new Date() < moment(articulo.sFechaVence, 'DD/MM/YYYY').toDate()) || articulo.sFechaVence == null || articulo.sFechaVence == '')
        this.listaStockEnLinea = listaTemporal;
      }

      // Asignar colores dependiendo de la fecha de
      this.listaStockEnLinea.map(articulo =>{
        articulo.diferenciaFecha = this.fnAsignarColorRegistro(articulo);
      })

      // Crear nueva tabla
      this.fnInicializarTabla();

      if(this.bMostrarSeleccionMultiple){
        this.fnActivarSeleccionMultiple();
      }

      // Actualizar botones
      this.fnControlFab();

      this.spinner.hide();
    }
  }

  // Llenado de la tabla en base a los parametros de la cabecera para almacenes satelite
  async llenarTablaModoSatelite(){
    if(this.formCabecera.valid){
      this.spinner.show();
      const pEntidad = 3; //Primera entidad
      const pOpcion = 2;  //CRUD -> Listar
      const pParametro = []; //Parametros de campos vacios
      const pTipo = 1;

      //Iniciarlizar Parametros
      const {familia, almacen, articulo, estadoVencido, canal, marca} = this.formCabecera.value;
      pParametro.push(this.idEmpresa);
      pParametro.push(canal || 0);
      pParametro.push(familia || 0);
      pParametro.push(almacen || 0);
      pParametro.push(marca || 0);
      pParametro.push(articulo || 0);
      pParametro.push(estadoVencido);

      this.listaStockEnLinea = await this.almacenSaldoService.fnAlmacenSaldo(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

      if(estadoVencido == 1){
        // Lista de vencidos
        const listaTemporal = this.listaStockEnLinea.filter(articulo =>  new Date() >= moment(articulo.sFechaVence, 'DD/MM/YYYY').toDate() || articulo.bTerminado)
        this.listaStockEnLinea = listaTemporal;
      }
      else if(estadoVencido == 2){
        // Lista de no vencidos
        const listaTemporal = this.listaStockEnLinea.filter(articulo =>  (new Date() < moment(articulo.sFechaVence, 'DD/MM/YYYY').toDate()) || articulo.sFechaVence == null || articulo.sFechaVence == '')
        this.listaStockEnLinea = listaTemporal;
      }

      // Asignar colores dependiendo de la fecha de
      this.listaStockEnLinea.map(articulo =>{
        articulo.diferenciaFecha = this.fnAsignarColorRegistro(articulo);
      })

      // Crear nueva tabla
      this.fnInicializarTabla();

      if(this.bMostrarSeleccionMultiple){
        this.fnActivarSeleccionMultiple();
      }

      // Actualizar botones
      this.fnControlFab();

      this.spinner.hide();
    }
  }

  // Filtrado de la tabla
  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Activar la seleccion multiple de los elementos
  fnActivarSeleccionMultiple(){

    // Si no hay elementos en la tabla, no se activa la seleccion multiple
    if(this.listaStockEnLinea.length > 0){

      // Al activar la seleccion multiple se crean los checkbox
      if(!this.bMostrarSeleccionMultiple){
        // Ponemos en falso todos los
        this.cbSeleccionarTodos.setValue(false);
        this.formSeleccionMultiple = this.fb.group({});
        this.listaStockEnLinea.map(articulo => {
          this.formSeleccionMultiple.addControl(articulo.nIdKardex, new FormControl(false))
        })
      }

      // Al desactivar la seleccion multiple, se reinicia el formulario
      else{
        this.formSeleccionMultiple = this.fb.group({});
      }

      // Activacion / Desactivacion de la seleccion multiple
      this.bMostrarSeleccionMultiple = !this.bMostrarSeleccionMultiple;
    }

    // Actualizar botones
    this.fnControlFab();
  }

  // Seleccionar todos los elementos
  fnSeleccionarTodos(){

    // Recuperamos la data filtrada de la tabla
    const listaRegistros = this.dataSource.filteredData;

    // Si todos los elementos no estan seleccionados, se seleccionan todos
    if(this.cbSeleccionarTodos.value){
      listaRegistros.map(registro =>{
        this.formSeleccionMultiple.get((registro.nIdKardex).toString()).setValue(true);
      })
    }
    // Si todos los elementos estan seleccionados, se quitan todos
    else{
      listaRegistros.map(registro =>{
        this.formSeleccionMultiple.get((registro.nIdKardex).toString()).setValue(false);
      })
    }
  }

  // Al hacer un cambio en un checkbox se deselecciona el combobox maestro
  fnSeleccionCheckbox(id: number){
    if(this.cbSeleccionarTodos.value){
      if(!this.formSeleccionMultiple.get(id.toString()).value){
        this.cbSeleccionarTodos.setValue(false);
      }
    }
  }

  // Muestra la imagen del articulo seleccionado
  verImagen(imagenArticulo){
    if(imagenArticulo != '' && imagenArticulo != null) {
      Swal.fire({
        imageUrl: imagenArticulo,
        imageWidth: 250,
        imageHeight: 250,
      })
    } else {
      Swal.fire({
        imageUrl: '/assets/img/SinImagen.jpg',
        imageWidth: 250,
        imageHeight: 250,
      })
    }
  }

  // Asigna un color a un registro dependiendo de su fecha de vencimiento (Rojo = Vencido, Naranja = 4 meses para vencimiento o Bisque = 6 meses para vencimiento )
  fnAsignarColorRegistro(registro){

    if(registro.sFechaVence == null || registro.sFechaVence == ''){
      return 0;
    }

    // Marcamos un rango de fechas desde hoy (desde) a la fecha de vencimiento (hasta)
    const desde = new Date();
    const hasta = moment(registro.sFechaVence, 'DD/MM/YYYY').toDate();

    // Si la fecha de Vencimiento ya ha pasado devolvemos rojo
    if(desde >= hasta){
      return "rojo";
    }

    // Calculamos la cantidad de meses que lo separan
    let meses = hasta.getMonth() - desde.getMonth()
        + (12 * (hasta.getFullYear() - desde.getFullYear()));

    // Restamos si un mes esta a medias
    if(hasta.getDate() < desde.getDate()){
      meses--;
    }

    // Si falta menos de 6 meses devolvemos bisque
    if(meses <= 6 && meses > 4){
      return "bisque"
    }

    // Si falta menos de 4 meses devolvemos naranja
    if(meses <= 4 && meses >= 0){
      return "naranja"
    }

  }

  async fnGenerarExcel(){
    if(this.formCabecera.valid){
      this.spinner.show();
      const pEntidad = 1; //Primera entidad
      const pOpcion = 2;  //CRUD -> Listar
      const pParametro = []; //Parametros de campos vacios
      const pTipo = this.esUnPerfilInterno ? 11 : 2 // Exportacion del Excel

      //Iniciarlizar Parametros
      const {familia, almacen, articulo, estadoVencido, canal, marca} = this.formCabecera.value;
      pParametro.push(this.idEmpresa);
      pParametro.push(canal || 0);
      pParametro.push(familia || 0);
      pParametro.push(almacen || 0);
      pParametro.push(marca || 0);
      pParametro.push(articulo || 0);
      pParametro.push(estadoVencido);
      pParametro.push(this.esUnPerfilInterno ? 1 : 0); // Indicamos si es un perfil de la lista exclusiva

      const response = await this.almacenSaldoService.fnAlmacenSaldoExcel(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

      if(response){
        // Descargar el Excel
        const data = response;
        const fileName = `Reporte Saldos.xlsx`;
        // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        //   window.navigator.msSaveOrOpenBlob(data, fileName);
        //   return;
        // }
        const objectUrl = window.URL.createObjectURL(data);
        var link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        // Trigger de descarga
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        Swal.fire({
          title: 'El Excel ha sido generado',
          html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
          icon: 'success',
          showCloseButton: true
        })
      }
      else{
        Swal.fire({
          title: 'No se encontró registros. Aplique otros filtros',
          icon: 'warning',
          showCloseButton: true
        })
      }

      // Actualizar botones
      this.fnControlFab();

      this.spinner.hide();
    }
  }

  async fnGenerarExcelModoSatelite(){
    if(this.formCabecera.valid){
      this.spinner.show();
      const pEntidad = 3; //Primera entidad
      const pOpcion = 2;  //CRUD -> Listar
      const pParametro = []; //Parametros de campos vacios
      const pTipo = 2 // Exportacion del Excel

      //Iniciarlizar Parametros
      const {familia, almacen, articulo, estadoVencido, canal, marca} = this.formCabecera.value;
      pParametro.push(this.idEmpresa);
      pParametro.push(canal || 0);
      pParametro.push(familia || 0);
      pParametro.push(almacen || 0);
      pParametro.push(marca || 0);
      pParametro.push(articulo || 0);
      pParametro.push(estadoVencido);

      const response = await this.almacenSaldoService.fnAlmacenSaldoExcel(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

      if(response){
        // Descargar el Excel
        const data = response;
        const fileName = `Reporte Saldos Satelite.xlsx`;
        // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        //   window.navigator.msSaveOrOpenBlob(data, fileName);
        //   return;
        // }
        const objectUrl = window.URL.createObjectURL(data);
        var link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        // Trigger de descarga
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        Swal.fire({
          title: 'El Excel ha sido generado',
          html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
          icon: 'success',
          showCloseButton: true
        })
      }
      else{
        Swal.fire({
          title: 'No se encontró registros. Aplique otros filtros',
          icon: 'warning',
          showCloseButton: true
        })
      }

      // Actualizar botones
      this.fnControlFab();

      this.spinner.hide();
    }
  }

  // Se cambia de modo para ver los almacenes satelites o los almacenes normales
  async fnActivarVistaAlmacenesSatelite(){
    this.spinner.show();

    // Reiniciar el formulario
    this.crearFormularios();

    // Limpiar tabla
    this.listaStockEnLinea = [];
    this.fnInicializarTabla();

    if(!this.modoSatelite){
      // Se activa el modo satelite
      this.modoSatelite = true;
      await this.llenarComboboxFamiliaModoSatelite();
      await this.llenarComboboxAlmacenModoSatelite();
      await this.llenarComboboxArticuloModoSatelite();
      await this.llenarComboboxAlmacenModoSatelite();
      await this.llenarComboboxCanalModoSatelite();
      await this.llenarComboboxMarcaModoSatelite();
    }
    else{
      // Se desactiva el modo satelite
      this.modoSatelite = false;
      await this.llenarComboboxFamilia();
      await this.llenarComboboxAlmacen();
      await this.llenarComboboxArticulo();
      await this.llenarComboboxAlmacen();
      await this.llenarComboboxCanal();
      await this.llenarComboboxMarca();
    }

    this.fnControlFab();

    this.spinner.hide();
  }

  async fnActivarVistaAlmacenesCliente(){
    this.spinner.show();

    // Reiniciar el formulario
    this.crearFormularios();

    // Limpiar tabla
    this.listaStockEnLinea = [];
    this.fnInicializarTabla();

    if(!this.modoCliente){
      // Se activa el modo cliente
      this.modoCliente = true;
      await this.llenarComboboxFamiliaModoCliente();
      await this.llenarComboboxAlmacenModoCliente();
      await this.llenarComboboxArticuloModoCliente();
      await this.llenarComboboxAlmacenModoCliente();
      await this.llenarComboboxCanalModoCliente();
      await this.llenarComboboxMarcaModoCliente();
    }
    else{
      // Se desactiva el modo cliente
      this.modoCliente = false;
      await this.llenarComboboxFamilia();
      await this.llenarComboboxAlmacen();
      await this.llenarComboboxArticulo();
      await this.llenarComboboxAlmacen();
      await this.llenarComboboxCanal();
      await this.llenarComboboxMarca();
    }

    this.fnControlFab();

    this.spinner.hide();
  }

  //#endregion

  //#region Dialog Kardex
  async fnOpenDialogKardex(id:number) {
    this.spinner.show(); // Inicio de spinner

    const registros = [];

    // Se agrega solo un elemento para buscar su kardex
    if(!this.bMostrarSeleccionMultiple){
      // Buscar datos del elemento
      const saldo = this.listaStockEnLinea.find(saldo => saldo.nIdKardex == id);
      registros.push(saldo)
    }
    // Se agregan multiples elementos para buscar su kardex
    else{
      const listaRegistros = this.dataSource.filteredData;
      listaRegistros.map(registro => {
        const estaSeleccionado = this.formSeleccionMultiple.get((registro.nIdKardex).toString()).value;
        if(estaSeleccionado){
          registros.push(registro)
        }
      })
      this.fnActivarSeleccionMultiple();

      if(registros.length == 0){
        this.spinner.hide(); // Inicio de spinner
        return;
      }
    }

    // Ocultamos los botones del componente padre para que se muestren los botones del modal
    this.mostrarBotones = false;

    const dialogRef = this.dialog.open(DetalleSaldoComponent, {
      width: '1600px',
      autoFocus: false,
      data: {
        modoSatelite: this.modoSatelite, // Indicar si es modo satelite
        modoCliente: this.modoCliente, // Indicar si es modo cliente
        registros // Lista de registros
      },
      disableClose: true 
    });

    dialogRef.beforeClosed().subscribe(result => {
      // Actualizar botones
      //this.fnControlFab();
      this.mostrarBotones = true;
    });

  }
  //#endregion
}
