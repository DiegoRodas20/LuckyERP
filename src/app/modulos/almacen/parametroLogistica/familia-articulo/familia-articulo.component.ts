import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { FamiliaArticulo } from '../models/familia-articulo.model';
import { ParametroLogisticaService } from '../parametro-logistica.service';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-familia-articulo',
  templateUrl: './familia-articulo.component.html',
  styleUrls: ['./familia-articulo.component.css'],
  animations: [asistenciapAnimations]
})

export class FamiliaArticuloComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista oculta
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'note_add', tool: 'Nueva familia artículo' }
  ];
  abLista = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual


  lFamArt: FamiliaArticulo[] = [];
  vFamArtSeleccionada: FamiliaArticulo;
  pFamArt: FamiliaArticulo;

  txtFiltro = new FormControl();

  //Form para registrar
  formFamArt: FormGroup;

  //Form para actualizar
  formFamArtActualizar: FormGroup;
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<FamiliaArticulo>;
  displayedColumns = ['nId', 'sCodigo', 'sDescripcion', 'sAbrev', 'nCorrelativo', 'sServicio', 'sEstado'];
  @ViewChild('modalFamArt') modalFamArt: ElementRef;

  title: string;

  //Se genera despues de escoger el maximo codigo y se le aumenta 1
  nCodigo: number = 0;
  sCodigo: string = "";
  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar

  pMostrar: number;

  lEstados = [
    { nEstado: 1, sEstado: 'Activo' },
    { nEstado: 0, sEstado: 'Inactivo' },
  ]

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vParLogisticaService: ParametroLogisticaService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; this.pMostrar = 0; }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formFamArt = this.formBuilder.group({
      txtCodigo: ['', [Validators.required]],
      txtAbrev: ['', [Validators.required, Validators.maxLength(1), Validators.minLength(1), Validators.pattern('^[a-zA-Z\s]*$')]],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50), this.caracterValidator]],
      stServicio: [false]
    })

    this.formFamArtActualizar = this.formBuilder.group({
      txtCodigo: [''],
      txtAbrev: ['', [Validators.required, Validators.maxLength(1), Validators.minLength(1)]],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50), this.caracterValidator]],
      txtServicio: [''],
      txtCorrelativo: [''],
      cboEstado: ['']
    })

    this.fnListarFamiliaArticulo(1);
    this.onToggleFab(1, -1)
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  //Funciones de BD
  fnListarFamiliaArticulo(opcion: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);


    this.vParLogisticaService.fnFamiliaArticulo(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lFamArt = res;
        this.nCodigo = 0;
        this.sCodigo = "";
        this.lFamArt.forEach(item => {
          if (parseInt(item.sCodigo) > this.nCodigo) { this.nCodigo = parseInt(item.sCodigo) }
        })
        this.nCodigo++;
        this.sCodigo = this.nCodigo.toString();
        if (this.sCodigo.length == 1) { this.sCodigo = '0' + this.sCodigo }
        this.formFamArt.controls.txtCodigo.setValue(this.sCodigo);
        const categoriaC = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(categoriaC);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.fnFiltrar();

      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnAnadirFamArt() {
    if (this.formFamArt.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var pEntidad1 = 1;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla

    pParametro1.push(this.pPais);

    try {
      this.lFamArt = await this.vParLogisticaService.fnFamiliaArticulo(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise()
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }

    var vDatosCC = this.formFamArt.value;
    var abrev: string = vDatosCC.txtAbrev;
    var descripcion: string = vDatosCC.txtDescripcion;
    //Verificando si la descripcion ya existe
    if (this.lFamArt.findIndex(item => item.sAbrev.trim().toUpperCase() == abrev.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'La abreviatura indicada ya existe', 'warning')
      this.formFamArt.controls.txtAbrev.setValue('');
      this.spinner.hide();
      return;
    }

    if (this.lFamArt.findIndex(item => item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'La descripción indicada ya existe', 'warning')
      this.formFamArt.controls.txtDescripcion.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad = 1; //Cabecera de familia art.
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(vDatosCC.txtDescripcion.trim());
    pParametro.push(vDatosCC.txtAbrev);
    pParametro.push(vDatosCC.stServicio == false ? 0 : 1);
    pParametro.push(this.pPais);

    this.vParLogisticaService.fnFamiliaArticulo(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 0) {
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          ).then((result) => {
          });
        } else {
          //Registrado
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Correcto',
            text: 'Se guardo la familia de artículos asignada.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se guardo la familia de artículos asignado.', 'success');
          this.formFamArt.controls.txtDescripcion.setValue("");
          this.formFamArt.controls.txtAbrev.setValue("");
          this.formFamArt.controls.stServicio.setValue(false);

          this.fnListarFamiliaArticulo(1);
        }
        this.spinner.hide();

      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnGuardarFamArt() {
    if (this.formFamArtActualizar.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var pEntidad1 = 1;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla

    pParametro1.push(this.pPais);

    try {
      this.lFamArt = await this.vParLogisticaService.fnFamiliaArticulo(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise()
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }

    var vDatosCC = this.formFamArtActualizar.value;
    var descripcion: string = vDatosCC.txtDescripcion;

    //Verificando si la descripcion ya existe
    if (this.lFamArt.findIndex(item => (item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) && (item.nId != this.vFamArtSeleccionada.nId)) != -1) {
      Swal.fire('¡Verificar!', 'La descripción indicada ya existe', 'warning')
      this.formFamArt.controls.txtDescripcion.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad = 1; //Cabecera de familia art.
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vFamArtSeleccionada.nId);
    pParametro.push(vDatosCC.txtDescripcion.trim());
    pParametro.push(vDatosCC.cboEstado);
    pParametro.push(vDatosCC.txtAbrev);

    this.vParLogisticaService.fnFamiliaArticulo(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Correcto',
            text: 'Se actualizo de manera correcta el registro.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se actualizo de manera correcta el registro', 'success')
          this.vFamArtSeleccionada.nEstado = this.formFamArtActualizar.controls.cboEstado.value;
          this.formFamArtActualizar.get('cboEstado').disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarFamiliaArticulo(0);
          this.formFamArtActualizar.controls.txtCodigo.setValue(this.vFamArtSeleccionada.sCodigo);

        } else {
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar la actualizacion: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          )
        }

        this.spinner.hide();
      },
      err => {
        console.log(err);
        this.spinner.hide();

      },
      () => {
        this.spinner.hide();
      }
    );
  }
  //===========================

  fnModificarFamArt() {
    this.pTipo = 2;
    this.formFamArtActualizar.get('cboEstado').enable();
  }

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltro.value == null) {
      return;
    }
    filtro = this.txtFiltro.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

  fnSeleccionarFamiliaArt(row: FamiliaArticulo) {
    this.vFamArtSeleccionada = row;

    this.formFamArtActualizar.controls.txtAbrev.setValue(this.vFamArtSeleccionada.sAbrev)
    this.formFamArtActualizar.controls.txtCodigo.setValue(this.vFamArtSeleccionada.sCodigo)
    this.formFamArtActualizar.controls.txtDescripcion.setValue(this.vFamArtSeleccionada.sDescripcion)
    this.formFamArtActualizar.controls.txtCorrelativo.setValue(this.vFamArtSeleccionada.nCorrelativo)
    this.formFamArtActualizar.controls.txtServicio.setValue(this.vFamArtSeleccionada.sServicio)


    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalFamArt.nativeElement.click();
    this.title = 'Modificar Familia Artículo';
    this.formFamArtActualizar.controls.cboEstado.setValue(this.vFamArtSeleccionada.nEstado);
    this.formFamArtActualizar.controls.cboEstado.disable();
  }

  fnAbrirModal() {
    this.modalFamArt.nativeElement.click();
    this.pOpcion = 1;
    this.formFamArt.get('txtDescripcion').enable();
    this.formFamArt.get('txtAbrev').enable();
    this.formFamArt.controls.txtCodigo.setValue(this.sCodigo);

    this.title = 'Añadir Familia Artículo'
  }

  //Funciones de limpieza
  fnLimpiarModal() {
    this.formFamArt.controls.txtCodigo.setValue('');
    this.formFamArt.controls.txtAbrev.setValue('');
    this.formFamArt.controls.txtDescripcion.setValue('');
    this.formFamArt.controls.stServicio.setValue(false);
    this.formFamArt.markAsUntouched();
    this.fnListarFamiliaArticulo(0);
  }

  fnEvitarEspacios() {
    var vDatos = this.formFamArt.value;
    var descripcion = vDatos.txtDescripcion;
    var abrev = vDatos.txtAbrev;

    if (descripcion != null) {
      this.formFamArt.controls.txtDescripcion.setValue(descripcion.trimLeft())
    }
    if (abrev != null) {
      this.formFamArt.controls.txtAbrev.setValue(abrev.trimLeft())
      if (abrev.trimLeft().length > 0) {
        this.formFamArt.controls.txtAbrev.setValue(abrev.trimLeft()[0].toUpperCase())
      }
    }
  }

  fnEvitarEspaciosAct() {
    var vDatos = this.formFamArtActualizar.value;
    var descripcion = vDatos.txtDescripcion;

    if (descripcion != null) {
      this.formFamArtActualizar.controls.txtDescripcion.setValue(descripcion.trimLeft())
    }
  }

  //Funciones de interaccion con el componente hijo
  fnSubFamilias(row: FamiliaArticulo) {
    this.pFamArt = row;
    this.pMostrar = 1;
  }

  fnOcultar(p: number) {
    this.pMostrar = p;
    this.fnListarFamiliaArticulo(1);
  }

  //#region Funcion de validacion
  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { caracterValidator: 'El texto no debe contener: "/", "|", "?"' } : null;
  }
  //#endregion

  //Botones Flotantes

  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnAbrirModal()
        break
      default:
        break
    }
  }


}
