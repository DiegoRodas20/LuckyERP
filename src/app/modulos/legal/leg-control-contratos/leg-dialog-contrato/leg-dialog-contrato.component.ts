import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { LegControlContratosAgregarComponent } from '../../components/leg-control-contratos-agregar/leg-control-contratos-agregar.component';
import { LegalService } from '../../leg-services/legal.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSort } from '@angular/material/sort';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';

@Component({
  selector: 'app-leg-dialog-contrato',
  templateUrl: './leg-dialog-contrato.component.html',
  styleUrls: ['./leg-dialog-contrato.component.css', '../leg-control-contratos.component.css'],
  animations: [asistenciapAnimations]
})
export class LegDialogContratoComponent implements OnInit {

  titulo: string;
  displayedColumns: string[] = ['opcion','sTitulo', 'dFechaInicio', 'dFechaFin','bitAddenda','bitVigente'];
  dataSource: any;
  nIdTipoContrato: number;
  listaCliente: any[];
  listaContratos: any[];
  listaEmpresa: any[];
  formContrato: FormGroup;
  sPais: string;
  nIdEmpresa: number;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'add', tool: 'Crear Contrato', state: true, color: "secondary"},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LegDialogContratoComponent>,
    private legalService: LegalService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.crearFormulario();
     }

  async ngOnInit() {
    this.sPais = localStorage.getItem('Pais');
    this.nIdEmpresa = Number.parseInt(localStorage.getItem('Empresa'));

    this.titulo = this.data.titulo;
    this.nIdTipoContrato = this.data.nIdTipoContrato;

    await this.obtenerClienteProveedor();
    await this.obtenerEmpresa(this.sPais);

    const clienteId = this.data.nIdCliente;
    this.inicializarEmpresa(this.nIdEmpresa);

    if(clienteId !== 0) {
      this.inicializarContrato(clienteId);
    }

    this.onToggleFab(1,-1);
  }

  //#region Botones

  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
  }

  async clickFab(index: number) {
    switch (index) {
      case 0:
        this.agregarControlContrato() // Crear contrato
        break;
      default:
        break;
    }
  }
  //#endregion

  inicializarContrato(clienteId) {
    this.formContrato.controls.cliente.setValue(clienteId);
    this.cambioCliente(clienteId);
  }

  inicializarEmpresa(nIdEmpresa: number) {
    this.formContrato.controls.empresa.setValue(nIdEmpresa);
  }

  crearFormulario() {
    this.formContrato = this.fb.group({
      'cliente': [null, Validators.compose([Validators.required])],
      'empresa': [null, Validators.compose([Validators.required])]
    })
  }

  llenarTabla(listaContrato) {
    this.dataSource = new MatTableDataSource(listaContrato);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  async obtenerClienteProveedor() {
    this.listaCliente = await this.legalService.obtenerInformacionLegal(2,`${this.sPais}`);
  }

  async obtenerContrato(clienteId,nIdEmpresa){
    this.listaContratos = await this.legalService.obtenerInformacionLegal(3,`${clienteId}|${this.nIdTipoContrato}|${nIdEmpresa}`);

  }

  async obtenerEmpresa(idPais: string) {
    this.listaEmpresa = await this.legalService.obtenerInformacionLegal(5,`${idPais}`)
  }

  async cambioCliente(clienteId) {
    this.spinner.show();
    const nIdEmpresa = this.formContrato.get('empresa').value;
    await this.obtenerContrato(clienteId,nIdEmpresa);
    this.llenarTabla(this.listaContratos);
    this.spinner.hide();
  }

  async cambioEmpresa(nIdEmpresa) {
    this.spinner.show();
    const clienteId = this.formContrato.get('cliente').value;
    await this.obtenerContrato(clienteId,nIdEmpresa);
    this.llenarTabla(this.listaContratos);
    this.spinner.hide();
  }

  agregarControlContrato() {
    if(this.formContrato.valid){
      const idCliente = this.formContrato.get('cliente').value;
      const idEmpresa = this.formContrato.get('empresa').value;
      const nombreCliente = this.listaCliente.filter(item => item.nId === idCliente)[0].sDescripcion;
      let body = {
        'titulo': `${nombreCliente} - ${this.titulo}`,
        'nIdTipoContrato': this.nIdTipoContrato,
        'nIdCliente': idCliente,
        'tipo': 1,  // 2 Es visualizar,
        'contrato': '',
        'idCliente': idCliente,
        'empresaId': idEmpresa
      };
      this.dialogRef.close(body);
    }
  }

  verDetalle(contrato) {
    const idCliente = this.formContrato.get('cliente').value;
    const idEmpresa = this.formContrato.get('empresa').value;
    const nombreCliente = this.listaCliente.filter(item => item.nId === idCliente)[0].sDescripcion;
    let body = {
      'titulo': `${nombreCliente} - ${this.titulo}`,
      'nIdTipoContrato': this.nIdTipoContrato,
      'nIdCliente': idCliente,
      'tipo': 2,  // 2 Es visualizar,
      'contrato': contrato,
      'idCliente': idCliente,
      'empresaId': idEmpresa
    }
    this.dialogRef.close(body);
  }



}
