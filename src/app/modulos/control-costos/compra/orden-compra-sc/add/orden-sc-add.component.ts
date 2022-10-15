import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, } from "@angular/forms";
import { Cotizaciones, Solicitante, TipoServicio, SolicitanteCotizaciones, Proveedor, BancoProveedor, GeneralData, LugarEntrega, Moneda, } from '../models/general.entity';
import { DD_MM_YYYY_Format, Utilitarios } from "../repository/utilitarios";
import { SecurityErp } from "src/app/modulos/AAHelpers/securityErp.Entity";
import { CompraScService } from "../services/compra-sc.service";
import { DatePipe } from "@angular/common";
import { MAT_DATE_FORMATS } from "@angular/material/core";

import { MatTable } from "@angular/material/table";
import { OrdenCompraSc } from "../models/ordenCompraSc.entity";
import { RepositoryCompraSc } from "../repository/RepostitoryCompraSc";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
@Component({
  selector: "app-orden-sc-add.component",
  templateUrl: "./orden-sc-add.component.html",
  styleUrls: ["./orden-sc-add.component.css"],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format }, DatePipe]
})
export class OrdenScAddComponent implements OnInit, OnDestroy {
  subRef$: Subscription;
  formularioCompras: FormGroup;
  formularioComprasLineas: FormGroup;
  listSolicitante: Solicitante[];
  listCotizaciones: Cotizaciones[];
  listTipoServicio: TipoServicio[];
  listProveedor: Proveedor[];
  listBancoProveedor: BancoProveedor[];
  listLugarEntrega: LugarEntrega[];
  listMoneda: Moneda[];
  solicitanteCotizaciones = new SolicitanteCotizaciones();
  utilitarios = new Utilitarios();
  securityErp = new SecurityErp();
  ordenCompraSc = new OrdenCompraSc();
  repositoryCompraSc = new RepositoryCompraSc();

  // filtros de busqueda - Tabla detalle

  @ViewChild(MatTable) table: MatTable<any>;

  tempData: GeneralData[] = [
    {
      nIdCotizacionDet: null,
      codigoPartida: null,
      codigoArticulo: null,
      codigoSucursal: null,
      descripcionPartida: "",
      descripcion: "",
      descripcionArticulo: "",
      cantidad: null,
      precio: null,
      total: null,
      editable: true,
    },
  ];

  lcboCiudad: any;
  arrayCiudad = new Object();
  arrayPartida = new Object();

  constructor(
    private fb: FormBuilder,
    private service: CompraScService,
    private datePipe: DatePipe,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) {
  }

  ngOnInit(): void {
    this.formularioCompras = this.fb.group({
      //<!-- cabecera -->
      codigoSolicitante: ["", [Validators.required]],
      numeroPresupuesto: ["", [Validators.required]],
      tituloCotizacion: ["", [Validators.required]],
      contactoProveedor: ["", [Validators.required]],

      numeroCotizacion: ["", [Validators.required]],
      nombreCliente: ["", [Validators.required]],
      codigoProveedor: ["", [Validators.required]],
      plazoPago: ["", [Validators.required]],

      codigoServicio: ["", [Validators.required]],
      fechaorden: [[Validators.required]],
      codigoClienteBanco: ["", [Validators.required]],
      codigoMoneda: ["", [Validators.required]],

      // <!-- Campos auditoria -->
      txtAnio: ["", [Validators.required]],
      txtCodigo: [""],
      txtComprador: ["", [Validators.required]],
      FechaCreacion: [""],
      txtTipoCambio: ["", [Validators.required]],
      txtEstado: ["", [Validators.required]],

      //<!-- detalle -->

      fechaEntrega: [[Validators.required]],
      codigoLugarEntrega: ["", [Validators.required]],
      direccion: ["", [Validators.required]],

      codigoServicioImpuesto: [0],
      importeServicio: [0],

      codigoImpuesto: [0],
      importeImpuesto: [0],
    });

    this.formularioComprasLineas = this.fb.group({
      subtotalSoles: ["", [Validators.required]],
      serviciosSoles: ["", [Validators.required]],
      igvSoles: ["", [Validators.required]],
      totalSoles: ["", [Validators.required]],

      subtotalDolares: ["", [Validators.required]],
      serviciosDolares: ["", [Validators.required]],
      igvDolares: ["", [Validators.required]],
      totalDolares: ["", [Validators.required]],
    });
    this.formularioCompras.disable();
    this.formularioComprasLineas.disable();
  }

  fnGuardar() { }

  fnSalir() {
    this.router.navigate(["/controlcostos/compra/orden-compra-sc"]);
  }

  fnModificar() { }

  fnCancelar() { }



  Nuevo() {
    this.formularioCompras.enable();
    this.fnFiltroSolicitante();
    this.fnlistadoTipoServicio();
    this.fnlistadoProveedor();
    this.fnTipoCambio();
    this.fnEstado();
    this.formularioCompras.get("txtAnio").setValue(this.datePipe.transform(new Date(), "yyyy"));
    this.formularioCompras.get("txtComprador").setValue(this.securityErp.getLoginUsuario());

  }
  fnEnviar() {

  }

  // GET:APIS -> INICIO
  fnFiltroSolicitante() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pOpcion = 1;
    this.utilitarios.pParametro.push(this.securityErp.getEmpresa());
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listSolicitante = data;
      });
  }

  fnFiltroCotizaciones() {
    this.validarCambiarSolicitante();
    this.utilitarios.pParametro = [];
    this.utilitarios.pOpcion = 2;
    this.utilitarios.pParametro.push(
      this.formularioCompras.value.codigoSolicitante
    );
    this.utilitarios.pParametro.push(0);
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listCotizaciones = data;
      });
  }

  fnFiltroCotizacionesSolicitante() {
    this.fnlistadoLugarEntrega();

    this.utilitarios.pParametro = [];
    let codigoCentroCosto = this.listCotizaciones.filter(
      (x) => x.nIdCotizacion == this.formularioCompras.value.numeroCotizacion
    );
    this.utilitarios.codigoCentroCosto = codigoCentroCosto[0].codigoCentroCosto;
    this.utilitarios.pOpcion = 3;
    this.utilitarios.pParametro.push(this.formularioCompras.value.codigoSolicitante);
    this.utilitarios.pParametro.push(this.formularioCompras.value.numeroCotizacion);
    this.utilitarios.pParametro.push(this.utilitarios.codigoCentroCosto);
    this.utilitarios.pParametro.push(0);
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.solicitanteCotizaciones.sNombreComercial =
          data[0].sNombreComercial;
        this.solicitanteCotizaciones.sTitulo = data[0].sTitulo;
        this.solicitanteCotizaciones.sCodCC = data[0].sCodCC;
        this.solicitanteCotizaciones.dFchEntregaDeseada =
          data[0].dFchEntregaDeseada;
        this.solicitanteCotizaciones.direccion = data[0].direccion;
        this.solicitanteCotizaciones.codigoServicio = data[0].codigoServicio;
        this.solicitanteCotizaciones.codigoLugarEntrega =
          data[0].codigoLugarEntrega;

        this.formularioCompras
          .get("nombreCliente")
          .setValue(this.solicitanteCotizaciones.sNombreComercial);
        this.formularioCompras
          .get("tituloCotizacion")
          .setValue(this.solicitanteCotizaciones.sTitulo);
        this.formularioCompras
          .get("numeroPresupuesto")
          .setValue(this.solicitanteCotizaciones.sCodCC);
        this.formularioCompras
          .get("codigoLugarEntrega")
          .setValue(this.solicitanteCotizaciones.codigoLugarEntrega);
        this.formularioCompras
          .get("fechaEntrega")
          .setValue(this.solicitanteCotizaciones.dFchEntregaDeseada);
        this.formularioCompras
          .get("direccion")
          .setValue(this.solicitanteCotizaciones.direccion);
        this.formularioCompras
          .get("codigoServicio")
          .setValue(this.solicitanteCotizaciones.codigoServicio);
        // this.formularioCompras.get("fechaorden").setValue(new Date());
        this.fnPartidas();
      });
  }

  fnlistadoTipoServicio() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pOpcion = 4;
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listTipoServicio = data;
        // console.log(data);
      });
  }

  fnlistadoProveedor() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(this.securityErp.getPais());
    this.utilitarios.pOpcion = 5;
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listProveedor = data;
      });
  }
  fnFiltroProveedor() {
    let buscarProveedor = this.listProveedor.filter(
      (x) => x.codigoProveedor == this.formularioCompras.value.codigoProveedor
    );
    this.formularioCompras
      .get("contactoProveedor")
      .setValue(buscarProveedor[0].sContacto);
    this.formularioCompras
      .get("plazoPago")
      .setValue(buscarProveedor[0].nPlazoPago);
    this.fnlistadoProveedorBanco();
  }

  fnlistadoProveedorBanco() {
    this.utilitarios.pParametro = [];
    this.formularioCompras.controls.codigoClienteBanco.setValue("");
    this.utilitarios.pParametro.push(this.formularioCompras.value.codigoProveedor);
    this.utilitarios.pParametro.push(0);
    this.utilitarios.pOpcion = 6;
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listBancoProveedor = data;
      });
  }

  fnlistadoLugarEntrega() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(this.listCotizaciones[0].nIdCotizacion);
    this.utilitarios.pParametro.push(this.securityErp.getPais());
    this.utilitarios.pOpcion = 10;
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listLugarEntrega = data;
      });
  }
  fnFiltroDireccion() {
    const direccion = this.listLugarEntrega.filter(
      (x) =>
        x.codigoLugarEntrega == this.formularioCompras.value.codigoLugarEntrega
    );
    this.utilitarios.editarDireccion = true;
    if (direccion[0].direccion == "") this.utilitarios.editarDireccion = false;
    this.formularioCompras.get("direccion").setValue(direccion[0].direccion);
  }

  fnTipoCambio() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(this.securityErp.getPais());
    this.utilitarios.pOpcion = 11;
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.formularioCompras
          .get("txtTipoCambio")
          .setValue(data[0]["importeTipoCambio"]);
        this.ordenCompraSc.codigoTipoCambio = data[0]["codigoTipoCambio"];
      });
  }

  fnEstado() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pOpcion = 12;
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.formularioCompras
          .get("txtEstado")
          .setValue(data[0]["nombreEstado"]);
      });
  }

  fnImpuesto() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(this.securityErp.getPais());
    this.utilitarios.pOpcion = 13;
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.formularioCompras.get("importeImpuesto").disable();
        this.formularioCompras
          .get("importeImpuesto")
          .setValue(data[0]["importeImpuesto"]);
        this.formularioCompras
          .get("codigoImpuesto")
          .setValue(data[0]["codigoImpuesto"]);
        this.utilitarios.nombreImpuesto = data[0]["nombreImpuesto"];

        this.formularioCompras.get("codigoServicioImpuesto").setValue(false);
        this.formularioCompras.get("importeServicio").disable();
        this.formularioCompras.get("importeServicio").setValue("");

        this.eventoCkeckPorcentajeIGV();
      });
  }

  actualizarImpuesto($event) {
    if ($event.checked == false) {
      this.formularioCompras.get("importeImpuesto").setValue("");
      this.formularioCompras.get("codigoImpuesto").setValue(false);
      this.utilitarios.nombreImpuesto = "";

      this.formularioCompras.get("codigoServicioImpuesto").setValue(true);
      this.formularioCompras.get("importeServicio").enable();
      this.formularioCompras.get("importeImpuesto").setValue("");
    } else {
      this.fnImpuesto();
    }
  }

  actualizarServicio($event) {
    if ($event.checked == false) {
      this.formularioCompras.get("importeServicio").setValue("");
      this.formularioCompras.get("importeServicio").disable();
      this.fnImpuesto();
    } else this.formularioCompras.get("importeServicio").enable();
    this.formularioCompras.get("importeImpuesto").setValue("");
    this.formularioCompras.get("codigoImpuesto").setValue("");
    this.utilitarios.nombreImpuesto = "";
    this.formularioCompras.get("codigoImpuesto").setValue(false);
  }

  ApiListaMoneda() {
    let codigoBanco = this.listBancoProveedor.filter(
      (x) =>
        x.codigoClienteBanco == this.formularioCompras.value.codigoClienteBanco
    );
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(codigoBanco[0].codigoBanco);
    this.utilitarios.pParametro.push(this.formularioCompras.value.codigoProveedor);
    this.utilitarios.pOpcion = 14;
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listMoneda = data;
        this.formularioCompras.controls["codigoMoneda"].setValue(
          this.listMoneda[0].codigoMoneda
        );
      });
  }
  fnFiltroMoneda() {
    this.ApiListaMoneda();
  }

  // GET:APIS ------------------------------------------> FIN

  //Calculos IGV y SERVICIOS -> Inicio.
  eventoEnterPorcentajeServicio() {
    let costoDolar = this.formularioCompras.value.txtTipoCambio;
    let igv = 0.0;
    let totalSoles = this.obtenerImporteTotalLineas();
    let activoCheckServicioSoles = this.formularioCompras.controls[
      "importeServicio"
    ].value;
    let servicioSoles = (activoCheckServicioSoles * (totalSoles / 100)).toFixed(
      2
    );
    let totalParcialSoles = totalSoles - parseFloat(servicioSoles);

    let totalParcialDolares = (totalParcialSoles / costoDolar).toFixed(2);
    let servicioDolares = (parseFloat(servicioSoles) / costoDolar).toFixed(2);
    let totalDolares = (totalSoles / costoDolar).toFixed(2);

    this.formularioComprasLineas
      .get("subtotalDolares")
      .setValue(totalParcialDolares);
    this.formularioComprasLineas
      .get("serviciosDolares")
      .setValue(servicioDolares);
    this.formularioComprasLineas.get("igvDolares").setValue(igv);
    this.formularioComprasLineas.get("totalDolares").setValue(totalDolares);

    this.formularioComprasLineas
      .get("subtotalSoles")
      .setValue(totalParcialSoles.toFixed(2));
    this.formularioComprasLineas.get("serviciosSoles").setValue(servicioSoles);
    this.formularioComprasLineas.get("igvSoles").setValue(igv);
    this.formularioComprasLineas
      .get("totalSoles")
      .setValue(totalSoles.toFixed(2));
  }

  eventoCkeckPorcentajeIGV() {
    let costoDolar = this.formularioCompras.value.txtTipoCambio;
    let servicio = 0.0;
    let subtotalSoles = this.obtenerImporteTotalLineas();
    let activoCheckIgvSoles = this.formularioCompras.controls["importeImpuesto"]
      .value;
    let calcularIgvSoles = (
      activoCheckIgvSoles *
      (subtotalSoles / 100)
    ).toFixed(2);
    let totalSoles = subtotalSoles + parseFloat(calcularIgvSoles);
    let subTotalDolares = (subtotalSoles / costoDolar).toFixed(2);
    let igvDolares = (parseFloat(calcularIgvSoles) / costoDolar).toFixed(2);
    let totalDolares = (totalSoles / costoDolar).toFixed(2);

    this.formularioComprasLineas
      .get("subtotalDolares")
      .setValue(subTotalDolares);
    this.formularioComprasLineas.get("serviciosDolares").setValue(servicio);
    this.formularioComprasLineas.get("igvDolares").setValue(igvDolares);
    this.formularioComprasLineas.get("totalDolares").setValue(totalDolares);

    this.formularioComprasLineas.get("subtotalSoles").setValue(subtotalSoles);
    this.formularioComprasLineas.get("serviciosSoles").setValue(servicio);
    this.formularioComprasLineas.get("igvSoles").setValue(calcularIgvSoles);
    this.formularioComprasLineas
      .get("totalSoles")
      .setValue(totalSoles.toFixed(2));
  }

  obtenerImporteTotalLineas() {
    let sutotalAcumulado = 0;
    this.tempData.map((item) => {
      sutotalAcumulado = sutotalAcumulado + item.precio * item.cantidad;
    });
    return sutotalAcumulado;
  }

  // tablaDetalle
  InsertIntoArr() {
    this.tempData.push({
      nIdCotizacionDet: null,
      codigoPartida: null,
      descripcionPartida: "",
      codigoSucursal: null,
      descripcion: "",
      codigoArticulo: null,
      descripcionArticulo: "",
      cantidad: null,
      precio: null,
      total: null,
      editable: true,
    });
    this.table.renderRows();
  }

  EliminarElemento(i) {
    if (i !== 0) {
      this.tempData.splice(i, 1);
      this.table.renderRows();
    }
  }
  HabilitarEdicion(element): void {
    element.editable = true;
  }

  DeshabilitarEdicion(element): void {
    element.editable = false;
    this.fnImpuesto();
    this.obtenerImporteTotalLineas();
  }

  // Mètodos para los filtros de busquedas => Sucursales,Partidas,Articulos/Servicios

  fnPartidas() {
    let Compras = this.formularioCompras.value;
    this.utilitarios.pParametro = [];
    this.utilitarios.pOpcion = 18;
    this.utilitarios.pParametro.push(
      this.utilitarios.codigoCentroCosto
    );
    this.utilitarios.pParametro.push(
      (Compras.codigoServicio === 2143 ? 0 : 1)
    );

    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        console.log(data);
        this.arrayCiudad[0] = '';
        this.lcboCiudad = data

        this.lcboCiudad.map((e) => {
          this.arrayCiudad[e.nIdSuc] = e.lPar

          e.lPar.map((ePar) => {
            this.arrayPartida[e.nIdSuc + '' + ePar.nIdPar] = ePar.lArt;
          })
        });


      });
    //codigoServicio
  }

  fnCiudad(i) {
    this.tempData[i].codigoPartida = null;
    this.tempData[i].codigoArticulo = null;
    this.tempData[i].descripcionArticulo = "";
    this.tempData[i].descripcionPartida = "";

    this.lcboCiudad.map((e) => {
      if (e.nIdSuc === this.tempData[i].codigoSucursal) {
        this.tempData[i].descripcion = e.sSuc;
      }
    })
  }

  fnPartida(i) {
    this.tempData[i].codigoArticulo = null;
    this.tempData[i].descripcionArticulo = "";
    this.tempData[i].descripcionPartida = "";
    let suc = this.tempData[i].codigoSucursal

    this.arrayCiudad[suc].map((e) => {
      if (e.nIdPar === this.tempData[i].codigoPartida) {
        this.tempData[i].descripcionPartida = e.sPar;
      }
    })

  }
  fnArticulo(i) {
    let suc = this.tempData[i].codigoSucursal + '' + this.tempData[i].codigoPartida
    this.arrayPartida[suc].map((e) => {
      if (e.nIdArt === this.tempData[i].codigoArticulo) {
        this.tempData[i].descripcionArticulo = e.sArt;
      }
    })
  }

  // validacion de datos
  // 1. validando fecha y lugar de entrega
  public hasError = (controlName: string, errorName: string) => {
    return this.formularioCompras.controls[controlName].hasError(errorName);
  }


  async validarCambiarSolicitante() {
    const x = this.listSolicitante.filter(x => x.nId == this.formularioCompras.value.codigoSolicitante);
    if (this.obtenerImporteTotalLineas() > 0) {
      Swal.fire({
        title: '¿Desea Cambiar Solicitante?',
        text: "Al cambiar se eliminaran los Articulos/Servicios que estan agregados actualmente",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.formularioCompras.updateOn;
          this.formularioComprasLineas.reset();
          this.tempData = [];
          this.InsertIntoArr();
          // this.Nuevo();
          return;
        }
        else {
          this.formularioCompras.get('codigoSolicitante').setValue(x[0].sDescripcion)
        }
      })
    }
  }

  actualizarlineas() {
    this.fnImpuesto();
    this.obtenerImporteTotalLineas();
  }

  async save() {

    if (this.obtenerImporteTotalLineas() <= 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta ingresar el detalle de la compra SC',
      })
      return;
    }

    const lineas = [];
    this.tempData.forEach((detalle) => {
      let fila = [];
      fila.push(detalle.codigoSucursal);
      fila.push(detalle.codigoPartida);
      fila.push(detalle.codigoArticulo);
      fila.push(detalle.cantidad);
      fila.push(detalle.precio);
      fila.push(0);
      lineas.push(fila.join(","));
    });
    if (lineas.length <= 0) {
      return;
    }

   await Swal.fire({
      title: 'Esta orden de compra tiene una solicitud de cotizacion vinculada:',
      text: '¿Desea marcar la SC como terminada?',
      showDenyButton: true,
      denyButtonColor: '#d33',
      denyButtonText: `No`,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: `Si`
    }).then((result) => {
      if (result.isConfirmed) {
        this.ordenCompraSc.estado = '2185'
      } else if (result.isDenied) {
        this.ordenCompraSc.estado = '2271'
      }
      else
        return;
      // console.log("params");
      // console.log(lineas.join("/"));
      this.utilitarios.codigoGastoCosto = 0;
      this.ordenCompraSc.codigoIdPais = Number(this.securityErp.getPais());
      this.ordenCompraSc.codigoEmpresa = Number(this.securityErp.getEmpresa());
      this.ordenCompraSc.codigoCentroCosto = this.listCotizaciones[0].codigoCentroCosto;
      this.ordenCompraSc.codigoCotizacion = this.listCotizaciones[0].nIdCotizacion;
      this.ordenCompraSc.codigoUsuario = this.securityErp.getUsuarioId();
      this.ordenCompraSc.codigoSolicitante = this.formularioCompras.controls["codigoSolicitante"].value;
      this.ordenCompraSc.codigoProveedor = this.formularioCompras.controls["codigoProveedor"].value;
      this.ordenCompraSc.codigoMoneda = this.formularioCompras.controls["codigoMoneda"].value;
      this.ordenCompraSc.codigoBanco = this.formularioCompras.controls["codigoClienteBanco"].value;
      this.ordenCompraSc.codigoLugarEntrega = this.formularioCompras.controls["codigoLugarEntrega"].value;
      this.ordenCompraSc.codigoServicio = this.formularioCompras.controls["codigoServicio"].value;
      this.ordenCompraSc.igv = this.formularioCompras.controls["importeImpuesto"].value;
      this.ordenCompraSc.direccionEntrega = this.formularioCompras.controls["direccion"].value;
      this.ordenCompraSc.nombreTitulo = this.formularioCompras.controls["tituloCotizacion"].value;

      var fechaEntrega = this.datePipe.transform(this.formularioCompras.controls["fechaEntrega"].value, 'yyyy-MM-dd');
      this.ordenCompraSc.fechaEntrega = fechaEntrega
      var fechaOrden = this.datePipe.transform(this.formularioCompras.controls["fechaorden"].value, 'yyyy-MM-dd');
      this.ordenCompraSc.fechaOrden = fechaOrden
      this.ordenCompraSc.tipoDocumento = 'N';
      this.ordenCompraSc.detalle = lineas.join("/");
      this.spinner.show()

      this.service.fnGuardar(1, this.repositoryCompraSc.enviarCompraSc(this.ordenCompraSc)).subscribe((data: any) => {
        if (Number(data) > 0) {
          Swal.fire({
            icon: 'success',
            title: 'Exito',
            text: 'Se guardaron los cambios realizados',
          }).then(r => {
            this.router.navigate(['/controlcostos/compra/orden-sc-edit', data]);
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'comuniquese con el area de sistema',
          })
        }
      }, err => {
        console.log(err);
      },
        () => {
          this.spinner.hide();
        }
      )

    })
  }

  ngOnDestroy(): void {
    if (this.subRef$) { this.subRef$.unsubscribe(); }
  }

}
