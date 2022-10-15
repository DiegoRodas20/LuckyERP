import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { AsignacionDirectaCambioPartesActivoDTO, AsignacionDirectaSelectItemDTO } from '../../../../api/models/asignacionDirectaDTO';
import { ActivoService } from '../../../../api/services/activo.service';
import { AsignacionDirectaService } from '../../../../api/services/asignacion-directa.service';

@Component({
  selector: 'app-ti-asignacion-agregar-parte',
  templateUrl: './ti-asignacion-agregar-parte.component.html',
  styleUrls: ['./ti-asignacion-agregar-parte.component.css'],
  animations: [asistenciapAnimations]
})
export class TiAsignacionAgregarParteComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Formulario
  formCambioParte: FormGroup;

  // Combobox
  listaActivos: AsignacionDirectaSelectItemDTO[] = [];

  // Mat-Table
  dataSource: MatTableDataSource<AsignacionDirectaCambioPartesActivoDTO>;
  listaPartesActivo: AsignacionDirectaCambioPartesActivoDTO[] = [];
  displayedColumns: string[] = ["nIdDetActivo", "sTipoParte", "sArticuloActual","sNumeroParteActual", "sArticuloCambio","sNumeroParteCambio"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla
  //pipeTable: DatePipe;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'swap_horiz', tool: 'Cambiar parte', state: true, color: 'secondary'},
    {icon: 'view_list', tool: 'Ver partes', state: true, color: 'secondary'},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Activo
  nIdActivo: number;
  sTitulo: string;

  // Flags
  bSePuedeCambiar: boolean = false;
  bExistePrestamoParte: boolean = false;

  constructor(
    private spinner: NgxSpinnerService,
    private _activoService: ActivoService,
    private fb: FormBuilder,
    private _asignacionDirectaService: AsignacionDirectaService,
    public dialogRef: MatDialogRef<TiAsignacionAgregarParteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    // Creamos el formulario
    this.fnCrearFormulario();

    // Inicializar tablas
    this.dataSource = new MatTableDataSource(this.listaPartesActivo);

    // Guardamos el activo que se esta actualizando
    this.nIdActivo = data.nIdActivo;

    // Establecemos el titulo
    this.sTitulo = "Partes del activo: " + data.nombreActivo;

  }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1, -1);

    // Llenar tabla
    await this.fnLlenarTabla();

    this.fnControlFab();

    this.spinner.hide()
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
        await this.fnModoCambioPartes();
        break;
      case 1:
        await this.fnModoVerPartes();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){

    this.fbLista[0].state = !this.bSePuedeCambiar;
    this.fbLista[1].state = this.bSePuedeCambiar;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Formulario

  fnCrearFormulario() {
    this.formCambioParte = this.fb.group({
      activo: [null],
    })
  }

  //#endregion

  //#region Controles

  async fnLlenarComboboxActivos(){

    const tipoActivo = 2501; // Desktop
    const result = await this._asignacionDirectaService.GetAllActivosParaCambioPartes(tipoActivo); // Activos que aun esten en stock
    this.listaActivos = result.response.data;

    if(this.listaActivos.length > 0){
      this.formCambioParte.get("activo").setValue(this.listaActivos[0].nId);
    }
  }

  //#endregion

  //#region Tabla cambios

  async fnLlenarTabla(){

    const nIdActivoCambio = Number(this.formCambioParte.get("activo").value);
    
    const result = await this._asignacionDirectaService.GetCambioPartesActivo(this.nIdActivo, nIdActivoCambio);

    if(result.success){
      this.listaPartesActivo = result.response.data;

      this.listaPartesActivo.map(parte => parte.bParteCompartida ? this.bExistePrestamoParte = true : null);

      this.dataSource.data = this.listaPartesActivo;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      // Primera pagina
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  fnVerImagenTabla(row: AsignacionDirectaCambioPartesActivoDTO, tipo: number){

    // Si es la imagen actual, se muestra los datos de la imagen actual
    if(tipo == 1){

      if(row.sArticuloActual != null && row.sArticuloActual != ''){
        // Obtenemos el codigo y el nombre del articulo
        const descripcionArticulo = row.sArticuloActual;
        const codigoArticulo = descripcionArticulo.split(' ')[0];
        const nombreArticulo = descripcionArticulo.slice(codigoArticulo.length + 2, descripcionArticulo.length);
        const urlImagen = row.sRutaArchivoActual == '' || row.sRutaArchivoActual == null ? '/assets/img/SinImagen.jpg' : row.sRutaArchivoActual
        
        Swal.fire({ title: codigoArticulo, text: nombreArticulo, imageUrl: urlImagen, imageHeight: 250 });
      }
      
    }
    // Si es la imagen de la parte a cambiar, se muestra los datos de la imagen a cambiar
    else if(tipo == 2){

      if(row.sArticuloCambio != null && row.sArticuloCambio != ''){
        // Obtenemos el codigo y el nombre del articulo
        const descripcionArticulo = row.sArticuloCambio;
        const codigoArticulo = descripcionArticulo.split(' ')[0];
        const nombreArticulo = descripcionArticulo.slice(codigoArticulo.length + 2, descripcionArticulo.length);
        const urlImagen = row.sRutaArchivoCambio == '' || row.sRutaArchivoCambio == null ? '/assets/img/SinImagen.jpg' : row.sRutaArchivoCambio
        
        Swal.fire({ title: codigoArticulo, text: nombreArticulo, imageUrl: urlImagen, imageHeight: 250 });
      }

    }
  }

  //#endregion

  //#region Acciones

  async fnModoCambioPartes(){

    this.spinner.show();

    await this.fnLlenarComboboxActivos();

    await this.fnLlenarTabla();

    this.sTitulo = "Cambio de partes: " + this.data.nombreActivo;
    
    this.bSePuedeCambiar = true;

    this.fnControlFab();

    this.spinner.hide();
  }

  async fnModoVerPartes(){

    this.spinner.show();

    
    this.sTitulo = "Partes del activo: " + this.data.nombreActivo;
    
    this.bSePuedeCambiar = false;

    await this.fnLlenarTabla();
    
    // Limpiamos el control de activos
    this.formCambioParte.get("activo").setValue(null);

    this.fnControlFab();

    this.spinner.hide();
  }

  async fnActualizarTablaCambioPartes(){
    this.spinner.show();

    await this.fnLlenarTabla();

    this.spinner.hide();
  }

  async fnCambiarParte(row: AsignacionDirectaCambioPartesActivoDTO){

    const nIdActivoCambio = Number(this.formCambioParte.get("activo").value);
    const activoCambio = this.listaActivos.find((activo) => activo.nId == nIdActivoCambio);

    if(!activoCambio){
      Swal.fire("Alerta","No hay un activo seleccionado para hacer el cambio", "warning");
      return;
    }

    const confirma = await Swal.fire({
      title: '¿Desea cambiar la parte de este activo?',
      html: `El otro activo: <b>'${activoCambio.sDescripcion}'</b> será marcado como: 'Parte Préstamo' hasta que tenga todas sus partes de nuevo`,
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

    const model: AsignacionDirectaCambioPartesActivoDTO = {
      nIdDetActivoActual: row.nIdDetActivoActual,
      nIdDetActivoCambio: row.nIdDetActivoCambio,
      nIdDetActivoPrestamo: row.nIdDetActivoPrestamo,
      nIdUsuarioAsigno: this.storageData.getUsuarioId(),
      sPais: this.storageData.getPais(),
      nIdActivoCambio: nIdActivoCambio
    }

    const result = await this._asignacionDirectaService.UpdateCambioPartesActivo(model);

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

    await this.fnLlenarTabla();

    Swal.fire({
      icon: 'success',
      title: 'Correcto',
      text: "Se hizo el cambio correctamente"
    });

    this.spinner.hide();

  }

  async fnDevolverParte(row: AsignacionDirectaCambioPartesActivoDTO){

    const confirma = await Swal.fire({
      title: '¿Desea devolver la parte prestada del activo?',
      html: `La parte será devuelta al activo de origen`,
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

    const model: AsignacionDirectaCambioPartesActivoDTO = {
      nIdDetActivoActual: row.nIdDetActivoActual,
      nIdDetActivoPrestamo: row.nIdDetActivoPrestamo
    }

    const result = await this._asignacionDirectaService.UpdateDevolucionParteActivo(model);

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

    await this.fnLlenarTabla();

    Swal.fire({
      icon: 'success',
      title: 'Correcto',
      text: "Se devolvió el préstamo"
    });

    this.spinner.hide();

  }

  fnSalir(){
    this.dialogRef.close();
  }

  //#endregion

}
