import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Reporte_Picking } from '../../models/picking.model';

@Component({
  selector: 'app-reporte-picking-salida',
  templateUrl: './reporte-picking-salida.component.html',
  styleUrls: ['./reporte-picking-salida.component.css']
})
export class ReportePickingSalidaComponent implements OnInit {

  @Input() lArticuloPicking: Reporte_Picking[];
  @Input() sGuias: string;
  @Input() sFechaPicking: string;

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  lEmpresas;
  vEmpresaActual;

  sDiaActual: string = '';

  constructor() { }

  ngOnInit(): void {
    let user = localStorage.getItem('currentUser'); //encriptacion del usuario 
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');
    this.lEmpresas = JSON.parse(localStorage.getItem('ListaEmpresa'));
    this.sDiaActual = moment().format('DD/MM/YYYY')

    this.vEmpresaActual = this.lEmpresas.find(item => item.nIdEmp == this.idEmp);

  }

}
