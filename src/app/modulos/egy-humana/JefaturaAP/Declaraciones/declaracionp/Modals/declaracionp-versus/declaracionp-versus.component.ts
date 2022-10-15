import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, MaxLengthValidator, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../../../Animations/adminp.animations';
import { IReporte2, IReportMatch1, IReportMatch2, IReporte1, IReportMatch3, IReportMatch4, IReportMatch5, IReporte3, IReporte4, IReporte5 } from '../../../../Model/ldeclaracionp';
import { DeclaracionpService } from '../../../../Services/declaracionp.service';

import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

declare var jQuery: any;

@Component({
  selector: 'app-declaracionp-versus',
  templateUrl: './declaracionp-versus.component.html',
  styleUrls: ['./declaracionp-versus.component.css'],
  providers: [DeclaracionpService],
  animations: [adminpAnimations]
})
export class DeclaracionpVersusComponent implements OnInit {

  displayedColumns1: string[] = ['nombres', 'codigoPlanilla', 'tipoDocumento', 'numeroDocumento', 'fechaIngreso', 'fechaCese', 'regimenPensionarioERP', 'regimenPensionarioTXT', 'observacion'];
  displayedColumns2: string[] = ['nombres', 'codigoPlanilla', 'tipoDocumento', 'numeroDocumento', 'fechaIngreso', 'fechaCese'];
  displayedColumns3: string[] = ['nombres', 'codigoPlanilla', 'tipoDocumento', 'numeroDocumento', 'fechaIngreso', 'fechaCese'];
  displayedColumns4: string[] = ['nombres', 'codigoPlanilla', 'tipoDocumento', 'numeroDocumento', 'fechaIngreso', 'fechaCese'];
  displayedColumns5: string[] = ['nombres', 'codigoPlanilla', 'tipoDocumento', 'numeroDocumento', 'fechaIngreso', 'fechaCese'];

  dataSource1: MatTableDataSource<IReportMatch1>;
  dataSource2: MatTableDataSource<IReportMatch2>;
  dataSource3: MatTableDataSource<IReportMatch3>;
  dataSource4: MatTableDataSource<IReportMatch4>;
  dataSource5: MatTableDataSource<IReportMatch5>;

  @ViewChild(MatPaginator, { static: true }) paginator1: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) paginator2: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) paginator3: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) paginator4: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) paginator5: MatPaginator;

  urlDocumentoTextImportado = "";

  vArchivoSeleccionado: File;
  filestring: string;
  filename: string;

  // FormGroup
  fgReportes: FormGroup;

  // Progress Bar
  pbaReporte1: boolean = false;
  pbaReporte2: boolean = false;
  pbaReporte3: boolean = false;
  pbaReporte4: boolean = false;
  pbaReporte5: boolean = false;

  // Reporte 1
  lstReporte1File: Array<IReporte1> = new Array();
  lstReporte1ERP: Array<IReporte1> = new Array();
  lstReportMatch1: Array<IReportMatch1> = new Array();

  // Reporte 2
  lstReporte2File: Array<IReporte2> = new Array();
  lstReporte2ERP: Array<IReporte2> = new Array();
  lstReportMatch2: Array<IReportMatch2> = new Array();

  // Reporte 3
  lstReporte3File: Array<IReporte3> = new Array();
  lstReporte3ERP: Array<IReporte3> = new Array();
  lstReportMatch3: Array<IReportMatch3> = new Array();

  // Reporte 4
  lstReporte4File: Array<IReporte4> = new Array();
  lstReporte4ERP: Array<IReporte4> = new Array();
  lstReportMatch4: Array<IReportMatch4> = new Array();

  // Reporte 5
  lstReporte5File: Array<IReporte5> = new Array();
  lstReporte5ERP: Array<IReporte5> = new Array();
  lstReportMatch5: Array<IReportMatch5> = new Array();

  // Fab
  fbReport = [
    { icon: 'cloud_download', tool: 'Exportar', dis: false, color: 'secondary' },
    { icon: 'cloud_upload', tool: 'Cargar archivo', dis: false, color: 'secondary' },
    { icon: 'compare', tool: 'Comparar', dis: true, color: 'secondary' },
    { icon: 'cleaning_services', tool: 'Limpiar', dis: true, color: 'secondary' }
  ];

  abReport1 = [];
  tsReport1 = 'inactive';

  abReport2 = [];
  tsReport2 = 'inactive';

  abReport3 = [];
  tsReport3 = 'inactive';

  abReport4 = [];
  tsReport4 = 'inactive';

  abReport5 = [];
  tsReport5 = 'inactive';

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    public activeModal: NgbActiveModal,
    private declaracionpService: DeclaracionpService,
    private snackBar: MatSnackBar
  ) {

    this.dataSource1 = new MatTableDataSource();
    this.dataSource2 = new MatTableDataSource();
    this.dataSource3 = new MatTableDataSource();
    this.dataSource4 = new MatTableDataSource();
    this.dataSource5 = new MatTableDataSource();

    this.fgReportes = this.formBuilder.group({
      fileUploadTxt1: ['', Validators.required],
      fileUploadTxt2: ['', Validators.required],
      fileUploadTxt3: ['', Validators.required],
      fileUploadXml4: ['', Validators.required],
      fileUploadXml5: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.spinner.show("spi_comparativa");

    this.dataSource1.paginator = this.paginator1;
    this.dataSource2.paginator = this.paginator2;
    this.dataSource3.paginator = this.paginator3;
    this.dataSource4.paginator = this.paginator4;
    this.dataSource5.paginator = this.paginator5;

    this.spinner.hide("spi_comparativa");
  }

  async onSubirDocumento(reporte: string) {
    switch (reporte) {
      case "Reporte1":
        if (this.lstReporte1File.length > 0) {
          Swal.fire({
            title: 'Información',
            text: 'Existe un archivo seleccionado. ¿Desea reemplazarlo?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Reemplazar`,
            cancelButtonText: `Cancelar`
          }).then((result) => {
            if (result.isConfirmed) {

              this.onLimpiar(reporte);

              (function ($) {
                $('#uploadFileTxt1').click();
              })(jQuery);
            }
            else if (result.dismiss === Swal.DismissReason.cancel) {
              this.snackBar.open('Acción cancelada por el usuario.', 'Cerrar', {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
              });
            }
          })
        }
        else {
          (function ($) {
            $('#uploadFileTxt1').click();
          })(jQuery);
        }
        break;

      case "Reporte2":
        if (this.lstReporte2File.length > 0) {
          Swal.fire({
            title: 'Información',
            text: 'Existe un archivo seleccionado. ¿Desea reemplazarlo?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Reemplazar`,
            cancelButtonText: `Cancelar`
          }).then((result) => {
            if (result.isConfirmed) {

              this.onLimpiar(reporte);

              (function ($) {
                $('#uploadFileTxt2').click();
              })(jQuery);
            }
            else if (result.dismiss === Swal.DismissReason.cancel) {
              this.snackBar.open('Acción cancelada por el usuario.', 'Cerrar', {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
              });
            }
          })
        }
        else {
          (function ($) {
            $('#uploadFileTxt2').click();
          })(jQuery);
        }
        break;

      case "Reporte3":
        if (this.lstReporte3File.length > 0) {
          Swal.fire({
            title: 'Información',
            text: 'Existe un archivo seleccionado. ¿Desea reemplazarlo?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Reemplazar`,
            cancelButtonText: `Cancelar`
          }).then((result) => {
            if (result.isConfirmed) {

              this.onLimpiar(reporte);

              (function ($) {
                $('#uploadFileTxt3').click();
              })(jQuery);
            }
            else if (result.dismiss === Swal.DismissReason.cancel) {
              this.snackBar.open('Acción cancelada por el usuario.', 'Cerrar', {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
              });
            }
          })
        }
        else {
          (function ($) {
            $('#uploadFileTxt3').click();
          })(jQuery);
        }
        break;

      case "Reporte4":
        if (this.lstReporte4File.length > 0) {
          Swal.fire({
            title: 'Información',
            text: 'Existe un archivo seleccionado. ¿Desea reemplazarlo?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Reemplazar`,
            cancelButtonText: `Cancelar`
          }).then((result) => {
            if (result.isConfirmed) {

              this.onLimpiar(reporte);

              (function ($) {
                $('#uploadFileXml4').click();
              })(jQuery);
            }
            else if (result.dismiss === Swal.DismissReason.cancel) {
              this.snackBar.open('Acción cancelada por el usuario.', 'Cerrar', {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
              });
            }
          })
        }
        else {
          (function ($) {
            $('#uploadFileXml4').click();
          })(jQuery);
        }
        break;

      case "Reporte5":
        if (this.lstReporte5File.length > 0) {
          Swal.fire({
            title: 'Información',
            text: 'Existe un archivo seleccionado. ¿Desea reemplazarlo?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Reemplazar`,
            cancelButtonText: `Cancelar`
          }).then((result) => {
            if (result.isConfirmed) {

              this.onLimpiar(reporte);

              (function ($) {
                $('#uploadFileXml5').click();
              })(jQuery);
            }
            else if (result.dismiss === Swal.DismissReason.cancel) {
              this.snackBar.open('Acción cancelada por el usuario.', 'Cerrar', {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
              });
            }
          })
        }
        else {
          (function ($) {
            $('#uploadFileXml5').click();
          })(jQuery);
        }
        break;

      default:
        break;
    }
  }

  async onComparar(reporte: string) {

    switch (reporte) {
      case "Reporte1":
        this.onCompararReporte1();
        break;

      case "Reporte2":
        this.onCompararReporte2();
        break;

      case "Reporte3":
        this.onCompararReporte3();
        break;

      case "Reporte4":
        this.onCompararReporte4();
        break;

      case "Reporte5":
        this.onCompararReporte5();
        break;

      default:
        break;
    }
  }

  async onCompararReporte1() {
    this.pbaReporte1 = true;

    const param = [];

    await this.declaracionpService._loadSP(13, param).then((data: any) => {
      this.lstReporte1ERP = data;

      this.lstReporte1ERP.forEach(x => {
        this.lstReporte1File.forEach(y => {
          if (x.numeroDocumento === y.numeroDocumento && x.tipoRegimenPensionario !== y.tipoRegimenPensionario) {

            this.lstReportMatch1.push({
              nombres: x.apellidoPaterno + ' ' + x.apellidoMaterno + ' ' + x.nombres,
              codigoPlanilla: x.codigoPlanilla,
              tipoDocumento: x.tipoDocumento,
              numeroDocumento: x.numeroDocumento,
              fechaIngreso: x.fechaIngreso,
              fechaCese: x.fechaCese,
              regimenPensionarioERP: x.tipoRegimenPensionario,
              regimenPensionarioTXT: y.tipoRegimenPensionario,
              cuspp: x.cuspp,
              observacion: "Actualizar en el T-Registro el régimen pensionario."
            });
          }
        });
      });

      if (this.lstReportMatch1.length > 0) {
        this.dataSource1 = new MatTableDataSource(this.lstReportMatch1);
        this.dataSource1.paginator = this.paginator1;

        this.snackBar.open('Se encontraron diferencias', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        // Fab
        this.fbReport[3].dis = false;
      }
      else {
        this.snackBar.open('No se encontraron diferencias', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    });

    this.pbaReporte1 = false;
  }

  async onCompararReporte2() {
    this.pbaReporte2 = true;

    const param = [];
    let existe: boolean = false;

    await this.declaracionpService._loadSP(14, param).then((data: any) => {
      this.lstReporte2ERP = data;

      this.lstReporte2ERP.forEach(x => {
        this.lstReporte2File.forEach(y => {
          if (x.numeroDocumento === y.numeroDocumento) {
            existe = true;
          }
        });

        if (!existe) {
          this.lstReportMatch2.push({
            nombres: x.apellidoPaterno + ' ' + x.apellidoMaterno + ', ' + x.nombres,
            codigoPlanilla: x.codigoPlanilla,
            tipoDocumento: x.tipoDocumento,
            numeroDocumento: x.numeroDocumento,
            fechaIngreso: x.fechaIngreso,
            fechaCese: x.fechaCese,
            observacion: "Dar de alta en el T-Registro."
          });

          existe = false;
        }
      });

      if (this.lstReportMatch2.length > 0) {
        this.dataSource2 = new MatTableDataSource(this.lstReportMatch2);
        this.dataSource2.paginator = this.paginator2;

        this.snackBar.open('Se encontraron diferencias', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        // Fab
        this.fbReport[3].dis = false;
      }
      else {
        this.snackBar.open('No se encontraron diferencias', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    });

    this.pbaReporte2 = false;
  }

  async onCompararReporte3() {
    this.pbaReporte3 = true;

    const param = [];
    let existe: boolean = false;

    await this.declaracionpService._loadSP(15, param).then((data: any) => {
      this.lstReporte3ERP = data;

      this.lstReporte3ERP.forEach(x => {
        this.lstReporte3File.forEach(y => {
          if (x.numeroDocumento === y.numeroDocumento) {
            existe = true;
          }
        });

        if (!existe) {
          this.lstReportMatch3.push({
            nombres: x.apellidoPaterno + ' ' + x.apellidoMaterno + ', ' + x.nombres,
            codigoPlanilla: x.codigoPlanilla,
            tipoDocumento: x.tipoDocumento,
            numeroDocumento: x.numeroDocumento,
            fechaIngreso: x.fechaIngreso,
            fechaCese: x.fechaCese,
            observacion: "Dar de alta en el T-Registro."
          });

          existe = false;
        }
      });

      if (this.lstReportMatch3.length > 0) {
        this.dataSource3 = new MatTableDataSource(this.lstReportMatch3);
        this.dataSource3.paginator = this.paginator3;

        this.snackBar.open('Se encontraron diferencias', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        // Fab
        this.fbReport[3].dis = false;
      }
      else {
        this.snackBar.open('No se encontraron diferencias', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    });

    this.pbaReporte3 = false;
  }

  async onCompararReporte4() {
    this.pbaReporte4 = true;

    const param = [];
    let existe: boolean = false;

    await this.declaracionpService._loadSP(16, param).then((data: any) => {
      this.lstReporte4ERP = data;

      this.lstReporte4ERP.forEach(x => {
        this.lstReporte4File.forEach(y => {
          if (x.numeroDocumento === y.numeroDocumento) {
            existe = true;
          }
        });

        if (!existe) {
          this.lstReportMatch4.push({
            nombres: x.apellidoPaterno + ' ' + x.apellidoMaterno + ', ' + x.nombres,
            codigoPlanilla: x.codigoPlanilla,
            tipoDocumento: x.tipoDocumento,
            numeroDocumento: x.numeroDocumento,
            fechaIngreso: x.fechaIngreso,
            fechaCese: x.fechaCese,
            observacion: "Dar de alta en el T-Registro."
          });

          existe = false;
        }
      });

      if (this.lstReportMatch4.length > 0) {
        this.dataSource4 = new MatTableDataSource(this.lstReportMatch4);
        this.dataSource4.paginator = this.paginator4;

        this.snackBar.open('Se encontraron diferencias', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        // Fab
        this.fbReport[3].dis = false;
      }
      else {
        this.snackBar.open('No se encontraron diferencias', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    });

    this.pbaReporte4 = false;
  }

  async onCompararReporte5() {
    this.pbaReporte5 = true;

    const param = [];
    let existe: boolean = false;

    await this.declaracionpService._loadSP(17, param).then((data: any) => {
      this.lstReporte5ERP = data;

      this.lstReporte5ERP.forEach(x => {
        this.lstReporte5File.forEach(y => {
          if (x.numeroDocumento === y.numeroDocumento) {
            existe = true;
          }
        });

        if (!existe) {
          this.lstReportMatch5.push({
            nombres: x.apellidoPaterno + ' ' + x.apellidoMaterno + ', ' + x.nombres,
            codigoPlanilla: x.codigoPlanilla,
            tipoDocumento: x.tipoDocumento,
            numeroDocumento: x.numeroDocumento,
            fechaIngreso: x.fechaIngreso,
            fechaCese: x.fechaCese,
            observacion: "Dar de alta en el T-Registro."
          });

          existe = false;
        }
      });

      if (this.lstReportMatch5.length > 0) {
        this.dataSource5 = new MatTableDataSource(this.lstReportMatch5);
        this.dataSource5.paginator = this.paginator5;

        this.snackBar.open('Se encontraron diferencias', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        // Fab
        this.fbReport[3].dis = false;
      }
      else {
        this.snackBar.open('No se encontraron diferencias', 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    });

    this.pbaReporte5 = false;
  }

  private exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);

    const workbook: XLSX.WorkBook = {
      Sheets: { 'HOJA1': worksheet },
      SheetNames: ['HOJA1']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx', type: 'array'
    });

    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }

  async onExportar(reporte: string) {

    let param = [];
    const ruc = '20304269759';
    const fecha = moment().format('DDMMYYYY');
    const hora = moment().format('hhmmss');
    let filename: string = '';

    switch (reporte) {
      case "Reporte1":
        this.pbaReporte1 = true;

        await this.declaracionpService._loadSP(13, param).then((data: any) => {
          this.lstReporte1ERP = data;
        });

        filename = `${ruc}_SSA_${fecha}_${hora}`;
        await this.exportAsExcelFile(this.lstReporte1ERP, filename);

        this.pbaReporte1 = false;

        break;

      case "Reporte2":
        this.pbaReporte2 = true;

        await this.declaracionpService._loadSP(14, param).then((data: any) => {
          this.lstReporte2ERP = data;
        });

        filename = `${ruc}_TRA_${fecha}_${hora}`;
        await this.exportAsExcelFile(this.lstReporte2ERP, filename);

        this.pbaReporte2 = false;

        break;

      case "Reporte3":
        this.pbaReporte3 = true;

        await this.declaracionpService._loadSP(15, param).then((data: any) => {
          this.lstReporte3ERP = data;
        });

        filename = `${ruc}_${fecha}_${hora}`;
        await this.exportAsExcelFile(this.lstReporte3ERP, filename);

        this.pbaReporte3 = false;

        break;

      case "Reporte4":
        this.pbaReporte4 = true;

        await this.declaracionpService._loadSP(16, param).then((data: any) => {
          this.lstReporte4ERP = data;
        });

        filename = `${ruc}_${fecha}_${hora}`;
        await this.exportAsExcelFile(this.lstReporte4ERP, filename);

        this.pbaReporte4 = false;

        break;

      case "Reporte5":
        this.pbaReporte5 = true;

        await this.declaracionpService._loadSP(17, param).then((data: any) => {
          this.lstReporte5ERP = data;
        });

        filename = `${ruc}_${fecha}_${hora}`;
        await this.exportAsExcelFile(this.lstReporte5ERP, filename);

        this.pbaReporte5 = false;

        break;
      default:
        break;
    }
  }

  async onChangeFileTxt1(event: any) {
    this.pbaReporte1 = true;

    const allowedExtensions = /(.txt)$/i;

    if (!allowedExtensions.exec(this.fgReportes.get('fileUploadTxt1').value)) {
      Swal.fire("Error:", "Solo son permitidos archivos de extension (*.txt)", "error");
      this.fgReportes.get('fileUploadTxt1').setValue('');
      return;
    }

    await this.onUploadFileTxt1(event.target.files[0]);

    await this.declaracionpService.readFileReport1(this.urlDocumentoTextImportado).then((value: Array<IReporte1>) => {
      console.log(value);
      this.lstReporte1File = value;

      this.snackBar.open('Archivo subido correctamente.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      // Fab
      this.fbReport[2].dis = false;
    });

    this.pbaReporte1 = false;
  }

  async onChangeFileTxt2(event: any) {
    this.pbaReporte2 = true;

    const allowedExtensions = /(.txt)$/i;

    if (!allowedExtensions.exec(this.fgReportes.get('fileUploadTxt2').value)) {
      Swal.fire("Error:", "Solo son permitidos archivos de extension (*.txt)", "error");
      this.fgReportes.get('fileUploadTxt2').setValue('');
      return;
    }

    await this.onUploadFileTxt2(event.target.files[0]);

    await this.declaracionpService.readFileReport2(this.urlDocumentoTextImportado).then((value: Array<IReporte2>) => {
      console.log(value);
      this.lstReporte2File = value;

      this.snackBar.open('Archivo subido correctamente.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      // Fab
      this.fbReport[2].dis = false;
    });

    this.pbaReporte2 = false;
  }

  async onChangeFileTxt3(event: any) {
    this.pbaReporte3 = true;

    const allowedExtensions = /(.txt)$/i;

    if (!allowedExtensions.exec(this.fgReportes.get('fileUploadTxt3').value)) {
      Swal.fire("Error:", "Solo son permitidos archivos de extension (*.txt)", "error");
      this.fgReportes.get('fileUploadTxt3').setValue('');
      return;
    }

    await this.onUploadFileTxt3(event.target.files[0]);

    await this.declaracionpService.readFileReport3(this.urlDocumentoTextImportado).then((value: Array<IReporte3>) => {
      console.log(value);
      this.lstReporte3File = value;

      this.snackBar.open('Archivo subido correctamente.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      // Fab
      this.fbReport[2].dis = false;
    });

    this.pbaReporte3 = false;
  }

  async onChangeFileXml4(event: any) {
    this.pbaReporte4 = true;

    const allowedExtensions = /(.xml)$/i;

    if (!allowedExtensions.exec(this.fgReportes.get('fileUploadXml4').value)) {
      Swal.fire("Error:", "Solo son permitidos archivos de extension (*.xml)", "error");
      this.fgReportes.get('fileUploadXml4').setValue('');
      return;
    }

    await this.onUploadFileTxt4(event.target.files[0]);

    await this.declaracionpService.readFileReport4(this.urlDocumentoTextImportado).then((value: Array<IReporte4>) => {
      console.log(value);
      this.lstReporte4File = value;

      this.snackBar.open('Archivo subido correctamente.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      // Fab
      this.fbReport[2].dis = false;
    });

    this.pbaReporte4 = true;
  }

  async onChangeFileXml5(event: any) {
    this.pbaReporte5 = true;

    const allowedExtensions = /(.xml)$/i;

    if (!allowedExtensions.exec(this.fgReportes.get('fileUploadXml5').value)) {
      Swal.fire("Error:", "Solo son permitidos archivos de extension (*.xml)", "error");
      this.fgReportes.get('fileUploadXml5').setValue('');
      return;
    }

    await this.onUploadFileTxt5(event.target.files[0]);

    await this.declaracionpService.readFileReport5(this.urlDocumentoTextImportado).then((value: Array<IReporte5>) => {
      console.log(value);
      this.lstReporte5File = value;

      this.snackBar.open('Archivo subido correctamente.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      // Fab
      this.fbReport[2].dis = false;
    });

    this.pbaReporte5 = true;
  }

  async onUploadFileTxt1(urlFile: File) {
    const sFile = await this.getStringFromFile(urlFile);
    const iFile = sFile.indexOf(",") + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);

    await this.declaracionpService._uploadFile(sFileSustento, 8, "REPORTE_1", "application/txt").then((value: any) => {
      this.urlDocumentoTextImportado = value.fileUrl;
    });
  }

  async onUploadFileTxt2(urlFile: File) {
    const sFile = await this.getStringFromFile(urlFile);
    const iFile = sFile.indexOf(",") + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);

    await this.declaracionpService._uploadFile(sFileSustento, 8, "REPORTE_2", "application/txt").then((value: any) => {
      this.urlDocumentoTextImportado = value.fileUrl;
    });
  }

  async onUploadFileTxt3(urlFile: File) {
    const sFile = await this.getStringFromFile(urlFile);
    const iFile = sFile.indexOf(",") + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);

    await this.declaracionpService._uploadFile(sFileSustento, 8, "REPORTE_3", "application/txt").then((value: any) => {
      this.urlDocumentoTextImportado = value.fileUrl;
    });
  }

  async onUploadFileTxt4(urlFile: File) {
    const sFile = await this.getStringFromFile(urlFile);
    const iFile = sFile.indexOf(",") + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);

    await this.declaracionpService._uploadFile(sFileSustento, 8, "REPORTE_4", "application/xml").then((value: any) => {
      this.urlDocumentoTextImportado = value.fileUrl;
    });
  }

  async onUploadFileTxt5(urlFile: File) {
    const sFile = await this.getStringFromFile(urlFile);
    const iFile = sFile.indexOf(",") + 1;
    const sFileSustento = sFile.substring(iFile, sFile.length);

    await this.declaracionpService._uploadFile(sFileSustento, 8, "REPORTE_5", "application/xml").then((value: any) => {
      this.urlDocumentoTextImportado = value.fileUrl;
    });
  }

  async getStringFromFile(fSustento: File) {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fSustento);
      reader.onload = () => {
        resolve(reader.result);
      };
    });
  }

  onLimpiar(reporte: string) {
    switch (reporte) {
      case "Reporte1":
        this.fgReportes.get('fileUploadTxt1').setValue('');
        this.lstReporte1File = new Array();
        this.lstReportMatch1 = new Array();
        this.dataSource1 = new MatTableDataSource(this.lstReportMatch1);
        this.dataSource1.paginator = this.paginator1;

        // Fab
        this.fbReport[2].dis = true;
        this.fbReport[3].dis = true;

        break;

      case "Reporte2":
        this.fgReportes.get('fileUploadTxt2').setValue('');
        this.lstReporte2File = new Array();
        this.lstReportMatch2 = new Array();
        this.dataSource2 = new MatTableDataSource(this.lstReportMatch2);
        this.dataSource2.paginator = this.paginator2;

        // Fab
        this.fbReport[2].dis = true;
        this.fbReport[3].dis = true;

        break;

      case "Reporte3":
        this.fgReportes.get('fileUploadTxt3').setValue('');
        this.lstReporte3File = new Array();
        this.lstReportMatch3 = new Array();
        this.dataSource3 = new MatTableDataSource(this.lstReportMatch3);
        this.dataSource3.paginator = this.paginator2;

        // Fab
        this.fbReport[2].dis = true;
        this.fbReport[3].dis = true;

        break;

      case "Reporte4":
        this.fgReportes.get('fileUploadXml4').setValue('');
        this.lstReporte4File = new Array();
        this.lstReportMatch4 = new Array();
        this.dataSource4 = new MatTableDataSource(this.lstReportMatch4);
        this.dataSource4.paginator = this.paginator2;

        // Fab
        this.fbReport[2].dis = true;
        this.fbReport[3].dis = true;

        break;

      case "Reporte5":
        this.fgReportes.get('fileUploadXml5').setValue('');
        this.lstReporte5File = new Array();
        this.lstReportMatch5 = new Array();
        this.dataSource5 = new MatTableDataSource(this.lstReportMatch5);
        this.dataSource5.paginator = this.paginator5;

        // Fab
        this.fbReport[2].dis = true;
        this.fbReport[3].dis = true;

        break;

      default:
        break;
    }
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  onToggleFab(stat: number, iReport: number) {

    debugger

    let bComparar: boolean;
    let bLimpiar: boolean;

    switch (iReport) {
      case 1:
        bComparar = (this.lstReporte1File.length === 0);
        bLimpiar = (this.lstReportMatch1.length === 0);

        stat = (stat === -1) ? (this.abReport1.length > 0) ? 0 : 1 : stat;
        this.tsReport1 = (stat === 0) ? 'inactive' : 'active';
        this.abReport1 = (stat === 0) ? [] : this.fbReport;

        break;

      case 2:
        bComparar = (this.lstReporte2File.length === 0);
        bLimpiar = (this.lstReportMatch2.length === 0);

        stat = (stat === -1) ? (this.abReport2.length > 0) ? 0 : 1 : stat;
        this.tsReport2 = (stat === 0) ? 'inactive' : 'active';
        this.abReport2 = (stat === 0) ? [] : this.fbReport;

        break;

      case 3:
        bComparar = (this.lstReporte3File.length === 0);
        bLimpiar = (this.lstReportMatch3.length === 0);

        stat = (stat === -1) ? (this.abReport3.length > 0) ? 0 : 1 : stat;
        this.tsReport3 = (stat === 0) ? 'inactive' : 'active';
        this.abReport3 = (stat === 0) ? [] : this.fbReport;

        break;

      case 4:
        bComparar = (this.lstReporte4File.length === 0);
        bLimpiar = (this.lstReportMatch4.length === 0);

        stat = (stat === -1) ? (this.abReport4.length > 0) ? 0 : 1 : stat;
        this.tsReport4 = (stat === 0) ? 'inactive' : 'active';
        this.abReport4 = (stat === 0) ? [] : this.fbReport;

        break;

      case 5:
        bComparar = (this.lstReporte5File.length === 0);
        bLimpiar = (this.lstReportMatch5.length === 0);

        stat = (stat === -1) ? (this.abReport5.length > 0) ? 0 : 1 : stat;
        this.tsReport5 = (stat === 0) ? 'inactive' : 'active';
        this.abReport5 = (stat === 0) ? [] : this.fbReport;

        break;
    }

    this.fbReport[2].dis = bComparar;
    this.fbReport[3].dis = bLimpiar;
  }

  clickFab(iReport: number, iBtn: number) {

    const sTexto = 'Reporte' + iReport.toString();

    switch (iBtn) {
      // Exportar
      case 0:
        this.onExportar(sTexto);
        break;

      // Cargar
      case 1:
        this.onSubirDocumento(sTexto);
        break;

      // Comparar
      case 2:
        this.onComparar(sTexto);
        break;

      // Limpiar
      case 3:
        this.onLimpiar(sTexto);
        break;
    }
  }
}
