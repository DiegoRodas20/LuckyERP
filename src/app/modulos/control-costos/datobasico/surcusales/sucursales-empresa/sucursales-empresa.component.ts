import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { DatoBasicoService } from '../../datobasico.service';
import { Empresa, SucEmpresa, Sucursal } from '../../interfaces/sucursal';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}
@Component({
  selector: 'app-sucursales-empresa',
  templateUrl: './sucursales-empresa.component.html',
  styleUrls: ['./sucursales-empresa.component.css'],
  animations: [asistenciapAnimations]
})
export class SucursalesEmpresaComponent implements OnInit {
  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nueva sucursal' },
  ];
  abLista = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  lEmpresa: Empresa[] = [];
  cboEmpresa = new FormControl();

  lSucursal: Sucursal[] = [];
  vSucEmpresaSeleccionada: SucEmpresa;
  lSucEmpresa: SucEmpresa[] = [];
  txtFiltro = new FormControl();
  formSucEmpresa: FormGroup;

  //Elementos para la tabla material
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  dataSource: MatTableDataSource<SucEmpresa>;
  displayedColumns = ['nIdEmpSuc', 'sCodSucursal', 'sDescSucursal', 'sEstadoEmpSuc'];
  @ViewChild('modalSucEmp') modalSucEmp: ElementRef;

  cboEstado = new FormControl();
  title: string;

  //Se genera despues de escoger el maximo codigo y se le aumenta 1
  nCodigo: number = 0;
  sCodigo: string = "";
  pOpcion = 1;  //Para actualizar o añadir
  pTipo = 1;  //Para guardar o actualizar


  lEstados = [
    { nEstado: 1, sEstado: 'Activo' },
    { nEstado: 0, sEstado: 'Inactivo' },
  ]

  matcher = new ErrorStateMatcher();

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vDatoBasicoService: DatoBasicoService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  ngOnInit(): void {
    this.onToggleFab(1, -1);

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.formSucEmpresa = this.formBuilder.group({
      cboSucursal: ['', Validators.required]
    });

    this.fnListarEmpresa();
    this.fnListarSucursales(0);
  }

  fnListarEmpresa = function () {
    this.spinner.show();

    var pEntidad = 2;  //Cabecera empresa
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);


    this.vDatoBasicoService.fndatoBasicoSucursal(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lEmpresa = res;
        this.cboEmpresa.setValue(this.lEmpresa[0].nId)
        this.fnListarSucEmpresa(this.lEmpresa[0].nId)
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarSucEmpresa = function (idEmpresa: number) {
    this.spinner.show();

    var pEntidad = 3;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(idEmpresa);


    this.vDatoBasicoService.fndatoBasicoSucursal(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lSucEmpresa = res;
        const sucEmpresa = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k)); 
        this.dataSource = new MatTableDataSource(sucEmpresa);
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

  fnListarSucursales = function (opcion: number) {
    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);


    this.vDatoBasicoService.fndatoBasicoSucursal(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lSucursal = res;
        //Si es 1 es opcion para añadir, se filtran los que tienen estado 1
        if (opcion == 1) {
          this.lSucursal = this.lSucursal.filter(item => item.nEstado == 1);
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

  fnAnadirSucEmpresa = function () {
    if (this.formSucEmpresa.invalid) {
      Swal.fire('¡Verificar!', 'La sucursal es necesaria!', 'warning')
      return;
    }

    var vDatos = this.formSucEmpresa.value;
    var pEntidad = 3; //Cabecera de la sucursal 
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar uno

    this.spinner.show();

    pParametro.push(vDatos.cboSucursal);
    pParametro.push(this.cboEmpresa.value);

    this.vDatoBasicoService.fndatoBasicoSucursal(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res.cod != "0") {
          //Verifica si la sucursal existe
          this.spinner.hide();
          Swal.fire('¡Verificar!', 'La sucursal indicada ya existe en esta empresa', 'warning');
          this.formSucEmpresa.controls.cboSucursal.setValue("");
        }
        if (res.cod == "0") {
          var vDatos1 = this.formSucEmpresa.value;
          var pEntidad1 = 3; //Cabecera de la sucursal 
          var pOpcion1 = 1;  //CRUD -> Insertar
          var pParametro1 = []; //Parametros de campos vacios
          var pTipo1 = 0;

          pParametro1.push(this.cboEmpresa.value)
          pParametro1.push(vDatos1.cboSucursal);
          pParametro1.push(this.idUser);
          pParametro1.push(this.pPais);

          this.vDatoBasicoService.fndatoBasicoSucursal(pEntidad1, pOpcion1, pParametro1, pTipo1, this.url).subscribe(
            res => {
              if (res == 0) {
                this.spinner.hide();
                Swal.fire(
                  'Error', //Titulo
                  'No se pudo realizar el ingreso: Verifique su conexion a Internet', //Mensaje html
                  'error' //Tipo de mensaje
                ).then((result) => {
                });
              } else {
                //Registrado
                this.spinner.hide();
                Swal.fire({
                  icon: 'success',
                  title: 'Correcto',
                  text: 'Se guardo la sucursal asignada.',
                  showConfirmButton: false,
                  timer: 1500
                });
                this.formSucEmpresa.controls.cboSucursal.setValue("");
                this.fnListarSucEmpresa(this.cboEmpresa.value);
              }
            },
            err => {
              this.spinner.hide();
              console.log(err);
            },
            () => {
              this.spinner.hide();
              //this.spinner.hide();
            }
          );
        }
      },
      err => {
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      })
  }

  fnGuardarSucEmpresa = function () {

    var pEntidad = 3; //Cabecera
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(this.vSucEmpresaSeleccionada.nIdEmpSuc);
    pParametro.push(this.idUser);
    pParametro.push(this.cboEstado.value);
    pParametro.push(this.pPais);
    this.spinner.show();

    this.vDatoBasicoService.fndatoBasicoSucursal(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          this.spinner.hide();
          Swal.fire({
            icon: 'success',
            title: 'Correcto',
            text: 'Se actualizo de manera correcta el registro',
            showConfirmButton: false,
            timer: 1500
          });
          this.vSucEmpresaSeleccionada.bEstadoEmpSuc = this.cboEstado.value;
          this.formSucEmpresa.get('cboSucursal').disable();
          this.cboEstado.disable();
          this.pOpcion = 2;
          this.pTipo = 1;
          this.fnListarSucEmpresa(this.cboEmpresa.value);

        } else {
          this.spinner.hide();
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

  fnModificarSucEmpresa() {
    this.pTipo = 2;
    this.cboEstado.enable();
  }

  fnLimpiarModal() {
    this.fnListarSucursales(0);
    this.formSucEmpresa.controls.cboSucursal.setValue('');
  }

  fnSeleccionarSucEmpresa(row: SucEmpresa) {
    this.vSucEmpresaSeleccionada = row;

    this.formSucEmpresa.controls.cboSucursal.setValue(this.vSucEmpresaSeleccionada.nIdSucursal)

    this.formSucEmpresa.get('cboSucursal').disable();

    this.pOpcion = 2;
    this.pTipo = 1;
    this.modalSucEmp.nativeElement.click();
    this.title = 'Modificar Sucursal de la Empresa';
    this.cboEstado.setValue(this.vSucEmpresaSeleccionada.bEstadoEmpSuc);
    this.cboEstado.disable();
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

  fnAbrirModal() {
    if (this.cboEmpresa.value == null) {
      Swal.fire('¡Verificar!', 'Seleccione una empresa para añadir sucursal', 'warning')
      return;
    }
    this.modalSucEmp.nativeElement.click();
    this.pOpcion = 1;
    this.formSucEmpresa.get('cboSucursal').enable();

    this.fnListarSucursales(1);
    this.title = 'Añadir Sucursal'
    this.cboEstado.disable();
  }

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
