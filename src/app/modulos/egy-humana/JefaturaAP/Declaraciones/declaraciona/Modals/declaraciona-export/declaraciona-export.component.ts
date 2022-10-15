import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
// import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { DeclaracionaService } from '../../declaraciona.service';
import { declaracionaAnimations } from './declaraciona-export.animations';
import { ErrorStateMatcher } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { int } from '@zxing/library/esm/customTypings';
import { MatTableDataSource } from '@angular/material/table';
import * as fileSaver from "file-saver";
import Swal from 'sweetalert2';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { adminpAnimations } from '../../../../Animations/adminp.animations';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}


@Component({
  selector: 'app-declaraciona-export',
  templateUrl: './declaraciona-export.component.html',
  styleUrls: ['./declaraciona-export.component.css', './declaraciona-export.component.scss'],
  animations: [adminpAnimations]
})

export class DeclaracionaExportComponent implements OnInit {

  cboDevengue = new Array();

  selectedDevengue = 0;
  pbExport: boolean;
  toggleExport = 0 ;

// Devengue
DevengueBackup = new Array();
nIdDevengue: number;
dFechDevengue: Date = null;
maxDay = 0;
sHeaderDevengue = '';
fileSustento ;
nIdTipoSpp: number;
nIdRegPen: number;

nMesDevengue: string;
nEjercicioDevengue: string;

FooterDevengue = true;

CantSustento = 0;

  NameDevengue = '';

  formFiltro: FormGroup;

  estadoBotonFb = false;
  tsExport = 'active';
  fbExport = [
  {icon: 'calendar_today', tool: 'Cambiar devengue'},
    {icon: 'cloud_download', tool: 'Generar excel', dis: false},
  ];
  abExport = [];

  tadaExport = 'inactive';

  MainDC: string[] = [  'AFP', 'Fondo', 'regimen', 'action'  ];
  MainDS: MatTableDataSource<IListaAFP>;


  constructor( public activeModal: NgbActiveModal,
    public service: DeclaracionaService,
    public fb: FormBuilder,
    private spi: NgxSpinnerService,
    private _snackBar: MatSnackBar) {

      this.new_formFiltro();
     }

     new_formFiltro() {
    this.formFiltro = this.fb.group({
      dFecha: [{ value: null }],
      sNombres: [{ value: '' }],
      sCodPlla: [{ value: '' }],
      nIdDevengue: [{ value: 0 }]
    });
    }
  get getMain() { return this.formFiltro.controls; }


  async ngOnInit(): Promise<void> {
    this.onToggleFab(0, 1);

    this.pbExport = false;

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
        this.nMesDevengue = sMes;
        this.nEjercicioDevengue = sEjercicio;
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

    await this.fnGetListaAFP();
  }


  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 0:
        stat = ( stat === -1 ) ? ( this.abExport.length > 0 ) ? 0 : 1 : stat;
        this.tsExport = ( stat === 0 ) ? 'inactive' : 'active';
        this.abExport = ( stat === 0 ) ? [] : this.fbExport;
        break;
    }
  }

  public clickFab(opcion: number,ibtn : number): void {
    switch (ibtn) {
      case 0:
        const iOptions: { [inputValue: number]: string; } = {};
        const iOption: {
          nIdDevengue: number;
          sDevengue: string;
        }[] = [];
        moment.locale('es');
        this.DevengueBackup.forEach( x => {

          const sEjercicio = (x.nEjercicio as number).toString();
          let sMes = (x.nMes as number).toString();
          sMes = (sMes.length === 1) ? '0' + sMes : sMes;

          const sFechDevengeue = '01/' + sMes + '/' + sEjercicio;
          const tDate = moment(sFechDevengeue, 'DD/MM/YYYY').format('MMMM [del] YYYY');
          const sDate = tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();

          iOption.push({
            nIdDevengue: x.nIdDevengue,
            sDevengue: sDate
          });

        });

        $.map(iOption, function (o) {
          iOptions[o.nIdDevengue] = o.sDevengue;
        });
        // var devengue: DevengueFbCEM = new DevengueFbCEM();
        Swal.fire({
          title: 'Seleccionar Devengue',
          icon: 'info',
          text: 'Al cambiar el devengue se mostrará la información relacionada al mes y año en cuestión.',
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

          if ( this.nIdDevengue === nIdNewD ) {
            this._snackBar.open('No se realizó ningún cambio.', 'Cerrar', {
              duration: 1000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          } else {
            const aDevengue = this.DevengueBackup;
            const iDevengue = aDevengue.findIndex( x => x.nIdDevengue === nIdNewD );
            this.nIdDevengue = aDevengue[iDevengue].nIdDevengue as number;
            const sEjercicio = (aDevengue[iDevengue].nEjercicio as number).toString();
            let sMes = (aDevengue[iDevengue].nMes as number).toString();
            sMes = (sMes.length === 1) ? '0' + sMes : sMes;
            const sFechDevengeue = '01/' + sMes + '/' + sEjercicio;
            this.dFechDevengue = moment(sFechDevengeue, 'DD/MM/YYYY').toDate();
            const tDate = moment(this.dFechDevengue).format('MMMM [del] YYYY');
            this.sHeaderDevengue = tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();
            if(this.nMesDevengue === sMes && this.nEjercicioDevengue === sEjercicio){
              this.FooterDevengue = true;
            }else{
              this.FooterDevengue = false;
            }
            await this.fnGetListaAFP ();
            // this.spi.show('spi_main');
            // await this.loadMain();
            // this.spi.hide('spi_main');
          }
        });
        break;

      case 1:
        this._envioDataExcel();
        // this._exportarExcel();
        break;

      default:
        break;
    }
  }


  async fnGetListaAFP () {
    const param = [];

    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    param.push('0¡nIdDevengue!' + this.nIdDevengue);

    this.spi.show('spi_export');

    await this.service._loadSP( 6, param).then( (value: IListaAFP[]) => {

      if(value.length === 0) {
        this.fbExport[1].dis = true;
        this.onToggleFab(0, 1);
      } else {
        this.fbExport[1].dis = false;
        this.onToggleFab(0, 1);
      }
      value.forEach(x => {
        if (x.nIdAfpNet > 0) {
          x.dis = true;
        } else {
          x.dis = false;
        }
      });

      this.MainDS = new MatTableDataSource(value);

    });

    this.spi.hide('spi_export');

  }



  private async _envioDataExcel() {
    /**
     * Enviando para generar excel
     */
     const param = [];
     // param.push('0¡bdisCuspp!1');
     param.push('0¡bdisCuspp!1');

    await this.service._excel(5, param).then(async (data: any) => {
      const datos = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const dateCurrent = new Date();
      const anio = dateCurrent.getFullYear();
      const mes = dateCurrent.getMonth() + 1;
      const fname = 'EmpresaLucky_' + anio + '_' + mes + '_general.xlsx';
    // FileSaver.saveAs(data, this.fileName);
      fileSaver.saveAs(datos, fname);
    });
  }

  async Sustentar( pushParam?: any) {
    ( function($) {
      $('#uploadFile2').click();
    })(jQuery);

    const rElement = pushParam as IListaAFP;
    this.nIdTipoSpp = rElement.nIdTipoSpp;
    this.nIdRegPen = rElement.nIdRegPen;
    // const IdDevengue = this.nIdDevengue;
  }


  async uploadFile2(event) {
    let fileurl ;
    if (event.target.files[0]) {
      fileurl = event.target.files[0];
    }
    this.CantSustento++;
    this.spi.show('spi_export');
    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
    const sFile = await this.getStringFromFile(fileurl);
    const iFile = sFile.indexOf(',') + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);
    const UploadFile: any = await this.service._uploadFile(sFileSustento, 8, 'SustentoAFPNET', 'application/xlsx');
    this.fileSustento = UploadFile.fileUrl;
    const param = [];
    // const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    // param.push('T1¡nIdTipoSpp!' + this.nIdTipoSpp);
    param.push('T1¡nIdTipoSpp!' + this.nIdTipoSpp);
    param.push('T1¡nIdDevengue!' + this.nIdDevengue);
    param.push('T1¡sFileSustento!' + this.fileSustento);
    param.push('T1¡bEstado!' + 0);
    param.push('T1¡nIdRegUser!' + uid);
    param.push('T1¡dtReg!getdate()');
    const nIdAfpNet =  await this.service._crudDA(1, param);

    const param2 = [];
    // param2.push('T1¡nIdTipoSpp!' + this.nIdTipoSpp);
    param2.push('0¡C.nIdRegPen!' + this.nIdRegPen);
    let rElement;
    await this.service._loadSP( 7, param2).then( (value: IListaDetalleAFP[]) => {
       rElement = value;
    });

    await rElement.forEach(x => {
      const param3 = [];
      // const id = nIdAfpNet[0];
      param3.push('T1¡' + nIdAfpNet[0]);
      param3.push('T1¡nIdPerLab!' + x.nIdPerLab);
      param3.push('T1¡nIdRegPen!' + x.nIdRegPen);
      param3.push('T1¡nMonto!' + x.nMonto);
      const nIdDetAFP = this.service._crudDA(2, param3);


    });
    this.spi.hide('spi_export');
    Swal.fire(
      'Se subio el archivo Correctamente',
      'Se subieron los datos correctamente.',
      'success'
   );
   this.fnGetListaAFP();

  }

  public async devengueSeleccionado(): Promise<void> {
    const valor = this.formFiltro.controls['nIdDevengue'].value;
    console.log(valor);

  }
    //#region GENERALES
async delay(ms: number) {
  await new Promise<void>((resolve) =>
    setTimeout(() => resolve(), ms)
  ).then();
}

public async eliminarExcel(urlDocumentoExcel: string) {
  const urlSplit = urlDocumentoExcel.split("/");
  const nombre = urlSplit[urlSplit.length - 1];
  await this.service
    ._eliminarExcel(nombre, "xlsm")
    .then((valor) => {
      console.log(valor);
    });
}
//#endregion

async getStringFromFile(fSustento: File) {
  return new Promise<any>( (resolve, reject) => {

    const reader = new FileReader();
    reader.readAsDataURL(fSustento);
    reader.onload = () => {
      resolve(reader.result);
    };

  });
}

CerrarVentana() {

  // if(this.CantSustento > 0) {
    const oReturn = new Object();

    oReturn['modal'] = 'export';
    oReturn['value'] = 'loadAgain';
    this.activeModal.close(oReturn);
  // } else {
  //   this.activeModal.close();
  // }
}

}


interface IListaAFP{
  nIdRegPen: number;
  nIdTipoSpp: number;
  sDesc: string;
  sFondoPension: number;
  sRetencionRetribucion: number;
  nIdAfpNet: number;
  dis: boolean;
}


interface IListaDetalleAFP{
  nIdTipoSpp: number;
  nIdRegPen: number;
  nIdPersonal: number;
  nIdPerLab: number;
  nMonto: number;
}