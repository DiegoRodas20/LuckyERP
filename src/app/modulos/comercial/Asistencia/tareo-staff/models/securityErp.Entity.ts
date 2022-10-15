export class SecurityErp {
    private usuarioId: any;
    private EmpresaId: any;
    public NombreEmpresa: string;
    public baseUrl: any;
    public sysUsuario: string;

    getUsuarioId() {
        const user = localStorage.getItem("currentUser");
        return this.usuarioId = JSON.parse(window.atob(user.split(".")[1])).uid;
    }
    getEmpresa() {
        return this.EmpresaId = localStorage.getItem("Empresa");
    }

    getLoginUsuario() {
        const user = localStorage.getItem("currentUser");
        return this.usuarioId = JSON.parse(window.atob(user.split(".")[1])).uno;
    }

    getNombreEmpresa() {
        return this.NombreEmpresa = localStorage.getItem("NombreEmpresa");
    }

}
