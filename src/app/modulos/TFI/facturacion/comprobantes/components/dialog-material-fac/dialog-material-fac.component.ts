import { Component, OnInit, Inject, ViewChild  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
 
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table'; 
import { NgxSpinnerService } from 'ngx-spinner';  
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FacturacionService } from '../../../../repository/services/facturacion.service';
import { MaterialesEntity } from 'src/app/modulos/TFI/repository/models/general.Entity';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2'; 


@Component({
  selector: 'app-dialog-material-fac',
  templateUrl: './dialog-material-fac.component.html',
  styleUrls: ['./dialog-material-fac.component.css']
})
export class DialogMaterialFacComponent implements OnInit {

  searchKey: string
  txtControl  = new FormControl();
  subRef$: Subscription;
   //#region declaracion variable del sistema
   id:number; 
   url: string;  
   pais: string; 
   Empresa:string; 
   lPar:number; 
   //#endregion 

   
  displayedColumns: string[] = ['opcion','codigo','nombre','medida'];
  dataSource: MatTableDataSource<MaterialesEntity>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;   


  constructor(
    private spinner: NgxSpinnerService, 
    public dialogRef: MatDialogRef<DialogMaterialFacComponent>,
    private facturacionService: FacturacionService,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: MaterialesEntity
    ) { 
      this.url = baseUrl;   
    }

  async ngOnInit(): Promise<void> { 
    await this.mate_getListadoMateriales()
    
  }

  async mate_getListadoMateriales() { // Listo
    this.spinner.show('spi_lista'); 
    this.subRef$ =this.facturacionService.getAllMateriales<MaterialesEntity[]>(6)
      .subscribe(async (res: any) => {    
        this.dataSource = new MatTableDataSource(res.body.response.data);   
        this.dataSource.sort = this.sort;   
        this.dataSource.paginator = this.paginator;
        this.spinner.hide('spi_lista'); 
      },
        (error) => {
          console.log(error);
          this.spinner.hide('spi_lista'); 
        })
  }

  applyFilter(fevent: Event) {     
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
     
  } 
  limpiar() {
    this.searchKey = ""
    this.dataSource.filter = this.searchKey.trim().toLowerCase();
  }

  fnDatos(ele){ 
    Swal.fire({
      icon: 'question',
      title: 'Emisión de Comprobantes',
      text: '¿Estas seguro de seleccionar el ' + ele.sCodArticulo + '?',
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if(result.isConfirmed) { 
        this.dialogRef.close({data:ele}); 
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close({data:this.data});
  }

}
