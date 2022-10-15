import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { DialogModPriComponent } from './dialog/dialog.component';
import { ListaModulo } from './interface';
import { ModuloService } from './modulo.service';

@Component({
  selector: 'app-modulo',
  templateUrl: './modulo.component.html',
  styleUrls: ['./modulo.component.css']
})
export class ModuloComponent implements OnInit {
  typeModProyecto = 1717; // typeMod Proyecto
  typeModModulo = 1718; // typeMod Modulo
  typeModVista = 1719; // typeMod Vista
  typeModSubVista = 1720; // typeMod SubVista

  url: string;
  moduloProyectoDS: MatTableDataSource<ListaModulo>;
  moduloModuloDS: MatTableDataSource<ListaModulo>;
  moduloVistaDS: MatTableDataSource<ListaModulo>;
  moduloSubVistaDS: MatTableDataSource<ListaModulo>;
  moduloDC: string[] = ['nameMod'];
  ruta: string[] = ['', '', '', ''];
  moduloActivo: ListaModulo ;
  moduloNuevo: ListaModulo ;

  constructor(public service: ModuloService, @Inject('BASE_URL') baseUrl: string,
    private _snackBar: MatSnackBar,public dialog: MatDialog) {
    this.url = baseUrl;
    this.listaModulo(this.typeModProyecto);
    this.moduloActivo = { idMod: 0, typeMod: this.typeModProyecto};
    this.moduloNuevo = { idMod: 0};
  }

  ngOnInit(): void {
  }

  async listaModulo(typeMod: number, DadMod?: number) {
    var opcion: number;
    const param = [];
    param.push(typeMod);
    param.push(1);//status_Mod 1

    if (typeMod == this.typeModProyecto) {
      opcion = 17;
    } else {
      opcion = 16;
      param.push(DadMod);//status_Mod 1
    }

    this.service.fnUsuario(opcion, param, this.url).subscribe((value:ListaModulo[]) => {
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

  async actualizarEstado(idMod: number, status_Mod: number) {
    const param = [];
    param.push(idMod);
    if(status_Mod+"" == "True"){
      param.push(0);
    } else {
      param.push(1);
    }
    
    this.service.fnUsuario(24, param, this.url).subscribe(data => {//retorna array ["01","@codigo"]
      if (data[0] == '01') {
        this.showAlert('Estado Actualizado', 'Correcto', 5);
      }
      else {
        this.showAlert(data[1], "Error", 5);
      }
    }, err => {
      console.log(err)
    });
  }


  /************************************** */
  btnlistarModulo(lista: ListaModulo) {
    this.moduloActivo = lista;
    this.listaModulo(this.typeModModulo, lista.idMod);
    this.ruta[0] = '/' + lista.url_mod;
    this.ruta[1] = '';
    this.ruta[2] = '';
    this.ruta[3] = '';
    this.listarRuta();
  }
  btnlistarVista(lista: ListaModulo) {
    this.moduloActivo = lista;
    this.listaModulo(this.typeModVista, lista.idMod);
    this.ruta[1] = '/' + lista.url_mod;
    this.ruta[2] = '';
    this.ruta[3] = '';
    this.listarRuta();
  }
  btnlistarSubVista(lista: ListaModulo) {
    this.moduloActivo = lista;
    this.listaModulo(this.typeModSubVista, lista.idMod);
    this.ruta[2] = '/' + lista.url_mod;
    this.ruta[3] = '';
    this.listarRuta();
  }

  btnEliminar(lista: ListaModulo){
    this.actualizarEstado(lista.idMod, lista.status_Mod);
    this.listaModulo(this.typeModProyecto);
  }
  /*mouseOverSubVista(lista: ListaModulo) {
    this.moduloActivo = lista;
    this.ruta[3] = '/' + lista.url_mod;
    this.listarRuta();
  }*/

  listarRuta(): string {
    var rutaFinal: string;
    rutaFinal = '';
    for (var r of this.ruta) {
      rutaFinal = rutaFinal + r;
    }
    return rutaFinal;
  }

  esModulo():boolean{
    var res: boolean = false;
    if(this.moduloActivo.typeMod == this.typeModModulo){
      res = true;
    }
    return res;
  }
  esVista():boolean{
    var res: boolean = false;
    if(this.moduloActivo.typeMod == this.typeModVista){
      res = true;
    }
    return res;
  }
  esProyecto():boolean{
    var res: boolean = false;
    if(this.moduloActivo.typeMod == this.typeModProyecto && this.moduloActivo.idMod !=0){
      res = true;
    }
    return res;
  }


  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 1000,
      verticalPosition: "top"
    });
  }

  openDialog(modulo: ListaModulo) {
    const dialogRef = this.dialog.open(DialogModPriComponent, {
      panelClass: 'myapp-no-padding-dialog',
      width: '100%',
      data: modulo
    });

    dialogRef.afterClosed().subscribe(result => {
      this.listaModulo(this.typeModProyecto);
    });
  }

  openDialogNew() {
    //preparar moduloNuevo para crear modulo hijo, heredando el idDad, etc.
    this.moduloNuevo.idMod = 0; // id 0, storeProcedure detectara como insert
    this.moduloNuevo.typeMod = this.moduloActivo.typeMod + 1;//para indica q es modulo hijo
    this.moduloNuevo.status_Mod = 1;
    this.moduloNuevo.dadMod = this.moduloActivo.idMod;

    const dialogRef = this.dialog.open(DialogModPriComponent, {
      panelClass: 'myapp-no-padding-dialog',
      width: '100%',
      data: this.moduloNuevo
    });

    dialogRef.afterClosed().subscribe(result => {
      this.listaModulo(this.typeModProyecto);
    });
  }

  openDialogProyectoNew() {
    //preparar moduloNuevo para crear modulo hijo, heredando el idDad, etc.
    this.moduloNuevo.idMod = 0; // id 0, storeProcedure detectara como insert
    this.moduloNuevo.typeMod = this.typeModProyecto;//para indica q es modulo hijo
    this.moduloNuevo.status_Mod = 1;

    const dialogRef = this.dialog.open(DialogModPriComponent, {
      panelClass: 'myapp-no-padding-dialog',
      width: '100%',
      data: this.moduloNuevo
    });

    dialogRef.afterClosed().subscribe(result => {
      this.listaModulo(this.typeModProyecto);
    });
  }

}
