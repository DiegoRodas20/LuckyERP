import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import * as moment from "moment";

import {
  IPersonalExcelImport,
  IPersonalImportReplace,
} from "../../../../Model/Icuentasb";
import { CuentasbService } from "../../../../Services/cuentasb.service";
import { adminpAnimations } from "../../../../Animations/adminp.animations";

@Component({
  selector: "app-cuentasb-replace",
  templateUrl: "./cuentasb-replace.component.html",
  styleUrls: [
    "./cuentasb-replace.component.css",
    "./cuentasb-replace.component.scss",
  ],
  animations: [adminpAnimations],
})
export class CuentasbReplaceComponent implements OnInit {
  //#region GENERAL
  @Input() data!: IPersonalExcelImport;
  @Input() cuentaId = 0;
  url: string;
  //#endregion

  //#region DATA DEL USUARIO
  controlPanelExpanded = true;
  formDataUsuario: FormGroup;
  formDataPersonaSeleccionada: FormGroup;
  //#endregion

  //#region FILTRO DE BUSQUEDA
  formFiltro: FormGroup = this.fb.group({
    nombresNumeroDocumentoFiltro: "",
  });
  //#endregion

  //#region TABLA DE BUSQUEDA
  displayedColumnsTablaPersonal: string[] = [
    "action",
    "sNombres",
    "nIdPlla",
    "sAbrev",
    "sDocumento",
    "sNroCuenta",
    "sAbrevBanco",
  ];

  dataTablaPersonal: IPersonalImportReplace[] = [];
  dataSourceTablaPersonal = new MatTableDataSource<IPersonalImportReplace>(
    this.dataTablaPersonal
  );

  @ViewChild("pagListaPersonal", { static: true })
  pagListaPersonal: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  //#endregion

  //#region FAB BUTTON
  estadoBotonFb = true;
  tsReplace = "inactive";

  fbReplace = [{ icon: "published_with_changes", tool: "Cambiar" }];

  abReplace = [];
  estadoDelFBOpciones = -1;

  //#endregion

  constructor(
    public activeModal: NgbActiveModal,
    public service: CuentasbService,
    @Inject("BASE_URL") baseUrl: string,
    public fb: FormBuilder,
    private spi: NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private modalService: NgbModal
  ) {
    this.url = baseUrl;
  }

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_cuentasb_replace");
    this._crearFormDataUsuario();
    this._crearFormDataPersonaSeleccionada();
    await this._cargarDataDelPersonal();
    this.spi.hide("spi_cuentasb_replace");
  }

  //#region GENERAL
  //#endregion

  //#region DATA DEL USUARIO
  private _crearFormDataUsuario() {
    this.formDataUsuario = this.fb.group({
      sNombres: [{ value: this.data.sNombres, disabled: true }],
      sDocumento: [{ value: this.data.sDocumento, disabled: true }],
      sNroCuenta: [{ value: this.data.sNroCuenta, disabled: true }],
    });
  }

  private _crearFormDataPersonaSeleccionada() {
    this.formDataPersonaSeleccionada = this.fb.group({
      nIdPersonal: [{ value: null, disabled: true }],
      sNombres: [{ value: null, disabled: true }],
      sDocumento: [{ value: null, disabled: true }],
      sAbrev: [{ value: null, disabled: true }],
      dFechIni: [{ value: null, disabled: true }],
      nIdPlla: [{ value: null, disabled: true }],
      sAbrevBanco: [{ value: null, disabled: true }],
      sNroCuenta: [{ value: null, disabled: true }],
      nIdPerLab: [{ value: null, disabled: true }],
      dFechIniCuenta: [{ value: null, disabled: true }],
      nIdTipoDoc: [{ value: null, disabled: true }],
    });
  }
  //#endregion

  //#region FILTRO DE TABLA DE BUSQUEDA
  public filtrarDataListaPersonal() {
    this.dataSourceTablaPersonal.filterPredicate = ((
      data: IPersonalImportReplace,
      filter: any
    ) => {
      // tslint:disable-next-line: max-line-length
      // Filtrando por tipo de cuenta
      const a =
        !filter.nombresNumeroDocumentoFiltro ||
        data.sNombres
          .toLowerCase()
          .includes(filter.nombresNumeroDocumentoFiltro.toLowerCase()) ||
        data.sDocumento
          .toLowerCase()
          .includes(filter.nombresNumeroDocumentoFiltro.toLowerCase());

      return a;
    }) as (IMain, string) => boolean;

    this.dataSourceTablaPersonal.filter = this.formFiltro.value;

    if (this.dataSourceTablaPersonal.paginator) {
      this.dataSourceTablaPersonal.paginator.firstPage();
    }
  }
  //#endregion

  //#region TABLA DE BUSQUEDA
  private async _cargarDataDelPersonal(): Promise<void> {
    const nIdEmp = JSON.parse(localStorage.getItem("Empresa"));
    const params = [];

    params.push(
      "0¡PLBAN.nIdTipoCta!" + this.cuentaId + "-0¡PER.nIdEmp!" + nIdEmp
    );
    this.service
      ._loadSP(18, params, this.url)
      .then((value: IPersonalImportReplace[]) => {
        this.dataSourceTablaPersonal = new MatTableDataSource(value);
        this.dataSourceTablaPersonal.paginator = this.pagListaPersonal;
      });
  }

  public seleccionDeUnResultadoTabla(personal: IPersonalImportReplace): void {
    this.formDataPersonaSeleccionada.patchValue({
      nIdPersonal: personal.nIdPersonal,
      sNombres: personal.sNombres,
      sDocumento: personal.sDocumento,
      sAbrev: personal.sAbrev,
      dFechIni: personal.dFechIni,
      nIdPlla: personal.nIdPlla,
      sAbrevBanco: personal.sAbrevBanco,
      sNroCuenta: personal.sNroCuenta,
      nIdPerLab: personal.nIdPerLab,
      dFechIniCuenta: personal.dFechIniCuenta,
      nIdTipoDoc: personal.nIdTipoDoc,
    });

    this.controlPanelExpanded = false;
    this.estadoDelFBOpciones = 0;
    this.estadoBotonFb = false;
    this.onToggleFab();
  }

  public formatoFecha(fecha: string): string {
    return moment(fecha).format("DD/MM/YYYY");
  }
  //#endregion

  //#region FAB BUTTON
  public onToggleFab(): void {
    if (this.estadoDelFBOpciones == 0) {
      if (this.estadoBotonFb) {
        this.abReplace = [];
        this.tsReplace = "inactive";
      } else {
        this.abReplace = this.fbReplace;
        this.tsReplace = "active";
      }
      this.estadoBotonFb = !this.estadoBotonFb;
    }
  }

  public clickFab(opcion: number): void {
    if (this.estadoDelFBOpciones == 0) {
      if (opcion === 0) {
        this._reemplazarLaDataDelUsuario();
      }
    }
  }

  private _reemplazarLaDataDelUsuario(): void {
    Swal.fire({
      title: "¿ Estas seguro de modificar el registro?",
      text: "Una vez modificado ya no se podra cambiar",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ff4081",
      confirmButtonText: "Confirmar !",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // Se cierra en via la data y cierra el modal
        const oReturn = new Object();
        oReturn["status"] = true;
        oReturn["data"] = this.formDataPersonaSeleccionada.value;
        this.activeModal.close(oReturn);
      }
    });
  }
  //#endregion
}
