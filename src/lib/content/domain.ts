import { AppWindow, Boxes, ShieldCheck, Users } from "@lucide/svelte";
import type { Application, EntityRecord, Module, Role, User } from "../data/types";

export type Section = "inicio" | "aplicaciones" | "modulos" | "roles" | "usuarios";
export type DataSection = Exclude<Section, "inicio">;
export type PageKey = DataSection | "moduleRoles" | "userRoles";
export type RawRecord = EntityRecord;

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
    if (section === "usuarios" && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        throw new Error("El correo electrónico no es válido.");
}

export function mapRecords(section: Section, applications: Application[], modules: Module[], roles: Role[], users: User[]): ViewRecord[] {
    switch (section) {
        case "aplicaciones": return applications.map((record) => ({ id: record.id, name: record.name ?? "Sin nombre", detail: record.link ?? "Sin enlace", relation: record.link ?? "—", active: record.active, raw: record }));
        case "modulos": return modules.map((record) => ({ id: record.id, name: record.name ?? "Sin nombre", detail: record.priority == null ? "Sin prioridad" : `Prioridad ${record.priority}`, relation: record.applicationName ?? applications.find((application) => application.id === record.applicationId)?.name ?? "Sin aplicación", active: record.active, raw: record }));
        case "roles": return roles.map((record) => ({ id: record.id, name: record.name ?? "Sin nombre", detail: record.alias ?? "Sin alias", relation: "Gestionar módulos", active: record.active, raw: record }));
        case "usuarios": return users.map((record) => ({ id: record.id, name: record.name ?? "Sin nombre", detail: record.email ?? "Sin correo", relation: "Gestionar roles", active: record.active, raw: record }));
        case "inicio": return [];
    }
}
