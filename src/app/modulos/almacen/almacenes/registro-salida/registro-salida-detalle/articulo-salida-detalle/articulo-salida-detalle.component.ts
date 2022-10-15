import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Articulo_RI } from '../../../registro-ingreso/models/listasIngreso.model';
import { ArticuloImagenComponent } from '../../../registro-ingreso/registro-ingreso-detalle/articulo-modal/articulo-imagen/articulo-imagen.component';
import { RegistroTrasladoService } from '../../../registro-traslado/registro-traslado.service';
import { Articulo_Stock, input_ModalArt, input_ModalArtDetalle } from '../../models/listasSalida.model';
import { Detalle_Articulo } from '../../models/registroSalida.model';
import { RegistroSalidaService } from '../../registro-salida.service';


const SIN_IMAGEN = '/assets/img/SinImagen.jpg'

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-articulo-salida-detalle',
  templateUrl: './articulo-salida-detalle.component.html',
  styleUrls: ['./articulo-salida-detalle.component.css']
})
export class ArticuloSalidaDetalleComponent implements OnInit {

  @Output() agregarArticulo = new EventEmitter<Detalle_Articulo>();
  lArticulo: Articulo_RI[] = [];
  mensajeSolo: string = '';
  mensajeArticuloInvalido: string = '';
  urlImagen: string;

  inputModal: input_ModalArtDetalle;

  vArticuloStock: Articulo_Stock;

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
    private vRegSalida: RegistroSalidaService,
    private vRegTraslado: RegistroTrasladoService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private data: input_ModalArtDetalle,
    public dialogRef: MatDialogRef<ArticuloSalidaDetalleComponent>,
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
      txtArticulo: ['', Validators.required],
      txtFechaIngreso: [''],
      txtFechaVenc: [''],
      txtLote: [''],
      txtStockActual: [''],
      txtCantidad: ['', [Validators.required, Validators.min(1)]],
      txtObservacion: ['', this.caracterValidator],
    })

    //this.urlImagen = SIN_IMAGEN;
  }

  ngAfterViewInit() {
    setTimeout(() => {

      //Para que no haya error de ngAfterContentChecked
      this.fnLLenarArticulo(this.inputModal.vDetalle)
      //this.fnListarArticulo();
    });
  }

  async fnListarArticulo() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 13;

    pParametro.push(this.inputModal.vCentroCosto.nId);
    pParametro.push(this.inputModal.vAlmacen.nId);

    try {
      this.lArticulo = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnLLenarArticulo(p: Detalle_Articulo) {
    this.urlImagen = p.sRutaArchivo;
    this.formArticulo.controls.txtArticulo.setValue(p.sArticulo);
    this.formArticulo.controls.txtFechaIngreso.setValue(p.sFechaIngreso);
    this.formArticulo.controls.txtFechaVenc.setValue(p.sFechaExpira);
    this.formArticulo.controls.txtLote.setValue(p.sLote);
    this.formArticulo.controls.txtStockActual.setValue(p.nStock);
    this.formArticulo.controls.txtCantidad.setValue(p.nUnidades);
    this.formArticulo.controls.txtObservacion.setValue(p.sObservacion);
  }

  async fnGuardarArticulo() {

    if (this.formArticulo.controls.txtObservacion.invalid) {
      Swal.fire('¡Verificar!', 'Revise la observación', 'warning')
      return;
    }

    var vDatos = this.formArticulo.value
    var vArticulo = this.inputModal.vDetalle;

    if (this.formArticulo.controls.txtCantidad.invalid) {
      Swal.fire('¡Verificar!', 'Revise la cantidad', 'warning')
      return;
    }

    if (this.inputModal.vDetalle.nStock < vDatos.txtCantidad) {
      Swal.fire('¡Verificar!', 'La cantidad no puede ser mayor al stock actual!', 'warning')
      return;
    }

    this.spinner.show();

    //Solo si hace Picking validamos
    if (!this.inputModal.bNoPicking) {
      //Validando que haya stock en la ubicación
      const stockUbicacion = await this.fnValidarStockUbicacion(
        this.inputModal.vAlmacen.nId,
        this.inputModal.vCentroCosto.nId,
        vArticulo.nIdArticulo,
        this.inputModal.vDetalle.sLote,
        this.inputModal.vDetalle.sFechaExpira);

      if (stockUbicacion < vDatos.txtCantidad) {
        this.spinner.hide();
        Swal.fire('¡Verificar!',
          `No hay saldo suficiente en ubicación del artículo: ${vArticulo.sArticulo},
         en el almacén: ${this.inputModal.vAlmacen.sDescripcion.split('-')[0].trim()}, 
         del centro de costo: ${this.inputModal.vCentroCosto.sDescripcion.split('-')[0].trim()},
         No podrá realizar la salida, favor de verificar.`,
          'warning')
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

    this.inputModal.vDetalle.nUnidades = Math.round(Number(vDatos.txtCantidad));
    this.inputModal.vDetalle.nPesoTotal = nPeso;
    this.inputModal.vDetalle.nVolumenTotal = nVolumen;
    this.inputModal.vDetalle.nCostoTotal = this.inputModal.vDetalle.nCostoUnit * Math.round(vDatos.txtCantidad);
    this.inputModal.vDetalle.sObservacion = vDatos.txtObservacion.trim();

    this.dialogRef.close(this.inputModal.vDetalle);
  }

  fnVerDetalleArticulo() {
    var articulo = this.formArticulo.controls.cboArticulo.value;
    if (articulo != '') {
      window.open('/controlcostos/compra/CrearArticulo/' + this.inputModal.vDetalle.nIdArticulo, '_blank');
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
      return 0;
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
