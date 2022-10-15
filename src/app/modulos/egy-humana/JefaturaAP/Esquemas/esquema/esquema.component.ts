import { Component, ElementRef, OnInit, Type, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions, SecurityErp } from 'src/app/modulos/AAHelpers';
import { EsquemaColumn } from '../../Model/esquemas';
import { EsquemaAfpnetComponent } from './Modals/esquema-afpnet/esquema-afpnet.component';
import { EsquemaInfopersonalComponent } from './Modals/esquema-infopersonal/esquema-infopersonal.component';

const MODALS: { [name: string]: Type<any> } = {
  afpnet: EsquemaAfpnetComponent,
  infoper: EsquemaInfopersonalComponent
}

const MODALES = [
  { component: EsquemaAfpnetComponent, size: 'lg' },
  { component: EsquemaInfopersonalComponent, size: null }
]

@Component({
  selector: 'app-esquema',
  templateUrl: './esquema.component.html',
  styleUrls: ['./esquema.component.css']
})
export class EsquemaComponent implements OnInit {
  @ViewChild('container') containerHtml: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  storageData: SecurityErp = new SecurityErp();
  dataSource: MatTableDataSource<unknown>;
  cards = [
    { title: 'AFP Net', description: 'Declara fácil: Declaración y pago de IGV - Renta mensual, Agentes de retención y percepción.' },
    { title: 'Info del Personal', description: 'Búqueda rápida: Histótico de documentos de identidad, planillas, organización, domicilio.' },
  ];
  displayedColumns: string[];
  displayedColumnsHeader: string[] = [];
  displayedColumnsSubHeader: string[];
  cols: EsquemaColumn[];
  subcols: EsquemaColumn[];
  filterTemp: unknown;
  nroEsquema: number;
  widthTable: number = 0;

  constructor(
    private _modelService: NgbModal
  ) { }

  ngOnInit(): void {
  }

  get hideMessageEmpty(): boolean { return this.dataSource && this.dataSource.filteredData.length > 0 }
  get widthResponsive(): string { return this.widthTable > this.containerHtml?.nativeElement?.offsetWidth ? `${this.widthTable}px` : '100%' }

  openModal(index: number): NgbModalRef {
    let seleccionados = this.displayedColumnsHeader;
    if (this.nroEsquema && this.nroEsquema != index) {
      this.nroEsquema = index;
      seleccionados = [];
      this.filterTemp = null;
    }
    this.cols = [];
    const modal = this._modelService.open(MODALES[index].component, new ModalOptions(MODALES[index].size))
    modal.componentInstance.data = { 'nroEsquema': index, 'seleccionados': seleccionados, 'fgFilter': this.filterTemp };
    return modal;
  }

  clickAfp(index: number) {
    const modal = this.openModal(index);

    modal.result.then((result) => {
      if (result) {
        this.filterTemp = result.fgFilter;

        this.cols = result.fields;
        this.subcols = this.cols.filter(col => col.columns).reduce((a, b) => { a.push(...b.columns); return a }, []) as EsquemaColumn[];
        const allColumns = this.cols.reduce((a, b) => { b.columns ? a.push(...b.columns) : a.push(b); return a }, []) as EsquemaColumn[];

        this.widthTable = allColumns.reduce((a, b) => a + b.width, 0);
        this.displayedColumns = allColumns.map(col => col.field);
        this.displayedColumnsHeader = this.cols.map(col => col.field);
        this.displayedColumnsSubHeader = this.subcols.map(col => col.field);

        this.dataSource = new MatTableDataSource<unknown>(result.data);
        this.dataSource.paginator = this.paginator;
      }
    });

    // if (index == 0) {
    //   modal.result.then((result) => {
    //     if (result) {
    //       this.selectionTemp = [...result.fields];
    //       this.filterTemp = result.fgFilter;
    //       this.cols = this.permanentes.reduce((a, b) => { a.push(b); return a }, result.fields)
    //       this.displayedColumns = this.cols.map(col => col.field);
    //       this.nroEsquema = index;
    //       this.dataSource = new MatTableDataSource<unknown>(result.data);
    //       this.dataSource.paginator = this.paginator;
    //     }
    //   });
    // } else {
    //   modal.result.then((result) => {
    //     if (result) {
    //       this.nroEsquema = index;

    //       this.cols = result.fields;
    //       this.subcols = this.cols.filter(col => col.columns).reduce((a, b) => { a.push(...b.columns); return a }, []) as EsquemaColumn[];
    //       const allColumns = this.cols.reduce((a, b) => { b.columns ? a.push(...b.columns) : a.push(b); return a }, []) as EsquemaColumn[];

    //       this.widthTable = allColumns.reduce((a, b) => a + b.width, 0);
    //       this.displayedColumns = allColumns.map(col => col.field);
    //       this.displayedColumnsHeader = this.cols.map(col => col.field);
    //       this.displayedColumnsSubHeader = this.subcols.map(col => col.field);

    //       this.dataSource = new MatTableDataSource<unknown>(result.data);
    //       this.dataSource.paginator = this.paginator;
    //     }
    //   });
    // }
  }
}
