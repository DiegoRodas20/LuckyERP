import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { asistenciapAnimations } from "src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations";
import Swal from "sweetalert2";
import { PresupuestosService } from "../../presupuestos.service";
import { ReporteStaffComponent } from "./reporte-dialog/reporte-staff.component";

export interface MesCombo {
    nEleCod: string
    Mes: string
}

@Component({
    selector: "app-pptos-informe-staff",
    templateUrl: "./pptos-informe-staff.component.html",
    styleUrls: ["./pptos-informe-staff.component.css"],
    animations: [asistenciapAnimations]
})

export class ReporteInformeStaff implements OnInit {

    //Botones Flotantes Pptos y estados
    tsLista = 'active'; // Inicia la lista visible
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'search', tool: 'Ver Reporte' },
        { icon: 'cloud_download', tool: 'Descargar Excel' }
    ]
    abLista = [];

    ///===================
    pOpcion = 0 //CRUD -> Listar
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

    //Lista ddl Mes
    lDesdeMes: MesCombo[] = []
    lHastaMes: MesCombo[] = []

    //Formulario
    formInformeStaff: FormGroup

    constructor(
        private fb: FormBuilder,
        private spinner: NgxSpinnerService,
        private dialog: MatDialog,
        private servicioPresupuesto: PresupuestosService,

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

        this.crearFormInformeStaff()
        this.listaDesdeMes()
        this.onToggleFab(1, -1)
    }

    crearFormInformeStaff() {
        this.formInformeStaff = this.fb.group({
            ejercicio: ['2021', [Validators.required]],
            desdeMes: [null, [Validators.required]],
            hastaMes: [null, [Validators.required]]
        })
    }


    //Funciones

    listaDesdeMes() {
        this.pOpcion = 1
        this.pParametro = []

        this.servicioPresupuesto.fnInformePersonalStaff(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lDesdeMes = data
            }
        )
    }

    listaHastaMes(event) {
        this.pOpcion = 3
        this.pParametro = []

        this.pParametro.push(event)
        this.servicioPresupuesto.fnInformePersonalStaff(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                this.lHastaMes = data
            }
        )
        this.formInformeStaff.controls.hastaMes.setValue(null)
    }

    verInformeStaff() {
        if (this.formInformeStaff.invalid) {
            return Object.values(this.formInformeStaff.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    }
                    else {
                        control.markAsTouched()
                        Swal.fire('Atención', 'Debe completar los datos', 'warning')
                    }
                }
            )
        }

        this.spinner.show()
        var data  = this.idEmp
        var data2 = this.formInformeStaff.get('desdeMes').value
        var data3 = this.formInformeStaff.get('hastaMes').value

        var variableDialog = { data, data2, data3 }
        const dialogConfig = new MatDialogConfig()
        dialogConfig.data = variableDialog
        dialogConfig.maxWidth = '100vw'

        this.dialog.open(ReporteStaffComponent, dialogConfig)
    }

    descargarInformeStaff() {

        if (this.formInformeStaff.invalid) {
            return Object.values(this.formInformeStaff.controls).forEach(
                control => {
                    if (control instanceof FormGroup) {
                        Object.values(control.controls).forEach(control => control.markAsTouched())
                    }
                    else {
                        control.markAsTouched()
                        Swal.fire('Atención', 'Debe completar los datos', 'warning')
                    }
                }
            )
        }

        this.spinner.show()
        this.pOpcion = 2
        this.pParametro = []

        this.pParametro.push(this.idEmp)
        this.pParametro.push(this.formInformeStaff.get('desdeMes').value)
        this.pParametro.push(this.formInformeStaff.get('hastaMes').value)

        this.servicioPresupuesto.fnInformePersonalStaffExcel(this.pOpcion, this.pParametro, this.url).subscribe(
            data => {
                if(data.size == 14){
                    Swal.fire('Atención', 'No se encontraron registros', 'warning')
                    this.spinner.hide()
                    return
                }
                else{ this.downloadFile(data) }
            }
        )
    }

    downloadFile(data: any) {
        let name = 'Informe Staff'
        var blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(blob, name + '.xlsx')
        this.spinner.hide()
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
                this.verInformeStaff()
                break
            case 1:
                this.descargarInformeStaff()
                break
            default:
                break
        }
    }
}