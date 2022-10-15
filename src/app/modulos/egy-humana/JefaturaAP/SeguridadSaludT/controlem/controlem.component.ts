import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import moment from "moment";

import { adminpAnimations } from "../../Animations/adminp.animations";
import {
  ICiudadCombo,
  IDevengue,
  IDireccionClienteCombo,
  IEstadoExamenCombo,
  IPlanillaCombo,
  ITipoCombo,
} from "../../Model/Icontrolem";
import { ControlemService } from "../../Services/controlem.service";
import { ControlemDetailpComponent } from "./Modals/controlem-detailp/controlem-detailp.component";
import CiudadComboServicio from "./Utils/Comandos/Combo/CiudadComboServicio";
import ComboComando from "./Utils/Comandos/Combo/ComboComando";
import DevengueComboServicio from "./Utils/Comandos/Combo/DevengueComboServicio";
import DireccionClienteComboServicio from "./Utils/Comandos/Combo/DireccionClienteComboServicio";
import EstadoExamenComboServicio from "./Utils/Comandos/Combo/EstadoExamenComboServicio";
import PlanillaComboServicio from "./Utils/Comandos/Combo/PlanillaComboServicio";
import TipoComboServicio from "./Utils/Comandos/Combo/TipoComboServicio";
import { IComandoCEM } from "./Utils/Comandos/IComandoCem";
import PersonalComando from "./Utils/Comandos/Personal/PersonalComando";
import PersonalDelResponsableTablaServicioCEM from "./Utils/Comandos/Personal/PersonalDelResponsableTablaServicioCEM";
import ResponsableComando from "./Utils/Comandos/Responsable/ResponsableComando";
import ResponsablesTablaServicioCEM from "./Utils/Comandos/Responsable/ResponsablesTablaServicioCEM";
import { IPersonalDelResponsableDataTablaCEM } from "./Utils/Controlem/PersonalDelResponsableTabla/IPersonalDelResponsableDataTablaCEM";
import FbResponsableCEM from "./Utils/Controlem/ResponsablesTabla/FbResponsableCEM";
import { IResponsableDataTablaCEM } from "./Utils/Controlem/ResponsablesTabla/IResponsableDataTablaCEM";

@Component({
  selector: "app-controlem",
  templateUrl: "./controlem.component.html",
  styleUrls: ["./controlem.component.css", "./controlem.component.scss"],
  animations: [adminpAnimations],
})
export class ControlemComponent implements OnInit {
  
  editTable = null;
  sFechaDevengueSeleccionado: string = "";

  @ViewChild("paginacionResponsableTablaCEM", { static: true })
  paginacionResponsableTablaCEM: MatPaginator;

  @ViewChild("paginacionPersonalDelResponsableTablaCEM", { static: true })
  paginacionPersonalDelResponsableTablaCEM: MatPaginator;

  //#region FB
  animacionFb = "inactive";
  opcionesFb: any[] = [];
  devengeFb: any[] = [
    {
      icon: "calendar_today",
      tool: "Cambiar devengue",
    },
  ];
  //#endregion

  //#region DEVENGUE
  private _comandoDevengue: IComandoCEM = new ComboComando();
  private _data: IDevengue[] = [];

  meses = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
  };
  //#endregion

  //#region FILTRO
  private _comandoFiltroCombo: IComandoCEM = new ComboComando();
  filtroForm: FormGroup = this.formBuilder.group({
    sNombreDoc: "",
    sCodPlla: "",
    sCiudad: "",
    nEstado: "",
    sTipo: 0,
    sDireccionCliente: [{ value: 0, disabled: true }],
  });

  comboPlanilla: IPlanillaCombo[] = [];
  comboCiudad: ICiudadCombo[] = [];
  comboEstadoEm: IEstadoExamenCombo[] = [];
  comboTipo: ITipoCombo[] = [];
  comboDireccionCliente: IDireccionClienteCombo[] = [];
  //#endregion

  //#region PERSONAL DEL RESPONSABLE
  comandoPersonal: IComandoCEM = new PersonalComando();
  dataPersonal: IPersonalDelResponsableDataTablaCEM[];
  private ngbModalOptions: NgbModalOptions = {
    size: "xl",
    centered: true,
    scrollable: true,
    keyboard: false,
    backdrop: "static",
    windowClass: "modal-holder",
  };

  columnasTablaPersonal: string[] = [
    "action",
    "sNombres",
    "sCodPlla",
    "sTipo",
    "sDocumento",
    "dFechIni",
    "dFechFin",
    "sCiudad",
    "sEstado",
  ];
  dataSourcePersonal =
    new MatTableDataSource<IPersonalDelResponsableDataTablaCEM>([]);
  //#endregion

  //#region RESPONSABLES
  comandoResponsable: IComandoCEM = new ResponsableComando();

  columnasResponsables: string[] = ["sRespImg", "sResp"];
  dataSourceResponsables = new MatTableDataSource<IResponsableDataTablaCEM>([]);
  seleccionadoResponsable: IResponsableDataTablaCEM = {
    nIdResp: 0,
    sResp: "",
    fb: null,
  };
  //#endregion

  constructor(
    public service: ControlemService,
    public modalService: NgbModal,
    public spi: NgxSpinnerService,
    public snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {}

  async ngOnInit(): Promise<void> {
    this.spi.show("spi_main");
    await this.obtenerDataservicioDevengue();
    await this.cargarDataServicioResponsable();
    await this.cargarCombosFiltros();
    this.spi.hide("spi_main");
  }

  ngAfterViewInit() {
    this.paginarResponsable();
    this.paginarPersonal();
  }

  //#region FB
  public clickGrupoFb() {
    if (this.animacionFb === "active") {
      this.animacionFb = "inactive";
      this.opcionesFb = [];
      return;
    }

    if (this.animacionFb === "inactive") {
      this.animacionFb = "active";
      this.opcionesFb = this.devengeFb;
      return;
    }
  }

  public clickOpcionFb() {
    this._mostrarDevenguesFb();
  }

  private _mostrarDevenguesFb() {
    Swal.fire({
      title: "Seleccionar Devengue",
      icon: "info",
      text: "Al cambiar el devengue se mostrará la información relacionada al mes y año en cuestión.",
      input: "select",
      inputOptions: this.opcionSwalDevengue(),
      inputPlaceholder: "Seleccionar",
      showCancelButton: true,
      confirmButtonText: "Seleccionar",
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value === undefined || value === "") {
          return "Selección no válida.";
        }
      },
    }).then(async (resultado) => {
      if (resultado.isConfirmed) {
        if (this.sFechaDevengueSeleccionado === resultado.value.toString()) {
          this.snackBar.open("No se realizó ningún cambio", "Cerrar", {
            duration: 1000,
            horizontalPosition: "right",
            verticalPosition: "top",
          });
        } else {
          this.spi.show("spi_main");
          await this.cargarDataServicioPersonal(resultado.value.toString());
          this.sFechaDevengueSeleccionado = resultado.value.toString();
          this.spi.hide("spi_main");
        }
      }
    });
  }
  //#endregion

  //#region DEVENGUE

  public async obtenerDataservicioDevengue() {
    this._comandoDevengue.setServicio(new DevengueComboServicio(this.service));
    this._data = await this._comandoDevengue.ejecutar();
    await this.cargarDataServicioPersonal(this.obtenerElDevengueActual());
    this.sFechaDevengueSeleccionado = this.obtenerElDevengueActual();
  }

  public getDataDevengue(): IDevengue[] {
    return this._data;
  }

  public opcionSwalDevengue(): Map<number, any> {
    const map = new Map<number, any>();
    var key = "";
    var listaEjercicios = this._obtenerLosEjerciciosDevengue();

    listaEjercicios.forEach((ejercicio) => {
      var item = new Map();

      this._data.forEach((v) => {
        if (v.nEjercicio === ejercicio) {
          key =
            v.nIdDevengue +
            "|" +
            moment(new Date(v.nEjercicio, v.nMes - 1, 1)).format("MM/DD/YYYY");
          item.set(key, this.meses[v.nMes]);
        }
      });
      map.set(ejercicio, item);
    });
    return map;
  }

  private _obtenerLosEjerciciosDevengue(): number[] {
    var ejercicios: number[] = this._data.map((v) => v.nEjercicio);
    ejercicios = ejercicios.filter(function (value, index) {
      return ejercicios.indexOf(value) == index;
    });
    ejercicios = ejercicios.sort((a, b) => b - a);
    return ejercicios;
  }

  public obtenerElDevengueActual(): string {
    const devengue: IDevengue = this.getDataDevengue().find(
      (v) => v.nIdEstado !== 2
    );
    const fecha =
      devengue.nIdDevengue +
      "|" +
      moment(new Date(devengue.nEjercicio, devengue.nMes - 1, 1)).format(
        "MM/DD/YYYY"
      );
    return fecha;
  }

  public obtenerNombreDelDevengue(): string {
    var nombreDevengue = "";
    if (this.sFechaDevengueSeleccionado !== "") {
      nombreDevengue = this.sFechaDevengueSeleccionado.split("|")[1];
      var fecha = moment(nombreDevengue, "MM/DD/YYYY").toDate();
      nombreDevengue =
        this.meses[fecha.getMonth() + 1] + " del " + fecha.getFullYear();
    }

    return nombreDevengue;
  }
  //#endregion

  //#region FILTRO
  public filtrar() {
    this.filtroResponsables();

    this.dataSourcePersonal.filterPredicate = ((
      data: IPersonalDelResponsableDataTablaCEM,
      filter: any
    ) => {
      // tslint:disable-next-line: max-line-length
      // Filtrando por nombre o numero de documento
      const a =
        !filter.sNombreDoc ||
        data.sNombres.toLowerCase().includes(filter.sNombreDoc.toLowerCase()) ||
        data.sDocumento.toLowerCase().includes(filter.sNombreDoc.toLowerCase());

      // Filtrando por planilla
      const b =
        !filter.sCodPlla ||
        data.sCodPlla.toLowerCase().includes(filter.sCodPlla.toLowerCase());

      // Filtrando por ciudad
      const c =
        !filter.sCiudad ||
        data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());

      // Filtrando por estado
      const d = !filter.nEstado || data.nEstado === filter.nEstado;

      // Filtrando por Direccion / Cliente
      const e =
        !filter.sDireccionCliente ||
        data.nIdOrganizacion === filter.sDireccionCliente;

      return a && b && c && d && e;
    }) as (IPersonalDelResponsableDataTablaCEM, string) => boolean;

    this.dataSourcePersonal.filter = this.filtroForm.value;

    if (this.dataSourcePersonal.paginator) {
      this.dataSourcePersonal.paginator.firstPage();
    }
  }

  filtroResponsables() {
    const filter = this.filtroForm.value;
    var responsablesEncontrados = this.dataPersonal
      .filter((data) => {
        const a =
          !filter.sNombreDoc ||
          data.sNombres
            .toLowerCase()
            .includes(filter.sNombreDoc.toLowerCase()) ||
          data.sDocumento
            .toLowerCase()
            .includes(filter.sNombreDoc.toLowerCase());

        // Filtrando por planilla
        const b =
          !filter.sCodPlla ||
          data.sCodPlla.toLowerCase().includes(filter.sCodPlla.toLowerCase());

        // Filtrando por ciudad
        const c =
          !filter.sCiudad ||
          data.sCiudad.toLowerCase().includes(filter.sCiudad.toLowerCase());

        // Filtrando por estado
        const d = !filter.nEstado || data.nEstado === filter.nEstado;

        // Filtrando por Direccion / Cliente
        const e =
          !filter.sDireccionCliente ||
          data.nIdOrganizacion === filter.sDireccionCliente;

        return a && b && c && d && e;
      })
      .map((v) => v.nIdResp);

    this.dataSourceResponsables.filterPredicate = ((
      data: IResponsableDataTablaCEM,
      filter: any
    ) => {
      return responsablesEncontrados.some((v) => v === data.nIdResp);
    }) as (IResponsableDataTablaCEM, string) => boolean;

    this.dataSourceResponsables.filter = this.filtroForm.value;

    if (this.dataSourceResponsables.paginator) {
      this.dataSourceResponsables.paginator.firstPage();
    }

    if (this.dataSourceResponsables.filteredData.length) {
      this.cargarPersonalDelResponsable(
        this.dataSourceResponsables.filteredData[0]
      );
    }
  }

  public getValorCampoFiltro(nombreCampo: string): any {
    return this.filtroForm.controls[nombreCampo].value;
  }

  public setValorCampoFiltro(nombreCampo: string, nuevoValor: any): any {
    this.filtroForm.controls[nombreCampo].patchValue(nuevoValor);
  }

  public limpiarFiltro() {
    this.filtroForm.controls.sNombreDoc.patchValue("");
    this.filtrar();
  }

  public async cargarCombosFiltros() {
    this._comandoFiltroCombo.setServicio(
      new PlanillaComboServicio(this.service)
    );
    this.comboPlanilla = await this._comandoFiltroCombo.ejecutar();

    this._comandoFiltroCombo.setServicio(new CiudadComboServicio(this.service));
    this.comboCiudad = await this._comandoFiltroCombo.ejecutar();

    this._comandoFiltroCombo.setServicio(
      new EstadoExamenComboServicio(this.service)
    );
    this.comboEstadoEm = await this._comandoFiltroCombo.ejecutar();

    this._comandoFiltroCombo.setServicio(new TipoComboServicio(this.service));
    this.comboTipo = await this._comandoFiltroCombo.ejecutar();

    const servicioDireccionCliente = new DireccionClienteComboServicio(
      this.service
    );
    servicioDireccionCliente.setData(
      this._obtenerIdsCentroCostoDelPersonalFiltro()
    );
    this._comandoFiltroCombo.setServicio(servicioDireccionCliente);
    this.comboDireccionCliente = await this._comandoFiltroCombo.ejecutar();
  }

  private _obtenerIdsCentroCostoDelPersonalFiltro(): number[] {
    var listaIdsRepetidos = this.getDataPersonal().map(
      (item) => item.nIdCentroCosto
    );

    var listaIdsSinRepetir = listaIdsRepetidos.filter(function (value, index) {
      return listaIdsRepetidos.indexOf(value) == index;
    });

    return listaIdsSinRepetir;
  }

  public tipoComboSeleccionadoFiltro() {
    var tipo: number = this.filtroForm.controls.sTipo.value;
    tipo = tipo === undefined ? 0 : tipo;

    if (tipo === 0) {
      this.filtroForm.controls.sDireccionCliente.disable();
    }

    if (tipo !== 0) {
      this.filtroForm.controls.sDireccionCliente.enable();
    }
    this.filtroForm.controls.sDireccionCliente.patchValue(0);
    this.filtrar();
  }

  public dataFiltradaDireccionClienteCombo(): IDireccionClienteCombo[] {
    var tipo: number = this.filtroForm.controls.sTipo.value;
    tipo = tipo === undefined ? 0 : tipo;
    return this.comboDireccionCliente.filter((v) => v.nIdTipoCC === tipo);
  }
  //#endregion

  //#region PERSONAL DEL RESPONSABLE
  public async cargarDataServicioPersonal(sIdFechaDevengue: string) {
    const nIdDevengue = +sIdFechaDevengue.split("|")[0];
    const sFechaDevengue = sIdFechaDevengue.split("|")[1];
    const servicio = new PersonalDelResponsableTablaServicioCEM(this.service);
    servicio.setFechaDevengue(nIdDevengue, sFechaDevengue);
    this.comandoPersonal.setServicio(servicio);
    this.dataPersonal = await this.comandoPersonal.ejecutar();
  }

  public getDataPersonal() {
    return this.dataPersonal;
  }

  public filtrarDataPorResponsable(nIdResponsable: number) {
    const newData = this.dataPersonal.filter(
      (v) => v.nIdResp === nIdResponsable
    );
    this.cargarDataPersonal(newData);
  }

  public async cargarDataPersonal(data: IPersonalDelResponsableDataTablaCEM[]) {
    this.dataSourcePersonal =
      new MatTableDataSource<IPersonalDelResponsableDataTablaCEM>(data);
    this.dataSourcePersonal.paginator =
      this.paginacionPersonalDelResponsableTablaCEM;
  }

  public paginarPersonal() {
    this.dataSourcePersonal.paginator =
      this.paginacionPersonalDelResponsableTablaCEM;
  }

  public abrirModalDetallePersonal(nIdPersonal: number) {
    const modal = this.modalService.open(
      ControlemDetailpComponent,
      this.ngbModalOptions
    );
    modal.componentInstance.nIdPersonal = nIdPersonal;
    modal.componentInstance.sNombresResp = this.seleccionadoResponsable.sResp;

    modal.result.then(
      async (result) => {
        if (result.status) {
          this.spi.show("spi_main");
          await this.cargarDataServicioPersonal(
            this.sFechaDevengueSeleccionado
          );

          this.cargarPersonalDelResponsable(this.seleccionadoResponsable);
          this.filtrar();
          this.spi.hide("spi_main");
        }
      },
      (reason) => {}
    );
  }
  //#endregion

  //#region RESPONSABLES
  public async cargarDataServicioResponsable() {
    this.comandoResponsable.setServicio(
      new ResponsablesTablaServicioCEM(
        this.service,
        this._obtenerIDsResponsables()
      )
    );
    var data: IResponsableDataTablaCEM[] =
      await this.comandoResponsable.ejecutar();
    data = data.map((v) => {
      v.fb = new FbResponsableCEM();
      return v;
    });
    this.dataSourceResponsables =
      new MatTableDataSource<IResponsableDataTablaCEM>(data);
    this.dataSourceResponsables.paginator = this.paginacionResponsableTablaCEM;
    this._cargarPersonalDelPrimerResposable(data);
  }

  private _cargarPersonalDelPrimerResposable(data: IResponsableDataTablaCEM[]) {
    if (data.length > 0) {
      this.cargarPersonalDelResponsable(data[0]);
    }
  }

  public obtenerDataTablaResponsable(): IResponsableDataTablaCEM[] {
    return this.dataSourceResponsables.data;
  }

  public paginarResponsable() {
    this.dataSourceResponsables.paginator = this.paginacionResponsableTablaCEM;
  }

  public cargarPersonalDelResponsable(responsable: IResponsableDataTablaCEM) {
    this.filtrarDataPorResponsable(responsable.nIdResp);
    this.seleccionadoResponsable = responsable;
    this.seleccionadoResponsable.fb.setModalService(this);
  }

  private _obtenerIDsResponsables(): number[] {
    var respIds = this.getDataPersonal().map((item) => item.nIdResp);
    respIds = respIds.filter(function (value, index) {
      return respIds.indexOf(value) == index;
    });
    return respIds;
  }
  //#endregion
}
