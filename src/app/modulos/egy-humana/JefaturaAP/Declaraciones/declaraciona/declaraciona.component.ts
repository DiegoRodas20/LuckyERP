import { Component, Inject, OnInit, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import moment, { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { IExpanded, ListaPersonal } from '../../Model/Ideclaraciona';
import { declaracionaAnimations } from './declaraciona.animations';
import { DeclaracionaService } from './declaraciona.service';
import { DeclaracionaExportComponent } from './Modals/declaraciona-export/declaraciona-export.component';
import { DeclaracionaCompareComponent } from './Modals/declaraciona-compare/declaraciona-compare.component';
import { adminpAnimations } from '../../Animations/adminp.animations';

declare var jQuery: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

const MODALS: { [name: string]: Type<any> } = {
  export: DeclaracionaExportComponent,
  compare: DeclaracionaCompareComponent
  // compare: KpibtIncentivoComponent
};

@Component({
  selector: 'app-declaraciona',
  templateUrl: './declaraciona.component.html',
  styleUrls: ['./declaraciona.component.css', './declaraciona.component.scss'],
  animations: [adminpAnimations],
  providers : [ DeclaracionaService ]
})
export class DeclaracionaComponent implements OnInit {

  ngbModalOptions: NgbModalOptions = {
    size: "lg",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };

  expandedMore: ListaPersonal;
  url: string;
  step = 0;
  urlSustento: string;
  pbSustento: boolean;

   // Devengue
  DevengueBackup = new Array();
   nIdDevengue: number;
   dFechDevengue: Date = null;
   maxDay = 0;
   sHeaderDevengue = '';
   apersonal: IExpanded[];


  cboPlanilla = new Array();
  cboAFP = new Array();

  MainDC: string[] = [  'action', 'fechaDevengue', 'nombreAFP', 'prima', 'seguro', 'comision', 'nroPersonas', 'more'  ];
  MainDS: MatTableDataSource<ListaPersonal>;
  ListaTemporalDS: ListaPersonal[];
 @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;


  ExpandedDC: string[] = ['position', 'sNombres', 'planilla', 'afp', 'tipoDoc', 'nroDoc', 'ingreso', 'cese', 'monto'];
  ExpandedDS: MatTableDataSource<IExpanded> = new MatTableDataSource([]);
  @ViewChild('pagExpanded', {static: false}) pagExpanded: MatPaginator;
  
  @ViewChild('mtExpanded', {static: false}) mtExpanded: MatTable<IExpanded>;
  tadaMain = 'inactive';
  pbMain: boolean;
   // Fab
 fbMain = [
  {icon: 'post_add', tool: 'Generar Declaracion'},
  {icon: 'compare', tool: 'Comparar'},
 //  {icon: 'groups', tool: 'Prueba'}
];
abMain = [];
tsMain = 'inactive';

fgMain: FormGroup;

@ViewChild('epNew_filtro') epNew_filtro: MatExpansionPanel;

  constructor( public service:DeclaracionaService ,
  private fb: FormBuilder, private spi: NgxSpinnerService,
  private _snackBar: MatSnackBar, private _modalService: NgbModal) {


    this.new_fgMain();

  }
  setStep(index: number) {
    this.step = index;
  }


  async new_fgMain() {
    this.fgMain = this.fb.group({
      dFecha: '',
      sCodPlla: '',
      nIdRegPen_: 0
    });

    this.fgMain.valueChanges.subscribe(value => {
      const filter = { ...value } as string;
      this.MainDS.filter = filter;

      if (this.MainDS.paginator) {
        this.MainDS.paginator.firstPage();
      }

      this.expandedMore = null;

    });
    //  await this.DevengueActual();
    //  await this.fnGetDevengue();
    //  await this.fnGetListaPersonal();
    // this.fgMain.valueChanges.subscribe( value => {
    //   const ctrlValue = this.fgMain.controls['dFecha'].value;
    //   const a = moment(ctrlValue).format('MM');
    //   const b =  moment(ctrlValue).format('YYYY');
    //   const y: number = +a;
    //   const z: number = +b;
    //   if( y > 0 && z > 0 ) {
    //     const lista = this.ListaTemporalDS.filter(x => x.nMes === y && x.nEjercicio === z);
    //     this.MainDS = new MatTableDataSource(lista);
    //     this.MainDS.paginator = this.pagMain;
    //   } else {
    //   this.MainDS = new MatTableDataSource(this.ListaTemporalDS);
    //   this.MainDS.paginator = this.pagMain;
    //   }
    //   this.expandedMore = null;

    // });

    // this.fgMain.valueChanges.subscribe( value => {
    //   const filter = {...value, name: value.sNombres.trim().toLowerCase()} as string;
    //   this.MainDS.filter = filter;

    //   if (this.MainDS.paginator) {
    //     this.MainDS.paginator.firstPage();
    //   }

    //   this.expandedMore = null;

    // });
  }
  get getMain() { return this.fgMain.controls; }



  async ngOnInit(): Promise<void> {
    await this.cboGetPlanilla();
    await this.cboAfp();
    await this.DevengueActual();
    await this.fnGetDevengue();
    await this.fnGetListaPersonal();
  }

//#region  fecha  año y mes 
  // chosenYearHandler(normalizedYear: Moment) {
  //   let ctrlValue = this.fgMain.controls['dFecha'].value;
  //   ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
  //   ctrlValue.year(normalizedYear.year());
  //   this.fgMain.controls['dFecha'].setValue(ctrlValue);
  // }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue = this.fgMain.controls['dFecha'].value;
    ctrlValue = ( ctrlValue === null ) ? moment() : ctrlValue;
    // ctrlValue.month(normalizedMonth.month());
    this.fgMain.controls['dFecha'].setValue(normalizedMonth);
    // const a = moment(normalizedMonth).format('MM');
    // const b =  moment(normalizedMonth).format('YYYY');
    // const y: number = +a;
    // const z: number = +b;
    // const lista = this.ListaTemporalDS.filter(x => x.nMes === y && x.nEjercicio === z);
    // this.MainDS = new MatTableDataSource(lista);
    datepicker.close();
  }

  //#endregion

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abMain.length > 0 ) ? 0 : 1 : stat;
        this.tsMain = ( stat === 0 ) ? 'inactive' : 'active';
        this.abMain = ( stat === 0 ) ? [] : this.fbMain;
        break;
    }
  }

  async clickFab(opc: number, index: number) {
    const self = this;
    // const nIdBonoT = this.fgBonoT.controls['T1_nIdBonoT'].value;

    switch (opc) {
      // Fab Main
      case 1:
        switch (index) {
          case 0:
            this.openModal('export',0);
            // this.showModal(3);
            break;
          case 1:
            this.SwalPlanilla();
            break;
            case 2:
               ( function($) {
              $('#ModalSustento').modal('hide');
              })(jQuery);
              this.urlSustento = '';
              break;
        }
        break;

      // Fab Incentivo ( New 1 )

    }
  }


  MostrarSutento(element: any){
    this.urlSustento = element.sFileSustento;
                  ( function($) {
                    // $('#ModalIncentivo').modal('hide');
                    $('#ModalSustento').modal('show');
                    // $('#ModalSustento').on('shown.bs.modal', function () {
                    //   self.onToggleFab(6, 1);
                    //   self.onToggleFab(self.toggleIncentivo, 0);
                    // });
                  })(jQuery);
  }

  //#region  Combos

  async cboAfp () {
    const param = [];
    param.push('0¡bdisCuspp!1');

    await this.service._loadSP( 1 , param).then( (value: any[]) => {
      this.cboAFP = value;
    });
  }

  async cboGetPlanilla () {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('0¡bEstado!1');

    await this.service._loadSP( 2 , param).then( (value: any[]) => {
      this.cboPlanilla = value;
    });
  }

  cantPerso(nIdAfpNet: number) {
    const sCodPlla = this.fgMain.controls['sCodPlla'].value as string;
    const nIdRegPen_ = this.fgMain.controls['nIdRegPen_'].value as number;
    const aFilter = this.apersonal.filter( x => {
      const a = x.nIdAfpNet === nIdAfpNet;
      // tslint:disable-next-line: max-line-length
      const b = !sCodPlla || ( x.scodplla.toLowerCase().includes(sCodPlla.toLowerCase()));
      const c = !nIdRegPen_ || ( x.nIdRegPen === nIdRegPen_);
      return a && b && c;
    });

    return aFilter.length;
  }

  async fnGetListaPersonal() {
    const param = [];

    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    // param.push('0¡k.nIdDevengue!' + 1);
    // param.push('0¡nIdEmp!' + nIdEmp);

    this.spi.show('spi_lista');

    await this.service._loadSP( 3, param).then( (value: ListaPersonal[]) => {
      this.ListaTemporalDS = value;
      // const ctrlValue = this.fgMain.controls['dFecha'].value;
      this.MainDS = new MatTableDataSource(value);
      this.MainDS.paginator = this.pagMain;

      this.MainDS.filterPredicate = function(data, filter: string): boolean {
        return data.nombreAFP.trim().toLowerCase().includes(filter);
        };

      this.MainDS.filterPredicate = ((data: any, filter: any ) => {

        const mes: number = + moment(filter.dFecha).format('MM');
        const anio: number = +  moment(filter.dFecha).format('YYYY');
      const a = !filter.dFecha || data.nMes ===  mes && data.nEjercicio === anio ;
      const b = this.cantPerso(data.nIdAfpNet) > 0;
      return a && b;
      }) as (PeriodicElement, string) => boolean;

      // this.fgMain.controls['dFecha'].setValue(ctrlValue);
      // const a = moment(ctrlValue).format('MM');
      // const b =  moment(ctrlValue).format('YYYY');
      // const y: number = +a;
      // const z: number = +b;
      // const lista = this.ListaTemporalDS.filter(x => {
      //   const a =  x.nMes === y ;
      //   const b =  x.nEjercicio === z;
      //   const c = this.cantPerso(x.nIdAfpNet) > 0;
      //   return a && b && c;
      // });
      // this.MainDS = new MatTableDataSource(lista);
      // this.MainDS.paginator = this.pagMain;
    });

    await this.service._loadSP( 4, param).then( (value: IExpanded[]) => {
      this.apersonal = value;
    });

    this.spi.hide('spi_lista');

  }

  async clickExpanded(row: ListaPersonal) {
    if (this.expandedMore === row) {
      // Limpiar
      this.expandedMore = null;
      this.ExpandedDS = new MatTableDataSource([]);
      this.ExpandedDS.paginator = null;
      if (this.ExpandedDS.paginator) {
        this.ExpandedDS.paginator.firstPage();
      }

    } else {
      const param = [];
      param.push('0¡A.nIdAfpNet!' + row.nIdAfpNet);

      await this.service._loadSP( 4, param).then( (value: IExpanded[]) => {

        let aFilter = value;

        if ( this.fgMain.controls['sCodPlla'].value !== '' || this.fgMain.controls['nIdRegPen_'].value !== 0  ) {
          let sCodPlla = this.fgMain.controls['sCodPlla'].value as string;
          const nIdRegPen_ = this.fgMain.controls['nIdRegPen_'].value as number;
          sCodPlla = sCodPlla.trim().toLowerCase();
          aFilter = value.filter( x => {
              const a = !nIdRegPen_ || ( x.nIdRegPen === nIdRegPen_);
              const b =  x.scodplla.trim().toLowerCase().includes(sCodPlla);
            return a && b;
          });
        }

        this.ExpandedDS = new MatTableDataSource(aFilter);
      this.ExpandedDS.paginator = null;
        this.ExpandedDS.paginator = this.pagExpanded;
      });

      this.expandedMore = row;
      this.mtExpanded.renderRows();
    }
  }
  //#endregion
  MomentDate2(nMes: any , nAnio: any) {
    moment.locale('es');
    let sMes = (nMes as number).toString();
    sMes = (sMes.length === 1) ? '0' + nMes : nMes;
    const date = '01/' + nMes + '/' + nAnio;
    const tDate1 = moment(date, 'DD/MM/YYYY').toDate();
    const tDate = moment(tDate1).format('MMMM [del] YYYY');
    return tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
  }

  openModal(name: string, nIdPlanilla: number ) {
    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);
    const obj = new Object();
    switch (name) {
      case 'compare':
        const uid_modal = 0;
        obj['nIdPlanilla'] = nIdPlanilla;
        modalRef.componentInstance.fromParent = obj;
        break;
    }

    modalRef.result.then(async (result) => {

      switch (result.modal) {
        case 'export':
          if (result.value === 'loadAgain') {

            this.spi.show('spi_lista');
            await this.fnGetListaPersonal();
            this.spi.hide('spi_lista');

          }
          break;
      }

    }, (reason) => { });

  }

  MomentDate(pushParam: any) {
    moment.locale('es');
    const tDate = moment(pushParam).format('MMMM [del] YYYY');
    return tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
  }

  SwalPlanilla() {
    const iOptions: { [inputValue: number]: string; } = {};
        const iOption: {
          nIdPlanilla: number;
          sDescPlla: string;
        }[] = [];
        this.cboPlanilla.forEach( x => {
          iOption.push({
            nIdPlanilla: x.sCodPlla,
            sDescPlla: x.sCodPlla + '-' + x.sDesc
          });

        });

        $.map(iOption, function (o) {
          iOptions[o.nIdPlanilla] = o.sDescPlla;
        });
    Swal.fire({
      title: 'Seleccionar Planilla',
      icon: 'info',
      text: 'Al cambiar la planilla se mostrará su información relacionada.',
      input: 'select',
      inputOptions: iOptions,
      // inputOptions: devengue.opcionSwal(),
      inputPlaceholder: 'Seleccionar',
      showCancelButton: true,
      confirmButtonText: 'Seleccionar',
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value === undefined || value === '') {
          return 'Selección no válida.';
        }
      }
    }).then(async resultado => {
      const nIdNewD = Number(resultado.value);
      if(nIdNewD>0){
        this.openModal('compare', nIdNewD);

      }

    });
  }

  async DevengueActual() {
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
  }

  async fnGetDevengue () {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    param.push('0¡nIdEstado!0');
    // var a = moment(this.dFechDevengue , 'YYYY-MM').toDate();
    // this.fgMain.controls['dFecha'].setValue(a);

    await this.service._loadSPDevengue( 3, param).then( (value: any[]) => {
      // this.fgMain.controls['dFecha'].setValue(value[0].dFecha);
    });
  }
}
