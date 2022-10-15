export class RepositoryUtilitarios {
 public abLista = [];
 public tsLista = 'inactive';
 private  fbLista = [{ icon: 'person_add', tool: 'Nuevo Tareo' }];

  onToggleFab(fab: number, stat: number) {
    stat = (stat === -1) ? (this.abLista.length > 0) ? 0 : 1 : stat;
    this.tsLista = (stat === 0) ? 'inactive' : 'active';
    this.abLista = (stat === 0) ? [] : this.fbLista;
  }  
}