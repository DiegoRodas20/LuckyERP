import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Articulo_RI } from '../../../registro-ingreso/models/listasIngreso.model';
import { ArticuloImagenComponent } from '../../../registro-ingreso/registro-ingreso-detalle/articulo-modal/articulo-imagen/articulo-imagen.component';
import { Articulo_Stock, input_ModalArt } from '../../models/listasTraslado.model';
import { Detalle_Articulo } from '../../models/registroTraslado.model';
import { RegistroTrasladoService } from '../../registro-traslado.service';


const SIN_IMAGEN = '/assets/img/SinImagen.jpg'

const ID_LOTE_GENERAL = 1946;
const ID_LOTE_INGRESADO = 1947;
const ID_LOTE_VENC = 1948;

const ID_ALMACEN_VALORADO = 1851;

@Component({
  selector: 'app-articulo-traslado',
  templateUrl: './articulo-traslado.component.html',
  styleUrls: ['./articulo-traslado.component.css']
})
export class ArticuloTrasladoComponent implements OnInit {

  lArticulo: Articulo_RI[] = [];
  urlImagen: string;

  inputModal: input_ModalArt;

  vArticuloStock: Articulo_Stock;
  lArticuloStock: Articulo_Stock[] = [];

  @Output() agregarArticulo = new EventEmitter<Detalle_Articulo>();

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
    private vRegTraslado: RegistroTrasladoService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private data: input_ModalArt,
    public dialogRef: MatDialogRef<ArticuloTrasladoComponent>,
    public dialog: MatDialog,
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
      cboInformacion: ['', Validators.required],
      txtStockActual: [0],
      txtCantidad: ['', [Validators.required, Validators.min(1)]],
      txtPrecioUnd: [''],
      txtPrecioTotal: [''],
      txtObservacion: ['', this.caracterValidator],
    })

    this.urlImagen = SIN_IMAGEN;
  }

  ngAfterViewInit() {
    setTimeout(() => {

      //Para que no haya error de ngAfterContentChecked
      this.fnListarArticulo();
    });
  }

  async fnListarArticulo() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 8;

    pParametro.push(this.inputModal.vCentroCosto.nId);
    pParametro.push(this.inputModal.vAlmacen.nId);

    try {
      this.lArticulo = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnLLenarArticulo(p: Articulo_RI) {
    if (p == null) { return; }
    if (p.sRutaArchivo == '') {
      this.urlImagen = SIN_IMAGEN;
    } else {
      this.urlImagen = p.sRutaArchivo;
    }

    this.formArticulo.controls.txtTipoLote.setValue(p.sControlLote);
    this.formArticulo.controls.txtUndMedida.setValue(p.sCodUndMedida);
    this.formArticulo.controls.txtStockActual.setValue(0);
    this.lArticuloStock = [];
    await this.fnListarStock(p);
  }

  fnLLenarStock(p: Articulo_Stock) {
    this.formArticulo.controls.txtStockActual.setValue(p.nStock);
  }

  async fnAgregarArticulo() {
    if (this.formArticulo.invalid) {
      Swal.fire('¡Verificar!', 'Revise los datos', 'warning')
      return;
    }

    var vDatos = this.formArticulo.value
    var vStock: Articulo_Stock = vDatos.cboInformacion;
    var vArticulo: Articulo_RI = vDatos.cboArticulo;

    if (this.inputModal.lDetalle.findIndex(item => (item.nIdArticulo == vArticulo.nIdArticulo)
      && (item.sLote == vStock.sLote) && (item.sFechaExpira == vStock.sFechaVence)) != -1) {
      Swal.fire('¡Verificar!', 'El artículo con lote y fecha de vencimiento ya ha sido ingresado', 'warning')
      return;
    }

    if (this.formArticulo.controls.txtCantidad.invalid) {
      Swal.fire('¡Verificar!', 'Revise la cantidad', 'warning')
      return;
    }

    if (vStock.nStock < vDatos.txtCantidad) {
      Swal.fire('¡Verificar!', 'La cantidad no puede ser mayor al stock actual!', 'warning')
      return;
    }

    this.spinner.show();

    if (!this.inputModal.bNoPicking) {

      //Validando que haya stock en la ubicación
      const stockUbicacion = await this.fnValidarStockUbicacion(this.inputModal.vAlmacen.nId, this.inputModal.vCentroCosto.nId, vArticulo.nIdArticulo, vStock.sLote, vStock.sFechaVence)
      if (stockUbicacion < vDatos.txtCantidad) {
        Swal.fire('¡Verificar!',
          `No hay saldo suficiente en ubicación del artículo: ${vArticulo.sCodArticulo + ' - ' + vArticulo.sDescripcion},
         en el almacén: ${this.inputModal.vAlmacen.sDescripcion.split('-')[0].trim()}, 
         del centro de costo: ${this.inputModal.vCentroCosto.sDescripcion.split('-')[0].trim()},
         No podrá realizar el traslado, favor de verificar.`,
          'warning')
        this.spinner.hide();
        return;
      }

    }

    try {
      var { nPeso, nVolumen } = await this.vRegTraslado.fnListarTotales(this.url, vArticulo.nIdArticulo, Math.round(vDatos.txtCantidad)).toPromise();
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
      nIdArticulo: vArticulo.nIdArticulo,
      sArticulo: vArticulo.sCodArticulo + ' - ' + vArticulo.sDescripcion,
      sLote: vStock.sLote,
      sRutaArchivo: vArticulo.sRutaArchivo,
      sFechaExpira: vStock.sFechaVence,
      sFechaIngreso: vStock.sFechaIngreso,
      sUndMedida: vArticulo.sCodUndMedida,
      nStock: vStock.nStock,
      nUnidades: Math.round(vDatos.txtCantidad),
      nCostoUnit: vStock.nPrecioUnidad,
      nPesoUnd: vArticulo.nPesoUnd,
      nVolumenUnd: vArticulo.nVolumenUnidad,
      nCostoTotal: vStock.nPrecioUnidad * Math.round(vDatos.txtCantidad),
      nVolumenTotal: nVolumen,
      nPesoTotal: nPeso,
      sObservacion: vDatos.txtObservacion.trim(),
      nIdControlLote: vArticulo.nIdControlLote
    }

    this.agregarArticulo.emit(detalle);
    this.formArticulo.controls.txtCantidad.setValue(0);
    this.formArticulo.controls.cboInformacion.setValue('');
    this.ngOnInit();
    this.lArticuloStock = [];

  }

  fnVerDetalleArticulo() {
    var articulo = this.formArticulo.controls.cboArticulo.value;
    if (articulo != '') {
      window.open('/controlcostos/compra/CrearArticulo/' + articulo.nIdArticulo, '_blank');
    }
  }

  fnRedondear(formControlName: string, form: FormGroup) {

    var valor: number = form.get(formControlName).value;
    if (valor == null) return;
    form.get(formControlName).setValue(Math.round(valor));

  }

  //Funciones de interacciones entre componentes
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

  async fnValidarStockUbicacion(nIdAlmacen: number, nIdCentroCosto: number, nIdArticulo: number, sLote: string, sFechaVence: string): Promise<number> {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios

    //Si la op. es de baja mandamos al procedure 18 sino mandamos al 10
    var pTipo = this.inputModal.nIdTipoOperacion == 2274 ? 18 : 10;

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
      return 0;
    }
  }


  async fnListarStock(vArticulo: Articulo_RI): Promise<void> {
    //Este trae una lista con fecha de venc, lote, fecha de ingreso, 

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 9;

    pParametro.push(this.inputModal.vCentroCosto.nId);
    pParametro.push(this.inputModal.vAlmacen.nId);
    pParametro.push(vArticulo.nIdArticulo);
    pParametro.push(vArticulo.nIdControlLote);

    try {
      const stock = await this.vRegTraslado.fnRegistroTraslado(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
      this.lArticuloStock = stock;
    } catch (error) {
      console.log(error);
      this.spinner.hide();
      this.lArticuloStock = [];
    }
  }

  //#region Funcion de validacion
  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { caracterValidator: 'El texto no debe contener: "/", "|", "?"' } : null;
  }
  //#endregion

}
