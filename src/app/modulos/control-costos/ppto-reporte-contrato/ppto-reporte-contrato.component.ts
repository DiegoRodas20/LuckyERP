import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { asistenciapAnimations } from '../../comercial/Asistencia/asistenciap/asistenciap.animations';
import { PptoReporteContratoService } from './ppto-reporte-contrato.service';

@Component({
    selector: 'app-ppto-reporte-contrato',
    templateUrl: './ppto-reporte-contrato.component.html',
    styleUrls: ['./ppto-reporte-contrato.component.css'],
    animations: [asistenciapAnimations]
})

export class PptoReporteContratoComponent implements OnInit {

    // Botones lista
    tsLista = 'inactive';  // Inicia la lista oculta
    fbLista = [ // Lista de las opciones que se mostrarán
        { icon: 'cloud_download', tool: 'Generar Reporte', color: 'white' },
    ];
    abLista = [];

    // Combobox
    listaTipoContrato: any[];
    listaEmpresa: any[];
    listaYear: any[];

    // Variables de sesion (LocalStorage)
    idEmpresa;
    idUsuario;
    sPais: string;
    estaCargado: boolean = false; // Variable para ver cuando la pagina este completamente cargada
    formReporte: FormGroup;

    constructor(private service: PptoReporteContratoService, private fb: FormBuilder, private spinner: NgxSpinnerService) {
        this.crearFormulario();
    }

    async ngOnInit() {
        this.spinner.show();

        this.onToggleFab(1, -1);

        // Inicializando variables de sesion
        this.idEmpresa = localStorage.getItem("Empresa");
        const currentUserBase64 = localStorage.getItem("currentUser");
        this.idUsuario = JSON.parse(window.atob(currentUserBase64.split(".")[1])).uid;
        this.sPais = localStorage.getItem('Pais');

        // Lista combobox
        await this.obtenerListaTipoContrato();
        await this.obtenerListaEmpresa(this.sPais);
        await this.obtenerYear();

        // Inicializar Formulario
        this.inicializarFormulario();
        this.spinner.hide();
    }

    crearFormulario() {
        this.formReporte = this.fb.group({
            'tipoContrato': [null],
            'empresa': [null],
            'year': [],
            'estado': []
        })
    }

    inicializarFormulario() {
        const tipoContrato = this.listaTipoContrato[0];
        const empresa = Number(this.idEmpresa);
        this.formReporte.reset({
            'year': 1,
            'tipoContrato': tipoContrato.nId,
            'estado': '-1',
            'empresa': empresa
        })
    }

    clickFab(index: number) {
        switch (index) {
            case 0:
                this.generarReporte();
                break;
            default:
                break;
        }
    }

    generarReporte() {
        this.spinner.show();

        const tipoContrato = this.formReporte.get('tipoContrato').value;
        const empresa = this.formReporte.get('empresa').value === null ? 0 : this.formReporte.get('empresa').value;
        const year = this.listaYear.filter(item => item.nId === this.formReporte.get('year').value)[0].year;
        const estado = this.formReporte.get('estado').value;

        // Respuesta con el blob del Excel
        this.service.generarReporteContrato(1, `${tipoContrato}|${year}|${estado}|${empresa}`).subscribe(
            data => {
                if (!data) {
                    this.spinner.hide();
                    Swal.fire({
                        title: 'No existen registros con las especificaciones puestas',
                        icon: 'warning',
                        timer: 1500
                    })
                    return;
                }
                else {
                    this.downloadFile(data);
                }
            }
        )
    }

    downloadFile(data: any) {

        const fileName = `Reporte Contrato.xlsx`;
        var blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, fileName);
        this.spinner.hide();
        Swal.fire({
            title: 'El Excel ha sido generado',
            html: `Si su descarga no ha comenzado, puede descargarlo <a href='${blob}' download="${fileName}">aquí</a>`,
            icon: 'success',
            showCloseButton: true
        })
    }


    // Funcionalidad de los botones laterales
    onToggleFab(fab: number, stat: number) {

        stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
        this.tsLista = (stat === 0) ? 'inactive' : 'active';
        this.abLista = (stat === 0) ? [] : this.fbLista;

    }

    async obtenerListaTipoContrato() {
        this.listaTipoContrato = await this.service.obtenerInformacionLegal(1, '');
    }

    async obtenerListaEmpresa(sPais: string) {
        this.listaEmpresa = await this.service.obtenerInformacionLegal(5, `${sPais}`);
    }

    async obtenerYear() {
        this.listaYear = await this.service.obtenerInformacionLegal(6, '');
    }

}