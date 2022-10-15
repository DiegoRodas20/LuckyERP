import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { Parametros } from "src/app/modulos/TFI/repository/models/general/parametros";
import { Direccion, Mes } from "src/app/modulos/TFI/repository/models/objetivos-facturacion/objetivoFacturacionDto";
import { ObjetivosFacturacionService } from "src/app/modulos/TFI/repository/services/objetivos-facturacion.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";


@Component({
    selector: 'app-objetivos-dialog',
    templateUrl: './objetivos-dialog.component.html',
    styleUrls: ['./objetivos-dialog.component.css']
})

export class ObjetivosDialogComponent implements OnInit {

    //Datos necesarios
    url: string
    idUser: number
    pNom: string
    idEmp: string
    pPais: string
    pNomEmp: string
    nEmpresa: string
    isReadOnly: boolean

    date: Date = new Date()
    anioActual: number

    //===================
    pOpcion = 1     //Opcion
    pParametro = []    //Parametros de campos vacios
    //========================

    //Lista ddl Objetivos Dialog
    lDireccion: Direccion[] = []
    lMes: Mes[] = []

    //Forms
    formObjetivoMensual: FormGroup

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private formBuilder: FormBuilder,
        private servicios: ObjetivosFacturacionService,
        private dialogRef: MatDialogRef<ObjetivosDialogComponent>,

        @Inject('BASE_URL') baseUrl: string,
        @Inject(MAT_DIALOG_DATA) private dialogConfigData,
    ) { this.url = baseUrl }

    ngOnInit(): void {

        //Datos del Usuario
        let user = localStorage.getItem('currentUser')
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno
        this.idEmp = localStorage.getItem('Empresa')
        this.pPais = localStorage.getItem('Pais')

        this.isReadOnly = false
        this.anioActual = this.date.getFullYear()
        this.crearFormObjetivoMensual()
        this.listaDireccion()
        this.listaMeses()

        if (this.dialogConfigData.data != null) {
            this.isReadOnly = true
            this.formObjetivoMensual.controls.anio.setValue([null])
            this.listarObjetivoMensual()
        }
        else {
            this.formObjetivoMensual.controls.anio.setValue([this.dialogConfigData.anio])
        }

        this.spinner.hide()
    }

    crearFormObjetivoMensual() {

        this.formObjetivoMensual = this.formBuilder.group({
            anio                    : [null],
            direccion               : [null, [Validators.required]],
            cliente                 : [null, [Validators.required]],
            mes                     : [null, [Validators.required]],
            montoObjetivo           : [null, [Validators.required, Validators.minLength(1), Validators.min(1)]],
            montoRegularizacion     : [null, [Validators.minLength(1), Validators.min(1)]],
            motivo                  : [null],
            montoObjCovid           : [null, [Validators.minLength(1), Validators.min(1)]]
        })
    }

    listaDireccion() {

        this.pOpcion = 2
        this.pParametro = []
        this.pParametro.push(0)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getDireccion(param).subscribe(
            data => {
                this.lDireccion = data.body.response.data
            }
        )
    }

    listaMeses() {

        this.pOpcion = 3
        this.pParametro = []
        this.pParametro.push(0)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getMeses(param).subscribe(
            data => {
                this.lMes = data.body.response.data
            }
        )
    }

    registrarObjetivoMensual() {

        if (this.formObjetivoMensual.invalid) {
            return Object.values(this.formObjetivoMensual.controls).forEach(control => {
                if (control instanceof FormGroup) {
                    Object.values(control.controls).forEach(control => control.markAsTouched())
                } else {
                    control.markAsTouched()
                    Swal.fire('Atención', 'Complete los filtros', 'warning')
                }
            })
        }

        if (this.dialogConfigData.data != null) {
            this.pOpcion = 9
            this.pParametro = []

            let formObjetivoMensual = this.formObjetivoMensual.value

            this.pParametro.push(this.dialogConfigData.data)
            this.pParametro.push(formObjetivoMensual.cliente)
            this.pParametro.push(formObjetivoMensual.montoObjetivo)
            this.pParametro.push(formObjetivoMensual.montoRegularizacion)
            this.pParametro.push(formObjetivoMensual.motivo)
            this.pParametro.push(formObjetivoMensual.montoObjCovid)

            const params: Parametros = {
                pOpcion: this.pOpcion,
                pParametro: this.pParametro.join('|')
            };

            this.servicios.UpdateObjetivoMensual(params).subscribe(
                data => {

                    if (Number(data.body.response.data[0].valorRetorno) > 0) {
                        Swal.fire('Exito', 'Se actualizo con éxito.', 'success')
                        this.dialogRef.close()
                    }
                    else if (Number(data.body.response.data[0].valorRetorno) == 0) {
                        Swal.fire('Atención', 'El Objetivo mensual no se encuentra registrado.', 'warning')
                    }
                    else {
                        Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                    }
                })
        }
        else {
            this.pOpcion = 7
            this.pParametro = []

            let formObjetivoMensual = this.formObjetivoMensual.value

            this.pParametro.push(formObjetivoMensual.anio)
            this.pParametro.push(formObjetivoMensual.direccion)
            this.pParametro.push(formObjetivoMensual.cliente)
            this.pParametro.push(formObjetivoMensual.mes)
            this.pParametro.push(formObjetivoMensual.montoObjetivo)
            this.pParametro.push(formObjetivoMensual.montoRegularizacion)
            this.pParametro.push(formObjetivoMensual.motivo)
            this.pParametro.push(formObjetivoMensual.montoObjCovid)
            this.pParametro.push(this.idEmp)

            const params: Parametros = {
                pOpcion: this.pOpcion,
                pParametro: this.pParametro.join('|')
            };

            this.servicios.InsertObjetivoMensual(params).subscribe(
                data => {

                    if (Number(data.body.response.data[0].valorRetorno) > 0) {
                        Swal.fire('Exito', 'Se grabó con éxito.', 'success')
                        this.dialogRef.close(formObjetivoMensual.anio)
                    }
                    else if (Number(data.body.response.data[0].valorRetorno) == 0) {
                        Swal.fire('Atención', 'El Objetivo mensual ya se encuentra registrado.', 'warning')
                    }
                    else {
                        Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                    }
                })
        }
    }

    listarObjetivoMensual() {

        this.pOpcion = 8
        this.pParametro = []
        this.pParametro.push(this.dialogConfigData.data)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getObjetivoMensualxID(param).subscribe(
            data => {
                this.formObjetivoMensual.patchValue(data.body.response.data[0])
            }
        )
    }

    validarRegularizacion() {
        
        let formObjetivoMensual = this.formObjetivoMensual.value

        if (formObjetivoMensual.montoRegularizacion != null) {
            this.formObjetivoMensual.controls.motivo.setValidators([Validators.required])
            this.formObjetivoMensual.controls.motivo.updateValueAndValidity()
        }
        else {
            this.formObjetivoMensual.controls.motivo.clearValidators()
            this.formObjetivoMensual.controls.motivo.updateValueAndValidity()
        }
    }

    salir() {
        this.dialogRef.close(0)
    }

}