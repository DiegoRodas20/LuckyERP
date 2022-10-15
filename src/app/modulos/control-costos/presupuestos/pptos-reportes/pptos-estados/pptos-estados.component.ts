import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { asistenciapAnimations } from '../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { PresupuestosService } from "../../presupuestos.service";
import { ReportePresupuestoEstadoComponent } from "./reporte-dialog/reporte-ppto-estado.component";

export interface ListaAnio {
    anio: string
}

@Component({
    selector: "app-pptos-estados",
    templateUrl: "./pptos-estados.component.html",
    styleUrls: ["./pptos-estados.component.css"],
    animations: [asistenciapAnimations]
})

export class PresupuestoEstadoComponent implements OnInit {

    //Botones Flotantes Pptos y estados
    tsLista = 'active'; // Inicia la lista visible
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'search', tool: 'Ver Reporte' },
        { icon: 'cloud_download', tool: 'Descargar Excel' }
    ]
    abLista = [];


    ///===================
    pOpcion = 0 //CRUD -> Listar
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

    //Lista ddl
    lAnio: ListaAnio[] = []

    // Formulario
    formPptosEstados: FormGroup

    constructor(
        private fb: FormBuilder,
        private spinner: NgxSpinnerService,
        private dialog: MatDialog,
        private servicioPresupuesto: PresupuestosService,

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

        this.crearFormularioPptosEstado()
        this.listaAnio()
        this.onToggleFab(1, -1)
    }
    crearFormularioPptosEstado() {
        this.formPptosEstados = this.fb.group({
            anio: [null, [Validators.required]]
        })
    }


    //Funciones
    listaAnio() {
        this.pOpcion = 1
        this.pParametro = []

        this.servicioPresupuesto.fnPresupuestosEstados(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lAnio = data
            }
        )
    }

    reportePresupuesto() {

        if (this.formPptosEstados.invalid) {
            return Object.values(this.formPptosEstados.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    }
                    else {
                        control.markAsTouched()
                        Swal.fire('Atención', 'Debe seleccionar el año', 'warning')
                    }
                }
            )
        }

        this.spinner.show()
        this.pOpcion = 2
        this.pParametro = []

        this.pParametro.push(this.idEmp)
        this.pParametro.push(this.formPptosEstados.get('anio').value)

        this.servicioPresupuesto.fnDescargarExcelReportePresupuestoEstado(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                if (data.size == 14) {
                    Swal.fire('Atención', 'No se encontraron presupuestos', 'warning')
                    this.spinner.hide()
                    return
                }
                else {
                    this.downloadFile(data)
                }
            }
        )
    }

    public downloadFile(response: any) {
        let name = 'Reporte Presupuesto Estado';
        var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(blob, name + '.xlsx')
        this.spinner.hide();
    }
    verReportePresupuesto() {

        if (this.formPptosEstados.invalid) {
            return Object.values(this.formPptosEstados.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    }
                    else {
                        control.markAsTouched()
                        Swal.fire('Atención', 'Debe seleccionar el año', 'warning')
                    }
                }
            )
        }

        this.spinner.show()
        var variableImpresion = this.formPptosEstados.get('anio').value
        const dialogConfig = new MatDialogConfig()
        dialogConfig.data = variableImpresion
        dialogConfig.maxWidth = '100vw'

        this.dialog.open(ReportePresupuestoEstadoComponent, dialogConfig)
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
                this.verReportePresupuesto()
                break
            case 1:
                this.reportePresupuesto()
                break
            default:
                break
        }
    }
}