import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { FamiliaArticulo, SubFamilia } from '../../models/familia-articulo.model';
import { ParametroLogisticaService } from '../../parametro-logistica.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-sub-familia-articulo',
  templateUrl: './sub-familia-articulo.component.html',
  styleUrls: ['./sub-familia-articulo.component.css']
})
export class SubFamiliaArticuloComponent implements OnInit {

  @Input() pFamArt: FamiliaArticulo;
  @Output() pMostrar = new EventEmitter<number>();

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual


  vSubFamiliaSeleccionado: SubFamilia;
  lSubFamilia: SubFamilia[] = [];
  txtFiltro = new FormControl();
  formSubFamilia: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<SubFamilia>;
  displayedColumns = ['nId', 'sCodigo', 'sDescripcion', 'sAbrev', 'sEstado'];
  @ViewChild('modalSubFamilia') modalSubFamilia: ElementRef;

  //Se genera despues de escoger el maximo codigo y se le aumenta 1
  nCodigo: number = 0;
  sCodigo: string = "";
  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar

  cboEstado = new FormControl();
  title: string;


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
  ) { this.url = baseUrl; }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formSubFamilia = this.formBuilder.group({
      txtCodigo: ['', [Validators.required]],
      txtAbrev: ['', [Validators.maxLength(10), this.caracterValidator]],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50), this.caracterValidator]]
    })
    this.fnListarSubFamilia(1, this.pFamArt);
  }

  //Funciones de BD
  fnListarSubFamilia(opcion: number, p: FamiliaArticulo) {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla


    pParametro.push(this.pPais);
    pParametro.push(p.nId);

    this.vParLogisticaService.fnFamiliaArticulo(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lSubFamilia = res;
        this.nCodigo = 0;
        this.sCodigo = "";
        this.nCodigo = this.lSubFamilia.length;
        this.nCodigo++;
        this.sCodigo = this.nCodigo.toString();
        if (this.sCodigo.length == 1) { this.sCodigo = '0' + this.sCodigo }
        this.sCodigo = this.pFamArt.sCodigo + this.sCodigo;

        if (opcion == 1) {
          this.formSubFamilia.controls.txtCodigo.setValue(this.sCodigo);
        }
        const subFamilia = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(subFamilia);
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

  async fnAnadirSubFam() {
    if (this.formSubFamilia.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var pEntidad1 = 2;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla

    pParametro1.push(this.pPais);
    pParametro1.push(this.pFamArt.nId);

    try {
      this.lSubFamilia = await this.vParLogisticaService.fnFamiliaArticulo(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }

    var vDatosCC = this.formSubFamilia.value;
    var abrev: string = vDatosCC.txtAbrev;
    var descripcion: string = vDatosCC.txtDescripcion;
    //Verificando si la descripcion ya existe
    if (this.lSubFamilia.findIndex(item => item.sAbrev.trim().toUpperCase() == abrev.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'La abreviatura indicada ya existe', 'warning')
      this.formSubFamilia.controls.txtAbrev.setValue('');
      this.spinner.hide();
      return;
    }

    if (this.lSubFamilia.findIndex(item => item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'La descripción indicada ya existe', 'warning')
      this.formSubFamilia.controls.txtDescripcion.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad = 2; //Cabecera de sub familia art.
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(vDatosCC.txtDescripcion.trim());
    pParametro.push(vDatosCC.txtAbrev);
    pParametro.push(this.pPais);
    pParametro.push(this.pFamArt.nId);

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
            text: 'Se guardo la sub familia asignada.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se guardo la sub familia asignada.', 'success');
          this.formSubFamilia.controls.txtDescripcion.setValue("");
          this.formSubFamilia.controls.txtAbrev.setValue("");

          this.fnListarSubFamilia(1, this.pFamArt);
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

  async fnGuardarSubFam() {
    if (this.formSubFamilia.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.hide();

    var pEntidad1 = 2;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla

    pParametro1.push(this.pPais);
    pParametro1.push(this.pFamArt.nId);

    try {
      this.lSubFamilia = await this.vParLogisticaService.fnFamiliaArticulo(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }

    var vDatosCC = this.formSubFamilia.value;
    var descripcion: string = vDatosCC.txtDescripcion;

    if (this.lSubFamilia.findIndex(item => (item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) && (item.nId != this.vSubFamiliaSeleccionado.nId)) != -1) {
      Swal.fire('¡Verificar!', 'La descripción indicada ya existe', 'warning')
      this.formSubFamilia.controls.txtDescripcion.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad = 2; //Cabecera de subFamilia art.
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vSubFamiliaSeleccionado.nId);
    pParametro.push(vDatosCC.txtDescripcion);
    pParametro.push(this.cboEstado.value);
    pParametro.push(vDatosCC.txtAbrev);
    pParametro.push(this.pFamArt.nId);

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
          this.vSubFamiliaSeleccionado.nEstado = this.cboEstado.value;
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarSubFamilia(0, this.pFamArt);
          this.formSubFamilia.controls.txtCodigo.setValue(this.vSubFamiliaSeleccionado.sCodigo);

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
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }
  //==============

  fnModificarSubFam() {
    this.pTipo = 2;
    this.cboEstado.enable();
  }

  fnSeleccionarSubFamilia(row: SubFamilia) {
    this.vSubFamiliaSeleccionado = row;

    this.formSubFamilia.controls.txtCodigo.setValue(this.vSubFamiliaSeleccionado.sCodigo)
    this.formSubFamilia.controls.txtDescripcion.setValue(this.vSubFamiliaSeleccionado.sDescripcion)
    this.formSubFamilia.controls.txtAbrev.setValue((this.vSubFamiliaSeleccionado.sAbrev == '-') ? '' : this.vSubFamiliaSeleccionado.sAbrev)

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalSubFamilia.nativeElement.click();
    this.title = 'Modificar Sub Familia';
    this.cboEstado.setValue(this.vSubFamiliaSeleccionado.nEstado);
    this.cboEstado.disable();
  }

  fnAbrirModal() {
    this.modalSubFamilia.nativeElement.click();
    this.pOpcion = 1;
    this.formSubFamilia.get('txtDescripcion').enable();
    this.formSubFamilia.get('txtAbrev').enable();
    this.formSubFamilia.controls.txtCodigo.setValue(this.sCodigo);

    this.title = 'Añadir Sub Familia'
    this.cboEstado.disable();
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

  fnEvitarEspacios() {
    var vDatos = this.formSubFamilia.value;
    var descripcion = vDatos.txtDescripcion;
    var abrev = vDatos.txtAbrev;

    if (descripcion != null) {
      this.formSubFamilia.controls.txtDescripcion.setValue(descripcion.trimLeft())
    }
    if (abrev != null) {
      this.formSubFamilia.controls.txtAbrev.setValue(abrev.trimLeft())
    }
  }

  fnLimpiarModal() {
    this.formSubFamilia.controls.txtDescripcion.setValue('');
    this.formSubFamilia.controls.txtCodigo.setValue('');
    this.formSubFamilia.controls.txtAbrev.setValue('');
  }

  //Funcion de interaccion con componentes
  fnRegresar() {
    this.pMostrar.emit(0);
  }

  //#region Funcion de validacion
  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { caracterValidator: 'El texto no debe contener: "/", "|", "?"' } : null;
  }
  //#endregion
}
