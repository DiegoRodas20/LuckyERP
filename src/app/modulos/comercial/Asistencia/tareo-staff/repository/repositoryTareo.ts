
export class RepositoryTareo {
    public s1Empresa: string;
    public s2Responsable: string;
    public n3IdPersonal: number;
    public n4CargoPersonal: number;
    public n5TotalDias: number = 0;
    public n6Porcentaje: number;
    public s7UsuarioRegistro: string
    public s8EstadoTareo: string
    public n9DiasMaximoPermitido: number;
    public n10CostoEmpresa: number = 1;
    public n11PorcentajeCostoEmpresa: number = 0;
    public n12AnioConsulta: number;
    public n13IdTareo: number;
    public n14IdMes: number;
    public n15Anio: number;
    public s16LineasDetalle: string;

    public sLineasConsultas: string;
    public nPartidaId: number;
    public nIdSucursal: number;
    public nIntento: number = 0;
    public sumaTotalPorcentajesEquivalentes: number = 0;
    public sumaTotalDiasEquivalentes: number = 0;
    public indexDetalleTareo;
    public totalfilasDetalleTareo: string
    public mostrarTablaDetalleTareo: boolean;

    displayedColumns: string[] = ['sCodCC', 'sDescCC', 'sPerfil', 'sCanal', 'nPorcentaje', 'nDiasPropor']

    generaCadenaTareo() {
        let pParametro = [];
        let list = [
            this.s1Empresa,
            this.s2Responsable,
            this.n3IdPersonal,
            this.n4CargoPersonal,
            this.n5TotalDias,
            this.n6Porcentaje,
            this.s7UsuarioRegistro,
            this.s8EstadoTareo,
            this.n9DiasMaximoPermitido,
            this.n10CostoEmpresa,
            this.n11PorcentajeCostoEmpresa,
            this.n12AnioConsulta,
            this.n13IdTareo,
            this.n14IdMes,
            this.n15Anio,
            this.nPartidaId,
            this.nIdSucursal,
            this.s16LineasDetalle
        ]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }

    getRandomCostoEmpresa() {
        return this.n10CostoEmpresa = Math.floor(1000 + Math.random() * 2000);
    }

    generaCadenaConsultaEmpleado() {
        let pParametro = [];
        let list = [0, this.s2Responsable, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }

    generaCadenaConsultaEmpleadoDetalle() {
        let pParametro = [];
        let list = [this.s1Empresa, this.n3IdPersonal, this.n4CargoPersonal, this.n13IdTareo]
        // let list = [this.s1Empresa, this.s2Responsable, this.n3IdPersonal, this.n4CargoPersonal, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }

    generaCadenaConsultaEmpleadoMeses() {
        let pParametro = [];
        let list = [this.n15Anio, this.n3IdPersonal]
        // let list = [this.s1Empresa, this.s2Responsable, this.n3IdPersonal, this.n4CargoPersonal, 0, 0, 0, 0, 0, 0, 0, this.n15Anio, 0, 0, 0, 0]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }

    //Add=>ConsultaSP => {Externo}
    generaCadenaConsultaLineas() {
        let pParametro = [];
        // let list = [this.n3IdPersonal, this.s1Empresa, this.nPartidaId, 0, this.n15Anio,this.n14IdMes, this.n13IdTareo, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let list = [this.n3IdPersonal, this.s1Empresa, this.nPartidaId, 0, this.n15Anio, this.n14IdMes, this.n13IdTareo]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }

    //List=>Tareo
    generaCadenaConsultaTareo() {
        let pParametro = [];
        // let list = [this.s1Empresa, this.s2Responsable, this.n3IdPersonal, this.n4CargoPersonal, 0, 0, 0, 0, 0, 0, 0, 0, this.n13IdTareo, 0, 0, 0]

        let list = [this.n13IdTareo]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }


    //ConsultaLineas=>Prorrateo.!
    generaCadenaLineasConsultas() {
        let pParametro = [];
        let list = [this.sLineasConsultas, this.n9DiasMaximoPermitido, this.n15Anio, this.n14IdMes, this.n3IdPersonal, this.s1Empresa, this.nPartidaId]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }

    generaCadenaConsultaUsuarioSistema() {
        let pParametro = [];
        // let list = [this.s1Empresa, this.s2Responsable, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let list = [this.s2Responsable]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }

    // edit/consulta=>tareo
    generaCadenaConsultaCampaniaTareo() {
        let pParametro = [];
        let list = [this.s1Empresa, this.s2Responsable, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, this.n13IdTareo, 0, 0, 0]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }
}

