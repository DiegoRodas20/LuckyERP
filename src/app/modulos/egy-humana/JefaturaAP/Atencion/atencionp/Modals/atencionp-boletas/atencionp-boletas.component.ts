import { SelectionModel } from "@angular/cdk/collections";
import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { adminpAnimations } from "../../../../Animations/adminp.animations";
import { nsAtencionp } from "../../../../Model/Iatencionp";
import { AtencionpService } from "../../../../Services/atencionp.service";

@Component({
  selector: "app-atencionp-boletas",
  templateUrl: "./atencionp-boletas.component.html",
  styleUrls: ["./atencionp-boletas.component.css"],
  providers: [AtencionpService],
  animations: [adminpAnimations],
})
export class AtencionpBoletasComponent implements OnInit {
  @Input() fromParent;

  //#region Variables
  aParam = [];

  fbDetail = [
    { icon: "print", tool: "Imprimir", disabled: "false" },
    // { icon: 'print', tool: 'Imprimir seleccionados' },
    { icon: "email", tool: "Enviar", disabled: "true" },
    // { icon: 'mark_email_read', tool: 'Enviar seleccionados' },
    // { icon: 'download', tool: 'Descargar' }
  ];
  abDetail = [];
  tsDetail = "inactive";

  // FormGroup
  fgPeriodoLaboral: FormGroup;
  fgSearchBoletas: FormGroup;

  // Mat Table
  searchBC: string[] = [
    "select",
    "anio",
    "mes",
    "montoIngresos",
    "montoDescuento",
    "montoNeto",
  ];
  searchBS: MatTableDataSource<nsAtencionp.IPeriodosCalculados>;
  @ViewChild("searchB", { static: true }) searchB: MatPaginator;
  @ViewChild(MatSort, { static: true }) tableSortB: MatSort;

  // Progress Bar
  pbBoleta: boolean;

  data: nsAtencionp.IAtencionPersonal;

  lstAnios: Array<nsAtencionp.IAnio> = new Array();
  lstPeriodosLaborales: Array<nsAtencionp.IPeriodoLaboral> = new Array();
  lstPeriodosCalculados: Array<nsAtencionp.IPeriodosCalculados> = new Array();

  selection = new SelectionModel<nsAtencionp.IPeriodosCalculados>(true, []);

  constructor(
    public activeModal: NgbActiveModal,
    private spi: NgxSpinnerService,
    private fb: FormBuilder,
    private atencionService: AtencionpService,
    private _snackBar: MatSnackBar
  ) {
    this.searchBS = new MatTableDataSource();

    this.new_fgPeriodoLaboral();
    this.new_fgSearchBoletas();

    this.delay(250).then((any) => {
      this.tsDetail = "active";
      this.abDetail = this.fbDetail;
    });
  }

  async delay(ms: number) {
    await new Promise<void>((resolve) =>
      setTimeout(() => resolve(), ms)
    ).then();
  }

  new_fgPeriodoLaboral() {
    this.fgPeriodoLaboral = this.fb.group({
      periodoLaboral: "",
    });
  }

  new_fgSearchBoletas() {
    this.fgSearchBoletas = this.fb.group({
      anio: "",
      mes: "",
    });

    this.fgSearchBoletas.valueChanges.subscribe((value) => {
      const filter = { ...value, name: value.mes } as string;

      this.searchBS.filter = filter;

      if (this.searchBS.paginator) {
        this.searchBS.paginator.firstPage();
      }
    });
  }

  get periodoLaboral() {
    // debugger;
    return this.fgPeriodoLaboral.get("periodoLaboral");
  }
  get getSearchBoletas() {
    return this.fgSearchBoletas.controls;
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_boletas");

    this.pbBoleta = true;

    await this.cargarPeriodosCalculadosDePersonal();

    const periodoLaboralId = this.lstPeriodosLaborales[0].periodoLaboralId;
    this.fgPeriodoLaboral.get("periodoLaboral").setValue(periodoLaboralId);

    this.onChangePeriodoLaboral(periodoLaboralId);

    const anio = this.data.periodosCalculados[0].anio;

    this.fgSearchBoletas.get("anio").setValue(anio);
    this.onChangeAnio(anio);

    this.onVisualizarBoleta(this.data.periodosCalculados[0]);

    this.pbBoleta = false;

    this.spi.hide("spi_boletas");
  }

  async cargarPeriodosCalculadosDePersonal() {
    // debugger

    const param = [];
    const nIdPersonal = this.fromParent.nIdPersonal;
    const nIdEmp = this.fromParent.nIdEmp;

    param.push(
      "0¡nIdPersonal!" +
      nIdPersonal +
      "-0¡dev.nIdEmp!" +
      nIdEmp +
      "|0¡dev.nIdEstado!2"
    );

    // param.push('0¡nIdPersonal!171-0¡dev.nIdEmp!1|0¡dev.nIdEstado!2');

    // this.pbMain = true;

    await this.atencionService._loadSP(4, param).then((data: any) => {
      // debugger

      console.log(data);

      this.data = data;

      data.periodosLaborales.forEach((elem) => {
        console.log(elem.dFechIni);
        this.lstPeriodosLaborales.push({
          periodoLaboralId: elem.periodoLaboralId,
          fechaInicio: elem.sFechIni,
          fechaFin: elem.sFechFin,
        });
      });
    });

    // this.pbMain = false;
  }

  onChangePeriodoLaboral(periodoLaboralId: number) {
    this.pbBoleta = true;

    this.fgSearchBoletas.reset();
    this.searchBS = new MatTableDataSource();

    console.log(periodoLaboralId);

    this.lstAnios = new Array();

    let lstAniosUnicos: Array<nsAtencionp.IConceptosCalculados> = new Array();

    lstAniosUnicos = this.data.conceptosCalculados
      .filter((x) => x.periodoLaboralId === periodoLaboralId)
      .filter(
        (value, index, arr) =>
          arr.findIndex((x) => x.anio === value.anio) === index
      );

    lstAniosUnicos.forEach((elem) => {
      this.lstAnios.push({
        value: elem.anio,
        text: elem.anio,
        periodoLaboralId: elem.periodoLaboralId,
      });
    });

    this.pbBoleta = false;
  }

  onChangeAnio(anio: string) {
    this.pbBoleta = true;

    const periodoLaboralId = this.periodoLaboral.value;

    this.lstPeriodosCalculados = this.data.periodosCalculados.filter(
      (x) => x.periodoLaboralId === periodoLaboralId && x.anio === anio
    );

    this.searchBS = new MatTableDataSource(this.lstPeriodosCalculados);

    this.searchBS.paginator = this.searchB;
    this.searchBS.sort = this.tableSortB;
    this.searchBS.filterPredicate = function (
      data: nsAtencionp.IPeriodosCalculados,
      filter: string
    ): boolean {
      return data.mes.trim().toLowerCase().includes(filter);
    };

    this.searchBS.filterPredicate = ((
      data: nsAtencionp.IPeriodosCalculados,
      filter: nsAtencionp.IPeriodosCalculados
    ) => {
      // tslint:disable-next-line: max-line-length
      const a = !filter.anio || data.anio.toLowerCase().includes(filter.anio);
      const b = !filter.mes || data.mes.toLowerCase().includes(filter.mes);
      return a && b;
    }) as (PeriodicElement, string) => boolean;

    this.pbBoleta = false;
  }

  onVisualizarBoleta(row) {
    this.pbBoleta = true;

    console.log(row);

    // Visualizar boleta

    // debugger

    const param = [];

    const nIdEmp = JSON.parse(localStorage.getItem("ListaEmpresa"))[0].nIdEmp;
    // const nIdPersonal = this.fgInfo.controls['nIdPersonal'].value; cavh
    const nIdPersonal = this.fromParent.nIdPersonal;
    const periodoLaboralId = row.periodoLaboralId;
    const anio = row.anio;
    const mes = row.nroMes;

    param.push("0¡nIdEmp!" + nIdEmp + "-");
    param.push("0¡per.nIdPersonal!" + nIdPersonal + "|");
    param.push("0¡pla.nIdPerLab!" + periodoLaboralId + "-");
    param.push("0¡dev.nIdEmp!" + nIdEmp + "|");
    param.push("0¡dpc.nIdPerLab!" + periodoLaboralId + "|");
    param.push("0¡YEAR(pca.dFechPago)!" + anio + "|");
    param.push("0¡MONTH(pca.dFechPago)!" + mes + "|");
    param.push("0¡dev.nIdEstado!2-");
    param.push("0¡nIdFormato!1");
    // param.push('0¡nIdEmp!1-0¡per.nIdPersonal!171|0¡pla.nIdPerLab!140-0¡dev.nIdEmp!1|0¡dpc.nIdPerLab!140|
    //  0¡YEAR(pca.dFechPago)!2021|0¡MONTH(pca.dFechPago)!1|0¡dev.nIdEstado!2-0¡nIdFormato!1');

    this.atencionService.print(5, param).then((result: any) => {
      let objectURL: any = URL.createObjectURL(result);
      const pdfFrame = document.getElementById(
        "pdf-boleta"
      ) as HTMLIFrameElement;
      pdfFrame.src = "";
      pdfFrame.src = objectURL;
      objectURL = URL.revokeObjectURL(result);
    });

    this.pbBoleta = false;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    // debugger

    const numSelected = this.selection.selected.length;
    const numRows = this.searchBS.data.length;
    return numSelected === numRows;
    // return true;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.searchBS.data.forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: nsAtencionp.IPeriodosCalculados): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1
      }`;
  }

  onToggleFab(stat: number) {
    // debugger
    stat = stat === -1 ? (this.abDetail.length > 0 ? 0 : 1) : stat;
    this.tsDetail = stat === 0 ? "inactive" : "active";
    this.abDetail = stat === 0 ? [] : this.fbDetail;
  }

  async clickFab(index: number) {
    switch (index) {
      case 0:
        console.log("Imprimir");

        this.onImprimirBoleta();

        // alert(positions);
        // console.log(positions);

        break;

      case 1:
        console.log("Enviar");

        const positionsD: Array<number> = new Array();

        this.searchBS.data.forEach((row) => {
          if (this.selection.isSelected(row)) {
            positionsD.push(row.position);
          }
        });

        alert(positionsD);
        console.log(positionsD);

        break;
    }
  }

  onImprimirBoleta() {
    const pdf = document.getElementById("pdf-boleta") as HTMLIFrameElement;
    if (pdf.src !== "") {
      this.pbBoleta = false;
      pdf.contentWindow.print();
    }
  }
}
