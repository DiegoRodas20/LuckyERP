import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { DireccionCliente } from "../models/direccionCliente.model";
import { ListaDepartamento } from "../models/listaDepartamento.model";
import { ListaDistrito } from "../models/listaDistrito.model";
import { ListaNegocioActividad } from "../models/listaNegocioActividad.model";
import { ListaProvincia } from "../models/listaProvincia.model";
import { ListaTipoContribuyente } from "../models/listaTipoContribuyente.model";
import { ListaTipoEntidad } from "../models/listaTipoEntidad.model";
import { CatalogoClienteService } from "../services/catalogoCliente.service";
import { asistenciapAnimations } from '../../../../Asistencia/asistenciap/asistenciap.animations';

@Component({
    selector: "app-catalogo-add.component",
    templateUrl: "./catalogo-add.component.html",
    styleUrls: ["./catalogo-add.component.css"],
    animations: [asistenciapAnimations]
})

export class CatalogoAddComponent implements OnInit {

    tsLista = 'active';  // Inicia la lista oculta
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'save', tool: 'Registrar Cliente' },
        { icon: 'exit_to_app', tool: 'Salir' }
    ];
    abLista = [];

    ///===================
    pOpcion = 2;  //CRUD -> Listar
    pParametro = []; //Parametros de campos vacios
    //========================

    //Declaracion de datos necesarios 
    url: string
    idUser: number
    pNom: string
    idEmp: string
    pPais: string
    pNomEmp: string
    nEmpresa: string
    nIdArea: number
    personaJuridica: boolean
    nLongitudMin: number = 0
    nLongitudMax: number = 0

    //Lista ddl Principal
    lTipoEntidad: ListaTipoEntidad[] = []
    lTipoContribuyente: ListaTipoContribuyente[] = []
    lTipoDocumento: any[] = []
    lTipoDocumentoEstatica: any[] = []
    lNegocioActividad: ListaNegocioActividad[] = []

    //Lista ddl Direccion
    lDepartamento: ListaDepartamento[] = []
    lProvincia: ListaProvincia[] = []
    lDistrito: ListaDistrito[] = []

    //Forms 
    formRegistro: FormGroup

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private formBuilder: FormBuilder,
        private vCatalogoClienteService: CatalogoClienteService,

        @Inject('BASE_URL') baseUrl: string
    ) {
        this.url = baseUrl
    }

    ngOnInit(): void {

        //Datos del Usuario
        let user = localStorage.getItem('currentUser');
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
        this.idEmp = localStorage.getItem('Empresa');
        this.pPais = localStorage.getItem('Pais');

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
            cliente: [null, [Validators.required]],
            ruc: [null],
            razonSocial: [null, [Validators.required, Validators.minLength(4)]],
            nombreComercial: [null, [Validators.required, Validators.minLength(4)]],
            contribuyente: [null, [Validators.required]],
            tipoDoc: [null, [Validators.required]],
            telefono1: [null, [Validators.required, Validators.minLength(1)]],
            telefono2: [null],
            paginaWeb: [null, [Validators.required]],
            contacto: [null, [Validators.required, Validators.minLength(2)]],
            contactoCorreo: [null, [Validators.required]],
            contactoTelefono: [null, [Validators.required]],
            contactoCargo: [null, [Validators.required, Validators.minLength(3)]],
            feePersonal: [null, [Validators.required, Validators.min(1)]],
            feeOperacion: [null, [Validators.required, Validators.min(1)]],
            negocio: [null, [Validators.required]],
            estado: ['Activo'],
            usuarioCreado: [null],
            usuarioModificado: [null],

            //Direccion Principal
            departamento: [null, Validators.required],
            provincia: [null, Validators.required],
            distrito: [null, Validators.required],
            direccion: [null, [Validators.required, Validators.minLength(3)]],
            referencia: [null]
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
        this.pParametro = [];
        this.pOpcion = 2
        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lTipoEntidad = data
            })
    }

    listaTipoContribuyente() {
        this.pParametro = [];
        this.pOpcion = 3
        this.pParametro.push(this.pPais)
        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => { this.lTipoContribuyente = data })
    }

    listaTipoDocumento() {
        this.pOpcion = 24
        this.pParametro = []

        this.pParametro.push(this.pPais)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lTipoDocumento = data
                this.lTipoDocumentoEstatica = data
            })
    }

    listaNegocioActividad() {
        this.pParametro = [];
        this.pOpcion = 4

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lNegocioActividad = data
            })
    }

    listaDepartamento() {
        this.pParametro = [];
        this.pOpcion = 5
        this.pParametro.push(this.pPais);

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lDepartamento = data
            })
    }

    listaProvincia(event) {
        this.lProvincia = []
        this.lDistrito = []

        this.formRegistro.controls.provincia.setValue(null)
        this.formRegistro.controls.distrito.setValue(null)

        this.pParametro = [];
        this.pOpcion = 6
        this.pParametro.push(event)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lProvincia = data
            })
    }

    listaDistrito(event) {

        this.lDistrito = []
        this.formRegistro.controls.distrito.setValue(null)

        this.pParametro = [];
        this.pOpcion = 7
        this.pParametro.push(event)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lDistrito = data
            })
    }

    //Area Usuario
    areaUsuario() {

        this.pOpcion = 8
        this.pParametro = []
        this.pParametro.push(this.idUser)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.nIdArea = data
            })
    }

    // Tabla Cliente

    registrarCliente() {
        if (this.formRegistro.invalid) {
            return Object.values(this.formRegistro.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    }
                    else {
                        control.markAsTouched();
                        Swal.fire('¡Atención!', 'Existen datos pendientes por completar', 'warning')
                    }
                }
            );
        }

        this.pOpcion = 9
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
        this.pParametro.push(formCliente.feePersonal)
        this.pParametro.push(formCliente.feeOperacion)
        this.pParametro.push(formCliente.negocio)
        this.pParametro.push(1)
        this.pParametro.push(this.idUser)
        this.pParametro.push(this.pPais)
        //Direccion Principal
        this.pParametro.push(formCliente.distrito)
        this.pParametro.push(formCliente.direccion)
        this.pParametro.push(formCliente.referencia)
        this.pParametro.push(this.nIdArea)
        this.pParametro.push(formCliente.tipoDoc)


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

                this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
                    data => {
                        if (Number(data) === 0) {
                            Swal.fire({
                                icon: 'warning',
                                title: '¡Atención!',
                                text: 'Cliente/Proveedor ya esta registrado, no puede registrarlo nuevamente',
                            })
                        }
                        else if (Number(data) > 0) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Exito',
                                text: 'Se realizo exitosamente',
                            }).then(
                                r => {
                                    this.router.navigate(['/comercial/matenimiento/catalago-list'])
                                }
                            )
                        }
                        else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: 'comuniquese con el area de sistema',
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

        this.pOpcion = 22
        this.pParametro = []

        this.pParametro.push(0)
        this.pParametro.push(this.formRegistro.controls.ruc.value)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                if (data == 0)
                    Swal.fire('Atención', 'RUC registrado, no puede registrarlo nuevamente', 'warning')
            })
    }

    validarRazonSocial() {
        this.pOpcion = 23
        this.pParametro = []

        this.pParametro.push(0)
        this.pParametro.push(this.formRegistro.controls.razonSocial.value)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                if (data == 0)
                    Swal.fire('Atención', 'Razón Social registrada, no puede registrarla nuevamente', 'warning')
            })
    }

    cambioTipoPersona(idTipoPersona) {
        this.personaJuridica = (idTipoPersona === 2029) ? true : false

        if (this.personaJuridica) {
            this.lTipoDocumento = this.lTipoDocumento.filter(item => item.nPerJuridica === 1)
        }
        else {
            this.lTipoDocumento = this.lTipoDocumentoEstatica
        }

        this.formRegistro.controls.tipoDoc.setValue(null)
    }

    cambioTipoDocumento(event) {
        const longitud = this.lTipoDocumento.filter(item => item.nId === event)[0]

        this.nLongitudMin = longitud.nLongitud1
        this.nLongitudMax = longitud.nLongitud2
        this.formRegistro.controls.ruc.setValidators([Validators.minLength(this.nLongitudMin), Validators.maxLength(this.nLongitudMax), Validators.required, Validators.pattern(/^[0-9]\d*$/)])
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
        this.router.navigate(['/comercial/matenimiento/catalago-list'])
    }
}