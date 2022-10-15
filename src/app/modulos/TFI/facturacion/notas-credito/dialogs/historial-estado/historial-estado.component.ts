import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FacturacionService } from './../../../../repository/services/facturacion.service';
import { ICreditNotesHistorial } from './../../../../repository/models/notas-credito/creditNotesEntity';

@Component({
  selector: 'app-historial-estado',
  templateUrl: './historial-estado.component.html',
  styleUrls: ['./historial-estado.component.css']
})
export class HistorialEstadoComponent implements OnInit {

  listaHistorial: ICreditNotesHistorial[] = [];

  nIdNotaCredito: any;

  displayedColumns: string[] = ['usuario', 'estado', 'fecha', 'mensaje'];
  dataSource = new MatTableDataSource<ICreditNotesHistorial>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;


  constructor(
    private _facturacionService: FacturacionService,
    public dialogRef: MatDialogRef<HistorialEstadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  async ngOnInit() {
    this.nIdNotaCredito = this.data.nIdNotaCredito;
    //console.log('Nota Credito ID', this.nIdNotaCredito);

    await this.fnGetHistorialEstado(this.nIdNotaCredito);
    this.fnSetTableHistorial(this.listaHistorial);
  }

  //#region Obtener Historial Estado
  async fnGetHistorialEstado(nIdNotaCredito: number) {
    const resp: any = await this._facturacionService.getHistorialCreditNotes<ICreditNotesHistorial[]>(nIdNotaCredito);
    this.listaHistorial = resp.body.response.data;
    /* console.log('RESP');
    console.log(resp); */
  }
  //#endregion

  //#region Llenar Tabla Historial
  fnSetTableHistorial(listHistorial: ICreditNotesHistorial[]) {
    this.dataSource = new MatTableDataSource<ICreditNotesHistorial>(listHistorial);
    this.dataSource.paginator = this.paginator;
  }
  //#endregion

}
