import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-dialog-historial-documentos',
  templateUrl: './dialog-historial-documentos.component.html',
  styleUrls: ['./dialog-historial-documentos.component.css']
})
export class DialogHistorialDocumentosComponent implements OnInit {

  displayedColumns: string[] = ['tipo', 'mensaje', 'usuario', 'fecha', 'hora',];
  dataSource: any;
  formHistorial: FormGroup;
  tipoFormulario: number;
  listaHistorial: any[];
  titulo: string;
  @ViewChild('paginatorTable', { static: true }) paginator: MatPaginator;
  
  constructor(
    public dialogRef: MatDialogRef<DialogHistorialDocumentosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.crearFormulario();
    this.titulo = this.data.cabecera.presupuesto;
    this.inicializarFormulario(this.data.cabecera);
    this.listaHistorial = this.data.listaHistorial;
    this.tipoFormulario = this.data.tipo;
    this.dataSource = new MatTableDataSource(this.listaHistorial);
    this.dataSource.paginator = this.paginator;
  }

  crearFormulario() {
    this.formHistorial = this.fb.group({
      presupuesto: [''],
      documento: [''],
      cliente: [''],
      titulo: [''],
    })
  }

  inicializarFormulario(data: any) {
    this.formHistorial.reset({
      'presupuesto': data.presupuesto,
      'documento': data.documento,
      'cliente': data.cliente,
      'titulo': data.titulo
    })
  }

}
