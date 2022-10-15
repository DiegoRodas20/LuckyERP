import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp, WebApiResponse } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ArticuloTIPrecioDTO } from '../../../api/models/articuloDTO';
import { MonedaPerfilTIDTO } from '../../../api/models/perfilEquipoTIDTO';
import { ArticuloService } from '../../../api/services/articulo.service';
import { PerfilEquipoService } from '../../../api/services/perfil-equipo.service';

@Component({
  selector: 'app-ti-articulo-precios',
  templateUrl: './ti-articulo-precios.component.html',
  styleUrls: ['./ti-articulo-precios.component.css'],
  animations: [asistenciapAnimations]
})
export class TiArticuloPreciosComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables de ayuda
  estaCargado: boolean = false; // Flag para ver cuando la pagina este completamente cargada

  // Mat-Table
  dataSource: MatTableDataSource<ArticuloTIPrecioDTO>;
  listaPrecios: ArticuloTIPrecioDTO[] = [];
  displayedColumns: string[] = ["nPrecio", "sMoneda", "sUsuarioRegistro", "dFechaRegistro", "sEstado"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  pipeTable: DatePipe;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  // Formulario
  formPreciosArticulo: FormGroup;

  // Combobox
  listaMonedas: MonedaPerfilTIDTO[] = [];

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'add', tool: 'Crear nuevo precio', state: true},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Articulo
  nIdArticulo: number;
  sArticulo: string;
  sImagenActual: string;

  constructor(
    private spinner: NgxSpinnerService,
    private _articuloService: ArticuloService,
    private _perfilEquipoService: PerfilEquipoService,
    public dialogRef: MatDialogRef<TiArticuloPreciosComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

    // Inicializar tabla
    this.dataSource = new MatTableDataSource(this.listaPrecios);

    // Creamos el formulario
    this.fnCrearFormulario();

    // Guardamos el id del activo
    this.nIdArticulo = data.nIdArticulo;

    // Dar formato a los dias
    this.pipeTable = new DatePipe('en');
    const defaultPredicate= this.dataSource.filterPredicate;
    this.dataSource.filterPredicate = (data, filter) =>{
      const formattedRegistro = this.pipeTable.transform(data.dFechaRegistro,'dd/MM/yyyy');
      return formattedRegistro.indexOf(filter) >= 0 || defaultPredicate(data,filter);
    }
  }

  async ngOnInit(): Promise<void> {

    this.onToggleFab(1, -1);

    // Actualizamos el nombre del articulo y asignamos una imagen
    this.formPreciosArticulo.get("descripcion").setValue(this.data.sArticulo);

    this.sImagenActual = this.data.sImagenActual;

    // Llenar controles
    await this.fnLlenarComboboxMoneda();

    // Llenar tabla
    await this.fnLlenarTabla();

    this.fnControlFab();

    console.log(this.dataSource.data);

    this.spinner.hide();

  }

  //#region Botones

  // Metodo para abrir/cerrar menu de botones
  onToggleFab(fab: number, stat: number) {
    stat = ( stat === -1 ) ? ( this.abLista.length > 0 ) ? 0 : 1 : stat;
    this.tsLista = ( stat === 0 ) ? 'inactive' : 'active';
    this.abLista = ( stat === 0 ) ? [] : this.fbLista;
  }

  // Metodo para utilizar las funciones del menu de botones
  async clickFab(index: number) {
    switch (index) {
      case 0:
        await this.fnCrearNuevoPrecio();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){
    this.fbLista[0].state = true; 
    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#region Formulario

  fnCrearFormulario(){
    this.formPreciosArticulo = this.fb.group({
      descripcion: [null],
      moneda: [null,  Validators.compose([Validators.required])],
      precio: [null, Validators.compose([Validators.required, Validators.min(0.0001)])],
    })
  }

  //#endregion

  //#region Controles


  async fnLlenarComboboxMoneda(){

    const sIdPais = this.storageData.getPais();

    const result = await this._perfilEquipoService.GetMoneda(sIdPais);

    if(result.success){
      this.listaMonedas = result.response.data;

      // Asignamos la moneda oficial
      const monedaActual = this.listaMonedas.find((moneda) => moneda.bEsOficial);
      this.formPreciosArticulo.get("moneda").setValue(monedaActual.nIdTipEle);
    }
  }

  //#endregion

  //#region Tabla

  // Filtrado de la tabla
  async fnLlenarTabla(){

    try{
      const result = await this._articuloService.GetAllPreciosArticulo(this.nIdArticulo);
      this.listaPrecios = result.response.data;
      this.dataSource.data = this.listaPrecios;
      console.log(this.dataSource.data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      // Primera pagina
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
    catch(err){
      console.log(err);
    }
  }

  //#endregion

  //#region Acciones

  async fnCrearNuevoPrecio(){
    if(this.formPreciosArticulo.valid){

      const confirma = await Swal.fire({
        title: `¿Desea generar un nuevo precio al articulo?`,
        icon: 'question',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar'
      });
  
      if (confirma.isDismissed) {
        return;
      }

      this.spinner.show();

      const model: ArticuloTIPrecioDTO = {
        nIdArticulo: this.nIdArticulo,
        nPrecio: Number(this.formPreciosArticulo.get("precio").value),
        nIdMoneda: Number(this.formPreciosArticulo.get("moneda").value),
        nIdUsrRegistro: this.storageData.getUsuarioId(),
        sPais: this.storageData.getPais()
      };

      const result: WebApiResponse<ArticuloTIPrecioDTO> = await this._articuloService.CreatePrecioArticulo(model);

      if (!result.success) {
        let mensaje = result.errors.map(item => {
          return item.message
        })
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: mensaje.join(', '),
        });
        this.spinner.hide();
        return;
      }

      await this.fnLlenarTabla();

      this.spinner.hide();

      Swal.fire("Correcto", "El precio ha sido actualizado", "success")
    }
    else{
      this.formPreciosArticulo.markAllAsTouched();
    }
  }

  fnVerImagen(): void {

    if (this.sImagenActual != null && this.sImagenActual != '') {
      const { descripcion } = this.formPreciosArticulo.value;
      Swal.fire({ title: descripcion, imageUrl: this.sImagenActual, imageHeight: 250 });
    }
    else {
      Swal.fire({ icon: 'warning', title: ('No hay imagen'), text: `Este artículo no tiene imagen` });
    }

  }

  //#endregion

  //#region Validadores

  fnValidarCaracteresNumericos(event){

    const invalidChars = ["-","+","e"];

    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  fnValidarCaracteresNumericosClipboard(event: ClipboardEvent){

    const invalidChars = ["-","+","e"];

    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    console.log(clipboardData)
    console.log(pastedText)
    const valor = pastedText.split('')

    invalidChars.map((letra)=>{
      if (valor.includes(letra)) {
        event.preventDefault();
      }
    })
  }

  //#endregion

  fnSalir(){
    this.dialogRef.close();
  };

}
