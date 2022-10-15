import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { TransporteService } from '../../../transporte.service';
import { EmpresaTransporte, Proveedor } from '../../models/EmpresaTransporte.model';
import { VehiculoComponent } from './vehiculo/vehiculo.component';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-empresa-transporte-detalle',
  templateUrl: './empresa-transporte-detalle.component.html',
  styleUrls: ['./empresa-transporte-detalle.component.css'],
  animations: [asistenciapAnimations]
})
export class EmpresaTransporteDetalleComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  @ViewChild('vehiculoComponent') vehiculoComponent: VehiculoComponent;
  @ViewChild('matExpInformacionCel') matExpInformacionCel: MatExpansionPanel;

  formProveedor: FormGroup;
  lProveedor: Proveedor[];

  nIdEmpresaProveedor: number;
  nIdEstado: number;
  index: number;


  txtProveedor = new FormControl();
  @Input() pEmpresa: EmpresaTransporte;
  @Input() isNew: boolean;
  @Input() isVehiculo: boolean;
  @Output() pMostrar = new EventEmitter<number>();

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  title: string;

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
    this.index = this.isNew ? this.isVehiculo ? 0 : 1 : 0;

    this.formProveedor = this.formBuilder.group({
      cboProveedor: ['', Validators.required],
      txtRUC: [''],
      txtContacto: [''],
      txtDireccion: [''],
      txtDistrito: [''],
      txtProvincia: [''],
      txtDepartamento: [''],
      txtTelefono1: [''],
      txtCorreo: [''],
      txtEstado: ['']
    })
    this.onToggleFab(1, -1)

    if (this.pEmpresa != null) {
      this.fnLlenarDatosProveedor();
      this.nIdEmpresaProveedor = this.pEmpresa.nId;
      this.nIdEstado = this.pEmpresa.nIdEstado;
      this.formProveedor.controls.txtEstado.setValue(this.pEmpresa.sEstado);
      this.title = `Proveedor: ${this.pEmpresa.sRUC} - ${this.pEmpresa.sNombreComercial}`
    } else {
      this.nIdEmpresaProveedor = 0;
      this.nIdEstado = 589;
      this.title = "Agregar proveedor de transporte";
      this.formProveedor.controls.txtEstado.setValue('Activo');
      this.fnListarProveedor();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {

      //Para que no haya error de ngAfterContentChecked
      if (this.pEmpresa != null) {
        this.matExpInformacionCel.close();

      } else {
        this.matExpInformacionCel.open();
      }
    });

  }
  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  fnListarProveedor() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);

    this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lProveedor = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnAgregarProveedor() {
    var vDatos = this.formProveedor.controls.cboProveedor.value;
    if (vDatos == null || vDatos == '') {
      Swal.fire('¡Verificar!', 'Seleccione un proveedor para agregar', 'warning')
      return;
    }

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 5;       //Listar todos los registros de la tabla


    pParametro.push(vDatos.nId);
    try {
      const proveedor = await this.vTransporteService.fnEmpresaTransporte(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      if (proveedor.length > 0) {
        Swal.fire('¡Verificar!', 'El proveedor indicado ya se encuentra registrado', 'warning')
        this.spinner.hide();
        return;
      }
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }

    var pEntidad1 = 2;
    var pOpcion1 = 1;  //CRUD -> Insertar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 0;       //Listar todos los registros de la tabla

    pParametro1.push(vDatos.nId);
    this.vTransporteService.fnEmpresaTransporte(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).subscribe(
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
            text: 'Se guardo el proveedor.',
            showConfirmButton: false,
            timer: 1500
          });
          this.nIdEmpresaProveedor = res;
          this.txtProveedor.setValue(vDatos.sRazonSocial);
          this.title = `Proveedor: ${vDatos.sRUC} - ${vDatos.sNombreComercial}`
          this.nIdEstado = 589;
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

  fnSeleccionarProveedor(p: Proveedor) {
    this.formProveedor.controls.cboProveedor.setValue(p);//Dando valor para que se repita en mobile 
    this.formProveedor.controls.txtRUC.setValue(p.sRUC);
    this.formProveedor.controls.txtContacto.setValue(p.sContacto);
    this.formProveedor.controls.txtDireccion.setValue(p.sDireccion);
    this.formProveedor.controls.txtDistrito.setValue(p.sDistrito);
    this.formProveedor.controls.txtProvincia.setValue(p.sProvincia);
    this.formProveedor.controls.txtDepartamento.setValue(p.sDepartamento);
    this.formProveedor.controls.txtTelefono1.setValue(p.sTelefono1);
    this.formProveedor.controls.txtCorreo.setValue(p.sCorreo);
  }

  fnLlenarDatosProveedor() {
    this.txtProveedor.setValue(this.pEmpresa.sRazonSocial);
    this.formProveedor.controls.txtRUC.setValue(this.pEmpresa.sRUC);
    this.formProveedor.controls.txtContacto.setValue(this.pEmpresa.sContacto);
    this.formProveedor.controls.txtDireccion.setValue(this.pEmpresa.sDireccion);
    this.formProveedor.controls.txtDistrito.setValue(this.pEmpresa.sDistrito);
    this.formProveedor.controls.txtProvincia.setValue(this.pEmpresa.sProvincia);
    this.formProveedor.controls.txtDepartamento.setValue(this.pEmpresa.sDepartamento);
    this.formProveedor.controls.txtTelefono1.setValue(this.pEmpresa.sTelefono1);
    this.formProveedor.controls.txtCorreo.setValue(this.pEmpresa.sCorreo);
  }

  fnActivarEmpresa() {
    Swal.fire({
      title: '¿Desea Seguir?',
      text: "Se activará el proveedor ¿Desea continuar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        var pEntidad = 2; //Cabecera 
        var pOpcion = 3;  //CRUD -> Actualizar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 0;

        pParametro.push(this.nIdEmpresaProveedor)
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
              //Swal.fire('Correcto', 'Se activo de manera correcta el registro', 'success');
              this.nIdEstado = 589;
              this.formProveedor.controls.txtEstado.setValue('Activo');
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

  fnInactivarEmpresa() {
    Swal.fire({
      title: '¿Desea Seguir?',
      text: "Se inactivará el proveedor ¿Desea continuar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        var pEntidad = 2; //Cabecera 
        var pOpcion = 3;  //CRUD -> Actualizar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 0;

        pParametro.push(this.nIdEmpresaProveedor)
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
              this.nIdEstado = 591;
              this.formProveedor.controls.txtEstado.setValue('Inactivo');
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

  //Funcion de interaccion con componentes
  fnRegresar() {
    this.pMostrar.emit(0);
  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }
}
