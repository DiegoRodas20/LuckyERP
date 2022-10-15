import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import Swal from "sweetalert2";
import { TablasGeneralesService } from "../services/tablas-generales.service";
import { GeneralSystElementsDialog } from "./general-systelements-dialog/general-systelements-dialog.component";

@Component({
    selector: "general-systelements.component",
    templateUrl: "./general-systelements.component.html",
    styleUrls: ["./general-systelements.component.css"],
    animations: [asistenciapAnimations]
})

export class GeneralSystElementsComponent implements OnInit {

    tsLista = 'active';  // Inicia la lista oculta
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'post_add', tool: 'Registrar' }
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
    cEleNam: string

    pOpcion = 2;  //CRUD -> Listar
    pParametro = []; //Parametros de campos vacios

    //Filtro de busqueda
    tFiltro = new FormControl();
    searchKey: string

    //Lista para la tabla 
    lSystElementsList: any[] = [];

    //Datos para la tabla 
    dataSource: MatTableDataSource<any>;
    displayedColumns = ['opcion', 'nEleCod', 'cEleCod', 'cEleNam', 'cEleIni', 'cEleDes', 'bStatus', 'nEleCodDad', 'sParam', 'nParam', 'nameUser', 'dcreaFecha', 'eliminar']

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private dialog: MatDialog,
        private servicio: TablasGeneralesService,
        @Inject('BASE_URL') baseUrl: string
    ) {
        this.url = baseUrl
    }
    ngOnInit(): void {

        //Datos del Usuario
        let user = localStorage.getItem('currentUser');
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
        this.idEmp = localStorage.getItem('Empresa');
        this.pPais = localStorage.getItem('Pais');

        // Funciones al iniciar la pantalla

        this.listarGeneralSystElements()
        this.onToggleFab(1, -1)
    }

    listarGeneralSystElements() {
        this.spinner.show()

        this.pOpcion = 1
        this.pParametro = []

        this.servicio.fnTablasGenerales(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lSystElementsList = data
                if (this.lSystElementsList.length == 0) {
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

        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(GeneralSystElementsDialog, dialogConfig)
        dialogReg.afterClosed().subscribe(result => {
            this.listarGeneralSystElements()
        })
    }

    editarSystElements(nEleCod: number) {
        const dialogConfig = new MatDialogConfig()
        var data = nEleCod

        dialogConfig.data = data
        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(GeneralSystElementsDialog, dialogConfig)
        dialogReg.afterClosed().subscribe(result => {
            this.listarGeneralSystElements()
        })
    }

    listaHijosSystElements(nEleCod: number) {

        this.router.navigate(['/mantenimiento/tablas-generales/detalle-systelements/' + nEleCod])
    }

    async eliminarHijosSystElements(nEleCod: number) {

        this.pOpcion = 6
        this.pParametro = []

        this.pParametro.push(nEleCod)

        var resp = await Swal.fire({
            title: '¿Desea continuar?',
            text: "Se eliminará el padre con nEleCod: " + nEleCod,
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
                        this.listarGeneralSystElements()
                        this.spinner.hide()
                    }
                    else {
                        Swal.fire('Error', data.result, 'error')
                        this.listarGeneralSystElements()
                        this.spinner.hide()
                    }
                }
            )
        }
    }

    limpiar() {
        this.searchKey = ""
        this.listarGeneralSystElements()
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase()
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
            default:
                break
        }
    }
}