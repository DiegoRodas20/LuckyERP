import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { SecurityErp } from 'src/app/modulos/AAHelpers/securityErp.Entity';
import Swal from 'sweetalert2';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  ISerieCreditNotes, ITableCreditNotes, IDocumentCreditNotes, ISerieDocCreditNotes, INumberDocCreditNotes,
  ISubTypeCreditNotes, IComprobanteCreditNotes, IMaterialCreditNotes, IServiceCreditNotes, IPresupuestoCreditNotes,
  IArticleCreditNotes, IMotiveCreditNotes, IStateCreditNotes, ILinesCreditNotesDTO, ICreditNotesDTO, ICabeceraCreditNotesDTO,
  IDocumentTypeCreditNotes
} from '../../../repository/models/notas-credito/creditNotesEntity';
import { FacturacionService } from '../../../repository/services/facturacion.service';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/services/AppDateAdapter';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-notas-credito-add',
  templateUrl: './notas-credito-add.component.html',
  styleUrls: ['./notas-credito-add.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ],
  animations: [asistenciapAnimations]
})
export class NotasCreditoAddComponent implements OnInit {

  nIdUsuario: number;
  nIdEmpresa: number;
  sPais: string;
  securityErp = new SecurityErp();
  nImpuesto: number;
  nIdTipoDocumento: number;
  sTitulo: string;


  listDocumentType: IDocumentTypeCreditNotes[];
  listSerie: ISerieCreditNotes[];
  listDocument: IDocumentCreditNotes[];
  listSerieDocument: ISerieDocCreditNotes[];
  listNumberDocument: INumberDocCreditNotes[];
  listSubType: ISubTypeCreditNotes[];
  listMotive: IMotiveCreditNotes[];
  listState: IStateCreditNotes[];
  listPresupuesto: IPresupuestoCreditNotes[] = [];
  listArticle: IArticleCreditNotes[] = [];

  listInfoComprobante: IComprobanteCreditNotes[];
  listLinesService: IServiceCreditNotes[] = [];
  listLinesMaterial: IMaterialCreditNotes[] = [];

  listLinesSelected: ILinesCreditNotesDTO[] = [];

  formCreditNotes: FormGroup;
  formDetails: FormGroup;
  formLines: FormGroup;

  dataLines: ITableCreditNotes[]
  dataLinesServices: IServiceCreditNotes[];
  dataLinesMaterial: IMaterialCreditNotes[];
  rows: FormArray = this.fb.array([]);


  sParamTypeSerMat: string;
  nParamSubType: number;

  dTodayDate = new Date();
  dMinDate: any = '1975-1-1';
  dDocFecha: any;
  bShowTable: boolean = false;

  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  //Material Table
  detCreditNotesTableData: any;//MatTableDataSource<ITableCreditNotes>;
  @ViewChild(MatPaginator) detCreditNotesPaginator: MatPaginator;
  @ViewChild(MatSort) detCreditNotesSort: MatSort;
  DetCreditNotesColumns: string[];




  constructor(
    private fb: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService,
    private facturacionService: FacturacionService
  ) {
    this.nImpuesto = 18

    this.formCreditNotes = this.fb.group({
      tipoDocumento: [''],
      sucursal: [{ value: '', disabled: true }],

      serie: ['', [Validators.required]],
      nombreSerie: [''],

      nro: [{ value: 'Automático', disabled: true }],

      documentoAfectado: ['', [Validators.required]],
      nombreDocAfectado: [''],

      documentoSerie: ['', [Validators.required]],
      nombreSerieDoc: [''],

      documentoNumero: ['', [Validators.required]],
      nombreNumeroDoc: [''],

      codigoTipoSerMat: ['', [Validators.required]],
      tipoSerMat: [{ value: '', disabled: true }],

      codigoTipoCambio: ['', [Validators.required]],
      tipoCambio: [{ value: '', disabled: true }],

      fechaNotaCredito: ['', [Validators.required]],

      codigoMoneda: ['', [Validators.required]],
      moneda: [{ value: '', disabled: true }],

      codigoTipoAfectacion: [{ value: '', disabled: true }, [Validators.required]],
      nombreTipoAfectacion: [{ value: '', disabled: true }],

      subTipoNC: ['', [Validators.required]],

      psOserv: [{ value: '', disabled: true }],
      aceptacion: [{ value: '', disabled: true }],
      motivo: ['', [Validators.required]],
      estado: [{ value: 'Incompleto', disabled: true }],
      glosa: [''],
      observacion1: [{ value: '', disabled: true }],
      observacion2: [{ value: '', disabled: true }],

    });

    this.formDetails = this.fb.group({
      descripcionTipoDocumento: [{ value: '', disabled: true }],
      descripcionSucursal: [{ value: '', disabled: true }],
      descripcionSerie: [{ value: '', disabled: true }, Validators.required],
      descripcionNumero: [{ value: 'Automático', disabled: true }, Validators.required],
      descripcionMoneda: [{ value: '', disabled: true }, Validators.required],
      descripcionTipoCambio: [{ value: '', disabled: true }, Validators.required],
      descripcionTipoSerMat: [{ value: '', disabled: true }],

      totalAniadido: [{ value: '', disabled: true }, , Validators.required],
      subTotal: [{ value: '', disabled: true }, , Validators.required],
      impuesto: [{ value: '', disabled: true }, , Validators.required],
      totalFinal: [{ value: '', disabled: true }, , Validators.required],
    });

    //this.fnCreateFormLines();
  }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1, -1);//Abrir botonera

    this.fnCreateSelectNotes();
    await this.fnGetMainDataUser();

    this.spinner.show();

    this.fnGetSucursal()
    this.fnGetDocuments();
    await this.fnGetSubType();

    this.spinner.hide();

  }


  //#region Crear Select Tipos de Nota
  fnCreateSelectNotes() {
    this.listDocumentType = [
      { codigoTipoDoc: 2115, nombreTipoDoc: 'NC' },
      { codigoTipoDoc: 2116, nombreTipoDoc: 'ND' }
    ];
  }
  //#endregion


  //#region Asignar Tipo de Documento(General)
  async fnSetDocumentType(value) {
    this.nIdTipoDocumento = value;
    if (value == 2115) {
      this.sTitulo = 'de Crédito'
      this.formDetails.get("descripcionTipoDocumento").setValue('Nota de Crédito')
    }
    else if (value == 2116) {
      this.sTitulo = 'de Débito'
      this.formDetails.get("descripcionTipoDocumento").setValue('Nota de Débito')
    }

    this.fnGetSeries();
    this.fnGetMotive();
  }
  //#endregion


  //#region Crear Formulario Lineas
  async fnCreateFormLines() {
    this.formLines = this.fb.group({
      codigoComprobanteDet: '',
      codigoPresupuesto: '',
      totalPresupuesto: [{ value: '', disabled: true }],
      cantidadACuenta: [{ value: '', disabled: true }],
      totalAniadido: [{ value: '', disabled: true }],

      codigoArticulo: '',
      detalleArticulo: [{ value: '', disabled: true }],
      nombreUnidadMedida: [{ value: '', disabled: true }],
      cantidad: '',
      precioUnitario: [{ value: '', disabled: true }],

      subTotal: '',
      impuesto: [{ value: '', disabled: true }],
      total: [{ value: '', disabled: true }],

    });

  }
  //#endregion


  //#region Salir
  fnExit() {
    this.router.navigate(['tfi/facturacion/fact-notas/list']);
  }
  //#endregion


  //#region Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }
  //#endregion


  //#region Obtener Datos del Usuario
  async fnGetMainDataUser() {
    this.sPais = this.securityErp.getPais();
    this.nIdEmpresa = parseInt(this.securityErp.getEmpresa());
    this.nIdUsuario = parseInt(this.securityErp.getUsuarioId());
  }
  //#endregion


  //#region Guardar
  async fnSave() {
    var resp = await Swal.fire({
      title: '¿Desea Guardar la Nota de Crédito?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    })

    if (!resp.isConfirmed) {
      return;
    }

    //Obtener los parametros

    if (this.formCreditNotes.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Ingrese los campos faltantes.',
      });
      this.formCreditNotes.markAllAsTouched();
      return;
    }

    let nTotalPptos;
    //Si es Total
    if (this.nParamSubType == 2536) {
      this.fnConfirmLines();
      nTotalPptos = this.listLinesSelected.length;

      if (this.listLinesSelected.length == 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Ingrese al menos un presupuesto/artículo.',
        });
        return;
      }
    }

    //Si es Parcial
    else if (this.nParamSubType == 2535) {
      if (await this.fnConfirmLinesParcial() == false) {
        return;
      }
      nTotalPptos = this.dataLines.length

      if (this.dataLines.length == 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Ingrese al menos un presupuesto/artículo.',
        });
        return;
      }
    }


    var nTotalAniadidos = (this.formDetails.get("totalAniadido").value == '') ? 0 : this.formDetails.get("totalAniadido").value;
    let nIdTipoSerMat = this.formCreditNotes.get("codigoTipoSerMat").value;

    let datos = this.formCreditNotes.value;


    let modelCabecera: ICabeceraCreditNotesDTO = {
      nIdNotaCredito: 0,
      nIdUsuario: this.nIdUsuario,
      sPais: this.sPais,
      nIdEmpresa: this.nIdEmpresa,
      sSucursal: this.formCreditNotes.get("sucursal").value,
      nIdTipoDocumento: this.nIdTipoDocumento,
      nIdSerie: datos.serie,
      sNombreSerie: datos.nombreSerie,
      sDocSerie: datos.nombreSerieDoc,
      sDocNumero: this.formCreditNotes.get("nombreNumeroDoc").value,
      dDocFecha: this.dDocFecha,
      sGlosa: this.formCreditNotes.get("glosa").value,
      nSubTipoNC: datos.subTipoNC,
      nRefIdComprobante: datos.documentoNumero,
      nIdMotivo: datos.motivo,
      nIdTipoSerMat: nIdTipoSerMat
    }

    let modelDetalle = this.listLinesSelected;
    let modelDetalleParcial = this.dataLines;

    let model: ICreditNotesDTO = {
      ...modelCabecera,
      nTotalPptos: nTotalPptos,
      nTotalAñadidos: nTotalAniadidos,
      nTotalValorVenta: this.formDetails.get("subTotal").value,
      nImpTotal: this.formDetails.get("impuesto").value,
      nTotalFinal: this.formDetails.get("totalFinal").value,
      detalleNotaCredito: modelDetalle,
      detalleNotaCreditoParcial: modelDetalleParcial

    }

    try {

      let result = await this.facturacionService.InsertTransaction(model);

      if (result == undefined) {
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
        });
        return;
      }

      if (!result.success) {
        let mensaje = result.errors.map(item => {
          return item.message
        })
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: mensaje.join(', '),
        });
        return;
      }

      let nIdNotaCredito = result.response.data[0].nIdNotaCredito

      Swal.fire({
        icon: 'success',
        title: ('Correcto'),
        text: 'Se guardo el registro',
        timer: 1500
      }).then(() => {
        this.router.navigate([`tfi/facturacion/fact-notas/edit/${nIdNotaCredito}`]);
      });


    }
    catch (err) {
      console.log(err);
    }

  }
  //#endregion


  //#region Obtener Nombre de Serie
  async fnSetSerieFirst(event) {

    this.listSerie.forEach(element => {
      if (event.value == element.codigoSerie) {
        this.formCreditNotes.get("nombreSerie").setValue(element.nombreSerie)
      }
    });

  }
  //#endregion


  //#region Listar Series Fila 1
  async fnGetSeries() {
    this.spinner.show();
    const resp: any = await this.facturacionService.getSerieCreditNotes<ISerieCreditNotes[]>(this.nIdEmpresa, this.nIdTipoDocumento);
    this.listSerie = resp.body.response.data;

    this.spinner.hide();
  }
  //#endregion


  //#region Sucursal
  async fnGetSucursal() {
    if (this.sPais == '218') {
      this.formCreditNotes.get("sucursal").setValue("001")
      this.formDetails.get("descripcionSucursal").setValue("001")
    }
    else {
      this.formCreditNotes.get("sucursal").setValue("No aplica")
      this.formDetails.get("descripcionSucursal").setValue("No aplica")
    }
  }
  //#endregion


  //#region Listar Documentos Afectados
  async fnGetDocuments() {

    const resp: any = await this.facturacionService.getDocumentsCreditNotes<IDocumentCreditNotes[]>();
    this.listDocument = resp.body.response.data;

  }
  //#endregion


  //#region Listar Serie de Documentos Afectados
  async fnGetSerieDocument() {
    this.spinner.show();
    let nIdTipoDocumentoAfect: number;
    nIdTipoDocumentoAfect = this.formCreditNotes.get("documentoAfectado").value;

    const resp: any = await this.facturacionService.getSerieDocumentCreditNotes<ISerieDocCreditNotes[]>(this.nIdEmpresa, nIdTipoDocumentoAfect);
    this.listSerieDocument = resp.body.response.data;

    this.spinner.hide();
  }
  //#endregion


  //#region Listar Numero de Documentos Afectados
  async fnGetNumberDocument() {
    this.spinner.show();
    let nIdTipoDocumentoAfect: number, nIdSerie: number;
    nIdTipoDocumentoAfect = this.formCreditNotes.get("documentoAfectado").value;
    nIdSerie = this.formCreditNotes.get("documentoSerie").value;

    const resp: any = await this.facturacionService.getNumberDocumentCreditNotes<INumberDocCreditNotes[]>(this.nIdEmpresa, nIdTipoDocumentoAfect, nIdSerie);
    this.listNumberDocument = resp.body.response.data;

    this.spinner.hide();
  }
  //#endregion


  //#region Listar Sub Tipos
  async fnGetSubType() {

    const resp: any = await this.facturacionService.getSubTypeCreditNotes<ISubTypeCreditNotes[]>();
    this.listSubType = resp.body.response.data;

  }
  //#endregion


  //#region Listar Motivos
  async fnGetMotive() {
    this.spinner.show();

    const resp: any = await this.facturacionService.getMotiveCreditNotes<IMotiveCreditNotes[]>(this.nIdTipoDocumento);
    this.listMotive = resp.body.response.data;

    this.spinner.hide();
  }
  //#endregion


  //#region Obtener Información del Comprobante
  async fnGetComprobante() {
    this.spinner.show();
    let nIdComprobante = this.formCreditNotes.get("documentoNumero").value;

    const resp: any = await this.facturacionService.getComprobanteCreditNotes<IComprobanteCreditNotes[]>(nIdComprobante);
    this.listInfoComprobante = resp.body.response.data;
    /* console.log('Info Comprobante')
    console.log(this.listInfoComprobante) */

    /* if (this.listInfoComprobante[0].bExistencia > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El documento ya tiene una nota de credito TOTAL.',
      });
      this.formCreditNotes.get("documentoNumero").setValue("");
      this.fnClearCombrobante();
      this.spinner.hide();
      return;
    }
    else { */
    this.fnGetInfoComprobante(this.listInfoComprobante[0]);
    this.fnGetFormDetails(this.listInfoComprobante[0]);
    //}

    this.spinner.hide();
  }

  async fnGetInfoComprobante(listInfo) {
    let sTipoSerMat;
    this.bShowTable = false;

    this.sParamTypeSerMat = listInfo.parametroTipoSerMat
    sTipoSerMat = this.sParamTypeSerMat + ' - ' + listInfo.nombreTipoSerMat

    this.formCreditNotes.get("codigoTipoSerMat").setValue(listInfo.codigoTipoSerMat)
    this.formCreditNotes.get("tipoSerMat").setValue(sTipoSerMat)
    this.formCreditNotes.get("codigoTipoCambio").setValue(listInfo.codigoTipoCambio)
    this.formCreditNotes.get("tipoCambio").setValue(listInfo.tipoCambio)
    this.formCreditNotes.get("codigoMoneda").setValue(listInfo.codigoMoneda)
    this.formCreditNotes.get("moneda").setValue(listInfo.moneda)
    this.formCreditNotes.get("codigoTipoAfectacion").setValue(listInfo.codigoTipoAfectacion)
    this.formCreditNotes.get("nombreTipoAfectacion").setValue(listInfo.nombreTipoAfectacion)
    this.formCreditNotes.get("psOserv").setValue(listInfo.nombreOrdenServ)
    this.formCreditNotes.get("aceptacion").setValue(listInfo.nombreAceptacionServ)
    this.formCreditNotes.get("observacion1").setValue(listInfo.observacion1)
    this.formCreditNotes.get("observacion2").setValue(listInfo.observacion2)


    this.dMinDate = listInfo.fechaDocumento;

    this.fnSetValuesDocument();
    await this.fnGetLinesComprobante();

    if (this.formCreditNotes.get("subTipoNC").value != '') {

      this.fnSetSubType(this.formCreditNotes.get("subTipoNC").value);

    }

  }

  //#endregion


  //#region Obtener Lineas de Comprobante
  async fnGetLinesComprobante() {
    this.spinner.show();
    let nIdComprobante = this.formCreditNotes.get("documentoNumero").value;
    let nIdTipoSerMat = this.formCreditNotes.get("codigoTipoSerMat").value;


    //2234: Servicios | 2235: Materiales
    if (nIdTipoSerMat == 2234) {
      const resp: any = await this.facturacionService.getLinesComprobanteCreditNotes<IServiceCreditNotes[]>(nIdComprobante, nIdTipoSerMat);
      this.listLinesService = resp.body.response.data;
    }
    else if (nIdTipoSerMat == 2235) {
      const resp: any = await this.facturacionService.getLinesComprobanteCreditNotes<IMaterialCreditNotes[]>(nIdComprobante, nIdTipoSerMat);
      this.listLinesMaterial = resp.body.response.data;
    }

    this.fnGetGlosa();
    this.spinner.hide();
  }
  //#endregion


  //#region Asignar valores codigo de documento, codigo de serie y codigo de numero
  async fnSetValuesDocument() {
    let codDocumento, codSerie, codNumero;

    codDocumento = this.formCreditNotes.get("documentoAfectado").value;
    codSerie = this.formCreditNotes.get("documentoSerie").value
    codNumero = this.formCreditNotes.get("documentoNumero").value

    this.listDocument.forEach(element => {
      if (codDocumento == element.codigoDocumento) {
        this.formCreditNotes.get("nombreDocAfectado").setValue(element.nombreDocumento)
      }
    });

    this.listSerieDocument.forEach(element => {
      if (codSerie == element.codigoSerieDoc) {
        this.formCreditNotes.get("nombreSerieDoc").setValue(element.nombreSerieDoc)
      }
    });

    this.listNumberDocument.forEach(element => {
      if (codNumero == element.codigoNumeroDoc) {
        this.formCreditNotes.get("nombreNumeroDoc").setValue(element.nombreNumeroDoc)
      }
    });

  }
  //#endregion


  //#region Obtener Glosa
  async fnGetGlosa() {
    let sGlosa, sDocumentoAfectado;
    let sSerie: string, sNumero: string, sUltPpto: string;
    sDocumentoAfectado = this.formCreditNotes.get("nombreDocAfectado").value
    sSerie = this.formCreditNotes.get("nombreSerieDoc").value
    sNumero = this.formCreditNotes.get("nombreNumeroDoc").value
    sUltPpto = ''

    if (this.sParamTypeSerMat == "S") {
      //Calcular Ultimo Presupuesto
      this.listLinesService.forEach(element => {
        sUltPpto = element.nombrePresupuesto
      });

      sGlosa = "Por la Anulación de " + sDocumentoAfectado + ': ' + sSerie + ' - ' + sNumero + ' - ' + sUltPpto
    }
    else {
      sGlosa = "Por la Anulación de " + sDocumentoAfectado + ': ' + sSerie + ' - ' + sNumero
    }


    this.formCreditNotes.get("glosa").setValue(sGlosa)
  }
  //#endregion


  //#region Obtener Datos Página 2
  async fnGetFormDetails(listInfo) {
    let sSerie: string, sTipoSerMat: string;

    sSerie = this.formCreditNotes.get("nombreSerie").value
    sTipoSerMat = this.sParamTypeSerMat + ' - ' + listInfo.nombreTipoSerMat

    this.formDetails.get("descripcionSerie").setValue(sSerie)
    this.formDetails.get("descripcionMoneda").setValue(listInfo.moneda)
    this.formDetails.get("descripcionTipoCambio").setValue(listInfo.tipoCambio)
    this.formDetails.get("descripcionTipoSerMat").setValue(sTipoSerMat)

  }
  //#endregion


  //#region Asignar Subtipo
  async fnSetSubType(value) {
    this.nParamSubType = value;
    this.fnGetLinesTable();
  }
  //#endregion


  //#region Listar Tabla de Lineas
  async fnGetLinesTable() {

    this.bShowTable = true;

    //2535:Parcial | 2536:Total
    if (this.nParamSubType == 2535) {
      if (this.sParamTypeSerMat == "S") {

        this.DetCreditNotesColumns =
          ['codigoComprobanteDet', 'codigoPresupuesto', 'totalPresupuesto', 'cantidadACuenta', 'totalAniadido', 'subTotal', 'impuesto', 'total'];
        this.detCreditNotesTableData = new MatTableDataSource<IServiceCreditNotes>([]);
      }
      else if (this.sParamTypeSerMat == "M") {

        this.DetCreditNotesColumns =
          ['codigoComprobanteDet', 'codigoArticulo', 'detalleArticulo', 'nombreUnidadMedida', 'cantidad', 'precioUnitario', 'subTotal', 'impuesto', 'total'];
        this.detCreditNotesTableData = new MatTableDataSource<IMaterialCreditNotes>([]);
      }
      this.fnGetFirstColumnLine();
      await this.fnGetTotalesParcial()

    }
    else if (this.nParamSubType == 2536) {
      if (this.sParamTypeSerMat == "S") {

        this.DetCreditNotesColumns =
          ['nombrePresupuesto', 'totalPresupuesto', 'cantidadACuenta', 'totalAniadido', 'subTotal', 'impuesto', 'total'];
        this.detCreditNotesTableData = new MatTableDataSource<IServiceCreditNotes>(this.listLinesService);
      }
      else if (this.sParamTypeSerMat == "M") {

        this.DetCreditNotesColumns =
          ['nombreArticulo', 'detalleArticulo', 'nombreUnidadMedida', 'cantidad', 'precioUnitario', 'subTotal', 'impuesto', 'total'];
        this.detCreditNotesTableData = new MatTableDataSource<IMaterialCreditNotes>(this.listLinesMaterial);
      }
      await this.fnGetTotales();
    }

    this.fnCreateFormArray();


  }
  //#endregion


  //#region Listar Presupuesto / Articulo Parcial
  async fnGetFirstColumnLine() {
    this.listPresupuesto = []
    this.listArticle = []
    if (this.sParamTypeSerMat == "S") {
      if (this.listLinesService.length > 0) {
        this.listLinesService.forEach(element => {
          this.listPresupuesto.push(
            {
              codigoPresupuesto: element.codigoPresupuesto,
              nombrePresupuesto: element.nombrePresupuesto,
            });
        });
      }

    }
    else if (this.sParamTypeSerMat == "M") {
      if (this.listLinesMaterial.length > 0) {
        this.listLinesMaterial.forEach(element => {
          this.listArticle.push(
            {
              codigoArticulo: element.codigoArticulo,
              nombreArticulo: element.nombreArticulo,
            });
        });
      }
    }

  }
  //#endregion


  //#region Calcular Totales (Sub Tipo Total)
  async fnGetTotales() {
    let nTotalAniadido: number, nImpuesto: number, nSubTotal: number, nTotal: number;
    nTotalAniadido = nImpuesto = nSubTotal = nTotal = 0

    if (this.detCreditNotesTableData != undefined) {
      this.detCreditNotesTableData.data.forEach(element => {
        nSubTotal = nSubTotal + element.subTotal
        nImpuesto = nImpuesto + element.impuesto
        nTotal = nTotal + element.total
        if (this.sParamTypeSerMat == "S") {
          nTotalAniadido = nTotalAniadido + element.totalAniadido
        }
      });

      this.formDetails.get("subTotal").setValue(nSubTotal);
      this.formDetails.get("impuesto").setValue(nImpuesto);
      this.formDetails.get("totalFinal").setValue(nTotal);
      if (this.sParamTypeSerMat == "S") {
        this.formDetails.get("totalAniadido").setValue(nTotalAniadido);
      }
    }

  }
  //#endregion


  //#region Confirmar Lineas
  async fnConfirmLines() {

    this.listLinesSelected = [];

    this.detCreditNotesTableData.data.forEach(element => {
      this.listLinesSelected.push({
        nIdComprobanteDET: element.codigoComprobanteDet
      });
    });

  }
  //#endregion


  //#region Cambiar Fecha
  fnDateChange(event) {

    let sDia, sMes, sAnio
    if (event.value.getDate() < 10) {
      sDia = "0" + event.value.getDate()
    } else {
      sDia = event.value.getDate()
    }
    if ((event.value.getMonth() + 1) < 10) {
      sMes = "0" + (event.value.getMonth() + 1)
    }
    else {
      sMes = event.value.getMonth() + 1
    }
    sAnio = event.value.getFullYear()

    this.dDocFecha = sAnio + '-' + sMes + '-' + sDia

  }
  //#endregion


  //#region Limpiar Info de Comprobante
  fnClearCombrobante() {
    this.formCreditNotes.get("codigoTipoSerMat").setValue("")
    this.formCreditNotes.get("tipoSerMat").setValue("")
    this.formCreditNotes.get("codigoTipoCambio").setValue("")
    this.formCreditNotes.get("tipoCambio").setValue("")
    this.formCreditNotes.get("codigoMoneda").setValue("")
    this.formCreditNotes.get("moneda").setValue("")
    this.formCreditNotes.get("glosa").setValue("")
    this.formCreditNotes.get("codigoTipoAfectacion").setValue("")
    this.formCreditNotes.get("nombreTipoAfectacion").setValue("")
    this.formCreditNotes.get("psOserv").setValue("")
    this.formCreditNotes.get("aceptacion").setValue("")
    this.formCreditNotes.get("observacion1").setValue("")
    this.formCreditNotes.get("observacion2").setValue("")
    this.formCreditNotes.get("estado").setValue("Incompleto")
    this.formCreditNotes.get("subTipoNC").setValue("");
    this.listLinesService = []
    this.listLinesMaterial = []
  }
  //#endregion


  //#region Crear Form Array
  fnCreateFormArray() {

    if (this.rows.value.length > 0) {
      this.rows = this.fb.array([]);
    }

    this.formLines = this.fb.group({
      lines: this.rows
    });

    if (this.nParamSubType == 2535) {
      this.detCreditNotesTableData = new BehaviorSubject<AbstractControl[]>([]);
    }


  }
  //#endregion


  //#region Insertar Linea
  async fnAddRow(d?: ITableCreditNotes, noUpdate?: boolean) {

    if (await this.fnValidateRow() != false) {
      const row = this.fb.group({
        codigoComprobanteDet: [d && d.codigoComprobanteDet ? d.codigoComprobanteDet : 0, []],
        codigoPresupuesto: [d && d.codigoPresupuesto ? d.codigoPresupuesto : 0, []],
        nombrePresupuesto: [d && d.nombrePresupuesto ? d.nombrePresupuesto : '', []],

        totalPresupuesto: [d && d.totalPresupuesto ? d.totalPresupuesto : 0, []],
        cantidadACuenta: [d && d.cantidadACuenta ? d.cantidadACuenta : 0, []],
        totalAniadido: [d && d.totalAniadido ? d.totalAniadido : 0, []],

        codigoArticulo: [d && d.codigoArticulo ? d.codigoArticulo : 0, []],
        nombreArticulo: [d && d.nombreArticulo ? d.nombreArticulo : '', []],
        detalleArticulo: [d && d.detalleArticulo ? d.detalleArticulo : '', []],
        codigoUnidadMedida: [d && d.codigoUnidadMedida ? d.codigoUnidadMedida : 0, []],
        nombreUnidadMedida: [d && d.nombreUnidadMedida ? d.nombreUnidadMedida : '', []],
        cantidad: [d && d.cantidad ? d.cantidad : 0, []],
        precioUnitario: [d && d.precioUnitario ? d.precioUnitario : 0, []],

        subTotal: [d && d.subTotal ? d.subTotal : "0.00", []],
        impuesto: [d && d.impuesto ? d.impuesto : "0.00", []],
        total: [d && d.total ? d.total : "0.00", []],
      });

      this.rows.push(row);
      if (!noUpdate) {
        this.updateView();
      }
    }

  }

  updateView() {
    this.detCreditNotesTableData.next(this.rows.controls);
  }
  //#endregion


  //#region Eliminar Linea
  deleteView(index) {
    this.rows.removeAt(index);
    this.detCreditNotesTableData.next(this.rows.controls);
  }
  //#endregion


  //#region Obtener Linea de Presupuesto Parcial
  async fnChangePpto(event, index) {

    if ((await this.fnValidateRepeat(event.value)) != false) {
      this.listLinesService.forEach(element => {
        if (event.value == element.codigoPresupuesto) {
          this.rows.controls[index].get("totalPresupuesto").setValue(element.totalPresupuesto.toFixed(4))
          this.rows.controls[index].get("cantidadACuenta").setValue(element.cantidadACuenta.toFixed(4))
          this.rows.controls[index].get("totalAniadido").setValue(element.totalAniadido.toFixed(2))
          this.rows.controls[index].get("subTotal").setValue(element.subTotal.toFixed(2))
          this.rows.controls[index].get("impuesto").setValue(element.impuesto.toFixed(2))
          this.rows.controls[index].get("total").setValue(element.total.toFixed(2))
        }
      });

      this.fnGetTotalesParcial();
    }
  }
  //#endregion


  //#region Obtener Linea de Articulo Parcial
  async fnChangeArticle(event, index) {

    if ((await this.fnValidateRepeat(event.value)) != false) {

      this.listLinesMaterial.forEach(element => {

        if (event.value == element.codigoArticulo) {
          this.rows.controls[index].get("detalleArticulo").setValue(element.detalleArticulo)
          this.rows.controls[index].get("nombreUnidadMedida").setValue(element.nombreUnidadMedida)
          this.rows.controls[index].get("codigoUnidadMedida").setValue(element.codigoUnidadMedida)
          this.rows.controls[index].get("cantidad").setValue(element.cantidad.toFixed(2))
          this.rows.controls[index].get("precioUnitario").setValue(element.precioUnitario.toFixed(4))
          this.rows.controls[index].get("subTotal").setValue(element.subTotal.toFixed(2))
          this.rows.controls[index].get("impuesto").setValue(element.impuesto.toFixed(2))
          this.rows.controls[index].get("total").setValue(element.total.toFixed(2))
        }
      });

      this.fnGetTotalesParcial();
    }
  }
  //#endregion


  //#region Validar Agregar Fila
  async fnValidateRow() {
    let bValido: boolean = true;
    let maxPresupuesto, maxArticle
    let tamanioRow = this.rows.value.length

    //Si aún no completa el anterior
    if (tamanioRow > 0) {

      for (let i = 0; i < this.rows.value.length; i++) {

        if (this.sParamTypeSerMat == 'S') {
          if (this.rows.controls[i].value.codigoPresupuesto == 0 || this.rows.controls[i].value.codigoPresupuesto == null) {
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: `Seleccione un presupuesto en la linea ${i + 1} antes de agregar otro.`,
            });
            bValido = false;
            break;
          }
          else {
            this.rows.controls[i].get("codigoPresupuesto").disable({ onlySelf: true });
            this.rows.controls[i].get("subTotal").disable({ onlySelf: true });
          }
        }

        if (this.sParamTypeSerMat == 'M') {
          if (this.rows.controls[i].value.codigoArticulo == 0 || this.rows.controls[i].value.codigoArticulo == null) {
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: `Seleccione un artículo en la linea ${i + 1} antes de agregar otro.`,
            });
            bValido = false;
            break;
          }
          else {
            this.rows.controls[i].get("codigoArticulo").disable({ onlySelf: true });
            this.rows.controls[i].get("cantidad").disable({ onlySelf: true });
            this.rows.controls[i].get("subTotal").disable({ onlySelf: true });
          }
        }
      }

    }

    //Si intenta agregar una mayor a las posibles

    if (this.sParamTypeSerMat == 'S') {
      maxPresupuesto = this.listLinesService.length
      if ((tamanioRow + 1) > maxPresupuesto) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: `El documento no tiene más presupuestos seleccionables.`,
        });
        bValido = false;
      }
    }

    else if (this.sParamTypeSerMat == 'M') {
      maxArticle = this.listLinesMaterial.length
      if ((tamanioRow + 1) > maxArticle) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: `El documento no tiene más artículos seleccionables.`,
        });
        bValido = false;
      }
    }

    return bValido;

  }
  //#endregion


  //#region Validar Repetición de Articulos/Presupuestos
  async fnValidateRepeat(value) {
    let nombre;
    let bValido: boolean = true;
    if (this.rows.value.length > 1) {

      for (let i = 1; i < this.rows.value.length; i++) {
        //Servicios
        if (this.sParamTypeSerMat == 'S') {
          if (value == this.rows.controls[i - 1].value.codigoPresupuesto) {
            nombre = this.rows.controls[i - 1].value.nombrePresupuesto
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: `El Presupuesto ya se ha seleccionado.`,
            });
            this.rows.controls[i].get("codigoPresupuesto").setValue(0);
            this.fnClearRow(i);
            bValido = false;
            break;
          }
        }

        //Materiales
        if (this.sParamTypeSerMat == 'M') {
          if (value == this.rows.controls[i - 1].value.codigoArticulo) {
            nombre = this.rows.controls[i - 1].value.nombreArticulo
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: `El Artículo ya se ha seleccionado.`,
            });
            this.rows.controls[i].get("codigoArticulo").setValue(0);
            this.fnClearRow(i);
            bValido = false
            break;
          }
        }

      }
    }

    return bValido;
  }
  //#endregion


  //#region Limpiar Datos de una Linea
  fnClearRow(index) {
    this.rows.controls[index].get("totalPresupuesto").setValue(0)
    this.rows.controls[index].get("cantidadACuenta").setValue(0)
    this.rows.controls[index].get("totalAniadido").setValue(0)
    this.rows.controls[index].get("detalleArticulo").setValue('')
    this.rows.controls[index].get("nombreUnidadMedida").setValue('')
    this.rows.controls[index].get("codigoUnidadMedida").setValue(0)
    this.rows.controls[index].get("cantidad").setValue(0)
    this.rows.controls[index].get("precioUnitario").setValue(0)
    this.rows.controls[index].get("subTotal").setValue(0)
    this.rows.controls[index].get("impuesto").setValue(0)
    this.rows.controls[index].get("total").setValue(0)
  }
  //#endregion


  //#region Validar Cantidad
  fnValidateCantidad(index) {
    let cantidadMax;
    let cantidadInput = this.rows.controls[index].get("cantidad").value;
    let codigoArticuloLinea = this.rows.controls[index].get("codigoArticulo").value;

    this.listLinesMaterial.forEach(element => {

      if (codigoArticuloLinea == element.codigoArticulo) {
        cantidadMax = element.cantidad;
      }
    });

    if (cantidadInput > cantidadMax) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'La cantidad ingresada es mayor a la cantidad permitida.',
      });
      this.rows.controls[index].get("cantidad").setValue(cantidadMax.toFixed(2));
      return;
    }

  }
  //#endregion


  //#region Validar SubTotal
  fnValidateSubTotal(index) {
    let subTotalMax, impuesto, total, nACuenta;
    let bValido: boolean = true;
    let subTotalInput = this.rows.controls[index].get("subTotal").value;
    //Servicios
    if (this.sParamTypeSerMat == 'S') {
      let codigoPresupuestoLinea = this.rows.controls[index].get("codigoPresupuesto").value;

      this.listLinesService.forEach(element => {
        if (codigoPresupuestoLinea == element.codigoPresupuesto) {
          subTotalMax = element.subTotal;
          impuesto = element.impuesto;
          total = element.total;
          nACuenta = element.cantidadACuenta;
        }
      });
    }

    //Materiales
    if (this.sParamTypeSerMat == 'M') {
      let codigoArticuloLinea = this.rows.controls[index].get("codigoArticulo").value;

      this.listLinesMaterial.forEach(element => {
        if (codigoArticuloLinea == element.codigoArticulo) {
          subTotalMax = element.subTotal;
          impuesto = element.impuesto;
          total = element.total;
        }
      });
    }


    //Si es menor igual a cero
    if (subTotalInput <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El Sub Total ingresado no puede ser menor igual a 0.',
      });
    }

    //Si es mayor al del presupuesto
    else if (subTotalInput > subTotalMax) {
      bValido = false;
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El Sub Total ingresado es mayor al Sub Total permitido.',
      });
    }


    if (!bValido) {
      this.rows.controls[index].get("subTotal").setValue(subTotalMax.toFixed(2));
      this.rows.controls[index].get("impuesto").setValue(impuesto.toFixed(2));
      this.rows.controls[index].get("total").setValue(total.toFixed(2));

      if (this.sParamTypeSerMat == "S") {
        this.rows.controls[index].get("cantidadACuenta").setValue(nACuenta.toFixed(4));
      }
    }

    this.fnCalculateLineTotal(index);

  }
  //#endregion


  //#region Calcular Impuestos y Totales
  fnCalculateLineTotal(index) {
    let subTotal, impuesto, total;
    let totalPresupuesto, nACuenta

    subTotal = this.rows.controls[index].get("subTotal").value;
    impuesto = (subTotal * this.nImpuesto) / 100
    total = subTotal + impuesto

    totalPresupuesto = this.rows.controls[index].get("totalPresupuesto").value
    nACuenta = (subTotal / totalPresupuesto) * 100

    this.rows.controls[index].get("impuesto").setValue(impuesto.toFixed(2));
    this.rows.controls[index].get("total").setValue(total.toFixed(2));

    if (this.sParamTypeSerMat == "S") {
      this.rows.controls[index].get("cantidadACuenta").setValue(nACuenta.toFixed(4));
    }

    this.fnGetTotalesParcial()
  }
  //#endregion


  //#region Obtener Totales en Parcial
  fnGetTotalesParcial() {
    let nTotalAniadido: number, nImpuesto: number, nSubTotal: number, nTotal: number;
    nTotalAniadido = nImpuesto = nSubTotal = nTotal = 0

    if (this.rows.value.length > 0) {
      for (let i = 0; i < this.rows.value.length; i++) {
        nImpuesto = nImpuesto + parseFloat(this.rows.controls[i].value.impuesto)
        nSubTotal = nSubTotal + parseFloat(this.rows.controls[i].value.subTotal)
        nTotal = nTotal + parseFloat(this.rows.controls[i].value.total)
        if (this.sParamTypeSerMat == "S") {
          nTotalAniadido = nTotalAniadido + parseFloat(this.rows.controls[i].value.totalAniadido)
        }
      }
    }

    this.formDetails.get("subTotal").setValue(nSubTotal);
    this.formDetails.get("impuesto").setValue(nImpuesto);
    this.formDetails.get("totalFinal").setValue(nTotal);
    if (this.sParamTypeSerMat == "S") {
      this.formDetails.get("totalAniadido").setValue(nTotalAniadido);
    }

  }
  //#endregion


  //#region Confirmar Lineas Cuando es Parcial
  async fnConfirmLinesParcial() {
    let bValido: boolean = true;
    this.dataLines = []
    if (this.rows.value.length > 0) {
      for (let i = 0; i < this.rows.value.length; i++) {

        if (this.sParamTypeSerMat == 'S') {
          if (this.rows.controls[i].value.codigoPresupuesto != 0) {
            this.dataLines.push(this.rows.controls[i].value)
          }
          else {
            bValido = false;
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: 'Hay un registro en blanco, por favor verifique',
            });
            break;
          }

        }

        if (this.sParamTypeSerMat == 'M') {
          if (this.rows.controls[i].value.codigoArticulo != 0) {
            this.dataLines.push(this.rows.controls[i].value)
          }
          else {
            bValido = false;
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: 'Hay un registro en blanco, por favor verifique',
            });
            break;
          }

        }

        if (this.rows.controls[i].value.subTotal <= 0) {
          bValido = false;
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'El SubTotal de las líneas debe ser mayor a 0',
          });
        }


      }
    }

    return bValido
  }
  //#endregion



}
