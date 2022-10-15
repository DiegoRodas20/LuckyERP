import { ɵNullViewportScroller } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { TablasGeneralesService } from "../../services/tablas-generales.service";

@Component({
    selector: 'system-tipoelemento-dialog.component',
    templateUrl: './system-tipoelemento-dialog.component.html',
    styleUrls: ['./system-tipoelemento-dialog.component.css']
})

export class SystemTipoElementoDialog implements OnInit {

    //Datos necesarios
    url: string
    idUser: number
    pNom: string
    idEmp: string
    pPais: string
    pNomEmp: string
    nEmpresa: string
    estado: boolean

    lTipoElementoxID
    lPais: any[] = []
    isReadOnly: boolean

    lEstado = [
        { nId: true, sDescripcion: '1' },
        { nId: false, sDescripcion: '0' },
    ]

    lbDis = [
        { nId: '1', sDescripcion: '1' },
        { nId: '0', sDescripcion: '0' },
    ]

    //===================
    pOpcion = 1     //Opcion
    pParametro = []    //Parametros de campos vacios
    //========================

    //Forms
    formTipoElemento: FormGroup

    constructor(
        private spinner: NgxSpinnerService,
        private formBuilder: FormBuilder,
        private servicio: TablasGeneralesService,
        private dialogRef: MatDialogRef<any>,

        @Inject('BASE_URL') baseUrl: string,
        @Inject(MAT_DIALOG_DATA) public dialogConfigData,
    ) {
        this.url = baseUrl
    }


    ngOnInit(): void {
        this.crearFormTipoElemento()

        //Datos del Usuario
        let user = localStorage.getItem('currentUser')
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno
        this.idEmp = localStorage.getItem('Empresa')
        this.pPais = localStorage.getItem('Pais')

        this.isReadOnly = true
        this.estado = true

        // Funciones al iniciar la pantalla

        this.listarPaisesCombo()
    }

    ngAfterViewInit() {
        setTimeout(() => {

            //Para que no haya error de ngAfterContentChecked
            if (this.dialogConfigData != null) {
                this.isReadOnly = false
                this.estado = false
                this.listarTipoElementoxID()
            }
            else {
                this.formTipoElemento.controls.bEstadoB.setValue(true)
            }
        });
    }

    crearFormTipoElemento() {

        this.formTipoElemento = this.formBuilder.group({
            sCod: [null, [Validators.maxLength(10)]],
            sAbrev: [null, [Validators.maxLength(25)]],
            bEstadoB: [null],
            nIdPais: [null],
            nNotocar: [null],
            nTipo: [null],
            bDis: [null],
            nParam: [null],
            nParam2: [null],
            sDesc: [null, [Validators.maxLength(100)]],
            sParam: [null, [Validators.maxLength(200)]]
        })
    }

    listarPaisesCombo() {
        this.pOpcion = 12
        this.pParametro = []

        this.servicio.fnTipoElemento(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lPais = data
            }
        )
    }

    listarTipoElementoxID() {
        this.spinner.show()

        this.pOpcion = 4
        this.pParametro = []
        this.pParametro.push(this.dialogConfigData)

        this.servicio.fnTipoElemento(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lTipoElementoxID = data
                if (this.lTipoElementoxID.length == 0) {
                    Swal.fire('Verificar', 'No se encontraron registros', 'warning')
                    this.spinner.hide()
                }
                else {
                    this.formTipoElemento.patchValue(data[0])
                    this.spinner.hide()
                }
            }
        )
    }


    registrarTipoElemento() {
        if (this.formTipoElemento.invalid) {
            return Object.values(this.formTipoElemento.controls).forEach(control => {
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

            let formTipoElemento = this.formTipoElemento.value

            this.pParametro.push(this.dialogConfigData)
            this.pParametro.push(formTipoElemento.sCod)
            this.pParametro.push(formTipoElemento.sDesc)
            this.pParametro.push(formTipoElemento.sAbrev)
            this.pParametro.push(formTipoElemento.bEstadoB)
            this.pParametro.push(formTipoElemento.nIdPais)
            this.pParametro.push(formTipoElemento.nNotocar)
            this.pParametro.push(formTipoElemento.nTipo)
            this.pParametro.push(formTipoElemento.bDis)
            this.pParametro.push(formTipoElemento.nParam)
            this.pParametro.push(formTipoElemento.sParam)
            this.pParametro.push(formTipoElemento.nParam2)

            this.servicio.fnTipoElemento(this.pOpcion, this.pParametro, this.url).subscribe(
                data => {

                    if (data.result == 1) {
                        Swal.fire('Exito', 'Se actualizo con éxito.', 'success')
                        this.spinner.hide()
                        this.dialogRef.close()
                    }
                    else {
                        Swal.fire('Error', data.result, 'error')
                        this.spinner.hide()
                    }
                }
            )
        }
        else {
            this.pOpcion = 3
            this.pParametro = []

            let formTipoElemento = this.formTipoElemento.value

            this.pParametro.push(formTipoElemento.sCod)
            this.pParametro.push(formTipoElemento.sDesc)
            this.pParametro.push(formTipoElemento.sAbrev)
            this.pParametro.push(formTipoElemento.nIdPais)
            this.pParametro.push(formTipoElemento.nNotocar)
            this.pParametro.push(formTipoElemento.nTipo)
            this.pParametro.push(formTipoElemento.bDis)
            this.pParametro.push(formTipoElemento.nParam)
            this.pParametro.push(formTipoElemento.sParam)
            this.pParametro.push(formTipoElemento.nParam2)
            this.pParametro.push(this.idUser)
            this.pParametro.push(this.pPais)

            this.servicio.fnTipoElemento(this.pOpcion, this.pParametro, this.url).subscribe(
                data => {

                    if (data.result == 1) {
                        Swal.fire('Exito', 'Se registro con éxito.', 'success')
                        this.spinner.hide()
                        this.dialogRef.close()
                    }
                    else {
                        Swal.fire('Error', data.result, 'error')
                        this.spinner.hide()
                    }
                }
            )
        }
    }

    salir() {
        this.dialogRef.close()
    }
}