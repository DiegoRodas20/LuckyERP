import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { element } from 'protractor';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit {
  tPrincipalDC: string[] = ['pGen', 'pEsp', 'descripcion', 'marg', 'total', 'lima', 'piura', 'chiclayo', 'action'];
  tPrincipalDS: MatTableDataSource<TPrincipal>;
  tPrincipal = new Array<TPrincipal>();
  tGestorDC: string[] = ['cat', 'catNombre', 'canal', 'canalNombre', 'nPers', 'diasPla', 'totalDias', 'diasCotiz', 'remunDia', 'total', 'implem', 'planilla3', 'totalNeto', 'action'];
  tGestorDS: MatTableDataSource<TGestor>;
  tGestor = new Array<TGestor>();
  comboCat = new Array<Cat>();
  comboCanal = new Array<Canal>();
  comboCanal2 = new Array<Canal>();
  totalNetoAcumulado: number = 0;
  ciudadSelecc: string;
  tPrincipalSelect: TPrincipal;

  constructor() {
    this.listTPrincipal();
    this.listTGestor();
    this.listComboCat();
    this.listComboCanal();
  }

  ngOnInit(): void {

  }

  listTPrincipal() {
    this.tPrincipal.push({ idPrincipal: 1, pGen: 0, pEsp: '01', descripcion: 'Gestor de Marca', marg: 30.00, total: 205.20, lima: 205.20, piura: 105.2, chiclayo: 0.00 });
    this.tPrincipal.push({ idPrincipal: 2, pGen: 1, pEsp: '30', descripcion: 'Capatación', marg: 15.00, total: 0.00, lima: 0.00, piura: 0.00, chiclayo: 0.00 });
    this.tPrincipal.push({ idPrincipal: 3, pGen: 8, pEsp: '01', descripcion: 'Fola', marg: 0.00, total: 0.00, lima: 0.00, piura: 0.00, chiclayo: 0.00 });
    this.tPrincipal.push({ idPrincipal: 4, pGen: 8, pEsp: '03', descripcion: 'Tarifa Comunicaciones', marg: 0.00, total: 0.00, lima: 0.00, piura: 0.00, chiclayo: 0.00 });

    this.tPrincipalDS = new MatTableDataSource(this.tPrincipal);
  }

  listTGestor() {
    this.tGestor.push({
      cat: '65', catNombre: 'Estandar por dia', canal: '002', canalNombre: 'Canal Tradicional', idPrincipal: 1,
      nPers: 2.00, diasPla: 30.00, totalDias: 60.00, diasCotiz: 26.00, remunDia: 130.00, total: 6592.00, implem: 30.00, planilla3: 0.00, ciudad: 'lima', totalNeto: 205.20
    });
    this.tGestor.push({
      cat: '65', catNombre: 'Estandar por dia', canal: '002', canalNombre: 'Canal Tradicional', idPrincipal: 1,
      nPers: 2.00, diasPla: 30.00, totalDias: 60.00, diasCotiz: 26.00, remunDia: 130.00, total: 6592.00, implem: 30.00, planilla3: 0.00, ciudad: 'piura', totalNeto: 105.20
    });
    //this.tGestorDS = new MatTableDataSource(this.tGestor);
  }

  btnEliminarTGestor(element: TGestor){
    this.tGestor = this.tGestor.filter(filtro => filtro != element);
    this.filtrarTGestor(element.idPrincipal, element.ciudad);
    this.introTotalNeto(element);
  }

  btnNuevoTGestor() {
    this.tGestor.push({ idPrincipal: this.tPrincipalSelect.idPrincipal, ciudad: this.ciudadSelecc });
    //console.log(this.tGestor);
    this.filtrarTGestor(this.tPrincipalSelect.idPrincipal, this.ciudadSelecc);
  }

  btnTGestorLima(tPrincipal: TPrincipal) {
    this.ciudadSelecc = 'lima';
    this.tPrincipalSelect = tPrincipal;
    this.filtrarTGestor(tPrincipal.idPrincipal, 'lima'); 
    //this.totalNeto = tPrincipal.lima;
  }
  btnTGestorPiura(tPrincipal: TPrincipal) {
    this.ciudadSelecc = 'piura';
    this.tPrincipalSelect = tPrincipal;
    this.filtrarTGestor(tPrincipal.idPrincipal, 'piura');
    //this.totalNeto = tPrincipal.piura;
  }
  btnTGestorChiclayo(tPrincipal: TPrincipal) {
    this.ciudadSelecc = 'chiclayo';
    this.tPrincipalSelect = tPrincipal;
    this.filtrarTGestor(tPrincipal.idPrincipal, 'chiclayo');
    //this.totalNeto = tPrincipal.chiclayo;
  }

  filtrarTGestor(idPrincipal: number, ciudad: string) {
    this.tGestorDS = new MatTableDataSource();
    this.tGestorDS = new MatTableDataSource(
      this.tGestor.filter(gestor => gestor.ciudad == ciudad && gestor.idPrincipal == idPrincipal)
    ); 
  }

  listComboCat() {
    this.comboCat.push({ cat: '65', catNombre: 'Estandar por dia' });
    this.comboCat.push({ cat: '66', catNombre: 'Preferencial por dia' });
  }

  listComboCanal() {
    this.comboCanal.push({ canal: '002', cat: '65', canalNombre: 'Canal Tradicional' });
    this.comboCanal.push({ canal: '001', cat: '65', canalNombre: 'Canal no Tradicional' });
    this.comboCanal.push({ canal: '001', cat: '66', canalNombre: 'Canal no Tradicional' });

    this.comboCanal2 = this.comboCanal;
  }

  introTotalNeto(tGestor: TGestor) {
    //tGestor.totalNeto = this.totalNeto;
    //console.log(this.tPrincipal);
    //console.log(tGestor); 
    var vTPrincipal: TPrincipal;

    this.totalNetoAcumulado = 0;
    vTPrincipal = this.tPrincipal.filter(principal => principal.idPrincipal == tGestor.idPrincipal)[0];//obtner registro padre

    if (tGestor.ciudad == 'lima') {
      this.tGestorDS.data.forEach(element => {
        this.totalNetoAcumulado = Number(this.totalNetoAcumulado) + Number(element.totalNeto);
      })
      vTPrincipal.lima = this.totalNetoAcumulado;
    } else if (tGestor.ciudad == 'piura') {
      this.tGestorDS.data.forEach(element => {
        this.totalNetoAcumulado = Number(this.totalNetoAcumulado) + Number(element.totalNeto);
      })
      vTPrincipal.piura = this.totalNetoAcumulado;
    } else if (tGestor.ciudad == 'chiclayo') {
      this.tGestorDS.data.forEach(element => {
        this.totalNetoAcumulado = Number(this.totalNetoAcumulado) + Number(element.totalNeto);
      })
      vTPrincipal.piura = this.totalNetoAcumulado;
    }
    vTPrincipal.total = Number(vTPrincipal.lima) + Number(vTPrincipal.piura) + Number(vTPrincipal.chiclayo);
    this.totalNetoAcumulado = 0;
  }

  filtrarCboCanal(cat: Cat) {
     this.comboCanal = this.comboCanal2.filter(element => element.cat == cat.cat);
  }
}

export interface TPrincipal {
  idPrincipal?: number;
  pGen?: number;
  pEsp?: string;
  descripcion?: string;
  marg?: number;
  total?: number;
  lima?: number;
  piura?: number;
  chiclayo?: number;
}
export interface TGestor {
  cat?: string;
  catNombre?: string;
  canal?: string;
  canalNombre?: string;
  nPers?: number;
  diasPla?: number;
  totalDias?: number;
  diasCotiz?: number;
  remunDia?: number;
  total?: number;
  implem?: number;
  planilla3?: number;
  ciudad?: string;
  idPrincipal?: number;
  totalNeto?: number;
}

export interface Cat {
  cat: string;
  catNombre: string;
}
export interface Canal {
  canal: string;
  cat: string;
  canalNombre: string;
}
