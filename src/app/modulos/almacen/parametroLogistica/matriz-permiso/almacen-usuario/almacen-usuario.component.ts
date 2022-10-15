import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { Listas, UsuarioAlmacen } from '../../models/matriz-permiso.model';
import { ParametroLogisticaService } from '../../parametro-logistica.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-almacen-usuario',
  templateUrl: './almacen-usuario.component.html',
  styleUrls: ['./almacen-usuario.component.css']
})
export class AlmacenUsuarioComponent implements OnInit {

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  lUsrAlmacen: UsuarioAlmacen[] = [];
  vUsrAlmacen: UsuarioAlmacen;

  lUsuario: Listas[] = [];
  lAlmacen: Listas[] = [];
  lEstado: Listas[] = [];
  txtFiltro = new FormControl();
  formUsrAlmacen: FormGroup;
  formUsrAlmacenAct: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<UsuarioAlmacen>;
  displayedColumns = ['nId', 'sAlmacen', 'sUsuario', 'sEstado'];

  @ViewChild('modalUsuarioAlm') modalUsuarioAlm: ElementRef;

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

    this.formUsrAlmacen = this.formBuilder.group({
      cboAlmacen: ['', Validators.required],
      cboUsuario: ['', Validators.required],
      stPicking: [false]
    });

    this.formUsrAlmacenAct = this.formBuilder.group({
      txtAlmacen: ['', Validators.required],
      txtUsuario: ['', Validators.required],
      cboEstado: ['', Validators.required],
      stPicking: [false]
    });

    this.fnListarUsuarioAlmacen();
  }

  fnListarUsuarioAlmacen() {
    this.spinner.show();

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);

    this.vParLogisticaService.fnMatrizPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lUsrAlmacen = res;

        const usrAlmacen = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(usrAlmacen);
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

  fnListarUsuario() {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los registros de la tabla

    pParametro.push(this.idEmp);

    this.vParLogisticaService.fnMatrizPermiso(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lUsuario = res;
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

  async fnAnadirAlmUsr() {
    if (this.formUsrAlmacen.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var vDatosCC = this.formUsrAlmacen.value;
    var almacen: number = vDatosCC.cboAlmacen;
    var usuario: number = vDatosCC.cboUsuario;

    var pEntidad1 = 2;
    var pOpcion1 = 2;  //CRUD -> Listar
    var pParametro1 = []; //Parametros de campos vacios
    var pTipo1 = 1;       //Listar todos los registros de la tabla

    pParametro1.push(this.idEmp);

    //Trayendo la lista actualizada
    try {
      this.lUsrAlmacen = await this.vParLogisticaService.fnMatrizPermiso(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).toPromise();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
      return;
    }

    //Verificando si el usuario ya existe
    if (this.lUsrAlmacen.findIndex(item => (item.nIdAlmacen == almacen) && (item.nIdUsuario == usuario)) != -1) {
      Swal.fire('¡Verificar!', 'El usuario indicado ya existe en este almacén', 'warning')
      this.formUsrAlmacen.controls.cboUsuario.setValue('');
      this.spinner.hide();
      return;
    }

    var pEntidad = 2; //Cabecera de  usuario-almacen.
    var pOpcion = 1;  //CRUD -> Insertar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(vDatosCC.cboAlmacen);
    pParametro.push(vDatosCC.cboUsuario);
    pParametro.push(vDatosCC.stPicking == false ? 0 : 1);
    pParametro.push(this.pPais);

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
            text: 'Se guardo el almacén - usuario.',
            showConfirmButton: false,
            timer: 1500
          });
          //Swal.fire('Correcto', 'Se guardo el almacén - usuario.', 'success');
          this.formUsrAlmacen.controls.cboAlmacen.setValue("");
          this.formUsrAlmacen.controls.cboUsuario.setValue("");

          this.fnListarUsuarioAlmacen();
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

  fnGuardarAlmUsr() {
    if (this.formUsrAlmacenAct.invalid) {
      Swal.fire('¡Verificar!', 'Verificar los datos ingresados', 'warning')
      return;
    }

    this.spinner.show();

    var vDatosCC = this.formUsrAlmacenAct.value;
    var pEntidad = 2; //Cabecera de alm. usuario
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.vUsrAlmacen.nId);
    pParametro.push(vDatosCC.cboEstado);
    pParametro.push(vDatosCC.stPicking == false ? 0 : 1);
    pParametro.push(this.idUser);
    pParametro.push(this.pPais);

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
          this.vUsrAlmacen.nIdEstado = this.formUsrAlmacenAct.controls.cboEstado.value;
          this.formUsrAlmacenAct.get('cboEstado').disable();
          this.formUsrAlmacenAct.get('stPicking').disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarUsuarioAlmacen();
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

  fnModificarAlmUsr() {
    this.pTipo = 2;
    this.formUsrAlmacenAct.get('cboEstado').enable();
    this.formUsrAlmacenAct.get('stPicking').enable();
  }

  fnSeleccionarUsrAlmacen(row: UsuarioAlmacen) {
    this.vUsrAlmacen = row;

    this.formUsrAlmacenAct.controls.txtUsuario.setValue(this.vUsrAlmacen.sUsuario)
    this.formUsrAlmacenAct.controls.txtAlmacen.setValue(this.vUsrAlmacen.sAlmacen)
    this.formUsrAlmacenAct.controls.stPicking.setValue(this.vUsrAlmacen.nNoPicking == 0 ? false : true)

    this.fnListarEstado();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalUsuarioAlm.nativeElement.click();
    this.title = 'Modificar Almacén - Usuario';
    this.formUsrAlmacenAct.controls.cboEstado.setValue(this.vUsrAlmacen.nIdEstado);
    this.formUsrAlmacenAct.controls.cboEstado.disable();
    this.formUsrAlmacenAct.controls.stPicking.disable();
  }

  fnAbrirModal() {
    this.modalUsuarioAlm.nativeElement.click();
    this.pOpcion = 1;
    this.fnListarAlmacen();
    this.fnListarUsuario();
    this.title = 'Añadir Almacén - Usuario'
  }

  fnLimpiarModal() {

    this.lAlmacen = [];
    this.lUsuario = [];
    this.lEstado = [];

    this.formUsrAlmacen.controls.cboUsuario.setValue('');
    this.formUsrAlmacen.controls.cboAlmacen.setValue('');
    this.formUsrAlmacen.controls.stPicking.setValue(false);

    this.formUsrAlmacenAct.controls.txtUsuario.setValue('');
    this.formUsrAlmacenAct.controls.txtAlmacen.setValue('');
    this.formUsrAlmacenAct.controls.cboEstado.setValue('');
    this.formUsrAlmacenAct.controls.stPicking.setValue(false);

    this.fnListarUsuarioAlmacen();

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
