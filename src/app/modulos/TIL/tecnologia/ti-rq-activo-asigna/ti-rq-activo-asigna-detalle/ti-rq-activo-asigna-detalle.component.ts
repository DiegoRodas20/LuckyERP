import { DecimalPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment, { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { AsignacionDirectaSelectItemDTO } from '../../api/models/asignacionDirectaDTO';
import { DetalleRequerimientoHerramientaDTO, HerramientaRqDetalleTable, PersonalRqHerramientaDTO, PresupuestoRqHerramientaDTO, RequerimientoHerramientaCabeceraDTO, RequerimientoHerramientaUnoDTO, RqHerramientaEstado } from '../../api/models/requerimientoHerramienta.model';
import { RequerimientoHerramientaService } from '../../api/services/requerimiento-herramienta.service';
import { TiDialogDetalleRqHerramientaComponent } from './ti-dialog-detalle-rq-herramienta/ti-dialog-detalle-rq-herramienta.component';
import { TiDialogHistorialEstadoRqHerramientaComponent } from './ti-dialog-historial-estado-rq-herramienta/ti-dialog-historial-estado-rq-herramienta.component';

@Component({
  selector: 'app-ti-rq-activo-asigna-detalle',
  templateUrl: './ti-rq-activo-asigna-detalle.component.html',
  styleUrls: ['./ti-rq-activo-asigna-detalle.component.css'],
  animations: [asistenciapAnimations],
  providers: [DecimalPipe]
})
export class TiRqActivoAsignaDetalleComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables auxiliares
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada
  nIdRequerimiento = 0; // El Id del requerimiento para ver el detalle
  nIdPerfilUsuario = 0; // El Id del perfil de usuario que esta asignando actualmente
  vRequerimiento: RequerimientoHerramientaUnoDTO;
  // Combobox
  listaSolicitantes: PersonalRqHerramientaDTO[] = [];
  listaPresupuestos: PresupuestoRqHerramientaDTO[] = [];

  // Formulario
  formRequerimientoHerramienta: FormGroup;

  // Mat-Table (Gestion de activos)
  dataSource: MatTableDataSource<HerramientaRqDetalleTable>;
  listaDetalle: HerramientaRqDetalleTable[] = [];
  displayedColumns: string[] = ['opcion', "sDepositario", "sCargo", "sSucursal", "sHerramienta", "sPartida", "nUnidades", "nTotal"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) public sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  // Botones
  tsLista = 'inactive';
  fbLista = [
    { icon: 'history', tool: 'Ver Historial', state: true, color: 'secondary' },
    { icon: 'save', tool: 'Guardar', state: true, color: 'secondary' },
    { icon: 'add', tool: 'Agregar Herramienta', state: true, color: 'secondary' },
    { icon: 'edit', tool: 'Editar', state: true, color: 'secondary' },
    { icon: 'send', tool: 'Enviar', state: true, color: 'secondary' },
    { icon: 'close', tool: 'Cancelar', state: true, color: 'secondary' },
    { icon: 'exit_to_app', tool: 'Salir', state: true, color: 'secondary' }
  ];

  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Flags
  estaEditando = false; // Flag para activar/desactivar el modo edicion
  estaCreando = false; // Flag para activar/desactivar el modo creacion
  

  //variables
  idPersonal: number = 0;
  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private _requerimientoHerramientaService: RequerimientoHerramientaService,
    private decimalPipe: DecimalPipe
  ) {

    // Configuracion de formulario
    this.fnCrearFormulario();

    // Inicializar tablas
    this.dataSource = new MatTableDataSource(this.listaDetalle);

  }

  async ngOnInit(): Promise<void> {

    this.spinner.show();

    this.onToggleFab(1, -1);

    this.nIdRequerimiento = Number(this.activatedRoute.snapshot.paramMap.get('idRequerimiento'));

    // Seleccionar modo detalle o modo creacion
    if (this.nIdRequerimiento) {
      // Visualizacion del detalle
      const existeActivo = await this.fnModoVerDetalle();
      // Si no existe el activo, volvemos a la tabla principal
      !existeActivo ? this.fnSalir() : null;
    }
    else {
      // Creacion de activo
      this.fnModoCreacion();
    }

    // Llenado de controles
    //await this.fnLlenarComboboxColaborador();

    this.estaCargado = true;

    this.spinner.hide();

  }

  //#region Listados
  async GetPersonalActual() {
    let response = await this._requerimientoHerramientaService.GetPersonalActual(
      Number(this.storageData.getUsuarioId()))
    let personal = response.response.data[0];

    this.idPersonal = personal.nIdPersonal
    this.formRequerimientoHerramienta.controls.solicitante.setValue(personal.sNombreCompleto)
  }

  async GetPresupuestoBySolicitantes(nIdPersonal: number, nIdCentroCosto: number) {
    //Limpiando controles
    this.listaPresupuestos = [];
    this.formRequerimientoHerramienta.controls.presupuesto.setValue(null);
    this.formRequerimientoHerramienta.patchValue({
      ejecutivoCuenta: null,
      cliente: null
    })

    let response = await this._requerimientoHerramientaService.GetPresupuestoBySolicitante(nIdPersonal, nIdCentroCosto)
    this.listaPresupuestos = response.response.data
  }

  fnSeleccionarPresupuesto(nIdCentroCosto: number) {
    let presupuesto = this.listaPresupuestos.find(item => item.nIdCentroCosto == nIdCentroCosto);
    if (presupuesto) {
      this.formRequerimientoHerramienta.patchValue({
        ejecutivoCuenta: presupuesto.sEjecutivoCuenta,
        cliente: presupuesto.sCliente,
        fechaPpto: presupuesto.sFechas,
        servicio: presupuesto.sServicio,
        canal: presupuesto.sCanal
      })
    }
  }
  //#endregion
  //#region Botones

  // Metodo para abrir/cerrar menu de botones
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  // Metodo para utilizar las funciones del menu de botones
  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnVerHistorial();
        break;
      case 1:
        this.estaCreando ? await this.fnCrearRequerimiento() : await this.fnGuardarRequerimiento();
        break;
      case 2:
        this.fnAgregarArticulo();
        break;
      case 3:
        this.fnModoEditar();
        break;
      case 4:
        this.fnEnviar();
        break;
      case 5:
        this.fnCancelar();
        break;
      case 6:
        this.fnSalir();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab() {

    this.fbLista[0].state = !this.estaCreando && !this.estaEditando; //ver Historial
    this.fbLista[1].state = this.estaCreando || this.estaEditando; //Guardar
    this.fbLista[2].state = this.estaCreando || this.estaEditando; //Agregar detalle
    this.fbLista[3].state = !this.estaCreando && !this.estaEditando && this.vRequerimiento?.nIdEstado == 2051; //Editar
    this.fbLista[4].state = !this.estaCreando && !this.estaEditando && this.vRequerimiento?.nIdEstado == 2051; //Enviar, 2551=Pendiente
    this.fbLista[5].state = !this.estaCreando && this.estaEditando; //Cancelar

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Formulario

  fnCrearFormulario() {
    this.formRequerimientoHerramienta = this.fb.group(
      {
        solicitante: [null, Validators.compose([Validators.required])],
        presupuesto: [null, Validators.compose([Validators.required])],
        cliente: [null],
        ejecutivoCuenta: [null],
        servicio: [null],
        canal: [null],
        fechaPpto: [null],
        titulo: [null, Validators.compose([Validators.required])],
        fechaSolicitud: [moment()],
        observaciones: [null],
        montoTotal: [null],
        // Auditoria
        numero: null,
        usuarioCreacion: null,
        fechaCreacion: moment().format('DD/MM/YYYY'),
        estado: 'Pendiente',
      }
    );
  }

  //#endregion

  // Llenado de la tabla de herramientas
  async fnLlenarTabla() {
    try {

      this.dataSource.data = this.listaDetalle;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      // Primera pagina
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }

      this.fnSetTotales();
    }
    catch (err) {
      console.log(err);
    }
  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async fnReiniciarFiltro() {
    this.spinner.show();

    // Limpiar el filtro
    this.txtFiltro.setValue('');
    this.dataSource.filter = '';

    this.spinner.hide();
  }

  fnSetTotales() {
    let suma = this.dataSource.data.reduce((sum, current) => sum + current.nTotal, 0)
    this.formRequerimientoHerramienta.controls.montoTotal.setValue(this.decimalPipe.transform(suma, '1.4-4'));
  }
  //#endregion

  //#region Controles

  async fnLlenarCombobox(): Promise<void> {

  }

  fnBloquearControles(): void {
    this.estaEditando = false;
    this.formRequerimientoHerramienta.controls.solicitante.disable();
    this.formRequerimientoHerramienta.controls.presupuesto.disable();

    this.formRequerimientoHerramienta.controls.titulo.disable();
    this.formRequerimientoHerramienta.controls.fechaSolicitud.disable();
    this.formRequerimientoHerramienta.controls.observaciones.disable();
    this.formRequerimientoHerramienta.controls.montoTotal.disable();
    this.fnControlFab(); // Actualizar menu de botones
  }

  fnDesbloquearControles(): void {
    this.estaEditando = true;

    this.formRequerimientoHerramienta.controls.titulo.enable();
    this.formRequerimientoHerramienta.controls.fechaSolicitud.enable();
    this.formRequerimientoHerramienta.controls.observaciones.enable();
    this.formRequerimientoHerramienta.controls.montoTotal.enable();

    this.fnControlFab(); // Actualizar menu de botones
  }

  //#endregion

  //#region Inicializacion

  // Activar el modo de creacion del activo
  async fnModoCreacion() {

    this.estaCreando = true;
    this.fnDesbloquearControles();

    this.formRequerimientoHerramienta.patchValue({
      usuarioCreacion: this.storageData.getLoginUsuario(),
      fechaCreacion: moment(new Date()).format("DD/MM/YYYY"),
      estado: 'Pendiente'
    });

    this.listaDetalle = [];
    this.fnLlenarTabla();

    this.fnControlFab();

    //Listados
    this.spinner.show();
    await this.GetPersonalActual();
    await this.GetPresupuestoBySolicitantes(this.idPersonal, 0);
    this.spinner.hide();
  }

  // Activar el modo de vista previa
  async fnModoVerDetalle(): Promise<Boolean> {

    const result = await this._requerimientoHerramientaService.GetById(Number(this.storageData.getEmpresa()), this.nIdRequerimiento);

    // Si no encuentra el activo o es un activo de tipo diferente, da error y no continua
    if (!result.success) {
      this.spinner.hide();
      Swal.fire({ icon: 'warning', title: 'Advertencia', text: 'No se encontró el detalle' });
      return false;
    }

    const data = result.response.data[0]
    this.vRequerimiento = data;
    this.estaCreando = false;
    this.fnBloquearControles();

    this.formRequerimientoHerramienta.patchValue({

      solicitante: data.sSolicitante,
      presupuesto: data.nIdCentroCosto,
      cliente: '',
      ejecutivoCuenta: '',
      titulo: data.sTitulo,
      fechaSolicitud: moment(data.sFechaSolicitud, 'DD/MM/YYYY'),
      observaciones: data.sObservacion,
      montoTotal: 0,
      numero: data.sNumero,
      // Auditoria
      usuarioCreacion: data.sUsuarioRegistro,
      fechaCreacion: data.sFechaRegistro,
      estado: data.sEstado,
    });

    this.idPersonal = data.nIdSolicitante

    // Guardamos el detalle
    this.listaDetalle = data.detalle;

    this.spinner.show();
    await this.fnLlenarTabla();
    await this.GetPresupuestoBySolicitantes(data.nIdSolicitante, data.nIdCentroCosto);
    this.formRequerimientoHerramienta.controls.presupuesto.setValue(data.nIdCentroCosto)
    await this.fnSeleccionarPresupuesto(data.nIdCentroCosto)
    this.fnControlFab();
    this.spinner.hide();

    return true;
  }

  // Activar el modo de edicion
  fnModoEditar() {
    this.fnDesbloquearControles();
  }

  async fnEnviar() {

    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      text: 'Se enviará el documento actual',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    let model: RqHerramientaEstado = {
      nIdGastoCosto: this.nIdRequerimiento,
      nIdUsuario: Number(this.storageData.getUsuarioId()),
      nIdEstado: 2052,
      nIdEmpresa: Number(this.storageData.getEmpresa()),
      sIdPais: this.storageData.getPais(),
      sMensaje: ''
    }

    try {

      this.spinner.show();
      let result = await this._requerimientoHerramientaService.EnviarRqHerramienta(model);
      this.spinner.hide();

      if (!result.success) {
        let mensaje = result.errors.map(item => {
          return item.message
        })
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          html: mensaje.join(', '),
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        html: result.response.data[0].sMensaje,
        showConfirmButton: false,
        timer: 1500
      });
      await this.fnModoVerDetalle();
    }
    catch (err) {
      console.log(err);
    }
  }

  //#endregion

  //#region Acciones

  async fnCrearRequerimiento() {
    if (this.formRequerimientoHerramienta.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formRequerimientoHerramienta.markAllAsTouched();
      return;
    }

    if (this.listaDetalle.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Ingrese al menos una herramienta.',
      });
      return;
    }

    let datos = this.formRequerimientoHerramienta.getRawValue();

    let modelDetalle: DetalleRequerimientoHerramientaDTO[] = this.listaDetalle.map(detalle => {
      return {
        nIdGastoDet: 0,
        nIdGastoCosto: 0,
        nIdSucursal: detalle.nIdSucursal,
        nIdPartida: detalle.nIdPartida,
        nIdDepositario: detalle.nIdDepositario,
        nCantidad: detalle.nUnidades,
        nPrecio: detalle.nPrecio,
        nIdArticulo: detalle.nIdArticulo,
        nIdCargo: detalle.nIdCargo
      }
    })

    let model: RequerimientoHerramientaCabeceraDTO = {
      nIdGastoCosto: 0,
      nIdEmpresa: Number(this.storageData.getEmpresa()),
      nIdCentroCosto: datos.presupuesto,
      nIdSolicitante: this.idPersonal,
      sTipoDoc: 'RH',
      sTitulo: datos.titulo.trim(),
      nIdTipoCambio: 0,
      nIdMoneda: 0,
      dFecha: datos.fechaSolicitud.format('DD/MM/YYYY'),
      nIdUsrRegistro: Number(this.storageData.getUsuarioId()),
      dFechaRegistro: null,
      nIdUsrModifico: 0,
      nNumero: 0,
      nEstado: 0,
      sIdPais: this.storageData.getPais(),
      detalle: modelDetalle,
      sObservacion: (datos.observaciones ?? '').trim(),
    }

    try {
      this.spinner.show();
      let result = await this._requerimientoHerramientaService.InsertRqHerramienta(model);
      this.spinner.hide();

      if (!result.success) {
        let mensaje = result.errors.map(item => {
          return item.message
        })
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          html: mensaje.join(', '),
        });
        return;
      }

      await Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        html: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });

      this.route.navigate(['til/tecnologia/ti-RqActivo-Asigna/requerimiento', result.response.data[0].nIdGastoCosto]);
    }
    catch (err) {
      console.log(err);
    }
  }

  async fnGuardarRequerimiento() {
    if (this.formRequerimientoHerramienta.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los datos ingresados.',
      });
      this.formRequerimientoHerramienta.markAllAsTouched();
      return;
    }

    if (this.listaDetalle.length == 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Ingrese al menos una herramienta.',
      });
      return;
    }

    let datos = this.formRequerimientoHerramienta.getRawValue();

    let modelDetalle: DetalleRequerimientoHerramientaDTO[] = this.listaDetalle.map(detalle => {
      return {
        nIdGastoDet: 0,
        nIdGastoCosto: 0,
        nIdSucursal: detalle.nIdSucursal,
        nIdPartida: detalle.nIdPartida,
        nIdDepositario: detalle.nIdDepositario,
        nCantidad: detalle.nUnidades,
        nPrecio: detalle.nPrecio,
        nIdArticulo: detalle.nIdArticulo,
        nIdCargo: detalle.nIdCargo
      }
    })

    let model: RequerimientoHerramientaCabeceraDTO = {
      nIdGastoCosto: this.nIdRequerimiento,
      nIdEmpresa: Number(this.storageData.getEmpresa()),
      nIdCentroCosto: 0,
      nIdSolicitante: 0,
      sTipoDoc: 'RH',
      sTitulo: datos.titulo.trim(),
      nIdTipoCambio: 0,
      nIdMoneda: 0,
      dFecha: datos.fechaSolicitud.format('DD/MM/YYYY'),
      nIdUsrRegistro: 0,
      dFechaRegistro: null,
      nIdUsrModifico: Number(this.storageData.getUsuarioId()),
      nNumero: 0,
      nEstado: 0,
      sIdPais: this.storageData.getPais(),
      detalle: modelDetalle,
      sObservacion: (datos.observaciones ?? '').trim(),
    }

    try {
      let result = await this._requerimientoHerramientaService.UpdateRQHerramienta(model);
      if (!result.success) {
        let mensaje = result.errors.map(item => {
          return item.message
        })
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          html: mensaje.join(', '),
        });
        return;
      }

      await Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });

      this.fnModoVerDetalle();
    }
    catch (err) {
      console.log(err);
    }
  }

  async fnCancelar() {

    const modo = this.estaCreando ? 'creación' : (this.estaEditando ? 'edición' : null); // Mostrar en el mensaje si se esta editando o creando

    if (modo) {
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
      else {
        if (this.estaCreando) {
          this.fnSalir()
        }
        else if (this.estaEditando) {
          this.spinner.show();
          await this.fnModoVerDetalle();
          this.spinner.hide();
        }
      }
    }
  }

  fnSalir() {
    this.route.navigate(['til/tecnologia/ti-RqActivo-Asigna']);
  }

  //#endregion


  fnAgregarArticulo() {

    if (this.formRequerimientoHerramienta.controls.presupuesto.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Seleccione un presupuesto para poder continuar',
      });
      return;
    }

    this.mostrarBotones = false;

    let datos = this.formRequerimientoHerramienta.getRawValue();

    let fechaSolicitud: moment.Moment = datos.fechaSolicitud
    const dialog = this.dialog.open(TiDialogDetalleRqHerramientaComponent, {
      width: '900px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        lista: this.listaDetalle,
        idPresupuesto: datos.presupuesto,
        sAnio: fechaSolicitud.year().toString(),
        nMes: fechaSolicitud.month() + 1
      }
    }).afterClosed().subscribe(data => {
      this.mostrarBotones = true;
      if (data) {
        this.formRequerimientoHerramienta.controls.presupuesto.disable();
        this.formRequerimientoHerramienta.controls.fechaSolicitud.disable();
        this.listaDetalle.push(data);
        this.fnLlenarTabla();
      }
    })
  }

  fnEliminarFila(row: HerramientaRqDetalleTable) {
    this.listaDetalle = this.listaDetalle.filter(item => item.nIdDetalle != row.nIdDetalle)
    this.fnLlenarTabla();
  }


  //#region Ver historial
  fnVerHistorial() {
    const dialog = this.dialog.open(TiDialogHistorialEstadoRqHerramientaComponent, {
      width: '900px',
      maxWidth: '90vw',
      disableClose: true,
      data: this.nIdRequerimiento
    }).afterClosed().subscribe(data => {
      this.mostrarBotones = true;

    })
  }
  //#endregion
}
