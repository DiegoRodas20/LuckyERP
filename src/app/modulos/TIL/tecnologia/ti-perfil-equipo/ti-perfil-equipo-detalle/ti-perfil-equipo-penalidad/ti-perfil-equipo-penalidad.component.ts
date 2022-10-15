import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { PerfilEquipoPenalidadDetalleDTO, PerfilEquipoPenalidadDTO, PerfilEquipoSelectItemDTO } from '../../../api/models/perfilEquipoTIDTO';
import { PerfilEquipoService } from '../../../api/services/perfil-equipo.service';
import { TiActivoAsignacionHistorialComponent } from '../../../ti-ingreso-inventario/ti-activo-asignacion-historial/ti-activo-asignacion-historial';

@Component({
  selector: 'app-ti-perfil-equipo-penalidad',
  templateUrl: './ti-perfil-equipo-penalidad.component.html',
  styleUrls: ['./ti-perfil-equipo-penalidad.component.css'],
  animations: [asistenciapAnimations]
})
export class TiPerfilEquipoPenalidadComponent implements OnInit {

  // Variables del LocalStorage
  storageData: SecurityErp = new SecurityErp();

  // Formulario
  formPenalidad: FormGroup;

  // Variables auxiliares
  nIdPenalidad: number = 0; // Id de la penalidad
  nIdPenalidadActual: number = 0; // Id de la penalidad actual
  nIdPerfil: number = 0; // Perfil de la penalidad
  nIdTipoActivo: number = 0; // Tipo de dispositivo
  sTitulo: string = ''; // Titulo del dialog
  nPrecioVentaActual: number = 0;
  nPrecioNoDevolucionActual: number = 0;

  // Combobox
  listaPenalidadesPasadas: PerfilEquipoSelectItemDTO[] = [];

  // Mat-Table (Celulares)
  dataSource: MatTableDataSource<PerfilEquipoPenalidadDetalleDTO>;
  listaDetallePenalidadMoviles: PerfilEquipoPenalidadDetalleDTO[] = [];
  displayedColumns: string[] = ["nMesSiniestro", "nPrecioCalculado", "nCostoNuevo", "nPrecioTotal"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla
  pipeTable: DatePipe;

  // Mat-Table (Laptop / Desktop)
  dataSourceLaptopDesktop: MatTableDataSource<PerfilEquipoPenalidadDetalleDTO>;
  listaDetallePenalidadLaptopDesktop: PerfilEquipoPenalidadDetalleDTO[] = [];
  displayedColumnsLaptopDesktop: string[] = ["nMesSiniestro", "nPrecioCalculado", "nNoDevolucion", "nPrecioTotal"];
  @ViewChild(MatPaginator) paginatorLaptopDesktop: MatPaginator;
  @ViewChild(MatSort) sortLaptopDesktop: MatSort;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'add', tool: 'Crear Penalidad', state: true},
    {icon: 'edit', tool: 'Modificar Penalidad', state: true},
    {icon: 'save', tool: 'Guardar Penalidad', state: true},
    {icon: 'close', tool: 'Cancelar Creación', state: true},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Flags
  estaEditando = false;

  constructor(
    private spinner: NgxSpinnerService,
    private _perfilEquipoService: PerfilEquipoService,
    public dialogRef: MatDialogRef<TiActivoAsignacionHistorialComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog, // Declaracion del Dialog
    private fb: FormBuilder
  ) {

    // Inicializar tabla
    this.dataSource = new MatTableDataSource(this.listaDetallePenalidadMoviles);
    this.dataSourceLaptopDesktop = new MatTableDataSource(this.listaDetallePenalidadLaptopDesktop);

    // Inicializamos variables
    this.nIdPerfil = this.data.nIdPerfil;
    this.nIdPenalidad = this.data.nIdPenalidad;
    this.nIdPenalidadActual = this.data.nIdPenalidad;
    this.nIdTipoActivo = this.data.nIdTipoActivo

    if(this.nIdPenalidad){
      this.sTitulo = 'Detalle de la penalidad';
    }
    else{
      this.sTitulo = 'Crear penalidad';
    }
  }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1, -1);

    await this.fnCrearFormulario()
    await this.fnInicializarFormulario();

    if(this.nIdPenalidad != 0 && this.nIdPenalidad != null) {
      await this.fnRecuperarPenalizacion(this.nIdTipoActivo);
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
        this.nIdTipoActivo == 1657 ? this.fnCrearPenalidadMoviles() : this.fnCrearPenalidadLaptopDesktop(); // La penalidad depende del tipo de activo
        break;
      case 1:
        this.nIdTipoActivo == 1657 ? this.fnModificarPenalidadMoviles() : this.fnModificarPenalidadLaptopDesktop(); // La penalidad depende del tipo de activo
        break;
      case 2:
        this.nIdTipoActivo == 1657 ? this.fnGuardarPenalidadMoviles() : this.fnGuardarPenalidadLaptopDesktop(); // La penalidad depende del tipo de activo
        break;
      case 3:
        this.fnRecuperarPenalizacion(this.nIdTipoActivo); // La penalidad depende del tipo de activo
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){

    this.fbLista[0].state = (this.nIdPenalidad == 0 || this.nIdPenalidad == null) && this.nIdPenalidad == this.nIdPenalidadActual; 
    this.fbLista[1].state = this.nIdPenalidad != 0 && this.nIdPenalidad != null && !this.estaEditando && this.nIdPenalidad == this.nIdPenalidadActual; 
    this.fbLista[2].state = this.nIdPenalidad != 0 && this.nIdPenalidad != null && this.estaEditando && this.nIdPenalidad == this.nIdPenalidadActual; 
    this.fbLista[3].state = this.nIdPenalidad != 0 && this.nIdPenalidad != null && this.estaEditando && this.nIdPenalidad == this.nIdPenalidadActual; 
    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Creacion del formulario

  fnCrearFormulario(): Promise<void>{
    return new Promise((resolve) => {

      // Formulario para dispositivos moviles
      if(this.nIdTipoActivo == 1657){
        this.formPenalidad = this.fb.group({
          precioLista: [null],
          cantidadMeses: [null],
          precioVenta: [null, Validators.compose([Validators.required])],
          penalidadPasada: [null]
        })
      }
      // Formulario para laptop/desktop
      else if(this.nIdTipoActivo == 1658){
        this.formPenalidad = this.fb.group({
          precioLista: [null],
          cantidadMeses: [null],
          noDevolucion: [null, Validators.compose([Validators.required])],
          valorMensual: [null],
          penalidadPasada: [null]
        })
      }
      
      resolve();
    })
  }
  
  //#endregion

  //#region Controles

  fnInicializarFormulario(): Promise<void>{
    return new Promise((resolve) => {
      // Formulario para dispositivos moviles
      if(this.nIdTipoActivo == 1657){
        this.formPenalidad.patchValue({
          precioLista: this.data.precioLista.toFixed(2),
          cantidadMeses: 18
        })
      }
      // Formulario para laptop/desktop
      else if(this.nIdTipoActivo == 1658){
        this.formPenalidad.patchValue({
          precioLista: this.data.precioLista.toFixed(2),
          cantidadMeses: 36,
          valorMensual: (Number(this.data.precioLista) / 36).toFixed(2)
        })
      }
      resolve();
    })
  }

  //#endregion

  //#region Acciones

  async fnCrearPenalidadMoviles(){
    if(this.formPenalidad.valid){

      const formData = this.formPenalidad.value;

      if(Number(formData.precioVenta) >= Number(formData.precioLista)){
        Swal.fire("Verificar","El precio de venta no puede ser mayor o igual al precio de lista", "warning");
        return;
      }

      this.spinner.show();

      const modelPenalidad: PerfilEquipoPenalidadDTO = {
        nIdPerfilEquipo: this.nIdPerfil,
        nPrecioVenta: formData.precioVenta,
        nCosto: formData.precioLista,
        nIdUsrRegistro: this.storageData.getUsuarioId(),
        bEstado: true,
        sPais: this.storageData.getPais(),
        detalle: [],
      }

      for(let i = 1; i <= formData.cantidadMeses; i++){

        const precioCalculado = Math.round((Number(formData.precioLista) - Number(formData.precioVenta)) * ((Number(formData.cantidadMeses) - i + 1) / (Number(formData.cantidadMeses))));

        modelPenalidad.detalle.push({
          nMesSiniestro: i,
          // (PL – PV) x ((cantidadMeses - mes actual)/cantidadMeses)
          nPrecioCalculado: precioCalculado,
          nCostoNuevo: Number(formData.precioVenta),
          nPrecioTotal: Number(formData.precioVenta) + precioCalculado
        })
      }

      const result = await this._perfilEquipoService.CreatePenalidad(modelPenalidad);

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
        return false;
      }

      this.nIdPenalidad = result.response.data[0].nIdPenalidad;
      this.nIdPenalidadActual = result.response.data[0].nIdPenalidad;

      this.sTitulo = 'Detalle de la penalidad';

      await this.fnRecuperarPenalizacion(this.nIdTipoActivo);

      Swal.fire("Correcto","Se creó correctamente la penalidad", "success");

      this.spinner.hide();
      
    }
    else{
      this.formPenalidad.markAllAsTouched();
    }
  }

  async fnCrearPenalidadLaptopDesktop(){
    if(this.formPenalidad.valid){

      const formData = this.formPenalidad.value;

      if(Number(formData.noDevolucion) >= Number(formData.precioLista)){
        Swal.fire("Verificar","El precio de venta no puede ser mayor o igual al precio de lista", "warning");
        return;
      }

      this.spinner.show();

      const modelPenalidad: PerfilEquipoPenalidadDTO = {
        nIdPerfilEquipo: this.nIdPerfil,
        nNoDevolucion: formData.noDevolucion,
        nCosto: formData.precioLista,
        nIdUsrRegistro: this.storageData.getUsuarioId(),
        bEstado: true,
        sPais: this.storageData.getPais(),
        detalle: [],
      }

      const valorMensual = Number(formData.precioLista) / Number(formData.cantidadMeses);

      for(let i = 1; i <= formData.cantidadMeses; i++){

        if(i >= 13){

          const nPrecioCalculado = valorMensual * (Number(formData.cantidadMeses) - i);

          modelPenalidad.detalle.push({
            nMesSiniestro: i,
            nNoDevolucion: formData.noDevolucion,
            nPrecioCalculado: nPrecioCalculado,
            nPrecioTotal: nPrecioCalculado + formData.noDevolucion
          })
        }
        else{
          modelPenalidad.detalle.push({
            nMesSiniestro: i,
            nNoDevolucion: 0,
            nPrecioCalculado: formData.precioLista,
            nPrecioTotal: formData.precioLista + 0
          })
        }        
      }

      const result = await this._perfilEquipoService.CreatePenalidadLaptopDesktop(modelPenalidad);

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
        return false;
      }

      this.nIdPenalidad = result.response.data[0].nIdPenalidad;
      this.nIdPenalidadActual = result.response.data[0].nIdPenalidad;

      this.sTitulo = 'Detalle de la penalidad';

      await this.fnRecuperarPenalizacion(this.nIdTipoActivo);

      Swal.fire("Correcto","Se creó correctamente la penalidad", "success");

      this.spinner.hide();
      
    }
    else{
      this.formPenalidad.markAllAsTouched();
    }
  }

  async fnModificarPenalidadMoviles(){
    this.spinner.show();

    this.estaEditando = true;

    // Guardamos el precio de no devolucion para validar
    this.nPrecioVentaActual = Number(this.formPenalidad.controls.precioVenta.value);

    this.fnDesbloquearControles();

    // Deshabilitamos solo el combobox de penalidades pasadas
    this.formPenalidad.controls.penalidadPasada.disable();

    this.spinner.hide();
  }

  async fnModificarPenalidadLaptopDesktop(){

    this.spinner.show();

    this.estaEditando = true;

    // Guardamos el precio de no devolucion para validar
    this.nPrecioNoDevolucionActual = Number(this.formPenalidad.controls.noDevolucion.value);

    this.fnDesbloquearControles();

    // Deshabilitamos solo el combobox de penalidades pasadas
    this.formPenalidad.controls.penalidadPasada.disable();

    this.spinner.hide();
  }

  async fnGuardarPenalidadMoviles(){

    const formData = this.formPenalidad.value;

    if(Number(formData.precioVenta) == this.nPrecioVentaActual){
      Swal.fire("Alerta", "El precio de venta no puede ser el mismo que el anterior", "warning");
      return;
    }

    if(Number(formData.precioVenta) >= Number(formData.precioLista)){
      Swal.fire("Verificar","El precio de venta no puede ser mayor o igual al precio de lista", "warning");
      return;
    }

    const confirma = await Swal.fire({
      title: `¿Desea modificar la penalidad?`,
      text: `Los datos de la penalidad actual se marcará como histórica`,
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

    const model: PerfilEquipoPenalidadDTO = {
      nIdPerfilEquipo: this.nIdPerfil,
      sPais: this.storageData.getPais()
    }

    // Inhabilitamos la penalidad
    const result = await this._perfilEquipoService.UpdateEstadoPenalidadInhabilitar(model);

    // Verificamos que la penalidad se deshabilito correctamente
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
      return false;
    }

    // Creamos la penalidad
    await this.fnCrearPenalidadMoviles();

    this.formPenalidad.get("penalidadPasada").setValue(null);

  }

  async fnGuardarPenalidadLaptopDesktop(){

    if(Number(this.formPenalidad.get("noDevolucion").value) == this.nPrecioNoDevolucionActual){
      Swal.fire("Alerta", "El precio de no devolucion no puede ser el mismo que el anterior", "warning");
      return;
    }

    const confirma = await Swal.fire({
      title: `¿Desea modificar la penalidad?`,
      text: `Los datos de la penalidad actual se marcará como histórica`,
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

    const model: PerfilEquipoPenalidadDTO = {
      nIdPerfilEquipo: this.nIdPerfil,
      sPais: this.storageData.getPais()
    }

    // Inhabilitamos la penalidad
    const result = await this._perfilEquipoService.UpdateEstadoPenalidadInhabilitar(model);

    // Verificamos que la penalidad se deshabilito correctamente
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
      return false;
    }

    // Creamos la penalidad
    await this.fnCrearPenalidadLaptopDesktop();

    this.formPenalidad.get("penalidadPasada").setValue(null);
  }

  async fnRecuperarPenalizacion(tipo: number){

    this.spinner.show();

    this.estaEditando = false;

    this.fnBloquearControles();

    // Dispositivos moviles
    
    const result = await this._perfilEquipoService.GetPenalidad(this.nIdPenalidad);

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
      return false;
    }

    const penalidad = result.response.data[0];

    if(tipo == 1657){

      this.formPenalidad.patchValue({
        precioLista: penalidad.nCosto.toFixed(2),
        precioVenta: penalidad.nPrecioVenta.toFixed(2),
        cantidadMeses: penalidad.detalle.length
      })

      this.listaDetallePenalidadMoviles = penalidad.detalle;
    }
    else {

      this.formPenalidad.patchValue({
        precioLista: penalidad.nCosto.toFixed(2),
        noDevolucion: penalidad.nNoDevolucion.toFixed(2),
        cantidadMeses: penalidad.detalle.length
      })

      this.listaDetallePenalidadLaptopDesktop = penalidad.detalle;
    }

    this.fnCrearTablaPenalizacion(tipo);

    await this.fnLlenarComboboxPenalizacionesPasadas();

    this.spinner.hide();

    this.fnControlFab();
  }
  

  async fnLlenarComboboxPenalizacionesPasadas(){
    const result = await this._perfilEquipoService.GetPenalidadesPasadas(this.nIdPerfil);

    if(result.success){
      this.listaPenalidadesPasadas = result.response.data;
    }
  }

  async fnRecuperarPenalidadPasada(){
    this.nIdPenalidad = Number(this.formPenalidad.get("penalidadPasada").value);
    const descripcion = this.listaPenalidadesPasadas.find((penalidad) => penalidad.nId == this.nIdPenalidad);

    if(descripcion){
      if(this.nIdPenalidad == this.nIdPenalidadActual){
        this.sTitulo = 'Detalle de la penalidad'
      }
      else{
        this.sTitulo = 'Detalle de la penalidad pasada'
      }
    }

    await this.fnRecuperarPenalizacion(this.nIdTipoActivo);
  }

  fnCrearTablaPenalizacion(tipo: number){
    if(tipo == 1657){
      try{
        this.dataSource.data = this.listaDetallePenalidadMoviles;
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
    else{
      try{
        this.dataSourceLaptopDesktop.data = this.listaDetallePenalidadLaptopDesktop;
        this.dataSourceLaptopDesktop.paginator = this.paginatorLaptopDesktop;
        this.dataSourceLaptopDesktop.sort = this.sortLaptopDesktop;
        // Primera pagina
        if (this.dataSourceLaptopDesktop.paginator) {
          this.dataSourceLaptopDesktop.paginator.firstPage();
        }
      }
      catch(err){
        console.log(err);
      }
    }
  }

  fnBloquearControles(): void {
    Object.values(this.formPenalidad.controls).forEach(control => { control.disable() });
    // Habilitamos solo el combobox de penalidades pasadas
    this.formPenalidad.controls.penalidadPasada.enable();
    this.fnControlFab(); // Actualizar menu de botones
  }

  fnDesbloquearControles(): void {
    Object.values(this.formPenalidad.controls).forEach(control => { control.enable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  fnSalir(){
    this.dialogRef.close(this.nIdPenalidadActual);
  }

  //#endregion

  //#region Validaciones

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

  //#endregion

}
