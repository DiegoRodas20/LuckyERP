import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { IDocumentTypeCreditNotes, IListCreditNotes, IYearCreditNotes } from '../../../repository/models/notas-credito/creditNotesEntity';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FacturacionService } from '../../../repository/services/facturacion.service';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/shared/services/AppDateAdapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

@Component({
  selector: 'app-notas-credito-list',
  templateUrl: './notas-credito-list.component.html',
  styleUrls: ['./notas-credito-list.component.css'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ],
  animations: [asistenciapAnimations],
})
export class NotasCreditoListComponent implements OnInit {

  listYear: IYearCreditNotes[];
  year = new FormControl();
  nIdTipoDocumento = new FormControl();
  txtFilter = new FormControl();
  dFechaInicio = new FormControl();
  dFechaFin = new FormControl();

  sFechaInicio: string = '';
  sFechaFin: string = '';
  listDocumentType: IDocumentTypeCreditNotes[];

  //Table
  displayedColumns: string[] = ['codigoNotaCredito', 'tipoDocumento', 'serie', 'numero', 'fecha', 'fechaRegistro', 'nombreCliente', 'tipo', 'total', 'estado'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  listCreditNotes: MatTableDataSource<IListCreditNotes>;

  //Botones
  abLista = [];
  tsLista = 'active';  // Inicia la lista botonera
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nueva Nota de Crédito' },
  ];


  constructor(private router: Router, private facturacionService: FacturacionService, private spinner: NgxSpinnerService, private fb: FormBuilder) { }

  async ngOnInit(): Promise<void> {
    this.onToggleFab(1, -1);
    await this.getListYear();
    await this.fnCreateSelectNotes();
    this.fnGetListCreditNotes();
  }

  //#region Filtro Busqueda
  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    this.listCreditNotes.filter = (filterValue.trim().toLowerCase());
    if (this.listCreditNotes.paginator) {
      this.listCreditNotes.paginator.firstPage();
    }
  }
  //#endregion


  //#region Botones
  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnAddCreditNotes();
        break;
      default:
        break;
    }
  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;

  }
  //#endregion


  //#region Ir a nuevo
  fnAddCreditNotes() {
    this.router.navigate(['tfi/facturacion/fact-notas/add']);
  }
  //#endregion


  //#region Ir a editar
  fnEditCreditNotes(idNotaCredito) {
    this.router.navigate(['tfi/facturacion/fact-notas/edit/' + idNotaCredito]);
  }
  //#endregion


  //#region Cambiar Fecha
  fnDateChange(event, sFecha) {

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

    if (sFecha == 'inicio') {
      this.sFechaInicio = sAnio + '-' + sMes + '-' + sDia
    }
    else if (sFecha == 'fin') {
      this.sFechaFin = sAnio + '-' + sMes + '-' + sDia
    }

  }
  //#endregion


  //#region Formatear Date a yyyy-mm-dd
  fnDateFormat(dateInput) {

    let sDia, sMes, sAnio, sFecha
    if (dateInput.getDate() < 10) {
      sDia = "0" + dateInput.getDate()
    } else {
      sDia = dateInput.getDate()
    }
    if ((dateInput.getMonth() + 1) < 10) {
      sMes = "0" + (dateInput.getMonth() + 1)
    }
    else {
      sMes = dateInput.getMonth() + 1
    }
    sAnio = dateInput.getFullYear()

    sFecha = sAnio + '-' + sMes + '-' + sDia

    return sFecha

  }
  //#endregion


  //#region Limpiar Filtro
  fnClearFilter() {
    //this.txtFilter.setValue('');
    this.ngOnInit()
  };
  //#endregion


  //#region Limpiar Tipo de Documento
  fnClearTypeDoc() {
    this.nIdTipoDocumento.setValue('');    
  };
  //#endregion

  //#region Obtener Años
  async getListYear() {

    const resp: any = await this.facturacionService.getAllYearInCreditNotes<IYearCreditNotes[]>();
    this.listYear = resp.body.response.data;
    this.year.setValue(this.listYear[0].year);
   

  }
  //#endregion


  //#region Crear Select Tipos de Nota
  fnCreateSelectNotes() {
    this.listDocumentType = [
      { codigoTipoDoc: 2115, nombreTipoDoc: 'Nota de Crédito' },
      { codigoTipoDoc: 2116, nombreTipoDoc: 'Nota de Débito' }
    ];
    this.nIdTipoDocumento.setValue('')
  }
  //#endregion


  //#region Obtener Grilla de Nota de Credito
  async fnGetListCreditNotes() {
    this.spinner.show();
    let lCreditNotes = []
    let year, dFechaInicio, dFechaFin, nIdTipoDocumento;

    year = this.year.value;
    nIdTipoDocumento = this.nIdTipoDocumento.value;
    dFechaInicio = this.sFechaInicio;
    dFechaFin = this.sFechaFin;
    

    if (dFechaInicio == '') {
      dFechaInicio = '1970-01-01';
    }
    if (dFechaFin == '') {
      dFechaFin = this.fnDateFormat(new Date());
    }
    if(this.nIdTipoDocumento.value=='' || this.nIdTipoDocumento.value==null){
      nIdTipoDocumento=0;
    }

    const resp: any = await this.facturacionService.getAllListCreditNotes<IListCreditNotes[]>(year, nIdTipoDocumento, dFechaInicio, dFechaFin);
    lCreditNotes = resp.body.response.data;
 
    this.listCreditNotes = new MatTableDataSource(lCreditNotes);
    this.listCreditNotes.paginator = this.paginator;
    this.listCreditNotes.sort = this.sort;

    this.spinner.hide();
  }
  //#endregion


  //#region Limpiar Fechas
  async fnClearDate(tipoFecha) {
    //1:Inicio - 2:Fin
    if (tipoFecha == 1) {
      this.dFechaInicio.setValue('');
      this.sFechaInicio = '';
    }
    else if (tipoFecha == 2) {
      this.dFechaFin.setValue('');
      this.sFechaFin = '';
    }
  }
  //#endregion

}
