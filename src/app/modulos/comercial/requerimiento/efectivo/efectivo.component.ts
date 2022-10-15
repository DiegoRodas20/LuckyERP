import { Component, OnInit, ViewChild, ViewChildren, Inject, AfterViewInit, ElementRef, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { SergeneralService } from '../../../../shared/services/sergeneral.service';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SerEfectivoService } from './ser-efectivo.service';
import { asistenciapAnimations } from '../../Asistencia/asistenciap/asistenciap.animations';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-efectivo',
    templateUrl: './efectivo.component.html',
    styleUrls: ['./efectivo.component.css'],
    animations: [asistenciapAnimations]
})

export class EfectivoComponent implements OnInit {

    //#region declaracion variable del sistema
    id: number;
    url: string;
    pais: string;
    Empresa: string;
    lPar: number;
    //#endregion
    abLista = [];
    tsLista = 'active';
    fbLista = [
        { icon: 'attach_money', tool: 'Nuevo R. Efectivo' }
    ];

    //#region true and false to div
    divList: boolean = true;
    divCreate: boolean = false;
    //#endregion

    //#region declarando las tablas de presupuesto, sucursal, equipo y partidas

    /* tabla lista de presupuesto */
    dataSourceEfec: MatTableDataSource<any>;
    displayedColumnsEfec: string[] = [
        'pnIdGastoCosto', 'psCodCC', 'psDescCC', 'psTipoDoc', 'psCodRQ',
        'psTitulo', 'penviado', 'ptotal', 'pestado'];
    @ViewChild('TableEfecPaginator', { static: true }) tableEfecPaginator: MatPaginator;
    @ViewChild('TableEfecSort') tableEfecSort: MatSort;
    //#endregion
    txtControl = new FormControl();

    vEfectivo = new Object();

    constructor(
        private spinner: NgxSpinnerService,
        private vSerEfectivo: SerEfectivoService,
        @Inject('BASE_URL') baseUrl: string
    ) {
        this.url = baseUrl;
    }

    ngOnInit(): void {
        this.pais = localStorage.getItem('Pais');
        this.Empresa = localStorage.getItem('Empresa');
        const user = localStorage.getItem('currentUser');
        this.id = JSON.parse(window.atob(user.split('.')[1])).uid;

        this.fnGetPerfil();
        this.fnGetLista();
        this.onToggleFab(1, -1)
    }

    onToggleFab(fab: number, stat: number) {
        switch (fab) {
            case 1:
                stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
                this.tsLista = (stat === 0) ? 'inactive' : 'active';
                this.abLista = (stat === 0) ? [] : this.fbLista;
                break;

            default:
                break;
        }
    }

    async fnGetLista() {
        let pParametro = [];
        pParametro.push(this.id);
        pParametro.push(this.Empresa);

        this.spinner.show();
        await this.vSerEfectivo.fnEfectivo(3, pParametro, this.url).then((value: any) => {
            this.dataSourceEfec = new MatTableDataSource(value);
            this.dataSourceEfec.paginator = this.tableEfecPaginator;
            this.dataSourceEfec.sort = this.tableEfecSort;

        }, error => {
            console.log(error);
        });
        this.spinner.hide();
    }

    async fnGetPerfil() {
        let pParametro = [];
        pParametro.push(this.id);
        pParametro.push(this.pais);

        await this.vSerEfectivo.fnEfectivo(8, pParametro, this.url).then((value: any) => {
            this.vEfectivo["idCargo"] = value.nIdCargo;
            this.vEfectivo["desCargo"] = value.sCargo;
            this.vEfectivo["monto"] = value.nMonto;
            this.vEfectivo["sinControl"] = value.sinControl;
        }, error => {
            console.log(error);
        });
    }

    recibirMensaje(mensaje: string) {
        this.divList = true;
        this.divCreate = false;
        this.txtControl.setValue('')
        this.vEfectivo["List"] = '';
        this.fnGetLista();
    }

    applyFilter = function (filterValue: string) {

        this.dataSourceEfec.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceEfec.paginator) {
            this.dataSourceEfec.paginator.firstPage();
        }
    }

    fnPlantilla(op) {
        if (op == 0) {
            this.divCreate = true;
            this.divList = false;
        }
    }

    async fnDatos(id) {
        let pParametro = [];
        pParametro.push(id);
        pParametro.push(this.id);

        this.spinner.show();
        await this.vSerEfectivo.fnEfectivo(5, pParametro, this.url).then((value: any) => {

            this.vEfectivo["List"] = value;
            this.fnPlantilla(0)

        }, error => {
            console.log(error);
        });

        this.spinner.hide();
    }
}