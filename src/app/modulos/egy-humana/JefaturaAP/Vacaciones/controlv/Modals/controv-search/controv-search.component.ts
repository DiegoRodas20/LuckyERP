import { Component, Input, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ControlvService } from '../../../../Services/controlv.service';
import { ControvDetalleComponent } from '../controv-detalle/controv-detalle.component';


const MODALS: { [name: string]: Type<any> } = {
  detail: ControvDetalleComponent
};

@Component({
  selector: 'app-controv-search',
  templateUrl: './controv-search.component.html',
  styleUrls: ['./controv-search.component.css', './controv-search.component.scss']
})


export class ControvSearchComponent implements OnInit {
  @Input() fromParent;

  //#region Variables

  // FormGroup
  fgSearch: FormGroup;

  // Mat Table
  searchDC: string[] = ['action', 'sNombres', 'sCodPlla', 'sDscTipo', 'sDocumento', 'dFechIni', 'dFechFin'];
  searchDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('pagSearch', { static: true }) pagSearch: MatPaginator;

  // Progress Bar
  pbSearch: boolean;

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // Parent
  aItem: any;
  dFechDevengue: Date = null;

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
    public service: ControlvService, private fb: FormBuilder,
    private _modalService: NgbModal) {

    this.new_fgSearch();
  }
 
  async ngOnInit(): Promise<void> {

    this.spi.show('spi_search');
    await this.loadSearch();
    this.spi.hide('spi_search');

  }

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'detail':
        obj['data'] = this.aItem;
        obj['tipo'] = 2;
        modalRef.componentInstance.fromParent = obj;
        break;
    }

  }

  new_fgSearch() {
    this.fgSearch = this.fb.group({
      sNombres: ''
    });

    this.fgSearch.valueChanges.subscribe(value => {
      const filter = { ...value, name: value.sNombres } as string;
      this.searchDS.filter = filter;

      if (this.searchDS.paginator) {
        this.searchDS.paginator.firstPage();
      }
    });
  }

  get getSearch() { return this.fgSearch.controls; }

  async loadSearch() {

    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡A.nIdEmp!' + nIdEmp);

    await this.service._loadTodoPersonal(10, param).then((value: any[]) => {

      this.searchDS = new MatTableDataSource(value);
      this.searchDS.paginator = this.pagSearch;
      this.searchDS.filterPredicate = function (data, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
      };

      this.searchDS.filterPredicate = ((data: any, filter: any) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || (data.sNombres.toLowerCase().includes(filter.sNombres.trim().toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.trim().toLowerCase()));
        return a;
      }) as (PeriodicElement, string) => boolean;

    });
  }

  viewDetail(element: any) {
    // debugger

    this.aItem = element;
    this.openModal('detail');
    this.activeModal.dismiss();
  }

}
