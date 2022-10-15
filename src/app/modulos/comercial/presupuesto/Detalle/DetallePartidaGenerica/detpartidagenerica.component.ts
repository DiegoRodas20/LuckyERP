import { Component, OnInit, Input, Inject, ViewChild, EventEmitter, Output } from '@angular/core'; 
 
import { NgxSpinnerService } from 'ngx-spinner';  

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';   

import {SerPresupuestoService} from './../../serpresupuesto.service';    
import Swal from 'sweetalert2';
  
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ReturnStatement } from '@angular/compiler';

@Component({
  selector: 'app-detpartidagenerica',
  templateUrl: './detpartidagenerica.component.html',
  styleUrls: ['./detpartidagenerica.component.css'] 
})
export class DetPartidaGenericaComponent implements OnInit {
  //#region declaracion variable del sistema
  id:number; 
  url: string;  
  pais: string; 
  Empresa:string; 
  lPar:number; 
  //#endregion 

  tGestor:any;
  tVertical = new Array<any>();
  tHorizontal = new Array<any>();
  tCiudad = new Array<any>();
 
  tipo:number; 
  nidCentroCosto:number;  
  idPartida:number;   
  sPartida:string;   
  Margen:number;  
  validacion:boolean; 

  
  vVertical:boolean=true;   
  vHorizontal:boolean=false;
  
  local_data:any;
  lcboCiudad:any; 
  lcboArticulo:any; 

  
  nidEliminar:number = 0;  
  lblLista = [];
  tamaño:number; 
  clsColumnaOpc: any[]=[];    
  
  arrayArticulo = new Object();  
   
  displayedColumns: string[] = ['id','ciudad','articulo','precio','cantidad','total','preciocompra','cantidadcompra'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;   

  displayedColumnsHor: string[] = ['estado','articulo','precio','preciocompra','cantidadcompra'];
  dataSourceHor: MatTableDataSource<any>;   

  constructor( 
    private spinner: NgxSpinnerService, 
    private vSerPresupuesto: SerPresupuestoService,
    public dialogRef: MatDialogRef<DetPartidaGenericaComponent>, 
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) public data: any[]
    ) { 
      this.url = baseUrl;   
      this.local_data = {...data}; 
      
      this.lcboCiudad = this.local_data.sucursal; 
      this.nidCentroCosto = this.local_data.idCentroCosto;  
      this.validacion = this.local_data.validacion;  
      this.idPartida = this.local_data.idPartida;  
      this.sPartida = this.local_data.sPartida;  
      this.Margen = this.local_data.Margen;  
      this.tipo = this.local_data.tipo;  
      this.tGestor = this.local_data.det;
      this.tVertical = this.tGestor.lVertical;
      this.tHorizontal = this.tGestor.lHorizontal;
      this.tCiudad = this.tGestor.lCiudad; 
      this.fnArticulo(); 
      //#region 
      this.pais = localStorage.getItem('Pais'); 
      this.Empresa = localStorage.getItem('Empresa');
      const user = localStorage.getItem('currentUser');
      this.id = JSON.parse(window.atob(user.split('.')[1])).uid; 
      //#endregion 
  }

  ngOnInit(): void {     
    this.onTipo();   
  }

  //#region tipo (horizontal o vertical)
  onTipo(){
    if(this.tipo === 2){
      this.vVertical =  false
      this.vHorizontal = true
      this.fnListaHorizontal(0) 
    }
    else{ 
      this.vVertical =  true
      this.vHorizontal = false 
      this.fnListaVertical()
    }
  }
  //#endregion

  
  //#region (horizontal) 
  fnListaHorizontal(op){
    this.tamaño= 600;
    var tabla = document.getElementById("tablaPartida");  
    
    if(op === 0){
      this.tCiudad.forEach(element => {  
        this.tamaño += 100;
        this.displayedColumnsHor.push(element.pNombre)
        this.clsColumnaOpc.push(
          {
            id:element.pCod,
            idCCS:element.pId,
            idSucursal:element.pIdSucursal,
            col:element.pNombre,
            cant:element.pEstado})  
      });
    }

    this.lblLista.length = 0;

    this.tHorizontal.map((ele)=>{ 
      var arraySelects = new Object();

      let suma=0;
      ele.lDet.map((elee)=>{  
        
        let dimporte = (typeof elee.total === "undefined" ? 0:elee.total)
        // let simporte = (typeof elee.stotal === "undefined" ? 0:elee.stotal)
        arraySelects[elee.pCod]=   dimporte ;  
        suma += +elee.total;
      });  

      this.lblLista.push({
        estado:0,
        articulo:ele.articulo,
        precio:ele.precio,
        preciocompra:ele.preciocompra,
        cantidadcompra:ele.cantidadcompra, 
        pTotal:suma,
        lsucursal:arraySelects 
      })

    }) 
    this.dataSourceHor = new MatTableDataSource(this.lblLista); 
    tabla.setAttribute("width", this.tamaño.toString());
     
  }

  openDetalle(){
    let val = 1;

    this.lblLista = this.dataSourceHor.data
    var arraySelects = new Object();
    this.clsColumnaOpc.forEach(element => {
      arraySelects[element.id] = '0'; 
    });

    this.lblLista.forEach(element => {
      if(element.articulo =='') {
        val = 0
        return;
      }
    });

    if(val === 0){  
      return;
    }

    if(val === 1){  
      this.lblLista.push({
        estado:0,
        articulo:'',
        precio:0,
        preciocompra:'',
        cantidadcompra:'', 
        pTotal:0,
        lsucursal:arraySelects 
      }) 
    } 
    
    this.dataSourceHor = new MatTableDataSource(this.lblLista);  
  }

  async fnEliminarDetalleHor(obj,i){ 

    let pParametro= []; 
    let pDet= [];  
    let lError = false;

    if(obj.articulo === '')
    { 
      this.lblLista = this.dataSourceHor.data.filter(filtro => filtro != obj)
      this.dataSourceHor = new MatTableDataSource(this.lblLista); 
      this.fnDisabledArticuloHor(this.lblLista);  
      return;
    }

    pParametro.push(this.nidCentroCosto)  
    pParametro.push(this.idPartida)  
    this.dataSourceHor.data.map((Det,ii) =>{ 
      if(ii === i) return;

      this.clsColumnaOpc.map((suc) =>{  
        let pParFila= []; 
        if(+suc.cant > 0){
          pParFila.push(suc.idSucursal); 
          pParFila.push(Det.articulo);
          pParFila.push(suc.cant);
          pParFila.push(Det.precio);
          pDet.push(pParFila.join(','))   
        }
      }) 

    })
    pParametro.push(pDet.join('/')) 

    lError = await this.fnValidarPrecioHor(pParametro);
 
    if (lError) {  
      this.spinner.hide();
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'el articulo ya tiene gastos.'
      });
    }
    else{
      pParametro.length = 0;
      pParametro.push(this.nidCentroCosto)  
      pParametro.push(this.idPartida)
      pParametro.push(obj.articulo) 
       
      this.spinner.hide();
      Swal.fire({
        title: 'Esta seguro de eliminar?', 
        showCancelButton: true,
        confirmButtonText: `Si`, 
        cancelButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {  
             this.fnEliminarHor(pParametro,obj) 
        } else{  
        }
      }) 
    }
    
  }
 
  async fnEliminarHor(pParametro,obj){
    this.spinner.show();
    await this.vSerPresupuesto.fnPresupuesto( 35, pParametro, this.url).then( (value: any) => { 
      this.nidEliminar =1;
      this.lblLista = this.dataSourceHor.data.filter(filtro => filtro != obj)
      this.dataSourceHor = new MatTableDataSource(this.lblLista); 
      this.fnDisabledArticuloHor(this.lblLista);   
    },error => {
      console.log(error); 
    });  
    this.spinner.hide();
  }
  //#endregion

  //#region tipo (Vertical) 
  fnListaVertical(){
    if(this.tVertical.length === 0){
      this.tVertical.push(
        {
          id:null,
          ciudad:null,
          articulo:null,
          precio:null,
          cantidad:null,
          total: 0,
          stotal: '0',
          preciocompra:null,
          cantidadcompra:null 
        }) 
    }  
    
    this.dataSource =  new MatTableDataSource(this.tVertical); 
  }

  
  //#endregion
  

  //#region salir
  onNoClick(): void {
    this.dialogRef.close({data: this.nidEliminar});
  }
  //#endregion

  //#region calculo
  async fnCalTotal(obj){
     if(typeof this.dataSourceHor.data === "undefined"){ 
     }
     else{

      let pParametro= []; 
      let pDet= [];  
      let lError = false; 
      
      pParametro.push(this.nidCentroCosto)  
      pParametro.push(this.idPartida) 
      this.dataSourceHor.data.map((Det,ii) =>{  
        this.clsColumnaOpc.map((suc) =>{  
          
          let pParFila= []; 
          if(+suc.cant > 0 && suc.idSucursal === obj.idSucursal){
            pParFila.push(suc.idSucursal); 
            pParFila.push(Det.articulo);
            pParFila.push(suc.cant);
            pParFila.push(Det.precio);
            pDet.push(pParFila.join(','))   
          }
        })  
      })
      pParametro.push(pDet.join('/')) 

      lError = await this.fnValidarPrecioHor(pParametro);
 
      if (lError) {  
        this.dataSourceHor.data.map((ele,i)=>{
          let arraySelects = new Object();
          let total:number = 0;  
          let precio:number = ele.precio;
  
          this.clsColumnaOpc.map((suc)=>{
            let resultado = precio * +suc.cant;
            if(suc.idSucursal === obj.idSucursal){
              resultado = 0
              arraySelects[suc.id] = this.fnDecimal(resultado)  
              total += resultado ;
              suc.cant = 0;
            }
            else
            {
              arraySelects[suc.id] = this.fnDecimal(resultado)  ;  
              total += resultado  
            } 
          }) 
          this.dataSourceHor.data[i].pTotal = total
          this.dataSourceHor.data[i].lsucursal = arraySelects 
        })

        this.spinner.hide();
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'el articulo ya tiene gastos.'
        });
      }
      else{
        this.spinner.hide();
        this.dataSourceHor.data.map((ele,i)=>{
          let arraySelects = new Object();
          let total:number = 0;  
          let precio:number = ele.precio;
  
          this.clsColumnaOpc.map((suc)=>{
            let resultado = precio * +suc.cant;
            arraySelects[suc.id] = this.fnDecimal(resultado)  ;  
            total += resultado 
          }) 
          this.dataSourceHor.data[i].pTotal = total
          this.dataSourceHor.data[i].lsucursal = arraySelects 
        })
      } 
     }


  }
  async fnCalPersonaHor(obj,i){
    var arraySelects = new Object();
    let precio:number = obj.precio;
    let total:number = 0;  
    let pParametro= []; 
    let pDet= [];  
    let lError = false;
 
    pParametro.push(this.nidCentroCosto)  
    pParametro.push(this.idPartida)  
    this.dataSourceHor.data.map((Det,ii) =>{  
      this.clsColumnaOpc.map((suc) =>{  
        let pParFila= []; 
        if(+suc.cant > 0){
          pParFila.push(suc.idSucursal); 
          pParFila.push(Det.articulo);
          pParFila.push(suc.cant);
          pParFila.push(Det.precio); 

          if(+Det.precio < 0 || suc.cant < 0)
          {
            lError = true;
            return;
          }
          pDet.push(pParFila.join(','))   
        }
      }) 

    })

    if(lError){
      
      this.clsColumnaOpc.map((ele)=>{ 
        arraySelects[ele.id] = '0' ;   
      }) 
      this.dataSourceHor.data[i].precio = 0
      this.dataSourceHor.data[i].cantidad = 0
      this.dataSourceHor.data[i].pTotal = 0
      this.dataSourceHor.data[i].lsucursal = arraySelects    

      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'el precio o la cantidad no puede ser negativo'
      }); 
    }

    pParametro.push(pDet.join('/'))
    lError = await this.fnValidarPrecioHor(pParametro);
    this.spinner.hide();

    if (lError) {
      this.clsColumnaOpc.map((ele)=>{ 
        arraySelects[ele.id] = '0' ;   
      }) 
      this.dataSourceHor.data[i].pTotal = 0
      this.dataSourceHor.data[i].lsucursal = arraySelects    
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'el articulo ya tiene gastos.'
      });
    }
    else{ 
      this.clsColumnaOpc.map((ele)=>{
        let resultado = precio * +ele.cant;
        arraySelects[ele.id] = this.fnDecimal(resultado) ;  
        total += resultado 
      }) 
      this.dataSourceHor.data[i].pTotal = total
      this.dataSourceHor.data[i].lsucursal = arraySelects  
    }
    
    
  }

  fnCalPersona(obj,i){
    let error =false;
    let precio: number  = obj.cantidad
    let cantidad:number = obj.precio
    let total:number = (precio == null? 0:precio) *  (cantidad == null? 0:cantidad) ;  
    let stotal:string = this.fnDecimal(total)
    let totalu :number =  this.dataSource.data[i].total ;
    this.dataSource.data[i].total = total.toFixed(2); 
    this.dataSource.data[i].stotal = stotal; 

    let totalVla:number = 0;

    if((precio == null? 0:precio)<0 || (cantidad == null? 0:cantidad) <0){
      error = true;
      this.dataSource.data[i].precio = 0; 
      this.dataSource.data[i].cantidad = 0; 
      this.dataSource.data[i].total = 0; 
      this.dataSource.data[i].stotal = '0';   
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'el precio o la cantidad no puede ser negativo'
      });  
    }

    this.dataSource.data.map((e)=>{ 
      if(e.ciudad ===obj.ciudad){ 
        if(+e.total <0){
          error = true;
          return
        } 
        
        totalVla += +e.total
      }
    }) 
    
    if(error){ 
      this.dataSource.data[i].total = 0; 
      this.dataSource.data[i].stotal = '0';   
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'el precio o la cantidad no puede ser negativo'
      });
    }
    else{
      this.fnValidarPrecio(obj.ciudad,obj.articulo,totalVla,totalu,i);  
    }
    
  }

  
  async fnValidarPrecioHor(param){
    this.spinner.show(); 
    let bReturn = true;
    await this.vSerPresupuesto.fnPresupuesto(34, param, this.url).then((value: any) => {
      if(value.cod === "1"){
        bReturn = false;
      } 
    }); 
    return bReturn; 
  }

  async fnValidarPrecio(ciudad,articulo,totalVla,total,i){
    let pParametro= [];   
    pParametro.push(this.nidCentroCosto); 
    pParametro.push(this.idPartida); 
    pParametro.push(ciudad);
    pParametro.push(articulo);
    pParametro.push(totalVla);
    
    await this.vSerPresupuesto.fnPresupuesto( 31, pParametro, this.url).then( (value: any) => {   
      if(value.cod === '0'){
        this.dataSource.data[i].total = 0; 
        this.dataSource.data[i].stotal = '0';  
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'el articulo ya tiene gastos.'
        });
      }
      else{

      } 

    }, error => {
      console.log(error); 
    });  
    
  }

  //#endregion

  //#region articulo
  async fnArticulo(){
    let pParametro= [];   
    pParametro.push(this.idPartida);
    await this.vSerPresupuesto.fnPresupuesto( 19, pParametro, this.url).then( (value: any[]) => { 
      this.lcboArticulo = value  

      this.lcboCiudad.map((e)=>{
        this.arrayArticulo[e.pId] = value;
      } ); 
      this.fnDisabledArticuloTotal();
      if(this.tipo === 2){
        this.fnDisabledArticuloHor(this.lblLista);  
      }

    }, error => {
      console.log(error); 
    }); 
    
  }

  fnDisabledArticuloTotal(){  
    let lArticulo =  [];

    this.lcboCiudad.map( (c)=>{

      if(typeof this.dataSource === "undefined"){ 
      }
      else{
        this.dataSource.data.map((e) =>{
          if(e.ciudad === c.pId){
            lArticulo.push(e.articulo)
          }  
        });
      }
       

      this.arrayArticulo[c.pId].forEach(element => { 
        if(lArticulo.includes(element.pId) == true){  
            element.pEstado = 0; 
        }
        else{ 
          element.pEstado = 1;  
        } 
      });

    }) 

 

   
  }


  fnDisabledArticulo(ciudad,articulo){  
    let lArticulo =  [];

    this.dataSource.data.map((e) =>{
      if(e.ciudad === ciudad){
        lArticulo.push(e.articulo)
      }
    }); 

    this.arrayArticulo[ciudad].forEach(element => {  
      if(lArticulo.includes(element.pId) == true){  
          element.pEstado = 0; 
      }
      else{ 
        element.pEstado = 1;  
      }
      
    }); 
    
  }

  fnDisabledArticuloHor(Obj){  
    let lArticulo =  [];

    Obj.map((e) =>{ 
        lArticulo.push(e.articulo) 
    }); 

    this.lcboArticulo.forEach(element => {  
      if(lArticulo.includes(element.pId) == true){  
          element.pEstado = 0; 
      }
      else{ 
        element.pEstado = 1;  
      }
      
    }); 
    
  }

  async fnUlt(idArt,index){ 
    var arraySelects = new Object();
    let pParametro= [];   
    pParametro.push(idArt);
    await this.vSerPresupuesto.fnPresupuesto( 20, pParametro, this.url).then( (value: any) => { 
      
      if(this.tipo === 2){
        this.clsColumnaOpc.forEach(element => {
          arraySelects[element.id] = '0'; 
        });

        this.dataSourceHor.data[index].preciocompra = value.nPrecioUltimaCompra;
        this.dataSourceHor.data[index].cantidadcompra = value.nCantidadUltimaCompra; 
        this.fnDisabledArticuloHor(this.dataSourceHor.data);
      }
      else{
        this.dataSource.data[index].preciocompra = value.nPrecioUltimaCompra;
        this.dataSource.data[index].cantidadcompra = value.nCantidadUltimaCompra;  
        this.dataSource.data[index].precio = null
        this.dataSource.data[index].cantidad = null
        this.dataSource.data[index].total = 0  
        this.dataSource.data[index].stotal = '0'; 
        this.fnDisabledArticulo(this.dataSource.data[index].ciudad,idArt);
      }
      

    }, error => {
      console.log(error); 
    }); 
  }
  //#endregion
 
  //#region agregar o eliminar una fila Vertical
  openPartida(){
     

    let val = 0;
    if(this.tGestor.length != 0){ 
      
      this.dataSource.data.map((e)=>{ 
        
        if(e.total === 0){ 
          val = 1;
          return;
        }
        else if(e.total === '0'){ 
          val = 1;
          return;
        }
      });
    }

    if(val === 1){
      return;
    }

    
    this.tVertical.push(
      {
        id:null,
        ciudad:null,
        articulo:null,
        precio:null,
        cantidad:null,
        total: 0,
        stotal: '0',
        preciocompra:null,
        cantidadcompra:null 
      }) 
    this.dataSource =  new MatTableDataSource(this.tVertical);  
  }

  async fnEliminarTPartida(obj,index){    
    let pParametro= [];   
    pParametro.push(this.nidCentroCosto); 
    pParametro.push(this.idPartida); 
    pParametro.push(obj.ciudad); 
    pParametro.push(obj.articulo);  
    if(obj.articulo === '')
    { 
      this.tVertical = this.dataSource.data.filter(filtro => filtro != obj)
      this.dataSource = new MatTableDataSource(this.tVertical); 
      this.fnDisabledArticuloTotal()  
      return
    }
    else{
      this.spinner.show();
      await this.vSerPresupuesto.fnPresupuesto( 29, pParametro, this.url).then( (value: any) => { 
        if(value.cod === '0'){
          this.spinner.hide();  
          return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: value.mensaje
          });
        } 
        else{
          this.spinner.hide();  
          Swal.fire({
            title: 'Esta seguro de eliminar?', 
            showCancelButton: true,
            confirmButtonText: `Si`, 
            cancelButtonText: `No`,
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) { 
              if(value.cod === '2'){
                this.tVertical = this.dataSource.data.filter(filtro => filtro != obj)
                this.dataSource = new MatTableDataSource(this.tVertical);
                this.fnDisabledArticuloTotal();  
              }
              else{ 
                 this.fnEliminar(obj,pParametro)
              }
              
            } else{ 
  
            }
          })
        }
      }, error => {
        this.spinner.hide();
        console.log(error); 
      }); 

    }
    

  } 

  async fnEliminar(Obj,pParametro){
 
    this.spinner.show();
    await this.vSerPresupuesto.fnPresupuesto( 30, pParametro, this.url).then( (value: any) => { 
      this.nidEliminar =1;
      this.tVertical = this.dataSource.data.filter(filtro => filtro != Obj)
      this.dataSource = new MatTableDataSource(this.tVertical);  
      this.fnDisabledArticuloTotal();
      
    }, error => {
      this.spinner.hide();
      console.log(error); 
    }); 
    this.spinner.hide();
  }

  //#endregion
 
  //#region guardar
  ValidarGuardar(){ 
    let pParametro= [];    
    let pDet= [];  
    let val = 0;  
    
    pParametro.push(this.nidCentroCosto);
    pParametro.push(this.id);
    pParametro.push(this.idPartida); 
    pParametro.push(this.Margen); 
    pParametro.push(this.pais);
    if(this.tipo ===2){ 
      this.dataSourceHor.data.map((Det) =>{   
         
        
        this.clsColumnaOpc.map((suc) =>{  
          let pParFila= []; 
          if(+suc.cant > 0){
            pParFila.push(suc.idCCS); 
            pParFila.push(Det.articulo);
            pParFila.push(suc.cant);
            pParFila.push(Det.precio);
            pParFila.push(Det.preciocompra);
            pParFila.push(Det.cantidadcompra); 
            pDet.push(pParFila.join(','))   
          }
          
        })

        if(Det.pTotal === 0){
          val = 1;
          return;
        }
        else if(Det.articulo === 0){
          val = 2;
          return;
        }
        else if(Det.articulo === null){
          val = 2;
          return;
        }
      })
    } 
    else{
      this.dataSource.data.map((Det) =>{ 
      
        let pParFila= [];    
        pParFila.push(Det.ciudad); 
        pParFila.push(Det.articulo);
        pParFila.push(Det.cantidad);
        pParFila.push(Det.precio);
        pParFila.push(Det.preciocompra);
        pParFila.push(Det.cantidadcompra);  
        if(Det.total === 0){
          val = 1;
          return;
        }
        else if(Det.articulo === 0){
          val = 2;
          return;
        }
        else if(Det.articulo === null){
          val = 2;
          return;
        }
        pDet.push(pParFila.join(','))  
      })
    }  
    
    if(val ===1){
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese el precio y cantidad del articulo'
      });
    }
    if(val ===2){
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese el articulo'
      });
    }

    pParametro.push(pDet.join('/'));
    pParametro.push(this.tipo);  
    
    this.Guardar(pParametro)
  }

  async Guardar(Parametro){   
    await this.vSerPresupuesto.fnPresupuesto( 21, Parametro, this.url).then( (value: any) => {   
      this.dialogRef.close({data: 1});
    }, error => {
      console.log(error); 
    }); 
  }

  //#endregion

  
  //#region total
  public Cantidad(): string {
    let num : number = 0;
    if(this.tipo === 2){
      this.dataSourceHor.data.forEach(element => {
        num++;
      });
    }
    else{
      this.dataSource.data.forEach(element => {
        num++;
      });
    }
     
    return ''+num;
  }
  public Precio(): string {
    let num : number = 0; 

    if(this.tipo === 2){
      this.dataSourceHor.data.forEach(element => {
        num += +element.pTotal 
      });
    }
    else{
      this.dataSource.data.forEach(element => {
        num += +element.total 
      }); 
    }
       
    
    let final = this.fnDecimal(num);
    
    return final;
  }

  public fnDecimal (num:number): string { 
    let anuncio : string ='' 
    let numfin = +num.toFixed(2)
    anuncio = numfin.toLocaleString();
    let result = anuncio.split(',') 
    let re = /\./gi;
    let numero : string =result[0].replace(re,',')
    let decimal : string = (typeof result[1] === 'undefined'? '00':result[1])
    
    let final = numero+'.'+decimal
    
    return final;
  }
  //#endregion
 

  //#region ciudad
  fnCiudad(index){  
    
    this.fnDisabledArticulo(this.dataSource.data[index].ciudad,this.dataSource.data[index].articulo);  
    this.dataSource.data[index].articulo = null
    this.dataSource.data[index].precio = null
    this.dataSource.data[index].cantidad = null
    this.dataSource.data[index].total = 0
    this.dataSource.data[index].stotal = '0'
    this.dataSource.data[index].preciocompra = null
    this.dataSource.data[index].cantidadcompra =  null  
      
  }
  //#endregion
}
