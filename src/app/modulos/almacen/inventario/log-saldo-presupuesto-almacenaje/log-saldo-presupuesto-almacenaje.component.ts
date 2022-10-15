import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import { InventarioService } from '../inventario.service';

@Component({
  selector: 'app-log-saldo-presupuesto-almacenaje',
  templateUrl: './log-saldo-presupuesto-almacenaje.component.html',
  styleUrls: ['./log-saldo-presupuesto-almacenaje.component.css'],
  animations: [asistenciapAnimations]
})
export class LogSaldoPresupuestoAlmacenajeComponent implements OnInit {

  // Variables de sesion (LocalStorage)
  idEmpresa;
  idUsuario;
  idPais;
  estaCargado: boolean = false; // Variable para ver cuando la pagina este completamente cargada

  // Formulario
  formCabecera: FormGroup // Cabecera

  // Combobox
  cbEmpresas: any[] = [];
  // cbEjecutivos: any[] = [];

  // Tabla
  dataSource: MatTableDataSource<any>;
  lTablaSaldoPresupuestoAlmacenaje: any[] = [];
  displayedColumns: string[] = ["sNombreComercial", "sCentroCosto", "sDirectorCuentas", "sEjecutivo", "dFechaIni", "dFechaFin", "sAlmacen", "sPagaAlmacenamiento", "nSaldo", "nPallet", "nVolumen", "nDiasExcedidos"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'search', tool: 'Buscar', state: true},
  ];
  abLista = [];
  mostrarBotones = true;

  constructor(private fb: FormBuilder,
    private inventarioService: InventarioService,
    @Inject('BASE_URL') private baseUrl: string,
    private spinner: NgxSpinnerService,
    protected _changeDetectorRef:ChangeDetectorRef
  ) {
    this.dataSource = new MatTableDataSource(this.lTablaSaldoPresupuestoAlmacenaje);

    // Agregar busqueda por fechas
    const pipe = new DatePipe('en');
    const defaultPredicate = this.dataSource.filterPredicate;
    this.dataSource.filterPredicate = (data, filter) => {
      const formatted = pipe.transform(data.dFechaIni, 'dd/MM/yyyy');
      return formatted.indexOf(filter) >= 0 || defaultPredicate(data, filter);
    }
  }

  async ngOnInit(): Promise<void> {
    this.spinner.show();

    // Inicializando variables de sesion
    this.idEmpresa = localStorage.getItem("Empresa");
    const currentUserBase64 = localStorage.getItem("currentUser");
    this.idUsuario = JSON.parse(window.atob(currentUserBase64.split(".")[1])).uid;
    this.idPais = localStorage.getItem("Pais");

    this.onToggleFab(1,-1);

    // Creacion del formulario
    await this.crearFormularios();

    // Llenado de combobox
    await this.fnLlenarComboboxEmpresaPorPais();

    // Llenado de la tabla
    setTimeout(async () => {
      await this.fnLlenarTabla();
    });
    this.estaCargado = true; // Mostrar todos los elementos al cargar todo
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async crearFormularios(): Promise<void>{
    // Formulario de la cabecera
    return new Promise((resolve, reject) =>{
      this.formCabecera = this.fb.group({
        empresa: null,
        bPoseeAlmacenaje: "0",
      });
      resolve();
    })
  }

  //#region Botones
  onToggleFab(fab: number, stat: number) {

    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
  }

  clickFab(index: number) {
    switch (index) {
      case 0:
        this.fnLlenarTabla();
      default:
        break;
    }
  }
  //#endregion

  //#region Tabla principal

  // Metodo para llenar la lista con la que se llenara la tabla
  async fnLlenarTabla(){

    this.spinner.show();

    const pEntidad = 1;
    const pOpcion = 2;
    const pParametro = []; //Parametros de campos
    const pTipo = 1;

    pParametro.push(this.formCabecera.get("empresa").value); // Asignar empresa
    pParametro.push(this.idPais); // Asignar pais de la empresa
    pParametro.push(this.formCabecera.get("bPoseeAlmacenaje").value); // Asignar pais de la empresa

    const saldosPresupuestoAlmacenaje = await this.inventarioService.fnSaldoPresupuestoAlmacenaje(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

    // Dandole el formato correcto a las fechas
    saldosPresupuestoAlmacenaje.forEach(function(part, index) {
      saldosPresupuestoAlmacenaje[index].dFechaIni = moment(saldosPresupuestoAlmacenaje[index].dFechaIni).format('DD/MM/YYYY');
      saldosPresupuestoAlmacenaje[index].dFechaFin = moment(saldosPresupuestoAlmacenaje[index].dFechaFin).format('DD/MM/YYYY');
    });



    if(this.formCabecera.get("bPoseeAlmacenaje").value != "0"){

      const saldosPresupuestosAlmacenajeFiltrado = [];

      if(this.formCabecera.get("bPoseeAlmacenaje").value == "1"){
        saldosPresupuestoAlmacenaje.forEach(function(part) {
          if(part.sPagaAlmacenamiento == "SI"){
            saldosPresupuestosAlmacenajeFiltrado.push(part);
          }
        });
      }
      if(this.formCabecera.get("bPoseeAlmacenaje").value == "2"){
        saldosPresupuestoAlmacenaje.forEach(function(part) {
          if(part.sPagaAlmacenamiento == "NO"){
            saldosPresupuestosAlmacenajeFiltrado.push(part);
          }
        });
      }

      this.lTablaSaldoPresupuestoAlmacenaje = saldosPresupuestosAlmacenajeFiltrado;
    }
    else{
      this.lTablaSaldoPresupuestoAlmacenaje = saldosPresupuestoAlmacenaje;
    }

    await this.fnGenerarTabla();

    this.spinner.hide();
  }


  // Metodo para crear o refrescar la mat-table
  fnGenerarTabla(): Promise<void>{
    return new Promise((resolve, reject) =>{
      this.dataSource = new MatTableDataSource(this.lTablaSaldoPresupuestoAlmacenaje);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      resolve();
    });
  }

  // Metodo para buscar en la mat-table
  fnFiltrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  //#endregion

  //#region Combobox

  async fnLlenarComboboxEmpresaPorPais(){

    const pEntidad = 1;
    const pOpcion = 2;
    const pParametro = []; //Parametros de campos
    const pTipo = 2;

    pParametro.push(this.idPais); // Asignar pais de la empresa

    this.cbEmpresas = await this.inventarioService.fnSaldoPresupuestoAlmacenaje(pEntidad, pOpcion, pParametro, pTipo, this.baseUrl);

    console.log(this.cbEmpresas);

    // Asignar en el combobox la empresa actual como primer valor
    setTimeout(async () => {
      this.formCabecera.get("empresa").setValue(Number(this.idEmpresa));
    });
  }

  //#endregion

}
