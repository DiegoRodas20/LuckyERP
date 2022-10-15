
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';

//Material
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Estado } from '../../Models/IEstado';
import Swal from 'sweetalert2';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../shared/services/AppDateAdapter';
import { HistoricoEstadoComponent } from '../../Shared/HistoricoEstado/historico-estado.component';

//Servicios
import { FotocheckService } from './fotocheck.service';
import { NgxSpinnerService } from 'ngx-spinner';

//Animaciones de SCTR(Botón +)
import { btnAnimations } from '../../Animations/animations';


@Component({
    selector: 'app-fotocheck',
    templateUrl: './fotocheck.component.html',
    styleUrls: ['./fotocheck.component.css'],
    animations: [btnAnimations],
    providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})

export class FotocheckComponent implements OnInit {

    //#region Botones
    //Botón Nuevo
    fabButtons = [{ icon: 'description', tool: 'Nuevo RQ-Fotocheck', accion: 'btnAbrirNuevo()' }];
    buttons = [];
    fabTogglerState = 'inactive';

    //Botones Requerimiento
    fabNuevo = [
        { icon: 'save', tool: 'Grabar' },
        { icon: 'exit_to_app', tool: 'Salir' },
    ];

    fabEnviar = [
        { icon: 'save', tool: 'Actualizar' },
        { icon: 'send', tool: 'Enviar' },
        { icon: 'list_alt', tool: 'Histórico de Estados' },
        { icon: 'exit_to_app', tool: 'Salir' },
    ];

    fabEnviado = [
        { icon: 'list_alt', tool: 'Histórico de Estados' },
        { icon: 'exit_to_app', tool: 'Salir' },
    ];

    fabRecepcion = [
        { icon: 'check', tool: 'Aceptar Pedido' },
        { icon: 'cancel', tool: 'Rechazar Pedido' },
        { icon: 'list_alt', tool: 'Histórico de Estados' },
        { icon: 'exit_to_app', tool: 'Salir' },
    ];

    fabAceptado = [
        { icon: 'print', tool: 'Imprimir Fotocheck' },
        { icon: 'list_alt', tool: 'Histórico de Estados' },
        { icon: 'exit_to_app', tool: 'Salir' },
    ];

    abMain = [];
    tsMain = 'inactive';
    //#endregion

    //#region Variables

    //Variables Modulo
    sTituloModulo: string;
    sEstadoModulo: string;
    nEstadoPedido: number;

    nPrecioFotocheck: number

    //Variables Sistema
    nIdPais: string;
    nIdEmpresa: string;
    nIdUsuario: number;
    url: string;
    dFechaActual: string;
    sSolicitante: string;
    nIdTipoUsuario: number;
    sUsuarioActual: string;

    //Variables Cabecera
    nIdGastoCosto: number;
    nIdUsrRegistro: number
    formGroupFotocheck: FormGroup;
    nIdPartida: number;
    sNomPartida: string;
    sCodPresupuesto: string;

    nIdPlanillas: number;
    sCodPlanillas: string;
    sCorreoSolic: string;

    nTotalPersonas: number;
    nCostoTotal: number;

    sMargenGeneral: string;
    allChecked: boolean = false

    //Variables Combo
    lCboPresupuesto = [];
    lCboPlanillas = [];
    lCboNombres = [];
    lCboCiudad = [];
    lCboCargo = [];
    lCboFormatos = [];

    //Listas para Detalle
    listaDetalle = [];
    listaSucursales = []
    listaNombres = []
    listaCargos = []
    listaTotal = []
    listaImagen = []
    listaEstados = []
    listaAgregados = []
    listaPresupuestosDenegados = []
    listaLineasEliminadas = []

    listaImprimir = []

    // Variables para el cambio de div(vista)
    divList = true;
    divCreate = false;
    divFormularioNuevo = false;
    nEstadoImpresion = false;

    //Detalle
    nIdCargo: number;
    sImagenLink: string;
    nIdSucursal: string;
    nIdPersonal: number
    nTotalDetalle: number
    nSaldoValido: number

    //Nuevos strings
    btnEstadoLinea: string;
    sRutaFormato: string;

    //Formularios Reactivos        
    FormGroupDetalleNuevo: FormGroup;
    FormPedidoFecha: FormGroup;

    disableSelect = new FormControl(false);

    bPerfilRRHH: boolean = false;


    //#endregion

    //#region Variables de Tabla
    //Tabla Lista de Fotochecks
    listaFotocheckTableData: MatTableDataSource<any>;
    listaFotocheckColumns: string[] =
        ['btnAccion', 'nPresupuesto', 'sNomPresupuesto', 'nNumPedido', 'dFechaSolic', 'nTotalPers', 'nTotalPrecio', 'sEstado'];
    @ViewChild('listaFotocheckTableSort') listaFotocheckTableSort: MatSort;
    @ViewChild(MatPaginator) listaFotocheckTablePaginator: MatPaginator;

    //Tabla Detalle Nuevo
    nuevoDetFotocheckTableData: MatTableDataSource<any>;
    NuevoDetFotocheckColumns: string[] =
        ['pEstado', 'ciudad', 'codnombre', 'codcargo', 'total', 'imagen'];
    @ViewChild('listaFotocheckTableSort') nuevoDetFotocheckTableSort: MatSort;
    @ViewChild(MatPaginator) nuevoDetFotocheckTablePaginator: MatPaginator;

    //#endregion

    constructor(
        private formBuilder: FormBuilder,
        private cdRef: ChangeDetectorRef,
        private fotocheckService: FotocheckService,
        private spinner: NgxSpinnerService,
        public dialog: MatDialog,
        @Inject('BASE_URL') baseUrl: string
    ) {
        this.url = baseUrl;

        this.sTituloModulo = "Requerimiento de Fotochecks"
        this.nTotalPersonas = 0;
        this.nCostoTotal = 0;

        let lst = []

        this.listaFotocheckTableData = new MatTableDataSource(lst);
        this.nuevoDetFotocheckTableData = new MatTableDataSource();


    }

    ngOnInit(): void {

        //Inicializar variables del sistema
        this.nIdPais = localStorage.getItem('Pais');
        this.nIdEmpresa = localStorage.getItem('Empresa');
        const user = localStorage.getItem('currentUser');
        this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;

        this.FormPedidoFecha = this.formBuilder.group({
            pedido: [{ value: '-', disabled: true }, Validators.required],
            fecha: [this.dFechaActual, Validators.required],
        });

        this.formGroupFotocheck = this.formBuilder.group({
            idPresupuesto: ['', Validators.required],
            fPartida: [{ value: '-', disabled: true }, Validators.required],
            idPlanillas: ['', Validators.required],
            fSolicitante: ['', Validators.required],
        });


        this.FormGroupDetalleNuevo = this.formBuilder.group({
            estado: [{ value: '-', disabled: true }],
            totalPersonas: [{ value: 0, disabled: true }],
            costoTotal: [{ value: 0, disabled: true }],
        });

        //Inicializar Registro       
        this.fnTipoUsuario();
        this.fnObtenerPrecioFotocheck();
        this.fnFechaActual();
        this.fnObtenerPartida();

    }


    //#region Tipos de Usuario
    async fnTipoUsuario() {
        const pParametro = [];
        pParametro.push(this.nIdUsuario);
        pParametro.push(this.nIdEmpresa);

        await this.fotocheckService.
            fnControlFotocheck(0, pParametro, this.url)
            .then((value: any[]) => {

                this.nIdTipoUsuario = value[0].nIdTipoUsuario
                this.sUsuarioActual = value[0].sNombreUsuario

                if (this.nIdTipoUsuario == 1759 || this.nIdTipoUsuario == 623) {
                    this.bPerfilRRHH = true;
                    this.fnListarFotocheckRRHH();

                    this.listaFotocheckColumns =
                        ['btnAccion', 'sNombreUsuario', 'nPresupuesto', 'sNomPresupuesto', 'nNumPedido', 'dFechaSolic', 'nTotalPers', 'nTotalPrecio', 'sEstado'];

                    this.NuevoDetFotocheckColumns =
                        ['ciudad', 'codnombre', 'codcargo', 'total', 'imagen', 'bSeleccionado'];

                }
                else {
                    //Abrir Boton Nuevo
                    this.onToggleFab();

                    this.bPerfilRRHH = false;
                    this.fnListarFotocheck();
                }

            }, error => {
                console.log(error);
            });
    }
    //#endregion


    //#region Nuevo Requerimiento de Fotocheck
    btnAbrirNuevo(): void {
        this.sTituloModulo = "Nuevo Pedido de Fotocheck"
        this.sEstadoModulo = 'Nuevo'
        this.nEstadoPedido = 0;
        this.fnObtenerSolicitante();
        this.formGroupFotocheck.get('idPresupuesto').enable();

        this.fnOnToggleFab(1, -1);
        this.divList = false;
        this.divCreate = true;
        this.fnObtenerPresupuestos();

        this.FormPedidoFecha.get('pedido').disable();
        this.FormPedidoFecha.get('fecha').disable();
        this.formGroupFotocheck.get('fPartida').disable();

        this.listaDetalle = []
        this.listaPresupuestosDenegados = []
        this.listaLineasEliminadas = []

        //Obtener Datos
        this.fnObtenerPlanillas();
    }
    //#endregion


    //#region Contenedor del botón Nuevo
    onToggleFab() {
        if (this.buttons.length > 0) {
            this.fabTogglerState = 'inactive';
            this.buttons = [];
        } else {
            this.fabTogglerState = 'active';
            this.buttons = this.fabButtons;
        }
    }
    //#endregion


    //#region Funcionalidad de Botones
    fnOnToggleFab(fab: number, stat: number) {
        switch (fab) {
            case 1:
                if (stat === -1) {
                    if (this.abMain.length > 0) {
                        stat = 0;
                    } else {
                        if (this.nEstadoPedido == 0) {
                            stat = 1;
                        }
                        else if (this.nEstadoPedido == 2051) {
                            stat = 2;
                        }
                        else if (this.nEstadoPedido == 2052 || this.nEstadoPedido == 2100 ||
                            (!this.bPerfilRRHH && this.nEstadoPedido == 2057)) {

                            if (this.bPerfilRRHH) {
                                stat = 4;

                            }
                            else {
                                stat = 3;
                            }

                        }
                        else if (this.nEstadoPedido == 2057) {
                            if (this.bPerfilRRHH) {
                                stat = 5;
                            }
                            else {
                                stat = 3;
                            }
                        }
                        // stat = ( this.nEstadoPedido==2051 ) ? 2 : 1;
                    }
                }

                //this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';

                switch (stat) {
                    case 0:
                        this.abMain = [];
                        break;
                    case 1:
                        this.abMain = this.fabNuevo;
                        break;
                    case 2:
                        this.abMain = this.fabEnviar;
                        break;
                    case 3:
                        this.abMain = this.fabEnviado;
                        break;
                    case 4:
                        this.abMain = this.fabRecepcion;
                        break;
                    case 5:
                        this.abMain = this.fabAceptado;
                        break;
                }
                break;
        }
    }

    async clickFab(opc: number, index: number) {
        switch (opc) {
            case 1:
                switch (index) {
                    case 0:
                        if (this.bPerfilRRHH) {
                            if (this.nEstadoPedido == 2052) {
                                this.fnAprobarRQ();
                            }
                            else if (this.nEstadoPedido == 2057) {

                            }
                        }
                        else {
                            if (this.nEstadoPedido == 0) {
                                this.fnObtenerMargenGeneral()
                                //this.fnGrabarFormulario();
                            }
                            else if (this.nEstadoPedido == 2051) {
                                this.fnActualizarFormulario();
                            }
                            else if (this.nEstadoPedido == 2052 || this.nEstadoPedido == 2057 || this.nEstadoPedido == 2100) {
                                this.fnVerEstado();
                            }
                        }

                        break;

                    case 1:
                        if (this.bPerfilRRHH) {
                            if (this.nEstadoPedido == 2052) {
                                this.fnRechazarRQ();
                            }
                            else if (this.nEstadoPedido == 2057) {
                                this.fnVerEstado();
                            }
                        }
                        else {
                            if (this.nEstadoPedido == 0) {
                                this.btnSalir();
                            }
                            else if (this.nEstadoPedido == 2051) {
                                this.fnObtenerMargenGeneral();
                                //this.fnEnviarFormulario();
                            }
                            else if (this.nEstadoPedido == 2052 || this.nEstadoPedido == 2057 || this.nEstadoPedido == 2100) {
                                this.btnSalir();
                            }
                        }
                        break;

                    case 2:
                        if (this.nEstadoPedido == 2057) {
                            this.btnSalir();
                        }
                        else {
                            this.fnVerEstado();
                        }

                        break;

                    case 3:
                        this.btnSalir();
                        break;

                }
                break;
        }

    }
    //#endregion


    //#region Salir a Lista
    btnSalir(): void {
        this.divList = true;
        this.divCreate = false;
        this.sTituloModulo = "Requerimiento de Fotochecks";

        this.nEstadoPedido = 0;
        this.fnOnToggleFab(1, -1);

        this.listaDetalle = []
        this.listaPresupuestosDenegados = []


        if (this.bPerfilRRHH) {
            this.fnListarFotocheckRRHH();
        }
        else {
            this.fnListarFotocheck();
        }

        this.fnFechaActual();

        this.FormGroupDetalleNuevo = this.formBuilder.group({
            estado: [{ value: '-', disabled: true }],
            totalPersonas: [{ value: 0, disabled: true }],
            costoTotal: [{ value: 0, disabled: true }],
        }
        );

        this.formGroupFotocheck = this.formBuilder.group({
            idPresupuesto: ['', Validators.required],
            fPartida: [this.nIdPartida + ' - ' + this.sNomPartida, Validators.required],
            idPlanillas: ['', Validators.required],
            fSolicitante: ['', Validators.required],
        });

        this.FormPedidoFecha = this.formBuilder.group({
            pedido: [{ value: '', disabled: true }],
            fecha: [{ value: '', disabled: true }],
        });

        this.nuevoDetFotocheckTableData = new MatTableDataSource<any>();

    }
    //#endregion


    //#region Filtro de Tabla Lista
    fnControlFiltro(filterValue: string) {
        this.listaFotocheckTableData.filter = filterValue.trim().toLowerCase();
    }
    //#endregion


    //#region Fecha Actual
    fnFechaActual() {
        const nDia = new Date().getDate();
        const nMes = (new Date().getMonth()) + 1;
        const sAnio = new Date().getFullYear();
        let sDia: string = ""
        let sMes: string = ""
        if (nDia < 10) {
            sDia = "0" + nDia
        }
        else {
            sDia = nDia.toString();
        }
        if (nMes < 10) {
            sMes = "0" + nMes
        }
        else {
            sMes = nMes.toString();
        }
        const dFecha = sDia + '/' + sMes + '/' + sAnio;
        this.dFechaActual = dFecha;
    }
    //#endregion


    //#region Lista de Requerimientos de Fotocheck
    async fnListarFotocheck() {

        const pParametro = [];
        pParametro.push(this.nIdUsuario);
        pParametro.push(this.nIdEmpresa);

        await this.fotocheckService.
            fnControlFotocheck(1, pParametro, this.url)
            .then((value: any[]) => {

                this.listaFotocheckTableData = new MatTableDataSource(value);
                this.listaFotocheckTableData.paginator = this.listaFotocheckTablePaginator;
                this.listaFotocheckTableData.sort = this.listaFotocheckTableSort;

            }, error => {
                console.log(error);
            });

    }
    //#endregion


    //#region Listar RQ de Fotocheck como RRHH
    async fnListarFotocheckRRHH() {
        const pParametro = [];
        pParametro.push(this.nIdUsuario);
        pParametro.push(this.nIdEmpresa);

        await this.fotocheckService.
            fnControlFotocheck(16, pParametro, this.url)
            .then((value: any[]) => {

                this.listaFotocheckTableData = new MatTableDataSource(value);
                this.listaFotocheckTableData.paginator = this.listaFotocheckTablePaginator;
                this.listaFotocheckTableData.sort = this.listaFotocheckTableSort;


            }, error => {
                console.log(error);
            });
    }
    //#endregion


    //#region Función Obtener Data del Solicitante
    private fnObtenerSolicitante() {

        const pParametro = [];
        if (this.bPerfilRRHH) {
            pParametro.push(this.nIdUsrRegistro);
            this.fnObtenerCorreoSol(this.nIdUsrRegistro);
        }
        else {
            pParametro.push(this.nIdUsuario);
        }

        this.fotocheckService.fnControlFotocheck(2, pParametro, this.url)
            .then((data: any) => {

                this.sSolicitante = data.datos;
                this.formGroupFotocheck.controls.fSolicitante.setValue(this.sSolicitante)

            });
    }
    //#endregion


    //#region Función Obtener Partida
    async fnObtenerPartida() {
        const pParametro = [];
        pParametro.push(this.nIdPais);

        await this.fotocheckService.fnControlFotocheck(3, pParametro, this.url)
            .then((data: any) => {
                this.nIdPartida = data[0].nIdPartida;
                this.sNomPartida = data[0].sNomPartida;
                this.formGroupFotocheck.controls['fPartida'].setValue(this.nIdPartida + ' - ' + this.sNomPartida);

                this.fnObtenerPresupuestos();

            },
                err => console.error(err)
            )
    }
    //#endregion


    //#region Función Obtener Presupuestos
    private fnObtenerPresupuestos() {
        const pParametro = [];
        pParametro.push(this.nIdUsuario);
        pParametro.push(this.nIdEmpresa);
        pParametro.push(this.nIdPartida);
        pParametro.push(this.nEstadoPedido)
        pParametro.push(this.listaPresupuestosDenegados.join());

        this.fotocheckService.fnControlFotocheck(4, pParametro, this.url)
            .then((data: any[]) => {
                this.lCboPresupuesto = data;
            },
                err => console.error(err)
            )
    }
    //#endregion


    //#region Función Obtener Combo Planillas
    private fnObtenerPlanillas() {
        const pParametro = [];
        pParametro.push(this.nIdPais);

        this.fotocheckService.fnControlFotocheck(5, pParametro, this.url)
            .then((data: any[]) => {
                this.lCboPlanillas = data;
            },
                err => console.error(err)
            )
    }
    //#endregion


    //#region Listar Ciudad Según Presupuesto
    fnObtenerCiudad(paramPresupuesto) {

        const pParametro = [];
        pParametro.push(this.nIdUsuario);
        pParametro.push(this.nIdEmpresa);
        pParametro.push(this.nIdPartida);
        pParametro.push(paramPresupuesto);
        pParametro.push(this.nEstadoPedido);


        this.fotocheckService.fnControlFotocheck(6, pParametro, this.url)
            .then((data: any[]) => {
                this.lCboCiudad = data;
            },
                err => console.error(err)
            )
    }
    //#endregion


    //#region Listar Nombres Según Ciudad y Planilla
    fnObtenerNombres(paramNombre) {
        const pParametro = [];
        pParametro.push(paramNombre);

        this.fotocheckService.fnControlFotocheck(7, pParametro, this.url)
            .then((data: any[]) => {
                this.lCboNombres = data;
            },
                err => console.error(err)
            )
    }
    //#endregion


    //#region Confirmar Personas Agregadas
    fnConfirmarAgregados() {
        this.listaDetalle = this.nuevoDetFotocheckTableData.data;
        this.listaAgregados = []

        for (let i in this.listaDetalle) {
            this.listaAgregados.push(this.listaDetalle[i].nIdPersonal)
        }

    }
    //#endregion


    //#region Validar Nombres Según Ciudad y Planilla
    fnValidarCiudad(i, paramCiudad) {

        if (this.fnValidarSaldo(i, paramCiudad) != false) {

            this.fnConfirmarAgregados();

            const pParametro = [];
            pParametro.push(this.nIdPais)
            pParametro.push(paramCiudad);
            pParametro.push(this.sCodPlanillas)
            pParametro.push(this.listaAgregados.join());


            this.fotocheckService.fnControlFotocheck(10, pParametro, this.url)
                .then((data: any[]) => {

                    this.lCboNombres = data;
                    if (data.length == 0) {
                        this.listaDetalle[i].nIdPersonal = null;
                        this.listaDetalle[i].nIdCargo = null;
                        this.listaDetalle[i].bLineaEditable = false;
                        Swal.fire({
                            icon: 'warning',
                            title: 'Alerta',
                            text: 'No hay personas disponibles en esta ciudad para este tipo de planilla'
                        });

                    }
                    else {
                        this.listaDetalle[i].bLineaEditable = true;
                    }


                    this.fnValidarLinea(i, paramCiudad);
                },
                    err => console.error(err)
                )

        }
    }
    //#endregion


    //#region Listar Cargo Según Planillas
    fnObtenerCargos(paramCargo) {
        const pParametro = [];
        pParametro.push(paramCargo);

        this.fotocheckService.fnControlFotocheck(8, pParametro, this.url)
            .then((data: any[]) => {
                this.lCboCargo = data;
            },
                err => console.error(err)
            )
    }
    //#endregion


    //#region Presupuesto Filtra las Ciudades
    fnValidarPresupuesto(nIdParametro) {

        if (this.fnValidarAprobacion(nIdParametro) != false) {

            for (let prop in this.lCboPresupuesto) {

                if (nIdParametro == this.lCboPresupuesto[prop].nIdPresupuesto) {
                    this.sCodPresupuesto = this.lCboPresupuesto[prop].sCodPresupuesto
                }
            }
            //this.fnLineasxEliminar();

            this.fnInicializarDetalle();

            this.fnObtenerCiudad(this.sCodPresupuesto);
        }
    }
    //#endregion 


    //#region Planillas Filtra los Cargos
    fnValidarPlanillas(nIdParametro) {

        for (let prop in this.lCboPlanillas) {
            if (nIdParametro == this.lCboPlanillas[prop].nIdPlanillas) {
                this.sCodPlanillas = this.lCboPlanillas[prop].sCodPlanillas
            }
        }

        //this.fnLineasxEliminar();
        this.fnInicializarDetalle();

        this.fnObtenerCargos(this.sCodPlanillas);

    }
    //#endregion


    //#region Inicializar Detalle
    fnInicializarDetalle() {
        this.nuevoDetFotocheckTableData = new MatTableDataSource();
        this.nuevoDetFotocheckTableData.paginator = this.nuevoDetFotocheckTablePaginator;

        this.listaSucursales = [];
        this.listaNombres = [];
        this.listaCargos = [];
        this.listaTotal = [];
        this.listaImagen = [];

        this.fnCalcularTotales();
    }
    //#endregion


    //#region Grabar Formulario
    fnGrabarFormulario(): void {

        if (this.fnValidarPedido() != false) {

            this.fnConfirmarLineas();

            const Parametro = [];

            Parametro.push(this.nIdUsuario);
            Parametro.push(this.nIdEmpresa);
            Parametro.push(this.formGroupFotocheck.get('idPresupuesto').value);
            Parametro.push(this.formGroupFotocheck.get('idPlanillas').value);
            Parametro.push(this.nIdPais);
            Parametro.push(this.listaSucursales.join());
            Parametro.push(this.listaNombres.join());
            Parametro.push(this.listaCargos.join());
            Parametro.push(this.listaTotal.join());
            Parametro.push(this.listaImagen.join());

            this.fotocheckService.fnControlFotocheck(9, Parametro, this.url)
                .then(res => {

                    this.nIdGastoCosto = res[0]
                    this.nEstadoPedido = 2051
                    this.FormGroupDetalleNuevo.controls['estado'].setValue('Pendiente');
                    this.FormPedidoFecha.controls['fecha'].setValue(this.dFechaActual);

                    this.fnCargarLineas(this.nIdGastoCosto);
                    this.fnObtenerNumero(this.nIdGastoCosto);

                    this.fnOnToggleFab(1, -1);

                    Swal.fire({
                        icon: 'success',
                        title: 'Grabado',
                        text: 'Se grabó correctamente el requerimiento.'
                    });

                    this.fnOnToggleFab(1, -1);
                },
                    err => console.error(err)
                )

        }
    }
    //#endregion


    //#region Agregar Linea Detalle
    async btnAgregarLineaDetalle() {

        if (this.nEstadoPedido == 0 || this.nEstadoPedido == 2051) {

            if (this.formGroupFotocheck.invalid) {
                return Swal.fire({
                    icon: 'warning',
                    title: 'Alerta',
                    text: 'No puede agregar personas sin elegir presupuesto o planilla.'
                });
            }

            var nFilas = this.nuevoDetFotocheckTableData.filteredData.length;

            if (nFilas == 0) {
                this.fnInicializarDetalle();
            }
            else if (nFilas > 0 && this.listaDetalle.length > 0) {

                if (this.listaDetalle[nFilas - 1].bEstadoLinea == false) {

                    return Swal.fire({
                        icon: 'warning',
                        title: 'Alerta',
                        text: 'No puede agregar otra persona sin tener los datos completos de la anterior.'
                    });
                }
                else {
                    this.nuevoDetFotocheckTableData.data[nFilas - 1].bLineaConfirmada = true
                }
            }

            let lstLinea = this.nuevoDetFotocheckTableData.data;
            lstLinea.push(
                { nIdSucursal: '', nIdPersonal: '', nIdCargo: '', nTotalDetalle: 1, sImagen: 'N', bEstadoLinea: false, bLineaEditable: false, bLineaConfirmada: false, sImagenLink: '' });
            this.nuevoDetFotocheckTableData = new MatTableDataSource(lstLinea);
            this.nuevoDetFotocheckTableData.paginator = this.nuevoDetFotocheckTablePaginator;

            this.listaDetalle = this.nuevoDetFotocheckTableData.data;

            this.fnCalcularTotales();
        }
        else if (this.nEstadoPedido == 2052 || this.nEstadoPedido == 2057) {
            return Swal.fire({
                icon: 'warning',
                title: 'Alerta',
                text: 'No puede agregar personas si ya envío el pedido.'
            });
        }
    }
    //#endregion


    //#region Validar si la linea esta completa
    fnValidarLinea(i, element) {

        //    this.listaDetalle = this.nuevoDetFotocheckTableData.data;

        //Cuando elija el nombre, seleccionar el link 

        if (this.listaDetalle[i].nIdSucursal == '' || this.listaDetalle[i].nIdSucursal == null ||
            this.listaDetalle[i].nIdPersonal == '' || this.listaDetalle[i].nIdPersonal == null ||
            this.listaDetalle[i].nIdCargo == '' || this.listaDetalle[i].nIdCargo == null ||
            this.listaDetalle[i].nTotalDetalle == '' || this.listaDetalle[i].nTotalDetalle == 0 ||
            this.listaDetalle[i].nTotalDetalle == null) {

            this.listaDetalle[i].bEstadoLinea = false;

        }
        else {
            this.listaDetalle[i].bEstadoLinea = true;
        }
        if (this.listaDetalle[i].nIdSucursal == '' || this.listaDetalle[i].nIdSucursal == null) {
            this.listaDetalle[i].bLineaEditable = false;
        }

    }
    //#endregion


    //#region Eliminar Linea de Fotocheck
    btnEliminarLineaDetalle(i, Obj) {

        if (this.nEstadoPedido == 0 || this.nEstadoPedido == 2051) {

            let vOb = this.nuevoDetFotocheckTableData.data
            vOb = vOb.filter(filtro => filtro != Obj);
            this.nuevoDetFotocheckTableData = new MatTableDataSource(vOb);
            this.nuevoDetFotocheckTableData.paginator = this.nuevoDetFotocheckTablePaginator;

            this.listaDetalle = this.nuevoDetFotocheckTableData.data;
            this.fnCalcularTotales();
        }
    }
    //#endregion


    //#region Calcular Total Personas y Costo Total
    async fnCalcularTotales() {

        var nCantidad: number = 0

        if (this.nuevoDetFotocheckTableData.data.length > 0) {
            this.nTotalPersonas = this.nuevoDetFotocheckTableData.data.length
            let listaDatos = this.nuevoDetFotocheckTableData.data;

            for (let i = 0; i < listaDatos.length; i++) {
                const element = listaDatos[i];
                nCantidad = nCantidad + listaDatos[i].nTotalDetalle
            }
            this.nCostoTotal = this.nPrecioFotocheck * (nCantidad)

        }
        else {
            this.nTotalPersonas = 0
            this.nCostoTotal = 0
        }

        this.FormGroupDetalleNuevo.controls.totalPersonas.setValue(this.nTotalPersonas);
        this.FormGroupDetalleNuevo.controls.costoTotal.setValue(this.nCostoTotal);
    }
    //#endregion


    //#region Confirmar Lineas Detalles
    fnConfirmarLineas() {

        for (let i in this.listaDetalle) {
            this.listaSucursales.push(this.listaDetalle[i].nIdSucursal)
            this.listaNombres.push(this.listaDetalle[i].nIdPersonal)
            this.listaCargos.push(this.listaDetalle[i].nIdCargo)
            this.listaTotal.push(this.listaDetalle[i].nTotalDetalle)
            this.listaImagen.push(this.listaDetalle[i].sImagenLink)
        }
    }
    //#endregion


    //#region Validar Pedido
    fnValidarPedido() {
        if (this.formGroupFotocheck.invalid) {

            Swal.fire({
                icon: 'warning',
                title: 'Alerta',
                text: 'No puede grabar si no estan los campos completos.'
            });
            return false
        }


        if (this.listaDetalle.length == 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Alerta',
                text: 'No puede grabar si no estan los campos completos.'
            });
            return false
        }

        for (let i in this.listaDetalle) {
            if (this.listaDetalle[i].bEstadoLinea == false) {

                Swal.fire({
                    icon: 'warning',
                    title: 'Alerta',
                    text: 'No puede grabar si no estan los campos completos.'
                });
                return false
            }
        }
    }
    //#endregion


    //#region Cargar Fotocheck Registrados
    btnVerFotocheck(element): void {

        if (this.nEstadoPedido == 2051) {
            this.sTituloModulo = "Modificar Pedido de Fotocheck"
            this.sEstadoModulo = 'Modificar'
            this.listaPresupuestosDenegados = []
        }
        if (this.nEstadoPedido == 2052) {
            this.sTituloModulo = "Pedido de Fotocheck"
            this.sEstadoModulo = 'Enviado'
        }

        this.listaLineasEliminadas = [];

        this.divList = false;
        this.divCreate = true;


        this.FormPedidoFecha.get('pedido').disable();
        this.FormPedidoFecha.get('fecha').disable();
        this.formGroupFotocheck.get('fPartida').disable();

        //Obtener Datos

        this.fnCargarCabecera(element);


    }
    //#endregion


    //#region Cargar Cabeceras
    async fnCargarCabecera(element) {

        this.nEstadoPedido = 1;
        this.fnObtenerPresupuestos();
        this.fnObtenerPlanillas();

        const pParametro = [];
        pParametro.push(element);

        this.fotocheckService.
            fnControlFotocheck(11, pParametro, this.url)
            .then((data: any) => {

                this.nIdGastoCosto = data[0].nIdGastoCosto
                this.formGroupFotocheck.controls['idPresupuesto'].setValue(data[0].nIdPresupuesto);
                this.formGroupFotocheck.controls['idPlanillas'].setValue(data[0].nIdPlanillas);

                this.fnValidarPlanillas(this.formGroupFotocheck.controls.idPlanillas.value);
                this.fnObtenerNombres(this.sCodPlanillas);

                this.FormPedidoFecha.controls['pedido'].setValue(data[0].sNumeroPedido);
                this.FormPedidoFecha.controls['fecha'].setValue(data[0].dFechaSolic);
                this.FormGroupDetalleNuevo.controls['estado'].setValue(data[0].sEstado);
                this.sEstadoModulo = data[0].sEstado
                this.nEstadoPedido = data[0].nEstado
                this.nIdUsrRegistro = data[0].nIdUsrRegistro

                this.fnObtenerSolicitante();
                this.fnObtenerCiudad(data[0].sCodPresupuesto)

                if (this.nEstadoPedido == 2057) {
                    this.fnObtenerFormatos();
                }

                this.fnOnToggleFab(1, -1);

                if (this.nEstadoPedido == 2051) {
                    this.fnObtenerPresupuestos();
                }
                else if (this.nEstadoPedido == 2052 || this.nEstadoPedido == 2057) {
                    this.formGroupFotocheck.get('idPresupuesto').disable();
                    this.formGroupFotocheck.get('idPlanillas').disable();
                }

                this.fnCargarLineas(element);

            }, error => {
                console.log(error);
            });

    }
    //#endregion


    //#region Cargar Lineas
    fnCargarLineas(element) {

        const pParametro = [];
        pParametro.push(element);
        pParametro.push(this.nIdPais);

        this.fotocheckService.
            fnControlFotocheck(12, pParametro, this.url)
            .then((data: any) => {

                this.listaDetalle = data;

                this.nuevoDetFotocheckTableData = new MatTableDataSource(this.listaDetalle);
                this.nuevoDetFotocheckTableData.paginator = this.nuevoDetFotocheckTablePaginator;
                this.nuevoDetFotocheckTableData.sort = this.nuevoDetFotocheckTableSort;

                if (this.nEstadoPedido == 2051) {
                    this.fnObtenerNombres(this.sCodPlanillas);
                    this.fnLineasxEliminar();
                }

                this.fnCalcularTotales();

            }, error => {
                console.log(error);
            });

    }
    //#endregion


    //#region ValidarSaldo
    fnValidarSaldo(i, paramCiudad) {

        let nAcumulado: number;
        nAcumulado = 0
        for (let h = 0; h < this.listaDetalle.length; h++) {
            if (paramCiudad == this.listaDetalle[h].nIdSucursal)
                nAcumulado = nAcumulado + this.nPrecioFotocheck
        }



        for (let j = 0; j < this.lCboCiudad.length; j++) {
            if (paramCiudad == this.lCboCiudad[j].nIdSucursal) {
                if (this.lCboCiudad[j].sSaldo - nAcumulado < 0) {
                    this.nuevoDetFotocheckTableData.data[i].bLineaEditable = false;
                    this.listaDetalle[i].bLineaEditable = false;
                    Swal.fire({
                        icon: 'warning',
                        title: 'Alerta',
                        text: 'Ya no hay saldo en esta ciudad, por favor escoja otra.'
                    });
                    return false
                }
            }
        }

    }
    //#endregion


    //#region Historial para ver saldo
    async fnVerEstado() {
        let pParametro = [];
        pParametro.push(this.nIdGastoCosto);

        if (this.nIdGastoCosto != null && this.nIdGastoCosto != 0) {
            this.spinner.show();
            await this.fotocheckService.fnControlFotocheck(13, pParametro, this.url).then(
                (value: Estado[]) => {

                    const dialogRef = this.dialog.open(HistoricoEstadoComponent, {
                        width: '35rem',
                        data: value,
                    });

                    dialogRef.afterClosed().subscribe(result => {
                    });
                }, error => {
                    console.log(error);
                });
            this.spinner.hide();
        }


    }
    //#endregion


    //#region Enviar Formulario
    fnEnviarFormulario(): void {

        //Validar Data y saldo.

        //this.fnConfirmarLineas();
        for (let prop in this.lCboPresupuesto) {
            if (this.formGroupFotocheck.get('idPresupuesto').value == this.lCboPresupuesto[prop].nIdPresupuesto) {
                this.sCodPresupuesto = this.lCboPresupuesto[prop].sCodPresupuesto
            }
        }
        //this.fnValidarPresupuesto(this.formGroupFotocheck.get('idPresupuesto').value)

        if (this.nEstadoPedido == 2051 && this.fnValidarSaldoEnvio() != false) {
            const Parametro = [];

            Parametro.push(this.nIdGastoCosto);
            Parametro.push(this.sSolicitante);
            Parametro.push(this.sCodPresupuesto);
            Parametro.push(this.FormPedidoFecha.get('pedido').value)
            Parametro.push(this.nCostoTotal);
            Parametro.push(this.sSolicitante); //sUsuario
            Parametro.push(this.nIdPais);
            Parametro.push(this.nIdUsuario);

            this.fotocheckService.fnControlFotocheck(15, Parametro, this.url)
                .then(res => {

                    this.nEstadoPedido = 2052
                    this.FormGroupDetalleNuevo.controls['estado'].setValue('Enviado');
                    this.FormPedidoFecha.controls['fecha'].setValue(this.dFechaActual);

                    Swal.fire({
                        icon: 'success',
                        title: 'Envío Exitoso',
                        text: 'Se envío correo al área de RR.HH.'
                    });

                    this.fnOnToggleFab(1, -1);
                    this.btnSalir();
                },
                    err => console.error(err)
                )
        }
    }
    //#endregion


    //#region Validar Saldo al Enviar
    fnValidarSaldoEnvio() {

        var listaAcumulacion = [];
        for (let i in this.nuevoDetFotocheckTableData.data) {
            listaAcumulacion.push(this.nuevoDetFotocheckTableData.data[i].nIdSucursal)
        }

        listaAcumulacion.sort((a, b) => a - b);
        var nAcumulado = 0

        for (let j in listaAcumulacion) {
            if (parseInt(j) > 0 && listaAcumulacion[j] != listaAcumulacion[parseInt(j) - 1]) {
                nAcumulado = 0;
            }
            for (let h in this.lCboCiudad) {
                if (listaAcumulacion[j] == this.lCboCiudad[h].nIdSucursal) {
                    nAcumulado = nAcumulado++
                    if (this.lCboCiudad[h].sSaldo - (this.nPrecioFotocheck * nAcumulado) < 0) {

                        Swal.fire({
                            icon: 'warning',
                            title: 'Alerta',
                            text: this.lCboCiudad[h].sNomCiudad + ' no tiene saldo suficiente'
                        });

                        return false
                    }
                }
            }

        }
    }
    //#endregion


    //#region Actualizar Formulario
    fnActualizarFormulario(): void {

        if (this.fnValidarPedido() != false) {

            this.fnConfirmarLineas();

            const Parametro = [];

            Parametro.push(this.nIdUsuario);
            Parametro.push(this.nIdGastoCosto);
            Parametro.push(this.formGroupFotocheck.get('idPresupuesto').value);
            Parametro.push(this.formGroupFotocheck.get('idPlanillas').value);
            Parametro.push(this.nIdPais);
            Parametro.push(this.listaSucursales.join());
            Parametro.push(this.listaNombres.join());
            Parametro.push(this.listaCargos.join());
            Parametro.push(this.listaTotal.join());
            Parametro.push(this.listaImagen.join());
            Parametro.push(this.listaLineasEliminadas.join());


            this.fotocheckService.fnControlFotocheck(14, Parametro, this.url)
                .then(res => {


                    if (this.nuevoDetFotocheckTableData.data.length > 0) {
                        for (let i in this.nuevoDetFotocheckTableData.data) {
                            this.nuevoDetFotocheckTableData.data[i].bLineaConfirmada = true
                        }
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'Actualizado',
                        text: 'Se actualizó correctamente el requerimiento.'
                    });

                },
                    err => console.error(err)
                )

        }
    }
    //#endregion


    //#region Aprobar Requerimiento (RR.HH)
    fnAprobarRQ() {
        const Parametro = [];

        Parametro.push(this.nIdGastoCosto);
        Parametro.push(this.nIdUsuario);
        Parametro.push(this.sSolicitante);
        Parametro.push(this.nCostoTotal);
        Parametro.push(this.nIdPais);
        Parametro.push(this.sCorreoSolic);

        this.fotocheckService.fnControlFotocheck(17, Parametro, this.url)
            .then(res => {

                this.fnOnToggleFab(1, -1);

                this.nEstadoPedido = 2057
                this.FormGroupDetalleNuevo.controls['estado'].setValue('Terminado Finalizado');
                this.FormPedidoFecha.controls['fecha'].setValue(this.dFechaActual);

                this.fnObtenerFormatos();

                Swal.fire({
                    icon: 'success',
                    title: 'Requerimiento Aceptado',
                    text: 'Requerimiento de fotocheck listo para imprimir.'
                });

                this.fnOnToggleFab(1, -1);

            },
                err => console.error(err)
            )

    }
    //#endregion


    //#region Rechazar Requerimiento (RR.HH)
    fnRechazarRQ() {
        const Parametro = [];

        Parametro.push(this.nIdGastoCosto);
        Parametro.push(this.nIdUsuario);
        Parametro.push(this.sSolicitante);
        Parametro.push(this.nCostoTotal);
        Parametro.push(this.nIdPais);
        Parametro.push(this.sCorreoSolic);

        this.fotocheckService.fnControlFotocheck(18, Parametro, this.url)
            .then(res => {

                this.nEstadoPedido = 2057
                this.FormGroupDetalleNuevo.controls['estado'].setValue('Devuelto Comercial');
                this.FormPedidoFecha.controls['fecha'].setValue(this.dFechaActual);

                Swal.fire({
                    icon: 'warning',
                    title: 'Requerimiento Rechazado',
                    text: 'Requerimiento de fotocheck devuelto.'
                });

                this.btnSalir();

            },
                err => console.error(err)
            )
    }
    //#endregion


    //#region Validar Aprobacion
    fnValidarAprobacion(nIdParametro) {

        for (let prop in this.lCboPresupuesto) {

            if (nIdParametro == this.lCboPresupuesto[prop].nIdPresupuesto) {

                if (this.lCboPresupuesto[prop].nEstadoPresupuesto != 2127) {

                    this.listaPresupuestosDenegados.push(this.lCboPresupuesto[prop].nIdPresupuesto)
                    this.fnObtenerPresupuestos();

                    this.formGroupFotocheck.controls['idPresupuesto'].setValue('');
                    Swal.fire({
                        icon: 'warning',
                        title: 'Presupuesto No Aprobado',
                        text: 'El presupuesto indicado aún no esta aprobado por el area de control de costos.'
                    });
                    return false
                }
                else if (this.lCboPresupuesto[prop].nEstado == 2074) {

                    this.listaPresupuestosDenegados.push(this.lCboPresupuesto[prop].nIdPresupuesto)
                    this.fnObtenerPresupuestos();

                    this.formGroupFotocheck.controls['idPresupuesto'].setValue('');
                    Swal.fire({
                        icon: 'warning',
                        title: 'Presupuesto Cerrado',
                        text: 'El presupuesto indicado está cerrado.'
                    });
                    return false

                }
            }
        }
    }
    //#endregion


    //#region Obtener Formatos 
    fnObtenerFormatos() {
        const pParametro = [];
        pParametro.push('');

        this.fotocheckService.fnControlFotocheck(19, pParametro, this.url)
            .then((data: any[]) => {
                this.lCboFormatos = data;
            },
                err => console.error(err)
            )
    }
    //#endregion


    //#region Formato para Imprimir
    fnFormatoImprimir(nIdFormato) {

        this.nEstadoImpresion = true

        for (let i in this.lCboFormatos) {
            if (nIdFormato == this.lCboFormatos[i].nIdFormato) {
                this.sRutaFormato = this.lCboFormatos[i].sRutaFormato
            }
        }

    }
    //#endregion


    //#region Lineas por Eliminar
    fnLineasxEliminar() {
        for (let i in this.listaDetalle) {
            this.listaLineasEliminadas.push(this.listaDetalle[i].nIdGastoDet)
        }
    }
    //#endregion


    //#region Obtener Imagen Según Usuario (id)
    fnObtenerImagen(i, nIdPersonal) {
        const pParametro = [];

        pParametro.push(nIdPersonal);

        this.fotocheckService
            .fnControlFotocheck(20, pParametro, this.url)
            .then((data: any) => {

                if (data.datos == null || data.datos == '') {
                    this.listaDetalle[i].sImagen = 'N'
                }
                else {
                    this.listaDetalle[i].sImagen = 'S'
                    this.listaDetalle[i].sImagenLink = data.datos
                }

            });
    }
    //#endregion


    //#region Obtener Numero
    fnObtenerNumero(nIdGastoCosto) {
        const pParametro = [];

        pParametro.push(nIdGastoCosto);

        this.fotocheckService
            .fnControlFotocheck(21, pParametro, this.url)
            .then((data: any) => {

                this.FormPedidoFecha.controls['pedido'].setValue(data.datos);

            });
    }
    //#endregion


    //#region Obtener Correo Solicitante
    fnObtenerCorreoSol(nIdUsrRegistro) {
        const pParametro = [];

        pParametro.push(nIdUsrRegistro);

        this.fotocheckService
            .fnControlFotocheck(22, pParametro, this.url)
            .then((data: any) => {
                this.sCorreoSolic = data.datos
            });
    }
    //#endregion


    //#region Obtener Margen General
    fnObtenerMargenGeneral() {
        const pParametro = [];

        pParametro.push(this.formGroupFotocheck.get('idPresupuesto').value);

        this.fotocheckService
            .fnControlFotocheck(23, pParametro, this.url)
            .then((data: any) => {


                this.sMargenGeneral = data.datos

                if (parseFloat(this.sMargenGeneral) >= this.nCostoTotal) {
                    if (this.nEstadoPedido == 0) {
                        this.fnGrabarFormulario();
                    }
                    else if (this.nEstadoPedido == 2051) {
                        this.fnEnviarFormulario();
                    }

                }
                else {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Alerta',
                        text: 'El requerimiento excede el saldo de margen general.'
                    });
                }


            });
    }
    //#endregion


    //#region Precio Fotocheck
    fnObtenerPrecioFotocheck() {
        const pParametro = [];

        this.fotocheckService
            .fnControlFotocheck(24, pParametro, this.url)
            .then((data: any) => {

                this.nPrecioFotocheck = parseInt(data.datos);


            });
    }
    //#endregion


    //#region Marcar Todos los Fotochecks
    fnMarcarTodos(checked) {

        this.listaImprimir = []
        let lista = this.nuevoDetFotocheckTableData.data
        let valor = checked == true ? 1 : 0;

        for (let i = 0; i < lista.length; i++) {
            this.nuevoDetFotocheckTableData.data[i].bSeleccionado = valor
            if (this.nuevoDetFotocheckTableData.data[i].bSeleccionado == 1) {
                this.listaImprimir.push(lista[i]);
            }
        }
    }
    //#endregion


    //#region Seleccionar Fotochecks
    fnSeleccionarFotocheck() {
        let lista = this.nuevoDetFotocheckTableData.data
        this.listaImprimir = [];

        for (let i = 0; i < lista.length; i++) {
            if (this.nuevoDetFotocheckTableData.data[i].bSeleccionado) {
                this.allChecked = true;
            }
            else {
                this.allChecked = false
                break;
            }
        }

        for (let i = 0; i < lista.length; i++) {
            if (lista[i].bSeleccionado == 1) {
                this.listaImprimir.push(lista[i]);
            }
        }
    }
    //#endregion


}

