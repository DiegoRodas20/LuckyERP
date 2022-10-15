import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { Parametros } from "src/app/modulos/TFI/repository/models/general/parametros";
import { Empresa, TipoDocumento } from "src/app/modulos/TFI/repository/models/series/serieDto";
import { SeriesService } from "src/app/modulos/TFI/repository/services/series.service";
import Swal from "sweetalert2";


@Component({
    selector: "app-serie-edit.component",
    templateUrl: "./serie-edit.component.html",
    styleUrls: ["./serie-edit.component.css"],
    animations: [asistenciapAnimations]
})

export class SerieEditComponent implements OnInit {

    tsLista = 'active';  // Inicia la lista oculta
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'save', tool: 'Registrar' },
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

    isReadOnly: boolean = true
    isPeru: boolean = true
    correlativo: string
    lSeriexID
    serieID: number

    // Lista dll
    lEmpresa: Empresa[] = []
    lTipoDocumento: TipoDocumento[] = []
    lElectronica = [
        { codigo: true, descripcion: 'Si' },
        { codigo: false, descripcion: 'No' },
    ]

    lEstado = [
        { codigo: true, descripcion: 'Activo' },
        { codigo: false, descripcion: 'Inactivo' },
    ]

    //Forms 
    formSerie: FormGroup

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private servicios: SeriesService,

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

        this.route.params.subscribe(params => {
            this.serieID = +params.id
        })

        this.crearformSerie()
        this.validacionPeru()
        this.listaEmpresa()
        this.listaTipoDocumento()
        this.listarSeriexID(this.serieID)
        this.formSerie.controls.codigoEmpresa.setValue(Number(this.idEmp))
        this.onToggleFab(1, -1)
    }

    crearformSerie() {

        this.formSerie = this.formBuilder.group({

            codigoEmpresa       : [null, [Validators.required]],
            codigoDocumento     : [null, [Validators.required]],
            sucursal            : [null, [Validators.required, Validators.maxLength(10)]],
            numeroSerie         : [null, [Validators.required, Validators.maxLength(10)]],
            descripcion         : [null, [Validators.required, Validators.maxLength(50)]],
            anchoNumerador      : [null, [Validators.required]],
            numerador           : [null, [Validators.required, Validators.maxLength(15)]],
            bElectronica        : [null, [Validators.required]],
            bEstado             : [null, [Validators.required]]

        })
    }

    listaEmpresa() {

        this.pOpcion = 2
        this.pParametro = []
        this.pParametro.push(this.pPais)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getEmpresas(param).subscribe(
            data => {
                this.lEmpresa = data.body.response.data
            }
        )
    }

    listaTipoDocumento() {

        this.pOpcion = 3
        this.pParametro = []

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getTiposDocumento(param).subscribe(
            data => {
                this.lTipoDocumento = data.body.response.data
            }
        )
    }

    listarSeriexID(serieID: number) {

        this.spinner.show()
        this.pOpcion = 5
        this.pParametro = []
        this.pParametro.push(serieID)

        const param = `opcion=${this.pOpcion}&parametro=${this.pParametro}`

        this.servicios.getSeriexID(param).subscribe(
            data => {
                this.lSeriexID = data.body.response.data[0]
                if (this.lSeriexID.length == 0) {
                    Swal.fire('Verificar', 'No se encontraron registros', 'warning')
                    this.spinner.hide()
                }
                else {
                    this.formSerie.patchValue(this.lSeriexID)
                    this.spinner.hide()
                }
            }
        )
    }

    numeradorSerie(){

        this.pOpcion = 8
        this.pParametro = []

        let formSerie = this.formSerie.value

        this.pParametro.push(this.idEmp)
        this.pParametro.push(formSerie.codigoDocumento)
        this.pParametro.push(formSerie.numeroSerie)
        this.pParametro.push(formSerie.anchoNumerador)

        const pParametro = this.pParametro.join('|')

        const param = `opcion=${this.pOpcion}&parametro=${pParametro}`

        this.servicios.getNumerador(param).subscribe(
            data => {
                this.correlativo = data.body.response.data[0].correlativo
                
                if (this.correlativo == "") {
                    Swal.fire('¡Atención!', 'Debe completar el numerador', 'warning')
                }
                else {
                    this.formSerie.controls.numerador.setValue(this.correlativo)
                }

            }
        )
    }

    actualizarSerie() {

        if (this.formSerie.invalid) {
            return Object.values(this.formSerie.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    }
                    else {
                        control.markAsTouched()
                        Swal.fire('¡Atención!', 'Existen datos pendientes por completar', 'warning')
                    }
                }
            );
        }

        this.spinner.show()
        this.pOpcion = 6
        this.pParametro = []

        let formSerie = this.formSerie.value

        this.pParametro.push(this.serieID)
        this.pParametro.push(formSerie.codigoEmpresa)
        this.pParametro.push(formSerie.codigoDocumento)
        this.pParametro.push(formSerie.sucursal)
        this.pParametro.push(formSerie.numeroSerie)
        this.pParametro.push(formSerie.anchoNumerador)
        this.pParametro.push(formSerie.numerador)
        this.pParametro.push(formSerie.descripcion)
        this.pParametro.push(formSerie.bEstado)
        this.pParametro.push(formSerie.bElectronica)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        }

        this.servicios.UpdateSerie(params).subscribe(
            data => {
                if (data.body.response.data[0].valorRetorno == 1) {
                    Swal.fire('Éxito', 'Se actualizo con éxito', 'success').then(
                        (result) => {
                            this.router.navigate(['/tfi/facturacion/datosbasicos/serie'])
                        }
                    )
                    this.spinner.hide()
                }
                else if (data.body.response.data[0].valorRetorno == 0) {
                    Swal.fire('¡Atención!', 'La serie indicada ya esta registrada en esta empresa', 'warning')
                    this.spinner.hide()
                }
                else {
                    Swal.fire('Error', 'Hubo un error', 'error')
                    this.spinner.hide()
                }
            }
        )

    }

    validacionPeru() {
        
        if (this.pPais == "604") {
            this.isPeru = true
            this.formSerie.controls.sucursal.clearValidators()
        }
        else {
            this.isPeru = false
        }
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
                this.actualizarSerie()
                break
            case 1:
                this.cerrarVentana()
                break
            default:
                break
        }
    }

    cerrarVentana() {
        this.router.navigate(['/tfi/facturacion/datosbasicos/serie'])
    }

}