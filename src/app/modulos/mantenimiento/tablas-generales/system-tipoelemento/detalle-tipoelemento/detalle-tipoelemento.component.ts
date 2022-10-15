import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import Swal from "sweetalert2";
import { TablasGeneralesService } from "../../services/tablas-generales.service";
import { DetalleTipoElementoDialog } from "./detalle-tipoelemento-dialog/detalle-tipoelemento-dialog.component";

@Component({
    selector: "detalle-tipoelemento.component",
    templateUrl: "./detalle-tipoelemento.component.html",
    styleUrls: ["./detalle-tipoelemento.component.css"],
    animations: [asistenciapAnimations]
})

export class DetalleTipoElementoComponent implements OnInit {

    tsLista = 'active';  // Inicia la lista oculta
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'post_add', tool: 'Registrar' },
        { icon: 'exit_to_app', tool: 'Salir' },
    ];
    abLista = [];

    //Declaracion de datos necesarios 
    url: string
    idUser: number
    pNom: string
    idEmp: string
    pPais: string
    pNomEmp: string
    nEmpresa: string

    nIdTipEleDad: number
    sDesc: string

    pOpcion = 1         //CRUD -> Listar
    pParametro = []     //Parametros de campos vacios

    //Filtro de busqueda
    tFiltro = new FormControl();
    searchKey: string

    //Lista para la tabla 
    lTipoElementoList: any[] = []

    //Datos para la tabla 
    dataSource: MatTableDataSource<any>;
    displayedColumns = ['opcion', 'nIdTipEle', 'sCod', 'sDesc', 'sAbrev', 'bEstado', 'nDadTipEle', 'nIdPais', 'nNotocar', 'nTipo', 'bDis', 'nParam', 'sParam', 'nParam2', 'nameUser', 'dcreaFecha', 'eliminar']

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        private servicio: TablasGeneralesService,
        @Inject('BASE_URL') baseUrl: string
    ) {
        this.url = baseUrl
    }

    ngOnInit(): void {

        this.router.routeReuseStrategy.shouldReuseRoute = () => false
        this.router.onSameUrlNavigation = 'reload'
        
        //Datos del Usuario
        let user = localStorage.getItem('currentUser');
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
        this.idEmp = localStorage.getItem('Empresa');
        this.pPais = localStorage.getItem('Pais');

        this.route.params.subscribe(params => {
            this.nIdTipEleDad = +params.id;
        })

        // Funciones al iniciar la pantalla
        this.listarDescripcion(this.nIdTipEleDad)
        this.listarGeneralTipoElemento(this.nIdTipEleDad)
        this.onToggleFab(1, -1)
    }

    listarDescripcion(nIdTipEleDad: number) {

        this.pOpcion = 11
        this.pParametro = []

        this.pParametro.push(nIdTipEleDad)

        this.servicio.fnTipoElemento(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {

                if (data.length > 0) {
                    this.sDesc = data[0].sDesc
                }
                else {
                    Swal.fire('Verificar', 'error al consultar', 'warning')
                }
            }
        )
    }

    listarGeneralTipoElemento(nIdTipEleDad: number) {
        this.spinner.show()

        this.pOpcion = 2
        this.pParametro = []
        this.pParametro.push(nIdTipEleDad)

        this.servicio.fnTipoElemento(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {

                this.lTipoElementoList = data
                if (this.lTipoElementoList.length == 0) {
                    Swal.fire('Atención', 'No tiene hijos registrados', 'warning')
                    this.anadirDatosTabla(this.lTipoElementoList)
                    this.spinner.hide()
                }
                else {
                    this.anadirDatosTabla(this.lTipoElementoList)
                    this.spinner.hide()
                }
            }
        )
    }

    anadirDatosTabla(lTipoElementoList: any[]) {
        this.dataSource = new MatTableDataSource(lTipoElementoList)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    nuevoTipoElemento() {

        const dialogConfig = new MatDialogConfig()
        var nIdTipEleDad = this.nIdTipEleDad
        var dialogConfigData = { nIdTipEleDad }

        dialogConfig.data = dialogConfigData
        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(DetalleTipoElementoDialog, dialogConfig)
        dialogReg.afterClosed().subscribe(result => {
            this.listarGeneralTipoElemento(this.nIdTipEleDad)
        })
    }

    editarTipoElemento(nIdTipEle: number) {
        const dialogConfig = new MatDialogConfig()
        var dialogConfigData = { nIdTipEle }

        dialogConfig.data = dialogConfigData
        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(DetalleTipoElementoDialog, dialogConfig)
        dialogReg.afterClosed().subscribe(result => {
            this.listarGeneralTipoElemento(this.nIdTipEleDad)
        })
    }

    listaHijosTipoElemento(nIdTipEle: number) {

        this.router.navigate(['/mantenimiento/tablas-generales/detalle-tipoelemento/' + nIdTipEle])
    }

    async eliminarTipoElemento(nIdTipEle: number) {

        this.pOpcion = 10
        this.pParametro = []

        this.pParametro.push(nIdTipEle)

        var resp = await Swal.fire({
            title: '¿Desea continuar?',
            text: "Se eliminará el hijo con nIdTipEle: " + nIdTipEle,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
        })

        if (resp.isConfirmed) {

            this.spinner.show()
            this.servicio.fnTipoElemento(this.pOpcion, this.pParametro, this.url).subscribe(

                data => {

                    if (data.result == 1) {
                        Swal.fire('Exito', 'Se elimino correctamente', 'success')
                        this.listarGeneralTipoElemento(this.nIdTipEleDad)
                        this.spinner.hide()
                    }
                    else {
                        Swal.fire('Error', data.result, 'error')
                        this.listarGeneralTipoElemento(this.nIdTipEleDad)
                        this.spinner.hide()
                    }
                }
            )
        }
    }

    limpiar() {
        this.searchKey = ""
        this.listarGeneralTipoElemento(this.nIdTipEleDad)
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase()
    }

    cerrarVentana() {
        this.router.navigate(['/mantenimiento/tablas-generales/system-tipoelemento'])
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
                this.nuevoTipoElemento()
                break
            case 1:
                this.cerrarVentana()
                break
            default:
                break
        }
    }
}