import { OrdenCompraSc } from "../models/ordenCompraSc.entity";
export class RepositoryCompraSc {
  enviarCompraSc(entity: OrdenCompraSc) {
    let pParametro = [];
    let list = [
      entity.codigodGastoCosto,
      entity.codigoIdPais,
      entity.codigoEmpresa,
      entity.codigoCentroCosto,
      entity.codigoCotizacion,      
      entity.codigoSolicitante,
      entity.codigoProveedor,
      entity.codigoTipoCambio,
      entity.codigoMoneda,
      entity.codigoUsuario,
      entity.codigoBanco,
      entity.codigoLugarEntrega,
      entity.codigoServicio,
      entity.fechaEntrega,
      entity.fechaOrden,
      entity.igv,
      entity.direccionEntrega,
      entity.nombreTitulo,
      entity.tipoDocumento,
      entity.estado,
      entity.detalle,
    ];
    for (let i of list) {
      pParametro.push(i);
    }
    return pParametro;
  }
}
