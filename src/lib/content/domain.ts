import { AppWindow, Boxes, ShieldCheck, Users } from "@lucide/svelte";
import type { Cre2b_aplicacions } from "../../generated/models/Cre2b_aplicacionsModel";
import type { Cre2b_modulos } from "../../generated/models/Cre2b_modulosModel";
import type { Cre2b_rols } from "../../generated/models/Cre2b_rolsModel";
import type { Cre2b_usuarioses } from "../../generated/models/Cre2b_usuariosesModel";

export type Section = "inicio" | "aplicaciones" | "modulos" | "roles" | "usuarios";
export type DataSection = Exclude<Section, "inicio">;
export type PageKey = DataSection | "moduleRoles" | "userRoles";
export type RawRecord = Cre2b_aplicacions | Cre2b_modulos | Cre2b_rols | Cre2b_usuarioses;

export type FormState = {
    name: string;
    link: string;
    priority: string;
    alias: string;
    appId: string;
    email: string;
    department: string;
    position: string;
    relatedIds: string[];
    originalVersion?: number;
};

export type ViewRecord = {
    id: string;
    name: string;
    detail: string;
    relation: string;
    active: boolean;
    raw: RawRecord;
};

export const PAGE_SIZE = 20;

export const sectionMeta = {
    aplicaciones: { title: "Aplicaciones", singular: "aplicación", subtitle: "Administra las aplicaciones disponibles en tu organización.", icon: AppWindow },
    modulos: { title: "Módulos", singular: "módulo", subtitle: "Organiza las funcionalidades de cada aplicación.", icon: Boxes },
    roles: { title: "Roles", singular: "rol", subtitle: "Define accesos y relaciónalos con los módulos necesarios.", icon: ShieldCheck },
    usuarios: { title: "Usuarios", singular: "usuario", subtitle: "Gestiona usuarios y asigna sus roles de acceso.", icon: Users },
} as const;

export function createEmptyForm(defaultApplicationId = ""): FormState {
    return { name: "", link: "", priority: "", alias: "", appId: defaultApplicationId, email: "", department: "", position: "", relatedIds: [] };
}

export function validateForm(section: DataSection, form: FormState) {
    form.name = form.name.trim();
    form.link = form.link.trim();
    form.alias = form.alias.trim();
    form.email = form.email.trim().toLowerCase();
    form.department = form.department.trim();
    form.position = form.position.trim();
    if (!form.name) throw new Error("El nombre es obligatorio.");
    if (section === "aplicaciones" && form.link) {
        try { new URL(form.link); } catch { throw new Error("El enlace de la aplicación no es válido."); }
    }
    if (section === "modulos") {
        if (!form.appId) throw new Error("Selecciona una aplicación.");
        if (form.priority !== "" && (!Number.isInteger(Number(form.priority)) || Number(form.priority) < 0))
            throw new Error("La prioridad debe ser un número entero igual o mayor que cero.");
    }
    if (section === "roles" && !form.alias) throw new Error("El alias es obligatorio.");
    if (section === "usuarios") {
        if (!form.email) throw new Error("El correo electrónico es obligatorio.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) throw new Error("El correo electrónico no es válido.");
    }
}

export function buildSearchFilter(kind: DataSection, value: string) {
    const term = value.trim().replaceAll("'", "''");
    if (!term) return undefined;
    const contains = (column: string) => `contains(${column},'${term}')`;
    switch (kind) {
        case "aplicaciones": return `${contains("cre2b_nombre")} or ${contains("cre2b_link")}`;
        case "modulos": return contains("cre2b_nombre");
        case "roles": return `${contains("cre2b_nombre")} or ${contains("cre2b_alias")}`;
        case "usuarios": return ["cre2b_nombre", "cre2b_email", "cre2b_departamento", "cre2b_posicion"].map(contains).join(" or ");
    }
}

export function mapRecords(section: Section, applications: Cre2b_aplicacions[], modules: Cre2b_modulos[], roles: Cre2b_rols[], users: Cre2b_usuarioses[]): ViewRecord[] {
    switch (section) {
        case "aplicaciones": return applications.map((record) => ({ id: record.cre2b_aplicacionid, name: record.cre2b_nombre ?? "Sin nombre", detail: record.cre2b_link ?? "Sin enlace", relation: record.cre2b_link ?? "—", active: record.statecode === 0, raw: record }));
        case "modulos": return modules.map((record) => ({ id: record.cre2b_moduloid, name: record.cre2b_nombre ?? "Sin nombre", detail: record.cre2b_prioridad == null ? "Sin prioridad" : `Prioridad ${record.cre2b_prioridad}`, relation: record.cre2b_aplicacionname ?? applications.find((application) => application.cre2b_aplicacionid === record._cre2b_aplicacion_value)?.cre2b_nombre ?? "Sin aplicación", active: record.statecode === 0, raw: record }));
        case "roles": return roles.map((record) => ({ id: record.cre2b_rolid, name: record.cre2b_nombre ?? "Sin nombre", detail: record.cre2b_alias ?? "Sin alias", relation: "Gestionar módulos", active: record.statecode === 0, raw: record }));
        case "usuarios": return users.map((record) => ({ id: record.cre2b_usuariosid, name: record.cre2b_nombre ?? "Sin nombre", detail: record.cre2b_email ?? "Sin correo", relation: "Gestionar roles", active: record.statecode === 0, raw: record }));
        case "inicio": return [];
    }
}
