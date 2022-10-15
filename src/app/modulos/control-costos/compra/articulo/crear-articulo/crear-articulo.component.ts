import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CompraService } from '../../compra.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';
import { FilecontrolService } from '../../../../../shared/services/filecontrol.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { VisorImagenComponent } from '../visor-imagen/visor-imagen.component';
import { DialogListaArticuloComponent } from '../dialog-lista-articulo/dialog-lista-articulo.component';
import { filter, finalize } from 'rxjs/operators';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';


@Component({
  selector: 'app-crear-articulo',
  templateUrl: './crear-articulo.component.html',
  styleUrls: ['./crear-articulo.component.css'],
  animations: [asistenciapAnimations]
})

export class CrearArticuloComponent implements OnInit {

  @Input() descripcionMarca: string;
  @Output() eventMarca = new EventEmitter<string>();

  selectedMarca = null;

  categoria: any[] = []
  subCategoria: any[] = []
  unidad: any[] = []
  unidadDes: any[] = []
  marca: any[] = []
  TipoComtrol: any[] = []
  rubro: any[] = []
  tipoVolumen: any[] = []; // Lista del combo para tipo de volumen
  pEntidad = 1; //Cabecera del movimiento
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pTipo = 1;       //Listar Solo Guias de ingreso
  pDetalle = []
  url: string;
  forma = new FormGroup({});
  disabled: boolean = false;
  disabled_Serivcio: boolean = false;

  disabled_seccion_uno: boolean = true;
  disabled_seccion_dos: boolean = true;
  esLogistico: boolean = true;
  vActivo: boolean = true;

  formArhivo: FormGroup;
  marcaDesc: string = "";
  calUnidad: string = "";
  progreso
  vArchivoSeleccioado = File;
  filestring: string;
  urlBarra: string;
  idParametro: number = 0;
  sImagen: string;
  scodigoQR: string;
  vNameRutaFile: string;
  esServicio: boolean = false;
  articuloRepetido: number = 0;
  form: FormGroup;
  estado: number = 0 // numero para evaluar si es nuevo o editado : 0 Nuevo - 1 Vista - 2 Editar
  mostrarSubir: boolean = false // boolean para mostrar o ocultar el subir imagen
  lista = [];
  filteredArticulo: any = [];

  empresa: any;
  pPais: string;
  idUser: number; //id del usuario

  // Booleano para ver si se esta usando en celular
  vDispEsCelular = false;

  //Variables para los permisos
  nAgregar: number = 0;
  nDuplicar: number = 0;
  nModificar: number = 0;
  acordeonMedida: boolean = false;
  acordeonSecundario: boolean = false;
  acordeonTerciario: boolean = false;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'save', tool: 'Grabar', state: true, color: 'secondary'},
    {icon: 'close', tool: 'Cancelar', state: true, color: 'secondary'},
    {icon: 'edit', tool: 'Editar', state: true, color: 'secondary'},
    {icon: 'print', tool: 'Imprimir Código QR', state: true, color: 'secondary'},
    {icon: 'print', tool: 'Imprimir Código QR', state: true, color: 'secondary'}, // Impresion de celular 
    {icon: 'check', tool: 'Activar', state: true, color: 'secondary'},
    {icon: 'block', tool: 'Inactivar', state: true, color: 'secondary'},
    {icon: 'file_copy', tool: 'Copiar', state: true, color: 'secondary'},
    {icon: 'image', tool: 'Ver Foto', state: true, color: 'secondary'},
    {icon: 'exit_to_app', tool: 'Salir', state: true, color: 'warn'},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  mayorCero(control: AbstractControl): { [key: string]: boolean } | null {

    if (control.value == 0) {
      return { 'mayor0': true };
    }
    return null;
  }

  initForm(): void {
    this.form = this.fb.group({
      categoria: ['', [Validators.required]],
      subCategoria: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      sCodArticulo: [''],
      producto: ['', [Validators.required, this.customCaracterValidator]],
      caracteristica: ['', [Validators.required, this.customCaracterValidator]],
      presentacion: ['', [Validators.required, this.customCaracterValidator]],
      unidadPresenta: ['', [Validators.required]],
      descripcion: [''],
      rubro: ['', [Validators.required]],
      UnidadMedida: ['', [Validators.required]],
      tipoControl: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      pesokgr: ['', [Validators.required, this.mayorCero]],
      Largo: ['', [Validators.required, this.mayorCero]],
      Ancho: ['', [Validators.required, this.mayorCero]],
      Alto: ['', [Validators.required, this.mayorCero]],
      Volumen: ['', [Validators.required, this.mayorCero]],
      checksecundario: [false],
      unidad2: ['', [Validators.required, this.mayorCero]],
      cantidad: ['', [Validators.required, this.mayorCero]],
      peso2: ['', [Validators.required, this.mayorCero]],
      Largo2: ['', [Validators.required, this.mayorCero]],
      Ancho2: ['', [Validators.required, this.mayorCero]],
      Alto2: ['', [Validators.required, this.mayorCero]],
      base: ['', [Validators.required, this.mayorCero]],
      Volumen2: ['', [Validators.required, this.mayorCero]],
      checkterciario: [false],
      unidad3: ['', [Validators.required, this.mayorCero]],
      cantidad3: ['', [Validators.required, this.mayorCero]],
      peso3: ['', [Validators.required, this.mayorCero]],
      Largo3: ['', [Validators.required, this.mayorCero]],
      Ancho3: ['', [Validators.required, this.mayorCero]],
      Alto3: ['', [Validators.required, this.mayorCero]],
      base3: ['', [Validators.required, this.mayorCero]],
      Volumen3: ['', [Validators.required, this.mayorCero]],
      ParteOrginal: [''],
      codigoBarra: ['', [Validators.required]],
      creado: [''],
      modificado: [''],
      estado: [''],
    })
  }

  constructor(
    private spinner: NgxSpinnerService,
    private rutas: CompraService,
    @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder,
    private vFilecontrolService: FilecontrolService,
    private route: ActivatedRoute,
    private navegation: Router,
    public dialog: MatDialog
  ) { this.url = baseUrl; this.initForm() }


  ngOnInit(): void {
    this.empresa = localStorage.getItem("Empresa");
    this.pPais = localStorage.getItem('Pais');
    let user = localStorage.getItem('currentUser');
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;

    // Detectamos el dispositivo (Mobile o PC)
    this.fnDetectarDispositivo();

    this.listaCategoria();
    this.listaUnidad();
    this.listaTipoControl();
    this.listaMarca();
    this.listaRubro();
    this.listaUnidadPrest();
    this.listaTipoVolumen();
    this.formArhivo = this.fb.group({
      fileUpload: ['', Validators.required]
    });

    this.fnTipoUsuario(); //Verficamos el perfil del usuario
    this.traerPermisos();
    this.route.params.subscribe(params => {
      if (params['id'] != 0) //Cuando el registro de articulo/Servicio existe y esta modificando
      {
        this.idParametro = params['id']
        this.obtenerData(params['id'])
        // this.fnUsuarioNoLogistico(); //Verficamos el perfil del personal para definir si debe ingresar todos los campos
      }
      else //Cuando el registro de articulo/Servicio es nuevo y resta registrando.
      {
        this.estado = 0;
        this.mostrarSubir = false;
        this.bloquearEmpaque2();
        this.bloquearEmpaque3();
        this.form.get('checkterciario').disable();
        this.form.controls['estado'].setValue('Pendiente');
        // this.fnUsuarioNoLogistico(); //Verficamos el perfil del personal para definir si debe ingresar todos los campos
      }
      this.fnControlFab();
    })
    this.fnListarArticulos();
    this.fnChangesCodigoBarras();
    this.fnControlFab();
  }

  //#region Botones

  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
  }

  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.grabar();
        break;
      case 1:
        this.cancelar();
        break;
      case 2:
        this.editar();
        break;
      case 3:
        this.fnImprimirCodigoQR();
        break;
      case 4:
        this.fnImprimirCelularCodigoQR();
        break;
      case 5:
        this.fnEstadoArticulo(1);
        break;
      case 6:
        this.fnEstadoArticulo(2);
        break;
      case 7:
        this.fnDuplicarArticulo();
        break;
      case 8:
        this.verImagen();
        break;
      case 9:
        this.cerrar();
        break;
      default:
        break;
    }
  }

  fnControlFab(){

    this.fbLista[0].state = this.estado == 2 || this.estado == 0; // Grabar
    this.fbLista[1].state = this.estado == 2; // Cancelar
    this.fbLista[2].state = this.estado == 1 && this.nModificar == 1; // Editar
    this.fbLista[3].state = (this.estado == 2 || this.estado == 1) && this.scodigoQR != '' && !this.vDispEsCelular; // Imprimir Codigo QR PC
    this.fbLista[4].state = (this.estado == 2 || this.estado == 1) && this.scodigoQR != '' && this.vDispEsCelular; // Imprimir Codigo QR Celular
    this.fbLista[5].state = !this.vActivo && this.estado == 1; // Activar 
    this.fbLista[6].state = this.vActivo && this.estado == 1; // Inactivar
    this.fbLista[7].state = this.estado == 1 && this.nDuplicar == 1; // Copiar
    this.fbLista[8].state = this.estado == 1 && !this.esServicio; // Ver Foto

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  fnChangesCodigoBarras(): void {
    this.form.get('codigoBarra').valueChanges.pipe(filter((res: string) => res.includes(' '))).subscribe(value => {
      const trimmed = value.replace(/\s+/g, '').trim();
      this.form.get('codigoBarra').setValue(trimmed, { emitEvent: false });
    });
  }

  fnTipoUsuario = function () {
    this.pParametro = [];
    this.pParametro.push(this.empresa);
    this.pParametro.push(this.idUser);
    this.rutas.fnDatosArticulo(1, 1, this.pParametro, 6, this.url).subscribe(data => {
      // debugger;
      if (data == 0) {
        Swal.fire({ title: '¡Atención!', text: 'EL usuario actual no cuenta con perfil en la empresa seleccionada', icon: 'warning' });
      }
      else if (data != 614) //Cuando el perfil del usuario es diferente a Logistico
      {
        this.esLogistico = false;
      }
      this.fnUsuarioNoLogistico(); //Verficamos el perfil del personal para definir si debe ingresar todos los campos

      this.fnControlFab();
    });
  }

  fnUsuarioNoLogistico = function () {

    if (!this.esLogistico) //Cuando el perfil del usuario es diferente a Logistico
    {
      // this.form.get('unidadPresenta').setValue(1),
      // this.form.get('UnidadMedida').setValue(1)
      // this.form.get('unidadPresenta').disable();
      // this.form.get('UnidadMedida').disable();

      this.form.get('tipoControl').disable();
      this.form.get('tipo').disable();
      this.form.get('pesokgr').disable();
      this.form.get('Largo').disable();
      this.form.get('Ancho').disable();
      this.form.get('Alto').disable();
      this.form.get('Volumen').disable();

      this.form.get('checksecundario').disable();
      this.bloquearEmpaque2();
      this.form.get('checkterciario').disable();
      this.bloquearEmpaque3();

      this.form.get('ParteOrginal').disable();
      this.form.get('codigoBarra').disable();
    }

    this.fnControlFab();
  }

  fnListarArticulos = function () {

    var pParametro = []; //Parametros de campos vacios
    pParametro.push(this.pPais);

    this.rutas.fnDatosArticulo(1, 2, pParametro, 1, this.url).subscribe(
      res => {
        const lst = res ? res : [];
        const vCodArticulo = this.form.get('sCodArticulo').value;
        this.lista = lst.filter(item => item.codigo != vCodArticulo)
      },
      err => {
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );

  }

  // crear-articulo.component.ts:188 armado  alianza p Armado ALIANZA Armado ALIANZA profesional hola
  async fnController() {

    if (this.form.get("descripcion").value != "" && this.form.get('descripcion').value.length > 2) {
      this.filteredArticulo = this._filterCentroCosto(this.form.get("descripcion").value)

    } else {
      this.filteredArticulo = [];
    }
    this.articuloRepetido = this.filteredArticulo.length;
  }

  private _filterCentroCosto(value: string): any[] {
    const filterValue = value.toLowerCase().trim();

    return this.lista.filter(
      cli => cli.nombre.toLowerCase().includes(filterValue) && cli.codigo != this.form.get('sCodArticulo').value
    );
  }

  bloquearEmpaque2(): void {
    this.form.get('unidad2').disable();
    this.form.get('cantidad').disable();
    this.form.get('peso2').disable();
    this.form.get('Largo2').disable();
    this.form.get('Ancho2').disable();
    this.form.get('Alto2').disable();
    this.form.get('base').disable();
    this.form.get('Volumen2').disable();
  }

  bloquearEmpaque3(): void {
    this.form.get('unidad3').disable();
    this.form.get('cantidad3').disable();
    this.form.get('peso3').disable();
    this.form.get('Largo3').disable();
    this.form.get('Ancho3').disable();
    this.form.get('Alto3').disable();
    this.form.get('base3').disable();
    this.form.get('Volumen3').disable();
  }

  habilitarEmpaque2(): void {
    this.form.get('unidad2').enable();
    this.form.get('cantidad').enable();
    this.form.get('peso2').enable();
    this.form.get('Largo2').enable();
    this.form.get('Ancho2').enable();
    this.form.get('Alto2').enable();
    this.form.get('base').enable();
    this.form.get('Volumen2').enable();
  }

  habilitarEmpaque3(): void {
    this.form.get('unidad3').enable();
    this.form.get('cantidad3').enable();
    this.form.get('peso3').enable();
    this.form.get('Largo3').enable();
    this.form.get('Ancho3').enable();
    this.form.get('Alto3').enable();
    this.form.get('base3').enable();
    this.form.get('Volumen3').enable();
  }

  OnChangeOne(event: any) {

    if (event.checked == true) {

      this.habilitarEmpaque2();
      this.form.get('checkterciario').enable();
    } else {

      this.form.get('unidad2').setValue('');
      this.form.get('cantidad').setValue('');
      this.form.get('peso2').setValue('');
      this.form.get('Largo2').setValue('');
      this.form.get('Ancho2').setValue('');
      this.form.get('Alto2').setValue('');
      this.form.get('base').setValue('');
      this.form.get('Volumen2').setValue('');

      this.bloquearEmpaque2();

      this.form.get('checkterciario').disable();
      this.form.get('checkterciario').setValue(false);
      this.form.get('unidad3').setValue('');
      this.form.get('cantidad3').setValue('');
      this.form.get('peso3').setValue('');
      this.form.get('Largo3').setValue('');
      this.form.get('Ancho3').setValue('');
      this.form.get('Alto3').setValue('');
      this.form.get('base3').setValue('');
      this.form.get('Volumen3').setValue('');
      this.bloquearEmpaque3();

    }

  }

  OnChangetwo(event: any) {
    if (event.checked == true) {

      this.habilitarEmpaque3();

    } else {

      this.form.get('unidad3').setValue('');
      this.form.get('cantidad3').setValue('');
      this.form.get('peso3').setValue('');
      this.form.get('Largo3').setValue('');
      this.form.get('Ancho3').setValue('');
      this.form.get('Alto3').setValue('');
      this.form.get('base3').setValue('');
      this.form.get('Volumen3').setValue('');

      this.bloquearEmpaque3();

    }

  }

  listaCategoria() {
    this.pOpcion = 2
    this.pTipo = 2;
    this.pParametro = [];
    this.pParametro.push(this.pPais);

    this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.categoria = data

    })
  }

  listaSubCategoria(evento) {

    // Limpiamos la subcategoria
    this.form.get("subCategoria").setValue(null);
    this.form.get("subCategoria").markAsUntouched();

    //this.esServicio = false
    this.pParametro = []
    this.pOpcion = 2
    this.pTipo = 3;
    this.pParametro.push(evento)

    this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.subCategoria = data

      let service = this.categoria.find(element => element.nId == evento); // obtengo los atributos del elemento seleccionado
      //debugger;
      if (this.estado != 1) {

        if (service.sparam > 0) { // Indica que es servicio por el flag sparm
          this.esServicio = true
          // Bloque los inputs
          this.form.get('unidadPresenta').disable();
          this.form.get('UnidadMedida').disable();
          this.form.get('tipoControl').disable();
          this.form.get('tipo').disable();
          this.form.get('pesokgr').disable();
          this.form.get('Largo').disable();
          this.form.get('Ancho').disable();
          this.form.get('Alto').disable();
          this.form.get('Volumen').disable();

          this.form.get('checksecundario').disable();
          this.bloquearEmpaque2();
          this.form.get('checkterciario').disable();
          this.bloquearEmpaque3();

          this.form.get('ParteOrginal').disable();
          this.form.get('codigoBarra').disable();

          // Limpiar los valores
          this.form.get('pesokgr').setValue('');
          this.form.get('Largo').setValue('');
          this.form.get('Ancho').setValue('');
          this.form.get('Alto').setValue('');
          this.form.get('Volumen').setValue('');
          this.form.get('unidadPresenta').setValue(1),
            this.form.get('UnidadMedida').setValue(1)
          this.form.get('checksecundario').setValue(false);
          this.form.get('unidad2').setValue('');
          this.form.get('cantidad').setValue('');
          this.form.get('peso2').setValue('');
          this.form.get('Largo2').setValue('');
          this.form.get('Ancho2').setValue('');
          this.form.get('Alto2').setValue('');
          this.form.get('base').setValue('');
          this.form.get('Volumen2').setValue('');
          this.form.get('checkterciario').setValue(false);
          this.form.get('unidad3').setValue('');
          this.form.get('cantidad3').setValue('');
          this.form.get('peso3').setValue('');
          this.form.get('Largo3').setValue('');
          this.form.get('Ancho3').setValue('');
          this.form.get('Alto3').setValue('');
          this.form.get('base3').setValue('');
          this.form.get('Volumen3').setValue('');

          this.form.get('ParteOrginal').setValue('');
          this.form.get('codigoBarra').setValue('');


        }
        else {
          this.esServicio = false;

          if (this.esLogistico)//Solo si es Logistico se habilitan los campos mas especificos
          {
            // Desbloquear los inputs
            this.form.get('unidadPresenta').enable();
            this.form.get('UnidadMedida').enable();
            this.form.get('tipoControl').enable();
            this.form.get('tipo').enable();
            this.form.get('pesokgr').enable();
            this.form.get('Largo').enable();
            this.form.get('Ancho').enable();
            this.form.get('Alto').enable();

            this.form.get('checksecundario').enable();
            this.form.get('ParteOrginal').enable();
            this.form.get('codigoBarra').enable();
          }
        }

      }

    })
  }

  listaUnidad() {
    this.pOpcion = 2
    this.pTipo = 4;
    this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.unidad = data
    })

  }

  listaUnidadPrest() {
    this.pOpcion = 2
    this.pTipo = 8;
    this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.unidadDes = data

    })
  }

  listaTipoControl() {
    this.pOpcion = 2
    this.pTipo = 5;
    this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.TipoComtrol = data
      //console.log(this.TipoComtrol)
    })
  }

  listaMarca() {
    this.pOpcion = 2
    this.pTipo = 6;
    this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      this.marca = data
    })
  }

  listaRubro() {
    this.pOpcion = 2
    this.pTipo = 7;
    this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {

      this.rubro = data
    })
  }

  listaTipoVolumen() {
    this.pOpcion = 2
    this.pTipo = 9;
    this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
      //console.log(data);
      this.tipoVolumen = data
    })
  }


  largoVolumen(evento) {
    if (evento > 0) {
      let vValidacionDatos = this.form.value;
      let total = (evento * vValidacionDatos.Ancho * vValidacionDatos.Alto)
      // this.form.controls['Volumen'].setValue(total)
      this.form.controls['Volumen'].setValue((total * 100 / 100).toFixed(6))

    }

  }
  anchoVolumen(evento) {
    if (evento > 0) {
      let vValidacionDatos = this.form.value;
      let total = (vValidacionDatos.Largo * evento * vValidacionDatos.Alto)
      // this.form.controls['Volumen'].setValue(total)
      this.form.controls['Volumen'].setValue((total * 100 / 100).toFixed(6))
    }
  }
  altoVolumen(evento) {
    if (evento > 0) {
      let vValidacionDatos = this.form.value;
      let total = (vValidacionDatos.Largo * vValidacionDatos.Ancho * evento)
      // this.form.controls['Volumen'].setValue(total)
      this.form.controls['Volumen'].setValue((total * 100 / 100).toFixed(6))
    }
  }

  Dproducto(evento) {
    let descripcion = this.form.value;
    let concatenacion = evento.trim() + ' ' + this.marcaDesc.trim() + ' ' + descripcion.caracteristica.trim() + ' ' + descripcion.presentacion.trim() + ' ' + this.calUnidad.trim();

    this.form.controls['descripcion'].setValue(concatenacion.trim())
    this.fnController();
  }
  Dmarca(evento) {

    this.marca.forEach(element => {

      if (element.nId === evento) {
        evento = element.sDescripcion
      }

    });

    this.marcaDesc = evento
    let descripcion = this.form.value;
    let concatenacion = descripcion.producto.trim() + ' ' + this.marcaDesc.trim() + ' ' + descripcion.caracteristica.trim() + ' ' + descripcion.presentacion.trim() + ' ' + this.calUnidad.trim()
    this.form.controls['descripcion'].setValue(concatenacion.trim())
    this.fnController();
  }
  smarca(evento) {
    this.marcaDesc = evento
    let descripcion = this.form.value;
    let concatenacion = descripcion.producto.trim() + ' ' + this.marcaDesc.trim() + ' ' + descripcion.caracteristica.trim() + ' ' + descripcion.presentacion.trim() + ' ' + this.calUnidad.trim()
    this.form.controls['descripcion'].setValue(concatenacion.trim());
    this.fnController();
  }

  Dcarac(evento) {
    let descripcion = this.form.value;
    let concatenacion = descripcion.producto.trim() + ' ' + this.marcaDesc.trim() + ' ' + evento.trim() + ' ' + descripcion.presentacion.trim() + ' ' + this.calUnidad.trim()
    this.form.controls['descripcion'].setValue(concatenacion.trim());
    this.fnController();
  }

  Dpresentacion(evento) {
    let descripcion = this.form.value;
    let concatenacion = descripcion.producto.trim() + ' ' + this.marcaDesc.trim() + ' ' + descripcion.caracteristica.trim() + ' ' + evento.trim() + ' ' + this.calUnidad.trim()
    this.form.controls['descripcion'].setValue(concatenacion.trim());
    this.fnController();
  }

  Dunidad(evento) {

    this.unidad.forEach(element => {

      if (element.nId === evento) {
        evento = element.sDescripcion
      }

    });

    this.calUnidad = evento

    let descripcion = this.form.value;
    let concatenacion = descripcion.producto.trim() + ' ' + this.marcaDesc.trim() + ' ' + descripcion.caracteristica.trim() + ' ' + descripcion.presentacion.trim() + ' ' + this.calUnidad.trim()
    this.form.controls['descripcion'].setValue(concatenacion.trim())
    this.fnController();
  }

  sunidad(evento) {

    this.calUnidad = evento

    //  this.calUnidad = evento//evento.source.triggerValue
    let descripcion = this.form.value;
    let concatenacion = `${descripcion.producto}  ${this.marcaDesc} ${descripcion.caracteristica} ${descripcion.presentacion} ${this.calUnidad}`
    this.form.controls['descripcion'].setValue(concatenacion.trim())
  }

  /* realizar calculos de empaque nuermo 2*/
  calLargo2(termino) {
    if (termino > 0) {
      let vValidacionDatos = this.form.value;
      var ancho2 = parseFloat(vValidacionDatos.Ancho2 == "" ? 1 : vValidacionDatos.Ancho2);
      var largo2 = parseFloat(termino == "" ? 1 : termino);
      var alto2 = parseFloat(vValidacionDatos.Alto2 == "" ? 1 : vValidacionDatos.Alto2);

      let total = ancho2 * largo2 * alto2
      let base = ancho2 * largo2

      // this.form.controls['Volumen2'].setValue(total)
      // this.form.controls['base'].setValue(base)
      this.form.controls['Volumen2'].setValue((total * 100 / 100).toFixed(6))
      this.form.controls['base'].setValue((base * 100 / 100).toFixed(6))
    }
  }
  calancho2(termino) {
    if (termino > 0) {
      let vValidacionDatos = this.form.value;
      var Largo2 = parseFloat(vValidacionDatos.Largo2 == "" ? 1 : vValidacionDatos.Largo2);
      var ancho2 = parseFloat(termino == "" ? 1 : termino);
      var alto2 = parseFloat(vValidacionDatos.Alto2 == "" ? 1 : vValidacionDatos.Alto2);


      let total = ancho2 * Largo2 * alto2
      let base = Largo2 * ancho2

      // this.form.controls['Volumen2'].setValue(total)
      // this.form.controls['base'].setValue(base)
      this.form.controls['Volumen2'].setValue((total * 100 / 100).toFixed(6))
      this.form.controls['base'].setValue((base * 100 / 100).toFixed(6))
    }
  }
  calalto2(termino) {
    if (termino > 0) {
      let vValidacionDatos = this.form.value;
      var Largo2 = parseFloat(vValidacionDatos.Largo2 == "" ? 1 : vValidacionDatos.Largo2);
      var ancho2 = parseFloat(vValidacionDatos.Ancho2 == "" ? 1 : vValidacionDatos.Ancho2);
      var alto2 = parseFloat(termino == "" ? 1 : termino);

      let total = ancho2 * Largo2 * alto2
      // this.form.controls['Volumen2'].setValue(total)
      this.form.controls['Volumen2'].setValue((total * 100 / 100).toFixed(6))

    }
  }

  /*fin */
  calLargo3(termino) {

    if (termino > 0) {
      let vValidacionDatos = this.form.value;
      var ancho3 = parseFloat(vValidacionDatos.Ancho3 == "" ? 1 : vValidacionDatos.Ancho3);
      var largo3 = parseFloat(termino == "" ? 1 : termino);
      var alto3 = parseFloat(vValidacionDatos.Alto3 == "" ? 1 : vValidacionDatos.Alto3);

      let total = ancho3 * largo3 * alto3
      let base = ancho3 * largo3

      this.form.controls['Volumen3'].setValue((total * 100 / 100).toFixed(6))
      this.form.controls['base3'].setValue((base * 100 / 100).toFixed(6))
    }
  }
  calancho3(termino) {
    if (termino > 0) {
      let vValidacionDatos = this.form.value;
      var Largo3 = parseFloat(vValidacionDatos.Largo3 == "" ? 1 : vValidacionDatos.Largo3);
      var ancho3 = parseFloat(termino == "" ? 1 : termino);
      var alto3 = parseFloat(vValidacionDatos.Alto3 == "" ? 1 : vValidacionDatos.Alto3);


      let total = ancho3 * Largo3 * alto3
      let base = Largo3 * ancho3
      this.form.controls['Volumen3'].setValue((total * 100 / 100).toFixed(6))
      this.form.controls['base3'].setValue((base * 100 / 100).toFixed(6))
      // this.form.controls['Volumen3'].setValue(total)
      // this.form.controls['base3'].setValue(base)
    }
  }
  calalto3(termino) {
    if (termino > 0) {
      let vValidacionDatos = this.form.value;
      var Largo3 = parseFloat(vValidacionDatos.Largo3 == "" ? 1 : vValidacionDatos.Largo3);
      var ancho3 = parseFloat(vValidacionDatos.Ancho3 == "" ? 1 : vValidacionDatos.Ancho3);
      var alto3 = parseFloat(termino == "" ? 1 : termino);


      let total = ancho3 * Largo3 * alto3
      // this.form.controls['Volumen3'].setValue(total)
      this.form.controls['Volumen3'].setValue((total * 100 / 100).toFixed(6))
    }
  }

  EvitarNegativo(numero: any) {

    let repartir: any;

    if (numero == 1) {
      repartir = this.form.get('pesokgr').value //this.form.controls.pesokgr.value;
      repartir = Math.abs(repartir);
      this.form.controls.pesokgr.setValue(repartir);
    }
    if (numero == 2) {
      repartir = this.form.controls.Largo.value;
      repartir = Math.abs(repartir);
      this.form.controls.Largo.setValue(repartir);
    }
    if (numero == 3) {
      repartir = this.form.controls.Ancho.value;
      repartir = Math.abs(repartir);
      this.form.controls.Ancho.setValue(repartir);
    }
    if (numero == 4) {
      repartir = this.form.controls.Alto.value;
      repartir = Math.abs(repartir);
      this.form.controls.Alto.setValue(repartir);
    }
    if (numero == 5) {
      repartir = this.form.controls.cantidad.value;
      repartir = Math.trunc(Math.abs(repartir));
      this.form.controls.cantidad.setValue(repartir);
    }
    if (numero == 6) {
      repartir = this.form.controls.peso2.value;
      repartir = Math.abs(repartir);
      this.form.controls.peso2.setValue(repartir);
    }
    if (numero == 7) {
      repartir = this.form.controls.Largo2.value;
      repartir = Math.abs(repartir);
      this.form.controls.Largo2.setValue(repartir);
    }
    if (numero == 8) {
      repartir = this.form.controls.Ancho2.value;
      repartir = Math.abs(repartir);
      this.form.controls.Ancho2.setValue(repartir);
    }
    if (numero == 9) {
      repartir = this.form.controls.Alto2.value;
      repartir = Math.abs(repartir);
      this.form.controls.Alto2.setValue(repartir);
    }
    if (numero == 10) {
      repartir = this.form.controls.cantidad3.value;
      repartir = Math.trunc(Math.abs(repartir));
      this.form.controls.cantidad3.setValue(repartir);
    }
    if (numero == 11) {
      repartir = this.form.controls.peso3.value;
      repartir = Math.abs(repartir);
      this.form.controls.peso3.setValue(repartir);
    }
    if (numero == 12) {
      repartir = this.form.controls.Largo3.value;
      repartir = Math.abs(repartir);
      this.form.controls.Largo3.setValue(repartir);
    }
    if (numero == 13) {
      repartir = this.form.controls.Ancho3.value;
      repartir = Math.abs(repartir);
      this.form.controls.Ancho3.setValue(repartir);
    }
    if (numero == 14) {
      repartir = this.form.controls.Alto3.value;
      repartir = Math.abs(repartir);
      this.form.controls.Alto3.setValue(repartir);
    }
    if (numero == 15) {
      repartir = this.form.controls.base3.value;
      repartir = Math.abs(repartir);
      this.form.controls.base3.setValue(repartir);
    }
    if (numero == 16) {
      repartir = this.form.controls.Volumen3.value;
      repartir = Math.abs(repartir);
      this.form.controls.Volumen3.setValue(repartir);
    }
  }

  //Bloque para crear codigo QR en memoria y pasarlo al Azure container
  async guardarCodigo() {

    //registrar codigo de barra
    let vValidacionDatos = this.form.value;
    this.pParametro = []
    this.pEntidad = 3
    this.pOpcion = 0
    this.pTipo = 0
    this.pParametro.push(vValidacionDatos.codigoBarra)
    // this.spinner.show();

    //Creamos el codigo QR
    await this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).toPromise().then((data) => {

      this.urlBarra = data.url //tenemos la respuesta de una ruta temporal con el archivo de imagen de codigo QR en memoria
      this.filestring = null;
    })

    //Subir a Azure el codigo QR
    await this.vFilecontrolService.fnUploadFileIMG(null, this.urlBarra, 3, this.url).toPromise().then(
      (event) => {
        //console.log(event)
        if (event.type === HttpEventType.UploadProgress) {
          this.progreso = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          let res: any = event.body;
          if (res.filename) {
            this.scodigoQR = res.filename // nos devuelve la ruta del contenedor de Azure ejemplo: https://luckyerp.blob.core.windows.net/
          }
        }
      },
      err => {
        console.log(err);
      },
    )

  }

  //grabar los datos de la imagen a BD considerando la creacion del codigo de barra, de acuerdo si fue ingresado
  async guardaBaseDedatos() {
    let accion: string;
    let articulo: string;
    let vValidacionDatos = this.form.getRawValue();
    if (vValidacionDatos.codigoBarra != "") {
      await this.guardarCodigo();
    }

    //console.log(this.estado);
    this.pParametro = []
    this.pParametro.push(vValidacionDatos.subCategoria);          //1
    this.pParametro.push(vValidacionDatos.rubro);                 //2
    this.pParametro.push(vValidacionDatos.marca);                 //3
    this.pParametro.push(vValidacionDatos.producto)               //4
    this.pParametro.push(vValidacionDatos.caracteristica)         //5
    this.pParametro.push(vValidacionDatos.presentacion)           //6
    this.pParametro.push(vValidacionDatos.unidadPresenta)         //7
    this.pParametro.push(vValidacionDatos.ParteOrginal)           //8
    this.pParametro.push(vValidacionDatos.tipoControl)            //9
    this.pParametro.push(vValidacionDatos.UnidadMedida)           //10
    this.pParametro.push(vValidacionDatos.pesokgr)                //11
    this.pParametro.push(vValidacionDatos.Largo)                  //12
    this.pParametro.push(vValidacionDatos.Ancho)                  //13
    this.pParametro.push(vValidacionDatos.Alto)                   //14
    this.pParametro.push(this.scodigoQR) //Aca Asignamos nuestra nueva ruta de la imagen en Azure del Codigo QR generado //15
    this.pParametro.push(vValidacionDatos.codigoBarra)            //16
    this.pParametro.push(vValidacionDatos.unidad2)                //17
    this.pParametro.push(vValidacionDatos.cantidad)               //18
    this.pParametro.push(vValidacionDatos.peso2)                  //19
    this.pParametro.push(vValidacionDatos.Largo2)                 //20
    this.pParametro.push(vValidacionDatos.Ancho2)                 //21
    this.pParametro.push(vValidacionDatos.Alto2)                  //22
    this.pParametro.push(vValidacionDatos.unidad3)                //23
    this.pParametro.push(vValidacionDatos.cantidad3)              //24
    this.pParametro.push(vValidacionDatos.peso3)                  //25
    this.pParametro.push(vValidacionDatos.Largo3)                 //26
    this.pParametro.push(vValidacionDatos.Ancho3)                 //27
    this.pParametro.push(vValidacionDatos.Alto3)                  //28
    this.pParametro.push(this.idUser);                            //29

    if (this.estado == 2 || this.estado == 0) {
      if (this.estado == 2 && this.idParametro > 0) {
        this.pTipo = 3
        accion = 'modificó'
        this.pParametro.push(this.idParametro);                  //30 -- desde aca se deb ordenar ya que se esta enviando el idArticulo, seria mejor que se envie al final
      } else {
        this.pTipo = 1
        accion = 'registró'
      }
    }
    this.pParametro.push(this.pPais);                             //30 - 31
    this.pParametro.push(this.empresa);                           //31 - 32
    this.pParametro.push(vValidacionDatos.tipo);                  //32 - 33

    this.pEntidad = 1
    this.pOpcion = 1
    //registrar en la base de datos
    await this.rutas.fnDatosArticuloIMG(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).toPromise().then((result: any) => {
      //console.log(result);

      if (Number(result) > 0) {

        if (this.pTipo == 1)//Esta creando nuevo registro
        {
          this.idParametro = result;
        }

        this.obtenerData(this.idParametro);

        articulo = this.form.controls.sCodArticulo.value + ' - ' + this.form.controls.descripcion.value
        Swal.fire({
          icon: 'success',
          title: 'Se ' + accion,
          text: articulo,
        })

        this.acordeonMedida = false;
        this.acordeonSecundario = false;
        this.acordeonTerciario = false;

        this.fnControlFab();

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Problemas',
          text: 'comuniquese con el area de sistema',
        })
      }
    })
  }

  cerrar() {
    this.navegation.navigate(['/controlcostos/compra/lista-articulo'])
    this.idParametro = 0;
    this.fnControlFab();
  }

  async grabar() {

    if (this.form.invalid) {
      Swal.fire({ title: '¡Atencion!', text: 'Algunos campos son obligatorios, porfavor revisar', icon: 'warning' });
      Object.values(this.form.controls).forEach(controls => {
        controls.markAllAsTouched();
      });
      this.validarAcordeones();
      return;
    }

    let tipo: string;
    let Nombre: string = this.form.get('descripcion').value;
    let familia = this.form.get('categoria').value;
    let familiatotal = this.categoria.find(element => element.nId == familia);
    if (familiatotal.sparam > 0) {
      tipo = "Servicio"
    } else {
      tipo = "Artículo"
    }

    //Validamos si cuenta con empaque secundario
    let empaqueSec = this.form.get('checksecundario').value;
    //console.log('Ver: '+ empaqueSec);
    if (!empaqueSec && tipo == "Artículo" && this.esLogistico) //Pedira empaque secundario solo si es Logistico el usuario
    {
      Swal.fire('¡Verificar!', 'Debe indicar el segundo empaque del artículo, es importate para determinar espacios en el proceso de transporte', 'warning')
      return;
    }

    //debugger
    //Si es articulo evaluamos si cuenta con movimiento ya realizado, de acuerdo a eso no podra cambiar el tipo de lote
    if (tipo == "Artículo" && this.idParametro > 0) {
      if (! await this.TipoLoteUsado()) { return; }
    }

    if (this.form.get('sCodArticulo').value != "") {
      tipo = tipo + " " + this.form.get('sCodArticulo').value;
    }

    Swal.fire({
      title: '¿Desea guardar el ' + tipo + '?',
      text: Nombre,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardaBaseDedatos()
        this.fnControlFab();
      }
    })

    this.fnControlFab();
  }

  validarAcordeones(): void {
    if (this.form.get('pesokgr').invalid || this.form.get('Largo').invalid || this.form.get('Ancho').invalid || this.form.get('Alto').invalid || this.form.get('Volumen').invalid) {
      this.acordeonMedida = true;
    }
    if (this.form.get('unidad2').invalid || this.form.get('cantidad').invalid || this.form.get('peso2').invalid || this.form.get('Largo2').invalid || this.form.get('Ancho2').invalid || this.form.get('Alto2').invalid || this.form.get('base').invalid || this.form.get('Volumen2').invalid) {
      this.acordeonSecundario = true;
    }
    if (this.form.get('unidad3').invalid || this.form.get('cantidad3').invalid || this.form.get('peso3').invalid || this.form.get('Largo3').invalid || this.form.get('Ancho3').invalid || this.form.get('Alto3').invalid || this.form.get('base3').invalid || this.form.get('Volumen3').invalid) {
      this.acordeonTerciario = true;
    }
  }

  async TipoLoteUsado() {
    //debugger
    let param = [];
    let tipoLote = this.form.get('tipoControl').value
    param.push(this.idParametro)
    param.push(tipoLote)

    try {
      //Trae Valor mayor a cero si tiene movimiento en el lamacen
      var resp = await this.rutas.fnDatosArticulo(1, 1, param, 8, this.url).toPromise();
      if (resp > 0) {
        Swal.fire('¡Verificar!', 'No puede cambiar el tipo de lote del artículo, ya cuenta con movimiento en el almacén', 'warning');
        return false;
      }

    }
    catch (err) {
      console.log(err);
    }

    return true;

  }

  generar() {
    this.pParametro = []
    this.pEntidad = 3
    this.pOpcion = 0
    this.pTipo = 0
    let vValidacionDatos = this.forma.value;
    this.pParametro.push(vValidacionDatos.codigoBarra)
    this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {

      this.urlBarra = data.url
      this.filestring = null;
      this.vFilecontrolService.fnUploadFile(null, this.urlBarra, 3, this.url).subscribe(
        event => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progreso = Math.round((event.loaded / event.total) * 100);
          } else if (event.type === HttpEventType.Response) {
            let res: any = event.body;
            if (res.filename) {
              this.scodigoQR = res.filename
            }
          }

        },
        err => {
          console.log(err);
        },
        () => {
          this.spinner.hide();
        }
      )
    })
  }

  fnSeleccionarArchivo = function (event, lbl: any) {
    const allowedExtensions = /(.png|.jpg|.jpeg)$/i; // Especifica que extensiones están permitidas
    const file = this.formArhivo.get('fileUpload').value;
    if (!allowedExtensions.exec(file) && file) { // Valida la extensión en el nombre del archivo
      Swal.fire('Error:', 'Solo son permitidos archivos con las extensiones .png/.jpg/.jpeg', 'error');
      document.getElementById(lbl).innerHTML = 'Seleccione Foto:';
      this.formArhivo.reset();
      return;
    }

    this.vArchivoSeleccioado = event.target.files;
    this.progreso = 0;

    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    if (this.vArchivoSeleccioado.length != 0) {
      document.getElementById(lbl).innerHTML = this.vArchivoSeleccioado[0].name;
      reader.readAsBinaryString(this.vArchivoSeleccioado[0]);
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);
  }

  fnUploadFile() {
    if (!this.filestring) {
      Swal.fire('Seleccione Foto:', 'Debe seleccionar una foto para el artículo', 'warning');
    }
    else {
      this.spinner.show();
      if (this.vArchivoSeleccioado.length != 0) {
        this.vFilecontrolService.fnUploadFile(this.filestring, this.vArchivoSeleccioado[0].type, 3, this.url).pipe(finalize(() => this.spinner.hide())).subscribe(
          event => {

            if (event.type === HttpEventType.UploadProgress) {
              this.progreso = Math.round((event.loaded / event.total) * 100);
            } else if (event.type === HttpEventType.Response) {

              let res: any = event.body;
              if (res.filename) {
                this.sImagen = event['body']['filename']

                this.vNameRutaFile = res.filename;

                this.fnSaveFile()
              }
            }

          },
          (err) => {
            this.spinner.hide();
            console.log(err);
          }
        )
      }
    }
  }

  fnSaveFile() {
    this.spinner.show();
    this.pParametro = []
    this.pEntidad = 1
    this.pOpcion = 1
    this.pTipo = 4

    //let vValidacionDatos = this.forma.value;
    this.pParametro.push(this.idParametro)
    this.pParametro.push(this.vNameRutaFile)
    this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe(data => {
      document.getElementById('lblName').innerHTML = "Seleccione Archivo:";
      this.spinner.hide();
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Se Subio el archivo correctamente',
        showConfirmButton: false,
        timer: 1500
      });

    }, err => {
      console.log(err);
    },
      () => {
        this.spinner.hide();
      })
  }

  obtenerData(id: number) {
    //debugger;
    this.spinner.show();
    this.estado = 1;
    this.mostrarSubir = false;
    //console.log(id);
    this.pParametro = []
    this.pEntidad = 1
    this.pOpcion = 1
    this.pTipo = 2
    this.pParametro.push(id)
    this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe(data => {
      // console.log(data)

      // Llena la data al formulario
      this.form.controls['categoria'].setValue(data['nIdFamiliaBase']);

      if (data['nServicio'] == 1) { this.esServicio = true; } //Cuando Es servicio Actualizar variable de visualizacion controles
      if (data['nIdEstado'] != 589) { this.vActivo = false; } //Identificar el estado del artículo

      this.form.controls['rubro'].setValue(data['nIdRubro'])
      this.form.controls['marca'].setValue(data['nIdMarca'])
      this.form.controls['sCodArticulo'].setValue(data['sCodArticulo'])
      this.form.controls['producto'].setValue(data['sNombreProducto'])
      this.form.controls['caracteristica'].setValue(data['sCaracteristica'])
      this.form.controls['presentacion'].setValue(data['sPresentacion'])
      this.form.controls['unidadPresenta'].setValue(data['nIdPresenMedida'])
      this.form.controls['UnidadMedida'].setValue(parseInt(data['nIdUndMedida']))
      this.form.controls['tipoControl'].setValue(parseInt(data['nIdControlLote']))
      this.form.controls['tipo'].setValue(parseInt(data['nIdTipo']));
      this.form.controls['pesokgr'].setValue(data['nPesoUnd'])
      this.form.controls['Largo'].setValue(data['nLargoUnd'])
      this.form.controls['Ancho'].setValue(data['nAnchoUnd'])
      this.form.controls['Alto'].setValue(data['nAltoUnd'])
      this.form.controls['Volumen'].setValue(data['nVolumenMedida']);

      this.form.controls['unidad2'].setValue(data['nIdUM_EmpacSeg'] == 0 ? '' : data['nIdUM_EmpacSeg'])
      this.form.controls['cantidad'].setValue(data['nCant_EmpacSeg'] == 0 ? '' : data['nCant_EmpacSeg'])
      this.form.controls['peso2'].setValue(data['nPesoUnd_EmpacSeg'] == 0 ? '' : data['nPesoUnd_EmpacSeg'])
      this.form.controls['Largo2'].setValue(data['nLargoUnd_EmpacSeg'] == 0 ? '' : data['nLargoUnd_EmpacSeg'])
      this.form.controls['Ancho2'].setValue(data['nAnchoUnd_EmpacSeg'] == 0 ? '' : data['nAnchoUnd_EmpacSeg'])
      this.form.controls['Alto2'].setValue(data['nAltoUnd_EmpacSeg'] == 0 ? '' : data['nAltoUnd_EmpacSeg'])
      this.form.controls['base'].setValue(data['nBase_EmpacSeg'] == 0 ? '' : data['nBase_EmpacSeg'].toFixed(6))
      this.form.controls['Volumen2'].setValue(data['nVolumen_EmpacSeg'] == 0 ? '' : data['nVolumen_EmpacSeg'].toFixed(6))

      this.form.controls['unidad3'].setValue(data['nIdUM_EmpacTer'] == 0 ? '' : data['nIdUM_EmpacTer'])
      this.form.controls['cantidad3'].setValue(data['nCant_EmpacTer'] == 0 ? '' : data['nCant_EmpacTer'])
      this.form.controls['peso3'].setValue(data['nPesoUnd_EmpacTer'] == 0 ? '' : data['nPesoUnd_EmpacTer'])
      this.form.controls['Largo3'].setValue(data['nLargoUnd_EmpacTer'] == 0 ? '' : data['nLargoUnd_EmpacTer'])
      this.form.controls['Ancho3'].setValue(data['nAnchoUnd_EmpacTer'] == 0 ? '' : data['nAnchoUnd_EmpacTer'])
      this.form.controls['Alto3'].setValue(data['nAltoUnd_EmpacTer'] == 0 ? '' : data['nAltoUnd_EmpacTer'])
      this.form.controls['base3'].setValue(data['nBase_TercerSeg'] == 0 ? '' : data['nBase_TercerSeg'].toFixed(6))
      this.form.controls['Volumen3'].setValue(data['nVolumen_TercerSeg'] == 0 ? '' : data['nVolumen_TercerSeg'].toFixed(6))


      this.form.controls['ParteOrginal'].setValue(data['sParteOriginal']);
      this.form.controls['codigoBarra'].setValue(data['sCodBarra']);
      this.form.controls['estado'].setValue(data['sEstado']);

      this.scodigoQR = data['sRutaQr'];
      this.sImagen = data['sRutaArchivo'];

      this.sunidad(data['unidadPrestacion']);
      this.smarca(data['marca']);

      this.listaSubCategoria(data['nIdFamiliaBase'])
      // this.calLargo3(data['nLargoUnd_EmpacTer']);
      // this.calalto3(data['nAltoUnd_EmpacTer']);
      // this.calancho3(data['nAnchoUnd_EmpacTer']);
      this.form.controls['subCategoria'].setValue(data['nIdFamilia'])

      this.bloquearTodo();

      if (this.form.get('unidad2').value) {
        this.form.get('checksecundario').setValue(true);
      } else {
        this.bloquearEmpaque2();
      }

      if (this.form.get('unidad3').value) {
        this.form.get('checkterciario').setValue(true);
      } else {
        this.bloquearEmpaque3();
      }

      if (this.form.get('pesokgr').value == 0) {
        this.form.get('pesokgr').disable();
      }

      if (this.form.get('Largo').value == 0) {
        this.form.get('Largo').disable();
      }

      if (this.form.get('Ancho').value == 0) {
        this.form.get('Ancho').disable();
      }

      if (this.form.get('Alto').value == 0) {
        this.form.get('Alto').disable();
      }

      if (this.form.get('Volumen').value == 0) {
        this.form.get('Volumen').disable();
      }

      this.form.get('creado').setValue(data["nameUser"]);
      this.form.get('modificado').setValue(data["sUserModificado"]);

    })

    this.fnControlFab();
    this.spinner.hide();
  }

  bloquearTodo(): void {
    this.form.get('categoria').disable();
    this.form.get('subCategoria').disable();
    this.form.get('marca').disable();
    this.form.get('unidadPresenta').disable();
    this.form.get('rubro').disable();
    this.form.get('UnidadMedida').disable();
    this.form.get('tipoControl').disable();
    this.form.get('tipo').disable();

    this.form.get('checksecundario').disable();
    this.form.get('checkterciario').disable();
    this.form.get('unidad2').disable();
    this.form.get('unidad3').disable();
    this.disabled = true;

  }

  editar() {
    this.estado = 2; //Significa que esta editando el registro

    this.form.get('subCategoria').enable();
    this.form.get('marca').enable();
    this.form.get('unidadPresenta').enable();
    this.form.get('rubro').enable();
    this.form.get('UnidadMedida').enable();
    this.form.get('tipoControl').enable();

    this.disabled = false;

    let service = this.categoria.find(element => element.nId == this.form.get('categoria').value);
    if (service.sparam > 0) {
      this.form.get('ParteOrginal').disable();
      this.form.get('codigoBarra').disable();
      this.form.get('tipoControl').disable();
      this.form.get('UnidadMedida').disable();
      this.form.get('unidadPresenta').disable();
    } else {
      this.form.get('ParteOrginal').enable();
      this.form.get('codigoBarra').enable();
      this.form.get('tipoControl').enable();
      this.form.get('UnidadMedida').enable();
      this.form.get('unidadPresenta').enable();

    }

    this.form.get('checksecundario').enable();
    this.form.get('checkterciario').enable();

    if (this.form.get('unidad2').value) {
      this.form.get('checksecundario').enable();
      this.form.get('checksecundario').setValue(true);
      this.form.get('checkterciario').enable();

      this.form.get('unidad2').enable();
      this.form.get('cantidad').enable();
      this.form.get('peso2').enable();
      this.form.get('Largo2').enable();
      this.form.get('Ancho2').enable();
      this.form.get('Alto2').enable();

    } else {
      this.form.get('unidad2').disable();
      this.form.get('cantidad').disable();
      this.form.get('peso2').disable();
      this.form.get('Largo2').disable();
      this.form.get('Ancho2').disable();
      this.form.get('Alto2').disable();
    }

    if (this.form.get('unidad3').value) {
      this.form.get('checkterciario').enable();
      this.form.get('checkterciario').setValue(true);

      this.form.get('unidad3').enable();
      this.form.get('cantidad3').enable();
      this.form.get('peso3').enable();
      this.form.get('Largo3').enable();
      this.form.get('Ancho3').enable();
      this.form.get('Alto3').enable();
    }

    //debugger;
    //Validamos si cuenta con el Nivel de logistico

    if (this.esLogistico) {
      this.mostrarSubir = true; //Solo si es logistico sube la imagen del Artículo
      this.form.get('pesokgr').enable();
      this.form.get('Largo').enable();
      this.form.get('Ancho').enable();
      this.form.get('Alto').enable();
      this.form.get('tipo').enable();
    }
    else {
      this.form.get('pesokgr').disable();
      this.form.get('Largo').disable();
      this.form.get('Ancho').disable();
      this.form.get('Alto').disable();
      this.form.get('tipo').disable();
      this.form.get('tipoControl').disable();
      this.form.get('codigoBarra').clearValidators();
      this.form.get('codigoBarra').updateValueAndValidity();
    }

    this.fnControlFab();
  }

  cancelar(): void {
    Swal.fire({
      title: '¿Desea Cancelar?',
      text: "Se eliminarán los datos no guardados ¿Desea continuar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.obtenerData(this.idParametro);
      }
    })

    this.fnControlFab();
  }

  verImagen(): void {
    let parametro = [];
    parametro.push(this.idParametro);
    this.spinner.show();
    this.rutas.fnDatosArticulo(1, 1, parametro, 5, this.url).pipe(finalize(() => this.spinner.hide())).subscribe(
      data => {
        if (data.sRutaArchivo == "") {
          Swal.fire({ title: 'Este artículo no contiene una imagen', icon: 'warning' });
        } else {
          Swal.fire({
            title: data.sCodArticulo,
            text: data.sNombreProducto,
            imageUrl: data.sRutaArchivo,
            imageHeight: 250
          })
        }
        this.fnControlFab();
      }, () => { this.spinner.hide() }
    );
  }

  verListaArticulosExistente(): void {
    this.dialog.open(DialogListaArticuloComponent, {
      disableClose: true, autoFocus: false, width: '900px', height: 'auto', data: this.filteredArticulo
    }).afterClosed().subscribe((result: string) => {
      if (result) { }
    });
  }

  fnImprimirCodigoQR(): void {
    const pdfFrame = document.getElementById('pdf-frame') as HTMLIFrameElement;
    const reporte = document.getElementById('print-rq').outerHTML;
    pdfFrame.contentWindow.document.open();
    pdfFrame.contentWindow.document.write(reporte);
    pdfFrame.contentWindow.document.close();
    pdfFrame.contentWindow.document.title = 'Codigo QR Articulo: ' + this.form.get("producto").value;
    pdfFrame.contentWindow.print();
  }

  fnImprimirCelularCodigoQR(): void {
    const divText = document.getElementById("print-rq").outerHTML;
    const myWindow = window.open('', '', 'width=985,height=1394');
    const doc = myWindow.document;
    doc.open();
    doc.write(divText);
    doc.close();
    doc.title = 'Codigo QR Articulo: ' + this.form.get("producto").value;

    this.fnControlFab();
  }

  fnDetectarDispositivo() {
    const dispositivo = navigator.userAgent;
    console.log(dispositivo);

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(dispositivo)) {
      this.vDispEsCelular = true;
    }
    else {
      this.vDispEsCelular = false;
    }
  }

  fnEstadoArticulo = function (nTipo: any) {

    this.pParametro = [];
    this.pParametro.push(this.idParametro);
    this.pParametro.push(nTipo);

    this.rutas.fnDatosArticulo(1, 1, this.pParametro, 7, this.url).subscribe(data => {

      if (data > 0) {

        if (nTipo == 1) {
          this.vActivo = true;
          this.form.controls['estado'].setValue('Activo');
          Swal.fire({
            title: '¡Atención!',
            text: 'Se cambio el estado del registro a "Activo"',
            icon: 'warning'
          });
        }
        else if (nTipo == 2) {
          this.vActivo = false;
          this.form.controls['estado'].setValue('Inactivo');
          Swal.fire({
            title: '¡Atención!',
            text: 'Se cambio el estado del registro a "Inactivo"',
            icon: 'warning'
          });
        }
      }

      this.fnControlFab();
    });
  }

  fnDuplicarArticulo = function () {

    Swal.fire({
      title: '¿Desea realizar una copia?',
      // text: Nombre,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // console.log('hola')
        this.form.controls['sCodArticulo'].setValue('');
        this.form.controls['creado'].setValue('');
        this.form.controls['modificado'].setValue('');
        this.idParametro = 0;
        this.editar();
        this.estado = 0;
      }
      this.fnControlFab();
    })
  }


  fnCargarTipoCambio() {
    this.pParametro = []
    this.pEntidad = 2
    this.pOpcion = 14
    this.pTipo = 1;

    this.pParametro.push(this.pPais);
    if (this.pPais == "604") {
      this.rutas.fnDatosArticulo(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe((data: any) => {
        this.rutas = data[0]["nId"];

        this.formArhivo.controls['txtTipoCambio'].setValue(data[0]["sDescripcion"])
        this.formArhivo = data[0]["sDescripcion"]
      })
    }
  }

  customCaracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /(\?|\|)$/i;
    const valid = caracteres.exec(control.value);
    return valid ? { caracterValidator: 'El texto no debe contener: "?" ni "|"' } : null;
  }

  async traerPermisos() {
    try {
      var pParametro = [];
      pParametro.push(this.idUser);
      pParametro.push(this.pPais);

      const { nAgregar, nDuplicar, nModificar } = await this.rutas.fnDatosArticulo(1, 2, pParametro, 10, this.url).toPromise();
      this.nAgregar = nAgregar;
      this.nDuplicar = nDuplicar;
      this.nModificar = nModificar;

      this.fnControlFab();

    } catch (error) {
      this.nAgregar = 0;
      this.nDuplicar = 0;
      this.nModificar = 0;
      console.log(error);
    }
  }
}
