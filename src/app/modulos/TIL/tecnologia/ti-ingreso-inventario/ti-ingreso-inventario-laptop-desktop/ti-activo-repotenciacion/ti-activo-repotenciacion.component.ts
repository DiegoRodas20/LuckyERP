import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ActivoRelacionadoDTO } from '../../../api/models/activoDTO';
import { WebApiResponse } from '../../../api/models/apiResponse';
import { ActivoService } from '../../../api/services/activo.service';
import { AsignacionDirectaService } from '../../../api/services/asignacion-directa.service';

@Component({
  selector: 'app-ti-activo-repotenciacion',
  templateUrl: './ti-activo-repotenciacion.component.html',
  styleUrls: ['./ti-activo-repotenciacion.component.css'],
  animations: [asistenciapAnimations]
})
export class TiActivoRepotenciacionComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables auxiliares
  nIdActivo;

  // Formulario
  formRelacionActivo: FormGroup;

  // Combobox
  listaTipoActivos = []
  listaActivos = []

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'add', tool: 'Añadir Activo', state: true, color: 'secondary'},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Titulo
  sTitulo = "Repotenciación de activo"

  // Mat-Table (Cargas pendientes)
  dataSource: MatTableDataSource<ActivoRelacionadoDTO>;
  listaCActivosRelacionados: ActivoRelacionadoDTO[] = [];
  displayedColumns: string[] = ["nIdDetActivoRelacion", "sActivoRelacion", "sUsuario", "dFecha", "sRutaArchivo"];
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) public sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  constructor(
    private spinner: NgxSpinnerService,
    private _activoService: ActivoService,
    private _asignacionDirectaService: AsignacionDirectaService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TiActivoRepotenciacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 

    this.onToggleFab(1, -1);

    // Crear Formulario
    this.fnCrearFormulario();

    // Asignamos el titulo del dialog
    this.sTitulo = "Repotenciación de activo: " + data.sCodActivo;

    // Inicializar tablas
    this.dataSource = new MatTableDataSource(this.listaCActivosRelacionados);
  }

  async ngOnInit(): Promise<void> {
    this.nIdActivo = this.data.nIdActivo

    await this.fnLlenarComboboxTipoActivos();

    await this.fnLlenarTabla();
    
    this.spinner.hide();
  }

  //#region Formulario
  fnCrearFormulario(){
    this.formRelacionActivo = this.fb.group(
      {
        tipoActivo: [null, Validators.compose([Validators.required])],
        activo: [null, Validators.compose([Validators.required])],
      }
    );
  }
  //#endregion

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
        this.fnAgregarRepotenciacion();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){

    this.fbLista[0].state = true;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Controles

  async fnLlenarComboboxTipoActivos(){

    const result = await this._activoService.GetAllTipoActivosRepotenciacion();
    this.listaTipoActivos = result.response.data;
  }

  async fnLlenarComboboxActivos(){
    this.spinner.show();

    if(!this.formRelacionActivo.get("tipoActivo").value){
      this.spinner.hide();
      return;
    }

    // Limpiamos el activo seleccionado
    this.formRelacionActivo.get("activo").setValue(null);

    const nIdActivo = this.data.registroActual ? this.data.registroActual.nIdActivo : 0;

    const tipoActivo = Number(this.formRelacionActivo.get("tipoActivo").value)
    const result = await this._asignacionDirectaService.GetAllActivosAsignacion(tipoActivo, nIdActivo);
    this.listaActivos = result.response.data;

    this.spinner.hide();
  }

  //#endregion

  //#region Tabla

  // Llenado de la tabla Activos
  async fnLlenarTabla(){

    try{
      const result = await this._activoService.GetActivosRelacionadosByActivo(this.nIdActivo);
      this.listaCActivosRelacionados = result.response.data;
      this.dataSource.data = this.listaCActivosRelacionados;
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

  //#endregion

  //#region Acciones

  async fnAgregarRepotenciacion(){

    if(this.formRelacionActivo.valid){

      const activoRelacion = this.formRelacionActivo.get("activo").value;

      const model: ActivoRelacionadoDTO = {
        nIdActivo: this.nIdActivo,
        nIdActivoRelacion: this.formRelacionActivo.get("activo").value,
        nIdUsuario: this.storageData.getUsuarioId(),
        sPais: this.storageData.getPais(),
        bEstado: true
      }
  
      try{
  
        this.spinner.show();
  
        const result: WebApiResponse<ActivoRelacionadoDTO> = (await this._activoService.CreateActivoRelacionado(model));
  
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
  
        this.formRelacionActivo.markAsUntouched();

        // Quitamos el activo ya creado
        const indexActivo = this.listaActivos.findIndex((activo) => activo.nId == activoRelacion);
        this.listaActivos.splice(indexActivo, 1);

        // Limpiamos el activo
        this.formRelacionActivo.get("activo").setValue(null);

        await this.fnLlenarTabla();
        
        this.spinner.hide();
  
        Swal.fire({
          icon: 'success',
          title: ('Correcto'),
          text: 'Se repotenció el activo',
          showConfirmButton: true
        });
      }
      catch(err){
        console.log(err);
      }
    }
    else{
      this.formRelacionActivo.markAllAsTouched();
    }

    
  }

  async fnDeshabilitarRepotenciacion(row: ActivoRelacionadoDTO){
    try{

      const confirma = await Swal.fire({
        title: '¿Desea deshabilitar la relación?',
        html: `Esto hará que el activo relacionado vuelva a stock`,
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

      const result: WebApiResponse<ActivoRelacionadoDTO> = (await this._activoService.UpdateActivoRelacionado(row));

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

      // Actualizamos la lista de activos si es que está llena
      if(this.listaActivos.length > 0){
        await this.fnLlenarComboboxActivos();
      }

      // Limpiamos el activo
      this.formRelacionActivo.get("activo").setValue(null);

      await this.fnLlenarTabla();
      
      this.spinner.hide();

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se deshabilitó la relación del activo',
        showConfirmButton: true
      });
    }
    catch(err){
      console.log(err);
    }
  }

  fnVerImagenTabla(row: ActivoRelacionadoDTO){

    if(row.sActivoRelacion != null && row.sActivoRelacion != ''){
      // Obtenemos el codigo y el nombre del articulo
      const codigoArticulo = row.sActivoRelacion;
      const urlImagen = row.sRutaArchivo == '' || row.sRutaArchivo == null ? '/assets/img/SinImagen.jpg' : row.sRutaArchivo
      
      Swal.fire({ title: codigoArticulo, imageUrl: urlImagen, imageHeight: 250 });
    }
  }

  //#endregion

  fnSalir(){
    this.dialogRef.close();
  }
}
