import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { CatalogoClienteDto } from "src/app/modulos/TFI/repository/models/catalogo-cliente/catalogoClienteDto";
import { CatalogoClienteService } from "src/app/modulos/TFI/repository/services/catalogo-cliente.service";


@Component({
    selector: "app-catalogo-list.component",
    templateUrl: "./catalogo-list.component.html",
    styleUrls: ["./catalogo-list.component.css"],
    animations: [asistenciapAnimations]
})

export class CatalogoListComponent implements OnInit {

    tsLista = 'active';  // Inicia la lista oculta
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'person_add', tool: 'Registrar Cliente' }
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

    pOpcion = 2;  //CRUD -> Listar
    pParametro = []; //Parametros de campos vacios

    //Filtro de busqueda
    tFiltro = new FormControl();
    searchKey: string

    //lista para la tabla 
    lCatalogoList: CatalogoClienteDto[] = [];

    //Datos para la tabla 
    dataSource: MatTableDataSource<CatalogoClienteDto>;
    displayedColumns = ['opciones', 'ruc', 'razonsocial', 'nombrecomercial', 'gironegocio', 'estado'];

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private servicios: CatalogoClienteService,

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
        this.listarClientes()
        this.onToggleFab(1, -1)
    }

    //Funciones

    listarClientes() {

        this.spinner.show()
        this.pOpcion = 1
        this.pParametro = []
        this.pParametro.push(this.pPais)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getCatalogoClientes(param).subscribe(
            res => {
                this.lCatalogoList = res.body.response.data
                this.anadirDatosTabla(this.lCatalogoList)
            },
            (error) => {
                console.log(error)
            },
            () => {
                this.spinner.hide()
            }
        )
    }

    anadirDatosTabla(lCatalogoList: CatalogoClienteDto[]) {
        this.dataSource = new MatTableDataSource(lCatalogoList)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    limpiar() {
        this.searchKey = ""
        this.listarClientes()
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase()
    }

    nuevoCliente() {
        this.router.navigate(['/tfi/facturacion/datosbasicos/catalagocliente/add'])
    }

    editarCliente(idCliente: number) {
        this.router.navigate(['/tfi/facturacion/datosbasicos/catalagocliente/edit/' + idCliente])
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
                this.nuevoCliente()
                break
            default:
                break
        }
    }
}
















