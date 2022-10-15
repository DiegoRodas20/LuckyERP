import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject  } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class SerReclutamientoService {

  constructor(private http: HttpClient) { }
  
  async fnReclutamiento(pOpcion: number, pParametro: any, url: string) {
    const urlEndPoint = url + 'AtraccionTalentoService/Reclutamiento';
    const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = {
      pOpcion: pOpcion,
      pParametro: pParametro.join('|')
    };

    return await this.http.post(urlEndPoint, JSON.stringify(params), { headers: httpHeaders }).toPromise();
  }

  async exportAsExcelFileHistorico(json: any[], excelFileName: string){
    let vLista = [] 
    json.forEach(historico => { 
      vLista.push({
        'Fecha de Gestión': historico.pFechaGestion,
        'Tipo de Documento': historico.pTipDoc,
        'Número de Documento': historico.pNumDoc,
        'Nombres Completos': historico.pNom,
        'Dirección': historico.pdireccion,
        'Distrito Post': historico.pDistrito,
        'Fecha Nacimiento': historico.pfechaNac,
        'Edad': historico.page,
        'Género': historico.pGenero,
        'Nacionalidad': historico.pNacionalidad,
        'Estado Civil': historico.pEstCiv,
        'Estatura': historico.pTamano,
        '¿Cuántos Hijos?': historico.pcHijo,
        'Carné  de Sanidad': historico.pcarnet,
        'Celular Post': historico.pNumCelular,
        'Celular Post Opcional': historico.pNumCelularOpc,
        'Correo': historico.pCorreo,
        'Fuente': historico.pFuentePostu,
        'Referente': historico.pTextOpc, 
        'Puesto Solicitado': historico.pPuesto,
        'Fecha de Contactación': historico.pfechaConC,
        'Contactador': historico.pNomUserConC, 
        'Contactado': historico.pCodContactado,
        'Medio de Contacto': historico.pMedioContacto,
        'Motivo de No Contactado': historico.pMotNoCont,
        'Último Estado de Contactación': historico.pUltEstCont,
        'Citado': historico.pCodCCitado, 
        'Motivo de No Citación': historico.pMotNoCita,
        'Fecha de Cita': historico.pFechaCita,
        'Hora de Cita': historico.pHoraCita,
        'Turno': historico.pTurno,
        'Fecha de Evaluación': historico.pfechaEvaC,
        'Inicio de Evaluación': historico.pInicio,
        'Fin de Evaluación': historico.pFin,
        'Contextura': historico.pnContextura,
        'Sonrisa': historico.pnSonrisa,
        'Imagen y Cuidado Personal': historico.pnImagen,
        'Comunicación Efectiva': historico.pnComunicacion,
        'Orientación al Cliente': historico.pnOrientacion,
        'Negociación Efectiva': historico.pnNegociacion,
        'Flexibilidad y Adaptación': historico.pnReflexion,
        'Experiencia Laboral': historico.pexperienciaLab,
        'Estudios': historico.pestudioPer,
        'Conocimientos': historico.pconocimientoPer,
        // 'Resultado de Presentacion': historico.presPre,
        // 'Resultado de Habilidad': historico.presHab,
        'Resultado de Experiencia': historico.pExperiencia,
        'Puesto Considerado Evaluación': historico.pPuestoCon,
        'Motivo': historico.pMotivo,
        'Último Estado de Evaluación': historico.pEstadoEvaluacion,
        'Nombre de Evaluador': historico.pNomUserEvaC,
        'Nombre de Fidelizador': historico.pNomUserEvaF,
        'Entrevistado': historico.pCodEntrevista,
        'Seleccionado': historico.pCodSeleccion,
        'Validado': historico.pCodValidado,
        'Proceso': historico.pProceso,
        'Puesto Considerado Fidelización ': historico.pPuestoConFid,
        'Último Estado de Fidelización': historico.pEstadoFid,
        'Usuario Registro Fidelización': historico.pNomUserFidC,
        'Fecha Registro Fidelización': historico.pfechaFidC,
        '¿Firmó Contrato?': historico.pFirma,
        'Fecha de contrato': historico.pFechaContrato,
        'Fecha de Inicio de Actividad': historico.pFechaInicio,
        'Código de Requerimiento': historico.pRQ,
        'Usuario Modificó Contactación': historico.pNomUserConM,
        'Usuario Modificó Evaluación': historico.pNomUserEvaM,
        'Usuario Modificó Fidelización': historico.pNomUserFidM,
        'Fecha Modificación Contactación': historico.pfechaConM,
        'Fecha Modificacion Evaluación': historico.pfechaEvaM,
        'Fecha Modificación Fidelización': historico.pfechaFidM
        })
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(vLista);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);

  }

  async exportAsExcelFileindicadores(json: any[], excelFileName: string){
    let vLista = [] 
    json.forEach(historico => { 
      vLista.push({
        'Fecha de Gestión': historico.pFechaGestion,
        'Tipo de Documento': historico.pTipDoc,
        'Número de Documento': historico.pNumDoc,
        'Nombres Completos': historico.pNom, 
        'Distrito Post': historico.pDistrito, 
        'Nacionalidad': historico.pNacionalidad, 
        'Celular Post': historico.pNumCelular,
        'Celular Post Opcional': historico.pNumCelularOpc, 
        'Fuente': historico.pFuentePostu, 
        'Fecha de Contactación': historico.pfechaConC,
        'Contactador': historico.pNomUserConC, 
        'Contactado': historico.pCodContactado,
        'Citado': historico.pCodCCitado, 
        'Motivo de No Citación': historico.pMotNoCita,
        'Fecha de Cita': historico.pFechaCita,
        'Fecha de Evaluación': historico.pfechaEvaC,
        'Puesto Considerado Evaluación': historico.pPuestoCon,
        'Último Estado de Evaluación': historico.pEstadoEvaluacion,
        'Nombre de Evaluador': historico.pNomUserEvaC,
        'Nombre de Fidelizador': historico.pNomUserEvaF,
        'Entrevistado': historico.pCodEntrevista,
        'Seleccionado': historico.pCodSeleccion,
        'Validado': historico.pCodValidado,
        'Puesto Considerado Fidelización ': historico.pPuestoConFid,
        'Último Estado de Fidelización': historico.pEstadoFid,
        '¿Firmó Contrato?': historico.pFirma,
        'Fecha de contrato': historico.pFechaContrato,
        'Fecha de Inicio de Actividad': historico.pFechaInicio,
        'Código de Requerimiento': historico.pRQ   
        })
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(vLista);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);

  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_Excel_' + new Date().getTime() + EXCEL_EXTENSION);
  }   

}
