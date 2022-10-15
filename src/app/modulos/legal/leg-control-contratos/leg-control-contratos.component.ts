import { Component, OnInit, ViewChild } from '@angular/core';
import { LegalService } from '../leg-services/legal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { LegDialogContratoComponent } from './leg-dialog-contrato/leg-dialog-contrato.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-leg-control-contratos',
  templateUrl: './leg-control-contratos.component.html',
  styleUrls: ['./leg-control-contratos.component.css']
})
export class LegControlContratosComponent implements OnInit {
  displayedColumns: string[] = ['cod', 'sTipoContrato', 'opcion'];
  dataSource: any;
  listaTipoContrato: any[];
  tipoVista: number = 1; // Tipo 1 Control Contratos; Tipo 2 Vista detallada contrato
  tipoContrato: number;
  idClienteDialog: number = 0;
  // Data
  dataTitulo: string;
  dataNIdTipoContrato: number;
  dataNIdCliente: number;
  dataNIdContratoCliente: number;
  dataTipo: number;
  dataContrato: any;
  dataNIdEmpresa: number;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  constructor(private dialog: MatDialog,private legalService: LegalService, private spinner: NgxSpinnerService) { }

  async ngOnInit() {
    this.spinner.show();
    await this.obtenerTipoContratos();
    this.llenarTablaTipoContrato(this.listaTipoContrato);
    this.spinner.hide();
  }



  llenarTablaTipoContrato(listaContrato) {
    this.dataSource = new MatTableDataSource(listaContrato);
    this.dataSource.paginator = this.paginator;
  }

  // Aquí mostraremos el dialog de los contratos por el tipo de contrato y empresa
  verDetalleTipoContrato(tipoContrato: any,nIdCliente) {

    this.tipoContrato = tipoContrato.nId;
    const dialogRef = this.dialog.open(LegDialogContratoComponent, {
      width: '99%',
      data: {
        'titulo': tipoContrato.sTipoContrato,
        'nIdTipoContrato': tipoContrato.nId,
        'nIdCliente': nIdCliente
      },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async result => {
      if(result) {
        // Aquí declaramos todas las variables que se enviarán al componente los input, estas variables se envían del componente de leg-dialog-contrato al cerrarlo
        this.dataTitulo = result.titulo;
        this.dataNIdTipoContrato =  result.nIdTipoContrato;
        this.dataNIdCliente = result.nIdCliente;
        this.dataNIdContratoCliente = result.contrato.nIdContratoCliente;
        this.dataTipo = result.tipo;
        this.dataContrato = result.contrato;
        this.dataNIdEmpresa = result.empresaId;
        this.idClienteDialog = result.idCliente;
        this.tipoVista = 2;
      }
    })
  }

  async obtenerTipoContratos() {
    this.listaTipoContrato = await this.legalService.obtenerInformacionLegal(1,'');
  }

  cambiarVista(event) {
    if(event === 1) {
      const tipoContrato = this.listaTipoContrato.filter(item => item.nId === this.tipoContrato)[0];
      this.tipoVista = 1;
      const nIdCliente = this.idClienteDialog;
      this.verDetalleTipoContrato(tipoContrato,nIdCliente);
    }
  }



}
