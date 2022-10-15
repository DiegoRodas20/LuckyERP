import { Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { ActivoDesktopTIDTO, ActivoDetalleDesktopDTO, ActivoExcelLaptopDesktopCabeceraDTO, ActivoExcelLaptopDesktopDTO, ActivoLaptopDesktopTIDTO, ActivoRegistroDesktopDTO, ActivoRegistroDTO, ActivoSelectItemDTO } from '../../../api/models/activoDTO';
import { WebApiResponse } from '../../../api/models/apiResponse';
import { ExcelFormato, ExcelObject } from '../../../api/models/excelModel';
import { ActivoService } from '../../../api/services/activo.service';
import { ExcelService } from '../../../api/services/excel.service';

@Component({
  selector: 'app-ti-activo-laptop-desktop-excel',
  templateUrl: './ti-activo-laptop-desktop-excel.component.html',
  styleUrls: ['./ti-activo-laptop-desktop-excel.component.css'],
  animations: [asistenciapAnimations]
})
export class TiActivoLaptopDesktopExcelComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables auxiliares
  tipoActivo;

  // Formulario
  formExcelFormato: FormGroup;
  formCargaMasiva: FormGroup;

  // Archivo
  nombreArchivo: String = 'Seleccione un archivo' // Nombre por defecto

  // Excel
  objectExcel: any[];
  @ViewChild('excelFile') excelFile: ElementRef;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'assignment', tool: 'Cargas Pendientes', state: true, color: 'secondary'},
    {icon: 'add', tool: 'Crear Excel', state: true, color: 'secondary'},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto

  // Mat-Table (Cargas pendientes)
  dataSource: MatTableDataSource<ActivoExcelLaptopDesktopCabeceraDTO>;
  listaCargasPendientes: ActivoExcelLaptopDesktopCabeceraDTO[] = [];
  displayedColumns: string[] = ["nIdAddenda", "sProveedor", "sAddenda", "sTipoActivo", "sArticulo", "sDescripcion", "nCantidad", "dFechaCrea"];
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) public sort: MatSort;
  txtFiltro = new FormControl(); // Filtro de busqueda de la tabla

  // Registro Seleccionado
  registroSeleccionado: ActivoExcelLaptopDesktopCabeceraDTO = null;

  // Flags
  verCargasPendientes = false;
  validarFormulario = new EventEmitter();
  cargaMasivaSubida = false;

  constructor(
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,
    private activoService: ActivoService,
    private fb: FormBuilder,
    private route: Router,
    public dialogRef: MatDialogRef<TiActivoLaptopDesktopExcelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 

    // Crear Formulario
    this.fnCrearFormulario();

    // Inicializar tablas
    this.dataSource = new MatTableDataSource(this.listaCargasPendientes);
  }

  async ngOnInit(): Promise<void> {

    this.tipoActivo = this.data.tipoActivo

    if(this.data.accion == 2){
      this.fnVerCargasPendientes();
    }

    await this.fnLlenarTabla();
    
    this.spinner.hide();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  //#region Formulario
  fnCrearFormulario(){
    this.formExcelFormato = this.fb.group(
      {
        cantidadElementos: [null, Validators.compose([Validators.required])],
      }
    );
    this.formCargaMasiva = this.fb.group(
      {
        fileExcel: [null, Validators.compose([Validators.required])],
      }
    );
  }
  //#endregion

  //#region Acciones

  fnVerCargasPendientes(){
    this.verCargasPendientes = !this.verCargasPendientes;
  }

  //#endregion

  //#region Tabla Cargas Pendientes

  // Llenado de la tabla Activos
  async fnLlenarTabla(){

    try{
      const result = await this.activoService.GetAllCargaMasivaPendientes(this.tipoActivo);
      this.listaCargasPendientes = result.response.data;
      this.dataSource.data = this.listaCargasPendientes;
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

  async fnGenerarFormatoExcel(){
       
    if(
      this.data.excelActivo.proveedor &&
      this.data.excelActivo.addenda &&
      this.data.excelActivo.codigoArticulo &&
      this.data.excelActivo.descripcionArticulo
    ){

      this.spinner.show();

      const result = await this.activoService.GetAllCargaMasivaPendientes(this.tipoActivo);


      if(result){
        const cargasPendientes = result.response.data;
        const existeCargaMismaAddenda = cargasPendientes.find(carga => {
          if(carga.sAddenda == this.data.excelActivo.addenda && carga.sProveedor == this.data.excelActivo.proveedor){
            return carga;
          }
        });

        if(existeCargaMismaAddenda){
          Swal.fire("Alerta", "Ya existe una carga masiva para esa Addenda. Suba los activos pendientes antes de agregar otra", "warning")
          await this.fnLlenarTabla();
          return;
        }
      }

      if(this.formExcelFormato.valid){

        const cantidadElementos = Number(this.formExcelFormato.get("cantidadElementos").value);

        if(cantidadElementos == 0){
          Swal.fire("Alerta", "La cantidad de elementos no puede ser 0", "warning")
          return;
        }

        if(cantidadElementos <= this.data.excelActivo.cantidadPendiente){
          const formatoJSON: ActivoExcelLaptopDesktopDTO[] = [];

          const cuerpoFormato = this.data.excelActivo;
    
          for(let i = 0; i < cantidadElementos; i++){
            formatoJSON.push({
              nIdActivo: 0,
              sProveedor: cuerpoFormato.proveedor,
              sAddenda: cuerpoFormato.addenda,
              sTipoActivo: cuerpoFormato.tipoActivo,
              nIdDetAddenda: 0,
              sArticulo: cuerpoFormato.codigoArticulo,
              sDescripcion: cuerpoFormato.descripcionArticulo,
              sCodigoEquipo: '', // El codigo del activo se agrega de uno en uno,
              sPartNumber: this.data.partNumber,
              sNumeroSerie: '',
            })
          }
          
          if(await this.fnCrearRegistrosTemporales()){

            const nIdAddenda = this.data.controlesActivo.addenda;
            const elementosCargaMasiva: ActivoExcelLaptopDesktopDTO[] = (await this.activoService.GetAllElementosCargaMasiva(nIdAddenda, this.tipoActivo)).response.data;
            formatoJSON.map((registro, index) => {
              registro.sCodigoEquipo = elementosCargaMasiva[index].sCodigoEquipo;
            })

            const formato: Blob = await this.activoService.GenerarExcelLaptopDesktop(formatoJSON, this.tipoActivo);
            saveAs(formato, 'Formato Carga Masiva Laptop.xlsx');

            Swal.fire({
              icon: 'success',
              title: ('Correcto'),
              text: "Se creó el formato. Luego de llenar los campos faltantes, subir el documento. No cambiar los demás campos",
              showConfirmButton: true
            });

            this.fnSalir();
          }

        }
        else if(this.data.excelActivo.cantidadPendiente == 0){
          Swal.fire("Alerta", "Ya no quedan artículos disponibles en esa Addenda", "warning")
        }
        else{
          Swal.fire("Alerta", "La cantidad de registros a ingresar debe de ser menor a la disponible en la addenda", "warning")
        }
      }
      else{
        this.formExcelFormato.markAllAsTouched();
      }

      this.spinner.hide();
    }
    else{
      Swal.fire("Alerta", "Faltan campos por llenar en el formulario principal", "warning");
      this.fnValidarFormulario();
    }
  }

  async fnCrearRegistrosTemporales(){

    if(this.formExcelFormato.valid){

      const cantidadElementos = Number(this.formExcelFormato.get("cantidadElementos").value);

      // Controles del formulario para insercion masiva
      const cuerpoFormato = this.data.controlesActivo;

      // Ingresamos la carga masiva en laptops
      if(this.tipoActivo == 2500){
        // Llenamos una lista de modelos
        const listModel: ActivoLaptopDesktopTIDTO[]  = []
        
        for(let i = 0; i < cantidadElementos; i++){
          const model: ActivoLaptopDesktopTIDTO = {
            nIdActivo: 0,
            nIdTipo: this.data.tipoActivo,
            nIdAddenda: cuerpoFormato.addenda,
            nIdArticulo: cuerpoFormato.articulo,
            sCodActivo: '', // El codigo del activo se genera en el procedure
            sNumeroParte: this.data.partNumber,
            sSerie: null,
            dFechaAlta: cuerpoFormato.fechaAlta,
            dFechaBaja: null,
            nIdUsuarioCrea: this.storageData.getUsuarioId(),
            dFechaCrea: moment(cuerpoFormato.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
            nIdUsuarioModifica: this.storageData.getUsuarioId(),
            dFechaModifica: moment(cuerpoFormato.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
            nIdEstado: 2592
          }
          listModel.push(model);
        }

        const result: WebApiResponse<ActivoRegistroDTO> = await this.activoService.CreateActivoLaptopDesktopMasivo(listModel);
        
        if(result.success){
          await this.fnLlenarTabla();
          return true;
        }
        else{
          let mensaje = result.errors.map(item => {
            return item.message
          })
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: mensaje.join(', '),
          });
          this.spinner.hide();
          return false;
        }
      }
      // Ingresamos la carga masiva en desktop
      else if(this.tipoActivo == 2501){

        // Llenamos una lista de modelos
        const listModel: ActivoDesktopTIDTO[]  = []

        // Partes y sub articulos para insersion masiva si fuera laptop
        const resultPartesDesktop = await this.activoService.GetAllPartesDesktop();
        const partesDesktop = resultPartesDesktop ? resultPartesDesktop.response.data : [];
        const resultSubArticulos = await this.activoService.GetAllSubArticulosDesktop(this.data.nIdDetAddenda);
        const subArticulos = resultSubArticulos ? resultSubArticulos.response.data : [];

        for(let i = 0; i < cantidadElementos; i++){
          const model: ActivoDesktopTIDTO = {
            nIdActivo: 0,
            nIdTipo: this.data.tipoActivo,
            nIdAddenda: cuerpoFormato.addenda,
            nIdArticulo: cuerpoFormato.articulo,
            sCodActivo: '', // El codigo del activo se genera en el procedure
            dFechaAlta: cuerpoFormato.fechaAlta,
            dFechaBaja: null,
            nIdUsuarioCrea: this.storageData.getUsuarioId(),
            dFechaCrea: moment(cuerpoFormato.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
            nIdUsuarioModifica: this.storageData.getUsuarioId(),
            dFechaModifica: moment(cuerpoFormato.fechaCreacion, 'DD/MM/YYYY, h:mm:ss').toDate(),
            nIdEstado: 2592,
            detalle: []
          }

          // Crear detalle del desktop
          partesDesktop.map((parte: ActivoSelectItemDTO) =>{

            const subArticuloParte = subArticulos.find(sub => sub.sTipoParte == parte.sDescripcion);
            
            const itemDetalle: ActivoDetalleDesktopDTO = {
              nIdDetActivo: 0,
              nIdActivo: 0,
              nIdArticulo: subArticuloParte.nIdArticulo,
              nIdTipoParte: parte.nId,
              sTipoParte: parte.sDescripcion,
              sArticulo: subArticuloParte.sArticulo,
              sSerie: null,//filaExcel["sSerie" + parte.sDescripcion], // Recuperamos el numero de serie de cada parte
              sNumeroParte: subArticuloParte.sNumeroParte,
              sRutaArchivo: subArticuloParte.sRutaArchivo,
            }

            model.detalle.push(itemDetalle)
          })

          listModel.push(model);
        }

        const result: WebApiResponse<ActivoRegistroDesktopDTO> = await this.activoService.CreateActivoDesktopMasivo(listModel);

        if(result.success){
          Swal.fire({
            icon: 'success',
            title: ('Correcto'),
            text: "Se creó el formato. Luego de llenar los campos faltantes, subir el documento. No cambiar los demás campos",
            showConfirmButton: true
          });
          await this.fnLlenarTabla();
          return true;
        }
        else{
          let mensaje = result.errors.map(item => {
            return item.message
          })
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: mensaje.join(', '),
          });
          this.spinner.hide();
          return false;
        }
      }

      
    }
  }

  async fnDescargarFormato(row: ActivoExcelLaptopDesktopCabeceraDTO){
    this.spinner.show();

    const nIdAddenda = row.nIdAddenda;
    const elementosCargaMasiva: ActivoExcelLaptopDesktopDTO[] = (await this.activoService.GetAllElementosCargaMasiva(nIdAddenda, this.tipoActivo)).response.data;
    const formato: Blob = await this.activoService.GenerarExcelLaptopDesktop(elementosCargaMasiva, this.tipoActivo);
    saveAs(formato, 'Formato Excel.xlsx');

    this.spinner.hide();
  }

  fnSeleccionarRegistro(row: ActivoExcelLaptopDesktopCabeceraDTO){
    if(row == this.registroSeleccionado){
      this.registroSeleccionado = null;
      // Limpiamos el input file
      this.nombreArchivo = 'Seleccione un archivo';
      this.objectExcel = null;
      this.excelFile.nativeElement.value = '';
      return;
    }
    else{
      this.registroSeleccionado = row;
    }
  }

  async fnValidarExcel(event){

    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      // Limpiamos el input file
      this.nombreArchivo = 'Seleccione un archivo';
      this.objectExcel = null;
      this.excelFile.nativeElement.value = '';
      return;
    }

    // Formato del Excel
    let formato: ExcelFormato[] = []

    if(this.tipoActivo == 2500){
      formato = [
        { cabeceraExcel: 'Proveedor', cabeceraSQL: 'sProveedor',  tipo: 'String', vacio: false},
        { cabeceraExcel: 'Nro Addenda', cabeceraSQL: 'sAddenda', tipo: 'String', vacio: false},
        { cabeceraExcel: 'Tipo Activo', cabeceraSQL: 'sTipoActivo', tipo: 'String', vacio: false},
        { cabeceraExcel: 'Artículo', cabeceraSQL: 'sArticulo', tipo: 'String', vacio: false},
        { cabeceraExcel: 'Descripción', cabeceraSQL: 'sDescripcion', tipo: 'String', vacio: false},
        { cabeceraExcel: 'Código Equipo', cabeceraSQL: 'sCodigoEquipo', tipo: 'String', vacio: false},
        { cabeceraExcel: 'Part Number', cabeceraSQL: 'sPartNumber', tipo: 'String', vacio: false},
        { cabeceraExcel: 'Número Serie', cabeceraSQL: 'sNumeroSerie', tipo: 'String', vacio: true},
      ]
    }
    else if(this.tipoActivo == 2501){
      formato = [
        { cabeceraExcel: 'Proveedor', cabeceraSQL: 'sProveedor',  tipo: 'String', vacio: false},
        { cabeceraExcel: 'Nro Addenda', cabeceraSQL: 'sAddenda', tipo: 'String', vacio: false},
        { cabeceraExcel: 'Tipo Activo', cabeceraSQL: 'sTipoActivo', tipo: 'String', vacio: false},
        { cabeceraExcel: 'Artículo', cabeceraSQL: 'sArticulo', tipo: 'String', vacio: false},
        { cabeceraExcel: 'Descripción', cabeceraSQL: 'sDescripcion', tipo: 'String', vacio: false},
        { cabeceraExcel: 'Código Equipo', cabeceraSQL: 'sCodigoEquipo', tipo: 'String', vacio: false}
      ]

      const resultPartesDesktop = await this.activoService.GetAllPartesDesktop();
      const partesDesktop = resultPartesDesktop ? resultPartesDesktop.response.data : [];

      for(let parte of partesDesktop){
        formato.push({
          cabeceraExcel: 'Número Serie ' + parte.sDescripcion,
          cabeceraSQL: 'sSerie' + parte.sDescripcion,
          tipo: 'String',
          vacio: true
        })
      }
    }

    // Validamos el excel pasandole el archivo y el formato deseado
    const validacion: ExcelObject = await this.excelService.ValidarExcel(target.files[0], formato);

    // Revisamos si presenta errores 
    if(validacion.error.length > 0){
      let mensaje = validacion.error.map(errorItem => {
        return errorItem
      })

      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Revise los siguientes errores: \n' + mensaje.join(', \n'),
      });

      // Limpiamos el input file
      this.nombreArchivo = 'Seleccione un archivo';
      this.objectExcel = null;
      this.excelFile.nativeElement.value = '';
      return;
    }
    else{
      // Guardamos el objeto convertido y validado y cambiamos el nombre del input file
      this.objectExcel = validacion.data;
      this.nombreArchivo = target.files[0].name;
    }
  }

  async fnSubirCargaMasivaExcel(){

    this.spinner.show();

    if(this.objectExcel){
      const nIdAddenda = this.registroSeleccionado.nIdAddenda;

      // Recuperamos los elementos de la carga masiva para validar que coincidan con el Excel cargado
      const elementosCargaMasiva: ActivoExcelLaptopDesktopDTO[] = (await this.activoService.GetAllElementosCargaMasiva(nIdAddenda, this.tipoActivo)).response.data;

      // Lista a agregar para laptops
      const listModelLaptop: ActivoLaptopDesktopTIDTO[]  = [];
      // Lista a agregar para desktop
      const listModelDesktop: ActivoDesktopTIDTO[]  = [];

      // Partes y sub articulos para insersion masiva si fuera laptop
      const resultPartesDesktop = await this.activoService.GetAllPartesDesktop();
      const partesDesktop = resultPartesDesktop ? resultPartesDesktop.response.data : [];
      
      // Revisamos que todas las tablas sean validas
      for (const elemento of elementosCargaMasiva) {
        for(const filaExcel of this.objectExcel) {
          if (elemento.sAddenda === filaExcel.sAddenda && 
              elemento.sArticulo === filaExcel.sArticulo &&
              elemento.sCodigoEquipo === filaExcel.sCodigoEquipo &&
              elemento.sDescripcion === filaExcel.sDescripcion &&
              elemento.sProveedor === filaExcel.sProveedor &&
              elemento.sTipoActivo === filaExcel.sTipoActivo ) {

                // Si es laptop revisamos su partNumber y que el numero de serie no sean nulos
                if(this.tipoActivo == 2500){
                  if(elemento.sPartNumber !== filaExcel.sPartNumber ||
                    (filaExcel.sNumeroSerie == null || filaExcel.sNumeroSerie == '')){
                    return;
                  }

                  // Si cumple con la validacion, agregamos el modelo a la lista a insertar
                  const model: ActivoLaptopDesktopTIDTO = {
                    nIdActivo: elemento.nIdActivo,
                    nIdTipo: 0,
                    nIdAddenda: 0,
                    nIdArticulo: 0,
                    sCodActivo: null, // El codigo del activo se agrega de uno en uno
                    sNumeroParte: filaExcel.sPartNumber,
                    sSerie: filaExcel.sNumeroSerie,
                    dFechaAlta: new Date(),
                    dFechaBaja: new Date(),
                    nIdUsuarioCrea: this.storageData.getUsuarioId(),
                    dFechaCrea: new Date(),
                    nIdUsuarioModifica: this.storageData.getUsuarioId(),
                    dFechaModifica: new Date(),
                    nIdEstado: 1,
                  };

                  listModelLaptop.push(model);
                }
                // Si es desktop revisamos el numero de serie de cada uno de sus partes (Teclado, mouse...)
                else if(this.tipoActivo == 2501){

                  // Si cumple con la validacion, agregamos el modelo a la lista a insertar
                  const model: ActivoDesktopTIDTO = {
                    nIdActivo: elemento.nIdActivo,
                    nIdTipo: 0,
                    nIdAddenda: 0,
                    nIdArticulo: 0,
                    sCodActivo: null, // El codigo del activo se agrega de uno en uno
                    dFechaAlta: new Date(),
                    dFechaBaja: new Date(),
                    nIdUsuarioCrea: this.storageData.getUsuarioId(),
                    dFechaCrea: new Date(),
                    nIdUsuarioModifica: this.storageData.getUsuarioId(),
                    dFechaModifica: new Date(),
                    nIdEstado: 1,
                    detalle: []
                  };

                  // Recuperamos el detalle vacio actual del desktop pendiente
                  const detalleDesktop = (await this.activoService.GetDetalleDesktopByActivo(elemento.nIdActivo)).response.data;

                  for(let parte of partesDesktop){
                    if(filaExcel["sSerie" + parte.sDescripcion] == null || filaExcel["sSerie" + parte.sDescripcion] == ''){
                      return;
                    }
                    else{
                      // Encontramos la parte del detalle
                      const subActivo = detalleDesktop.find(detalle => detalle.nIdTipoParte == parte.nId)
                      if(subActivo){
                        subActivo.sSerie = filaExcel["sSerie" + parte.sDescripcion];
                      }
                      model.detalle.push(subActivo);
                    }
                  }

                  listModelDesktop.push(model);

                }
                // Si no hay tipo de activo, 
                else{
                  return;
                }
              }
        }
      };

      console.log(listModelDesktop);

      // Revisar si hay coincidencias dependiendo del tipo de activo
      if((listModelLaptop.length == 0 && this.tipoActivo == 2500) || (listModelDesktop.length == 0 && this.tipoActivo == 2501)){
        Swal.fire({
          icon: 'warning',
          title: ('Alerta'),
          text: "No se encontraron coincidencias.",
          showConfirmButton: true
        });
        this.spinner.hide();
        return;
      }

      // Actualizar registros solo si es laptop y 
      // la cantidad de elementos en la lista del modelo 
      // son menores a la cantidad maxima de cargas pendientes
      if(listModelLaptop.length <= this.objectExcel.length && listModelLaptop.length <= elementosCargaMasiva.length && this.tipoActivo == 2500){
        const result = await this.activoService.UpdateActivoLaptopDesktopMasivo(listModelLaptop);
        if(result.success){

          // Si la cantidad de registros subidos 
          if(listModelLaptop.length == this.objectExcel.length && listModelLaptop.length == elementosCargaMasiva.length){
            Swal.fire({
              icon: 'success',
              title: ('Correcto'),
              text: "El Excel se subió correctamente. Ya no hay activos pendientes",
              showConfirmButton: true
            });
          }
          // Si la cantidad de registros subidos es menor a las necesarias
          else if(listModelLaptop.length < this.objectExcel.length && listModelLaptop.length < elementosCargaMasiva.length){
            Swal.fire({
              icon: 'success',
              title: ('Correcto'),
              text: `El Excel se subió correctamente. Quedan ${elementosCargaMasiva.length - listModelLaptop.length} registros pendientes. `,
              showConfirmButton: true
            });
          }

          this.spinner.hide();
          this.cargaMasivaSubida = true;
          this.fnSalir();
          return true;
        }
        else{
          let mensaje = result.errors.map(item => {
            return item.message
          })
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: mensaje.join(', '),
          });
          this.spinner.hide();
          return false;
        }
      }
      // Actualizar registros solo si es laptop y 
      // la cantidad de elementos en la lista del modelo 
      // son menores a la cantidad maxima de cargas pendientes
      else if(listModelDesktop.length <= this.objectExcel.length && listModelDesktop.length <= elementosCargaMasiva.length && this.tipoActivo == 2501){
        const result = await this.activoService.UpdateActivoDesktopMasivo(listModelDesktop);
        if(result.success){
          
          // Si la cantidad de registros subidos 
          if(listModelDesktop.length == this.objectExcel.length && listModelDesktop.length == elementosCargaMasiva.length){
            Swal.fire({
              icon: 'success',
              title: ('Correcto'),
              text: "El Excel se subió correctamente. Ya no hay activos pendientes",
              showConfirmButton: true
            });
          }
          // Si la cantidad de registros subidos es menor a las necesarias
          else if(listModelDesktop.length < this.objectExcel.length && listModelDesktop.length < elementosCargaMasiva.length){
            Swal.fire({
              icon: 'success',
              title: ('Correcto'),
              text: `El Excel se subió correctamente. Quedan ${elementosCargaMasiva.length - listModelDesktop.length} registros pendientes. `,
              showConfirmButton: true
            });
          }

          this.spinner.hide();
          this.cargaMasivaSubida = true;
          this.fnSalir();
          return true;
        }
        else{
          let mensaje = result.errors.map(item => {
            return item.message
          })
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: mensaje.join(', '),
          });
          this.spinner.hide();
          return false;
        }
      }
      else{
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: "La cantidad de registros del Excel no corresponde con las reservadas para la carga masiva",
        });
      }
    }

    this.spinner.hide();
  }

  fnValidarFormulario(){
    this.validarFormulario.emit();
  }

  fnSalir(){
    this.dialogRef.close({cargaMasivaSubida: this.cargaMasivaSubida});
  }

}
