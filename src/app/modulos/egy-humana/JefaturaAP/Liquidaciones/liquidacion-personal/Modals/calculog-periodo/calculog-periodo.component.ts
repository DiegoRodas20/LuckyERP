import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { LiquidacionPersonalService } from '../../liquidacion-personal.service';

@Component({
  selector: 'app-calculog-periodo',
  templateUrl: './calculog-periodo.component.html',
  styleUrls: ['./calculog-periodo.component.css','./calculog-periodo.component.scss'],
  animations: [ adminpAnimations ]

})
export class CalculogPeriodoComponent implements OnInit {

  @Input() fromParent;

  toggleCalculog = 1;
  tadaCalculog = 'inactive';

  fbCalculog = [
    {icon: 'save', tool: 'Guardar cálculo', dis: false} ,
    {icon: 'cancel', tool: 'Cancelar', dis: false} ,
  ];

  Personal: IPersonal[];
  Personal_sCodplla: IPersonal[] = [];
  ListaPeriodo: IPeriodo[] = [];
  
  // PersonalSeleccionado: IPersonal;
  abCalculog = [];
  tsCalculog = 'inactive';
  nImporteTotal =0;

  sHeaderDevengue = '';
  DevengueBackup = new Array();
  nIdDevengue: number;
  dFechDevengue: Date = null;

   // FormGroup
   fgDetail: FormGroup;
   fgAdditional: FormGroup;
   fgInfo: FormGroup;

   selectedPersonId = 0;
   ConceptoDC: string[] = [ 'sCodConcepto', 'sConcepto', 'nUnidad', 'nImporte' ];
   ConceptoDS: MatTableDataSource<IConcepto> = new MatTableDataSource([]);

   ConceptoDC2: string[] = [ 'sCodConcepto', 'sConcepto', 'nUnidad', 'nImporte' ];
   ConceptoDS2: MatTableDataSource<IConcepto> = new MatTableDataSource([]);

  constructor(public activeModal: NgbActiveModal, public service: LiquidacionPersonalService, private spi: NgxSpinnerService,
    private fb: FormBuilder, private _modalService: NgbModal, private _snackBar: MatSnackBar) {
      this.new_fgDetail();
      this.new_fgAdditional();
      this.new_fgInfo();
    }

    new_fgDetail() {
      this.fgDetail = this.fb.group({
        nIdPersonal: 0,
        nIdPerLab: 0,
        sNombres: [{ value: '', disabled: true }],
        sCodPlla: [{ value: '', disabled: true }],
        sTipo: [{ value: '', disabled: true }],
        sDocumento: [{ value: '', disabled: true }],
        sOrganizacion: [{ value: '', disabled: true }],
        sCentroCosto: [{ value: '', disabled: true }],
        sCiudad: [{ value: '', disabled: true }],
        nTelMovil: [{ value: 0, disabled: true }],
        dFechIni: [{ value: null, disabled: true }],
        dFechFin: [{ value: null, disabled: true }]
      });
    }
  new_fgAdditional() {
    this.fgAdditional = this.fb.group({
      dIniCont: [{ value: null, disabled: true }],
      dFinCont: [{ value: null, disabled: true }],
      nTelMovil: [{ value: 0, disabled: true }],
      sCorreo: [{ value: '', disabled: true }],
      sResponsable: [{ value: '', disabled: true }],
      nTelMovil_Resp: [{ value: 0, disabled: true }],
      sOrganizacion: [{ value: '', disabled: true }],
      sCentroCosto: [{ value: '', disabled: true }]
    });
  }

  new_fgInfo() {
    this.fgInfo = this.fb.group({
      dDevengue: [{ value: null, disabled: true }],
      sTipoPeriodo: [{ value: '', disabled: true }],
      sPlla: [{ value: '', disabled: true }],
      dFechPago: [{ value: null, disabled: true }],
      sInicio: [{ value: '', disabled: true }],
      sTermino: [{ value: '', disabled: true }]
    });
  }

  

  get getInfo() { return this.fgInfo.controls; }
  get getDetail() { return this.fgDetail.controls; }
  get getAdditional() { return this.fgAdditional.controls; }

    async ngOnInit(): Promise<void>  {
      this.ListaPersonal();
      this.onToggleFab(1, 1);
      await this.DevengueACtual();
      await this.ListaPeriodos();
      await this.InfoCalculo();
    }

  async clickFab(opc: number, index: number) {

    switch (opc) {
      // Fab Main
      // Fab Incentivo ( New 2 )
      case 1:
        switch (index) {
          case 0:
            this.activeModal.dismiss();
            // await this.SaveFechas();
            break;
        }
        break;
      }
    }
    onToggleFab(fab: number, stat: number) {
      switch (fab) {
        //// Configurar boton flotante vista principal
        case 1:
          stat = ( stat === -1 ) ? ( this.abCalculog.length > 0 ) ? 0 : 1 : stat;
          this.tsCalculog = ( stat === 0 ) ? 'inactive' : 'active';
          this.abCalculog = ( stat === 0 ) ? [] : this.fbCalculog;
          break;
      }
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

    async InfoCalculo() {
      const dato = this.ListaPeriodo.filter(x => x.nIdDevengue === this.nIdDevengue);
      this.fgInfo.patchValue({
        dDevengue: this.sHeaderDevengue,
        sTipoPeriodo: 'Liquidación',
        sPlla: this.fgDetail.controls['sCodPlla'].value,
        // dFechPago: this.aPeriodo[0].dFechPago,
        sInicio: moment(dato[0].dtInicio).format('DD/MM/YYYY hh:mm:ss'),
        sTermino: moment(dato[0].dtTermino).format('DD/MM/YYYY hh:mm:ss')
      });
    }

    async ListaPersonal() {
      const param = [];
      const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
      const sCodplla = this.fromParent._sCodplla;
      param.push('');
      this.spi.show('spi_calculog');
      await this.service._loadSP( 5, param).then( (value: IPersonal[]) => {
        this.Personal = value;
        this.Personal_sCodplla = this.Personal.filter(x => x.sCodPlla === sCodplla.toString() );
      });
      if(this.Personal_sCodplla.length > 0){
        this.selectedPersonId = this.Personal_sCodplla[0].nIdPersonal;
        this.osPerso(this.Personal_sCodplla[0]);
      }
      this.spi.hide('spi_calculog');
    }

    async osPerso(event: IPersonal) {
      if (event.nIdPersonal > 0) {
        const personal = this.Personal.filter(x => x.nIdPersonal === event.nIdPersonal);
        this.fgDetail.controls['nIdPersonal'].setValue(personal[0].nIdPersonal);
        this.fgDetail.controls['nIdPerLab'].setValue(personal[0].nIdPerLab);
        this.fgDetail.controls['sNombres'].setValue(personal[0].sNombres);
        this.fgDetail.controls['sCodPlla'].setValue(personal[0].sCodPlla);
        this.fgDetail.controls['sTipo'].setValue(personal[0].sTipoDocumento);
        this.fgDetail.controls['sDocumento'].setValue(personal[0].sDocumento);
        this.fgDetail.controls['sOrganizacion'].setValue(personal[0].sOrganizacion);
        this.fgDetail.controls['sCentroCosto'].setValue(personal[0].sCentroCosto);
        this.fgDetail.controls['sCiudad'].setValue(personal[0].sCiudad);
        this.fgDetail.controls['nTelMovil'].setValue(personal[0].nTelMovil);
        if (personal[0].dFechFin === '01/01/0001') {
          personal[0].dFechFin = " ";
        }
        this.fgDetail.controls['dFechIni'].setValue(personal[0].dFechIni);
        await this.ConceptoxPersonal(personal[0]);
        this.nImporteTotal = await this.getMonto();
      }
      }

      async getMonto() {
        const nIdPersonal = this.fgDetail.controls['nIdPersonal'].value;
        const aData = this.Personal;
        let retorno = 0;
        if (aData.length > 0) {
          const aFilter = aData.filter( x => x.nIdPersonal === nIdPersonal );
          const monto =  ( aFilter.length > 0 ) ? aFilter[0].nMonto : 0;;
          if (monto > 0 ){
            retorno = monto;
          }
        }
        return retorno;
        // return ( aFilter.length > 0 ) ? 9000 : 0;
      }

      async ConceptoxPersonal(element: any ) {

        const param = [];
        param.push('0¡nIdPerLab!' + element.nIdPerLab);
        await this.service._loadSP( 6, param).then( (value: IConcepto[]) => {
          this.ConceptoDS = new MatTableDataSource(value);
          this.ConceptoDS2 = new MatTableDataSource(value);
        });
      }

      async ListaPeriodos() {
        const param = [];
        param.push('');
        await this.service._loadSP( 8, param).then( (value: IPeriodo[]) => {
          this.ListaPeriodo = value;
        });
      }

}

interface IPersonal{
  nIdPersonal: number;
  nIdPerLab: number;
  sNombres: string;
  sCodPlla: string;
  sTipoDocumento: string;
  sDocumento: string;
  sOrganizacion: string;
  sCentroCosto: string;
  sCiudad: string;
  nTelMovil: number;
  dFechIni: string;
  dFechFin: string;
  nMonto: number;
}

interface IConcepto{
  nIdConcepto: number;
  nImporte: number;
  sDescripcion: string;
  sCodConcepto: string;
  nUnidad: number;
}

interface IPeriodo{
  nIdDevengue: number;
  dtInicio: Date;
  dtTermino: Date;

}
