import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { TablasGeneralesService } from '../../services/tablas-generales.service';


@Component({
    selector: 'app-general-systelements-dialog',
    templateUrl: './general-systelements-dialog.component.html',
    styleUrls: ['./general-systelements-dialog.component.css']
})

export class GeneralSystElementsDialog implements OnInit {

    //Datos necesarios
    url: string
    idUser: number
    pNom: string
    idEmp: string
    pPais: string
    pNomEmp: string
    nEmpresa: string
    estado: boolean

    lSystElementsxID
    isReadOnly: boolean
    lEstado = [
        { nId: true, sDescripcion: '1' },
        { nId: false, sDescripcion: '0' },
    ]

    //===================
    pOpcion = 1     //Opcion
    pParametro = []    //Parametros de campos vacios
    //========================

    //Forms
    formSystElements: FormGroup

    constructor(
        private spinner: NgxSpinnerService,
        private formBuilder: FormBuilder,
        private servicio: TablasGeneralesService,
        private dialogRef: MatDialogRef<any>,

        @Inject('BASE_URL') baseUrl: string,
        @Inject(MAT_DIALOG_DATA) private dialogConfigData,
    ) {
        this.url = baseUrl
    }

    ngOnInit(): void {

        //Datos del Usuario
        let user = localStorage.getItem('currentUser')
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno
        this.idEmp = localStorage.getItem('Empresa')
        this.pPais = localStorage.getItem('Pais')

        this.isReadOnly = true
        this.estado = true

        // Funciones al iniciar la pantalla

        this.crearFormSystElements()

    }

    ngAfterViewInit() {
        setTimeout(() => {

            //Para que no haya error de ngAfterContentChecked
            if (this.dialogConfigData != null) {
                this.isReadOnly = false
                this.estado = false
                this.listarSystElementsxID()
            }
            else {
                this.formSystElements.controls.bStatusB.setValue(true)
            }
        });
    }

    crearFormSystElements() {

        this.formSystElements = this.formBuilder.group({
            cEleCod: [null, [Validators.maxLength(8)]],
            cEleNam: [null, [Validators.required, Validators.maxLength(170)]],
            cEleIni: [null, [Validators.maxLength(5)]],
            cEleDes: [null, [Validators.required, Validators.maxLength(250)]],
            bStatusB: [null]
        })
    }

    listarSystElementsxID() {
        this.spinner.show()

        this.pOpcion = 4
        this.pParametro = []
        this.pParametro.push(this.dialogConfigData)

        this.servicio.fnTablasGenerales(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {

                this.lSystElementsxID = data
                if (this.lSystElementsxID.length == 0) {
                    Swal.fire('Verificar', 'No se encontraron registros', 'warning')
                    this.spinner.hide()
                }
                else {
                    this.formSystElements.patchValue(data[0])
                    this.spinner.hide()
                }
            }
        )

    }

    registrarSystElements() {
        if (this.formSystElements.invalid) {
            return Object.values(this.formSystElements.controls).forEach(control => {
                if (control instanceof FormGroup) {
                    Object.values(control.controls).forEach(control => control.markAsTouched())
                } else {
                    control.markAsTouched()
                    Swal.fire('Atención', 'Verifique los datos ingresados', 'warning')
                }
            })
        }

        if (this.dialogConfigData != null) {
            this.pOpcion = 5
            this.pParametro = []

            let formSystElements = this.formSystElements.value

            this.pParametro.push(this.dialogConfigData)
            this.pParametro.push(formSystElements.cEleCod)
            this.pParametro.push(formSystElements.cEleNam)
            this.pParametro.push(formSystElements.cEleIni)
            this.pParametro.push(formSystElements.cEleDes)
            this.pParametro.push(formSystElements.bStatusB)

            this.servicio.fnTablasGenerales(this.pOpcion, this.pParametro, this.url).subscribe(
                data => {

                    if (data > 0) {
                        Swal.fire('Exito', 'Se actualizo con éxito.', 'success')
                        this.spinner.hide()
                        this.dialogRef.close()
                    }
                    else if (data == 0) {
                        Swal.fire('Atención', 'Ya se encuentra registrado.', 'warning')
                        this.spinner.hide()
                    }
                    else {
                        Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                    }
                }
            )
        }
        else {
            this.pOpcion = 3
            this.pParametro = []

            let formSystElements = this.formSystElements.value

            this.pParametro.push(formSystElements.cEleCod)
            this.pParametro.push(formSystElements.cEleNam)
            this.pParametro.push(formSystElements.cEleIni)
            this.pParametro.push(formSystElements.cEleDes)
            this.pParametro.push(this.idUser)
            this.pParametro.push(this.pPais)


            this.servicio.fnTablasGenerales(this.pOpcion, this.pParametro, this.url).subscribe(
                data => {

                    if (data > 0) {
                        Swal.fire('Exito', 'Se registro con éxito.', 'success')
                        this.spinner.hide()
                        this.dialogRef.close()
                    }
                    else if (data == 0) {
                        Swal.fire('Atención', 'Ya se encuentra registrado.', 'warning')
                        this.spinner.hide()
                    }
                    else {
                        Swal.fire('Error', 'Comuniquese con el area de sistema', 'error')
                    }
                }
            )
        }
    }

    salir() {
        this.dialogRef.close()
    }
}