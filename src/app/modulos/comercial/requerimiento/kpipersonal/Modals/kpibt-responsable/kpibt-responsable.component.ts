import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { KpiiService } from '../../kpibonotrimestral/kpibonotrimestral.service';
import { nsIncentivo } from '../../../model/Ikpii';
import { kpiiAnimations } from './kpibt-responsable.animations';

@Component({
  selector: 'app-kpibt-responsable',
  templateUrl: './kpibt-responsable.component.html',
  styleUrls: ['./kpibt-responsable.component.css' , './kpibt-responsable.component.scss'],
  animations: [kpiiAnimations],
  providers : [KpiiService],
})
export class KpibtResponsableComponent implements OnInit {

  @Input() fromParent;
  fgResp: FormGroup;
  fgInfoUser: FormGroup;

  mIncentivo: number;

  selectResp: nsIncentivo.IListaResp;
  editTable: nsIncentivo.IIncentivo;

  url: string;

  IncentivoDC: string[] = ['sPersoImg', 'sNombres', 'nNeto', 'nBruto', 'action'];
  IncentivoDS: MatTableDataSource<nsIncentivo.IIncentivo> = new MatTableDataSource([]);

  ResponsableDC: string[] = ['sPersoImg', 'sNombres'];
  ResponsableDS: MatTableDataSource<nsIncentivo.IListaResp> = new MatTableDataSource([]);
  @ViewChild('pagResp', {static: false}) pagResp: MatPaginator;

  pbResp: boolean;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder,@Inject('BASE_URL') baseUrl: string,
     private spi: NgxSpinnerService, public service: KpiiService, private _snackBar: MatSnackBar ) {
      this.url = baseUrl;
      this.new_fgResp();
      this.new_fgInfoUser();
    }

    //#region
    new_fgResp() {
      this.fgResp = this.fb.group({
        sNombres: null
      });
      this.fgResp.valueChanges.subscribe( value => {
        if (value.sNombres !== null) {
          const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
          this.ResponsableDS.filter = filter;
          if (this.ResponsableDS.paginator) {
            this.ResponsableDS.paginator.firstPage();
          }
        }
      });
    }

  new_fgInfoUser() {
    this.fgInfoUser = this.fb.group({
      nIdPersonal: 0,
      sNombres: '',
      sTipo: '',
      sDocumento: '',
    });
  }
    //#endregion
    get getInfoUser() { return this.fgInfoUser.controls; }
    get getResp() { return this.fgResp.controls; }

    async cleanModal(opc: number) {
      switch (opc) {
        case 1:
          this.fgResp.reset();
          this.ResponsableDS = new MatTableDataSource([]);
          break;
      }
    }

    mouseOver(opc: number, element: any) {
      switch (opc) {
        case 1:
          if ( this.mIncentivo === 1 ) {
            this.editTable = element;
          }
          break;

        case 2:
          this.selectResp = element;
          break;
      }
    }

    async clickResp(element: nsIncentivo.IListaResp) {

      const nIdResp = this.fgInfoUser.controls['nIdPersonal'].value;
      if ( nIdResp === element.nIdResp ) {
        this._snackBar.open('Responsable actualmente en pantalla.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 2500
        });
      } else {
        // await this.loadMain(element.nIdResp);
        this.fgInfoUser.patchValue({
          nIdPersonal: element.nIdResp,
          sNombres: element.sNombres,
          sTipo: element.sTipo,
          sDocumento: element.sDocumento,
        });

        // this.clickFab(7, -1);
      }
    }
  async ngOnInit(): Promise<void> {

    this.spi.show('spi_responsable');
    const param = [];
    const user = localStorage.getItem('currentUser');
        const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
        param.push('0¡nIdRegUser!' + uid);

        await this.service._loadSP( 10, param, this.url).then( (value: nsIncentivo.IListaResp[]) => {

          this.ResponsableDS = new MatTableDataSource(value);
          this.ResponsableDS.paginator = this.pagResp;

          this.ResponsableDS.filterPredicate = function(data: nsIncentivo.IListaResp, filter: string): boolean {
            return data.sNombres.trim().toLowerCase().includes(filter);
          };

          this.ResponsableDS.filterPredicate = ((data: nsIncentivo.IListaResp, filter: any ) => {
            // tslint:disable-next-line: max-line-length
            const a = !filter.sNombres || ( data.sNombres.toLowerCase().includes(filter.sNombres.trim().toLowerCase()) );
            return a;
          }) as (PeriodicElement, string) => boolean;

        });
    this.spi.hide('spi_responsable');

        // this.pbResp = false;
  }

}
