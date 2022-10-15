import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import { Parametros } from "src/app/modulos/TFI/repository/models/general/parametros";
import { Empresa, TipoDocumento } from "src/app/modulos/TFI/repository/models/series/serieDto";
import { SeriesService } from "src/app/modulos/TFI/repository/services/series.service";
import Swal from "sweetalert2";


@Component({
    selector: "app-serie-add.component",
    templateUrl: "./serie-add.component.html",
    styleUrls: ["./serie-add.component.css"],
    animations: [asistenciapAnimations]
})

export class SerieAddComponent implements OnInit {


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
    numeradorDisabled: boolean = true
    correlativo: string

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

        this.crearformSerie()
        this.validacionPeru()
        this.listaEmpresa()
        this.listaTipoDocumento()
        this.formSerie.controls.estado.setValue(true)
        this.formSerie.controls.empresa.setValue(Number(this.idEmp))
        this.onToggleFab(1, -1)
        
    }


    crearformSerie() {

        this.formSerie = this.formBuilder.group({

            empresa             : [null, [Validators.required]],
            tipoDocumento       : [null, [Validators.required]],
            codigoSucursal      : [null, [Validators.required, Validators.maxLength(10)]],
            serie               : [null, [Validators.required, Validators.maxLength(10)]],
            descripcion         : [null, [Validators.required, Validators.maxLength(50)]],
            anchoNumerador      : [null, [Validators.required]],
            numeradorActual     : [null, [Validators.required, Validators.maxLength(15)]],
            electronica         : [null, [Validators.required]],
            estado              : [null, [Validators.required]]

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

    numeradorSerie(){

        this.pOpcion = 8
        this.pParametro = []

        let formSerie = this.formSerie.value

        this.pParametro.push(this.idEmp)
        this.pParametro.push(formSerie.tipoDocumento)
        this.pParametro.push(formSerie.serie)
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
                    this.formSerie.controls.numeradorActual.setValue(this.correlativo)
                    this.numeradorDisabled = false
                }

            }
        )
    }

    registrarSerie() {

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
        this.pOpcion = 4
        this.pParametro = []

        let formSerie = this.formSerie.value

        this.pParametro.push(formSerie.empresa)
        this.pParametro.push(formSerie.tipoDocumento)
        this.pParametro.push(formSerie.codigoSucursal)
        this.pParametro.push(formSerie.serie)
        this.pParametro.push(formSerie.anchoNumerador)
        this.pParametro.push(formSerie.numeradorActual)
        this.pParametro.push(formSerie.descripcion)
        this.pParametro.push(formSerie.estado)
        this.pParametro.push(formSerie.electronica)

        const params: Parametros = {
            pOpcion: this.pOpcion,
            pParametro: this.pParametro.join('|')
        }

        this.servicios.InsertSerie(params).subscribe(
            data => {
                if (data.body.response.data[0].valorRetorno == 1) {
                    Swal.fire('Éxito', 'Se grabó con éxito', 'success').then(
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
            this.formSerie.controls.codigoSucursal.clearValidators()
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
                this.registrarSerie()
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