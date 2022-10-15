import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { Parametros } from "src/app/modulos/TFI/repository/models/general/parametros";
import { Ejecutivo } from "src/app/modulos/TFI/repository/models/objetivos-facturacion/objetivoFacturacionDto";
import { ObjetivosFacturacionService } from "src/app/modulos/TFI/repository/services/objetivos-facturacion.service";
import Swal from "sweetalert2";


@Component({
    selector: 'ejecutivos-dialog.component',
    templateUrl: './ejecutivos-dialog.component.html',
    styleUrls: ['./ejecutivos-dialog.component.css']
})

export class EjecutivosDialogComponent implements OnInit {

    //Datos necesarios
    url: string
    idUser: number
    pNom: string
    idEmp: string
    pPais: string
    pNomEmp: string
    nEmpresa: string

    //===================
    pOpcion = 1  //Opcion
    pParametro = []  //Parametros de campos vacios
    //========================

    //Lista ddl Ejecutivos
    lEjecutivos: Ejecutivo[] = []

    // Forms
    formEjecutivo: FormGroup

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private formBuilder: FormBuilder,
        private servicios: ObjetivosFacturacionService,
        private dialogRef: MatDialogRef<EjecutivosDialogComponent>,

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

        this.crearFormEjecutivo()
        this.listaEjecutivos()

        if (this.dialogConfigData.data3 != null) {
            this.listarObjetivoxEjecutivo()
        }

    }

    crearFormEjecutivo() {
        this.formEjecutivo = this.formBuilder.group({
            codigoEjecutivo         : [null, [Validators.required]],
            montoObjetivo           : [null, [Validators.required, Validators.minLength(1), Validators.min(1)]],
            montoRegularizacion     : [null, [Validators.minLength(1), Validators.min(1)]],
            motivo                  : [null],
            montoObjCovid           : [null, [Validators.minLength(1), Validators.min(1)]]
        })
    }

    listaEjecutivos() {

        this.pOpcion = 5
        this.pParametro = []
        this.pParametro.push(this.dialogConfigData.data2)
        this.pParametro.push(this.idEmp)

        const pParametro = this.pParametro.join('|')

        const param = `opcion=${this.pOpcion}&parametro=${pParametro}`

        this.servicios.getEjecutivos(param).subscribe(
            data => {
                this.lEjecutivos = data.body.response.data
            }
        )
    }

    registrarObjetivoxEjecutivo() {
        
        if (this.formEjecutivo.invalid) {
            return Object.values(this.formEjecutivo.controls).forEach(control => {
                if (control instanceof FormGroup) {
                    Object.values(control.controls).forEach(control => control.markAsTouched())
                } else {
                    control.markAsTouched()
                    Swal.fire('Atención', 'Complete los filtros', 'warning')
                }
            })
        }

        if (this.dialogConfigData.data3 != null) {
            this.pOpcion = 17
            this.pParametro = []

            let formEjecutivo = this.formEjecutivo.value

            this.pParametro.push(this.dialogConfigData.data3)
            this.pParametro.push(formEjecutivo.codigoEjecutivo)
            this.pParametro.push(formEjecutivo.montoObjetivo)
            this.pParametro.push(formEjecutivo.montoRegularizacion)
            this.pParametro.push(formEjecutivo.motivo)
            this.pParametro.push(formEjecutivo.montoObjCovid)
            this.pParametro.push(this.dialogConfigData.data)
            this.pParametro.push(this.dialogConfigData.data1)

            const params: Parametros = {
                pOpcion: this.pOpcion,
                pParametro: this.pParametro.join('|')
            }

            this.servicios.UpdateObjetivoEjecutivo(params).subscribe(
                data => {

                    if (Number(data.body.response.data[0].valorRetorno) > 0) {
                        Swal.fire('Exito', 'Se actualizo con éxito.', 'success')
                        this.dialogRef.close()
                    }
                    else if (Number(data.body.response.data[0].valorRetorno) == 0) {
                        Swal.fire('Atención', 'El Ejecutivo ya se encuentra registrado.', 'warning')
                    }
                    else {
                        Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                    }
                }
            )
        }
        else {

            this.pOpcion = 15
            this.pParametro = []

            let formEjecutivo = this.formEjecutivo.value

            this.pParametro.push(this.dialogConfigData.data)
            this.pParametro.push(this.dialogConfigData.data1)
            this.pParametro.push(formEjecutivo.codigoEjecutivo)
            this.pParametro.push(formEjecutivo.montoObjetivo)
            this.pParametro.push(formEjecutivo.montoRegularizacion)
            this.pParametro.push(formEjecutivo.motivo)
            this.pParametro.push(formEjecutivo.montoObjCovid)

            const params: Parametros = {
                pOpcion: this.pOpcion,
                pParametro: this.pParametro.join('|')
            }

            this.servicios.InsertObjetivoEjecutivo(params).subscribe(
                data => {

                    if (Number(data.body.response.data[0].valorRetorno) > 0) {
                        Swal.fire('Exito', 'Se grabó con éxito.', 'success')
                        this.dialogRef.close()
                    }
                    else if (Number(data.body.response.data[0].valorRetorno) == 0) {
                        Swal.fire('Atención', 'El Ejecutivo ya se encuentra registrado.', 'warning')
                    }
                    else {
                        Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                    }
                }
            )
        }

    }

    listarObjetivoxEjecutivo() {
        this.pOpcion = 16
        this.pParametro = []
        this.pParametro.push(this.dialogConfigData.data3)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getObjetivoEjecutivoxID(param).subscribe(
            data => {
                this.formEjecutivo.patchValue(data.body.response.data[0])
            }
        )
    }

    validarRegularizacion() {
        
        let formObjetivoMensual = this.formEjecutivo.value

        if (formObjetivoMensual.montoRegularizacion != null) {
            this.formEjecutivo.controls.motivo.setValidators([Validators.required])
            this.formEjecutivo.controls.motivo.updateValueAndValidity()
        }
        else {
            this.formEjecutivo.controls.motivo.clearValidators()
            this.formEjecutivo.controls.motivo.updateValueAndValidity()
        }
    }

    salir() {
        this.dialogRef.close()
    }
    
}