import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { AtcMatrizPuestoRfbService } from "./atc-matriz-puesto-rfb.service";
import { MatDialog } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { AtcMatrizPuestoRfbModalComponent } from "./atc-matriz-puesto-rfb-modal/atc-matriz-puesto-rfb-modal.component";

import Swal from "sweetalert2";

@Component({
  selector: 'app-atc-matriz-puesto-rfb',
  templateUrl: './atc-matriz-puesto-rfb.component.html',
  styleUrls: ['./atc-matriz-puesto-rfb.component.css']
})
export class AtcMatrizPuestoRfbComponent implements OnInit {

  url: string;
  sPais: string;
  nIdUsuario: number;
  nIdEmpresa: number;
  nIdPuesto: number;

  formPuesto: FormGroup;
  fTipoMatriz = new FormControl();

  nMostrarMatriz: number;

  listaTipoMatriz: any;
  listaIdentificadores = []

  listaGrupos = []
  listaCargos = []
  listaPuestos = []

  listaRequisitosDisp = []
  listaFuncionesDisp = []
  listaBeneficiosDisp = []
  listaLugarTrabajoDisp = []

  listaRequisitosActuales = []
  listaFuncionesActuales = []
  listaBeneficiosActuales = []
  listaLugarTrabajoActuales = []

  step = 0;

  divList: boolean = true;
  divCreate: boolean = false;

  txtFiltroReq = new FormControl();
  txtFiltroFun = new FormControl();
  txtFiltroBen = new FormControl();
  txtFiltroLugar = new FormControl();

  bExpReq: boolean = false
  bExpFun: boolean = false
  bExpBen: boolean = false
  bExpLugar: boolean = false

  bEstadoMatriz: boolean = false

  //#region Tablas Disponibles

  //Table Requisitos Disponibles
  listaReqDispTableData: any = new MatTableDataSource<any>([]);
  @ViewChild('listaReqDispPaginator', { static: false }) listaReqDispPaginator: MatPaginator;
  @ViewChild(MatSort) listaReqDispSort: MatSort;
  listaReqDispTableColumns: string[] = ['opcion', 'sNombreRequisito'];

  //Table Funciones Disponibles
  listaFunDispTableData: any = new MatTableDataSource<any>([]);
  @ViewChild('listaFunDispPaginator', { static: false }) listaFunDispPaginator: MatPaginator;
  @ViewChild(MatSort) listaFunDispSort: MatSort;
  listaFunDispTableColumns: string[] = ['opcion', 'sNombreFuncion'];

  //Table Beneficios Disponibles
  listaBenDispTableData: any = new MatTableDataSource<any>([]);
  @ViewChild('listaBenDispPaginator', { static: false }) listaBenDispPaginator: MatPaginator;
  @ViewChild(MatSort) listaBenDispSort: MatSort;
  listaBenDispTableColumns: string[] = ['opcion', 'sNombreBeneficio'];

  //Table Lugar Trabajo Disponibles
  listaLugarDispTableData: any = new MatTableDataSource<any>([]);
  @ViewChild('listaLugarDispPaginator', { static: false }) listaLugarDispPaginator: MatPaginator;
  @ViewChild(MatSort) listaLugarDispSort: MatSort;
  listaLugarDispTableColumns: string[] = ['opcion', 'sNombreLugarTrab'];

  //#endregion

  //#region Tablas Actuales
  //Table Requisitos Actuales
  listaReqTableData: MatTableDataSource<any>;
  @ViewChild('listaReqPaginator', { static: true }) listaReqPaginator: MatPaginator;
  @ViewChild(MatSort) listaReqSort: MatSort;
  listaReqTableColumns: string[] = ['opcion', 'sNombreRequisito'];

  //Table Funciones Actuales
  listaFunTableData: MatTableDataSource<any>;
  @ViewChild('listaFunPaginator', { static: true }) listaFunPaginator: MatPaginator;
  @ViewChild(MatSort) listaFunSort: MatSort;
  listaFunTableColumns: string[] = ['opcion', 'sNombreFuncion'];

  //Table Beneficios Actuales
  listaBenTableData: MatTableDataSource<any>;
  @ViewChild('listaBenPaginator', { static: true }) listaBenPaginator: MatPaginator;
  @ViewChild(MatSort) listaBenSort: MatSort;
  listaBenTableColumns: string[] = ['opcion', 'sNombreBeneficio'];

  //Table Lugar Trabajo Actuales
  listaLugarTableData: MatTableDataSource<any>;
  @ViewChild('listaLugarPaginator', { static: true }) listaLugarPaginator: MatPaginator;
  @ViewChild(MatSort) listaLugarSort: MatSort;
  listaLugarTableColumns: string[] = ['opcion', 'sNombreLugarTrab'];

  //#endregion

  constructor(
    private vSerAtcMatrizRFB: AtcMatrizPuestoRfbService,
    private form: FormBuilder,
    @Inject("BASE_URL") baseUrl: string,
    public dialog: MatDialog
  ) {
    this.url = baseUrl;
  }

  ngOnInit(): void {

    this.sPais = localStorage.getItem("Pais");
    this.nIdEmpresa = parseInt(localStorage.getItem("Empresa"));
    const user = localStorage.getItem("currentUser");
    this.nIdUsuario = JSON.parse(window.atob(user.split(".")[1])).uid;

    this.formPuesto = this.form.group({
      nIdGrupo: "",
      nIdCargo: "",
      nIdPuesto: ""
    });

    this.fnListarGrupos();
    this.fnListarCargos();
    this.fnListarTipoMatriz();

    this.fTipoMatriz.disable();

  }

  ngAfterViewInit() {
    this.listaReqDispTableData.paginator = this.listaReqDispPaginator;
    this.listaFunDispTableData.paginator = this.listaFunDispPaginator;
    this.listaBenDispTableData.paginator = this.listaBenDispPaginator;
    this.listaLugarDispTableData.paginator = this.listaLugarDispPaginator;
  }

  //#region Listar Tipo Matriz
  async fnListarTipoMatriz() {
    const pParametro = []
    this.listaTipoMatriz = await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(8, pParametro, this.url);
  }
  //#endregion

  //#region Filtros

  //#region Filtrar Requisitos
  fnFiltrarRequisitos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listaReqDispTableData.filter = filterValue.trim().toLowerCase();

    if (this.listaReqDispTableData.paginator) {
      this.listaReqDispTableData.paginator.firstPage();
    }
  }
  //#endregion

  //#region Filtrar Funciones
  fnFiltrarFunciones(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listaFunDispTableData.filter = filterValue.trim().toLowerCase();

    if (this.listaFunDispTableData.paginator) {
      this.listaFunDispTableData.paginator.firstPage();
    }
  }
  //#endregion

  //#region Filtrar Beneficios
  fnFiltrarBeneficios(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listaBenDispTableData.filter = filterValue.trim().toLowerCase();

    if (this.listaBenDispTableData.paginator) {
      this.listaBenDispTableData.paginator.firstPage();
    }
  }
  //#endregion

  //#region Filtrar Lugar de Trabajo
  fnFiltrarLugarTrab(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listaLugarDispTableData.filter = filterValue.trim().toLowerCase();

    if (this.listaLugarDispTableData.paginator) {
      this.listaLugarDispTableData.paginator.firstPage();
    }
  }
  //#endregion

  //#endregion

  //#region Listar Grupos
  async fnListarGrupos() {
    let pParametro = [];
    pParametro.push(this.sPais);

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(1, pParametro, this.url).then(
      (value: any[]) => {

        this.listaGrupos = value;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Listar Cargos
  async fnListarCargos() {
    let pParametro = [];
    pParametro.push(this.sPais);

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(2, pParametro, this.url).then(
      (value: any[]) => {

        this.listaCargos = value;

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Listar Puestos
  async fnListarPuestos() {

    this.formPuesto.get("nIdPuesto").setValue("")
    this.fnLimpiarPuesto();

    let pParametro = [];
    pParametro.push(this.sPais);
    pParametro.push(this.formPuesto.get("nIdGrupo").value);
    pParametro.push(this.formPuesto.get("nIdCargo").value);

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(3, pParametro, this.url).then(
      (value: any[]) => {

        this.listaPuestos = value;

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Listar Requisitos Disponibles
  async fnListarRequisitos() {

    let pParametro = [];
    pParametro.push(this.nIdPuesto);

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(4, pParametro, this.url).then(
      (value: any[]) => {

        this.listaRequisitosDisp = value;

        this.fnGenerarReqDisp();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Listar Funciones Disponibles
  async fnListarFunciones() {

    let pParametro = [];
    pParametro.push(this.nIdPuesto);

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(5, pParametro, this.url).then(
      (value: any[]) => {

        this.listaFuncionesDisp = value;

        this.fnGenerarFunDisp();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Listar Beneficios Disponibles
  async fnListarBeneficios() {

    let pParametro = [];
    pParametro.push(this.nIdPuesto);

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(6, pParametro, this.url).then(
      (value: any[]) => {

        this.listaBeneficiosDisp = value;

        this.fnGenerarBenDisp();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Listar Lugar de Trabajo Disponibles
  async fnListarLugarTrabajo() {

    let pParametro = [];
    pParametro.push(this.nIdPuesto);

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(7, pParametro, this.url).then(
      (value: any[]) => {

        this.listaLugarTrabajoDisp = value;

        this.fnGenerarLugarDisp();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion


  //#region Tablas Requisitos

  //#region Agregar Requisito
  async fnAgregarRequisito(nIdRequisito, sNombreRequisito) {

    this.listaRequisitosActuales.push(
      {
        nIdRequisito: nIdRequisito,
        sNombreRequisito: sNombreRequisito
      })

    //Eliminar/Filtrar desde la table disponible
    this.listaRequisitosDisp = this.listaRequisitosDisp.filter(function (index) {
      return index.nIdRequisito !== nIdRequisito;
    });

    //Actualizar Tablas
    this.fnGenerarReqActual()
    this.fnGenerarReqDisp();
  }
  //#endregion

  //#region Quitar Requisito
  async fnQuitarRequisito(nIdRequisito, sNombreRequisito) {

    this.listaRequisitosDisp.push(
      {
        nIdRequisito: nIdRequisito,
        sNombreRequisito: sNombreRequisito
      })

    this.listaRequisitosActuales = this.listaRequisitosActuales.filter(function (index) {
      return index.nIdRequisito !== nIdRequisito;
    });

    //Actualizar Tablas
    this.fnGenerarReqDisp();
    this.fnGenerarReqActual()
  }
  //#endregion

  //#region Generar Tabla Requisito Actual
  async fnGenerarReqActual() {
    this.listaReqTableData = new MatTableDataSource(this.listaRequisitosActuales);
    this.listaReqTableData.paginator = this.listaReqPaginator;
    this.listaReqTableData.sort = this.listaReqSort;
  }
  //#endregion

  //#region Generar Tabla Requisito Disponible
  async fnGenerarReqDisp() {
    //Ordenar Tabla
    this.listaRequisitosDisp.sort(function (a, b) {
      if (a.sNombreRequisito > b.sNombreRequisito) {
        return 1;
      }
      if (a.sNombreRequisito < b.sNombreRequisito) {
        return -1;
      }
      return 0;
    });

    debugger
    //Colocar en la Tabla
    this.listaReqDispTableData = new MatTableDataSource<any>(this.listaRequisitosDisp);
    this.listaReqDispTableData.paginator = this.listaReqDispPaginator;
    this.listaReqDispTableData.sort = this.listaReqDispSort;
  }
  //#endregion

  //#endregion


  //#region Tablas Funciones

  //#region Agregar Funcion
  async fnAgregarFuncion(nIdFuncion, sNombreFuncion) {

    this.listaFuncionesActuales.push(
      {
        nIdFuncion: nIdFuncion,
        sNombreFuncion: sNombreFuncion
      })

    //Eliminar/Filtrar desde la table disponible
    this.listaFuncionesDisp = this.listaFuncionesDisp.filter(function (index) {
      return index.nIdFuncion !== nIdFuncion;
    });

    //Actualizar Tablas
    this.fnGenerarFunActual()
    this.fnGenerarFunDisp();
  }
  //#endregion

  //#region Quitar Funcion
  async fnQuitarFuncion(nIdFuncion, sNombreFuncion) {

    this.listaFuncionesDisp.push(
      {
        nIdFuncion: nIdFuncion,
        sNombreFuncion: sNombreFuncion
      })

    this.listaFuncionesActuales = this.listaFuncionesActuales.filter(function (index) {
      return index.nIdFuncion !== nIdFuncion;
    });

    //Actualizar Tablas
    this.fnGenerarFunDisp();
    this.fnGenerarFunActual();
  }
  //#endregion

  //#region Generar Tabla Funcion Actual
  async fnGenerarFunActual() {
    this.listaFunTableData = new MatTableDataSource<any>(this.listaFuncionesActuales);
    this.listaFunTableData.paginator = this.listaFunPaginator;
    this.listaFunTableData.sort = this.listaFunSort;
  }
  //#endregion

  //#region Generar Tabla Funcion Disponible
  async fnGenerarFunDisp() {
    //Ordenar Tabla
    this.listaFuncionesDisp.sort(function (a, b) {
      if (a.sNombreFuncion > b.sNombreFuncion) {
        return 1;
      }
      if (a.sNombreFuncion < b.sNombreFuncion) {
        return -1;
      }
      return 0;
    });

    //Colocar en la Tabla
    this.listaFunDispTableData = new MatTableDataSource<any>(this.listaFuncionesDisp);
    this.listaFunDispTableData.paginator = this.listaFunDispPaginator;
    this.listaFunDispTableData.sort = this.listaFunDispSort;
  }
  //#endregion

  //#endregion


  //#region Tablas Beneficios

  //#region Agregar Beneficio
  async fnAgregarBeneficio(nIdBeneficio, sNombreBeneficio) {

    this.listaBeneficiosActuales.push(
      {
        nIdBeneficio: nIdBeneficio,
        sNombreBeneficio: sNombreBeneficio
      })

    //Eliminar/Filtrar desde la table disponible
    this.listaBeneficiosDisp = this.listaBeneficiosDisp.filter(function (index) {
      return index.nIdBeneficio !== nIdBeneficio;
    });

    //Actualizar Tablas
    this.fnGenerarBenActual();
    this.fnGenerarBenDisp();
  }
  //#endregion

  //#region Quitar Beneficio
  async fnQuitarBeneficio(nIdBeneficio, sNombreBeneficio) {

    this.listaBeneficiosDisp.push(
      {
        nIdBeneficio: nIdBeneficio,
        sNombreBeneficio: sNombreBeneficio
      })

    this.listaBeneficiosActuales = this.listaBeneficiosActuales.filter(function (index) {
      return index.nIdBeneficio !== nIdBeneficio;
    });

    //Actualizar Tablas
    this.fnGenerarBenDisp();
    this.fnGenerarBenActual();
  }
  //#endregion

  //#region Generar Tabla Beneficio Actual
  async fnGenerarBenActual() {
    this.listaBenTableData = new MatTableDataSource<any>(this.listaBeneficiosActuales);
    this.listaBenTableData.paginator = this.listaBenPaginator;
    this.listaBenTableData.sort = this.listaBenSort;
  }
  //#endregion

  //#region Generar Tabla Beneficio Disponible
  async fnGenerarBenDisp() {
    //Ordenar Tabla
    this.listaBeneficiosDisp.sort(function (a, b) {
      if (a.sNombreBeneficio > b.sNombreBeneficio) {
        return 1;
      }
      if (a.sNombreBeneficio < b.sNombreBeneficio) {
        return -1;
      }
      return 0;
    });


    //Colocar en la Tabla
    this.listaBenDispTableData = new MatTableDataSource(this.listaBeneficiosDisp);
    this.listaBenDispTableData.paginator = this.listaBenDispPaginator;
    this.listaBenDispTableData.sort = this.listaBenDispSort;
  }
  //#endregion

  //#endregion


  //#region Tablas Lugar de Trabajo

  //#region Agregar Lugar
  async fnAgregarLugar(nIdLugarTrabajo, sNombreLugarTrab) {

    this.listaLugarTrabajoActuales.push(
      {
        nIdLugarTrabajo: nIdLugarTrabajo,
        sNombreLugarTrab: sNombreLugarTrab
      })

    //Eliminar/Filtrar desde la table disponible
    this.listaLugarTrabajoDisp = this.listaLugarTrabajoDisp.filter(function (index) {
      return index.nIdLugarTrabajo !== nIdLugarTrabajo;
    });

    //Actualizar Tablas
    this.fnGenerarLugarActual();
    this.fnGenerarLugarDisp();
  }
  //#endregion

  //#region Quitar Lugar
  async fnQuitarLugar(nIdLugarTrabajo, sNombreLugarTrab) {

    this.listaLugarTrabajoDisp.push(
      {
        nIdLugarTrabajo: nIdLugarTrabajo,
        sNombreLugarTrab: sNombreLugarTrab
      })

    this.listaLugarTrabajoActuales = this.listaLugarTrabajoActuales.filter(function (index) {
      return index.nIdLugarTrabajo !== nIdLugarTrabajo;
    });

    //Actualizar Tablas
    this.fnGenerarLugarDisp();
    this.fnGenerarLugarActual();
  }
  //#endregion

  //#region Generar Tabla Lugar Actual
  async fnGenerarLugarActual() {
    this.listaLugarTableData = new MatTableDataSource(this.listaLugarTrabajoActuales);
    this.listaLugarTableData.paginator = this.listaLugarPaginator;
    this.listaLugarTableData.sort = this.listaLugarSort;
  }
  //#endregion

  //#region Generar Tabla Lugar Disponible
  async fnGenerarLugarDisp() {
    //Ordenar Tabla
    this.listaLugarTrabajoDisp.sort(function (a, b) {
      if (a.sNombreLugarTrab > b.sNombreLugarTrab) {
        return 1;
      }
      if (a.sNombreLugarTrab < b.sNombreLugarTrab) {
        return -1;
      }
      return 0;
    });

    //Colocar en la Tabla
    this.listaLugarDispTableData = new MatTableDataSource<any>(this.listaLugarTrabajoDisp);
    this.listaLugarDispTableData.paginator = this.listaLugarDispPaginator;
    this.listaLugarDispTableData.sort = this.listaLugarDispSort;
  }
  //#endregion

  //#endregion


  //#region Listar Requisitos Actuales
  async fnListarRequisitosAct() {

    let pParametro = [];
    pParametro.push(this.nIdPuesto);
  

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(9, pParametro, this.url).then(
      (value: any[]) => {
    

        this.listaRequisitosActuales = value;

        this.fnGenerarReqActual();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Listar Funciones Actuales
  async fnListarFuncionesAct() {

    let pParametro = [];
    pParametro.push(this.nIdPuesto);

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(10, pParametro, this.url).then(
      (value: any[]) => {

        this.listaFuncionesActuales = value;

        this.fnGenerarFunActual();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Listar Beneficios Actuales
  async fnListarBeneficiosAct() {

    let pParametro = [];
    pParametro.push(this.nIdPuesto);

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(11, pParametro, this.url).then(
      (value: any[]) => {

        this.listaBeneficiosActuales = value;

        this.fnGenerarBenActual();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Listar Lugar de Trabajo
  async fnListarLugarTrabajoAct() {

    let pParametro = [];
    pParametro.push(this.nIdPuesto);

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(12, pParametro, this.url).then(
      (value: any[]) => {

        this.listaLugarTrabajoActuales = value;
        debugger
        this.fnGenerarLugarActual();

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  //#region Elegir Puesto
  async fnElegirPuesto(nIdPuesto) {

    this.nIdPuesto = nIdPuesto;

    //Activar Botones
    this.fTipoMatriz.enable();

    //Actuales
    await this.fnListarRequisitosAct();
    await this.fnListarFuncionesAct();
    await this.fnListarBeneficiosAct();
    await this.fnListarLugarTrabajoAct();

    this.nMostrarMatriz = 0
    this.fTipoMatriz.setValue(0);

    this.fnValidarExistencia();
  }
  //#endregion

  //#region Cambiar Tabla Disponible
  async fnMostrarMatrizDisp(value) {
    this.nMostrarMatriz = value;

    this.bExpReq = false;
    this.bExpFun = false;
    this.bExpBen = false;
    this.bExpLugar = false;

    switch (value) {
      case 1:
        this.bExpReq = true;
        this.fnListarRequisitos()
        if (this.listaRequisitosActuales.length > 1) {
          this.fnGenerarTablaCargada(1);
        }
        break;

      case 2:
        this.bExpFun = true;
        this.fnListarFunciones()
        if (this.listaRequisitosActuales.length > 1) {
          this.fnGenerarTablaCargada(2);
        }
        break;

      case 3:
        this.bExpBen = true;
        this.fnListarBeneficios()
        if (this.listaRequisitosActuales.length > 1) {
          this.fnGenerarTablaCargada(3);
        }
        break;

      case 92:
        this.bExpLugar = true;
        this.fnListarLugarTrabajo()
        if (this.listaRequisitosActuales.length > 1) {
          this.fnGenerarTablaCargada(92);
        }
        break;

      default:
        break;
    }

  }
  //#endregion

  fnGenerarTablaCargada(nTipo) {

    let nIdParametro: number;

    if (nTipo == 1) {

      for (let i = 0; i < this.listaRequisitosActuales.length; i++) {
        nIdParametro = this.listaRequisitosActuales[i].nIdRequisito;
        this.listaRequisitosDisp = this.listaRequisitosDisp.filter(function (index) {
          return index.nIdRequisito !== nIdParametro;
        });
      }
      this.fnGenerarReqDisp();
    }
    else if (nTipo == 2) {

      for (let i = 0; i < this.listaFuncionesActuales.length; i++) {
        nIdParametro = this.listaFuncionesActuales[i].nIdRequisito;
        this.listaFuncionesDisp = this.listaFuncionesDisp.filter(function (index) {
          return index.nIdFuncion !== nIdParametro;
        });
      }
      this.fnGenerarFunDisp();
    }
    else if (nTipo == 3) {

      for (let i = 0; i < this.listaBeneficiosActuales.length; i++) {
        nIdParametro = this.listaBeneficiosActuales[i].nIdRequisito;
        this.listaBeneficiosDisp = this.listaBeneficiosDisp.filter(function (index) {
          return index.nIdBeneficio !== nIdParametro;
        });
      }
      this.fnGenerarReqDisp();
    }
    else if (nTipo == 92) {

      for (let i = 0; i < this.listaLugarTrabajoActuales.length; i++) {
        nIdParametro = this.listaLugarTrabajoActuales[i].nIdRequisito;
        this.listaLugarTrabajoDisp = this.listaLugarTrabajoDisp.filter(function (index) {
          return index.nIdLugarTrabajo !== nIdParametro;
        });
      }
      this.fnGenerarReqDisp();
    }

  }

  //#region Abrir Modal
  async fnAbrirModal(tipomodal) {
    const dialogRef = this.dialog.open(AtcMatrizPuestoRfbModalComponent, {
      width: "40rem",
      disableClose: true,
      data: {
        tipomodal: tipomodal,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (result !== undefined) {

        //Actualizar Tabla Derecha
        switch (tipomodal) {
          case 1:
            this.fnQuitarBeneficio(result.nIdParametro, result.sDescripcion)
            break;

          case 2:
            this.fnQuitarFuncion(result.nIdParametro, result.sDescripcion)
            break;

          case 3:
            this.fnQuitarBeneficio(result.nIdParametro, result.sDescripcion)
            break;

          case 92:
            this.fnQuitarLugar(result.nIdParametro, result.sDescripcion)
            break;

          default:
            break;
        }

      }
    });
  }
  //#endregion

  //#region Limpiar Puesto
  fnLimpiarPuesto() {
    this.fTipoMatriz.setValue(0);
    this.fTipoMatriz.disable();
    this.nMostrarMatriz = 0;

    this.listaRequisitosDisp = []
    this.listaFuncionesDisp = []
    this.listaBeneficiosDisp = []
    this.listaLugarTrabajoDisp = []

    this.listaRequisitosActuales = []
    this.listaFuncionesActuales = []
    this.listaBeneficiosActuales = []
    this.listaLugarTrabajoActuales = []

    this.listaReqDispTableData = new MatTableDataSource(this.listaRequisitosDisp);
    this.listaFunDispTableData = new MatTableDataSource(this.listaFuncionesDisp);
    this.listaBenDispTableData = new MatTableDataSource(this.listaBeneficiosDisp);
    this.listaLugarDispTableData = new MatTableDataSource(this.listaLugarTrabajoDisp);

    this.listaReqTableData = new MatTableDataSource(this.listaRequisitosActuales);
    this.listaFunTableData = new MatTableDataSource(this.listaFuncionesActuales);
    this.listaBenTableData = new MatTableDataSource(this.listaBeneficiosActuales);
    this.listaLugarTableData = new MatTableDataSource(this.listaLugarTrabajoActuales);

  }
  //#endregion

  //#region Validar Existencia
  async fnValidarExistencia() {

    if (this.listaRequisitosActuales.length > 0 || this.listaFuncionesActuales.length > 0 ||
      this.listaBeneficiosActuales.length > 0 || this.listaLugarTrabajoActuales.length > 0) {

      this.bEstadoMatriz = true;
    }
    else {
      this.bEstadoMatriz = false;
    }

    if (this.bEstadoMatriz) {
      this.bExpReq = true;
      this.bExpFun = true;
      this.bExpBen = true;
      this.bExpLugar = true;

    }

  }
  //#endregion

  //#region Recuperar Identificadores
  async fnRecuperarIds() {
    this.listaIdentificadores = [];
    this.listaIdentificadores.push(this.nIdPuesto);

    if (this.listaRequisitosActuales.length > 0) {
      for (let i = 0; i < this.listaRequisitosActuales.length; i++) {
        this.listaIdentificadores.push(this.listaRequisitosActuales[i].nIdRequisito)
      }
    }

    if (this.listaFuncionesActuales.length > 0) {
      for (let i = 0; i < this.listaFuncionesActuales.length; i++) {
        this.listaIdentificadores.push(this.listaFuncionesActuales[i].nIdFuncion)
      }
    }
    if (this.listaBeneficiosActuales.length > 0) {
      for (let i = 0; i < this.listaBeneficiosActuales.length; i++) {
        this.listaIdentificadores.push(this.listaBeneficiosActuales[i].nIdBeneficio)
      }
    }
    if (this.listaLugarTrabajoActuales.length > 0) {
      for (let i = 0; i < this.listaLugarTrabajoActuales.length; i++) {
        this.listaIdentificadores.push(this.listaLugarTrabajoActuales[i].nIdLugarTrabajo)
      }
    }

  }
  //#endregion

  //#region Guardar
  async fnGuardar() {

    await this.fnRecuperarIds();

    let pParametro = [];
    pParametro = this.listaIdentificadores;

    await this.vSerAtcMatrizRFB.fnMatrizPuestoRFB(14, pParametro, this.url).then(
      (res: any) => {
     
        //Mostrar Dialogo
        if (res.cod > 0) {
          Swal.fire({
            icon: "success",
            title: res.mensaje,
          });
        }
        else {
          return Swal.fire({
            icon: "error",
            title: res.mensaje,
          });
        }

      },
      (error) => {
        console.log(error);
      }
    );
  }
  //#endregion

  setStep(index: number) {
    this.step = index;
    
  }

}
