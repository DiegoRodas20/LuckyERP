import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment, { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { AddendaCabeceraTIDTO, AddendaUnoTIDTO, DetalleAddendaArticuloTableTIDTO, DetalleAddendaTableTIDTO, DetalleAddendaTIDTO, ParametroTIDTO, TipoDispositivoParteTIDTO } from '../../api/models/addendaTIDTO';
import { ArticuloTIDTO, InformacionArticuloTIDTO } from '../../api/models/articuloDTO';
import { ElementoTIDTO } from '../../api/models/elementoTIDTO';
import { ProvedorAddendaTIDTO } from '../../api/models/proveedorTIDTO';
import { toggleFab } from '../../api/models/toggleFab';
import { AddendaService } from '../../api/services/addenda.service';
import { PerfilEquipoService } from '../../api/services/perfil-equipo.service';
import { TiAddendaDetalleActivosComponent } from './ti-addenda-detalle-activos/ti-addenda-detalle-activos.component';
import { TiDialogActivoDetalleAddendaComponent } from './ti-dialog-activo-detalle-addenda/ti-dialog-activo-detalle-addenda.component';
import { TiDialogAddendaArchivoComponent } from './ti-dialog-addenda-archivo/ti-dialog-addenda-archivo.component';

@Component({
  selector: 'app-ti-addenda-detalle',
  templateUrl: './ti-addenda-detalle.component.html',
  styleUrls: ['./ti-addenda-detalle.component.css'],
  animations: [asistenciapAnimations],
})
export class TiAddendaDetalleComponent implements OnInit {

  vParametro: ParametroTIDTO;
  formAddenda: FormGroup;
  lTipoArticulo: ElementoTIDTO[] = [];
  lArticulo: ArticuloTIDTO[] = [];
  vArticuloSeleccionado: ArticuloTIDTO;
  lInformacionArticulo: InformacionArticuloTIDTO[] = [];
  lProveedor: ProvedorAddendaTIDTO[] = [];
  lDetalleAddenda: DetalleAddendaTableTIDTO[] = [];
  lDetalleArticuloAddenda: DetalleAddendaArticuloTableTIDTO[] = [];
  // Botones
  tsLista = "inactive";
  fbLista: toggleFab[] = [
    { icon: "attach_file", tool: "Adjuntar Archivos", state: 'fnBtnArchivo', enabled: true, color: "secondary", functionName: 'fnArchivo' },
    { icon: "edit", tool: "Editar", state: 'bEditar', enabled: true, color: "secondary", functionName: 'fnEditar' },
    { icon: "save", tool: "Guardar", state: 'fnBtnGuardar', enabled: true, color: "secondary", functionName: 'fnGuardar' },
    { icon: "close", tool: "Cancelar", state: 'bCancelar', enabled: true, color: "secondary", functionName: 'fnCancelar' },
    { icon: "exit_to_app", tool: "Salir", state: 'fnTrue', enabled: true, color: "secondary", functionName: 'fnRegresar' },
  ];
  abLista: toggleFab[] = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  @Input() pIdRegistro: number;
  @Output() pMostrar = new EventEmitter<number>();

  separatorKeysCodes: number[] = [ENTER, COMMA];

  bAddendaSinProcesar = true;
  bEditar = false;
  bGuardar = true;
  bCancelar = false;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<DetalleAddendaTableTIDTO>;
  displayedColumns = ['opcion', 'sTipoActivo', 'sArticulo', 'sPartNumber', 'sCaracteristica', 'nCantidad',
    'imagen'];

  storageData: SecurityErp;

  vAddenda: AddendaUnoTIDTO;
  constructor(
    private formBuilder: FormBuilder,
    private _perfilEquipoService: PerfilEquipoService,
    private _addendaService: AddendaService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog, // Declaracion del Dialog
  ) {
    this.storageData = new SecurityErp()
    this.fnInicializarForm();
  }

  async ngOnInit(): Promise<void> {
    this.onToggleFab(1, -1)
    this.spinner.show();
    await this.GetParametro();
    await this.GetAllTipoArticulo();
    await this.GetAllProveedor();
    if (this.lTipoArticulo.length > 0) {
      this.formAddenda.controls.cboTipoArticulo.setValue(this.lTipoArticulo[0].elementoId)
      await this.GetAllArticulo(this.lTipoArticulo[0].elementoId)
    }

    if (this.vParametro) {
      this.formAddenda.controls.cboFechaFin.setValue(moment().add(this.vParametro.nAnioAddenda, 'years'));
    }
    this.spinner.hide();

    //Cuando es para actualizar
    if (this.pIdRegistro != 0) {
      await this.GetById(this.pIdRegistro);
      await this.fnLlenarValores();
    }
  }

  fnInicializarForm() {
    this.formAddenda = this.formBuilder.group({
      cboProveedor: [null, Validators.required],
      txtCantTotal: [0],
      cboFechaInicio: [moment(), Validators.required],
      cboFechaFin: ['', Validators.required],
      cboTipoArticulo: [null, Validators.required],
      cboArticulo: [null, Validators.required],
      cboInformacion: [''],
      txtCantidad: [1, [Validators.required, Validators.min(1)]],
      txtNumero: [''],
      txtActualizo: [this.storageData.getLoginUsuario()],
      txtFechaActualizo: [moment().format("DD/MM/YYYY")],
      txtEstado: ['Pendiente'],
    })
  }


  //#region Funciones de guardados
  async fnGuardar() {
    this.spinner.show();
    if (this.pIdRegistro == 0) {
      await this.InsertTransaction();
    } else {
      await this.UpdateTransaction();
    }
    this.spinner.hide();
  }

  async InsertTransaction() {
    if (this.formAddenda.controls.cboProveedor.invalid || this.formAddenda.controls.cboFechaInicio.invalid ||
      this.formAddenda.controls.cboFechaFin.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formAddenda.controls.cboProveedor.markAsTouched();
      this.formAddenda.controls.cboFechaInicio.markAsTouched();
      this.formAddenda.controls.cboFechaFin.markAsTouched();

      return;
    }

    if (this.lDetalleAddenda.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Ingrese al menos un artículo.',
      });
      return;
    }

    let validar = this.dataSource.data.find(item => item.nCantidad < 1);
    if (validar) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `El artículo ${validar.sArticulo} no puede tener cantidad menor a 1.`,
      });
      return;
    }

    for (let detalle of (this.lDetalleAddenda)) {
      let validarDetalle = this.lDetalleArticuloAddenda.find(item => item.nIdDetAddenda == detalle.nIdDetAddenda)
      //Si no encuentra validamos
      if (!validarDetalle) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: `El artículo ${detalle.sArticulo} no tiene elementos asignados.`,
        });
        return;
      }
    }

    let datos = this.formAddenda.value;
    let fechaInicio: Moment = datos.cboFechaInicio
    let fechaFin: Moment = datos.cboFechaFin

    if (fechaInicio > fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'La fecha fin no puede ser menor que la fecha inicio.',
      });
      return;
    }

    let modelDetalle: DetalleAddendaTIDTO[] = this.dataSource.data.map(item => {
      return {
        nIdAddenda: 0,
        nIdDetAddenda: 0,
        nIdArticulo: item.nIdArticulo,
        nCantidad: Math.round(item.nCantidad),
        detalleArticulo: this.fnDetalleArticulo(item.nIdDetAddenda)
      }
    })

    let model: AddendaCabeceraTIDTO = {
      nIdAddenda: 0,
      nIdProveedor: datos.cboProveedor,
      nNumero: 0,
      dFechaInicio: fechaInicio.format("DD/MM/yyyy"),
      dFechaFin: fechaFin.format("DD/MM/yyyy"),
      nIdUsrRegistro: Number(this.storageData.getUsuarioId()),
      dFechaRegistro: '',
      nIdEstado: 1,
      sIdPais: this.storageData.getPais(),
      detalleAddenda: modelDetalle
    }

    try {
      let result = await this._addendaService.InsertTransaction(model);
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

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      this.vAddenda = result.response.data[0]
      this.pIdRegistro = this.vAddenda.nIdAddenda
      this.fnLimpiarControles();
      await this.fnLlenarValores();
    }
    catch (err) {
      console.log(err);
    }
  }

  async UpdateTransaction() {
    if (this.formAddenda.controls.cboProveedor.invalid || this.formAddenda.controls.cboFechaInicio.invalid ||
      this.formAddenda.controls.cboFechaFin.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formAddenda.controls.cboProveedor.markAsTouched();
      this.formAddenda.controls.cboFechaInicio.markAsTouched();
      this.formAddenda.controls.cboFechaFin.markAsTouched();
      return;
    }

    if (this.lDetalleAddenda.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Ingrese al menos un artículo.',
      });
      return;
    }

    let validar = this.dataSource.data.find(item => item.nCantidad < 1);
    if (validar) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `El artículo ${validar.sArticulo} no puede tener cantidad menor a 1.`,
      });
      return;
    }

    for (let detalle of (this.lDetalleAddenda)) {
      let validarDetalle = this.lDetalleArticuloAddenda.find(item => item.nIdDetAddenda == detalle.nIdDetAddenda)
      //Si no encuentra validamos
      if (!validarDetalle) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: `El artículo ${detalle.sArticulo} no tiene elementos asignados.`,
        });
        return;
      }
    }


    let datos = this.formAddenda.value;
    let fechaInicio: Moment = datos.cboFechaInicio
    let fechaFin: Moment = datos.cboFechaFin

    if (fechaInicio > fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'La fecha fin no puede ser menor que la fecha inicio.',
      });
      return;
    }

    let modelDetalle: DetalleAddendaTIDTO[] = this.dataSource.data.map(item => {
      return {
        nIdAddenda: 0,
        nIdDetAddenda: 0,
        nIdArticulo: item.nIdArticulo,
        nCantidad: Math.round(item.nCantidad),
        detalleArticulo: this.fnDetalleArticulo(item.nIdDetAddenda)
      }
    })

    let model: AddendaCabeceraTIDTO = {
      nIdAddenda: this.vAddenda.nIdAddenda,
      nIdProveedor: datos.cboProveedor,
      nNumero: 0,
      dFechaInicio: fechaInicio.format("DD/MM/yyyy"),
      dFechaFin: fechaFin.format("DD/MM/yyyy"),
      nIdUsrRegistro: Number(this.storageData.getUsuarioId()),
      dFechaRegistro: '',
      nIdEstado: 1,
      sIdPais: this.storageData.getPais(),
      detalleAddenda: modelDetalle
    }

    try {
      let result = await this._addendaService.UpdateTransaction(model);
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

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se actualizó el registro',
        showConfirmButton: false,
        timer: 1500
      });
      this.vAddenda = result.response.data[0]
      this.fnLimpiarControles();
      await this.fnLlenarValores();
    }
    catch (err) {
      console.log(err);
    }
  }

  //#endregion

  //#region Botones
  onToggleFab(fab: number, stat: number) {
    stat = stat === -1 ? (this.abLista.length > 0 ? 0 : 1) : stat;
    this.tsLista = stat === 0 ? "inactive" : "active";
    this.abLista = stat === 0 ? [] : this.fbLista;
  }

  clickFab(nombreFuncion: string) {
    if (this[nombreFuncion]) {
      this[nombreFuncion]();
    }
  }

  get fnTrue() {
    return true
  }

  get fnBtnGuardar() {
    return this.bAddendaSinProcesar && this.bGuardar
  }

  get fnBtnArchivo() {
    return this.pIdRegistro == 0 ? false : true;
  }

  fnEditar() {
    this.bEditar = false;
    this.bGuardar = true;
    this.bCancelar = true;
    this.formAddenda.controls.cboFechaInicio.enable()
    this.formAddenda.controls.cboFechaFin.enable()
    this.formAddenda.controls.cboTipoArticulo.enable()
    this.formAddenda.controls.cboTipoArticulo.enable()
    this.formAddenda.controls.cboArticulo.enable()
    this.formAddenda.controls.txtCantidad.enable()
    this.formAddenda.controls.cboInformacion.enable()
    this.formAddenda.controls.cboTipoArticulo.setValue(null)
  }

  async fnCancelar() {
    await this.GetById(this.pIdRegistro);
    await this.fnLlenarValores();
  }
  //#endregion

  //#region Funcion de interaccion con componentes
  fnRegresar() {
    this.pMostrar.emit(0);
  }

  fnArchivo() {
    const vRegistro = {
      nIdAddenda: this.pIdRegistro,
      sNumero: this.vAddenda.sNumero
    }
    this.dialog.open(TiDialogAddendaArchivoComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: vRegistro,
      disableClose: true,
    });

  }
  //#endregion

  //#region Errores Controles
  get txtCantidadError(): string {
    return this.formAddenda.controls.txtCantidad.hasError('required') ? 'Obligatorio' :
      this.formAddenda.controls.txtCantidad.hasError('min') ? 'Mínimo 1' : null;
  }

  get cboTipoArticuloError(): string {
    return (this.formAddenda.controls.cboTipoArticulo.hasError('required') && this.formAddenda.controls.cboTipoArticulo.touched)
      ? 'Obligatorio' : null;
  }

  get cboArticuloError(): string {
    return (this.formAddenda.controls.cboArticulo.hasError('required') && this.formAddenda.controls.cboArticulo.touched)
      ? 'Obligatorio' : null;
  }

  get cboProveedorError(): string {
    return (this.formAddenda.controls.cboProveedor.hasError('required') && this.formAddenda.controls.cboProveedor.touched)
      ? 'Obligatorio' : null;
  }
  //#endregion

  //#region Funciones de Listado
  async GetParametro() {
    let response = await this._addendaService.GetParametro(this.storageData.getPais())
    if (response.response.data.length > 0) {
      this.vParametro = response.response.data[0];
    } else {
      this.fnRegresar();
    }
  }

  async GetAllTipoArticulo() {
    let response = await this._addendaService.GetAllTipoArticulo()
    this.lTipoArticulo = response.response.data
  }

  async GetAllProveedor() {
    let response = await this._addendaService.GetAllProveedor(this.storageData.getPais())
    this.lProveedor = response.response.data

    let proveedorPorDefecto = this.lProveedor.find(item => item.bPorDefecto)
    if (proveedorPorDefecto) {
      this.formAddenda.controls.cboProveedor.setValue(proveedorPorDefecto.nIdCliente);
    }
  }

  async GetAllArticulo(idTipoArticulo: number) {
    this.formAddenda.controls.cboArticulo.setValue(null);
    this.lInformacionArticulo = [];
    this.lArticulo = [];
    this.vArticuloSeleccionado = null;
    let response = await this._addendaService.GetAllArticulo(this.storageData.getPais(), idTipoArticulo);

    this.lArticulo = response.response.data
  }

  async GetInformacionArticulo(idArticulo: number) {
    this.lInformacionArticulo = [];
    this.fnSeleccionarArticulo(idArticulo);
    let response = await this._perfilEquipoService.GetInformacionArticulo(idArticulo)
    this.lInformacionArticulo = response.response.data
  }

  async GetById(id: number) {
    try {
      let response = await this._addendaService.GetById(id)
      this.vAddenda = response.response.data[0]
    } catch (err) {
      this.fnRegresar();
    }
  }
  //#endregion

  //#region Detalle Addenda
  fnAnadirArticulo() {

    if (this.formAddenda.controls.cboTipoArticulo.invalid || this.formAddenda.controls.cboArticulo.invalid
      || this.formAddenda.controls.txtCantidad.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los campos.',
      });
      return;
    }
    let vDatos = this.formAddenda.value;

    let validar = this.lDetalleAddenda.find(item => item.nIdArticulo == vDatos.cboArticulo);
    if (validar) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El articulo indicado ya ha sido ingresado.',
      });
      this.formAddenda.controls.cboArticulo.setValue(null);
      this.lInformacionArticulo = [];
      this.vArticuloSeleccionado = null
      return;
    }

    let vArticulo = this.lArticulo.find(item => item.nIdArticulo == vDatos.cboArticulo)
    let vTipoArticulo = this.lTipoArticulo.find(item => item.elementoId == vDatos.cboTipoArticulo)

    let lCaracteristicas = this.lInformacionArticulo.map(item => {
      return item.sInformacion
    })

    let nIdMax = 0;
    this.lDetalleAddenda.forEach(item => {
      if (item.nIdDetAddenda > nIdMax) {
        nIdMax = item.nIdDetAddenda
      }
    })

    let row: DetalleAddendaTableTIDTO = {
      nIdDetAddenda: nIdMax + 1,
      sTipoActivo: vTipoArticulo.nombre,
      nIdAddenda: 0,
      nIdArticulo: vArticulo.nIdArticulo,
      sArticulo: vArticulo.sCodArticulo + ' - ' + vArticulo.sNombreProducto,
      sCaracteristica: lCaracteristicas.join(', '),
      nCantidad: Math.round(vDatos.txtCantidad),
      sRutaArchivo: vArticulo.sRutaArchivo,
      nIdTipoDispositivo: vDatos.cboTipoArticulo,
      sPartNumber: vArticulo.sPartNumber
    }
    this.lDetalleAddenda.push(row);
    this.dataSource = new MatTableDataSource(this.lDetalleAddenda);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnLimpiarControles();
  }

  fnLimpiarControles() {
    this.formAddenda.controls.cboTipoArticulo.setValue(null);
    this.formAddenda.controls.cboArticulo.setValue(null);
    this.formAddenda.controls.txtCantidad.setValue(1);
    this.lInformacionArticulo = [];
    this.vArticuloSeleccionado = null
    this.lArticulo = [];
    this.formAddenda.controls.cboTipoArticulo.markAsUntouched()
    this.formAddenda.controls.cboArticulo.markAsUntouched()
    this.formAddenda.controls.txtCantidad.markAsUntouched()
  }

  get totalCantidad() {
    if (this.dataSource == null) {
      return 0;
    }
    return this.dataSource.data.reduce((sum, current) => sum + current.nCantidad, 0);
  }

  fnVerImagen(sArticulo: string, sRutaArchivo: string) {

    if (sRutaArchivo != '' && sRutaArchivo != null) {
      Swal.fire({
        title: sArticulo.substring(0, 6),
        text: sArticulo.substring(9, 120),
        imageUrl: sRutaArchivo,
        imageWidth: 250,
        imageHeight: 250,
      })
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Este artículo no contiene una imagen',
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  fnEliminarFila(row: DetalleAddendaTableTIDTO) {
    this.lDetalleAddenda = this.lDetalleAddenda.filter(item => item.nIdArticulo != row.nIdArticulo);
    this.lDetalleArticuloAddenda = this.lDetalleArticuloAddenda.filter(item => item.nIdDetAddenda != row.nIdDetAddenda);
    this.dataSource = new MatTableDataSource(this.lDetalleAddenda);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fnVerDetalle(row: DetalleAddendaTableTIDTO) {
    this.spinner.show(); // Inicio de spinner

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(TiAddendaDetalleActivosComponent, {
      width: '1200px',
      autoFocus: false,
      data: {
        detalleAddenda: row,
        addenda: this.vAddenda
      },
      disableClose: true
    });

    dialogRef.beforeClosed().subscribe(result => {
      this.mostrarBotones = true;
    });
  }

  fnVerElementos(row: DetalleAddendaTableTIDTO) {

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(TiDialogActivoDetalleAddendaComponent, {
      width: '900px',
      maxWidth: '90vw',
      autoFocus: false,
      data: {
        detalleAddenda: row,
        addenda: this.vAddenda,
        detalleArticuloAddenda: this.lDetalleArticuloAddenda,
        bEditar: this.bEditar
      },
      disableClose: true
    });

    dialogRef.beforeClosed().subscribe(result => {
      this.mostrarBotones = true;
      if (result) {
        this.lDetalleArticuloAddenda = result;
      }
    });
  }
  //#endregion

  //#region Llenado valores
  fnLlenarValores() {
    this.formAddenda.controls.cboProveedor.setValue(this.vAddenda.nIdProveedor)
    this.formAddenda.controls.txtNumero.setValue(this.vAddenda.sNumero)
    this.formAddenda.controls.txtActualizo.setValue(this.vAddenda.sUsrCreacion)
    this.formAddenda.controls.txtFechaActualizo.setValue(this.vAddenda.dFechaCreacion)
    this.formAddenda.controls.txtEstado.setValue(this.vAddenda.sEstado)

    this.formAddenda.controls.cboFechaInicio.setValue(moment(this.vAddenda.sFechaInicio, 'DD/MM/YYYY'))
    this.formAddenda.controls.cboFechaFin.setValue(moment(this.vAddenda.sFechaFin, 'DD/MM/YYYY'))
    //Deshabilitando controles
    this.formAddenda.controls.cboProveedor.disable()
    this.formAddenda.controls.cboFechaInicio.disable()
    this.formAddenda.controls.cboFechaFin.disable()
    this.formAddenda.controls.cboTipoArticulo.disable()
    this.formAddenda.controls.cboTipoArticulo.disable()
    this.formAddenda.controls.cboArticulo.disable()
    this.formAddenda.controls.txtCantidad.disable()
    this.formAddenda.controls.cboInformacion.disable()
    this.formAddenda.controls.cboTipoArticulo.setValue(null)

    this.bEditar = true;
    this.bGuardar = false;
    this.bCancelar = false;

    if (!this.vAddenda.bEditar) {
      this.bAddendaSinProcesar = false;
      this.bEditar = false;
    }

    this.lDetalleAddenda = this.vAddenda.detalleAddenda;
    this.dataSource = new MatTableDataSource(this.lDetalleAddenda);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.lDetalleArticuloAddenda = this.vAddenda.detalleAddendaArticulo;

  }

  async fnSeleccionarArticulo(idArticulo: number) {
    this.vArticuloSeleccionado = this.lArticulo.find(item => item.nIdArticulo == idArticulo);
  }
  //#endregion

  //#region Helpers
  fnDetalleArticulo(nIdDetAddenda: number) {
    return this.lDetalleArticuloAddenda.filter(detalle => detalle.nIdDetAddenda == nIdDetAddenda)
      .map(detArt => {
        return {
          nIdDetAddendaArticulo: 0,
          nIdDetAddenda: 0,
          nIdDispositivoParte: detArt.nIdTipoDispositivo,
          nIdArticulo: detArt.nIdArticulo
        }
      })
  }

  //#endregion
}
