import { DatePipe } from "@angular/common";
import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DATE_FORMATS } from "@angular/material/core";
import { MatTable } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subject, Subscription } from 'rxjs';
import { SecurityErp } from "src/app/modulos/AAHelpers/securityErp.Entity";
import Swal from "sweetalert2";
import { BancoProveedor, Cotizaciones, GeneralData, LugarEntrega, Moneda, Proveedor, Solicitante, SolicitanteCotizaciones, TipoServicio, } from "../models/general.entity";
import { OrdenCompraSc } from "../models/ordenCompraSc.entity";
import { RepositoryCompraSc } from "../repository/RepostitoryCompraSc";
import { DD_MM_YYYY_Format, Utilitarios } from "../repository/utilitarios";
import { CompraScService } from "../services/compra-sc.service";
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog } from "@angular/material/dialog";
import { OrdenCompraScFileComponent } from "../orden-compra-sc-file/orden-compra-sc-file.component";

@Component({
  selector: "app-orden-sc-edit.component",
  templateUrl: "./orden-sc-edit.component.html",
  styleUrls: ["./orden-sc-edit.component.css"],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format },
    DatePipe
  ]
})
export class OrdenScEditComponent implements OnInit {
  // ELIMINAR INICIO
  ListaCiudadAll: any[] = [];
  ListaPartidaAll: any[] = [];
  ListaArticuloAll: any[] = [];
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
  generalArr: any[];
  @ViewChild(MatTable) table: MatTable<any>;


  tempData: GeneralData[] = [];
  lcboCiudad: any;
  arrayCiudad = new Object();
  arrayPartida = new Object();
  subRef$: Subscription;
  constructor(
    private fb: FormBuilder,
    private service: CompraScService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
  ) {

    this.formularioCompras = this.fb.group({
      //<!-- cabecera -->
      codigoSolicitante: ["", [Validators.required]],
      numeroPresupuesto: ["", [Validators.required]],
      tituloCotizacion: ["", [Validators.required]],
      contactoProveedor: ["", [Validators.required]],

      codigoCotizacion: ["", [Validators.required]],
      nombreCliente: ["", [Validators.required]],
      codigoProveedor: ["", [Validators.required]],
      plazoPago: ["", [Validators.required]],

      codigoServicio: ["", [Validators.required]],
      fechaOrden: ["", [Validators.required]],
      codigoClienteBanco: ["", [Validators.required]],
      codigoMoneda: ["", [Validators.required]],

      // <!-- Campos auditoria -->
      anioCompra: ["", [Validators.required]],
      ordenCompra: ["", [Validators.required]],
      comprador: ["", [Validators.required]],
      fechaCreacion: ["", [Validators.required]],
      txtTipoCambio: ["", [Validators.required]],
      nombreEstado: ["", [Validators.required]],

      //<!-- detalle -->

      fechaEntrega: ["", [Validators.required]],
      codigoLugarEntrega: ["", [Validators.required]],
      direccion: ["", [Validators.required]],

      codigoServicioImpuesto: ["", [Validators.required]],
      importeServicioImpuesto: ["", [Validators.required]],

      codigoImpuesto: ["", [Validators.required]],
      importeImpuesto: ["", [Validators.required]],
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
  }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.utilitarios.codigoGastoCosto = this.route.snapshot.params.id;
    this.route.params.subscribe((params) => {
      this.utilitarios.pParametro = [];
      this.utilitarios.pParametro.push(params.id);
      this.service
        .fnConsultaComprasSc(this.utilitarios.pParametro)
        .subscribe((data: any) => {
          this.formularioCompras.patchValue(data[0])
          this.fnFiltroSolicitante();
          this.fnlistadoProveedor();
          this.fnlistadoProveedorBanco();          
          this.utilitarios.codigoGastoCosto = data[0].codigoGastoCosto;
          this.utilitarios.codigoTipoCambio = data[0].codigoTipoCambio;
          this.utilitarios.codigoSolicitante = data[0].codigoSolicitante;
          this.utilitarios.codigoCotizacion = data[0].codigoCotizacion;
          this.utilitarios.codigoCentroCosto = data[0].codigoCentroCosto;
          this.utilitarios.codigoEstado = data[0].codigoEstado;
          this.utilitarios.codigoServicioImpuesto = data[0].codigoServicioImpuesto;
          
          this.fnTipoCambio();
          setTimeout(() => {
            this.fnPartidas(data[0].codigoServicio);
          }, 2000);
          this.calculaDetalle();
        });
    });

    this.formularioCompras.get('codigoSolicitante').disable();
    this.formularioCompras.get('numeroPresupuesto').disable();
    this.formularioCompras.get('codigoServicio').disable();
    this.formularioComprasLineas.disable();
  }

  fnSalir() {
    this.router.navigate(["/controlcostos/compra/orden-compra-sc"]);
  }

  fnPrint() {
    this.router.navigate(['/controlcostos/compra/orden-sc-print', this.utilitarios.codigoGastoCosto]);
  }

  fnModificar() { }

  fnCancelar() { }

  // GET:APIS -> INICIO
  async fnFiltroSolicitante() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pOpcion = 1;
    this.utilitarios.pParametro.push(this.securityErp.getEmpresa());
    await this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listSolicitante = data;
        this.fnFiltroCotizaciones();
      });
  }

  async fnFiltroCotizaciones() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pOpcion = 2;
    this.utilitarios.pParametro.push(this.utilitarios.codigoSolicitante);
    this.utilitarios.pParametro.push(this.utilitarios.codigoCotizacion);
    await this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listCotizaciones = data;
        this.fnlistadoTipoServicio();
        this.fnFiltroCotizacionesSolicitante();
      });
  }

  async fnFiltroCotizacionesSolicitante() {
    this.fnlistadoLugarEntrega();
    this.utilitarios.pParametro = [];
    // let codigoCentroCosto = this.listCotizaciones.filter(
    //   (x) => x.nIdCotizacion == this.formularioCompras.value.codigoCotizacion
    // );
    // this.utilitarios.codigoCentroCosto = codigoCentroCosto[0].codigoCentroCosto;
    this.utilitarios.pOpcion = 3;
    this.utilitarios.pParametro.push(this.utilitarios.codigoSolicitante);
    this.utilitarios.pParametro.push(this.utilitarios.codigoCotizacion);
    this.utilitarios.pParametro.push(this.utilitarios.codigoCentroCosto);
    this.utilitarios.pParametro.push(this.utilitarios.codigoGastoCosto);
    await this.service
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
          .get("numeroPresupuesto")
          .setValue(this.solicitanteCotizaciones.sCodCC);
        this.fnFiltroProveedor();
      });
  }

  fnlistadoTipoServicio() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pOpcion = 4;
    this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listTipoServicio = data;
        this.fnlistadoLugarEntrega();
      });
  }

  async fnlistadoProveedor() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(this.securityErp.getPais());
    this.utilitarios.pOpcion = 5;
    await this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listProveedor = data;
        this.fnFiltroProveedor();
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
  }

  fnlistadoProveedorBanco() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(this.formularioCompras.controls["codigoClienteBanco"].value);
    this.utilitarios.pParametro.push(this.utilitarios.codigoGastoCosto);
    this.utilitarios.pOpcion = 6;
    this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe(data => {
        this.listBancoProveedor = data;
        this.ApiListaMoneda();
      });
  }

  fnlistadoLugarEntrega() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(this.utilitarios.codigoGastoCosto);
    this.utilitarios.pParametro.push(this.securityErp.getPais());
    this.utilitarios.pOpcion = 10;
    this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {
        this.listLugarEntrega = data;
        this.fnFiltroDireccion();
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

  async fnTipoCambio() {
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(this.securityErp.getPais());
    this.utilitarios.pParametro.push(this.utilitarios.codigoTipoCambio);
    this.utilitarios.pOpcion = 11;
    await this.service
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
    this.service
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
    this.service
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
        this.formularioCompras.get("importeServicioImpuesto").disable();
        this.formularioCompras.get("importeServicioImpuesto").setValue("");
        this.eventoCkeckPorcentajeIGV();
      });
  }

  actualizarImpuesto($event) {
    if ($event.checked == false) {
      this.formularioCompras.get("importeImpuesto").setValue("");
      this.formularioCompras.get("codigoImpuesto").setValue(false);
      this.utilitarios.nombreImpuesto = "";

      this.formularioCompras.get("codigoServicioImpuesto").setValue(true);
      this.formularioCompras.get("importeServicioImpuesto").enable();
      this.formularioCompras.get("importeServicioImpuesto").setValue("");
    } else {
      this.fnImpuesto();
    }
  }

  actualizarServicio($event) {
    if ($event.checked == false) {
      this.formularioCompras.get("importeServicio").setValue("");
      this.formularioCompras.get("importeServicio").disable();
      this.fnImpuesto();
    } else this.formularioCompras.get("importeServicioImpuesto").enable();
    this.formularioCompras.get("importeServicioImpuesto").setValue("");
    this.formularioCompras.get("codigoImpuesto").setValue("");
    this.utilitarios.nombreImpuesto = "";
    this.formularioCompras.get("codigoImpuesto").setValue(false);
  }

  async ApiListaMoneda() {
    let codigoBanco = this.listBancoProveedor.filter(
      (x) =>
        x.codigoClienteBanco == this.formularioCompras.value.codigoClienteBanco
    );
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(codigoBanco[0].codigoBanco);
    this.utilitarios.pParametro.push(this.formularioCompras.value.codigoProveedor);
    this.utilitarios.pOpcion = 14;
    await this.service
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
  async fnFiltroMoneda() {
    await this.ApiListaMoneda();
  }

  // GET:APIS ------------------------------------------> FIN

  //Calculos IGV y SERVICIOS -> Inicio.
  eventoEnterPorcentajeServicio() {
    let costoDolar = this.formularioCompras.value.txtTipoCambio;
    let igv = 0.0;
    let totalSoles = this.obtenerImporteTotalLineas();
    let activoCheckServicioSoles = this.formularioCompras.controls[
      "importeServicioImpuesto"
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
  // Metodos para los filtros de busquedas
  // 1.Sucusales - Inicio


  //Partida - FIN

  // 3.ArticuloServicio - Inicio


  //Partida - FIN

  // Detalle de Contizacion

  ApiDetalleGeneralComprasSc(codigoGastoCosto: number) {
    this.utilitarios.pParametro = [];
    this.utilitarios.pParametro.push(codigoGastoCosto);
    this.utilitarios.pParametro.push(0);
    this.service
      .fnConsultaDetallesComprasSc(this.utilitarios.pParametro)
      .subscribe((data: any) => {
        this.generalArr = data;                
      });
  }

  dataCompras() {
    this.route.params.subscribe((rh) => {
      this.ObtenerDetallePorGeneral(rh.id).subscribe((generalArr) => {
        this.generalArr = generalArr;
        // this.contadorEnGeneral = generalArr.length;
      });
    });
  }

  calculaDetalle() {
    this.route.params.subscribe((rh) => {
      this.ObtenerDetallePorGeneral(rh.id).subscribe(
        (tbl_lineas_general: GeneralData[]) => {
          this.tempData = tbl_lineas_general;          
        }
      );
    });

    if (!this.utilitarios.codigoServicioImpuesto) {
      setTimeout(() => {
        this.fnImpuesto();
      }, 1000);
    }
    else {
      setTimeout(() => {
        this.eventoEnterPorcentajeServicio();
      }, 1000);
    }
  }

  ObtenerDetallePorGeneral(id): Observable<any> {
    const params = [];
    const subject = new Subject();
    params.push(id);
    this.service.fnConsultaDetallesComprasSc(params).subscribe((res) => {
      res.forEach((c) => {
        c.editable = false;
      });
      subject.next(res);
    });
    return subject.asObservable();
  }

  // Mètodos para los filtros de busquedas => Sucursales,Partidas,Articulos/Servicios

  fnPartidas(x?) {
    let Compras = this.formularioCompras.value;
    this.utilitarios.pParametro = [];
    this.utilitarios.pOpcion = 18;
    this.utilitarios.pParametro.push(this.utilitarios.codigoCentroCosto);
    if (Compras.codigoServicio == undefined) {
      this.utilitarios.pParametro.push(x === 2143 ? 0 : 1);
    }
    else {
      this.utilitarios.pParametro.push(
        (Compras.codigoServicio === 2143 ? 0 : 1)
      );
    }
    this.subRef$ = this.service
      .fnDatosOrdenCompras(
        this.utilitarios.pOpcion,
        this.utilitarios.pParametro
      )
      .subscribe((data: any) => {        
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
    
      this.ordenCompraSc.codigodGastoCosto = this.utilitarios.codigoGastoCosto;
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
      this.ordenCompraSc.fechaEntrega = this.formularioCompras.value.fechaEntrega;
      this.ordenCompraSc.fechaOrden = this.formularioCompras.value.fechaorden;
      this.ordenCompraSc.tipoDocumento = 'N';

      this.ordenCompraSc.detalle = lineas.join("/");      
      // console.log(this.repositoryCompraSc.enviarCompraSc(this.ordenCompraSc));

      this.spinner.show()

      this.service.fnGuardar(2, this.repositoryCompraSc.enviarCompraSc(this.ordenCompraSc)).subscribe((data: any) => {
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


  fnEnviar() {

  }


  // subir archivo pdf

  fnArchivos() {

    let nId = this.utilitarios.codigoGastoCosto;
    var Numero = this.formularioCompras.value.ordenCompra
    this.dialog.open(OrdenCompraScFileComponent, {
      width: '80%',
      data: { nId, Numero }
    });
  }

}
