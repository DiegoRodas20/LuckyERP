import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ActivoRegistroDTO } from '../../api/models/activoDTO';
import { WebApiResponse } from '../../api/models/apiResponse';
import { AsignacionDirectaReposicionDTO, AsignacionDirectaSeleccionDetalleDTO, AsignacionDirectaSeleccionDTO, AsignacionDirectaSelectItemDTO } from '../../api/models/asignacionDirectaDTO';
import { ActivoService } from '../../api/services/activo.service';
import { AsignacionDirectaService } from '../../api/services/asignacion-directa.service';
import { TiTicketDetalleComponent } from '../../ti-ticket/ti-ticket-detalle/ti-ticket-detalle.component';
import { TiActivoOtrosComponent } from '../ti-activo-otros/ti-activo-otros.component';
import { TiIngresoInventarioLaptopDesktopComponent } from '../ti-ingreso-inventario-laptop-desktop/ti-ingreso-inventario-laptop-desktop.component';
import { TiIngresoInventarioMovilComponent } from '../ti-ingreso-inventario-movil/ti-ingreso-inventario-movil.component';
import { TiAsignacionDialogCrearActivoComponent } from './ti-asignacion-dialog-crear-activo/ti-asignacion-dialog-crear-activo.component';
import { TiAsignacionDialogObservacionesComponent } from './ti-asignacion-dialog-observaciones/ti-asignacion-dialog-observaciones.component';

@Component({
  selector: 'app-ti-ingreso-inventario-detalle-inventario',
  templateUrl: './ti-ingreso-inventario-detalle-inventario.component.html',
  styleUrls: ['./ti-ingreso-inventario-detalle-inventario.component.css'],
  animations: [asistenciapAnimations]
})
export class TiIngresoInventarioDetalleInventarioComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables auxiliares
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada
  nIdPersonal = 0; // El Id del personal para ver el detalle
  nIdPerfilUsuario = 0; // El Id del perfil de usuario que esta asignando actualmente

  // Combobox
  listaColaboradores: AsignacionDirectaSelectItemDTO[] = [];

  // Formulario
  formDetalleInventario: FormGroup;

  // Mat-Table (Gestion de activos)
  dataSource: MatTableDataSource<AsignacionDirectaSeleccionDetalleDTO>;
  listaDetalle: AsignacionDirectaSeleccionDetalleDTO[] = [];
  displayedColumns: string[] = ["nIdDetActivoAsigna", "sEmpresa", "sTipoActivo", "sActivo", "sArticulo", "nIdTicketReposicion", "sImeiSerie", "sUsuarioEntrega", "dFechaEntrega", "nRepos", "sAddenda",];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) public sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'save', tool: 'Guardar', state: true, color: 'secondary'},
    {icon: 'edit', tool: 'Editar', state: true, color: 'secondary'},
    {icon: 'add', tool: 'Asignar Activo', state: true, color: 'secondary'},
    {icon: 'close', tool: 'Cancelar', state: false, color: 'secondary'},
    {icon: 'exit_to_app', tool: 'Salir', state: true, color: 'secondary'}
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Flags
  estaEditando = false; // Flag para activar/desactivar el modo edicion
  estaCreando = false; // Flag para activar/desactivar el modo creacion
  esCelular = false; // Flag para detectar si el dispositivo origen es un celular
  alturaMaxima = false; // Flag para aumentar la tabla a su altura maxima

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private activoService: ActivoService,
    private _asignacionDirectaService: AsignacionDirectaService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog, // Declaracion del Dialog
    private overlayContainer: OverlayContainer)
  {    

    // Actualizamos los estilos para agregar un backdrop
    this.overlayContainer.getContainerElement().classList.add("multiDialog"); 
    // Configuracion de formulario
    this.fnCrearFormulario();
    // Detectar dispositivo
    this.fnDetectarDispositivo();

    // Inicializar tablas
    this.dataSource = new MatTableDataSource(this.listaDetalle);
  }

  async ngOnInit(): Promise<void> {

    this.spinner.show();

    this.onToggleFab(1, -1);

    this.nIdPersonal = Number(this.activatedRoute.snapshot.paramMap.get('idPersonal'));

    await this.fnRecuperarPerfilUsuario();

    // Seleccionar modo detalle o modo creacion
    if(this.nIdPersonal){
      // Visualizacion del detalle
      const existeActivo = await this.fnModoVerDetalle();
      // Si no existe el activo, volvemos a la tabla principal
      !existeActivo ? this.fnSalir() : null;
    }
    else{
      // Creacion de activo
      await this.fnModoCreacionAsignacion();
    }

    // Llenado de controles
    await this.fnLlenarComboboxColaborador();

    this.estaCargado = true;

    this.spinner.hide();
  }

  ngOnDestroy(){
    this.overlayContainer.getContainerElement().classList.remove("multiDialog");
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
        //this.estaCreando ? await this.fnCrearAsignacion() : await this.fnGuardarAsignacion();
        break;
      case 1:
        this.fnModoEditar();
        break;
      case 2:
        this.fnAsignarActivo();
        break;
      case 4:
        this.fnSalir();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){

    this.fbLista[0].state = false;
    this.fbLista[1].state = !this.estaCreando && !this.estaEditando;
    this.fbLista[2].state = this.estaCreando || this.estaEditando;
    this.fbLista[3].state = false;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Formulario

  fnCrearFormulario() {
    this.formDetalleInventario = this.fb.group(
      {
        documento: [null],
        colaborador: [null],
        cbColaborador: [null, Validators.compose([Validators.required])], // Combobox colaborador
        idEmpresa: [null, Validators.compose([Validators.required])],
        empresa: [null, Validators.compose([Validators.required])],
        telefono: [null],
        idCargo: [null],
        cargo: [null],
        cuentaCliente: [null],
        canal: [null],
        presupuesto: [null, Validators.compose([Validators.required])],
        idPresupuesto: [null, Validators.compose([Validators.required])], // Guarda el id del presupuesto en memoria para almacenarlo en el registro de la base de datos
      }
    );
  }

  //#endregion

  //#region Tabla

  // Llenado de la tabla Activos
  async fnLlenarTabla(){
    try{

      const listaFiltrada = this.listaDetalle.filter(detalle => detalle.bEstado);
      
      this.dataSource.data = listaFiltrada;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
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
    this.spinner.show();

    // Limpiar el filtro
    this.txtFiltro.setValue('');
    this.dataSource.filter = '';

    this.spinner.hide();
  }

  //#endregion

  //#region Controles

  async fnLlenarComboboxColaborador(): Promise<void>{
    
    const nIdPersonal = this.formDetalleInventario.get("cbColaborador").value || 0;
    const sPais = this.storageData.getPais();
    
    const result = await this._asignacionDirectaService.GetAllColaboradores(nIdPersonal, sPais);
    this.listaColaboradores = result.response.data;
  }

  async fnActualizarDetalleColaborador(): Promise<void>{

    const idPersonal = Number(this.formDetalleInventario.get("cbColaborador").value);

    const result = await this._asignacionDirectaService.GetDetalleColaborador(idPersonal);
    const data = result.response.data[0];

    this.formDetalleInventario.patchValue({

      telefono: data.sTelefono,
      idEmpresa: data.nIdEmp,
      empresa: data.sEmpresa,
      idCargo: data.nIdCargo,
      cargo: data.sCargo,
      cuentaCliente: data.sCuenta,
      canal: data.sCanal,
      presupuesto: data.sCentroCosto,
      idPresupuesto: data.nIdCentroCosto,
      
    });
  }

  fnBloquearControles(): void {
    this.estaEditando = false;
    Object.values(this.formDetalleInventario.controls).forEach(control => { control.disable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  fnDesbloquearControles(): void {
    this.estaEditando = true;
    Object.values(this.formDetalleInventario.controls).forEach(control => { control.enable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  //#endregion

  //#region Inicializacion

  // Activar el modo de creacion del activo
  async fnModoCreacionAsignacion(){

    this.estaCreando = true;
    this.fnDesbloquearControles();

    this.listaDetalle = [];
    await this.fnLlenarTabla();

    this.fnControlFab();
  }

  // Activar el modo de vista previa
  async fnModoVerDetalle(): Promise<Boolean>{

    const result: WebApiResponse<AsignacionDirectaSeleccionDTO> = await this._asignacionDirectaService.GetAsignacionById(this.nIdPersonal);

    // Si no encuentra el activo o es un activo de tipo diferente, da error y no continua
    if (!result.success) {
      this.spinner.hide();
      Swal.fire({icon: 'warning', title: 'Advertencia', text: 'No se encontró el detalle'});
      return false;
    }

    const data = result.response.data[0]

    this.estaCreando = false;
    this.fnDesbloquearControles();

    this.formDetalleInventario.patchValue({

      documento: data.sDocumento,
      colaborador: data.sColaborador,
      cbColaborador: data.nIdSolicitante,
      telefono: '',
      cargo: '',
      cuentaCliente: '',
      canal: '',
      presupuesto: data.sCentroCosto,
      idPresupuesto: data.nIdCentroCosto,
    });

    // Guardamos el detalle
    this.listaDetalle = data.detalle;

    await this.fnActualizarDetalleColaborador();

    // Actualizamos el presupueto en el que estaba el personal seleccionado durante la creacion de la asignacion
    this.formDetalleInventario.patchValue({
      presupuesto: data.sCentroCosto,
      idPresupuesto: data.nIdCentroCosto
    });

    await this.fnLlenarTabla();

    this.fnControlFab();

    return true;
  }

  // Activar el modo de edicion
  fnModoEditar(){
    this.fnDesbloquearControles();
  }

  async fnRecuperarPerfilUsuario(){
    const nIdEmp = Number(this.storageData.getEmpresa());
    const nIdUsuario = this.storageData.getUsuarioId();

    const result = await this._asignacionDirectaService.GetPerfilUsuario(nIdUsuario, nIdEmp);

    if(result.success){
      this.nIdPerfilUsuario = result.response.data[0];
      console.log(this.nIdPerfilUsuario);
    }
  }

  //#endregion

  //#region Acciones

  async fnCrearAsignacion(){

    // Verificar que el formulario sea valido
    if(this.formDetalleInventario.valid){

      if(this.listaDetalle.length > 0){

        this.spinner.show();

        const formulario = this.formDetalleInventario.value;

        const model: AsignacionDirectaSeleccionDTO = {
          nIdActivoAsigna: 0,
          nIdTipoAsigna: 2532,
          nIdSolicitante: formulario.cbColaborador,
          nIdCentroCosto: formulario.idPresupuesto,
          nIdCargo: formulario.idCargo,
          nIdUsuarioCreacion: this.storageData.getUsuarioId(),
          //dFechaCreacion: moment(formulario.fechaCreacion, 'DD-MM-YYYY').toDate(),
          sPais: this.storageData.getPais(),
          nIdEstado: 2528,
          nIdEmpUsuarioRegistro: Number(this.storageData.getEmpresa()),
          detalle: []
        }

        const modelDetalle: AsignacionDirectaSeleccionDetalleDTO = this.listaDetalle[0];

        // Agregamos al modelo el cargo del personal seleccionado y la empresa actual
        modelDetalle.nIdCargo =  formulario.idCargo;
        modelDetalle.nIdEmpUsuarioRegistro = Number(this.storageData.getEmpresa());

        model.detalle.push(modelDetalle);
    
        const result = await this._asignacionDirectaService.CreateAsignacion(model);

        if (!result.success) {

          this.listaDetalle.shift();
          await this.fnLlenarTabla();

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
  
        const asignacionResponse: AsignacionDirectaSeleccionDTO = result.response.data[0];
        this.nIdPersonal = asignacionResponse.nIdSolicitante;

        this.formDetalleInventario.markAsUntouched();

        Swal.fire({
          icon: 'success',
          title: ('Correcto'),
          text: 'Se asignó el activo',
          showConfirmButton: true
        });

        // Recargar la pagina para ver el detalle al crear
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/asignacion/directa', this.nIdPersonal]);
      }
      else{
        Swal.fire("Alerta", "Debe asignar al menos un activo al colaborador", "warning");
      }

    }
    else{
      this.formDetalleInventario.markAllAsTouched();
    }

  }

  // async fnCrearAsignacionDetalle(nIdActivoAsigna: number){

  //   const formulario = this.formDetalleInventario.value;

  //   const result = await this._asignacionDirectaService.CreateAsignacionDetalle(model);

  //   if (!result.success) {
  //     let mensaje = result.errors.map(item => {
  //       return item.message
  //     })
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Advertencia',
  //       text: mensaje.join(', '),
  //     });
  //     this.spinner.hide();
  //     return;
  //   }
  //   else{
  //     await this.fnModoVerDetalle();

  //     this.spinner.hide();

  //     Swal.fire({
  //       icon: 'success',
  //       title: ('Correcto'),
  //       text: 'Se asignó el activo',
  //       showConfirmButton: true
  //     });
  //   }

  // }

  async fnModificarAsignacionDetalle(row: AsignacionDirectaSeleccionDetalleDTO){

    const formulario = this.formDetalleInventario.value;

    // Agregamos al modelo el cargo del personal seleccionado y la empresa actual
    row.nIdActivoAsigna = this.nIdPersonal;
    row.nIdCargo =  formulario.idCargo;
    row.nIdEmpUsuarioRegistro = Number(this.storageData.getEmpresa())

    const result = await this._asignacionDirectaService.UpdateAsignacionDetalle(row);

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
    else{
      await this.fnModoVerDetalle();

      this.spinner.hide();

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se actualizó la asignación',
        showConfirmButton: true
      });
    }

  }

  //#endregion

  //#region Dialog

  // Metodo para abrir el dialog para asignacion de un activo
  fnAsignarActivo(){
    if(this.formDetalleInventario.valid){

      this.spinner.show();

      this.mostrarBotones = false;

      const formulario = this.formDetalleInventario.value;

      const dialogRef = this.dialog.open(TiAsignacionDialogCrearActivoComponent, {
        width: '1250px',
        autoFocus: false,
        disableClose: true,
        backdropClass: 'backdropBackground',
        data: {
          nIdPersonal: Number(this.formDetalleInventario.get("cbColaborador").value), // Id del colaborador seleccionado al que se le asigna el activo
          nIdCargo: formulario.idCargo,
          listaDetalleActual: this.listaDetalle, // Lista completa para verificar si existe ese activo ya asignado
          estaEditando: this.estaCreando || this.estaEditando, // Se puede editar en el dialog si este flag esta activado
          estaDevolviendo: false, // Verificar si se esta editando para devolver
          nIdEmp: Number(this.formDetalleInventario.get("idEmpresa").value),
          sEmpresa: this.formDetalleInventario.get("empresa").value,
        }
      });
  
      dialogRef.beforeClosed().subscribe(async result => {
        if(result){

          this.spinner.show();

          // Agregamos en la tabla 
          this.fnAgregarActivoTabla(result);

          // Registramos en DB la cabecera y el detalle
          await this.fnCrearAsignacion();
          this.spinner.hide();
          
        }

        this.mostrarBotones = true;
      });
    }
    else{
      this.formDetalleInventario.markAllAsTouched();
    }
  }

  fnModificarAsignacion(row: AsignacionDirectaSeleccionDetalleDTO){

    this.spinner.show();

    this.mostrarBotones = false;

    const dialogRef = this.dialog.open(TiAsignacionDialogCrearActivoComponent, {
      width: '1250px',
      autoFocus: false,
      disableClose: true,
      backdropClass: 'backdropBackground',
      data: {
        nIdPersonal: Number(this.formDetalleInventario.get("cbColaborador").value), // Id del colaborador seleccionado al que se le asigna el activo
        registroActual: row, // Asignacion que se está editando
        observaciones: row.observaciones,
        estaEditando: this.estaCreando || this.estaEditando, // Se puede editar en el dialog si este flag esta activado
        estaDevolviendo: false, // Verificar si se esta editando para devolver
      }
    });

    dialogRef.beforeClosed().subscribe(async result => {
      if(result){
        this.spinner.show();
        await this.fnModificarAsignacionDetalle(result);
      }
      this.mostrarBotones = true;
    });
  }

  async fnDevolverActivoAsignacion(row: AsignacionDirectaSeleccionDetalleDTO){

    const confirma = await Swal.fire({
      title: `¿Desea devolver este activo?`,
      text: `Estos cambios no se pueden revertir`,
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

    this.spinner.show();

    this.mostrarBotones = false;

    const dialogRef = this.dialog.open(TiAsignacionDialogCrearActivoComponent, {
      width: '1250px',
      autoFocus: false,
      disableClose: true,
      backdropClass: 'backdropBackground',
      data: {
        nIdPersonal: Number(this.formDetalleInventario.get("cbColaborador").value), // Id del colaborador seleccionado al que se le asigna el activo
        registroActual: row, // Asignacion que se está dando de baja
        observaciones: row.observaciones,
        estaEditando: true, // Se puede editar en el dialog si este flag esta activado
        estaDevolviendo: true // Verificar si se esta editando para devolver
      }
    });

    dialogRef.beforeClosed().subscribe(async registro => {
      if(registro){
        this.spinner.show();
        
        // Actualizamos el registro
        const result = await this._asignacionDirectaService.UpdateAsignacionDetalle(registro);

        if(result.success){
          this.spinner.show();
          await this.fnModoVerDetalle();
        }

        this.mostrarBotones = true;

        this.spinner.hide();

        if(this.listaDetalle.length > 0){
          Swal.fire("Correcto", "Se devolvió el registro", "success");
        }
        else{
          Swal.fire("Correcto", "Ya no quedan activos por devolver", "success");
          this.fnSalir();
        }
      }
    });
  }

  // Devolución del activo si es por ticket
  async fnDevolverActivoAsignacionTicket(row: AsignacionDirectaSeleccionDetalleDTO){
    const confirma = await Swal.fire({
      title: `Esta es una asignación por ticket`,
      text: `Para devolver el activo, lo debe hacer desde el ticket. ¿Desea ver el ticket?`,
      icon: 'info',
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
      this.route.navigate(['til/tecnologia/ti-Ticket/detalle/', row.nIdTicket]);
    }

  }

  async fnReposicionAsignacionDescuento(row: AsignacionDirectaSeleccionDetalleDTO){
    const confirma = await Swal.fire({
      title: `¿Desea mandar el activo a reposición?`,
      input: 'textarea',
      inputPlaceholder: "Ingrese observación (opcional)",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    const { value: mensaje } = confirma;

    if (!confirma.isConfirmed) {
      return false;
    }
    else{

      // Importe a ingresar (Si no hay penalidad)
      let nImporte: number = null;

      // Si no hay penalidad relacionada, se debe ingresar un monto de descuento manualmente
      if(!row.nIdPenalidad){
        const confirmaImporte = await Swal.fire({
          title: `Ingrese manualmente el monto de descuento efectivo`,
          input: 'number',
          inputPlaceholder: "Monto",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
        });
    
        const { value: importe } = confirmaImporte;
        nImporte = Number(importe);

        if (!confirmaImporte.isConfirmed) {
          return false;
        }
        else if(!nImporte || nImporte == 0){
          Swal.fire("Alerta", "El importe de descuento no puede ser cero.", "warning");
          return false;
        }
      }

      this.spinner.show();

      const model: AsignacionDirectaReposicionDTO = {
        nIdDetActivoAsigna: row.nIdDetActivoAsigna,
        nIdTicket: row.nIdTicketReposicion,
        nIdPenalidad: row.nIdPenalidad,
        nIdPersonal: row.nIdPersonal,
        nImporte: nImporte,
        nIdEmp: Number(this.storageData.getEmpresa()),
        nIdUsuario: this.storageData.getUsuarioId(),
        sObservacion: mensaje.toString(),
        sPais: this.storageData.getPais()
      }

      console.log(model);

      const result = await this._asignacionDirectaService.CreateReposicionAsignacion(model);

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
      else{
        this.spinner.hide();
        await this.fnModoVerDetalle();
        Swal.fire("Correcto", "Se mandó el activo a reposicion", "success");
      }

    }
  }

  // Agregar el activo a la tabla
  async fnAgregarActivoTabla(registro: AsignacionDirectaSeleccionDetalleDTO){
    this.listaDetalle.unshift(registro);
    await this.fnLlenarTabla();
  }

  // Metodo para abrir un dialog con las caracteristicas del activo
  fnDialogDetalleActivo(row: AsignacionDirectaSeleccionDetalleDTO){

    let component = null;

    if(row.nIdTipoActivo == 2500 || row.nIdTipoActivo == 2501){
      component = TiIngresoInventarioLaptopDesktopComponent;
    }
    else if(row.nIdTipoActivo == 2502){
      component = TiIngresoInventarioMovilComponent;
    }
    else{
      component = TiActivoOtrosComponent;
    }

    if(component){

      this.spinner.show();

      const dialogRef = this.dialog.open(component, {
        width: '1250px',
        autoFocus: false,
        data: {
          tipoActivo: row.nIdTipoActivo,
          nIdActivo: row.nIdActivo,
          vistaPrevia: true
        }
      });
  
      dialogRef.beforeClosed().subscribe(async result => {});
    }
  }

  async fnDialogTicket(row: AsignacionDirectaSeleccionDetalleDTO){

    const confirma = await Swal.fire({
      title: `Existe una reposición pendiente`,
      text: `¿Desea ver el ticket relacionado?`,
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

    this.spinner.show();

    const dialogRef = this.dialog.open(TiTicketDetalleComponent, {
      width: '1250px',
      autoFocus: false,
      data: {
        nIdTicket: row.nIdTicketReposicion
      }
    });

    dialogRef.beforeClosed().subscribe(async result => {});
      
  }

  //#endregion

  fnDetectarDispositivo() {
    const dispositivo = navigator.userAgent;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(dispositivo)) {
      this.esCelular = true;
      this.alturaMaxima = false;
    }
    else {
      this.esCelular = false;
      this.alturaMaxima = true;
    }
  }

  fnCambiarAlturaTabla() {
    this.alturaMaxima = !this.alturaMaxima;
  }

  fnSalir(){
    this.route.navigate(['til/tecnologia/ti-ingreso-inventario/']);
  }

  //#endregion
}
