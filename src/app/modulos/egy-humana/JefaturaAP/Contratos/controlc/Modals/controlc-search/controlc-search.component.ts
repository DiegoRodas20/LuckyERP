import { Component, Input, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ControlcService } from '../../../../Services/controlc.service';
import { ControlcDetailComponent } from '../controlc-detail/controlc-detail.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  detail: ControlcDetailComponent
};

@Component({
  selector: 'app-controlc-search',
  templateUrl: './controlc-search.component.html',
  styleUrls: ['./controlc-search.component.css', './controlc-search.component.scss']
})
export class ControlcSearchComponent implements OnInit {

  @Input() fromParent;

  //#region Variables

  // FormGroup
  fgSearch: FormGroup;

  // Mat Table
  searchDC: string[] = ['action', 'sNombres', 'sCodPlla', 'sDscTipo', 'sDocumento', 'dFechIni', 'dFechFin' ];
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

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              public service: ControlcService, private fb: FormBuilder,
              private _modalService: NgbModal) {

      this.new_fgSearch();
    }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_search');

    this.dFechDevengue = this.fromParent.dFechDevengue;

    await this.loadSearch();

    this.spi.hide('spi_search');

  }

  //#region General

  openModal(name: string) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'detail':
        obj['aItem'] = this.aItem;
        obj['dFechDevengue'] = this.dFechDevengue;
        modalRef.componentInstance.fromParent = obj;
        break;
    }

  }

  //#endregion

  //#region FormGroup

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

  //#endregion

  //#region Load

  async loadSearch() {

    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡A.nIdEmp!' + nIdEmp);

    await this.service._loadSP(10, param).then((value: any[]) => {

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
    this.aItem = element;
    this.openModal('detail');
    this.activeModal.dismiss();
  }

  //#endregion

}
