import { Component, OnInit, Inject } from '@angular/core';  
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-ubigeo',
  templateUrl: './dialog-ubigeo.component.html',
  styleUrls: ['./dialog-ubigeo.component.css']
})

export class DialogUbigeoComponent implements OnInit {
  lblDepartamento:any = [];
  lblProvincia:any= [];
  lblDistrito:any= []; 
  
  pais:string;
  primero:string;
  segundo:string;
  tercero:string;

  
  UbigeoForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder, 
    public dialogRef: MatDialogRef<DialogUbigeoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,  
    ) 
    { 
      this.lblDepartamento = data.ubigeo;
      this.pais = data.pais;
      this.primero = data.primero;
      this.segundo = data.segundo;
      this.tercero = data.tercero;
    }

  ngOnInit(): void { 

    this.UbigeoForm = this.formBuilder.group({
      Pri: [this.primero, Validators.required], 
      Seg: [this.segundo, Validators.required], 
      Ter: [this.tercero, Validators.required], 
    });

    
    this.getControl(1);
    this.getControl(2);
  }

  getControl(op){
    let vUbi = this.UbigeoForm.value;   
    if(op == 1){ 
      if(!vUbi.Pri){
        this.lblProvincia = [];
        this.lblDistrito= [];
        this.UbigeoForm.controls.Seg.setValue(null); 
        this.UbigeoForm.controls.Ter.setValue(null);  
        return
      } 

      this.lblDepartamento.forEach(element => {
        if(element.pCod == vUbi.Pri){       
          this.lblProvincia = element.listDet ; 
        } 
      }); 
    }
    else{ 
      if(!vUbi.Seg){ 
        this.lblDistrito= [];
        this.UbigeoForm.controls.Ter.setValue(null); 
        return
      } 
      this.lblProvincia.forEach(element => {
        if(element.pCod == vUbi.Seg){
          this.lblDistrito = element.listDet  ; 
        } 
      });
    }
  }

  onNoClick(){ 
    this.dialogRef.close();
  }

  fnSeleccionar(){ 
    let vUbi = this.UbigeoForm.value;   
    var ObjUbi = new Object(); 

    let valor : string;
    let distrito: string;   
    
    this.lblDistrito.forEach(element => {
      if(element.pCod == vUbi.Ter){ 
        distrito = element.cDesc;
      } 
    });

    valor = this.pais +  vUbi.Pri +  vUbi.Seg +  vUbi.Ter  

    ObjUbi["cod"]= valor;
    ObjUbi["desc"]= distrito;
    
    this.dialogRef.close({data: ObjUbi});
  }

}
