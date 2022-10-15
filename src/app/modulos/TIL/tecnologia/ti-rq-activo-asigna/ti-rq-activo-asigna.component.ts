import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { RequerimientoHerramientaTableDTO } from '../api/models/requerimientoHerramienta.model';
import { RequerimientoHerramientaService } from '../api/services/requerimiento-herramienta.service';

@Component({
  selector: 'app-ti-rq-activo-asigna',
  templateUrl: './ti-rq-activo-asigna.component.html',
  styleUrls: ['./ti-rq-activo-asigna.component.css'],
  animations: [asistenciapAnimations]
})
export class TiRqActivoAsignaComponent implements OnInit {


  listaAnio: string[] = [];
  sAnio: string = '';

  opciones: { nNumero: number, sDescripcion: string }[] =
    [
      { nNumero: 0, sDescripcion: 'Todos' },
      { nNumero: 2051, sDescripcion: 'Pendiente' },
      { nNumero: 2052, sDescripcion: 'Enviado' },
      { nNumero: 2053, sDescripcion: 'Aprobado Comercial' },
      { nNumero: 2055, sDescripcion: 'Aprobado Presupuestos' },
    ];

  // Controles
  rbEstado = new FormControl();
  cboAnio = new FormControl();
  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables de ayuda
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada

  // Mat-Table
  dataSource: MatTableDataSource<RequerimientoHerramientaTableDTO>;
  listaRequerimientos: RequerimientoHerramientaTableDTO[] = [];
  displayedColumns: string[] = ["nIdOpcion", "sCentroCosto", "sNumero", "sTitulo", "sSolicitante", "dFechaEnvio", "nTotal", "sEstado"];
  @ViewChild('paginator') paginatorActivo: MatPaginator;
  @ViewChild(MatSort, { static: false }) public sortActivo: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  // Botones
  tsLista = 'inactive';
  fbLista = [
    { icon: 'add', tool: 'Crear Requerimiento', state: true },
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  constructor(
    private spinner: NgxSpinnerService,
    private route: Router,
    private _requerimientoHerramientaService: RequerimientoHerramientaService
  ) {

    // Inicializar tablas
    this.dataSource = new MatTableDataSource(this.listaRequerimientos);
  }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1, -1);

    this.fnControlFab();
    await this.GetAnios();
    let anioActual = moment().year().toString()
    let estaAnioActual = this.listaAnio.find(item => item == anioActual)
    if (!estaAnioActual) {
      this.listaAnio.push(anioActual);
    }

    this.cboAnio.setValue(anioActual);
    this.sAnio = anioActual;
    this.rbEstado.setValue(0);

    await this.GetAll(0) //Todos
    this.estaCargado = true;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginatorActivo;
    this.dataSource.sort = this.sortActivo;
  }

  async GetAll(nIdEstado: number) {
    this.spinner.show();

    let response = await this._requerimientoHerramientaService.GetAll(
      Number(this.storageData.getEmpresa()),
      nIdEstado,
      Number(this.storageData.getUsuarioId()),
      this.sAnio
    );

    this.spinner.hide();

    this.listaRequerimientos = response.response.data
    this.fnLlenarTabla();
  }

  async GetAnios() {
    this.spinner.show();

    let response = await this._requerimientoHerramientaService.GetAnios();

    this.spinner.hide();

    this.listaAnio = response.response.data
  }

  fnVerDetalle(row: RequerimientoHerramientaTableDTO) {
    this.route.navigate(['til/tecnologia/ti-RqActivo-Asigna/requerimiento', row.nIdRq]);
  }
  //#region Botones

  // Metodo para abrir/cerrar menu de botones
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  // Metodo para utilizar las funciones del menu de botones
  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnCrearRequerimiento();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab() {
    this.fbLista[0].state = true;
    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Tabla Activos

  // Llenado de la tabla Activos
  async fnLlenarTabla() {

    try {
      //const result = await this._activoService.GetAll(tipoActivo, estadoActivo);
      //this.listaActivos = result.response.data;
      this.dataSource.data = this.listaRequerimientos;
      this.dataSource.paginator = this.paginatorActivo;
      this.dataSource.sort = this.sortActivo;
      // Primera pagina
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
    catch (err) {
      console.log(err);
    }

  }

  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async fnReiniciarFiltro() {

    this.spinner.show();

    // Limpiar el filtro
    this.txtFiltro.setValue('');
    this.dataSource.filter = '';

    // Llenar nuevamente la tabla
    await this.fnLlenarTabla();

    this.spinner.hide();
  }

  fnVerImagen(row: any) {
    if (row.sRutaArchivo != null && row.sRutaArchivo != '') {

      // Obtenemos el codigo y el nombre del articulo
      const descripcionArticulo = row.sDescripcion;
      const codigoArticulo = descripcionArticulo.split(' ')[0];
      const nombreArticulo = descripcionArticulo.slice(codigoArticulo.length + 2, descripcionArticulo.length);

      Swal.fire({ title: codigoArticulo, text: nombreArticulo, imageUrl: row.sRutaArchivo, imageHeight: 250 });
    }
    else {
      Swal.fire({ icon: 'warning', title: ('No hay imagen'), text: `Este artículo no tiene imagen` });
    }
  }

  //#endregion

  //#region Controles

  //#endregion

  //#region Detalle Activo

  fnCrearRequerimiento() {
    this.route.navigate(['til/tecnologia/ti-RqActivo-Asigna/requerimiento']);
  }

  cambioAnio(sAnio: string) {
    this.sAnio = sAnio;
    this.GetAll(this.rbEstado.value)
  }
  //#endregion
}
