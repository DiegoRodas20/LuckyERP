import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ActivoDTO, ActivoRegistroDTO, ActivoSelectItemDTO, ActivoSimcardTIDTO } from '../../api/models/activoDTO';
import { WebApiResponse } from '../../api/models/apiResponse';
import { ActivoService } from '../../api/services/activo.service';
import { TiIngresoInventarioSimcardExcelComponent } from './ti-ingreso-inventario-simcard-excel/ti-ingreso-inventario-simcard-excel.component';

@Component({
  selector: 'app-ti-ingreso-inventario-simcard',
  templateUrl: './ti-ingreso-inventario-simcard.component.html',
  styleUrls: ['./ti-ingreso-inventario-simcard.component.css'],
  animations: [asistenciapAnimations]
})
export class TiIngresoInventarioSimcardComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables auxiliares
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada
  tipoActivo = 0; // Guardamos el tipo de activo para el registro
  nIdActivo = 0; // El Id del Activo para ver el detalle

  // Variables del chip (Componentes)
  chipElementsPlanDatos = [];

  // Formulario
  formSimcard: FormGroup;

  // Combobox
  listaOperadores: ActivoSelectItemDTO[] = [];
  listaPlanDatos: ActivoSelectItemDTO[] = [];

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'save', tool: 'Guarda Activo', state: true, color: 'secondary'},
    {icon: 'edit', tool: 'Editar Activo', state: true, color: 'secondary'},
    {icon: 'close', tool: 'Cancelar', state: true, color: 'secondary'},
    {icon: 'cloud_upload', tool: 'Adición multiple', state: true, color: 'secondary'},
    {icon: 'thumb_down_alt', tool: 'Dar de baja', state: true, color: 'secondary'},
    {icon: 'exit_to_app', tool: 'Salir', state: true, color: 'secondary'}
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Flags
  estaEditando = false; // Flag para activar/desactivar el modo edicion
  estaCreando = false; // Flag para activar/desactivar el modo creacion
  nIdEstado = 0;


  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private activoService: ActivoService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog, // Declaracion del Dialog
  ) { 
    // Configuracion de formulario
    this.crearFormulario();
  }

  async ngOnInit(): Promise<void> {
    this.spinner.show();

    this.onToggleFab(1, -1);

    this.tipoActivo = Number(this.activatedRoute.snapshot.paramMap.get('idTipoActivo'));
    this.nIdActivo = Number(this.activatedRoute.snapshot.paramMap.get('idActivo'));

    // Si no hay tipo de activo o el tipo de activo no corresponde, redireccionas a la tabla princiapl
    if(this.tipoActivo == 0 || this.tipoActivo != 2503){
      this.fnSalir();
    }
    
    // Llenado de controles
    await this.fnLlenarComboboxOperadores();

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

    this.fnControlFab();

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
        this.estaCreando ? await this.fnCrearActivo() : await this.fnGuardarActivo();
        break;
      case 1:
        this.fnModoEditar();
        break;
      case 2:
        this.fnCancelar();
        break;
      case 3:
        this.fnAdicionMultiple();
        break;
      case 4:
        this.fnDarBaja();
        break;
      case 5:
        this.fnSalir();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){
    this.fbLista[0].state = (this.estaEditando || this.estaCreando) && this.nIdEstado != 2591;
    this.fbLista[1].state = (!this.estaEditando) && this.nIdEstado != 2591;
    this.fbLista[2].state = (this.estaEditando) && this.nIdEstado != 2591;
    this.fbLista[3].state = this.estaCreando;
    this.fbLista[4].state = this.nIdEstado == 2587 || this.nIdEstado == 2589; // En stock = 2587 o es stock provincia = 2589

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Formulario

  crearFormulario() {
    this.formSimcard = this.fb.group(
      {
        numero: [null, Validators.compose([Validators.required])],
        codigo: [null, Validators.compose([Validators.required])],
        fechaAlta: [new Date(), Validators.compose([Validators.required])],
        fechaBaja: [null], // La fecha baja no debe ingresarse ni modificarse durante la creacion
        operador: [null, Validators.compose([Validators.required])],
        planDatos: [null, Validators.compose([Validators.required])],

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

  //#region Inicializacion

  // Activar el modo de creacion del activo
  fnModoCreacionActivo(){

    this.estaCreando = true;
    this.fnDesbloquearControles();

    this.formSimcard.patchValue({
      usuarioCreacion: this.storageData.getLoginUsuario(),
      fechaCreacion: moment(new Date()).format("DD/MM/YYYY, h:mm:ss"),
      estado: 'Pendiente'
    })

    this.formSimcard.get("fechaBaja").disable(); // Deshabilitar la fecha de baja
    
  }

  // Activar el modo de vista previa
  async fnModoVerDetalle(): Promise<Boolean>{

    const result: WebApiResponse<ActivoRegistroDTO> = (await this.activoService.GetActivoById(this.nIdActivo));

    if (!result.success) {
      if (!result.success || result.response.data[0].nIdTipo != 2503) {
        this.spinner.hide();
        Swal.fire({icon: 'warning', title: 'Advertencia', text: 'No se encontró el activo'});
        return false;
      }
    }

    this.estaCreando = false; // Desactivas modo creacion y bloquear controles
    this.fnBloquearControles();
    
    const data = result.response.data[0]

    this.formSimcard.patchValue({
      numero: data.sNumeroSim,
      codigo: data.sCodigoSimCard,
      fechaAlta: data.dFechaAlta,
      fechaBaja: data.dFechaBaja,
      operador: data.nIdMarca,
      planDatos: data.nIdArticulo,

      // Auditoria
      usuarioCreacion: data.sNombreUsuarioCrea,
      fechaCreacion: moment(data.dFechaCrea).format("DD/MM/YYYY, h:mm:ss"),
      usuarioModificacion: data.sNombreUsuarioModifica,
      fechaModificacion: moment(data.dFechaModifica).format("DD/MM/YYYY, h:mm:ss"),
      usuarioBaja: data.sNombreUsuarioBaja,
      estado: data.sEstado,
    })

    this.nIdEstado = data.nIdEstado;

    await this.fnLlenarComboboxPlanDatos(2);

    // Actualizamos el combobox recien llenado
    this.formSimcard.patchValue({
      planDatos: data.nIdArticulo
    })

    await this.fnLlenarChipListCaracteristicasPaquetes();

    this.fnControlFab();

    return true;
  }

  // Activar el modo de edicion
  fnModoEditar(){
    this.fnDesbloquearControles();
  }

  //#endregion

  //#region Controles

  async fnLlenarComboboxOperadores(){
    try{
      const result = await this.activoService.GetAllOperadores();
      this.listaOperadores = result.response.data;
    }
    catch(err){
      console.log(err);
    }
  }

  // Al seleccionar el operador, se muestra los planes de datos
  async fnLlenarComboboxPlanDatos(tipo: Number){

    this.spinner.show();

    try{
      const nIdOperador = Number(this.formSimcard.get("operador").value);

      const result = await this.activoService.GetAllPlanDatos(nIdOperador);
      this.listaPlanDatos = result.response.data;

      // Actualizar combobox Plan datos y caracteristicas
      this.formSimcard.patchValue({
        planDatos: null
      })
      if(tipo == 1){ // Si se esta actualizando el combobox
        this.chipElementsPlanDatos = [];
      }
      
    }
    catch(err){
      console.log(err);
    }

    this.spinner.hide();
  }

  // Al seleccionar el plan de datos, se muestran las caracteristicas
  async fnLlenarChipListCaracteristicasPaquetes(){

    this.spinner.show();

    try{
      const nIdArticulo = Number(this.formSimcard.get("planDatos").value);

      const result = await this.activoService.GetAllCaracteristicasPaquete(nIdArticulo);
      this.chipElementsPlanDatos = result.response.data;
    }
    catch(err){
      console.log(err);
    }

    this.spinner.hide();
  }

  fnBloquearControles(): void {
    this.estaEditando = false;
    Object.values(this.formSimcard.controls).forEach(control => { control.disable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  fnDesbloquearControles(): void {
    this.estaEditando = true;
    Object.values(this.formSimcard.controls).forEach(control => { control.enable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  fnLimpiarFechaBaja(){
    this.formSimcard.get("fechaBaja").setValue(null);
  }

  //#endregion

  //#region Acciones

  async fnCrearActivo(){

    if(this.formSimcard.valid){

      const data = this.formSimcard.value;

      const confirma = await Swal.fire({
        title: '¿Desea guardar el activo?',
        html: `Se creará el activo (Simcard) con el número <b>${data.numero}</b>`,
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
      
      const model: ActivoSimcardTIDTO = {
        nIdActivo: 0,
        nIdTipo: this.tipoActivo,
        nIdArticulo: data.planDatos,
        sCodActivo: data.numero.toString(), // El codigo del simcard es el numero telefonico
        sNumeroSim: data.numero.toString(),
        sCodigoSimCard: data.codigo,
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

        const result: WebApiResponse<ActivoRegistroDTO> = (await this.activoService.CreateActivoSimcard(model));

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
  
        const activoResponse: ActivoSimcardTIDTO = result.response.data[0];

        this.formSimcard.markAsUntouched();
        
        this.spinner.hide();

        Swal.fire({
          icon: 'success',
          title: ('Correcto'),
          text: 'Se creó el registro',
          showConfirmButton: false,
          timer: 1500
        });
  
        // Recargar la pagina para ver el detalle
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', this.tipoActivo ,'simcard', activoResponse.nIdActivo]);  
    
        
      }
      catch(err){
        console.log(err);
      }
    }
    else{
      this.formSimcard.markAllAsTouched();
    }

    this.fnControlFab();

  }

  async fnGuardarActivo(){
    if(this.formSimcard.valid){

      const data = this.formSimcard.value;

      const confirma = await Swal.fire({
        title: '¿Desea guardar el activo?',
        html: `Se modificará el activo (Simcard) con el nuevo número <b>${data.numero}</b>`,
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
      
      const model: ActivoSimcardTIDTO = {
        nIdActivo: this.nIdActivo,
        nIdTipo: this.tipoActivo,
        nIdArticulo: data.planDatos,
        sCodActivo: data.numero.toString(), // Elcodigo del simcard es el numero telefonico
        sNumeroSim: data.numero.toString(),
        sCodigoSimCard: data.codigo,
        dFechaAlta: data.fechaAlta,
        dFechaBaja: data.fechaBaja,
        nIdUsuarioModifica: this.storageData.getUsuarioId(),
        dFechaModifica: moment(data.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
        nIdEstado: 1
      }

      try{

        this.spinner.show();

        const result: WebApiResponse<ActivoRegistroDTO> = await this.activoService.UpdateActivoSimcard(model);

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

        Swal.fire({
          icon: 'success',
          title: ('Correcto'),
          text: 'Se actualizó el registro',
          showConfirmButton: false,
          timer: 1500
        });
    
        this.formSimcard.markAsUntouched();
      }
      catch(err){
        console.log(err);
      }
      
    }
    else{
      this.formSimcard.markAllAsTouched();
    }

    this.fnControlFab();
  }

  async fnCancelar(){

    const confirma = await Swal.fire({
      title: '¿Desea cancelar la edición?',
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

  fnAdicionMultiple(){
    this.spinner.show(); // Inicio de spinner

    this.mostrarBotones = false; // Ocultar botones de opciones

    const {operador, planDatos} = this.formSimcard.value;

    const operadorDescripcion = operador ? this.listaOperadores.find(operadorItem => operadorItem.nId == operador).sDescripcion : null;
    const planDatosDescripcion = planDatos ? this.listaPlanDatos.find(planDatosItem => planDatosItem.nId == planDatos).sDescripcion : null;

    const dialogRef = this.dialog.open(TiIngresoInventarioSimcardExcelComponent, {
      width: '1000px',
      autoFocus: false,
      data: {
        tipoActivo: this.tipoActivo,
        operadorDescripcion,
        planDatosDescripcion,
      }
    });

    dialogRef.beforeClosed().subscribe(result => {
      this.mostrarBotones = true;
    });
  }
  //#endregion

  // Metodo para validar que no se ingresen caracteres especiales
  fnValidarCaracteresNumericos(event){

    const invalidChars = ["-","+","e","."];

    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  // Metodo para validar que no se ingresen caracteres especiales al pegar
  fnValidarCaracteresNumericosClipboard(event: ClipboardEvent){

    const invalidChars = ["-","+","e","."];

    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    const valor = pastedText.split('')

    invalidChars.map((letra)=>{
      if (valor.includes(letra)) {
        event.preventDefault();
      }
    })
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
      await this.activoService.UpdateActivoDarBaja(model);

      // Volver a cargar el detalle
      await this.fnModoVerDetalle();
    }
  }

  // Salir a la tabla principal
  fnSalir(){
    this.estaCargado = false;
    this.route.navigate(['til/tecnologia/ti-ingreso-inventario/']);
  }

}
