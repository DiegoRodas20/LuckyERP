import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from '../../../Asistencia/asistenciap/asistenciap.animations';
import { NotasLogisticaService } from './../notas-logistica.service';

export interface Estado {
  codigo: number;
  nombre: string;
}

@Component({
  selector: 'app-nota-utiles',
  templateUrl: './nota-utiles.component.html',
  styleUrls: ['./nota-utiles.component.css'],
  animations: [asistenciapAnimations]
})
export class NotaUtilesComponent implements OnInit {
  // Botones Flotantes
  tsLista = 'active';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'post_add', tool: 'Nuevo' },
  ];
  abLista = [];

  cboAnio = new FormControl();
  sAnio = '';
  lAnios: string[] = [];

  @Output() verNotaEspecifica: EventEmitter<any>;
  //Variables Sistema
  url: string;
  nIdUsuario: number;
  sPais: string;
  nIdEmpresa: string;

  //Variables Pantalla
  vPrincipal: boolean = true;
  vSecundario: boolean = false;
  pOpcion: number;
  nIdNota: number
  txtFiltro = new FormControl();
  nEstado = new FormControl();
  listaEstados: any;
  nIdEstado: number

  //Mat Table
  listaNotaTableData: MatTableDataSource<any>;
  @ViewChild(MatPaginator) listaNotaPaginator: MatPaginator;
  @ViewChild(MatSort) listaNotaSort: MatSort;
  ListaNotaColumns: string[] =
    ['nIdOperMov', 'sNomPresupuesto', 'sDocumento', 'nCantidad', 'nPeso', 'nVolumen', 'sFechaTraslado', 'sEstado'];


  constructor(
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string,
    private notasLogisticaService: NotasLogisticaService,
    private route: Router) {
    this.url = baseUrl;
    this.crearEstados();
    this.verNotaEspecifica = new EventEmitter();
  }

  async ngOnInit(): Promise<void> {
    this.vPrincipal = true;
    this.vSecundario = false;

    this.sPais = localStorage.getItem('Pais');
    this.nIdEmpresa = localStorage.getItem('Empresa');
    const user = localStorage.getItem('currentUser');
    this.nIdUsuario = JSON.parse(window.atob(user.split('.')[1])).uid;

    this.nEstado.setValue(0);
    this.nIdEstado = 0;

    await this.fnListarAnios();
    let anioActual = moment().year().toString();
    let estaAnioActual = this.lAnios.find(item => item == anioActual);

    if (!estaAnioActual) {
      this.lAnios.push(anioActual);
    }

    this.cboAnio.setValue(anioActual);
    this.sAnio = anioActual;


    this.fnListarNotas();
    this.onToggleFab(1, -1)

  }

  async fnListarAnios() {
    this.spinner.show('spiDialog');

    var pParametro = [];
    var pParametroDet = [];

    let data = await this.notasLogisticaService.fnControlNotaUtiles(1, 2, pParametro, 17, pParametroDet, this.url) as string[];
    this.lAnios = data;

    this.spinner.hide('spiDialog');

  }

  fnSeleccionarAnio(sAnio) {
    this.sAnio = sAnio;
    this.fnListarNotas();
  }


  //#region Estados de la Nota
  crearEstados() {
    let lista: Estado[] = [
      { codigo: 0, nombre: 'Todos' },
      { codigo: 2225, nombre: 'Pendiente' },
      { codigo: 2226, nombre: 'Enviado' },
      { codigo: 2229, nombre: 'Recibido Logística' },
      { codigo: 2230, nombre: 'Devuelto Logística' },
      { codigo: 2267, nombre: 'Rechazado Logística' },
    ];
    this.listaEstados = lista;
  }

  cambioEstado(event) {
    this.nIdEstado = event;
    this.fnListarNotas();
  }
  //#endregion

  //#region Filtrar Nota
  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listaNotaTableData.filter = filterValue.trim().toLowerCase();

    if (this.listaNotaTableData.paginator) {
      this.listaNotaTableData.paginator.firstPage();
    }
  }
  //#endregion

  //#region Listar Notas
  async fnListarNotas() {
    this.spinner.show('spiDialog');

    var pParametro = [];
    var pParametroDet = [];

    pParametro.push(this.nIdUsuario);
    pParametro.push(this.nIdEstado);
    pParametro.push(this.nIdEmpresa);
    pParametro.push(this.sAnio);

    await this.notasLogisticaService.
      fnControlNotaUtiles
      (1, 2, pParametro, 1, pParametroDet, this.url)
      .then((value: any[]) => {

        this.listaNotaTableData = new MatTableDataSource(value);
        this.listaNotaTableData.paginator = this.listaNotaPaginator;
        this.listaNotaTableData.sort = this.listaNotaSort;
        let filtro = "";

        if (this.txtFiltro.value == null) {
          return;
        }
        filtro = this.txtFiltro.value.trim();
        filtro = filtro.toLowerCase();
        this.listaNotaTableData.filter = filtro;
      },
        error => {
          console.log(error);
        });
    this.spinner.hide('spiDialog');
  }
  //#endregion

  //#region Nueva Nota de Utiles
  fnNuevaNotaUtiles = function () {
    this.vSecundario = true;
    this.verNotaEspecifica.emit(0);
    this.pOpcion = 1   //Opcion Nuevo   
    this.vPrincipal = false;
  }
  //#endregion

  //#region Ver Nota Registrada
  fnVerDetalle = function (nIdNota) {
    this.vPrincipal = false
    this.verNotaEspecifica.emit(0);
    this.vSecundario = true;
    this.nIdNota = nIdNota
    this.pOpcion = 3; //Opcion ver detalle
  }
  //#endregion

  //#region Eventos
  eventTempF(resp) {
    if (resp == 1) {
      this.vSecundario = false;
      this.vPrincipal = true;
      this.fnListarNotas();
      this.spinner.hide('spiDialog');
      this.verNotaEspecifica.emit(1);
    }
  }
  //#endregion

  //Botones Flotantes
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnNuevaNotaUtiles()
        break
      default:
        break
    }
  }
}
