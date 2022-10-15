import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { AddendaUnoTIDTO, DetalleAddendaDetalleTableTIDTO, DetalleAddendaTableTIDTO } from '../../../api/models/addendaTIDTO';
import { AddendaService } from '../../../api/services/addenda.service';

@Component({
  selector: 'app-ti-addenda-detalle-activos',
  templateUrl: './ti-addenda-detalle-activos.component.html',
  styleUrls: ['./ti-addenda-detalle-activos.component.css']
})
export class TiAddendaDetalleActivosComponent implements OnInit {

  // Mat-Table
  dataSource: MatTableDataSource<DetalleAddendaDetalleTableTIDTO>;
  listaDetalleArticuloAddenda: DetalleAddendaDetalleTableTIDTO[] = [];
  displayedColumns: string[] = ['sEquipo', 'sSerie', 'sFechaAsignacion', 'sEstado', 'sUsuarioAsignado', 'dFechaRemplazo', 'sEquipoNuevo', 'sSerieNueva'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla
  pipeTable: DatePipe;

  // Activo
  nIdDetAddenda: number;

  // Formulario
  formIngresoInventario: FormGroup;

  
  constructor(
    private spinner: NgxSpinnerService,
    private _addendaService: AddendaService,
    public dialogRef: MatDialogRef<TiAddendaDetalleActivosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
  ) {
    // Inicializar tabla
    this.dataSource = new MatTableDataSource(this.listaDetalleArticuloAddenda);

    // Crear formulario
    this.fnCrearFormulario();

    // Guardamos el id del activo
    this.nIdDetAddenda = data.detalleAddenda.nIdDetAddenda;

    // Dar formato a los dias
    this.pipeTable = new DatePipe('en');
    const defaultPredicate= this.dataSource.filterPredicate;
    this.dataSource.filterPredicate = (data, filter) =>{
      //const formattedAsignacion = this.pipeTable.transform(data.dFechaAsignacion,'dd/MM/yyyy');
      const formattedReemplazo = this.pipeTable.transform(data.dFechaRemplazo,'dd/MM/yyyy');
      if(formattedReemplazo) 
        return formattedReemplazo.indexOf(filter) >= 0 || defaultPredicate(data,filter);// || formattedAsignacion.indexOf(filter) >= 0 ;
      else 
        return defaultPredicate(data,filter); //formattedAsignacion.indexOf(filter) >= 0 || 
    }
  }

  async ngOnInit(): Promise<void> {

    await this.fnLlenarTabla();
    await this.fnLlenarDetalleCabecera();

    this.spinner.hide()
  }

  //#region Formulario

  fnCrearFormulario(){
    this.formIngresoInventario = this.fb.group({
      addenda: null,
      cantidadEquipos: null,
      tipoActivo: null,
      fechaInicio: null,
      fechaFin: null,
    })
  }

  //#endregion

  //#region Cabecera

  fnLlenarDetalleCabecera(){

    // Informacion Addenda
    const { sNumero, sFechaInicio, sFechaFin }: AddendaUnoTIDTO = this.data.addenda;
    // Informacion detalle addenda (Articulo)
    const { nCantidad, sTipoActivo }: DetalleAddendaTableTIDTO = this.data.detalleAddenda;
    
    this.formIngresoInventario.patchValue({
      addenda: sNumero,
      cantidadEquipos: nCantidad,
      tipoActivo: sTipoActivo,
      fechaInicio: moment(sFechaInicio, 'DD/MM/YYYY'),
      fechaFin: moment(sFechaFin, 'DD/MM/YYYY'),
    });
  }
  
  //#endregion

  //#region Tabla

  // Filtrado de la tabla
  async fnLlenarTabla(){

    try{
      //debugger;
      const result = await this._addendaService.GetAllDetalleForArticulo(this.nIdDetAddenda);
      this.listaDetalleArticuloAddenda = result.response.data;
      this.dataSource.data = this.listaDetalleArticuloAddenda;
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

  //#endregion

}
