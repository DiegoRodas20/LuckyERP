import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DialogData } from '../../../egy-humana/JefaturaATC/Model/IATC'; 
import { ComboEmpresa, ComboPais, ListaUsuario, ComboUsuEmp } from '../interface';
import { UsuarioService } from '../usuario.service';

@Component({
  selector: 'app-dialog-empresa',
  templateUrl: './dialog-empresa.component.html',
  styleUrls: ['../usuario.component.css']
})
export class DialogEmpresaComponent implements OnInit {
  @ViewChild(MatPaginator) UsuEmpPag: MatPaginator;
  @ViewChild(MatSort) UsuEmpSor: MatSort;
  url: string;
  comboPais = new Array<ComboPais>();
  comboEmpresa = new Array<ComboEmpresa>();
  UsuEmpDC: string[] = ['cEntNamFirst', 'sRazonSocial','colEliminar'];
  UsuEmpDS: MatTableDataSource<ComboUsuEmp>;
  EmpresaFG: FormGroup;
  usuarioData: DialogData;

  constructor(public dialogRef: MatDialogRef<DialogEmpresaComponent>,
    public service: UsuarioService, @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder, private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { 
      this.usuarioData = data;
      this.url = baseUrl;
      this.cboPais();
      this.listaEmpUsu(+(this.usuarioData["nCodUser"] + ""));
    }

  ngOnInit(): void {
    this.EmpresaFG = this.fb.group({
      empresa: ['', Validators.required],
    });
  }

  async btnAgregar() {
    if (this.EmpresaFG.invalid) {
      this.showAlert('Seleccione Empresa y Privilegio', "Alerta", 5);
      return;
    }
    let vEmpresaFG = this.EmpresaFG.value;
    const param = [];
    param.push(this.usuarioData["nCodUser"]);//obtener nCodUser enviado desde tabla principal
    param.push(vEmpresaFG.empresa);//parametro nCodUser de usuario insertado o seleccionado
    param.push(1);

    this.service.fnUsuario(14, param, this.url).subscribe(data => {//retorna array ["01","@codigo"]
      if (data[0] == '01') {
        this.showAlert('Empresa Asignada', "Exitoso", 5);
        this.listaEmpUsu(this.usuarioData["nCodUser"]);
      }
      else {
        this.showAlert(data, "Error", 5); 
      }
    }, err => {
      console.log(err)
    });
  }

  async btnEliminar(nIdEmpUser: number) {
    const param = [];
    param.push(nIdEmpUser);//parametro nCodUser de usuario insertado o seleccionado
    param.push(0);

    this.service.fnUsuario(15, param, this.url).subscribe(data => {//retorna array ["01","@codigo"]
      if (data[0] == '01') {
        this.showAlert('Empresa Eliminada', "Exitoso", 5);
        this.listaEmpUsu(this.usuarioData["nCodUser"]);
      }
      else {
        this.showAlert(data, "Error", 5); 
      }
    }, err => {
      console.log(err)
    });
  }

  async listaEmpUsu(nCodUser: number) {
    const param = [];
    param.push(nCodUser);
    param.push(1);//estado 1
    this.service.fnUsuario(13, param, this.url).subscribe((value: ComboUsuEmp[]) => {
      this.UsuEmpDS = new MatTableDataSource(value);
      this.UsuEmpDS.paginator = this.UsuEmpPag;
      this.UsuEmpDS.sort = this.UsuEmpSor;
    });
  }

  async cboPais() {
    const param = [];
    this.service.fnUsuario(4, param, this.url).subscribe((value: ComboPais[]) => {
      this.comboPais = value;
    });
  }

  async cboEmpresa(sIdPais: number) {
    const param = [];
    param.push(sIdPais);
    this.service.fnUsuario(5, param, this.url).subscribe((value: ComboEmpresa[]) => {
      this.comboEmpresa = value;
    });
  }

  /************************************* */

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 1000,
      verticalPosition: "top"
    });
  }

  btnCerrar() {
    this.dialogRef.close();
  }

}
