import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { message, SecurityErp } from 'src/app/modulos/AAHelpers';
import { ArticuloTI, ComponenteTI, EArticulo } from '../../api/models/articuloDTO';
import { SelecItem } from '../../api/models/tipoElementoDTO';
import { ArticuloService } from '../../api/services/articulo.service';
import Swal from 'sweetalert2';
import { filter } from 'rxjs/operators';
import { FilecontrolService } from 'src/app/shared/services/filecontrol.service';
import { HttpEventType } from '@angular/common/http';
import { TiArticuloComponenteComponent } from '../ti-articulo-componente/ti-articulo-componente.component';
import { MatDialog } from '@angular/material/dialog';
import { TiArticuloImagenComponent } from '../ti-articulo-imagen/ti-articulo-imagen.component';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import moment from 'moment';
import { TiArticuloPreciosComponent } from './ti-articulo-precios/ti-articulo-precios.component';

@Component({
  selector: 'app-ti-articulo-detalle',
  templateUrl: './ti-articulo-detalle.component.html',
  styleUrls: ['./ti-articulo-detalle.component.css'],
  animations: [asistenciapAnimations]
})
export class TiArticuloDetalleComponent implements OnInit {
  @ViewChild(TiArticuloComponenteComponent, { static: true }) compComponente: TiArticuloComponenteComponent;
  subFamilias: SelecItem[];
  marcas: SelecItem[];
  tiposDispositivo: SelecItem[];
  unidadTipos: SelecItem[];
  caracteristicas: SelecItem[];
  componentes: ComponenteTI[] = [];
  form: FormGroup;
  nIdArticulo: number;
  storageData: SecurityErp = new SecurityErp();
  sMarca: string = '';
  sTipoUnidad: string = '';
  show: boolean = true;
  url: string;
  sCodBarra: string;
  sImagen: string;
  sImagenActual: string;

  bPartNumber = false;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    { icon: 'save', tool: 'Guardar', state: true, color: 'secondary' },
    { icon: 'edit', tool: 'Editar', state: true, color: 'secondary' },
    { icon: 'add_photo_alternate', tool: 'Cargar Imagen', state: true, color: 'secondary' },
    { icon: 'image', tool: 'Ver Imagen', state: true, color: 'secondary' },
    { icon: 'close', tool: 'Cancelar', state: true, color: 'secondary' },
    { icon: 'attach_money', tool: 'Ver Precios', state: true, color: 'secondary' },
    { icon: 'exit_to_app', tool: 'Salir', state: true, color: 'secondary' }
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private articulosService: ArticuloService,
    private filecontrolService: FilecontrolService,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; this.initForm() }

  async ngOnInit(): Promise<void> {
    this.spinner.show();
    await this.listarSubFamilias();
    await this.listarMarcas();
    await this.listarUnidadTipos();
    await this.listarCaracteristicas();

    /* #region  inicia suscripciones de cambios */
    this.changeMarca();
    this.changeNombre();
    this.changeCaracteristica();
    this.changePresentacion();
    this.changeTipoUnidad();
    /* #endregion */

    this.nIdArticulo = Number(this.route.snapshot.paramMap.get('id'));
    if (this.nIdArticulo) {
      this.obtenerArticulo(this.nIdArticulo);
    } else {

      this.form.patchValue({
        sCreacion: this.storageData.getLoginUsuario(),
        sModificacion: moment(new Date()).format("DD/MM/YYYY, h:mm:ss"),
        sEstado: 'Pendiente'
      })

      this.unBlock();
      this.spinner.hide();
    }

  }

  get hasIdArticulo(): boolean { return this.nIdArticulo ? true : false };

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
        this.guardar();
        break;
      case 1:
        this.unBlock();
        break;
      case 2:
        this.loadImage();
        break;
      case 3:
        this.fnVerImagen();
        break;
      case 4:
        this.fnReiniciarDetalle();
        break;
      case 5:
        this.fnDialogPreciosArticulo();
        break;
      case 6:
        this.salir();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab() {

    this.fbLista[0].state = !this.show;
    this.fbLista[1].state = this.hasIdArticulo && this.show;
    this.fbLista[2].state = !this.hasIdArticulo && !this.show;
    this.fbLista[3].state = this.hasIdArticulo;
    this.fbLista[4].state = this.hasIdArticulo && !this.show;
    this.fbLista[5].state = this.hasIdArticulo;
    this.fbLista[6].state = true;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  /* #region  Inicializa el formulario */
  initForm(): void {
    this.form = this.fb.group({
      sCategoria: ['Tecnología'],
      nIdSubFamilia: [{ value: '', disabled: true }, Validators.required],
      nIdMarca: [{ value: '', disabled: true }, Validators.required],
      nIdTipoDispositivo: [{ value: '', disabled: true }, Validators.required],
      sNombreProducto: [{ value: '', disabled: true }, Validators.required],
      sCaracteristica: [{ value: '', disabled: true }],
      sPresentacion: [{ value: '', disabled: true }],
      nIdPresenMedida: [{ value: '', disabled: true }, Validators.required],
      sCodArticulo: ['Por definir'],
      sCreacion: [''],
      sModificacion: [''],
      sEstado: ['Activo'],
      sDescripcion: [''],
      sArchivo: [''],
      sType: [''],
      sNumeroParte: [{ value: '', disabled: true }]
    });
  }
  /* #endregion */

  /* #region  FormControls */
  get nIdSubFamiliaField(): FormControl { return this.form.get('nIdSubFamilia') as FormControl };
  get nIdMarcaField(): FormControl { return this.form.get('nIdMarca') as FormControl };
  get sNombreProductoField(): FormControl { return this.form.get('sNombreProducto') as FormControl };
  get sCaracteristicaField(): FormControl { return this.form.get('sCaracteristica') as FormControl };
  get sPresentacionField(): FormControl { return this.form.get('sPresentacion') as FormControl };
  get nIdPresenMedidaField(): FormControl { return this.form.get('nIdPresenMedida') as FormControl };
  get sDescripcionField(): FormControl { return this.form.get('sDescripcion') as FormControl };
  get sArchivoField(): FormControl { return this.form.get('sArchivo') as FormControl };
  get sTypeField(): FormControl { return this.form.get('sType') as FormControl };
  get sNumeroParteField(): FormControl { return this.form.get('sNumeroParte') as FormControl };

  /* #endregion */

  /* #region  Validaciones */
  get nIdSubFamiliaError(): string {
    return this.nIdSubFamiliaField.hasError('required') && this.nIdSubFamiliaField.touched ? message.get('required') : null
  }
  get nIdMarcaError(): string {
    return this.nIdMarcaField.hasError('required') && this.nIdMarcaField.touched ? message.get('required') : null
  }
  get sNombreProductoError(): string {
    return this.sNombreProductoField.hasError('required') && this.nIdMarcaField.touched ? message.get('required') : null
  }
  get nIdPresenMedidaError(): string {
    return this.nIdPresenMedidaField.hasError('required') && this.nIdMarcaField.touched ? message.get('required') : null
  }
  get sNumeroParteError(): string {
    return  this.sNumeroParteField.hasError('required') ? message.get('required') :
    this.sNumeroParteField.hasError('maxlength') ? message.get('LONG_MAX') + '50' : null;
  }
  /* #endregion */

  /* #region  Llenados de Combos */
  async listarSubFamilias(): Promise<void> {
    this.subFamilias = await this.articulosService.getAllItem(EArticulo.SUBFAMILIA);
  }
  async listarMarcas(): Promise<void> {
    this.marcas = await this.articulosService.getAllItem(EArticulo.MARCA);
  }
  async listarUnidadTipos(): Promise<void> {
    this.unidadTipos = await this.articulosService.getAllItem(EArticulo.TIPO_UNIDAD);
  }
  async listarCaracteristicas(): Promise<void> {
    this.caracteristicas = await this.articulosService.getAllItem(EArticulo.CARACTERISTICAS);
  }
  async listarTiposDispositivo(tipo: Number): Promise<void> {
    const nIdSubFamilia = this.form.get("nIdSubFamilia").value;
    this.tiposDispositivo = await this.articulosService.GetAllTipoDispositivo(nIdSubFamilia);
    this.bPartNumber = false;
    if (tipo == 1) { // Al ver el detalle
      this.form.get("nIdTipoDispositivo").setValue(null);
    }
  }
  /* #endregion */

  /* #region  Llenados de valores al obtener artículo */
  obtenerArticulo(nId: number): void {
    this.articulosService.getOne(this.storageData.getPais(), nId).finally(() => this.spinner.hide()).then(async res => {
      this.form.patchValue(res);
      this.componentes = res.componentes;
      this.sCodBarra = res.sCodBarra;
      this.sImagen = res.sImagen;
      this.sImagenActual = res.sImagen;
      await this.listarTiposDispositivo(2);
      this.fnNecesitaPartNumber(res.nIdTipoDispositivo)
      this.fnControlFab();
    });
  }
  /* #endregion */

  /* #region  Suscripciones a cambios de controles que forman la descripción del producto*/
  changeMarca(): void {
    this.nIdMarcaField.valueChanges.pipe(filter(value => value != '')).subscribe(value => {
      this.sMarca = this.marcas.find(item => item.nId == value).sDescripcion;
      const vDescripcion = `${this.sNombreProductoField.value} ${this.sMarca} ${this.sCaracteristicaField.value} ${this.sPresentacionField.value} ${this.sTipoUnidad}`;
      this.sDescripcionField.setValue(vDescripcion?.trim());
    })
  }
  changeNombre(): void {
    this.sNombreProductoField.valueChanges.subscribe(value => {
      const vDescripcion = `${value} ${this.sMarca} ${this.sCaracteristicaField.value} ${this.sPresentacionField.value} ${this.sTipoUnidad}`;
      this.sDescripcionField.setValue(vDescripcion?.trim());
    })
  }
  changeCaracteristica(): void {
    this.sCaracteristicaField.valueChanges.subscribe(value => {
      const vDescripcion = `${this.sNombreProductoField.value} ${this.sMarca} ${value} ${this.sPresentacionField.value} ${this.sTipoUnidad}`;
      this.sDescripcionField.setValue(vDescripcion?.trim());
    })
  }
  changePresentacion(): void {
    this.sPresentacionField.valueChanges.subscribe(value => {
      const vDescripcion = `${this.sNombreProductoField.value} ${this.sMarca} ${this.sCaracteristicaField.value} ${value} ${this.sTipoUnidad}`;
      this.sDescripcionField.setValue(vDescripcion?.trim());
    })
  }
  changeTipoUnidad(): void {
    this.nIdPresenMedidaField.valueChanges.pipe(filter(value => value != '')).subscribe(value => {
      this.sTipoUnidad = this.unidadTipos.find(item => item.nId == value).sDescripcion;
      const vDescripcion = `${this.sNombreProductoField.value} ${this.sMarca} ${this.sCaracteristicaField.value} ${this.sPresentacionField.value} ${this.sTipoUnidad}`;
      this.sDescripcionField.setValue(vDescripcion?.trim());
    })
  }
  /* #endregion */

  /* #region  Retorna al listado de artículos */
  salir(): void { this.router.navigate(['til/tecnologia/ti-articulo']) }
  /* #endregion */

  /* #region  Guarda o actualiza un artículo */
  async guardar() {
    if (this.form.invalid) {
      this.fnControlFab(); // Actualizar menu de botones
      return Object.values(this.form.controls).forEach(control => { control.markAllAsTouched() })
    }
    const request = this.form.value as ArticuloTI;
    request.sIdPais = this.storageData.getPais();
    request.nIdUser = this.storageData.getUsuarioId();
    request.componentes = this.compComponente.componentes;
    request.sCodBarra = this.compComponente.sCodBarraField.value;
    request.sImagen = this.sImagen;
    request.sCaracteristica = request.sCaracteristica == null ? '' : request.sCaracteristica;
    request.sPresentacion = request.sPresentacion == null ? '' : request.sPresentacion;
    request.sNumeroParte = (this.bPartNumber ? request.sNumeroParte : '')

    this.spinner.show();
    if (this.sArchivoField.value != '') {
      this.filecontrolService.fnUploadFile(this.sArchivoField.value, this.sTypeField.value, 3, this.url).subscribe(
        event => {
          if (event.type === HttpEventType.UploadProgress) {
          } else if (event.type === HttpEventType.Response) {
            let res: any = event.body;
            request.sImagen = res.filename;
            this.createOrUpdate(request);
          }
          this.fnControlFab(); // Actualizar menu de botones
        }, (err) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error', title: ('Error'), text: `Hubo un error en la subida de imagen`, showConfirmButton: false, timer: 2000
          });
        }
      )
    } else {
      this.createOrUpdate(request);
      this.fnControlFab(); // Actualizar menu de botones
    }
  }
  /* #endregion */


  createOrUpdate(request: ArticuloTI): void {
    if (this.nIdArticulo) {
      this.articulosService.update(this.nIdArticulo, request).finally(() => this.spinner.hide()).then(
        async res => {
          if (res) {
            Swal.fire({
              icon: 'success', title: ('Correcto'), text: `Se actualizó el artículo de código\n${res}`, showConfirmButton: false, timer: 2000
            });
            this.fnReiniciarDetalle();
          } else {
            Swal.fire({
              icon: 'error', title: ('Error'), text: `Hubo un error en la transacción`, showConfirmButton: false, timer: 2000
            });
          }
        }
      );
    } else {
      this.articulosService.create(request).finally(() => this.spinner.hide()).then(
        res => {
          if (res) {
            Swal.fire({
              icon: 'success', title: ('Correcto'), text: `Se registró el artículo de código\n${res.result}`, showConfirmButton: false, timer: 2000
            });
            this.router.navigate(['til/tecnologia/ti-articulo-detalle', res.nIdArticulo]);
          } else {
            Swal.fire({
              icon: 'error', title: ('Error'), text: `Hubo un error en la transacción`, showConfirmButton: false, timer: 2000
            });
          }
        }
      );
    }
  }

  /* #region  Desbloquear y bloqueear controles de entrada */
  unBlock(): void {
    this.show = false;
    Object.values(this.form.controls).forEach(control => { control.enable() });
    Object.values(this.compComponente.form.controls).forEach(control => { control.enable() });
    this.fnControlFab(); // Actualizar menu de botones
  }

  fnBlock(): void {
    this.show = true;
    Object.values(this.form.controls).forEach(control => { control.disable() });
    Object.values(this.compComponente.form.controls).forEach(control => { control.disable() });
    this.fnControlFab(); // Actualizar menu de botones
  }
  /* #endregion */

  //#region Cancelar edicion

  fnReiniciarDetalle() {
    this.spinner.show();
    if (this.nIdArticulo) {
      this.fnBlock();
      this.obtenerArticulo(this.nIdArticulo);
    }
    else {
      this.salir();
    }
  }

  // Seleccionar la unidad de presentacion automaticamente
  fnUnidadPresentacionAutomatica() {
    if (this.nIdSubFamiliaField.value == 1793) {
      this.nIdPresenMedidaField.setValue(138);
    }
    else {
      this.nIdPresenMedidaField.setValue(1);
    }
  }

  fnLlenarNombreProductoDefecto() {
    const nombreActual = this.form.get("sNombreProducto").value.trim();
    if (this.tiposDispositivo.filter(e => e.sDescripcion === nombreActual).length > 0 || nombreActual == '' || nombreActual == null) {
      const tipoDispositivoActual = this.form.get("nIdTipoDispositivo").value;
      const nombreTipoDispositivo = this.tiposDispositivo.find((e) => e.nId == tipoDispositivoActual).sDescripcion;
      this.form.get("sNombreProducto").setValue(nombreTipoDispositivo);
    }
  }

  fnNecesitaPartNumber(nId: number) {
    let vTipo = this.tiposDispositivo.find(item => item.nId == nId);
    if (vTipo.nParam == 1) {
      this.bPartNumber = true;
      this.form.controls.sNumeroParte.setValidators([Validators.required, Validators.maxLength(50)]);
      this.form.controls.sNumeroParte.updateValueAndValidity();
    } else {
      this.bPartNumber = false;
      this.form.controls.sNumeroParte.setValidators([]);
      this.form.controls.sNumeroParte.updateValueAndValidity();
    }
  }

  fnDialogPreciosArticulo(){
    this.spinner.show(); // Inicio de spinner

    this.mostrarBotones = false; // Ocultar botones de opciones

    // Codigo y nombre del articulo
    const codigoArticulo = this.form.get("sCodArticulo").value;
    const nombreArticulo = this.form.get("sDescripcion").value;

    const dialogRef = this.dialog.open(TiArticuloPreciosComponent, {
      width: '1200px',
      autoFocus: false,
      disableClose: true,
      //backdropClass: 'backdropBackground',
      data: {
        nIdArticulo: this.nIdArticulo,
        sImagenActual: this.sImagenActual,
        sArticulo: `${codigoArticulo} - ${nombreArticulo}`
      }
    });

    dialogRef.beforeClosed().subscribe(result => {
      this.mostrarBotones = true;
    });
  }

  //#endregion

  loadImage(): void {
    this.dialog.open(TiArticuloImagenComponent, {
      disableClose: true,
      autoFocus: false,
      width: '500px'
    }).afterClosed().subscribe(result => {
      if (result) {
        this.sArchivoField.setValue(result.sArchivo);
        this.sTypeField.setValue(result.sType);
        this.fnControlFab(); // Actualizar menu de botones
      }
    });
  }

  fnVerImagen(): void {

    if (this.sImagenActual != null && this.sImagenActual != '') {
      const {
        sCodArticulo,
        sDescripcion,
      } = this.form.value;
      Swal.fire({ title: sCodArticulo, text: sDescripcion, imageUrl: this.sImagenActual, imageHeight: 250 });
    }
    else {
      Swal.fire({ icon: 'warning', title: ('No hay imagen'), text: `Este artículo no tiene imagen` });
    }

  }

  backSubFamilia(nId: number): void {
    this.nIdSubFamiliaField.setValue(nId);
  }
}
