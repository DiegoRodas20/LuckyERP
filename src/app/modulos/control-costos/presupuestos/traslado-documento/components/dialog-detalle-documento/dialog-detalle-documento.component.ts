import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef, DoCheck } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TrasladoDocumentoService } from '../../../traslado-documento.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogTrasladarDocumentoComponent } from '../dialog-trasladar-documento/dialog-trasladar-documento.component';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { asistenciapAnimations } from '../../../../../comercial/Asistencia/asistenciap/asistenciap.animations';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-dialog-detalle-documento',
  templateUrl: './dialog-detalle-documento.component.html',
  styleUrls: ['./dialog-detalle-documento.component.css', '../../traslado-documento.component.css'],
  animations: [asistenciapAnimations]
})
export class DialogDetalleDocumentoComponent implements OnInit, DoCheck {
  displayedColumns: string[] = ['ccosto', 'ciudad', 'partida', 'detalleGasto', 'total', 'deposito'];//, 'nombreCiudad', 'descripcion',
  dataSource: MatTableDataSource<any>;
  listaDetalleDocumento: any;
  abLista = [];
  tsLista = 'inactive'; 
  fbLista = [
    {icon: 'save', tool: 'Crear'}
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(private cdRef: ChangeDetectorRef, 
    public dialogRef: MatDialogRef<DialogDetalleDocumentoComponent>, 
    @Inject(MAT_DIALOG_DATA) public data,
    private spinner: NgxSpinnerService,
    private trasladoService: TrasladoDocumentoService,
    public dialog: MatDialog) { }

  ngDoCheck() {
    this.cdRef.detectChanges();
  }

  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }

  async ngOnInit() {
    this.cdRef.detectChanges();
    this.cdRef.detectChanges();
    this.listaDetalleDocumento = await this.trasladoService.listarCabeceraDocumentos(2, `${this.data.data.nIdGastoCosto}|${this.data.data.nIdCentroCosto}|${this.data.data.sTipoDoc}`);
    this.dataSource = new MatTableDataSource(this.listaDetalleDocumento);
    this.cdRef.detectChanges();
    this.dataSource.paginator = this.paginator;
    if(this.listaDetalleDocumento.length === 0) {
      return Swal.fire({
        title: 'Por favor comuniquise con el área administrativa, no se encuentra ningún registro',
        icon: 'warning'
      });
    }
  }

  close() {
    this.dialogRef.close();
  }

  trasladarDocumento(): void {
    const dialogRef = this.dialog.open(DialogTrasladarDocumentoComponent, {
      width: '80%',
      height: '100%',
      data: {
        data: this.data.data,
        listaDetalle: this.listaDetalleDocumento,
        datosCabecera: this.data.datosCabecera,
        titulo: `${this.data.data.sCodCC} - ${this.data.data.sTipoDoc} - ${this.data.data.nNumero}`
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result === 1) {
        this.dialogRef.close(1);

      }
    });
  }

}
