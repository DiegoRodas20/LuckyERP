import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { adminpAnimations } from "../../../../Animations/adminp.animations";
import {
  ICitaPorResposablePersonalDetalle,
  ITrabajador,
} from "../../../../Model/Igestionem";
import { GestionemService } from "../../../../Services/gestionem.service";
import CitasPorResposablePersonalDetalleServicio from "../../Comandos/General/CitasPorResposablePersonalDetalleServicio";
import GeneralComando from "../../Comandos/GeneralComando";

interface IFbItem {
  icon: string;
  tool: string;
}

@Component({
  selector: "app-gestionem-detail",
  templateUrl: "./gestionem-detail.component.html",
  styleUrls: [
    "./gestionem-detail.component.css",
    "gestionem-detail.component.scss",
  ],
  animations: [adminpAnimations],
})
export class GestionemDetailComponent implements OnInit {
  //#region INPUT
  @Input() infoPersonalData: ITrabajador;
  @Input() nIdResp: number = 0;
  //#endregion

  //#region FB
  fbAnimacion = "inactive";

  fbOpcionesActivas = [];
  fbPrimeraOpcion: IFbItem[] = [
    {
      icon: "save",
      tool: "Guardar",
    },
    {
      icon: "delete",
      tool: "Eliminar",
    },
  ];
  //#endregion

  //#region MODAL
  pbDetail = false;
  //#endregion

  //#region INFORMACION PERSONAL
  infoPersonalForm = this.fb.group({
    nIdPersonal: 0,
    nIdPerLab: 0,
    sNombres: [{ value: "", disabled: true }],
    sCodPlla: [{ value: "", disabled: true }],
    sDscTipo: [{ value: "", disabled: true }],
    sDocumento: [{ value: "", disabled: true }],
    dFechIni: [{ value: null, disabled: true }],
    dFechFin: [{ value: null, disabled: true }],
    nEstado: 0,
    sEstado: [{ value: "", disabled: true }],
    sCiudad: [{ value: "", disabled: true }],
    nEleCodEstado: 0,
    cEleNamEstado: [{ value: "", disabled: true }],
  });
  //#endregion

  //#region HISTORIAL DE EXAMENES
  generalComando: GeneralComando = new GeneralComando();

  expandedMore: null;
  historialExamenMedicoColumnas: string[] = [
    "dFecha",
    "dFechIni",
    "dFechFin",
    "sEstado",
  ];

  historialExamenMedicoDataSource = new MatTableDataSource<ICitaPorResposablePersonalDetalle>(
    []
  );

  @ViewChild("pagHistorialExamenMedico", { static: true })
  pagHistorialExamenMedico: MatPaginator;
  //#endregion

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    public spi: NgxSpinnerService,
    private servicio: GestionemService
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_detalle_gestion_em");
    this._llenarDataInfoPersonalFormulario();
    await this.cargarCitas();
    this.spi.hide("spi_detalle_gestion_em");
  }

  ngAfterViewInit() {
    this.historialExamenMedicoDataSource.paginator = this.pagHistorialExamenMedico;
  }

  //#region FB
  public onToggleFab(): void {
    if (this.fbAnimacion === "active") {
      this.fbAnimacion = "inactive";
      this.fbOpcionesActivas = [];
    } else if (this.fbAnimacion === "inactive") {
      this.fbAnimacion = "active";
      this.fbOpcionesActivas = this.fbPrimeraOpcion;
    }
  }

  public clickFab(item: IFbItem): void {}
  //#endregion

  //#region MODAL
  public closeDetail() {
    const oReturn = new Object();
    oReturn["status"] = true;
    this.activeModal.close(oReturn);
  }
  //#endregion

  //#region INFORMACION PERSONAL
  private _llenarDataInfoPersonalFormulario() {
    this.infoPersonalForm.patchValue({
      nIdPersonal: this.infoPersonalData.nIdPersonal,
      nIdPerLab: this.infoPersonalData.nIdPerLab,
      sNombres: this.infoPersonalData.sNombres,
      sCodPlla: this.infoPersonalData.sCodPlla,
      sDscTipo: this.infoPersonalData.sDscTipo,
      sDocumento: this.infoPersonalData.sDocumento,
      nEleCodEstado: this.infoPersonalData.nEleCodEstado,
      cEleNamEstado: this.infoPersonalData.cEleNamEstado,
      sCiudad: this.infoPersonalData.sCiudad,
      dFechIni: this.infoPersonalData.dFechIni,
      dFechFin: this.infoPersonalData.dFechFin,
    });
  }
  //#endregion

  //#region HISTORIAL DE EXAMENES
  public async cargarCitas() {
    const servicio = new CitasPorResposablePersonalDetalleServicio(
      this.servicio,
      this.nIdResp,
      this.infoPersonalData.nIdPerLab
    );

    this.generalComando.setServicio(servicio);
    const data = await this.generalComando.ejecutar();
    this.historialExamenMedicoDataSource = new MatTableDataSource<any>(data);
  }
  //#endregion
}
