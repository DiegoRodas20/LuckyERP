import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { TransporteService } from '../../../../../transporte.service';
import { ListasTransporte } from '../../../../models/EmpresaTransporte.model';
import { Vehiculo, Vehiculo_Empresa } from '../../../../models/Vehiculo.model';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-vehiculo-detalle',
  templateUrl: './vehiculo-detalle.component.html',
  styleUrls: ['./vehiculo-detalle.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
  animations: [asistenciapAnimations]
})
export class VehiculoDetalleComponent implements OnInit {
  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  lTipo: ListasTransporte[] = [];
  formVehiculo: FormGroup;
  bSoloLectura: boolean = false;
  bModificando: boolean = false;

  //En caso el la placa ya exista traemos los datos del vehiculo
  vVehiculo: Vehiculo;

  txtProveedor = new FormControl();
  @Input() pVehiculo: Vehiculo_Empresa;
  @Input() nIdEmpresaProveedor: number;
  @Output() pMostrar = new EventEmitter<number>();

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  title: string;

  matcher = new ErrorStateMatcher();
  anioActual = new Date().getFullYear();

  txtEstado = new FormControl();

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

    this.formVehiculo = this.formBuilder.group({
      cboTipo: ['', Validators.required],
      txtPlaca: ['', [Validators.required, Validators.maxLength(20), this.caracterValidator]],
      txtColor: ['', [Validators.required, Validators.maxLength(20), this.caracterValidator]],
      txtMarca: ['', [Validators.required, Validators.maxLength(20), this.caracterValidator]],
      txtDescripcion: [''],
      txtAnio: ['', [Validators.required, Validators.min(1920), Validators.max(this.anioActual + 2)]],
      txtModelo: ['', [Validators.required, Validators.maxLength(20), this.caracterValidator]],
      txtPasajero: ['', [Validators.required, Validators.min(0)]],
      txtPesoCarga: ['', [Validators.required, Validators.min(0)]],
      txtAlto: ['', [Validators.required, Validators.min(0)]],
      txtAncho: ['', [Validators.required, Validators.min(0)]],
      txtLargo: ['', [Validators.required, Validators.min(0)]],
      txtVolumenCarga: ['', [Validators.required, Validators.min(0)]],
      txtNumPuerta: ['', [Validators.required, Validators.min(0)]],
      cboFechaTecnica: ['', Validators.required],
      cboFechaSoat: ['', Validators.required],
      cboVenceCirculacion: ['', Validators.required],
      cboVenceExtintor: ['', Validators.required],
      cboFechaVenceCert: ['', Validators.required],
      stLucky: [false],
      txtEstado: ['']
    })
    this.onToggleFab(1, -1)

    if (this.pVehiculo == null) {
      this.fnListarTiposVehiculos();
      this.title = 'Añadir Vehículo'
    } else {
      this.fnListarTiposVehiculos();
      this.fnLlenarDatosDetalle(this.pVehiculo)
      this.title = `Vehículo: ${this.pVehiculo.sPlaca} - ${this.pVehiculo.sModelo}`
    }
  }

  fnListarTiposVehiculos() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;       //Listar todos los registros de la tabla

    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lTipo = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnAnadirVehiculo() {
    if (this.formVehiculo.invalid) {
      Swal.fire('¡Verificar!', 'Revise los campos ingresados', 'warning')
      return;
    }

    this.spinner.show();
    var vDatos = this.formVehiculo.value;

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(vDatos.txtPlaca.toUpperCase().trim());

    //Validando en caso haya pasado el blur que la placa no exista en otro vehiculo
    var vehiculo = await this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();

    if (vehiculo.length > 0) {
      if (vehiculo[0].nIdVehiculo != this.vVehiculo.nIdVehiculo) {
        Swal.fire('Información', 'Se encontro un vehiculo con la placa indicada, se llenarán los datos', 'info');
        this.vVehiculo = vehiculo[0];
        this.fnLLenarDatos(this.vVehiculo)
        this.fnBloquearControles();
      }
    } else {
      this.vVehiculo = null;
      this.fnDesbloquearControles();
    }

    if (this.vVehiculo == null) {
      this.fnAnadirVehiculoNuevo();
    } else {
      this.fnAnadirVehiculoExistente();
    }
  }

  fnAnadirVehiculoNuevo() {
    if (this.formVehiculo.invalid) {
      Swal.fire('¡Verificar!', 'Revise los campos ingresados', 'warning')
      return;
    }

    var vDatos = this.formVehiculo.value;

    var pEntidad = 3;
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(vDatos.cboTipo);
    pParametro.push(vDatos.txtPlaca.toUpperCase().trim());
    pParametro.push(vDatos.txtMarca.trim());
    pParametro.push(vDatos.txtColor.trim());
    pParametro.push(vDatos.txtAnio);
    pParametro.push(vDatos.txtModelo.trim());
    pParametro.push(vDatos.txtPasajero);
    pParametro.push(vDatos.txtPesoCarga);
    pParametro.push(vDatos.txtAlto);
    pParametro.push(vDatos.txtAncho);
    pParametro.push(vDatos.txtLargo);
    pParametro.push(vDatos.txtVolumenCarga);
    pParametro.push(vDatos.txtNumPuerta);
    pParametro.push(vDatos.cboFechaTecnica.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboFechaSoat.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboVenceCirculacion.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboVenceExtintor.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboFechaVenceCert.format('MM/DD/YYYY'));
    pParametro.push(vDatos.stLucky == false ? 0 : 1);
    pParametro.push(this.nIdEmpresaProveedor);
    pParametro.push(this.pPais);

    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 0) {
          Swal.fire('Error', 'No se pudo realizar el ingreso: Verifique su conexion a Internet', 'error');
        } else {
          Swal.fire({ position: 'center', icon: 'success', title: 'Correcto', text: 'Se guardo el vehiculo en el proveedor.', showConfirmButton: false, timer: 1500 });
          this.fnSalir();
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

  async fnAnadirVehiculoExistente() {

    var pEntidad1 = 1;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 6;       //Listar todos los registros de la tabla

    pParametro1.push(this.vVehiculo.nIdVehiculo);
    pParametro1.push(this.nIdEmpresaProveedor);

    //Verificando si ya existe el transporte en el proveedor
    const vehiculo = await this.vTransporteService.fnEmpresaTransporte(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url)
      .toPromise().catch(err => {
        return err;
      })

    if (vehiculo.error) {
      console.log(vehiculo)
    }

    if (vehiculo.length > 0) {
      Swal.fire('¡Verificar!', 'El vehiculo indicado ya se encuentra registrado en esta empresa', 'warning');
      return;
    }

    var pEntidad = 4;
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(this.vVehiculo.nIdVehiculo);
    pParametro.push(this.nIdEmpresaProveedor);

    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
            text: 'Se guardo el vehiculo en el proveedor.',
            showConfirmButton: false,
            timer: 1500
          });
          this.fnSalir();

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

  async fnGuardarVehiculo() {
    if (this.formVehiculo.invalid) {
      Swal.fire('¡Verificar!', 'Revise los campos ingresados', 'warning')
      return;
    }
    this.spinner.show();
    var vDatos = this.formVehiculo.value;

    var pEntidad1 = 3;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla

    var placa = vDatos.txtPlaca.toUpperCase().trim()
    pParametro1.push(vDatos.txtPlaca.toUpperCase().trim());
    var vehiculo;


    //Si cambio la placa validamos que no se encuentre en otro registro
    if (placa != this.pVehiculo.sPlaca) {
      try {
        vehiculo = await this.vTransporteService.fnEmpresaTransporte(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise();
        if (vehiculo.length > 0) {
          this.spinner.hide();
          Swal.fire('Advertencia', 'Ya hay un vehiculo registrado con la placa indicada', 'warning');
          return;
        }
      } catch (err) {
        console.log(err);
      }
    }

    var pEntidad = 3;
    var pOpcion = 3;  //CRUD -> actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.pVehiculo.nIdVehiculo);
    pParametro.push(vDatos.cboTipo);
    pParametro.push(vDatos.txtPlaca.toUpperCase().trim());
    pParametro.push(vDatos.txtMarca.trim());
    pParametro.push(vDatos.txtColor.trim());
    pParametro.push(vDatos.txtAnio);
    pParametro.push(vDatos.txtModelo.trim());
    pParametro.push(vDatos.txtPasajero);
    pParametro.push(vDatos.txtPesoCarga);
    pParametro.push(vDatos.txtAlto);
    pParametro.push(vDatos.txtAncho);
    pParametro.push(vDatos.txtLargo);
    pParametro.push(vDatos.txtVolumenCarga);
    pParametro.push(vDatos.txtNumPuerta);
    pParametro.push(vDatos.cboFechaTecnica.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboFechaSoat.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboVenceCirculacion.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboVenceExtintor.format('MM/DD/YYYY'));
    pParametro.push(vDatos.cboFechaVenceCert.format('MM/DD/YYYY'));
    pParametro.push(vDatos.stLucky == false ? 0 : 1);

    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 0) {
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar la actualización: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          ).then((result) => {
          });
        } else {
          //Registrado
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Correcto',
            text: 'Se actualizo el vehiculo en el proveedor.',
            showConfirmButton: false,
            timer: 1500
          });
          this.fnSalir();
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

  fnVerificarPlaca() {
    //Si se ha entrado para ver detalle que no llene datos 
    if (this.pVehiculo != null) {
      return;
    }
    var vDatos = this.formVehiculo.value;

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(vDatos.txtPlaca.toUpperCase().trim());

    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res.length > 0) {
          Swal.fire('Información', 'Se encontro un vehiculo con la placa indicada, se llenarán los datos', 'info');
          this.vVehiculo = res[0];
          this.fnLLenarDatos(this.vVehiculo)
          this.fnBloquearControles();
        } else {
          this.vVehiculo = null;
          this.fnDesbloquearControles();
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

  //Funciones de validacion
  fnEvitarEspacios(formControlName: string) {

    var valor = this.formVehiculo.get(formControlName).value;
    if (valor == null) return;
    this.formVehiculo.get(formControlName).setValue(valor.trimLeft());

  }

  fnEvitarEspaciosAmbosLados(formControlName: string) {

    var valor: string = this.formVehiculo.get(formControlName).value;
    if (valor == null) return;
    this.formVehiculo.get(formControlName).setValue(valor.replace(' ', ''));

  }

  fnRedondear(formControlName: string) {

    var valor: number = this.formVehiculo.get(formControlName).value;
    if (valor == null) return;
    this.formVehiculo.get(formControlName).setValue(Math.round(valor));

  }

  fnEvitarNegativos(formControlName: string) {

    var valor: number = this.formVehiculo.get(formControlName).value;
    if (valor == null) return;
    this.formVehiculo.get(formControlName).setValue(Math.abs(valor));

  }

  fnNCaracteres(formControlName: string, cantidadCaracteres: number) {
    var valorN = this.formVehiculo.get(formControlName).value
    if (valorN == null) { return; }
    var valor: string = valorN.toString();
    this.formVehiculo.get(formControlName).setValue(valor.substr(0, cantidadCaracteres));
  }

  //Funcion para generar descripcion
  get generarDescripcion() {
    var vDatos = this.formVehiculo.value;
    const placa = vDatos.txtPlaca.toUpperCase().trim();
    const color = vDatos.txtColor.trim();
    const marca = vDatos.txtMarca.trim();
    const anio = vDatos.txtAnio?.toString() ?? '';
    const modelo = vDatos.txtModelo.trim();
    return `${marca}, ${modelo}, ${color} Placa: ${placa} Año: ${anio}`;
  }

  //Funciones de llenado de datos al form 
  fnLLenarDatos(p: Vehiculo) {
    this.formVehiculo.controls.cboTipo.setValue(p.nIdTipoVehiculo);
    this.formVehiculo.controls.txtPlaca.setValue(p.sPlaca);
    this.formVehiculo.controls.txtMarca.setValue(p.sMarca);
    this.formVehiculo.controls.txtColor.setValue(p.sColor);
    this.formVehiculo.controls.txtModelo.setValue(p.sModelo);
    this.formVehiculo.controls.txtAnio.setValue(p.sAnio);
    this.formVehiculo.controls.txtPasajero.setValue(p.nPasajero);
    this.formVehiculo.controls.txtPesoCarga.setValue(p.nPesoCarga);
    this.formVehiculo.controls.txtAlto.setValue(p.nAlto);
    this.formVehiculo.controls.txtAncho.setValue(p.nAncho);
    this.formVehiculo.controls.txtLargo.setValue(p.nLargo);
    this.formVehiculo.controls.txtVolumenCarga.setValue(p.nVolumenCarga);
    this.formVehiculo.controls.txtNumPuerta.setValue(p.nNumPuerta);
    this.formVehiculo.controls.cboFechaTecnica.setValue(moment(p.dFechaTecnica, "YYYY-MM-DD"));
    this.formVehiculo.controls.cboFechaSoat.setValue(moment(p.dFechaSoat, "YYYY-MM-DD"));
    this.formVehiculo.controls.cboVenceCirculacion.setValue(moment(p.dVenceCirculacion, "YYYY-MM-DD"));
    this.formVehiculo.controls.cboVenceExtintor.setValue(moment(p.dVenceExtintor, "YYYY-MM-DD"));
    this.formVehiculo.controls.cboFechaVenceCert.setValue(moment(p.dFechaVenceCert, "YYYY-MM-DD"));
    this.formVehiculo.controls.stLucky.setValue(p.nLucky == 0 ? false : true);
  }

  fnLlenarDatosDetalle(p: Vehiculo_Empresa) {
    //Cuando viene con datos del componente anterior
    this.formVehiculo.controls.cboTipo.setValue(p.nIdTipoVehiculo);
    this.formVehiculo.controls.txtDescripcion.setValue(p.sDescripcion);
    this.formVehiculo.controls.txtPlaca.setValue(p.sPlaca);
    this.formVehiculo.controls.txtMarca.setValue(p.sMarca);
    this.formVehiculo.controls.txtColor.setValue(p.sColor);
    this.formVehiculo.controls.txtModelo.setValue(p.sModelo);
    this.formVehiculo.controls.txtAnio.setValue(p.sAnio);
    this.formVehiculo.controls.txtPasajero.setValue(p.nPasajero);
    this.formVehiculo.controls.txtPesoCarga.setValue(p.nPesoCarga);
    this.formVehiculo.controls.txtAlto.setValue(p.nAlto);
    this.formVehiculo.controls.txtAncho.setValue(p.nAncho);
    this.formVehiculo.controls.txtLargo.setValue(p.nLargo);
    this.formVehiculo.controls.txtVolumenCarga.setValue(p.nVolumenCarga);
    this.formVehiculo.controls.txtNumPuerta.setValue(p.nNumPuerta);
    this.formVehiculo.controls.cboFechaTecnica.setValue(moment(p.dFechaTecnica, "YYYY-MM-DD"));
    this.formVehiculo.controls.cboFechaSoat.setValue(moment(p.dFechaSoat, "YYYY-MM-DD"));
    this.formVehiculo.controls.cboVenceCirculacion.setValue(moment(p.dVenceCirculacion, "YYYY-MM-DD"));
    this.formVehiculo.controls.cboVenceExtintor.setValue(moment(p.dVenceExtintor, "YYYY-MM-DD"));
    this.formVehiculo.controls.cboFechaVenceCert.setValue(moment(p.dFechaVenceCert, "YYYY-MM-DD"));
    this.formVehiculo.controls.stLucky.setValue(p.nLucky == 0 ? false : true);
    this.txtEstado.setValue(p.sEstado);

    this.fnBloquearControles();
  }

  //Funcion para bloquear controles 
  fnBloquearControles() {
    this.bSoloLectura = true;
    this.formVehiculo.controls.cboFechaTecnica.disable();
    this.formVehiculo.controls.cboFechaSoat.disable();
    this.formVehiculo.controls.cboVenceCirculacion.disable();
    this.formVehiculo.controls.cboVenceExtintor.disable();
    this.formVehiculo.controls.cboFechaVenceCert.disable();
    this.formVehiculo.controls.stLucky.disable()
    this.formVehiculo.controls.cboTipo.disable();
  }

  fnDesbloquearControles() {
    this.bSoloLectura = false;
    this.formVehiculo.controls.cboFechaTecnica.enable();
    this.formVehiculo.controls.cboFechaSoat.enable();
    this.formVehiculo.controls.cboVenceCirculacion.enable();
    this.formVehiculo.controls.cboVenceExtintor.enable();
    this.formVehiculo.controls.cboFechaVenceCert.enable();
    this.formVehiculo.controls.stLucky.enable()
    this.formVehiculo.controls.cboTipo.enable();
  }

  fnModificar() {
    this.bModificando = true;
    this.bSoloLectura = false;
    this.formVehiculo.controls.cboFechaTecnica.enable();
    this.formVehiculo.controls.cboFechaSoat.enable();
    this.formVehiculo.controls.cboVenceCirculacion.enable();
    this.formVehiculo.controls.cboVenceExtintor.enable();
    this.formVehiculo.controls.cboFechaVenceCert.enable();
    this.formVehiculo.controls.stLucky.enable()
    this.formVehiculo.controls.cboTipo.enable();
  }

  //funciones para activar e inactivar 
  fnActivar() {
    Swal.fire({
      title: '¿Desea Seguir?',
      text: "Se activará el vehículo ¿Desea continuar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        var pEntidad = 4; //Cabecera 
        var pOpcion = 3;  //CRUD -> Actualizar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 0;

        pParametro.push(this.pVehiculo.nId)
        pParametro.push(589);

        this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
          res => {
            if (res == 1) {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Correcto',
                text: 'Se activo de manera correcta el registro.',
                showConfirmButton: false,
                timer: 1500
              });
              this.pVehiculo.nIdEstado = 589;
              this.txtEstado.setValue('Activo');
            } else {
              Swal.fire(
                'Error', //Titulo
                'No se pudo realizar la actualizacion: Verifique su conexion a Internet', //Mensaje html
                'error' //Tipo de mensaje
              )
            }
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
    })
  }

  fnInactivar() {
    Swal.fire({
      title: '¿Desea Seguir?',
      text: "Se inactivará el vehículo ¿Desea continuar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        var pEntidad = 4; //Cabecera 
        var pOpcion = 3;  //CRUD -> Actualizar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 0;

        pParametro.push(this.pVehiculo.nId)
        pParametro.push(591);

        this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
          res => {
            if (res == 1) {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Correcto',
                text: 'Se inactivo de manera correcta el registro.',
                showConfirmButton: false,
                timer: 1500
              });
              // Swal.fire('Correcto', 'Se inactivo de manera correcta el registro', 'success');
              this.pVehiculo.nIdEstado = 591;
              this.txtEstado.setValue('Inactivo');
            } else {
              Swal.fire(
                'Error', //Titulo
                'No se pudo realizar la actualizacion: Verifique su conexion a Internet', //Mensaje html
                'error' //Tipo de mensaje
              )
            }
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
    })
  }

  //Funciones de interaccion entre componentes
  fnSalir() {
    this.pMostrar.emit(0);
  }

  //#region Funcion de validacion
  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { caracterValidator: 'El texto no debe contener: "/", "|", "?"' } : null;
  }
  //#endregion

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }
}
