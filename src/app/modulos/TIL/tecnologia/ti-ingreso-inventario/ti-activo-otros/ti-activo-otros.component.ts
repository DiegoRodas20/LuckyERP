import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ActivoCaracteristicasDTO, ActivoRegistroDTO, ActivoSelectItemArticuloDTO, ActivoSelectItemDTO } from '../../api/models/activoDTO';
import { WebApiResponse } from '../../api/models/apiResponse';
import { EArticulo } from '../../api/models/articuloDTO';
import { ActivoService } from '../../api/services/activo.service';
import { ArticuloService } from '../../api/services/articulo.service';

@Component({
  selector: 'app-ti-activo-otros',
  templateUrl: './ti-activo-otros.component.html',
  styleUrls: ['./ti-activo-otros.component.css'],
  animations: [asistenciapAnimations]
})
export class TiActivoOtrosComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables auxiliares
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada
  nIdActivo: number;
  nIdEstado: number = 0;
  imagenActual: string; // La ruta de la imagen actual del articulo seleccionado
  titulo: string = 'Registro de Otros Activos';
  

  // Variables del chip (Componentes)
  chipElementsComponentes: ActivoCaracteristicasDTO[] = [];

  // Formulario
  formActivoOtros: FormGroup;

  // Combobox
  listaSubFamilia: ActivoSelectItemDTO [] = [];
  listaTipoDispositivo: ActivoSelectItemDTO[] = [];
  listaArticulos: ActivoSelectItemArticuloDTO[] = [];

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'save', tool: 'Crear Activos', state: true, color: 'secondary'},
    {icon: 'thumb_down_alt', tool: 'Dar de baja', state: true, color: 'secondary'}
  ];
  
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Flags
  estaEditando: boolean = false; // Flag para activar/desactivar el modo edicion
  estaCreando: boolean = false; // Flag para activar/desactivar el modo creacion
  tieneImagen: boolean = false; // Flag para ver si existe imagen

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private _activoService: ActivoService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private _articuloService: ArticuloService,
    //private injector: Injector,
    public dialogRef: MatDialogRef<TiActivoOtrosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { 
    // Configuracion de formulario
    this.fnCrearFormulario();

    if(data.vistaPrevia){
      this.mostrarBotones = false;
    }
  }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1, -1);

    this.nIdActivo = this.data.nIdActivo;
    
    await this.fnLlenarComboboxSubFamilias();

    if(this.nIdActivo){
      this.titulo = 'Detalle del activo';
      // Visualizacion del detalle
      const existeActivo = await this.fnModoVerDetalle();
      // Si no existe el activo, volvemos a la tabla principal
      !existeActivo ? this.fnSalir() : null;
    }

    this.fnControlFab();

    this.spinner.hide();

    this.estaCargado = true;
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
        this.fnCrearActivos();
        break;
      case 1:
        this.fnDarBaja();
        break;
      case 2:
        this.fnSalir();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){
    console.log(this.nIdEstado);
    this.fbLista[1].state = this.nIdEstado != 2591 && this.nIdEstado != 0;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Formulario

  fnCrearFormulario() {
    this.formActivoOtros = this.fb.group(
      {
        subFamilia: [null, Validators.compose([Validators.required])],
        tipoDispositivo: [null, Validators.compose([Validators.required])],
        cantidadActivos: [null, Validators.compose([Validators.required])],
        articulo: [null, Validators.compose([Validators.required])],
        codigoActivo: [null]
      }
    );
  }

  //#endregion

  //#region Controles

  async fnLlenarComboboxSubFamilias(){
    const result = await this._articuloService.getAllItem(EArticulo.SUBFAMILIA);
    this.listaSubFamilia = result;
  }

  async fnLlenarComboboxTipoDispositivo(tipo: number){
    const nIdSubFamilia = this.formActivoOtros.get("subFamilia").value;

    if(tipo == 1) {// Si se esta creando
      this.formActivoOtros.patchValue({
        tipoDispositivo : null,
        articulo: null
      })
    }

    const result = await this._articuloService.GetAllTipoDispositivo(nIdSubFamilia);
    this.listaTipoDispositivo = result;
  }

  async fnLlenarComboboxArticulos(tipo: number){
    const nIdTipoDispositivo = this.formActivoOtros.get("tipoDispositivo").value;

    if(tipo == 1) {// Si se esta creando
      this.formActivoOtros.patchValue({
        articulo: null
      })
    }

    const result = await this._activoService.GetAllArticulosByTipoDispositivo(nIdTipoDispositivo);
    this.listaArticulos = result.response.data;
  }

  async fnLlenarChipListCaracteristicasArticulo(){

    try{
      const nIdArticulo = Number(this.formActivoOtros.get("articulo").value);

      if(nIdArticulo) {
        const result = await this._activoService.GetAllCaracteristicas(nIdArticulo);
        this.chipElementsComponentes = result.response.data;
        this.fnRecuperarFotoArticulo(); // Recuperamos la foto de la imagen
      }
      else{
        this.chipElementsComponentes = [];
      }
      
    }
    catch(err){
      console.log(err);
    }
  }

  //#endregion

  //#region Inicializacion

  async fnModoVerDetalle(){
    const result: WebApiResponse<ActivoRegistroDTO> = (await this._activoService.GetActivoById(this.nIdActivo));

    // Si no encuentra el activo o es un activo de tipo diferente, da error y no continua
    if (!result.success) {
      this.spinner.hide();
      Swal.fire({icon: 'warning', title: 'Advertencia', text: 'No se encontró el activo'});
      return false;
    }

    const data = result.response.data[0]

    this.estaCreando = false;
    this.fnBloquearControles();

    this.formActivoOtros.patchValue({
      subFamilia: data.nIdSubFamilia
    })

    await this.fnLlenarComboboxTipoDispositivo(2);

    this.formActivoOtros.patchValue({
      tipoDispositivo: data.nIdTipoDispositivo,
      codigoActivo: data.sCodActivo
    })

    await this.fnLlenarComboboxArticulos(2);

    this.formActivoOtros.patchValue({
      articulo: data.nIdArticulo
    })

    await this.fnLlenarChipListCaracteristicasArticulo();

    this.nIdEstado = data.nIdEstado;

    if(this.nIdActivo){
      this.formActivoOtros.get("cantidadActivos").clearValidators();
      this.formActivoOtros.get("cantidadActivos").updateValueAndValidity();
    }

    this.fnControlFab();

    return true;
  }

  fnBloquearControles(): void {
    this.estaEditando = false;
    Object.values(this.formActivoOtros.controls).forEach(control => { control.disable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  fnDesbloquearControles(): void {
    this.estaEditando = true;
    Object.values(this.formActivoOtros.controls).forEach(control => { control.enable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  //#endregion

  //#region Acciones

  async fnCrearActivos(){

    if(this.formActivoOtros.valid){
      const listaActivos: ActivoRegistroDTO[] = [];

      const cantidad = Number(this.formActivoOtros.get("cantidadActivos").value);
      const nIdArticulo = Number(this.formActivoOtros.get("articulo").value);
      const sTipoDispositivo = this.listaTipoDispositivo.find(tipo => tipo.nId == this.formActivoOtros.get("tipoDispositivo").value)
  
      for(let i = 0; i < cantidad; i++){
  
        const model: ActivoRegistroDTO = {
          nIdTipo: 2505,
          nIdArticulo: nIdArticulo,
          sCodActivo: sTipoDispositivo.sDescripcion,
          nIdUsuarioCrea: this.storageData.getUsuarioId(),
          nIdUsuarioModifica: this.storageData.getUsuarioId(),
          sPais: this.storageData.getPais()
        }
  
        listaActivos.push(model);
      }
  
      const result = await this._activoService.CreateActivoOtros(listaActivos);

      if (result.success){

        Swal.fire({
          icon: 'success',
          title: ('Correcto'),
          text: 'Se crearon los registros',
          showConfirmButton: true
        });

        this.fnSalir(true);
      }
    }
    else{
      this.formActivoOtros.markAllAsTouched();
    }

  }

  fnRecuperarFotoArticulo(){
    
    const nIdArticulo = this.formActivoOtros.get("articulo").value;

    this.imagenActual = this.listaArticulos.find((articulo)=> articulo.nId == nIdArticulo).sRutaArchivo;

    if(this.imagenActual == null || this.imagenActual == ''){
      this.tieneImagen = false;
    }
    else{
      this.tieneImagen = true;
    }
    
    this.fnControlFab();
  }

  fnVerImagen(){
    if(this.imagenActual != null && this.imagenActual != ''){
      const {
        articulo
      } = this.formActivoOtros.value;

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

      // Salir del Dialog
      this.fnControlFab();
      this.spinner.hide();
      this.fnSalir(true);
    }
  }

  //#endregion

  //#region Validaciones

  // Metodo para validar que no se ingresen caracteres especiales
  fnValidarCaracteresNumericos(event){

    const invalidChars = ["-","+","e","."];

    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

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

  fnValidarCeros(){
    const cantidad = Number(this.formActivoOtros.get("cantidadActivos").value);
    if(cantidad == 0){
      this.formActivoOtros.get("cantidadActivos").setValue(null);
    }
  }

  //#endregion

  fnSalir(activoCreado?: boolean){
    this.dialogRef.close(activoCreado);
  }

}
