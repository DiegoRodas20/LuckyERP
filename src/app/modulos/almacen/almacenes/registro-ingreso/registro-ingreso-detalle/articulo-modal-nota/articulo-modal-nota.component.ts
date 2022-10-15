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
  selector: 'app-articulo-modal-nota',
  templateUrl: './articulo-modal-nota.component.html',
  styleUrls: ['./articulo-modal-nota.component.css'],
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
export class ArticuloModalNotaComponent implements OnInit {

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
    public dialogRef: MatDialogRef<ArticuloModalNotaComponent>,
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
      cboFechaVence: [''],
      txtLote: [''],
      txtStockActual: [''],
      txtCantidad: ['', [Validators.required, Validators.min(1)]],
      txtPrecioUnd: [''],
      txtPrecioTotal: [''],
      txtObservacion: ['', this.caracterValidator],
    })


    this.urlImagen = this.vArticulo.sRutaArchivo;
    if (this.vArticulo.sFechaIngreso == '') {
      this.formArticulo.controls.cboFechaIngreso.setValue(this.vInputModal.vFechaIngreso);
    } else {
      this.formArticulo.controls.cboFechaIngreso.setValue(moment(this.vArticulo.sFechaIngreso, 'DD/MM/YYYY'));
    }

    if (this.vArticulo.sFechaExpira == '') {
      this.formArticulo.controls.cboFechaVence.setValue('');
    } else {
      this.formArticulo.controls.cboFechaVence.setValue(moment(this.vArticulo.sFechaExpira, 'DD/MM/YYYY'));
    }

    if (this.vInputModal.vAlmacen.nTipoAlmacen != ID_ALMACEN_VALORADO) {
      this.bSoloLecturaPrecioUnitario = true;
      this.formArticulo.controls.txtPrecioUnd.setValue('');
    }

    this.formArticulo.controls.txtArticulo.setValue(this.vArticulo.sArticulo);

    await this.fnCambioArticulo();
    await this.fnGenerarLote();

    this.formArticulo.controls.txtPrecioUnd.setValue(this.vArticulo.nCostoUnit);
    this.formArticulo.controls.txtCantidad.setValue(this.vArticulo.nUnidades);
    this.formArticulo.controls.txtPrecioTotal.setValue(this.vArticulo.nCostoTotal);
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

    var fechaVence = this.formArticulo.controls.cboFechaVence.value ?? '';

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 15;

    pParametro.push(this.vInputModal.nIdCentroCosto)
    pParametro.push(this.vInputModal.vAlmacen.nId)
    pParametro.push(this.vInputModal.vArticulo.nIdArticulo)
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

    var articulo = this.vInputModal.vArticulo

    if (articulo.nIdControlLote == ID_LOTE_VENC) {
      if (vDatos.cboFechaVence == '') {
        Swal.fire('¡Verificar!', 'Seleccione una fecha de vencimiento!', 'warning')
        return;
      }
    }

    var sFechaVencimiento = vDatos.cboFechaVence == '' ? '' : vDatos.cboFechaVence.format('DD/MM/YYYY');

    if (this.vInputModal.lDetalle.findIndex(item => (item.nIdArticulo == articulo.nIdArticulo) && (item.sLote == vDatos.txtLote)
      && item.sFechaExpira == sFechaVencimiento && item.nId != articulo.nId) != -1) {
      Swal.fire('¡Verificar!', 'El artículo con el lote indicado ya ha sido ingresado', 'warning')
      return;
    }

    if (this.vInputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
      if (vDatos.txtPrecioUnd <= 0 || vDatos.txtPrecioUnd == null) {
        Swal.fire('¡Verificar!', 'Verificar el precio unitario para el almacen valorado!', 'warning')
        return;
      } else {
        precio = vDatos.txtPrecioUnd
      }
    }

    //validar que no se bajen las unidades a menos de las que ya estan ubicadas
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

    var precio = this.vInputModal.vArticulo.nCostoUnit ?? 0;

    this.vInputModal.vArticulo.sLote = vDatos.txtLote;
    this.vInputModal.vArticulo.nStock = this.nStock;
    this.vInputModal.vArticulo.nUnidades = Math.round(vDatos.txtCantidad);
    this.vInputModal.vArticulo.sZona = diferencia == 0 ? 'Si' : `No - Faltan ${diferencia}`;
    this.vInputModal.vArticulo.nCostoTotal = precio * vDatos.txtCantidad;
    this.vInputModal.vArticulo.nVolumenTotal = nVolumen;
    this.vInputModal.vArticulo.nPesoTotal = nPeso;
    this.vInputModal.vArticulo.sObservacion = vDatos.txtObservacion.trim();
    this.vInputModal.vArticulo.nCostoUnit = vDatos.txtPrecioUnd ?? 0;
    this.vInputModal.vArticulo.nPorUbicar = diferencia;
    this.vInputModal.vArticulo.sFechaIngreso = vDatos.cboFechaIngreso.format('DD/MM/YYYY')
    this.vInputModal.vArticulo.sFechaExpira = vDatos.cboFechaVence == '' ? '' : vDatos.cboFechaVence.format('DD/MM/YYYY')

    this.dialogRef.close(this.vInputModal.vArticulo);

  }
  //#endregion


  //#region Cambio de lote
  async fnCambioArticulo() {

    var p = this.vInputModal.vArticulo;

    if (p.sRutaArchivo == '') {
      this.urlImagen = SIN_IMAGEN;
    } else {
      this.urlImagen = p.sRutaArchivo;
    }
    this.fnVaciarControles();

    switch (p.nIdControlLote) {
      case ID_LOTE_GENERAL:
        await this.fnLoteGeneral();
        break;
      case ID_LOTE_INGRESADO:
        await this.fnLoteIngresado();
        break;
      case ID_LOTE_VENC:
        await this.fnLoteVencimiento();
        break;
      default:
        break;
    }
  }

  async fnLoteGeneral() {
    this.formArticulo.controls.cboFechaIngreso.disable();
    this.formArticulo.controls.cboFechaVence.disable();
    await this.fnGenerarLote();
  }

  async fnLoteIngresado() {
    this.formArticulo.controls.txtLote.setValue('')
    this.formArticulo.controls.cboFechaIngreso.enable();
    this.formArticulo.controls.cboFechaVence.disable();
    await this.fnGenerarLote();
  }

  async fnLoteVencimiento() {
    this.formArticulo.controls.txtLote.setValue('')
    this.formArticulo.controls.cboFechaIngreso.disable();
    this.formArticulo.controls.cboFechaVence.enable();

    if (this.vInputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
      this.formArticulo.controls.cboFechaIngreso.enable();
    }

    await this.fnGenerarLote();
  }
  //#endregion

  //#region Funciones de generacion
  async fnGenerarLote() {
    const p = this.vInputModal.vArticulo;

    switch (p.nIdControlLote) {
      case ID_LOTE_GENERAL:
        this.formArticulo.controls.txtLote.setValue('00000000')

        if (this.vInputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
          await this.fnTraerPrecioUnitario();
        }
        break;
      case ID_LOTE_INGRESADO:
        var fecha = this.formArticulo.controls.cboFechaIngreso.value
        this.formArticulo.controls.txtLote.setValue(this.fnGenerarFecha(fecha));

        if (this.vInputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
          await this.fnTraerPrecioUnitario();
        }
        break;
      case ID_LOTE_VENC:
        var fecha = this.fnEvaluarLoteVencimiento() as any;
        this.formArticulo.controls.txtLote.setValue(this.fnGenerarFecha(fecha));

        if (this.vInputModal.vAlmacen.nTipoAlmacen == ID_ALMACEN_VALORADO) {
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
  }
  //#endregion

  //#region Funciones para evaluar articulos
  fnEvaluarLoteVencimiento() {
    //Casos especiales para lote venc.
    if (this.vInputModal.vAlmacen.nTipoAlmacen != ID_ALMACEN_VALORADO) {
      return this.formArticulo.controls.cboFechaVence.value
    } else {
      //Solo cuando es alm. valorado y lote vencimineto 
      //se toma en cuenta como lote la fecha de ingreso
      return this.formArticulo.controls.cboFechaIngreso.value
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

  //Funcion para traer el precio unitario del articulo
  async fnTraerPrecioUnitario() {

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 21;

    var lote = this.formArticulo.controls.txtLote.value;
    var precioU = this.formArticulo.controls.txtPrecioUnd.value;
    pParametro.push(this.vInputModal.nIdCentroCosto)
    pParametro.push(this.vInputModal.vAlmacen.nId)
    pParametro.push(this.vInputModal.vArticulo.nIdArticulo)
    pParametro.push(lote);

    try {
      var precioUnitario = await this.vRegIngreso.fnRegistroIngreso(pEntidad, pOpcion, pParametro, pTipo, null, null, this.url).toPromise();

      if (precioUnitario == 0) {
        //Si no encontro en BD buscamos entre los articulos en memoria
        this.vInputModal.lDetalle.forEach(item => {
          if (item.nIdArticulo == this.vInputModal.vArticulo.nIdArticulo && item.sLote == lote) {
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

    } catch (error) {
      console.log(error);
    }
  }

}
