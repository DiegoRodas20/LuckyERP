import { Component, OnInit, ViewChild } from "@angular/core";
import { ISolicitudMovilidad } from "../../Models/SolicitudMovilidad/solicitud_movilidad/ISolicitudMovilidad";

import { FormControl } from "@angular/forms";

import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Router } from "@angular/router";

import { SolicitudMovilidadService } from "../solicitud-movilidad.service";
import { EstadoDocumentoEnum } from "../../Shared/SolicitudMovilidad/estado_documento.emun";
import { TipoCargoUserEnum } from "../../Shared/SolicitudMovilidad/tipo_cargo_user.enum";

import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";

import { asistenciapAnimations } from './../../Asistencia/asistenciap/asistenciap.animations';


@Component({
  selector: "app-solicitud-movilidad",
  templateUrl: "./solicitud-movilidad.component.html",
  styleUrls: ["./solicitud-movilidad.component.css"],
  animations: [asistenciapAnimations]
})
export class SolicitudMovilidadComponent implements OnInit {

  //#region TIPO DE CARGO DEL USUARIO
  tipoCargoUser: string = "";
  tipoCargoUserEnum = TipoCargoUserEnum;
  //#endregion

  //#region CARGA DE DATA
  data: ISolicitudMovilidad[] = [];
  //#endregion

  //#region FILTRO BUSCADOR
  controlFiltroBuscador = new FormControl();
  dataFiltrada1: ISolicitudMovilidad[] = [];
  dataFiltrada2: ISolicitudMovilidad[] = [];

  searchKey: string

  //#region RADIOS
  labelFiltro1: string = "0";
  labelFiltro2: string = "0";
  disabled = false;

  estadoDocumento = EstadoDocumentoEnum;
  //#endregion

  //#endregion

  //#region TABLA
  displayedColumns: string[] = [
    "eliminar",
    "campania",
    "nro_documento",
    "mes",
    "numero_personas",
    "total",
    "estado"
  ];

  dataSource = new MatTableDataSource<ISolicitudMovilidad>(this.data);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  //#endregion

  abLista = [];
  tsLista = 'active';
  fbLista = [
    { icon: 'attach_money', tool: 'Nuevo Solicitud de movilidad' }
  ];
  constructor(
    private router: Router,
    private solicitudMovilidadService: SolicitudMovilidadService,
    private spinnerService: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.spinnerService.show();
    this.obtenerTipoCargo();
    this.cargarDataAPI();
    this.onToggleFab(1, -1)
    // this.filtroBuscador();
  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
        this.tsLista = (stat === 0) ? 'inactive' : 'active';
        this.abLista = (stat === 0) ? [] : this.fbLista;
        break;

      default:
        break;
    }

  }

  //#region  TIPO DE CARGO DEL USUARIO
  private async obtenerTipoCargo() {
    var params = [];
    params.push(1); //empresa id
    params.push(1); //user id
    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(20, params, "|")
      .then((data: any) => {
        this.tipoCargoUser = "612";
      });
  }
  //#endregion

  //#region CARGA DE DATA
  private async cargarDataAPI() {
    const user = localStorage.getItem("currentUser");
    var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;
    var idEmpresa = localStorage.getItem("Empresa");

    var params = [];
    params.push(idUser); // user_id
    params.push(idEmpresa); // user_id
    await this.solicitudMovilidadService
      .crudSolicitudesMovilidad(4, params, "|")
      .then((data: ISolicitudMovilidad[]) => {
        this.data = data;
        this.dataFiltrada1 = data;
        this.dataFiltrada2 = data;

        this.dataSource = new MatTableDataSource<ISolicitudMovilidad>(
          this.dataFiltrada2
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort
      });
    this.spinnerService.hide();
  }
  //#endregion

  //#region FILTRO

  public obtenerValorRadio(numeroFiltro: number, valor: string) {
    if (numeroFiltro === 1) {
      this.labelFiltro1 = valor;
    }
    if (numeroFiltro === 2) {
      this.labelFiltro2 = valor;
    }
    this.filtro();
  }

  // Primer filtro
  public filtro() {
    var dataAux = null;
    // Primer filtro
    if (this.labelFiltro1 === "0") {
      dataAux = this.data;
    } else {
      dataAux = this.data.filter((item) => {
        if (item.tipo_solicitud_codigo === this.labelFiltro1) {
          return item;
        }
      });
    }

    // Segundo filtro
    if (this.labelFiltro2 === "0") {
      this.dataFiltrada1 = dataAux;
    } else {
      this.dataFiltrada1 = dataAux.filter((item) => {
        if (item.estado_codigo === this.labelFiltro2) {
          return item;
        }
      });
    }
    this.dataFiltrada2 = this.dataFiltrada1;

    this.dataSource = new MatTableDataSource<ISolicitudMovilidad>(
      this.dataFiltrada2
    );
    this.dataSource.paginator = this.paginator;
  }
  //#endregion

  //#region FILTRO BUSCADOR
  // private filtroBuscador() {
  //   this.controlFiltroBuscador.valueChanges.subscribe((val: string) => {
  //     val = val.trim().toLocaleLowerCase();
  //     if (val.length === 0) {
  //       this.dataFiltrada2 = this.dataFiltrada1;
  //     } else {
  //       this.dataFiltrada2 = this.dataFiltrada1.filter((item) => {
  //         if (item.nro_documento.toLocaleLowerCase().indexOf(val) !== -1) {
  //           return item;
  //         }
  //       });
  //     }
  //     this.dataSource = new MatTableDataSource<ISolicitudMovilidad>(
  //       this.dataFiltrada2
  //     );
  //     this.dataSource.paginator = this.paginator;
  //   });
  // }
  //#endregion
  limpiar() {
    this.searchKey = ""
    this.cargarDataAPI()
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  //#region TABLA
  public nombreColumna(nombreColumna: string) {
    switch (nombreColumna) {
      case "eliminar":
        return "Opción";
        
      case "nro_documento":
        return "Nro";

      case "campania":
        return "Presupuesto";

      case "obser_reembolso":
        return "Obser. Reembolso";

      case "mes":
        return "Fecha de Envío";

      case "numero_personas":
        return "Personas";

      case "total":
        return "Total Importe";

      case "rq_final":
        return "Rq Final";

      case "estado":
        return "Estado";

      default:
        return nombreColumna;
        break;
    }
  }
  //#endregion

  //#region VER DETALLE SOLICITUD

  public dobleClickVerRegistro(item) {

    this.router.navigateByUrl(
      "comercial/requerimiento/solicitud_movilidad/detalle/" + item.solicitud_id
    );
  }

  //#endregion

  //#region BOTONES
  public nuevaSolicitud() {
    this.router.navigateByUrl(
      "comercial/requerimiento/solicitud_movilidad/asignacion"
    );
  }

  public eliminarSolicitud(element) {

    Swal.fire({
      title: "¿Estas seguro?",
      text: "No podras revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#334d6e",
      cancelButtonColor: "#ff4081",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Si, eliminar esta SM!",
    }).then((result) => {
      if (result.isConfirmed) {
        const user = localStorage.getItem("currentUser");
        var idUser = JSON.parse(window.atob(user.split(".")[1])).uid;

        var params = [];
        params.push(idUser); // user_id
        params.push(element.solicitud_id);
        this.solicitudMovilidadService
          .crudSolicitudesMovilidad(5, params, "|")
          .then((data) => {
            Swal.fire({
              title: "Eliminado!",
              text: "Solicitud eliminada",
              icon: "success",
              confirmButtonText: "Ok",
            });

            this.data = this.data.filter(
              (item) => item.nro_documento !== element.nro_documento
            );
            this.filtro();
          });
      }
    });
  }
  //#endregion
}
