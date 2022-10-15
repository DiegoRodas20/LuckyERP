import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { Almacen_RI, Articulo_RI, Presupuesto_Almacen, TipoCambio_RI } from '../../registro-ingreso/models/listasIngreso.model';
import { RegistroSalidaService } from '../../registro-salida/registro-salida.service';
import { Listas_RT, Operacion_RT } from '../models/listasTraslado.model';
import { Detalle_Articulo, Registro_Traslado_Detalle } from '../models/registroTraslado.model';
import { RegistroTrasladoService } from '../registro-traslado.service';
import { TrasladoFileComponent } from '../traslado-file/traslado-file.component';
import { ArticuloTrasladoDetalleComponent } from './articulo-traslado-detalle/articulo-traslado-detalle.component';
import { ArticuloTrasladoComponent } from './articulo-traslado/articulo-traslado.component';


@Component({
  selector: 'app-registro-traslado-detalle',
  templateUrl: './registro-traslado-detalle.component.html',
  styleUrls: ['./registro-traslado-detalle.component.css'],
  providers: [DecimalPipe],
  animations: [asistenciapAnimations]
})
export class RegistroTrasladoDetalleComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  formTraslado: FormGroup;

  //Listas para llenar los combos 
  lSolicitante: Listas_RT[] = [];
  lPresupuesto: Presupuesto_Almacen[] = [];
  lPresupuestoDestino: Presupuesto_Almacen[] = [];

  lAlmacen: Almacen_RI[] = [];
  lAlmacenDestino: Almacen_RI[] = [];

  lOpLogistica: Operacion_RT[] = [];
  lDetalle: Detalle_Articulo[] = [];

  vMoneda: Listas_RT;
  vTipoCambio: TipoCambio_RI;

  vRegistroDetalle: Registro_Traslado_Detalle;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Detalle_Articulo>;
  displayedColumns = ['opcion', 'sArticulo', 'sLote', 'sFechaExpira', 'sUndMedida', 'nStock', 'nUnidades',
    'nCostoUnit', 'nCostoTotal', 'nPesoTotal', 'nVolumenTotal'];

  fechaHoy = moment();

  //Variables para interaccion entre componentes
  @Input() pIdRegistro: number;
  @Input() pNota: number; //0 cuando no es nota -- 1 cuando es nota para registrar -- 2 cuando es nota rechazada o devuelta
  @Output() pMostrar = new EventEmitter<number>();

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  matcher = new ErrorStateMatcher();

  bEsLogisticoSatelite = false;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegTraslado: RegistroTrasladoService,
    private cdr: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    public dialog: MatDialog,
    private vRegSalida: RegistroSalidaService,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formTraslado = this.formBuilder.group({
      cboSolicitante: ['', Validators.required],
      cboPresupuesto: ['', Validators.required],
      txtCliente: [''],

      cboAlmacen: ['', Validators.required],
      cboOperacionLogistica: ['', Validators.required],

      cboFecha: [moment(), Validators.required],
      cbTodoDia: [true],
      txtHora: [''],
      cboPresupuestoDestino: ['', Validators.required],
      txtClienteDestino: [''],
      cboAlmacenDestino: ['', Validators.required],
      //Campos varios
      txtObservacionGuia: ['', this.caracterValidator],
      txtObservacionNota: [''],
      txtTotalUnd: [0],
      txtTotalPeso: [0],
      txtTotalVolumen: [0],
      txtTotalPrecio: [0],

      //Campos de auditoria
      txtNumero: [''],
      txtEstado: [''],
      txtDocRef: [''],
      txtRegistro: [''],
      txtFechaRegistro: [''],

      //Campos que reemplazan a los combos cuando se va a ver detalle
      txtSolicitante: [''],
      txtPresupuesto: [''],
      txtAlmacen: [''],
      txtPresupuestoDestino: [''],
      txtAlmacenDestino: [''],
      txtOperacionLogistica: [''],
      txtFecha: [''],
    })
    this.onToggleFab(1, -1);
    await this.fnEvaluarDocumento();
    await this.fnRevisarTipoUsuario();
  }

  //#region Evaluar Documento
  async fnEvaluarDocumento() {
    if (this.pNota == 0) { //Cuando no es nota 
      if (this.pIdRegistro == 0) {
        await this.fnListarSolicitante();
        await this.fnListarAlmacen();
        await this.fnListarMoneda();
        await this.fnListarTipoCambio();
        this.formTraslado.controls.txtFechaRegistro.setValue(moment().format('DD/MM/YYYY'))
        this.formTraslado.controls.txtEstado.setValue('Pendiente')
        this.formTraslado.controls.txtRegistro.setValue(this.pNom)

      } else {
        //Cuando se va a ver detalle se llenan los datos
        await this.fnListarRegistroDetalle(this.pIdRegistro);
        await this.fnListarArticulosDetalle(this.pIdRegistro);
      }
    } else if (this.pNota == 1) { //Cuando se quiere registrar la nota
      await this.fnListarNotaUtil(this.pIdRegistro)
      await this.fnListarArticulosDetalle(this.pIdRegistro);
      await this.fnListarOpLogistica({
        nId: this.vRegistroDetalle.nIdAlmacen,
        sDescripcion: '',
        nTipoAlmacen: 0,
        sTipoAlmacen: ''
      });

    } else if (this.pNota == 2) { //Cuando se quiere ver detalle de la nota 
      await this.fnListarNotaUtil(this.pIdRegistro)
      await this.fnListarArticulosDetalle(this.pIdRegistro);

    }
  }
  //#endregion

  //#region Listados para los combos

  async fnListarSolicitante() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;

    pParametro.push(this.idEmp);

    try {
      this.lSolicitante = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarPresupuesto(pSolicitante: Listas_RT) {

    //Vaciando los controles que dependen del solicitante
    this.formTraslado.controls.cboPresupuesto.setValue('');
    this.formTraslado.controls.txtCliente.setValue('');
    this.formTraslado.controls.cboPresupuestoDestino.setValue('');
    this.formTraslado.controls.txtClienteDestino.setValue('');
    this.lPresupuestoDestino = [];

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(pSolicitante.nId);

    try {
      this.lPresupuesto = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarPresupuestoDestino(pCC: Presupuesto_Almacen) {

    //Vaciando los controles que dependen del presupuesto origen
    this.formTraslado.controls.cboPresupuestoDestino.setValue('');
    this.formTraslado.controls.txtClienteDestino.setValue('');

    var vDatos = this.formTraslado.getRawValue();

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 17;

    pParametro.push(vDatos.cboSolicitante.nId);
    pParametro.push(pCC.nId);

    try {
      this.lPresupuestoDestino = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarAlmacen() {

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(this.idUser)
    pParametro.push(this.pPais);

    try {
      this.lAlmacen = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarOpLogistica(pAlmacen: Almacen_RI) {

    this.formTraslado.controls.cboOperacionLogistica.setValue('');
    this.formTraslado.controls.cboAlmacenDestino.setValue('');
    this.lAlmacenDestino = [];

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 4;
    pParametro.push(pAlmacen.nId);

    try {
      this.lOpLogistica = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();

      if (this.pNota == 1) { //Si es NU, filtramos las operaciones de salida por traslado
        this.lOpLogistica = this.lOpLogistica.filter(item => item.nIdTipoOperacion == 1967)
        if (this.lOpLogistica.length > 0) {
          this.formTraslado.controls.cboOperacionLogistica.setValue(this.lOpLogistica[0].nId);
          await this.fnListarAlmacenDestino(this.lOpLogistica[0].nId);
          if (this.lAlmacenDestino.length > 0) {
            this.formTraslado.controls.cboAlmacenDestino.setValue(this.lAlmacenDestino[0].nId);
          }
        }
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarAlmacenDestino(idOpLog: number) {

    this.formTraslado.controls.cboAlmacenDestino.setValue('');

    const almacen = this.formTraslado.controls.cboAlmacen.value

    if (idOpLog == null || (almacen == '' && this.pNota != 1)) {
      return;
    }

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 5;

    pParametro.push(this.pNota == 1 ? this.vRegistroDetalle.nIdAlmacen : almacen.nId)
    pParametro.push(idOpLog);

    try {
      this.lAlmacenDestino = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (this.pNota == 1) { //Si es NU, filtramos solo los fisicos
        this.lAlmacenDestino = this.lAlmacenDestino.filter(item => item.nTipoAlmacen == 1850)
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarMoneda() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 6;

    pParametro.push(this.pPais);

    try {
      var lMoneda = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (lMoneda.length > 0) { this.vMoneda = lMoneda[0] }

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarTipoCambio() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 7;

    pParametro.push(this.pPais);
    pParametro.push(moment().format('YYYY-MM-DD'))    //2021-01-27

    try {
      var lTipo = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (lTipo.length > 0) { this.vTipoCambio = lTipo[0] }

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  //#endregion

  //#region llenado de inputs
  fnLLenarCliente(p: Presupuesto_Almacen) {
    if (p == null) { return; }
    this.formTraslado.controls.txtCliente.setValue(p.sCliente);
  }

  fnLLenarClienteDestino(p: Presupuesto_Almacen) {
    if (p == null) { return; }
    this.formTraslado.controls.txtClienteDestino.setValue(p.sCliente);
  }
  //#endregion

  //#region  Agregar registro
  async fnGuardar() {
    if (this.formTraslado.invalid) {
      this.formTraslado.markAllAsTouched();
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning');
      return;
    }

    var vDatos = this.formTraslado.getRawValue();

    if (vDatos.cboAlmacen.nId == vDatos.cboAlmacenDestino && vDatos.cboPresupuesto.nId == vDatos.cboPresupuestoDestino.nId) {
      Swal.fire('¡Verificar!', 'El almacén y almacén destino no pueden ser iguales si los presupuestos son iguales!', 'warning')
      return;
    }

    if (this.lDetalle.length <= 0) {
      Swal.fire('¡Verificar!', 'Ingrese por lo menos un articulo al registro', 'warning')
      return;
    }

    //Consultamos si el usuario va a hacer picking en ubicacion o no
    var nSinPicking: boolean, nSinPickingDestino: boolean, mensajePregunta: string;
    mensajePregunta = 'Una vez que se agregue el registro no se podrán realizar cambios'

    try {
      nSinPicking = await this.fnSinPicking(vDatos.cboAlmacen.nId, this.idUser)
      nSinPickingDestino = await this.fnSinPicking(vDatos.cboAlmacenDestino, this.idUser)
    } catch (err) {
      return;
    }

    if (nSinPicking || nSinPickingDestino) {
      mensajePregunta += ', Nota: <br>';
    }

    if (nSinPicking) {
      mensajePregunta += `No se va a alterar ubicación en el almacén origen indicado <br>`
    }

    if (nSinPickingDestino) {
      mensajePregunta += `No se va a alterar ubicación en el almacén destino indicado`
    }

    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      html: mensajePregunta,
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

    this.spinner.show();

    var operacionId: number = this.formTraslado.controls.cboOperacionLogistica.value;
    var operacion = this.lOpLogistica.find(item => item.nId == operacionId)

    if (operacion == null) {
      this.spinner.hide();
      return;
    }

    //Solo si hace picking en el origen valida
    if (!nSinPicking) {
      var mensaje = '';
      for (var detalle of this.lDetalle) {
        const stockUbicacion = await this.fnValidarStockUbicacion(vDatos.cboAlmacen.nId, vDatos.cboPresupuesto.nId, detalle.nIdArticulo, detalle.sLote, detalle.sFechaExpira, operacion.nIdTipoOperacion)
        if (stockUbicacion < detalle.nUnidades) {
          mensaje = `No hay saldo suficiente en ubicación del artículo: ${detalle.sArticulo},
          en el almacén: ${vDatos.cboAlmacen.sDescripcion.split('-')[0].trim()}, 
          del centro de costo: ${vDatos.cboPresupuesto.sDescripcion.split('-')[0].trim()},
          No podrá realizar la salida, favor de verificar.`;
          break;
        }
      }

      if (mensaje != '') {
        Swal.fire('¡Verificar!',
          mensaje,
          'warning')
        this.spinner.hide();
        return;
      }
    }


    var pEntidad = 1;
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;
    var pParametroDet = [];
    var strParametroDet = '';

    pParametro.push(this.pPais);
    pParametro.push(vDatos.cboOperacionLogistica);
    pParametro.push(vDatos.cboAlmacen.nId);
    pParametro.push(vDatos.cboPresupuesto.nId);
    pParametro.push(vDatos.cboAlmacenDestino);
    pParametro.push(vDatos.cboPresupuestoDestino.nId);
    pParametro.push(vDatos.cboFecha.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboSolicitante.nId);

    pParametro.push(this.vMoneda.nId);
    pParametro.push(this.vTipoCambio.nId);

    pParametro.push(vDatos.txtObservacionGuia.trim());
    pParametro.push(this.idUser);

    this.lDetalle.forEach(item => {
      var pParam = [];
      pParam.push(item.nIdArticulo);
      pParam.push(item.sLote);
      pParam.push(item.sFechaIngreso);
      pParam.push(item.sFechaExpira);
      pParam.push(0); //idPartida
      pParam.push(item.nUnidades);
      pParam.push(item.nCostoUnit);
      pParam.push(item.sObservacion);
      pParametroDet.push(pParam.join('|'))
    })

    strParametroDet = pParametroDet.join('?');
    try {
      var { result } = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, strParametroDet, this.url).toPromise();

      if (isNaN(result)) {
        Swal.fire('Alerta', result, 'warning');
        this.spinner.hide();
        return;
      }

      if (Number(result) == 0) {
        Swal.fire('Error', 'No se pudo realizar el registro: Verifique su conexion a Internet', 'error');
        this.spinner.hide();
        return;
      }


      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      this.pIdRegistro = result;
      await this.fnListarRegistroDetalle(this.pIdRegistro);
      await this.fnListarArticulosDetalle(this.pIdRegistro);

      this.spinner.hide();

    } catch (err) {
      console.log(err);
      this.spinner.hide();
    }
  }
  //#endregion

  //#region Articulos
  async fnAgregarArticulo() {
    if (this.formTraslado.controls.cboPresupuesto.invalid || this.formTraslado.controls.cboOperacionLogistica.invalid
      || this.formTraslado.controls.cboAlmacen.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados para ingresar artículos', 'warning')
      return;
    }

    var centroCosto = this.formTraslado.controls.cboPresupuesto.value;
    var almacen = this.formTraslado.controls.cboAlmacen.value;
    var operacionId: number = this.formTraslado.controls.cboOperacionLogistica.value;
    var operacion = this.lOpLogistica.find(item => item.nId == operacionId)

    if (!this.formTraslado.controls.cboPresupuesto.disabled) {
      var resp = await Swal.fire({
        title: '¿Desea continuar?',
        text: "Una vez que agregue un artículo, no se podrá realizar cambios en el presupuesto origen y almacén origen",
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
    }

    let nNoPicking: boolean;
    try {
      nNoPicking = await this.fnSinPicking(almacen.nId, this.idUser)
    } catch (err) {
      return;
    }

    const dialog = this.dialog.open(ArticuloTrasladoComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        vCentroCosto: centroCosto,
        vAlmacen: almacen,
        lDetalle: this.lDetalle, //Para validar que no se agregue un articulo existente
        nIdTipoOperacion: operacion.nIdTipoOperacion,
        bNoPicking: nNoPicking,
        bEsLogisticoSatelite: this.bEsLogisticoSatelite
      }
    })

    var componentSubscribe = dialog.componentInstance.agregarArticulo.subscribe((detalle: Detalle_Articulo) => {
      this.formTraslado.controls.cboPresupuesto.disable();
      this.formTraslado.controls.cboSolicitante.disable();
      this.formTraslado.controls.cboAlmacen.disable();
      this.formTraslado.controls.cboOperacionLogistica.disable();
      this.lDetalle.push(detalle);
      this.dataSource = new MatTableDataSource(this.lDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnLLenarTotales();
    });

    dialog.afterClosed().subscribe(data => {
      componentSubscribe.unsubscribe();
    })

  }

  fnLLenarTotales() {
    let totalUnd = 0, totalPeso = 0, totalVolumen = 0, totalPrecio = 0;
    this.lDetalle.forEach(item => {
      totalUnd += item.nUnidades;
      totalPeso += item.nPesoTotal;
      totalVolumen += item.nVolumenTotal;
      totalPrecio += item.nCostoTotal;
    })
    this.formTraslado.controls.txtTotalUnd.setValue(totalUnd);
    this.formTraslado.controls.txtTotalPeso.setValue(this.decimalPipe.transform(totalPeso, '1.2-2'));
    this.formTraslado.controls.txtTotalVolumen.setValue(this.decimalPipe.transform(totalVolumen, '1.6-6'));
    this.formTraslado.controls.txtTotalPrecio.setValue(this.decimalPipe.transform(totalPrecio, '1.4-4'));
  }

  async fnEliminarArticulo(row: Detalle_Articulo) {
    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      text: "Se eliminará el articulo seleccionado",
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

    this.lDetalle = this.lDetalle.filter(item => item.nId != row.nId)

    this.dataSource = new MatTableDataSource(this.lDetalle);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fnLLenarTotales()
  }


  fnVerImagen(row: Detalle_Articulo) {
    if (row.sRutaArchivo != '') {
      Swal.fire({
        text: row.sArticulo,
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
  //#endregion

  //#region Cuando se va a ver detalle
  async fnListarRegistroDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 12;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.vRegistroDetalle = lRegistro[0];

      this.fnLlenarFormDetalle(this.vRegistroDetalle)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarArticulosDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 13;

    pParametro.push(nId);

    try {
      const lArticulo = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.lDetalle = lArticulo;
      this.dataSource = new MatTableDataSource(this.lDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnLLenarTotales();

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnLlenarFormDetalle(p: Registro_Traslado_Detalle) {

    this.formTraslado.controls.txtCliente.setValue(p.sCliente)
    this.formTraslado.controls.txtDocRef.setValue(p.nNumDoc_ref)
    this.formTraslado.controls.txtCliente.setValue(p.sCliente)
    this.formTraslado.controls.txtClienteDestino.setValue(p.sClienteDestino)
    this.formTraslado.controls.txtObservacionGuia.setValue(p.sObservacion)
    this.formTraslado.controls.txtObservacionNota.setValue(p.sObservacionNota)
    this.formTraslado.controls.txtNumero.setValue(p.sNumeroDoc)
    this.formTraslado.controls.txtRegistro.setValue(p.sUserReg)
    this.formTraslado.controls.txtEstado.setValue(p.sEstado)
    this.formTraslado.controls.txtFechaRegistro.setValue(p.sFechaReg)
    this.formTraslado.controls.txtSolicitante.setValue(p.sSolicitante)
    this.formTraslado.controls.txtPresupuesto.setValue(p.sCentroCosto)
    this.formTraslado.controls.txtAlmacen.setValue(p.sAlmacen)
    this.formTraslado.controls.txtPresupuestoDestino.setValue(p.sCentroCostoDestino)
    this.formTraslado.controls.txtAlmacenDestino.setValue(p.sAlmacenDestino)
    this.formTraslado.controls.txtOperacionLogistica.setValue(p.sOperacion)
    this.formTraslado.controls.txtFecha.setValue(p.sFecha + (p.sHora == '' ? '' : (' - ' + p.sHora)))
  }
  //#endregion

  //#region Funciones varias
  fnRegresar() {
    this.pMostrar.emit(0);
  }

  async fnValidarStockUbicacion(nIdAlmacen: number, nIdCentroCosto: number, nIdArticulo: number, sLote: string, sFechaVence: string, nIdTipoOperacion: number): Promise<number> {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    //Si la op. es de baja mandamos al procedure 18 sino mandamos al 10
    var pTipo = nIdTipoOperacion == 2274 ? 18 : 10;

    pParametro.push(nIdAlmacen);
    pParametro.push(nIdCentroCosto);
    pParametro.push(nIdArticulo);
    pParametro.push(sLote);
    pParametro.push(sFechaVence == '' ? '' : moment(sFechaVence, 'DD/MM/YYYY').format('MM-DD-YYYY'));

    try {
      const stockUbicacion = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
      return stockUbicacion;
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  //#endregion

  //#region Notas utiles
  async fnListarNotaUtil(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 16;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.vRegistroDetalle = lRegistro[0];

      this.fnLlenarFormNotaDetalle(this.vRegistroDetalle)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnProcesarNota() {
    if (this.formTraslado.controls.cboOperacionLogistica.invalid || this.formTraslado.controls.cboAlmacenDestino.invalid
      || this.formTraslado.controls.txtObservacionGuia.invalid) {
      this.formTraslado.markAllAsTouched();
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados para ingresar la nota', 'warning');
      return;
    }

    var vDatos = this.formTraslado.getRawValue();

    if (this.lDetalle.length <= 0) {
      Swal.fire('¡Verificar!', 'Ingrese por lo menos un articulo al registro', 'warning')
      return;
    }

    //Consultamos si el usuario va a hacer picking en ubicacion o no
    var nSinPicking: boolean, nSinPickingDestino: boolean, mensajePregunta: string;
    mensajePregunta = 'Una vez que se agregue el registro no se podrán realizar cambios'

    try {
      nSinPicking = await this.fnSinPicking(this.vRegistroDetalle.nIdAlmacen, this.idUser)
      nSinPickingDestino = await this.fnSinPicking(vDatos.cboAlmacenDestino, this.idUser)
    } catch (err) {
      return;
    }

    if (nSinPicking || nSinPickingDestino) {
      mensajePregunta += ', Nota: <br>';
    }

    if (nSinPicking) {
      mensajePregunta += `No se va a alterar ubicación en el almacén origen indicado <br>`
    }

    if (nSinPickingDestino) {
      mensajePregunta += `No se va a alterar ubicación en el almacén destino indicado`
    }

    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      html: mensajePregunta,
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

    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 3;  //CRUD -> Actualizar nota
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(vDatos.cboOperacionLogistica);
    pParametro.push(vDatos.cboAlmacenDestino);
    pParametro.push(vDatos.txtObservacionGuia.trim());
    pParametro.push(this.idUser);

    try {
      var { result } = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (isNaN(result)) {
        var res: string = result;
        var array = res.split('|');
        //cuando es una nota de util se puede generar una nota de salida, cuando esto pase
        //va a traer un string con el Id y la nota creada Ej: 25|20005-NS-000005
        //si se hace split y el length es de uno significa que hay un error
        if (array.length == 1) {
          Swal.fire('Alerta', result, 'warning');
          this.spinner.hide();
          return;
        } else {

          Swal.fire({
            icon: 'success',
            title: ('Correcto'),
            text: 'Se guardo el registro y se genero la nota de salida automática: ' + array[1],
            showConfirmButton: false,
            timer: 1500
          });

          this.pIdRegistro = Number(array[0]);
          this.pNota = 0;
          await this.fnListarRegistroDetalle(this.pIdRegistro);
          await this.fnListarArticulosDetalle(this.pIdRegistro);
          this.spinner.hide();
          return;
        }

      }

      if (Number(result) == 0) {
        Swal.fire('Error', 'No se pudo realizar el registro: Verifique su conexion a Internet', 'error');
        this.spinner.hide();
        return;
      }

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        showConfirmButton: false,
        timer: 1500
      });
      this.pIdRegistro = result;
      this.pNota = 0;
      await this.fnListarRegistroDetalle(this.pIdRegistro);
      await this.fnListarArticulosDetalle(this.pIdRegistro);

      this.spinner.hide();

    } catch (err) {
      console.log(err);
      this.spinner.hide();
    }
  }

  fnLlenarFormNotaDetalle(p: Registro_Traslado_Detalle) {

    this.formTraslado.controls.txtCliente.setValue(p.sCliente)
    this.formTraslado.controls.txtDocRef.setValue(p.nNumDoc_ref)
    this.formTraslado.controls.txtCliente.setValue(p.sCliente)
    this.formTraslado.controls.txtClienteDestino.setValue(p.sClienteDestino)
    this.formTraslado.controls.txtObservacionGuia.setValue(p.sObservacion)
    this.formTraslado.controls.txtObservacionNota.setValue(p.sObservacionNota)
    this.formTraslado.controls.txtNumero.setValue(p.sNumeroDoc)
    this.formTraslado.controls.txtRegistro.setValue(this.pNota == 1 ? this.pNom : p.sUserReg)
    this.formTraslado.controls.txtEstado.setValue(this.pNota == 1 ? 'Pendiente' : p.sEstado)
    this.formTraslado.controls.txtFechaRegistro.setValue(this.pNota == 1 ? moment().format('DD/MM/YYYY') : p.sFechaReg)
    this.formTraslado.controls.txtSolicitante.setValue(p.sSolicitante)
    this.formTraslado.controls.txtPresupuesto.setValue(p.sCentroCosto)
    this.formTraslado.controls.txtAlmacen.setValue(p.sAlmacen)
    this.formTraslado.controls.txtPresupuestoDestino.setValue(p.sCentroCostoDestino)
    this.formTraslado.controls.txtAlmacenDestino.setValue(p.sAlmacenDestino)
    this.formTraslado.controls.txtOperacionLogistica.setValue(p.sOperacion)
    this.formTraslado.controls.txtFecha.setValue(p.sFecha + (p.sHora == '' ? '' : (' - ' + p.sHora)))
  }
  //#endregion

  //#region Devolver /Rechazar Nota
  async fnDevolverNota() {
    var resp = await Swal.fire({
      title: '¿Desea devolver la nota: ' + this.vRegistroDetalle.sCentroCosto.split('-')[0] + '-' + this.vRegistroDetalle.nNumDoc_ref + '?',
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

    const { value: observacion } = await Swal.fire({
      title: this.vRegistroDetalle.sCentroCosto.split('-')[0] + '-' + this.vRegistroDetalle.nNumDoc_ref,
      text: 'Ingrese el mensaje',
      input: 'textarea',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      inputValidator: (value) => {
        if (!value) {
          return 'El mensaje es obligatorio';
        }

        if (value.trim() == '') {
          return 'El mensaje es obligatorio';
        }

        if (value.includes('|')) {
          return "El mensaje no puede contener '|'";
        }
      }
    })

    if (!observacion) {
      return;
    }

    this.spinner.show();

    var pEntidad = 3;  //Para actualizar
    var pOpcion = 3;
    var pParametro = [];
    var pTipo = 2;

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var { result } = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se devolvió de manera correcta la nota: ' + this.vRegistroDetalle.sCentroCosto.split('-')[0] + '-' + this.vRegistroDetalle.nNumDoc_ref),
          showConfirmButton: false,
          timer: 1500
        });
        this.fnRegresar();

      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo realizar la actualización, !Revise su conexión a internet!',
          showConfirmButton: false,
          timer: 1500
        });
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnRechazarNota() {

    var resp = await Swal.fire({
      title: '¿Desea rechazar la nota: ' + this.vRegistroDetalle.sCentroCosto.split('-')[0] + '-' + this.vRegistroDetalle.nNumDoc_ref + '?',
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

    const { value: observacion } = await Swal.fire({
      title: this.vRegistroDetalle.sCentroCosto.split('-')[0] + '-' + this.vRegistroDetalle.nNumDoc_ref,
      text: 'Ingrese el mensaje',
      input: 'textarea',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Continuar',
      inputValidator: (value) => {
        if (!value) {
          return 'El mensaje es obligatorio';
        }

        if (value.trim() == '') {
          return 'El mensaje es obligatorio';
        }

        if (value.includes('|')) {
          return "El mensaje no puede contener '|'";
        }
      }
    })

    if (!observacion) {
      return;
    }


    this.spinner.show();

    var pEntidad = 3;  //Para actualizar
    var pOpcion = 3;
    var pParametro = [];
    var pTipo = 3;

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var { result } = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se rechazó de manera correcta la nota: ' + this.vRegistroDetalle.sCentroCosto.split('-')[0] + '-' + this.vRegistroDetalle.nNumDoc_ref),
          showConfirmButton: false,
          timer: 1500
        });

        this.fnRegresar();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo realizar la actualización, !Revise su conexión a internet!',
          showConfirmButton: false,
          timer: 1500
        });
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
  //#endregion

  //#region Actualizar datos
  async fnActualizar() {
    if (this.pIdRegistro == 0 && this.pNota == 0 && this.formTraslado.controls.cboPresupuesto.enabled) {
      //cuando recien se esta empezando el registro
      await this.fnActualizarRegistrar();
    } else if (this.pIdRegistro == 0 && this.pNota == 0 && this.formTraslado.controls.cboPresupuesto.disabled) {
      //Cuando ya se guardo un registro
      await this.fnActualizarRegistrarFaltan();
    } else {
      //Cuando se esta registrando una nota
      await this.fnActualizarNota();
    }
  }

  async fnActualizarRegistrar() {
    var vDatos = this.formTraslado.getRawValue();

    var solicitante = vDatos.cboSolicitante;
    var presupuesto = vDatos.cboPresupuesto;
    var almacen = vDatos.cboAlmacen;
    var opLogistica = vDatos.cboOperacionLogistica;
    var presupuestoDestino = vDatos.cboPresupuestoDestino;
    var almacenDestino = vDatos.cboAlmacenDestino;

    await this.fnListarSolicitante();
    var solicitanteEncontrado = this.lSolicitante.find(item => item.nId == solicitante.nId)
    this.formTraslado.controls.cboSolicitante.setValue(solicitanteEncontrado ?? '');

    if (solicitante != '') {
      await this.fnListarPresupuesto(solicitante);
      var presEncontrado = this.lPresupuesto.find(item => item.nId == presupuesto.nId)
      this.formTraslado.controls.cboPresupuesto.setValue(presEncontrado ?? '')
      this.formTraslado.controls.txtCliente.setValue(presEncontrado?.sCliente ?? '')
    }

    await this.fnListarAlmacen();
    var almacenEncontrado = this.lAlmacen.find(item => item.nId == almacen.nId)
    this.formTraslado.controls.cboAlmacen.setValue(almacenEncontrado ?? '');

    if (almacen != '') {
      await this.fnListarOpLogistica(almacen);
      await this.formTraslado.controls.cboOperacionLogistica.setValue(opLogistica ?? '')
    }

    if (presupuesto != '') {
      await this.fnListarPresupuestoDestino(presupuesto);
      var presDestinoEncontrado = this.lPresupuestoDestino.find(item => item.nId == presupuestoDestino.nId)
      this.formTraslado.controls.cboPresupuestoDestino.setValue(presDestinoEncontrado ?? '');
      this.formTraslado.controls.txtClienteDestino.setValue(presDestinoEncontrado?.sCliente ?? '')
    }

    if (opLogistica != '') {
      await this.fnListarAlmacenDestino(opLogistica);
      await this.formTraslado.controls.cboAlmacenDestino.setValue(almacenDestino ?? '')
    }
  }

  async fnActualizarRegistrarFaltan() {
    var vDatos = this.formTraslado.getRawValue();

    var presupuesto = vDatos.cboPresupuesto;
    var opLogistica = vDatos.cboOperacionLogistica;
    var presupuestoDestino = vDatos.cboPresupuestoDestino;
    var almacenDestino = vDatos.cboAlmacenDestino;

    if (presupuesto != '') {
      await this.fnListarPresupuestoDestino(presupuesto);
      var presDestinoEncontrado = this.lPresupuestoDestino.find(item => item.nId == presupuestoDestino.nId)
      this.formTraslado.controls.cboPresupuestoDestino.setValue(presDestinoEncontrado ?? '');
      this.formTraslado.controls.txtClienteDestino.setValue(presDestinoEncontrado?.sCliente ?? '')
    }

    if (opLogistica != '') {
      await this.fnListarAlmacenDestino(opLogistica);
      this.formTraslado.controls.cboAlmacenDestino.setValue(almacenDestino ?? '')
    }
  }

  async fnActualizarNota() {
    var vDatos = this.formTraslado.getRawValue();

    var opLogistica = vDatos.cboOperacionLogistica;
    var almacenDestino = vDatos.cboAlmacenDestino;

    await this.fnListarOpLogistica({
      nId: this.vRegistroDetalle.nIdAlmacen,
      sDescripcion: '',
      nTipoAlmacen: 0,
      sTipoAlmacen: ''
    });
    this.formTraslado.controls.cboOperacionLogistica.setValue(opLogistica)


    if (opLogistica != '') {
      await this.fnListarAlmacenDestino(opLogistica);
      await this.formTraslado.controls.cboAlmacenDestino.setValue(almacenDestino ?? '')
    }
  }

  //#endregion

  //#region Funcion de validacion
  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { caracterValidator: 'El texto no debe contener: "/", "|", "?"' } : null;
  }

  async fnValidarSaldo(valor: any, tipo: string) {
    var vCentroCosto: Presupuesto_Almacen, vAlmacen: Almacen_RI;
    if (tipo == 'ALM') {
      //Si esta en el ng-select del almacen validamos que haya valor en el CC
      vCentroCosto = this.formTraslado.controls.cboPresupuesto.value;
      if ((vCentroCosto as any) == '') {
        this.fnListarOpLogistica(valor);
        return;
      }
      vAlmacen = valor;

      var bHaySaldo = await this.fnTraerSaldo(vAlmacen.nId, vCentroCosto.nId)
      if (!bHaySaldo) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia!',
          text: `El presupuesto: ${vCentroCosto.sDescripcion}, y el almacén: ${vAlmacen.sDescripcion}, no cuentan con stock disponible.`,
        });
        this.formTraslado.controls.cboAlmacen.setValue('');
        this.formTraslado.controls.cboOperacionLogistica.setValue('');
        this.lOpLogistica = [];
      } else {
        this.fnListarOpLogistica(valor);
      }


    } else if (tipo == 'CC') {
      //Si esta en el ng-select del CC validamos que haya valor en el almacen
      vAlmacen = this.formTraslado.controls.cboAlmacen.value;

      if ((vAlmacen as any) == '') {
        this.fnListarPresupuestoDestino(valor);
        return;
      }
      vCentroCosto = valor;

      var bHaySaldo = await this.fnTraerSaldo(vAlmacen.nId, vCentroCosto.nId)
      if (!bHaySaldo) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia!',
          text: `El presupuesto: ${vCentroCosto.sDescripcion}, y el almacén: ${vAlmacen.sDescripcion}, no cuentan con stock disponible.`,
        });
        this.formTraslado.controls.cboPresupuesto.setValue('');
        this.formTraslado.controls.txtCliente.setValue('');
        this.formTraslado.controls.cboPresupuestoDestino.setValue('');
        this.formTraslado.controls.txtClienteDestino.setValue('');
        this.lPresupuestoDestino = [];
      } else {
        this.fnListarPresupuestoDestino(valor);
      }
    }
  }

  async fnTraerSaldo(nIdAlmacen: number, nIdCC: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 8;

    pParametro.push(nIdCC);
    pParametro.push(nIdAlmacen);

    try {
      const lArticulo: Articulo_RI[] = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
      if (lArticulo.length > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.spinner.hide();
      console.log(error);
      return false;
    }
  }
  //#endregion

  //#region Preguntar si el usuario hace picking o no
  async fnSinPicking(nIdAlmacen: number, nIdUsuario): Promise<boolean> {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 20;

    pParametro.push(nIdAlmacen);
    pParametro.push(nIdUsuario);

    try {
      const { nSinPicking } = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
      if (nSinPicking == 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.spinner.hide();
      console.log(error);
      throw error;
    }
  }
  //#endregion

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }

  fnArchivo() {
    const vRegistro: Listas_RT = {
      nId: this.vRegistroDetalle.nId,
      sDescripcion: this.vRegistroDetalle.sOperacion.split('-')[0].trim() + '-' + this.vRegistroDetalle.sNumeroDoc
    }
    this.dialog.open(TrasladoFileComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: vRegistro
    });

  }

  async fnModificarArticulo(row: Detalle_Articulo) {
    var centroCosto = this.formTraslado.controls.cboPresupuesto.value;
    var almacen = this.formTraslado.controls.cboAlmacen.value;
    var operacionId: number = this.formTraslado.controls.cboOperacionLogistica.value;
    var operacion = this.lOpLogistica.find(item => item.nId == operacionId)


    let bNoPicking: boolean;
    try {
      bNoPicking = await this.fnSinPicking(almacen.nId, this.idUser)
    } catch (err) {
      return;
    }

    const dialog = this.dialog.open(ArticuloTrasladoDetalleComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        vCentroCosto: centroCosto,
        vAlmacen: almacen,
        lDetalle: this.lDetalle, //Para validar que no se agregue un articulo existente
        nIdTipoOperacion: operacion.nIdTipoOperacion,
        vDetalle: row,
        bNoPicking: bNoPicking,
        bEsLogisticoSatelite: this.bEsLogisticoSatelite
      }
    })

    dialog.afterClosed().subscribe(async data => {
      if (data != null) {

        this.lDetalle.forEach((item, index) => {
          if (item.nId == row.nId) {
            this.lDetalle[index] = data;
          }
        })

        this.dataSource = new MatTableDataSource(this.lDetalle);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.fnLLenarTotales()
      }
    })
  }

  //#region Revisar el tipo de usuario
  async fnRevisarTipoUsuario() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 23;

    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);

    try {
      //retorna 1 si es logistico satelite, en caso contrario retorna 0
      const response = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();

      this.bEsLogisticoSatelite = response == 0 ? false : true
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
  //#endregion
}

