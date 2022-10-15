import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { Parametros } from "src/app/modulos/TFI/repository/models/general/parametros";
import { ObjetivoFacturacionDto } from "src/app/modulos/TFI/repository/models/objetivos-facturacion/objetivoFacturacionDto";
import { ObjetivosFacturacionService } from "src/app/modulos/TFI/repository/services/objetivos-facturacion.service";
import Swal from "sweetalert2";


@Component({
    selector: "app-objetivos-facturacion-list.component",
    templateUrl: "./objetivos-facturacion-list.component.html",
    styleUrls: ["./objetivos-facturacion-list.component.css"],
    animations: [asistenciapAnimations]
})

export class ObjetivosFacturacionListComponent implements OnInit {

    //Botones Flotantes
    tsLista = 'active'; // Inicia la lista visible
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'attach_money', tool: 'Agregar Objetivo' },
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

    date: Date = new Date()
    anioActual: number

    //Parametros
    pOpcion = 1
    pParametro = []

    //Filtro de Busqueda
    tFiltro = new FormControl()
    searchKey: string

    //Lista para la tabla
    lObjFacturacionList: ObjetivoFacturacionDto[]

    //Datos para la tabla
    dataSource: MatTableDataSource<ObjetivoFacturacionDto>
    displayedColumns = ['opciones', 'empresa', 'anio', 'objetivo']

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator
    @ViewChild(MatSort, { static: false }) sort: MatSort


    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private servicios: ObjetivosFacturacionService,

        @Inject('BASE_URL') baseUrl: string) { this.url = baseUrl }

    ngOnInit(): void {

        //Datos del Usuario
        let user = localStorage.getItem('currentUser')
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno
        this.idEmp = localStorage.getItem('Empresa')
        this.pPais = localStorage.getItem('Pais')

        this.anioActual = this.date.getFullYear()

        this.onToggleFab(1, -1)
        this.listarObjetivosFacturacion()
    }

    listarObjetivosFacturacion() {

        this.spinner.show()
        this.pOpcion = 1
        this.pParametro = []
        this.pParametro.push(this.idEmp)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getObjetivosFacturacion(param).subscribe(
            res => {
                this.lObjFacturacionList = res.body.response.data
                this.anadirDatosTabla(this.lObjFacturacionList)
            },
            err => { },
            () => {
                this.spinner.hide()
            }
        )
    }

    anadirDatosTabla(lObjFacturacionList: ObjetivoFacturacionDto[]) {
        this.dataSource = new MatTableDataSource(lObjFacturacionList)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    nuevoObjetivoFacturacion() {
        this.pOpcion = 19
        this.pParametro = []

        this.pParametro.push(this.idEmp)
        this.pParametro.push(this.anioActual)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        }

        this.servicios.ValidarRegistro(params).subscribe(
            data => {
                if (data.body.response.data[0].valorRetorno == 0) {
                    Swal.fire('Atención', 'Esta empresa, para este año, ya tiene registros, debe buscar la lista correspondiente.', 'warning')
                    return
                }
                else if (data.body.response.data[0].valorRetorno == 1) {
                    this.router.navigate(['/tfi/facturacion/Objetivos/fact_objetivos/add'])
                }
            }
        )
    }

    verObjetivoFacturacion(anio: number) {
        this.router.navigate(['/tfi/facturacion/Objetivos/fact_objetivos/edit/' + anio])
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value
        this.dataSource.filter = filterValue.trim().toLowerCase()
    }

    limpiarFiltro() {
        this.searchKey = ""
        this.listarObjetivosFacturacion()
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
                this.nuevoObjetivoFacturacion()
                break
            default:
                break
        }
    }

}