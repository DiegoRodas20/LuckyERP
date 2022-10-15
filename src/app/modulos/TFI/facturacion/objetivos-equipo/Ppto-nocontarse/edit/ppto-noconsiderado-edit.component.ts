import { Component, Inject, OnInit, ViewChild } from "@angular/core"
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { Empresa, PresupuestoxEmpresa } from "src/app/modulos/TFI/repository/models/ppto-nocontarse/pptoNoConsiderarDto";
import { PptonoContarseService } from "src/app/modulos/TFI/repository/services/ppto-nocontarse.service";

import Swal from "sweetalert2";
import { PptoModalEditComponent } from "./pptoModal/pptoModalEdit.component";


@Component({
    selector: "app-ppto-noconsiderado-edit.component",
    templateUrl: "./ppto-noconsiderado-edit.component.html",
    styleUrls: ["./ppto-noconsiderado-edit.component.css"],
    animations: [asistenciapAnimations]
})

export class PptonoConsideradoEditComponent implements OnInit {

    tsLista = 'active' // Inicia la lista oculta
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'cloud_download', tool: 'Descargar Lista Pptos' },
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

    presupuestoEmpresaID: number
    anio: number

    //Filtro de Busqueda
    tFiltro = new FormControl()
    searchKey: string

    //Lista Empresa 
    lEmpresa: Empresa[] = []

    //Lista Tabla
    lPresupuestosxRegistro: PresupuestoxEmpresa[] = []

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
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private servicios: PptonoContarseService,

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

        this.route.params.subscribe(params => {
            this.presupuestoEmpresaID = +params.id
            this.anio = + params.anio
            this.consultarPresupuestoxID(this.presupuestoEmpresaID)
        })
        this.crearFormRegistro()

        this.formRegistro.controls.sEmpresa.patchValue(1)
        this.listaEmpresas()
        this.onToggleFab(1, -1)

    }

    // Formularios 

    crearFormRegistro() {
        this.formRegistro = this.formBuilder.group({
            sEmpresa: [null, [Validators.required]],
            sAno: [this.anio],
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

    consultarPresupuestoxID(presupuestoEmpresaID: number) {

        this.spinner.show()
        this.pOpcion = 5
        this.pParametro = []
        this.pParametro.push(presupuestoEmpresaID)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getPresupuestosxEmpresa(param).subscribe(
            data => {
                this.lPresupuestosxRegistro = data.body.response.data
                this.anadirDatosTabla(this.lPresupuestosxRegistro)
            },
            err => { },
            () => {
                this.spinner.hide()
            }
        )
    }

    anadirDatosTabla(lPresupuestosxRegistro: PresupuestoxEmpresa[]) {
        this.dataSource = new MatTableDataSource(lPresupuestosxRegistro);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    agregarPresupuesto() {
        const dialogConfig = new MatDialogConfig()

        dialogConfig.maxWidth = '100vw'
        dialogConfig.width = '800px'

        dialogConfig.data = {
            PresupuestoEmpresaID: this.presupuestoEmpresaID
        }

        const dialogReg = this.dialog.open(PptoModalEditComponent, dialogConfig)

        dialogReg.componentInstance.oDatos.subscribe(
            data => {
                this.consultarPresupuestoxID(data)
            }
        )

        dialogReg.afterClosed().subscribe(result => {
            this.consultarPresupuestoxID(this.presupuestoEmpresaID)
        });
    }

    eliminarPresupuesto(nIdPptoNoConsDET: number) {

        this.pOpcion = 8
        this.pParametro = []
        this.pParametro.push(nIdPptoNoConsDET)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.DeletePresupuestoxEmpresa(param).subscribe(
            data => {
                if (data.body.response.data[0].valorRetorno == 1) {
                    Swal.fire('Exito', 'Se elimino el presupuesto.', 'success')
                    this.consultarPresupuestoxID(this.presupuestoEmpresaID)
                }
                else {
                    Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                }
            })
    }

    descargarXLSPrespuestosxEmpresa() {
        this.spinner.show()
        this.pOpcion = 10
        this.pParametro = []

        this.pParametro.push(this.presupuestoEmpresaID)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.GetPresupuestosxEmpresaXLS(param).subscribe(
            data => {

                if (data.size == 14) {
                    Swal.fire('Atención', 'No se encontraron presupuestos', 'warning')
                    this.spinner.hide();
                    return;
                }
                else {
                    this.downloadFile(data);
                }
            }
        )
    }

    public downloadFile(response: any) {
        let name = 'XLS Presupuestos No Considerados';
        var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, name + '.xlsx');
        this.spinner.hide();
        return
    }

    cerrarVentana() {
        this.router.navigate(['/tfi/facturacion/Objetivos/pptosnoconsiderar'])
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value
        this.dataSource.filter = filterValue.trim().toLowerCase()
    }

    limpiarFiltro() {
        this.searchKey = ""
        this.consultarPresupuestoxID(this.presupuestoEmpresaID)
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
                this.descargarXLSPrespuestosxEmpresa()
                break
            case 1:
                this.cerrarVentana()
                break
            default:
                break
        }
    }

}