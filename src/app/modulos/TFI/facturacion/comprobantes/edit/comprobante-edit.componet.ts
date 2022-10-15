import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { DD_MM_YYYY_Format } from 'src/app/modulos/control-costos/compra/orden-compra-sc/repository/utilitarios';
import { MatTable } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { SecurityErp } from 'src/app/modulos/AAHelpers/securityErp.Entity';
import { AfectacionEntity, ColumnasTablas, DetraccionEntity, DocumentoEntity, FormaPago, ImpuestoEntity, MaterialesEntity, MonedaEntity, PresupuestoEntity, ServicioEntity, tablaColMaterial, TipoCambioEntity } from '../../../repository/models/general.Entity';
import { SerieEntity } from '../../../repository/models/serie.entity';
import { ComprobanteDetalle, ComprobanteDetalleForCreation } from '../../../repository/models/comprobanteDetalleForCreation.entity';
import { DataService } from '../../../repository/services/data.service';
import { ComprobanteForCreation } from '../../../repository/models/comprobanteForCreation.entity';
import { SerieQuery } from '../../../repository/models/serieQuery.entity';
import { Utilitarios } from '../../../repository/helpers/repository.Utilitarios';
import { FacturacionService } from '../../../repository/services/facturacion.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogHistorialEstadoComponent } from '../components/dialog-historial-estado/dialog-historial-estado.component';
import { CatalogoClienteDto } from '../../../repository/models/catalogo-cliente/catalogoClienteDto';
import { CatalogoClienteService } from '../../../repository/services/catalogo-cliente.service';
import { DialogFechaPagoComponent } from '../components/dialog-fecha-pago/dialog-fecha-pago.component';  
import { DialogMaterialFacComponent } from '../components/dialog-material-fac/dialog-material-fac.component';
import { async } from '@angular/core/testing';

@Component({
  selector: "app-comprobante-edit",
  templateUrl: "./comprobante-edit.component.html",
  styleUrls: ["./comprobante-edit.component.css"],
  animations: [asistenciapAnimations],

  providers: [
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format }, DatePipe]
})

export class ComprobanteEditComponent implements OnInit, OnDestroy {
  securityErp = new SecurityErp();
  utilitarios = new Utilitarios();
  formulario: FormGroup;
  formularioLineas: FormGroup;
  isLinear = false;
  documentoList: DocumentoEntity[];
  inactivo:boolean = false;
  serieList: SerieEntity[];
  monedaList: MonedaEntity[];
  clienteList: CatalogoClienteDto[];
  afectacionList: AfectacionEntity[];
  detraccionList: DetraccionEntity[];
  presupuestoList: PresupuestoEntity[] = [];
  tipoCambioList = new TipoCambioEntity();
  formaPagoList: FormaPago[];
  servicioList: DocumentoEntity[];
  impuesto = new ImpuestoEntity();
  subRef$: Subscription;
  comprobanteDetalle: ComprobanteDetalleForCreation[];
  tipoComprobante: string;
  validarserie: boolean = false;
  botonNuevo: boolean = true;
  matcher = new ErrorStateMatcher();
  idComprobante: number;
  listaDetalleComprobante: ComprobanteDetalle[] = [];
  listaEliminadoDetalles: ColumnasTablas[] = [];
  listaEliminadoDetallesMaterial: tablaColMaterial[] = [];
  //definicion de entidades(objectos) para calculos de comprobantes : MATERIALES. 
  codigoEstado: number;
  centrocosto: number;
  @ViewChild(MatTable) table: MatTable<any>;

  // Inicio de las columnas de las tablas

  tempData: ColumnasTablas[] = [
    {
      codigoComprobanteDet: null,
      centroCosto: null,
      pptos: "",
      totalPptos: null,
      aCuenta: 0,
      aCuentaEstatica: 0,
      anadir: 0,
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

  tempDataEstatica: ColumnasTablas[] = [
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
  ];


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
      editable: true
    }
  ];


  constructor(
    private fb          : FormBuilder,
    private dataService : DataService,
    private router      : Router,
    private route       : ActivatedRoute,
    public datepipe     : DatePipe,
    private spinner     : NgxSpinnerService,
    private facturacionService: FacturacionService,
    private catalogoService : CatalogoClienteService,
    public dialog: MatDialog

  ) {
    this.formulario = this.fb.group({
      codigoServicio: [{value: '', disabled: true}, [Validators.required]],
      codigoDocumento: [{value: '', disabled: true}, [Validators.required]],
      ordenCompra: [''],
      pptos: [],
      descPpto: [{value: '', disabled: true}],
      cliente: [''],
      fechaComprobante: [Validators.required],
      sucursal: [],
      psOserv: [''],
      nestado: [''],
      sestado: [''],
      codigoMoneda: [{value: '', disabled: true}, [Validators.required, Validators.minLength(2)]],
      codigoSerie: [{value: '', disabled: true}, [Validators.required, Validators.minLength(2)]],
      aceptacion: [''],
      fechapago: [{value: '', disabled: true}],
      codigoAfectacion: ['', [Validators.required, Validators.minLength(2)]],
      codigoTipoCambio: ['', [Validators.required]],
      numeroSerie: ['', Validators.required],
      glosa: ['', Validators.required],
      observacion1: [''],
      observacion2: [''],
      codigoDetraccion: [''], 
      porcentajeDetraccion: [''], 
      totalDetraccion: [''],
      stotalDetraccion: [{value: '', disabled: true}],
      codigoFormaPago: ['', [Validators.required]]
    });

    this.formularioLineas = this.fb.group({
      descripcionTipoDocumento: [{value: '', disabled: true}, [Validators.required]],
      descripcionSucursal: [{value: '', disabled: true}],
      descripcionNumeroSerie: [{value: '', disabled: true}, [Validators.required, Validators.minLength(2)]],
      descripionNumeradorSerie: [{value: '', disabled: true}, Validators.required],
      descripcionMoneda: [{value: '', disabled: true}, Validators.required],
      descripcionTipoCambio: [{value: '', disabled: true}, Validators.required],

      
      tAnadido: [''],
      sAnadido: [{value: '', disabled: true}, Validators.required],
      tValorVenta: ['', Validators.required],
      sValorVenta : [{value: '', disabled: true}, Validators.required],
      descripcionCorta: [{value: '', disabled: true}, Validators.required],
      importePorcenje: ['', Validators.required],
      simportePorcenje : [{value: '', disabled: true}, Validators.required],
      totalFinal: ['', Validators.required],
      stotalFinal : [{value: '', disabled: true}, Validators.required],
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.formulario.controls[controlName].hasError(errorName);
  }

  async ngOnInit() { 
    this.spinner.show();
    // Obtenemos el id de la url y lo enviamos para obtener la dta pero antes cargamos la data base para los combos
    this.route.params.subscribe(async (params) => {
      this.idComprobante = +params.id 
      // Aquí obtenemos la cabecera del comprobante
      await this.getListadoDocumento(); 
      await this.getTipoServicio();
      await this.getFormaPago();
      if (this.securityErp.getPais() == '604') {
        await this.getListadoMoneda();
        await this.getListadoDetraccion(); 
      }

      await this.getComprobanteLineas(this.idComprobante);
      await this.validaPaisEcuador();   
      await this.validarEstado();
    }) 
  }

  Agregar() {

  }

  fnSalir() { 
    this.router.navigateByUrl("tfi/facturacion/comprobante/list"); 
  }


  async nuevoComprobante() {   
 
    await this.getListadoAfectacion();
    await this.getListadoImpuesto();
    await this.mat_ObtenerCliente();  

    this.utilitarios.detracciones();
  }

  async detalleDetraccion() {
    
    if(this.formulario.value.codigoDetraccion === 0) return;

    const result = this.detraccionList.filter(x => x.codigoDetracion === this.formulario.value.codigoDetraccion);
    this.utilitarios.descripcionLargaDetraccion = result[0].descripcionLarga;
    this.utilitarios.porcentaje = result[0].porcentaje;
    this.utilitarios.totalDetraccion = result[0].totalDetraccion;
    this.formulario.get('porcentajeDetraccion').setValue(this.utilitarios.porcentaje);
    await this.calcularDetraccion();
  }

  async calcularDetraccion() { 

    let totalF = (this.formularioLineas.value.totalFinal).toString();
    totalF = totalF.replace(',', '')
    let totalD = 0; 

    if (Number(totalF) > this.utilitarios.totalDetraccion)
      totalD = totalF * (this.utilitarios.porcentaje / 100)
    this.formulario.get('totalDetraccion').setValue(totalD.toFixed(2));
    this.formulario.get('stotalDetraccion').setValue(this.fnNumero(totalD.toFixed(2)));

  }

  consultaTipoCambio() {
    this.getListadoTipoCambio()
  }

  obtenerNumeradorSerie(e) {
    this.spinner.show();
    const result = this.serieList.filter(x => x.codigoSerie === e);
    let anchoNumerador = result[0].anchoNumerador
    let numeroSerie = result[0].numeroSerie
    console.log(this.serieList);
    console.log(numeroSerie);
    
    this.formularioLineas.get('descripcionNumeroSerie').setValue(numeroSerie)

    const serieQuery: SerieQuery = {
      codigoSerie: this.formulario.value.codigoSerie,
      codigoEmpresa: parseInt(this.securityErp.getEmpresa()),
      codigoDocumento: this.formulario.value.codigoDocumento,
      numeroSerie: numeroSerie,
      anchoNumerador: anchoNumerador
    };
    const url = environment.BASE_URL_TFI + '/serie/Numerador/' + 1;
    this.subRef$ = this.dataService.post<SerieQuery>(url, serieQuery)
      .subscribe(res => {
        this.formulario.get('numeroSerie').setValue(res.body[0].correlativo);
        this.formularioLineas.get('descripionNumeradorSerie').setValue(res.body[0].correlativo);
        this.spinner.hide();
      },
        (error) => {
          console.log(error);
        })
  } 

  validaPaisEcuador() {
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

  getListadoPresupuesto(ppto, index) {

    // Al obtener un presupuesto valida el costo sea mayor a 0 el total también que exista, etc. Si pasa las validaciones se agrega al detalle
    this.reiniciarLineas('S', index);
    const data = this.tempData.filter(x => x.pptos === ppto);
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
          if(this.presupuestoList[0].estado !== 2073 && this.presupuestoList[0].estado !== 2076 && this.presupuestoList[0].estado !== 2074) {
            console.log(this.presupuestoList[0]);
            
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
  async EliminarElemento(i) {
    let codigoServicio = this.formulario.get('codigoServicio').value;  
    let error = true;
    let obj = this.tempData[i]; 
    let objm = this.tempDataM[i]; 

    if(codigoServicio == 2235) {  
      if(this.tempDataM.length === 1){
        error = false;
      }
    }
    else{
      
      if(this.tempData.length === 1){
        error = false;
      }
    }

    if(!error){
      return Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'El comprobante debe tener como mínimo un item.',
      })
    }

    
    Swal.fire({
      title: '¿Está seguro de eliminar el item?',
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        if(codigoServicio == 2235) { 
          this.tempDataM = this.tempDataM.filter((elem) => elem != this.tempDataM[i]) 
        
          if(objm.codigoComprobanteDet > 0)
          { 
            await this.fnValidarElementoMat(objm);
          }
          else{
            Swal.fire({
              icon: 'success',
              title: 'Exito!',
              text: 'se elimino correctamente el item',
            })
          }

          this.table.renderRows();
          
          await this.mat_CalcularTotalFinal();
        } else {  
  
          this.tempData = this.tempData.filter((elem) => elem != this.tempData[i])  
          await this.fnValidarElemento(obj);
          this.table.renderRows();
          await this.calculoActualizarTotales();
        } 
        
        await this.calcularDetraccion(); 
      }
    });
  }

  async fnValidarElemento(Obj){ 
    
    
    const parametro = `${this.idComprobante}|${Obj.centroCosto}|${this.securityErp.getUsuarioId()}`;

    this.spinner.show();
    const resp: any = await this.facturacionService.updateEstado({ pOpcion : 25, pParametro: parametro});
    this.spinner.hide();
    if(resp.body.response.data[0].valorRetorno === 1)
    {
      Swal.fire({
        icon: 'success',
        title: 'Exito!',
        text: 'se elimino correctamente el item',
      })
    }
    
  }

  async fnValidarElementoMat(Obj){   
    
    const parametro = `${this.idComprobante}|${Obj.codigoComprobanteDet}|${this.securityErp.getUsuarioId()}`;

    this.spinner.show();
    const resp: any = await this.facturacionService.updateEstado({ pOpcion : 27, pParametro: parametro});
    this.spinner.hide();
    if(resp.body.response.data[0].valorRetorno === 1)
    {
      Swal.fire({
        icon: 'success',
        title: 'Exito!',
        text: 'se elimino correctamente el item',
      })
    }
    
  }

  async getCalcularLineas(element,tipo) {
    this.spinner.show();
    let index = this.tempData.indexOf(element);
    this.validarACuenta(index); 

    let totalPpto = this.tempData[index].totalPptos;
    let aCuenta = this.tempData[index].aCuenta;
    let importePorcentaje = this.impuesto.importePorcenje; 
    this.calculoTotalesPpto(Number.parseFloat(aCuenta),0,totalPpto,index,tipo,importePorcentaje);
    this.spinner.hide();
  }


  async getCalcularLineasVenta(element,tipo) {
    this.spinner.show();
    let index = this.tempData.indexOf(element);
    let param = [];
    this.validarSubTotal(index);
    param.push(this.tempData[index].totalPptos)
    param.push(this.tempData[index].aCuenta)
    param.push(this.impuesto.importePorcenje)
    param.push(this.tempData[index].anadir)
    param.push(this.tempData[index].valorVenta)
    
    let totalPpto = this.tempData[index].totalPptos;
    let aCuenta = this.tempData[index].aCuenta;
    let importePorcentaje = this.impuesto.importePorcenje;
    let anadir = this.tempData[index].anadir
    let valorVenta: any = this.tempData[index].valorVenta;
    let valorVentaNumber: any = Number.parseFloat(valorVenta);
    const url = environment.BASE_URL_TFI + 'Comprobante/4' + '/' + param.join('|')
    this.calculoTotalesPpto(0,Number.parseFloat(valorVentaNumber),totalPpto,index,tipo,importePorcentaje);
    this.spinner.hide();
  } 

  nuevaLinea() {
    let error = true;
    this.tempData.map((ele)=>{
      if(ele.centroCosto === null){
        error =false;
        return
      } 
    });

    if(!error){

    }
    else{
      this.tempData.push(
        {
          codigoComprobanteDet: null,
          centroCosto: null,
          pptos: "",
          totalPptos: null,
          aCuenta: 0,
          anadir: 0,
          valorVenta: 0,
          impuesto: null,
          total: null,
          editable: true
        }
      )
      this.table.renderRows();
    }  
  }


  consultaPptos(element) {
    let index = this.tempData.indexOf(element);
    this.getListadoPresupuesto(element.pptos, index);
  }
  // FIN : Calculos de lineas para comprobante:SERVICIOS


  // Inicio : Calculos de lineas para comprobante:MATERIALES
  
  mate_getListadoPresupuesto() {
    let param = [];
    let noValido = /\s/; 
    this.formulario.get('descPpto').setValue('');
    this.formulario.get('cliente').setValue('');
    
    param.push(this.formulario.value.pptos);
    param.push(this.securityErp.getEmpresa());

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
            this.centrocosto = this.presupuestoList[0].centroCosto;
            this.formulario.get('pptos').setValue(this.presupuestoList[0].codigoPpto);
            this.formulario.get('descPpto').setValue(this.presupuestoList[0].descPpto);
          }
        }
        else {
          Swal.fire({
            icon: 'warning',
            title: '¡Verificar!',
            text: 'El presupuesto ingresado no existe.',
          })
          this.formulario.get('descPpto').setValue('');
          // this.formulario.get('cliente').setValue('');
          this.formulario.get('pptos').setValue('');

          return;
        }
      },
        (error) => {
          console.log(error);
          this.spinner.hide();
        })
  } 
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
    this.tempDataM[index].total = Number(this.tempDataM[index].subTotal) + Number(this.tempDataM[index].igv);
    this.tempDataM[index].ssubTotal = this. fnNumero(subtotal);
    this.tempDataM[index].sigv = this. fnNumero(Number.parseFloat((Number(this.tempDataM[index].subTotal) * (this.impuesto.importePorcenje / 100)).toFixed(2)));
    this.tempDataM[index].stotal = this. fnNumero(Number.parseFloat((Number(this.tempDataM[index].subTotal) + Number(this.tempDataM[index].igv)).toFixed(2)));
    
    this.mat_CalcularTotalFinal();
  }

  mat_ObtenerCliente() {
    this.subRef$ = this.catalogoService.getCatalogoClientes(`opcion=1&parametro=${this.securityErp.getPais()}`)
      .subscribe((resp: any) => {
        this.clienteList = resp.body.response.data;
      })
  }

  async mat_CalcularTotalFinal() {
    let subTotalF = 0;
    let igvF = 0;
    let totalF = 0;
    this.tempDataM.forEach((element) => { 
      subTotalF = Number(subTotalF) + Number(element.subTotal)
      igvF = Number(igvF) + Number(element.igv)
      totalF = Number(totalF) + Number(element.total)
    }); 
    this.formularioLineas.get('tValorVenta').setValue(subTotalF.toFixed(2));
    this.formularioLineas.get('importePorcenje').setValue(igvF.toFixed(2));
    this.formularioLineas.get('totalFinal').setValue(totalF.toFixed(2));
    this.formularioLineas.get('sValorVenta').setValue(this.fnNumero(subTotalF.toFixed(2)));
    this.formularioLineas.get('simportePorcenje').setValue(this.fnNumero(igvF.toFixed(2)));
    this.formularioLineas.get('stotalFinal').setValue(this.fnNumero(totalF.toFixed(2)));
    this.detalleDetraccion();
  }

  mat_NuevaLinea() {

    this.tempDataM.push(
      {
        cuenta: null,
        articuloServicio: null,
        detalle: null,
        unidadMedida: null,
        cantidad: 0,
        precioUnitario: 0,
        subTotal: 0,
        igv: 0,
        total: 0,
        editable: true
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


    if (this.formulario.get('pptos').value == null ||
      this.formulario.get('descPpto').value == null ||
      this.formulario.get('cliente').value == null) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta ingresar el presupuesto.',
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

    Swal.fire({
      icon: 'question',
      title: 'Actualización de Comprobante',
      text: '¿Desea actualizar?',
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if(result.isConfirmed) {
        let error = true;
        const lineas = [];
        this.tempDataM.forEach((linea) => {
          let fila = [];
            fila.push(this.centrocosto),
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
            fila.push(1),
            fila.push(linea.cuenta),
            lineas.push(fila.join(","));
            console.log((linea));
            console.log((linea.precioUnitario*linea.cantidad));
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
          codigoComprobante: this.idComprobante,
          codigoEmpresa: parseInt(this.securityErp.getEmpresa()),
          codigoAfectacion: this.formulario.value.codigoAfectacion,
          codigoDetraccion: this.formulario.value.codigoDetraccion === "" ? 0 : this.formulario.value.codigoDetraccion,
          codigoDocumento: this.formulario.value.codigoDocumento,
          codigoMoneda: this.formulario.value.codigoMoneda,
          codigoSerie: this.formulario.value.codigoSerie,
          codigoTipoServicio: this.formulario.value.codigoServicio,
          codigoTipoCambio: this.formulario.value.codigoTipoCambio,
          codigoCliente: this.formulario.get('cliente').value,
          sucursal: this.formularioLineas.value.descripcionSucursal,
          numeroSerie: this.formularioLineas.value.descripcionNumeroSerie,
          correlativoSerie: this.formularioLineas.value.descripionNumeradorSerie,
          fechaComprobante: this.formulario.value.fechaComprobante,
          ordenCompra: this.formulario.value.ordenCompra,
          psOserv: this.formulario.value.psOserv,
          aceptacion: this.formulario.value.aceptacion,
          glosa: this.formulario.value.glosa,
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
          lineas: this.obtenerEliminadoMaterial(),
          tipoComp: 'M',
          opc: opc,
          codigoFormaPago: this.formulario.value.codigoFormaPago
        }
    
        this.spinner.show();
        const url = environment.BASE_URL_TFI + 'Comprobante';
        this.subRef$ = this.dataService.post<ComprobanteForCreation>(url, comprobanteForCreation)
          .subscribe(async res => { 
            this.spinner.hide();
            await this.getComprobanteLineasDetalle(this.idComprobante,this.tipoComprobante);
            Swal.fire({
              title: 'Actualización Existosa',
              icon: 'success',
              timer: 1500
            });
            
          },
            err => { this.spinner.hide(); });
          }
    })
    
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
      title: 'Actualización de Comprobante',
      text: '¿Desea actualizar?',
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {

        let totalAnadido = 0;
        let totalFinal = 0;
        let totalValorVenta = 0;
        let totalImpuesto = 0;

        let error = true

        const lineas = [];
        this.tempData.forEach((linea) => {
          let fila = []; 
            if(Number(linea.aCuenta) <= 0.0 || Number(linea.valorVenta) <= 0.0){
              return error = false;
            }

            fila.push(linea.centroCosto), // Centro Costo
            fila.push(0), // Artículo
            fila.push(''), // Detalle
            fila.push(0), // IdUm
            fila.push(1),  // Por ser servicio la cantidad va en 1
            fila.push(linea.totalPptos),// Precio Presupuesto
            fila.push(linea.aCuenta), // A cuenta
            fila.push(linea.anadir), // Total Añadido
            fila.push(linea.valorVenta), // Sub Total
            fila.push(linea.impuesto),
            fila.push(linea.total),
            fila.push(linea.codigoServicio), // Id Servicio
            fila.push(linea.cuentaContable), // Cuenta Cont
            lineas.push(fila.join(","));
        }); 
        
        if(!error){
          Swal.fire({
            icon: 'warning',
            title: '¡Verificar!',
            text: 'falta ingresar datos en el detalle',
          })
        }
        else{
          this.tempData.forEach((item) => {
            totalAnadido = Number(totalAnadido) + Number(item.anadir)
            totalValorVenta = Number.parseFloat(totalValorVenta.toString()) + Number.parseFloat(item.valorVenta.toString())
            totalImpuesto = Number.parseFloat(totalImpuesto.toString()) + Number.parseFloat(item.impuesto.toString())
            totalFinal = Number.parseFloat(totalFinal.toString()) + Number.parseFloat(item.total.toString())
          })
  
          const comprobanteForCreation: ComprobanteForCreation =
          {
            codigoComprobante: this.idComprobante,
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
            numeroSerie: this.formularioLineas.value.descripcionNumeroSerie,
            correlativoSerie: this.formularioLineas.value.descripionNumeradorSerie,
            fechaComprobante: this.formulario.value.fechaComprobante,
            ordenCompra: this.formulario.value.ordenCompra,
            psOserv: this.formulario.value.psOserv,
            aceptacion: this.formulario.value.aceptacion,
            glosa: this.formulario.value.glosa,
            observacion1: this.formulario.value.observacion1,
            observacion2: this.formulario.value.observacion2,
            porcentajeDetraccion: this.formulario.value.porcentajeDetraccion === "" ? 0 : this.formulario.value.porcentajeDetraccion,
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
            lineas: this.obtenerEliminadosServicio(),
            tipoComp: 'S',
            opc: opc,
            codigoFormaPago: this.formulario.value.codigoFormaPago
          }  
          
          this.spinner.show();
          this.subRef$ = this.facturacionService.postCreateComprobante<ComprobanteForCreation>(comprobanteForCreation)
            .subscribe((res: any) => {        
              this.spinner.hide();
              Swal.fire({
                title: 'Actualización Existosa',
                icon: 'success',
                timer: 1500
              });
            },
              err => { this.spinner.hide() });
        }

        
      }
      else {
        return;
      }
    })

  }

  saveComprobante(estado, opc) {

    if(this.formulario.invalid) {
      return Object.values(this.formulario.controls).forEach(control => {
        control.markAllAsTouched();
      })
    }
    this.tipoComprobante == 'S' ? this.saveComprobanteServicio(estado, opc) : this.saveComprobanteMaterial(estado, opc)
  }

  sendComprobante(estado, opc) {
    let parametro = `${this.idComprobante}|${estado}|${this.securityErp.getUsuarioId()}`;
    
    if (this.formularioLineas.controls.totalFinal.value <= 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Verificar!',
        text: 'Falta ingresar el detalle del comprobante.',
      })
      return;
    } 

      Swal.fire({
        title: '¿Desea generar el archivo TXT?',
        showCancelButton: true,
        confirmButtonText: `Si`,
        cancelButtonText: `No`,
      }).then(async (result) => {
        if (result.isConfirmed) {     
          
          if(this.tipoComprobante === 'S'){
            Swal.fire({
              title: '¿Resumido o detallado?',
              showDenyButton: true,
              showCancelButton: false,
              confirmButtonText: `Resumido`,
              denyButtonText: `Detallado`, 
            }).then((resultV2) => { 
                if (resultV2.isConfirmed) { 
                  parametro += `|${0}`   
                  Swal.fire({
                    title: '¿Desea enviar el TXT a Carvajal?',
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: `Si`,
                    denyButtonText: `No`, 
                  }).then((resultV2) => { 
                      if (resultV2.isConfirmed) { 
                        parametro += `|${1}`  
                        this.fnEnviar(estado,parametro) ; 
                      } 
                      else if (resultV2.isDenied) {  
                        parametro += `|${0}`  
                        this.fnEnviar(estado,parametro) ;
                      }
                      
                  }); 
                } 
                else if (resultV2.isDenied) {  
                  parametro += `|${1}`   
                  Swal.fire({
                    title: '¿Desea enviar el TXT a Carvajal?',
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: `Si`,
                    denyButtonText: `No`, 
                  }).then((resultV2) => { 
                      if (resultV2.isConfirmed) { 
                        parametro += `|${1}`  
                        this.fnEnviar(estado,parametro) ; 
                      } 
                      else if (resultV2.isDenied) {  
                        parametro += `|${0}`  
                        this.fnEnviar(estado,parametro) ;
                      }
                      
                  }); 
                }
                
            });
          }
          else{
            parametro += `|${1}`   
            Swal.fire({
              title: '¿Desea enviar el TXT a Carvajal?',
              showDenyButton: true,
              showCancelButton: false,
              confirmButtonText: `Si`,
              denyButtonText: `No`, 
            }).then((resultV2) => { 
                if (resultV2.isConfirmed) { 
                  parametro += `|${1}`  
                  this.fnEnviar(estado,parametro) ; 
                } 
                else if (resultV2.isDenied) {  
                  parametro += `|${0}`  
                  this.fnEnviar(estado,parametro) ;
                }
                
            }); 
          } 
          
          
          
        }
      });
       
  }
  // validacion de  datos:tablas:Servicios y Materiales

  async fnEnviar(estado,parametro){  
    
    try {
          this.spinner.show();
          const resp: any = await this.facturacionService.updateEstado({ pOpcion : 24, pParametro: parametro});
          this.spinner.hide();
          if(resp.body.response.data[0].valorRetorno >= 1) { 
            this.codigoEstado  = estado
            this.formulario.get('nestado').setValue(estado);
            this.formulario.get('sestado').setValue('Enviado'); 
            this.CambioEstado()
            Swal.fire({
              icon: 'success',
              title: 'El comprobante fue enviado'
            })
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Alerta',
              text: 'No se pudo enviar el comprobante',
            })
          }
        } catch (error) {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Alerta',
            text: 'No se pudo enviar el comprobante ' + error,
          })
          console.log('ERROR',error);
        } 
  }

  reiniciarLineas(tipo: string, index: number) {
    if (tipo === "S") {
      this.tempData[index].centroCosto = null;
      this.tempData[index].pptos = null;
      this.tempData[index].totalPptos = 0;
      this.tempData[index].aCuenta = 0;
      this.tempData[index].anadir = 0;
      this.tempData[index].valorVenta = 0;
      this.tempData[index].impuesto = 0;
      this.tempData[index].total = 0;
    }

  }

 

  async getComprobanteLineas(id: number) {
    let param = [];
    param.push(id);
    param.push(this.securityErp.getEmpresa());
    const url = environment.BASE_URL_TFI + 'Comprobante/multi/10/' + param.join('|');
    this.subRef$ = this.facturacionService.getMultiAsync<any>(10,id,this.securityErp.getEmpresa())
      .subscribe(async res => {
        this.formulario.reset({
          codigoServicio: Number(res.body.response.data[0].codigoServicio),
          codigoDocumento: Number(res.body.response.data[0].codigoDocumento),
          ordenCompra: res.body.response.data[0].ordenCompra,
          pptos: res.body.response.data[0].pptos,
          nestado: res.body.response.data[0].nestado,
          sestado: res.body.response.data[0].sestado,
          descPpto: res.body.response.data[0].descPpto,
          cliente: res.body.response.data[0].codigoCliente,
          fechaComprobante: new Date(res.body.response.data[0].fechaComprobante),
          sucursal: res.body.response.data[0].sucursal,
          psOserv: res.body.response.data[0].psObserv,
          fechapago: res.body.response.data[0].sfechapago,
          codigoMoneda: Number(res.body.response.data[0].codigoMoneda),
          codigoSerie: Number(res.body.response.data[0].codigoSerie),
          aceptacion: res.body.response.data[0].aceptacion,
          codigoAfectacion: Number(res.body.response.data[0].codigoAfectacion),
          codigoTipoCambio: Number(res.body.response.data[0].nIdTCambio),
          numeroSerie: res.body.response.data[0].docNumero,
          glosa: res.body.response.data[0].glosa,
          observacion1: res.body.response.data[0].observacion1,
          observacion2: res.body.response.data[0].observacion2,
          codigoDetraccion: Number(res.body.response.data[0].codigoDetraccion),
          porcentajeDetraccion: res.body.response.data[0].porcentajeDetraccion,
          totalDetraccion: this.fnNumero(res.body.response.data[0].tDetraccion),
          codigoFormaPago: res.body.response.data[0].codigoFormaPago == null  ? null : Number(res.body.response.data[0].codigoFormaPago),
        });  
         
        this.codigoEstado = Number(res.body.response.data[0].codEst)   
        this.utilitarios.tablaLineas(Number(res.body.response.data[0].codigoServicio));
        await this.getListadoSerieV2(Number(res.body.response.data[0].codigoDocumento),res.body.response.data[0].codigoSerie)
        this.formularioLineas.get('descripcionNumeroSerie').setValue(res.body.response.data[0].sDocSerie);
        this.formularioLineas.get('descripionNumeradorSerie').setValue(res.body.response.data[0].docNumero);

        if(Number(res.body.response.data[0].codigoServicio) == 2235)
        {
          this.tipoComprobante = 'M';
        }
        else{
          this.tipoComprobante = 'S'
        }
        if (this.securityErp.getPais() == '604') {
          await this.getListadoTipoCambio(); 
        }
        await this.getComprobanteLineasDetalle(this.idComprobante,this.tipoComprobante);
        await this.nuevoComprobante(); 
        this.CambioEstado()
      },
        (error) => {
          console.log('ERROR',error);
        })
  }

  

  async rellenarListaServicios(listaDetalle: ComprobanteDetalle[]) {
    this.tempData = [];
    this.tempDataEstatica = [];
    let estaEnviado = this.codigoEstado == 2239 ?  true : false;
    for (const detalle of listaDetalle) {  
      
      this.tempData.push({
        codigoComprobanteDet: detalle.nIdComprobanteDET,
        centroCosto: detalle.centroCosto,
        pptos: `${detalle.codigoPpto} - ${detalle.nombrePresupuesto}`,
        totalPptos: detalle.totalPptos,
        aCuenta: detalle.aCuenta.toFixed(4),
        aCuentaEstatica: detalle.acuentatotal, 
        valorVentaPorcentaje: ((detalle.valorVenta * detalle.acuentatotal) / 100).toFixed(2),
        anadir: detalle.anadir,
        valorVenta: detalle.subTotal,
        impuesto: detalle.impuesto,
        total: detalle.total,
        editable: true,
        cuentaContable: detalle.sCuentaCont,
        codigoServicio: detalle.nIdServicio,
        cliente: detalle.nombreCliente,
        moneda: "",
        isConvertMoneda: false,
        codigoCliente: detalle.nIdComprobante,
        sanadir : this. fnNumero(detalle.anadir),
        simpuesto: this. fnNumero(detalle.impuesto),
        stotal: this. fnNumero(detalle.total),
      })      
    } 
    let detalle = listaDetalle[listaDetalle.length - 1];
    if(listaDetalle.length > 0) {
      let presupuesto: PresupuestoEntity = {
        codigoCliente: Number(detalle.nIdCliente),
        centroCosto: detalle.centroCosto ,
        total: detalle.total ,
        totalFormato: detalle.total ,
        codigoPpto: detalle.codigoPpto ,
        cliente: "" ,
        descPpto: "",
        ruc: "" ,
        aCuenta: 0 ,
        moneda: "" ,
        cuentaContable: "" ,
        codigoServicio: 0 ,
        razonSocial: "" ,
        aprobacionPre: "" ,
        estado: 0 
      };
      this.presupuestoList.push(presupuesto);
    }
    
    
    await this.convertirSolesADolares();
    await this.calculoActualizarTotales(); 
  }

  rellenarListaMateriales(listaDetalle: ComprobanteDetalle[]) {
    this.tempDataM = [];
    this.tempDataEstatica = [];
    this.formulario.controls.pptos.setValue(listaDetalle[0].presupuesto);
    this.formulario.controls.descPpto.setValue(listaDetalle[0].descripcionPresupuesto);
    this.centrocosto = listaDetalle[0].centroCosto   
    
    for (const detalle of listaDetalle) {
      
      this.tempDataM.push({
        codigoComprobanteDet: detalle.nIdComprobanteDET,
        cuenta: detalle.cuenta,
        articuloServicio: Number(detalle.nIdArticulo),
        sarticuloServicio: detalle.nombreMaterial,
        detalle: detalle.detalle,
        unidadMedida: detalle.nombreMedida,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subTotal: detalle.nSubTotal,
        igv: detalle.impuesto,
        total: detalle.total,
        ssubTotal: this.fnNumero(detalle.nSubTotal),
        sigv: this.fnNumero(detalle.impuesto),
        stotal: this.fnNumero(detalle.total),
        editable: true
      })
    }

    this.table.renderRows(); 
    this.mat_CalcularTotalFinal();
  }

  convertirSolesADolares() {
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
    const codigoServicio = this.formulario.get('codigoServicio').value;
    if(codigoServicio == 2235) { // Materiales
      this.mat_CalcularTotalFinal();
    }
    else { // servicio
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
      this.formularioLineas.get('sAnadido').setValue(this.fnNumero(anadido));
      this.formularioLineas.get('sValorVenta').setValue(this.fnNumero(ventaFinal));
      this.formularioLineas.get('simportePorcenje').setValue(this.fnNumero(impuestoFinal));
      this.formularioLineas.get('stotalFinal').setValue(this.fnNumero(totalFinal));
      this.detalleDetraccion();
    }
  }

  async calculoTotalesPpto(aCuenta: number, valorVenta: number, totalPresupuesto: number, index: number, tipo: number, importePorcentaje: number){
    const totalPresupuestoFijo = totalPresupuesto;
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

  validarEstadoGuardar(): boolean {
    return this.codigoEstado === 2239 ? false : (this.codigoEstado === 2238 ? false : true);
  }

  validarEstado(): boolean {
    return this.codigoEstado === 2239 ? false : true;
  }

  CambioEstado(){
    if(this.codigoEstado === 2239 || this.codigoEstado === 2238)
    {
      this.formulario.disable()
      this.formularioLineas.disable()
      this.inactivo = true;
    }  
  }

  validarACuenta(index) {
    let tempData = this.tempData[index]; 
    if( isNaN(tempData.aCuenta) ) { // Sino es número devuelve true, si es false
      return Swal.fire({
        title: '¡Verificar!',
        icon: 'warning',
        text: `Solo ingresar números porfavor`
      })
    }
    if(tempData.aCuenta <= 0) {
      this.tempData[index].aCuenta = this.tempData[index].aCuentaEstatica;
      return Swal.fire({
        title: '¡Verificar!',
        icon: 'warning',
        text: `No puede ingresar valores negativos o 0 a cuenta`
      })
    }

  }

  validarSubTotal(index) {
    let tempData = this.tempData[index];
    if( isNaN(tempData.valorVenta) ) { // Sino es número devuelve true, si es false
      return Swal.fire({
        title: '¡Verificar!',
        icon: 'warning',
        text: `Solo ingresar números porfavor`
      })
    }
    if(tempData.valorVenta <= 0) {
      this.tempData[index].aCuenta = this.tempData[index].aCuentaEstatica;
      this.calculoTotalesPpto(Number.parseFloat(this.tempData[index].aCuenta),0,this.tempData[index].totalPptos,index,1,this.tempData[index].impuesto);
      return Swal.fire({
        title: '¡Verificar!',
        icon: 'warning',
        text: `No puede ingresar valores negativos o 0 a cuenta`
      })
    }


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

  obtenerEliminadosServicio() {
    let resp = '';
    this.tempData.push(...this.listaEliminadoDetalles);
    for (const comprobante of this.tempData) {
      let fila = [];
      let value = this.listaEliminadoDetalles.find(item => item.codigoComprobanteDet === comprobante.codigoComprobanteDet);
      if(value  == undefined || value == null) { // Sigue en la lista no fue eliminado
        resp += `${comprobante.centroCosto},0,,0,1,${comprobante.totalPptos},${comprobante.aCuenta},${comprobante.anadir},${comprobante.valorVenta},${comprobante.impuesto},${comprobante.total},${comprobante.codigoServicio},${comprobante.cuentaContable},${comprobante.codigoComprobanteDet == null ? 0 : comprobante.codigoComprobanteDet},1/`;
      } else {
        resp += `${comprobante.centroCosto},0,,0,1,${comprobante.totalPptos},${comprobante.aCuenta},${comprobante.anadir},${comprobante.valorVenta},${comprobante.impuesto},${comprobante.total},${comprobante.codigoServicio},${comprobante.cuentaContable},${comprobante.codigoComprobanteDet},0/`;
      }
    }
    return resp.substring(0, resp.length - 1);
  }

  obtenerEliminadoMaterial() {
    let resp = '';
    const nIdCentroCosto = this.listaDetalleComprobante[0].centroCosto;
    this.tempDataM.push(...this.listaEliminadoDetallesMaterial);
    for(const comprobante of this.tempDataM) {
      let fila = [];
      let value = this.listaEliminadoDetallesMaterial.find(item => item.codigoComprobanteDet === comprobante.codigoComprobanteDet);
      if(value == undefined || value == null) {
        resp += `${nIdCentroCosto},${comprobante.articuloServicio},${comprobante.detalle},1,${comprobante.cantidad},${comprobante.precioUnitario},0,0,${comprobante.subTotal},${comprobante.igv},${comprobante.total},,${comprobante.cuenta},${comprobante.codigoComprobanteDet == null ? 0 : comprobante.codigoComprobanteDet},1/`;
      } else {
        resp += `${nIdCentroCosto},${comprobante.articuloServicio},${comprobante.detalle},1,${comprobante.cantidad},${comprobante.precioUnitario},0,0,${comprobante.subTotal},${comprobante.igv},${comprobante.total},,${comprobante.cuenta},${comprobante.codigoComprobanteDet == null ? 0 : comprobante.codigoComprobanteDet},0/`;
      }
    }
    return resp.substring(0, resp.length - 1);
  }
 

  verHistorialEstado() {
    const dialogRef = this.dialog.open(DialogHistorialEstadoComponent, {
      width: '50%',
      height: '500px',
      data: {
        'comprobanteId': this.idComprobante
      }
    });
  }

  async anularComprobante() {
    
    const idEstado = 2239; //Id Anular
    const parametro = `${this.idComprobante}|${idEstado}|${this.securityErp.getUsuarioId()}`;
    let mensaje = '¿Está seguro de anular el comprobante?';
    const respV1: any = await this.facturacionService.updateEstado({ pOpcion : 31, pParametro: parametro}); 
    
    if(respV1.body.response.data[0].valorRetorno === 2){
      mensaje = '¿Esta factura tiene una NC, seguro de anular?'
    } 
    
    try {
      
      Swal.fire({
        title: mensaje,
        showCancelButton: true,
        confirmButtonText: `Anular`,
        cancelButtonText: `Cancelar`,
      }).then(async (result) => {
        if (result.isConfirmed) {
          
          this.spinner.show();
          const resp: any = await this.facturacionService.updateEstado({ pOpcion : 21, pParametro: parametro});
          this.spinner.hide();
          if(resp.body.response.data[0].valorRetorno >= 1) {
            this.codigoEstado  = idEstado 
            this.formulario.get('nestado').setValue(idEstado);
            this.formulario.get('sestado').setValue('Anulado'); 
            this.CambioEstado() 
              Swal.fire({
                icon: 'success',
                title: 'El comprobante fue anulado'
              })  

          } else {
            Swal.fire({
              icon: 'error',
              title: 'Alerta',
              text: 'No se pudo anular el comprobante',
            })
          }
          
        }
      }); 
    } catch (error) {
      this.spinner.hide();
      Swal.fire({
        icon: 'error',
        title: 'Alerta',
        text: 'No se pudo anular el comprobante ' + error,
      })
      console.log('ERROR',error);
    }
  }

  //#region obtención de datos GEt 
   
  async getListadoDocumento() {
    this.subRef$ = this.facturacionService.getAllByIdDad<DocumentoEntity[]>(12,'2112') //Listo
        .subscribe(async (res: any) => {
          this.documentoList = res.body.response.data; 
        },
          (error) => {
            this.spinner.hide();
            console.log(error);
          })
    
  }

  async getListadoSerieV2(e:number,serie) {  
    
    this.serieList = [];
    this.spinner.show();  
    
    
    let result = this.documentoList.filter(x => x.codigoDocumento == e);
    this.formularioLineas.get('descripcionTipoDocumento').setValue(result[0].descripcionCorta);
    let parametro = [];
    parametro.push(this.securityErp.getEmpresa());
    parametro.push(e);
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


  getListadoSerie(e) {
    this.serieList = [];
    this.spinner.show();
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

  async getListadoMoneda() { 
    this.subRef$ = this.facturacionService.getAllMoneda<MonedaEntity[]>({ opcion: 14, tipoElemeneto:442, codigoPais: this.securityErp.getPais() })
      .subscribe((res: any) => {
        this.monedaList = res.body.response.data;
        let data = this.monedaList.find(item => item.codigoMoneda === this.formulario.get('codigoMoneda').value);

        if(data) {
          this.formularioLineas.get('descripcionMoneda').setValue(data.descripcionCorta);
        } 
      },
        (error) => {
          console.log(error);
      })
  }

  async getListadoDetraccion() { 
    this.subRef$ = this.facturacionService.getAllDetraccion<DetraccionEntity[]>({opcion: 15, tipoElemeneto: 1295, codigoPais: this.securityErp.getPais() })
      .subscribe(async (res: any) => {
         this.detraccionList = res.body.response.data;  
        },
          (error) => {
            console.log(error);
          })
  }

  getTipoServicio() { 
    this.subRef$ = this.facturacionService.getAllByIdDad<DocumentoEntity[]>(12,'2233') //Listo
      .subscribe((res: any) => {
        this.servicioList = res.body.response.data; 
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

  async getListadoTipoCambio() { 
    let fecha = this.datepipe.transform(this.formulario.value.fechaComprobante, 'yyyy-MM-dd');
    this.subRef$ = this.facturacionService.getByIdTipoCambio<TipoCambioEntity[]>({ opcion: 17, fecha: fecha, codigoPais: this.securityErp.getPais() })
      .subscribe((res: any) => { 
        this.formulario.get('codigoTipoCambio').setValue(res.body.response.data[0].codigoTipoCambio);
        this.formularioLineas.get('descripcionTipoCambio').setValue(res.body.response.data[0].precioVenta);
        this.tipoCambioList.precioVenta = (res.body.response.data[0].precioVenta);
        },
          (error) => { 
            console.log(error);
          })
  }

  async getComprobanteLineasDetalle(id: number, tipo: string) { 
    // Servicio
    if(tipo == 'S') {
      this.subRef$ = this.facturacionService.getMultiAsyncDetalle<any>(19, id, this.securityErp.getEmpresa())
      .subscribe(async res => {
        this.listaDetalleComprobante = res.body.response.data;
        await this.rellenarListaServicios(this.listaDetalleComprobante);
      })
    }
    // Materiales
    else {
      this.subRef$ = this.facturacionService.getMultiAsyncDetalleMateriales<any>(23, id)
      .subscribe(async res => {  
        this.listaDetalleComprobante = res.body.response.data;
        await this.rellenarListaMateriales(this.listaDetalleComprobante);
      })
     }
    
  }

  async getListadoImpuesto() { 
    this.subRef$ = this.facturacionService.getAllImpuesto<ImpuestoEntity[]>({ opcion: 16, tipoElemeneto: 1287, codigoPais: this.securityErp.getPais() })
      .subscribe((res: any) => {
        this.formularioLineas.get('descripcionCorta').setValue((res.body.response.data[0].descripcionCorta + ' - ' + (res.body.response.data[0].importePorcenje).toString()));
        this.impuesto.codigoImpuesto = (res.body.response.data[0].codigoImpuesto);
        this.impuesto.importePorcenje = (res.body.response.data[0].importePorcenje);
        this.impuesto.descripcionCorta = (res.body.response.data[0].descripcionCorta);
        this.botonNuevo = false; 
      },
        (error) => {
          console.log(error);
        })
  }


  getListadoAfectacion() { 
    this.subRef$ = this.facturacionService.getAllAfectacion<any[]>({opcion: 14, tipoElemeneto: 1292, codigoPais: this.securityErp.getPais()})
      .subscribe((res: any) => {
        this.afectacionList = res.body.response.data; 
      },
        (error) => {
          console.log(error);
          this.spinner.hide();
        })
  }

  //#endregion

  ngOnDestroy(): void {
    if (this.subRef$) { this.subRef$.unsubscribe(); }
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


 
  validarAbono(): boolean { 
    return this.codigoEstado === 2238 ? true : false;
  }

  fnFechaAbono(){
    const dialogRef = this.dialog.open(DialogFechaPagoComponent, {
      width: '376px',
      height: '205px',
      data: {
        'comprobanteId': this.idComprobante,
        'fecha': this.formulario.value.fechaComprobante
      }
    });    
    
    dialogRef.afterClosed().subscribe(result => { 
      if(!result){
        return;
      } 
      this.formulario.get('fechapago').setValue(result.fecha);  
    }); 
  }

  private async validacionText(valor) {
    
    var flag: boolean = false; 
    if(valor.length != 0){
      flag =true;
    } 
    return flag; 
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

  

}

