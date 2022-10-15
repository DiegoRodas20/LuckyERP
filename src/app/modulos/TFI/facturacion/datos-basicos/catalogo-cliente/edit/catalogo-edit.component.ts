import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { DireccionCliente, Marca, MarcaCliente, NegocioActividad, TipoContribuyente, TipoDocumentoIdentidad, TipoEntidad, Ubigeo } from "src/app/modulos/TFI/repository/models/catalogo-cliente/catalogoClienteDto";
import { Parametros } from "src/app/modulos/TFI/repository/models/general/parametros";
import { CatalogoClienteService } from "src/app/modulos/TFI/repository/services/catalogo-cliente.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
    selector: "app-catalogo-edit.component",
    templateUrl: "./catalogo-edit.component.html",
    styleUrls: ["./catalogo-edit.component.css"],
    animations: [asistenciapAnimations]
})

export class CatalogoEditComponent implements OnInit {

    tsLista = 'active';  // Inicia la lista oculta
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'save', tool: 'Actualizar Cliente' },
        { icon: 'update', tool: 'Actualizar Estado' },
        { icon: 'exit_to_app', tool: 'Salir' },
    ];
    abLista = [];

    ///===================
    pOpcion = 2     //CRUD -> Listar
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
    validar: boolean = false

    estado: string
    estadoDireccion: string
    estadoMarca: string

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

    //Lista ddl Marca
    lMarca: Marca[] = []

    //Forms 
    formEditar: FormGroup
    formDireccion: FormGroup
    formCatalogoMarca: FormGroup

    //Tabla Direccion
    dataSourceDireccion: MatTableDataSource<DireccionCliente>;
    displayedColumnsDireccion = ['opciones', 'direccion', 'departamento', 'provincia', 'distrito', 'principal', 'estado']
    lClienteDireccion: DireccionCliente[] = []

    //Tabla Catalogo Marcas
    dataSourceMarcas: MatTableDataSource<MarcaCliente>
    displayedColumnsMarcas = ['categoria', 'linea', 'marca', 'estado', 'opciones']
    lCatalogoMarca: MarcaCliente[] = []

    //Filtro de busqueda para Catalogo Marcas
    tFiltro = new FormControl()
    searchKey: string

    nIdCliente: number
    detalleSeleccionado: number
    lClientexID
    personaJuridica: boolean
    longitudMin: number = 0
    longitudMax: number = 0


    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator; paginatorMarca: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort; sortMarca: MatSort;

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private servicios: CatalogoClienteService,

        @Inject('BASE_URL') baseUrl: string
    ) {
        this.url = baseUrl
    }

    ngOnInit(): void {

        this.crearFormEditar()
        this.crearFormDireccion()
        this.crearFormCatalogoMarca()

        //Datos del Usuario
        let user = localStorage.getItem('currentUser')
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno
        this.idEmp = localStorage.getItem('Empresa')
        this.pPais = localStorage.getItem('Pais')

        this.route.params.subscribe(params => {
            this.nIdCliente = +params.id
            this.consultarClientexID(this.nIdCliente)
        });

        //funciones       
        this.listarDirecciones(this.nIdCliente)
        this.listarMarcas(this.nIdCliente)
        this.listaComboBox()
        this.onToggleFab(1, -1)
    }

    // Formularios            

    crearFormEditar() {
        this.formEditar = this.formBuilder.group({

            codigoEntidad: [null, [Validators.required]],
            ruc: [null],
            razonSocial: [null, [Validators.required, Validators.minLength(4)]],
            nombreComercial: [null, [Validators.required, Validators.minLength(4)]],
            codigoContribuyente: [null, [Validators.required]],
            codigoDocumento: [null, [Validators.required]],
            telefono1: [null, [Validators.required, Validators.minLength(1)]],
            telefono2: [null],
            paginaWeb: [null, [Validators.required]],
            contacto: [null, [Validators.required, Validators.minLength(2)]],
            contactoCorreo: [null, [Validators.required]],
            contactoTelefono: [null, [Validators.required]],
            contactoCargo: [null, [Validators.required, Validators.minLength(3)]],
            correoFactura: [null, [Validators.required, Validators.minLength(5)]],
            plazoPago: [null, [Validators.required, Validators.minLength(1), Validators.min(1)]],
            giroNegocio: [null, [Validators.required]],
            estado: [null],
            creado: [null],
            modificado: [null],
        })
    }

    crearFormDireccion() {
        this.formDireccion = this.formBuilder.group({

            codigoDireccion: [0],
            departamento: [null, Validators.required],
            provincia: [null, Validators.required,],
            distrito: [null, Validators.required],
            direccion: ['', [Validators.required, Validators.minLength(3)]],
            referencia: [null],
            principal: [null],
            estado: ['']
        })
    }

    crearFormCatalogoMarca() {
        this.formCatalogoMarca = this.formBuilder.group({
            marca: [null, [Validators.required]]
        })
    }

    // Combo Box Cliente

    listaComboBox() {
        this.listaTipoEntidad()
        this.listaTipoContribuyente()
        this.listaTipoDocumento()
        this.listaNegocioActividad()
        this.listaDepartamento()
        this.listaMarca()
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
                console.log(data.body.response.data)
                this.lTipoDocumento = data.body.response.data
                console.log(this.lTipoDocumento)
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

        this.formDireccion.controls.provincia.setValue(null)
        this.formDireccion.controls.distrito.setValue(null)

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
        this.formDireccion.controls.distrito.setValue(null)

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

    listaMarca() {

        this.pOpcion = 19
        this.pParametro = []

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getMarcas(param).subscribe(
            data => {
                this.lMarca = data.body.response.data
            }
        )
    }

    //#region Cliente Cabecera

    consultarClientexID(idCliente: number) {

        this.pOpcion = 11
        this.pParametro = [];
        this.pParametro.push(idCliente);

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getClientexID(param).subscribe(
            data => {
                this.formEditar.patchValue(data.body.response.data[0]);
                this.estado = (data.body.response.data[0].estado);
            })
    }

    actualizarCliente() {

        if (this.formEditar.invalid) {
            return Object.values(this.formEditar.controls).forEach(
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

        this.pOpcion = 12
        this.pParametro = []

        let formEditar = this.formEditar.value;

        //Cliente Cabecera
        this.pParametro.push(this.nIdCliente)
        this.pParametro.push(formEditar.codigoEntidad)
        this.pParametro.push(formEditar.codigoContribuyente)
        this.pParametro.push(formEditar.codigoDocumento)
        this.pParametro.push(formEditar.ruc)
        this.pParametro.push(formEditar.razonSocial)
        this.pParametro.push(formEditar.nombreComercial)
        this.pParametro.push(formEditar.telefono1)
        this.pParametro.push(formEditar.telefono2)
        this.pParametro.push(formEditar.paginaWeb)
        this.pParametro.push(formEditar.contacto)
        this.pParametro.push(formEditar.contactoCorreo)
        this.pParametro.push(formEditar.contactoTelefono)
        this.pParametro.push(formEditar.contactoCargo)
        this.pParametro.push(formEditar.correoFactura)
        this.pParametro.push(formEditar.plazoPago)
        this.pParametro.push(formEditar.giroNegocio)
        this.pParametro.push(1)
        this.pParametro.push(this.idUser)
        this.pParametro.push(this.pPais)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        };

        Swal.fire({
            title: '¿Desea Actualizar la información del Cliente?',
            text: "Se guardaran los datos",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar'
        }).then((result) => {

            if (result.isConfirmed) {

                this.spinner.show();
                this.servicios.UpdateCliente(params).subscribe(
                    data => {
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

    actualizarEstado() {

        this.pOpcion = 13
        this.pParametro = []
        this.pParametro.push(this.nIdCliente)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        };

        this.servicios.UpdateEstadoCliente(params).subscribe(
            data => {
                if (data.body.response.data[0].valorRetorno > 0)

                    Swal.fire('Exito', 'Estado actualizado', 'success')
                this.consultarClientexID(this.nIdCliente)
            })
    }

    validarRuc() {

        this.pOpcion = 23
        this.pParametro = []
        this.pParametro.push(0)
        this.pParametro.push(this.formEditar.controls.ruc.value)

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
        this.pParametro.push(this.formEditar.controls.razonSocial.value)

        const pParametro = this.pParametro.join('|')

        const param = `opcion=${this.pOpcion}&parametro=${pParametro}`

        this.servicios.ValidarRazonSocial(param).subscribe(
            data => {
                if (data.body.response.data[0].valorRetorno == 0)
                    Swal.fire('Atención', 'Razón Social registrada, no puede registrarla nuevamente', 'warning')
            }
        )
    }

    cambioTipoPersona(idTipoPersona) {
        this.personaJuridica = (idTipoPersona === 2029) ? true : false

        if (this.personaJuridica) {
            this.lTipoDocumento = this.lTipoDocumento.filter(item => item.personaJuridica === 1)
        }
        else {
            this.lTipoDocumento = this.lTipoDocumentoEstatica
        }

        this.formEditar.controls.codigoDocumento.setValue(null)
    }

    cambioTipoDocumento(event) {
        const longitud = this.lTipoDocumento.filter(item => item.codigoDocumento === event)[0]

        this.longitudMin = longitud.longitud1
        this.longitudMax = longitud.longitud2
        this.formEditar.controls.ruc.setValidators([Validators.minLength(this.longitudMin), Validators.maxLength(this.longitudMax), Validators.required, Validators.pattern(/^[0-9]\d*$/)])
    }

    //#endregion

    //#region Direcciones

    listarDirecciones(idCliente: number) {

        this.pOpcion = 14
        this.pParametro = [];
        this.pParametro.push(idCliente);

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getDireccionesCliente(param).subscribe(
            data => {
                this.lClienteDireccion = data.body.response.data
                this.anadirDatosTabla(this.lClienteDireccion)
                this.estadoDireccion = (this.lClienteDireccion[0].estado);
            })
    }

    anadirDatosTabla(lista: DireccionCliente[]) {
        this.dataSourceDireccion = new MatTableDataSource(lista);
        this.dataSourceDireccion.paginator = this.paginator;
        this.dataSourceDireccion.sort = this.sort;
    }

    guardarDireccion() {
        if (this.formDireccion.invalid) {
            return Object.values(this.formDireccion.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    } else {
                        control.markAsTouched();
                    }
                }
            );
        }

        this.pParametro = []

        let formDireccion = this.formDireccion.value

        if (formDireccion.codigoDireccion == 0) this.pOpcion = 15
        else this.pOpcion = 17

        this.pParametro.push(this.nIdCliente)
        this.pParametro.push(formDireccion.codigoDireccion)
        this.pParametro.push(formDireccion.distrito)
        this.pParametro.push(formDireccion.direccion)
        this.pParametro.push(formDireccion.referencia)
        this.pParametro.push(this.formDireccion.get('principal').value === true ? 1 : 0)
        this.pParametro.push(formDireccion.estado.value === true ? 1 : 0)
        this.pParametro.push(this.idUser)
        this.pParametro.push(this.pPais)


        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        };

        this.servicios.InsertDireccionCliente(params).subscribe(
            data => {
                if (Number(data.body.response.data[0].valorRetorno) > 0) {
                    Swal.fire('Exito', 'Se realizo correctamente.', 'success').then(
                        r => {
                            this.listarDirecciones(this.nIdCliente)
                            this.crearFormDireccion()
                        }
                    )
                }
                else {
                    Swal.fire('Error', 'Comuniquese con el area de sistema', 'error').then(
                        r => {
                            this.listarDirecciones(this.nIdCliente)
                            this.crearFormDireccion()
                        }
                    )
                }
            }
        )
    }

    editarDireccion(row) {

        this.pOpcion = 16
        this.pParametro = [];
        this.pParametro.push(row.codigoDireccion);

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getDireccionxID(param).subscribe(
            data => {
                console.log(data)
                this.formDireccion.patchValue(data.body.response.data[0]);
                this.formDireccion.controls.principal.setValue(data.body.response.data[0].principal)
            })
    }

    actualizarEstadoDireccion(nIdDireccion: number) {

        this.pOpcion = 18
        this.pParametro = [];
        this.pParametro.push(nIdDireccion)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        };

        this.servicios.UpdateEstadoDireccionCliente(params).subscribe(
            data => {

                if (data.body.response.data[0].valorRetorno > 0)

                    Swal.fire('Exito', 'Estado de dirección actualizado', 'success')
                this.listarDirecciones(this.nIdCliente)
            })


    }

    //#endregion

    //#region Catalogo Marca

    listarMarcas(idCliente: number) {

        this.pOpcion = 20
        this.pParametro = []
        this.pParametro.push(idCliente)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getMarcasCliente(param).subscribe(
            data => {
                this.lCatalogoMarca = data.body.response.data
                this.anadirDatosTablaMarca(this.lCatalogoMarca)

                if (this.lCatalogoMarca.length == 0) {
                    Swal.fire('¡Verificar!', 'No se encontraron registros de marcas', 'warning')
                }
            }
        )
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceMarcas.filter = filterValue.trim().toLowerCase()
    }

    limpiarFilter() {
        this.searchKey = ""
        this.listarMarcas(this.nIdCliente)
    }

    anadirDatosTablaMarca(lista: MarcaCliente[]) {
        this.dataSourceMarcas = new MatTableDataSource(lista)
        this.dataSourceMarcas.paginator = this.paginator
        this.dataSourceMarcas.sort = this.sort
    }

    guardarMarca() {

        if (this.formCatalogoMarca.invalid) {
            return Object.values(this.formCatalogoMarca.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    } else {
                        control.markAsTouched();
                    }
                }
            );
        }

        this.pOpcion = 21
        this.pParametro = []

        let formCatalogoMarca = this.formCatalogoMarca.value

        this.pParametro.push(this.nIdCliente)
        this.pParametro.push(formCatalogoMarca.marca)
        this.pParametro.push(this.pPais)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        };


        this.servicios.InsertMarcaCliente(params).subscribe(
            data => {
                if (Number(data.body.response.data[0].valorRetorno) > 0) {
                    Swal.fire('Exito', 'Se grabó con éxito.', 'success').then(
                        r => {
                            this.listarMarcas(this.nIdCliente)
                            this.crearFormCatalogoMarca()
                        }
                    )
                }
                else {
                    Swal.fire('Error', 'No se pudo agregar la marca', 'error').then(
                        r => {
                            this.listarMarcas(this.nIdCliente)
                            this.crearFormCatalogoMarca()
                        }
                    )
                }
            }
        )

    }

    actualizarEstadoMarca(idDetCataCli: number) {

        this.pOpcion = 22
        this.pParametro = [];
        this.pParametro.push(idDetCataCli)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        };

        this.servicios.UpdateEstadoMarcaCliente(params).subscribe(
            data => {
                if (Number(data.body.response.data[0].valorRetorno) > 0)

                    Swal.fire('Exito', 'Estado de marca actualizado', 'success')
                    this.estadoMarca = String(data.body.response.data[0].valorRetorno);
                    this.listarMarcas(this.nIdCliente)
            })
    }

    //#endregion
    
    cerrarVentana() {
        this.router.navigate(['/tfi/facturacion/datosbasicos/catalagocliente'])
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
                this.actualizarCliente()
                break
            case 1:
                this.actualizarEstado()
                break
            case 2:
                this.cerrarVentana()
                break
            default:
                break
        }
    }
}