import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { RegistroTrasladoService } from '../../../registro-traslado/registro-traslado.service';
import { Articulo_RI, input_ModalArt } from '../../models/listasIngreso.model';
import { Detalle_Articulo } from '../../models/registroIngreso.models';
import { RegistroIngresoService } from '../../registro-ingreso.service';
import { ArticuloImagenComponent } from './articulo-imagen/articulo-imagen.component';


const SIN_IMAGEN = '/assets/img/SinImagen.jpg'

const ID_LOTE_GENERAL = 1946;
const ID_LOTE_INGRESADO = 1947;
const ID_LOTE_VENC = 1948;

const ID_ALMACEN_VALORADO = 1851;
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-articulo-modal',
  templateUrl: './articulo-modal.component.html',
  styleUrls: ['./articulo-modal.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    DecimalPipe
  ],
})
export class ArticuloModalComponent implements OnInit {

  lArticulo: Articulo_RI[] = [];
  mensajeSolo: string = '';
  mensajeArticuloInvalido: string = '';
  urlImagen: string;
  @Output() agregarArticulo = new EventEmitter<Detalle_Articulo>();
  @Output() agregarArticuloOC = new EventEmitter<any>();

  inputModal: input_ModalArt;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  title: string;

  matcher = new ErrorStateMatcher();

  nStock: number = 0;

  formArticulo: FormGroup;

  bSoloLecturaPrecioUnitario: boolean = false;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vRegIngreso: RegistroIngresoService,
    private vRegTraslado: RegistroTrasladoService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private data: input_ModalArt,
    public dialogRef: MatDialogRef<ArticuloModalComponent>,
    public dialog: MatDialog,
    private decimalPipe: DecimalPipe,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; this.inputModal = data; }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formArticulo = this.formBuilder.group({
      cboArticulo: ['', Validators.required],
      txtTipoLote: [''],
      txtUndMedida: [''],
      cboFechaIngreso: [''],
      cboFechaVenc: [''],
      txtLote: [''],
      txtStockActual: [''],
      txtCantidadPorIngresar: [0],
      txtCantidad: ['', [Validators.required, Validators.min(1)]],
      txtPrecioUnd: [''],
      txtPrecioTotal: [''],
      txtObservacion: ['', this.caracterValidator],
    })

    if (this.inputModal.vAlmacen.nTipoAlmacen != ID_ALMACEN_VALORADO) {
      this.bSoloLecturaPrecioUnitario = true;
      this.formArticulo.controls.txtPrecioUnd.setValue('');
    }

    this.urlImagen = SIN_IMAGEN;
    this.formArticulo.controls.cboFechaIngreso.setValue(this.inputModal.dFechaIngreso)

    if (this.inputModal.vDetalle != null) {
      this.formArticulo.controls.txtCantidad.setValue(this.inputModal.vDetalle.nUnidades);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {

      //Para que no haya error de ngAfterContentChecked
      if (this.inputModal.bEsOrdenCompra) {
        this.lArticulo = this.inputModal.lArticuloOC;
        //cuando es OC el precio U. no se modifica
        this.bSoloLecturaPrecioUnitario = true;
      } else {
        this.fnListarArticulo();
      }
    });
  }

  //#region Funciones de listado
  async fnListarArticulo() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 10;
    pParametro.push(this.pPais);

    try {
      this.lArticulo = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      if (this.inputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
        Swal.fire('Información', 'Se ha seleccionado un almacén valorado, por lo que no se listarán articulos con tipo de lote General.', 'info')

        this.lArticulo = this.lArticulo.filter(item => item.nIdControlLote != ID_LOTE_GENERAL)
      }
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarStockActual(lote) {
    if (lote == '') {
      return;
    }

    if (this.mensajeSolo != '') {
      return;
    }

    var fechaVence = this.formArticulo.controls.cboFechaVenc.value;

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 15;

    pParametro.push(this.inputModal.vCentroCosto.nId)
    pParametro.push(this.inputModal.vAlmacen.nId)
    pParametro.push(this.formArticulo.controls.cboArticulo.value.nIdArticulo)
    pParametro.push(lote);
    pParametro.push(fechaVence == '' ? '' : fechaVence.format('MM-DD-YYYY'));

    try {
      this.nStock = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      this.formArticulo.controls.txtStockActual.setValue(this.nStock)
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  //#endregion

  //#region Agregar Art.
  async fnAgregarArticulo() {
    if (this.formArticulo.controls.cboArticulo.invalid) {
      Swal.fire('¡Verificar!', 'Seleccione un articulo', 'warning')
      return;
    }

    if (this.formArticulo.controls.txtObservacion.invalid) {
      Swal.fire('¡Verificar!', 'Revise la observación', 'warning')
      return;
    }
    const articulo = this.formArticulo.controls.cboArticulo.value;

    //Para verificar que elementos le falta a un articulo 
    if (this.mensajeSolo != '') {
      Swal.fire('¡Verificar!', this.mensajeArticuloInvalido, 'warning')
      return;
    }
    var vDatos = this.formArticulo.getRawValue();

    if (articulo.nIdControlLote == ID_LOTE_VENC) {
      if (vDatos.cboFechaVenc == '') {
        Swal.fire('¡Verificar!', 'Seleccione una fecha de vencimiento!', 'warning')
        return;
      }
    }

    var sFechaVencimiento = vDatos.cboFechaVenc == '' ? '' : vDatos.cboFechaVenc.format('DD/MM/YYYY');

    if (this.inputModal.lDetalle.findIndex(item => (item.nIdArticulo == articulo.nIdArticulo) && (item.sLote == vDatos.txtLote)
      && item.sFechaExpira == sFechaVencimiento) != -1) {
      Swal.fire('¡Verificar!', 'El artículo con el lote indicado ya ha sido ingresado', 'warning')
      return;
    }

    if (this.formArticulo.controls.txtCantidad.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la cantidad de unidades!', 'warning')
      return;
    }
    var precio = 0;

    if (this.inputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
      if (vDatos.txtPrecioUnd <= 0 || vDatos.txtPrecioUnd == null) {
        Swal.fire('¡Verificar!', 'Verificar el precio unitario para el almacen valorado!', 'warning')
        return;
      } else {
        precio = vDatos.txtPrecioUnd
      }
    }

    this.spinner.show();

    try {
      var { nPeso, nVolumen } = await this.vRegTraslado.fnListarTotales(this.url, articulo.nIdArticulo, Math.round(vDatos.txtCantidad)).toPromise();
    } catch (err) {
      console.log(err)
      this.spinner.hide();
      return;
    }

    this.spinner.hide();

    var nIdMax = 0;

    this.inputModal.lDetalle.forEach(item => {
      if (item.nId > nIdMax) { nIdMax = item.nId; }
    })

    var detalle: Detalle_Articulo = {
      nId: nIdMax + 1,
      nIdArticulo: articulo.nIdArticulo,
      sArticulo: `${articulo.sCodArticulo} - ${articulo.sDescripcion}`,
      sLote: vDatos.txtLote,
      sFechaExpira: vDatos.cboFechaVenc == '' ? '' : vDatos.cboFechaVenc.format('DD/MM/YYYY'),
      sFechaIngreso: vDatos.cboFechaIngreso == '' ? '' : vDatos.cboFechaIngreso.format('DD/MM/YYYY'),
      sUndMedida: articulo.sCodUndMedida,
      nStock: this.nStock,
      nUnidades: Math.round(vDatos.txtCantidad),
      sRutaArchivo: articulo.sRutaArchivo,
      nPesoUnd: articulo.nPesoUnd,
      nVolumenUnd: articulo.nVolumenUnidad,
      sZona: `No - Faltan ${Math.round(vDatos.txtCantidad)}`,
      nCostoUnit: precio.toString() == '' ? 0 : precio,
      nCostoTotal: precio * vDatos.txtCantidad,
      nPesoTotal: nPeso,
      nVolumenTotal: nVolumen,
      sObservacion: vDatos.txtObservacion.trim(),
      nPorUbicar: Math.round(vDatos.txtCantidad),
      nIdControlLote: articulo.nIdControlLote ?? 0
    }

    this.agregarArticulo.emit(detalle);
    this.formArticulo.controls.txtCantidad.setValue(0);
    this.ngOnInit();
    //this.formArticulo.controls.cboArticulo.setValue('');
    //this.dialogRef.close(detalle);

  }
  //#endregion


  //#region Cambio de lote
  fnCambioArticulo(p: Articulo_RI) {
    if (p == null) {
      return;
    }
    if (p.sRutaArchivo == '') {
      this.urlImagen = SIN_IMAGEN;
    } else {
      this.urlImagen = p.sRutaArchivo;
    }
    this.fnVaciarControles();

    this.mensajeSolo = this.fnEvaluarArticulo(p);
    this.mensajeArticuloInvalido = `El articulo: ${p.sCodArticulo} - ${p.sDescripcion}, no tiene 
      ${this.mensajeSolo.substring(0, this.mensajeSolo.length - 2)}`

    if (this.mensajeSolo != "") {
      Swal.fire('¡Verificar!', this.mensajeArticuloInvalido, 'warning')
    }

    switch (p.nIdControlLote) {
      case ID_LOTE_GENERAL:
        this.fnLoteGeneral();
        break;
      case ID_LOTE_INGRESADO:
        this.fnLoteIngresado();
        break;
      case ID_LOTE_VENC:
        this.fnLoteVencimiento();
        break;
      default:
        break;
    }
  }

  fnLoteGeneral() {
    this.formArticulo.controls.txtLote.setValue('')
    this.formArticulo.controls.cboFechaIngreso.setValue(this.inputModal.dFechaIngreso);
    this.formArticulo.controls.cboFechaVenc.setValue('');
    this.formArticulo.controls.cboFechaIngreso.disable();
    this.formArticulo.controls.cboFechaVenc.disable();
    this.fnGenerarLote();
  }

  fnLoteIngresado() {
    this.formArticulo.controls.txtLote.setValue('')
    this.formArticulo.controls.cboFechaIngreso.setValue(this.inputModal.dFechaIngreso);
    this.formArticulo.controls.cboFechaIngreso.enable();
    this.formArticulo.controls.cboFechaVenc.setValue('');
    this.formArticulo.controls.cboFechaVenc.disable();
    this.fnGenerarLote();

  }

  fnLoteVencimiento() {
    this.formArticulo.controls.txtLote.setValue('')
    this.formArticulo.controls.cboFechaIngreso.setValue(this.inputModal.dFechaIngreso);
    this.formArticulo.controls.cboFechaIngreso.disable();
    this.formArticulo.controls.cboFechaVenc.setValue('');
    this.formArticulo.controls.cboFechaVenc.enable();

    if (this.inputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
      this.formArticulo.controls.cboFechaIngreso.enable();
    }

    this.fnGenerarLote();
  }
  //#endregion

  //#region Funciones de generacion
  async fnGenerarLote() {
    const p = this.formArticulo.controls.cboArticulo.value;
    switch (p.nIdControlLote) {
      case ID_LOTE_GENERAL:
        this.formArticulo.controls.txtLote.setValue('00000000')

        if (this.inputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
          await this.fnTraerPrecioUnitario();
        }
        break;
      case ID_LOTE_INGRESADO:
        var fecha = this.formArticulo.controls.cboFechaIngreso.value
        this.formArticulo.controls.txtLote.setValue(this.fnGenerarFecha(fecha));

        if (this.inputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
          await this.fnTraerPrecioUnitario();
        }

        break;
      case ID_LOTE_VENC:
        var fecha = this.fnEvaluarLoteVencimiento();
        this.formArticulo.controls.txtLote.setValue(this.fnGenerarFecha(fecha));

        if (this.inputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
          await this.fnTraerPrecioUnitario();
        }

        break;
      default:
        this.formArticulo.controls.txtLote.setValue('');

        break;
    }
  }

  fnGenerarFecha(fecha) {
    if (fecha == '') {
      return ''
    } else {
      var strFecha = fecha.format('DD/MM/YYYY')
      return strFecha.split('/').join('')
    }
  }

  get fnGenerarPrecioTotal() {

    if (this.inputModal.vAlmacen.nTipoAlmacen != ID_ALMACEN_VALORADO) {
      return '';
    } else {
      const precioUnit: number = this.formArticulo.controls.txtPrecioUnd.value ?? 0;
      const cantidad: number = this.formArticulo.controls.txtCantidad.value ?? 0;

      return this.decimalPipe.transform(precioUnit * cantidad, '1.4-4');
    }
  }

  fnRedondear(formControlName: string, form: FormGroup) {

    var valor: number = form.get(formControlName).value;
    if (valor == null) return;
    form.get(formControlName).setValue(Math.round(valor));

  }

  fnVaciarControles() {
    this.formArticulo.controls.txtLote.setValue('');
    this.formArticulo.controls.txtPrecioUnd.setValue('');
    this.formArticulo.controls.txtPrecioTotal.setValue('');
    this.formArticulo.controls.txtObservacion.setValue('');
  }
  //#endregion

  //#region Funciones para evaluar articulos
  fnEvaluarArticulo(p: Articulo_RI) {
    var mensaje = "";
    if (p.nPesoUnd == 0) {
      mensaje += "peso unidades, "
    }
    if (p.nVolumenUnidad == 0) {
      mensaje += "volumen unidades, "
    }
    if (p.nPesoEmpac2 == 0) {
      mensaje += "peso empaque secundario, "
    }
    if (p.nVolumenEmpac2 == 0) {
      mensaje += "volumen empaque secundario, "
    }
    if (p.sRutaArchivo == '') {
      mensaje += "imagen, "
    }
    return mensaje;
  }

  fnEvaluarLoteVencimiento() {
    //Casos especiales para lote venc.
    if (this.inputModal.vAlmacen.nTipoAlmacen != ID_ALMACEN_VALORADO) {
      return this.formArticulo.controls.cboFechaVenc.value
    } else {
      //Solo cuando es alm. valorado y lote vencimineto 
      //se toma en cuenta como lote la fecha de ingreso
      return this.formArticulo.controls.cboFechaIngreso.value
    }

  }

  //#endregion

  //Funcion para traer el precio unitario del articulo
  async fnTraerPrecioUnitario() {

    if (this.inputModal.bEsOrdenCompra) {
      //Para orden de compra fnTraerPrecioUnitarioOC
      await this.fnTraerPrecioUnitarioOC();
      return;
    }

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 21;

    var lote = this.formArticulo.controls.txtLote.value;
    var precioU = this.formArticulo.controls.txtPrecioUnd.value;
    pParametro.push(this.inputModal.vCentroCosto.nId)
    pParametro.push(this.inputModal.vAlmacen.nId)
    pParametro.push(this.formArticulo.controls.cboArticulo.value.nIdArticulo)
    pParametro.push(lote);

    try {
      var precioUnitario = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();
      if (precioUnitario == 0) {
        //Si no encontro en BD buscamos entre los articulos en memoria
        this.inputModal.lDetalle.forEach(item => {
          if (item.nIdArticulo == this.formArticulo.controls.cboArticulo.value.nIdArticulo && item.sLote == lote) {
            precioUnitario = item.nCostoUnit;
          }
        })
      }

      if (precioUnitario > 0) {
        if (precioUnitario != precioU) {
          //Si el precio nuevo es diferente del precio anterior se muestra el mensaje
          Swal.fire('Información!', 'Se encontro precio unitario para el artículo y lote indicado, si desea cambiar el precio debe cambiar la fecha del lote', 'info')
        }
        this.formArticulo.controls.txtPrecioUnd.setValue(precioUnitario)
        this.bSoloLecturaPrecioUnitario = true;
      } else {
        this.formArticulo.controls.txtPrecioUnd.setValue(0)
        this.bSoloLecturaPrecioUnitario = false;
      }

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  //#region Funciones de interacciones entre componentes
  fnAbrirImagen(url: string) {
    this.dialog.open(ArticuloImagenComponent, {
      width: '850px',
      maxWidth: '90vw',
      data: {
        url: url,
        sArticulo: ''
      }
    })
  }


  fnVerDetalleArticulo() {
    var articulo = this.formArticulo.controls.cboArticulo.value;
    if (articulo != '') {
      window.open('/controlcostos/compra/CrearArticulo/' + articulo.nIdArticulo, '_blank');
    }
  }

  //#endregion

  //#region Para agregar Articulos por OC
  fnPrecioOC(vArticulo: Articulo_RI) {
    if (this.inputModal.bEsOrdenCompra) {
      this.formArticulo.controls.txtCantidadPorIngresar.setValue(vArticulo.nCantidadOc < 0 ? 0 : vArticulo.nCantidadOc);
      this.formArticulo.controls.txtPrecioUnd.setValue(vArticulo.nPrecioOc);
    }
  }

  async fnTraerPrecioUnitarioOC() {

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 21;

    var lote = this.formArticulo.controls.txtLote.value;
    var precioU = this.formArticulo.controls.txtPrecioUnd.value;
    pParametro.push(this.inputModal.vCentroCosto.nId)
    pParametro.push(this.inputModal.vAlmacen.nId)
    pParametro.push(this.formArticulo.controls.cboArticulo.value.nIdArticulo)
    pParametro.push(lote);

    try {
      var precioUnitario = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();

      if (precioUnitario > 0) {
        if (Number(precioUnitario) != Number(precioU)) {
          //Si el precio nuevo es diferente del precio anterior se muestra el mensaje
          Swal.fire('Información!', 'Se encontro precio unitario para el artículo y lote indicado, debe cambiar la fecha del lote', 'info')
        }
        this.formArticulo.controls.txtPrecioUnd.setValue(precioUnitario)
      }

      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnAgregarArticuloOC() {
    if (this.formArticulo.controls.cboArticulo.invalid) {
      Swal.fire('¡Verificar!', 'Seleccione un articulo', 'warning')
      return;
    }
    const articulo = this.formArticulo.controls.cboArticulo.value;

    //Para verificar que elementos le falta a un articulo 
    if (this.mensajeSolo != '') {
      Swal.fire('¡Verificar!', this.mensajeArticuloInvalido, 'warning')
      return;
    }
    var vDatos = this.formArticulo.getRawValue();

    //Validar que la cantidad ingresada no sea mayor a la cantidad pedida
    if (Number(articulo.nCantidadOc) < Number(vDatos.txtCantidad)) {
      Swal.fire('¡Verificar!', 'La cantidad ingresada no puede ser mayor a la solicitada!', 'warning')
      return;
    }

    if (articulo.nIdControlLote == ID_LOTE_VENC) {
      if (vDatos.cboFechaVenc == '') {
        Swal.fire('¡Verificar!', 'Seleccione una fecha de vencimiento!', 'warning')
        return;
      }
    }

    var sFechaVencimiento = vDatos.cboFechaVenc == '' ? '' : vDatos.cboFechaVenc.format('DD/MM/YYYY');

    if (this.inputModal.lDetalle.findIndex(item => (item.nIdArticulo == articulo.nIdArticulo) && (item.sLote == vDatos.txtLote)
      && item.sFechaExpira == sFechaVencimiento) != -1) {
      Swal.fire('¡Verificar!', 'El artículo con el lote indicado ya ha sido ingresado', 'warning')
      return;
    }

    if (this.formArticulo.controls.txtCantidad.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la cantidad de unidades!', 'warning')
      return;
    }
    var precio = 0;

    if (this.inputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
      if (vDatos.txtPrecioUnd <= 0 || vDatos.txtPrecioUnd == null) {
        Swal.fire('¡Verificar!', 'Verificar el precio unitario para el almacen valorado!', 'warning')
        return;
      } else {
        precio = vDatos.txtPrecioUnd
      }
    }

    this.spinner.show();

    try {
      var { nPeso, nVolumen } = await this.vRegTraslado.fnListarTotales(this.url, articulo.nIdArticulo, Math.round(vDatos.txtCantidad)).toPromise();
    } catch (err) {
      console.log(err)
      this.spinner.hide();
      return;
    }

    this.spinner.hide();

    var nIdMax = 0;

    this.inputModal.lDetalle.forEach(item => {
      if (item.nId > nIdMax) { nIdMax = item.nId; }
    })

    //Agregamos el detalle
    var detalle: Detalle_Articulo = {
      nId: nIdMax + 1,
      nIdArticulo: articulo.nIdArticulo,
      sArticulo: `${articulo.sCodArticulo} - ${articulo.sDescripcion}`,
      sLote: vDatos.txtLote,
      sFechaExpira: vDatos.cboFechaVenc == '' ? '' : vDatos.cboFechaVenc.format('DD/MM/YYYY'), //campo para mostrar en la matTable
      sFechaIngreso: vDatos.cboFechaIngreso == '' ? '' : vDatos.cboFechaIngreso.format('DD/MM/YYYY'),
      sUndMedida: articulo.sCodUndMedida,
      nStock: this.nStock,
      nUnidades: Math.round(vDatos.txtCantidad),
      sRutaArchivo: articulo.sRutaArchivo,
      nPesoUnd: articulo.nPesoUnd,
      nVolumenUnd: articulo.nVolumenUnidad,
      sZona: `No - Faltan ${Math.round(vDatos.txtCantidad)}`,
      nCostoUnit: precio.toString() == '' ? 0 : precio,
      nCostoTotal: precio * vDatos.txtCantidad,
      nPesoTotal: nPeso,
      nVolumenTotal: nVolumen,
      sObservacion: vDatos.txtObservacion.trim(),
      nPorUbicar: Math.round(vDatos.txtCantidad),
      nIdControlLote: articulo.nIdControlLote ?? 0
    }

    this.inputModal.lArticuloOC.forEach(item => {
      if (item.nIdArticulo == articulo.nIdArticulo) {
        item.nCantidadOc -= Math.round(vDatos.txtCantidad)
      }
    })

    this.agregarArticuloOC.emit({
      vDetalle: detalle,
      lArticuloOC: this.lArticulo
    });
    this.formArticulo.controls.txtCantidad.setValue(0);
    this.formArticulo.controls.txtCantidadPorIngresar.setValue(0);
    this.fnVaciarControles();
    this.ngOnInit();
  }

  get fnValidarArticuloOC() {

    var articulo: Articulo_RI = this.formArticulo.controls.cboArticulo.value;
    if (articulo == null) {
      return true;
    }

    const precioU = this.formArticulo.controls.txtPrecioUnd.value;
    if (articulo.nPrecioOc != precioU) {
      return true;
    }

    return false;
  }
  //#endregion

  //#region Funcion de validacion
  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { caracterValidator: 'El texto no debe contener: "/", "|", "?"' } : null;
  }
  //#endregion
}
