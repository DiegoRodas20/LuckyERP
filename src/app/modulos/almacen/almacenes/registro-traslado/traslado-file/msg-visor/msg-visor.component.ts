import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import MsgReader from '@freiraum/msgreader';
import { MensajeOutlook } from '../../models/message.model';
import { FilecontrolService } from 'src/app/shared/services/filecontrol.service';
import { Archivo_Traslado } from '../../models/registroTraslado.model';
import { asistenciapAnimations } from 'src/app/modulos/comercial/Asistencia/asistenciap/asistenciap.animations';

@Component({
  selector: 'app-msg-visor',
  templateUrl: './msg-visor.component.html',
  styleUrls: ['./msg-visor.component.css'],
  animations: [asistenciapAnimations]
})
export class MsgVisorComponent implements OnInit {
  tsLista = 'active';  // Inicia la lista abierta
  abLista = 0;

  formMensaje: FormGroup;
  url;
  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(MAT_DIALOG_DATA) private archivo: Archivo_Traslado,
    public dialogRef: MatDialogRef<MsgVisorComponent>,
    private http: HttpClient,
    private vFilecontrolService: FilecontrolService,
  ) { this.url = baseUrl; }


  async ngOnInit(): Promise<void> {
    this.formMensaje = this.formBuilder.group({
      txtRemitentes: [''],
      txtEmisor: [''],
      txtAsunto: [''],
      txtBody: [''],
      txtAdjuntos: [''],
    })

  }

  ngAfterViewInit() {
    setTimeout(async () => {

      //Para que no haya error de ngAfterContentChecked
      await this.fnDescargar(this.archivo);
      this.onToggleFab(1, -1);
    });
  }

  async fnDescargar(url: Archivo_Traslado) {

    try {
      this.spinner.show()
      let file = url.sRuta.split('/')[4];
      let type = file.split('.')[1];
      let area = 3 //Por ser proceso de almacen
      const response: Blob = await this.vFilecontrolService.fnDownload(file, type, area, this.url).toPromise()

      const arrayBufferMessage = await new Response(response).arrayBuffer();

      // const arrayBufferMessage = await fileMessage.arrayBuffer()
      const readMessage = new MsgReader(arrayBufferMessage)
      const mensajeOutllok: MensajeOutlook = readMessage.getFileData();
      var recipients = mensajeOutllok.recipients.map(value => {
        return value.name;
      })

      var attachments = mensajeOutllok.attachments.map(value => {
        return value.name
      })
      this.formMensaje.controls.txtRemitentes.setValue(recipients.join(', '))
      this.formMensaje.controls.txtEmisor.setValue(mensajeOutllok.senderName)
      this.formMensaje.controls.txtBody.setValue(mensajeOutllok.body)
      this.formMensaje.controls.txtAsunto.setValue(mensajeOutllok.subject)
      this.formMensaje.controls.txtAdjuntos.setValue(attachments == null ? '' : attachments.join(', '))


      this.spinner.hide();
    } catch (err) {
      console.log(err);
      this.spinner.hide();
      this.dialogRef.close();
    }

  }

  // Funcionalidad de los botones laterales
  onToggleFab(fab: number, stat: number) {

    stat = (stat === -1) ? (this.abLista > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? 0 : 3;

  }

  fnDescargarArchivo() {
    this.spinner.show();
    let file = this.archivo.sRuta.split('/')[4];
    let type = file.split('.')[1];
    let area = 3 //Por ser proceso de almacen
    this.vFilecontrolService.fnDownload(file, type, area, this.url).subscribe(
      (res: any) => {

        let file = `ERP_Documento_${Math.random()}.${type}`;
        saveAs(res, file);
      },
      err => {
        console.log(err);
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    )
  }
}
