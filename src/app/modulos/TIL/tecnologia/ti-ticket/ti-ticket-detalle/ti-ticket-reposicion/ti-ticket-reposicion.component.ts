import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityErp } from 'src/app/modulos/AAHelpers';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import Swal from 'sweetalert2';
import { TicketMontoDescuentoReposicionDTO } from '../../../api/models/ticketDTO';
import { AsignacionDirectaService } from '../../../api/services/asignacion-directa.service';
import { TicketService } from '../../../api/services/ticket.service';
import { TiAsignacionDialogDescuentoComponent } from '../../../ti-ingreso-inventario/ti-ingreso-inventario-detalle-inventario/ti-asignacion-dialog-descuento/ti-asignacion-dialog-descuento.component';
import { TiTicketTiempoAtencionComponent } from '../ti-ticket-tiempo-atencion/ti-ticket-tiempo-atencion.component';

@Component({
  selector: 'app-ti-ticket-reposicion',
  templateUrl: './ti-ticket-reposicion.component.html',
  styleUrls: ['./ti-ticket-reposicion.component.css'],
  animations: [asistenciapAnimations]
})
export class TiTicketReposicionComponent implements OnInit {

  // Local Storage
  storageData: SecurityErp = new SecurityErp();

  // Variables auxiliares
  nIdTicket: number; // Id del Ticket
  nIdCargo: number; // Cargo del personal asignado del ticket
  descuentoReposicion: TicketMontoDescuentoReposicionDTO = {};
  
  // Formulario
  formDescuentoEfectivo: FormGroup;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'save', tool: 'Generar Descuento', state: true, color: 'secondary'},
    {icon: 'cloud_download', tool: 'Descargar formato de descuento', state: true, color: 'secondary'},
    {icon: 'cloud_upload', tool: 'Subir documento firmado', state: true, color: 'secondary'},
    {icon: 'cloud_download', tool: 'Descargar documento firmado', state: true, color: 'secondary'},
  ];
  abLista = [];
  mostrarBotones = true; // Booleano para controlar la vista de los botones si es que hay un dialog abierto
  
  // Flag
  activoEnReposicion: boolean = false; // Verifica si el activo ya se ha asignado a reposicion con anterioridad
  descuentoEfectuado: boolean = false;

  
  bMontoEfectivo: boolean = false; // Verifica si existe monto en efectivo (Si esta relacionado a un perfil)

  constructor(
    private spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<TiTicketTiempoAtencionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog, // Declaracion del Dialog
    private _ticketService: TicketService,
    private _asignacionDirectaService: AsignacionDirectaService,
    private fb: FormBuilder,
    private overlayContainer: OverlayContainer
  ) { 

    // Actualizamos los estilos para agregar un backdrop
    this.overlayContainer.getContainerElement().classList.add("multiDialog");

    // Guardamos el id del ticket
    this.nIdTicket = data.nIdTicket;
    // Guardamos el cargo del personal asignado
    this.nIdCargo = data.nIdCargo;
    // Revisamos si el activo ya esta en reposicion
    this.activoEnReposicion = this.data.activoEnReposicion;
    // Creamos el formulario
    this.fnCrearFormulario();
  }

  async ngOnInit(): Promise<void> {

    await this.fnRecuperarImporteDescuento()
    // Inicializamos el formulario dependiendo de que tipo de descuento ha sido escogido
    await this.fnInicializarFormulario();

    this.fnControlFab();

    this.spinner.hide();
  }

  ngOnDestroy(){
    this.overlayContainer.getContainerElement().classList.remove("multiDialog");
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
        await this.fnGenerarDescuentoTicket();
        break;
      case 1:
        await this.fnDescargarPDFDescuento();
        break;
      case 2:
        await this.fnSubirDocumentoDescuento();
        break;
      case 3:
        await this.fnDescargarDocumentoFirmado();
        break;
      default:
        break;
    }
  }

  // Metodo para actualizar el estado de los botones
  fnControlFab(){
    // Se puede crear un descuento siempre y cuando exista descuentos a crear
    this.fbLista[0].state = this.descuentoReposicion.nIdDescuento == null || this.descuentoReposicion.nIdDescuentoEfectivo == null;
    this.fbLista[1].state = this.descuentoReposicion.nIdDescuento != null || this.descuentoReposicion.nIdDescuentoEfectivo != null;
    this.fbLista[2].state = this.descuentoReposicion.nIdDescuento != null || this.descuentoReposicion.nIdDescuentoEfectivo != null;
    this.fbLista[3].state = this.descuentoReposicion.sRutaDescuentoInicial != null || this.descuentoReposicion.sRutaDescuentoInicial != null;

    // Actualizamos el estado de los botones
    this.abLista = this.fbLista;
  }

  //#endregion

  //#region Formulario

  fnCrearFormulario(){
    this.formDescuentoEfectivo = this.fb.group({
      cantidadDescuentoInicial: [null],
      cantidadDescuentoEfectivo: [null]
    })
  }

  fnInicializarFormulario(): Promise<void>{

    return new Promise((resolve) =>{
      this.formDescuentoEfectivo.patchValue({
        cantidadDescuentoInicial: this.descuentoReposicion.nImporteInicial,
        cantidadDescuentoEfectivo: this.descuentoReposicion.nImporteEfectivo || this.descuentoReposicion.nPenalidad || this.descuentoReposicion.nDescuentoPerfil
      })

      // Verificamos si existe monto efectivo (Para crear o visualizar)
      if(this.descuentoReposicion.nPenalidad || this.descuentoReposicion.nDescuentoPerfil || this.descuentoReposicion.nImporteEfectivo){
        this.bMontoEfectivo = true;
      }
  
      // Agregar validadores
      if(!this.descuentoReposicion.nImporteEfectivo || this.descuentoReposicion.nImporteInicial){
      }
  
      // Si ya se generó el descuento, ya no se puede editar
      if(this.descuentoReposicion.nIdDescuento){
        this.formDescuentoEfectivo.controls.cantidadDescuentoInicial.disable();
      }
      if(this.descuentoReposicion.nIdDescuentoEfectivo){
        this.formDescuentoEfectivo.controls.cantidadDescuentoEfectivo.disable();
      }
      resolve();
    })
  }

  //#endregion

  //#region Validaciones

  async fnRecuperarImporteDescuento(){
    const result =  await this._ticketService.GetMontoDescuentoReposicion(this.nIdTicket, this.nIdCargo);
    if(result.success){
      this.descuentoReposicion = result.response.data[0];

      this.fnActualizarControlesDescuento();
    }
    else{
      this.fnSalir(false);
    }
  }

  //#endregion

  //#region Acciones

  fnActualizarControlesDescuento(){
    //if()

    this.fnControlFab();
  }

  async fnGenerarDescuentoTicket(){

    const confirma = await Swal.fire({
      title: `¿Desea generar el descuento?`,
      //text: `Se generará un descuento al personal asignado`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirma.isConfirmed) {
      return;
    }

    this.spinner.show();

    const model: TicketMontoDescuentoReposicionDTO = {
      nIdTicket: this.nIdTicket,
      bTipoDescuento: this.descuentoReposicion.bTipoDescuento,
      nImporteInicial: this.formDescuentoEfectivo.controls.cantidadDescuentoInicial.value,
      nImporteEfectivo: this.formDescuentoEfectivo.controls.cantidadDescuentoEfectivo.value,
      nIdUsuarioRegistro: this.storageData.getUsuarioId(),
      sPais: this.storageData.getPais(),
      nIdEmp: Number(this.storageData.getEmpresa())
    }

    console.log(model);

    // const result =  await this._ticketService.CreateDescuentoReposicion(model);
    // if (!result.success) {
    //   let mensaje = result.errors.map(item => {
    //     return item.message
    //   })
    //   this.spinner.hide();
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Advertencia',
    //     text: mensaje.join(', '),
    //   });
    //   this.fnSalir(false);
    //   return;
    // }
    // else{
    //   this.spinner.hide();
    //   Swal.fire({
    //     title: "Correcto", 
    //     html: "Se mandó el activo a reposicion y se creó el descuento.",
    //     icon: "success"
    //   });
    //   this.fnSalir(true);
    // }

  }

  async fnDescargarPDFDescuento() {

    // Id del descuento del documento
    let nIdDescuento;
    const registroActual: TicketMontoDescuentoReposicionDTO = this.descuentoReposicion;

    if(this.bMontoEfectivo){
      const confirma = await Swal.fire({
        title: `¿Qué descuento desea efectuar?`,
        text: `Se descargará el PDF de acuerdo al tipo de descuento seleccionado`,
        icon: 'question',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Inicial',
        denyButtonText: `Efectivo`,
        cancelButtonText: 'Cancelar',
      });

      if (confirma.isConfirmed) {
        nIdDescuento = registroActual.nIdDescuento
      }
      else if (confirma.isDenied){
        nIdDescuento = registroActual.nIdDescuentoEfectivo
      }
      else{
        return;
      }
    }
    else{
      nIdDescuento = registroActual.nIdDescuento
    }    

    this.spinner.show();

    const pEntidad = 4;
    const pOpcion = 2;
    const pParametro = [];
    const pTipo = 1;

    console.log(nIdDescuento);

    pParametro.push(nIdDescuento);
    pParametro.push(this.storageData.getEmpresa())

    const result = await this._asignacionDirectaService.fnDescargarPDFDescuento(pEntidad, pOpcion, pParametro, pTipo);

    // Descargar pdf
    const data = result;
    const fileName = `AD-${registroActual.nIdDescuento}.pdf`; // Formato del nombre de la plantilla de descuento vacia

    saveAs(data, fileName);

    const objectUrl = window.URL.createObjectURL(data);
    // const link = document.createElement('a');
    // link.href = objectUrl;
    // link.download = fileName;
    // // Trigger de descarga
    // link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    this.spinner.hide();

    Swal.fire({
      title: 'El documento ha sido generado',
      html: `Si su descarga no ha comenzado, puede descargarlo <a href='${objectUrl}' download="${fileName}">aquí</a>`,
      icon: 'success',
      showCloseButton: true
    })
  }

  async fnSubirDocumentoDescuento(){

    const confirma = await Swal.fire({
      title: `¿Desea realizar el descuento?`,
      //text: `Si se realiza un descuento, el activo seleccionado será marcado como 'En Reposición' y será desasignado.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirma.isConfirmed) {
      return;
    }

    // Id del descuento del documento
    let bTipoDescuento;
    const registroActual: TicketMontoDescuentoReposicionDTO = this.descuentoReposicion;

    if(this.bMontoEfectivo){
      const confirmaDescuento = await Swal.fire({
        title: `¿Qué descuento desea efectuar?`,
        text: `Se descargará el PDF de acuerdo al tipo de descuento seleccionado`,
        icon: 'question',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Inicial',
        denyButtonText: `Efectivo`,
        cancelButtonText: 'Cancelar',
      });

      if (confirmaDescuento.isConfirmed) {
        bTipoDescuento = true // Tipo de descuento: Inicial
      }
      else if (confirmaDescuento.isDenied){
        bTipoDescuento = false // Tipo de descuento: Efectivo
      }
      else{
        return;
      }
    }
    else{
      bTipoDescuento = true
    }  

    this.mostrarBotones = false;
    
    const dialogRef = this.dialog.open(TiAsignacionDialogDescuentoComponent, {
      width: '1000px',
      autoFocus: false,
      disableClose: true,
      data: {
        nIdDetActivoAsigna: registroActual.nIdDetActivoAsigna,
        bTipoDescuento: bTipoDescuento
      }
    });

    dialogRef.beforeClosed().subscribe((result) => {
      this.mostrarBotones = true;
    });
    
  }

  async fnDescargarDocumentoFirmado(){

    const registroActual: TicketMontoDescuentoReposicionDTO = this.descuentoReposicion;

    // Descargar pdf
    const fileName = `AD-${registroActual.nIdDescuento}.pdf`; // Formato del nombre de la plantilla de descuento vacia


    const response = await fetch(registroActual.sRutaDescuentoInicial || registroActual.sRutaDescuentoEfectivo);
    const data = await response.blob();
    const objectUrl = window.URL.createObjectURL(data)

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    // Trigger de descarga
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    //saveAs(data, fileName);
  }

  //#endregion

  fnSalir(activoAReposicion: boolean){
    this.dialogRef.close(activoAReposicion);
  }

}
