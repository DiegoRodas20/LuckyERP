import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment, { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal, { SweetAlertGrow, SweetAlertResult } from 'sweetalert2';
import { WebApiResponse } from '../../api/models/apiResponse';
import { ActivoTicketCaracteristicasDTO, TicketImagenAsignacionDTO, TicketSelectItemDTO, TicketSelectItemPersonalAsignadoDTO, TicketSelectItemPrioridadDTO, TicketTableDetalleAtencionDTO, TicketTableDetalleAtencionTiempoDTO, TicketTableDetalleDTO } from '../../api/models/ticketDTO';
import { ActivoService } from '../../api/services/activo.service';
import { TicketService } from '../../api/services/ticket.service';
import { TiTicketReposicionComponent } from './ti-ticket-reposicion/ti-ticket-reposicion.component';
import { TiTicketTiempoAtencionComponent } from './ti-ticket-tiempo-atencion/ti-ticket-tiempo-atencion.component';

@Component({
  selector: 'app-ti-ticket-detalle',
  templateUrl: './ti-ticket-detalle.component.html',
  styleUrls: ['./ti-ticket-detalle.component.css'],
  animations: [asistenciapAnimations]
})
export class TiTicketDetalleComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables auxiliares
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada
  nIdTicket = 0; // El Id del ticket para ver el detalle
  nIdEstado = 0;
  nIdTipoTicket = 0; // El tipo de ticket actual del detalle
  nIdPersonalTiActual; // El Id de de la persona (Ti) que esta atendiendo actualmente
  sPersonalTiActual; // Nombre de la persona (Ti) que esta atendiendo actualmente
  sPersonalAsignado; // Nombre del personal al que se le esta asignando el ticket

  sRutaArchivoComentario = null;

  // Combobox
  listaEmpresas: TicketSelectItemDTO[] = [];
  listaSolicitantes: TicketSelectItemDTO[] = [];
  listaTipoTicket: TicketSelectItemDTO[] = [];
  listaPrioridadTicket: TicketSelectItemPrioridadDTO[] = [];
  listaActivos: TicketSelectItemDTO[] = [];
  listaPersonalAsignado: TicketSelectItemPersonalAsignadoDTO[] = [];
  listaPersonalTi: TicketSelectItemDTO[] = [];
  listaHoraEntrega: any[] = [];

  // Chip Elements
  chipElementsComponentes: ActivoTicketCaracteristicasDTO[] = []

  // Formulario
  formTicket: FormGroup;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'save', tool: 'Guardar', state: true, color: 'secondary'},
    {icon: 'edit', tool: 'Editar', state: true, color: 'secondary'},
    {icon: 'timer', tool: 'Iniciar atención', state: true, color: 'secondary'},
    {icon: 'timer_off', tool: 'Ticket atendido', state: true, color: 'secondary'},
    {icon: 'perm_media', tool: 'Ver imagenes del activo', state: true, color: 'secondary'},
    {icon: 'slow_motion_video', tool: 'Ver historial de atención', state: true, color: 'secondary'},
    {icon: 'reply', tool: 'Devolver activo', state: true, color: 'secondary'},
    {icon: 'reply', tool: 'Reposición de activo', state: true, color: 'secondary'},
    {icon: 'attach_money', tool: 'Descuento en efectivo', state: false, color: 'secondary'},
    {icon: 'exit_to_app', tool: 'Salir', state: true, color: 'secondary'}
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Flags
  estaEditando = false; // Flag para activar/desactivar el modo edicion
  estaCreando = false; // Flag para activar/desactivar el modo creacion
  formularioCompleto = false; // Flag para ver si el formulario cumple con todos los campos
  esPrestamoActivo = false; // Flag para ver si es un prestamo de activo
  esReposicion = false; // Flag para ver si es una reposicion de activo
  activoExistente = false; // Flag para ver si al editar un ticket ya contaba con un activo
  activoAsignado = false; // Flag para ver si el activo se encuentra asignado actualmente
  activoEnReposicion = false;
  existeGarantia = false; // Verificar si existe garantia

  // Variables para dialogo
  private dialogRef = null;
  private data;
  modoDialog = false;
  
  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private _ticketService: TicketService,
    private _activoService: ActivoService,
    private dialog: MatDialog, // Declaracion del Dialog
    private injector: Injector
    ) { 

      // Injectar en caso de querer usar como Dialog
      this.dialogRef = this.injector.get(MatDialogRef, null);
      this.data = this.injector.get(MAT_DIALOG_DATA, null);

      // Si se abre de un modal
      if(this.data){
        this.modoDialog = true;
        this.nIdTicket = this.data.nIdTicket;
        this.mostrarBotones = false;
      }
      else{
        this.nIdTicket = Number(this.activatedRoute.snapshot.paramMap.get('idTicket'));
      }

      // Configuracion de formulario
      this.fnCrearFormulario();

    }

  async ngOnInit(): Promise<void> {

    this.spinner.show();

    this.onToggleFab(1, -1);

    // Seleccionar modo detalle o modo creacion
    if(this.nIdTicket){
      // Visualizacion del detalle
      const existeActivo = await this.fnModoVerDetalle();

      if(this.nIdTipoTicket == 2608){
        await this.fnRecuperarDetalleGarantia();
      }
        
      // Si no existe el activo, volvemos a la tabla principal
      !existeActivo ? this.fnSalir() : null;
    }
    else{
      // Creacion de activo
      this.fnModoCreacion();
    }

    await this.fnLlenarComboboxHoraEntrega();
    await this.fnLlenarComboboxEmpresa();
    await this.fnLlenarComboboxActivos();
    await this.fnLlenarComboboxPersonalAsignacion();
    await this.fnLlenarComboboxPersonalTi();
    await this.fnLlenarComboboxSolicitantes();
    await this.fnLlenarComboboxTiposTicket();
    await this.fnLlenarComboboxPrioridad();


    // Llenado de controles
    //await this.fnLlenarComboboxColaborador();

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
        this.estaCreando ? await this.fnCrearTicket() : await this.fnGuardarTicket();
        break;
      case 1:
        this.fnModoEditar();
        break;
      case 2:
        this.fnMandarParaAtencion();
        break;
      case 3:
        this.fnTerminarAtencion();
        break;
      case 4:
        this.fnVerImagenesActivo();
        break;
      case 5:
        this.fnVerHistorialAsignaciones();
        break;
      case 6:
        this.fnDevolverActivo();
        break;
      case 7:
        this.fnReponerActivo();
        break;
      case 8:
        this.fnDescuentoEfectivo();
        break;
      case 9:
        this.fnSalir();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){

    const nIdActivo = this.formTicket.get("activoRelacionado").value;

    this.fbLista[0].state = (this.estaCreando || this.estaEditando) && this.nIdEstado != 2602;
    this.fbLista[1].state = (!this.estaCreando && !this.estaEditando) && this.nIdEstado != 2602;
    this.fbLista[2].state = (this.formularioCompleto) && this.nIdEstado != 2600 && this.nIdEstado != 2602;
    this.fbLista[3].state = (this.formularioCompleto) && this.nIdEstado == 2600;
    this.fbLista[4].state = nIdActivo != null;
    this.fbLista[5].state = this.nIdEstado != null && this.nIdEstado != 0;
    this.fbLista[6].state = this.nIdTipoTicket == 2604 && this.nIdEstado == 2602 && this.activoAsignado;
    this.fbLista[7].state = this.esReposicion && !this.activoEnReposicion;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Formulario

  fnCrearFormulario() {
    this.formTicket = this.fb.group(
      {
        empresa: [null, Validators.compose([Validators.required])],
        solicitante: [null, Validators.compose([Validators.required])],
        telefonoSolicitante: [null],
        tipoTicket: [null, Validators.compose([Validators.required])],
        idDetalle: [null],
        detalle: [null],
        observaciones: [null],
        generaReposicion: [false],
        enrrolado: [false],
        activoRelacionado: [null, Validators.compose([Validators.required])],
        personalAsignado: [null, Validators.compose([Validators.required])],
        telefonoAsignado: [null],
        personalTi: [null],
        fechaDevolucion: [null, Validators.compose([Validators.required])],
        fechaEntrega: [null],
        horaEntrega: [null],
        prioridad: [null, Validators.compose([Validators.required])],
        comentario: [null],

        // Campos para revision tecnica
        fechaAltaActivo: [null],
        fechaAsignacionActivo: [null],
        hayGarantia: [false],
        garantiaRestante: [null],

        // Auditoria
        numero: [null],
        usuarioCreacion: null,
        fechaCreacion: '21/07/2021',
        estado: 'Pendiente',
      }
    );
  }

  //#endregion

  //#region Controles

  async fnLlenarComboboxEmpresa(){

    const result = await this._ticketService.GetAllEmpresas();
    if(result.success){
      this.listaEmpresas = result.response.data;
    }
    else{
      this.listaEmpresas = [];
    }
  }

  async fnLlenarComboboxTiposTicket(){

    const result = await this._ticketService.GetAllTiposTicket();
    if(result.success){
      this.listaTipoTicket = result.response.data;
    }
    else{
      this.listaTipoTicket = [];
    }
  }

  async fnLlenarComboboxActivos(){

    let nIdArticulo = 0

    // Si es un prestamo de activo, solo filtramos por los activos de un articulo
    if(this.esPrestamoActivo){
      nIdArticulo = Number(this.formTicket.controls.idDetalle.value);
    }

    const nIdActivo = this.formTicket.controls.activoRelacionado.value || 0;

    const result = await this._ticketService.GetAllActivos(nIdArticulo, Number(nIdActivo));
    if(result.success){
      this.listaActivos = result.response.data;
    }
    else{
      this.listaActivos = [];
    }
  }

  async fnLlenarComboboxSolicitantes(){

    const result = await this._ticketService.GetAllSolicitantes();
    if(result.success){
      this.listaSolicitantes = result.response.data;
    }
    else{
      this.listaSolicitantes = [];
    }
  }

  async fnLlenarComboboxPersonalAsignacion(){

    const result = await this._ticketService.GetAllPersonalAsignacion();
    if(result.success){
      this.listaPersonalAsignado = result.response.data;
    }
    else{
      this.listaPersonalAsignado = [];
    }
  }

  async fnLlenarComboboxPersonalTi(){

    const result = await this._ticketService.GetAllPersonalTi();
    if(result.success){
      this.listaPersonalTi = result.response.data;
    }
    else{
      this.listaPersonalTi = [];
    }
  }

  async fnLlenarComboboxPrioridad(){

    const result = await this._ticketService.GetAllPrioridadesTicket();
    if(result.success){
      this.listaPrioridadTicket = result.response.data;
    }
    else{
      this.listaPrioridadTicket = [];
    }
  }

  fnLlenarComboboxHoraEntrega(){
    for(let i = 6; i < 23; i++){

      const hora = i.toString().length == 2 ? `${i}:00` : `0${i}:00`

      this.listaHoraEntrega.push(hora)
    }
  }

  async fnLlenarChipListCaracteristicasPlanDatos(){
    try{
      const nIdActivo = Number(this.formTicket.get("activoRelacionado").value);
      if(nIdActivo){
        const result: WebApiResponse<ActivoTicketCaracteristicasDTO> = await this._ticketService.GetAllCaracteristicasActivo(nIdActivo);
        this.chipElementsComponentes = result.response.data;

        // Si el activo tiene id, se busca tambien las caracteristicas de sus activos repotenciadores
        const resultRepotenciacion = await this._activoService.GetAllCaracteristicasRepotenciacion(nIdActivo);
        const chipsRepotenciacion = resultRepotenciacion.response.data;

        // Unimos las caracteristicas de repotenciacion al chiplist
        this.chipElementsComponentes = this.chipElementsComponentes.concat(chipsRepotenciacion);

        // Ordenamos las caracteristicas alfabeticamente
        this.chipElementsComponentes = Array.from(this.chipElementsComponentes).sort((a, b) => (a.sDescripcion > b.sDescripcion) ? 1 : ((b.sDescripcion > a.sDescripcion) ? -1 : 0))
      }
    }
    catch(err){
      console.log(err);
    }
  }

  async fnRecuperarDetalleGarantia(){
    if(this.nIdTipoTicket == 2608){

      const sPais = this.storageData.getPais();

      const result = await this._ticketService.GetGarantiaActivoTicket(this.nIdTicket, sPais);

      if(result.success){

        const data = result.response.data[0];

        this.formTicket.patchValue({
          fechaAltaActivo: data.dFechaAlta,
          fechaAsignacionActivo: data.dFechaAsignacion,
          hayGarantia: data.bTieneGarantia,
          garantiaRestante: data.nDiasRestantes,
        })

        this.existeGarantia = true;
      }
    }
    else{
      this.existeGarantia = false;
    }
  }

  fnBloquearControles(): void {
    this.estaEditando = false;
    Object.values(this.formTicket.controls).forEach(control => { control.disable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  fnDesbloquearControles(): void {
    this.estaEditando = true;
    Object.values(this.formTicket.controls).forEach(control => { control.enable() });
    if(!this.estaCreando){
      this.formTicket.controls.empresa.disable();
      this.formTicket.controls.solicitante.disable();
      this.formTicket.controls.detalle.disable();
      this.formTicket.controls.activoRelacionado.disable();
      this.formTicket.controls.tipoTicket.disable();
      this.formTicket.controls.personalAsignado.disable();
      this.formTicket.controls.observaciones.disable();
      this.formTicket.controls.fechaDevolucion.disable();
    }

    // Si es un prestamo de activo, se activa el combobox articulo
    if(this.esPrestamoActivo && this.estaEditando && this.nIdEstado == 2600){
      this.formTicket.controls.activoRelacionado.enable();
      this.formTicket.controls.fechaDevolucion.enable();
    }
    this.fnControlFab(); // Actualizar menu de botones
  }

  //#endregion

  //#region Inicializacion

  // Activar el modo de creacion del activo
  fnModoCreacion(){

    this.estaCreando = true;
    this.fnDesbloquearControles();

    this.formTicket.patchValue({
      usuarioCreacion: this.storageData.getLoginUsuario(),
      fechaCreacion: moment(new Date()).format("DD/MM/YYYY"),
      estado: 'Pendiente'
    });

    this.fnControlFab();
  }

  // Activar el modo de vista previa
  async fnModoVerDetalle(): Promise<Boolean>{

    const result: WebApiResponse<TicketTableDetalleDTO> = await this._ticketService.GetById(this.nIdTicket);

    // Si no encuentra el activo o es un activo de tipo diferente, da error y no continua
    if (!result.success) {
      this.spinner.hide();
      Swal.fire({icon: 'warning', title: 'Advertencia', text: 'No se encontró el detalle'});
      return false;
    }

    const data = result.response.data[0]

    this.estaCreando = false;
    

    this.formTicket.patchValue({

      empresa: data.nIdEmp,
      solicitante: data.nIdSolicitante,
      telefonoSolicitante: data.nTelefonoSolicitante,
      tipoTicket: data.nIdTipoTicket,
      idDetalle: data.nIdArticulo,
      detalle: data.sArticulo,
      observaciones: data.sObservacion,
      generaReposicion: data.bReposicion,
      enrrolado: data.bEnrrolado,
      activoRelacionado: data.nIdActivo,
      personalAsignado: data.nIdAsignado,
      telefonoAsignado: data.nTelefonoAsigna,
      personalTi: data.nIdPersonalTi,
      fechaDevolucion: data.sFechaDevolucion ? moment(data.sFechaDevolucion, 'YYYY-MM-DD') : null,
      fechaEntrega: data.sFechaEntrega ? moment(data.sFechaEntrega, 'YYYY-MM-DD') : null,
      horaEntrega: data.sHoraEntrega,
      prioridad: data.nIdPrioridad,
      // Auditoria
      numero: data.sNumero,
      usuarioCreacion: data.sUsuarioCrea,
      fechaCreacion: moment(data.dFechaCrea).format("DD/MM/YYYY, h:mm:ss"),
      estado: data.sEstado,
    });

    if(data.sArchivoTexto){
      this.sRutaArchivoComentario = data.sArchivoTexto;
      await this.fnRecuperarArchivoTextoComentario();
    }

    // Si es un prestamo de activo y está en pendiente, activamos la flag para prestamo de activos
    if(data.nIdTipoTicket == 2604 && (data.nIdEstado == 2600 || data.nIdEstado == 2602)){
      this.esPrestamoActivo = true;
      await this.fnLlenarComboboxActivos();
    }

    // Si es una reposicion por robo y esta en atencion, activamos la flag para reposicion de activos
    if((data.nIdTipoTicket == 2616 || data.nIdTipoTicket == 2609) && (data.nIdEstado == 2600)){
      this.activoEnReposicion = data.nIdEstadoActivo == 2598;
      this.esReposicion = true;
    }

    // Bloqueamos los controles
    this.fnBloquearControles();

    if(data.nIdPersonalTi){
      if(this.esPrestamoActivo && !data.sFechaEntrega && !data.nIdActivo){
        this.formularioCompleto = false;
      }
      else{
        this.formularioCompleto = true;
      }
      this.sPersonalTiActual = data.sPersonalTi;
      this.nIdPersonalTiActual = data.nIdPersonalTi;
    }

    this.nIdEstado = data.nIdEstado
    this.nIdTipoTicket = data.nIdTipoTicket;
    this.activoExistente = data.nIdActivo ? true : false;
    this.activoAsignado = data.bActivoAsignado;
    this.sPersonalAsignado = data.sAsignado;

    this.fnLlenarChipListCaracteristicasPlanDatos();

    this.fnControlFab();

    return true;
  }

  // Activar el modo de edicion
  fnModoEditar(){
    this.fnDesbloquearControles();
  }

  async fnRecuperarArchivoTextoComentario(){

    const response = await fetch(this.sRutaArchivoComentario);

    console.log(this.sRutaArchivoComentario);
    console.log(this.sRutaArchivoComentario.split("/")[4].split(".")[0]);

    this.formTicket.get("comentario").setValue(await response.text());

  }

  //#endregion

  //#region Acciones

  async fnCrearTicket(){

  }

  async fnGuardarTicket(){

    // Revisar que al ingresar una fecha y hora, se ingresen los dos a la vez
    const formulario = this.formTicket.value;

    const fechaEntrega = formulario.fechaEntrega;
    const fechaDevolucion = formulario.fechaDevolucion;
    const horaEntrega = formulario.horaEntrega;

    if(fechaEntrega && !horaEntrega) {
      Swal.fire({icon: 'warning', title: 'Advertencia', text: 'No se puede guardar una fecha sin hora'});
      this.formTicket.markAllAsTouched();
      return;
    }
    else if(!fechaEntrega && horaEntrega) {
      Swal.fire({icon: 'warning', title: 'Advertencia', text: 'No se puede guardar una hora sin hora'});
      this.formTicket.markAllAsTouched();
      return;
    }

    // Validar formulario
    if(!this.formTicket.valid){
      this.formTicket.markAllAsTouched();
      return;
    }

    const nuevoPersonalTi = Number(this.formTicket.get("personalTi").value);

    let confirma; // Swal de confirmacion de proceso de atencion

    
    if(this.nIdEstado == 2600 && this.sPersonalTiActual && nuevoPersonalTi != this.nIdPersonalTiActual){

      confirma = await Swal.fire({
        title: `¿Desea guardar los cambios?`,
        text: `El ticket está siendo atendido por ${this.sPersonalTiActual}. Se cambiará la persona responsable.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      });

    }
    else{
      confirma = await Swal.fire({
        title: `¿Desea guardar los cambios?`,
        text: `Se modificara el ticket.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      });
    }

    if (!confirma.isConfirmed) {
      return;
    }
    else{

      this.spinner.show();

      const fechaEntregaFormato = fechaEntrega ? fechaEntrega.format("DD/MM/YYYY") : null;
      const fechaDevolucionFormato = fechaDevolucion ? fechaDevolucion.format("DD/MM/YYYY") : null;

      const nIdActivo = Number(this.formTicket.controls.activoRelacionado.value);

      const model: TicketTableDetalleDTO = {
        nIdTicket: this.nIdTicket,
        bReposicion: formulario.generaReposicion,
        bEnrrolado: formulario.enrrolado,
        nIdPersonalTi: formulario.personalTi,
        sFechaEntrega: fechaEntregaFormato,
        sHoraEntrega: horaEntrega,
        nIdUsrModifica: this.storageData.getUsuarioId(),
        nIdPrioridad: formulario.prioridad,
        sPais: this.storageData.getPais(),
        sFechaDevolucion: fechaDevolucionFormato,
        // Campos por si es un prestamo de activo
        bSeAsignaActivo: this.esPrestamoActivo,
        sComentario: formulario.comentario,
        sArchivoTexto: this.sRutaArchivoComentario,
        sFilenameComentario: this.sRutaArchivoComentario ?  this.sRutaArchivoComentario.split("/")[4].split(".")[0] : null,
        nIdActivo: nIdActivo
      }
  
      const result = await this._ticketService.UpdateTicket(model);

      if (!result.success) {
        let mensaje = result.errors.map(item => {
          return item.message
        })
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: mensaje.join(', '),
        });

        // Limpiamos el combobox activo
        this.formTicket.get("activoRelacionado").setValue(null);
        await this.fnLlenarComboboxActivos();

        this.spinner.hide();
        return;
      }

      // Volver a modo detalle para ver vista previa
      await this.fnModoVerDetalle();

      this.spinner.hide();

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se actualizó el ticket',
        showConfirmButton: true
      });

    }
  }

  async fnMandarParaAtencion(){

    if(!this.formTicket.valid && (this.estaCreando || this.estaEditando)){
      this.formTicket.markAllAsTouched();
      return;
    }

    const confirma = await Swal.fire({
      title: `Se iniciará la atención al ticket`,
      text: `Se tendrá en cuenta el tiempo que se toma en cerrar el ticket.`,
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

      const nIdPersonalTI = Number(this.formTicket.controls.personalTi.value);

      const model: TicketTableDetalleAtencionTiempoDTO = {
        nIdUsrInicio: this.storageData.getUsuarioId(),
        sPais: this.storageData.getPais(),
        nIdPersonalTi: nIdPersonalTI,
        bEstado: true,
      }

      const result = await this._ticketService.UpdateTicketEstadoEnProceso(model, this.nIdTicket);

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
        text: 'Comenzó la atención del ticket',
        showConfirmButton: true
      });
    }
  }

  async fnTerminarAtencion(){
    const confirma = await Swal.fire({
      title: `¿Desea marcar el ticket como atendido?`,
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

      this.spinner.show();

      if(this.esReposicion){
        const validacionResult = await this._ticketService.ValidarAtencionReposicionDescuento(this.nIdTicket);

        if(validacionResult.success){

          const validacion = validacionResult.response.data[0];
          
          // Si el activo no se ha mandado a reposicion, no dejar terminar la atencion
          if(!validacion.bReposicion){
            this.spinner.hide();
            Swal.fire({
              icon: 'warning',
              title: ('Alerta'),
              text: 'El activo no se ha mandado a reposición. No se puede terminar la atención',
              showConfirmButton: true
            });
            return;
          }
          // // Avisar si aun no se se realiza el descuento. Preguntar si continuar
          // if(!validacion.bDescuento){
          //   this.spinner.hide();
          //   const confirmaAsignacion: SweetAlertResult<any> = await Swal.fire({
          //     title: 'Alerta',
          //     text: `Aún no se realiza el descuento del activo ¿Desea continuar?`,
          //     icon: 'warning',
          //     showCancelButton: true,
          //     confirmButtonColor: '#3085d6',
          //     cancelButtonColor: '#d33',
          //     confirmButtonText: 'Aceptar',
          //     cancelButtonText: 'Cancelar',
          //   });
    
          //   if (!confirmaAsignacion.isConfirmed) {
          //     this.spinner.hide();
          //     return;
          //   }
          //   else{
          //     this.spinner.show();
          //   }
          // }
        }
        else{
          this.spinner.hide();
          return;
        }
      }

      let observacion = '';

      if(this.esPrestamoActivo){

        const personalAsignado = this.sPersonalAsignado;

        this.spinner.hide();
        const confirmaAsignacion: SweetAlertResult<any> = await Swal.fire({
          title: 'Está realizando una asignación',
          text: `Al realizar el prestamo de activos, este será asignado a ${personalAsignado}`,
          input: 'textarea',
          inputPlaceholder: "Escriba un mensaje con la observación del activo.",
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
        });

        if (!confirmaAsignacion.isConfirmed) {
          return;
        }
        else{
          this.spinner.show();
        }

        const { value: mensaje } = confirmaAsignacion;
        observacion = mensaje;
      }

      const nIdPersonalAsignado = Number(this.formTicket.controls.personalAsignado.value);

      const model: TicketTableDetalleAtencionTiempoDTO = {
        nIdUsrInicio: this.storageData.getUsuarioId(),
        sPais: this.storageData.getPais(),
        bEstado: true,
        bSeAsignaActivo: this.esPrestamoActivo,
        sObservacionAsignacion: observacion,
        nIdPersonalAsignado: nIdPersonalAsignado,
      }

      const result = await this._ticketService.UpdateTicketEstadoAtendido(model, this.nIdTicket);

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
        text: 'El ticket ha sido atendido',
        showConfirmButton: true
      });
    }
  }

  async fnVerImagenesActivo(){

    this.spinner.show();

    // Recuperamos las imagenes de la asignacion actual de un activo
    const nIdActivo = Number(this.formTicket.get("activoRelacionado").value);
    const result = await this._ticketService.GetAllImagenesActivoAsignado(nIdActivo);

    this.spinner.hide();

    if(result.success){
      // Asignamos la lista de imagenes y la cantidad de elementos para el conteo del stepper en el Swal
      const images = result.response.data;
      const steps = images.map((image, index) => {return (index + 1).toString()})

      if(images.length == 0){
        Swal.fire({ icon: 'warning', title: ('No hay imágenes'), text: `Este activo no tiene imágenes`});
        return;
      }

      const swalQueueStep = Swal.mixin({
        confirmButtonText: 'Siguiente',
        cancelButtonText: 'Anterior',
        progressSteps: steps,
        reverseButtons: true,
      })

      await this.backAndForth(swalQueueStep, images);
    }
    else{
      Swal.fire({ icon: 'warning', title: ('Activo inexistente'), text: `Este activo no existe`});
    }
    
  }

  async backAndForth(swalQueueStep, images: TicketImagenAsignacionDTO[]) {

    for (let currentStep = 0; currentStep < images.length;) {

      let result;

      result = await swalQueueStep.fire({
        title: `Imagen N° ${currentStep + 1}`,
        text: images[currentStep].sObservacion,
        imageUrl: images[currentStep].sRutaArchivo, 
        imageHeight: 250,
        showCancelButton: currentStep > 0,
        currentProgressStep: currentStep
      })

      if (result.value) {
        currentStep++
      } else if (result.dismiss === 'cancel') {
        currentStep--
      } else {
        break
      }
    }
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

  fnVerHistorialAsignaciones(){
    this.spinner.show(); // Inicio de spinner

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(TiTicketTiempoAtencionComponent, {
      width: '1200px',
      autoFocus: false,
      disableClose: true,
      //backdropClass: 'backdropBackground',
      data: {
        nIdTicket: this.nIdTicket,
      }
    });

    dialogRef.beforeClosed().subscribe(result => {
      this.mostrarBotones = true;
    });
  }

  async fnDevolverActivo(){

    const confirma = await Swal.fire({
      title: `¿Desea devolver el activo?`,
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

    const result = await this._ticketService.UpdateActivoTicketDevolver(this.nIdTicket);

    if(!result.success){
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

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se devolvió el activo prestado',
        showConfirmButton: true
      });
    }
  }

  async fnDescuentoEfectivo(){

    this.spinner.show();

    const cargoActual = this.listaPersonalAsignado.find((personal) => {return personal.nId == this.formTicket.controls.personalAsignado.value});

    this.mostrarBotones = false;

    const dialogRef = this.dialog.open(TiTicketReposicionComponent, {
      width: '700px',
      autoFocus: false,
      disableClose: true,
      backdropClass: 'backdropBackground',
      data: {
        nIdTicket: this.nIdTicket,
        nIdCargo: cargoActual ? cargoActual.nIdCargo : 0,
        activoEnReposicion: this.activoEnReposicion
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      this.mostrarBotones = true;
      this.fnControlFab();
    });
  }

  async fnReponerActivo(){

    const confirma = await Swal.fire({
      title: `¿Desea mandar el activo a reposición?`,
      text: `El activo seleccionado será marcado como 'En Reposición' y su asignación será removida.`,
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

    const result = await this._ticketService.UpdateActivoReposicion(this.nIdTicket);

    if (!result.success) {
      let mensaje = result.errors.map(item => {
        return item.message
      })
      this.spinner.hide();
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: mensaje.join(', '),
      });
      return;
    }
    else{
      this.spinner.hide();
      Swal.fire({
        title: "Correcto", 
        html: "Se mandó el activo a reposición.",
        icon: "success"
      });
    }

    this.activoEnReposicion = true;
  }

  fnSalir(){
    this.route.navigate(['til/tecnologia/ti-Ticket']);
  }

  //#endregion
}
