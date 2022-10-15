import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Parametria } from '../interface';
import { ParametroSctrService } from '../parametro-sctr.service';

@Component({
  selector: 'app-dialogconfir-sctr',
  templateUrl: './dialogconfir-sctr.component.html',
  styleUrls: ['../parametro-sctr.component.css']
})
export class DialogconfirSctrComponent implements OnInit {
  url: string;

  constructor(public dialogRef: MatDialogRef<DialogconfirSctrComponent>,
    public service: ParametroSctrService, @Inject('BASE_URL') baseUrl: string,
    private fb: FormBuilder, private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.url = baseUrl;
  }

  ngOnInit(): void {
  }

  async btnAceptar() {
    const param = [];
    param.push(this.data['nAnio']);
    param.push(this.data['nIdPara']);
    this.service.fnUsuario(12, param, this.url).subscribe(data => {//retorna array ["01","@codigo"]
      if (data[0] == '01') {
        this.showAlert('Parámetro Activado', 'Correcto', 5);
      }
      else {
        this.showAlert(data[1], "Error", 5); 
      }
      this.dialogRef.close();
    }, err => {
      console.log(err);
      this.dialogRef.close();
    });
    
  }

  btnCerrar() {
    this.dialogRef.close();
  }

  showAlert(data: string, titulo: string, duration: number) {
    this._snackBar.open(data, titulo, {
      duration: duration * 10000,
      verticalPosition: "top"
    });
  }

}
