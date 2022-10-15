import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { CompraService } from '../compra.service';
import { ComprasDialogComponent } from '../compras-dialog/compras-dialog.component';
import { OrdenCompraCrearComponent } from './orden-compra-crear/orden-compra-crear.component';
import { OrdenCompraFileComponent } from './orden-compra-file/orden-compra-file.component';


//Modelo de orden de compra
export interface OrdenCompra {
  nIdOC: number;
  sAnio: string;
  nIdCC: number;
  sCodCC: string;
  sDescCC: string;
  nOrd: number;
  sTitulo: string;
  sFechaOC: string;
  sFechaEntrega: string;
  nIdProveedor: number;
  sDescProveedor: string;
  nTotalUnidad: number;
  nTotal: number;
  sOrden: string;
  sEstado: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-orden-compra',
  templateUrl: './orden-compra.component.html',
  styleUrls: ['./orden-compra.component.css'],
  animations: [asistenciapAnimations]
})
export class OrdenCompraComponent implements OnInit {


  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'post_add', tool: 'Nueva orden de compra' },
  ];
  abLista = [];

  dataSource: MatTableDataSource<any>;

  vPrincipal: boolean = true;
  vSecundario: boolean = false;

  ///===================
  pEntidad = 1; //Cabecera del movimiento
  pOpcion = 2;  //CRUD -> Listar
  pParametro = []; //Parametros de campos vacios
  pTipo = 1;       //Listar Solo Guias de ingreso
  pDetalle = []//Parametros de campos vacios
  //========================


  vOrdenCompraSeleccionado: OrdenCompra;
  vOpcion: number;
  // Asigancion para Paginar y ordedar las columnas de mi tabla
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @ViewChild(OrdenCompraCrearComponent) ordenCompraCrearComp: OrdenCompraCrearComponent;

  faltanArticulos: boolean = false; // Booleano para verificar si hay una escasez de articulos


  displayedColumns = ['nIdOC', 'anio', 'centroCosto', 'sDocumento', 'Titulo', 'FechaRegistro',
    'FechaEntrega', 'Proveedor', 'cantidad', 'sTotal', 'sMoneda', 'TipoDOC', 'Estado', 'sVB', 'sPDF'
  ];

  txtFiltroGen = new FormControl();

  url: string; //variable de un solo valor
  idUser: number; //id del usuario
  pNom: string;    //Nombre Usr
  idEmp: string;  //id de la empresa del grupo Actual
  pPais: string;  //Codigo del Pais de la empresa Actual
  sLista: any[] = []


  filtroEstado = new FormControl(); // Para filtrar la tabla por estado

  lArticulosStockMinimo: any[]; // Lista de articulos para comparar el stock minimo

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    public vOrdenCompraService: CompraService,
    @Inject('BASE_URL') baseUrl: string,
    private route: Router
  ) { this.url = baseUrl; }

  async ngOnInit(): Promise<void> {
    this.onToggleFab(1, -1);
    /*
    if(this.faltanArticulos){

      // Recuperamos el estado del dialog
      const dialogVisto = localStorage.getItem('alertaComprasVisto') || false;

      // Si no existe nada en el localStorage, se muestra el dialog
      if(!dialogVisto){
        this.fnAbrirDialogAlertaArticulos();
      }

      // Si existe, se revisa el tiempo transcurrido
      else if(dialogVisto){
        const dialogVistoJSON = JSON.parse(dialogVisto);

        // Si ya paso el tiempo transcurrido, se mostrara de nuevo
        if(dialogVistoJSON.visto && dialogVistoJSON.tiempoEspera < new Date()){
          this.fnAbrirDialogAlertaArticulos();
        }
      }

    }
    */

    this.spinner.show();

    let user = localStorage.getItem('currentUser'); //encriptacion del usuario
    this.idUser = JSON.parse(window.atob(user.split('.')[1])).uid;
    this.pNom = JSON.parse(window.atob(user.split('.')[1])).uno;
    this.idEmp = localStorage.getItem('Empresa');
    this.pPais = localStorage.getItem('Pais');
    this.filtroEstado.setValue("0");

    // Abrir dialog si hay escacez de articulos
    await this.fnListarArticulosStockMinimo();

    this.ListarContenido();

    this.spinner.hide();
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }


  fnListarOrdenCompra = function () {
    var ordenCompras = this.lOrdenCompra;
    this.dataSource = ordenCompras;
  }

  fnVerDetalle(row) {
    this.route.navigate(['/controlcostos/compra/CrearOC', row])
  }

  fnArchivos(nId, row) {

    var Numero = row.sNumeroDoc
    this.dialog.open(OrdenCompraFileComponent, {
      width: '80%',
      data: { nId, Numero },
      disableClose: true
    });
  }

  fnCrearOrdenCompra() {
    this.route.navigate(['/controlcostos/compra/CrearOC', 0])
  }

  fnSalir() {
    this.vSecundario = false;
    this.vPrincipal = true;
    this.fnListarOrdenCompra();
  }

  fnFiltrar() {
    var filtro = "";

    if (this.txtFiltroGen.value == null) {
      return;
    }
    filtro = this.txtFiltroGen.value.trim(); // Remove whitespace
    filtro = filtro.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filtro;
  }

  async fnListarArticulosStockMinimo() {
    const pParametro = []
    const pEntidad = 6;
    const pOpcion = 2;
    const pTipo = 1;
    pParametro.push(this.idEmp);
    pParametro.push(this.pPais);
    this.lArticulosStockMinimo = await this.vOrdenCompraService.fnDatosOrdenCompras(pEntidad, pOpcion, pParametro, pTipo, this.url).toPromise();

    // Si al menos el stock de un articulo es menor a la cantidad minima posible de ese articulo, muestra el dialog
    for (const articulo of this.lArticulosStockMinimo) {
      if (articulo.nStockActual < articulo.nCantMin) {
        this.fnAbrirDialogAlertaArticulos();
        break;
      }
    }
  }

  ListarContenido() {

    this.spinner.show();
    this.pParametro = []

    this.pEntidad = 1
    this.pOpcion = 2
    this.pTipo = 1;
    this.pParametro.push(this.idEmp)
    this.pParametro.push(this.filtroEstado.value || 0)

    this.vOrdenCompraService.fnDatosOrdenCompras(this.pEntidad, this.pOpcion, this.pParametro, this.pTipo, this.url).subscribe(
      res => {
        this.sLista = res
        let array = res.map(item => {
          return {
            nId: item['nId'],
            anio: item['anio'],
            centroCosto: item['centroCosto'],
            Titulo: item['titulo'],
            FechaRegistro: item['fechaRegistro'],
            FechaEntrega: item['fechaEntrega'],
            Proveedor: item['proveedor'],
            cantidad: item['cantidad'],
            TipoDOC: item['tipoDOC'],
            Estado: item['estado'],
            sNumeroDoc: item['sNumeroDoc'],
            sTotal: parseFloat(item['total']),
            sMoneda: item['sMoneda'],
            sDocumento: item['sDocumento'],
            sPDF: item['sPdf'],
            sVB: item['sVB'],
          }
        })
        // console.log(array);
        this.dataSource = new MatTableDataSource(array);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      err => {
        this.spinner.hide();
        console.log(err);
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  fnRedondear(num) {
    var pow = Math.pow(10, 2);
    // console.log(pow);
    // console.log(num);
    return Math.round(num * pow) / pow;
  }

  // Se abre un dialog de alerta ni bien carga la pagina por si se necesita renovacion de un cierto stock
  fnAbrirDialogAlertaArticulos() {
    this.dialog.open(ComprasDialogComponent, { data: this.lArticulosStockMinimo, disableClose: true, width: "900px" });
  }

  //Botones Flotantes 
  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnCrearOrdenCompra()
        break
      default:
        break
    }
  }
}
