import { OverlayContainer } from '@angular/cdk/overlay';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ActivoAsignaUnoTIDTO, AsignacionActivoTIDTO, DetalleAsignacionActivoTableTIDTO } from '../../api/models/activoAsignacionTITDO';
import { TipoElementoDto } from '../../api/models/tipoElementoDTO';
import { toggleFab } from '../../api/models/toggleFab';
import { ActivoAsignacionService } from '../../api/services/activo-asignacion.service';
import { TiDetalleActivoAsignaComponent } from '../ti-detalle-activo-asigna/ti-detalle-activo-asigna.component';

@Component({
  selector: 'app-ti-rq-activo-detalle',
  templateUrl: './ti-rq-activo-detalle.component.html',
  styleUrls: ['./ti-rq-activo-detalle.component.css'],
  animations: [asistenciapAnimations],
  providers: [DatePipe]
})

export class TiRqActivoDetalleComponent implements OnInit {

  // Variables auxiliares
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada
  asignacionAbierta: boolean = false;
  readonly RQ_PERSONAL_CAMPO = 2530
  readonly RQ_HERRAMIENTA_TI = 2668

  //Botones
  tsLista = 'inactive';
  fbLista: toggleFab[] = [
    { icon: 'save', tool: 'Guarda Activo', state: 'btnGuardar', color: 'secondary', functionName: 'fnGuardar' },
    { icon: 'edit', tool: 'Editar Activo', state: 'btnEditar', color: 'secondary', functionName: 'fnEditar' },
    { icon: 'settings', tool: 'Asignar Activo', state: 'btnGuardar', color: 'secondary', functionName: 'fnAgregarActivo' },
    { icon: 'close', tool: 'Cancelar', state: 'btnCancelar', color: 'btnCancelar', functionName: 'fnCancelar' },
    { icon: 'exit_to_app', tool: 'Salir', state: 'fnTrue', color: 'secondary', functionName: 'fnSalir' }
  ];
  abLista: toggleFab[] = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  btnEditar = true;
  btnGuardar = false;
  btnCancelar = false;

  // Flags
  estaEditando = false; // Flag para activar/desactivar el modo edicion
  estaCreando = false; // Flag para activar/desactivar el modo creacion

  // Mat-Table
  dataSource: MatTableDataSource<DetalleAsignacionActivoTableTIDTO>;
  displayedColumns: string[] = ["sTipoActivo", "nCantidad", "sNombrePerfil", "sNombreProducto"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  idAsignaActivo: string | null;

  vAsignaActivo: ActivoAsignaUnoTIDTO;
  lDetalle: DetalleAsignacionActivoTableTIDTO[] = [];
  formAsignaActivo: FormGroup;
  storageData: SecurityErp;

  txtFiltro = new FormControl();

  lTipoActivo: TipoElementoDto[] = []

  constructor(
    private route: Router,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private _activoAsignacionService: ActivoAsignacionService,
    private _datePipe: DatePipe,
  ) {

    this.inicializarForm();
  }

  async ngOnInit(): Promise<void> {
    this.onToggleFab(1, -1);
    this.storageData = new SecurityErp();
    this.idAsignaActivo = this.activatedRoute.snapshot.paramMap.get('id');

    if (this.idAsignaActivo) {
      await this.GetById(Number(this.idAsignaActivo))
    }

    this.estaCargado = true;
  }

  fnLLenarValores() {

    this.formAsignaActivo.controls.txtSolicitante.setValue(this.vAsignaActivo.sNroDoc + '-' + this.vAsignaActivo.sNombreSolicitante);
    this.formAsignaActivo.controls.txtCorreo.setValue(this.vAsignaActivo.sCorreo);
    this.formAsignaActivo.controls.txtCargoSolicitante.setValue(this.vAsignaActivo.sCargoSolicitante);
    this.formAsignaActivo.controls.txtTelefono.setValue(this.vAsignaActivo.sTelefono);
    this.formAsignaActivo.controls.txtMotivo.setValue(this.vAsignaActivo.sMotivo);
    this.formAsignaActivo.controls.txtCuenta.setValue(this.vAsignaActivo.sNombreComercial);
    this.formAsignaActivo.controls.txtCanal.setValue(this.vAsignaActivo.sCanal);
    this.formAsignaActivo.controls.txtPresupuesto.setValue(this.vAsignaActivo.sPresupuesto);
    this.formAsignaActivo.controls.txtCargo.setValue(this.vAsignaActivo.sCargo);
    this.formAsignaActivo.controls.txtInicioActividad.setValue(this._datePipe.transform(this.vAsignaActivo.dFecIni, 'dd/MM/yyyy'));
    this.formAsignaActivo.controls.txtFinActividad.setValue(this._datePipe.transform(this.vAsignaActivo.dFecFin, 'dd/MM/yyyy'));
    this.formAsignaActivo.controls.txtPlanilla.setValue(this.vAsignaActivo.sPLanilla);
    this.formAsignaActivo.controls.txtNrReq.setValue(this.vAsignaActivo.sCodRQ);
    this.formAsignaActivo.controls.txtVacante.setValue(this.vAsignaActivo.nVacante);
    this.formAsignaActivo.controls.txtActualizo.setValue(this.storageData.getLoginUsuario());
    this.formAsignaActivo.controls.txtFechaAct.setValue(moment().format('DD/MM/YYYY'));
    this.formAsignaActivo.controls.txtEstado.setValue(this.vAsignaActivo.sEstado);
    this.formAsignaActivo.controls.txtObservacion.setValue(this.vAsignaActivo.sObservacion);

    this.formAsignaActivo.controls.txtServicio.setValue(this.vAsignaActivo.sServicio);
    this.formAsignaActivo.controls.txtFechasCC.setValue(this.vAsignaActivo.sFechasCC);
    this.formAsignaActivo.controls.txtTituloGastoCosto.setValue(this.vAsignaActivo.sTituloGastoCosto);
    this.formAsignaActivo.controls.txtFechaGastoCosto.setValue(this.vAsignaActivo.sFechaGastoCosto);

    if (this.vAsignaActivo.nIdEstado == 2665) { //Solicitado
      this.btnEditar = false;
    }

    this.lDetalle = this.vAsignaActivo.detalleAsignacionActivos;
    this.dataSource = new MatTableDataSource(this.lDetalle);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.lTipoActivo = this.lDetalle.map(item => {
      return {
        tipoElementoId: item.nIdSubFamilia,
        codigo: '',
        descripcion: item.sTipoActivo,
        descripcionCorta: '',
        tipoElementoPadreId: 0,
        paisId: ''
      }
    })
  }

  inicializarForm() {
    this.formAsignaActivo = this.formBuilder.group({
      txtSolicitante: [null],
      txtCorreo: [null],
      txtCargoSolicitante: [null],
      txtTelefono: [null],
      txtMotivo: [null],
      txtCuenta: [null],
      txtCanal: [null],
      txtPresupuesto: [null],
      txtVacante: [null],
      txtCargo: [null],
      txtInicioActividad: [null],
      txtFinActividad: [null],
      txtPlanilla: [null],
      txtObservacion: [null],
      txtNrReq: [null],
      txtActualizo: [null],
      txtFechaAct: [null],
      txtEstado: [null],
      /*Controles para RQ de herramienta TI*/
      txtServicio: [null],
      txtFechasCC: [null],
      txtTituloGastoCosto: [null],
      txtFechaGastoCosto: [null],

    })
  }

  async GetById(id: number) {
    try {

      let response = await this._activoAsignacionService.GetById(id)

      this.vAsignaActivo = response.response.data[0]
      this.fnLLenarValores();
    } catch (err) {
      this.fnSalir();
    }
  }

  //#region Botones

  // Metodo para abrir/cerrar menu de botones
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  // Metodo para utilizar las funciones del menu de botones
  async clickFab(functionName: string) {
    if (this[functionName]) {
      await this[functionName]();
    }
  }

  get fnTrue() {
    return true;
  }

  fnEditar() {
    this.btnGuardar = true;
    this.btnCancelar = true;
    this.btnEditar = false;
  }

  fnCancelar() {
    this.btnCancelar = false;
    this.btnGuardar = false;
    this.btnEditar = true;
  }

  async fnGuardar() {
    await this.updateCabecera();
    this.btnCancelar = false;
    this.btnGuardar = false;
    this.btnEditar = true;
  }

  fnSalir() {
    this.route.navigate(['til/tecnologia/ti-RqActivo']);
  }

  fnAgregarActivo() {
    this.asignacionAbierta = true;
  }

  //#endregion


  fnVerDetalleActivo(row: DetalleAsignacionActivoTableTIDTO) {
    const dialog = this.dialog.open(TiDetalleActivoAsignaComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: row,
      disableClose: true
    })
  }

  fnVerImagen(row: DetalleAsignacionActivoTableTIDTO) {
    if (row.sRutaArchivo != '' || row.sRutaArchivo != null) {
      Swal.fire({
        text: row.sCodArticulo + '-' + row.sNombreProducto,
        imageUrl: row.sRutaArchivo,
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

  async fnOcultarAsignacion(p: boolean) {
    this.asignacionAbierta = p;
    //await this.GetAll();
  }

  async updateCabecera() {

    let datos = this.formAsignaActivo.value;

    let cabecera: AsignacionActivoTIDTO = {
      nIdActivoAsigna: Number(this.idAsignaActivo),
      nIdTipoAsigna: 0,
      nIdRq: 0,
      nIdSolicitante: 0,
      nIdCentroCosto: 0,
      nIdUsuario: Number(this.storageData.getUsuarioId()),
      dFecha: null,
      nIdEstado: 0,
      nIdUsrAtencion: 0,
      dFechaAtencion: null,
      nIdUsrTerminado: 0,
      dFechaTerminado: null,
      sObservacion: datos.txtObservacion.trim(),
      detalleAsignacionActivo: [],
      sIdPais: this.storageData.getPais()
    }

    try {
      let result = await this._activoAsignacionService.UpdateCabecera(cabecera);
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

      await this.GetById(Number(this.idAsignaActivo))

    }
    catch (err) {
      console.log(err);
    }
  }
}