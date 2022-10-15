import { Component, Inject, OnInit, ViewChild } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { Parametros } from "src/app/modulos/TFI/repository/models/general/parametros";
import { Empresa, PresupuestoxEmpresa } from "src/app/modulos/TFI/repository/models/ppto-nocontarse/pptoNoConsiderarDto";

import { PptonoContarseService } from "src/app/modulos/TFI/repository/services/ppto-nocontarse.service";
import Swal from "sweetalert2";
import { PptoModalComponent } from "./pptoModal/pptoModal.component";

@Component({
    selector: "app-ppto-noconsiderado-add.component",
    templateUrl: "./ppto-noconsiderado-add.component.html",
    styleUrls: ["./ppto-noconsiderado-add.component.css"],
    animations: [asistenciapAnimations]
})

export class PptonoConsideradoAddComponent implements OnInit {

    tsLista = 'active' // Inicia la lista oculta
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'save', tool: 'Registrar' },
        { icon: 'exit_to_app', tool: 'Salir' }
    ];
    abLista = []

    //===================
    pOpcion = 1  //CRUD -> Listar
    pDetalle = []
    pParametro = [] //Parametros de campos vacios
    //========================

    //Declaracion de datos necesarios 
    url: string
    idUser: number
    pNom: string
    idEmp: string
    pPais: string
    pNomEmp: string
    nEmpresa: string
    nIdCentroCosto: number

    date: Date = new Date()
    anioActual: number

    //Lista Combo 
    lEmpresa: Empresa[] = []

    //Forms
    formRegistro: FormGroup

    //Datos para la tabla
    dataSource: MatTableDataSource<PresupuestoxEmpresa>
    displayedColumns = ['presupuesto', 'descripcion', 'cliente', 'opciones']

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private servicios: PptonoContarseService,

        @Inject('BASE_URL') baseUrl: string
    ) {
        this.url = baseUrl
        this.spinner.show()
    }

    ngOnInit(): void {

        //Datos del Usuario
        let user = localStorage.getItem('currentUser');
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
        this.idEmp = localStorage.getItem('Empresa');
        this.pPais = localStorage.getItem('Pais');

        this.anioActual = this.date.getFullYear()
        this.crearFormRegistro()

        this.formRegistro.controls.sEmpresa.patchValue(1)
        this.listaEmpresas()
        this.onToggleFab(1, -1)

        this.spinner.hide()
    }

    // Formularios 

    crearFormRegistro() {
        this.formRegistro = this.formBuilder.group({
            sEmpresa: [null, [Validators.required]],
            sAno: [this.anioActual],
            sEstado: ['Activo']
        })
    }

    listaEmpresas() {
        this.pOpcion = 2
        this.pParametro = []
        this.pParametro.push(this.idEmp)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getEmpresas(param).subscribe(
            data => {
                this.lEmpresa = data.body.response.data
            }
        )
    }

    registrarPresupuestoxEmpresa() {

        if (this.formRegistro.invalid) {
            return Object.values(this.formRegistro.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    } else {
                        control.markAsTouched()
                        Swal.fire('Atención', 'Existen datos pendientes por completar', 'warning')
                    }
                }
            )
        }

        const lineas = []

        if (!this.dataSource) {
            Swal.fire('Error', 'Debe ingresar almenos un presupuesto', 'error')
            return
        }

        this.dataSource.filteredData.forEach(
            (detalle) => {
                let fila = []
                fila.push(detalle.presupuestoDetalleID)
                fila.push(1)
                lineas.push(fila.join(","))
            })

        this.pOpcion = 6
        this.pParametro = []

        let formRegistro = this.formRegistro.value

        this.pParametro.push(formRegistro.sEmpresa)
        this.pParametro.push(formRegistro.sAno)
        this.pParametro.push(1)
        this.pParametro.push(lineas.join("/"))

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        }

        this.servicios.InsertPptonoConsiderar(params).subscribe(
            data => {
                if (data.body.response.data[0].valorRetorno == 0) {
                    Swal.fire('Atención', 'Esta empresa, para este año, ya tiene registros, debe buscar y editar la lista correspondiente.', 'warning')
                }
                else if (data.body.response.data[0].valorRetorno == 1) {
                    Swal.fire('Exito', 'Se grabó con éxito.', 'success').then(
                        r => {
                            this.router.navigate(['/tfi/facturacion/Objetivos/pptosnoconsiderar'])
                        }
                    )
                }
                else {
                    Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                }
            },
            err => {
                this.spinner.hide()
            },
            () => {
                this.spinner.hide()
            }
        )
    }

    agregarPresupuesto() {
        const dialogConfig = new MatDialogConfig()
        const arreglo = this.pDetalle

        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'
        dialogConfig.data = arreglo

        const dialogReg = this.dialog.open(PptoModalComponent, dialogConfig)

        dialogReg.componentInstance.oDatos.subscribe(
            data => {
                this.pDetalle = data
                this.anadirDatosTabla(this.pDetalle)
            })

    }

    eliminarPresupuesto(presupuestoID: number) {
        this.pDetalle = this.pDetalle.filter(
            function (rest) {
                return rest.PresupuestoID !== presupuestoID
            })

        this.anadirDatosTabla(this.pDetalle)
    }

    anadirDatosTabla(pDetalle: any[]) {
        this.dataSource = new MatTableDataSource(pDetalle);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    cerrarVentana() {
        this.router.navigate(['/tfi/facturacion/Objetivos/pptosnoconsiderar'])
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
                this.registrarPresupuestoxEmpresa()
                break
            case 1:
                this.cerrarVentana()
                break
            default:
                break
        }
    }

}


