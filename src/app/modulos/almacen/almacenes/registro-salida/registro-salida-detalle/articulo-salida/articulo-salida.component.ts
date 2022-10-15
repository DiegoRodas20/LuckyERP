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
import { Articulo_Stock, input_ModalArt } from '../../models/listasSalida.model';
import { Detalle_Articulo } from '../../models/registroSalida.model';
import { RegistroSalidaService } from '../../registro-salida.service';


const SIN_IMAGEN = '/assets/img/SinImagen.jpg'

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-articulo-salida',
  templateUrl: './articulo-salida.component.html',
  styleUrls: ['./articulo-salida.component.css']
})
export class ArticuloSalidaComponent implements OnInit {

  @Output() agregarArticulo = new EventEmitter<Detalle_Articulo>();
  lArticulo: Articulo_RI[] = [];
  mensajeSolo: string = '';
  mensajeArticuloInvalido: string = '';
  urlImagen: string;

  inputModal: input_ModalArt;

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
    @Inject(MAT_DIALOG_DATA) private data: input_ModalArt,
    public dialogRef: MatDialogRef<ArticuloSalidaComponent>,
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
      txtFechaIngreso: [''],
      txtFechaVenc: [''],
      txtLote: [''],
      txtStockActual: [''],
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

  async fnListarStockArticulo(p: Articulo_RI) {

    if (p == null) {
      return;
    }

    this.fnVaciarStock();
    this.vArticuloStock = null;

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 14;

    pParametro.push(this.inputModal.vCentroCosto.nId);
    pParametro.push(this.inputModal.vAlmacen.nId);
    pParametro.push(p.nIdArticulo);
    pParametro.push(p.nIdControlLote);

    try {
      var stock: Articulo_Stock[] = await this.vRegSalida.fnRegistroSalida(pEntidad, pOpcion, pParametro, pTipo, null, this.url).toPromise();
      this.spinner.hide();
      if (stock.length > 0) {

        //Recogemos el stock separado del articulo en memoria
        var stockSeparado = 0;
        this.inputModal.lDetalle.forEach(item => {
          if (item.nIdArticulo == p.nIdArticulo) {
            stockSeparado += item.nUnidades;
          }
        })

        //Validamos que no se haya modificado en un articulo anterior las unidades
        var lDetalle = this.inputModal.lDetalle.filter(item => item.nIdArticulo == p.nIdArticulo);
        var stockTotal = 0;
        var totalSacado = 0;
        stock.forEach(item => {
          stockTotal += item.nStock
        })

        this.inputModal.lDetalle.forEach(item => {
          if (item.nIdArticulo == p.nIdArticulo) {
            totalSacado += item.nUnidades
          }
        })

        if (stockTotal - totalSacado < 0) {
          this.vArticuloStock = null;
          Swal.fire('¡Verificar!', `El articulo seleccionado no tiene saldo disponible`, 'warning')
          return;
        }

        for (var item of lDetalle) {
          if (item.nIdArticulo == p.nIdArticulo && item.nStock > item.nUnidades) {
            Swal.fire('¡Verificar!', `El articulo seleccionado con lote: ${item.sLote}  y vencimiento ${item.sFechaExpira},
            de retirar todas las unidades, antes de sacar otro lote.`, 'warning')
            this.vArticuloStock = null;
            stock = [];
            return;
          }
        }

        var lArticuloStock: Articulo_Stock[] = stock;

        for (var i = 0; i < lArticuloStock.length; i++) {
          if (stockSeparado == 0) {
            //Si es el primer articulo que se va a agregar se recoge el primero
            this.vArticuloStock = stock[0];
            break;
          }

          stockSeparado = stockSeparado - lArticuloStock[i].nStock;

          //Si la cantidad es 0 le mostramos el siguiente articulo
          if (stockSeparado == 0) {
            //Validando que haya un siguiente articulo
            if ((i + 1) < lArticuloStock.length) {
              this.vArticuloStock = lArticuloStock[i + 1];
              break;
            } else {
              this.vArticuloStock = null;
              Swal.fire('¡Verificar!', `El articulo seleccionado no tiene saldo disponible`, 'warning')
              break;
            }
          } else if (stockSeparado > 0) {
            //si aun hay stock separado pasamos al siguiente lote con fecha de vencimiento
            continue;
          } else {
            //si es negativo significa que aun hay stock en el articulo
            Swal.fire('¡Verificar!', `El articulo seleccionado con lote: ${lArticuloStock[i].sLote}  y vencimiento ${lArticuloStock[i].sFechaVence},
            de retirar todas las unidades, antes de sacar otro lote.`, 'warning')
            break;
          }

        }


        if (this.vArticuloStock != null) {
          this.fnLlenarStock(this.vArticuloStock);
        }

      }
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  fnLLenarArticulo(p: Articulo_RI) {
    if (p == null) { return; }
    if (p.sRutaArchivo == '') {
      this.urlImagen = SIN_IMAGEN;
    } else {
      this.urlImagen = p.sRutaArchivo;
    }

    this.formArticulo.controls.txtTipoLote.setValue(p.sControlLote);
    this.formArticulo.controls.txtUndMedida.setValue(p.sCodUndMedida);
  }

  fnLlenarStock(p: Articulo_Stock) {
    this.formArticulo.controls.txtFechaIngreso.setValue(p.sFechaIngreso);
    this.formArticulo.controls.txtFechaVenc.setValue(p.sFechaVence);
    this.formArticulo.controls.txtLote.setValue(p.sLote);
    this.formArticulo.controls.txtStockActual.setValue(p.nStock);
    this.formArticulo.controls.txtFechaIngreso.setValue(p.sFechaIngreso);
  }

  fnVaciarStock() {
    this.formArticulo.controls.txtFechaIngreso.setValue('');
    this.formArticulo.controls.txtFechaVenc.setValue('');
    this.formArticulo.controls.txtLote.setValue('');
    this.formArticulo.controls.txtStockActual.setValue('');
    this.formArticulo.controls.txtFechaIngreso.setValue('');
  }

  async fnAgregarArticulo() {
    if (this.formArticulo.controls.cboArticulo.invalid) {
      Swal.fire('¡Verificar!', 'Seleccione un articulo', 'warning')
      return;
    }

    if (this.formArticulo.controls.txtObservacion.invalid) {
      Swal.fire('¡Verificar!', 'Revise la observación', 'warning')
      return;
    }

    var vDatos = this.formArticulo.value
    var vArticulo: Articulo_RI = vDatos.cboArticulo;

    if (this.inputModal.lDetalle.findIndex(item => (item.nIdArticulo == vArticulo.nIdArticulo)
      && (item.sLote == this.vArticuloStock.sLote) && (item.sFechaExpira == this.vArticuloStock.sFechaVence)) != -1) {
      Swal.fire('¡Verificar!', 'El artículo con lote y fecha de vencimiento ya ha sido ingresado', 'warning')
      return;
    }

    if (this.formArticulo.controls.txtCantidad.invalid) {
      Swal.fire('¡Verificar!', 'Revise la cantidad', 'warning')
      return;
    }

    if (this.vArticuloStock.nStock < vDatos.txtCantidad) {
      Swal.fire('¡Verificar!', 'La cantidad no puede ser mayor al stock actual!', 'warning')
      return;
    }

    this.spinner.show();

    //Solo si hace picking validamos
    if (!this.inputModal.bNoPicking) {
      //Validando que haya stock en la ubicación
      const stockUbicacion = await this.fnValidarStockUbicacion(this.inputModal.vAlmacen.nId, this.inputModal.vCentroCosto.nId, vArticulo.nIdArticulo, this.vArticuloStock.sLote, this.vArticuloStock.sFechaVence)
      if (stockUbicacion < vDatos.txtCantidad) {
        this.spinner.hide();
        Swal.fire('¡Verificar!',
          `No hay saldo suficiente en ubicación del artículo: ${vArticulo.sCodArticulo + ' - ' + vArticulo.sDescripcion},
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

    var nIdMax = 0;

    this.inputModal.lDetalle.forEach(item => {
      if (item.nId > nIdMax) { nIdMax = item.nId; }
    })

    var detalle: Detalle_Articulo = {
      nId: nIdMax + 1,
      nIdArticulo: vArticulo.nIdArticulo,
      sArticulo: vArticulo.sCodArticulo + ' - ' + vArticulo.sDescripcion,
      sLote: this.vArticuloStock.sLote,
      sRutaArchivo: vArticulo.sRutaArchivo,
      sFechaExpira: this.vArticuloStock.sFechaVence,
      sFechaIngreso: this.vArticuloStock.sFechaIngreso,
      sUndMedida: vArticulo.sCodUndMedida,
      nStock: this.vArticuloStock.nStock,
      nUnidades: Math.round(vDatos.txtCantidad),
      nCostoUnit: this.vArticuloStock.nPrecioUnidad,
      nPesoUnd: vArticulo.nPesoUnd,
      nVolumenUnd: vArticulo.nVolumenUnidad,
      nCostoTotal: this.vArticuloStock.nPrecioUnidad * Math.round(vDatos.txtCantidad),
      nVolumenTotal: nVolumen,
      nPesoTotal: nPeso,
      sObservacion: vDatos.txtObservacion.trim(),
      nIdControlLote: vArticulo.nIdControlLote
    }


    this.agregarArticulo.emit(detalle);
    this.formArticulo.controls.txtCantidad.setValue(0);
    //this.fnListarStockArticulo(vArticulo);
    this.vArticuloStock = null;
    this.ngOnInit();
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
