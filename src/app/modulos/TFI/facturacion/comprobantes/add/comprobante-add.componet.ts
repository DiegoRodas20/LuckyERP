import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { DD_MM_YYYY_Format } from 'src/app/modulos/control-costos/compra/orden-compra-sc/repository/utilitarios';
import { MatTable } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2'; 
import { SecurityErp } from 'src/app/modulos/AAHelpers/securityErp.Entity';
import { AfectacionEntity, ColumnasTablas, DetraccionEntity, DocumentoEntity, FormaPago, ImpuestoEntity, MaterialesEntity, MonedaEntity, PresupuestoEntity, tablaColMaterial, TipoCambioEntity } from '../../../repository/models/general.Entity';
import { SerieEntity } from '../../../repository/models/serie.entity';
import { ComprobanteDetalleForCreation } from '../../../repository/models/comprobanteDetalleForCreation.entity';
import { DataService } from '../../../repository/services/data.service';
import { SerieQuery } from '../../../repository/models/serieQuery.entity';
import { ComprobanteForCreation } from '../../../repository/models/comprobanteForCreation.entity';
import { Utilitarios } from '../../../repository/helpers/repository.Utilitarios';
import { FacturacionService } from '../../../repository/services/facturacion.service';
import { CatalogoClienteService } from '../../../repository/services/catalogo-cliente.service';
import { CatalogoClienteDto } from '../../../repository/models/catalogo-cliente/catalogoClienteDto';
import moment from 'moment'; 
import { MatDialog } from '@angular/material/dialog';
import { DialogMaterialFacComponent } from '../components/dialog-material-fac/dialog-material-fac.component';

@Component({
  selector: "app-comprobante-add",
  templateUrl: "./comprobante-add.component.html",
  styleUrls: ["./comprobante-add.component.css"],
  animations: [asistenciapAnimations],

  providers: [
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format }, DatePipe]
})

export class ComprobanteAddComponent implements OnInit, OnDestroy {
  securityErp = new SecurityErp();
  utilitarios = new Utilitarios();
  formulario: FormGroup;
  formularioLineas: FormGroup;
  isLinear = false;
  documentoList: DocumentoEntity[];
  servicioList: DocumentoEntity[];
  serieList: SerieEntity[];
  monedaList: MonedaEntity[];
  clienteList: CatalogoClienteDto[];
  clienteListTotal: CatalogoClienteDto[];
  afectacionList: AfectacionEntity[];
  detraccionList: DetraccionEntity[];
  presupuestoList: PresupuestoEntity[];
  tipoCambioList = new TipoCambioEntity();
  formaPagoList: FormaPago[];
  impuesto = new ImpuestoEntity();
  subRef$: Subscription;
  comprobanteDetalle: ComprobanteDetalleForCreation[];
  tipoComprobante: string;
  validarserie: boolean = false;
  botonNuevo: boolean = true;
  matcher = new ErrorStateMatcher();
  selected = 'S/' 
  //definicion de entidades(objectos) para calculos de comprobantes : MATERIALES. 
  convertidoASoles;
  @ViewChild(MatTable) table: MatTable<any>;
  tsLista = 'active';  // Inicia la lista oculta
  fbLista = [ // Lista de las opciones que se mostrarán

  ];
  abLista = [];
  // Inicio de las columnas de las tablas

  //Lista para los detalles de servicio
  tempData: ColumnasTablas[] = [
    {
      codigoComprobanteDet: null,
      centroCosto: null,
      pptos: "",
      totalPptos: null,
      aCuenta: 0,
      aCuentaEstatica: 0,
      anadir: 0,
      valorVentaPorcentaje: 0,
      valorVenta: 0,
      ssubTotal:null,
      sanadir : null,
      simpuesto: null,
      stotal: null,
      impuesto: null,
      total: null,
      editable: true,
      cuentaContable: "",
      codigoServicio: 0,
      cliente: "",
      moneda: "",
      isConvertMoneda: false
    }
  ];

  //lIsta para los detalles de materiales
  tempDataM: tablaColMaterial[] = [
    {
      cuenta: null,
      sarticuloServicio: null,
      articuloServicio: null,
      detalle: null,
      unidadMedida: null,
      cantidad: 0,
      precioUnitario: 0,
      subTotal: 0,
      igv: 0,
      total: 0,
      ssubTotal: null,
      sigv: null,
      stotal: null,
      editable: true
    }
  ];


  constructor(
    private fb          : FormBuilder,
    private dataService : DataService,
    private router      : Router,
    public datepipe     : DatePipe,
    private spinner     : NgxSpinnerService,
    private facturacionService: FacturacionService,
    private catalogoService: CatalogoClienteService,
    public dialog: MatDialog 
  ) {
    /* Creación de formularios
      creación de los formularios base, el this.formulario es el de la página 1
      el formularioLineas es de la página 2
    */
    this.formulario = this.fb.group({
      codigoServicio: ['', [Validators.required]],
      codigoDocumento: ['', [Validators.required]],
      ordenCompra: [''],
      pptos: [],
      descPpto: [''],
      cliente: [''],
      fechaComprobante: [Validators.required],
      sucursal: [],
      psOserv: [''],
      codigoMoneda: ['', [Validators.required, Validators.minLength(2)]],
      codigoSerie: ['', [Validators.required, Validators.minLength(2)]],
      aceptacion: [''],
      codigoAfectacion: ['', [Validators.required, Validators.minLength(2)]],
      codigoTipoCambio: ['', [Validators.required]],
      numeroSerie: [{value: '', disabled: true}],
      glosa: ['', Validators.required],
      observacion1: [''],
      observacion2: [''],
      codigoDetraccion: [''],
      porcentajeDetraccion: [{value: '', disabled: true}],
      totalDetraccion: [''],
      codigoFormaPago: ['', [Validators.required]]
    });

    this.formularioLineas = this.fb.group({
      descripcionTipoDocumento: [{value: '', disabled: true}, [Validators.required]],
      descripcionSucursal: [],
      descripcionNumeroSerie: ['', [Validators.required, Validators.minLength(2)]],
      descripionNumeradorSerie: [{value: '', disabled: true}, Validators.required],
      descripcionMoneda: ['', Validators.required],
      descripcionTipoCambio: ['', Validators.required],

      tAnadido: [''],
      sAnadido: ['', Validators.required],
      tValorVenta: [''],
      sValorVenta : ['', Validators.required],
      descripcionCorta: ['', Validators.required],
      importePorcenje: [''],
      simportePorcenje : ['', Validators.required],
      totalFinal: [''],
      stotalFinal : ['', Validators.required],
    });

  }

  public hasError = (controlName: string, errorName: string) => {
    return this.formulario.controls[controlName].hasError(errorName);
  }

  async ngOnInit(): Promise<void> {
    // this.formulario.disable();
    this.utilitarios.mostrarTablaLineas = true;
    await this.nuevoComprobante();
  }
 
  async nuevoComprobante() {
    // this.formulario.enable();
    // this.formularioLineas.enable();
    this.formulario.controls.descPpto.disable();
    this.formulario.controls.totalDetraccion.disable();
    this.formularioLineas.enable();
    this.formulario.get('glosa').setValue('Por nuestro servicio de marketing promocional. ');
    this.formulario.get('fechaComprobante').setValue(new Date());
    this.spinner.show();
    await this.validaPaisEcuador();
    // se cargan todos los combos base para poder generar el comprobante
    await this.getTipoServicio();
    await this.getListadoDocumento();
    await this.getFormaPago();
    if (this.securityErp.getPais() == '604') {
      await this.getListadoMoneda(this.securityErp.getPais());
      await this.getListadoTipoCambio();
      await this.getListadoDetraccion();
    }
    await this.getListadoAfectacion();
    await this.getListadoImpuesto();
    await this.mat_ObtenerCliente();
    this.formularioLineas.controls.descripcionTipoDocumento.disable();
    this.formularioLineas.controls.descripcionSucursal.disable();
    this.formularioLineas.controls.descripcionNumeroSerie.disable();
    this.formularioLineas.controls.descripionNumeradorSerie.disable();
    this.formularioLineas.controls.descripcionMoneda.disable();
    this.formularioLineas.controls.descripcionTipoCambio.disable();

    this.formularioLineas.controls.sAnadido.disable();
    this.formularioLineas.controls.sValorVenta.disable();
    this.formularioLineas.controls.descripcionCorta.disable();
    this.formularioLineas.controls.simportePorcenje.disable();
    this.formularioLineas.controls.stotalFinal.disable();

    this.utilitarios.detracciones();
  }

  detalleDetraccion() { // Listo

    const result = this.detraccionList.filter(x => x.codigoDetracion === this.formulario.value.codigoDetraccion);
    this.utilitarios.descripcionLargaDetraccion = result[0].descripcionLarga;
    this.utilitarios.porcentaje = result[0].porcentaje;
    this.utilitarios.totalDetraccion = result[0].totalDetraccion;
    this.formulario.get('porcentajeDetraccion').setValue(this.utilitarios.porcentaje);
    this.calcularDetraccion();

  }

  async calcularDetraccion() {
    let totalF = (this.formularioLineas.value.totalFinal).toString();

    totalF = totalF.replace(',', '')
    let totalD = 0;
    if (Number(totalF) > this.utilitarios.totalDetraccion)
      totalD = totalF * (this.utilitarios.porcentaje / 100)
    this.formulario.get('totalDetraccion').setValue(totalD.toFixed(2)); 
  }

  consultaTipoCambio() {
    this.getListadoTipoCambio()
  }

  obtenerNumeradorSerie(e) { //Listo
    const result = this.serieList.filter(x => x.codigoSerie === e);
    let anchoNumerador = result[0].anchoNumerador
    let numeroSerie = result[0].numeroSerie
    this.formularioLineas.get('descripcionNumeroSerie').setValue(numeroSerie);
  }

  obtenerNuevoNumeradorSerie() { // Listo
    this.spinner.show();
    const result = this.serieList.filter(x => x.codigoSerie === this.formulario.value.codigoSerie);
    let anchoNumerador = result[0].anchoNumerador
    let numeroSerie = result[0].numeroSerie
    const serieQuery: SerieQuery = {
      codigoSerie: this.formulario.value.codigoSerie,
      codigoEmpresa: parseInt(this.securityErp.getEmpresa()),
      codigoDocumento: this.formulario.value.codigoDocumento,
      numeroSerie: numeroSerie,
      anchoNumerador: anchoNumerador,
      numerador: this.formulario.value.numeroSerie
    };
    this.subRef$ = this.facturacionService.getNumeroSerie<SerieQuery>(2, serieQuery)
      .subscribe((res: any) => {
        this.formulario.get('numeroSerie').setValue(res.body.response.data[0].correlativo);
        this.formularioLineas.get('descripionNumeradorSerie').setValue(res.body.response.data[0].correlativo)
        this.spinner.hide();
      },
        (error) => {
          console.log(error);
        })
  }

  async tablaTipoServicio(event) { // Listo
    this.tempData = [];
    this.tempDataM = [];
    this.nuevaLinea();
    this.mat_NuevaLinea();
    this.formularioLineas.get('tValorVenta').setValue(0);
    this.formularioLineas.get('importePorcenje').setValue(0);
    this.formularioLineas.get('totalFinal').setValue(0);
    this.formularioLineas.get('tAnadido').setValue(0);
    this.formularioLineas.disable();
     this.utilitarios.tablaLineas(event);
    if (event == 2235) { 
      this.tipoComprobante = 'M'
    }
    else { 
      this.tipoComprobante = 'S'
    }

  }


  async validaPaisEcuador() {
    if (this.securityErp.getPais() === "218") {
      this.formulario.get('sucursal')[''];
      this.formulario.controls.sucursal.enable();
      this.formularioLineas.get('descripcionSucursal')['']
      this.formularioLineas.controls.descripcionSucursal.disable();
    }
    else {
      this.formulario.get('sucursal').setValue('No aplica');
      this.formulario.controls.sucursal.disable();
      this.formularioLineas.get('descripcionSucursal').setValue('No aplica');
      this.formularioLineas.controls.descripcionSucursal.disable();
    }
  }

  DeshabilitarEdicion(element) {
    element.editable = false;
  }

  HabilitarEdicion(element) {
    element.editable = true;
  }

  // Inicio : Calculos de lineas para comprobante:SERVICIOS
  getConvertirDolaresSoles(ppto: number, tipoCambio: string) {

    let param = [];
    param.push(tipoCambio);
    param.push(ppto);
    this.spinner.show();
    const url = environment.BASE_URL_TFI + 'Comprobante/11' + '/' + param.join('|')
    this.subRef$ = this.dataService.get<any>(url)
      .subscribe(res => {
        this.convertidoASoles = res.body[0].total;
        this.spinner.hide();
      },
        (error) => {
          console.log(error);
        })
  }

  async EliminarElemento(i) {
    // if (i !== 0) {
      this.tempData.splice(i, 1);
      this.table.renderRows();
      await this.convertirSolesADolares();
      await this.calculoActualizarTotales();
      await this.calcularDetraccion();
    // }
  }

  EliminarElementoMat(i) {
    // if (i !== 0) {
      this.tempDataM.splice(i, 1);
      this.table.renderRows();
      this.mat_CalcularTotalFinal();
    // }
  }

  async getCalcularLineas(element,tipo) {
    this.spinner.show();
    let index = this.tempData.indexOf(element);
    let error = false ; 
    error = await this.validarACuenta(index);  
    
    if(error){
      this.tempData[index].aCuenta = 0
    }
    
    let totalPpto = this.tempData[index].totalPptos;
    let aCuenta = this.tempData[index].aCuenta;
    let importePorcentaje = this.impuesto.importePorcenje; 
    await this.calculoTotalesPpto(Number.parseFloat(aCuenta),0,totalPpto,index,tipo,importePorcentaje);
    this.spinner.hide();
  }

  async getCalcularLineasVenta(element,tipo) { 
    
    
    this.spinner.show();
    let index = await this.tempData.indexOf(element); 

    let error = false ; 
    error = await this.validarSubTotal(index); 
     
    if(error){
      this.tempData[index].valorVenta = 0
    }
    
    let totalPpto = this.tempData[index].totalPptos; 
    let importePorcentaje = this.impuesto.importePorcenje; 
    let valorVenta: any = this.tempData[index].valorVenta;
    let valorVentaNumber: any = Number.parseFloat(valorVenta); 
    this.calculoTotalesPpto(0,Number.parseFloat(valorVentaNumber),totalPpto,index,tipo,importePorcentaje);
    this.spinner.hide();
  }

  async calculoTotalesPpto(aCuenta: number, valorVenta: number, totalPresupuesto: number, index: number, tipo: number, importePorcentaje: number){
    
    // Ingreso Cuenta
    if(tipo === 1) {
      this.tempData[index].aCuenta = parseFloat(aCuenta.toString()).toFixed(4); 
      this.tempData[index].valorVenta = ((totalPresupuesto * aCuenta) / 100).toFixed(2);
    }

    // Inbgreso Valor Venta
    if(tipo === 2) {
      this.tempData[index].valorVenta = valorVenta.toFixed(2);
      this.tempData[index].aCuenta = (( valorVenta * 100 ) / totalPresupuesto).toFixed(4);
    }

    if(tipo === 3){
      this.tempData[index].aCuenta = parseFloat(aCuenta.toString()).toFixed(4); 
      this.tempData[index].valorVenta = ((totalPresupuesto * aCuenta) / 100).toFixed(2);
      this.tempData[index].valorVentaPorcentaje  = ((totalPresupuesto * aCuenta) / 100).toFixed(2);
    } 
    
    let valorVentaTemp = Number.parseFloat(this.tempData[index].valorVenta);
    let valorVentaPorcentaje = Number.parseFloat(this.tempData[index].valorVentaPorcentaje);
    let aCuentaTemp = Number.parseFloat(this.tempData[index].aCuenta); 
    let aCuentaEstatica = Number.parseFloat(this.tempData[index].aCuentaEstatica);  
     
    this.tempData[index].anadir = aCuentaTemp > aCuentaEstatica ? Number.parseFloat((valorVentaTemp - valorVentaPorcentaje).toFixed(2)) : 0;
    this.tempData[index].impuesto = Number.parseFloat((valorVentaTemp * (importePorcentaje / 100)).toFixed(2));
    this.tempData[index].total = Number.parseFloat((valorVentaTemp + this.tempData[index].impuesto).toFixed(2));
    this.tempData[index].sanadir = this. fnNumero(aCuentaTemp > aCuentaEstatica ? Number.parseFloat((valorVentaTemp - valorVentaPorcentaje).toFixed(2)) : 0);
    this.tempData[index].simpuesto = this. fnNumero(Number.parseFloat((valorVentaTemp * (importePorcentaje / 100)).toFixed(2)));
    this.tempData[index].stotal = this. fnNumero(Number.parseFloat((valorVentaTemp + this.tempData[index].impuesto).toFixed(2)));
    await this.convertirSolesADolares();
    await this.calculoActualizarTotales();
    await this.calcularDetraccion();
    
  }

  async convertirSolesADolares() {
    let codigoMoneda = this.formulario.get('codigoMoneda').value;
    let moneda = this.monedaList.find(item => item.codigoMoneda === codigoMoneda);
    let tipoCambio = Number(this.tipoCambioList.precioVenta);
    for (const data of this.tempData) {
      // Yo quiero que esté en soles
      if(moneda.descripcionCorta == "S/") {
        if(data.moneda === "S/" && data.isConvertMoneda) { // Fue transformada la moneda previamente
          data.valorVenta = (Number(data.valorVenta) * tipoCambio).toFixed(2);
          data.anadir = Number((Number(data.anadir) * tipoCambio).toFixed(2));
          data.impuesto = Number((Number(data.impuesto) * tipoCambio).toFixed(2));
          data.total = Number((Number(data.total) * tipoCambio).toFixed(2));
          data.totalPptos = Number((Number(data.totalPptos) * tipoCambio).toFixed(2))
          data.isConvertMoneda = false;
        }
        if(data.moneda === "US$" && data.isConvertMoneda === false) {
          // data.totalPptos = Number((Number(totalPresupuestoFijo) * tipoCambio).toFixed(2))
          data.valorVenta = (Number(data.valorVenta) * tipoCambio).toFixed(2);
          data.anadir = Number((Number(data.anadir) * tipoCambio).toFixed(2));
          data.impuesto = Number((Number(data.impuesto) * tipoCambio).toFixed(2));
          data.total = Number((Number(data.total) * tipoCambio).toFixed(2));
          data.isConvertMoneda = true;
        }
        
      }
      // Yo quiero que esté en dólares
      if(moneda.descripcionCorta == "US$") {
        if(data.moneda === "S/" && data.isConvertMoneda) { // Fue transformada la moneda previamente
          data.valorVenta = (Number(data.valorVenta) / tipoCambio).toFixed(2);
          data.anadir = Number((Number(data.anadir) / tipoCambio).toFixed(2));
          data.impuesto = Number((Number(data.impuesto) / tipoCambio).toFixed(2));
          data.total = Number((Number(data.total) / tipoCambio).toFixed(2));
          data.totalPptos = Number((Number(data.totalPptos) / tipoCambio).toFixed(2))
          data.isConvertMoneda = false;
        }
        if(data.moneda === "S/" && data.isConvertMoneda === false) {
          // data.totalPptos = Number((Number(totalPresupuestoFijo) / tipoCambio).toFixed(2))
          data.valorVenta = (Number(data.valorVenta) / tipoCambio).toFixed(2);
          data.anadir = Number((Number(data.anadir) / tipoCambio).toFixed(2));
          data.impuesto = Number((Number(data.impuesto) / tipoCambio).toFixed(2));
          data.total = Number((Number(data.total) / tipoCambio).toFixed(2));
          data.totalPptos = Number((Number(data.totalPptos) / tipoCambio).toFixed(2))
          data.isConvertMoneda = true;
        }
        
      }
      
    }
  }


  async calculoActualizarTotales() {
    
    let anadido = 0;
    let ventaFinal = 0;
    let impuestoFinal = 0;
    let totalFinal = 0;
    for (const obj of this.tempData) {
      
      anadido += Number.parseFloat(obj.anadir.toString());
      ventaFinal += Number.parseFloat(obj.valorVenta.toString());
      impuestoFinal += Number.parseFloat(obj.impuesto.toString());
      totalFinal += Number.parseFloat(obj.total.toString());

    }
    anadido = Number.parseFloat(anadido.toString());
    ventaFinal = Number.parseFloat(ventaFinal.toString());
    impuestoFinal = Number.parseFloat(impuestoFinal.toString());
    totalFinal = Number.parseFloat(totalFinal.toString());

    this.formularioLineas.get('tAnadido').setValue(Number.parseFloat(anadido.toString()));
    this.formularioLineas.get('tValorVenta').setValue(Number.parseFloat(ventaFinal.toString()));
    this.formularioLineas.get('importePorcenje').setValue(Number.parseFloat(impuestoFinal.toString()));
    this.formularioLineas.get('totalFinal').setValue(Number.parseFloat(totalFinal.toString())); 
    this.formularioLineas.get('sAnadido').setValue(this.fnNumero(anadido.toFixed(2)));
    this.formularioLineas.get('sValorVenta').setValue(this.fnNumero(ventaFinal.toFixed(2)));
    this.formularioLineas.get('simportePorcenje').setValue(this.fnNumero(impuestoFinal.toFixed(2)));
    this.formularioLineas.get('stotalFinal').setValue(this.fnNumero(totalFinal.toFixed(2)));
  } 

  nuevaLinea() {
    this.tempData.push(
      {
        codigoComprobanteDet: null,
        centroCosto: null,
        pptos: "",
        totalPptos: null,
        aCuenta: 0,
        aCuentaEstatica: 0,
        anadir: 0,
        valorVenta: 0,
        impuesto: null,
        total: null,
        editable: true,
        cuentaContable: "",
        codigoServicio: 0,
        cliente: "",
        moneda: "",
        isConvertMoneda: false
      }
    )
    this.table.renderRows();
  }


  consultaPptos(element, index) {
    this.getListadoPresupuesto(element.pptos, index);
  }
  // FIN : Calculos de lineas para comprobante:SERVICIOS


  // Inicio : Calculos de lineas para comprobante:MATERIALES
   
  mate_getListadoPresupuesto() {
    let param = [];
    let noValido = /\s/; 
    param.push(this.formulario.value.pptos);
    param.push(this.securityErp.getEmpresa()); 
    this.formulario.get('descPpto').setValue('');
    this.formulario.get('cliente').setValue('');
    
    if(noValido.test(this.formulario.value.pptos)){  
      this.formulario.get('pptos').setValue(''); 
      return Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Ppto/CcCosto no puede tener espacio',
      });
    }
    if(this.formulario.value.pptos.length === 0)
    {
      this.formulario.get('pptos').setValue(''); 
      return Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'debe ingresar Ppto/CcCosto',
      });
    } 

    this.spinner.show();
    const url = environment.BASE_URL_TFI + 'Comprobante/2' + '/' + param.join('|')
    this.subRef$ = this.facturacionService.getAllPresupuesto<PresupuestoEntity[]>(2,this.formulario.value.pptos,this.securityErp.getEmpresa())
      .subscribe((res: any) => { 
        this.presupuestoList = res.body.response.data;


        this.spinner.hide();
        if (this.presupuestoList.length >= 1) {
          let i = 0;
          if (this.presupuestoList[0].centroCosto === 0) { 
            Swal.fire({
              icon: 'warning',
              title: '¡Verificar!',
              text: 'No se encontró información del ppto indicado',
            })
            return;
          }
           if(this.presupuestoList[0].cliente == null) {
            Swal.fire({
              icon: 'warning',
              title: '¡Verificar!',
              text: 'El presupuesto que ha indicado esta vinculado a un cliente que no tiene los datos completos, por favor verifique'
            })
            this.formulario.get('pptos').setValue(null);
            return;
          }
          else if(this.presupuestoList[0].aprobacionPre == null ||  this.presupuestoList[0].aprobacionPre == undefined) {
            Swal.fire({
              icon: 'warning',
              title: '¡Verificar!',
              text: 'El presupuesto que ud. ha indicado, no esta aprobado por Control de costos.'
            })
            this.formulario.get('pptos').setValue(null);
            return;
          }
          else if(this.presupuestoList[0].estado !== 2073 && this.presupuestoList[0].estado !== 2076) {
            let estadoNombre = this.obtenerNombreEstadoPresupuesto(this.presupuestoList[0].estado);
            Swal.fire({
              icon: 'warning',
              title: '¡Verificar!',
              text: `El ppto indicado tiene estado: ${estadoNombre}, no puede contar con él`
            })
            this.formulario.get('pptos').setValue(null);
            return;
          }
          else if(res.body.response.data[0].cuentaContable === "") {
            Swal.fire({
              icon: 'warning',
              title: `El presupuesto ${this.presupuestoList[0].codigoPpto} tiene un servicio que no tiene asignada una cuenta contable`,
              text: `Por favor avise a sistemas erp@lucky.com.pe`
            })
            this.formulario.get('pptos').setValue(null);
            return;
          } else { 
            
            this.formulario.get('pptos').setValue(this.presupuestoList[0].codigoPpto);
            this.formulario.get('descPpto').setValue(this.presupuestoList[0].descPpto);
            this.formulario.get('cliente').setValue(this.presupuestoList[0].codigoCliente);
            
            if( isNaN(this.formulario.value.pptos) ) { 
              this.clienteList = this.clienteListTotal
            }
            else{
              this.clienteList = this.clienteListTotal.filter(x => x.codigoCliente === this.presupuestoList[0].codigoCliente) 
            }
          }
        }
        else {
          Swal.fire({
            icon: 'warning',
            title: '¡Verificar!',
            text: 'El presupuesto ingresado no existe.',
          })
          this.formulario.get('descPpto').setValue('');
          this.formulario.get('cliente').setValue('');
          this.formulario.get('pptos').setValue('');

          return;
        }
      },
        (error) => {
          console.log(error);
          this.spinner.hide();
        })
  }

  
  async mat_DialogArticulo(ele:tablaColMaterial,i) {
    let dataM : MaterialesEntity;
    dataM = {
      sCodArticulo : "",
      codigoMaterial : ele.articuloServicio,
      nombreMaterial : ele.sarticuloServicio,
      nombreMedida : ele.unidadMedida, 
    } 

    const dialogRef = this.dialog.open(DialogMaterialFacComponent, {
      width: '700px',
      data: dataM,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {  

      this.tempDataM[i].sarticuloServicio =result.data.nombreMaterial
      this.tempDataM[i].articuloServicio =result.data.codigoMaterial
      this.tempDataM[i].unidadMedida =result.data.nombreMedida
      
    });
  }


  async mate_getListadoMateriales() { // Listo
    this.spinner.show(); 
    this.subRef$ = this.facturacionService.getAllMateriales<MaterialesEntity[]>(6)
      .subscribe(async (res: any) => {   
        this.spinner.hide();
      },
        (error) => {
          console.log(error);
          this.spinner.hide();
        })
  }

  // mat_Consulta(e) {
  //   let index = this.tempDataM.indexOf(e);
  //   let fila = this.materialesList.filter(element => element.codigoMaterial == e.articuloServicio);
  //   this.tempDataM[index].unidadMedida = fila[0].nombreMedida
  // }


  async mat_CalcularLinea(e) {
    let index = this.tempDataM.indexOf(e);
    let error = false ; 
    error = await this.validarLinea(index);  

    if(error){
      Swal.fire({
        title: '¡Verificar!',
        icon: 'warning',
        text: `Solo ingresar números porfavor`
      })
    }
    let cantidad = this.tempDataM[index].cantidad;
    let precioUnitario = this.tempDataM[index].precioUnitario;
    this.tempDataM[index].cantidad =  parseFloat(cantidad.toString()).toFixed(2);
    this.tempDataM[index].precioUnitario = parseFloat(precioUnitario.toString()).toFixed(4); 
    
    let subtotal = (this.tempDataM[index].precioUnitario * this.tempDataM[index].cantidad).toFixed(2);
    this.tempDataM[index].subTotal = subtotal;
    this.tempDataM[index].igv = Number.parseFloat((Number(this.tempDataM[index].subTotal) * (this.impuesto.importePorcenje / 100)).toFixed(2));
    this.tempDataM[index].total = Number.parseFloat((Number(this.tempDataM[index].subTotal) + Number(this.tempDataM[index].igv)).toFixed(2));
    this.tempDataM[index].ssubTotal = this.fnNumero(subtotal);
    this.tempDataM[index].sigv = this. fnNumero(Number.parseFloat((Number(this.tempDataM[index].subTotal) * (this.impuesto.importePorcenje / 100)).toFixed(2)));
    this.tempDataM[index].stotal = this. fnNumero(Number.parseFloat((Number(this.tempDataM[index].subTotal) + Number(this.tempDataM[index].igv)).toFixed(2)));
    this.mat_CalcularTotalFinal();
  }

  

  mat_CalcularTotalFinal() {
    let subTotalF = 0;
    let igvF = 0;
    let totalF = 0;
    this.tempDataM.forEach((element) => {
      subTotalF = Number(subTotalF) + Number(element.subTotal)
      igvF = Number(igvF) + Number(element.igv)
      totalF = Number(totalF) + Number(element.total)
    }); 
    
    this.formularioLineas.get('tValorVenta').setValue(subTotalF);
    this.formularioLineas.get('importePorcenje').setValue(igvF);
    this.formularioLineas.get('totalFinal').setValue(totalF);
    this.formularioLineas.get('sValorVenta').setValue(this.fnNumero(subTotalF));
    this.formularioLineas.get('simportePorcenje').setValue(this.fnNumero(igvF));
    this.formularioLineas.get('stotalFinal').setValue(this.fnNumero(totalF));
    this.calcularDetraccion();
  }

  mat_NuevaLinea() {
    let error = true;
    this.tempDataM.map((ele)=>{
      if(ele.cuenta === null || ele.sarticuloServicio === null || ele.detalle === null){
        return error = false
      }
    }) 

    if(!error){
      return Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'hay items incompletos',
      });
    }
    

    this.tempDataM.push(
      {
        cuenta: null,
        articuloServicio: null,
        sarticuloServicio: null,
        detalle: null,
        unidadMedida: null,
        cantidad: 0,
        precioUnitario: 0,
        subTotal: 0,
        igv: 0,
        total: 0,
        ssubTotal: '0.0',
        sigv: '0.0',
        stotal: '0.0',
        editable: true,
      }
    )
    this.table.renderRows();
  }

  //validando Datos

  getValidaNroOrdenServicio(value: string) {

    if (value == null || value.trim() == '') {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Los datos no pueden ser vacios.',
      })
      return;
    }

    if (this.formulario.get('aceptacion').value == this.formulario.get('psOserv').value) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'El Nro. de Aceptación, no puede ser igual al Nro. de Orden.',
      })
      this.formulario.get('aceptacion').setValue('');
      return;
    }


    if (this.formulario.get('psOserv').value == this.formulario.get('aceptacion').value) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'El Nro. de Orden, no puede ser igual al Nro. Aceptación'
      })
      this.formulario.get('psOserv').setValue('');
      return;
    }

    this.spinner.show();
    const url = environment.BASE_URL_TFI + 'Comprobante/7' + '/' + value
    this.subRef$ = this.facturacionService.getValidarNroOrden<any>(7,value)
      .subscribe((res: any) => {

        if (res.body.response.data[0].mensaje != 'ok') {
          Swal.fire({
            icon: 'warning',
            title: '¡Verificar!',
            text: res.body.response.data[0].mensaje
          })
          this.formulario.get('aceptacion').setValue('');
          this.formulario.get('psOserv').setValue('');
          this.spinner.hide();
          return;
        }

        this.spinner.hide();
      },
        (error) => {
          console.log(error);
        })
  }

  saveComprobanteMaterial(estado, opc) {

    if (this.formulario.get('pptos').value == null || this.formulario.get('pptos').value == '' || this.formulario.get('pptos').value == undefined ||
        this.formulario.get('descPpto').value == null || this.formulario.get('descPpto').value == '' || this.formulario.get('descPpto').value == undefined ){
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta ingresar el presupuesto.',
      })
      return;
    }

    if(this.formulario.get('cliente').value == null || this.formulario.get('cliente').value == '' || this.formulario.get('cliente').value == undefined){
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta ingresar el cliente.',
      })
      return;
    }


    if (this.formularioLineas.controls.totalFinal.value <= 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta ingresar el detalle del comprobante.',
      })
      return;
    }
    const lineas = [];
    Swal.fire({
      icon: 'question',
      title: 'Emisión de Comprobantes',
      text: '¿Desea guardar?',
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if(result.isConfirmed) {
        let error = true;
        const nIdCentroCosto = this.presupuestoList[0].centroCosto;
          this.tempDataM.forEach((linea) => {
            let fila = [];
              fila.push(nIdCentroCosto),
              fila.push(linea.articuloServicio),
              fila.push(linea.detalle),
              fila.push(1),
              fila.push(linea.cantidad),
              fila.push(linea.precioUnitario),
              fila.push(0),
              fila.push(0),
              fila.push(linea.subTotal),
              fila.push(linea.igv),
              fila.push(linea.total),
              fila.push(null),
              fila.push(linea.cuenta), 
              lineas.push(fila.join(","));

              if(linea.cuenta === null || linea.sarticuloServicio === null || linea.detalle === null){
                return error = false
              }
              if((linea.precioUnitario*linea.cantidad) < 0.1){
                return error = false
              }
          });  

          if(!error){
            return Swal.fire({
              icon: 'warning',
              title: '¡Verificar!',
              text: 'falta ingresar datos en el detalle',
            });
          }
          const comprobanteForCreation: ComprobanteForCreation =
          {
            codigoComprobante: 0,
            codigoEmpresa: parseInt(this.securityErp.getEmpresa()),
            codigoAfectacion: this.formulario.value.codigoAfectacion,
            codigoDetraccion: this.formulario.value.codigoDetraccion === "" ? 0 : this.formulario.value.codigoDetraccion,
            codigoDocumento: this.formulario.value.codigoDocumento,
            codigoMoneda: this.formulario.value.codigoMoneda,
            codigoSerie: this.formulario.value.codigoSerie,
            codigoTipoServicio: this.formulario.value.codigoServicio,
            codigoTipoCambio: this.formulario.value.codigoTipoCambio,
            codigoCliente: this.formulario.value.cliente,
            sucursal: this.formularioLineas.value.descripcionSucursal,
            numeroSerie: this.formularioLineas.get('descripcionNumeroSerie').value,
            correlativoSerie: this.formularioLineas.value.descripionNumeradorSerie,
            fechaComprobante: moment( this.formulario.value.fechaComprobante , 'MM-DD-YYYY HH:mm:ss',true).format("YYYY-MM-DD"),
            ordenCompra: this.formulario.value.ordenCompra,
            psOserv: this.formulario.value.psOserv,
            aceptacion: this.formulario.value.aceptacion,
            glosa: `${this.formulario.value.glosa}`,
            observacion1: this.formulario.value.observacion1,
            observacion2: this.formulario.value.observacion2,
            porcentajeDetraccion: this.formulario.value.porcentajeDetraccion === "" ? 0 : this.formulario.value.porcentajeDetraccion,
            totalDetraccion: this.formulario.get('totalDetraccion').value,
            codigoDescuentoLugar: 2243,
            lineasTotalDescuento: 0.00,
            lineasTotalCargos: 0.00,
            lineasTotalPptos: this.tempDataM.length,
            lineasTotalAnadidos: 0,
            lineasValorVenta: this.formularioLineas.controls.tValorVenta.value,
            codigoImpuesto: this.impuesto.codigoImpuesto,
            impuestoSigla: 'IGV',
            importePorcentaje: this.impuesto.importePorcenje,
            importeTotal: this.formularioLineas.controls.importePorcenje.value,
            importeTotalFinal: this.formularioLineas.controls.totalFinal.value,
            codigoEstado: estado,
            codigoCreaRegistro: this.securityErp.getUsuarioId(),
            lineas: lineas.join('/'),
            tipoComp: 'M',
            opc: opc,
            codigoFormaPago: this.formulario.value.codigoFormaPago 
          } 
          this.spinner.show();
           
          this.subRef$ = this.facturacionService.postCreateComprobante<ComprobanteForCreation>(comprobanteForCreation)
            .subscribe((res: any) => {
              this.utilitarios.comprobanteCodigo = res.body.response.data[0].id
              this.utilitarios.comprobanteEstado = res.body.response.data[0].estado
              this.formularioLineas.get('descripionNumeradorSerie').setValue(res.body.response.data[0].numerador);
              this.formulario.get('numeroSerie').setValue(res.body.response.data[0].numerador);
              this.formulario.get('glosa').setValue(`${this.formulario.value.glosa} ${this.tempDataM[this.tempDataM.length - 1].detalle}`);
              this.spinner.hide();
              Swal.fire({
                title: 'Registro Existoso',
                icon: 'success' 
              });
              this.router.navigate(['tfi/facturacion/comprobante/edit/' + res.body.response.data[0].id]);
            },
              err => { 
                Swal.fire({
                  title:'Ocurrio un error',
                  icon: 'error',
                  timer: 1500
                }) 
               });
          
          this.spinner.show();
      }
    });
    
  }
  // Fin : Calculos de lineas para comprobante:MATERIALES

  // guardar Comprobante
  saveComprobanteServicio(estado, opc) {

    if (this.formularioLineas.controls.totalFinal.value <= 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta ingresar el detalle del comprobante.',
      })
      return;
    }

    Swal.fire({
      icon: 'question',
      title: 'Emisión de Comprobantes',
      text: '¿Desea guardar?',
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {

        let totalAnadido = 0;
        let totalFinal = 0;
        let totalValorVenta = 0;
        let totalImpuesto = 0;
  
        const lineas = [];
        this.tempData.forEach((linea) => {
          let fila = [];
          fila.push(linea.centroCosto), // Centro Costo
            fila.push(0), // Artículo
            fila.push(''), // Detalle
            fila.push(0), // IdUm
            fila.push(1), // Por ser servicio la cantidad va a en 1
            fila.push(linea.totalPptos), // Precio Prseupuesto
            fila.push(linea.aCuenta), // A cuenta
            fila.push(linea.anadir), // Total Añadido
            fila.push(linea.valorVenta), // Sub Total
            fila.push(linea.impuesto), // Impuesto
            fila.push(linea.total), // Total
            fila.push(linea.codigoServicio), // Id Servicio
            fila.push(linea.cuentaContable), // Cuenta Cont
            lineas.push(fila.join(","));
        });

        this.tempData.forEach((item) => {
          totalAnadido = Number(totalAnadido) + Number(item.anadir)
          totalValorVenta = Number.parseFloat(totalValorVenta.toString()) + Number.parseFloat(item.valorVenta.toString())
          totalImpuesto = Number.parseFloat(totalImpuesto.toString()) + Number.parseFloat(item.impuesto.toString())
          totalFinal = Number.parseFloat(totalFinal.toString()) + Number.parseFloat(item.total.toString())
        }) 

          
        let str = this.tempData[this.tempData.length - 1].pptos;
        let num = str.length
        let sppto = str.substring(9, num)  
        
        const comprobanteForCreation: ComprobanteForCreation =
        {
          codigoComprobante: this.utilitarios.comprobanteCodigo,
          codigoEmpresa: parseInt(this.securityErp.getEmpresa()),
          codigoAfectacion: this.formulario.value.codigoAfectacion,
          codigoDetraccion: this.formulario.value.codigoDetraccion === "" ? 0 : this.formulario.value.codigoDetraccion,
          codigoDocumento: this.formulario.value.codigoDocumento,
          codigoMoneda: this.formulario.value.codigoMoneda,
          codigoSerie: this.formulario.value.codigoSerie,
          codigoTipoServicio: this.formulario.value.codigoServicio,
          codigoTipoCambio: this.formulario.value.codigoTipoCambio,
          codigoCliente: this.presupuestoList[this.presupuestoList.length - 1].codigoCliente,
          sucursal: this.formularioLineas.value.descripcionSucursal,
          numeroSerie: this.formularioLineas.get('descripcionNumeroSerie').value,
          correlativoSerie: this.formularioLineas.value.descripionNumeradorSerie,
          fechaComprobante: moment( this.formulario.value.fechaComprobante , 'MM-DD-YYYY HH:mm:ss',true).format("YYYY-MM-DD"),
          ordenCompra: this.formulario.value.ordenCompra,
          psOserv: this.formulario.value.psOserv,
          aceptacion: this.formulario.value.aceptacion,
          glosa: `${this.formulario.value.glosa} ${sppto}`,
          observacion1: this.formulario.value.observacion1,
          observacion2: this.formulario.value.observacion2,
          porcentajeDetraccion: this.formulario.value.porcentajeDetraccion === "" ? 0.0 : this.formulario.value.porcentajeDetraccion,
          totalDetraccion: this.formulario.get('totalDetraccion').value,
          codigoDescuentoLugar: 2243,
          lineasTotalDescuento: 0.00,
          lineasTotalCargos: 0.00,

          lineasTotalPptos: this.tempData.length,
          lineasTotalAnadidos: totalAnadido,
          lineasValorVenta: totalValorVenta,
          codigoImpuesto: this.impuesto.codigoImpuesto,
          impuestoSigla: this.impuesto.descripcionCorta,
          importePorcentaje: this.impuesto.importePorcenje,
          importeTotal: totalImpuesto,
          importeTotalFinal: totalFinal,
          codigoEstado: estado,
          codigoCreaRegistro: this.securityErp.getUsuarioId(),
          lineas: lineas.join('/'),
          tipoComp: 'S',
          opc: opc,
          codigoFormaPago: this.formulario.value.codigoFormaPago 
        }  
        
        
        this.subRef$ = this.facturacionService.postCreateComprobante<ComprobanteForCreation>(comprobanteForCreation)
          .subscribe((res: any) => {        
            this.utilitarios.comprobanteCodigo = res.body.response.data[0].id
            this.utilitarios.comprobanteEstado = res.body.response.data[0].estado
            this.formularioLineas.get('descripionNumeradorSerie').setValue(res.body.response.data[0].numerador);
            this.formulario.get('numeroSerie').setValue(res.body.response.data[0].numerador);
            this.formulario.get('glosa').setValue(`${this.formulario.value.glosa} ${this.tempData[this.tempData.length - 1].pptos}`);
            this.spinner.hide();
            Swal.fire({
              title: 'Registro Existoso',
              icon: 'success' 
            });
            this.router.navigate(['tfi/facturacion/comprobante/edit/' + res.body.response.data[0].id]);
          },
            err => { this.spinner.hide() });

      }
      else {
        return;
      }
    })

  }

  saveComprobante(estado, opc) { 
    
    this.tipoComprobante == 'S' ? this.saveComprobanteServicio(estado, opc) : this.saveComprobanteMaterial(estado, opc)
  }

  sendComprobante(estado, opc) {
    this.tipoComprobante == 'S' ? this.saveComprobanteServicio(estado, opc) : this.saveComprobanteMaterial(estado, opc);
    setTimeout(() => {
      this.router.navigate(['Tesoreria/facturacion/comprobante-list']);
    }, 2000);

  }
  // validacion de  datos:tablas:Servicios y Materiales

  async reiniciarLineas(tipo: string, index: number) {
    if (tipo === "S") {
      this.tempData[index].centroCosto = null;
      this.tempData[index].pptos = null;
      this.tempData[index].totalPptos = 0;
      this.tempData[index].aCuenta = 0;
      this.tempData[index].anadir = 0;
      this.tempData[index].valorVenta = 0;
      this.tempData[index].impuesto = 0;
      this.tempData[index].total = 0;
      this.tempData[index].ssubTotal=null;
      this.tempData[index].sanadir = null;
      this.tempData[index].simpuesto= null;
      this.tempData[index].stotal= null;
      this.tempData[index].cliente= null;
      this.tempData[index].codigoCliente= null;
      await this.convertirSolesADolares();
      await this.calculoActualizarTotales();
      await this.calcularDetraccion();
    }

  }


  ngOnDestroy(): void {
    if (this.subRef$) { this.subRef$.unsubscribe(); }
  }

  private async  validarLinea(index) { 
    var flag: boolean = false; 
    let tempDataM = this.tempDataM[index];
    if( isNaN(tempDataM.cantidad) ) {
      this.tempDataM[index].cantidad = 0;
      flag = true;

    }
    if( isNaN(tempDataM.precioUnitario)){
      this.tempDataM[index].precioUnitario = 0;
      flag = true; 
    }
    return flag;
  }
  
  private async  validarACuenta(index) {
    var flag: boolean = false; 
    let tempData = this.tempData[index];
    if( isNaN(tempData.aCuenta) ) { // Sino es número devuelve true, si es false
      this.spinner.hide();
      flag = true;
      Swal.fire({
        title: '¡Verificar!',
        icon: 'warning',
        text: `Solo ingresar números porfavor`
      })
    }
    else if(tempData.aCuenta <= 0) {
      this.tempData[index].aCuenta = this.tempData[index].aCuentaEstatica;
      this.spinner.hide();
      flag = true;
      Swal.fire({
        title: '¡Verificar!',
        icon: 'warning',
        text: `No puede ingresar valores negativos o 0 a cuenta`
      })
    }
    return flag;
  }

  private async validarSubTotal(index) {
    var flag: boolean = false; 
    
    let tempData = this.tempData[index]; 
    if( isNaN(tempData.valorVenta) ) { // Sino es número devuelve true, si es false
      this.spinner.hide();
      flag = true;
      Swal.fire({
        title: '¡Verificar!',
        icon: 'warning',
        text: `Solo ingresar números porfavor`
      })
    }
    else if(tempData.valorVenta <= 0) {
      this.tempData[index].aCuenta = this.tempData[index].aCuentaEstatica;
      this.calculoTotalesPpto(Number.parseFloat(this.tempData[index].aCuenta),0,this.tempData[index].totalPptos,index,1,this.tempData[index].impuesto);
      
      flag = true;
      Swal.fire({
        title: '¡Verificar!',
        icon: 'warning',
        text: `No puede ingresar valores negativos o 0 a cuenta`
      })
    }  
    return flag;

  }

  obtenerNombreEstadoPresupuesto(estado: number): string {
    let nombreEstado = "";
    73/76
    switch (estado) {
      case 2072:
        nombreEstado = "Anulado";
        break;
      case 2074:
        nombreEstado = "Cerrado";
        break;
      case 2075:
        nombreEstado = "Incompleta";
        break;
      case 2077:
        nombreEstado = "Cancelada";
        break;
      default:
        break;
    }
    return nombreEstado;
  }


  cambioPSOrden(oserv) {
    let aceptacion = this.formulario.get('aceptacion').value;
    if(oserv != '') {
      let valueOrdenServ = `Segun P.S: ${oserv}`;

      if(aceptacion != '') {
        let valueAceptacion = `Aceptación: ${aceptacion}`;
        this.formulario.get('observacion1').setValue(`${valueOrdenServ}, ${valueAceptacion}`);
      } else {
        this.formulario.get('observacion1').setValue(`${valueOrdenServ}`);

      }
    } else {
      if(aceptacion != '') {
        let valueAceptacion = `Aceptación: ${aceptacion}`;
        this.formulario.get('observacion1').setValue(`${valueAceptacion}`);
      }
      else{
        this.formulario.get('observacion1').setValue(''); 
      }
    }
  }

  cambioAceptacion(acep) {
    let psOserv = this.formulario.get('psOserv').value;
    
    if(acep != '') {
      let valueAceptacion = `Aceptación: ${acep}`;
      
      if(psOserv != '') {
        let valueOrdenServ = `Segun P.S: ${psOserv}`;
        this.formulario.get('observacion1').setValue(`${valueOrdenServ}, ${valueAceptacion}`);
      } else {
        this.formulario.get('observacion1').setValue(`${valueAceptacion}`);

      }
    } else {
      
      if(psOserv != '') {
        let valueOrdenServ = `Segun P.S: ${psOserv}`;
        this.formulario.get('observacion1').setValue(`${valueOrdenServ}`);
      }
      else{
        this.formulario.get('observacion1').setValue(''); 
      }
    }
  }


  cambioMoneda(idMoneda) {
    const moneda = this.monedaList.find(item => item.codigoMoneda === idMoneda);
    this.formularioLineas.controls.descripcionMoneda.setValue(moneda.descripcionCorta);
    this.convertirSolesADolares();
    this.calculoActualizarTotales();
    this.calcularDetraccion();
  }


  //#region  Obtener data base (GET)
  
  getTipoServicio() { 
    this.subRef$ = this.facturacionService.getAllByIdDad<DocumentoEntity[]>(12,'2233') //Listo
      .subscribe((res: any) => {
        this.servicioList = res.body.response.data;
        this.formulario.get('codigoServicio').setValue(this.servicioList[0].descripcionCorta + " - " + this.servicioList[0].descripcionLarga);
         
        // Se inicializa el tipo de servicio con "Servicio"
        const servicio = this.servicioList.find(x => x.codigoDocumento == 2234)
        this.formulario.get('codigoServicio').setValue(servicio.codigoDocumento);
        this.tipoComprobante = servicio.descripcionCorta;
      },
        (error) => {

          console.log(error);
        })

  }

  getFormaPago() { 
    this.subRef$ = this.facturacionService.getAllFormaPago<FormaPago[]>()
      .subscribe((resp: any) => {
        this.formaPagoList = resp.body.response.data; 
      },
      (error) => {
        console.log('ERROR',error);
      });
  }

  getListadoDocumento() { // Listo 
    this.subRef$ = this.facturacionService.getAllByIdDad<DocumentoEntity[]>(12,'2112') //Listo
        .subscribe((res: any) => {
          this.documentoList = res.body.response.data; 
        },
          (error) => {
  
            console.log(error);
          })
  }

  getListadoSerie(e) { // Listo 
    this.serieList = [];
    this.spinner.show();
    this.formulario.get('numeroSerie').setValue('');
    let result = this.documentoList.filter(x => x.codigoDocumento == e);
    this.formularioLineas.get('descripcionTipoDocumento').setValue(result[0].descripcionCorta);
    let parametro = [];
    parametro.push(this.securityErp.getEmpresa());
    parametro.push(this.formulario.value.codigoDocumento);
    this.subRef$ = this.facturacionService.getSerieComprobante<SerieEntity[]>(13,parametro)
      .subscribe((res: any) => {
        this.serieList = res.body.response.data;
        this.spinner.hide();

        if (this.serieList.length <= 0) {
          this.validarserie = true;
        }
        else {
          this.validarserie = false;
        }

      },
        (error) => {
          console.log(error);
          this.spinner.hide();
        })

  }

  getListadoMoneda(codigoPais: string) { // Listo 
    const url = environment.BASE_URL_TFI + '/genericos/Moneda/442/' + this.securityErp.getPais();
    this.subRef$ = this.facturacionService.getAllMoneda<MonedaEntity[]>({ opcion: 14, tipoElemeneto:442, codigoPais: codigoPais })
      .subscribe((res: any) => {
        this.monedaList = res.body.response.data; 
        // Se inicializa en soles
        const tipoMoneda = this.monedaList.find(c => c.codigoMoneda == 443);
        this.formulario.get('codigoMoneda').setValue(tipoMoneda.codigoMoneda);
        this.formularioLineas.get('descripcionMoneda').setValue(tipoMoneda.descripcionCorta);

      },
        (error) => {
          console.log(error);
      })
  }


  getListadoDetraccion() { // Listo
    this.spinner.show();
    this.subRef$ = this.facturacionService.getAllDetraccion<DetraccionEntity[]>({opcion: 15, tipoElemeneto: 1295, codigoPais: this.securityErp.getPais() })
      .subscribe((res: any) => {
          this.detraccionList = res.body.response.data;
          this.spinner.hide();
        },
          (error) => {
            console.log(error);
          })
  }

  getListadoAfectacion() { //Listo

    this.spinner.show();
    this.subRef$ = this.facturacionService.getAllAfectacion<any[]>({opcion: 14, tipoElemeneto: 1292, codigoPais: this.securityErp.getPais()})
      .subscribe((res: any) => {
        this.afectacionList = res.body.response.data;
        this.spinner.hide();
      },
        (error) => {
          console.log(error);
          this.spinner.hide();
        })
  }

  getListadoTipoCambio() { //Listo
    this.spinner.show();
    let fecha = this.datepipe.transform(this.formulario.value.fechaComprobante, 'yyyy-MM-dd');
    this.subRef$ = this.facturacionService.getByIdTipoCambio<TipoCambioEntity[]>({ opcion: 17, fecha: fecha, codigoPais: this.securityErp.getPais() })
      .subscribe((res: any) => {  
          this.formulario.get('codigoTipoCambio').setValue(res.body.response.data[0].codigoTipoCambio);
          this.formularioLineas.get('descripcionTipoCambio').setValue(res.body.response.data[0].precioVenta);
          this.tipoCambioList.precioVenta = (res.body.response.data[0].precioVenta);
          this.spinner.hide();
        },
          (error) => {
            console.log(error);
          })
  }

  getListadoImpuesto() { //Listo
    this.spinner.show();
    this.subRef$ = this.facturacionService.getAllImpuesto<ImpuestoEntity[]>({ opcion: 16, tipoElemeneto: 1287, codigoPais: this.securityErp.getPais() })
      .subscribe((res: any) => {
        this.formularioLineas.get('descripcionCorta').setValue((res.body.response.data[0].descripcionCorta + ' - ' + (res.body.response.data[0].importePorcenje).toString()));
        this.impuesto.codigoImpuesto = (res.body.response.data[0].codigoImpuesto);
        this.impuesto.importePorcenje = (res.body.response.data[0].importePorcenje);
        this.impuesto.descripcionCorta = (res.body.response.data[0].descripcionCorta);
        this.botonNuevo = false;
        this.spinner.hide();
      },
        (error) => {
          console.log(error);
        })
  }

  mat_ObtenerCliente() {
    this.subRef$ = this.catalogoService.getCatalogoClientes(`opcion=1&parametro=${this.securityErp.getPais()}`)
      .subscribe((resp: any) => {
        this.clienteListTotal = resp.body.response.data;
        this.clienteList  = resp.body.response.data; 
        
      })
  }


  getListadoPresupuesto(ppto, index) {

    this.reiniciarLineas('S', index);
    const data = this.tempData.filter(x => x.pptos === ppto);

    if (this.tempData.length > 1 && this.tempData.filter(x => x.pptos === ppto).length > 0 ) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'El presupuesto ya existe.'
      })
      return;
    }
    if( isNaN(ppto) ) { // Sino es número devuelve true, si es false 
      return Swal.fire({
        title: '¡Verificar!',
        icon: 'warning',
        text: `Solo ingresar números porfavor`
      })
    }
    let param = [];
    param.push(ppto);
    param.push(this.securityErp.getEmpresa());
    this.spinner.show();
    this.subRef$ = this.facturacionService.getAllPresupuesto<PresupuestoEntity[]>(2, ppto,this.securityErp.getEmpresa())
      .subscribe((res: any) => {
        this.presupuestoList = res.body.response.data;
        //Validar si existe registro
        let valor = false;
        let valor2 = false;

        if(this.tempData.filter(item => item.centroCosto === this.presupuestoList[0].centroCosto).length > 0) {
          this.spinner.hide();
          Swal.fire({
            icon: 'warning',
            title: '¡Verificar!',
            text: 'El presupuesto ya está en la lista',
          })
          return;
        } 
        this.spinner.hide();
        if (this.presupuestoList.length >= 1) {
          if (this.presupuestoList[0].centroCosto === 0) {
            Swal.fire({
              icon: 'warning',
              title: '¡Verificar!',
              text: 'No se encontró información del ppto indicado',
            })
            return;
          }
          if (this.presupuestoList[0].total <= 0) {
            Swal.fire({
              icon: 'warning',
              title: '¡Verificar!',
              text: 'El presupuesto tiene un importe :0',
            })
            return;
          }
          if(this.presupuestoList[0].cliente == null) {
            Swal.fire({
              icon: 'warning',
              title: '¡Verificar!',
              text: 'El presupuesto que ha indicado esta vinculado a un cliente que no tiene los datos completos, por favor verifique'
            })
            return;
          }
          if(this.presupuestoList[0].aprobacionPre == null ||  this.presupuestoList[0].aprobacionPre == undefined) {
            Swal.fire({
              icon: 'warning',
              title: '¡Verificar!',
              text: 'El presupuesto que ud. ha indicado, no esta aprobado por Control de costos.'
            })
            return;
          }
          if(this.presupuestoList[0].estado !== 2073 && this.presupuestoList[0].estado !== 2076  && this.presupuestoList[0].estado !== 2074) {
            let estadoNombre = this.obtenerNombreEstadoPresupuesto(this.presupuestoList[0].estado);
            Swal.fire({
              icon: 'warning',
              title: '¡Verificar!',
              text: `El ppto indicado tiene estado: ${estadoNombre}, no puede contar con él`
            })
            return;
          }
          if(res.body.response.data[0].cuentaContable === "") {
            Swal.fire({
              icon: 'warning',
              title: `El presupuesto ${this.presupuestoList[0].codigoPpto} tiene un servicio que no tiene asignada una cuenta contable`,
              text: `Por favor avise a sistemas erp@lucky.com.pe`
            })
            return;
          }
          if(res.body.response.data[0].aCuenta >= 99.9) {
            Swal.fire({
              icon: 'warning',
              title: `El presupuesto ${this.presupuestoList[0].codigoPpto} ya fue facturado al 100% verifique`,
            })
            return;
          }
          if (res.body.response.data[0].aCuenta > 0) {
            valor =true;
            
            this.tempData[index].aCuenta = Number.parseFloat((100-this.presupuestoList[0].aCuenta).toFixed(4));
            this.tempData[index].aCuentaEstatica = Number.parseFloat((100-this.presupuestoList[0].aCuenta).toFixed(4));
            
            
          }
          else {
            this.tempData[index].aCuenta = 0;
            this.tempData[index].aCuentaEstatica = 100;
          }

          
          
 
          this.tempData.map((ele,i)=>{
            let codigo :any = this.presupuestoList[0].codigoPpto
            
            
            if(isNaN(codigo)){

            }
            else{
              if(i === index){

              }
              else if(ele.codigoCliente != this.presupuestoList[0].codigoCliente && this.tempData.length > 1){
                valor2 = true; 
              }
            }
            
          })

          if(valor){ 
            Swal.fire({
              title: 'Atención!',
              text: 'La campaña ya fue facturada parcialmente, se esta colocando la diferencia en %  A CUENTA.',
              icon: 'warning', 
              confirmButtonText: 'Ok'
            }).then((result) => {
              if(valor2){
                Swal.fire(
                  '¡Verificar!',
                  'El presupuesto indicado tiene un cliente diferente.',
                  'warning'
                ) 
              } 
                
            })
          }
          else{
            if(valor2){
              Swal.fire(
                '¡Verificar!',
                'El presupuesto indicado tiene un cliente diferente.',
                'warning'
              ) 
            } 
          }



          this.tempData[index].centroCosto = res.body.response.data[0].centroCosto;
          this.tempData[index].cliente = `${res.body.response.data[0].ruc} - ${res.body.response.data[0].razonSocial}`;
          this.tempData[index].codigoCliente = res.body.response.data[0].codigoCliente;
          this.tempData[index].pptos = `${res.body.response.data[0].codigoPpto} - ${res.body.response.data[0].descPpto}`
          this.tempData[index].cuentaContable = res.body.response.data[0].cuentaContable;
          this.tempData[index].codigoServicio = res.body.response.data[0].codigoServicio;
          this.tempData[index].moneda = res.body.response.data[0].moneda;
          this.tempData[index].totalPptos = res.body.response.data[0].total
           
          if(res.body.response.data[0].aCuenta > 0) {
            this.calculoTotalesPpto(Number.parseFloat(this.tempData[index].aCuenta),0,res.body.response.data[0].total,index,3,this.impuesto.importePorcenje);
          } else {
            this.tempData[index].total = 0
            this.tempData[index].valorVenta = 0;
            this.tempData[index].valorVentaPorcentaje = res.body.response.data[0].total;
            this.tempData[index].impuesto = 0;
            this.tempData[index].anadir = 0;
          }
        }
        else {
          this.spinner.hide();
          Swal.fire({
            icon: 'warning',
            title: '¡Verificar!',
            text: 'El presupuesto ingresado no existe.',
          })
          this.reiniciarLineas('S', index);
          return;
        }
      },
        (error) => {
          console.log(error);
          this.spinner.hide();
        })

  }


  //#endregion





  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.utilitarios.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.utilitarios.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  salir() {
    this.router.navigate(['tfi/facturacion/comprobante/list']);
  }

  fnValidarOrdenComprar(){
    let letra  = this.formulario.value.ordenCompra
    let ree = letra.replace(/\s+/g, '') 
    ree = ree.replace(/-/g, '') 
    let noValido = /\s/; 
    
    
    if(letra.indexOf("-") >= 0)
    { 
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Orden de compra no puede tener guion y ni espacio',
      })
      this.formulario.get('ordenCompra').setValue(ree); 
    } 
    else if(noValido.test(letra)){ // se chequea el regex de que el string no tenga espacio
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Orden de compra no puede tener guion y ni espacio',
      })
      this.formulario.get('ordenCompra').setValue(ree); 
    }
    else{
       
    }
    
  }
 
  fnNumero(nStr){ 
    nStr += '';
    let x = nStr.split('.'); 
    
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
    } 
    if(x2.length === 0) x2 = '.00'
     
    return x1 + x2
  }

  async mat_numerico(ele){
    let index = await this.tempDataM.indexOf(ele); 
    let tempDataM = this.tempDataM[index]; 

    if( isNaN(tempDataM.cuenta) ) { // Sino es número devuelve true, si es false
      this.tempDataM[index].cuenta=null;
      return Swal.fire({
        title: '¡Verificar!',
        icon: 'warning',
        text: `Solo ingresar números porfavor`
      })
    }  
  }

}

