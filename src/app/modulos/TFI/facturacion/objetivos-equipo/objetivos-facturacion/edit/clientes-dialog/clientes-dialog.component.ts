import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { Parametros } from "src/app/modulos/TFI/repository/models/general/parametros";
import { Cliente } from "src/app/modulos/TFI/repository/models/objetivos-facturacion/objetivoFacturacionDto";
import { ObjetivosFacturacionService } from "src/app/modulos/TFI/repository/services/objetivos-facturacion.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";


@Component({
    selector: 'clientes-dialog.component',
    templateUrl: './clientes-dialog.component.html',
    styleUrls: ['./clientes-dialog.component.css']
})

export class ClientesDialogComponent implements OnInit {

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

    //Lista ddl Clientes
    lClientes: Cliente[] = []

    // Forms
    formCliente: FormGroup

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private formBuilder: FormBuilder,
        private servicios: ObjetivosFacturacionService,
        private dialogRef: MatDialogRef<ClientesDialogComponent>,

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

        this.crearFormCliente()
        this.listaCliente()
    }

    crearFormCliente() {
        this.formCliente = this.formBuilder.group({
            cliente: [null, [Validators.required]]
        })
    }

    listaCliente() {

        this.pOpcion = 4
        this.pParametro = []
        this.pParametro.push(0)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getClientes( param ).subscribe(
            data => {
                this.lClientes = data.body.response.data
            }
        )
    }

    registrarClientexGrupo() {

        if (this.formCliente.invalid) {
            return Object.values(this.formCliente.controls).forEach(control => {
                if (control instanceof FormGroup) {
                    Object.values(control.controls).forEach(control => control.markAsTouched())
                } else {
                    control.markAsTouched()
                    Swal.fire('Atención', 'Complete los filtros', 'warning')
                }
            })
        }

        this.pOpcion = 12
        this.pParametro = []

        let formCliente = this.formCliente.value

        this.pParametro.push(this.dialogConfigData)
        this.pParametro.push(formCliente.cliente)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        }

        this.servicios.InsertClienteGrupo( params ).subscribe(
            data => {
                if (Number(data.body.response.data[0].valorRetorno) > 0) {
                    Swal.fire('Exito', 'Se grabó con éxito.', 'success')
                    this.dialogRef.close()
                }
                else if (Number(data.body.response.data[0].valorRetorno) == 0) {
                    Swal.fire('Atención', 'El Cliente ya se encuentra registrado.', 'warning')
                }
                else {
                    Swal.fire('Error', 'Comuniquese con el area de sistema.', 'error')
                }
            }
        )
    }

    salir() {
        this.dialogRef.close()
    }



}