import { Component, Inject, OnInit, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  selector: 'app-historial-ubicacion',
  templateUrl: './historial-ubicacion.component.html',
  styleUrls: ['./historial-ubicacion.component.css'],
  animations: [asistenciapAnimations]
})
export class HistorialUbicacionComponent implements OnInit {
  abLista = [];
  tsLista = 'inactive'; 
  isEditar: boolean = true;
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  displayedColumns: string[] = ['ubicacion', 'fecha', 'usuario'];
  dataSource: any;
  ubicacionActual: string;
  articulo: any;
  formArticulo: FormGroup;
  mobile: any;
  public innerWidth: any;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<HistorialUbicacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.crearFormulario();
    this.inicializarFormulario(this.data.articulo);
    this.innerWidth = window.innerWidth;
    // this.ubicacionActual = this.data.codigoActual;
    if (this.innerWidth <= 768) {
      this.mobile = true;
      this.ubicacionActual = this.data.codigoActual.split('-')[0];
    } else {
      this.mobile = false;
      this.ubicacionActual = this.data.codigoActual;
    }
    this.dataSource = new MatTableDataSource(this.data.historial);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.onToggleFab(1, -1)
  }

  // Lo usamos para detectar cambios en la pantalla
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth <= 768) {
      this.mobile = true;
      this.ubicacionActual = this.data.codigoActual.split('-')[0];
    } else {
      this.mobile = false;
      this.ubicacionActual = this.data.codigoActual;
    }
  }

  crearFormulario() {
    this.formArticulo = this.fb.group({
      'nombreArticulo': [''],
      'codigoArticulo': [''],
      'codigoPresupuesto': ['']
    })
  }

  inicializarFormulario(articulo: any) {
    this.formArticulo.reset({
      'nombreArticulo': articulo.nombreArticulo,
      'codigoArticulo': articulo.codigoArticulo,
      'codigoPresupuesto': articulo.codigoPresupuesto
    })
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  

  salir() {
    this.dialogRef.close();
  }

}
