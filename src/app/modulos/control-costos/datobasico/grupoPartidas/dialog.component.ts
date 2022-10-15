import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ParametroService } from '../parametro.service';
import { ParametroProcedureInterface } from '../interfaces/parametroProcedure';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  forma: FormGroup;
  lPartidaEspecifica: any;
  lPartidaEspecificaItem: any;
  constructor(public fb: FormBuilder, 
            public diaglogRef: MatDialogRef<DialogComponent>,
            @Inject(MAT_DIALOG_DATA) public data: any ,
            private partidaService: ParametroService) {
    this.forma = fb.group({
      'padre': [],
      'hijo': [],
    });
  }

  async ngOnInit() {
    await this.obtenerPartidaEspecificaGenerida();
  }

  async obtenerPartidaEspecificaGenerida() {
    const idPais = localStorage.getItem('Pais');
    let model2: ParametroProcedureInterface;
    const parametros2 = `|${idPais}||`;
    model2 = {
      pEntidad: 2,
      pOpcion: 1,
      pParametro: parametros2.toString(),
      pTipo: 2,
      pParametroDet: ''
    };
    this.lPartidaEspecifica = await this.partidaService.listarPartidaEspecificaGenerida(model2);
  }

  mostrarPartidaEspecifica(): void {
    const id = this.forma.get('padre').value;
    let model3: ParametroProcedureInterface;
    const parametros3 = `||${id}|`;
    model3 = {
      pEntidad: 2,
      pOpcion: 2,
      pParametro: parametros3.toString(),
      pTipo: 2,
      pParametroDet: ''
    };
    this.partidaService.listarPartidaEspecificaGenericaItem(model3).then( (resolve: any) => {
      this.lPartidaEspecificaItem = resolve;
      this.forma.controls.hijo.setValue('');
    });
  }

  agregarDetalle(){
    if(this.forma.value.padre === null || this.forma.value.hijo === null || this.forma.value.hijo === "") {
      return Swal.fire({
        title: 'Por favor seleccione una partida',
        icon: 'warning',
        timer: 1500
      })
    }
    this.diaglogRef.close(this.forma.value);
  }

  onNoClick(): void {
    this.diaglogRef.close();
  }

}
