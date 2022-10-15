import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { TipoCambio_RI } from '../../registro-ingreso/models/listasIngreso.model';
import { Listas_RS, Resultado_NC } from '../models/listasSalida.model';
import { Detalle_Articulo, Registro_Salida_Detalle } from '../models/registroSalida.model';
import { RegistroSalidaService } from '../registro-salida.service';
import { LogHistorialAsigCostoComponent } from './log-historial-asig-costo/log-historial-asig-costo.component';
import { PrecioArticuloNSComponent } from './precio-articulo-ns/precio-articulo-ns.component';


@Component({
  selector: 'app-nota-salida-rs',
  templateUrl: './nota-salida-rs.component.html',
  styleUrls: ['./nota-salida-rs.component.css'],
  providers: [DecimalPipe],
  animations: [asistenciapAnimations]
})
export class NotaSalidaRSComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  formCourier: FormGroup;
  @ViewChild('matExpUbicacion') matExpUbicacion: MatExpansionPanel;

  //Listas para llenar los combos 
  lDetalle: Detalle_Articulo[] = [];

  vMoneda: Listas_RS;
  vTipoCambio: TipoCambio_RI;

  vRegistroDetalle: Registro_Salida_Detalle;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Detalle_Articulo>;
  displayedColumns = ['opcion', 'sArticulo', 'sLote', 'sFechaExpira', 'sUndMedida', 'nUnidades',
    'nCostoTotal', 'nPesoTotal', 'nVolumenTotal', 'nEsCotizado', 'nCostoCourier'];


  //Variables para interaccion entre componentes
  @Input() pIdRegistro: number;
  @Output() pMostrar = new EventEmitter<number>();
  @Input() bEsNotaVerDetalle: boolean;

  bEstaEditando = false;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  fechaHoy = moment();

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegSalida: RegistroSalidaService,
    private cdr: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    public dialog: MatDialog,
    @Inject('BASE_URL') baseUrl: string,
  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formCourier = this.formBuilder.group({
      txtSolicitante: [''],
      txtPresupuesto: [''],
      txtCliente: [''],
      txtAlmacen: [''],
      txtFecha: [''],
      txtMovilidad: [''],
      txtDestinatario: [''],
      txtPuntoLLegada: [''],
      txtPuntoRecup: [''],
      txtUbicación: [''],
      txtDireccion: [''],
      txtObservacion: [''],
      txtTotalUnd: [0],
      txtTotalPeso: [0],
      txtTotalVolumen: [0],
      txtTotalPrecio: [0],
      txtTotalPrecioCourier: [0],
      txtRepartirPrecio: [0, Validators.min(0)],
      //Campos de auditoria
      txtEstado: [''],
      txtDocumento: [''],
      txtRegistro: [''],
      txtFechaRegistro: [''],
      txtGuia: ['']
    })
    this.onToggleFab(1, -1);
    await this.fnListarNotaCourierDetalle(this.pIdRegistro);
    await this.fnListarNotaCourierArticulos(this.pIdRegistro);

  }

  //#region Funciones de listados

  async fnListarNotaCourierDetalle(nId: number) {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(nId);

    try {
      const lRegistro = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.vRegistroDetalle = lRegistro[0];

      this.fnLlenarFormNotaDetalle(this.vRegistroDetalle)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarNotaCourierArticulos(nId: number) {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

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

  //#endregion

  //#region Llenado de form
  fnLlenarFormNotaDetalle(p: Registro_Salida_Detalle) {

    this.formCourier.controls.txtCliente.setValue(p.sCliente)
    this.formCourier.controls.txtPuntoRecup.setValue(p.sPuntoRecup)
    this.formCourier.controls.txtUbicación.setValue(p.sUbicacion)
    this.formCourier.controls.txtDireccion.setValue(p.sDireccion)
    this.formCourier.controls.txtCliente.setValue(p.sCliente)
    this.formCourier.controls.txtObservacion.setValue(p.sObservacionNota)
    this.formCourier.controls.txtDocumento.setValue(p.nNumDoc_ref)
    this.formCourier.controls.txtGuia.setValue(p.sGuia)
    this.formCourier.controls.txtRegistro.setValue(p.sUserReg)
    this.formCourier.controls.txtEstado.setValue(p.sEstado)
    this.formCourier.controls.txtFechaRegistro.setValue(p.sFechaReg)
    this.formCourier.controls.txtSolicitante.setValue(p.sSolicitante)
    this.formCourier.controls.txtPresupuesto.setValue(p.sCentroCosto)
    this.formCourier.controls.txtAlmacen.setValue(p.sAlmacen)
    this.formCourier.controls.txtFecha.setValue(p.sFecha + ' - ' + p.sHora)
    this.formCourier.controls.txtDestinatario.setValue(p.sDestinatario)
    this.formCourier.controls.txtPuntoLLegada.setValue(p.sEntidad)
    this.formCourier.controls.txtMovilidad.setValue(p.sTipoMovilidad)
  }
  //#endregion

  //#region Calculos
  fnLLenarTotales() {
    let totalUnd = 0, totalPeso = 0, totalVolumen = 0, totalPrecio = 0, totalPrecioCourier = 0;
    this.lDetalle.forEach(item => {
      totalUnd += item.nUnidades;
      totalPeso += item.nPesoTotal;
      totalVolumen += item.nVolumenTotal;
      totalPrecio += item.nCostoTotal;
      totalPrecioCourier += item.nCostoCourier;
    })
    this.formCourier.controls.txtTotalUnd.setValue(totalUnd);
    this.formCourier.controls.txtTotalPeso.setValue(this.decimalPipe.transform(totalPeso, '1.2-2'));
    this.formCourier.controls.txtTotalVolumen.setValue(this.decimalPipe.transform(totalVolumen, '1.6-6'));
    this.formCourier.controls.txtTotalPrecio.setValue(this.decimalPipe.transform(totalPrecio, '1.4-4'));
    // this.formCourier.controls.txtTotalPrecioCourier.setValue(this.decimalPipe.transform(totalPrecioCourier, '1.4-4'));
  }

  get nPrecioTotalCourier() {
    return this.dataSource?.data.reduce((sum, current) => sum + current.nCostoCourier, 0) ?? 0;
  }

  async fnRepartirPrecioCourier() {
    var precio: number = this.formCourier.controls.txtRepartirPrecio.value;
    if (precio == null || precio <= 0) {
      return;
    }

    var cantidad = 0;
    this.dataSource.data.forEach(item => {
      if (item.nEsCotizado == 0) {
        cantidad++;
      }
      if (item.nEsCotizado == 1) {
        precio += item.nCostoCourier;
      }
    })
    //Validamos que haya al menos un articulo no cotizado
    if (cantidad == 0) {
      Swal.fire('¡Verificar!', 'No hay ningun articulo no cotizado, no se puede continuar', 'warning')
      return;
    }

    this.spinner.show();
    var saldoCourier = await this.fnTraerSaldo(this.vRegistroDetalle.nId);
    if (saldoCourier == null) {//Si hay error no continuamos con el proceso
      this.spinner.hide();
      return;
    }

    if (saldoCourier.sMensaje != '') {
      Swal.fire('Error', saldoCourier.sMensaje, 'error');
      this.spinner.hide();
      return;
    }

    this.spinner.hide();


    if ((saldoCourier.nSaldo - precio) < 0) {
      Swal.fire('Advertencia', 'No hay suficiente saldo en el presupuesto: ' + saldoCourier.sCentroCosto
        + ', con sucursal: ' + saldoCourier.sSucursal + ', y partida: ' + saldoCourier.sPartida + '.\n' +
        'Saldo disponible: ' + (saldoCourier.nSaldo).toFixed(4) + ',\n' +
        'Precio courier requerido: ' + (precio).toFixed(4), 'warning'); return;
    }

    var precioResguardo = 0;
    this.lDetalle.forEach(item => {
      precioResguardo += item.nCostoTotal;
    })

    //Si el CC es de tipo presupuesto cliente validamos el resguardo
    if ((saldoCourier.nSaldoResguardo - precioResguardo < 0) && saldoCourier.nIdTipoCC == 2034) {
      Swal.fire('Advertencia', 'No hay suficiente saldo general en el presupuesto.\n' +
        'Saldo disponible: ' + (saldoCourier.nSaldoResguardo).toFixed(4) + ',\n' +
        'Precio courier requerido: ' + (precio).toFixed(4), 'warning');
      return;
    }

    var precioUnidad = (precio / cantidad).toFixed(4);

    this.dataSource.data.forEach(item => {
      if (item.nEsCotizado == 0) {
        item.nCostoCourier = Number(precioUnidad)
      }
    })
  }
  //#endregion

  //#region Interaccion de componentes
  fnRegresar() {
    this.pMostrar.emit(0);
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

  //#region Guardado
  async fnGuardar() {

    //Validando que todos los articulos tengan precio courier mayor de 0
    let msjDetalle = '';

    for (let detalle of this.lDetalle) {
      if (detalle.nCostoCourier <= 0) {
        msjDetalle = `El artículo: ${detalle.sArticulo}, no puede tener precio courier menor o igual a 0!`
        break;
      }
    }
    if (msjDetalle != '') {
      Swal.fire('¡Verificar!', msjDetalle, 'warning')
      return;
    }

    //Validando el precio
    var precio = 0;
    this.dataSource.data.forEach(item => {
      precio += item.nCostoCourier;
    })

    this.spinner.show();
    var saldoCourier = await this.fnTraerSaldo(this.vRegistroDetalle.nId);
    if (saldoCourier == null) {//Si hay error no continuamos con el proceso
      this.spinner.hide();
      return;
    }

    if (saldoCourier.sMensaje != '') {
      Swal.fire('Error', saldoCourier.sMensaje, 'error');
      this.spinner.hide();
      return;
    }

    this.spinner.hide();

    if ((saldoCourier.nSaldo - precio) < 0) {
      Swal.fire('Advertencia', 'No hay suficiente saldo en el presupuesto: ' + saldoCourier.sCentroCosto
        + ', con sucursal: ' + saldoCourier.sSucursal + ', y partida: ' + saldoCourier.sPartida + '.\n' +
        'Saldo disponible: ' + (saldoCourier.nSaldo).toFixed(4) + ',\n' +
        'Precio courier requerido: ' + (precio).toFixed(4), 'warning');
      return;
    }

    if ((saldoCourier.nSaldoResguardo - precio < 0) && saldoCourier.nIdTipoCC == 2034) {
      Swal.fire('Advertencia', 'No hay suficiente saldo general en el presupuesto.\n' +
        'Saldo disponible: ' + (saldoCourier.nSaldoResguardo).toFixed(4) + ',\n' +
        'Precio courier requerido: ' + (precio).toFixed(4), 'warning');
      return;
    }


    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      text: "Se actualizaran los precios courier de los artículos",
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

    var pEntidad = 4;
    var pOpcion = 1;  //CRUD -> actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;
    var pParametroDet = [];
    var strParametroDet = '';

    var precioCourier = 0;


    this.dataSource.data.forEach(item => {
      var pParam = [];
      pParam.push(item.nId);
      pParam.push(item.nCostoCourier);
      pParam.push(item.nEsCotizado);
      precioCourier += item.nCostoCourier;
      pParametroDet.push(pParam.join('|'))
    })

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);
    pParametro.push(precioCourier);

    strParametroDet = pParametroDet.join('?');

    try {
      var { result } = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, strParametroDet, this.url).toPromise();

      if (isNaN(result)) {
        Swal.fire('Error', result, 'error');
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
        text: 'Se actualizo el registro',
        showConfirmButton: false,
        timer: 1500
      });

      this.pIdRegistro = result;
      this.bEstaEditando = false;
      this.fnListarNotaCourierDetalle(this.pIdRegistro);
      this.fnListarNotaCourierArticulos(this.pIdRegistro)
      this.matExpUbicacion.close()
      this.spinner.hide();

    } catch (err) {
      console.log(err);
      this.spinner.hide();
    }
  }

  async fnEnviarNota() {
    //Validando que todos los articulos tengan precio courier mayor de 0
    let msjDetalle = '';

    for (let detalle of this.lDetalle) {
      if (detalle.nCostoCourier <= 0) {
        msjDetalle = `El artículo: ${detalle.sArticulo}, no puede tener precio courier menor o igual a 0!`
        break;
      }
    }
    if (msjDetalle != '') {
      Swal.fire('¡Verificar!', msjDetalle, 'warning')
      return;
    }

    var resp = await Swal.fire({
      title: '¿Desea continuar?',
      text: "Estará pendiente generar la guía en base a la nota: " + this.vRegistroDetalle.sCentroCosto.split('-')[0].trim() + '-' + this.vRegistroDetalle.nNumDoc_ref + ".",
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

    var pEntidad = 4;
    var pOpcion = 3;  //CRUD -> actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vRegistroDetalle.nId);
    pParametro.push(this.pPais);
    pParametro.push(this.idUser);


    try {
      var { result } = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();

      if (isNaN(result)) {
        Swal.fire('Error', result, 'error');
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
        text: 'Se actualizo el registro',
        showConfirmButton: false,
        timer: 1500
      });

      this.pIdRegistro = result;
      this.fnListarNotaCourierDetalle(this.pIdRegistro);
      this.fnListarNotaCourierArticulos(this.pIdRegistro);
      this.bEsNotaVerDetalle = true;
      this.matExpUbicacion.close()

      this.spinner.hide();

    } catch (err) {
      console.log(err);
      this.spinner.hide();
    }
  }

  fnEditar() {
    this.bEstaEditando = true;
  }

  async fnCancelar() {
    var resp = await Swal.fire({
      title: '¿Desea cancelar?',
      text: "Se borrarán los cambios no guardados",
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

    this.bEstaEditando = false;
    this.fnListarNotaCourierDetalle(this.pIdRegistro);
    this.fnListarNotaCourierArticulos(this.pIdRegistro);
  }
  //#endregion

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }

  async fnPrecioCourier() {

    try {
      var pEntidad = 4;
      var pOpcion = 2;  //CRUD -> Listar
      var pParametro = []; //Parametros de campos vacios
      var pTipo = 5;

      var nPeso = 0;
      var precioCotizados = 0;
      this.dataSource.data.forEach(item => {
        if (item.nEsCotizado == 0) {
          nPeso += item.nPesoTotal;
        }
        if (item.nEsCotizado == 1) {
          precioCotizados += item.nCostoCourier;
        }
      })

      //Validamos que haya al menos un articulo no cotizado
      if (nPeso == 0) {
        Swal.fire('¡Verificar!', 'No hay ningun articulo no cotizado, no se puede continuar', 'warning')
        return;
      }

      this.spinner.show();
      pParametro.push(this.vRegistroDetalle.nId);
      pParametro.push(nPeso.toFixed(4));

      const lResultado: Resultado_NC[] = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      var res = lResultado[0];

      if (res.sMensaje != '') {
        Swal.fire('Error', res.sMensaje, 'error');
        this.spinner.hide();
        return;
      }

      if (res.nSaldo < 0) { //Saldo restante
        Swal.fire('Advertencia', 'No hay suficiente saldo en el presupuesto: ' + res.sCentroCosto
          + ', con sucursal: ' + res.sSucursal + ', y partida: ' + res.sPartida + '.\n' +
          'Saldo disponible: ' + (res.nSaldo + res.nPrecioCourier).toFixed(4) + ',\n' +
          'Precio courier: ' + (res.nPrecioCourier).toFixed(4), 'warning');
        this.spinner.hide();
        return;
      }

      if ((res.nSaldo - precioCotizados) < 0) { //Saldo restante con cotizados
        Swal.fire('Advertencia', 'No hay suficiente saldo en el presupuesto: ' + res.sCentroCosto
          + ', con sucursal: ' + res.sSucursal + ', y partida: ' + res.sPartida + '.\n' +
          'Saldo disponible: ' + (res.nSaldo + res.nPrecioCourier).toFixed(4) + ',\n' +
          'Precio courier: ' + (res.nPrecioCourier + precioCotizados).toFixed(4), 'warning');
        this.spinner.hide();
        return;
      }

      //En caso si haya saldo y no haya error se reparte el precio entre los items no cotizados
      this.dataSource.data.forEach(item => {
        if (item.nEsCotizado == 0) {
          item.nCostoCourier = this.fnRedondear(res.nPrecioCourier * (item.nPesoTotal / nPeso));
        }
      })


      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnTraerSaldo(nIdOperMov): Promise<Resultado_NC> {

    try {
      var pEntidad = 4;
      var pOpcion = 2;  //CRUD -> Listar
      var pParametro = []; //Parametros de campos vacios
      var pTipo = 4;
      pParametro.push(nIdOperMov);

      const lResultado: Resultado_NC[] = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      return lResultado[0];
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  fnRedondear(num) {
    var pow = Math.pow(10, 4);
    return Math.round(num * pow) / pow;
  }

  fnEvitarNegativos(row: Detalle_Articulo) {
    if (row.nCostoCourier < 0) {
      row.nCostoCourier = 0;
    }

  }

  fnVerHistorial() {
    this.dialog.open(LogHistorialAsigCostoComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: this.vRegistroDetalle.nId
    })
  }
}
