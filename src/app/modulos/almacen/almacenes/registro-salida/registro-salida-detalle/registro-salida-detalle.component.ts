import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import printJS from 'print-js';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { Almacen_RI, Articulo_RI, Direccion_Proveedor, Presupuesto_Almacen, TipoCambio_RI } from '../../registro-ingreso/models/listasIngreso.model';
import { RegistroTrasladoService } from '../../registro-traslado/registro-traslado.service';
import { GuiaSalidaFileComponent } from '../guia-salida-file/guia-salida-file.component';
import { Articulo_Stock, input_ModalModulo, Listas_RS } from '../models/listasSalida.model';
import { Detalle_Articulo, Registro_Salida_Detalle } from '../models/registroSalida.model';
import { RegistroSalidaService } from '../registro-salida.service';
import { ArticuloSalidaDetalleComponent } from './articulo-salida-detalle/articulo-salida-detalle.component';
import { ArticuloSalidaComponent } from './articulo-salida/articulo-salida.component';
import { LogDialogModuloRegistroSalidaComponent } from './log-dialog-modulo-registro-salida/log-dialog-modulo-registro-salida.component';


@Component({
  selector: 'app-registro-salida-detalle',
  templateUrl: './registro-salida-detalle.component.html',
  styleUrls: ['./registro-salida-detalle.component.css'],
  providers: [
    DecimalPipe
  ],
  animations: [asistenciapAnimations]
})
export class RegistroSalidaDetalleComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  @ViewChild('matExpUbicacion') matExpUbicacion: MatExpansionPanel;

  lMovilidad: Listas_RS[] = [
    { nId: 1, sDescripcion: 'Si' },
    { nId: 0, sDescripcion: 'No' },
  ]

  formSalida: FormGroup;
  // formSalidaDetalle: FormGroup;

  vVerGuiaSalida = false;
  //Listas para llenar los combos 
  lSolicitante: Listas_RS[] = [];
  lPresupuesto: Presupuesto_Almacen[] = [];
  lAlmacen: Almacen_RI[] = [];
  lOpLogistica: Listas_RS[] = [];
  lDestinatario: Listas_RS[] = [];
  lPuntoLLegada: Listas_RS[] = [];
  lMotivo: Listas_RS[] = [];
  lTipoMovil: Listas_RS[] = [];
  lGuia: Listas_RS[] = [];
  lPuntoRecup: Direccion_Proveedor[] = [];
  lTipoGuia = [];
  lDocGuia = [];
  lDetalle: Detalle_Articulo[] = [];

  vMoneda: Listas_RS;
  vTipoCambio: TipoCambio_RI;

  vRegistroDetalle: Registro_Salida_Detalle;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Detalle_Articulo>;
  displayedColumns = ['opcion', 'sArticulo', 'sLote', 'sFechaExpira', 'sUndMedida', 'nStock', 'nUnidades',
    'nCostoUnit', 'nCostoTotal', 'nPesoTotal', 'nVolumenTotal'];


  //Variables para interaccion entre componentes
  @Input() pIdRegistro: number;
  @Output() pMostrar = new EventEmitter<number>();
  @Output() idRegistroSalida = new EventEmitter<number>(); //Para anular un registro
  @Input() bEsNota: boolean;
  @Input() bEsNotaVerDetalle: boolean;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  fechaHoy = moment();

  matcher = new ErrorStateMatcher();

  bEsLogisticoSatelite = false;
  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegSalida: RegistroSalidaService,
    private cdr: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    public dialog: MatDialog,
    private vRegTraslado: RegistroTrasladoService,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formSalida = this.formBuilder.group({
      cboSolicitante: ['', Validators.required],
      cboPresupuesto: ['', Validators.required],
      txtCliente: [''],

      cboAlmacen: ['', Validators.required],
      cboOperacionLogistica: ['', Validators.required],

      cboFechaEntrega: [moment(), Validators.required],
      cboDestinatario: ['', Validators.required],
      cboPuntoLLegada: ['', Validators.required],

      cboPuntoRecup: ['', Validators.required],
      txtUbicación: [''],
      txtDireccion: [''],

      //Guia de referencia
      txtTipoGuia: ['GR'],
      cboGuia: ['', [Validators.required]],
      txtNumGuia2: [''],

      cboMotivo: ['', Validators.required],

      //Via de entrega
      cboMovilidad: ['', Validators.required],
      cboTipoMovilidad: ['', Validators.required],

      //Campos varios
      txtObservacion1: ['', [this.caracterValidator]],
      txtObservacion2: [''],
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
      txtOperacionLogistica: [''],
      txtFechaEntrega: [''],
      txtHoraEntrega: [''],
      txtDestinatario: [''],
      txtPuntoLLegada: [''],
      txtPuntoRecup: [''],
      txtGuia: [''],
      txtMotivo: [''],
      txtMovilidad: [''],
    })

    this.onToggleFab(1, -1)

    this.fnEvaluarDocumento();
  }

  //#region Evaluar Documento
  async fnEvaluarDocumento() {
    if (this.bEsNota) {

      await this.fnListarNotaSalidaDetalle(this.pIdRegistro);
      await this.fnListarNotaArticulos(this.pIdRegistro);
      await this.fnListarMotivoTraslado()
      await this.fnListarGuias();
    } else if (this.bEsNotaVerDetalle) {
      await this.fnListarNotaSalidaDetalle(this.pIdRegistro);
      await this.fnListarNotaArticulos(this.pIdRegistro);
    } else if (!this.bEsNota) {
      //Si no es nota se procede normalmente
      if (this.pIdRegistro != 0) {
        //Cuando se va a ver detalle se llenan los datos
        await this.fnListarRegistroDetalle(this.pIdRegistro);
        await this.fnListarArticulosDetalle(this.pIdRegistro);
      } else {
        //Cuando se va a registrar
        await this.fnListarSolicitante();
        await this.fnListarAlmacen();
        await this.fnListarEntidades();
        await this.fnListarMotivoTraslado()
        await this.fnListarGuias();
        await this.fnListarMoneda();
        await this.fnListarTipoCambio();
        this.formSalida.controls.txtFechaRegistro.setValue(moment().format('DD/MM/YYYY'))
        this.formSalida.controls.txtEstado.setValue('Pendiente')
        this.formSalida.controls.txtRegistro.setValue(this.pNom)
        await this.fnRevisarTipoUsuario();
        //Si es logistico satelite se pone en motivo satelite: lo recogera personalmente
        if (this.bEsLogisticoSatelite) {

          this.formSalida.controls.cboMovilidad.setValue(this.lMovilidad.find(item => item.nId == 0));
          await this.fnListarTipoMovilidad({ nId: 0, sDescripcion: '' });
          this.formSalida.controls.cboTipoMovilidad.setValue(2211);
          this.formSalida.controls.cboTipoMovilidad.disable();
          this.formSalida.controls.cboMovilidad.disable();

        }
      }
    }
  }
  //#endregion

  //#region Listado de combos
  async fnListarSolicitante() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;

    pParametro.push(this.idEmp);

    try {
      this.lSolicitante = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarPresupuesto(pSolicitante: Listas_RS) {

    //Vaciando los controles que dependen del solicitante
    this.formSalida.controls.cboPresupuesto.setValue('');
    this.formSalida.controls.txtCliente.setValue('');

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(pSolicitante.nId);
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);

    try {
      this.lPresupuesto = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
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
      this.lAlmacen = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarOpLogistica(pAlmacen: Almacen_RI) {

    this.formSalida.controls.cboOperacionLogistica.setValue('');

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 4;
    pParametro.push(pAlmacen.nId);

    try {
      this.lOpLogistica = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (this.lOpLogistica.length == 1) {
        this.formSalida.controls.cboOperacionLogistica.setValue(this.lOpLogistica[0].nId);
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarEntidades() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 7;

    pParametro.push(this.pPais);

    try {
      const entidades = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.lDestinatario = entidades;
      this.lPuntoLLegada = entidades;

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarDirecciones(pEntidadPunto: Listas_RS) {

    //Si es logistico satelite es necesario que haya seleccionado un almacen
    if (this.bEsLogisticoSatelite && (this.formSalida.controls.cboAlmacen.value == null || this.formSalida.controls.cboAlmacen.value == '')) {
      Swal.fire('¡Verificar!', 'Es necesario seleccionar un almacén para poder listar direcciones.', 'warning');
      this.formSalida.controls.cboPuntoRecup.setValue('');
      this.formSalida.controls.txtDireccion.setValue('');
      this.formSalida.controls.txtUbicación.setValue('');
      this.formSalida.controls.cboPuntoLLegada.setValue('');

      return;
    }
    this.formSalida.controls.cboPuntoRecup.setValue('');
    this.formSalida.controls.txtDireccion.setValue('');
    this.formSalida.controls.txtUbicación.setValue('');

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 8;

    pParametro.push(pEntidadPunto.nId);
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(this.formSalida.controls.cboAlmacen.value?.nId ?? 0);


    try {
      this.lPuntoRecup = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarMotivoTraslado() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 5;

    try {
      this.lMotivo = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarTipoMovilidad(pMovil: Listas_RS) {

    this.formSalida.controls.cboTipoMovilidad.setValue('');
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 6;

    pParametro.push(pMovil.nId);

    try {
      this.lTipoMovil = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
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
    var pTipo = 9;

    pParametro.push(this.pPais);

    try {
      var lMoneda = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
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
    var pTipo = 10;

    pParametro.push(this.pPais);
    pParametro.push(moment().format('YYYY-MM-DD'))    //2021-01-27

    try {
      var lTipo = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (lTipo.length > 0) { this.vTipoCambio = lTipo[0] }

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarGuias() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 12;

    pParametro.push(this.idUser);
    pParametro.push(this.idEmp);

    try {
      this.lGuia = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      if (this.lGuia.length == 1) {

      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }
  //#endregion

  //#region Llenado de inputs
  fnLLenarCliente(p: Presupuesto_Almacen) {
    if (p == null) { return; }
    this.formSalida.controls.txtCliente.setValue(p.sCliente);
  }

  fnLlenarDirecciones(p: Direccion_Proveedor) {
    this.formSalida.controls.txtDireccion.setValue('');
    this.formSalida.controls.txtUbicación.setValue('');
    if (p == null) {
      return;
    }
    this.formSalida.controls.txtDireccion.setValue(p.sDireccion);
    this.formSalida.controls.txtUbicación.setValue(`${p?.sDepartamento}, ${p?.sProvincia}, ${p?.sDistrito} - ${p?.sTipoZona}`);
  }

  fnLLenarCerosAdelante(formControlName: string, formGroup: FormGroup, caracteres: number) {
    var valor: string = formGroup.get(formControlName).value;
    if (valor == '') return;
    var ceros: string = '';
    for (var i = 0; i < caracteres; i++)ceros += '0'

    var strValor: string = ceros + valor;
    strValor = strValor.substr(strValor.length - caracteres, caracteres);
    formGroup.get(formControlName).setValue(strValor);
  }
  //#endregion

  //#region  Agregar registro
  async fnGuardar() {
    if (this.formSalida.invalid) {
      this.formSalida.markAllAsTouched();
      this.matExpUbicacion.open();
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning');
      return;
    }

    var vDatos = this.formSalida.getRawValue();

    if (this.lDetalle.length <= 0) {
      Swal.fire('¡Verificar!', 'Ingrese por lo menos un articulo al registro', 'warning')
      return;
    }

    if (this.lDetalle.length > 26) {
      Swal.fire('¡Verificar!', 'Solo se puede ingresar un maximo de 26 items por guía, elimine artículos para poder procesar la guia', 'warning')
      return;
    }

    //Consultamos si el usuario va a hacer picking en ubicacion o no
    var nSinPicking: boolean, mensajePregunta: string;
    mensajePregunta = 'Una vez que se agregue el registro no se podrán realizar cambios'

    try {
      nSinPicking = await this.fnSinPicking(vDatos.cboAlmacen.nId, this.idUser)
    } catch (err) {
      return;
    }

    if (nSinPicking) {
      mensajePregunta += ', Nota: <br>No se va a alterar ubicación en el almacén indicado <br>';
    }

    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      html: mensajePregunta,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    })

    if (!resp.isConfirmed) {
      return;
    }

    this.spinner.show();

    //Solo si hace picking validamos en ubicacion
    if (!nSinPicking) {
      var mensaje = '';
      for (var detalle of this.lDetalle) {
        const stockUbicacion = await this.fnValidarStockUbicacion(vDatos.cboAlmacen.nId, vDatos.cboPresupuesto.nId, detalle.nIdArticulo, detalle.sLote, detalle.sFechaExpira)
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
    var pOpcion = 1;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;
    var pParametroDet = [];
    var strParametroDet = '';

    pParametro.push(this.pPais);
    pParametro.push(vDatos.cboOperacionLogistica);
    pParametro.push(vDatos.cboAlmacen.nId);
    pParametro.push(vDatos.cboPresupuesto.nId);
    pParametro.push(vDatos.cboFechaEntrega.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboSolicitante.nId);
    pParametro.push(vDatos.cboDestinatario.nId);
    pParametro.push(vDatos.cboPuntoLLegada.nId);
    pParametro.push(vDatos.cboPuntoRecup.nId);
    pParametro.push(this.vMoneda.nId);
    pParametro.push(this.vTipoCambio.nId);
    pParametro.push(vDatos.cboGuia);

    pParametro.push(vDatos.txtObservacion1.trim());
    pParametro.push(vDatos.cboTipoMovilidad);
    pParametro.push(vDatos.cboMotivo);

    pParametro.push(this.idUser);
    pParametro.push(0);

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
    this.spinner.show();

    try {
      var { result } = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, strParametroDet, this.url).toPromise();
      this.spinner.hide();

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
      this.matExpUbicacion.close()
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
    if (this.formSalida.controls.cboPresupuesto.invalid ||
      this.formSalida.controls.cboAlmacen.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados para ingresar artículos', 'warning')
      return;
    }


    if (this.lDetalle.length >= 30) {
      Swal.fire('¡Verificar!', 'Solo se puede ingresar un maximo de 30 items por guia, elimine artículos para poder procesar la guia', 'warning')
      return;
    }

    var centroCosto = this.formSalida.controls.cboPresupuesto.value;
    var almacen = this.formSalida.controls.cboAlmacen.value;

    if (!this.formSalida.controls.cboPresupuesto.disabled) {
      var resp = await Swal.fire({
        title: '¿Desea continuar?',
        text: "Una vez que agregue un artículo, no se podrá realizar cambios en el presupuesto y almacén",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
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

    const dialog = this.dialog.open(ArticuloSalidaComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        vCentroCosto: centroCosto,
        vAlmacen: almacen,
        lDetalle: this.lDetalle, //Para validar que no se agregue un articulo existente
        bNoPicking: nNoPicking,
        bEsLogisticoSatelite: this.bEsLogisticoSatelite
      }
    })

    var componentSubscribe = dialog.componentInstance.agregarArticulo.subscribe((detalle: Detalle_Articulo) => {
      this.formSalida.controls.cboPresupuesto.disable();
      this.formSalida.controls.cboSolicitante.disable();
      this.formSalida.controls.cboAlmacen.disable();

      this.lDetalle.push(detalle);
      this.dataSource = new MatTableDataSource(this.lDetalle);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnLLenarTotales()
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
    this.formSalida.controls.txtTotalUnd.setValue(totalUnd);
    this.formSalida.controls.txtTotalPeso.setValue(this.decimalPipe.transform(totalPeso, '1.2-2'));
    this.formSalida.controls.txtTotalVolumen.setValue(this.decimalPipe.transform(totalVolumen, '1.6-6'));
    this.formSalida.controls.txtTotalPrecio.setValue(this.decimalPipe.transform(totalPrecio, '1.4-4'));
  }

  async fnEliminarArticulo(row: Detalle_Articulo) {
    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      text: "Se eliminará el articulo seleccionado y sus lotes posteriores para mantener el orden de las fechas.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    })

    if (!resp.isConfirmed) {
      return;
    }

    var centroCosto = this.formSalida.controls.cboPresupuesto.value;
    var almacen = this.formSalida.controls.cboAlmacen.value;

    //Traemos la lista del articulo stock
    this.spinner.show();
    var articuloStock = await this.fnListarStockArticulo(row, almacen.nId, centroCosto.nId)
    this.spinner.hide();

    if (articuloStock.length == 0) {
      return;
    }

    var indexArticulo = 0;
    for (var i = 0; i < articuloStock.length; i++) {
      if (articuloStock[i].sLote == row.sLote && articuloStock[i].sFechaVence == row.sFechaExpira) {
        indexArticulo = i;//recogemos el index del articulo del FIFO
        break;
      }
    }

    for (var i = indexArticulo; i < articuloStock.length; i++) {
      var indexOf = this.lDetalle.findIndex(item => (item.sLote == articuloStock[i].sLote && item.sFechaExpira == articuloStock[i].sFechaVence && item.nIdArticulo == row.nIdArticulo))
      if (indexOf == -1) {
        continue;
      }
      this.lDetalle.splice(indexOf, 1);
    }



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

  async fnListarStockArticulo(p: Detalle_Articulo, nIdAlmacen: number, nIdCC: number): Promise<Articulo_Stock[]> {

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 14;

    pParametro.push(nIdCC);
    pParametro.push(nIdAlmacen);
    pParametro.push(p.nIdArticulo);
    pParametro.push(p.nIdControlLote);

    try {
      const stock: Articulo_Stock[] = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      return stock;

    } catch (error) {
      console.log(error);
      return [];
    }
  }


  //#endregion

  //#region Cuando se va a ver detalle
  async fnListarRegistroDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 16;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
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
    var pTipo = 17;

    pParametro.push(nId);

    try {
      const lArticulo = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
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

  fnLlenarFormDetalle(p: Registro_Salida_Detalle) {

    this.formSalida.controls.txtCliente.setValue(p.sCliente)
    this.formSalida.controls.txtPuntoRecup.setValue(p.sPuntoRecup)
    this.formSalida.controls.txtUbicación.setValue(p.sUbicacion)
    this.formSalida.controls.txtDireccion.setValue(p.sDireccion)
    this.formSalida.controls.txtDocRef.setValue(p.nNumDoc_ref)
    this.formSalida.controls.txtCliente.setValue(p.sCliente)
    this.formSalida.controls.txtObservacion1.setValue(p.sObservacion)
    this.formSalida.controls.txtObservacion2.setValue(p.sObservacionNota)
    this.formSalida.controls.txtNumero.setValue(p.sNumeroDoc)
    this.formSalida.controls.txtRegistro.setValue(p.sUserReg)
    this.formSalida.controls.txtEstado.setValue(p.sEstado)
    this.formSalida.controls.txtFechaRegistro.setValue(p.sFechaReg)
    this.formSalida.controls.txtSolicitante.setValue(p.sSolicitante)
    this.formSalida.controls.txtPresupuesto.setValue(p.sCentroCosto)
    this.formSalida.controls.txtAlmacen.setValue(p.sAlmacen)
    this.formSalida.controls.txtOperacionLogistica.setValue(p.sOperacion)
    this.formSalida.controls.txtFechaEntrega.setValue(p.sFecha + (p.sHora == '' ? '' : (' - ' + p.sHora)))
    this.formSalida.controls.txtDestinatario.setValue(p.sDestinatario)
    this.formSalida.controls.txtPuntoLLegada.setValue(p.sEntidad)
    this.formSalida.controls.txtGuia.setValue(p.sGuia)
    this.formSalida.controls.txtMotivo.setValue(p.sMotivo)
    this.formSalida.controls.txtMovilidad.setValue(p.sTipoMovilidad)
  }
  //#endregion

  //#region  Funciones de ayuda e interaccion de componentes
  async fnValidarStockUbicacion(nIdAlmacen: number, nIdCentroCosto: number, nIdArticulo: number, sLote: string, sFechaVence: string): Promise<number> {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 18;

    pParametro.push(nIdAlmacen);
    pParametro.push(nIdCentroCosto);
    pParametro.push(nIdArticulo);
    pParametro.push(sLote);
    pParametro.push(sFechaVence == '' ? '' : moment(sFechaVence, 'DD/MM/YYYY').format('MM-DD-YYYY'));

    try {
      const stockUbicacion = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
      return stockUbicacion;
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnRegresar() {
    this.pMostrar.emit(0);
  }

  fnAnularGuia() {
    this.idRegistroSalida.emit(this.vRegistroDetalle.nId)
    this.pMostrar.emit(3);
  }
  //#endregion

  //#region Nota de salida
  async fnListarNotaSalidaDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 20;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.vRegistroDetalle = lRegistro[0];

      if (this.bEsNota) {
        await this.fnListarOpLogistica({
          nId: this.vRegistroDetalle.nIdAlmacen,
          sDescripcion: '',
          nTipoAlmacen: 0,
          sTipoAlmacen: ''
        })
      }
      this.fnLlenarFormNotaDetalle(this.vRegistroDetalle)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarNotaArticulos(nId: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 21;

    pParametro.push(nId);

    try {
      const lArticulo = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
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

  fnLlenarFormNotaDetalle(p: Registro_Salida_Detalle) {

    this.formSalida.controls.txtCliente.setValue(p.sCliente)
    this.formSalida.controls.txtPuntoRecup.setValue(p.sPuntoRecup)
    this.formSalida.controls.txtUbicación.setValue(p.sUbicacion)
    this.formSalida.controls.txtDireccion.setValue(p.sDireccion)
    this.formSalida.controls.txtCliente.setValue(p.sCliente)
    this.formSalida.controls.txtObservacion1.setValue(p.sObservacion)
    this.formSalida.controls.txtObservacion2.setValue(p.sObservacionNota)
    this.formSalida.controls.txtNumero.setValue(p.sNumeroDoc)
    this.formSalida.controls.txtDocRef.setValue(p.nNumDoc_ref)
    this.formSalida.controls.txtRegistro.setValue(this.bEsNota ? this.pNom : '')
    this.formSalida.controls.txtEstado.setValue(this.bEsNota ? 'Pendiente' : p.sEstado)
    this.formSalida.controls.txtFechaRegistro.setValue(this.bEsNota ? moment().format('DD/MM/YYYY') : '')
    this.formSalida.controls.txtSolicitante.setValue(p.sSolicitante)
    this.formSalida.controls.txtPresupuesto.setValue(p.sCentroCosto)
    this.formSalida.controls.txtAlmacen.setValue(p.sAlmacen)
    //Si es para registrar Nota seteamos la fecha entrega en datepicker
    if (this.bEsNota) {
      this.formSalida.controls.cboFechaEntrega.setValue(moment(p.sFecha, 'DD/MM/YYYY'));
      this.formSalida.controls.txtHoraEntrega.setValue(p.sHora)
      this.fechaHoy = moment(p.sFecha, 'DD/MM/YYYY');
    } else {
      //Si es para ver detalle de la nota rechazada
      this.formSalida.controls.txtFechaEntrega.setValue(p.sFecha + ' - ' + p.sHora)
    }
    this.formSalida.controls.txtDestinatario.setValue(p.sDestinatario)
    this.formSalida.controls.txtPuntoLLegada.setValue(p.sEntidad)
    this.formSalida.controls.txtMovilidad.setValue(p.sTipoMovilidad)
  }

  async fnGuardarNota() {
    if (this.formSalida.controls.cboOperacionLogistica.invalid || this.formSalida.controls.cboGuia.invalid
      || this.formSalida.controls.cboMotivo.invalid || this.formSalida.controls.txtObservacion1.invalid
      || this.formSalida.controls.cboFechaEntrega.invalid) {
      this.formSalida.markAllAsTouched();
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados para ingresar la nota', 'warning');
      return;
    }

    var vDatos = this.formSalida.getRawValue();

    if (this.lDetalle.length <= 0) {
      Swal.fire('¡Verificar!', 'Ingrese por lo menos un articulo al registro', 'warning')
      return;
    }

    //Consultamos si el usuario va a hacer picking en ubicacion o no
    var nSinPicking: boolean, mensajePregunta: string;
    mensajePregunta = 'Una vez que se agregue el registro no se podrán realizar cambios'

    try {
      nSinPicking = await this.fnSinPicking(this.vRegistroDetalle.nIdAlmacen, this.idUser)
    } catch (err) {
      return;
    }

    if (nSinPicking) {
      mensajePregunta += ', Nota: <br>No se va a alterar ubicación en el almacén indicado';
    }

    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      html: mensajePregunta,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    })

    if (!resp.isConfirmed) {
      return;
    }

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 3;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(vDatos.cboOperacionLogistica);
    pParametro.push(vDatos.cboGuia);
    pParametro.push(vDatos.txtObservacion1.trim());
    pParametro.push(vDatos.cboMotivo);
    pParametro.push(this.idUser);
    pParametro.push(0);
    pParametro.push(vDatos.cboFechaEntrega.format('MM/DD/YYYY'));

    try {
      var { result } = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();

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
      this.matExpUbicacion.close();
      this.bEsNota = false;
      await this.fnListarRegistroDetalle(this.pIdRegistro);
      await this.fnListarArticulosDetalle(this.pIdRegistro);

      this.spinner.hide();

    } catch (err) {
      console.log(err);

      this.spinner.hide();
    }
  }

  async fnDevolverNota() {
    var resp = await Swal.fire({
      title: '¿Desea devolver la nota: ' + this.vRegistroDetalle.sCentroCosto.split('-')[0].trim() + '-' + this.vRegistroDetalle.nNumDoc_ref + '?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    })

    if (!resp.isConfirmed) {
      return;
    }

    const { value: observacion } = await Swal.fire({
      title: this.vRegistroDetalle.sCentroCosto.split('-')[0].trim() + '-' + this.vRegistroDetalle.nNumDoc_ref,
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
    var pOpcion = 1;
    var pParametro = [];
    var pTipo = 0;

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var { result } = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
      if (Number(result) == 1) {
        Swal.fire({
          icon: 'success',
          title: ('Se devolvió de manera correcta la nota: ' + this.vRegistroDetalle.sCentroCosto.split('-')[0] + '-' + this.vRegistroDetalle.nNumDoc_ref),
          showConfirmButton: false,
          timer: 1500
        });
        await this.fnRegresar();

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
      cancelButtonText: 'Cancelar',
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
    var pOpcion = 2;
    var pParametro = [];
    var pTipo = 0;

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(observacion);

    try {
      var result = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
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

  //#region Anular NS Automaticas
  async fnAnularNSAuto() {
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

    var bEsConNotaUtil: number;

    var resp = await Swal.fire({
      title: 'Atención',
      text: 'La nota de salida seleccionada fue creada en automático por una Nota Util procesada ¿Desea anular el traslado en base a la nota util: ' + this.vRegistroDetalle.sCodTrasladoNu + '?',
      icon: 'question',
      showDenyButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      denyButtonText: 'No'
    })

    if (resp.isDismissed) {
      return;
    }

    if (resp.isConfirmed) {
      bEsConNotaUtil = 1;
    }

    if (resp.isDenied) {
      bEsConNotaUtil = 0;
    }

    this.spinner.show();

    var pEntidad = 5;  //Para actualizar
    var pOpcion = 1;
    var pParametro = [];
    var pTipo = 0;

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(bEsConNotaUtil);

    try {
      var { result } = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise()
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
    if (this.pIdRegistro == 0 && this.formSalida.controls.cboAlmacen.enabled) {
      //Cuando es guia y recien se esta empezando
      await this.fnActualizarRegistro()
    } else if (this.pIdRegistro == 0 && this.formSalida.controls.cboAlmacen.disabled) {
      //cuando es guia y ya se agrego un detalle
      await this.fnActualizarRegistroRestante();
    } else {
      //cuando es nota
      await this.fnActualizarNota();
    }
  }

  async fnActualizarRegistro() {
    var vDatos = this.formSalida.getRawValue();

    var solicitante = vDatos.cboSolicitante;
    var presupuesto = vDatos.cboPresupuesto;
    var almacen = vDatos.cboAlmacen;
    var opLogistica = vDatos.cboOperacionLogistica;
    var destinatario = vDatos.cboDestinatario;
    var puntoLLegada = vDatos.cboPuntoLLegada;
    var puntoRecup = vDatos.cboPuntoRecup;
    var guia = vDatos.cboGuia;
    var motivo = vDatos.cboMotivo;
    var movilidad = vDatos.cboMovilidad;
    var tipoMovilidad = vDatos.cboTipoMovilidad;

    await this.fnListarSolicitante();
    var solicitanteEncontrado = this.lSolicitante.find(item => item.nId == solicitante.nId)
    this.formSalida.controls.cboSolicitante.setValue(solicitanteEncontrado ?? '');

    if (solicitante != '') {
      await this.fnListarPresupuesto(solicitante);
      var presEncontrado = this.lPresupuesto.find(item => item.nId == presupuesto.nId)
      this.formSalida.controls.cboPresupuesto.setValue(presEncontrado ?? '')
      this.formSalida.controls.txtCliente.setValue(presEncontrado?.sCliente ?? '')
    }

    await this.fnListarAlmacen();
    var almacenEncontrado = this.lAlmacen.find(item => item.nId == almacen.nId)
    this.formSalida.controls.cboAlmacen.setValue(almacenEncontrado ?? '');

    if (almacen != '') {
      await this.fnListarOpLogistica(almacen);
      await this.formSalida.controls.cboOperacionLogistica.setValue(opLogistica ?? '')
    }

    await this.fnListarEntidades();
    var destinatarioEncontrado = this.lDestinatario.find(item => item.nId == destinatario.nId)
    this.formSalida.controls.cboDestinatario.setValue(destinatarioEncontrado ?? '');

    var puntoLLegadaEncontrado = this.lPuntoLLegada.find(item => item.nId == puntoLLegada.nId)
    this.formSalida.controls.cboPuntoLLegada.setValue(puntoLLegadaEncontrado ?? '');

    if (puntoLLegada != '') {
      await this.fnListarDirecciones(puntoLLegada);
      var puntoRecupEncontrado = this.lPuntoRecup.find(item => item.nId == puntoRecup.nId)
      this.formSalida.controls.cboPuntoRecup.setValue(puntoRecupEncontrado ?? '');
      this.fnLlenarDirecciones(puntoRecupEncontrado)
    }

    await this.fnListarGuias();
    this.formSalida.controls.cboGuia.setValue(guia ?? '');

    await this.fnListarMotivoTraslado();
    this.formSalida.controls.cboMotivo.setValue(motivo ?? '');

    if (movilidad != '') {
      await this.fnListarTipoMovilidad(movilidad);
      this.formSalida.controls.cboTipoMovilidad.setValue(tipoMovilidad ?? '');
    }
  }

  async fnActualizarRegistroRestante() {

    var vDatos = this.formSalida.getRawValue();

    var almacen = vDatos.cboAlmacen;
    var opLogistica = vDatos.cboOperacionLogistica;
    var destinatario = vDatos.cboDestinatario;
    var puntoLLegada = vDatos.cboPuntoLLegada;
    var puntoRecup = vDatos.cboPuntoRecup;
    var guia = vDatos.cboGuia;
    var motivo = vDatos.cboMotivo;
    var movilidad = vDatos.cboMovilidad;
    var tipoMovilidad = vDatos.cboTipoMovilidad;

    if (almacen != '') {
      await this.fnListarOpLogistica(almacen);
      await this.formSalida.controls.cboOperacionLogistica.setValue(opLogistica ?? '')
    }

    await this.fnListarEntidades();
    var destinatarioEncontrado = this.lDestinatario.find(item => item.nId == destinatario.nId)
    this.formSalida.controls.cboDestinatario.setValue(destinatarioEncontrado ?? '');

    var puntoLLegadaEncontrado = this.lPuntoLLegada.find(item => item.nId == puntoLLegada.nId)
    this.formSalida.controls.cboPuntoLLegada.setValue(puntoLLegadaEncontrado ?? '');

    if (puntoLLegada != '') {
      await this.fnListarDirecciones(puntoLLegada);
      var puntoRecupEncontrado = this.lPuntoRecup.find(item => item.nId == puntoRecup.nId)
      this.formSalida.controls.cboPuntoRecup.setValue(puntoRecupEncontrado ?? '');
      this.fnLlenarDirecciones(puntoRecupEncontrado)
    }

    await this.fnListarGuias();
    this.formSalida.controls.cboGuia.setValue(guia ?? '');

    await this.fnListarMotivoTraslado();
    this.formSalida.controls.cboMotivo.setValue(motivo ?? '');

    if (movilidad != '') {
      await this.fnListarTipoMovilidad(movilidad);
      this.formSalida.controls.cboTipoMovilidad.setValue(tipoMovilidad ?? '');
    }
  }

  async fnActualizarNota() {

    var vDatos = this.formSalida.getRawValue();

    var opLogistica = vDatos.cboOperacionLogistica;
    var guia = vDatos.cboGuia;
    var motivo = vDatos.cboMotivo;

    await this.fnListarOpLogistica({
      nId: this.vRegistroDetalle.nIdAlmacen,
      sDescripcion: '',
      nTipoAlmacen: 0,
      sTipoAlmacen: ''
    })
    await this.formSalida.controls.cboOperacionLogistica.setValue(opLogistica ?? '')

    await this.fnListarMotivoTraslado();
    this.formSalida.controls.cboMotivo.setValue(motivo ?? '');

    await this.fnListarGuias();
    this.formSalida.controls.cboGuia.setValue(guia ?? '');

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
      vCentroCosto = this.formSalida.controls.cboPresupuesto.value;
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
        this.formSalida.controls.cboAlmacen.setValue('');
        this.formSalida.controls.cboOperacionLogistica.setValue('');
        this.lOpLogistica = [];
      } else {
        this.fnListarOpLogistica(valor);
      }


    } else if (tipo == 'CC') {
      //Si esta en el ng-select del CC validamos que haya valor en el almacen
      vAlmacen = this.formSalida.controls.cboAlmacen.value;

      if ((vAlmacen as any) == '') {
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

        this.formSalida.controls.cboPresupuesto.setValue('');
        this.formSalida.controls.txtCliente.setValue('');
      }
    }
  }

  async fnTraerSaldo(nIdAlmacen: number, nIdCC: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 13;

    pParametro.push(nIdCC);
    pParametro.push(nIdAlmacen);

    try {
      const lArticulo: Articulo_RI[] = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
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

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }

  //Imprimir guia de salida 
  async fnImprimirGuiaSalida() {
    this.vVerGuiaSalida = true;
    // Agregar nombre al documento
    const tempTitle = document.title;
    document.title = 'Guia Salida ' + this.vRegistroDetalle.sGuia;
    // Impresion
    setTimeout(() => {
      window.print();
      this.vVerGuiaSalida = false;
    })
    document.title = tempTitle;
    return;
  }
  //#endregion


  fnArchivo() {
    const vRegistro: Listas_RS = {
      nId: this.vRegistroDetalle.nId,
      sDescripcion: this.vRegistroDetalle.sOperacion.split('-')[0].trim() + '-' + this.vRegistroDetalle.sNumeroDoc
    }
    this.dialog.open(GuiaSalidaFileComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: vRegistro,
      disableClose: true,
    });

  }

  async fnModificarArticulo(row: Detalle_Articulo) {

    var cantidadArticulo = 0;
    var indexArticulo = 0;
    var indexMayorArticulo = 0;

    for (var i = 0; i < this.lDetalle.length; i++) {
      if (this.lDetalle[i].nIdArticulo == row.nIdArticulo) {
        cantidadArticulo++;
        if (indexMayorArticulo < i) {
          indexMayorArticulo = i;
        }
      }

      if ((this.lDetalle[i].nIdArticulo == row.nIdArticulo) && (row.sLote == this.lDetalle[i].sLote) && (this.lDetalle[i].sFechaIngreso == row.sFechaIngreso) && (this.lDetalle[i].sFechaExpira == row.sFechaExpira)) {
        indexArticulo = i;
      }
    }


    if (cantidadArticulo > 1) {
      if (indexArticulo < indexMayorArticulo) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia!',
          text: 'El artículo seleccionado no se puede modificar debido a que es de un lote anterior',
        });
        return;
      }
    }

    var centroCosto = this.formSalida.controls.cboPresupuesto.value;
    var almacen = this.formSalida.controls.cboAlmacen.value;

    let bNoPicking: boolean;
    try {
      bNoPicking = await this.fnSinPicking(almacen.nId, this.idUser)
    } catch (err) {
      return;
    }

    const dialog = this.dialog.open(ArticuloSalidaDetalleComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        vCentroCosto: centroCosto,
        vAlmacen: almacen,
        lDetalle: this.lDetalle, //Para validar que no se agregue un articulo existente
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

  fnAnadirModulos() {
    //Si es logistico satelite es necesario que haya seleccionado un almacen
    if (this.bEsLogisticoSatelite && ((this.formSalida.controls.cboAlmacen.value == null ||
      this.formSalida.controls.cboAlmacen.value == '') || (this.formSalida.controls.cboPuntoLLegada.value == null ||
        this.formSalida.controls.cboPuntoLLegada.value == ''))) {
      Swal.fire('¡Verificar!', 'Es necesario seleccionar un almacén y una Entidad entrega para poder continuar.', 'warning');
      return;
    }

    const vInput: input_ModalModulo = {
      nIdAlmacen: this.formSalida.controls.cboAlmacen.value?.nId ?? 0,
      nIdEntidad: this.formSalida.controls.cboPuntoLLegada.value?.nId ?? 0
    }
    this.dialog.open(LogDialogModuloRegistroSalidaComponent, {
      width: '850px',
      maxWidth: '90vw',
      disableClose: true,
      data: vInput
    }).afterClosed().subscribe(async item => {
      if (item == 1) {
        let entidad = this.formSalida.controls.cboPuntoLLegada.value
        let puntoRecup = this.formSalida.controls.cboPuntoRecup.value

        await this.fnListarDirecciones(entidad);
        if (entidad != null || entidad != '') {
          var puntoRecupEncontrado = this.lPuntoRecup.find(item => item.nId == puntoRecup.nId)
          this.formSalida.controls.cboPuntoRecup.setValue(puntoRecupEncontrado ?? '');
          this.fnLlenarDirecciones(puntoRecupEncontrado)
        }
      }
    });

  }
}


