import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivoHistorialAsignacionDTO } from '../../api/models/activoDTO';
import { ActivoService } from '../../api/services/activo.service';
import { AsignacionDirectaService } from '../../api/services/asignacion-directa.service';
import { TiAsignacionDialogCrearActivoComponent } from '../ti-ingreso-inventario-detalle-inventario/ti-asignacion-dialog-crear-activo/ti-asignacion-dialog-crear-activo.component';
import { TiActivoObservacionesAsignacionComponent } from './ti-activo-observaciones-asignacion/ti-activo-observaciones-asignacion.component';

@Component({
  selector: 'app-ti-activo-asignacion-historial',
  templateUrl: './ti-activo-asignacion-historial.html',
  styleUrls: ['./ti-activo-asignacion-historial.css']
})
export class TiActivoAsignacionHistorialComponent implements OnInit {

  // Mat-Table
  dataSource: MatTableDataSource<ActivoHistorialAsignacionDTO>;
  listaActivos: ActivoHistorialAsignacionDTO[] = [];
  displayedColumns: string[] = ["nIdDetActivoAsigna", "sEmpresa", "sUsuarioAsignado", "sObservacion", "sEstado", "sImporte", "sUsuarioEntrega", "dFechaEntrega", "sUsuarioDevolucion", "dFechaDevolucion"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla
  pipeTable: DatePipe;

  // Activo
  nIdActivo: Number;

  constructor(
    private spinner: NgxSpinnerService,
    private activoService: ActivoService,
    private _asignacionDirectaService: AsignacionDirectaService,
    public dialogRef: MatDialogRef<TiActivoAsignacionHistorialComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog, // Declaracion del Dialog
  ) {

    // Inicializar tabla
    this.dataSource = new MatTableDataSource(this.listaActivos);

    // Guardamos el id del activo
    this.nIdActivo = data.nIdActivo;

    // Dar formato a los dias
    this.pipeTable = new DatePipe('en');
    const defaultPredicate= this.dataSource.filterPredicate;
    this.dataSource.filterPredicate = (data, filter) =>{
      const formattedEntrega = this.pipeTable.transform(data.dFechaEntrega,'dd/MM/yyyy');
      const formattedAsignacion = this.pipeTable.transform(data.dFecha,'dd/MM/yyyy');
      if(formattedEntrega) 
        return formattedEntrega.indexOf(filter) >= 0 || formattedEntrega.indexOf(filter) >= 0 || defaultPredicate(data,filter);
      else 
        return formattedAsignacion.indexOf(filter) >= 0 || defaultPredicate(data,filter);
    }
  }

  async ngOnInit(): Promise<void> {

    await this.fnLlenarTabla();

    this.spinner.hide();

  }

  // Filtrado de la tabla
  async fnLlenarTabla(){

    try{
      const result = await this.activoService.GetHistorialAsignacionPorActivo(this.nIdActivo);
      this.listaActivos = result.response.data;
      this.dataSource.data = this.listaActivos;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      // Primera pagina
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
    catch(err){
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

  async fnReiniciarFiltro(){
    this.spinner.show();

    // Limpiar el filtro
    this.txtFiltro.setValue('');
    this.dataSource.filter = '';

    // Llenar nuevamente la tabla
    await this.fnLlenarTabla();

    this.spinner.hide();
  }

  async fnVerObservaciones(row: ActivoHistorialAsignacionDTO){

    this.spinner.show();

    const observaciones = await this.fnListarObservaciones(row.nIdDetActivoAsigna);

    const dialogRef = this.dialog.open(TiAsignacionDialogCrearActivoComponent, {
      width: '1250px',
      autoFocus: false,
      disableClose: true,
      data: {
        nIdPersonal: row.nIdPersonal, // Id del colaborador seleccionado al que se le asigna el activo
        registroActual: row, // Asignacion que se está editando
        observaciones: observaciones,
        vistaTotal: true,
        estaEditando: false, // Se puede editar en el dialog si este flag esta activado
        estaDevolviendo: false, // Verificar si se esta editando para devolver
      }
    });

    dialogRef.beforeClosed().subscribe(async result => {
      
    });

  }

  async fnListarObservaciones(nIdDetActivoAsigna){

    const result = await this._asignacionDirectaService.GetObservacionesByAsignacion(nIdDetActivoAsigna);

    if(result.success){
      return result.response.data;
    }
    else{
      return [];
    }
  }

  fnSalir(){
    this.dialogRef.close();
  }

}
