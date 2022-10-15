import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { stringify } from 'querystring';
import { DialogData } from '../../../egy-humana/JefaturaATC/Model/IATC'; 
import { ListaModulo } from '../interface';
import { UsuarioService } from '../usuario.service';

@Component({
  selector: 'app-dialog-modulo',
  templateUrl: './dialog-modulo.component.html',
  styleUrls: ['../usuario.component.css']
})
export class DialogModuloComponent implements OnInit {
  typeModProyecto = 1717; // typeMod Proyecto
  typeModModulo = 1718; // typeMod Modulo
  typeModVista = 1719; // typeMod Vista
  typeModSubVista = 1720; // typeMod SubVista

  url: string;
  usuarioData: DialogData;
  moduloProyectoDS: MatTableDataSource<ListaModulo>;
  moduloModuloDS: MatTableDataSource<ListaModulo>;
  moduloVistaDS: MatTableDataSource<ListaModulo>;
  moduloSubVistaDS: MatTableDataSource<ListaModulo>;
  moduloDC: string[] = ['nameMod'];
  ruta: string[] = ['', '', '', ''];


  constructor(public dialogRef: MatDialogRef<DialogModuloComponent>,
    public service: UsuarioService, @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder, private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.usuarioData = data;
    this.url = baseUrl;
    this.listaModulo(this.typeModProyecto);
  }

  ngOnInit(): void {
  }

  async listaModulo(typeMod: number, DadMod?: number) {
    var opcion: number;
    const param = [];
    param.push(typeMod);
    param.push(1);//status_Mod 1

    if (typeMod == this.typeModProyecto) {
      opcion = 20;
      param.push(" ");//status_Mod 1
    } else {
      opcion = 21;
      param.push(DadMod);//status_Mod 1
    }
    param.push(this.usuarioData["nIdEmpUser"]);

    this.service.fnUsuario(opcion, param, this.url).subscribe((value: ListaModulo[]) => {
      //console.log(value[0].asignado);
      if (typeMod == this.typeModProyecto) {
        this.moduloProyectoDS = new MatTableDataSource(value);
        this.moduloModuloDS = new MatTableDataSource();
        this.moduloVistaDS = new MatTableDataSource();
        this.moduloSubVistaDS = new MatTableDataSource();

      } else if (typeMod == this.typeModModulo) {
        this.moduloModuloDS = new MatTableDataSource(value);
        this.moduloVistaDS = new MatTableDataSource();
        this.moduloSubVistaDS = new MatTableDataSource();

      } else if (typeMod == this.typeModVista) {
        this.moduloVistaDS = new MatTableDataSource(value);
        this.moduloSubVistaDS = new MatTableDataSource();

      } else if (typeMod == this.typeModSubVista) {
        this.moduloSubVistaDS = new MatTableDataSource(value);
      }
    });
  }

  async chkGrabar(modulo: ListaModulo) {
    const param = [];
    param.push(this.usuarioData["nIdEmpUser"]);
    param.push(modulo.idMod);//status_Mod 1
    param.push("1972");
    if(modulo.asignado){
      param.push(1);//status_Mod 1
    }else{
      param.push(0);//status_Mod 1
    }
    

    this.service.fnUsuario(18, param, this.url).subscribe((value: ListaModulo[]) => {
      if (value[0] == '01') {
        this.showAlert("Permiso actualizado", "Completado", 5);

      } 
    });
  }


  /************************************** */

  btnCerrar() {
    this.dialogRef.close();
  }

  btnlistarModulo(lista: ListaModulo) {
    this.listaModulo(this.typeModModulo, lista.idMod);
    this.ruta[0] = '/' + lista.url_mod;
    this.ruta[1] = '';
    this.ruta[2] = '';
    this.ruta[3] = '';
    this.listarRuta();
  }
  btnlistarVista(lista: ListaModulo) {
    this.listaModulo(this.typeModVista, lista.idMod);
    this.ruta[1] = '/' + lista.url_mod;
    this.ruta[2] = '';
    this.ruta[3] = '';
    this.listarRuta();
  }
  btnlistarSubVista(lista: ListaModulo) {
    this.listaModulo(this.typeModSubVista, lista.idMod);
    this.ruta[2] = '/' + lista.url_mod;
    this.ruta[3] = '';
    this.listarRuta();
  }
  mouseOverSubVista(lista: ListaModulo) {
    this.ruta[3] = '/' + lista.url_mod;
    this.listarRuta();
  }

  listarRuta(): string {
    var rutaFinal: string;
    rutaFinal = '';
    for (var r of this.ruta) {
      rutaFinal = rutaFinal + r;
    }
    return rutaFinal;
  }


  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 1000,
      verticalPosition: "top"
    });
  }

}
