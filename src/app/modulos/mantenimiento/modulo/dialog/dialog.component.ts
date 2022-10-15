import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogData } from '../../../egy-humana/JefaturaATC/Model/IATC'; 
import { ListaModulo } from '../interface';
import { ModuloService } from '../modulo.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['../modulo.component.css']
})
export class DialogModPriComponent implements OnInit {
  typeModProyecto = 1717; // typeMod Proyecto
  typeModModulo = 1718; // typeMod Modulo
  typeModVista = 1719; // typeMod Vista
  typeModSubVista = 1720; // typeMod SubVista
  moduloData: DialogData;
  url: string;
  comboModulo = new Array<ListaModulo>();
  ModuloFG: FormGroup;

  constructor(public dialogRef: MatDialogRef<DialogModPriComponent>,
    public service: ModuloService, @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder, private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.url = baseUrl;
    this.moduloData = data;
    if (data["typeMod"] != this.typeModProyecto) {
      this.listaModulo(data["typeMod"] - 1, data["dadMod"]);
    }
  }

  ngOnInit(): void {
    if (this.moduloData["typeMod"] == this.typeModProyecto) {
      this.ModuloFG = this.fb.group({
        nameMod: [this.data["nameMod"], Validators.required],
        url_mod: [this.data["url_mod"], Validators.required],
      });
    } else {
      this.ModuloFG = this.fb.group({
        nameMod: [this.data["nameMod"], Validators.required],
        url_mod: [this.data["url_mod"], Validators.required],
        dadMod: [this.data["dadMod"], Validators.required],
      });
    }
    
    //this.capturarSelec(this.moduloData);
  }

  async listaModulo(typeMod: number, DadMod?: number) {
    var opcion: number;
    const param = [];
    param.push(typeMod);
    param.push(1);//status_Mod 1

    if (typeMod == this.typeModProyecto) {
      opcion = 17;
    } else {
      opcion = 22;
      param.push(DadMod);//status_Mod 1
    }

    this.service.fnUsuario(opcion, param, this.url).subscribe((value: ListaModulo[]) => {
      this.comboModulo = value;
    });
  }

  async btnGuardar() {
    const param = [];
    let vModuloFG = this.ModuloFG.value;

    if (this.ModuloFG.invalid) {
      this.showAlert('Todos los datos son necesarios', "Alerta", 5);
      return;
    }

    param.push(this.moduloData["idMod"]);
    param.push(vModuloFG.nameMod);
    param.push(this.moduloData["typeMod"]);
    param.push(this.moduloData["status_Mod"]);
    param.push(vModuloFG.url_mod);
    if(this.moduloData["typeMod"] != this.typeModProyecto){
      param.push(vModuloFG.dadMod);
    } else {
      //param.push(null);
    }
    

    this.service.fnUsuario(23, param, this.url).subscribe(data => {//retorna array ["01","@codigo"]
      if (data[0] == '01') {
        this.showAlert(data, "Correcto", 5);
      }
      else {
        this.showAlert(data, "Error", 5);
      }
    }, err => {
      console.log(err)
    });
  }

  btnCerrar() {
    this.dialogRef.close();
  }

  /*capturarSelec(data: DialogData) {
    if (data["idMod"] != 0) {
      this.ModuloFG.get('nameMod').setValue(data["nameMod"]);
      this.ModuloFG.get('url_mod').setValue(data["url_mod"]);
      /*if (this.moduloData["typeMod"] != this.typeModProyecto) {
        this.ModuloFG.get('dadMod').setValue(data["dadMod"]);
      }
      
    }
  }*/

  diferenteProyecto(): boolean {
    //if (this.UsuarioSelecc['nCodUser'] == 0) {
    if (this.moduloData["typeMod"] == this.typeModProyecto) {
      return false;
    } else {
      return true;
    }
  }

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 1000,
      verticalPosition: "top"
    });
  }

}
