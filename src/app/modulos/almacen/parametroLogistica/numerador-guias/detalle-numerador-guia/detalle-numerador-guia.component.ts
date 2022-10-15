import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { DetalleNumerador, ListasGuia, NumeradorGuia, UsuarioNumerador } from '../../models/numerador-guia.model';
import { ParametroLogisticaService } from '../../parametro-logistica.service';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-detalle-numerador-guia',
  templateUrl: './detalle-numerador-guia.component.html',
  styleUrls: ['./detalle-numerador-guia.component.css']
})
export class DetalleNumeradorGuiaComponent implements OnInit {

  @Input() pGuia: NumeradorGuia;
  @Output() pMostrar = new EventEmitter<number>();

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual


  lDetalle: DetalleNumerador[] = [];
  vDetalleSeleccionada: DetalleNumerador;

  lEstado: ListasGuia[] = [];
  lUser: UsuarioNumerador[] = [];
  txtFiltro = new FormControl();

  //informacion de la guia numerador
  formInformacion: FormGroup;

  //Form para registrar
  formDetalle: FormGroup;

  //Form para actualizar
  formDetalleActualizar: FormGroup;
  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<DetalleNumerador>;
  displayedColumns = ['nId', 'sNombreUser', 'sUser', 'sTipoUser', 'sEstado'];

  @ViewChild('modalDetalle') modalDetalle: ElementRef;

  title: string;

  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar


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

    this.formDetalle = this.formBuilder.group({
      cboPersonal: ['', [Validators.required]],
      txtNombre: ['']
    })

    this.formDetalleActualizar = this.formBuilder.group({
      txtNombre: [''],
      txtUsername: [''],
      txtNivel: [''],
      cboEstado: ['', Validators.required]
    })

    this.formInformacion = this.formBuilder.group({
      txtTipo: [this.pGuia.sTipoDoc],
      txtCorrelativo: [this.pGuia.nGuia],
      txtEstado: [this.pGuia.sEstado],
    })

    this.fnListarDetalleGuia(this.pGuia);

  }

  fnListarDetalleGuia(p: NumeradorGuia) {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(p.nId);
    pParametro.push(this.idEmp);

    this.vParLogisticaService.fnNumeradorGuia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lDetalle = res;

        const detalle = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(detalle);
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

  fnListarUsuarios() {
    this.spinner.show();

    var pEntidad = 5;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);

    this.vParLogisticaService.fnNumeradorGuia(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lUser = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  async fnAnadirUsuario() {
    if (this.formDetalle.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var pEntidad1 = 4;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla

    pParametro1.push(this.pGuia.nId);
    pParametro1.push(this.idEmp);

    try {
      this.lDetalle = await this.vParLogisticaService.fnNumeradorGuia(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise()
    } catch (err) {
      console.log(err)
      this.spinner.hide();
      return;
    }

    var vDatosCC = this.formDetalle.value;
    var idUser = vDatosCC.cboPersonal.nId;

    //Verificando si la descripcion ya existe
    if (this.lDetalle.findIndex(item => item.nIdUsuario == idUser) != -1) {
      Swal.fire('¡Verificar!', 'El personal indicado ya existe en esta guía', 'warning')
      this.formDetalle.controls.cboPersonal.setValue("");
      this.formDetalle.controls.txtNombre.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad = 4; //Cabecera de detalle de guia.
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.pGuia.nId);
    pParametro.push(idUser);

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
            text: 'Se guardo el usuario asignado.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se guardo el usuario asignado.', 'success');
          this.formDetalle.controls.cboPersonal.setValue("");
          this.formDetalle.controls.txtNombre.setValue('');

          this.fnListarDetalleGuia(this.pGuia);
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

  fnGuardarDetalle() {
    if (this.formDetalleActualizar.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var vDatosCC = this.formDetalleActualizar.value;

    var pEntidad = 4; //Cabecera de detalle.
    var pOpcion = 3;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vDetalleSeleccionada.nId);
    pParametro.push(vDatosCC.cboEstado);

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
          //Swal.fire('Correcto', 'Se actualizo de manera correcta el registro', 'success')
          this.vDetalleSeleccionada.nIdEstado = this.formDetalleActualizar.controls.cboEstado.value;
          this.formDetalleActualizar.get('cboEstado').disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarDetalleGuia(this.pGuia);

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

  fnModificarDetalle() {
    this.pTipo = 2;
    this.formDetalleActualizar.get('cboEstado').enable();
  }

  fnSeleccionarDetalleGuia(row: DetalleNumerador) {
    this.vDetalleSeleccionada = row;
    this.fnListarEstado();

    this.formDetalleActualizar.controls.txtNombre.setValue(this.vDetalleSeleccionada.sUser);
    this.formDetalleActualizar.controls.txtUsername.setValue(this.vDetalleSeleccionada.sNombreUser);
    this.formDetalleActualizar.controls.txtNivel.setValue(this.vDetalleSeleccionada.sTipoUser);

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalDetalle.nativeElement.click();
    this.title = 'Modificar usuario de la serie';
    this.formDetalleActualizar.controls.cboEstado.setValue(this.vDetalleSeleccionada.nIdEstado);
    this.formDetalleActualizar.controls.cboEstado.disable();
  }

  fnAbrirModal() {
    this.modalDetalle.nativeElement.click();
    this.pOpcion = 1;
    this.fnListarUsuarios();
    this.title = 'Añadir usuario a la serie'
  }

  fnLimpiarModal() {
    this.formDetalle.controls.cboPersonal.setValue('');
    this.formDetalle.controls.txtNombre.setValue('');

    this.fnListarDetalleGuia(this.pGuia);
  }

  fnSeleccionarUsuario(p: UsuarioNumerador) {
    this.formDetalle.controls.txtNombre.setValue(p.sNombreUser);

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

  //Funciones de interaccion con los componentes
  fnRegresar() {
    this.pMostrar.emit(0);
  }
}
