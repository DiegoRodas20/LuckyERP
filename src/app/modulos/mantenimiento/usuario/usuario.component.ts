import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, FormControl } from '@angular/forms';
/*import { distinctUntilChanged, map } from 'rxjs/operators';*/

import { ComboSysEle, ComboUsuEmp, ListaUsuario } from './interface';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { UsuarioService } from './usuario.service';
import { usuarioAnimations } from './usuario.animations';
import { DialogComponent } from './dialog/dialog.component';
import { DialogEmpresaComponent } from './dialog-empresa/dialog-empresa.component';
import { DialogModuloComponent } from './dialog-modulo/dialog-modulo.component';
declare var jQuery: any;

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css', './usuario.component.scss'],
  animations: [usuarioAnimations]
})

export class UsuarioComponent implements OnInit {
  usuarioDC: string[] = ['action', 'cUser', 'nameUser', 'email', 'cEleNam'];
  usuarioDS: MatTableDataSource<ListaUsuario>;
  usuarios = new Array<ListaUsuario>();
  comboSysEle = new Array<ComboSysEle>();
  comboUsuEmp = new Array<ComboUsuEmp>();

  @ViewChild(MatPaginator) usarioPag: MatPaginator;
  @ViewChild(MatSort) usarioSor: MatSort;
  url: string;
  fabButtons = [{ icon: 'personal_add', tool: 'Nuevo usuario' }];
  buttons = [];
  fabTogglerState = 'inactive';
  UsuarioFG: FormGroup;

  constructor(public service: UsuarioService, @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder, private spi: NgxSpinnerService, private _snackBar: MatSnackBar,
    public dialog: MatDialog) {
    this.url = baseUrl;
    this.cboSysEle();
    this.fnGetListaPersonal();
  }

  ngOnInit() {
    this.UsuarioFG = this.fb.group({
      nameUser: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  async fnGetListaPersonal() {
    const param = [];
    this.spi.show('spi_lista');
    this.service.fnUsuario(0, param, this.url).subscribe((value: ListaUsuario[]) => {
      this.usuarioDS = new MatTableDataSource(value);
      this.usuarioDS.paginator = this.usarioPag;
      this.usuarioDS.sort = this.usarioSor;
    });
    this.spi.hide('spi_lista');
  }

  async cboSysEle() {
    const param = [];
    this.service.fnUsuario(11, param, this.url).subscribe((value: ComboSysEle[]) => {
      this.comboSysEle = value;
    });
  }

  async btnMenuEstado(nCodUser: number, nEleCod: number) {
    const param = [];
    param.push(nCodUser);
    param.push(nEleCod);

    this.service.fnUsuario(12, param, this.url).subscribe(data => {//retorna array ["01","@codigo"]
      if (data[0] == '01') {
        this.showAlert('Estado Actualizado', 'Correcto', 5);
        this.fnGetListaPersonal();
      }
      else {
        this.showAlert(data[1], "Error", 5);
      }
    }, err => {
      console.log(err)
    });
  }

  async cboUsuEmp(nCodUser: number) {    
    const param = [];
    param.push(nCodUser);
    param.push(1);//empresa activo
    this.service.fnUsuario(13, param, this.url).subscribe((value: ComboUsuEmp[]) => {
      this.comboUsuEmp = value;
    });
  }

  /************************** metodos sin usar backend **************************/
  onToggleFab() {
    if (this.buttons.length) {
      this.fabTogglerState = 'inactive';
      this.buttons = [];
    } else {
      this.fabTogglerState = 'active';
      this.buttons = this.fabButtons;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.usuarioDS.filter = filterValue.trim().toLowerCase();
  }

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 1000,
      verticalPosition: "top"
    });
  }

  openDialog(usuario: ListaUsuario) { 
    
    const dialogRef = this.dialog.open(DialogComponent, {
      panelClass: 'myapp-no-padding-dialog',
      width: '100%',
      data: usuario
    });

    dialogRef.afterClosed().subscribe(result => {
      this.fnGetListaPersonal();
    });
  }

  openDialogNew() {
    const dialogRef = this.dialog.open(DialogComponent, {
      panelClass: 'myapp-no-padding-dialog',
      width: '100%',
      data: { nCodUser: 0 }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.fnGetListaPersonal();
    });
  }

  openDialogEmpresa(usuario: ListaUsuario) {
    const dialogRef = this.dialog.open(DialogEmpresaComponent, {
      panelClass: 'myapp-no-padding-dialog',
      width: '100%',
      data: usuario
    });

    dialogRef.afterClosed().subscribe(result => {
      this.fnGetListaPersonal();
    });
  }

  openDialogModulo(usuEmp: ComboUsuEmp) {
    const dialogRef = this.dialog.open(DialogModuloComponent, {
      panelClass: 'myapp-no-padding-dialog',
      width: '100%',
      data: usuEmp
    });

    dialogRef.afterClosed().subscribe(result => {
      this.fnGetListaPersonal();
    });
  }

}
