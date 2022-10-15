import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import fileSaver from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { DeclaracionaService } from '../../declaraciona.service';
import { declaracionaCompareAnimations } from './declaraciona-compare.animations';


@Component({
  selector: 'app-declaraciona-compare',
  templateUrl: './declaraciona-compare.component.html',
  styleUrls: ['./declaraciona-compare.component.css','./declaraciona-compare.component.scss'],
  animations : [adminpAnimations]
})
export class DeclaracionaCompareComponent implements OnInit {

  @Input() fromParent;
  toggleCompare = 1;
  tadaCompare = 'inactive';
  pagIni = 1;
  pagFin = 100;
  pagTotal = 0;

  step = 0;

  totalGrupo = 0;
  grupoActual = 1;
  SumandoUploadExcel = 0;

  cboPlanilla = new Array();
  ListaComparados: IListaExportCompareAFP[];
  IdPlanilla = 0;

  CompararDC: string[] = ['Documento', 'Nombres', 'DifCUSPP', 'DifAFP', 'Dif.Comision','more'];
  CompararDS: MatTableDataSource<IListaExportCompareAFP>;
  TemporalComparar: IListaExportCompareAFP[];

  MainDC: string[] = [ 'NroOden', 'TipoDocumento', 'Documento', 'Nombres'];
  MainDS: MatTableDataSource<IListaCompareAFP>;
  MainDS_Static:  IListaCompareAFP[];
  MainDS_Excel:  IListaCompareAFP[];
  ListaExcel: string[] = [];
 @ViewChild('pagMain', {static: true}) pagMain: MatPaginator;
 @ViewChild('pagComparar', {static: true}) pagComparar: MatPaginator;
 expandedMore: null;

  tsCompare = 'active';
  fbCompare = [
    {icon: 'contact_page', tool: 'Cambiar Planilla', dis: false , badge: 0 },
    {icon: 'compare', tool: 'Generar Comparativa', dis: true , badge: 0 },
    {icon: 'cloud_upload', tool: 'Cargar excel', dis: false , badge: this.SumandoUploadExcel},
    {icon: 'cloud_download', tool: 'Generar excel', dis: false, badge: 0},
    {icon: 'skip_previous', tool: 'Anterior Grupo', dis: true, badge: 0},
    {icon: 'skip_next', tool: 'Siguiente Grupo', dis: false, badge: 0},
  ];
  abCompare = [];
  fbSave = [
    {icon: 'save', tool: 'Actualizar Datos', dis: false , badge: 0 },
    {icon: 'cleaning_services', tool: 'Limpiar', dis: false , badge: 0 },
    {icon: 'cancel', tool: 'Cancelar', dis: false , badge: 0 },
  ];


  @ViewChild('epListPersonas') epListPersonas: MatExpansionPanel;
  @ViewChild('epListComparar') epListComparar: MatExpansionPanel;
  constructor(public activeModal: NgbActiveModal,
    public service: DeclaracionaService,
    public fb: FormBuilder,
    private spi: NgxSpinnerService,
    private _snackBar: MatSnackBar) { }

    async ngOnInit(): Promise<void> {
      this.IdPlanilla = this.fromParent.nIdPlanilla;
      this.fnGetListaCompare();
      this.DisableBoton();
      this.prevStep();

    }

   setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step = 2;
  }

  prevStep() {
    this.step = 1;
  }


   onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abCompare.length > 0 ) ? 0 : 1 : stat;
        this.tsCompare = ( stat === 0 ) ? 'inactive' : 'active';
        this.abCompare = ( stat === 0 ) ? [] : this.fbCompare;
        break;
      case 2:
        stat = ( stat === -1 ) ? ( this.abCompare.length > 0 ) ? 0 : 1 : stat;
        this.tsCompare = ( stat === 0 ) ? 'inactive' : 'active';
        this.abCompare = ( stat === 0 ) ? [] : this.fbSave;
    }
  }

  // onToggleFab(fab: number, stat: number) {
  //   switch (fab) {
  //     case 1:
  //       if ( stat === -1 ) {
  //         if (this.abCompare.length > 0) {
  //           stat = 0;
  //         }
  //       }

  //       this.tsCompare = ( stat === 0 ) ? 'inactive' : 'active2';

  //       switch (stat) {
  //         case 0:
  //           this.abCompare = [];
  //           break;
  //         case 1:
  //           this.abCompare = this.fbCompare;
  //           break;
  //         case 2:
  //           this.abCompare = this.fbSave;
  //           break;
  //       }
  //       break;
  //   }

  // }

  public clickFab(opcion: number, ibtn: number): void {
    switch (opcion) {

      case 1 :
      switch (ibtn) {
        case 0:
          this.SwalPlanilla();
        break;
        case 1:
          Swal.fire({
            title: '¿ Está seguro de generar comparativa ?',
            // text: 'Todo el personal de la lista se actualizara.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff4081',
            confirmButtonText: 'Confirmar !',
            allowOutsideClick: false
          }).then((result) => {
            if (result.isConfirmed) {
          this.CompararExcel();
          Swal.fire(
          'Carga satisfactoria',
          'La actualización se realizo correctamente.',
          'success'
          );
          }
          });
        break;
        case 2:
          this.CargarExcel();
        break;
        case 3:
          this._generarExcelPlla();
        break;
        case 4:
          this.pagIni = this.pagIni - 100;
          this.pagFin = this.pagIni  + 99;
           this.DisableBoton();
          this.grupoActual--;
          this.fnListar100( this.MainDS_Static);
        break;
        case 5:
          this.pagIni = this.pagIni + 100;
          this.pagFin = this.pagFin  + 100;
          if (this.pagFin > this.pagTotal) {
            this.pagFin = this.pagTotal;
          }
          this.DisableBoton();
          this.grupoActual++;
          this.fnListar100( this.MainDS_Static);
          break;
          default:
            break;
      }
      break;
      case 2 :
      switch (ibtn) {
      case 0:
        this.SaveCompare();
        break;
      case 1:
        this.CleanCompare();
        break;
      case 2:
        this.CancelarCompare();
        break;
      }
      break;
    }
  }

  async uploadFile2(event) {
    let fileurl ;
    if (event.target.files[0]) {
      fileurl = event.target.files[0];
    }
  }

  async fnGetListaCompare() {
    const param = [];

    this.pagIni = 1;
    this.pagFin = 100;
    // const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
    param.push('0¡E.sCodPlla!' + this.IdPlanilla );

    this.spi.show('spi_compare');

    await this.service._loadSP( 8, param).then( (value: IListaCompareAFP[]) => {
      this.MainDS_Static = value;
      this.pagTotal = value.length;
      if (this.pagFin > this.pagTotal ){
        this.fbCompare[5].dis = true;
        this.pagFin = this.pagTotal;
      } else {
        this.fbCompare[5].dis = false;
      }
    });
    await this.fnListar100( this.MainDS_Static);

    if (this.pagTotal <= 0) {
      this.fbCompare[2].dis = true;
      this.fbCompare[3].dis = true;
    } else {
      this.fbCompare[2].dis = false;
      this.fbCompare[3].dis = false;
    }

    const dividir =  this.pagTotal / 100;
    this.totalGrupo = Math.ceil(dividir);

    this.spi.hide('spi_compare');
  }

  async fnListar100(value: IListaCompareAFP[]){
    const datos2 = value.filter(x => x.sNroOrden >= this.pagIni && x.sNroOrden <= this.pagFin);
    this.MainDS = new MatTableDataSource(datos2);
    this.MainDS_Excel = datos2;
    this.MainDS.paginator = this.pagMain;

  }
  async DisableBoton(){
    if (this.pagIni == 1) {
      this.fbCompare[4].dis = true;
      this.onToggleFab(1, 1);
    } else {
      this.fbCompare[4].dis = false;
      this.onToggleFab(1, 1);
    }
    if (this.pagFin == this.pagTotal) {
      this.fbCompare[5].dis = true;
      this.onToggleFab(1, 1);
    } else {
      this.fbCompare[5].dis = false;
      this.onToggleFab(1, 1);
    }
  }

  private async _generarExcelPlla() {
    await this.service._excelPlla( this.MainDS_Excel).then(async (data: any) => {
    this.spi.show('spi_compare');
      const datos = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const dateCurrent = new Date();
      const anio = dateCurrent.getFullYear();
      const mes = dateCurrent.getMonth() + 1;
      const fname = 'plla_' + this.IdPlanilla + '_grupo' + this.grupoActual + '.xlsx';
      this.delay(1000).then(any => {
        fileSaver.saveAs(datos, fname);
        });
    this.spi.hide('spi_compare');
    });
  }

  async CargarExcel( pushParam?: any) {
    ( function($) {
      $('#uploadFile3').click();
    })(jQuery);

    // const IdDevengue = this.nIdDevengue;
  }


  async uploadFile3(event) {
    let fileurl ;
    if (event.target.files[0]) {
      fileurl = event.target.files[0];
    const user = localStorage.getItem('currentUser');
    const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
    const sFile = await this.getStringFromFile(fileurl);
    const iFile = sFile.indexOf(',') + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);
    // const UploadFile: any = await this.service._uploadFile(sFileSustento, 8, 'SustentoAFPNET', 'application/xlsx');
    // const fileSustento = UploadFile.fileUrl;
    this.ListaExcel.push(sFileSustento);
    console.log(this.ListaExcel);
    this.SumandoUploadExcel++;

    this.fbCompare[1].badge = this.SumandoUploadExcel;
    if(this.totalGrupo == this.SumandoUploadExcel){
    this.fbCompare[2].dis = true;
    }
    // this.totalGrupo
    this.fbCompare[1].dis = false;
    this.onToggleFab(1, 1);
    this._snackBar.open('Excel cargado exitosamente.', 'Cerrar', {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 1000,
      // panelClass :
    });
    }
  }

  async getStringFromFile(fSustento: File) {
    return new Promise<any>( (resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fSustento);
      reader.onload = () => {
        resolve(reader.result);
      };
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

 async SwalPlanilla() {
    await this.cboGetPlanilla();
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
      if( nIdNewD > 0){
        this.IdPlanilla = nIdNewD;
        await this.fnGetListaCompare();
      }
    });
  }

async CompararExcel(){
  this.spi.show('spi_compare');

  const params = {
    lstfile: this.ListaExcel,
    IdPlanilla: this.IdPlanilla
};

   await this.service._UploadFileDAComparar(params).then( (value: IListaExportCompareAFP[]) => {
    this.TemporalComparar = value;
    this.CompararDS = new MatTableDataSource(value);
    this.CompararDS.paginator = this.pagComparar;
  });
  if (this.TemporalComparar.length >0 ){
    this.onToggleFab(1, -1);
    this.delay(1000).then(any => {
      this.nextStep();
      this.toggleCompare = 2;
      this.onToggleFab(2, 1);
      this.spi.hide('spi_compare');
      });
  } else {
    Swal.fire(
      'No se encontraron coincidencias',
      'Los datos del archivo son iguales a los del sistema.',
     'error'
   );
   this.spi.hide('spi_compare');
  }
}

async SaveCompare() {
  const user = localStorage.getItem('currentUser');
  const uid = JSON.parse(window.atob(user.split('.')[1])).uid;
  Swal.fire({
    title: '¿ Está seguro de actualizar ?',
    text: 'Todo el personal de la lista se actualizara.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ff4081',
    confirmButtonText: 'Confirmar !',
    allowOutsideClick: false
  }).then((result) => {
    if (result.isConfirmed) {
      this.onToggleFab(2, -1);
      this.spi.show('spi_compare');
      this.TemporalComparar.forEach(x => {

        if ( x.nIdPerLab !=0 ) {
          const param = [];
          param.push('T1¡sCuspp!' + x.sCUSPP_W);
          param.push('T1¡nIdRegPen!' + x.nIdRegPen);
          param.push('T1¡nIdPerLab!' + x.nIdPerLab);
          param.push('T1¡sModUser!' + uid);
          param.push('T1¡dtMod!GETDATE');
          const nIdAfpNet =   this.service._crudDA(3, param);
        }

      });
      this.spi.hide('spi_compare');
      Swal.fire(
         'Registro satisfactorio',
        'La actualización se realizo correctamente.',
        'success'
      );
      this.CleanCompare();
    }
  });
}

CancelarCompare(){
  this.onToggleFab(2 , -1);
  this.spi.show('spi_compare');

  this.delay(1000).then(any => {
  this.toggleCompare = 1;
  this.CompararDS = new MatTableDataSource();
  this.prevStep();
    this.onToggleFab(1 , 1);

  });
  this.spi.hide('spi_compare');

}

 CleanCompare(){
  this.onToggleFab(2 , -1);
  this.spi.show('spi_compare');

  this.delay(1000).then(any => {
    this.toggleCompare = 1;
    this.CompararDS = new MatTableDataSource();
    this.ListaExcel = [];
    this.SumandoUploadExcel = 0;
    this.fbCompare[1].badge = this.SumandoUploadExcel;
    this.fbCompare[1].dis = true;
    this.fnGetListaCompare();
    this.DisableBoton();
    this.prevStep();
    this.onToggleFab(1 , 1);
  });
  this.spi.hide('spi_compare');
}

async delay(ms: number) {
  await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then();
}


}

interface IListaCompareAFP{
  sNroOrden: number;
  nIdTipoDoc: number;
  sTipoDocumento: string;
  sDocumento: string;
  sApePa: string;
  sApeMa: string;
  sNombres: string;
  sCodPlla: string;
  sFec_Ingreso: string;
}

interface IListaExportCompareAFP{
  nIdPersonal: number;
  nIdPerLab: number;
  nIdRegPen: number;
  sDocumento: string;
  sApePa: string;
  sApeMa: string;
  sNombres: string;
  sCUSPP_S: string;
  sCUSPP_W: string;
  sDIFCUSPP: string;
  sAFP_S: string;
  sAFP_W: string;
  sDIFAFP: string;
  sCOMI_S: string;
  sCOMI_W: string;
  sDIFCOMI: string;
}
