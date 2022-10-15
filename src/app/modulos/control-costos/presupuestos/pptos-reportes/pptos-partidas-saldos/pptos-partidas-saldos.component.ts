import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { asistenciapAnimations } from '../../../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { PresupuestosService } from "../../presupuestos.service";
import { ReportePresupuestoComponent } from "./reporte-dialog/reporte-presupuesto.component";

export interface ListaPresupuesto {
    idPre: string
    codPre: string
}

export interface ListaAnio {
    anio: string
}

export interface ListaMes {
    codMes: string
    sMes: string
}

export interface ReportePresupuesto {
    sRazonSocialEmp: string
    nIdCentroCosto: string
    sCodCC: string
    sDescCC: string
    sCliente: string
    sServicio: string
    ejecutiva: string
}

@Component({
    selector: "app-pptos-partidas-saldos",
    templateUrl: "./pptos-partidas-saldos.component.html",
    styleUrls: ["./pptos-partidas-saldos.component.css"],
    animations: [asistenciapAnimations]
})

export class PresupuestoPartidasSaldo implements OnInit {


    //Botones Flotantes
    tsLista = 'active'; // Inicia la lista visible
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'search', tool: 'Ver Reporte', estado: true },
        { icon: 'cloud_download', tool: 'Descargar Excel', estado: false }
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
    nMostrar: number
    estadoPresupuesto: number
    lReportePresupuestos: ReportePresupuesto[] = []
    opcionPresupuesto: number

    //Lista ddl
    lPresupuesto: ListaPresupuesto[] = []
    lAnio: ListaAnio[] = []
    lMes: ListaMes[] = []

    // Formulario
    formPptosEstados: FormGroup
    formPartidas: FormGroup

    constructor(
        private fb: FormBuilder,
        private spinner: NgxSpinnerService,
        private dialog: MatDialog,
        private servicioPresupuesto: PresupuestosService,

        @Inject('BASE_URL') baseUrl: string
    ) {
        this.url = baseUrl
        this.opcionPresupuesto = 3
        this.estadoPresupuesto = 2073
    }

    ngOnInit(): void {

        //Datos del Usuario
        let user = localStorage.getItem('currentUser');
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
        this.idEmp = localStorage.getItem('Empresa');
        this.pPais = localStorage.getItem('Pais');

        this.crearFormulario()
        this.listaAnio()
        this.listaMes()
        this.listaPresupuesto()
        this.cambiarPresupuesto(1)
    }

    crearFormulario() {
        this.formPartidas = this.fb.group({
            rbPresupuestos: true,
            rbEstadoPresupuesto: [1],
            presupuesto: [null, [Validators.required]],
            año: [null, [Validators.required]],
            mes: [null, [Validators.required]],
        })
    }

    //Funciones

    listaAnio() {

        this.pOpcion = 5
        this.pParametro = []

        this.pParametro.push(this.idEmp)

        this.servicioPresupuesto.fnPresupuestoReporte(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lAnio = data
            })
    }

    listaMes() {

        this.pOpcion = 1
        this.pParametro = []

        this.pParametro.push(this.idEmp)

        this.servicioPresupuesto.fnPresupuestoReporte(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lMes = data
            })
    }

    listaPresupuesto() {

        this.pOpcion = 2
        this.pParametro = []

        this.servicioPresupuesto.fnPresupuestoReporte(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lPresupuesto = data
            })
    }

    cambiarPresupuesto(opcion: number) {
        if (opcion == 0) {
            this.formPartidas.controls.presupuesto.enable()
            this.formPartidas.controls.año.disable()
            this.formPartidas.controls.mes.disable()
            this.formPartidas.controls.año.setValue(null)
            this.formPartidas.controls.mes.setValue(null)
            this.nMostrar = 0
            this.tsLista = 'active'
            this.fbLista = [
                { icon: 'search', tool: 'Ver Reporte', estado: false },
                { icon: 'cloud_download', tool: 'Descargar Excel', estado: false }
            ]
            this.abLista = []
            this.onToggleFab(1, -1)
            this.estadoPresupuesto = null
            this.opcionPresupuesto = 4
        }
        if (opcion == 1) {
            this.formPartidas.controls.presupuesto.setValue(null)
            this.formPartidas.controls.presupuesto.disable()
            this.formPartidas.controls.año.enable()
            this.formPartidas.controls.mes.enable()
            this.nMostrar = 1
            this.formPartidas.controls.rbEstadoPresupuesto.setValue(1)
            this.tsLista = 'active'
            this.fbLista = [
                { icon: 'search', tool: 'Ver Reporte', estado: true },
                { icon: 'cloud_download', tool: 'Descargar Excel', estado: false }
            ]
            this.abLista = []
            this.onToggleFab(1, -1)
            this.estadoPresupuesto = 2073
            this.opcionPresupuesto = 3
        }
    }

    cambiarEstadoPresupuesto(opcion: number) {
        this.estadoPresupuesto = opcion
    }

    reportePresupuesto() {

        if (this.formPartidas.invalid) {
            return Object.values(this.formPartidas.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    }
                    else {
                        control.markAsTouched()
                        Swal.fire('Atención', 'Complete los filtros', 'warning')
                    }
                }
            )
        }

        this.spinner.show()
        this.pOpcion = this.opcionPresupuesto
        this.pParametro = []

        this.pParametro.push(this.idEmp)
        this.pParametro.push(this.formPartidas.get('presupuesto').value)
        this.pParametro.push(this.formPartidas.get('año').value)
        this.pParametro.push(this.formPartidas.get('mes').value)
        this.pParametro.push(this.estadoPresupuesto)

        this.servicioPresupuesto.fnDescargarExcelReportePresupuesto(this.pOpcion, this.pParametro, this.url).subscribe(
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
        let name = 'Reporte Ppto Partidas Saldos';
        var blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, name + '.xlsx');
        this.spinner.hide();
    }

    verReportePresupuesto() {

        if (this.formPartidas.invalid) {
            return Object.values(this.formPartidas.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    }
                    else {
                        control.markAsTouched()
                        Swal.fire('Atención', 'Indique el Presupuesto', 'warning')
                    }
                }
            )
        }

        this.spinner.show()
        
        var variableImpresion = this.formPartidas.get('presupuesto').value
        const dialogConfig = new MatDialogConfig()
        dialogConfig.data = variableImpresion
        dialogConfig.maxWidth = '95vw'

        this.dialog.open(ReportePresupuestoComponent, dialogConfig)
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