import { Component, OnInit, Type } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { ControlapService } from '../../Services/controlap.service';
import { DeclaracionpService } from '../../Services/declaracionp.service';
import { DeclaracionpVersusComponent } from './Modals/declaracionp-versus/declaracionp-versus.component';

// Modals
const MODALS: { [name: string]: Type<any> } = {
  comparativa: DeclaracionpVersusComponent
};

@Component({
  selector: 'app-declaracionp',
  templateUrl: './declaracionp.component.html',
  styleUrls: ['./declaracionp.component.css'],
  animations: [adminpAnimations],
})
export class DeclaracionpComponent implements OnInit {

  fbDetail = [
    { icon: 'calendar_today', tool: 'Cambiar devengue' },
    { icon: 'person_add_alt_1', tool: 'Altas masivas' },
    { icon: 'person_remove_alt_1', tool: 'Bajas masivas' },
    { icon: 'file_present', tool: 'Generar archivos' },
    //{ icon: 'download_for_offline', tool: 'Descargar archivos' },
    { icon: 'compare', tool: 'Comparativa' },
  ];
  abDetail = [];
  tsDetail = "inactive";

  // FormGroup
  fgDeclaracion: FormGroup;

  // Progress Bar
  pbMain: boolean;

  // Devengue
  nIdDevengue: number;
  dFechDevengue: Date = null;
  maxDay = 0;
  sHeaderDevengue = '';

  // Array
  DevengueBackup = new Array();

  anioDevengue: string = '';
  mesDevengue: string = '';

  // Modal Config
  ngbModalOptions: NgbModalOptions = {
    size: 'xl',
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: 'static',
    windowClass: 'modal-holder'
  };

  // documentos = [
  //   { name: "Detalle de ingresos, tributos y descuentos, archivo con extensión '.REM'", checked: true },
  //   { name: "Datos de la jornada laboral, archivo con extensión '.JOR'", checked: true },
  //   { name: "Días subsidiados y otros no laborados, archivo con extensión '.SNL'", checked: true },
  //   { name: "Otras condiciones '.TOC'", checked: true },
  //   { name: "Modalidad formativa laboral y otros, archivo con extensión '.FOR'", checked: true }
  // ];

  constructor(
    private declaracionpService: DeclaracionpService,
    public controlapService: ControlapService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _modalService: NgbModal) {

    this.onInitFrmGrpDeclaracion();
  }

  async ngOnInit(): Promise<void> {
    this.spinner.show("spi_main");
    //this.pbMain = true;

    this.delay(250).then((any) => {
      this.tsDetail = "active";
      this.abDetail = this.fbDetail;
    });

    await this.onConsultarDevengue();

    //this.pbMain = false;

  }

  onHideSpinner() {
    this.spinner.hide("spi_main");
  }

  async onConsultarDevengue() {
    const param = [];
    const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));

    param.push('0¡nIdEmp!' + nIdEmp);
    // param.push('2¡nIdEstado!2');

    await this.controlapService._loadSP(1, param).then((value: any[]) => {
      if (value.length > 0) {

        this.DevengueBackup = value;

        const iDevengue = value.findIndex(x => x.nIdEstado === 0 || x.nIdEstado === 1);
        this.nIdDevengue = value[iDevengue].nIdDevengue as number;

        const sEjercicio = (value[iDevengue].nEjercicio as number).toString();
        let sMes = (value[iDevengue].nMes as number).toString();
        sMes = (sMes.length === 1) ? '0' + sMes : sMes;

        const sFechDevengeue = '01/' + sMes + '/' + sEjercicio;
        this.dFechDevengue = moment(sFechDevengeue, 'DD/MM/YYYY').toDate();

        this.mesDevengue = sMes;
        this.anioDevengue = sEjercicio;

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

      this.onVisualizarResumen(this.nIdDevengue);
    }

  }

  onInitFrmGrpDeclaracion() {
    this.fgDeclaracion = this.fb.group({
      chkREM: true,
      chkJOR: true,
      chkSNL: true,
      chkTOC: true,
      chkFOR: true
    });
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  onToggleFab(stat: number) {
    stat = stat === -1 ? (this.abDetail.length > 0 ? 0 : 1) : stat;
    this.tsDetail = stat === 0 ? "inactive" : "active";
    this.abDetail = stat === 0 ? [] : this.fbDetail;
  }

  onClickFab(index: number) {

    const param = [];

    switch (index) {
      case 0: // Cambio de devengue

        const iOptions: { [inputValue: number]: string; } = {};
        const iOption: {
          nIdDevengue: number;
          sDevengue: string;
        }[] = [];

        moment.locale('es');
        this.DevengueBackup.forEach(x => {

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

        Swal.fire({
          title: 'Seleccionar Devengue',
          icon: 'info',
          text: 'Al cambiar el devengue se mostrará la información relacionada al mes y año en cuestión.',
          input: 'select',
          inputOptions: iOptions,
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

          if (this.nIdDevengue === nIdNewD) {
            this._snackBar.open('No se realizó ningún cambio.', 'Cerrar', {
              duration: 1000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          } else {

            const aDevengue = this.DevengueBackup;
            const iDevengue = aDevengue.findIndex(x => x.nIdDevengue === nIdNewD);
            this.nIdDevengue = aDevengue[iDevengue].nIdDevengue as number;

            const sEjercicio = (aDevengue[iDevengue].nEjercicio as number).toString();
            let sMes = (aDevengue[iDevengue].nMes as number).toString();
            sMes = (sMes.length === 1) ? '0' + sMes : sMes;

            const sFechDevengeue = '01/' + sMes + '/' + sEjercicio;
            this.dFechDevengue = moment(sFechDevengeue, 'DD/MM/YYYY').toDate();

            const tDate = moment(this.dFechDevengue).format('MMMM [del] YYYY');
            this.sHeaderDevengue = tDate[0].toUpperCase() + tDate.substr(1).toLowerCase();

            this.spinner.show('spi_main');
            this.onVisualizarResumen(this.nIdDevengue);
            this.spinner.hide('spi_main');

          }
        });
        break;

      case 1: // Altas masivas

        Swal.fire({
          title: 'Confirmar generación de archivos de altas',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: `Aceptar`,
          cancelButtonText: `Cancelar`
        }).then((result) => {
          if (result.isConfirmed) {
            this.pbMain = true;
            this.spinner.show("spi_main");

            param.push(this.nIdDevengue);

            this.declaracionpService.generarArchivo(2, param).subscribe((response) => {
              var blob = new Blob([response], { type: 'application/text' });
              saveAs(blob, 'RP_20304269759.est');
            });

            this.declaracionpService.generarArchivo(3, param).subscribe((response) => {
              var blob = new Blob([response], { type: 'application/text' });
              saveAs(blob, 'RP_20304269759.cta');
            });

            this.declaracionpService.generarArchivo(4, param).subscribe((response) => {
              var blob = new Blob([response], { type: 'application/text' });
              saveAs(blob, 'RP_20304269759.per');
            });

            this.declaracionpService.generarArchivo(5, param).subscribe((response) => {
              var blob = new Blob([response], { type: 'application/text' });
              saveAs(blob, 'RP_20304269759.ide');
            });

            this.declaracionpService.generarArchivo(6, param).subscribe((response) => {
              var blob = new Blob([response], { type: 'application/text' });
              saveAs(blob, 'RP_20304269759.tra');
            });

            this.spinner.hide("spi_main");
            this.pbMain = false;
          }
        })

        break;

      case 2: // Bajas masivas

        Swal.fire({
          title: 'Confirmar generación de archivo de bajas',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: `Aceptar`,
          cancelButtonText: `Cancelar`
        }).then((result) => {
          if (result.isConfirmed) {
            this.pbMain = true;
            this.spinner.show("spi_main");

            this.declaracionpService.generarArchivo(7, param).subscribe((response) => {
              var blob = new Blob([response], { type: 'application/text' });
              saveAs(blob, 'RP_20304269759.per');
            });

            this.spinner.hide("spi_main");
            this.pbMain = false;
          }
        })

        break;

      case 3: // Archivos PLAME

        Swal.fire({
          title: 'Confirmar generación de archivos PLAME',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: `Aceptar`,
          cancelButtonText: `Cancelar`
        }).then((result) => {
          if (result.isConfirmed) {
            this.pbMain = true;
            this.spinner.show("spi_main");

            const filename = '0601' + this.anioDevengue + this.mesDevengue + '20304269759';

            param.push(this.nIdDevengue);

            if (this.fgDeclaracion.controls["chkREM"].value) {
              this.declaracionpService.generarArchivo(8, param).subscribe((response) => {
                var blob = new Blob([response], { type: 'application/text' });
                saveAs(blob, filename + '.rem');
              });
            }

            if (this.fgDeclaracion.controls["chkJOR"].value) {
              this.declaracionpService.generarArchivo(9, param).subscribe((response) => {
                var blob = new Blob([response], { type: 'application/text' });
                saveAs(blob, filename + '.jor');
              });
            }

            if (this.fgDeclaracion.controls["chkSNL"].value) {
              this.declaracionpService.generarArchivo(10, param).subscribe((response) => {
                var blob = new Blob([response], { type: 'application/text' });
                saveAs(blob, filename + '.snl');
              });
            }

            if (this.fgDeclaracion.controls["chkTOC"].value) {
              this.declaracionpService.generarArchivo(11, param).subscribe((response) => {
                var blob = new Blob([response], { type: 'application/text' });
                saveAs(blob, filename + '.toc');
              });
            }

            if (this.fgDeclaracion.controls["chkFOR"].value) {
              this.declaracionpService.generarArchivo(12, param).subscribe((response) => {
                var blob = new Blob([response], { type: 'application/text' });
                saveAs(blob, filename + '.for');
              });
            }

            this.spinner.hide("spi_main");
            this.pbMain = false;
          }
        })

        break;

      case 4:

        console.log('comparativa');

        this.delay(250).then(any => {
          this.abDetail = [];
          this.tsDetail = 'inactive';
        });

        //this.ngbModalOptions.size = 'lg';
        this.openModal('comparativa');

        break;
    }
  }

  openModal(name: string) {
    const modalRef = this._modalService.open(MODALS[name], this.ngbModalOptions);

    switch (name) {
      case 'comparativa':

        break;
    };

    modalRef.result.then((result) => {

    }, (reason) => { });

  }

  async onVisualizarResumen(nIdDevengue: number) {
    //this.pbMain = true;

    const param = [];

    // param.push('0¡nIdEmp!' + this.nIdDevengue);
    param.push(nIdDevengue);

    await this.declaracionpService.print(1, param).then((result: any) => {
      let objectURL: any = URL.createObjectURL(result);
      const pdfFrame = document.getElementById("pdf-resumen") as HTMLIFrameElement;
      pdfFrame.src = "";
      pdfFrame.src = objectURL;
      objectURL = URL.revokeObjectURL(result);
    });

    //this.pbMain = false;
  }

}
