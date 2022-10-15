import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExcelService } from '../../../api/services/excel.service';
import { ActivoExcelSimcardDTO, ActivoPlanDatosOperadorDTO, ActivoRegistroDTO, ActivoSimcardTIDTO } from '../../../api/models/activoDTO';
import { ExcelFormato, ExcelObject } from '../../../api/models/excelModel';
import Swal from 'sweetalert2';
import { ActivoService } from '../../../api/services/activo.service';
import moment from 'moment';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WebApiResponse } from '../../../api/models/apiResponse';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-ti-ingreso-inventario-simcard-excel',
  templateUrl: './ti-ingreso-inventario-simcard-excel.component.html',
  styleUrls: ['./ti-ingreso-inventario-simcard-excel.component.css']
})
export class TiIngresoInventarioSimcardExcelComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Formulario
  formCargaMasiva: FormGroup;

  // Archivo
  nombreArchivo: String = 'Seleccione un archivo' // Nombre por defecto

  // Excel
  objectExcel: any[];
  @ViewChild('excelFile') excelFile: ElementRef;
  

  constructor(
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,
    private activoService: ActivoService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TiIngresoInventarioSimcardExcelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.fnCrearFormulario();
   }

  ngOnInit(): void {
    this.spinner.hide();
  }

  fnCrearFormulario(){
    this.formCargaMasiva = this.fb.group(
      {
        fileExcel: [null, Validators.compose([Validators.required])],
      }
    );
  }

  async fnValidarExcel(event){

    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    // Formato del Excel
    const formato: ExcelFormato[] = [
      { cabeceraExcel: 'Numero', cabeceraSQL: 'sNumero',  tipo: 'String'},
      { cabeceraExcel: 'SIMCard', cabeceraSQL: 'sSimCard', tipo: 'String'},
      { cabeceraExcel: 'Operador', cabeceraSQL: 'sOperador', tipo: 'String'},
      { cabeceraExcel: 'Fecha Alta', cabeceraSQL: 'dFechaAlta', tipo: 'Date'},
      { cabeceraExcel: 'Plan Servicio', cabeceraSQL: 'sPlan', tipo: 'String'},
    ]

    const validacion: ExcelObject = await this.excelService.ValidarExcel(target.files[0], formato);

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

  async fnDescargarFormato(){

    this.spinner.show();

    const operadorDescripcion = this.data.operadorDescripcion;
    const planDatosDescripcion = this.data.planDatosDescripcion;

    const formatoJSON: ActivoExcelSimcardDTO[] = [];    

    // Si en el formulario principal se agrego el operador y el plan de datos, se agregan como elementos de ejemplo
    if(operadorDescripcion && planDatosDescripcion){
      const registro: ActivoExcelSimcardDTO = {
        sPlanDatos: planDatosDescripcion,
        dFechaAlta: new Date(),
        sCodigoSimCard: 'Ingrese Código',
        sNumeroSim: 'Ingrese Número',
        sOperador: operadorDescripcion
      }
      formatoJSON.push(registro);
    }
    else{
      const registro: ActivoExcelSimcardDTO = {
        sPlanDatos: 'Ingrese Plan',
        dFechaAlta: new Date(),
        sCodigoSimCard: 'Ingrese Código',
        sNumeroSim: 'Ingrese Número',
        sOperador: 'Ingrese Operador'
      }
      formatoJSON.push(registro);
    }

    const formato: Blob = await this.activoService.GenerarExcelSimcard(formatoJSON);
    saveAs(formato, 'Formato Carga Masiva SIMCard.xlsx');

    this.spinner.hide();
  }

  async fnCargarRegistros(){
    if(this.objectExcel){

      this.spinner.show();

      let errores: string[] = [];

      // Recuperamos los planes de datos disponibles y sus operadores
      const result = await this.activoService.GetAllPlanDatosOperadores();
      const planDatosOperadores: ActivoPlanDatosOperadorDTO[] = result.response.data;

      // Recorremos el objeto del excel y verificamos que los planes ingresados existan
      for(let i = 0; i < this.objectExcel.length; i++) {

        const registro = this.objectExcel[i];

        const plan = planDatosOperadores.find((plan) =>{
          if(plan.sOperador == registro.sOperador && plan.sPlan == registro.sPlan){
            return true;
          }
        })

        // Si existe el plan (perteneciente al operador designado), se agrega para registrar
        if(plan){
          const model: ActivoSimcardTIDTO = {
            nIdActivo: 0,
            nIdTipo: this.data.tipoActivo,
            nIdArticulo: plan.nIdPlan,
            sCodActivo: registro.sNumero, // El codigo del simcard es el numero telefonico
            sNumeroSim: registro.sNumero,
            sCodigoSimCard: registro.sSimCard,
            dFechaAlta: registro.dFechaAlta,
            dFechaBaja: null,
            nIdUsuarioCrea: this.storageData.getUsuarioId(),
            dFechaCrea: new Date(),
            nIdUsuarioModifica: this.storageData.getUsuarioId(),
            dFechaModifica: new Date(),
            nIdEstado: 1
          }

          const result: WebApiResponse<ActivoRegistroDTO> = await this.activoService.CreateActivoSimcard(model);

          if (!result.success) {
            let mensaje = result.errors.map(item => {
              return `Error fila ${i + 2}: ` + item.message
            })
            errores = errores.concat(mensaje);
            console.log(mensaje)
            console.log(errores)
          }
        }
        else{
          errores.push(`Error fila ${i + 2}: El plan de datos '${registro.sPlan}' del operador '${registro.sOperador}' no existe`);
        }
      }

      // Si la cantidad de errores es cero
      if(errores.length == 0){

        this.spinner.hide();

        Swal.fire({
          icon: 'success',
          title: 'Advertencia',
          text: `Se agregaron los ${this.objectExcel.length} registro(s).`,
        });
      }
      // Si la cantidad de errores es la misma que la cantidad de registros a ingresar mostrar estos mensajes de error
      else if(errores.length == this.objectExcel.length && errores.length > 3){

        // Listar los errores en formato HTML
        const listaErrores = []
        for(let i = 0; i < 3; i++){
          listaErrores.push('<li>' + errores[i] + '</li>');
        }

        this.spinner.hide();

        const {isConfirmed} = await Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          html: `No se ha podido guardar ningún registro. Revisar los siguientes puntos: \n\n<ul>${listaErrores.join('')}</ul> \n...Y ${errores.length - 3} más.`,
          showCancelButton: true,
          confirmButtonText: 'Descargar Errores',
          cancelButtonText: 'No',
          allowOutsideClick: false
        });

        // Descargamos el archivo txt con la lista de errores
        if(isConfirmed){
          const file = new window.Blob(["Lista de errores:\r\n\r\n" + errores.join("\r\n")], { type: 'text/plain;charset=utf-8' });
          saveAs(file, 'Validaciones Ingreso Masivo Simcard.txt')
        }
      }
      else if(errores.length == this.objectExcel.length){

        // Listar los errores en formato HTML
        const listaErrores = errores.map(error =>{
          return '<li>' + error + '</li>';
        })

        this.spinner.hide();

        const {isConfirmed} = await Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          html: 'No se ha podido guardar ningún registro. Revisar los siguientes puntos: \n\n<ul>' + listaErrores.join('') + '</ul>',
        });

        // Descargamos el archivo txt con la lista de errores
        if(isConfirmed){
          const file = new window.Blob([errores.join("\r\n")], { type: 'text/plain;charset=utf-8' });
          saveAs(file, 'Validaciones Ingreso Masivo Simcard.txt')
        }
      }
      // Si la cantidad de errores es menor a 3
      else if(errores.length < 3){
        const cantidadRegistrosAgregados = this.objectExcel.length - errores.length;

        // Listar los errores en formato HTML
        const listaErrores = errores.map(error =>{
          return '<li>' + error + '</li>';
        })

        this.spinner.hide();

        const {isConfirmed} = await Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          html: `Se agregaron ${cantidadRegistrosAgregados} de los ${this.objectExcel.length} registro(s). Revisar los siguientes puntos: \n\n<ul>${
            listaErrores.join('')
          }</ul>`,
          showCancelButton: true,
          confirmButtonText: 'Descargar Errores',
          cancelButtonText: 'No',
          allowOutsideClick: false
        });       
        
        // Descargamos el archivo txt con la lista de errores
        if(isConfirmed){
          const file = new window.Blob([errores.join("\r\n")], { type: 'text/plain;charset=utf-8' });
          saveAs(file, 'Validaciones Ingreso Masivo Simcard.txt')
        }
      }
      // Si la cantidad de errores es menor que la cantidad de registros a ingresar
      else {
        const cantidadRegistrosAgregados = this.objectExcel.length - errores.length;

        // Listar los errores en formato HTML
        const listaErrores = []
        for(let i = 0; i < 3; i++){
          listaErrores.push('<li>' + errores[i] + '</li>');
        }

        this.spinner.hide();

        const {isConfirmed} = await Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          html: `Se agregaron ${cantidadRegistrosAgregados} de los ${this.objectExcel.length} registro(s). Revisar los siguientes puntos: \n\n<ul>${
            listaErrores.join('')
          }</ul> \n...Y ${errores.length - 3} más.`,
          showCancelButton: true,
          confirmButtonText: 'Descargar Errores',
          cancelButtonText: 'Salir',
          allowOutsideClick: false
        });

        // Descargamos el archivo txt con la lista de errores
        if(isConfirmed){
          const file = new window.Blob([errores.join("\r\n")], { type: 'text/plain;charset=utf-8' });
          saveAs(file, 'Validaciones Ingreso Masivo Simcard.txt')
        }
      }

      this.spinner.hide();
    }
    else{
      console.log('No hay archivo');
    }
  }

  fnRecuperarIds(){
    this.objectExcel
  }

}
