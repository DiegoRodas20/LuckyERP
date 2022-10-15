import { Component, OnInit, ViewChild, ViewChildren, Inject, AfterViewInit,ElementRef, QueryList  } from '@angular/core';

import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';  
import { SecurityErp } from '../../../AAHelpers/securityErp.Entity';  

import { comercialAnimations } from '../../../comercial/Animations/comercial.animations';  

@Component({
  selector: 'app-autoliquidacion',
  templateUrl: './autoliquidacion.component.html',
  styleUrls: ['./autoliquidacion.component.css'], 
  animations: [ comercialAnimations]
})
export class AutoliquidacionComponent implements OnInit {
  //#region datos del sistemas
  securityErp = new SecurityErp();
  //#endregion

  //#region true and false to div
  divList: boolean = false; 
  //#endregion

   /* tabla lista de presupuesto */
  dataSourceAL: MatTableDataSource<any>;
  displayedColumnsAL: string[] = [
    'anio','mes','quincena','cantidad' ]; 
  @ViewChild('TableALSort') tableALSort: MatSort; 
  //#endregion
 
  
  abLista = [];
  tsLista = 'inactive';
  fbLista = [
    {icon: 'attach_money', tool: 'Nuevo Autoliquidación de movilidad'}
  ];

  
  vAutoL = new Object(); 

  constructor() { }

  ngOnInit(): void {
    // console.log(this.securityErp.getPais());
    // console.log(this.securityErp.getEmpresa());
    // console.log(this.securityErp.getLoginUsuario());
    // console.log(this.securityErp.getUsuarioId());
    
  }

  onToggleFab(fab: number, stat: number) {
    switch (fab) {
      case 1:
        stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
        this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
        this.abLista = ( stat === 0 ) ? [] : this.fbLista;
        break;
 
      default:
        break;
    }

  }

  fnPlantilla(op){
    if(op == 0){ 
      this.divList = true;
    }  
  }

  recibirMensaje(mensaje:string){
    this.divList = false ; 
  }


}
