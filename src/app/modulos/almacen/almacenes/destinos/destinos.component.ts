import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { AlmacenesService } from '../almacenes.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { MatDialog } from '@angular/material/dialog';
import { DialogDetalleDestinoComponent } from './dialog-detalle-destino/dialog-detalle-destino.component';
import { MatSort } from '@angular/material/sort';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-destinos',
  templateUrl: './destinos.component.html',
  styleUrls: ['./destinos.component.css'],
  animations: [asistenciapAnimations]
})
export class DestinosComponent implements OnInit {
  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  idPais: any;
  isDetalle: boolean = false; // Esto indica si estamos en la vista de cabecera o detalle;
  // Variables Tabla Cabecera
  txtFiltro = new FormControl();
  displayedColumns: string[] = ['opciones', 'codigo', 'descripcion', 'nombreComercial','tipo', 'departamento','distrito'];
  listaDireccionDestinoCabecera: any;
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  /////////////////////////////////////////////
  cabecera: any;
  constructor(private cdRef: ChangeDetectorRef, private dialog: MatDialog,private almacenService: AlmacenesService, private spinner: NgxSpinnerService) { }

  async ngOnInit() {
    this.spinner.show();
    this.idPais = localStorage.getItem('Pais');
    this.listaDireccionDestinoCabecera = await this.almacenService.obtenerInformacionDireccionDestino(1,`${this.idPais}|`);
    this.llenarCabecera(this.listaDireccionDestinoCabecera);
    this.spinner.hide();
  }

  async llenarCabecera(listaDireccionDestino) {
    this.dataSource = new MatTableDataSource(listaDireccionDestino);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // this.cdRef.detectChanges();
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async clean() {
    if(this.dataSource) {
      this.dataSource.filter = '';
    }
    this.txtFiltro.setValue('');
    this.spinner.show();
    this.listaDireccionDestinoCabecera = await this.almacenService.obtenerInformacionDireccionDestino(1,`${this.idPais}|`);
    this.llenarCabecera(this.listaDireccionDestinoCabecera);
    this.spinner.hide();
  }

  verDetalle(direccion) {
    this.cabecera = direccion;
    this.isDetalle = true;
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  async salir(event) {
    this.isDetalle = false;
    await this.clean();
  }

  

}
