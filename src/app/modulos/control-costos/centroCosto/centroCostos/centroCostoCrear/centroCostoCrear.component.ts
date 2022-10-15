import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CentroCostoService } from '../../centroCosto.service';
import { Area, Cargo, CCS_Personal, CentroCosto, DetalleCC, Direccion, EmpresaSucursal, Moneda, Personal } from '../../Models/centroCostos/ICentroCosto';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-centroCostoCrear',
  templateUrl: './centroCostoCrear.component.html',
  styleUrls: ['./centroCostoCrear.component.css'],
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
export class CentroCostoCrearComponent implements OnInit {


  dataSource: MatTableDataSource<DetalleCC>;
  dataSource2: MatTableDataSource<CCS_Personal>;


  displayedColumns = ['nIdCCS', 'sCodEmpS', 'sDescSucursal']
  displayedColumns2 = ['nIdCCSP', 'sDocumentoPersonal', 'sDescPers']

  @Input() pCentrodeCosto: CentroCosto;
  //Variables para interaccion
  @Input() pOpcion: number;
  pTipo: number = 0;  //1 para actualizar, 2 para guardar
  pOpcionDetalleCC: number;
  pTipoDetalleCC: number = 0;

  @ViewChild('modalDetalleCC') modalDetalleCC: ElementRef;

  @ViewChild('modalPersonal') modalPersonal: ElementRef;

  @ViewChild(MatSort, { static: false }) sort1: MatSort;
  @ViewChild(MatSort, { static: false }) sort2: MatSort;


  //Para los estados
  lEstado = [{
    nEstado: 1, sEstado: 'Activo'
  }, {
    nEstado: 0, sEstado: 'Inactivo'
  },
  ]
  //Para el searchcomboBox Personal
  filteredPersonal: Observable<Personal[]>;
  lCboPersonal = [];
  value: any;
  formPersonal: FormGroup;


  lMoneda: Moneda[];
  lDireccion: Direccion[];
  lArea: Area[];
  lCargo: Cargo[];
  lEmpSucursal: EmpresaSucursal[];

  lDetalleCC: DetalleCC[] = [];
  vDetalleCCSeleccionado: DetalleCC;
  lDetalleCCBorrado: DetalleCC[] = [];
  lPersonal: CCS_Personal[] = [];
  lPersonalSeleccionado: CCS_Personal[] = [];
  lPersonalBorrado: CCS_Personal[] = [];
  //Forms
  centroCostoForm: FormGroup;
  detalleCCForm: FormGroup;
  //Validaciones para la fecha
  fechaHoy;
  datePicker: boolean;

  //Para la generacion del codigo
  vCodigos = ["", "", "", ""];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  //Variable para pintar la fila sucursal seleccionada
  vSucursalSeleccionada: DetalleCC;

  nMaxIdCCS: number = 0;
  nMaxIdPersonal: number = 0;
  matcher = new MyErrorStateMatcher();

  codigoMoneda: number;

  bDireccionPersona: boolean = false;
  listPuesto = []

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vCentroCostoService: CentroCostoService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }


  ngOnInit(): void {
    this.fechaHoy = new Date();
    this.spinner.show();
    this.pTipo = 2;
    this.datePicker = false;


    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');


    this.fnListarCargos();
    this.fnListarMoneda();

    this.detalleCCForm = this.formBuilder.group({
      cboSucursal: ['', Validators.required]
    })

    this.formPersonal = this.formBuilder.group({
      nId_Personal: ['', Validators.required],
      txtPersonal: ['', Validators.required],
      cboPersonal: ['', Validators.required]
    })

    this.centroCostoForm = this.formBuilder.group({
      cboDireccion: ['', Validators.required],
      cboArea: ['', Validators.required],
      cboCargo: ['', Validators.required],

      cboMoneda: ['', Validators.required],
      txtDescripcion: ['', Validators.required],
      txtCodigoSubCargo: ['', [Validators.required, Validators.min(0), Validators.max(99)]],

      txtSubcargo: [''],
      cboPuesto: [''],

      txtCodigo: [''],
      txtCreado: [''],
      txtFechaCrea: [''],
      txtModificado: [''],
      txtFechaMod: [''],
      cboEstado: [''],
      cboFechaFin: [''],
      cboFechaIni: ['']
    })

    //Editar
    if (this.pOpcion == 1) {
      this.fnVerDetalle(this.pCentrodeCosto);
      this.fnListarCCDetalle(this.pCentrodeCosto.nIdCC);
      this.fnListarDirecciones(1);
      this.fnListarAreas(1);
      this.fnListarPuestos(1);
    }
    //Nuevo
    if (this.pOpcion == 2) {
      this.fnOpcionCrearCC();
      this.fnListarDirecciones(0);
      //this.fnListarAreas(0);
    }

    this.spinner.hide();

  }

  ngAfterContentChecked() {

    this.cdr.detectChanges();
    this.centroCostoForm.get('cboMoneda').setValue(this.codigoMoneda);

  }

  //Funciones para el combobox de personal
  async fnControllerPersonal(nIdSuc: number) {
    let pParametro = [];
    pParametro.push(nIdSuc);

    //Metodo que devuelve la lista de busqueda sensitiva para Personal
    this.value = await this.vCentroCostoService.fnCentroCosto2(9, 2, pParametro, 3, this.url);
    this.lCboPersonal = this.value;
    this.filteredPersonal = this.formPersonal.get("txtPersonal").valueChanges
      .pipe(
        startWith(''),
        map(cli => cli ? this._filterPersonal(cli) : this.lCboPersonal.slice())
      );
  }


  //#region Filtrar Tabla Personal
  private _filterPersonal(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.lCboPersonal.filter(
      cli => cli.sDescripcion.toLowerCase().includes(filterValue) //=== 0
    );
  }
  //#endregion


  get PersonalNotFound() {
    let name = this.formPersonal.get('txtPersonal').value;
    if (this.formPersonal.get('txtPersonal').touched) {
      const listaTemp = this.lCboPersonal.filter(option => option.sDescripcion === name);
      if (listaTemp.length === 0) {
        this.formPersonal.controls.nId_Personal.setValue(0);
        return true;
      } else {
        this.formPersonal.controls.nId_Personal.setValue(listaTemp[0].nId);
        return false;
      }
    }
    return false;
  }
  //=====================================================================//

  //==Funciones de listado====
  fnListarDirecciones = function (opcion: number) {
    //this.spinner.show();

    var pEntidad = 1; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vFiltro = " "

    pParametro.push(this.pPais);
    pParametro.push(vFiltro);

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lDireccion = res;
        if (opcion == 0) {
          this.lDireccion = this.lDireccion.filter(item => item.bEstado == 1);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        //this.spinner.hide();
      }
    );
  }

  //#region Listar Areas
  fnListarAreas = function (opcion: number) {
    //this.spinner.show();

    var pEntidad = 2; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vFiltro = " "

    pParametro.push(this.pPais);
    pParametro.push(vFiltro);
    pParametro.push(this.centroCostoForm.controls.cboDireccion.value)

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lArea = res;
        if (opcion == 0) {
          //Se filtran los de estado 1 para crear
          this.lArea = this.lArea.filter(item => item.bEstado == 1);
        }
      },
      err => {
        console.log(err);
      },
      () => {
        //this.spinner.hide();
      }
    );
  }
  //#endregion


  //#region Listar Cargos
  fnListarCargos = function () {
    //this.spinner.show();

    var pEntidad = 3; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vFiltro = " "

    pParametro.push(this.pPais);
    pParametro.push(vFiltro);

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lCargo = res;
      },
      err => {
        console.log(err);
      },
      () => {
        //this.spinner.hide();
      }
    );
  }
  //#endregion


  fnListarMoneda = function () {
    //this.spinner.show();

    var pEntidad = 4; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vFiltro = " "

    pParametro.push(this.pPais);
    pParametro.push(vFiltro);

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lMoneda = res;
        this.lMoneda.forEach(element => {
          if (element.nParam == 1) {
            this.codigoMoneda = element.nIdMoneda;
          }
        });

      },
      err => {
        console.log(err);
      },
      () => {
        //this.spinner.hide();
      }
    );
  }

  fnListarEmpresaSucursal = function () {
    var pEntidad = 7; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vFiltro = " "

    pParametro.push(this.idEmp);
    pParametro.push(vFiltro);

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lEmpSucursal = res;
      },
      err => {
        console.log(err);
      },
      () => {
        //this.spinner.hide();
      }
    );
  }

  fnListarCCDetalle = function (idCC: number) {
    var pEntidad = 8; //Cabecera del tarfario
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vFiltro = " "

    pParametro.push(this.idEmp);
    pParametro.push(idCC)
    pParametro.push(vFiltro);
    this.spinner.show();

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.spinner.hide();
        this.lDetalleCC = res;
        const detalleCC = res; ///Array.from({length: res.length}, (_, k) => createNewCC(res[k],k));
        this.dataSource = new MatTableDataSource(detalleCC);
        this.dataSource.sort = this.sort1;
        if (this.lDetalleCC.length > 0) {
          this.fnListarCCDetallePersonal(idCC, this.lDetalleCC[0]);
          this.lDetalleCC.forEach(item => {
            if (item.nIdCCS > this.nMaxIdCCS) { this.nMaxIdCCS = item.nIdCCS }
          })
          this.nMaxIdCCS++;
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

  fnListarCCDetallePersonal = function (idCC: number, detalleCC: DetalleCC) {
    var pEntidad = 9; //Cabecera del CCDetallePersonal
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(idCC)
    this.spinner.show();

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.spinner.hide();
        this.lPersonal = res;
        this.lPersonal.forEach(item => {
          if (item.nIdCCSP > this.nMaxIdPersonal) { this.nMaxIdPersonal = item.nIdCCSP }
        })
        this.nMaxIdPersonal++;
        this.fnSelecSucursal(detalleCC.nIdCCS)
        this.fnSeleccionarCCSucursal(detalleCC)
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

  //==Fin Listado

  //#region Llenar Campos (Ver de anterior pantalla)
  fnVerDetalle(p: CentroCosto) {
    this.centroCostoForm.controls.cboDireccion.setValue(p.nIdDireccion);
    this.centroCostoForm.controls.cboArea.setValue(p.nIdArea);
    this.centroCostoForm.controls.cboCargo.setValue(p.nIdCargo);
    this.centroCostoForm.controls.cboMoneda.setValue(p.nIdMoneda);
    this.centroCostoForm.controls.txtDescripcion.setValue(p.sDescCC);
    this.centroCostoForm.controls.txtCodigo.setValue(p.sCodCC);
    this.centroCostoForm.controls.txtCodigoSubCargo.setValue(p.sCodSubCargo);
    this.centroCostoForm.controls.txtSubcargo.setValue(p.sSubCargo);

    this.centroCostoForm.controls.cboPuesto.setValue(p.nIdPuesto);

    this.centroCostoForm.controls.txtCreado.setValue(p.sNombreUsr_C);
    this.centroCostoForm.controls.txtFechaCrea.setValue(p.sFechaCreacion);
    this.centroCostoForm.controls.txtModificado.setValue(p.sNombreUsr_M);
    this.centroCostoForm.controls.txtFechaMod.setValue(p.sFechaModifico);
    this.centroCostoForm.controls.cboEstado.setValue(p.sEstadoCC);
    this.centroCostoForm.controls.cboFechaIni.setValue(p.sFechaIni);
    this.centroCostoForm.controls.cboFechaFin.setValue(moment(p.sFechaFin));

    this.centroCostoForm.get('cboDireccion').disable();
    this.centroCostoForm.get('cboArea').disable();
    this.centroCostoForm.get('cboCargo').disable();
    this.centroCostoForm.get('cboMoneda').disable();

    this.centroCostoForm.get('txtSubcargo').disable();
    this.centroCostoForm.get('cboPuesto').disable();

    this.centroCostoForm.get('cboFechaIni').disable();
  }
  //#endregion


  //#region Nuevo Centro de Costo
  fnOpcionCrearCC() {

    this.centroCostoForm.controls.cboEstado.setValue('Activo');
    this.centroCostoForm.controls.cboFechaIni.setValue(new Date());
    this.centroCostoForm.controls.txtCreado.setValue(this.pNom);
    this.centroCostoForm.controls.txtFechaCrea.setValue(moment().format('DD/MM/YYYY'));

    this.centroCostoForm.get('cboFechaIni').disable();
    this.centroCostoForm.get('cboFechaFin').disable();
  }
  //#endregion


  //#region Generar Centro de Costo
  fnAnadirCC = function () {

    let vDatos = this.centroCostoForm.value;

    if (vDatos.txtCodigoSubCargo > 9 || vDatos.txtCodigoSubCargo < 0) {
      Swal.fire('¡Verificar!', 'El codigo de subcargo tiene que estar entre 0 y 9', 'warning')
      this.centroCostoForm.controls.txtCodigoSubCargo.setValue(0);
      return;
    }

    if (vDatos.cboDireccion == "") {
      Swal.fire('¡Verificar!', 'Es necesario ingresar una Direccion', 'warning')
      return;
    }

    if (vDatos.cboArea == "") {
      Swal.fire('¡Verificar!', 'Es necesario ingresar un Area', 'warning')
      return;
    }

    if (vDatos.cboCargo == "") {
      Swal.fire('¡Verificar!', 'Es necesario ingresar un Cargo', 'warning')
      return;
    }

    if (this.centroCostoForm.invalid) {
      Swal.fire('¡Verificar!', 'Existen datos obligatorios para crear el centro de costo', 'warning')
      return;
    }

    this.spinner.show();
    var pEntidad = 6; //Cabecera del Centro de costo
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = [] //Parametros de campos vacios
    var pTipo = 2;

    pParametro.push(this.vCodigos.join(""));

    //Revisar si el codigo ya existe
    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res.cod != "0") {
          //Verifica si el codigo existe
          this.spinner.hide();
          Swal.fire('¡Verificar!', 'El centro de costo indicado: ' + res.cod + ' - ' + res.mensaje + ', ya se encuentra registrada, indique otro número.', 'warning');
          this.centroCostoForm.controls.txtCodigoSubCargo.setValue("");
        }
        if (res.cod == "0") {
          var vDatosCC;
          var pEntidad2 = 6; //Cabecera del Centro de costo
          var pOpcion2 = 1;  //CRUD -> Insertar
          var pParametro2 = [] //Parametros de campos vacios
          var pTipo2 = 0;

          vDatosCC = this.centroCostoForm.value;

          //Llenando los parametros
          pParametro2.push(vDatosCC.txtDescripcion.trim());
          pParametro2.push(vDatosCC.cboDireccion);
          pParametro2.push(vDatosCC.cboArea);
          pParametro2.push(vDatosCC.cboCargo);
          pParametro2.push(vDatosCC.txtCodigoSubCargo);
          pParametro2.push(vDatosCC.txtSubcargo);
          pParametro2.push(vDatosCC.cboMoneda);
          pParametro2.push(this.idUser);
          pParametro2.push(this.idEmp);
          pParametro2.push(vDatosCC.cboPuesto);

          //Verificando si ya existe un registro con ese codigo
          this.vCentroCostoService.fnCentroCosto(pEntidad2, pOpcion2, pParametro2, pTipo2, this.url).subscribe(
            res => {
              //Validar si hay error:
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
                  text: 'Se guardo el centro de costo.',
                  showConfirmButton: false,
                  timer: 1500
                });
                this.centroCostoForm.get('cboDireccion').disable();
                this.centroCostoForm.get('cboArea').disable();
                this.centroCostoForm.get('cboCargo').disable();
                this.centroCostoForm.get('cboMoneda').disable();

                this.centroCostoForm.get('txtSubcargo').disable();
                this.centroCostoForm.get('cboPuesto').disable();

                this.centroCostoForm.get('cboFechaIni').disable();
                this.centroCostoForm.get('cboFechaFin').enable();
                this.pCentrodeCosto = { nIdCC: res, sDescCC: vDatosCC.txtDescripcion, sSubCargo: vDatosCC.txtSubcargo, sFechaFin: '', nEstadoCC: 1 };
                this.pOpcion = 1;
              }

            }, err => {
              this.spinner.hide();
            }
          )
        }
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
    );
  }
  //#endregion


  fnSelecSucursal(idDetalleCC: number) {
    const lPer = this.lPersonal;
    //Se seleccional el personal de la sucursal seleccionada
    this.lPersonalSeleccionado = lPer.filter(item => item.nIdCCS == idDetalleCC)
    this.dataSource2 = new MatTableDataSource(this.lPersonalSeleccionado);
    this.dataSource2.sort = this.sort2;

  }


  //Opcion para empezar a actualizar
  fnActualizar() {
    this.pTipo = 2;
    this.datePicker = true;
    this.centroCostoForm.get('cboFechaFin').enable();
  }

  fnGuardarCC() {

    let vDatosCC = this.centroCostoForm.value;;

    if (vDatosCC.txtDescripcion.trim() == '' || vDatosCC.txtSubcargo.trim() == '') {
      Swal.fire('¡Verificar!', 'Existen datos obligatorios para guardar el centro de costo', 'warning')
      return;
    }


    var pEntidad = 6; //Cabecera del centro de costo
    var pOpcion = 3;  //CRUD -> Actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;

    pParametro.push(this.pCentrodeCosto.nIdCC)
    pParametro.push(vDatosCC.txtDescripcion)
    pParametro.push(vDatosCC.txtSubcargo)
    pParametro.push(vDatosCC.cboEstado)
    pParametro.push(this.idUser)
    pParametro.push(vDatosCC.cboFechaFin._isValid == false || vDatosCC.cboFechaFin == "" ? "" : vDatosCC.cboFechaFin.format('MM/DD/YYYY'))

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res == 1) {
          Swal.fire({
            icon: 'success',
            title: 'Correcto',
            text: 'Se actualizo de manera correcta el registro',
            showConfirmButton: false,
            timer: 1500
          });

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
        //this.spinner.hide();
      }
    );

  }

  //Opcion para inactivar y activar
  fnActivarCC = function () {
    Swal.fire({
      title: '¿Desea Seguir?',
      text: "Se activará el centro de costo ¿Desea continuar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        var pEntidad = 6; //Cabecera del centro de costo
        var pOpcion = 3;  //CRUD -> Actualizar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 1;

        pParametro.push(this.pCentrodeCosto.nIdCC)
        pParametro.push(1)
        pParametro.push(this.idUser)
        pParametro.push(this.pPais)

        this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
          res => {
            if (res == 1) {
              Swal.fire({
                icon: 'success',
                title: 'Correcto',
                text: 'Se activo de manera correcta el registro',
                showConfirmButton: false,
                timer: 1500
              });
              this.pCentrodeCosto.nEstadoCC = 1;
              this.pCentrodeCosto.sEstadoCC = 'Activo';
              this.centroCostoForm.controls.cboEstado.setValue('Activo');

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
            //this.spinner.hide();
          }
        );
      }
    })

  }

  fnInactivarCC = function () {
    Swal.fire({
      title: '¿Desea Seguir?',
      text: "Se inactivará el centro de costo ¿Desea continuar?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        var pEntidad = 6; //Cabecera del centro de costo
        var pOpcion = 3;  //CRUD -> Actualizar
        var pParametro = []; //Parametros de campos vacios
        var pTipo = 1;

        pParametro.push(this.pCentrodeCosto.nIdCC)
        pParametro.push(0)
        pParametro.push(this.idUser)
        pParametro.push(this.pPais)

        this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
          res => {
            if (res == 1) {
              Swal.fire({
                icon: 'success',
                title: 'Correcto',
                text: 'Se inactivo de manera correcta el registro',
                showConfirmButton: false,
                timer: 1500
              });

              this.pCentrodeCosto.nEstadoCC = 0;
              this.pCentrodeCosto.sEstadoCC = 'Inactivo';

              this.centroCostoForm.controls.cboEstado.setValue('Inactivo');

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
            //this.spinner.hide();
          }
        );
      }
    })
  }


  //El codigo se genera con los codigos de cargo, direccion, area y un numero dado por el usuario
  fnGeneracionCodigo = function (value, tipo: number) {
    if (tipo == 1) {
      var codDireccion = this.lDireccion.find(item => item.nIdDireccion == value).sCodigoDireccion
      this.vCodigos[0] = codDireccion;
    }
    if (tipo == 2) {
      var codArea = this.lArea.find(item => item.nIdArea == value).sCodigoArea
      this.vCodigos[1] = codArea;
    }
    if (tipo == 3) {
      var codCargo = this.lCargo.find(item => item.nIdCargo == value).sCodigoCargo
      this.vCodigos[2] = codCargo;
    }
    if (tipo == 4) {
      this.fnRedondearCodigoSub();
      var numero = this.centroCostoForm.get('txtCodigoSubCargo').value;
      /*  numero = Math.abs(numero);
       this.centroCostoForm.controls.txtCodigoSubCargo.setValue(numero); */
      this.vCodigos[3] = numero;
    }

    this.centroCostoForm.controls.txtCodigo.setValue(this.vCodigos.join(""));

  }

  //Metodos para guardar en memoria
  fnAnadirSucursalTemp() {
    this.nMaxIdCCS++;
    var vDatosCC = this.detalleCCForm.value;
    var sucursal = vDatosCC.cboSucursal
    if (this.detalleCCForm.invalid) {
      Swal.fire('¡Verificar!', 'Existen datos obligatorios para añadir la sucursal', 'warning')
      return;
    }

    if (this.lDetalleCC != []) {
      if (this.lDetalleCC?.findIndex(item => item.nIdEmpS == sucursal.nIdEmpSuc) != -1) {
        Swal.fire('¡Verificar!', 'Ya existe la sucursal en este centro de costo', 'warning')
        this.detalleCCForm.controls.cboSucursal.setValue("");
        return;
      }
    }

    this.lDetalleCC.push({
      nIdEmpS: sucursal.nIdEmpSuc,
      sDescSucursal: sucursal.sDescSucursal,
      sCodEmpS: sucursal.sCodSucursal,
      nIdCCS: this.nMaxIdCCS,
      nIdUsr_C: this.idUser,
      sFechaCreacion: '',
      sNombreUsr_C: '',
      bEstadoCCS: 1,
      sEstadoCCS: 'Activo',
      pOpcion: 1,
      nIdSucursal: sucursal.nIdSucursal
    })
    var detalleCC = this.lDetalleCC;
    this.dataSource = new MatTableDataSource(detalleCC);
    this.dataSource.sort = this.sort1;
    this.detalleCCForm.controls.cboSucursal.setValue("");

  }

  fnAnadirPersonalTemp() {
    var vDatos = this.formPersonal.value;

    if (this.formPersonal.controls.cboPersonal.invalid) {
      Swal.fire('¡Verificar!', 'Verifique el personal', 'warning')
      this.formPersonal.controls.cboPersonal.setValue("");
      return;
    }

    var nIdPersonal = vDatos.cboPersonal.nId;
    var sDescPersonal: string = vDatos.cboPersonal.sDescripcion;

    if (this.lPersonal.findIndex(item => nIdPersonal == item.nIdPersonal && this.vDetalleCCSeleccionado.nIdCCS == item.nIdCCS) != -1) {
      Swal.fire('¡Verificar!', 'Ya existe este personal en la sucursal', 'warning')
      this.formPersonal.controls.cboPersonal.setValue("");
      return;
    }

    var arrayTemp = sDescPersonal.split('-')
    var dni = arrayTemp[0].trim();
    var nombre = arrayTemp[1].trim();
    this.lPersonal.push({
      nIdCCSP: this.nMaxIdPersonal,
      sDocumentoPersonal: dni,
      sDescPers: nombre,
      nIdPersonal: nIdPersonal,
      nEstadoCCSP: 1,
      sEstadoCCSP: 'Activo',
      nIdCCS: this.vDetalleCCSeleccionado.nIdCCS,
      nIdUsr_C: this.idUser,
      sFechaCreacion: '',
      sNombreUsr_C: '',
      pOpcion: 1
    })
    this.nMaxIdPersonal++;

    this.formPersonal.controls.cboPersonal.setValue("");

    this.fnSelecSucursal(this.vDetalleCCSeleccionado.nIdCCS);

  }

  //Metodos para eliminar de memoria

  fnEliminarSucursalTemp = function (p: DetalleCC) {
    if (this.lPersonal.findIndex(item => item.nIdCCS == p.nIdCCS) != -1) {
      Swal.fire('¡Verificar!', 'Existen personales en esta sucursal, no podra eliminarla', 'warning')
      return;
    }
    if (p.pOpcion != 1) {
      var pEntidad = 8;
      var pOpcion = 2;
      var pParametro = [];
      var pTipo = 3;

      pParametro.push(this.pCentrodeCosto.nIdCC);
      pParametro.push(p.nIdSucursal);

      //Se consulta a la BD si la sucursal tiene gastos
      this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
        res => {
          if (res != 0) {
            Swal.fire('¡Verificar!', 'La sucursal indicada tiene gastos aprobados, no se puede eliminar', 'warning')
          } else {
            //Se le pregunta si quiere eliminar este registro de la base de datos
            Swal.fire({
              title: '¿Desea Seguir?',
              text: "Se eliminara el registro de la base de datos una vez guarde los cambios ¿Desea continuar?",
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Aceptar',
              cancelButtonText: 'Cancelar'
            }).then((result) => {
              if (result.isConfirmed) {
                this.lDetalleCCBorrado.push(p);
                this.lDetalleCC.forEach((item, index) => {
                  if (item.nIdCCS === p.nIdCCS) this.lDetalleCC.splice(index, 1);
                });
                this.dataSource = new MatTableDataSource(this.lDetalleCC);
                this.dataSource.sort = this.sort1;
              }
            })

          }
        }
      )

    }

    //Si no esta en la BD solo se saca
    if (p.pOpcion == 1) {
      this.lDetalleCC.forEach((item, index) => {
        if (item.nIdCCS === p.nIdCCS) this.lDetalleCC.splice(index, 1);
        this.dataSource = new MatTableDataSource(this.lDetalleCC);
        this.dataSource.sort = this.sort1;
      });
    }

  }

  fnEliminarPersonalTemp(p: CCS_Personal) {

    if (p.pOpcion != 1) {
      //Se le pregunta si quiere eliminar este registro de la base de datos
      Swal.fire({
        title: '¿Desea Seguir?',
        text: "Se eliminara el registro de la base de datos una vez guarde los cambios ¿Desea continuar?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.lPersonalBorrado.push(p);
          this.lPersonal.forEach((item, index) => {
            if (item.nIdCCSP === p.nIdCCSP) this.lPersonal.splice(index, 1);
          });
          this.lPersonalSeleccionado.forEach((item, index) => {
            if (item.nIdCCSP === p.nIdCCSP) this.lPersonalSeleccionado.splice(index, 1);
            this.dataSource2 = new MatTableDataSource(this.lPersonalSeleccionado);
            this.dataSource2.sort = this.sort2;
          });
        }
      })
    }

    //Si no esta en la BD solo se saca
    if (p.pOpcion == 1) {
      this.lPersonal.forEach((item, index) => {
        if (item.nIdCCSP === p.nIdCCSP) this.lPersonal.splice(index, 1);
      });
      this.lPersonalSeleccionado.forEach((item, index) => {
        if (item.nIdCCSP === p.nIdCCSP) this.lPersonalSeleccionado.splice(index, 1);
        this.dataSource2 = new MatTableDataSource(this.lPersonalSeleccionado);
        this.dataSource2.sort = this.sort2;

      });
    }

  }

  //Metodos para guardar en la BD

  fnAnadirDetalleCC = function () {
    var pEntidad = 8;
    var pOpcion = 1;
    var pTipo = 0;


    this.lDetalleCC.forEach((item, index) => {
      if (item.pOpcion == 1) {
        var pParametro = [];
        pParametro.push(this.pCentrodeCosto.nIdCC);
        pParametro.push(item.nIdEmpS);
        pParametro.push(this.idUser);
        this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
              this.lPersonal.forEach((personal, indexPer) => {
                if (personal.pOpcion == 1 && personal.nIdCCS == item.nIdCCS) {
                  this.fnAnadirPersonalCC(personal, res, indexPer);
                }
              })

              this.lDetalleCC[index].nIdCCS = res;
              this.lDetalleCC[index].pOpcion = 0;

            }
          },
          err => {
            console.log(err);
          },
          () => {
            //this.spinner.hide();
          }
        );
      } else {
        this.lPersonal.forEach((personal, indexPer1) => {
          if (personal.pOpcion == 1 && personal.nIdCCS == item.nIdCCS) {
            this.fnAnadirPersonalCC(personal, item.nIdCCS, indexPer1);
          }
        })
      }
    })
  }

  fnAnadirPersonalCC = function (p: CCS_Personal, idCCS: number, index: number) {
    var pEntidad = 9;
    var pOpcion = 1;
    var pTipo = 0;
    var pParametro = [];

    pParametro.push(idCCS);
    pParametro.push(p.nIdPersonal);
    pParametro.push(this.idUser);


    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        if (res != 0) {
          this.lPersonal[index].nIdCCSP = res;
          this.lPersonal[index].nIdCCS = idCCS;
          this.lPersonal[index].pOpcion = 0;
        }
      }
    );

  }

  //Metodo para actualizar el estado de la sucursal
  fnActualizarSucursal = function () {

    this.lDetalleCCBorrado.forEach(detallCC => {
      var pEntidad = 8;
      var pOpcion = 3;
      var pTipo = 0;
      var pParametro = [];
      pParametro.push(detallCC.nIdCCS)
      pParametro.push(this.idUser)
      pParametro.push(0)

      this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe()
    })
  }

  //Metodo para actualizar el estado del personal
  fnActualizarPersonal = function () {
    this.lPersonalBorrado.forEach(personal => {
      var pEntidad = 9;
      var pOpcion = 3;
      var pTipo = 0;
      var pParametro = [];
      pParametro.push(personal.nIdCCSP)
      pParametro.push(this.idUser)
      pParametro.push(0)

      this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe()
    })
  }

  fnAgregarSaldo() {
    const id = this.pCentrodeCosto.nIdCC;
    const url = this.router.createUrlTree(["/controlcostos/centroCosto/asigna", id]);
    window.open(url.toString(), '_blank');
  }

  fnCancelar() {
    Swal.fire({
      title: '¿Desea cancelar la edición?',
      text: "Se perderán los cambios no guardados.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.centroCostoForm.controls.txtSubcargo.setValue(this.pCentrodeCosto.sSubCargo);
        this.centroCostoForm.controls.txtDescripcion.setValue(this.pCentrodeCosto.sDescCC);
        this.centroCostoForm.controls.cboEstado.setValue(this.pCentrodeCosto.sEstadoCC);
        this.centroCostoForm.controls.cboFechaFin.setValue(moment(this.pCentrodeCosto.sFechaFin));



        this.lDetalleCCBorrado = [];
        this.lPersonalBorrado = [];
        this.lPersonal = [];
        this.lDetalleCC = [];
        this.fnListarCCDetalle(this.pCentrodeCosto.nIdCC);
      }
    })

    // this.pCentrodeCosto = {nIdCC: 1, nIdMoneda:1, sDescCC: '', sSubCargo:'',sFechaFin:'', nEstadoCC:1}
  }


  //Funciones para modales
  fnAbrirModalDetalleCC() {
    this.fnListarEmpresaSucursal();
    this.detalleCCForm.controls.cboSucursal.setValue("");
    this.modalDetalleCC.nativeElement.click();
  }

  fnAbrirModalPersonal(row: DetalleCC) {
    const nIdSuc = row.nIdSucursal;
    this.formPersonal.controls.cboPersonal.setValue("");
    this.fnControllerPersonal(nIdSuc);
    this.vDetalleCCSeleccionado = row;
  }

  fnEvitarEspacios() {
    var vDatosCC = this.centroCostoForm.value;
    var descripcion = vDatosCC.txtDescripcion;
    var subcargo = vDatosCC.txtSubcargo;


    this.centroCostoForm.controls.txtDescripcion.setValue(descripcion.trimLeft())
    this.centroCostoForm.controls.txtSubcargo.setValue(subcargo.trimLeft())
  }

  fnSeleccionarCCSucursal(row: DetalleCC) {
    this.vSucursalSeleccionada = row;
  }

  fnRedondearCodigoSub() {
    let codCadena: string
    var codigo = this.centroCostoForm.controls.txtCodigoSubCargo.value;
    if (isNaN(codigo)) {
      return;
    } else {
      this.centroCostoForm.controls.txtCodigoSubCargo.setValue(Math.round(codigo))
    }

    //debugger
    codCadena = '0' + codigo;
    if (codigo < 10) {
      this.centroCostoForm.controls.txtCodigoSubCargo.setValue(codCadena)
    }

  }

  //#region Listar Puestos
  fnListarPuestos = function (opcion: number) {

    let pParametro = [];
    var pEntidad = 10;   //Entidad : Puesto
    var pOpcion = 2;     //Opcion -> Listar    
    var pTipo = 1;       //Listar todos los registros de la tabla

    var vFiltro = " "

    pParametro.push(this.pPais);
    pParametro.push(vFiltro);
    pParametro.push(this.centroCostoForm.controls.cboCargo.value)

    this.vCentroCostoService.fnCentroCosto(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.listPuesto = res;

        if (opcion == 0) {
          //Se filtran los de estado 1 para crear
          this.listPuesto = this.listPuesto.filter(item => item.bEstado == 1);
          this.centroCostoForm.controls.cboPuesto.setValue("");
        }
        else {
          this.fnSetCodPuesto();
        }

        //Puesto dinámico
        this.bDireccionPersona = this.listPuesto.length == 0 ? false : true;

      },
      err => {
        console.log(err);
      },
      () => {
        //this.spinner.hide();
      }
    );
  }
  //#endregion


  //#region Definir Codigo Puesto
  async fnSetCodPuesto() {

    let nIdPuesto = this.centroCostoForm.controls.cboPuesto.value
    let lista = this.listPuesto

    if (lista.length > 0) {
      for (let i = 0; i < lista.length; i++) {
        if (lista[i].nIdPuesto = nIdPuesto) {
          this.centroCostoForm.controls.txtCodigoSubCargo.setValue(lista[i].sAbrev);
          this.fnGeneracionCodigo(0, 4);
          break;
        }
      }
    }

  }
  //#endregion


}
