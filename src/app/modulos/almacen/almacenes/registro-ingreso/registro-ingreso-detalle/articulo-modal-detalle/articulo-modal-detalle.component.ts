import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { RegistroTrasladoService } from '../../../registro-traslado/registro-traslado.service';
import { input_ModalArt_Detalle } from '../../models/listasIngreso.model';
import { Detalle_Articulo } from '../../models/registroIngreso.models';
import { RegistroIngresoService } from '../../registro-ingreso.service';
import { ArticuloImagenComponent } from '../articulo-modal/articulo-imagen/articulo-imagen.component';

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
  selector: 'app-articulo-modal-detalle',
  templateUrl: './articulo-modal-detalle.component.html',
  styleUrls: ['./articulo-modal-detalle.component.css'],
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
export class ArticuloModalDetalleComponent implements OnInit {

  mensajeSolo: string = '';
  mensajeArticuloInvalido: string = '';
  urlImagen: string;

  vInputModal: input_ModalArt_Detalle;
  vArticulo: Detalle_Articulo;

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
    @Inject(MAT_DIALOG_DATA) private data: input_ModalArt_Detalle,
    public dialogRef: MatDialogRef<ArticuloModalDetalleComponent>,
    public dialog: MatDialog,
    private decimalPipe: DecimalPipe,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; this.vInputModal = data; this.vArticulo = data.vArticulo }

  async ngOnInit(): Promise<void> {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formArticulo = this.formBuilder.group({
      txtArticulo: ['', Validators.required],
      cboFechaIngreso: [''],
      txtFechaVence: [''],
      txtLote: [''],
      txtStockActual: [''],
      txtCantidad: ['', [Validators.required, Validators.min(1)]],
      txtPrecioUnd: [''],
      txtPrecioTotal: [''],
      txtObservacion: ['', this.caracterValidator],
    })


    this.urlImagen = this.vArticulo.sRutaArchivo;
    this.formArticulo.controls.cboFechaIngreso.setValue(moment(this.vArticulo.sFechaIngreso, 'DD/MM/YYYY'));
    this.formArticulo.controls.txtFechaVence.setValue(this.vArticulo.sFechaExpira);
    this.formArticulo.controls.txtArticulo.setValue(this.vArticulo.sArticulo);
    this.formArticulo.controls.txtPrecioUnd.setValue(this.vArticulo.nCostoUnit);
    this.formArticulo.controls.txtCantidad.setValue(this.vArticulo.nUnidades);
    this.formArticulo.controls.txtPrecioTotal.setValue(this.vArticulo.nCostoTotal);
    this.formArticulo.controls.txtLote.setValue(this.vArticulo.sLote);
    this.formArticulo.controls.txtObservacion.setValue(this.vArticulo.sObservacion);

  }

  ngAfterViewInit() {
    setTimeout(async () => {

      //Para que no haya error de ngAfterContentChecked
      await this.fnListarStockActual(this.vArticulo.sLote);
    });
  }

  async fnListarStockActual(lote) {
    if (lote == '') {
      return;
    }

    if (this.mensajeSolo != '') {
      return;
    }

    var fechaVence = moment(this.vInputModal.vArticulo.sFechaExpira, 'DD/MM/YYYY');

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 15;

    pParametro.push(this.vInputModal.nIdCentroCosto)
    pParametro.push(this.vInputModal.vAlmacen.nId)
    pParametro.push(this.vInputModal.vArticulo.nIdArticulo)
    pParametro.push(lote);
    pParametro.push(this.vInputModal.vArticulo.sFechaExpira == '' ? '' : fechaVence.format('MM-DD-YYYY'));

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

    if (this.formArticulo.controls.txtObservacion.invalid) {
      Swal.fire('¡Verificar!', 'Revise la observación', 'warning')
      return;
    }

    //Para verificar que elementos le falta a un articulo 
    if (this.mensajeSolo != '') {
      Swal.fire('¡Verificar!', this.mensajeArticuloInvalido, 'warning')
      return;
    }
    var vDatos = this.formArticulo.getRawValue();

    if (this.formArticulo.controls.txtCantidad.invalid) {
      Swal.fire('¡Verificar!', 'Verificar la cantidad de unidades!', 'warning')
      return;
    }

    var diferencia = this.vInputModal.vArticulo.nPorUbicar - (this.vInputModal.vArticulo.nUnidades - Math.round(vDatos.txtCantidad));


    if (diferencia < 0) {
      Swal.fire('¡Verificar!', `Se han ubicado ${this.vInputModal.vArticulo.nUnidades}, es necesario desubicar
                                ${Math.abs(diferencia)} para poder bajar las unidades`, 'warning')
      return;
    }

    this.spinner.show();

    try {
      var { nPeso, nVolumen } = await this.vRegTraslado.fnListarTotales(this.url, this.vInputModal.vArticulo.nIdArticulo, Math.round(vDatos.txtCantidad)).toPromise();
    } catch (err) {
      console.log(err)
      this.spinner.hide();
      return;
    }

    this.spinner.hide();

    var articulo = this.vInputModal.vArticulo
    var precio = this.vInputModal.vArticulo.nCostoUnit ?? 0;

    this.vInputModal.vArticulo.sLote = vDatos.txtLote;
    this.vInputModal.vArticulo.nStock = this.nStock;
    this.vInputModal.vArticulo.nUnidades = Math.round(vDatos.txtCantidad);
    this.vInputModal.vArticulo.sZona = diferencia == 0 ? 'Si' : `No - Faltan ${diferencia}`;
    this.vInputModal.vArticulo.nCostoTotal = precio * vDatos.txtCantidad;
    this.vInputModal.vArticulo.nVolumenTotal = nVolumen;
    this.vInputModal.vArticulo.nPesoTotal = nPeso;
    this.vInputModal.vArticulo.sObservacion = vDatos.txtObservacion.trim();
    this.vInputModal.vArticulo.nPorUbicar = diferencia;
    this.vInputModal.vArticulo.sFechaIngreso = vDatos.cboFechaIngreso.format('DD/MM/YYYY')

    this.dialogRef.close(this.vInputModal.vArticulo);

  }
  //#endregion


  //#region Cambio de lote
  fnCambioArticulo() {

    var p = this.vInputModal.vArticulo;

    if (p.sRutaArchivo == '') {
      this.urlImagen = SIN_IMAGEN;
    } else {
      this.urlImagen = p.sRutaArchivo;
    }
    this.fnVaciarControles();

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
    this.formArticulo.controls.cboFechaIngreso.setValue(moment(this.vInputModal.vArticulo.sFechaIngreso, 'DD/MM/YYYY'));
    this.formArticulo.controls.txtFechaVence.setValue('');
    this.formArticulo.controls.cboFechaIngreso.disable();
    this.fnGenerarLote();
  }

  fnLoteIngresado() {
    this.formArticulo.controls.txtLote.setValue('')
    this.formArticulo.controls.cboFechaIngreso.setValue(moment(this.vInputModal.vArticulo.sFechaIngreso, 'DD/MM/YYYY'));
    this.formArticulo.controls.cboFechaIngreso.enable();
    this.formArticulo.controls.txtFechaVence.setValue('');
    this.fnGenerarLote();
  }

  fnLoteVencimiento() {
    this.formArticulo.controls.txtLote.setValue('')
    this.formArticulo.controls.cboFechaIngreso.setValue(moment(this.vInputModal.vArticulo.sFechaIngreso, 'DD/MM/YYYY'));
    this.formArticulo.controls.cboFechaIngreso.disable();
    this.formArticulo.controls.txtFechaVence.setValue('');

    if (this.vInputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
      this.formArticulo.controls.cboFechaIngreso.enable();
    }

    this.fnGenerarLote();
  }
  //#endregion

  //#region Funciones de generacion
  async fnGenerarLote() {
    const p = this.vInputModal.vArticulo;
    switch (p.nIdControlLote) {
      case ID_LOTE_GENERAL:
        this.formArticulo.controls.txtLote.setValue('00000000')
        break;
      case ID_LOTE_INGRESADO:
        var fecha = this.formArticulo.controls.cboFechaIngreso.value
        this.formArticulo.controls.txtLote.setValue(this.fnGenerarFecha(fecha));
        break;
      case ID_LOTE_VENC:
        var fecha = this.fnEvaluarLoteVencimiento() as any;
        this.formArticulo.controls.txtLote.setValue(this.fnGenerarFecha(fecha));
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

  fnGenerarPrecioTotal() {

    if (this.vInputModal.vAlmacen.nTipoAlmacen != ID_ALMACEN_VALORADO) {
      return 0;
    } else {
      const precioUnit: number = this.formArticulo.controls.txtPrecioUnd.value ?? 0;
      const cantidad: number = this.formArticulo.controls.txtCantidad.value ?? 0;

      this.formArticulo.controls.txtPrecioTotal.setValue(this.decimalPipe.transform(precioUnit * cantidad, '1.4-4'));
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
    this.formArticulo.controls.txtCantidad.setValue('');
  }
  //#endregion

  //#region Funciones para evaluar articulos
  fnEvaluarLoteVencimiento() {
    //Casos especiales para lote venc.
    if (this.vInputModal.vAlmacen.nTipoAlmacen != ID_ALMACEN_VALORADO) {
      return moment(this.vInputModal.vArticulo.sFechaExpira, 'DD/MM/YYYY')
    } else {
      //Solo cuando es alm. valorado y lote vencimineto 
      //se toma en cuenta como lote la fecha de ingreso
      return moment(this.vInputModal.vArticulo.sFechaIngreso, 'DD/MM/YYYY')
    }
  }

  //#endregion

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
    var articulo = this.vInputModal.vArticulo;
    if (articulo != null) {
      window.open('/controlcostos/compra/CrearArticulo/' + articulo.nIdArticulo, '_blank');
    }
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
