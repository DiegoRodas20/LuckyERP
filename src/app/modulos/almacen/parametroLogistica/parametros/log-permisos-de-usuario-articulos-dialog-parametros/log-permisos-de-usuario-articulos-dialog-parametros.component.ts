import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ParametroLogisticaService } from '../../parametro-logistica.service';

@Component({
  selector: 'app-log-permisos-de-usuario-articulos-dialog-parametros',
  templateUrl: './log-permisos-de-usuario-articulos-dialog-parametros.component.html',
  styleUrls: ['./log-permisos-de-usuario-articulos-dialog-parametros.component.css'],
  animations: [asistenciapAnimations]
})
export class LogPermisosDeUsuarioArticulosDialogParametrosComponent implements OnInit {

  // Variables
  nIdUser: number; // Id del usuario
  sIdPais: string;  // Codigo del pais de la empresa actual
  nIdEmp: string;  // Id de la empresa del grupo actual

  // Tabla
  lPermisosUsuarioArticulos: any [] = [];
  displayedColumns: string[] = ['nId', 'sUsuario', 'sNombreUsuario', 'bAgregar', 'bModificar', 'bDuplicar'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  columnaActualizar = null;
  txtFiltro = new FormControl();

  // Formulario
  permisoUsuarioArticuloForm: FormGroup;
  agregarPermisoForm: FormGroup;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'add', tool: 'Crear permiso', state: true},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Modal
  modal: NgbModalRef;
  @ViewChild('content') content:ElementRef; // Elemento DOM del Modal

  // Combobox Modal
  cbUsuarios: any[] = [];

  constructor(
    private fb: FormBuilder,
    private vParLogisticaService: ParametroLogisticaService,
    @Inject('BASE_URL') private baseUrl: string,
    private dialog: MatDialog, // Declaracion del Dialog
    private spinner: NgxSpinnerService,
    private ref: ChangeDetectorRef,
    private modalService: NgbModal // Manipular el modal de bootstrap
  ) {
    // Inicializar variables de session
    this.sIdPais = localStorage.getItem('Pais'); //Pais del usuario
    const user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.nIdUser = JSON.parse(window.atob(user.split('.')[1])).uid; //id del usuario
    this.nIdEmp = localStorage.getItem('Empresa');

    // Inicializar datasource
    this.dataSource = new MatTableDataSource(this.lPermisosUsuarioArticulos);
  }

  async ngOnInit(): Promise<void> {

    await this.fnCrearFormularioModificar();
    await this.fnCrearFormularioAgregar();

    this.onToggleFab(1,-1);

    await this.fnListarPermisosUsuarioArticulos();
    this.spinner.hide();
  }

  ngAfterViewInit() {

    // Agregar propiedades al datasource
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

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
        this.fnAbrirModalCrearPermiso(this.content);
        break;
      default:
        break;
    }
  }

  //#endregion

  //#region Formulario

  // Crear formulario agregar
  async fnCrearFormularioAgregar(): Promise<void>{
    return new Promise ((resolve, reject) =>{
      this.agregarPermisoForm = this.fb.group({
        cbUsuario: [null, [Validators.required]],
        agregar: false,
        modificar: false,
        duplicar: false
      });
      resolve();
    })
  }

  // Crear formulario modificar
  async fnCrearFormularioModificar(): Promise<void>{
    return new Promise ((resolve, reject) =>{
      this.permisoUsuarioArticuloForm = this.fb.group({
        agregar: false,
        modificar: false,
        duplicar: false
      });
      resolve();
    })
  }
  //#endregion

  //#region Creacion de la tabla

  // Metodo para buscar en la tabla
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Listar todos los permisos de los usuarios por pais para la mat-table
  async fnListarPermisosUsuarioArticulos(){
    const pEntidad = 4; // Permisos de usuarios / articulos
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = [];
    const pTipo = 1; // Lista de permisos de usuarios / articulos por pais

    pParametro.push(this.sIdPais);

    this.lPermisosUsuarioArticulos = await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

    this.dataSource.data = this.lPermisosUsuarioArticulos;
  }

  //#endregion


  //#region Llenado de combobox

  async fnLlenarComboboxUsuarios (){

    const pEntidad = 4; // Permisos de usuarios / articulos
    const pOpcion = 2;  //CRUD -> Listar
    const pParametro = [];
    const pTipo = 2; // Lista de usuarios por pais

    pParametro.push(this.sIdPais);

    this.cbUsuarios = await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);
    console.log(this.cbUsuarios);
  }

  //#endregion

  //#region CRUD Tabla

  // Abrir modal para crear los permisos de un usuario
  async fnAbrirModalCrearPermiso(content){

    // Llenar combobox usuarios cada vez que se abre el modal
    await this.fnLlenarComboboxUsuarios();

    await this.fnCrearFormularioAgregar();

    this.mostrarBotones = false;

    this.modal = this.modalService.open(content, { // Abriendo el modal del combobox
      windowClass: 'custom-modal-parametros',
      container: ".combobox-modal-container",
      backdrop: "static",
      keyboard: false,
      size: 'lg'
    });
    this.modal.result.then(() => {});
  }

  async fnCrearPermiso(){
    if(this.agregarPermisoForm.valid){
      this.spinner.show();

      const pEntidad = 4; // Permisos de usuarios / articulos
      const pOpcion = 1;  //CRUD -> Insertar
      const pParametro = [];
      const pTipo = 1; // Crear permisos de usuarios / articulos

      const usuario = this.agregarPermisoForm.get("cbUsuario").value;
      const agregar = this.agregarPermisoForm.get("agregar").value;
      const modificar = this.agregarPermisoForm.get("modificar").value;
      const duplicar = this.agregarPermisoForm.get("duplicar").value;

      // Verificar que el usuario ya no este agregado

      const usuarioExistente = this.lPermisosUsuarioArticulos.find((permisos)=> permisos.nIdUsuario == usuario)

      if(usuarioExistente){
        this.spinner.hide();
        Swal.fire('No se pudo crear', 'Ese usuario ya está registrado', 'warning');
        return;
      }

      pParametro.push(usuario);
      pParametro.push(agregar);
      pParametro.push(modificar);
      pParametro.push(duplicar);
      pParametro.push(this.sIdPais);

      const result = await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

      // Volver a listar las columnas
      await this.fnListarPermisosUsuarioArticulos();

      Swal.fire('Se ha creado con éxito', '', 'success');

      this.closeModal();

      this.spinner.hide();
    }
    else{
      this.agregarPermisoForm.markAllAsTouched;
    }
  }

  // Metodo para cerrar modal de creacion de permisos
  closeModal() {
    this.mostrarBotones = true;
    this.modal.close();
  }

  async fnActualizarPermiso(columna){
    this.spinner.show();

    await this.fnCrearFormularioModificar();
    this.permisoUsuarioArticuloForm.get("agregar").setValue(columna.bAgregar);
    this.permisoUsuarioArticuloForm.get("modificar").setValue(columna.bModificar);
    this.permisoUsuarioArticuloForm.get("duplicar").setValue(columna.bDuplicar);
    this.columnaActualizar = columna;

    this.spinner.hide();
  }

  async fnGuardarPermiso(columna){

    this.spinner.show();

    const pEntidad = 4; // Permisos de usuarios / articulos
    const pOpcion = 3;  //CRUD -> Listar
    const pParametro = [];
    const pTipo = 1; // Lista de permisos de usuarios / articulos por pais

    const nuevoEstadoAgregar = Boolean(this.permisoUsuarioArticuloForm.get("agregar").value);
    const nuevoEstadoModificar = Boolean(this.permisoUsuarioArticuloForm.get("modificar").value);
    const nuevoEstadoDuplicar = Boolean(this.permisoUsuarioArticuloForm.get("duplicar").value);

    pParametro.push(columna.nIdArticuloPermiso);
    pParametro.push(nuevoEstadoAgregar ? 1 : 0);
    pParametro.push(nuevoEstadoModificar ? 1 : 0);
    pParametro.push(nuevoEstadoDuplicar ? 1 : 0);

    await this.vParLogisticaService.fnParametro(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

    // Volver a listar las columnas
    await this.fnListarPermisosUsuarioArticulos();

    // Reiniciar columna
    this.columnaActualizar = null;

    Swal.fire('Se ha actualizado con éxito', '', 'success');

    this.spinner.hide();
  }

  //#endregion
}
