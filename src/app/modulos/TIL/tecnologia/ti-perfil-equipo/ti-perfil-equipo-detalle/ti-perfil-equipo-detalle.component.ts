import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SecurityErp } from 'src/app/modulos/AAHelpers/securityErp.Entity';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ArticuloTIDTO, InformacionArticuloTIDTO } from '../../api/models/articuloDTO';
import { ElementoTIDTO } from '../../api/models/elementoTIDTO';
import { DetallePerfilEquipoArticuloTableTIDTO, DetallePerfilEquipoArticuloTIDTO, DetallePerfilEquipoTIDTO, MonedaPerfilTIDTO, PerfilEquipoCabeceraTIDTO, PerfilEquipoEstadoTIDTO, PerfilEquipoPenalidadDTO, PerfilEquipoTIDTO, PerfilEquipoUnoTIDTO } from '../../api/models/perfilEquipoTIDTO';
import { TipoElementoDto } from '../../api/models/tipoElementoDTO';
import { toggleFab } from '../../api/models/toggleFab';
import { PerfilEquipoService } from '../../api/services/perfil-equipo.service';
import { TiPerfilEquipoPenalidadComponent } from './ti-perfil-equipo-penalidad/ti-perfil-equipo-penalidad.component';

@Component({
  selector: 'app-ti-perfil-equipo-detalle',
  templateUrl: './ti-perfil-equipo-detalle.component.html',
  styleUrls: ['./ti-perfil-equipo-detalle.component.css'],
  animations: [asistenciapAnimations],
  providers: [DecimalPipe]
})
export class TiPerfilEquipoDetalleComponent implements OnInit {

  bNecesitaGarantia: boolean = true;

  // Botones
  tsLista = "inactive";
  fbLista: toggleFab[] = [
    { icon: "edit", tool: "Editar", state: 'bEditar', enabled: true, color: "secondary", functionName: 'fnEditar' },
    { icon: "save", tool: "Guardar", state: 'bGuardar', enabled: true, color: "secondary", functionName: 'fnGuardar' },
    { icon: "check", tool: "Activar", state: 'fnBotonActivar', enabled: true, color: "secondary", functionName: 'fnActivar' },
    { icon: "block", tool: "Inactivar", state: 'fnBotonInactivar', enabled: true, color: "secondary", functionName: 'fnInactivar' },
    { icon: "add", tool: "Agregar nuevo", state: 'fnFalse', enabled: true, color: "secondary", functionName: 'fnAgregarNuevo' },
    { icon: "close", tool: "Cancelar", state: 'bCancelar', enabled: true, color: "secondary", functionName: 'fnCancelar' },
    { icon: "receipt", tool: "Penalidades", state: 'bEditar', enabled: true, color: "secondary", functionName: 'fnPenalidad' },
    { icon: "exit_to_app", tool: "Salir", state: 'fnTrue', enabled: true, color: "secondary", functionName: 'fnRegresar' },
  ];
  abLista: toggleFab[] = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  bEditar = false;
  bGuardar = true;
  bCancelar = false;

  //Variables para Cargo chips con autocomplete
  filteredCargo: Observable<TipoElementoDto[]>;
  lCargo: TipoElementoDto[] = [];
  chipsCargo: TipoElementoDto[] = []; //Esta lista almacena todos los items seleccionados
  @ViewChild('cargoInput') CargoInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoCargo') autoCargo: MatAutocomplete;

  formPerfiles: FormGroup;

  lSubFamilia: TipoElementoDto[] = [];
  lArticulo: ArticuloTIDTO[] = [];
  lInformacionArticulo: InformacionArticuloTIDTO[] = [];
  lMoneda: MonedaPerfilTIDTO[] = [];
  lDetalleArticulo: DetallePerfilEquipoArticuloTableTIDTO[] = [];
  lTipoDispositivo: ElementoTIDTO[] = [];
  vArticulo: ArticuloTIDTO;

  vPerfilEquipo: PerfilEquipoUnoTIDTO;

  @Input() pIdRegistro: number;
  @Output() pMostrar = new EventEmitter<number>();

  separatorKeysCodes: number[] = [ENTER, COMMA];

  storageData: SecurityErp;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<DetallePerfilEquipoArticuloTableTIDTO>;
  displayedColumns = ['opcion', 'sArticulo', 'sCaracteristica', 'imagen'];

  constructor(
    private formBuilder: FormBuilder,
    private _perfilEquipoService: PerfilEquipoService,
    private spinner: NgxSpinnerService,
    private decimalPipe: DecimalPipe,
    private dialog: MatDialog, // Declaracion del Dialog
  ) {
    this.storageData = new SecurityErp()
    this.fnInicializarForm();
  }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1, -1)
    this.spinner.show();
    await this.GetAllSubFamilia();
    await this.GetAllCargo();
    await this.GetMoneda();

    this.spinner.hide();

    //Cuando es para actualizar
    if (this.pIdRegistro != 0) {
      await this.GetById(this.pIdRegistro);
      await this.fnLlenarValores();
    }

    this.filteredCargo = this.formPerfiles.controls.cboCargo.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.descripcion),
      map((presupuesto) => presupuesto ? this._filterCargo(presupuesto) : this.lCargo.slice()));
  }


  fnInicializarForm() {
    this.formPerfiles = this.formBuilder.group({
      txtTipoPerfil: ['', [Validators.required, Validators.maxLength(100)]],
      txtCosto: ['', [Validators.required, Validators.min(0)]],
      txtCostoTexto: [''],
      txtTiempoAnio: ['', [Validators.required, Validators.min(0)]],
      txtTiempoMes: ['', [Validators.required, Validators.min(0), Validators.max(11)]],
      cboCargo: [''],
      cboMoneda: [null, Validators.required],
      cboTipoDispositivo: [null, Validators.required],
      cboSubfamilia: [null, Validators.required],
      cboArticulo: [null, Validators.required],
      cboInformacion: [''],
      txtActualizo: [this.storageData.getLoginUsuario()],
      txtFechaActualizo: [moment().format("DD/MM/YYYY")],
      txtEstado: ['Pendiente'],
    })
  }

  //#region Funciones listados
  async GetAllSubFamilia() {
    let response = await this._perfilEquipoService.GetAllTipoElemento(this.storageData.getPais())
    this.lSubFamilia = response.response.data
  }

  async GetMoneda() {
    let response = await this._perfilEquipoService.GetMoneda(this.storageData.getPais())
    this.lMoneda = response.response.data
    let vMonedaOficial = this.lMoneda.find(item => item.bEsOficial)

    if (vMonedaOficial) {
      this.formPerfiles.controls.cboMoneda.setValue(vMonedaOficial.nIdTipEle);
    }
  }

  async GetById(id: number) {
    try {
      let response = await this._perfilEquipoService.GetById(id)
      this.vPerfilEquipo = response.response.data[0]
    } catch (err) {
      this.fnRegresar();
    }
  }

  async GetAllArticulo(idSubFamilia: number) {
    this.fnNecesitaGarantia(idSubFamilia)

    this.formPerfiles.controls.cboArticulo.setValue(null);
    this.lInformacionArticulo = [];
    this.lArticulo = [];

    this.vArticulo = null;

    this.spinner.show();
    //1813 = Correo corporativo, de frente listamos los articulos
    if (idSubFamilia == 1813) {
      let response = await this._perfilEquipoService.GetAllArticulo(idSubFamilia);
      this.lArticulo = response.response.data
      this.formPerfiles.controls.cboTipoDispositivo.setValidators([]);
      this.formPerfiles.controls.cboTipoDispositivo.updateValueAndValidity();
      this.formPerfiles.controls.cboTipoDispositivo.setValue(null);
      this.formPerfiles.controls.cboTipoDispositivo.disable();
    } else {
      this.formPerfiles.controls.cboTipoDispositivo.setValidators([Validators.required]);
      this.formPerfiles.controls.cboTipoDispositivo.updateValueAndValidity();
      this.formPerfiles.controls.cboTipoDispositivo.enable();
      this.formPerfiles.controls.cboTipoDispositivo.setValue(null);
      this.lTipoDispositivo = [];
      let response = await this._perfilEquipoService.GetTiposDispositivo(idSubFamilia);
      this.lTipoDispositivo = response.response.data
    }

    this.spinner.hide();
  }

  async GetAllArticuloDispositivo(nIdTipoDispositivo: number) {
    this.formPerfiles.controls.cboArticulo.setValue(null);
    this.lInformacionArticulo = [];
    this.lArticulo = [];

    this.vArticulo = null;

    let response = await this._perfilEquipoService.GetAllArticulo(null, nIdTipoDispositivo);
    this.lArticulo = response.response.data
  }

  async GetAllCargo() {
    let response = await this._perfilEquipoService.GetAllTipoElementoCargos(this.storageData.getPais())
    this.lCargo = response.response.data
  }

  async GetInformacionArticulo(idArticulo: number) {
    this.lInformacionArticulo = [];
    this.fnSeleccionarArticulo(idArticulo);
    this.spinner.show();
    let response = await this._perfilEquipoService.GetInformacionArticulo(idArticulo)
    this.lInformacionArticulo = response.response.data
    this.spinner.hide();

  }
  //#endregion

  //#region Chips Cargo
  fnEliminarCargo(cargo: TipoElementoDto) {
    this.chipsCargo = this.chipsCargo.filter(item => item.tipoElementoId != cargo.tipoElementoId)
  }

  fnAgregarCargo(event) {
    const input = event.input;
    const value = event.value;

    //Agregamos si es que tiene un Id
    if (value.tipoElementoId) {
      //Validamos que el Cargo no se haya agregado
      if (this.chipsCargo.findIndex(item => item.tipoElementoId == value.tipoElementoId) == -1) {
        this.chipsCargo.push(value);
      }
    }

    //Reseteamos el input
    if (input) {
      input.value = '';
    }

    this.formPerfiles.controls.cboCargo.setValue('');
  }

  fnSeleccionarCargo(event) {
    const value = event.option.value;
    if (value.tipoElementoId) {
      //Validamos que el Cargo no se haya agregado
      if (this.chipsCargo.findIndex(item => item.tipoElementoId == value.tipoElementoId) == -1) {
        this.chipsCargo.push(value);
      }
    }
    this.formPerfiles.controls.cboCargo.setValue('a');
    this.formPerfiles.controls.cboCargo.setValue('');
    this.CargoInput.nativeElement.value = '';
  }

  private _filterCargo(value): TipoElementoDto[] {
    const filterValue = value.toLowerCase();

    return this.lCargo.filter(cargo => cargo.descripcion.toLowerCase().includes(filterValue));
  }

  fnDisplayCargo(cargo: TipoElementoDto): string {
    return cargo && cargo.descripcion ? cargo.descripcion : '';
  }
  //#endregion

  //#region Errores Controles
  get txtTiempoMesError(): string {
    return this.formPerfiles.controls.txtTiempoMes.hasError('required') ? 'Obligatorio' :
      this.formPerfiles.controls.txtTiempoMes.hasError('max') ? 'Máximo 11' :
        this.formPerfiles.controls.txtTiempoMes.hasError('min') ? 'Mínimo 0' : null;
  }

  get txtTiempoAnioError(): string {
    return this.formPerfiles.controls.txtTiempoAnio.hasError('required') ? 'Obligatorio' :
      this.formPerfiles.controls.txtTiempoAnio.hasError('min') ? 'Mínimo 0' : null;
  }

  get txtCostoError(): string {
    return this.formPerfiles.controls.txtCosto.hasError('required') ? 'Obligatorio' :
      this.formPerfiles.controls.txtCosto.hasError('min') ? 'Mínimo 0' : null;
  }

  get txtTipoPerfilError(): string {
    return this.formPerfiles.controls.txtTipoPerfil.hasError('required') ? 'Obligatorio' :
      this.formPerfiles.controls.txtTipoPerfil.hasError('maxlength') ? 'Máximo 120' : null;
  }

  get cboSubfamiliaError(): string {
    return (this.formPerfiles.controls.cboSubfamilia.hasError('required') && this.formPerfiles.controls.cboSubfamilia.touched)
      ? 'Obligatorio' : null;
  }

  get cboMonedaError(): string {
    return (this.formPerfiles.controls.cboMoneda.hasError('required') && this.formPerfiles.controls.cboMoneda.touched)
      ? 'Obligatorio' : null;
  }

  get cboArticuloError(): string {
    return (this.formPerfiles.controls.cboArticulo.hasError('required') && this.formPerfiles.controls.cboArticulo.touched)
      ? 'Obligatorio' : null;
  }

  get cboTipoDispositivoError(): string {
    return (this.formPerfiles.controls.cboTipoDispositivo.hasError('required') && this.formPerfiles.controls.cboTipoDispositivo.touched)
      ? 'Obligatorio' : null;
  }

  get necesitaGarantia(): boolean {
    //Cuando es correo corp. no necesita garantia
    if (this.formPerfiles.controls.cboSubfamilia.value == 1813) {
      return false
    }
    return true
  }
  //#endregion

  //#region Funcion de interaccion con componentes
  fnRegresar() {
    this.pMostrar.emit(0);
  }

  fnVerImagen() {
    if (this.vArticulo.sRutaArchivo != '' && this.vArticulo.sRutaArchivo != null) {
      Swal.fire({
        text: this.vArticulo.sCodArticulo + ' - ' + this.vArticulo.sNombreProducto,
        imageUrl: this.vArticulo.sRutaArchivo,
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

  onToggleFab(fab: number, stat: number) {
    stat = stat === -1 ? (this.abLista.length > 0 ? 0 : 1) : stat;
    this.tsLista = stat === 0 ? "inactive" : "active";
    this.abLista = stat === 0 ? [] : this.fbLista;
  }

  clickFab(nombreFuncion: string) {
    this[nombreFuncion]();
  }

  fnSeleccionarArticulo(nIdArticulo: number) {
    this.vArticulo = this.lArticulo.find(item => nIdArticulo == item.nIdArticulo)
  }

  //Funciones para mostrar u ocultar botones
  get fnBotonActivar() {
    if (this.vPerfilEquipo?.bEstado == false && this.bGuardar) {
      return true;
    }
    return false;
  }

  get fnBotonInactivar() {
    if (this.vPerfilEquipo?.bEstado && this.bGuardar && !this.bEditar) {
      return true;
    }
    return false;
  }

  get fnTrue() {
    return true
  }

  get fnFalse() {
    return false
  }

  fnEditar() {
    this.bEditar = false;
    this.bGuardar = true;
    this.bCancelar = true;
    this.formPerfiles.controls.txtTipoPerfil.enable();
    this.formPerfiles.controls.txtCosto.enable();
    this.formPerfiles.controls.txtTiempoAnio.enable();
    this.formPerfiles.controls.txtTiempoMes.enable();
    this.formPerfiles.controls.cboArticulo.enable();
    this.formPerfiles.controls.cboInformacion.disable();
    this.formPerfiles.controls.cboMoneda.enable();
  }

  async fnCancelar() {
    await this.GetById(this.pIdRegistro);
    await this.fnLlenarValores();
  }
  //#endregion

  //#region Funcion Añadir/Actualizar
  async fnGuardar() {
    this.spinner.show();
    if (this.pIdRegistro == 0) {
      await this.InsertTransaction();
    } else {
      await this.UpdateTransaction();
    }
    this.spinner.hide();
  }
  async UpdateTransaction() {
    if (this.formPerfiles.controls.cboSubfamilia.invalid || this.formPerfiles.controls.cboMoneda.invalid ||
      this.formPerfiles.controls.txtCosto.invalid || this.formPerfiles.controls.txtTiempoAnio.invalid ||
      this.formPerfiles.controls.txtTiempoMes.invalid || this.formPerfiles.controls.txtTipoPerfil.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formPerfiles.markAllAsTouched();
      this.fnLimpiarControles();
      return;
    }

    if (this.lDetalleArticulo.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Ingrese al menos un artículo.',
      });
      return;
    }

    if (this.chipsCargo.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Ingrese al menos un cargo.',
      });
      return;
    }

    // Creamos una penalidad si el costo / descuento ha cambiado al editar el perfil
    if(Number(this.formPerfiles.get("txtCosto").value) != Number(this.vPerfilEquipo.nCosto)){
      if(!await this.fnCrearPenalidadPorCambioCosto()){
        return;
      }
    }

    let datos = this.formPerfiles.value;

    let model: PerfilEquipoTIDTO = {
      nIdPerfilEquipo: this.vPerfilEquipo.nIdPerfilEquipo,
      sNombrePerfil: datos.txtTipoPerfil,
      nIdArticulo: null,
      nMeses: Math.round(datos.txtTiempoMes),
      nAnios: Math.round(datos.txtTiempoAnio),
      nCosto: datos.txtCosto,
      nIdUsrCreacion: 0,
      dFechaCreacion: '',
      nIdUsrModifica: Number(this.storageData.getUsuarioId()),
      dFechaModifica: '',
      bEstado: true,
      nIdTipoActivo: datos.cboSubfamilia,
      nIdMoneda: datos.cboMoneda,
      nIdTipoDispositivo: 0
    }

    let modelDetalle: DetallePerfilEquipoTIDTO[] = this.chipsCargo.map(item => {
      return {
        nIdPerfilEquipoCargo: 0,
        nIdPerfilEquipo: 0,
        nIdCargo: item.tipoElementoId,
        bEstado: true
      }
    })

    let modelDetalleArticulo: DetallePerfilEquipoArticuloTIDTO[] = this.lDetalleArticulo.map(item => {
      return {
        nIdPerfilEquipoArticulo: 0,
        nIdPerfilEquipo: 0,
        nIdArticulo: item.nIdArticulo,
        bEstado: true
      }
    })

    let modelCabecera: PerfilEquipoCabeceraTIDTO = {
      ...model,
      detallePerfilEquipos: modelDetalle,
      sIdPais: this.storageData.getPais(),
      detalleArticulo: modelDetalleArticulo
    }

    try {
      let result = await this._perfilEquipoService.UpdateTransaction(modelCabecera);
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
      this.vPerfilEquipo = result.response.data[0]
      this.pIdRegistro = this.vPerfilEquipo.nIdPerfilEquipo
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se actualizo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      await this.fnLlenarValores();
    }
    catch (err) {
      console.log(err);
    }
  }

  async InsertTransaction() {
    if (this.formPerfiles.controls.cboSubfamilia.invalid || this.formPerfiles.controls.cboMoneda.invalid ||
      this.formPerfiles.controls.txtCosto.invalid || this.formPerfiles.controls.txtTiempoAnio.invalid ||
      this.formPerfiles.controls.txtTiempoMes.invalid || this.formPerfiles.controls.txtTipoPerfil.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formPerfiles.markAllAsTouched();
      this.fnLimpiarControles();
      return;
    }

    if (this.chipsCargo.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Ingrese al menos un cargo.',
      });
      return;
    }

    if (this.lDetalleArticulo.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Ingrese al menos un artículo.',
      });
      return;
    }

    let datos = this.formPerfiles.getRawValue();

    let model: PerfilEquipoTIDTO = {
      nIdPerfilEquipo: 0,
      sNombrePerfil: datos.txtTipoPerfil,
      nIdArticulo: null,
      nMeses: this.bNecesitaGarantia ? Math.round(datos.txtTiempoMes) : 1,
      nAnios: this.bNecesitaGarantia ? Math.round(datos.txtTiempoAnio) : 1,
      nCosto: datos.txtCosto,
      nIdUsrCreacion: Number(this.storageData.getUsuarioId()),
      dFechaCreacion: '',
      nIdUsrModifica: 0,
      dFechaModifica: '',
      bEstado: true,
      nIdTipoActivo: datos.cboSubfamilia,
      nIdMoneda: datos.cboMoneda,
      /* Si no necesita garantia es correo, y el correo no se le inserta el tipo dispositivo*/
      nIdTipoDispositivo: this.bNecesitaGarantia ? datos.cboTipoDispositivo : null
    }

    let modelDetalle: DetallePerfilEquipoTIDTO[] = this.chipsCargo.map(item => {
      return {
        nIdPerfilEquipoCargo: 0,
        nIdPerfilEquipo: 0,
        nIdCargo: item.tipoElementoId,
        bEstado: true
      }
    })

    let modelDetalleArticulo: DetallePerfilEquipoArticuloTIDTO[] = this.lDetalleArticulo.map(item => {
      return {
        nIdPerfilEquipoArticulo: 0,
        nIdPerfilEquipo: 0,
        nIdArticulo: item.nIdArticulo,
        bEstado: true
      }
    })

    let modelCabecera: PerfilEquipoCabeceraTIDTO = {
      ...model,
      detallePerfilEquipos: modelDetalle,
      sIdPais: this.storageData.getPais(),
      detalleArticulo: modelDetalleArticulo
    }

    try {
      let result = await this._perfilEquipoService.InsertTransaction(modelCabecera);
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
      this.vPerfilEquipo = result.response.data[0]
      this.pIdRegistro = this.vPerfilEquipo.nIdPerfilEquipo
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      await this.fnLlenarValores();
    }
    catch (err) {
      console.log(err);
    }
  }
  //#endregion

  //#region Detalle registro
  async fnLlenarValores() {
    this.formPerfiles.controls.cboSubfamilia.setValue(this.vPerfilEquipo.nIdTipoActivo)
    await this.GetAllArticulo(this.vPerfilEquipo.nIdTipoActivo)

    //1813=Correo Si no es correo entonces listamos los articulos 
    if (this.vPerfilEquipo.nIdTipoActivo != 1813) {
      this.formPerfiles.controls.cboTipoDispositivo.setValue(this.vPerfilEquipo.nIdTipoDispositivo);
      await this.GetAllArticuloDispositivo(this.vPerfilEquipo.nIdTipoDispositivo);
    }

    this.formPerfiles.controls.txtTipoPerfil.setValue(this.vPerfilEquipo.sNombrePerfil)
    this.formPerfiles.controls.txtCosto.setValue(this.vPerfilEquipo.nCosto)
    this.formPerfiles.controls.txtCostoTexto.setValue(this.decimalPipe.transform(this.vPerfilEquipo.nCosto, '1.2-2'))
    this.formPerfiles.controls.txtTiempoAnio.setValue(this.vPerfilEquipo.nAnios)
    this.formPerfiles.controls.txtTiempoMes.setValue(this.vPerfilEquipo.nMeses)
    this.formPerfiles.controls.cboMoneda.setValue(this.vPerfilEquipo.nIdMoneda)
    this.formPerfiles.controls.txtActualizo.setValue(this.vPerfilEquipo.sUsrModifica || this.vPerfilEquipo.sUsrCreacion)
    this.formPerfiles.controls.txtFechaActualizo.setValue(this.vPerfilEquipo.dFechaModifica || this.vPerfilEquipo.dFechaCreacion)
    this.formPerfiles.controls.txtEstado.setValue(this.vPerfilEquipo.sEstado)

    this.chipsCargo = this.vPerfilEquipo.detallePerfilEquipos;
    this.formPerfiles.controls.cboSubfamilia.disable();
    this.formPerfiles.controls.cboTipoDispositivo.disable();

    this.lDetalleArticulo = this.vPerfilEquipo.detalleArticulo;
    this.dataSource = new MatTableDataSource(this.lDetalleArticulo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    //Desabilitando controles
    this.formPerfiles.controls.txtTipoPerfil.disable();
    this.formPerfiles.controls.txtCosto.disable();
    this.formPerfiles.controls.txtTiempoAnio.disable();
    this.formPerfiles.controls.txtTiempoMes.disable();
    this.formPerfiles.controls.cboArticulo.disable();
    this.formPerfiles.controls.cboMoneda.disable();
    this.formPerfiles.controls.cboInformacion.disable();

    //Limpiando controles de articulo
    this.fnLimpiarControles();

    //Para que aparezcan los botones
    this.bEditar = true;
    this.bGuardar = false;
    this.bCancelar = false;
  }
  //#endregion

  //#region Funcion Activar/Inactivar
  async fnInactivar() {

    let modelEstado: PerfilEquipoEstadoTIDTO = {
      nIdPerfilEquipo: this.vPerfilEquipo.nIdPerfilEquipo,
      bEstado: false,
      sIdPais: this.storageData.getPais(),
      nIdUsrModifica: Number(this.storageData.getUsuarioId()),

    }

    try {
      let result = await this._perfilEquipoService.UpdateState(modelEstado);
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
      this.vPerfilEquipo = result.response.data[0]
      this.pIdRegistro = this.vPerfilEquipo.nIdPerfilEquipo
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se inactivo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      await this.fnLlenarValores();
    }
    catch (err) {
      console.log(err);
    }
  }

  async fnActivar() {
    let modelEstado: PerfilEquipoEstadoTIDTO = {
      nIdPerfilEquipo: this.vPerfilEquipo.nIdPerfilEquipo,
      bEstado: true,
      sIdPais: this.storageData.getPais(),
      nIdUsrModifica: Number(this.storageData.getUsuarioId()),
    }

    try {
      let result = await this._perfilEquipoService.UpdateState(modelEstado);


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

      this.vPerfilEquipo = result.response.data[0]
      this.pIdRegistro = this.vPerfilEquipo.nIdPerfilEquipo
      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se activo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      await this.fnLlenarValores();
    }
    catch (err) {
      console.log(err);
    }
  }
  //#endregion

  //#region Para correos
  fnNecesitaGarantia(nIdSubFamilia: number) {
    //Cuando es correo corp. no necesita garantia
    if (nIdSubFamilia == 1813) {
      this.formPerfiles.controls.txtTiempoAnio.setValidators([]);
      this.formPerfiles.controls.txtTiempoMes.setValidators([]);
      this.formPerfiles.controls.txtTiempoMes.updateValueAndValidity();
      this.formPerfiles.controls.txtTiempoAnio.updateValueAndValidity();

      this.bNecesitaGarantia = false;
    } else {
      this.formPerfiles.controls.txtTiempoAnio.setValidators([Validators.required, Validators.min(0)]);
      this.formPerfiles.controls.txtTiempoMes.setValidators([Validators.required, Validators.min(0), Validators.max(11)]);
      this.formPerfiles.controls.txtTiempoMes.updateValueAndValidity();
      this.formPerfiles.controls.txtTiempoAnio.updateValueAndValidity();
      this.bNecesitaGarantia = true;
    }

  }



  //#endregion

  //#region Agregar nuevo
  async fnAgregarNuevo() {
    this.formPerfiles.reset();
    this.formPerfiles.controls.txtActualizo.setValue(this.storageData.getLoginUsuario());
    this.formPerfiles.controls.txtFechaActualizo.setValue(moment().format("DD/MM/YYYY"));
    this.formPerfiles.controls.txtEstado.setValue('Pendiente');
    this.chipsCargo = [];
    this.lInformacionArticulo = [];
    this.lArticulo = [];
    this.lTipoDispositivo = [];
    this.pIdRegistro = 0;
    this.vPerfilEquipo = null;

    this.bEditar = false;
    this.bGuardar = true;
    this.bCancelar = false;
    this.formPerfiles.controls.cboSubfamilia.enable();
    this.formPerfiles.controls.txtTipoPerfil.enable();
    this.formPerfiles.controls.txtCosto.enable();
    this.formPerfiles.controls.txtTiempoAnio.enable();
    this.formPerfiles.controls.txtTiempoMes.enable();
    this.formPerfiles.controls.cboArticulo.enable();
    this.formPerfiles.controls.cboInformacion.enable();
    this.formPerfiles.controls.cboMoneda.enable();
    this.formPerfiles.controls.cboTipoDispositivo.enable();

    this.lDetalleArticulo = [];
    this.dataSource = new MatTableDataSource(this.lDetalleArticulo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnLimpiarControles();

    await this.GetMoneda();
  }
  //#endregion

  //#region Detalle de articulo
  fnAnadirArticulo() {
    if (this.formPerfiles.controls.cboArticulo.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Seleccione un artículo.',
      });
      return;
    }

    let validar = this.lDetalleArticulo.find(item => item.nIdArticulo == this.formPerfiles.controls.cboArticulo.value)

    if (validar) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El artículo indicado ya ha sido registrado.',
      });
      return;
    }

    let vArticulo = this.lArticulo.find(item => item.nIdArticulo == this.formPerfiles.controls.cboArticulo.value)

    let lCaracteristicas = this.lInformacionArticulo.map(item => {
      return item.sInformacion
    })

    let nIdMax = 0
    this.lDetalleArticulo.forEach(item => {
      if (item.nIdPerfilEquipoArticulo > nIdMax) {
        nIdMax = item.nIdPerfilEquipoArticulo;
      }
    })

    let row: DetallePerfilEquipoArticuloTableTIDTO = {
      nIdPerfilEquipoArticulo: nIdMax + 1,
      nIdPerfilEquipo: 0,
      nIdArticulo: vArticulo.nIdArticulo,
      sArticulo: vArticulo.sCodArticulo + ' - ' + vArticulo.sNombreProducto,
      sCaracteristica: lCaracteristicas.join(', '),
      sRutaArchivo: vArticulo.sRutaArchivo,
      bEstado: true
    }

    //Deshabilitamos los controles para que no cambie la subfamilia ni el tipo dispositivo
    this.formPerfiles.controls.cboTipoDispositivo.disable();
    this.formPerfiles.controls.cboSubfamilia.disable();

    this.lDetalleArticulo.push(row);
    this.dataSource = new MatTableDataSource(this.lDetalleArticulo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnLimpiarControles();
  }

  fnLimpiarControles() {
    this.formPerfiles.controls.cboArticulo.setValue(null);
    this.formPerfiles.controls.cboArticulo.markAsUntouched();
    this.lInformacionArticulo = [];

    this.vArticulo = null;
  }

  fnEliminarFila(row: DetallePerfilEquipoArticuloTableTIDTO) {
    this.lDetalleArticulo = this.lDetalleArticulo.filter(item => item.nIdPerfilEquipoArticulo != row.nIdPerfilEquipoArticulo)
    this.dataSource = new MatTableDataSource(this.lDetalleArticulo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  fnVerImagenArticulo(sArticulo: string, sRutaArchivo: string) {

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
  //#endregion

  //#region Penalidad

  fnPenalidad(){
    this.spinner.show(); // Inicio de spinner

    this.mostrarBotones = false; // Ocultar botones de opciones

    const dialogRef = this.dialog.open(TiPerfilEquipoPenalidadComponent, {
      width: '1200px',
      autoFocus: false,
      disableClose: true,
      //backdropClass: 'backdropBackground',
      data: {
        nIdPenalidad: this.vPerfilEquipo.nIdPenalidad,
        nIdPerfil: this.vPerfilEquipo.nIdPerfilEquipo,
        precioLista: this.vPerfilEquipo.nCosto,
        nIdTipoActivo: this.vPerfilEquipo.nIdTipoActivo
      }
    });

    dialogRef.beforeClosed().subscribe(result => {
      if(result){
        this.vPerfilEquipo.nIdPenalidad = result;
      }
      this.mostrarBotones = true;
    });
  }

  async fnCrearPenalidadPorCambioCosto() {

    this.spinner.hide();

    const confirma = await Swal.fire({
      title: `Hubo un cambio en el descuento`,
      text: `Hay una penalidad existente para el descuento de este perfil equipo. Si desea seguir con la actualización, es necesario un nuevo precio de venta para la penalidad de reposición del activo`,
      input: 'number',
      inputPlaceholder: "Ingrese cantidad del precio de venta",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    const { value: mensaje } = confirma;

    if (!confirma.isConfirmed) {
      return false;
    }
    else{

      this.spinner.show();

      const formData = this.formPerfiles.value;

      if(Number(mensaje) >= Number(formData.txtCosto)){
        Swal.fire("Verificar","El precio de venta no puede ser mayor o igual al precio de lista", "warning");
        return false;
      }

      // Inhabilitamos la penalidad actual
      const modelInhabilitar = {
        nIdPerfilEquipo: this.vPerfilEquipo.nIdPerfilEquipo,
        sPais: this.storageData.getPais()
      }

      this._perfilEquipoService.UpdateEstadoPenalidadInhabilitar(modelInhabilitar);

      if(this.vPerfilEquipo.nIdTipoActivo == 1657){
        if(!await this.fnCrearPenalidadMoviles(Number(mensaje))){
          return false;
        }
      }
      else{
        if(!await this.fnCrearPenalidadLaptopDesktop(Number(mensaje))){
          return false;
        }
      }
      
      return true;
    }
  }

  async fnCrearPenalidadMoviles(precioVenta: number){

    const formData = this.formPerfiles.value;

    if(Number(precioVenta) >= Number(formData.txtCosto)){
      Swal.fire("Verificar","El precio de venta no puede ser mayor o igual al precio de lista", "warning");
      return false;
    }

    this.spinner.show();

    const modelPenalidad: PerfilEquipoPenalidadDTO = {
      nIdPerfilEquipo: this.vPerfilEquipo.nIdPerfilEquipo,
      nPrecioVenta: precioVenta,
      nCosto: formData.txtCosto,
      nIdUsrRegistro: this.storageData.getUsuarioId(),
      bEstado: true,
      sPais: this.storageData.getPais(),
      detalle: [],
    }

    const cantidadMeses = 18

    for(let i = 1; i <= cantidadMeses; i++){

      const precioCalculado = Math.round((Number(formData.txtCosto) - Number(precioVenta)) * ((Number(cantidadMeses) - i + 1) / (Number(cantidadMeses))));

      modelPenalidad.detalle.push({
        nMesSiniestro: i,
        // (PL – PV) x ((cantidadMeses - mes actual)/cantidadMeses)
        nPrecioCalculado: precioCalculado,
        nCostoNuevo: Number(precioVenta),
        nPrecioTotal: Number(precioVenta) + precioCalculado
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

    return true;
  }

  async fnCrearPenalidadLaptopDesktop(noDevolucion: number){

    const formData = this.formPerfiles.value;

    if(Number(noDevolucion) >= Number(formData.txtCosto)){
      Swal.fire("Verificar","El precio de venta no puede ser mayor o igual al precio de lista", "warning");
      return false;
    }

    this.spinner.show();

    const modelPenalidad: PerfilEquipoPenalidadDTO = {
      nIdPerfilEquipo: this.vPerfilEquipo.nIdPerfilEquipo,
      nNoDevolucion: noDevolucion,
      nCosto: formData.txtCosto,
      nIdUsrRegistro: this.storageData.getUsuarioId(),
      bEstado: true,
      sPais: this.storageData.getPais(),
      detalle: [],
    }

    const cantidadMeses = 36

    const valorMensual = Number(formData.txtCosto) / Number(cantidadMeses);

    for(let i = 1; i <= cantidadMeses; i++){

      if(i >= 13){

        const nPrecioCalculado = valorMensual * (Number(cantidadMeses) - i);

        modelPenalidad.detalle.push({
          nMesSiniestro: i,
          nNoDevolucion: noDevolucion,
          nPrecioCalculado: nPrecioCalculado,
          nPrecioTotal: nPrecioCalculado + noDevolucion
        })
      }
      else{
        modelPenalidad.detalle.push({
          nMesSiniestro: i,
          nNoDevolucion: 0,
          nPrecioCalculado: formData.txtCosto,
          nPrecioTotal: formData.txtCosto + 0
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

    return true;
  }

  //#endregion
}
