import { Component, EventEmitter, Inject, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Presupuesto } from "src/app/modulos/TFI/repository/models/ppto-nocontarse/pptoNoConsiderarDto";
import { PptonoContarseService } from "src/app/modulos/TFI/repository/services/ppto-nocontarse.service";

import Swal from "sweetalert2";


@Component({
    selector: 'app-pptoModal',
    templateUrl: './pptoModal.component.html',
    styleUrls: ['./pptoModal.component.css']
})

export class PptoModalComponent implements OnInit {

    idEmp: string
    url: string
    sDatos: any[] = []
    PresupuestoID: number
    CodigoPresupuesto: string
    estado: number

    //===================
    pOpcion = 1      //CRUD -> Listar
    pParametro = []  //Parametros de campos vacios
    //========================

    //Lista ddl Presupuesto
    lPresupuesto: Presupuesto[] = []
    lPresupuestoSeleccionado: Presupuesto[] = []

    //Forms
    formPresupuesto: FormGroup

    @Output() oDatos: EventEmitter<any> = new EventEmitter()

    constructor(
        private formBuilder: FormBuilder,
        private servicios: PptonoContarseService,
        private dialogRef: MatDialogRef<PptoModalComponent>,

        @Inject('BASE_URL') baseUrl: string,
        @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        this.url = baseUrl
    }

    ngOnInit(): void {

        this.idEmp = localStorage.getItem('Empresa');

        this.estado = 1
        this.sDatos = this.data
        this.crearFormPresupuesto()
        this.listaPresupuestos()
    }

    crearFormPresupuesto() {
        this.formPresupuesto = this.formBuilder.group({
            PresupuestoID: [null],
            CodigoPresupuesto: [null, [Validators.required]],
            DescripcionPresupuesto: [null],
            RazonSocial: [null]
        })
    }

    listaPresupuestos() {

        this.pOpcion = 3
        this.pParametro = []
        this.pParametro.push(this.idEmp)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getPresupuestos(param).subscribe(
            data => {
                this.lPresupuesto = data.body.response.data
            })
    }

    listaDescripcion(event) {

        this.pParametro = []
        this.pOpcion = 4
        this.pParametro.push(event.presupuestoID)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getPresupuestos(param).subscribe(
            data => {

                this.lPresupuestoSeleccionado = data.body.response.data
                this.formPresupuesto.controls.DescripcionPresupuesto.setValue(this.lPresupuestoSeleccionado[0].descripcionPresupuesto)
                this.formPresupuesto.controls.RazonSocial.setValue(this.lPresupuestoSeleccionado[0].razonSocial)
            })
    }

    guardar() {

        if (this.formPresupuesto.invalid) {
            return Object.values(this.formPresupuesto.controls).forEach(control => {
                if (control instanceof FormGroup) {
                    Object.values(control.controls).forEach(control => control.markAsTouched())
                } else {
                    control.markAsTouched()
                    Swal.fire('Atención', 'Es necesario seleccionar un Presupuesto.', 'warning')
                }
            })
        }

        this.sDatos.forEach(element => {
            if (element.PresupuestoID == this.PresupuestoID) {
                this.estado = 0
            }
        });

        if (this.estado == 0) {
            Swal.fire('Atención', 'No puede agregar dos Presupuestos iguales.', 'warning')
            this.estado = 1
        }

        else if (this.estado == 1) {
            this.sDatos.push({
                "PresupuestoID": this.PresupuestoID,
                "CodigoPresupuesto": this.CodigoPresupuesto,
                "DescripcionPresupuesto": this.formPresupuesto.value.DescripcionPresupuesto,
                "RazonSocial": this.formPresupuesto.value.RazonSocial
            })

            this.oDatos.next(this.sDatos)
            this.crearFormPresupuesto()
        }
    }

    capturarPresupuesto(event) {
        this.PresupuestoID = event.presupuestoID
        this.CodigoPresupuesto = event.codigoPresupuesto
    }

    salir() {
        this.dialogRef.close();
    }
}