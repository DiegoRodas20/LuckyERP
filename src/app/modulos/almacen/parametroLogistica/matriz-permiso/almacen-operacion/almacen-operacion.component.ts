import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Listas, OperacionAlmacen } from '../../models/matriz-permiso.model';
import { ParametroLogisticaService } from '../../parametro-logistica.service';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-almacen-operacion',
  templateUrl: './almacen-operacion.component.html',
  styleUrls: ['./almacen-operacion.component.css']
})
export class AlmacenOperacionComponent implements OnInit {

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  lOpAlmacen: OperacionAlmacen[] = [];
  vOpAlmacen: OperacionAlmacen;

  lOperacion: Listas[] = [];
  lAlmacen: Listas[] = [];
  lEstado: Listas[] = [];
  txtFiltro = new FormControl();
  formOpAlmacen: FormGroup;
  formOpAlmacenAct: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<OperacionAlmacen>;
  displayedColumns = ['nId', 'sAlmacen', 'sOperacion', 'sEstado'];

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
      cboOperacion: ['', Validators.required]
    });

    this.formOpAlmacenAct = this.formBuilder.group({
      txtAlmacen: ['', Validators.required],
      txtOperacion: ['', Validators.required],
      cboEstado: ['', Validators.required]
    });

    this.fnListarOperacionAlmacen();
  }

  fnListarOperacionAlmacen() {
    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);

    this.vParLogisticaService.fnMatrizPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lOpAlmacen = res;

        const opAlmacen = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(opAlmacen);
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

  fnListarAlmacen() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);

    this.vParLogisticaService.fnMatrizPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lAlmacen = res;
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarOperacion() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 5;       //Listar todos los registros de la tabla

    this.vParLogisticaService.fnMatrizPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lOperacion = res;
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


  async fnAnadirAlmOperacion() {
    if (this.formOpAlmacen.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var vDatosCC = this.formOpAlmacen.value;
    var almacen: number = vDatosCC.cboAlmacen;
    var operacion: number = vDatosCC.cboOperacion;


    var pEntidad1 = 3;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla
    pParametro1.push(this.pPais);

    try {
      this.lOpAlmacen = await this.vParLogisticaService.fnMatrizPermiso(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise()
    } catch (err) {
      console.log(err)
      this.spinner.hide();
      return;
    }

    //Verificando si la operacion ya existe
    if (this.lOpAlmacen.findIndex(item => (item.nIdAlmacen == almacen) && (item.nIdOperacion == operacion)) != -1) {
      Swal.fire('¡Verificar!', 'La operación indicada ya existe en este almacén', 'warning')
      this.formOpAlmacen.controls.cboOperacion.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad = 3; //Cabecera de operacion-almacen.
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(vDatosCC.cboAlmacen);
    pParametro.push(vDatosCC.cboOperacion);

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
            text: 'Se guardo el almacén - operación.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se guardo el almacén - operación.', 'success');
          this.formOpAlmacen.controls.cboAlmacen.setValue("");
          this.formOpAlmacen.controls.cboOperacion.setValue("");

          this.fnListarOperacionAlmacen();
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

  fnGuardarAlmOperacion() {
    if (this.formOpAlmacenAct.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var vDatosCC = this.formOpAlmacenAct.value;

    var pEntidad = 3; //Cabecera de alm. usuario
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vOpAlmacen.nId);
    pParametro.push(vDatosCC.cboEstado);

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
          //Swal.fire('Correcto', 'Se actualizo de manera correcta el registro', 'success')
          this.vOpAlmacen.nIdEstado = this.formOpAlmacenAct.controls.cboEstado.value;
          this.formOpAlmacenAct.get('cboEstado').disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarOperacionAlmacen();
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

  fnModificarAlmOperacion() {
    this.pTipo = 2;
    this.formOpAlmacenAct.get('cboEstado').enable();
  }

  fnAbrirModal() {
    this.modalOperacionAlm.nativeElement.click();
    this.pOpcion = 1;
    this.fnListarAlmacen();
    this.fnListarOperacion();
    this.title = 'Añadir Almacén - Operación'
  }

  fnSeleccionarOpAlmacen(row: OperacionAlmacen) {
    this.vOpAlmacen = row;

    this.formOpAlmacenAct.controls.txtAlmacen.setValue(this.vOpAlmacen.sAlmacen)
    this.formOpAlmacenAct.controls.txtOperacion.setValue(this.vOpAlmacen.sOperacion)

    this.fnListarEstado();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalOperacionAlm.nativeElement.click();
    this.title = 'Modificar Almacén - Operación';
    this.formOpAlmacenAct.controls.cboEstado.setValue(this.vOpAlmacen.nIdEstado);
    this.formOpAlmacenAct.controls.cboEstado.disable();
  }

  fnLimpiarModal() {

    this.lAlmacen = [];
    this.lOperacion = [];
    this.lEstado = [];

    this.formOpAlmacen.controls.cboOperacion.setValue('');
    this.formOpAlmacen.controls.cboAlmacen.setValue('');

    this.formOpAlmacenAct.controls.txtOperacion.setValue('');
    this.formOpAlmacenAct.controls.txtAlmacen.setValue('');
    this.formOpAlmacenAct.controls.cboEstado.setValue('');

    this.fnListarOperacionAlmacen();
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
}
