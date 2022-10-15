import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { tr } from "date-fns/locale";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { ComboMarca } from "../models/comboMarca.model";
import { DireccionCliente } from "../models/direccionCliente.model";
import { ListaDepartamento } from "../models/listaDepartamento.model";
import { ListaDistrito } from "../models/listaDistrito.model";
import { ListaMarca } from "../models/listaMarca.model";
import { ListaNegocioActividad } from "../models/listaNegocioActividad.model";
import { ListaProvincia } from "../models/listaProvincia.model";
import { ListaTipoContribuyente } from "../models/listaTipoContribuyente.model";
import { ListaTipoEntidad } from "../models/listaTipoEntidad.model";
import { CatalogoClienteService } from "../services/catalogoCliente.service";
import { asistenciapAnimations } from '../../../../Asistencia/asistenciap/asistenciap.animations';

export interface ListaTipoDocumento {
    nId: number
    sDescripcion: string
}

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
    estado: string
    estadoDireccion: string
    estadoMarca: string
    //========================

    //Declaracion de datos necesarios 
    url: string
    idUser: number
    pNom: string
    idEmp: string
    pPais: string
    pNomEmp: string
    nEmpresa: string

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

    //Lista ddl Marca
    lMarca: ComboMarca[] = []

    //Forms 
    formEditar: FormGroup
    formDireccion: FormGroup
    formCatalogoMarca: FormGroup

    //Tabla Direccion
    dataSourceDireccion: MatTableDataSource<DireccionCliente>;
    displayedColumnsDireccion = ['opciones', 'direccion', 'departamento', 'provincia', 'distrito', 'principal', 'estado']
    lClienteDireccion: DireccionCliente[] = []

    //Tabla Catalogo Marcas
    dataSourceMarcas: MatTableDataSource<ListaMarca>
    lCatalogoMarca: ListaMarca[] = []
    displayedColumnsMarcas = ['categoria', 'linea', 'marca', 'estado', 'opciones']

    //Filtro de busqueda para Catalogo Marcas
    tFiltro = new FormControl()
    searchKey: string

    nIdCliente: number
    detalleSeleccionado: number
    lClientexID
    personaJuridica: boolean
    nLongitudMin: number = 0
    nLongitudMax: number = 0

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator; paginatorMarca: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort; sortMarca: MatSort;
    
    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private vCatalogoClienteService: CatalogoClienteService,
        @Inject('BASE_URL') baseUrl: string
    ) {
        this.url = baseUrl
    }

    ngOnInit(): void {

        this.crearFormRegistro();
        this.crearFormDireccion();
        this.crearFormCatalogoMarca();

        //Datos del Usuario
        let user = localStorage.getItem('currentUser');
        this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
        this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
        this.idEmp = localStorage.getItem('Empresa');
        this.pPais = localStorage.getItem('Pais');

        this.route.params.subscribe(params => {
            this.nIdCliente = +params.id;
            this.consultarClientexID(this.nIdCliente)
        });

        //funciones       
        this.listarDirecciones(this.nIdCliente)
        this.listarMarcas(this.nIdCliente)
        this.listaComboBox();
        this.onToggleFab(1, -1)
    }

    // Formularios            

    crearFormRegistro() {
        this.formEditar = this.formBuilder.group({

            nIdTipoEntidad: [null, [Validators.required]],
            sRuc: [null],
            sRazonSocial: [null, [Validators.required, Validators.minLength(4)]],
            sNombreComercial: [null, [Validators.required, Validators.minLength(4)]],
            nIdTipoContribuyente: [null, [Validators.required]],
            nIdTipoDocumento: [null, [Validators.required]],
            sTelefono1: [null, [Validators.required, Validators.minLength(1)]],
            sTelefono2: [null],
            sPaginaWeb: [null, [Validators.required]],
            sContacto: [null, [Validators.required, Validators.minLength(2)]],
            sContactoCorreo: [null, [Validators.required]],
            sContactoTelefono: [null, [Validators.required]],
            sContactoCargo: [null, [Validators.required, Validators.minLength(3)]],
            nFeePersonal: [null, [Validators.required, Validators.min(1)]],
            nFeeOperacion: [null, [Validators.required, Validators.min(1)]],
            nIdGiroNegocio: [null, [Validators.required]],
            sEstado: [null],
            sCreado: [null],
            sModificado: [null]
        })
    }

    crearFormDireccion() {
        this.formDireccion = this.formBuilder.group({
            nIdDireccion: [0],
            sDepartamento: [null, Validators.required],
            sProvincia: [null, Validators.required,],
            sDistrito: [null, Validators.required],
            sDireccion: ['', [Validators.required, Validators.minLength(3)]],
            sReferencia: [null],
            nPrincipal: [null],
            sEstado: ['']
        })
    }
    crearFormCatalogoMarca() {
        this.formCatalogoMarca = this.formBuilder.group({
            nIdDetCata: [null, [Validators.required]]
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
        this.pParametro = [];
        this.pOpcion = 2
        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lTipoEntidad = data
            })
    }

    listaTipoContribuyente() {
        this.pParametro = []
        this.pOpcion = 3

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lTipoContribuyente = data
            })
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

        this.formDireccion.controls.sProvincia.setValue(null)
        this.formDireccion.controls.sDistrito.setValue(null)

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
        this.formDireccion.controls.sDistrito.setValue(null)

        this.pParametro = [];
        this.pOpcion = 7
        this.pParametro.push(event)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lDistrito = data
            })
    }

    listaMarca() {
        this.pParametro = []
        this.pOpcion = 18

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lMarca = data
            }
        )
    }

    //Tabla Cliente

    consultarClientexID(idCliente: number) {
        this.spinner.show()

        this.pOpcion = 10
        this.pParametro = []
        this.pParametro.push(idCliente)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lClientexID = data

                if (this.lClientexID.length == 0) {
                    Swal.fire('Verificar', 'No se encontraron registros', 'warning')
                    this.spinner.hide()
                }
                else {
                    this.formEditar.patchValue(data[0])
                    this.estado = (data[0].sEstado)
                    this.spinner.hide()
                }
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
            )
        }

        this.pOpcion = 11
        this.pParametro = []

        let formEditar = this.formEditar.value;

        //Cliente Cabecera
        this.pParametro.push(this.nIdCliente)
        this.pParametro.push(formEditar.nIdTipoEntidad)
        this.pParametro.push(formEditar.sRuc)
        this.pParametro.push(formEditar.sRazonSocial)
        this.pParametro.push(formEditar.sNombreComercial)
        this.pParametro.push(formEditar.nIdTipoContribuyente)
        this.pParametro.push(formEditar.sTelefono1)
        this.pParametro.push(formEditar.sTelefono2)
        this.pParametro.push(formEditar.sPaginaWeb)
        this.pParametro.push(formEditar.sContacto)
        this.pParametro.push(formEditar.sContactoCorreo)
        this.pParametro.push(formEditar.sContactoTelefono)
        this.pParametro.push(formEditar.sContactoCargo)
        this.pParametro.push(formEditar.nFeePersonal)
        this.pParametro.push(formEditar.nFeeOperacion)
        this.pParametro.push(formEditar.nIdGiroNegocio)
        this.pParametro.push(1)
        this.pParametro.push(this.idUser)
        this.pParametro.push(this.pPais)
        this.pParametro.push(formEditar.nIdTipoDocumento)

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

                this.spinner.show()
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

    actualizarEstado() {
        this.pOpcion = 12
        this.pParametro = []
        this.pParametro.push(this.nIdCliente)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                if (data > 0)

                    Swal.fire('Exito', 'Estado actualizado', 'success')
                this.consultarClientexID(this.nIdCliente)
            })
    }

    validarRuc() {
        this.pOpcion = 22
        this.pParametro = []

        this.pParametro.push(this.nIdCliente)
        this.pParametro.push(this.formEditar.controls.sRuc.value)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                if (data == 0)
                    Swal.fire('Atención', 'RUC registrado, no puede registrarlo nuevamente', 'warning')
            })
    }

    validarRazonSocial() {
        this.pOpcion = 23
        this.pParametro = []

        this.pParametro.push(this.nIdCliente)
        this.pParametro.push(this.formEditar.controls.sRazonSocial.value)

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

        this.formEditar.controls.nIdTipoDocumento.setValue(null)
    }

    cambioTipoDocumento(event) {
        const longitud = this.lTipoDocumento.filter(item => item.nId === event)[0]

        this.nLongitudMin = longitud.nLongitud1
        this.nLongitudMax = longitud.nLongitud2
        this.formEditar.controls.sRuc.setValidators([Validators.minLength(this.nLongitudMin), Validators.maxLength(this.nLongitudMax), Validators.required, Validators.pattern(/^[0-9]\d*$/)])
    }

    //Tabla Direcciones

    listarDirecciones(idCliente: number) {
        this.pParametro = [];
        this.pParametro.push(idCliente);
        this.pOpcion = 13

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lClienteDireccion = data

                if (this.lClienteDireccion.length == 0) {
                    Swal.fire('¡Verificar!', 'No se encontraron registros de direcciones', 'warning')
                }
                else {
                    this.anadirDatosTabla(this.lClienteDireccion)
                    this.estadoDireccion = (data.sEstado)
                }
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
                        control.markAsTouched()
                    }
                }
            )
        }

        this.pParametro = []

        let formDireccion = this.formDireccion.value

        if (formDireccion.nIdDireccion == 0) this.pOpcion = 14
        else this.pOpcion = 16

        debugger
        this.pParametro.push(this.nIdCliente)
        this.pParametro.push(formDireccion.nIdDireccion)
        this.pParametro.push(formDireccion.sDistrito)
        this.pParametro.push(formDireccion.sDireccion)
        this.pParametro.push(formDireccion.sReferencia)
        this.pParametro.push(this.formDireccion.get('nPrincipal').value === true ? 1 : 0)
        this.pParametro.push(formDireccion.sEstado.value === true ? 1 : 0)
        this.pParametro.push(this.idUser)
        this.pParametro.push(this.pPais)

        debugger

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                if (Number(data) > 0) {
                    Swal.fire('Exito', 'Se realizo correctamente', 'success').then(
                        r => {
                            this.listarDirecciones(this.nIdCliente)
                            this.crearFormDireccion()
                        }
                    )
                }
                else {
                    Swal.fire('Error', 'No se pudo agregar la direccion', 'error').then(
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

        this.pOpcion = 15
        this.pParametro = [];
        this.pParametro.push(row.nIdDireccion);

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {

                // this.formDireccion = this.formBuilder.group({
                //     nIdDireccion: data['nIdDireccion'],
                //     sDepartamento: Number(data['sDepartamento']),
                //     sProvincia: Number(data['sProvincia']),
                //     sDistrito: Number(data['sDistrito']),
                //     sDireccion: data['sDireccion'],
                //     sReferencia: data['sReferencia'],
                //     nPrincipal: data['nPrincipal']
                // })

                // let valores = this.formDireccion.value
                // console.log(valores)
                // this.listaProvincia(valores.sDepartamento)
                // this.listaDistrito(valores.sProvincia)
                this.formDireccion.patchValue(data[0]);
                this.formDireccion.controls.nPrincipal.setValue(data[0].nPrincipal)
            })
    }

    actualizarEstadoDireccion(nIdDireccion: number) {
        this.pOpcion = 17
        this.pParametro = [];
        this.pParametro.push(nIdDireccion)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                if (data > 0)
                    Swal.fire('Exito', 'Estado de dirección actualizado', 'success')
                this.listarDirecciones(this.nIdCliente)
            })
    }

    //Tabla Catalogo Marca 

    listarMarcas(idCliente: number) {

        this.pParametro = []
        this.pParametro.push(idCliente)
        this.pOpcion = 19

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lCatalogoMarca = data
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

    anadirDatosTablaMarca(lista: ListaMarca[]) {
        this.dataSourceMarcas = new MatTableDataSource(lista)
        this.dataSourceMarcas.paginator = this.paginatorMarca
        this.dataSourceMarcas.sort = this.sortMarca
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

        this.pOpcion = 20
        this.pParametro = []

        let formCatalogoMarca = this.formCatalogoMarca.value

        this.pParametro.push(this.nIdCliente)
        this.pParametro.push(formCatalogoMarca.nIdDetCata)
        this.pParametro.push(this.pPais)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                if (Number(data) > 0) {
                    Swal.fire('Exito', 'Se realizo correctamente', 'success').then(
                        r => {
                            this.listarMarcas(this.nIdCliente)
                            this.crearFormCatalogoMarca()
                        }
                    )
                }
                else {
                    Swal.fire('Error', 'Marca ya registrada', 'error').then(
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
        this.pOpcion = 21
        this.pParametro = [];
        this.pParametro.push(idDetCataCli)

        this.vCatalogoClienteService.fnCatalogoClientev2(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {

                if (Number(data) > 0)

                    Swal.fire('Exito', 'Estado de marca actualizado', 'success')
                this.estadoMarca = data;
                this.listarMarcas(this.nIdCliente)
            })
    }

    cerrarVentana() {
        this.router.navigate(['/comercial/matenimiento/catalago-list'])
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