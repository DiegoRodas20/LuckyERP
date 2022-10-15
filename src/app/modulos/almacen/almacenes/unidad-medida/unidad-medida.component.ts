import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AlmacenesService } from '../almacenes.service';
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { AgregarUnidadMedidaComponent } from './components/agregar-unidad-medida/agregar-unidad-medida.component';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';


@Component({
  selector: 'app-unidad-medida',
  templateUrl: './unidad-medida.component.html',
  styleUrls: ['./unidad-medida.component.css'],
  animations: [asistenciapAnimations]
})

export class UnidadMedidaComponent implements OnInit {

  tsLista = 'active';  // Inicia la lista oculta
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'note_add', tool: 'Agregar Almacen' }
  ];
  abLista = [];

  displayedColumns: string[] = [ 'opciones', 'codigo', 'descripcion', 'codigoInterno', 'descripcionInterna'];
  // dataSource = new MatTableDataSource(ELEMENT_DATA);
  txtFiltro = new FormControl();
  listaUnidadMedida: any;
  dataSource: any;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort , {static: false}) sort: MatPaginator;
  constructor(private dialog: MatDialog,private almacenService: AlmacenesService, private spinner: NgxSpinnerService) { }

  async ngOnInit() {
    this.spinner.show();
    this.listaUnidadMedida = await this.almacenService.listarInformacionUnidadMedida(1,'');
    this.llenarTablaUnidadMedida(this.listaUnidadMedida);

    this.onToggleFab(1, -1)
    this.spinner.hide();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clean() {
    if(this.dataSource) {
      this.dataSource.filter = '';
    }
    this.txtFiltro.setValue('');
    
  }

  async llenarTablaUnidadMedida(listaUnidadMedida) {
    this.dataSource = new MatTableDataSource(listaUnidadMedida);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  agregarAlmacen() {
    const dialogRef = this.dialog.open(AgregarUnidadMedidaComponent, {
      width: '70%',
      height: '50%',
      data: {
        'tipo': 0,
        'data': ''
      }
    });
    dialogRef.afterClosed().subscribe( async result => {
      if(result) {
        const tipo = result.tipo;
        const body = result.body;
        const parametro = `${body.sCodUndMedida}|${body.sDescripcion}|${body.nCodInter}|${body.sDescripInter}`;
        const resp = await this.almacenService.insertOrUpdateUnidadMedida(1,parametro);
        if(resp === 1) {
          Swal.fire({
            title: 'La unidad de medida se creo de manera exitosa',
            icon: 'success',
            timer: 1500
          })
          this.listaUnidadMedida.push(body);
          this.llenarTablaUnidadMedida(this.listaUnidadMedida);
        } else {
          Swal.fire({
            title: 'Hubo un incoveniente, comuniquese con sistemas por favor',
            icon: 'warning',
            timer: 1500
          })
        }
      }
    })
  }

  editarUnidadMedida(element) {
    const dialogRef = this.dialog.open(AgregarUnidadMedidaComponent, {
      width: '70%',
      height: '50%',
      data: {
        'tipo': 1,
        'data': element
      }
    });
    dialogRef.afterClosed().subscribe( async result => {
      if(result) {
        const tipo = result.tipo;
        const body = result.body;
        const parametro = `${element.nIdUndMedida}|${body.sCodUndMedida}|${body.sDescripcion}|${body.nCodInter}|${body.sDescripInter}`;
        const resp = await this.almacenService.insertOrUpdateUnidadMedida(2,parametro);
        if(resp === 1) {
          Swal.fire({
            title: 'La unidad de medida se actualizó de manera exitosa',
            icon: 'success',
            timer: 1500
          })
          this.listaUnidadMedida.map(item => {
            if(item.nIdUndMedida === element.nIdUndMedida) {
              item.sCodUndMedida = body.sCodUndMedida;
              item.sDescripcion = body.sDescripcion;
              item.nCodInter = body.nCodInter;
              item.sDescripInter = body.sDescripInter;
            }
            return item;
          })
        } else {
          Swal.fire({
            title: 'Hubo un incoveniente, comuniquese con sistemas por favor',
            icon: 'warning',
            timer: 1500
          })
        }
      }
    })
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
        this.agregarAlmacen()
        break
      default:
        break
    }
  }

}
