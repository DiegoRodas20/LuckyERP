import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { TransporteService } from '../../../transporte.service';
import { Moment } from 'moment';
import moment from 'moment';

@Component({
  selector: 'app-log-gasto-pptos',
  templateUrl: './log-gasto-pptos.component.html',
  styleUrls: ['./log-gasto-pptos.component.css'],
  animations: [asistenciapAnimations]
})
export class LogGastoPptosComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  lAnio = [];
  lCliente = [];

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual

  formGastos: FormGroup;
  listaCliente: any;
  listaYear: any;
  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private vTransporteService: TransporteService,
    private cdr: ChangeDetectorRef,

    @Inject('BASE_URL') baseUrl: string
  ) { this.url = baseUrl; }

  async ngOnInit() {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');

    this.onToggleFab(1, -1)

    this.formGastos = this.formBuilder.group({
      cboAnio: [''],
      cboCliente: [''],
    });

    await this.obtenerClientes(this.pPais);
    await this.obtenerYear();
    this.inicializarYear();
  }
  inicializarYear() {
    let now: Moment = moment();
    let year = now.format('yyyy');
    const lista = this.listaYear.filter(item => item.year === year);
    if(lista.length > 0) {
      this.formGastos.controls.cboAnio.setValue(lista[0].year);
    }

  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }

  async obtenerClientes(idPais: string) {
    this.listaCliente = await this.vTransporteService.listarOpcionesReporteTransporte(1,`${idPais}`);
  }

  async obtenerYear() {
    this.listaYear = await this.vTransporteService.listarOpcionesReporteTransporte(2,``);
  }

  async generarExcel() {
    const year = this.formGastos.get('cboAnio').value;
    const cliente = this.formGastos.get('cboCliente').value;
    const response: any = await this.vTransporteService.generarReporteTransporteExcel(1,`${cliente}|${year}`);
    if(response === 0) {
      return Swal.fire({
        title: 'No se encuentran registros en el excel',
        icon: 'warning',
        timer: 1500
      })
    } else {
      // Descargar el Excel
      const data = response.filename;
      var link = document.createElement('a');
      link.href = data;
      // Trigger de descarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  
      Swal.fire({
        title: 'El Excel ha sido generado',
        html: `Si su descarga no ha comenzado, puede descargarlo <a href='${response.filename}' download>aquí</a>`,
        icon: 'success',
        showCloseButton: true
      })
    }
  }

}
