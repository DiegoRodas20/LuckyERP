import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ParametroProcedureInterface, Partida } from '../../../interfaces/parametroProcedure';
import { ParametroService } from '../../../parametro.service';

@Component({
  selector: 'app-formulario-partida',
  templateUrl: './formulario-partida.component.html',
  styleUrls: ['./formulario-partida.component.css']
})
export class FormularioPartidaComponent implements OnInit {

  form: FormGroup;
  lPartidaEspecifica; // Lista para partida especifica
  lPartidaEspecificaLocal: Partida[];
  filteredPartidaEspecifica: Observable<Partida[]>;
  partidaEspecificaId: number;
  lPartidaEspecificaItem; //  Lista Especifica por items
  lPartidaEspecificaItemLocal: Partida[];
  filteredPartidaEspecificaItem: Observable<Partida[]>;
  constructor(private fb: FormBuilder, private router: Router, private partidaService: ParametroService) {
    this.crearFormulario();
  }

  async ngOnInit() {
    // await this.obtenerGrupoDePartidasEspecificas();
    await this.obtenerPartidaEspecificaGenerida();
    // await this.obtenerPartidaEspecificaGenericaItem();
  }

  // Llamados al servicio para fitlro del autocomplete

  async obtenerPartidaEspecificaGenericaItem(dad: number) {
    // const dad = this.partidaEspecificaId;
    if ( dad ) {
      // Modelo 3
      let model3: ParametroProcedureInterface;
      const parametros3 = `||${dad}|`;
      model3 = {
        pEntidad: 2,
        pOpcion: 2,
        pParametro: parametros3.toString(),
        pTipo: 2,
        pParametroDet: ''
      };
      this.lPartidaEspecificaItem = await this.partidaService.listarPartidaEspecificaGenericaItem(model3);
      // console.log('Veamos tmr',this.lPartidaEspecificaItem);
      // this.lPartidaEspecificaItemLocal = this.lPartidaEspecificaItem;
      // this.filteredPartidaEspecificaItem = this.form.controls['especificaItem'].valueChanges.pipe(
      //   startWith(''),
      //   map(value => typeof value === 'string' ? value : value.descripcion),
      //   map(descripcion => descripcion ? this._filterPartidaItem(descripcion) : this.lPartidaEspecificaItemLocal.slice())
      // );
      console.log('DAD', true);
    } else{
      console.log('DAD', false);
    }
  }

  async obtenerPartidaEspecificaGenerida() {
    let model2: ParametroProcedureInterface;
    const parametros2 = `|604||`;
    model2 = {
      pEntidad: 2,
      pOpcion: 1,
      pParametro: parametros2.toString(),
      pTipo: 2,
      pParametroDet: ''
    };
    this.lPartidaEspecifica = await this.partidaService.listarPartidaEspecificaGenerida(model2);
    // this.lPartidaEspecificaLocal = this.lPartidaEspecifica;
    // this.filteredPartidaEspecifica = this.form.controls['IdDadTipEle'].valueChanges.pipe(
    //   startWith(''),
    //   map(value => typeof value === 'string' ? value : value.descripcion ),
    //   map(descripcion => descripcion ? this._filter(descripcion) : this.lPartidaEspecificaLocal.slice() )
    // );
  }

  private _filter(descripcion: string): Partida[] {
    const filterValue = descripcion.toLocaleLowerCase();
    return this.lPartidaEspecificaLocal.filter(option => option.descripcion.toLocaleLowerCase().indexOf(filterValue) === 0);
  }

  private _filterPartidaItem(descripcion: string): Partida[] {
    const filterValue = descripcion.toLocaleLowerCase();
    return this.lPartidaEspecificaItemLocal.filter(option => option.descripcion.toLocaleLowerCase().indexOf(filterValue) === 0);
  }

  crearFormulario() {
    this.form = this.fb.group({
      IdTipEle: 0,
      descripcion: ['', Validators.required],
      estado: 1,
      IdDadTipEle: [, Validators.required],
      especificaItem: [, Validators.required]
    });
  }

  mostrarPartidaEspecifica(): void {
    const id = this.form.get('IdDadTipEle').value;
    let model3: ParametroProcedureInterface;
    const parametros3 = `||${id}|`;
    model3 = {
      pEntidad: 2,
      pOpcion: 2,
      pParametro: parametros3.toString(),
      pTipo: 2,
      pParametroDet: ''
    };
    this.partidaService.listarPartidaEspecificaGenericaItem(model3).then( (resolve: any) => {
      console.log(resolve);
      this.lPartidaEspecificaItem = resolve;
    });
  }

  save() {
  }

  limpiarListaEspecificaItem() {

    this.lPartidaEspecificaItem = [];
    this.lPartidaEspecificaItemLocal = [];
    this.filteredPartidaEspecificaItem = null;
    // this.form.setValue({
    //   especificaItem: ''
    // });
    // this.form.reset({
    //   especificaItem: ''
    // });
    // this.form.controls['especificaItem'].setValue('');
  }

  // Gets

  get grupoPartidaNotFound() {
    let name = this.form.get('IdDadTipEle').value;
    if (this.form.get('IdDadTipEle').touched) {
      const listaTemp = this.lPartidaEspecificaLocal.filter(option => option.descripcion === name );
      if ( listaTemp.length === 0 ) {
        this.limpiarListaEspecificaItem();
        return true;
      } else {
        console.log('LLegó', listaTemp[0].idTipEle);
        if ( this.partidaEspecificaId ) {
          if ( this.partidaEspecificaId !== Number(listaTemp[0].idTipEle)){
            this.obtenerPartidaEspecificaGenericaItem(this.partidaEspecificaId).then((resolve) => {
              console.log('RESOLVE',resolve);
            });
          }
        } else {
          this.obtenerPartidaEspecificaGenericaItem(listaTemp[0].idTipEle).then((resolve) => {
            console.log('RESOLVE',resolve);
          });
        }
        this.partidaEspecificaId = listaTemp[0].idTipEle;
        return false;
      }
    }
    return false;
  }

}
