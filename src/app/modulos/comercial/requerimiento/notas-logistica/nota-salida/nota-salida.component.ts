import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
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
  selector: 'app-nota-salida',
  templateUrl: './nota-salida.component.html',
  styleUrls: ['./nota-salida.component.css'],
  animations: [asistenciapAnimations]
})
export class NotaSalidaComponent implements OnInit {

  // Botones Flotantes
  tsLista = 'active';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'post_add', tool: 'Nuevo' },
  ];
  abLista = [];

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
  nIdNotaSalida: number
  txtFiltro = new FormControl();
  nEstado = new FormControl();
  listaEstados: any;
  nIdEstado: number

  cboAnio = new FormControl();
  sAnio = '';
  //Mat Table
  listaNotaSalidaTableData: MatTableDataSource<any>;
  @ViewChild(MatPaginator) listaNotaSalidaPaginator: MatPaginator;
  @ViewChild(MatSort) listaNotaSalidaSort: MatSort;
  ListaNotaSalidaColumns: string[] =
    ['nIdOperMov', 'sNomPresupuesto', 'sDocumento', 'sDestino', 'sTipoEnvio', 'sFechaSalida', 'nCantidad', 'nPeso', 'nVolumen', 'sEstado'];

  constructor(
    private spinner: NgxSpinnerService,
    @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder,
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
    await this.fnListarAnios();
    let anioActual = moment().year().toString();
    let estaAnioActual = this.lAnios.find(item => item == anioActual);

    if (!estaAnioActual) {
      this.lAnios.push(anioActual);
    }

    this.cboAnio.setValue(anioActual);
    this.sAnio = anioActual;

    this.fnListarNotasSalida();
    this.onToggleFab(1, -1)

  }

  //#region Listar Notas de Salida
  async fnListarAnios() {
    this.spinner.show('spiDialog');

    var pParametro = [];
    var pParametroDet = [];

    let data = await this.notasLogisticaService.fnControlNotaSalida(1, 2, pParametro, 25, pParametroDet, this.url) as string[];
    this.lAnios = data;

    this.spinner.hide('spiDialog');

  }

  fnSeleccionarAnio(sAnio) {
    this.sAnio = sAnio;
    this.fnListarNotasSalida();
  }
  
  async fnListarNotasSalida() {
    this.spinner.show('spiDialog');

    var pParametro = [];
    var pParametroDet = [];

    pParametro.push(this.nIdUsuario);
    pParametro.push(this.nIdEstado);
    pParametro.push(this.nIdEmpresa);
    pParametro.push(this.sAnio);


    await this.notasLogisticaService.fnControlNotaSalida(1, 2, pParametro, 1, pParametroDet, this.url)
      .then((value: any[]) => {

        this.listaNotaSalidaTableData = new MatTableDataSource(value);
        this.listaNotaSalidaTableData.paginator = this.listaNotaSalidaPaginator;
        this.listaNotaSalidaTableData.sort = this.listaNotaSalidaSort;
        this.spinner.hide('spiDialog');

        let filtro = "";

        if (this.txtFiltro.value == null) {
          return;
        }
        filtro = this.txtFiltro.value.trim();
        filtro = filtro.toLowerCase();
        this.listaNotaSalidaTableData.filter = filtro;
      },
        error => {
          console.log(error);
        });


  }

  fnNuevaNotaSalida = function () {
    this.vSecundario = true;

    this.verNotaEspecifica.emit(0);

    //this.vOpcion = 2; //Añadir partida
    this.pOpcion = 1  // envia al hijo que se esta aplicando una nueva nota
    //this.vFactura = 0;
    this.vPrincipal = false;
  }

  fnVerDetalle = function (nIdNotaSalida) {
    this.vPrincipal = false
    this.verNotaEspecifica.emit(0);
    this.vSecundario = true;
    this.nIdNotaSalida = nIdNotaSalida
    this.pOpcion = 3; //Opcion ver detalle

  }

  fnSalir = function () {
    this.vSecundario = false;
    this.vPrincipal = true;
    //this.fnListarNotasSalida();

  }

  eventTempF(resp) {

    if (resp == 1) {
      this.vSecundario = false;
      this.vPrincipal = true;
      this.fnListarNotasSalida();
      this.spinner.hide('spiDialog');
      this.verNotaEspecifica.emit(1);
    }
  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listaNotaSalidaTableData.filter = filterValue.trim().toLowerCase();

    if (this.listaNotaSalidaTableData.paginator) {
      this.listaNotaSalidaTableData.paginator.firstPage();
    }
  }


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
    this.fnListarNotasSalida();
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
        this.fnNuevaNotaSalida()
        break
      default:
        break
    }
  }
}
