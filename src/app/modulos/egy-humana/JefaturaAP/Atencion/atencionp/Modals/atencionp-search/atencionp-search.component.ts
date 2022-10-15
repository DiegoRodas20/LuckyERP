import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AtencionpService } from '../../../../Services/atencionp.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { nsAtencionp } from '../../../../Model/Iatencionp';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-atencionp-search',
  templateUrl: './atencionp-search.component.html',
  styleUrls: ['./atencionp-search.component.css', './atencionp-search.component.scss'],
  providers: [AtencionpService]
})
export class AtencionpSearchComponent implements OnInit {

  @Input() fromParent;

  //#region Variables

  // Service GET && POST
  aParam = [];

  // FormGroup
  fgSearch: FormGroup;

  // Mat Table
  searchDC: string[] = ['action', 'sNombres', 'sCodPlla', 'sTipo', 'sDocumento', 'sCategoria'];
  searchDS: MatTableDataSource<nsAtencionp.SearchPerson>;
  @ViewChild('searchP', { static: true }) searchP: MatPaginator;
  @ViewChild(MatSort, { static: true }) tableSort: MatSort;

  // Progress Bar
  pbSearch: boolean;

  // Combobox
  cboEstado = new Array();

  //#endregion

  constructor(public activeModal: NgbActiveModal, private spi: NgxSpinnerService,
    private fb: FormBuilder, private atencionService: AtencionpService,
    private _snackBar: MatSnackBar) {

    this.new_fgSearch();
  }

  //#region FormGroup

  new_fgSearch() {
    this.fgSearch = this.fb.group({
      sNombres: '',
      sCategoria: ''
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

  async ngOnInit(): Promise<void> {

    this.spi.show('spi_search');

    await this.cboGetEstado();
    await this.loadSearch();

    this.spi.hide('spi_search');

  }

  //#region Combobox

  async cboGetEstado() {
    const param = [];
    param.push('0¡nElecodDad!2186');
    param.push('0¡bStatus!1');

    await this.atencionService._loadSP(7, param).then((value: any[]) => {
      this.cboEstado = value;
    });
  }

  returnEstado(nEstado: number): string {
    const iCbo = this.cboEstado.findIndex(x => x.nEleCod === nEstado);
    return (nEstado === 2187) ? 'Derivar' : this.cboEstado[iCbo].cEleNam;
  }

  //#endregion

  //#region Load

  async loadSearch() {

    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('1¡sCodPlla!1,2,3');

    await this.atencionService._loadSP(1, param).then((value: nsAtencionp.SearchPerson[]) => {

      this.searchDS = new MatTableDataSource(value);
      this.searchDS.paginator = this.searchP;
      this.searchDS.sort = this.tableSort;
      this.searchDS.filterPredicate = function (data: nsAtencionp.SearchPerson, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter) || data.sDocumento.trim().toLowerCase().includes(filter);
      };

      this.searchDS.filterPredicate = ((data: nsAtencionp.SearchPerson, filter: nsAtencionp.SearchPerson) => {
        // tslint:disable-next-line: max-line-length
        const a = !filter.sNombres || (data.sNombres.toLowerCase().includes(filter.sNombres.trim().toLowerCase()) || data.sDocumento.toLowerCase().includes(filter.sNombres.trim().toLowerCase()));
        const b = !filter.sCategoria || data.sCategoria.toLowerCase().includes(filter.sCategoria);
        return a && b;
      }) as (PeriodicElement, string) => boolean;

    });
  }

  selectPerso(item: nsAtencionp.SearchPerson) {
    const oReturn = new Object();

    oReturn['modal'] = 'search';
    oReturn['value'] = 'select';
    oReturn['item'] = item;

    this.activeModal.close(oReturn);
  }

  async transferPerso(item: nsAtencionp.SearchPerson) {

    if (item.nEstado === 2187) {

      this.atencionService.notification(item.nId, item.sNombres, 'Atencionp_To_ControlP');

      this.pbSearch = true;

      const user = localStorage.getItem('currentUser');
      const uid = JSON.parse(window.atob(user.split('.')[1])).uid;

      this.aParam.push('T1¡nIdUsuario!' + uid);
      this.aParam.push('T1¡nIdEnv!' + item.nId);
      this.aParam.push('T1¡dFecha!GETDATE()');
      this.aParam.push('T1¡nEstado!2188');

      this.aParam.push('W2¡nIdEnv!' + item.nId);
      this.aParam.push('S2¡nEstado!2188');

      await this.atencionService._crudAP(4, this.aParam);

      this.pbSearch = false;

      this._snackBar.open('Se derivó el personal seleccionado', 'Cerrar', {
        duration: 1000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      this.activeModal.dismiss();

    }

  }

  //#endregion

}
