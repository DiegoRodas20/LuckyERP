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
import { ListasTarifa, Tarifa_Courier } from '../../models/TarifaMovil.model';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-tarifa-envio',
  templateUrl: './tarifa-envio.component.html',
  styleUrls: ['./tarifa-envio.component.css']
})
export class TarifaEnvioComponent implements OnInit {


  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  //Para inactivar los botones
  bSoloLectura: boolean = true;

  vTipoCourier: ListasTarifa;

  lTarifaCourier: Tarifa_Courier[] = [];
  vTarifaCourier: Tarifa_Courier;


  lTipoCourier: ListasTarifa[] = [];
  lSucursal: ListasTarifa[] = [];
  lProveedor: ListasTarifa[] = [];

  lEstado: ListasTarifa[] = [
    { nId: 1, sDescripcion: 'Activo' },
    { nId: 0, sDescripcion: 'Inactivo' },
  ];

  txtFiltro = new FormControl();
  cboTipoCourier = new FormControl();
  cboProveedor = new FormControl();

  formTarifaCourier: FormGroup;
  formTarifaCourierAct: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<Tarifa_Courier>;
  displayedColumns = ['nId', 'sSucursal', 'sProveedor','nPrecioKilo', 'nPrecioAdicional', 'sEstado'];

  @ViewChild('modalCourier') modalCourier: ElementRef;

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

    this.formTarifaCourier = this.formBuilder.group({
      cboSucursal: ['', Validators.required],
      txtPrecioKilo: ['', [Validators.required, Validators.min(0)]],
      txtPrecioAdicional: ['', [Validators.required, Validators.min(0)]],
      cboProveedor: [null, Validators.required]
    });

    this.formTarifaCourierAct = this.formBuilder.group({
      txtSucursal: [''],
      txtPrecioKilo: ['', [Validators.required, Validators.min(0)]],
      txtPrecioAdicional: ['', [Validators.required, Validators.min(0)]],
      cboProveedor: [null, Validators.required],
      cboEstado: ['', Validators.required]
    });

    this.fnListarTipoCourier();
    this.fnListarComboboxProveedor();
  }

  fnListarComboboxProveedor(){
    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;       //Listar todos los registros de la tabla

    this.vTransporteService.fnTarifaMovilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lProveedor = res;
        //console.log(this.lProveedor);
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarTipoCourier() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 4;       //Listar todos los registros de la tabla

    this.vTransporteService.fnTarifaMovilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lTipoCourier = res;
        if (this.lTipoCourier.length > 0) {
          this.cboTipoCourier.setValue(this.lTipoCourier[0].nId)
          this.fnListarTarifaCourier()
          this.fnGetTipoCourier(this.lTipoCourier[0])
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

  fnListarTarifaCourier() {
    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.cboTipoCourier.value);
    pParametro.push(this.cboProveedor.value || 0);
    pParametro.push(this.pPais);

    this.vTransporteService.fnTarifaMovilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lTarifaCourier = res;

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

  fnListarSucursal() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);

    this.vTransporteService.fnTarifaMovilidad(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lSucursal = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnAnadirTarifaCourier() {
    if (this.formTarifaCourier.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    var vDatosCC = this.formTarifaCourier.value;
    var tipoCourier: number = this.cboTipoCourier.value;
    var sucursal: number = vDatosCC.cboSucursal;

    this.spinner.show()

    var pEntidad1 = 3;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 2;       //Verificar que no exista el mismo registro

    pParametro1.push(tipoCourier);
    pParametro1.push(sucursal);

    var lVerificar: ListasTarifa[] = [];

    try {
      lVerificar = await this.vTransporteService.fnTarifaMovilidad(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise()
    } catch (err) {
      console.log(err)
      this.spinner.hide();
      return;
    }

    //Verificando si la movilidad ya existe en el tipo de zona
    if (lVerificar.length > 0) {
      this.spinner.hide()
      Swal.fire('¡Verificar!', 'La sucursal indicada ya existe en este tipo de courier', 'warning');
      return;
    }

    var pEntidad = 3; //Cabecera de tarifa courier
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(tipoCourier);
    pParametro.push(sucursal);
    pParametro.push(vDatosCC.txtPrecioKilo);
    pParametro.push(vDatosCC.txtPrecioAdicional);
    pParametro.push(vDatosCC.cboProveedor);
    pParametro.push(this.idUser);
    pParametro.push(this.pPais);

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
            text: 'Se guardo la tarifa de courier.',
            showConfirmButton: false,
            timer: 1500
          });
          this.formTarifaCourier.controls.cboSucursal.setValue("");
          this.formTarifaCourier.controls.txtPrecioKilo.setValue("");
          this.formTarifaCourier.controls.txtPrecioAdicional.setValue("");

          this.fnListarTarifaCourier();
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

  fnGuardarTarifaCourier() {
    if (this.formTarifaCourierAct.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    var tipoCourier: number = this.cboTipoCourier.value;

    var vDatosCC = this.formTarifaCourierAct.value;

    this.spinner.show()

    var pEntidad = 3; //Cabecera de tarifa movil.
    var pOpcion = 3;  //CRUD -> actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vTarifaCourier.nId);
    pParametro.push(vDatosCC.txtPrecioKilo);
    pParametro.push(vDatosCC.txtPrecioAdicional);
    pParametro.push(vDatosCC.cboEstado);
    pParametro.push(vDatosCC.cboProveedor);
    pParametro.push(this.idUser);
    pParametro.push(this.pPais);

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
          this.vTarifaCourier.nEstado = vDatosCC.cboEstado;
          this.formTarifaCourierAct.controls.cboEstado.disable();
          this.formTarifaCourierAct.controls.cboProveedor.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.bSoloLectura = true;

          this.fnListarTarifaCourier();
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

  fnModificarTarifaCourier() {
    this.pTipo = 2;
    this.bSoloLectura = false;
    this.formTarifaCourierAct.controls.cboEstado.enable();
    this.formTarifaCourierAct.controls.cboProveedor.enable();
  }

  fnAbrirModal() {
    this.modalCourier.nativeElement.click();
    this.pOpcion = 1;
    this.fnListarSucursal();
    this.title = `${this.vTipoCourier.sDescripcion} - Añadir Tarifa de courier`
  }

  fnSeleccionarTarifaCourier(row: Tarifa_Courier) {
    this.vTarifaCourier = row;

    this.formTarifaCourierAct.controls.txtSucursal.setValue(this.vTarifaCourier.sSucursal);
    this.formTarifaCourierAct.controls.txtPrecioKilo.setValue(this.vTarifaCourier.nPrecioKilo);
    this.formTarifaCourierAct.controls.txtPrecioAdicional.setValue(this.vTarifaCourier.nPrecioAdicional);

    if(this.vTarifaCourier.nProveedor == 0){
      this.formTarifaCourierAct.controls.cboProveedor.setValue(null);
    }
    else{
      this.formTarifaCourierAct.controls.cboProveedor.setValue(this.vTarifaCourier.nProveedor);
    }

    this.formTarifaCourierAct.controls.cboEstado.setValue(this.vTarifaCourier.nEstado);
    console.log(this.formTarifaCourierAct.value);
    console.log(row);

    this.pOpcion = 2;
    this.pTipo = 1;
    this.bSoloLectura = true;

    this.modalCourier.nativeElement.click();
    this.title = `${this.vTipoCourier.sDescripcion} - Modificar Tarifa Courier`;
    this.formTarifaCourierAct.controls.cboEstado.disable();
    this.formTarifaCourierAct.controls.cboProveedor.disable();
  }

  fnLimpiarModal() {
    this.formTarifaCourier.controls.cboSucursal.setValue("");
    this.formTarifaCourier.controls.txtPrecioKilo.setValue("");
    this.formTarifaCourier.controls.txtPrecioAdicional.setValue("");
  }

  fnGetTipoCourier(p: ListasTarifa) {
    if (p == null) { return; }
    this.vTipoCourier = p;
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

  //Funciones de validacion

  fnEvitarNegativos(formControlName: string, form: FormGroup) {

    var valor: number = form.get(formControlName).value;
    if (valor == null) return;
    form.get(formControlName).setValue(Math.abs(valor));

  }
}
