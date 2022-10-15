import { Injectable } from "@angular/core";
import { BaseService } from "../base-service";
import * as XLSX from "xlsx";
import { ExcelFormato, ExcelObject } from "../models/excelModel";

@Injectable({
  providedIn: "root",
})
export class ExcelService extends BaseService {
  constructor() {
    super();
  }

  async ValidarExcel(file: File, formatoExcel: ExcelFormato[]): Promise<ExcelObject> {

    // Variables
    const validation: ExcelObject = {
      data: [],
      error: [],
    };

    return new Promise((resolve, reject) => {

      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = (e: any) => {
        const bufferArray = e?.target.result;
        const workbook = XLSX.read(bufferArray, { type: "buffer", cellDates: true, sheetStubs: true });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        let registroValido = true; // Si el registro es valido, lo guardamos para subir
        // Creamos el registro
        let registro = {};

        const data: any[] = XLSX.utils.sheet_to_json(worksheet, {dateNF:"dd.MM.yyyy", defval: ''});

        const numeroFilas = data.length;
        let numeroColumnas = 0;
        data.map((dat) => {
          if (Object.keys(dat).length > numeroColumnas) {
            numeroColumnas = Object.keys(dat).length;
          }
        });

        // Validamos la cabecera
        if (numeroColumnas != formatoExcel.length) {
          validation.error.push(
            "La cantidad de columnas no corresponde con el formato deseado. Hay columnas vacías o no existen"
          );
          resolve(validation);
          return;
        }

        // Validar el nombre de los campos de la cabecera (Que cumplan exactamente con el formato especificado)
        formatoExcel.map((element, index) => {
          if (!(Object.keys(data[0])[index] == element.cabeceraExcel)) {
            validation.error.push(
              `El nombre de la cabecera '${Object.keys(data[0])[index]}' no corresponde con el formato deseado. Debe de ser '${element.cabeceraExcel}'`
            );
          }
        });

        // Si la cabecera no es valida, retornamos con los errores
        if (validation.error.length > 0) {
          resolve(validation);
          return validation;
        }

        // Recorremos cada fila
        for (let rowPosition = 0; rowPosition < numeroFilas; rowPosition++) {
          // Valores de la fila
          const values: any[] = data[rowPosition];

          registro = {};

          // Recorremos cada elemento de la fila
          for (let j = 0; j < numeroColumnas; j++) {
            const tipo = formatoExcel[j].tipo;
            const elemento = values[formatoExcel[j].cabeceraExcel];

            // Validamos que el campo no este vacio
            if ((elemento == "" || elemento == null) && !formatoExcel[j].vacio) {
              validation.error.push(`La columna ${formatoExcel[j].cabeceraExcel} del registro de la fila ${rowPosition + 1} no puede estar vacía`);
              registroValido = false;
              break;
            }

            // Validamos segun el tipo
            else if (tipo == "Date") {
              if (!(elemento instanceof Date && !isNaN(elemento.valueOf()))) {
                validation.error.push(`La columna ${formatoExcel[j].cabeceraExcel} del registro de la fila ${rowPosition + 1} no tiene el formato adecuado. Debe de ser una fecha válida`);
                registroValido = false;
                break;
              }
              else {
                registro[formatoExcel[j].cabeceraSQL] = elemento;
              }
            }
            else if (tipo == "Number") {
              if (isNaN(elemento)) {
                validation.error.push(`La columna ${formatoExcel[j].cabeceraExcel} del registro de la fila ${j + 1} no tiene el formato adecuado. Debe de ser un número`);
                registroValido = false;
                break;
              }
              else {
                registro[formatoExcel[j].cabeceraSQL] = Number(elemento);
              }
            }
            else if (tipo == "String") {
              registro[formatoExcel[j].cabeceraSQL] = String(elemento);
            }

            // Si todo es valido, creamos el registro en formato JSON y agregamos al data
            registroValido = true;
          }

          // Guardamos el registro si es valido
          if (registroValido) {
            validation.data.push(registro);
          }
        }

        resolve(validation);
      };
    });
  }

}
