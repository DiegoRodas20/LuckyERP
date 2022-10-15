import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router'; 
 
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DD_MM_YYYY_Format, Utilitarios } from 'src/app/modulos/control-costos/compra/orden-compra-sc/repository/utilitarios';
import { NgxSpinnerService } from 'ngx-spinner'; 
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { DataService } from '../../../repository/services/data.service';
import { ComprobanteEntity, ComprobanteYear } from '../../../repository/models/general.Entity';
import { FacturacionService } from '../../../repository/services/facturacion.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: "app-comprobante-list",
  templateUrl: "./comprobante-list.component.html",
  styleUrls: ["./comprobante-list.component.css"],
  animations: [asistenciapAnimations],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_Format }, DatePipe]
})

export class ComprobanteListComponent implements OnInit {
  displayedColumns: string[] = ['codigoComprobante', 'documento', 'serie', 'numero', 'fecha', 'fechaRegistro', 'cliente','tipo', 'cpptos', 'total', 'estado'];

  constructor(private router: Router, private dataService: DataService, private spinner: NgxSpinnerService, private facturacionService: FacturacionService, private fb: FormBuilder) { 
    
  } 
  utilitarios = new Utilitarios;   

  // Tabla Listado Serie
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ComprobanteList: MatTableDataSource<ComprobanteEntity>;
  lComprobantes :any 
  value = '';
  listadoYearComprobante: ComprobanteYear[];
  formularioComprobantes: FormGroup;


  tsLista = 'active';  // Inicia la lista oculta
  fbLista = [ // Lista de las opciones que se mostrarán
    {icon: 'add', tool: 'Nuevo Comprobante'},
  ];
  abLista = [];
  async ngOnInit(): Promise<void> { 
    this.onToggleFab(1,-1);
    this.crearFormulario();
    await this.obtenerListadoYearComprobante();
    let year = this.formularioComprobantes.get('year').value;
    this.obtenerListadoComprobante(year); 
  }

  add() {
    this.router.navigate(['tfi/facturacion/comprobante/add']);
  } 

  editar(e) {
    this.router.navigate(['tfi/facturacion/comprobante/edit/' + e.codigoComprobante]);
  } 

  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    this.ComprobanteList.filter = (filterValue.trim().toLowerCase());
    if (this.ComprobanteList.paginator) {
      this.ComprobanteList.paginator.firstPage();
    }
  }

  consultaTipoCambio() {
    let fBus = this.formularioComprobantes.value;
    let lista ;
    if(!fBus.inicio){  
      lista = this.lComprobantes.filter(word =>  new Date(word.fechaBus) < new Date(fBus.fin) );
    }
    else if (!fBus.fin){ 
      lista = this.lComprobantes.filter(word => new Date(word.fechaBus) > new Date(fBus.inicio));
    }
    else{ 
      lista = this.lComprobantes.filter(word => {  
        if(new Date(word.fechaBus) >= new Date(fBus.inicio) && new Date(word.fechaBus) <= new Date(fBus.fin) )
          return true;
        else return false;
      }); 
    }  
    this.ComprobanteList = new MatTableDataSource<ComprobanteEntity>(lista);
    this.ComprobanteList.paginator = this.paginator;
    this.ComprobanteList.sort = this.sort;
    this.value = ''; 
    
  } 

  crearFormulario() {
    this.formularioComprobantes = this.fb.group({
      year: [],
      inicio: [],
      fin: []
    })
  }

  async obtenerListadoComprobante(year: string) {
    this.spinner.show();
    await this.facturacionService.get<any[]>(1,1,year) 
      .then((res: any) => { 
        this.value = '';
        this.utilitarios.totalfilas = "Total registros: " + res.body.response.data.length.toString();
        this.lComprobantes = res.body.response.data;
        this.ComprobanteList = new MatTableDataSource<ComprobanteEntity>(res.body.response.data);
        this.ComprobanteList.paginator = this.paginator;
        this.ComprobanteList.sort = this.sort;
        this.formularioComprobantes.get('inicio').setValue('');
        this.formularioComprobantes.get('fin').setValue('');
      },
        (error) => {
          console.error(error); 
      });
        
    this.spinner.hide();
  }

  async obtenerListadoYearComprobante() {
    this.spinner.show();
    const resp: any = await this.facturacionService.getAllYearInComprobante<ComprobanteYear[]>(1);
    this.listadoYearComprobante = resp.body.response.data;
    this.formularioComprobantes.get('year').setValue(this.listadoYearComprobante[0].year); 
    this.spinner.hide();
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.add();
        break;
      default:
        break;
    }
  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {
    
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
 
  }   
}