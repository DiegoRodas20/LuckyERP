import { Component, OnInit, Inject, Input, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { PresupuestosService } from '../../../presupuestos.service';

export interface ReportePresupuestoEstado {
    empresa: string
    centroCosto: string
    codCC: string
    descCC: string
    cliente: string
    clienteDesc: string
    serv: string
    marca: string
    fecIni: string
    fecFin: string
    ejecutivo: string
    estadoppto: string
    aprobCCostos: string
    creoUsr: string
    creoFecha: string
    fact_Ind: string
    fact_Por: string
    fact_Tipo: string
    fact_Fecha: string
    fact_UltFactura: string
    totalPpto: string
}

@Component({
    selector: 'reporte-ppto-estado.component',
    templateUrl: './reporte-ppto-estado.component.html',
    styleUrls: ["./reporte-ppto-estado.component.css"],
})
export class ReportePresupuestoEstadoComponent implements OnInit {

    ///===================
    pOpcion = 0 //CRUD -> Listar
    pParametro = [] //Parametros de campos vacios
    //========================

    url: string
    idEmp: string
    pPais: string
    pNom: string
    nEmpresa: string
    date: Date = new Date()
    fechaActual: string

    lPresupuestoEstado: ReportePresupuestoEstado[] = []

    constructor(
        private spinner: NgxSpinnerService,
        private servicio: PresupuestosService,
        private dialog: MatDialog,

        @Inject('BASE_URL') baseUrl: string,
        @Inject(MAT_DIALOG_DATA) private variablesImpresion,
    ) {
        this.url = baseUrl
    }

    ngOnInit(): void {

        let user = localStorage.getItem('currentUser')
        this.idEmp = localStorage.getItem('Empresa')
        this.pPais = localStorage.getItem('Pais')
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno
        this.nEmpresa = localStorage.getItem('NomEmpresa');

        this.fechaActual = this.date.getDate() + "/" + (this.date.getMonth() + 1) + "/" + this.date.getFullYear()
        this.mostrarInforme()     
    }

    mostrarInforme() {
        this.pOpcion = 2
        this.pParametro = []

        this.pParametro.push(this.idEmp)
        this.pParametro.push(this.variablesImpresion)

        this.servicio.fnPresupuestosEstados(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {

                if (data.lista == null) {
                    Swal.fire('Atención', 'No se encontraron presupuestos', 'warning')
                    this.dialog.closeAll()
                    this.spinner.hide();
                    return;
                }
                else { 
                    this.lPresupuestoEstado = data.lista 
                    this.spinner.hide();
                }
            }
        )
    }
}