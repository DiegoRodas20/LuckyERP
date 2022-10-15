import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Listas, OperacionAlmacenDestino, Operaciones_Traslado } from '../../models/matriz-permiso.model';
import { ParametroLogisticaService } from '../../parametro-logistica.service';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-almacen-destino-almacen',
  templateUrl: './almacen-destino-almacen.component.html',
  styleUrls: ['./almacen-destino-almacen.component.css']
})
export class AlmacenDestinoAlmacenComponent implements OnInit {

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  lOpAlmacenDest: OperacionAlmacenDestino[] = [];
  vOpAlmacenDest: OperacionAlmacenDestino;

  lOperacion: Operaciones_Traslado[] = [];
  lAlmacen: Listas[] = [];
  lAlmacenDestino: Operaciones_Traslado[] = [];
  lAlmacenDestinoOriginal: Operaciones_Traslado[] = [];
  lEstado: Listas[] = [];
  txtFiltro = new FormControl();
  formOpAlmacen: FormGroup;
  formOpAlmacenAct: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<OperacionAlmacenDestino>;
  displayedColumns = ['nId', 'sAlmacen', 'sOperacion', 'sAlmacenDestino', 'sEstado'];

  @ViewChild('modalOperacionAlm') modalOperacionAlm: ElementRef;

  title: string;

  //Se genera despues de escoger el maximo codigo y se le aumenta 1
  nCodigo: number = 0;
  sCodigo: string = "";
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

    this.formOpAlmacen = this.formBuilder.group({
      cboAlmacen: ['', Validators.required],
      cboOperacion: ['', Validators.required],
      cboAlmacenDestino: ['', Validators.required]
    });

    this.formOpAlmacenAct = this.formBuilder.group({
      txtAlmacen: ['', Validators.required],
      cboOperacion: ['', Validators.required],
      cboAlmacenDestino: ['', Validators.required],
      cboEstado: ['', Validators.required]
    });

    this.fnListarOperacionAlmacenDestino();
  }

  fnListarOperacionAlmacenDestino() {
    this.spinner.show();

    var pEntidad = 4;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);

    this.vParLogisticaService.fnMatrizPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lOpAlmacenDest = res;
        this.dataSource = new MatTableDataSource(this.lOpAlmacenDest);
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

  async fnListarAlmacen() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);
    pParametro.push(this.vOpAlmacenDest == null ? 0 : this.vOpAlmacenDest.nIdAlmacenDestino) //En caso el almacen se haya inactivado

    try {
      let almacen = await this.vParLogisticaService.fnMatrizPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.lAlmacen = almacen;
      this.lAlmacenDestino = almacen;
      this.lAlmacenDestinoOriginal = almacen;
      this.spinner.hide();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
    }
  }

  async fnListarOperacion() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;       //Listar todos los registros de la tabla

    pParametro.push(this.vOpAlmacenDest == null ? 0 : this.vOpAlmacenDest.nIdOperacion)//En caso la operacion se haya inactivado

    try {
      this.lOperacion = await this.vParLogisticaService.fnMatrizPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.spinner.hide();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
    }

  }

  fnListarEstado() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 4;       //Listar todos los registros de la tabla

    this.vParLogisticaService.fnMatrizPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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

  async fnAnadirAlmDestOperacion() {
    if (this.formOpAlmacen.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var vDatosCC = this.formOpAlmacen.value;
    var almacen: number = vDatosCC.cboAlmacen;
    var operacion: number = vDatosCC.cboOperacion;
    var opObject = this.lOperacion.find(item => item.nId == operacion);
    var almacenDestino: number = vDatosCC.cboAlmacenDestino;

    //Verificando que el almacen no sea igual al almacen destino
    if (almacenDestino == almacen && opObject.nEsBaja == 1) {
      Swal.fire('¡Verificar!', 'El almacén origen y el almacén destino no pueden ser iguales', 'warning')
      this.formOpAlmacen.controls.cboAlmacenDestino.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad1 = 4;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla
    pParametro1.push(this.pPais);

    //trayendo la lista actualizada
    try {
      this.lOpAlmacenDest = await this.vParLogisticaService.fnMatrizPermiso(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }

    //Verificando si el registro ya existe
    if (this.lOpAlmacenDest.findIndex(item => (item.nIdAlmacen == almacen) && (item.nIdOperacion == operacion) && (item.nIdAlmacenDestino == almacenDestino)) != -1) {
      Swal.fire('¡Verificar!', 'La operación y el almacén destino indicado ya existe en este almacén de origen', 'warning')
      this.formOpAlmacen.controls.cboOperacion.setValue('');
      this.formOpAlmacen.controls.cboAlmacenDestino.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad = 4; //Cabecera de operacion-almacen.
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;


    pParametro.push(vDatosCC.cboAlmacen);
    pParametro.push(vDatosCC.cboOperacion);
    pParametro.push(vDatosCC.cboAlmacenDestino);

    this.vParLogisticaService.fnMatrizPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
            text: 'Se guardo el almacén origen - almacén destino.',
            showConfirmButton: false,
            timer: 1500
          });
          // Swal.fire('Correcto', 'Se guardo el almacén origen - almacén destino.', 'success');
          this.formOpAlmacen.controls.cboAlmacen.setValue("");
          this.formOpAlmacen.controls.cboOperacion.setValue("");
          this.formOpAlmacen.controls.cboAlmacenDestino.setValue('');
          this.fnListarOperacionAlmacenDestino();
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

  async fnGuardarAlmDestOperacion() {
    if (this.formOpAlmacenAct.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();
    var vDatosCC = this.formOpAlmacenAct.value;

    var operacion = vDatosCC.cboOperacion
    var opObject = this.lOperacion.find(item => item.nId == operacion);
    var almacenDestino: number = vDatosCC.cboAlmacenDestino;
    var almacen = this.vOpAlmacenDest.nIdAlmacen;

    //Verificando que el almacen no sea igual al almacen destino
    if (almacenDestino == almacen && opObject.nEsBaja == 1) {
      Swal.fire('¡Verificar!', 'El almacén origen y el almacén destino no pueden ser iguales', 'warning')
      this.formOpAlmacen.controls.cboAlmacenDestino.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad1 = 4;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla
    pParametro1.push(this.pPais);

    //trayendo la lista actualizada
    try {
      this.lOpAlmacenDest = await this.vParLogisticaService.fnMatrizPermiso(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      return;
    }

    //Verificando si el registro ya existe
    if (this.lOpAlmacenDest.findIndex(item => (item.nIdAlmacen == this.vOpAlmacenDest.nIdAlmacen) && (item.nIdOperacion == operacion) && (item.nIdAlmacenDestino == almacenDestino) && (item.nId != this.vOpAlmacenDest.nId)) != -1) {
      Swal.fire('¡Verificar!', 'La operación y el almacén destino indicado ya existe en este almacén de origen', 'warning')
      this.formOpAlmacen.controls.cboOperacion.setValue('');
      this.formOpAlmacen.controls.cboAlmacenDestino.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad = 4; //Cabecera de alm. usuario
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vOpAlmacenDest.nId);
    pParametro.push(vDatosCC.cboEstado);
    pParametro.push(vDatosCC.cboOperacion);
    pParametro.push(vDatosCC.cboAlmacenDestino);


    this.vParLogisticaService.fnMatrizPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
          this.vOpAlmacenDest.nIdEstado = this.formOpAlmacenAct.controls.cboEstado.value;
          this.formOpAlmacenAct.get('cboEstado').disable();
          this.formOpAlmacenAct.controls.cboOperacion.disable();
          this.formOpAlmacenAct.controls.cboAlmacenDestino.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarOperacionAlmacenDestino();
        } else {
          Swal.fire(
            'Error', //Titulo
            'No se pudo realizar la actualizacion: Verifique su conexion a Internet', //Mensaje html
            'error' //Tipo de mensaje
          )
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

  fnModificarAlmDestOperacion() {
    this.pTipo = 2;
    this.formOpAlmacenAct.get('cboEstado').enable();
    this.formOpAlmacenAct.controls.cboOperacion.enable();
    this.formOpAlmacenAct.controls.cboAlmacenDestino.enable();
  }

  fnAbrirModal() {
    this.modalOperacionAlm.nativeElement.click();
    this.pOpcion = 1;
    this.fnListarAlmacen();
    this.fnListarOperacion();
    this.title = 'Añadir Almacén origen - Almacén destino'
  }

  async fnSeleccionarOpAlmacenDest(row: OperacionAlmacenDestino) {
    this.vOpAlmacenDest = row;

    this.formOpAlmacenAct.controls.txtAlmacen.setValue(this.vOpAlmacenDest.sAlmacen)

    await this.fnListarOperacion();
    await this.fnListarAlmacen();

    this.formOpAlmacenAct.controls.cboOperacion.setValue(row.nIdOperacion)
    this.fnFiltrarOperacion(row.nIdOperacion)
    this.formOpAlmacenAct.controls.cboAlmacenDestino.setValue(row.nIdAlmacenDestino);
    this.fnListarEstado();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalOperacionAlm.nativeElement.click();
    this.title = 'Modificar Almacén origen - Almacén destino';
    this.formOpAlmacenAct.controls.cboEstado.setValue(this.vOpAlmacenDest.nIdEstado);
    this.formOpAlmacenAct.controls.cboOperacion.disable();
    this.formOpAlmacenAct.controls.cboAlmacenDestino.disable();
    this.formOpAlmacenAct.controls.cboEstado.disable();

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

  fnLimpiarModal() {
    this.lAlmacen = [];
    this.lAlmacenDestino = [];
    this.lAlmacenDestinoOriginal = [];
    this.lOperacion = [];
    this.lEstado = [];
    this.vOpAlmacenDest = null;
    this.formOpAlmacen.controls.cboOperacion.setValue('');
    this.formOpAlmacen.controls.cboAlmacen.setValue('');
    this.formOpAlmacen.controls.cboAlmacenDestino.setValue('');

    this.formOpAlmacenAct.controls.cboOperacion.setValue('');
    this.formOpAlmacenAct.controls.txtAlmacen.setValue('');
    this.formOpAlmacenAct.controls.cboAlmacenDestino.setValue('');
    this.formOpAlmacenAct.controls.cboEstado.setValue('');

    this.fnListarOperacionAlmacenDestino();
  }

  fnFiltrarOperacion(nIdOperacion: number) {
    let p = this.lOperacion.find(item => item.nId == nIdOperacion);
    if (p != null && p.nEsBaja == 1) {
      this.formOpAlmacen.controls.cboAlmacenDestino.setValue('');
      this.formOpAlmacenAct.controls.cboAlmacenDestino.setValue('');
      this.lAlmacenDestino = this.lAlmacenDestinoOriginal.filter(item => item.nEsBaja == 1)
    } else {
      this.lAlmacenDestino = this.lAlmacenDestinoOriginal
    }
  }

}
