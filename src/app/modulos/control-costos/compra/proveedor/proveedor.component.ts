import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { CompraService } from '../compra.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProveedorDirecComponent } from '../proveedor/proveedorCrear/proveedorDirec/proveedorDirec.component';
import { FormControl } from '@angular/forms';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css'],
  animations: [asistenciapAnimations]
})
export class ProveedorComponent implements OnInit {
  url: string; //variable de un solo valor
  pPais: string;
  txtFiltro = new FormControl();


  // Botones Flotantes Pantalla 
  tsLista = 'inactive';  // Inicia la lista visible
  fbLista = [ // Lista de las opciones que se mostrarán
    { icon: 'add', tool: 'Nuevo' },
  ];
  abLista = [];

  searchKey: string
  listaData: any[] = []
  displayedColumns: string[] = ['opciones',/*'id',   'sTipoContribuyente',*/ 'sRuc', 'sRazonSocial', 'sNombreComercial', 'sGiroNegocio', 'sEstado'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private spinner: NgxSpinnerService, private vDatoBasicoService: CompraService, @Inject('BASE_URL') baseUrl: string, public dialog: MatDialog,
    private route: Router) {
    this.url = baseUrl;
  }

  ngOnInit(): void {
    this.onToggleFab(1, -1);

    this.pPais = localStorage.getItem('Pais');
    this.ListarConteniedo()
  }

  vPrincipal: boolean = true;
  //******************************************************************************************************************** */
  //Zona de implementacion de funciones  
  //******************************************************************************************************************** */

  ListarConteniedo = function () {
    this.spinner.show();
    let vFiltro = ""

    var pEntidad = 1; //Cabecera del movimiento
    var pOpcion = 2;  //CRUD -> Listar
    var pParametro = []; //Parametros de campos vacios
    var pTipo = 1;       //Listar Solo Guias de ingreso

    pParametro.push(this.pPais);
    this.vDatoBasicoService.fnDatoBasico(pEntidad, pOpcion, pParametro, pTipo, this.url).subscribe(
      res => {
        this.libro = res;
        let array = res.map(item => {
          return {
            pIdPost: item['pIdPost'],
            sTipoEntidad: item['sTipoEntidad'],
            sTipoContribuyente: item['sTipoContribuyente'],
            sRuc: item['sRuc'],
            sRazonSocial: item['sRazonSocial'],
            sNombreComercial: item['sNombreComercial'],
            sPaginaWeb: item['sPaginaWeb'],
            sTelefono1: item['sTelefono1'],
            sTelefono2: item['sTelefono2'],
            sContacto: item['sContacto'],
            sContactoCorreo: item['sContactoCorreo'],
            sContactoTelefono: item['nPlazoPago'],
            sGiroNegocio: item['sGiroNegocio'],
            sBanco: item['sBanco'],
            sNumCuenta: item['sNumCuenta'],
            sNumCuentaInterbancaria: item['sNumCuentaInterbancaria'],
            sEstado: item['sEstado']

          }
        })
        this.dataSource = new MatTableDataSource(array);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        //Si la busqueda cuenta con datos aplicamos el mismo filtro 
        const filterValue = this.txtFiltro.value == null ? '' : this.txtFiltro.value;
        if (filterValue != "") {
          this.dataSource.filter = filterValue.trim().toLowerCase();
        }

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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  limpiar() {
    this.searchKey = ""
    this.ListarConteniedo()
  }

  nuevo() {

    this.route.navigate(['/controlcostos/compra/proveedor/', 0])
  }

  Editar(termino: number) {

    this.route.navigate(['/controlcostos/compra/proveedor/', termino])
  }

  agregarDirecion(termino: number, nombre: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      id: termino,
      nombre: nombre
    };
    const digalogReg = this.dialog.open(ProveedorDirecComponent, dialogConfig);
    digalogReg.afterClosed().subscribe(data => {
      this.ListarConteniedo()
    })
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
        this.nuevo()
        break
      default:
        break
    }
  }
}
