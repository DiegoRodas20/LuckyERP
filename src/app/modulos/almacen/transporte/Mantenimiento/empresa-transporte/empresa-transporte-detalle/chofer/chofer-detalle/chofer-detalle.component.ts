import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { TransporteService } from '../../../../../transporte.service';
import { Chofer, Chofer_Empresa, input_Chofer } from '../../../../models/Chofer.model';
import { ListasTransporte } from '../../../../models/EmpresaTransporte.model';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-chofer-detalle',
  templateUrl: './chofer-detalle.component.html',
  styleUrls: ['./chofer-detalle.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class ChoferDetalleComponent implements OnInit {

  lTipoDoc: ListasTransporte[] = [];
  formChofer: FormGroup;
  bSoloLectura: boolean = false;
  bModificando: boolean = false

  pChoferEmpresa: input_Chofer;

  //Cuando se abre para ver detalle del chofer
  //formChoferDetalle: FormGroup;

  //En caso el documento ya exista traemos los datos del vehiculo
  vChofer: Chofer;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  title: string;

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vTransporteService: TransporteService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private data: input_Chofer,
    public dialogRef: MatDialogRef<ChoferDetalleComponent>,
    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; this.pChoferEmpresa = data }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formChofer = this.formBuilder.group({
      cboTipoDoc: ['', Validators.required],
      txtNumDoc: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), this.caracterValidator]],
      txtBrevete: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), this.caracterValidator]],
      cboFechaVence: ['', [Validators.required]],
      txtPrimerNom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), this.caracterValidator]],
      txtSegNombre: ['', [Validators.maxLength(50), this.caracterValidator]],
      txtApePaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), this.caracterValidator]],
      txtApeMaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), this.caracterValidator]],
      txtEstado: ['']
    })

  }

  ngAfterViewInit() {
    setTimeout(() => {

      //Para que no haya error de ngAfterContentChecked
      if (this.pChoferEmpresa.vChofer == null) {
        this.fnListarTipoDoc();
        this.title = 'Añadir chofer'
      } else {
        this.fnListarTipoDoc();
        this.fnLlenarDatosDetalle(this.pChoferEmpresa.vChofer)
        this.title = `Chofer: ${this.pChoferEmpresa.vChofer.sNumDocumento} - ${this.pChoferEmpresa.vChofer.sApeCompleto} ${this.pChoferEmpresa.vChofer.sNombreCompleto}`
      }
    });
  }

  fnListarTipoDoc() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 8;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);

    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lTipoDoc = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnAnadirChofer() {
    if (this.vChofer == null) {
      this.fnAnadirChoferNuevo();
    } else {
      this.fnAnadirChoferExistente();
    }
  }

  fnAnadirChoferNuevo() {
    if (this.formChofer.invalid) {
      Swal.fire('¡Verificar!', 'Revise los campos ingresados', 'warning');
      return;
    }
    this.spinner.show();

    var vDatos = this.formChofer.value;

    var pEntidad = 6;
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla


    pParametro.push(vDatos.cboTipoDoc);
    pParametro.push(vDatos.txtNumDoc.toUpperCase().trim());
    pParametro.push(vDatos.txtBrevete.toUpperCase().trim());
    pParametro.push(vDatos.cboFechaVence.format('MM/DD/YYYY'));
    pParametro.push(vDatos.txtPrimerNom.trim());
    pParametro.push(vDatos.txtSegNombre.trim());
    pParametro.push(vDatos.txtApePaterno.trim());
    pParametro.push(vDatos.txtApeMaterno.trim());
    pParametro.push(this.pChoferEmpresa.nIdEmpresaTransporte);
    pParametro.push(this.pPais);

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
            text: 'Se guardo el chofer en el proveedor.',
            showConfirmButton: false,
            timer: 1500
          });
          this.dialogRef.close(true)
          //this.fnSalir();
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

  async fnAnadirChoferExistente() {
    var pEntidad1 = 1;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 9;       //Listar todos los registros de la tabla

    this.spinner.show();

    pParametro1.push(this.vChofer.nId);
    pParametro1.push(this.pChoferEmpresa.nIdEmpresaTransporte);

    var chofer;
    //Verificando si ya existe el chofer
    try {
      chofer = await this.vTransporteService.fnEmpresaTransporte(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise()
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }

    if (chofer.length > 0) {
      Swal.fire('¡Verificar!', 'El chofer indicado ya se encuentra registrado en esta empresa', 'warning');
      this.spinner.hide();
      return;
    }

    var pEntidad = 7;
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(this.vChofer.nId);
    pParametro1.push(this.pChoferEmpresa.nIdEmpresaTransporte);

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
            text: 'Se guardo el chofer en el proveedor.',
            showConfirmButton: false,
            timer: 1500
          });
          this.spinner.hide();
          this.dialogRef.close(true)
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

  async fnGuardarChofer() {
    if (this.formChofer.invalid) {
      Swal.fire('¡Verificar!', 'Revise los campos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var vDatos = this.formChofer.value;

    var pEntidad1 = 6;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla

    pParametro1.push(vDatos.txtNumDoc.toUpperCase().trim());
    pParametro1.push(vDatos.cboTipoDoc);
    var documento = vDatos.txtNumDoc.toUpperCase().trim();
    var tipoDoc = vDatos.cboTipoDoc

    var chofer;


    //Si cambio el doc. o el tipoDoc validamos que no se encuentre en otro registro
    if (documento != this.pChoferEmpresa.vChofer.sNumDocumento || tipoDoc != this.pChoferEmpresa.vChofer.nIdTipoDoc) {
      try {
        chofer = await this.vTransporteService.fnEmpresaTransporte(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise();
        if (chofer.length > 0) {
          this.spinner.hide();
          Swal.fire('Advertencia', 'Ya hay un chofer registrado con el número de documento indicado', 'warning');
          this.spinner.hide();
          return;
        }
      } catch (err) {
        console.log(err);
        this.spinner.hide();
        return;
      }
    }

    var pEntidad = 6;
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(this.pChoferEmpresa.vChofer.nIdChofer);
    pParametro.push(vDatos.cboTipoDoc);
    pParametro.push(vDatos.txtNumDoc.toUpperCase().trim());
    pParametro.push(vDatos.txtBrevete.toUpperCase().trim());
    pParametro.push(vDatos.cboFechaVence.format('MM/DD/YYYY'));
    pParametro.push(vDatos.txtPrimerNom.trim());
    pParametro.push(vDatos.txtSegNombre.trim());
    pParametro.push(vDatos.txtApePaterno.trim());
    pParametro.push(vDatos.txtApeMaterno.trim());

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
            text: 'Se actualizo el registro de chofer.',
            showConfirmButton: false,
            timer: 1500
          });
          this.spinner.hide();
          this.dialogRef.close(true);
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

  fnVerificarDocumento() {
    if (this.pChoferEmpresa.vChofer != null) {
      return;
    }

    if (this.formChofer.controls.cboTipoDoc.value == '' || this.formChofer.controls.txtNumDoc.value == '') {
      return;
    }

    var vDatos = this.formChofer.value;

    var pEntidad = 6;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(vDatos.txtNumDoc.toUpperCase().trim());
    pParametro.push(vDatos.cboTipoDoc);

    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res.length > 0) {
          Swal.fire('Información', 'Se encontro un chofer con la información indicada, se llenarán los datos', 'info');
          this.vChofer = res[0];
          this.fnLlenarDatos(this.vChofer)
          this.fnBloquearControles();
        } else {
          this.vChofer = null;
          this.fnDesbloquearControles();
          //this.fnVaciarDatos();
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

  fnLlenarDatosDetalle(p: Chofer_Empresa) {
    this.formChofer.controls.cboTipoDoc.setValue(p.nIdTipoDoc);
    this.formChofer.controls.txtNumDoc.setValue(p.sNumDocumento);
    this.formChofer.controls.txtBrevete.setValue(p.sBrevete);
    this.formChofer.controls.cboFechaVence.setValue(moment(p.dVence, "DD-MM-YYYY"));
    this.formChofer.controls.txtPrimerNom.setValue(p.sPrimerNom);
    this.formChofer.controls.txtSegNombre.setValue(p.sSegundoNom);
    this.formChofer.controls.txtApePaterno.setValue(p.sApePaterno);
    this.formChofer.controls.txtApeMaterno.setValue(p.sApeMaterno);
    this.formChofer.controls.txtEstado.setValue(p.sEstado);

    this.formChofer.controls.cboTipoDoc.disable();
    this.fnBloquearControles();
  }

  fnLlenarDatos(p: Chofer) {
    this.formChofer.controls.txtNumDoc.setValue(p.sNumDocumento);
    this.formChofer.controls.txtBrevete.setValue(p.sBrevete);
    this.formChofer.controls.cboFechaVence.setValue(moment(p.dVence, "DD-MM-YYYY"));
    this.formChofer.controls.txtPrimerNom.setValue(p.sPrimerNom);
    this.formChofer.controls.txtSegNombre.setValue(p.sSegundoNom);
    this.formChofer.controls.txtApePaterno.setValue(p.sApePaterno);
    this.formChofer.controls.txtApeMaterno.setValue(p.sApeMaterno);
  }

  //Funcion para bloquear controles 
  fnBloquearControles() {
    this.bSoloLectura = true;
    this.formChofer.controls.cboFechaVence.disable();
  }

  fnDesbloquearControles() {
    this.bSoloLectura = false;
    this.formChofer.controls.cboFechaVence.enable();
  }

  fnModificar() {
    this.bModificando = true;
    this.bSoloLectura = false;
    this.formChofer.controls.cboTipoDoc.enable();
    this.fnDesbloquearControles();
  }

  //Funciones de validacion
  fnEvitarEspacios(formControlName: string) {

    var valor = this.formChofer.get(formControlName).value;
    if (valor == null) return;
    this.formChofer.get(formControlName).setValue(valor.trimLeft());

  }

  fnEvitarEspaciosAmbosLados(formControlName: string) {

    var valor: string = this.formChofer.get(formControlName).value;
    if (valor == null) return;
    this.formChofer.get(formControlName).setValue(valor.replace(' ', ''));

  }

  fnRedondear(formControlName: string) {

    var valor: number = this.formChofer.get(formControlName).value;
    if (valor == null) return;
    this.formChofer.get(formControlName).setValue(Math.round(valor));

  }

  fnEvitarNegativos(formControlName: string) {

    var valor: number = this.formChofer.get(formControlName).value;
    if (valor == null) return;
    this.formChofer.get(formControlName).setValue(Math.abs(valor));

  }

  //funciones para activar e inactivar 
  fnActivar() {
    Swal.fire({
      title: '¿Desea Seguir?',
      text: "Se activará el chofer ¿Desea continuar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        var pEntidad = 7; //Cabecera 
        var pOpcion = 3;  //CRUD -> Actualizar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 0;

        pParametro.push(this.pChoferEmpresa.vChofer.nId)
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
              this.pChoferEmpresa.vChofer.nIdEstado = 589;
              this.formChofer.controls.txtEstado.setValue('Activo');
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
      text: "Se inactivará el chofer ¿Desea continuar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        var pEntidad = 7; //Cabecera 
        var pOpcion = 3;  //CRUD -> Actualizar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 0;

        pParametro.push(this.pChoferEmpresa.vChofer.nId)
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
              this.pChoferEmpresa.vChofer.nIdEstado = 591;
              this.formChofer.controls.txtEstado.setValue('Inactivo');
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

  //#region Funcion de validacion
  caracterValidator(control: AbstractControl): ValidationErrors | null {
    const caracteres = /^[^|?/]*$/;   // /[^|?/]/
    const valid = caracteres.test(control.value);
    return !valid ? { caracterValidator: 'El texto no debe contener: "/", "|", "?"' } : null;
  }
  //#endregion
}
