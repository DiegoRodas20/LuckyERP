
export class UsuarioRepository {
    public sPais: string;
    public nPersonal: number;
    public sPersonal: string;
    public nidEmpresa: number;
    public sUsuario: string;
    public sUsuarioValidado: string;
    public nPrivilegio: number;
    public nIdModulo: number;
    public estado: boolean;
    public mensajeValidacionPais: string;
    public mensajeValidacionEmpresa: string;
    public mensajeValidacionPerfil: string;



    ConsultaEmpresa() {
        let pParametro = [];
        let list = [this.sPais]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }


    ConsultaPersonal() {
        let pParametro = [];
        let list = [this.nidEmpresa]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }

    ConsultaUsuario() {
        let pParametro = [];
        let list = [this.sUsuario]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }
    grabarPerfil() {
        let pParametro = [];
        let list = [this.sPais, this.nidEmpresa, this.nPrivilegio, this.nIdModulo, this.estado, this.sUsuario]
        for (let i of list) {
            pParametro.push(i);
        }
        return pParametro;
    }

    limpiarMensaje() {
        return this.mensajeValidacionPais = "",
            this.mensajeValidacionEmpresa = "",
            this.mensajeValidacionPerfil = ""
    }

}