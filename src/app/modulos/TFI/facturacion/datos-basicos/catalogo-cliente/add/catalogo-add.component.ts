import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { NegocioActividad, TipoContribuyente, TipoDocumentoIdentidad, TipoEntidad, Ubigeo } from "src/app/modulos/TFI/repository/models/catalogo-cliente/catalogoClienteDto";
import { Parametros } from "src/app/modulos/TFI/repository/models/general/parametros";
import { CatalogoClienteService } from "src/app/modulos/TFI/repository/services/catalogo-cliente.service";
import Swal from "sweetalert2";

@Component({
    selector: "app-catalogo-add.component",
    templateUrl: "./catalogo-add.component.html",
    styleUrls: ["./catalogo-add.component.css"],
    animations: [asistenciapAnimations]
})

export class CatalogoAddComponent implements OnInit {

    tsLista = 'active'  // Inicia las opciones visibles
    fbLista = [         // Lista de las opciones que se mostrarán
        { icon: 'save', tool: 'Registrar Cliente' },
        { icon: 'exit_to_app', tool: 'Salir' }
    ]
    abLista = []

    ///===================
    pOpcion = 1 //Opcion para el procedure
    pParametro = [] //Parametros de campos vacios
    //========================

    //Declaracion de datos necesarios 
    url: string
    idUser: number
    pNom: string
    idEmp: string
    pPais: string
    pNomEmp: string
    nEmpresa: string

    codigoArea: number
    personaJuridica: boolean
    longitudMin: number = 0
    longitudMax: number = 0

    //Lista ddl Principal
    lTipoEntidad: TipoEntidad[] = []
    lTipoContribuyente: TipoContribuyente[] = []
    lTipoDocumento: TipoDocumentoIdentidad[] = []
    lTipoDocumentoEstatica: TipoDocumentoIdentidad[] = []
    lNegocioActividad: NegocioActividad[] = []

    //Lista ddl Direccion
    lDepartamento: Ubigeo[] = []
    lProvincia: Ubigeo[] = []
    lDistrito: Ubigeo[] = []

    //Forms 
    formRegistro: FormGroup

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private formBuilder: FormBuilder,
        private servicios: CatalogoClienteService,

        @Inject('BASE_URL') baseUrl: string
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

        this.areaUsuario()

        //funciones
        this.crearFormRegistro()
        this.listaComboBox()
        this.onToggleFab(1, -1)
    }

    // Formularios

    crearFormRegistro() {
        this.formRegistro = this.formBuilder.group({

            //Cabecera Cliente
            cliente                 : [null, [Validators.required]],
            ruc                     : [null],
            razonSocial             : [null, [Validators.required, Validators.minLength(4)]],
            nombreComercial         : [null, [Validators.required, Validators.minLength(4)]],
            contribuyente           : [null, [Validators.required]],
            tipoDoc                 : [null, [Validators.required]],
            telefono1               : [null, [Validators.required, Validators.minLength(1)]],
            telefono2               : [null],
            paginaWeb               : [null, [Validators.required]],
            contacto                : [null, [Validators.required, Validators.minLength(2)]],
            contactoCorreo          : [null, [Validators.required]],
            contactoTelefono        : [null, [Validators.required]],
            contactoCargo           : [null, [Validators.required, Validators.minLength(3)]],
            correoFacturas          : [null, [Validators.required, Validators.minLength(5)]],
            plazoPago               : [null, [Validators.required, Validators.minLength(1), Validators.min(1)]],
            negocio                 : [null, [Validators.required]],
            estado                  : ['Activo'],
            usuarioCreado           : [null],
            usuarioModificado       : [null],

            //Direccion Principal
            departamento            : [null, Validators.required],
            provincia               : [null, Validators.required],
            distrito                : [null, Validators.required],
            direccion               : [null, [Validators.required, Validators.minLength(3)]],
            referencia              : [null]
        })
    }

    // Combo Box Cliente
    listaComboBox() {
        this.listaTipoEntidad()
        this.listaTipoContribuyente()
        this.listaTipoDocumento()
        this.listaNegocioActividad()
        this.listaDepartamento()
    }

    listaTipoEntidad() {

        this.pOpcion = 2
        this.pParametro = []
        this.pParametro.push(0)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getTiposEntidad(param).subscribe(
            data => {
                this.lTipoEntidad = data.body.response.data
            }
        )
    }

    listaTipoContribuyente() {

        this.pOpcion = 3
        this.pParametro = []
        this.pParametro.push(0)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getTiposContribuyente(param).subscribe(
            data => {
                this.lTipoContribuyente = data.body.response.data
            }
        )
    }

    listaTipoDocumento() {

        this.pOpcion = 4
        this.pParametro = []
        this.pParametro.push(this.pPais)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getTiposDocumentoIdentidad(param).subscribe(
            data => {
                this.lTipoDocumento = data.body.response.data
                this.lTipoDocumentoEstatica = data.body.response.data
            }
        )
    }

    listaNegocioActividad() {

        this.pOpcion = 5
        this.pParametro = []
        this.pParametro.push(0)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getNegociosActividad(param).subscribe(
            data => {
                this.lNegocioActividad = data.body.response.data
            }
        )
    }

    listaDepartamento() {

        this.pOpcion = 6
        this.pParametro = []
        this.pParametro.push(this.pPais)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getUbigeo(param).subscribe(
            data => {
                this.lDepartamento = data.body.response.data
            }
        )
    }

    listaProvincia(event) {

        this.lProvincia = []
        this.lDistrito = []

        this.formRegistro.controls.provincia.setValue(null)
        this.formRegistro.controls.distrito.setValue(null)

        this.pOpcion = 7
        this.pParametro = []
        this.pParametro.push(event)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getUbigeo(param).subscribe(
            data => {
                this.lProvincia = data.body.response.data
            }
        )
    }

    listaDistrito(event) {

        this.lDistrito = []
        this.formRegistro.controls.distrito.setValue(null)

        this.pOpcion = 8
        this.pParametro = []
        this.pParametro.push(event)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getUbigeo(param).subscribe(
            data => {
                this.lDistrito = data.body.response.data
            }
        )
    }

    // Area Usuario

    areaUsuario() {

        this.pOpcion = 9
        this.pParametro = []
        this.pParametro.push(this.idUser)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getAreaTrabajo(param).subscribe(
            data => {
                this.codigoArea = data.body.response.data[0].valorRetorno
            }
        )
    }

    //RegistrarCliente

    registrarCliente() {
        if (this.formRegistro.invalid) {
            return Object.values(this.formRegistro.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    }
                    else {
                        control.markAsTouched();
                        Swal.fire('Atención', 'Existen datos pendientes por completar', 'warning')
                    }
                }
            );
        }

        this.pOpcion = 10
        this.pParametro = []

        let formCliente = this.formRegistro.value;

        //Cliente Cabecera
        this.pParametro.push(formCliente.cliente)
        this.pParametro.push(formCliente.ruc)
        this.pParametro.push(formCliente.razonSocial)
        this.pParametro.push(formCliente.nombreComercial)
        this.pParametro.push(formCliente.contribuyente)
        this.pParametro.push(formCliente.telefono1)
        this.pParametro.push(formCliente.telefono2)
        this.pParametro.push(formCliente.paginaWeb)
        this.pParametro.push(formCliente.contacto)
        this.pParametro.push(formCliente.contactoCorreo)
        this.pParametro.push(formCliente.contactoTelefono)
        this.pParametro.push(formCliente.contactoCargo)
        this.pParametro.push(formCliente.correoFacturas)
        this.pParametro.push(formCliente.plazoPago)
        this.pParametro.push(formCliente.negocio)
        this.pParametro.push(1)
        this.pParametro.push(this.idUser)
        this.pParametro.push(this.pPais)

        //Direccion Principal
        this.pParametro.push(formCliente.distrito)
        this.pParametro.push(formCliente.direccion)
        this.pParametro.push(formCliente.referencia)
        this.pParametro.push(this.codigoArea)
        this.pParametro.push(formCliente.tipoDoc)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        };

        console.log(params)

        Swal.fire({
            title: '¿Desea guardar el Cliente?',
            text: "Se guardara el registro",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar'
        }).then((result) => {

            if (result.isConfirmed) {
                this.spinner.show();

                this.servicios.InsertCliente(params).subscribe(
                    data => {
                        console.log(data)
                        
                        if (Number(data.body.response.data[0].valorRetorno) === 0) {
                            Swal.fire({
                                icon: 'warning',
                                title: '¡Atención!',
                                text: 'Cliente/Proveedor ya esta registrado, no puede registrarlo nuevamente',
                            })
                        }
                        else if (Number(data.body.response.data[0].valorRetorno) > 0) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Exito',
                                text: 'Se grabó con éxito.',
                            }).then(
                                r => {
                                    this.router.navigate(['/tfi/facturacion/datosbasicos/catalagocliente'])
                                }
                            )
                        }
                        else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Comuniquese con el area de sistema',
                            })
                        }
                    },
                    err => {
                        this.spinner.hide();
                    },
                    () => {
                        this.spinner.hide();
                    }
                )
            }
        })
    }

    validarRuc() {

        this.pOpcion = 23
        this.pParametro = []
        this.pParametro.push(0)
        this.pParametro.push(this.formRegistro.controls.ruc.value)

        const pParametro = this.pParametro.join('|')

        const param = `opcion=${this.pOpcion}&parametro=${pParametro}`

        this.servicios.ValidarRuc(param).subscribe(
            data => {
                if (data.body.response.data[0].valorRetorno == 0)
                    Swal.fire('Atención', 'RUC registrado, no puede registrarlo nuevamente', 'warning')
            }
        )
    }

    validarRazonSocial() {

        this.pOpcion = 24
        this.pParametro = []
        this.pParametro.push(0)
        this.pParametro.push(this.formRegistro.controls.razonSocial.value)

        const pParametro = this.pParametro.join('|')

        const param = `opcion=${this.pOpcion}&parametro=${pParametro}`

        this.servicios.ValidarRazonSocial(param).subscribe(
            data => {
                if (data.body.response.data[0].valorRetorno == 0)
                    Swal.fire('Atención', 'Razón Social registrada, no puede registrarla nuevamente', 'warning')
            }
        )
    }

    cambioTipoPersona(codigoContribuyente) {
        this.personaJuridica = (codigoContribuyente === 2029) ? true : false

        if (this.personaJuridica) {
            this.lTipoDocumento = this.lTipoDocumento.filter(item => item.personaJuridica === 1)
        }
        else {
            this.lTipoDocumento = this.lTipoDocumentoEstatica
        }

        this.formRegistro.controls.tipoDoc.setValue(null)
        this.formRegistro.controls.ruc.setValue(null)
    }

    cambioTipoDocumento(event) {
        const longitud = this.lTipoDocumento.filter(item => item.codigoDocumento === event)[0]
        
        this.longitudMin = longitud.longitud1
        this.longitudMax = longitud.longitud2
        this.formRegistro.controls.ruc.setValidators([Validators.minLength(this.longitudMin), Validators.maxLength(this.longitudMax), Validators.required, Validators.pattern(/^[0-9]\d*$/)])
    }


    //Botones Flotantes

    onToggleFab(fab: number, stat: number) {
        stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
        this.tsLista = (stat === 0) ? 'inactive' : 'active';
        this.abLista = (stat === 0) ? [] : this.fbLista;
    }

    clickFab(index: number) {
        switch (index) {
            case 0:
                this.registrarCliente()
                break
            case 1:
                this.cerrarVentana()
                break
            default:
                break
        }
    }

    cerrarVentana() {
        this.router.navigate(['/tfi/facturacion/datosbasicos/catalagocliente'])
    }

}