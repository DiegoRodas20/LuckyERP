export interface ExpRegistroVentaDto {

        subDiario: string;
        numeroComprobante: string;
        fechaComprobante: string;
        codigoMoneda: string;
        glosaPrincipal: string;
        tipoCambio: string;
        tipoConversion: string;
        flagConversion: string;
        fechaTipoCambio: string;
        cuentaContable: string;
        codigoAnexo: string;
        codigoCentroCosto: string;
        debeHaber: string;
        importeOriginal: string;
        importeDolares: string;
        importeSoles: string;
        tipoDocumento: string;
        numeroDocumento: string;
        fechaDocumento: string;
        fechaVencimiento: string;
        codigoArea: string;
        glosaDetalle: string;

    }

    export interface TipoDocumentoFacturacion {
        codigoDocumento: number;
        nombreDocumento: string;
    }

    export interface SerieExp {
        codigoSerie: number;
        serie: string;
    }

    export interface Numerador {
        numerador: string;
    }
