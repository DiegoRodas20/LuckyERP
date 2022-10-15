import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { Parametros } from "src/app/modulos/TFI/repository/models/general/parametros";
import { PptoNoConsiderarDto } from "src/app/modulos/TFI/repository/models/ppto-nocontarse/pptoNoConsiderarDto";
import { PptonoContarseService } from "src/app/modulos/TFI/repository/services/ppto-nocontarse.service";
import Swal from "sweetalert2";


@Component({
    selector: "app-ppto-noconsiderado-list.component",
    templateUrl: "./ppto-noconsiderado-list.component.html",
    styleUrls: ["./ppto-noconsiderado-list.component.css"],
    animations: [asistenciapAnimations]
})
export class PptonoConsideradoListComponent implements OnInit {

    tsLista = 'active';  // Inicia la lista oculta
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'post_add', tool: 'Nueva Lista' }
    ];
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
    lPresupuestoList: PptoNoConsiderarDto[] = []

    //Datos para la tabla
    dataSource: MatTableDataSource<PptoNoConsiderarDto>
    displayedColumns = ['opciones', 'empresa', 'año', 'cantidadPpto', 'estado']

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator
    @ViewChild(MatSort, { static: false }) sort: MatSort

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private servicios: PptonoContarseService,
        @Inject('BASE_URL') baseUrl: string) { this.url = baseUrl }

    ngOnInit(): void {

        //Datos del Usuario
        let user = localStorage.getItem('currentUser')
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
        this.idEmp = localStorage.getItem('Empresa');
        this.pPais = localStorage.getItem('Pais');

        this.anioActual = this.date.getFullYear()

        //Listar Empresas al Iniciar
        this.listarEmpresasxPresupuesto()
        this.onToggleFab(1, -1)
    }

    listarEmpresasxPresupuesto() {

        this.spinner.show()
        this.pOpcion = 1
        this.pParametro = [];

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getPptonoConsiderar(param).subscribe(
            res => {
                this.lPresupuestoList = res.body.response.data
                this.anadirDatosTabla(this.lPresupuestoList)
            },
            err => { },
            () => {
                this.spinner.hide()
            }
        )
    }

    anadirDatosTabla(lPresupuestoList: any[]) {
        this.dataSource = new MatTableDataSource(lPresupuestoList)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value
        this.dataSource.filter = filterValue.trim().toLowerCase()
    }

    limpiarFiltro() {
        this.searchKey = ""
        this.listarEmpresasxPresupuesto()
    }

    nuevo() {

        this.pOpcion = 9
        this.pParametro = [];

        this.pParametro.push(this.idEmp)
        this.pParametro.push(this.anioActual)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        }

        this.servicios.ValidarEmpresaxAnio(params).subscribe(
            data => {
                if (data.body.response.data[0].valorRetorno == 0) {
                    Swal.fire('Atención', 'Esta empresa, para este año, ya tiene registros, debe buscar y editar la lista correspondiente.', 'warning')
                    return
                }
                else if (data.body.response.data[0].valorRetorno == 1) {
                    this.router.navigate(['/tfi/facturacion/Objetivos/pptosnoconsiderar/add'])
                }
            }
        )

    }

    editar(presupuestoEmpresaID: number, anio: number) {
        this.router.navigate(['/tfi/facturacion/Objetivos/pptosnoconsiderar/edit/' + presupuestoEmpresaID + '/' + anio])
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
                this.nuevo()
                break
            default:
                break
        }
    }


}