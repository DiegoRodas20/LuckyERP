import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { ISelectItem, SecurityErp } from 'src/app/modulos/AAHelpers';
import Swal from 'sweetalert2';
import { adminpAnimations } from '../../Animations/adminp.animations';
import { BoletaDevengueDto, PersonalDto } from '../../Model/Iboletap';
import { BoletaspService } from '../../Services/boletasp.service';

@Component({
  selector: 'app-boletasp',
  templateUrl: './boletasp.component.html',
  styleUrls: ['./boletasp.component.css'],
  providers: [BoletaspService],
  animations: [adminpAnimations],
})
export class BoletaspComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  selection = new SelectionModel<BoletaDevengueDto>(true, []);
  fgSearchBoletas: FormGroup;
  storageData: SecurityErp = new SecurityErp();
  anios: ISelectItem[];
  personal: PersonalDto;
  nIdUser: number;
  sIdPais: string;
  isVisualizado: boolean = false;
  seleccionado: BoletaDevengueDto;
  fileBlob: Blob;
  periodoSeleccionado: string = '';
  fbDetail = [
    { icon: 'remove_red_eye', tool: 'Visualizar' },
    { icon: "print", tool: "Imprimir" },
    { icon: 'download', tool: 'Descargar' }
  ];
  abDetail = [];
  tsDetail = "inactive";
  searchBC: string[] = [
    "select",
    "anio",
    "mes",
    "montoIngresos",
    "montoDescuento",
    "montoNeto",
  ];
  dataSource: MatTableDataSource<BoletaDevengueDto> = new MatTableDataSource<BoletaDevengueDto>([]);
  //position: number = 0;
  //identificador: number = 0;
  //visualizado: number = 0;
  //idDesenfoque: number = 0;
  // fbDetail = [
  //   { icon: 'remove_red_eye', tool: 'Visualizar' },
  //   { icon: "print", tool: "Imprimir" },
  //   // { icon: "email", tool: "Enviar", disabled: "true" },
  //   // { icon: 'mark_email_read', tool: 'Enviar seleccionados' },
  //   { icon: 'download', tool: 'Descargar' }
  // ];
  //aParam = [];
  // abDetail = [];
  // tsDetail = "inactive";
  //desenfocar: boolean = true;
  // Progress Bar
  //pbMain: boolean;
  //data: nsBoletap.IBoletaPago;
  //lstAnios: Array<nsBoletap.IAnio> = new Array();
  //lstPeriodosLaborales: Array<nsBoletap.IPeriodosLaborales> = new Array();
  //lstPeriodosCalculados: Array<nsBoletap.IPeriodosCalculados> = new Array();
  //selection = new SelectionModel<nsBoletap.IPeriodosCalculados>(true, []);
  //selection = new SelectionModel<BoletaDevengueDto>(true, []);
  // FormGroup
  //fgDatosDePersonal: FormGroup;
  //fgSearchBoletas: FormGroup;
  // Mat Table
  //searchBS: MatTableDataSource<nsBoletap.IPeriodosCalculados>;
  //@ViewChild("searchB", { static: true }) searchB: MatPaginator;
  //@ViewChild(MatSort, { static: true }) tableSortB: MatSort;

  constructor(private boletaspService: BoletaspService, private fb: FormBuilder, private spi: NgxSpinnerService) {
    //this.searchBS = new MatTableDataSource();
    // this.onInitFrmGrpDatosDePersonal();
    // this.onInitFrmGrpSearchBoletas();
    this.nIdUser = Number(this.storageData.getUsuarioId());
    this.sIdPais = this.storageData.getPais();
    this.fgSearchBoletas = this.fb.group({
      anio: '',
      mes: '',
    });
  }

  async ngOnInit(): Promise<void> {
    this.changeFilter();
    this.loadPersonal();
    this.delay(250).then((any) => {
      this.tsDetail = "active";
      this.abDetail = this.fbDetail;
    });
    // if (this.data.periodosCalculados.length > 0) {
    //   this.onCargarAnios();
    //   const anio = this.data.periodosCalculados[0].anio;
    //   this.fgSearchBoletas.get("anio").setValue(anio);
    //   this.onChangeAnio(anio);
    //   this.onVisualizarBoleta(this.data.periodosCalculados[0]);
    // }
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  /* #region  Suscripción a los cambios que se realicen en los filtros */
  changeFilter() {
    this.fgSearchBoletas.valueChanges.subscribe(filter => {
      this.applyFilter(filter);
      this.selection.clear()
    });
  }
  /* #endregion */

  /* #region  Método de filtración del nombre o documento */
  applyFilter(filterValue: any) { this.dataSource.filter = { ...filterValue } as string }
  /* #endregion */

  /* #region  Designación de predicados para el filtro */
  loadFilters(): void {
    this.dataSource.filterPredicate = (data, filter: any) => {
      const f1 = !filter.anio || data.nAnio == Number(filter.anio);
      const f2 = !filter.mes || data.sMes.toLowerCase().includes(filter.mes.toLowerCase());
      return f1 && f2;
    };
  }
  /* #endregion */

  get getSearchBoletas() { return this.fgSearchBoletas.controls }
  get nAnioField(): FormControl { return this.fgSearchBoletas.get('anio') as FormControl }

  /* #region  Método que carga la información del personal */
  async loadPersonal() {
    this.spi.show("spi_main");
    this.boletaspService.getInfoWorker(this.nIdUser).then(
      res => {
        if (res) {
          this.personal = res.data;
          const lstAnios = this.personal.anios ? this.personal.anios : [];
          this.anios = lstAnios;
          const lstDevengues = this.personal.boletas ? this.personal.boletas : [];
          this.dataSource = new MatTableDataSource<BoletaDevengueDto>(lstDevengues);
          this.dataSource.paginator = this.paginator;
          this.loadFilters();
          this.nAnioField.setValue(this.anios[0]?.nId);
        }
      }
    ).finally(() => this.spi.hide("spi_main"));
  }
  /* #endregion */

  /* #region  Método que carga la boleta de la fila seleccionada */
  loadBoleta(row: BoletaDevengueDto) {
    if (row.nId == this.seleccionado?.nId) {
      return;
    }
    this.spi.show("spi_main");
    this.boletaspService.getFileBoleta(row.sFileBoleta).then(
      res => {
        if (res) {
          this.isVisualizado = row.nCantView > 0;
          this.seleccionado = row;
          this.periodoSeleccionado = `${row.sMes} ${row.nAnio}`;
          this.fileBlob = res;
          let objectURL: any = URL.createObjectURL(res);
          const pdfFrame = document.getElementById("pdf-boleta") as HTMLIFrameElement;
          pdfFrame.src = "";
          pdfFrame.src = objectURL + '#toolbar=0';
          objectURL = URL.revokeObjectURL(res.toString());
        }
      }
    ).finally(() => this.spi.hide("spi_main"));
  }
  /* #endregion */

  /* #region  Método que registra la visualización de la boleta */
  registrarVisualizacion(item: BoletaDevengueDto) {
    const cantFaltantes = this.dataSource.data.filter(x => x.nOrden > item.nOrden && x.nCantView == 0);
    if (cantFaltantes.length > 0) {
      Swal.fire(
        "No se puede visualizar la boleta", "Por favor, para visualizar una boleta de pago, previamente se debe de visualizar las boletas anteriores.", "info"
      );
      return;
    }
    this.spi.show("spi_main");
    this.boletaspService.insertView(item.nId, this.nIdUser, this.sIdPais).then(
      res => {
        if (res) {
          this.isVisualizado = true;
          this.dataSource.data = this.dataSource.data.map(obj => { return obj.nId == item.nId ? { ...obj, nCantView: 1 } : obj });
        }
      }
    ).finally(() => this.spi.hide("spi_main"));
  }
  /* #endregion */

  /* #region  Método que descarga el archivo actual seleccionado o el comprimido de las boletas seleccionadas */
  downloadFile(): void {
    if (this.selection.selected.length == 0) {
      const fileName = `${this.personal.trabajador.sNumeroDocumento}-${this.seleccionado.nAnio}_${this.seleccionado.sMes}`;
      this.saveFile(this.fileBlob, fileName);
    } else {
      this.spi.show("spi_main");
      this.boletaspService.downloadFile(this.personal.trabajador.sNumeroDocumento, this.selection.selected).then(
        res => {
          if (res) {
            this.saveFile(res, 'Boletas de pago');
          }
        }
      ).finally(() => this.spi.hide("spi_main"));
    }
  }
  /* #endregion */

  /* #region  Función que crea el elemento de descarga en el ordenador del usuario */
  saveFile(fileBlob: Blob, fileName: string): void {
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(fileBlob, fileName);
      return;
    }
    const objectUrl = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a') as HTMLAnchorElement;
    link.href = objectUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    }, 100);
  }
  /* #endregion */

  /* #region  método que imprime la boleta del iframe */
  onImprimirBoleta() {
    const pdf = document.getElementById("pdf-boleta") as HTMLIFrameElement;
    if (pdf.src !== "") {
      pdf.contentWindow.print();
    }
  }
  /* #endregion */

  /* #region  Opciones del Fab */
  onClickFab(index: number) {
    switch (index) {
      case 0: this.registrarVisualizacion(this.seleccionado); //Visualizar
        break;
      case 1:
        Swal.fire({
          title: 'Confirmar impresión', showCancelButton: true, confirmButtonText: `Imprimir`, cancelButtonText: `Cancelar`
        }).then((result) => {
          if (result.isConfirmed) {
            this.onImprimirBoleta(); //Imprimir
          }
        });
        break;
      case 2: this.downloadFile(); //descargar archivo.
        break;
    }
  }
  /* #endregion */

  /* #region  opción auxiliar que oculta o mustras la opciones del fab */
  onToggleFab(stat: number) {
    stat = stat === -1 ? (this.abDetail.length > 0 ? 0 : 1) : stat;
    this.tsDetail = stat === 0 ? "inactive" : "active";
    this.abDetail = stat === 0 ? [] : this.fbDetail;
  }
  /* #endregion */

  /* #region  Bloqueo de opciones del Fab */
  disableFab(index: number): boolean {
    switch (index) {
      case 0: return !this.seleccionado || this.isVisualizado;
      case 1: return !this.seleccionado || !this.isVisualizado;
      case 2: return (!this.seleccionado || !this.isVisualizado) && this.selection.selected.length == 0;
    }
  }
  /* #endregion */

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    //const numRows = this.dataSource.data.length;
    const numRows = this.dataSource.filteredData.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.filteredData.filter(x => x.nCantView > 0).forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: BoletaDevengueDto): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.nOrden + 1}`;
  }

  // async cargarDatosDePersonal() {
  //   const param = [];
  //   const nIdEmp = JSON.parse(localStorage.getItem('Empresa'));
  //   const user = localStorage.getItem("currentUser");
  //   const uid = JSON.parse(window.atob(user.split(".")[1])).uid;
  //   param.push('0¡usu.nCodUser!' + uid);
  //   param.push('10¡ddo.dFechFin!null-0¡dev.nIdEmp!1');
  //   param.push('0¡usu.nCodUser!' + uid);
  //   param.push('0¡dev.nIdEstado!2');

  //   await this.boletaspService._loadSP(1, param).then((data: any) => {
  //     this.data = data;
  //     this.fgDatosDePersonal.patchValue({
  //       nIdPersonal: data.datosPersonal.personalId,
  //       sTipoDoc: data.datosPersonal.tipoDocumento,
  //       sDocumento: data.datosPersonal.numeroDocumento,
  //       sNombres: data.datosPersonal.personal,
  //       sCodPlla: data.datosPersonal.planilla,
  //       dFechIni: data.datosPersonal.fechaIngreso,
  //       dFechFin: data.datosPersonal.fechaCese
  //     });
  //   });
  // }

  // onInitFrmGrpDatosDePersonal() {
  //   this.fgDatosDePersonal = this.fb.group({
  //     nIdPersonal: 0,
  //     nIdTipoDoc: [{ value: 0 }],
  //     sTipoDoc: [{ value: '', disabled: true }],
  //     sDocumento: [{ value: '', disabled: true }],
  //     sNombres: [{ value: '', disabled: true }],
  //     nIdPlla: [{ value: 0 }],
  //     sCodPlla: [{ value: '', disabled: true }],
  //     dFechIni: [{ value: null, disabled: true }],
  //     dFechFin: [{ value: null, disabled: true }]
  //   });
  // }

  // onInitFrmGrpSearchBoletas() {
  //   this.fgSearchBoletas = this.fb.group({
  //     anio: "",
  //     mes: "",
  //   });

  //   this.fgSearchBoletas.valueChanges.subscribe((value) => {
  //     const filter = { ...value, name: value.mes } as string;

  //     this.searchBS.filter = filter;

  //     if (this.searchBS.paginator) {
  //       this.searchBS.paginator.firstPage();
  //     }
  //   });
  // }

  // onCargarAnios() {
  //   this.pbMain = true;

  //   this.fgSearchBoletas.reset();
  //   this.searchBS = new MatTableDataSource();

  //   this.lstAnios = new Array();

  //   let lstAniosUnicos: Array<nsBoletap.IPeriodosCalculados> = new Array();

  //   lstAniosUnicos = this.data.periodosCalculados
  //     .filter(
  //       (value, index, arr) =>
  //         arr.findIndex((x) => x.anio === value.anio) === index
  //     );

  //   lstAniosUnicos.forEach((elem) => {
  //     this.lstAnios.push({
  //       value: elem.anio,
  //       text: elem.anio,
  //       periodoLaboralId: elem.periodoLaboralId,
  //     });
  //   });

  //   this.pbMain = false;
  // }

  // onChangeAnio(anio: string) {
  //   this.pbMain = true;

  //   this.lstPeriodosCalculados = this.data.periodosCalculados.filter(
  //     x => x.anio === anio
  //   );

  //   this.searchBS = new MatTableDataSource(this.lstPeriodosCalculados);

  //   this.searchBS.paginator = this.searchB;
  //   this.searchBS.sort = this.tableSortB;
  //   this.searchBS.filterPredicate = function (
  //     data: nsBoletap.IPeriodosCalculados,
  //     filter: string
  //   ): boolean {
  //     return data.mes.trim().toLowerCase().includes(filter);
  //   };

  //   this.searchBS.filterPredicate = ((
  //     data: nsBoletap.IPeriodosCalculados,
  //     filter: nsBoletap.IPeriodosCalculados
  //   ) => {
  //     const a = !filter.anio || data.anio.toLowerCase().includes(filter.anio);
  //     const b = !filter.mes || data.mes.toLowerCase().includes(filter.mes);
  //     return a && b;
  //   }) as (PeriodicElement, string) => boolean;

  //   this.pbMain = false;
  // }

  // async registrarVisualizacion(id: number) {
  //   // debugger

  //   if (this.visualizado != 0) {
  //     return;
  //   }

  //   // Registro de visualización
  //   const user = localStorage.getItem("currentUser");
  //   const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

  //   this.aParam = [];
  //   this.aParam.push("T0¡nIdRegUser!" + uid);
  //   this.aParam.push("T0¡dtReg!GETDATE()");
  //   this.aParam.push("T1¡nIdDPCP!" + id);

  //   const result = await this.boletaspService._crudBP(1, this.aParam);

  //   // debugger

  //   if (result[0].split("!")[0] !== "00") {
  //     console.log("Registro de visualización.");
  //   }
  // }

  // onVisualizarBoleta(row: nsBoletap.IPeriodosCalculados) {
  //   // debugger

  //   this.pbMain = true;

  //   this.position = row.position;
  //   this.identificador = row.id;
  //   this.visualizado = row.visualizado;
  //   this.periodoSeleccionado = row.mes + ' ' + row.anio;

  //   this.desenfocar = this.visualizado == 0;

  //   //this.registrarVisualizacion(row.id);

  //   // debugger

  //   const param = [];
  //   const nIdEmp = JSON.parse(localStorage.getItem("ListaEmpresa"))[0].nIdEmp;

  //   const user = localStorage.getItem("currentUser");
  //   const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

  //   param.push('0¡nIdEmp!' + nIdEmp + '-');
  //   param.push('0¡usu.nCodUser!' + uid + '-');
  //   param.push('0¡dev.nIdEmp!' + nIdEmp);
  //   param.push('0¡usu.nCodUser!' + uid);
  //   param.push('0¡YEAR(pca.dFechPago)!' + row.anio);
  //   param.push('0¡MONTH(pca.dFechPago)!' + row.nroMes);
  //   param.push('0¡dev.nIdEstado!2-');
  //   param.push('0¡dev.nIdEmp!' + nIdEmp);
  //   param.push('0¡usu.nCodUser!' + uid);
  //   param.push('0¡YEAR(pca.dFechPago)!' + row.anio);
  //   param.push('0¡MONTH(pca.dFechPago)!' + row.nroMes);
  //   param.push('0¡dev.nIdEstado!2');

  //   // param.push('0¡nIdEmp!1-0¡per.nIdPersonal!171|0¡pla.nIdPerLab!140-0¡dev.nIdEmp!1|0¡dpc.nIdPerLab!140|0¡YEAR(pca.dFechPago)!2020|0¡MONTH(pca.dFechPago)!11|0¡dev.nIdEstado!2-0¡dev.nIdEmp!1|0¡dpc.nIdPerLab!140|0¡YEAR(pca.dFechPago)!2020|0¡MONTH(pca.dFechPago)!11|0¡dev.nIdEstado!2');

  //   // this.boletaspService.print(2, param).then((result: any) => {
  //   //   let objectURL: any = URL.createObjectURL(result);
  //   //   const pdfFrame = document.getElementById("pdf-boleta") as HTMLIFrameElement;
  //   //   pdfFrame.src = "";
  //   //   pdfFrame.src = objectURL;
  //   //   objectURL = URL.revokeObjectURL(result);
  //   // });

  //   this.pbMain = false;
  // }
  // /** Whether the number of selected elements matches the total number of rows. */
  // isAllSelected() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.searchBS.data.length;
  //   return numSelected === numRows;
  // }

  // /** Selects all rows if they are not all selected; otherwise clear selection. */
  // masterToggle() {
  //   this.isAllSelected()
  //     ? this.selection.clear()
  //     : this.searchBS.data.filter(x => x.visualizado === 1).forEach((row) => this.selection.select(row));
  // }

  /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: nsBoletap.IPeriodosCalculados): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? "select" : "deselect"} all`;
  //   }
  //   return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
  // }

  // onClickFab(index: number) {
  //   switch (index) {
  //     case 0: // Visualizar
  //       const lstVisualizados: Array<nsBoletap.IPeriodosCalculados> = this.data.periodosCalculados.filter(
  //         x => x.position > this.position && x.visualizado === 0
  //       );

  //       if (lstVisualizados.length > 0) {
  //         Swal.fire(
  //           "No se puede visualizar la boleta",
  //           "Por favor, para visualizar una boleta de pago, previamente se debe de visualizar las boletas anteriores.",
  //           "error"
  //         );
  //       }
  //       else {
  //         this.spi.show("spi_main");
  //         this.pbMain = true;

  //         if (this.idDesenfoque != this.identificador) {
  //           this.idDesenfoque = this.identificador;
  //         }
  //         else {
  //           this.idDesenfoque = 0;
  //         }

  //         this.registrarVisualizacion(this.identificador);

  //         this.visualizado = 1;

  //         this.lstPeriodosCalculados.filter(
  //           x => x.id === this.identificador
  //         )[0].visualizado = this.visualizado;

  //         this.pbMain = false;
  //         this.spi.hide("spi_main");
  //       }

  //       break;

  //     case 1: // Imprimir

  //       if (this.selection.selected.length > 0) {
  //         Swal.fire({
  //           title: 'Seleccione la opción a imprimir',
  //           showDenyButton: true,
  //           showCancelButton: true,
  //           confirmButtonText: `Boleta actual`,
  //           denyButtonText: `Boletas seleccionadas`,
  //           cancelButtonText: `Cancelar`
  //         }).then((result) => {
  //           /* Read more about isConfirmed, isDenied below */
  //           if (result.isConfirmed) {
  //             this.onImprimirBoleta();
  //           } else if (result.isDenied) {
  //             this.onConsultarBoletasSeleccionadas();
  //           }
  //         })
  //       }
  //       else {
  //         Swal.fire({
  //           title: 'Confirmar impresión',
  //           showCancelButton: true,
  //           confirmButtonText: `Imprimir`,
  //           cancelButtonText: `Cancelar`
  //         }).then((result) => {
  //           if (result.isConfirmed) {
  //             this.onImprimirBoleta();
  //           }
  //         })
  //       }

  //       break;
  //   }
  // }

  // onImprimirBoleta() {
  //   const pdf = document.getElementById("pdf-boleta") as HTMLIFrameElement;
  //   if (pdf.src !== "") {
  //     this.pbMain = false;
  //     pdf.contentWindow.print();
  //   }
  // }

  // onImprimirBoletasSeleccionadas() {
  //   const pdf = document.getElementById("pdf-boletas") as HTMLIFrameElement;
  //   if (pdf.src !== "") {
  //     this.pbMain = false;
  //     pdf.contentWindow.print();
  //   }
  // }

  //   onConsultarBoletasSeleccionadas() {
  //     // if (this.selection.selected.length == 0) {
  //     //   Swal.fire(
  //     //     "No se puede imprimir",
  //     //     "Por favor, seleccionar como mínimo una boleta de pago.",
  //     //     "error"
  //     //   );

  //     //   return;
  //     // }

  //     const anios: Array<string> = new Array();
  //     const meses: Array<number> = new Array();
  //     const periodosLaborales: Array<number> = new Array();

  //     this.searchBS.data.forEach((row) => {
  //       if (this.selection.isSelected(row)) {
  //         anios.push(row.anio);
  //         meses.push(row.nroMes);
  //         periodosLaborales.push(row.periodoLaboralId);
  //       }
  //     });

  //     const param = [];
  //     const nIdEmp = JSON.parse(localStorage.getItem("ListaEmpresa"))[0].nIdEmp;

  //     const user = localStorage.getItem("currentUser");
  //     const uid = JSON.parse(window.atob(user.split(".")[1])).uid;

  //     param.push('0¡nIdEmp!' + nIdEmp + '-');
  //     param.push('0¡usu.nCodUser!' + uid + '-');
  //     param.push('0¡dev.nIdEmp!' + nIdEmp);
  //     param.push('0¡usu.nCodUser!' + uid);
  //     param.push('0¡YEAR(pca.dFechPago)!' + anios[0]);
  //     param.push('1¡MONTH(pca.dFechPago)!' + meses.join(','));
  //     param.push('0¡dev.nIdEstado!2-');
  //     param.push('0¡dev.nIdEmp!' + nIdEmp);
  //     param.push('0¡usu.nCodUser!' + uid);
  //     param.push('0¡YEAR(pca.dFechPago)!' + anios[0]);
  //     param.push('1¡MONTH(pca.dFechPago)!' + meses.join(','));
  //     param.push('0¡dev.nIdEstado!2');

  //     //param.push('0¡nIdEmp!1-0¡per.nIdPersonal!171|0¡pla.nIdPerLab!140-0¡dev.nIdEmp!1|0¡dpc.nIdPerLab!140|0¡YEAR(pca.dFechPago)!2020|1¡MONTH(pca.dFechPago)!11,12|0¡dev.nIdEstado!2-0¡dev.nIdEmp!1|0¡dpc.nIdPerLab!140|0¡YEAR(pca.dFechPago)!2020|1¡MONTH(pca.dFechPago)!11,12|0¡dev.nIdEstado!2');

  //     this.boletaspService.print(2, param).then((result: any) => {
  //       let objectURL: any = URL.createObjectURL(result);
  //       const pdfFrame = document.getElementById("pdf-boletas") as HTMLIFrameElement;
  //       pdfFrame.src = "";
  //       pdfFrame.src = objectURL;
  //       objectURL = URL.revokeObjectURL(result);
  //     });
  //   }
}
