import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { LiquidacionPersonalService } from './liquidacion-personal.service';
import { CalculolPeriodoComponent } from './Modals/calculol-periodo/calculol-periodo.component';


const MODALS: { [name: string]: Type<any> } = {
  calculol: CalculolPeriodoComponent
};

@Component({
  selector: 'app-liquidacion-personal',
  templateUrl: './liquidacion-personal.component.html',
  styleUrls: ['./liquidacion-personal.component.css','./liquidacion-personal.component.scss'],
  animations: [adminpAnimations]
})
export class LiquidacionPersonalComponent implements OnInit {


  selectedRowIndex = null;
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };


  expandedMore: IMain;

  cboPlanilla = new Array();
  cboCiudad = new Array();
  cboMotivo = new Array();

  sHeaderDevengue = '';
  DevengueBackup = new Array();
  nIdDevengue: number;
  dFechDevengue: Date = null;



  fgMain: FormGroup;

  tadaMain = 'inactive';
  fbMain = [
    {icon: 'history', tool: 'Histórico'} ,
  ];
  abMain = [];
  tsMain = 'inactive';

  _nMes = 0;
  _nAnio = 0;


  MainDC: string[] = ['sNombres', 'scodplla',  'sTipoDoc', 'sDocumento', 'sCiudad',
                      'sFechaIngreso', 'sFechaCese' , 'sMotivo'];
  //  'sFechaIngreso', 'sFechaCese' , 'sMotivo', 'sDias', 'more'];
  MainDS: MatTableDataSource<IMain>;
  @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;

  ExpandedDC: string[] = ['sNombres'];

  ExpandedDS: MatTableDataSource<IMain>;
  constructor(public service: LiquidacionPersonalService, private spinner: NgxSpinnerService,
  private fb: FormBuilder, private _modalService: NgbModal, private _snackBar: MatSnackBar) {
    this.new_fgMain();

   }

 
  async ngOnInit(): Promise<void>  {
    await this.cboGetPlanilla();
    await this.cboGetCiudad();
    await this.cboGetMotivos();
    await this.DevengueACtual();
    await this.ListaPersonal();
  }
  get getMain() { return this.fgMain.controls; }


  new_fgMain() {
    this.fgMain = this.fb.group({
      sNombres: '',
      scodplla: '',
      sCiudad: '',
      nIdMotFin: 0
    });

    this.fgMain.valueChanges.subscribe(value => {
      const filter = { ...value, name: value.sNombres.trim().toLowerCase() } as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }

      this.expandedMore = null;

    });
  }


  async ListaPersonal() {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    const mes = this.dFechDevengue.getMonth() + 1;
    const anio = this.dFechDevengue.getFullYear();
     this._nMes = mes;
     this._nAnio = anio;
    param.push('0¡YEAR(B.dFechFin)!' + anio);
    param.push('0¡MONTH(B.dFechFin)!' + mes);

    this.spinner.show('spi_lista');

    await this.service._loadSP( 1, param).then( (value: IMain[]) => {
      this.MainDS = new MatTableDataSource(value);
      this.MainDS.paginator = this.pagMain;


      this.MainDS.filterPredicate = function(data, filter: string): boolean {
        return data.sNombres.trim().toLowerCase().includes(filter);
        };
        this.MainDS.filterPredicate = ((data: any, filter: any ) => {
        const a = !filter.sNombres  || data.sNombres.toLowerCase().includes(filter.sNombres.toLowerCase());
        const b = !filter.scodplla  || data.scodplla.toLowerCase().includes(filter.scodplla.toLowerCase());
        const c = !filter.sCiudad   || data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());
        const d = !filter.nIdMotFin || data.nIdMotFin === filter.nIdMotFin ;
        return a && b && c && d;
        }) as (PeriodicElement, string) => boolean;

    });

    this.spinner.hide('spi_lista');
  }

  clickExpanded(row: any) {}

  loadFechas(element: any) {}

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      //// Configurar boton flotante vista principal
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;
    }
  }

  async clickFab(opc: number, index: number) {

    switch (opc) {
      // Fab Main
      // Fab Incentivo ( New 2 )
      case 1:
        switch (index) {
          case 0:
            // this.SwalPlanilla();
            this.openModal('calculol', 0, 0);
            break;
        }
        break;
    //#endregion
    }
  }

  openModal(name: string, edit: any, row: any) {

    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();

    switch (name) {
      case 'calculol':
      // obj['edit'] = edit;
      // if ( edit === 1) {
        obj['_nMes'] = this._nMes;
        obj['_nAnio'] = this._nAnio;
        obj['_nIdDevengue']  = this.nIdDevengue;
      //   obj['nIdDPP'] = row.nIdDPP;
      //   obj['nDias'] = row.nDias;
      //   obj['nImporte'] = row.nImporte;
      // }
        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'calculol':
          if (result.value === 'loadAgain') {

            // this.spinner.show('spi_lista');
            await this.ListaPersonal();
            // this.spinner.hide('spi_lista');

          }
          break;
      }

    }, (reason) => { });
  }


  //#region  Combos
  async cboGetPlanilla() {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('0¡bEstado!1');

    await this.service._loadCombo( 5, param).then( (value: any[]) => {
      this.cboPlanilla = value;
    });
  }
  async cboGetMotivos() {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);

    await this.service._loadSP( 2, param).then( (value: any[]) => {
      this.cboMotivo = value;
    });
  }

  async cboGetCiudad() {
    const param = [];
    param.push('0¡nDadTipEle!694');
    const sIdPais = JSON.parse(localStorage.getItem('Pais'));
    param.push('0¡nIdPais!' + sIdPais);
    param.push('0¡bEstado!1');

    await this.service._loadCombo( 6, param).then( (value: any[]) => {
      this.cboCiudad = value;
    });
  }

  async DevengueACtual() {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    await this.service._loadDevengue( 1, param).then((value: any[]) => {
      if ( value.length > 0 ) {

        this.DevengueBackup = value;
        const iDevengue = value.findIndex( x => x.nIdEstado === 0 || x.nIdEstado === 1 );
        this.nIdDevengue = value[iDevengue].nIdDevengue as number;

        const sEjercicio = (value[iDevengue].nEjercicio as number).toString();
        let sMes = (value[iDevengue].nMes as number).toString();
        sMes = (sMes.length === 1) ? '0' + sMes : sMes;

        const sFechDevengeue = '01/' + sMes + '/' + sEjercicio;
        this.dFechDevengue = moment(sFechDevengeue, 'DD/MM/YYYY').toDate();

      } else {
        this._snackBar.open('Usuario no cuenta con relación de personal.', 'Cerrar', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    });

    if (this.dFechDevengue !== null) {
      moment.locale('es');
      const tDate = moment(this.dFechDevengue).format('MMMM [del] YYYY');
      this.sHeaderDevengue = tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
      // await this.fnGetListaAFP();
    }
  }
  //#endregion

 

}

interface IMain{

  nIdPerlab: number;
  sNombres: string;
  scodplla: string;
  sDescplla: string;
  sTipoDoc: string;
  sDocumento: string;
  sCiudad: string;
  sFechaIngreso: string;
  sFechaCese: string;
  nIdMotFin: number;
  sMotivo: string;
  sDias: number;
}