import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { SerieDto } from "src/app/modulos/TFI/repository/models/series/serieDto";
import { SeriesService } from "src/app/modulos/TFI/repository/services/series.service";


@Component({
    selector: "app-serie-list.component",
    templateUrl: "./serie-list.component.html",
    styleUrls: ["./serie-list.component.css"],
    animations: [asistenciapAnimations]
})

export class SerieListComponent implements OnInit {

    //Botones Flotantes
    tsLista = 'active'; // Inicia la lista visible
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'post_add', tool: 'Nueva Serie' },
    ]
    abLista = [];

    //Datos necesarios
    url: string
    idUser: number
    pNom: string
    idEmp: string
    pPais: string
    pNomEmp: string
    nEmpresa: string

    //Parametros
    pOpcion = 1
    pParametro = []

    //Filtro de Busqueda
    tFiltro = new FormControl()
    searchKey: string

    //Lista para la tabla
    lSerieList: SerieDto[]

    //Datos para la tabla
    dataSource: MatTableDataSource<SerieDto>
    displayedColumns = ['opciones', 'tipoDocumento', 'serie', 'ancho', 'numeroActual', 'estado', 'electronica'];

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator
    @ViewChild(MatSort, { static: false }) sort: MatSort

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private servicios: SeriesService,

        @Inject('BASE_URL') baseUrl: string) { this.url = baseUrl }


    ngOnInit(): void {

        //Datos del Usuario
        let user = localStorage.getItem('currentUser')
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno
        this.idEmp = localStorage.getItem('Empresa')
        this.pPais = localStorage.getItem('Pais')

        this.onToggleFab(1, -1)
        this.listarSerie()
    }

    listarSerie() {

        this.spinner.show()
        this.pOpcion = 1
        this.pParametro = []
        this.pParametro.push(this.idEmp)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getSeries(param).subscribe(
            res => {
                this.lSerieList = res.body.response.data
                this.anadirDatosTabla(this.lSerieList)
            },
            err => {
                console.log(err)
            },
            () => {
                this.spinner.hide()
            }
        )
    }

    anadirDatosTabla(lSerieList: SerieDto[]) {
        this.dataSource = new MatTableDataSource(lSerieList)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value
        this.dataSource.filter = filterValue.trim().toLowerCase()
    }

    limpiarFiltro() {
        this.searchKey = ""
        this.listarSerie()
    }

    nuevaSerie() {
        this.router.navigate(['/tfi/facturacion/datosbasicos/serie/add'])
    }

    editarSerie(nIdSerie: number) {
        this.router.navigate(['/tfi/facturacion/datosbasicos/serie/edit/' + nIdSerie])
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
                this.nuevaSerie()
                break
            default:
                break
        }
    }

}