import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { DigidocService } from '../../../../Services/digidoc.service';

@Component({
  selector: 'app-digidoc-search',
  templateUrl: './digidoc-search.component.html',
  styleUrls: ['./digidoc-search.component.css', './digidoc-search.component.scss'],
  providers: [DigidocService]
})
export class DigidocSearchComponent implements OnInit {

  //#region Variables

  // FormGroup
  fgSearch: FormGroup;

  // Mat Table
  searchDC: string[] = ['action', 'sNombres', 'sCodPlla', 'sTipo', 'sDocumento', 'sCiudad'];
  searchDS: MatTableDataSource<any> = new MatTableDataSource([]);
  @ViewChild('searchP', { static: true }) searchP: MatPaginator;
  @ViewChild(MatSort, { static: true }) tableSort: MatSort;

  // Combobox
  cboPlanilla = new Array();
  cboCiudad = new Array();

  // Progress Bar
  pbSearch: boolean;

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
              private fb: FormBuilder, private service: DigidocService) {

    this.new_fgSearch();

  }

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_search');

    await this.cboGetPlanilla();
    await this.cboGetCiudad();
    await this.loadSearch();

    this.spi.hide('spi_search');
  }

  //#region ComboBox

  async cboGetPlanilla () {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 3, param).then( (value: any[]) => {
      this.cboPlanilla = value;
    });
  }

  async cboGetCiudad () {
    const param = [];
    param.push('0¡nDadTipEle!694');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 4, param).then( (value: any[]) => {
      this.cboCiudad = value;
    });
  }

  //#endregion

  //#region FormGroup

  new_fgSearch() {
    this.fgSearch = this.fb.group({
      sNombres: '',
      sCodPlla: '',
      sCiudad: ''
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

    await this.service._loadSP(5, param).then((value: any[]) => {

      this.searchDS = new MatTableDataSource(value);
      this.searchDS.paginator = this.searchP;
      this.searchDS.sort = this.tableSort;
      this.searchDS.filterPredicate = function (data: any, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
      };

      this.searchDS.filterPredicate = ((data: any, filter: any) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || (data.sNombres.toLowerCase().includes(filter.sNombres.trim().toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.trim().toLowerCase()));
        const b = !filter.sCodPlla || data.sCodPlla.toLowerCase().includes(filter.sCodPlla);
        const c = !filter.sCiudad || data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());
        return a && b && c;
      }) as (PeriodicElement, string) => boolean;

    });
  }

  selectPerso(item: any) {
    const oReturn = new Object();

    oReturn['modal'] = 'search';
    oReturn['value'] = 'select';
    oReturn['item'] = item;

    this.activeModal.close(oReturn);
  }

  //#endregion

}
