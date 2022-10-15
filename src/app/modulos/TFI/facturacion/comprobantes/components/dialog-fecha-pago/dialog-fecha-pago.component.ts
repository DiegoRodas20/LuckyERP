import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FacturacionService } from 'src/app/modulos/TFI/repository/services/facturacion.service';

import { NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';

@Component({
  selector: 'app-dialog-fecha-pago',
  templateUrl: './dialog-fecha-pago.component.html',
  styleUrls: ['./dialog-fecha-pago.component.css']
})
export class DialogFechaPagoComponent implements OnInit {
   //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string; 
  lPar:number; 
  //#endregion 

  fecha_inicio:Date;
  
  DatosFormGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private _facturacionService: FacturacionService,
    private spinner     : NgxSpinnerService,
    public dialogRef: MatDialogRef<DialogFechaPagoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.fecha_inicio = data.fecha

  }

  async ngOnInit() { 
    const user = localStorage.getItem('currentUser'); 
     
    this.id = JSON.parse(window.atob(user.split('.')[1])).uid;  
    this.DatosFormGroup = this.formBuilder.group({ 
      fecha: ['', Validators.required], 
    });
    
  }
 
  bloquearFechaNoValidas = (d: Date | null): boolean => { 
    
    //var fecha_actual = new Date('11/1/2020'); 
    
    const fecha_datepicker: Date = new Date(d);    
    return (
      fecha_datepicker >=  this.fecha_inicio   
    );
     
  };

  async onGuardar(){
    let datos = this.DatosFormGroup.value;
    if(this.DatosFormGroup.invalid)
    {
      return;
    } 
    let valorfecha = moment(datos.fecha , 'MM-DD-YYYY',true).format("YYYY-MM-DD") 
    let resultfecha = moment(datos.fecha , 'MM-DD-YYYY',true).format("DD/MM/YYYY") 
    const parametro = `${this.data.comprobanteId}|${valorfecha}|${2563}|${this.id}`;
    this.spinner.show();
    const resp: any = await this._facturacionService.updateEstado({ pOpcion : 26, pParametro: parametro});
    this.spinner.hide();
    
    this.dialogRef.close({fecha:resultfecha});

  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
