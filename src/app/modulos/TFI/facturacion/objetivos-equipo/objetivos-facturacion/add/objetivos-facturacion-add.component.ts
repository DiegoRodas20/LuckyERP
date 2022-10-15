import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { ObjetivoMensual } from "src/app/modulos/TFI/repository/models/objetivos-facturacion/objetivoFacturacionDto";
import { ObjetivosDialogComponent } from "../edit/objetivos-dialog/objetivos-dialog.component";


@Component({
    selector: "app-objetivos-facturacion-add.component",
    templateUrl: "./objetivos-facturacion-add.component.html",
    styleUrls: ["./objetivos-facturacion-add.component.css"],
    animations: [asistenciapAnimations]
})

export class ObjetivosFacturacionAddComponent implements OnInit {

    //Botones Flotantes
    tsLista = 'active'; // Inicia la lista visible
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'exit_to_app', tool: 'Salir' }
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

    //Listas para la Tablas
    lGrpObjMensual: ObjetivoMensual[]

    //Datos para la tabla Grupos Objetivos Mensuales
    dataSource: MatTableDataSource<ObjetivoMensual>
    displayedColumns = ['seleccionar', 'direccion', 'cliente', 'mes', 'objetivo', 'regularizacion', 'motivo', 'objetivocovid', 'opciones']

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator
    @ViewChild(MatSort, { static: false }) sort: MatSort

    constructor(
        private router: Router,
        private dialog: MatDialog,

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

    }

    //Funciones Grupos Objetivos mensuales

    agregarObjetivoMensual() {

        const dialogConfig = new MatDialogConfig()
        var anio = this.anioActual

        dialogConfig.data = { anio }
        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        const dialogReg = this.dialog.open(ObjetivosDialogComponent, dialogConfig)
        dialogReg.afterClosed().subscribe(
            result => {
                if(result > 0){
                    this.router.navigate(['/tfi/facturacion/Objetivos/fact_objetivos/edit/' + result])
                }
            })
    }

    cerrarVentana() {
        this.router.navigate(['/tfi/facturacion/Objetivos/fact_objetivos'])
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
                this.cerrarVentana()
                break
            default:
                break
        }
    }

}
