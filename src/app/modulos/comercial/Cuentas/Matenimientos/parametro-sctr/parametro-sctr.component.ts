import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogSctrComponent } from './dialog-sctr/dialog-sctr.component';
import { DialogconfirSctrComponent } from './dialogconfir-sctr/dialogconfir-sctr.component';
import { Aseguradora, Parametria } from './interface';
import { ParametroSctrService } from './parametro-sctr.service';

@Component({
  selector: 'app-parametro-sctr',
  templateUrl: './parametro-sctr.component.html',
  styleUrls: ['./parametro-sctr.component.css']
})
export class ParametroSctrComponent implements OnInit {
  @ViewChild(MatPaginator) parametriaPag: MatPaginator;
  @ViewChild(MatSort) parametriaSor: MatSort;
  para: Parametria;
  paraDC: string[] = ['sruc', 'srazonSocial', 'nAnio', 'nVersion', 'mPorcSalud', 'mPorcPencion', 'mTasaEspecial', 'bestado'];
  paraDS: MatTableDataSource<Parametria>;
  listaPara = new Array<Parametria>();
  comboAseguradora = new Array<Aseguradora>();
  url: string;
  fabButtons = [{ icon: 'personal_add', tool: 'Nuevo Parametro SCTR' }];
  buttons = [];
  fabTogglerState = 'inactive';
  paraFG: FormGroup;

  constructor(public service: ParametroSctrService, @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder, private spi: NgxSpinnerService, private _snackBar: MatSnackBar,
    public dialog: MatDialog) {
    this.url = baseUrl;
    var today = new Date();
    this.para = {nAnio:today.getFullYear()};

    this.btnNuevo();
    this.cbbAseguradora();
  }

  ngOnInit(): void {
    this.paraFG = this.fb.group({
      nIdAseg: [Validators.required],
      mPorcSalud: [Validators.required],
      mPorcPencion: [Validators.required],
      mTasaEspecial: [Validators.required],
    });
    
  }

  async tblParametria() {
    const param = [];
    this.service.fnUsuario(6, param, this.url).subscribe((value: Parametria[]) => {
      this.paraDS = new MatTableDataSource(value);
      this.paraDS.paginator = this.parametriaPag;
      this.paraDS.sort = this.parametriaSor;

      if (this.paraDS != null) {
        this.listaPara = this.paraDS.data.filter(element => element.nAnio == this.para.nAnio);
        if (this.listaPara.length != 0) {
          this.para.nVersion = this.listaPara[this.listaPara.length - 1].nVersion + 1
        }
      }
    });
  }

  async cbbAseguradora() {
    const param = [];
    this.spi.show('spi_lista');
    this.service.fnUsuario(7, param, this.url).subscribe((value: Aseguradora[]) => {
      this.comboAseguradora = value;
    });
    this.spi.hide('spi_lista');
  }

  btnGrabar() {
    if (this.paraFG.invalid) {
      this.showAlert('Aseguradora y sus porcentaje deben estar especificado', "Alerta", 5);
      return;
    }
    if(this.para.mPorcSalud <= 0  || this.para.mPorcPencion <= 0 || this.para.mTasaEspecial <= 0){
      this.showAlert('Los porcentaje no pueden ser menor o igual a 0', "Alerta", 5);
      return;
    }
    var opcion: number = 10;//opcion insert
    const param = [];
    param.push(this.para.nIdAseg);
    param.push(this.para.nAnio);
    param.push(this.para.nVersion);
    param.push(this.para.mPorcSalud);
    param.push(this.para.mPorcPencion);
    param.push(this.para.mTasaEspecial);
    param.push(this.para.bestado);

    if(this.para.nIdPara != 0){
      opcion=11;//opcion update
      param.push(this.para.nIdPara);
    }

    this.service.fnUsuario(opcion, param, this.url).subscribe(data => {//retorna array ["01","@codigo"]
      if (data[0] == '01') {
        this.showAlert('Parámetro Grabado', 'Correcto', 5);
        this.btnNuevo();
      }
      else {
        this.showAlert(data[1], "Error", 5); 
      }
    }, err => {
      console.log(err)
    });
  }

  btnNuevo() {
    this.para.nIdPara = 0;
    this.para.nIdAseg = 0;
    this.para.mPorcSalud = null;
    this.para.mPorcPencion = null;
    this.para.mTasaEspecial = null;
    this.para.bestado = 0;

    this.tblParametria();
  }

  seleccionar(row: Parametria) {
    this.para = row;
    /*this.showAlert("Parametria seleccionada " + this.para.nIdPara, "Test", 5);*/
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.paraDS.filter = filterValue.trim().toLowerCase();
  }

  openConfirDialog(element: Parametria) {
    const dialogRef = this.dialog.open(DialogconfirSctrComponent, {
      panelClass: 'myapp-no-padding-dialog',
      data: element
    });

    dialogRef.afterClosed().subscribe(result => {
      this.cbbAseguradora();
      this.btnNuevo();
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogSctrComponent, {
      panelClass: 'myapp-no-padding-dialog',
      width: '100%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.cbbAseguradora();
      this.btnNuevo();
    });
  }

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 50000,
      verticalPosition: "top"
    });
  }

}
