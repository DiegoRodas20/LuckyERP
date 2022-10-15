import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { ReposicionDTO } from "../api/models/reposicionTIDTO";
import { ReposicionService } from "../api/services/reposicion.service";


@Component({
    selector: 'app-ti-reposicion',
    templateUrl: './ti-reposicion.component.html',
    styleUrls: ['./ti-reposicion.component.css'],
    animations: [asistenciapAnimations]
})

export class TiReposicionComponent implements OnInit {


    tsLista = 'active';  // Inicia la lista oculta
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'person_add', tool: 'Registrar Reposicion' }
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

    //Filtro de busqueda
    tFiltro = new FormControl();
    searchKey: string

    //lista para la tabla 
    lReposicionList: ReposicionDTO[] = [];

    //Datos para la tabla 
    dataSource: MatTableDataSource<ReposicionDTO>;
    displayedColumns = ['opciones', 'tipoReposicion', 'activo', 'producto', 'asignado', 'descuento', 'afecta'];

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private servicios: ReposicionService,

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

        //funciones al iniciar 
        this.listarReposiciones()
        this.onToggleFab(1, -1)
    }

    listarReposiciones() {

        this.spinner.show()

        this.servicios.GetAllReposicion().subscribe(
            res => {
                console.log(res)
                this.lReposicionList = res.body.response.data
                this.anadirDatosTabla(this.lReposicionList)
            },
            (error) => {
                console.log(error)
            },
            () => {
                this.spinner.hide()
            }
        )
    }

    anadirDatosTabla(lReposicionList: ReposicionDTO[]) {
        this.dataSource = new MatTableDataSource(lReposicionList)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    limpiar() {
        this.searchKey = ""
        this.listarReposiciones()
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
                break
            default:
                break
        }
    }


}
