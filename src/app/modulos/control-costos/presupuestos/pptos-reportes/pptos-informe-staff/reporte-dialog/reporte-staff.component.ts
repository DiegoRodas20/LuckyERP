import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { PresupuestosService } from "../../../presupuestos.service";

export interface ReporteStaff {
    sNroMes: string
    sMes: string
    sAnio: string
    sPlla: string
    sNroDocumento: string
    sNombreCompleto: string
    sCargo: string
    sFchIngreso: string
    sFchBaja: string
    sResponsable: string
    sSucNombre: string
    sTareo: string
}
@Component({
    selector: 'reporte-staff.component',
    templateUrl: './reporte-staff.component.html',
    styleUrls: ["./reporte-staff.component.css"]
})

export class ReporteStaffComponent implements OnInit {

    ///===================
    pOpcion = 0 //CRUD -> Listar
    pParametro = [] //Parametros de campos vacios
    //========================

    url: string
    idUser: number
    pNom: string
    idEmp: string
    pPais: string
    pNomEmp: string
    nEmpresa: string
    date: Date = new Date()
    fechaActual: string

    lReporteStaff: ReporteStaff[] = []

    constructor(
        private spinner: NgxSpinnerService,
        private servicio: PresupuestosService,
        private dialog: MatDialog,

        @Inject('BASE_URL') baseUrl: string,
        @Inject(MAT_DIALOG_DATA) private variableDialog,
    ) {
        this.url = baseUrl
    }

    ngOnInit(): void {

        let user = localStorage.getItem('currentUser');
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
        this.idEmp = localStorage.getItem('Empresa');
        this.pPais = localStorage.getItem('Pais');
        this.nEmpresa = localStorage.getItem('NomEmpresa');

        // this.date = Date.now()
        this.fechaActual = this.date.getDate() + "/" + (this.date.getMonth() + 1) + "/" + this.date.getFullYear()
        this.completarReporteStaff()
    }

    completarReporteStaff() {

        this.pOpcion = 2
        this.pParametro = []

        this.pParametro.push(this.variableDialog.data)
        this.pParametro.push(this.variableDialog.data2)
        this.pParametro.push(this.variableDialog.data3)

        this.servicio.fnInformePersonalStaff(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                if (data.lista == null) {
                    Swal.fire('Atención', 'No se encontraron registros', 'warning')
                    this.dialog.closeAll()
                    this.spinner.hide();
                    return
                }
                else {
                    this.lReporteStaff = data.lista
                    this.spinner.hide()
                }
            }
        )
    }
}