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
import { ListasGuia, NumeradorGuia } from '../models/numerador-guia.model';
import { ParametroLogisticaService } from '../parametro-logistica.service';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-numerador-guias',
  templateUrl: './numerador-guias.component.html',
  styleUrls: ['./numerador-guias.component.css'],
  animations: [asistenciapAnimations]
})

export class NumeradorGuiasComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista oculta
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'note_add', tool: 'Nueva numerador de guía' }
  ];
  abLista = [];

  ECUADOR_ID = '218'


  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual


  lGuia: NumeradorGuia[] = [];
  vGuiaSeleccionada: NumeradorGuia;
  pGuia: NumeradorGuia;

  lEstado: ListasGuia[] = [];

  txtFiltro = new FormControl();

  //Form para registrar
  formGuia: FormGroup;

  //Form para actualizar
  formGuiaActualizar: FormGroup;
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<NumeradorGuia>;
  displayedColumns = ['nId', 'sCodigoSerie', 'sDescripcion', 'sTipoDoc', 'nGuia', 'sEstado'];
  @ViewChild('modalGuia') modalGuia: ElementRef;

  title: string;

  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar

  pMostrar: number;

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

    this.formGuia = this.formBuilder.group({
      txtCodigoSerie: ['', [Validators.required, Validators.maxLength(4), Validators.pattern(/^[0-9]\d*$/)]],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50), this.caracterValidator]],
      txtNumGuia: [0, [Validators.required, Validators.min(0)]],
      txtCantidadLong: [1, [Validators.required, Validators.min(1)]],

    })

    this.formGuiaActualizar = this.formBuilder.group({
      txtCodigoSerie: [''],
      txtDescripcion: ['', [Validators.required, Validators.maxLength(50), this.caracterValidator]],
      txtNumGuia: [0, [Validators.required, Validators.min(0)]],
      cboEstado: ['', Validators.required],
      txtCantidadLong: [1, [Validators.required, Validators.min(1)]],
    })

    if (this.pPais == this.ECUADOR_ID) {
      this.formGuia.addControl('txtCodigoSerie2', new FormControl('', [Validators.required, Validators.maxLength(4), Validators.pattern(/^[0-9]\d*$/)]))
      this.formGuiaActualizar.addControl('txtCodigoSerie2', new FormControl(''))
    }

    this.onToggleFab(1, -1)
    this.fnListarGuiaNumerador();

  }

  fnListarGuiaNumerador() {
    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);

    this.vParLogisticaService.fnNumeradorGuia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lGuia = res;

        const guia = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(guia);
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

  fnListarEstado() {
    this.spinner.show();

    var pEntidad = 5;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    this.vParLogisticaService.fnNumeradorGuia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lEstado = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnAnadirGuia() {
    if (this.formGuia.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }
    this.spinner.show();


    var pEntidad1 = 3;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla

    pParametro1.push(this.idEmp);

    try {
      this.lGuia = await this.vParLogisticaService.fnNumeradorGuia(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise()
    } catch (err) {
      console.log(err)
      this.spinner.hide();
      return;
    }

    var vDatosCC = this.formGuia.value;
    var codSerie = vDatosCC.txtCodigoSerie;
    var descripcion = vDatosCC.txtDescripcion;
    var codSerie2 = vDatosCC.txtCodigoSerie2 ?? '';

    //Verificando si el codigo de serie ya existe
    if (this.pPais == this.ECUADOR_ID) {
      //Si es ecuador se valida que no exista igual en ambos casos
      if ((this.lGuia.findIndex(item => Number(item.sCodigoSerie.trim().toUpperCase()) == Number(codSerie.trim().toUpperCase())) != -1)
        && (this.lGuia.findIndex(item => Number(item.sCodigoSerie2.trim().toUpperCase()) == Number(codSerie2.trim().toUpperCase())) != -1)) {
        Swal.fire('¡Verificar!', 'El código de serie indicado ya existe', 'warning')
        this.formGuia.controls.txtCodigoSerie.setValue("");
        this.spinner.hide();
        return;
      }
    } else {
      if (this.lGuia.findIndex(item => Number(item.sCodigoSerie.trim().toUpperCase()) == Number(codSerie.trim().toUpperCase())) != -1) {
        Swal.fire('¡Verificar!', 'El código de serie indicado ya existe', 'warning')
        this.formGuia.controls.txtCodigoSerie.setValue("");
        this.spinner.hide();
        return;
      }
    }

    //Verificando si la descripcion ya existe
    if (this.lGuia.findIndex(item => item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) != -1) {
      Swal.fire('¡Verificar!', 'La descripción indicada ya existe', 'warning')
      this.formGuia.controls.txtDescripcion.setValue("");
      this.spinner.hide();
      return;
    }

    var pEntidad = 3; //Cabecera de guia.
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(vDatosCC.txtCodigoSerie);
    pParametro.push(vDatosCC.txtDescripcion);
    pParametro.push(vDatosCC.txtNumGuia);
    pParametro.push(this.idEmp);
    pParametro.push(this.idUser);
    pParametro.push(this.pPais);
    pParametro.push(vDatosCC.txtCantidadLong);
    pParametro.push(vDatosCC.txtCodigoSerie2 ?? '');

    this.vParLogisticaService.fnNumeradorGuia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
            text: 'Se guardo el numerador de guía asignado.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se guardo el numerador de guía asignado.', 'success');
          this.formGuia.controls.txtCodigoSerie.setValue("");
          this.formGuia.controls.txtDescripcion.setValue("");
          this.formGuia.controls.txtCantidadLong.setValue("");

          this.formGuia.controls.txtNumGuia.setValue("");
          if (this.pPais == this.ECUADOR_ID) {
            this.formGuia.controls.txtCodigoSerie2.setValue("");
          }
          this.fnListarGuiaNumerador();
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

  async fnGuardarGuia() {
    if (this.formGuiaActualizar.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var vDatosCC = this.formGuiaActualizar.value;


    var masAlto = await this.fnTraerCorrelativoMasAlto();
    if (masAlto > vDatosCC.txtNumGuia) {
      Swal.fire('¡Verificar!', 'No se puede poner un correlativo menor al que se tiene actualmente, el cual es: ' + masAlto, 'warning')
      this.formGuiaActualizar.controls.txtNumGuia.setValue(masAlto);
      this.spinner.hide();
      return;
    }

    var pEntidad1 = 3;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla

    pParametro1.push(this.idEmp);

    try {
      this.lGuia = await this.vParLogisticaService.fnNumeradorGuia(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise()
    } catch (err) {
      console.log(err)
      this.spinner.hide();
      return;
    }

    var descripcion = vDatosCC.txtDescripcion;

    //Verificando si la descripcion ya existe
    if (this.lGuia.findIndex(item => (item.sDescripcion.trim().toUpperCase() == descripcion.trim().toUpperCase()) && (item.nId != this.vGuiaSeleccionada.nId)) != -1) {
      Swal.fire('¡Verificar!', 'La descripción indicada ya existe', 'warning')
      this.formGuia.controls.txtDescripcion.setValue("");
      this.spinner.hide();
      return;
    }

    var pEntidad = 3; //Cabecera de guia.
    var pOpcion = 3;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vGuiaSeleccionada.nId);
    pParametro.push(vDatosCC.txtDescripcion.trim());
    pParametro.push(vDatosCC.txtNumGuia);
    pParametro.push(vDatosCC.cboEstado);
    pParametro.push(this.idUser);
    pParametro.push(this.pPais);
    pParametro.push(vDatosCC.txtCantidadLong);

    this.vParLogisticaService.fnNumeradorGuia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
          // Swal.fire('Correcto', 'Se actualizo de manera correcta el registro', 'success')
          this.vGuiaSeleccionada.nIdEstado = this.formGuiaActualizar.controls.cboEstado.value;
          this.formGuiaActualizar.get('cboEstado').disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarGuiaNumerador();

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


  async fnTraerCorrelativoMasAlto(): Promise<number> {

    var pEntidad1 = 5;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 3;       //Listar todos los registros de la tabla

    pParametro1.push(this.vGuiaSeleccionada.nId);

    try {
      var nMasAlto = await this.vParLogisticaService.fnNumeradorGuia(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise()
      return nMasAlto;
    } catch (err) {
      console.log(err)
      return 0;
    }
    return 0;
  }

  fnModificarGuia() {
    this.pTipo = 2;
    this.formGuiaActualizar.get('cboEstado').enable();
  }

  fnSeleccionarGuia(row: NumeradorGuia) {
    this.vGuiaSeleccionada = row;
    this.fnListarEstado();

    this.formGuiaActualizar.controls.txtCodigoSerie.setValue(this.vGuiaSeleccionada.sCodigoSerie);
    this.formGuiaActualizar.controls.txtDescripcion.setValue(this.vGuiaSeleccionada.sDescripcion);
    this.formGuiaActualizar.controls.txtNumGuia.setValue(this.vGuiaSeleccionada.nGuia);
    this.formGuiaActualizar.controls.txtCantidadLong.setValue(this.vGuiaSeleccionada.nCantLong);

    if (this.vGuiaSeleccionada.sCodigoSerie2 != '') {
      this.formGuiaActualizar.controls.txtCodigoSerie2.setValue(this.vGuiaSeleccionada.sCodigoSerie2);
    }

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalGuia.nativeElement.click();
    this.title = 'Modificar Operación logistíca';
    this.formGuiaActualizar.controls.cboEstado.setValue(this.vGuiaSeleccionada.nIdEstado);
    this.formGuiaActualizar.controls.cboEstado.disable();
  }

  fnAbrirModal() {
    this.modalGuia.nativeElement.click();
    this.pOpcion = 1;

    this.title = 'Añadir numerador de guía'
  }

  fnLimpiarModal() {
    this.formGuia.controls.txtCodigoSerie.setValue("");
    this.formGuia.controls.txtDescripcion.setValue("");
    this.formGuia.controls.txtNumGuia.setValue("");
    this.formGuia.controls.txtCantidadLong.setValue("");

    if (this.pPais == this.ECUADOR_ID) {
      this.formGuia.controls.txtCodigoSerie2.setValue("");
    }
    this.fnListarGuiaNumerador();
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
    var vDatos = this.formGuia.value;
    var descripcion = vDatos.txtDescripcion;
    var codSerie = vDatos.txtCodigoSerie;

    if (descripcion != null) {
      this.formGuia.controls.txtDescripcion.setValue(descripcion.trimLeft())
    }
    if (codSerie != null) {
      this.formGuia.controls.txtCodigoSerie.setValue(codSerie.trim())
    }
  }

  fnEvitarEspaciosAct() {
    var vDatos = this.formGuiaActualizar.value;
    var descripcion = vDatos.txtDescripcion;

    if (descripcion != null) {
      this.formGuiaActualizar.controls.txtDescripcion.setValue(descripcion.trimLeft())
    }
  }

  //Funciones de interaccion entre componentes
  fnDetalleGuia(row: NumeradorGuia) {
    this.pGuia = row;
    this.pMostrar = 1;
  }

  fnOcultar(p: number) {
    this.pMostrar = p;
    this.fnListarGuiaNumerador();
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
