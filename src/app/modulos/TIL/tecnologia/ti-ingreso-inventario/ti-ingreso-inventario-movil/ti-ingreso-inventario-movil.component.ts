import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ActivoMovilTIDTO, ActivoRegistroDTO, ActivoSelectItemDTO, ActivoSelectItemArticuloDTO, ActivoCaracteristicasDTO } from '../../api/models/activoDTO';
import { WebApiResponse } from '../../api/models/apiResponse';
import { ActivoService } from '../../api/services/activo.service';

@Component({
  selector: 'app-ti-ingreso-inventario-movil',
  templateUrl: './ti-ingreso-inventario-movil.component.html',
  styleUrls: ['./ti-ingreso-inventario-movil.component.css'],
  animations: [asistenciapAnimations]

})
export class TiIngresoInventarioMovilComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables auxiliares
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada
  tipoActivo = 0; // Guardamos el tipo de activo para el registro
  nIdActivo = 0; // El Id del Activo para ver el detalle
  nIdEstado = 0; // El Id del estado del activo

  // Variables del chip (Componentes)
  chipElementsComponentes: ActivoCaracteristicasDTO[] = [];
  chipElementsCaracteristicas: string[] = [];

  // Formulario
  formMovil: FormGroup;

  // Combobox
  listaArticulosMovil: ActivoSelectItemArticuloDTO [] = [];
  listaNumerosSimcardMovil: ActivoSelectItemDTO[] = [];

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'save', tool: 'Guarda Activo', state: true, color: 'secondary'},
    {icon: 'edit', tool: 'Editar Activo', state: true, color: 'secondary'},
    {icon: 'close', tool: 'Cancelar', state: true, color: 'secondary'},
    {icon: 'image', tool: 'Ver imagen', state: true, color: 'secondary'},
    {icon: 'thumb_down_alt', tool: 'Dar de baja', state: true, color: 'secondary'},
    {icon: 'exit_to_app', tool: 'Salir', state: true, color: 'secondary'}
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Flags
  estaEditando = false; // Flag para activar/desactivar el modo edicion
  estaCreando = false; // Flag para activar/desactivar el modo creacion
  tieneImagen = false;

  // Variables en memoria
  imagenActual;
  titulo = "";

  // Variables para dialogo
  private dialogRef = null;
  private data;
  modoDialog = false;
  
  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private activoService: ActivoService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private injector: Injector
    ) { 
      // Configuracion de formulario
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
        this.titulo = `Ingreso de inventario - Movil`
      }
    }

  async ngOnInit(): Promise<void> {
    this.spinner.show();

    this.onToggleFab(1, -1);

    // Si no hay tipo de activo o el tipo de activo no corresponde, redireccionas a la tabla princiapl
    if(this.tipoActivo == 0 || this.tipoActivo != 2502){
      this.fnSalir();
    }

    // Llenado de controles
    await this.fnLlenarComboboxArticulosMoviles();
    await this.fnLlenarComboboxNumeros();

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
        this.estaCreando ? await this.fnCrearActivo() : await this.fnGuardarActivo();
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
    this.fbLista[3].state = this.tieneImagen;
    this.fbLista[4].state = this.nIdEstado == 2587 || this.nIdEstado == 2589; // En stock = 2587 o es stock provincia = 2589
    this.fbLista[5].state = true; // En stock = 2587 o es stock provincia = 2589

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Formulario

  fnCrearFormulario() {
    this.formMovil = this.fb.group(
      {
        emei: [null, Validators.compose([Validators.required])],
        articuloMovil: [null, Validators.compose([Validators.required])],
        fechaAlta: [new Date(), Validators.compose([Validators.required])],
        fechaBaja: [null],
        numero: [null],
        planDatos: [null],
        tipoDispositivo: [null],

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

  async fnLlenarComboboxArticulosMoviles(){
    try{
      const result = await this.activoService.GetAllDispositivosMoviles();
      this.listaArticulosMovil = result.response.data;
    }
    catch(err){
      console.log(err);
    }
  }

  // Al seleccionar el Articulo dispositivo (Dispositivo movil), se muestran los componentes
  async fnLlenarChipListCaracteristicasDispositivoMovil(){

    this.spinner.show();

    try{
      const nIdArticulo = Number(this.formMovil.get("articuloMovil").value);

      const result = await this.activoService.GetAllCaracteristicas(nIdArticulo);
      this.chipElementsComponentes = result.response.data;
    }
    catch(err){
      console.log(err);
    }

    this.spinner.hide();
  }

  // Al seleccionar el Articulo dispositivo (Dispositivo movil), se recupera la foto
  fnRecuperarFotoArticuloMovil(){
    
    const articuloMovil = this.formMovil.get("articuloMovil").value;

    this.imagenActual = this.listaArticulosMovil.find((articulo)=> articulo.nId == articuloMovil).sRutaArchivo;

    this.tieneImagen = true;
    this.fnControlFab();
  }

  // Al seleccionar el Articulo dispositivo (Dispositivo movil), se recupera el tipo de dispositivo
  fnRecuperarTipoDispositivo(){
    
    const articuloMovil = this.formMovil.get("articuloMovil").value;

    const tipoDispositivo = this.listaArticulosMovil.find((articulo)=> articulo.nId == articuloMovil).sTipoDispositivo;

    this.formMovil.get("tipoDispositivo").setValue(tipoDispositivo)
  }

  async fnLlenarComboboxNumeros(){
    try{
      const result: WebApiResponse<ActivoSelectItemDTO> = await this.activoService.GetAllNumerosSimcard(this.nIdActivo);
      this.listaNumerosSimcardMovil = result.response.data;
    }
    catch(err){
      console.log(err);
    }
  }

  async fnRecuperarPlanDatos(){
    try{

      const numeroSimcard = this.formMovil.get("numero").value;

      if(numeroSimcard){
        this.spinner.show();

        const result: WebApiResponse<ActivoSelectItemDTO> = await this.activoService.GetPlanDatosByNumeroSimcard(numeroSimcard);
        const planDatos = result.response.data[0]
        
        this.formMovil.patchValue({
          planDatos: planDatos.sDescripcion
        });

        await this.fnLlenarChipListCaracteristicasPlanDatos(planDatos.nId);

        this.spinner.hide();
      }
      else{

        // Si no hay numero, limpiar el plan de datos y las caracteristicas
        this.formMovil.patchValue({
          planDatos: null
        });
        this.chipElementsCaracteristicas = [];
      }

    }
    catch(err){
      console.log(err);
    }
    
  }

  async fnLlenarChipListCaracteristicasPlanDatos(id: Number){
    try{
      const result: WebApiResponse<string> = await this.activoService.GetAllCaracteristicasPaquete(id);
      this.chipElementsCaracteristicas = result.response.data
    }
    catch(err){
      console.log(err);
    }
  }

  fnBloquearControles(): void {
    this.estaEditando = false;
    Object.values(this.formMovil.controls).forEach(control => { control.disable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  fnDesbloquearControles(): void {
    this.estaEditando = true;
    Object.values(this.formMovil.controls).forEach(control => { control.enable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  //#endregion

  //#region Inicializacion

  // Activar el modo de creacion del activo
  fnModoCreacionActivo(){

    this.estaCreando = true;
    this.tieneImagen = false;
    this.fnDesbloquearControles();

    this.formMovil.patchValue({
      usuarioCreacion: this.storageData.getLoginUsuario(),
      fechaCreacion: moment(new Date()).format("DD/MM/YYYY, h:mm:ss"),
      estado: 'Pendiente'
    })
    
    this.formMovil.get("fechaBaja").disable(); // Deshabilitar la fecha de baja

    this.fnControlFab();
  }

  // Activar el modo de vista previa
  async fnModoVerDetalle(): Promise<Boolean>{

    const result: WebApiResponse<ActivoRegistroDTO> = (await this.activoService.GetActivoById(this.nIdActivo));

    // Si no encuentra el activo o es un activo de tipo diferente, da error y no continua
    if (!result.success || result.response.data[0].nIdTipo != 2502) {
      this.spinner.hide();
      Swal.fire({icon: 'warning', title: 'Advertencia', text: 'No se encontró el activo'});
      return false;
    }

    const data = result.response.data[0]

    this.estaCreando = false;
    this.fnBloquearControles();

    this.formMovil.patchValue({
      emei: data.sImei,
      articuloMovil: data.nIdArticulo,
      fechaAlta: data.dFechaAlta,
      fechaBaja: data.dFechaBaja, // Agregando un dia al dia actual en milisegundos
      numero: data.nIdSimCard == 0 ? null : data.nIdSimCard,

      // Auditoria
      usuarioCreacion: data.sNombreUsuarioCrea,
      fechaCreacion: moment(data.dFechaCrea).format("DD/MM/YYYY, h:mm:ss"),
      usuarioModificacion: data.sNombreUsuarioModifica,
      fechaModificacion: moment(data.dFechaModifica).format("DD/MM/YYYY, h:mm:ss"),
      usuarioBaja: data.sNombreUsuarioBaja,
      estado: data.sEstado,
    })

    this.nIdEstado = data.nIdEstado;

    this.fnRecuperarFotoArticuloMovil();
    this.fnRecuperarTipoDispositivo();

    await this.fnRecuperarPlanDatos();
    await this.fnLlenarChipListCaracteristicasDispositivoMovil();

    this.fnControlFab();

    return true;
  }

  // Activar el modo de edicion
  fnModoEditar(){
    this.fnDesbloquearControles();
  }

  //#endregion

  //#region Acciones

  async fnCrearActivo(){

    if(this.formMovil.valid){

      const data = this.formMovil.value;

      const nuevoArticulo = this.listaArticulosMovil.find((numero) => numero.nId == data.articuloMovil).sDescripcion;

      const confirma = await Swal.fire({
        title: '¿Desea guardar el activo?',
        html: `Se creará el activo (Movil) del dispositivo <b>${nuevoArticulo}</b>`,
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
      
      const model: ActivoMovilTIDTO = {
        nIdActivo: 0,
        nIdTipo: this.tipoActivo,
        nIdArticulo: data.articuloMovil,
        sCodActivo: 
          data.numero != null ? // Verificamos si tiene numero, si tiene se asigna como codigo, si no tiene se asigna el dispositivo
          this.listaNumerosSimcardMovil.find(numero => numero.nId == data.numero).sDescripcion.trim().split(' ')[0]:
          this.listaArticulosMovil.find(articulo => articulo.nId == data.articuloMovil).sDescripcion.trim().split(' ')[0],
        sImei: data.emei,
        nIdSimCard: data.numero || 0,
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

        const result: WebApiResponse<ActivoRegistroDTO> = (await this.activoService.CreateActivoMovil(model));

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
  
        const activoResponse: ActivoMovilTIDTO = result.response.data[0];

        this.formMovil.markAsUntouched();
        
        this.spinner.hide();

        Swal.fire({
          icon: 'success',
          title: ('Correcto'),
          text: 'Se creó el registro',
          showConfirmButton: false,
          timer: 1500
        });
  
        // Recargar la pagina para ver el detalle
        this.route.navigate(['til/tecnologia/ti-ingreso-inventario/activo', this.tipoActivo ,'movil', activoResponse.nIdActivo]);  
    
        
      }
      catch(err){
        console.log(err);
      }
    }
    else{
      this.formMovil.markAllAsTouched();
    }

    this.fnControlFab();

  }

  async fnGuardarActivo(){
    if(this.formMovil.valid){

      const data = this.formMovil.value;

      const nuevoArticulo = this.listaArticulosMovil.find((numero) => numero.nId == data.articuloMovil).sDescripcion;

      const confirma = await Swal.fire({
        title: '¿Desea guardar el activo?',
        html: `Se modificará el activo (Movil) del dispositivo <b>${nuevoArticulo}</b>`,
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
      
      const model: ActivoMovilTIDTO = {
        nIdActivo: this.nIdActivo,
        nIdTipo: this.tipoActivo,
        nIdArticulo: data.articuloMovil,
        sCodActivo: 
          data.numero != null ? // Verificamos si tiene numero, si tiene se asigna como codigo, si no tiene se asigna el dispositivo
          this.listaNumerosSimcardMovil.find(numero => numero.nId == data.numero).sDescripcion.trim().split(' ')[0]:
          this.listaArticulosMovil.find(articulo => articulo.nId == data.articuloMovil).sDescripcion.trim().split(' ')[0],
        sImei: data.emei,
        nIdSimCard: data.numero || 0,
        dFechaAlta: data.fechaAlta,
        dFechaBaja: data.fechaBaja,
        nIdUsuarioModifica: this.storageData.getUsuarioId(),
        dFechaModifica: moment(data.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
        nIdEstado: 1
      }

      try{

        this.spinner.show();

        const result: WebApiResponse<ActivoRegistroDTO> = (await this.activoService.UpdateActivoMovil(model));

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
    
        this.formMovil.markAsUntouched();
      }
      catch(err){
        console.log(err);
      }
      
    }
    else{
      this.formMovil.markAllAsTouched();
    }

    this.fnControlFab();
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

  fnVerImagen(){
    if(this.imagenActual != null && this.imagenActual != ''){
      const {
        articuloMovil
      } = this.formMovil.value;

      // Obtenemos el codigo y el nombre del articulo
      const descripcionArticulo = this.listaArticulosMovil.find(articulo => articulo.nId == articuloMovil).sDescripcion;
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
      await this.activoService.UpdateActivoDarBaja(model);

      // Volver a cargar el detalle
      await this.fnModoVerDetalle();
    }
  }

  //#endregion

  // Salir a la tabla principal
  fnSalir(){
    this.route.navigate(['til/tecnologia/ti-ingreso-inventario/']);
  }
}
