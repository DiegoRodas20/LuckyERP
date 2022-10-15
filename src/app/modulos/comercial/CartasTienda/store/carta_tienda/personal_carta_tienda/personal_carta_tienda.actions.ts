export class AgregarPersonalAFormatoCartaTienda {
  static readonly type =
    '[PERSONALDEFORMATOCARTATIENDA] Agrega un nuevo personal.';
  constructor(public payload: any) {}
}

export class ReemplazarTodoPersonalFormatoCartaTienda {
  static readonly type =
    '[PERSONALDEFORMATOCARTATIENDA] Se reemplaza toda la data.';
  constructor(public payload: any[]) {}
}

export class EditarPersonalFormatoCartaTienda {
  static readonly type =
    '[PERSONALDEFORMATOCARTATIENDA] Se edita un solo registro un nuevo personal.';
  constructor(public dataOriginal: any, public dataNueva: any) {}
}

export class EliminarPersonalAFormatoCartaTienda {
  static readonly type =
    '[PERSONALDEFORMATOCARTATIENDA] Elimina un nuevo personal.';
  constructor(public payload: any) {}
}
