import { Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { LiquidacionesService } from 'src/app/modulos/control-costos/liquidaciones/liquidaciones.service';
import Swal from 'sweetalert2';
import { ActivoCaracteristicasDTO, ActivoTipoDTO } from '../../../api/models/activoDTO';
import { AsignacionDirectaSeleccionDetalleArchivoDTO, AsignacionDirectaSeleccionDetalleDTO, AsignacionDirectaSeleccionDTO, AsignacionDirectaSelectItemDTO } from '../../../api/models/asignacionDirectaDTO';
import { ActivoService } from '../../../api/services/activo.service';
import { AsignacionDirectaService } from '../../../api/services/asignacion-directa.service';
import { TiAsignacionDialogDescuentoComponent } from '../ti-asignacion-dialog-descuento/ti-asignacion-dialog-descuento.component';
import { TiAsignacionDialogObservacionesComponent } from '../ti-asignacion-dialog-observaciones/ti-asignacion-dialog-observaciones.component';
import { TiAsignacionAgregarParteComponent } from './ti-asignacion-agregar-parte/ti-asignacion-agregar-parte.component';

@Component({
  selector: 'app-ti-asignacion-dialog-crear-activo',
  templateUrl: './ti-asignacion-dialog-crear-activo.component.html',
  styleUrls: ['./ti-asignacion-dialog-crear-activo.component.css'],
  animations: [asistenciapAnimations]
})
export class TiAsignacionDialogCrearActivoComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Formulario
  formAsignacionActivo: FormGroup;

  // Combobox
  listaActivos: AsignacionDirectaSelectItemDTO[] = [];
  listaTipoActivos: ActivoTipoDTO[] = [];

  // Archivo
  listaObservaciones: AsignacionDirectaSeleccionDetalleArchivoDTO[] = [];
  
  // Imagen
  rutaImagen = null;
  rutaDocumento = null;

  // Chiplist (Observaciones)
  chipElementsObservacionesEntrega: AsignacionDirectaSeleccionDetalleArchivoDTO[] = [];
  chipElementsObservacionesDevolucion: AsignacionDirectaSeleccionDetalleArchivoDTO[] = [];
  // Chiplist (Componentes)
  chipElementsComponentes: ActivoCaracteristicasDTO[] = [];

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'cloud_download', tool: 'Descargar formato descuento', state: true, color: 'secondary'},
    {icon: 'cloud_upload', tool: 'Subir descuento firmado', state: true, color: 'secondary'},
    {icon: 'cloud_download', tool: 'Descargar descuento firmado', state: true, color: 'secondary'},
    {icon: 'add', tool: 'Asignar nueva parte', state: true, color: 'secondary'},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  titulo = 'Asignar Activo'

  // Flags
  estaCreando: boolean = false;
  estaEditando: boolean = false;
  estaDevolviendo: boolean = false;
  existeDescuento: boolean = false;
  vistaTotal: boolean = false; // Visualizar todas las observaciones
  existeDescuentoEfectivo: boolean = false;
  existePenalidad: boolean = false;

  quitarAsignacion = new EventEmitter();

  constructor(
    private spinner: NgxSpinnerService,
    private _activoService: ActivoService,
    private _asignacionDirectaService: AsignacionDirectaService,
    private _liquidacionesService: LiquidacionesService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TiAsignacionDialogCrearActivoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog, // Declaracion del Dialog
  ) {

    this.onToggleFab(1, -1);

    this.fnCrearFormulario();

    // Si existen observaciones, las recuperamos del registro seleccionado
    if(data.registroActual || data.vistaTotal){
      this.vistaTotal = data.vistaTotal;
      this.listaObservaciones = data.observaciones || [];
      this.data.observaciones.map((observacion) =>{
        if(observacion.nTipoAccion == 1){
          this.chipElementsObservacionesEntrega.push(observacion);
        }
        else if(observacion.nTipoAccion == 2){
          this.chipElementsObservacionesDevolucion.push(observacion);
        }
      });
    }

    // Si esta devolviendo, activamos el flag
    this.estaDevolviendo = data.estaDevolviendo;

  }

  async ngOnInit(): Promise<void> {

    this.fnControlFab();

    // Si tiene registro a modificar, se modifica
    if(this.data.registroActual){
      await this.fnModoEditar();
    }
    else{
      this.estaCreando = true;
      this.mostrarBotones = false;
      await this.fnLlenarComboboxTipoActivos();
    }

    if(this.data.estaEditando){
      this.fnDesbloquearControles();
    }
    else{
      this.titulo = 'Detalle de la Asignacion'
      this.fnBloquearControles();
    }

    this.fnControlFab();

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
        await this.fnDescargarPDFDescuento();
        break;
      case 1:
        await this.fnSubirDocumentoDescuento();
        break;
      case 2:
        await this.fnDescargarDocumentoFirmado();
        break;
      case 3:
        await this.fnAsignacionParteActivo();
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){

    const tipoActivo = Number(this.formAsignacionActivo.get("tipoActivo").value)

    this.fbLista[0].state = this.existeDescuento && this.rutaDocumento == null;
    this.fbLista[1].state = this.existeDescuento && this.rutaDocumento == null;
    this.fbLista[2].state = this.existeDescuento && this.rutaDocumento != null;
    this.fbLista[3].state = !this.estaCreando && tipoActivo == 2501;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Formulario

  fnCrearFormulario() {
    this.formAsignacionActivo = this.fb.group({
      tipoActivo: [{value: null, disabled: true}],
      activo: [{value: null, disabled: true}, Validators.compose([Validators.required])],
      importeDescuento: [{value: null, disabled: true}, Validators.compose([Validators.pattern("^[0-9]+\.?[0-9]*$")])],

      // Penalidad por perfil equipo
      importeEfectivo: [null],
      penalidad: [null],
      usuarioAsigno: [null],
      fechaAsigno: [null],

      datosActivo: [null],
      observacion: ['']
    })
  }

  //#endregion

  //#region Controles

  async fnLlenarComboboxTipoActivos(){
    const result = await this._activoService.GetAllTipos();

    // Filtramos los activos que no queremos mostrar
    this.listaTipoActivos = result.response.data//.filter((tipoActivo => tipoActivo.nId != 2503 && tipoActivo.nId != 2505));
  }

  async fnLlenarComboboxActivos(tipo: number){

    this.spinner.show();

    // Limpiamos el activo seleccionado
    if(tipo == 1){
      this.formAsignacionActivo.get("activo").setValue(null);
      await this.fnLlenarChipListCaracteristicasArticulo();
      await this.fnRecuperarDetalleActivo();
  
      // Actualizamos los validadores
      // this.formAsignacionActivo.get("importeDescuento").clearValidators();
      // this.formAsignacionActivo.get("importeDescuento").updateValueAndValidity();

      this.spinner.hide();
    }

    const nIdActivo = this.data.registroActual ? this.data.registroActual.nIdActivo : 0;

    const tipoActivo = Number(this.formAsignacionActivo.get("tipoActivo").value)
    const result = await this._asignacionDirectaService.GetAllActivosAsignacion(tipoActivo, nIdActivo);
    this.listaActivos = result.response.data;

  }

  async fnLlenarImporteDescuentoInicial(nIdActivo: number){

    const sPais = this.storageData.getPais();

    const result = await this._asignacionDirectaService.GetImporteDescuentoInicial(nIdActivo, this.data.nIdCargo, sPais);

    if(result.success){

      const importe = result.response.data[0];

      if(importe == 0){
        this.formAsignacionActivo.get("importeDescuento").setValue(null);
      }
      else{
        this.formAsignacionActivo.get("importeDescuento").setValue(importe);
      }

    }

  }

  // Al seleccionar el Activo se muestran los componentes del artículo
  async fnLlenarChipListCaracteristicasArticulo(){

    try{
      const nIdActivo = Number(this.formAsignacionActivo.get("activo").value);

      if(nIdActivo) {

        const activoObject = this.listaActivos.find(activo => activo.nId == nIdActivo);

        if(activoObject){
          const nIdArticulo = activoObject.nIdArticulo;
          this.rutaImagen = activoObject.sRutaArchivo;
          const result = await this._activoService.GetAllCaracteristicas(nIdArticulo);
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
      else{
        this.chipElementsComponentes = [];
        this.rutaImagen = null;
      }
      
    }
    catch(err){
      console.log(err);
    }
  }

  // Al seleccionar el Activo se muestra una descripción del activo
  async fnRecuperarDetalleActivo(){

    try{
      const nIdActivo = Number(this.formAsignacionActivo.get("activo").value);

      // Si se ha seleccionado un articulo
      if(nIdActivo) {

        // Recuperamos la descripcion del articulo
        const result = await this._activoService.GetDescripcionActivo(nIdActivo);

        // Si tiene descripcion, se asigna al input correspondiente y se muestra en pantalla
        if(result.success){
          const descripcion = result.response.data[0];
          this.formAsignacionActivo.get('datosActivo').setValue(descripcion);
          //this.fnValidarRequerimientoImporte(descripcion);
          
        }
      }
      else{
        this.formAsignacionActivo.get('datosActivo').setValue(null);
      }
      
    }
    catch(err){
      console.log(err);
    }
  }

  // Se valida si el importe es requerido o no, para creacion de documento de descuento
  // fnValidarRequerimientoImporte(descripcion){
    
  //   if(descripcion != null && descripcion != ""){
  //     // Si en la descripcion figura la addenda, el importe para el documento es requerido
  //     const descripcionMinuscula = descripcion.toLowerCase();
  //     if(descripcionMinuscula.includes("addenda")){
  //       this.formAsignacionActivo.get("importeDescuento").setValidators([Validators.required, Validators.pattern("^[0-9]+\.?[0-9]*$")]);
  //     }
  //     // Si en la descripcion no figura la addenda, el importe es opcional
  //     else{
  //       this.formAsignacionActivo.get("importeDescuento").clearValidators();
  //     }

  //     // Actualizamos los validadores
  //     this.formAsignacionActivo.get("importeDescuento").updateValueAndValidity();
  //   }
  //   else{
  //     this.formAsignacionActivo.get("importeDescuento").clearValidators();
  //     this.formAsignacionActivo.get("importeDescuento").updateValueAndValidity();
  //   }
    
  // }

  async fnRecuperarDescripcionActivo(){

    try{
      const nIdActivo = Number(this.formAsignacionActivo.get("activo").value);

      // Si se ha seleccionado un activo
      if(nIdActivo) {

        // Recuperamos el objeto del activo para recuperar su articulo
        const activoObject = this.listaActivos.find(activo => activo.nId == nIdActivo);

        // Si el objeto del activo existe, recuperamos las caracteristicas de su articulo
        if(activoObject){
          const nIdArticulo = activoObject.nIdArticulo;
          this.rutaImagen = activoObject.sRutaArchivo;
          const result = await this._activoService.GetAllCaracteristicas(nIdArticulo);
          this.chipElementsComponentes = result.response.data;

          // Si el activo tiene id, se busca tambien las caracteristicas de sus activos repotenciadores
          const resultRepotenciacion = await this._activoService.GetAllCaracteristicasRepotenciacion(nIdActivo);
          console.log(resultRepotenciacion);
          const chipsRepotenciacion = resultRepotenciacion.response.data;

          // Unimos las caracteristicas de repotenciacion al chiplist
          this.chipElementsComponentes = this.chipElementsComponentes.concat(chipsRepotenciacion);

          // Ordenamos las caracteristicas alfabeticamente
          this.chipElementsComponentes = Array.from(this.chipElementsComponentes).sort((a, b) => (a.sDescripcion > b.sDescripcion) ? 1 : ((b.sDescripcion > a.sDescripcion) ? -1 : 0))
        }

      }
      else{
        this.chipElementsComponentes = [];
        this.rutaImagen = null;
      }
      
    }
    catch(err){
      console.log(err);
    }
  }

  async fnModoEditar(){

    this.estaEditando = true;
    this.titulo = this.estaDevolviendo ? 'Devolver Activo Asignado' :'Detalle Asignación'

    const registroActual: AsignacionDirectaSeleccionDetalleDTO = this.data.registroActual;

    this.existePenalidad = registroActual.nIdPenalidad != null;

    // Guardamos la ruta del documento
    this.rutaDocumento = registroActual.sRutaArchivo;

    this.formAsignacionActivo.patchValue({
      importeDescuento: registroActual.nImporte ? registroActual.nImporte.toFixed(2) : null,
      importeEfectivo: registroActual.nImporteEfectivo ? registroActual.nImporteEfectivo.toFixed(2) : null,
      usuarioAsigno: registroActual.sUsuarioEntrega,
      fechaAsigno: registroActual.dFechaEntrega,
      penalidad: registroActual.nPenalidad ? registroActual.nPenalidad.toFixed(2) : null
    })

    // Llenamos los tipos de activo
    await this.fnLlenarComboboxTipoActivos();
    this.formAsignacionActivo.patchValue({
      tipoActivo: registroActual.nIdTipoActivo,
    })

    // Llenamos los activos
    await this.fnLlenarComboboxActivos(2);
    this.formAsignacionActivo.patchValue({
      activo: registroActual.nIdActivo,
      observacion: registroActual.sObservacion
    })
    
    await this.fnLlenarChipListCaracteristicasArticulo();
    await this.fnRecuperarDetalleActivo();
  }

  fnBloquearControles(): void {
    Object.values(this.formAsignacionActivo.controls).forEach(control => { control.disable() });

    // Si se esta editando y el registro que se edita no esta en base de datos (No tiene ID) se puede modificar el monto del descuento
    // Si se esta editando y el registro que se edita si esta en base de datos (Tiene ID) se puede descargar su formato del documento y subir el documento firmado
    this.fnVerificarSubidaDocumentoDescuento();
  }

  fnDesbloquearControles(): void {
    Object.values(this.formAsignacionActivo.controls).forEach(control => { control.enable() });

    // Si no se crea se desactiva el combobox activos
    if(!this.estaCreando){
      this.formAsignacionActivo.controls.activo.disable();
      this.formAsignacionActivo.controls.tipoActivo.disable();
    }

    // Si se esta editando y el registro que se edita no esta en base de datos (No tiene ID) se puede modificar el monto del descuento
    // Si se esta editando y el registro que se edita si esta en base de datos (Tiene ID) se puede descargar su formato del documento y subir el documento firmado
    this.fnVerificarSubidaDocumentoDescuento();
    
    // Si es vista total (Para Historial de Observaciones) se deshabilita también la observacion, quedando todo deshabilitado
    if(this.vistaTotal){
      this.formAsignacionActivo.controls.observacion.disable()
    }
  }

  fnVerificarSubidaDocumentoDescuento(){
    // Si se esta editando y el registro que se edita no esta en base de datos (No tiene ID) se puede modificar el monto del descuento
    if(this.data.registroActual){

      // Verificamos si existen descuentos
      if(this.data.registroActual.nIdDetActivoAsigna != 0 && this.data.registroActual.nIdDetActivoAsigna != null){

        this.formAsignacionActivo.controls.importeDescuento.disable();

        // Verificar descuento inicial
        if(this.data.registroActual.nIdDescuento){
          this.existeDescuento = true;
        }
        else {
          this.existeDescuento = false;
        }

        // Verificar descuento efectivo
        if(this.data.registroActual.nIdDescuentoEfectivo){
          this.existeDescuentoEfectivo = true;
        }
        else {
          this.existeDescuentoEfectivo = false;
        }
      }
      else {
        this.existeDescuento = false;
        this.existeDescuentoEfectivo = false;
      }
    }
    else{
      this.existeDescuento = false;
    }
  }

  //#endregion

  //#region Fotos de Activo

  // Volver la imagen a base 64
  fnImagenABase64(file): Promise<any>{
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async fnVerImagenObservacion(observacion: AsignacionDirectaSeleccionDetalleArchivoDTO){

    const urlImagen = observacion.sRutaArchivo || await this.fnImagenABase64(observacion.file);
    let indice = 0;
    if(observacion.nTipoAccion == 1){
      indice = this.chipElementsObservacionesEntrega.findIndex(imagen => imagen == observacion);
    }
    else if(observacion.nTipoAccion == 2){
      indice = this.chipElementsObservacionesDevolucion.findIndex(imagen => imagen == observacion);
    }
    else{
      return;
    }

    Swal.fire({
      title: 'Observacion N° ' + (Number(indice) + 1),
      text: observacion.sObservacion,
      imageUrl: urlImagen, 
      imageHeight: 250,
    });
  }

  //#endregion

  //#region Acciones

  fnAbrirDialogAgregarObservaciones(){

    if(this.formAsignacionActivo.valid){
      const nIdActivo = this.formAsignacionActivo.get("activo").value
    
      const dialogRef = this.dialog.open(TiAsignacionDialogObservacionesComponent, {
        width: '1000px',
        autoFocus: false,
        disableClose: true,
        data: {
          nIdActivo: nIdActivo,
          tipoAccion: this.estaDevolviendo ? 2 : 1 // Si esta devolviendo, el tipo de accion es 2
        }
      });
  
      dialogRef.componentInstance.guardarObservacion.subscribe((observacion: AsignacionDirectaSeleccionDetalleArchivoDTO) => {
        
        this.listaObservaciones.push(observacion);

        if(observacion.nTipoAccion == 1){
          this.chipElementsObservacionesEntrega.push(observacion);
        }
        else if(observacion.nTipoAccion == 2){
          this.chipElementsObservacionesDevolucion.push(observacion);
        }
      });
  
      dialogRef.beforeClosed().subscribe(async result => {});
    }
    else{
      this.formAsignacionActivo.markAllAsTouched();
    }
  }

  async fnCambiarComboboxActivo(){

    this.spinner.show();

    const nIdActivo = this.formAsignacionActivo.get("activo").value;

    // Si se esta creando, buscar el importe inicial de acuerdo al activo
    if(this.estaCreando){
      await this.fnLlenarImporteDescuentoInicial(nIdActivo);
    }

    await this.fnLlenarChipListCaracteristicasArticulo(); 
    await this.fnRecuperarDetalleActivo();

    if(nIdActivo){
      this.listaObservaciones.map(observacion => observacion.nIdActivo = nIdActivo);
    }

    this.spinner.hide();
  }

  async fnAgregarActivo(){

    if(this.formAsignacionActivo.valid){

      // Recuperamos los valores del formulario
      const tipoActivo = this.formAsignacionActivo.controls.tipoActivo.value;
      const activo = this.formAsignacionActivo.controls.activo.value;
      const importeDescuento = this.formAsignacionActivo.controls.importeDescuento.value;
      const observacion = this.formAsignacionActivo.controls.observacion.value;

      const existeActivo = this.data.listaDetalleActual.find(asignacion => asignacion.nIdActivo == activo);
      const existeTipoActivo = this.data.listaDetalleActual.find(asignacion => asignacion.nIdTipoActivo == tipoActivo);
      
      if(existeActivo){
        Swal.fire("Alerta", "El activo que desea asignar ya se encuentra asignado", "warning");
        return;
      }

      if(existeTipoActivo){
        const confirma = await Swal.fire({
          title: "Alerta",
          html: `¿El tipo de activo <b>${existeTipoActivo.sTipoActivo}</b> ya ha sido asignado. Desea asignarlo de todas maneras?`,
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
      }

      const tipoActivoDescripcion = this.listaTipoActivos.find((tipo) => tipo.nId == tipoActivo);

      const result = await this._activoService.GetActivoById(activo);
      const data = result.response.data[0];

      // Extaemos el nombre del articulo
      const descripcionArticulo = result.response.data[0].sArticulo;
      const codigoArticulo = descripcionArticulo.split(' ')[0];
      const nombreArticulo = descripcionArticulo.slice(codigoArticulo.length + 2, descripcionArticulo.length);
  
      const registro: AsignacionDirectaSeleccionDetalleDTO = {
        nIdDetActivoAsigna: 0,
        nIdActivoAsigna: 0,
        nIdActivo: activo,
        sActivo: data.sCodActivo,
        nIdTipoActivo: tipoActivo,
        sTipoActivo: tipoActivoDescripcion.sDescripcion,
        sAddenda: data.sAddenda,
        nRepos: 0,
        sObservacion: observacion,
        nIdUsuarioEntrega: this.storageData.getUsuarioId(),
        sUsuarioEntrega: this.storageData.getLoginUsuario(),
        dFechaEntrega: new Date(),
        dFecha: new Date(),
        nIdDescuento: 0,
        nIdPersonal: this.data.nIdPersonal,
        sArticulo: nombreArticulo,
        sPais: this.storageData.getPais(),
        nIdEmp: this.data.nIdEmp,
        sEmpresa: this.data.sEmpresa,
        bEstado: true,
        nImporte: importeDescuento == null || importeDescuento == '' ? 0 : importeDescuento,
        sRutaArchivo: this.rutaDocumento,
        observaciones: this.listaObservaciones
      }
  
      this.dialogRef.close(registro);
    }
    else{
      this.formAsignacionActivo.markAllAsTouched();
    }
  }

  async fnModificarActivo(){
    if(this.formAsignacionActivo.valid){

      // Recuperamos los valores del formulario
      const tipoActivo = this.formAsignacionActivo.controls.tipoActivo.value;
      const activo = this.formAsignacionActivo.controls.activo.value;
      const importeDescuento = this.formAsignacionActivo.controls.importeDescuento.value;
      const observacion = this.formAsignacionActivo.controls.observacion.value;

      const tipoActivoDescripcion = this.listaTipoActivos.find((tipo) => tipo.nId == tipoActivo);

      const result = await this._activoService.GetActivoById(activo);
      const data = result.response.data[0];

      // Extaemos el nombre del articulo
      const descripcionArticulo = result.response.data[0].sArticulo;
      const codigoArticulo = descripcionArticulo.split(' ')[0];
      const nombreArticulo = descripcionArticulo.slice(codigoArticulo.length + 2, descripcionArticulo.length);

      const registroActual: AsignacionDirectaSeleccionDetalleDTO = this.data.registroActual;
  
      const registroNuevo: AsignacionDirectaSeleccionDetalleDTO = {
        nIdDetActivoAsigna: registroActual.nIdDetActivoAsigna,
        nIdActivoAsigna: registroActual.nIdActivoAsigna,
        nIdActivo: activo,
        sActivo: data.sCodActivo,
        nIdTipoActivo: tipoActivo,
        sTipoActivo: tipoActivoDescripcion.sDescripcion,
        sAddenda: data.sAddenda,
        nRepos: 0,
        sObservacion: observacion,
        nIdUsuarioEntrega: this.storageData.getUsuarioId(),
        sUsuarioEntrega: this.storageData.getLoginUsuario(),
        dFechaEntrega: registroActual.dFechaEntrega,
        dFecha: registroActual.dFecha,
        nIdDescuento: registroActual.nIdDescuento,
        nIdPersonal: this.data.nIdPersonal,
        sArticulo: nombreArticulo,
        sPais: this.storageData.getPais(),
        nIdEmp: registroActual.nIdEmp,
        sEmpresa: registroActual.sEmpresa,
        bEstado: true,
        nImporte: importeDescuento == null || importeDescuento == '' ? 0 : Number(importeDescuento),
        sRutaArchivo: this.rutaDocumento,
        observaciones: this.listaObservaciones
      }
      
      this.dialogRef.close(registroNuevo);
    }
    else{
      this.formAsignacionActivo.markAllAsTouched();
    }
  }

  async fnDevolverActivo(){
    if(this.formAsignacionActivo.valid){

      // Recuperamos los valores del formulario
      const tipoActivo = this.formAsignacionActivo.controls.tipoActivo.value;
      const activo = this.formAsignacionActivo.controls.activo.value;
      const importeDescuento = this.formAsignacionActivo.controls.importeDescuento.value;
      const observacion = this.formAsignacionActivo.controls.observacion.value;

      const tipoActivoDescripcion = this.listaTipoActivos.find((tipo) => tipo.nId == tipoActivo);

      const result = await this._activoService.GetActivoById(activo);
      const data = result.response.data[0];

      // Extaemos el nombre del articulo
      const descripcionArticulo = result.response.data[0].sArticulo;
      const codigoArticulo = descripcionArticulo.split(' ')[0];
      const nombreArticulo = descripcionArticulo.slice(codigoArticulo.length + 2, descripcionArticulo.length);

      const registroActual: AsignacionDirectaSeleccionDetalleDTO = this.data.registroActual;
  
      const registroDevuelto: AsignacionDirectaSeleccionDetalleDTO = {
        nIdDetActivoAsigna: registroActual.nIdDetActivoAsigna,
        nIdActivoAsigna: registroActual.nIdActivoAsigna,
        nIdActivo: activo,
        sActivo: data.sCodActivo,
        nIdTipoActivo: tipoActivo,
        sTipoActivo: tipoActivoDescripcion.sDescripcion,
        sAddenda: data.sAddenda,
        nRepos: 0,
        sObservacion: observacion,
        nIdUsuarioEntrega: this.storageData.getUsuarioId(),
        sUsuarioEntrega: this.storageData.getLoginUsuario(),
        dFechaEntrega: registroActual.dFechaEntrega,
        nIdUsuarioDevolucion: this.storageData.getUsuarioId(),
        sUsuarioDevolucion: this.storageData.getLoginUsuario(),
        dFechaDevolucion: new Date(),
        dFecha: registroActual.dFecha,
        nIdDescuento: registroActual.nIdDescuento,
        nIdPersonal: this.data.nIdPersonal,
        sArticulo: nombreArticulo,
        sPais: this.storageData.getPais(),
        nIdEmp: registroActual.nIdEmp,
        sEmpresa: registroActual.sEmpresa,
        bEstado: false,
        nImporte: importeDescuento == null || importeDescuento == '' ? 0 : importeDescuento,
        sRutaArchivo: this.rutaDocumento,
        observaciones: this.listaObservaciones,
      }
      
      this.dialogRef.close(registroDevuelto);
    }
    else{
      this.formAsignacionActivo.markAllAsTouched();
    }
  }

  fnVerImagen(){
    if(this.rutaImagen != null && this.rutaImagen != ''){
      const activo = this.formAsignacionActivo.controls.activo.value;

      // Obtenemos el codigo y el nombre del articulo
      const descripcionArticulo = this.listaActivos.find(activoElement => activoElement.nId == activo).sDescripcion;
      const codigoArticulo = descripcionArticulo.split(' ')[0];
      const nombreArticulo = descripcionArticulo.slice(codigoArticulo.length + 2, descripcionArticulo.length);

      Swal.fire({ title: codigoArticulo, text: nombreArticulo, imageUrl: this.rutaImagen, imageHeight: 250 });
    }
    else{
      Swal.fire({ icon: 'warning', title: ('No hay imagen'), text: `Este artículo no tiene imagen`});
    }
  }

  // Descarga Formato PDF del descuento a firmar
  async fnDescargarPDFDescuento() {

    // Id del descuento del documento
    let nIdDescuento;
    const registroActual: AsignacionDirectaSeleccionDetalleDTO = this.data.registroActual;

    if(this.existeDescuentoEfectivo){
      const confirma = await Swal.fire({
        title: `¿Qué descuento desea efectuar?`,
        text: `Se descargará el PDF de acuerdo al tipo de descuento seleccionado`,
        icon: 'question',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Inicial',
        denyButtonText: `Efectivo`,
        cancelButtonText: 'Cancelar',
      });

      if (confirma.isConfirmed) {
        nIdDescuento = registroActual.nIdDescuento
      }
      else if (confirma.isDenied){
        nIdDescuento = registroActual.nIdDescuentoEfectivo
      }
      else{
        return;
      }
    }
    else{
      nIdDescuento = registroActual.nIdDescuento
    }    

    this.spinner.show();

    const pEntidad = 4;
    const pOpcion = 2;
    const pParametro = [];
    const pTipo = 1;

    pParametro.push(nIdDescuento);
    pParametro.push(this.storageData.getEmpresa())

    const result = await this._asignacionDirectaService.fnDescargarPDFDescuento(pEntidad, pOpcion, pParametro, pTipo);

    // Descargar pdf
    const data = result;
    const fileName = `AD-${registroActual.nIdDescuento}.pdf`; // Formato del nombre de la plantilla de descuento vacia

    saveAs(data, fileName);

    const objectUrl = window.URL.createObjectURL(data);
    // const link = document.createElement('a');
    // link.href = objectUrl;
    // link.download = fileName;
    // // Trigger de descarga
    // link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    this.spinner.hide();

    Swal.fire({
      title: 'El documento ha sido generado',
      html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
      icon: 'success',
      showCloseButton: true
    })
  }

  async fnSubirDocumentoDescuento(){

    const confirma = await Swal.fire({
      title: `¿Desea realizar el descuento?`,
      text: `Si se realiza un descuento, el activo seleccionado será marcado como 'En Reposición' y será desasignado.`,
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

    // Id del descuento del documento
    let bTipoDescuento;
    const registroActual: AsignacionDirectaSeleccionDetalleDTO = this.data.registroActual;

    if(this.existeDescuentoEfectivo){
      const confirmaDescuento = await Swal.fire({
        title: `¿Qué descuento desea efectuar?`,
        text: `Se descargará el PDF de acuerdo al tipo de descuento seleccionado`,
        icon: 'question',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Inicial',
        denyButtonText: `Efectivo`,
        cancelButtonText: 'Cancelar',
      });

      if (confirmaDescuento.isConfirmed) {
        bTipoDescuento = true // Tipo de descuento: Inicial
      }
      else if (confirmaDescuento.isDenied){
        bTipoDescuento = false // Tipo de descuento: Efectivo
      }
      else{
        return;
      }
    }
    else{
      bTipoDescuento = true
    }  

    this.mostrarBotones = false;
    
    const dialogRef = this.dialog.open(TiAsignacionDialogDescuentoComponent, {
      width: '1000px',
      autoFocus: false,
      disableClose: true,
      data: {
        nIdDetActivoAsigna: registroActual.nIdDetActivoAsigna,
        bTipoDescuento: bTipoDescuento
      }
    });

    dialogRef.beforeClosed().subscribe(async (result: AsignacionDirectaSeleccionDetalleDTO) => {
      if(result){
        this.spinner.show();
        this.fnSalir();
        this.spinner.hide();
      }
      
      this.mostrarBotones = true;
    });
    
  }

  async fnDescargarDocumentoFirmado(){

    const registroActual: AsignacionDirectaSeleccionDetalleDTO = this.data.registroActual;

    // Descargar pdf
    const fileName = `AD-${registroActual.nIdDescuento}.pdf`; // Formato del nombre de la plantilla de descuento vacia


    const response = await fetch(this.rutaDocumento);
    const data = await response.blob();
    const objectUrl = window.URL.createObjectURL(data)

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    // Trigger de descarga
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    //saveAs(data, fileName);
  }

  fnAsignacionParteActivo(){

    this.spinner.show();

    this.mostrarBotones = false;

    const nIdActivo = Number(this.formAsignacionActivo.get("activo").value);
    const nombreActivo = this.listaActivos.find(activo => activo.nId = nIdActivo);

    const dialogRef = this.dialog.open(TiAsignacionAgregarParteComponent, {
      width: '1250px',
      autoFocus: false,
      disableClose: true,
      data: {
        nIdActivo: nIdActivo,
        nombreActivo: nombreActivo ? nombreActivo.sDescripcion : 'Activo desconocido'
      }
    });

    dialogRef.beforeClosed().subscribe(async (result) => {
     
      this.mostrarBotones = true;
    });
  }

  //#endregion

  // Metodo para validar que no se ingresen caracteres especiales
  fnValidarCaracteresNumericos(event){

    const invalidChars = ["-","+","e"];

    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  fnValidarCaracteresNumericosClipboard(event: ClipboardEvent){

    const invalidChars = ["-","+","e"];

    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    const valor = pastedText.split('')

    invalidChars.map((letra)=>{
      if (valor.includes(letra)) {
        event.preventDefault();
      }
    })
  }

  fnSalir(){
    this.dialogRef.close();
  }
}
