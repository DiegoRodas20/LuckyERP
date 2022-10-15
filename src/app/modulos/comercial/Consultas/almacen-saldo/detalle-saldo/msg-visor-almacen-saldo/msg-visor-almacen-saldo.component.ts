import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';
import MsgReader from '@freiraum/msgreader'
import { MensajeOutlook } from 'src/app/modulos/almacen/almacenes/registro-traslado/models/message.model';
import { FilecontrolService } from 'src/app/shared/services/filecontrol.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-msg-visor-almacen-saldo',
  templateUrl: './msg-visor-almacen-saldo.component.html',
  styleUrls: ['./msg-visor-almacen-saldo.component.css'],
  animations: [asistenciapAnimations]
})
export class MsgVisorAlmacenSaldoComponent implements OnInit {

  formMensaje: FormGroup;

  // Botones
  tsLista = 'inactive';
  fbLista = [
    {icon: 'cloud_download', tool: 'Descargar', state: true},
    {icon: 'exit_to_app', tool: 'Salir', state: true},
  ];
  abLista = [];
  mostrarBotones = true;

  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    @Inject('BASE_URL') private baseUrl: string,
    @Inject(MAT_DIALOG_DATA) private data,
    public dialogRef: MatDialogRef<MsgVisorAlmacenSaldoComponent>,
    private vFilecontrolService: FilecontrolService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.formMensaje = this.fb.group({
      txtRemitentes: [null],
      txtEmisor: [null],
      txtAsunto: [null],
      txtBody: [null],
      txtAdjuntos: [null],
    })

    this.onToggleFab(1, -1);
  }
  async ngAfterContentInit(): Promise<void> {
    await this.fnMostrarMensaje(this.data);
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
        this.fnDescargar();
        break;
      case 1:
        this.fnCerrarDialog();
        break;
      default:
        break;
    }
  }
  //#endregion

  async fnMostrarMensaje(url){
    try {
      if(url){
        const file = url.split('/')[4];
        const type = file.split('.')[1];
        const area = 3 //Por ser proceso de almacen

        const response: Blob = await this.vFilecontrolService.fnDownload(file, type, area, this.baseUrl).toPromise()
        const arrayBufferMessage = await new Response(response).arrayBuffer();

        // const arrayBufferMessage = await fileMessage.arrayBuffer()
        const readMessage = new MsgReader(arrayBufferMessage)
        const mensajeOutlook: MensajeOutlook = readMessage.getFileData();
        var recipients = mensajeOutlook.recipients.map(value => {
          return value.name;
        })

        var attachments = mensajeOutlook.attachments.map(value => {
          return value.name
        })
        this.formMensaje.controls.txtRemitentes.setValue(recipients.join(', '))
        this.formMensaje.controls.txtEmisor.setValue(mensajeOutlook.senderName)
        this.formMensaje.controls.txtBody.setValue(mensajeOutlook.body)
        this.formMensaje.controls.txtAsunto.setValue(mensajeOutlook.subject)
        this.formMensaje.controls.txtAdjuntos.setValue(attachments == null ? '' : attachments.join(', '))
      }
      else{
        Swal.fire({
          title: 'No hay archivo adjunto',
          html: 'Este elemento no cuenta con un archivo .msg',
          icon: 'warning',
          showCloseButton: true
        })
        this.dialogRef.close();
      }
      this.spinner.hide();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      this.dialogRef.close();
    }
  }

  fnDescargar(){
    const url = this.data;

    // Verificamos si existe link de descarga
    if(url || url != ''){
      var link = document.createElement('a');
      link.href = url;
      // Trigger de descarga
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    }
    else{
      Swal.fire({
        title: 'No hay archivo adjunto',
        html: 'Este elemento no cuenta con un archivo .msg',
        icon: 'warning',
        showCloseButton: true
      })
    }
  }

  fnCerrarDialog(){
    this.dialogRef.close();
  }

}
