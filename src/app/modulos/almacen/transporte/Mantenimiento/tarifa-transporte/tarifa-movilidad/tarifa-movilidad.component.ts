import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { TransporteService } from '../../../transporte.service';
import { ListasTarifa, Tarifa_Movilidad } from '../../models/TarifaMovil.model';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-tarifa-movilidad',
  templateUrl: './tarifa-movilidad.component.html',
  styleUrls: ['./tarifa-movilidad.component.css']
})
export class TarifaMovilidadComponent implements OnInit {


  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  //Para inactivar los botones
  bSoloLectura: boolean = true;

  vTipoZona: ListasTarifa;

  lTarifaMovil: Tarifa_Movilidad[] = [];
  vTarifaMovil: Tarifa_Movilidad;

  lTipoMovil: ListasTarifa[] = [];
  lTipoZona: ListasTarifa[] = [];

  lEstado: ListasTarifa[] = [
    { nId: 1, sDescripcion: 'Activo' },
    { nId: 0, sDescripcion: 'Inactivo' },
  ];

  txtFiltro = new FormControl();
  cboTipoZona = new FormControl();

  formTarifaMovil: FormGroup;
  formTarifaMovilAct: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Tarifa_Movilidad>;
  displayedColumns = ['nId', 'sTipoMovil', 'nPeso', 'nVolumen', 'nPuntos', 'nPrecio', 'sEstado'];

  @ViewChild('modalTarifaMovil') modalTarifaMovil: ElementRef;

  title: string;

  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vTransporteService: TransporteService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formTarifaMovil = this.formBuilder.group({
      cboTipoMovil: ['', Validators.required],
      txtPeso: ['', [Validators.required, Validators.min(0)]],
      txtVolumen: ['', [Validators.required, Validators.min(0)]],
      txtPuntos: ['', [Validators.required, Validators.min(0)]],
      txtPrecio: ['', [Validators.required, Validators.min(0)]],
    });

    this.formTarifaMovilAct = this.formBuilder.group({
      txtTipoMovil: [''],
      txtPeso: ['', [Validators.required, Validators.min(0)]],
      txtVolumen: ['', [Validators.required, Validators.min(0)]],
      txtPuntos: ['', [Validators.required, Validators.min(0)]],
      txtPrecio: ['', [Validators.required, Validators.min(0)]],
      cboEstado: ['', Validators.required]
    });

    this.fnListarTipoZona();
  }

  fnListarTarifaMovil(nIdTipoZona) {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(nIdTipoZona);

    this.vTransporteService.fnTarifaMovilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lTarifaMovil = res;

        const tarifa = res;
        this.dataSource = new MatTableDataSource(tarifa);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarTipoZona() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);

    this.vTransporteService.fnTarifaMovilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lTipoZona = res;
        if (this.lTipoZona.length > 0) {
          this.cboTipoZona.setValue(this.lTipoZona[0].nId)
          this.fnListarTarifaMovil(this.lTipoZona[0].nId)
          this.fnGetTipoZona(this.lTipoZona[0])
        }
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarTipoMovil() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    this.vTransporteService.fnTarifaMovilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lTipoMovil = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnAnadirTarifaMovil() {
    if (this.formTarifaMovil.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    var vDatosCC = this.formTarifaMovil.value;
    var tipoZona: number = this.cboTipoZona.value;
    var tipoMovil: number = vDatosCC.cboTipoMovil;

    this.spinner.show()

    var pEntidad1 = 2;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 2;       //Verificar que no exista el mismo registro

    pParametro1.push(tipoZona);
    pParametro1.push(tipoMovil);

    var lVerificar: ListasTarifa[] = [];

    try {
      lVerificar = await this.vTransporteService.fnTarifaMovilidad(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise()
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }

    //Verificando si la movilidad ya existe en el tipo de zona
    if (lVerificar.length > 0) {
      this.spinner.hide()
      Swal.fire('¡Verificar!', 'El tipo de movilidad indicada ya existe en este tipo de zona', 'warning');
      return;
    }

    var pEntidad = 2; //Cabecera de tarifa movil.
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(tipoZona);
    pParametro.push(tipoMovil);
    pParametro.push(vDatosCC.txtPeso);
    pParametro.push(vDatosCC.txtVolumen);
    pParametro.push(vDatosCC.txtPuntos);
    pParametro.push(vDatosCC.txtPrecio);

    this.vTransporteService.fnTarifaMovilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
            text: 'Se guardo la tarifa de movilidad.',
            showConfirmButton: false,
            timer: 1500
          });
          this.formTarifaMovil.controls.txtPeso.setValue("");
          this.formTarifaMovil.controls.txtVolumen.setValue("");
          this.formTarifaMovil.controls.txtPuntos.setValue("");
          this.formTarifaMovil.controls.txtPrecio.setValue("");
          this.formTarifaMovil.controls.cboTipoMovil.setValue("");

          this.fnListarTarifaMovil(tipoZona);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide()
      }
    );
  }

  fnGuardarTarifaMovil() {
    if (this.formTarifaMovilAct.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    var tipoZona: number = this.cboTipoZona.value;

    var vDatosCC = this.formTarifaMovilAct.value;

    this.spinner.show()

    var pEntidad = 2; //Cabecera de tarifa movil.
    var pOpcion = 3;  //CRUD -> actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vTarifaMovil.nId);
    pParametro.push(vDatosCC.txtPeso);
    pParametro.push(vDatosCC.txtVolumen);
    pParametro.push(vDatosCC.txtPuntos);
    pParametro.push(vDatosCC.txtPrecio);
    pParametro.push(vDatosCC.cboEstado);

    this.vTransporteService.fnTarifaMovilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 0) {
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar la actualización: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          ).then((result) => {
          });
        } else {
          //actualizado
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Correcto',
            text: 'Se actualizo el registro.',
            showConfirmButton: false,
            timer: 1500
          });
          this.vTarifaMovil.nEstado = vDatosCC.cboEstado;
          this.formTarifaMovilAct.controls.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.bSoloLectura = true;

          this.fnListarTarifaMovil(tipoZona);
        }
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide()
      }
    );
  }

  fnModificarTarifaMovil() {
    this.pTipo = 2;
    this.bSoloLectura = false;
    this.formTarifaMovilAct.controls.cboEstado.enable();
  }

  fnAbrirModal() {
    this.modalTarifaMovil.nativeElement.click();
    this.pOpcion = 1;
    this.fnListarTipoMovil();
    this.title = `${this.vTipoZona.sDescripcion} - Añadir Tarifa de movilidad`
  }

  fnSeleccionarTarifaMovil(row: Tarifa_Movilidad) {
    this.vTarifaMovil = row;

    this.formTarifaMovilAct.controls.txtPeso.setValue(this.vTarifaMovil.nPeso);
    this.formTarifaMovilAct.controls.txtVolumen.setValue(this.vTarifaMovil.nVolumen);
    this.formTarifaMovilAct.controls.txtPuntos.setValue(this.vTarifaMovil.nPuntos);
    this.formTarifaMovilAct.controls.txtPrecio.setValue(this.vTarifaMovil.nPrecio);
    this.formTarifaMovilAct.controls.txtTipoMovil.setValue(this.vTarifaMovil.sTipoMovil);
    this.formTarifaMovilAct.controls.cboEstado.setValue(this.vTarifaMovil.nEstado);

    this.pOpcion = 2;
    this.pTipo = 1;
    this.bSoloLectura = true;

    this.modalTarifaMovil.nativeElement.click();
    this.title = `${this.vTipoZona.sDescripcion} - Modificar Tarifa Movilidad`;
    this.formTarifaMovilAct.controls.cboEstado.disable();
  }

  fnLimpiarModal() {
    this.formTarifaMovil.controls.txtPeso.setValue("");
    this.formTarifaMovil.controls.txtVolumen.setValue("");
    this.formTarifaMovil.controls.txtPuntos.setValue("");
    this.formTarifaMovil.controls.txtPrecio.setValue("");
    this.formTarifaMovil.controls.cboTipoMovil.setValue("");
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

  fnGetTipoZona(p: ListasTarifa) {
    if (p == null) { return };

    this.vTipoZona = p;
  }

  //Funciones de validacion

  fnRedondear(formControlName: string, form: FormGroup) {

    var valor: number = form.get(formControlName).value;
    if (valor == null) return;
    form.get(formControlName).setValue(Math.round(valor));

  }

  fnEvitarNegativos(formControlName: string, form: FormGroup) {

    var valor: number = form.get(formControlName).value;
    if (valor == null) return;
    form.get(formControlName).setValue(Math.abs(valor));

  }
}
