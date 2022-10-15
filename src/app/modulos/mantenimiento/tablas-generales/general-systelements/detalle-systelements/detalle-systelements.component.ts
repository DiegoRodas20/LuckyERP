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
import { DetalleSystElementsDialog } from "./detalle-systelements-dialog/detalle-systelements-dialog.component";

@Component({
    selector: "detalle-systelements.component",
    templateUrl: "./detalle-systelements.component.html",
    styleUrls: ["./detalle-systelements.component.css"],
    animations: [asistenciapAnimations]
})

export class DetalleSystElementsComponent implements OnInit {

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
    nEleCod: number
    nEleCodDad: number
    cEleNam: string
    cEleCodPadre: string

    pOpcion = 1;  //CRUD -> Listar
    pParametro = []; //Parametros de campos vacios

    //Filtro de busqueda
    tFiltro = new FormControl()
    searchKey: string

    //Lista para la tabla 
    lSystElementsList: any[] = []

    //Datos para la tabla 
    dataSource: MatTableDataSource<any>
    displayedColumns = ['opcion', 'nEleCod', 'cEleCod', 'cEleNam', 'cEleIni', 'cEleDes', 'bStatus', 'nEleCodDad', 'sParam', 'nParam', 'nameUser', 'dcreaFecha', 'eliminar']

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
            this.nEleCod = +params.id;
        });

        // Funciones al iniciar la pantalla
        this.listarcEleNamPadre(this.nEleCod)
        this.listarGeneralSystElements(this.nEleCod)
        this.onToggleFab(1, -1)
    }


    listarcEleNamPadre(nEleCod: number) {

        this.pOpcion = 11
        this.pParametro = []

        this.pParametro.push(nEleCod)

        this.servicio.fnTablasGenerales(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {

                if (data.length > 0) {
                    this.cEleNam = data[0].cEleNam
                }
                else {
                    Swal.fire('Verificar', 'error al consultar', 'warning')
                }
            }
        )

    }

    listarGeneralSystElements(nEleCod: number) {

        this.spinner.show()

        this.pOpcion = 2
        this.pParametro = []
        this.pParametro.push(nEleCod)

        this.servicio.fnTablasGenerales(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {

                this.lSystElementsList = data
                if (this.lSystElementsList.length == 0) {
                    Swal.fire('Atención', 'No tiene hijos registrados', 'warning')
                    this.anadirDatosTabla(this.lSystElementsList)
                    this.spinner.hide()
                }
                else {

                    this.anadirDatosTabla(this.lSystElementsList)
                    this.spinner.hide()
                }
            }
        )

    }

    anadirDatosTabla(lSystElementsList: any[]) {
        this.dataSource = new MatTableDataSource(lSystElementsList)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    nuevoSystElements() {

        const dialogConfig = new MatDialogConfig()
        var nEleCodDad = this.nEleCod
        var dialogConfigData = { nEleCodDad }

        dialogConfig.data = dialogConfigData
        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(DetalleSystElementsDialog, dialogConfig)
        dialogReg.afterClosed().subscribe(result => {
            this.listarGeneralSystElements(this.nEleCod)
        })
    }

    editarSystElements(nEleCod: number) {

        const dialogConfig = new MatDialogConfig()
        var dialogConfigData = { nEleCod }

        dialogConfig.data = dialogConfigData
        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(DetalleSystElementsDialog, dialogConfig)
        dialogReg.afterClosed().subscribe(result => {
            this.listarGeneralSystElements(this.nEleCod)
        })
    }

    listaHijosSystElements(nEleCod: number) {
        this.router.navigate(['/mantenimiento/tablas-generales/detalle-systelements/' + nEleCod])
    }

    async eliminarHijosSystElements(nEleCod: number) {

        this.pOpcion = 10
        this.pParametro = []

        this.pParametro.push(nEleCod)

        var resp = await Swal.fire({
            title: '¿Desea continuar?',
            text: "Se eliminará el hijo con nEleCod: " + nEleCod,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
        })

        if (resp.isConfirmed) {
            this.spinner.show()

            this.servicio.fnTablasGenerales(this.pOpcion, this.pParametro, this.url).subscribe(
                data => {

                    if (data.result == 1) {
                        Swal.fire('Exito', 'Se elimino correctamente', 'success')
                        this.listarGeneralSystElements(this.nEleCod)
                        this.spinner.hide()
                    }
                    else {
                        Swal.fire('Error', data.result, 'error')
                        this.listarGeneralSystElements(this.nEleCod)
                        this.spinner.hide()
                    }
                }
            )
        }
    }

    limpiar() {
        this.searchKey = ""
        this.listarGeneralSystElements(this.nEleCod)
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase()
    }

    cerrarVentana() {
        this.router.navigate(['/mantenimiento/tablas-generales/general-systelements'])
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
                this.nuevoSystElements()
                break
            case 1:
                this.cerrarVentana()
                break
            default:
                break
        }
    }


}