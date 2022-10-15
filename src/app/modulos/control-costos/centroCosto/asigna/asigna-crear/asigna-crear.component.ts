import { DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { CentroCostoService } from '../../centroCosto.service';
import { Anio, CentroCosto_Asig, Detalle_CCPresS, Detalle_CCPresSMes, GastosPartida, Partida, Presupuesto_Mensual, Sucursal_CC, TipoPartida } from '../../Models/asignar/IAsignar';
import { DetalleCC } from '../../Models/centroCostos/ICentroCosto';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

const OPCION_ACTUAL = 'ASIGNA_PRESUPUESTO_PARTIDA'
@Component({
  selector: 'app-asigna-crear',
  templateUrl: './asigna-crear.component.html',
  styleUrls: ['./asigna-crear.component.css'],
  providers: [DecimalPipe]
})
export class AsignaCrearComponent implements OnInit {

  vVerBotonEliminarPartida: boolean = false;

  OPCION_ACTUAL = OPCION_ACTUAL;

  @ViewChild('matCentroCosto') matCentroCosto: MatExpansionPanel;
  @ViewChild('matSucursales') matSucursales: MatExpansionPanel;
  @ViewChild('matPartida') matPartida: MatExpansionPanel;

  //Mat-table para sucursales
  dataSource: MatTableDataSource<Sucursal_CC>;
  displayedColumns = ['opcion', 'sSucursal', 'sEstado', 'nPresupuesto', 'sUsrCreado', 'sFechaCreado', 'sUsrModifico',
    'sFechaModificado'
  ];
  @ViewChild('paginatorSucursales', { static: true }) paginator: MatPaginator;
  @ViewChild('sortSucursales', { static: true }) sort: MatSort;

  //Mat table para partidas
  dataSourcePartidas: MatTableDataSource<Presupuesto_Mensual>;
  displayedColumnsPartidas = ['sCodPartida', 'sPartida', 'nResguardo', 'nRepartir', 'nEnero', 'nFebrero', 'nMarzo',
    'nAbril', 'nMayo', 'nJunio', 'nJulio', 'nAgosto', 'nSetiembre', 'nOctubre', 'nNoviembre', 'nDiciembre',
  ];

  displayedColumnsPartidasConOpcion = ['opcion', 'sCodPartida', 'sPartida', 'nResguardo', 'nRepartir', 'nEnero', 'nFebrero', 'nMarzo',
    'nAbril', 'nMayo', 'nJunio', 'nJulio', 'nAgosto', 'nSetiembre', 'nOctubre', 'nNoviembre', 'nDiciembre',
  ];

  @ViewChild('paginatorPartidas', { static: true }) paginatorPartidas: MatPaginator;
  @ViewChild('sortPartidas', { static: true }) sortPartidas: MatSort;

  centroCostoForm: FormGroup;
  @Input() pCentrodeCosto: CentroCosto_Asig;
  anadirPartidaForm: FormGroup;
  ccPresMesForm: FormGroup;

  pOpcion: number; //1 para modificar 2 para guardar
  pDesplegable = false;
  @ViewChild('modalDetalleCC') modalAnadirPartida: ElementRef;

  bModificando: number = 0;

  vGastoPresupuesto: GastosPartida;

  //Declarando los meses
  lMesId = [
    { nIdMes: 1456, sCod: '1' },//Enero
    { nIdMes: 1457, sCod: '2' },
    { nIdMes: 1458, sCod: '3' },
    { nIdMes: 1459, sCod: '4' },
    { nIdMes: 1460, sCod: '5' },
    { nIdMes: 1461, sCod: '6' },
    { nIdMes: 1462, sCod: '7' },
    { nIdMes: 1463, sCod: '8' },
    { nIdMes: 1464, sCod: '9' },
    { nIdMes: 1465, sCod: '10' },
    { nIdMes: 1466, sCod: '11' },
    { nIdMes: 1467, sCod: '12' }, //Diciembre
  ]

  lSucursalCC: Sucursal_CC[] = [];
  vSucursalCC: Sucursal_CC;
  lPrespuestoPartida: Presupuesto_Mensual[] = [];
  lPresupuestoPartidaValidar: Presupuesto_Mensual[] = [];

  cboSucursal = new FormControl();
  cboDetalleCCS = new FormControl();

  vDetalleCCSeleccionado: DetalleCC;
  lDetalleCC: DetalleCC[];
  lTipoPartida: TipoPartida[];
  lPartida: Partida[];
  lDetalleCC_PresS: Detalle_CCPresS[] = [];
  lDetalleCC_PresSMes: Detalle_CCPresSMes[] = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  matcher = new MyErrorStateMatcher();
  sAnioActual: string;
  lAnio: Anio[] = [];
  cboAnio = new FormControl();

  txtFiltroSucursal = new FormControl();
  txtFiltroPartida = new FormControl();
  txtTotalPresupuestado = new FormControl();

  lValorParaValidar = [true, '', 0, 0];
  vPrespuestoValidar: Presupuesto_Mensual;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vCentroCostoService: CentroCostoService,
    private cdr: ChangeDetectorRef,
    private decimalPipe: DecimalPipe,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.url = baseUrl;
    this.pOpcion = 1;
  }

  ngAfterContentChecked() {

    this.cdr.detectChanges();


  }

  ngAfterViewInit() {
    this.matSucursales.open();
  }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');



    this.lMesId.forEach(item => {
      this.lDetalleCC_PresSMes.push({
        nIdDetCCSMes: 0, nIdDetCCS: 0, nImporte: 0, nIdMes: item.nIdMes, sCodMes: item.sCod, sDescMes: ''
      })
    })

    this.sAnioActual = (new Date().getFullYear()).toString();

    this.centroCostoForm = this.formBuilder.group({
      txtDireccion: ['', Validators.required],
      txtArea: ['', Validators.required],
      txtCargo: ['', Validators.required],
      txtMoneda: ['', Validators.required],
      txtCodigoSubCargo: ['', [Validators.required, Validators.min(0), Validators.max(9)]],
      txtSubcargo: ['', Validators.required],
      txtCreado: [''],
      txtModificado: [''],
      txtFechaMod: [''],
      txtEstado: [''],
      txtFechaFin: [''],
      txtFechaIni: ['']
    })

    this.anadirPartidaForm = this.formBuilder.group({
      cboTipoPartida: ['', Validators.required],
      cboPartida: ['', Validators.required]
    })

    this.ccPresMesForm = this.formBuilder.group({
      txtEnero: [0, [Validators.required, Validators.min(0)]],
      txtFebrero: [0, [Validators.required, Validators.min(0)]],
      txtMarzo: [0, [Validators.required, Validators.min(0)]],
      txtAbril: [0, [Validators.required, Validators.min(0)]],
      txtMayo: [0, [Validators.required, Validators.min(0)]],
      txtJunio: [0, [Validators.required, Validators.min(0)]],
      txtJulio: [0, [Validators.required, Validators.min(0)]],
      txtAgosto: [0, [Validators.required, Validators.min(0)]],
      txtSeptiembre: [0, [Validators.required, Validators.min(0)]],
      txtOctubre: [0, [Validators.required, Validators.min(0)]],
      txtNoviembre: [0, [Validators.required, Validators.min(0)]],
      txtDiciembre: [0, [Validators.required, Validators.min(0)]],
      txtRepartir: [0, [Validators.required, Validators.min(0)]],
      txtImporte: [0, [Validators.required, Validators.min(0)]],
      txtResguardo: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    })

    this.fnListarAnios();
    this.fnVerDetalle(this.pCentrodeCosto);
    // this.fnListarCCDetalle(this.pCentrodeCosto.nIdCC);
  }

  fnListarAnios() {

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;

    pParametro.push(this.pCentrodeCosto.nIdCC);


    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      async res => {
        this.lAnio = res;
        if (this.lAnio.findIndex(item => item.sAnio == this.sAnioActual) == -1) {
          this.lAnio.push({ sAnio: this.sAnioActual });
        }
        this.cboAnio.setValue(this.sAnioActual)
        await this.fnListarSucursalesCC(this.sAnioActual, this.pCentrodeCosto.nIdCC, 0)
      },
      err => {
        console.log(err);
      },
      () => {
      }
    );
  }

  async fnListarSucursalesCC(sAnioActual: string, nIdCC: number, opcion: number) {
    this.spinner.show();

    var pEntidad = 8;
    var pOpcion = 1;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla
    pParametro.push(nIdCC);
    pParametro.push(sAnioActual);

    try {
      const sucursales = await this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.lSucursalCC = sucursales;
      this.spinner.hide();
      this.dataSource = new MatTableDataSource(this.lSucursalCC);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.fnFiltrarSucursal();
      if (opcion == 0) {
        this.vSucursalCC = null;
        this.matPartida.close();
      }
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  async fnListarPresupuestoMensual(row: Sucursal_CC) {

    if (this.vSucursalCC != null && this.vSucursalCC?.nId != row.nId) {

      var validar = await this.fnValidarCambios();
      if (validar) {
        var resp = await Swal.fire({
          title: '¿Desea cambiar de sucursal?',
          text: "Al cambiar de sucursal los cambios no guardados se perderán",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar'
        })

        if (!resp.isConfirmed) {
          return;
        }
      }

    }

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;       //Listar todos los registros de la tabla
    pParametro.push(row.nId);
    pParametro.push(this.cboAnio.value);

    try {
      const presupuesto = await this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.lPrespuestoPartida = presupuesto;

      this.spinner.hide();
      this.dataSourcePartidas = new MatTableDataSource(this.lPrespuestoPartida);
      this.dataSourcePartidas.paginator = this.paginatorPartidas;
      this.dataSourcePartidas.sort = this.sortPartidas;
      this.matCentroCosto.close();
      this.matSucursales.close();
      this.matPartida.open();
      this.fnSeleccionarSucursalCC(row);
      // this.fnFiltrarSucursal();
    } catch (error) {
      console.log(error);
      //this.fnLimpiar();
      this.spinner.hide();
    }
  }

  fnListarTipoPartida = function () {
    this.spinner.show();

    var pEntidad = 7;  //Cabecera tipo partida
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);
    pParametro.push(2016);

    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lTipoPartida = res
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnListarPartida = function (id: number) {
    this.spinner.show();

    var pEntidad = 3; //Cabecera de partida
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar todos los registros de la tabla

    pParametro.push(this.pPais);
    pParametro.push(id);

    this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.lPartida = res
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnVerDetalle(p: CentroCosto_Asig) {
    this.centroCostoForm.controls.txtDireccion.setValue(p.sDescDireccion);
    this.centroCostoForm.controls.txtArea.setValue(p.sDescArea);
    this.centroCostoForm.controls.txtCargo.setValue(p.sDescCargo);
    this.centroCostoForm.controls.txtMoneda.setValue(p.sDescMoneda);
    this.centroCostoForm.controls.txtCodigoSubCargo.setValue(p.nSubCargo);
    this.centroCostoForm.controls.txtSubcargo.setValue(p.sSubCargo);
    this.centroCostoForm.controls.txtCreado.setValue(p.sNombreUsr_C + ' - ' + p.sFechaCreacion);
    this.centroCostoForm.controls.txtEstado.setValue(p.sEstadoCC);
    this.centroCostoForm.controls.txtFechaIni.setValue(p.sFechaIni);
    this.centroCostoForm.controls.txtFechaFin.setValue(p.sFechaFin);
  }

  fnAbrirModal() {
    this.anadirPartidaForm.controls.cboTipoPartida.setValue('');
    this.anadirPartidaForm.controls.cboPartida.setValue('');
    this.fnListarTipoPartida();
    this.modalAnadirPartida.nativeElement.click();
  }

  fnAnadirPartida() {

    if (this.anadirPartidaForm.invalid) {
      Swal.fire('¡Verificar!', 'Seleccione una partida para agregar a la sucursal', 'warning')
      return;
    }

    this.spinner.show();

    var pEntidad2 = 1;
    var pOpcion2 = 2;
    var pParametro2 = [];
    var pTipo2 = 2;

    var vFormAnadir1 = this.anadirPartidaForm.value;
    pParametro2.push(this.vSucursalCC.nId);
    pParametro2.push(vFormAnadir1.cboPartida);

    //Verificando si ya existe la partida en la sucursal
    this.vCentroCostoService.fnAsignacionPres(pEntidad2, pOpcion2, pParametro2, pTipo2, this.url).subscribe(
      res => {
        if (res.cod != "0") {
          this.spinner.hide();
          Swal.fire(
            'Atención!', //Titulo
            'Ya existe la partida en la sucursal del centro de costo', //Mensaje html
            'warning' //Tipo de mensaje
          ).then((result) => {
          });
        } else {
          //Registrado
          var pEntidad = 1;
          var pOpcion = 1;
          var pParametro = [];
          var pTipo = 0;

          var vFormAnadir = this.anadirPartidaForm.value;
          pParametro.push(this.vSucursalCC.nId);
          pParametro.push(vFormAnadir.cboPartida);
          pParametro.push(0);
          pParametro.push(this.idUser);
          pParametro.push(this.pPais);

          this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
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
                  text: 'Se guardo la partida seleccionada',
                  showConfirmButton: false,
                  timer: 1000
                });

                this.anadirPartidaForm.controls.cboTipoPartida.setValue("");
                this.anadirPartidaForm.controls.cboPartida.setValue("");
                this.fnListarPresupuestoMensual(this.vSucursalCC);
              }
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
      },
      err => {
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnRedondear(num) {
    var pow = Math.pow(10, 2);
    return Math.round(num * pow) / pow;
  }

  fnSelecccionarDetalleCC(p: DetalleCC) {
    this.vDetalleCCSeleccionado = p;
  }

  fnCancelar() {
    Swal.fire({
      title: '¿Desea continuar?',
      text: "Se eliminarán los cambios no guardados",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fnListarPresupuestoMensual(this.vSucursalCC);
        this.lValorParaValidar = [true, '', 0, 0];
        this.vPrespuestoValidar = null;
      }
    })
  }

  fnEvitarNegativos() {
    var repartir = this.ccPresMesForm.controls.txtRepartir.value;
    repartir = Math.abs(repartir);
    this.ccPresMesForm.controls.txtRepartir.setValue(repartir);
  }

  //#region Repartir en tabla
  async fnRepartirTabla(row: Presupuesto_Mensual) {
    var valorRepartirNumber = row.nRepartir;
    if (valorRepartirNumber < 0) {
      return;
    }
    var valorCadaMes = valorRepartirNumber / 12;
    valorCadaMes = valorCadaMes
    row.nEnero = this.fnRedondear(valorCadaMes);
    row.nFebrero = this.fnRedondear(valorCadaMes);
    row.nMarzo = this.fnRedondear(valorCadaMes);
    row.nAbril = this.fnRedondear(valorCadaMes);
    row.nMayo = this.fnRedondear(valorCadaMes);
    row.nJunio = this.fnRedondear(valorCadaMes);
    row.nJulio = this.fnRedondear(valorCadaMes);
    row.nAgosto = this.fnRedondear(valorCadaMes);
    row.nSetiembre = this.fnRedondear(valorCadaMes);
    row.nOctubre = this.fnRedondear(valorCadaMes);
    row.nNoviembre = this.fnRedondear(valorCadaMes);
    row.nDiciembre = this.fnRedondear(valorCadaMes);
    row.nRepartir = 0;

    this.vGastoPresupuesto = await this.fnTraerGastos(row.nIdPartida);
    if (this.vGastoPresupuesto == null) {
      Swal.fire(
        'Error', //Titulo
        'No se pudo verificar gastos: Verifique su conexion a Internet', //Mensaje html
        'error' //Tipo de mensaje
      )
      return;
    }

    for (var mes = 1; mes <= 12; mes++) {
      var verificar = this.fnVerificarSobregiroTable(mes, row, this.vGastoPresupuesto);
      if (!verificar[0]) {
        this.lValorParaValidar = verificar;
        this.vPrespuestoValidar = row;

        await Swal.fire('¡Verificar!', 'Verificar hay sobregiro en la partida: ' + row.sPartida + ' en el mes de ' + verificar[1] + ', el cual tiene un gasto de: ' + this.decimalPipe.transform(verificar[2], '1.2-2'), 'warning')
        document.getElementById(OPCION_ACTUAL + '-' + row.nId + '-' + mes).focus()
        return;
      }
    }
  }

  async fnValidarSobreGiro(row: Presupuesto_Mensual, nMes: number) {
    if (!this.lValorParaValidar[0]) {
      var verificarPrimero = this.fnVerificarSobregiroTable(Number(this.lValorParaValidar[3]), this.vPrespuestoValidar, this.vGastoPresupuesto);
      if (!verificarPrimero[0]) {
        document.getElementById(OPCION_ACTUAL + '-' + this.vPrespuestoValidar.nId + '-' + this.lValorParaValidar[3]).focus()
        return;
      } else {
        this.lValorParaValidar = [true, '', 0, 0];
        this.vPrespuestoValidar = null;
      }
    }

    var validarNegativos = this.fnCambiarNegativosMatTable(row)
    if (validarNegativos) {
      await Swal.fire('¡Verificar!', 'No puede haber saldo negativo', 'warning')
    }

    this.vGastoPresupuesto = await this.fnTraerGastos(row.nIdPartida);
    if (this.vGastoPresupuesto == null) {
      Swal.fire(
        'Error', //Titulo
        'No se pudo verificar gastos: Verifique su conexion a Internet', //Mensaje html
        'error' //Tipo de mensaje
      )
      return;
    }

    if (nMes == 13) {
      for (var mes = 1; mes <= 12; mes++) {
        var verificar = this.fnVerificarSobregiroTable(mes, row, this.vGastoPresupuesto);
        if (!verificar[0]) {
          this.lValorParaValidar = verificar;
          this.vPrespuestoValidar = row;

          await Swal.fire('¡Verificar!', 'Verificar hay sobregiro en la partida: ' + row.sPartida + ' en el mes de ' + verificar[1] + ', el cual tiene un gasto de: ' + this.decimalPipe.transform(verificar[2], '1.2-2'), 'warning')
          document.getElementById(OPCION_ACTUAL + '-' + row.nId + '-' + mes).focus()
          return;
        }
      }
    }
    else {
      var verificar = this.fnVerificarSobregiroTable(nMes, row, this.vGastoPresupuesto);
      if (!verificar[0]) {
        this.lValorParaValidar = verificar;
        this.vPrespuestoValidar = row;
        //document.getElementById(OPCION_ACTUAL + '-' + row.nId + '-' + nMes).
        await Swal.fire('¡Verificar!', 'Verificar hay sobregiro en la partida: ' + row.sPartida + ' en el mes de ' + verificar[1] + ', el cual tiene un gasto de: ' + this.decimalPipe.transform(verificar[2], '1.2-2'), 'warning')
        document.getElementById(OPCION_ACTUAL + '-' + row.nId + '-' + verificar[3]).focus();
        return;
      }
    }
  }

  fnVerificarSobregiroTable(pMes: number, rowPartida: Presupuesto_Mensual, vGasto: GastosPartida): any[] {

    var nResguardo = rowPartida.nResguardo;

    //Formula para revisar si hay sobregiro
    //        let total = importe - gasto - (importe * (nResguardo / 100))
    //si el total es <0 significa que hay sobregiro
    switch (pMes) {
      case 1: {
        let importe = rowPartida.nEnero;
        let gasto = vGasto.nEnero;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Enero', gasto, 1];
        return [true, 'Enero', gasto, 1];
      }
      case 2: {
        let importe = rowPartida.nFebrero;
        let gasto = vGasto.nFebrero;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Febrero', gasto, 2];
        return [true, 'Febrero', gasto, 2];

      }
      case 3: {
        let importe = rowPartida.nMarzo;
        let gasto = vGasto.nMarzo;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Marzo', gasto, 3];
        return [true, 'Marzo', gasto, 3];

      }
      case 4: {
        let importe = rowPartida.nAbril;
        let gasto = vGasto.nAbril;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Abril', gasto, 4];
        return [true, 'Abril', gasto, 4];

      }
      case 5: {
        let importe = rowPartida.nMayo;
        let gasto = vGasto.nMayo;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Mayo', gasto, 5];
        return [true, 'Mayo', gasto, 5];

      }
      case 6: {
        let importe = rowPartida.nJunio;
        let gasto = vGasto.nJunio;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Junio', gasto, 6];
        return [true, 'Junio', gasto, 6];

      }
      case 7: {
        let importe = rowPartida.nJulio;
        let gasto = vGasto.nJulio;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Julio', gasto, 7];
        return [true, 'Julio', gasto, 7];

      }
      case 8: {
        let importe = rowPartida.nAgosto;
        let gasto = vGasto.nAgosto;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Agosto', gasto, 8];
        return [true, 'Agosto', gasto, 8];

      }
      case 9: {
        let importe = rowPartida.nSetiembre;
        let gasto = vGasto.nSeptiembre;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Septiembre', gasto, 9];
        return [true, 'Septiembre', gasto, 9];

      }
      case 10: {
        let importe = rowPartida.nOctubre;
        let gasto = vGasto.nOctubre;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Octubre', gasto, 10];
        return [true, 'Octubre', gasto, 10];

      }
      case 11: {
        let importe = rowPartida.nNoviembre;
        let gasto = vGasto.nNoviembre;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Noviembre', gasto, 11];
        return [true, 'Noviembre', gasto, 11];

      }
      case 12: {
        let importe = rowPartida.nDiciembre;
        let gasto = vGasto.nDiciembre;
        let total = importe - gasto - (importe * (nResguardo / 100))
        if (total < 0) return [false, 'Diciembre', gasto, 12];
        return [true, 'Diciembre', gasto, 12];

      }
      case 13: {
        return [true, 'Mes', 0];
      }
      default: {
        break;
      }

    }

  }

  async fnTraerGastos(nIdPartida): Promise<GastosPartida> {

    var pEntidad = 2;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 5;       //Listar todos los registros de la tabla

    pParametro.push(this.pCentrodeCosto.nIdCC);
    pParametro.push(this.vSucursalCC.nIdSucursal);
    pParametro.push(nIdPartida);
    pParametro.push(this.cboAnio.value);

    try {
      const gastos = await this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      return gastos[0];
      // this.fnFiltrarSucursal();
    } catch (error) {
      console.log(error);
      return null
    }
  }

  async fnSeleccionarSucursalCC(row: Sucursal_CC) {
    this.vSucursalCC = row;
  }

  fnCambiarNegativosMatTable(row: Presupuesto_Mensual) {
    var validar = false
    if (row.nResguardo < 0) {
      row.nResguardo = 0;
      validar = true;
    }
    if (row.nEnero < 0) {
      row.nEnero = 0;
      validar = true;
    }
    if (row.nFebrero < 0) {
      row.nFebrero = 0;
      validar = true;
    }
    if (row.nMarzo < 0) {
      row.nMarzo = 0;
      validar = true;
    }
    if (row.nAbril < 0) {
      row.nAbril = 0;
      validar = true;
    }
    if (row.nMayo < 0) {
      row.nMayo = 0;
      validar = true;
    }
    if (row.nJunio < 0) {
      row.nJunio = 0;
      validar = true;
    }
    if (row.nJulio < 0) {
      row.nJulio = 0;
      validar = true;
    }
    if (row.nAgosto < 0) {
      row.nAgosto = 0;
      validar = true;
    }
    if (row.nSetiembre < 0) {
      row.nSetiembre = 0;
      validar = true;
    }
    if (row.nOctubre < 0) {
      row.nOctubre = 0;
      validar = true;
    }
    if (row.nNoviembre < 0) {
      row.nNoviembre = 0;
      validar = true;
    }
    if (row.nDiciembre < 0) {
      row.nDiciembre = 0;
      validar = true;
    }

    return validar;
  }
  //#endregion

  //#region gastos por mes de matTable
  get presupuestoEnero() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nEnero, 0));
  }

  get presupuestoFebrero() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nFebrero, 0));
  }

  get presupuestoMarzo() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nMarzo, 0));
  }

  get presupuestoAbril() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nAbril, 0));
  }

  get presupuestoMayo() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nMayo, 0));
  }

  get presupuestoJunio() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nJunio, 0));
  }

  get presupuestoJulio() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nJulio, 0));
  }

  get presupuestoAgosto() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nAgosto, 0));
  }

  get presupuestoSeptiembre() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nSetiembre, 0));
  }

  get presupuestoOctubre() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nOctubre, 0));
  }
  get presupuestoNoviembre() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nNoviembre, 0));
  }

  get presupuestoDiciembre() {
    if (this.dataSourcePartidas == null) {
      return 0;
    }
    return this.fnRedondear(this.dataSourcePartidas.data.reduce((sum, current) => sum + current.nDiciembre, 0));
  }

  get getTotalPresupuestado() {
    return this.presupuestoEnero + this.presupuestoFebrero + this.presupuestoMarzo + this.presupuestoAbril + this.presupuestoMayo +
      this.presupuestoJunio + this.presupuestoJulio + this.presupuestoAgosto + this.presupuestoSeptiembre + this.presupuestoOctubre + this.presupuestoNoviembre +
      this.presupuestoDiciembre;
  }
  //#endregion

  //#region Funciones para la MatTableDataSource
  fnFiltrarSucursal() {
    var filtro = "";

    if (this.txtFiltroSucursal.value == null) {
      return;
    }
    filtro = this.txtFiltroSucursal.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

  fnFiltrarPartidas() {
    var filtro = "";

    if (this.txtFiltroPartida.value == null) {
      return;
    }
    filtro = this.txtFiltroPartida.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSourcePartidas.filter = filtro;
  }

  async fnInactivarPartida(row: Presupuesto_Mensual) {

    this.spinner.show();

    //Validamos que no hayan gastos
    const gastosPresupuesto = await this.fnTraerGastos(row.nIdPartida);
    if (gastosPresupuesto == null) {
      this.spinner.hide();
      Swal.fire(
        'Error', //Titulo
        'No se pudo verificar gastos: Verifique su conexion a Internet', //Mensaje html
        'error' //Tipo de mensaje
      )
      return;
    }

    var sumaGastos = gastosPresupuesto.nEnero + gastosPresupuesto.nFebrero + gastosPresupuesto.nMarzo + gastosPresupuesto.nAbril + gastosPresupuesto.nEnero +
      gastosPresupuesto.nMayo + gastosPresupuesto.nJunio + gastosPresupuesto.nJulio + gastosPresupuesto.nAgosto + gastosPresupuesto.nSeptiembre +
      gastosPresupuesto.nOctubre + gastosPresupuesto.nNoviembre + gastosPresupuesto.nDiciembre;

    if (sumaGastos > 0) {
      this.spinner.hide();
      await Swal.fire('¡Verificar!', 'Verificar hay gastos en la partida: ' + row.sPartida + ', no se puede inactivar.', 'warning')
      return;
    }

    this.spinner.hide();

    var resp = await Swal.fire({
      title: '¿Desea borrar la partida ' + row.sPartida + '?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    var pEntidad = 9;
    var pOpcion = 3;  //CRUD -> actualizar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 0;       //Listar todos los registros de la tabla

    pParametro.push(row.nId);
    pParametro.push(this.idUser);
    pParametro.push(this.pPais);

    try {
      const result = await this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      if (Number(result) == 0) {
        Swal.fire('Error', 'Compruebe su conexion a internet', 'error');
        this.spinner.hide();
        return;
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Correcto',
          text: 'Se borro la partida',
          showConfirmButton: false,
          timer: 1000
        });
        this.fnListarPresupuestoMensual(this.vSucursalCC)
        this.fnListarSucursalesCC(this.cboAnio.value, this.pCentrodeCosto.nIdCC, 1);
        this.spinner.hide();
      }
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }

  }
  //#endregion

  //#region Nuevo Guardar
  async fnGuardarMatTable() {
    var vPartidas = this.dataSourcePartidas.data
    var sMes = "";
    var vPartidaConError: Presupuesto_Mensual;
    var bResguardoValidar: boolean = false;

    for (var vPartida of vPartidas) {
      sMes = this.fnValidarNegativos(vPartida);
      if (sMes != '') {
        vPartidaConError = vPartida;
        break;
      }

      if (vPartida.nResguardo < 0 || vPartida.nResguardo > 100) {
        bResguardoValidar = true;
        vPartidaConError = vPartida;
        break;
      }
    }

    if (sMes != '') {
      Swal.fire('¡Verificar!', 'Verificar hay saldo negativo en la partida: ' + vPartidaConError.sPartida + ' en el mes de ' + sMes, 'warning')
      return;
    }

    if (bResguardoValidar) {
      Swal.fire('¡Verificar!', 'Verificar el resguardo en la partida: ' + vPartidaConError.sPartida + ', este tiene que ser un numero entre 0 y 100', 'warning')
      return;
    }

    var verificar = [true, '', 0];

    this.spinner.show();

    for (var vPartida of vPartidas) {
      this.vGastoPresupuesto = await this.fnTraerGastos(vPartida.nIdPartida);
      for (var mes = 1; mes <= 12; mes++) {
        verificar = this.fnVerificarSobregiroTable(mes, vPartida, this.vGastoPresupuesto);
        if (!verificar[0]) {
          break;
        }
      }
      if (!verificar[0]) {
        break;
      }
    }

    if (!verificar[0]) {
      this.spinner.hide();
      Swal.fire('¡Verificar!', 'Verificar hay sobregiro en la partida: ' + vPartida.sPartida + ' en el mes de ' + verificar[1] + ', el cual tiene un gasto de: ' + this.decimalPipe.transform(verificar[2], '1.2-2'), 'warning')
      return;
    }

    var pEntidad = 9;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 2;       //Listar todos los registros de la tabla

    vPartidas.forEach(item => {
      var pDet = [];

      pDet.push(this.idUser);
      pDet.push(item.nId);
      pDet.push(this.pPais);
      pDet.push(item.nResguardo);
      pDet.push(this.cboAnio.value);
      pDet.push(item.nEnero);
      pDet.push(item.nFebrero);
      pDet.push(item.nMarzo);
      pDet.push(item.nAbril);
      pDet.push(item.nMayo);
      pDet.push(item.nJunio);
      pDet.push(item.nJulio);
      pDet.push(item.nAgosto);
      pDet.push(item.nSetiembre);
      pDet.push(item.nOctubre);
      pDet.push(item.nNoviembre);
      pDet.push(item.nDiciembre);
      pParametro.push(pDet.join('/'))
    })

    try {
      const { cod, mensaje } = await this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      if (Number(cod) == 0) {
        Swal.fire('Error', mensaje, 'error');
        this.spinner.hide();
        return;
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Correcto',
          text: 'Se actualizo el saldo',
          showConfirmButton: false,
          timer: 1000
        });
        this.fnListarPresupuestoMensual(this.vSucursalCC)
        this.fnListarSucursalesCC(this.cboAnio.value, this.pCentrodeCosto.nIdCC, 1);
        this.lValorParaValidar = [true, '', 0, 0];
        this.vPrespuestoValidar = null;
        this.spinner.hide();
      }
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }


  }

  fnValidarNegativos(vPartida: Presupuesto_Mensual): string {
    if (vPartida.nEnero < 0) {
      return 'Enero'
    } else if (vPartida.nFebrero < 0) {
      return 'Febrero'
    } else if (vPartida.nMarzo < 0) {
      return 'Marzo'
    } else if (vPartida.nAbril < 0) {
      return 'Abril'
    } else if (vPartida.nMayo < 0) {
      return 'Mayo'
    } else if (vPartida.nJunio < 0) {
      return 'Junio'
    } else if (vPartida.nJulio < 0) {
      return 'Julio'
    } else if (vPartida.nAgosto < 0) {
      return 'Agosto'
    } else if (vPartida.nSetiembre < 0) {
      return 'Septiembre'
    } else if (vPartida.nOctubre < 0) {
      return 'Octubre'
    } else if (vPartida.nNoviembre < 0) {
      return 'Noviembre'
    } else if (vPartida.nDiciembre < 0) {
      return 'Diciembre'
    } else {
      return ''
    }
  }

  async fnValidarCambios(): Promise<boolean> {
    var validar = false;
    var datoPartidas = this.dataSourcePartidas.data

    this.spinner.show();

    var pEntidad = 1;
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 3;       //Listar todos los registros de la tabla
    pParametro.push(this.vSucursalCC.nId);
    pParametro.push(this.cboAnio.value);

    try {
      this.lPresupuestoPartidaValidar = await this.vCentroCostoService.fnAsignacionPres(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise()
      this.spinner.hide();
    } catch (err) {
      this.spinner.hide();
      return false;
    }

    for (var i = 0; i < datoPartidas.length; i++) {

      if (datoPartidas[i].nResguardo != this.lPresupuestoPartidaValidar[i].nResguardo) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nEnero != this.lPresupuestoPartidaValidar[i].nEnero) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nFebrero != this.lPresupuestoPartidaValidar[i].nFebrero) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nMarzo != this.lPresupuestoPartidaValidar[i].nMarzo) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nAbril != this.lPresupuestoPartidaValidar[i].nAbril) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nMayo != this.lPresupuestoPartidaValidar[i].nMayo) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nJunio != this.lPresupuestoPartidaValidar[i].nJunio) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nJulio != this.lPresupuestoPartidaValidar[i].nJulio) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nAgosto != this.lPresupuestoPartidaValidar[i].nAgosto) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nSetiembre != this.lPresupuestoPartidaValidar[i].nSetiembre) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nOctubre != this.lPresupuestoPartidaValidar[i].nOctubre) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nNoviembre != this.lPresupuestoPartidaValidar[i].nNoviembre) {
        validar = true;
        break;
      }
      if (datoPartidas[i].nDiciembre != this.lPresupuestoPartidaValidar[i].nDiciembre) {
        validar = true;
        break;
      }
    }
    return validar;
  }
  //#endregion

  async fnDescargarExcelDetalle() {
    const sAnio = this.cboAnio.value;

    this.spinner.show();
    const presupuesto = this.pCentrodeCosto.nIdCC;
    const response: any = await this.vCentroCostoService.fnGenerarExcelAsignaPresupuesto(1, `${this.idEmp}|${sAnio}|${presupuesto}`);
    if(response){
      // Descargar el Excel
      const data = response;
      const fileName = `Reporte Control Costo.xlsx`;
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(data, fileName);
        return;
      }
      const objectUrl = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      // Trigger de descarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

      Swal.fire({
        title: 'El Excel ha sido generado',
        html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
        icon: 'success',
        showCloseButton: true
      })
    }
    else{
      Swal.fire('¡Verificar!', 'No se encontraron registros', 'warning')
    }
    this.spinner.hide();
  }

  fnBotonEliminarPartida() {
    if (this.vVerBotonEliminarPartida) {
      this.vVerBotonEliminarPartida = false;
    } else {
      this.vVerBotonEliminarPartida = true;
    }
  }
}
