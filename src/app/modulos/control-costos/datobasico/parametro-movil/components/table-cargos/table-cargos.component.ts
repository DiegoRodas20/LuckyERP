import { Component, OnInit, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, DoCheck, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CuentasCargoComponent } from '../cuentas-cargo/cuentas-cargo.component';
import { DialogTopePersonaComponent } from '../dialog-tope-persona/dialog-tope-persona.component';
import { FormGroup } from '@angular/forms';
import { ParametroService } from '../../../parametro.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogTopeCargoEditComponent } from '../dialog-tope-cargo/dialog-tope-cargo-edit/dialog-tope-cargo-edit.component';
import { DialogCuentaCargoClienteComponent } from '../cuentas-cargo/dialog-cuenta-cargo-cliente/dialog-cuenta-cargo-cliente.component';
import Swal from 'sweetalert2';
export interface UserData {
  cargo: string;
  descripcion: string;
  diario: string;
  mensual: string;
  noAplica: string;
}

const COLORS: string[] = [
  'maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple', 'fuchsia', 'lime', 'teal',
  'aqua', 'blue', 'navy', 'black', 'gray'
];
const NAMES: string[] = [
  'Maia', 'Asher', 'Olivia', 'Atticus', 'Amelia', 'Jack', 'Charlotte', 'Theodore', 'Isla', 'Oliver',
  'Isabella', 'Jasper', 'Cora', 'Levi', 'Violet', 'Arthur', 'Mia', 'Thomas', 'Elizabeth'
];


@Component({
  selector: 'app-table-cargos',
  templateUrl: './table-cargos.component.html',
  styleUrls: ['./table-cargos.component.css']
})
export class TableCargosComponent implements OnInit, OnChanges, DoCheck ,AfterViewInit {
  @Input() lista: any[];
  @Input() tipoLista;
  @Output() tipoAction: EventEmitter<any>;
  @Output() addButtonAction: EventEmitter<any>
  @Output() cleanSearch: EventEmitter<any>;
  // displayedColumns: string[] = ['opciones','cargo', 'descripcion', 'diario', 'mensual', 'aplica'];
  displayedColumns: string[];
  dataTemp: any;
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(public dialog: MatDialog, private parametroService: ParametroService, private spinner: NgxSpinnerService, private cdRef: ChangeDetectorRef) {
    this.tipoAction = new EventEmitter();
    this.addButtonAction = new EventEmitter();
    this.cleanSearch = new EventEmitter();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if ( this.tipoLista === 4 ) {
      this.displayedColumns = ['opciones', 'cargo', 'descripcion', 'diario', 'mensual'];
    } else {
      this.displayedColumns = ['opciones', 'cargo', 'descripcion', 'diario', 'mensual', 'aplica'];
    }
    this.dataSource = new MatTableDataSource(this.lista);
    this.cdRef.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.dataTemp = this.dataSource.data.length;
    this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
  }

  ngDoCheck(): void {
    if( this.lista ) {
      if ( this.dataTemp !== this.lista.length ) {
        this.dataSource = new MatTableDataSource(this.lista);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataTemp = this.dataSource.data.length;
      }
    }
  }

  ngAfterViewInit() {
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async verDetalle(data) {
    let diario;
    let mensual;
    // Tipo List == 1 ? Cargo : Persona
    if (this.tipoLista === 1 || this.tipoLista === 2) {
      const dialogRef = this.dialog.open(DialogTopeCargoEditComponent, {
        width: '85%',
        height: '80%',
        data: data
      });
      dialogRef.afterClosed().subscribe(result => {
        if ( result ) {
          console.log('DATA',result);
          const formulario = result as FormGroup;
          const id = formulario.get('id').value ;
          const topediario = formulario.get('diario').value;
          const topeMensual = formulario.get('mensual').value;
          const nAplica = formulario.get('aplica').value;
          const send = `${id}|${topediario}|${topeMensual}|${nAplica}`;
          this.parametroService.insertOrUpdateParametrosMovil(1, send).then((resp) => {
            console.log(resp);
            this.lista.map( resp2 => {
              if(resp2.nId === data.nId){
                resp2.diario =  topediario;
                resp2.mensual = topeMensual;
                resp2.bAplica = nAplica;
              }
              return resp2;
            })
          });
        }
      });
    } else if ( this.tipoLista === 3) {
      const dialogRef = this.dialog.open(DialogTopePersonaComponent, {
        width: '85%',
        height: '80%',
        data: data
      });
      dialogRef.afterClosed().subscribe(result => {
        if ( result ) {
          const formulario = result as FormGroup;
          console.log('DATA',result);
          const id = formulario.get('id').value ;
          const topediario = formulario.get('diario').value;
          const topeMensual = formulario.get('mensual').value;
          const nAplica = formulario.get('aplica').value;
          const send = `${id}|${topediario}|${topeMensual}|${nAplica}`;
          this.spinner.show();
          this.parametroService.insertOrUpdateParametrosMovil(1, send).then((resp) => {
            console.log(resp);
            this.lista.map( resp2 => {
              if(resp2.nId === data.nId){
                resp2.diario =  topediario;
                resp2.mensual = topeMensual;
                resp2.bAplica = nAplica;
              }
              return resp2;
            })
          });
          this.spinner.hide();
        }
      });
    } else if( this.tipoLista === 4) {
      console.log('GG CSMA');
      // console.log('data',data);
      const dialogRef = this.dialog.open(DialogCuentaCargoClienteComponent, {
        width: '85%',
        height: '80%',
        data: data,
      });
      dialogRef.afterClosed().subscribe(result => {
        if ( result ) {
          console.log(result);
          console.log(data);
          const formulario = result as FormGroup;
          const nIdDetMovCli = data.nIdDetMovCli;
          const topediario = formulario.get('diario').value;
          const topeMensual = formulario.get('mensual').value;
          const send = `${nIdDetMovCli}|${topediario}|${topeMensual}`;
          this.parametroService.insertOrUpdateParametrosMovil(6, send).then((resp) => {
            console.log(resp);
            this.lista.map( resp2 => {
              if(resp2.nIdDetMovCli === nIdDetMovCli){
                resp2.diario =  topediario;
                resp2.mensual = topeMensual;
              }
              return resp2;
            })
          });
          // this.spinner.show();
          // this.spinner.hide();
        }
      });
    }
  }


  editar(data) {
    const dialogRef = this.dialog.open(CuentasCargoComponent, {
      width: '95%',
      height: '80%',
      data: data
    });
    dialogRef.afterClosed().subscribe(result => {
      if ( result ) {
        //console.log(result);
      }
    });
  }

  async eliminar(data) {
    //console.log('Eliminar', data);
    const lista: any = await this.parametroService.obtenerParametrosCRUD(7, `${data.nId}|`);
    //console.log('listacliente', lista);
    //console.log('size', lista.length);
    if (lista.length === 0){
      const resp = await this.parametroService.insertOrUpdateParametrosMovil(8, `${data.nId}`);
      if ( resp === 1) {
        await Swal.fire({
          title: '¿Estás seguro?',
          text: "¿Desea eliminar el Cargo de la relación del tope para movilidad?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, eliminar',
          cancelButtonText: 'Cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            const respFinal = await this.parametroService.insertOrUpdateParametrosMovil(8, `${data.nId}`);
            if (respFinal === 1) {
              await Swal.fire({
                icon: 'success',
                title: 'Se elimino de manera exitosa',
                showConfirmButton: false,
                timer: 1500
              });
            }
            this.lista = this.lista.filter(item => item.nId !== data.nId);
          }
        });
      }
    } else {
      await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Desea eliminar el Cargo de la relación del tope para movilidad? También se eliminará la relación del cargo con el cliente',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const respFinal = await this.parametroService.insertOrUpdateParametrosMovil(8, `${data.nId}`);
          if (respFinal === 1) {
            await Swal.fire({
              icon: 'success',
              title: 'Se elimino de manera exitosa',
              showConfirmButton: false,
              timer: 1500
            });
            this.lista = this.lista.filter(item => item.nId !== data.nId);
          }
        }
      });
    }
    // console.log(resp);
  }

  addButton() {
    // Agregar personal
    switch (this.tipoLista) {
      case 1: // Cargos de sucursales principales
        this.addButtonAction.emit(1);
        break;
      case 2: // Cargos de sucursales secundarias
        this.addButtonAction.emit(2);
        break;
      case 3: // Personas
        this.addButtonAction.emit(3);
        break;
      case 4:
        this.addButtonAction.emit(4);
        break;
      default:
        break;
    }
  }

  limpiar() {
    this.cleanSearch.emit(1);
  }
}