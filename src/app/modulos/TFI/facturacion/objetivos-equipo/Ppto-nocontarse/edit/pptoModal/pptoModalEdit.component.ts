import { Component, EventEmitter, Inject, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Parametros } from "src/app/modulos/TFI/repository/models/general/parametros";
import { Presupuesto } from "src/app/modulos/TFI/repository/models/ppto-nocontarse/pptoNoConsiderarDto";
import { PptonoContarseService } from "src/app/modulos/TFI/repository/services/ppto-nocontarse.service";

import Swal from "sweetalert2";


@Component({
    selector: 'app-pptoModalEdit',
    templateUrl: './pptoModalEdit.component.html',
    styleUrls: ['./pptoModalEdit.component.css']
})

export class PptoModalEditComponent implements OnInit {

    idEmp: string
    url: string
    sDatos: any[] = []
    sCodigoPresupuesto: string

    //===================
    pOpcion = 2;  //CRUD -> Listar
    pParametro = []; //Parametros de campos vacios
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
        private dialogRef: MatDialogRef<PptoModalEditComponent>,

        @Inject('BASE_URL') baseUrl: string,
        @Inject(MAT_DIALOG_DATA) private data: any
    ) { this.url = baseUrl }

    ngOnInit(): void {
        this.idEmp = localStorage.getItem('Empresa');

        this.crearFormPresupuesto()
        this.listaPresupuestos()
    }

    crearFormPresupuesto() {
        this.formPresupuesto = this.formBuilder.group({
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
        this.pParametro.push(event)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getPresupuestos(param).subscribe(
            data => {

                this.lPresupuestoSeleccionado = data.body.response.data
                this.formPresupuesto.controls.DescripcionPresupuesto.setValue(this.lPresupuestoSeleccionado[0].descripcionPresupuesto)
                this.formPresupuesto.controls.RazonSocial.setValue(this.lPresupuestoSeleccionado[0].razonSocial)
            })
    }

    registrarPresupuesto() {

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

        this.pOpcion = 7
        this.pParametro = []

        let formPresupuesto = this.formPresupuesto.value

        this.pParametro.push(this.data.PresupuestoEmpresaID)
        this.pParametro.push(formPresupuesto.CodigoPresupuesto)
        this.pParametro.push(1)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        }

        this.servicios.InsertPresupuestoxEmpresa(params).subscribe(
            data => {

                if (data.body.response.data[0].valorRetorno == 0) {
                    Swal.fire('Error', 'El presupuesto ya se encuentra ingresado.', 'error')
                }
                else if (data.body.response.data[0].valorRetorno == 1) {
                    Swal.fire('Exito', 'Se grabó con éxito.', 'success')
                    this.oDatos.next(this.data.PresupuestoEmpresaID)
                    this.crearFormPresupuesto()
                }
                else {
                    Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                }
            })
    }

    salir() {
        this.dialogRef.close()
    }

}