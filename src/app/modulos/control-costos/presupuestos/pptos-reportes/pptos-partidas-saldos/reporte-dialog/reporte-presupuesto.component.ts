import { Component, OnInit, Inject, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { PresupuestosService } from '../../../presupuestos.service';

export interface ReportePresupuestoPartidasSaldos {
    codGen: string
    desGen: string
    lEspecifica: any[]
}

export interface ReportePresupuestoPartidasSaldosTabla {
    canal: string
    cantDias: number
    cantPer: number
    categoria: string
    codEsp: string
    desEsp: string
    diasUsados: number
    sCiudad: string
    saldoDias: number
    tolImp: number
    tolSaldo: number
    totCongelado: number
    totConsumido: number
    totCot: number
    totDia: number
    totImp: number
}
@Component({
    selector: 'reporte-presupuesto.component',
    templateUrl: './reporte-presupuesto.component.html',
    styleUrls: ["./reporte-presupuesto.component.css"]
})

export class ReportePresupuestoComponent implements OnInit {

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

    numeroTabla: number = 0

    listaCabecera
    listaDetalle: ReportePresupuestoPartidasSaldos[] = []
    listaTabla: ReportePresupuestoPartidasSaldosTabla[] = []

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
        this.crearFormulario()
        this.completarFormulario()
    }


    crearFormulario() {
        this.listaCabecera = {
            presupuesto: "",
            fechaInicio: "",
            fechaFin: "",
            cliente: "",
            servicio: "",
            moneda: "",
            canal: "",
            subCanal: "",
            tipoCambio: "",
            dirGeneral: "",
            dirCuentas: "",
            gerCuentas: "",
            ejecutivo: "",
            resgGeneral: "",
            subTotal: "",
            feePersonal: "",
            feeOperativo: "",
            descuento: "",
            total: ""
        }
    }

    completarFormulario() {
        this.pOpcion = 4
        this.pParametro = []

        this.pParametro.push(this.idEmp)
        this.pParametro.push(this.variablesImpresion)
        this.pParametro.push(0)
        this.pParametro.push(0)
        this.pParametro.push(0)

        this.servicio.fnPresupuestoReporte(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                if (data.lGenerica == null) {
                    Swal.fire('Atención', 'No se encontraron presupuestos', 'warning')
                    this.dialog.closeAll()
                    this.spinner.hide();
                    return;
                }
                else {
                    this.listaDetalle = data.lGenerica
                    this.listaCabecera = {
                        //Datos Cabecera
                        presupuesto: data.sCodCC + " - " + data.sDescCC,
                        fechaInicio: data.sFechaIni,
                        fechaFin: data.sFechaFin,
                        cliente: data.sRuc + " " + data.sCliente,
                        servicio: data.sServicio,
                        moneda: data.sMoneda,
                        canal: data.sCanal,
                        subCanal: data.sSubCanal,
                        tipoCambio: data.ntipoCambio,
                        dirGeneral: data.directorGeneral,
                        dirCuentas: data.directorCuenta,
                        gerCuentas: data.gerenteCuenta,
                        ejecutivo: data.ejecutivo,
                        resgGeneral: data.sRazonSocialEmp,
                        subTotal: data.subTotal,
                        feePersonal: data.feePersonal,
                        feeOperativo: data.feeOperativo,
                        descuento: data.nDescuento,
                        total: data.total
                    }
                    this.spinner.hide();
                }
            }
        )
    }
}