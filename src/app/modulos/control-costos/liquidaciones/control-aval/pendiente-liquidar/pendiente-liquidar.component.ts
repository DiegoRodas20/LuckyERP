import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
import { LiquidacionesService } from '../../liquidaciones.service'


@Component({
  selector: 'app-pendiente-liquidar',
  templateUrl: './pendiente-liquidar.component.html',
  styleUrls: ['./pendiente-liquidar.component.css']
})
export class PendienteLiquidarComponent implements OnInit {
//Tabla material
dataSource: MatTableDataSource<any>;
@ViewChild(MatPaginator) paginator: MatPaginator;
@ViewChild(MatSort) sort: MatSort;
displayedColumns: string[] = ['sCentroCosto','sNumero','sSurcusal', 'nTotalDeposito', 'nMonto','sEstado'];
url: string; 
nombrePersonal: string;

lPendiente = []
txtMontoSolicitud = new FormControl();

constructor(private vLiquidacionesService: LiquidacionesService, 
  private spinner: NgxSpinnerService, 
  public dialog: MatDialog,
  @Inject('BASE_URL') baseUrl: string, 
  public dialogRef: MatDialogRef<PendienteLiquidarComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any) 
  { this.url = baseUrl; }

  ngOnInit(): void {
    this.nombrePersonal = this.data.sDescripcion;
    this.fnListarPendientes(this.data.nIdPersonal);
  }

  fnListarPendientes = function(vPersonal: any){
    var pParametro = []; //Parametros de campos vacios
    pParametro.push(vPersonal);
    // this.spinner.show(); 
    this.vLiquidacionesService.fnControlAval(3, 2, pParametro, 1, this.url).subscribe(
        res => {
            this.lPendiente = res
            this.dataSource = new MatTableDataSource(res);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;

            //console.log(res)
            let vTotal: number = 0;
            for (let index = 0; index < this.lPendiente.length; index++) {
              vTotal = vTotal + this.lPendiente[index].nMonto;
            }

            vTotal = isNaN(vTotal) ? 0 : vTotal ;
            this.txtMontoSolicitud.setValue(vTotal);

            this.spinner.hide();
        },
        err => {
            this.spinner.hide();
            console.log(err);
        },
        () => {
            this.spinner.hide();
        }
    );
  }

}
