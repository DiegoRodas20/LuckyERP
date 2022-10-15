export class SecurityErp {
    private usuarioId: number;
    private EmpresaId: any;
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

    getPais() {
        return this.EmpresaId = localStorage.getItem("Pais");
    }
}
