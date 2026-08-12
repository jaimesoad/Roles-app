import { Cre2b_aplicacionsService } from "../../generated/services/Cre2b_aplicacionsService";
import { Cre2b_modulosService } from "../../generated/services/Cre2b_modulosService";
import { Cre2b_rolsService } from "../../generated/services/Cre2b_rolsService";
import { Cre2b_usuariosesService } from "../../generated/services/Cre2b_usuariosesService";
import { Cre2b_modulos_rolesesService } from "../../generated/services/Cre2b_modulos_rolesesService";
import { Cre2b_usuarios_rolesesService } from "../../generated/services/Cre2b_usuarios_rolesesService";
import type { Cre2b_aplicacions } from "../../generated/models/Cre2b_aplicacionsModel";
import type { Cre2b_modulos } from "../../generated/models/Cre2b_modulosModel";
import type { Cre2b_rols } from "../../generated/models/Cre2b_rolsModel";
import type { Cre2b_usuarioses } from "../../generated/models/Cre2b_usuariosesModel";
import type { Cre2b_modulos_roleses } from "../../generated/models/Cre2b_modulos_rolesesModel";
import type { Cre2b_usuarios_roleses } from "../../generated/models/Cre2b_usuarios_rolesesModel";
import { buildSearchFilter, PAGE_SIZE, validateForm, type DataSection, type FormState, type RawRecord } from "../content/domain";

type OperationResult<T> = { success: boolean; data: T; error?: unknown; skipToken?: string };
type ApplicationCreate = Parameters<typeof Cre2b_aplicacionsService.create>[0];
type ModuleCreate = Parameters<typeof Cre2b_modulosService.create>[0];
type RoleCreate = Parameters<typeof Cre2b_rolsService.create>[0];
type UserCreate = Parameters<typeof Cre2b_usuariosesService.create>[0];
type ModuleRoleCreate = Parameters<typeof Cre2b_modulos_rolesesService.create>[0];
type UserRoleCreate = Parameters<typeof Cre2b_usuarios_rolesesService.create>[0];

export function requireData<T>(result: OperationResult<T>): T {
    if (!result.success) throw result.error ?? new Error("Dataverse no completó la operación.");
    return result.data;
}

export function initialPageRequests() {
    return [
        Cre2b_aplicacionsService.getAll({ orderBy: ["cre2b_nombre asc"], top: PAGE_SIZE, maxPageSize: PAGE_SIZE }),
        Cre2b_modulosService.getAll({ orderBy: ["cre2b_prioridad asc", "cre2b_nombre asc"], top: PAGE_SIZE, maxPageSize: PAGE_SIZE }),
        Cre2b_rolsService.getAll({ orderBy: ["cre2b_nombre asc"], top: PAGE_SIZE, maxPageSize: PAGE_SIZE }),
        Cre2b_usuariosesService.getAll({ orderBy: ["cre2b_nombre asc"], top: PAGE_SIZE, maxPageSize: PAGE_SIZE }),
    ] as const;
}

async function countPages<T>(request: (skipToken?: string) => Promise<OperationResult<T[]>>) {
    let count = 0;
    let skipToken: string | undefined;
    do {
        const result = await request(skipToken);
        count += requireData(result).length;
        skipToken = result.skipToken;
    } while (skipToken);
    return count;
}

export async function fetchEntityCounts(): Promise<Record<DataSection, number>> {
    const [aplicaciones, modulos, roles, usuarios] = await Promise.all([
        countPages((skipToken) => Cre2b_aplicacionsService.getAll({ select: ["cre2b_aplicacionid"], top: PAGE_SIZE, maxPageSize: PAGE_SIZE, skipToken })),
        countPages((skipToken) => Cre2b_modulosService.getAll({ select: ["cre2b_moduloid"], top: PAGE_SIZE, maxPageSize: PAGE_SIZE, skipToken })),
        countPages((skipToken) => Cre2b_rolsService.getAll({ select: ["cre2b_rolid"], top: PAGE_SIZE, maxPageSize: PAGE_SIZE, skipToken })),
        countPages((skipToken) => Cre2b_usuariosesService.getAll({ select: ["cre2b_usuariosid"], top: PAGE_SIZE, maxPageSize: PAGE_SIZE, skipToken })),
    ]);
    return { aplicaciones, modulos, roles, usuarios };
}

export async function fetchPage(kind: DataSection, search = "", skipToken?: string): Promise<{ data: RawRecord[]; skipToken?: string }> {
    const common = { top: PAGE_SIZE, maxPageSize: PAGE_SIZE, skipToken, filter: buildSearchFilter(kind, search) };
    switch (kind) {
        case "aplicaciones": { const result = await Cre2b_aplicacionsService.getAll({ ...common, orderBy: ["cre2b_nombre asc"] }); return { data: requireData(result), skipToken: result.skipToken }; }
        case "modulos": { const result = await Cre2b_modulosService.getAll({ ...common, orderBy: ["cre2b_prioridad asc", "cre2b_nombre asc"] }); return { data: requireData(result), skipToken: result.skipToken }; }
        case "roles": { const result = await Cre2b_rolsService.getAll({ ...common, orderBy: ["cre2b_nombre asc"] }); return { data: requireData(result), skipToken: result.skipToken }; }
        case "usuarios": { const result = await Cre2b_usuariosesService.getAll({ ...common, orderBy: ["cre2b_nombre asc"] }); return { data: requireData(result), skipToken: result.skipToken }; }
    }
}

async function fetchAllRelations<T>(request: (skipToken?: string) => Promise<OperationResult<T[]>>) {
    const records: T[] = [];
    let skipToken: string | undefined;
    do { const result = await request(skipToken); records.push(...requireData(result)); skipToken = result.skipToken; } while (skipToken);
    return records;
}

export const fetchModuleRoles = (roleId: string) => fetchAllRelations<Cre2b_modulos_roleses>((skipToken) => Cre2b_modulos_rolesesService.getAll({ filter: `_cre2b_rol_value eq ${roleId}`, top: PAGE_SIZE, maxPageSize: PAGE_SIZE, skipToken }));
export const fetchUserRoles = (userId: string) => fetchAllRelations<Cre2b_usuarios_roleses>((skipToken) => Cre2b_usuarios_rolesesService.getAll({ filter: `_cre2b_usuario_value eq ${userId}`, top: PAGE_SIZE, maxPageSize: PAGE_SIZE, skipToken }));

export async function fetchMissingModules(ids: string[], loaded: Cre2b_modulos[]) {
    const missing = ids.filter((id) => !loaded.some((record) => record.cre2b_moduloid === id));
    return Promise.all(missing.map(async (id) => requireData(await Cre2b_modulosService.get(id))));
}
export async function fetchMissingRoles(ids: string[], loaded: Cre2b_rols[]) {
    const missing = ids.filter((id) => !loaded.some((record) => record.cre2b_rolid === id));
    return Promise.all(missing.map(async (id) => requireData(await Cre2b_rolsService.get(id))));
}

export async function saveEntity(section: DataSection, editingId: string | null, form: FormState) {
    validateForm(section, form);
    if (editingId) await assertCurrentVersion(section, editingId, form.originalVersion);
    await assertUniqueFields(section, editingId, form);
    switch (section) {
        case "aplicaciones": { const payload = { cre2b_nombre: form.name, cre2b_link: form.link }; return requireData(editingId ? await Cre2b_aplicacionsService.update(editingId, payload) : await Cre2b_aplicacionsService.create(payload as ApplicationCreate)).cre2b_aplicacionid; }
        case "modulos": { const payload = { cre2b_nombre: form.name, cre2b_prioridad: form.priority === "" ? undefined : Number(form.priority), "cre2b_Aplicacion@odata.bind": form.appId ? `/cre2b_aplicacions(${form.appId})` : undefined }; return requireData(editingId ? await Cre2b_modulosService.update(editingId, payload) : await Cre2b_modulosService.create(payload as ModuleCreate)).cre2b_moduloid; }
        case "roles": { const payload = { cre2b_nombre: form.name, cre2b_alias: form.alias }; return requireData(editingId ? await Cre2b_rolsService.update(editingId, payload) : await Cre2b_rolsService.create(payload as RoleCreate)).cre2b_rolid; }
        case "usuarios": { const payload = { cre2b_nombre: form.name, cre2b_email: form.email, cre2b_departamento: form.department, cre2b_posicion: form.position }; return requireData(editingId ? await Cre2b_usuariosesService.update(editingId, payload) : await Cre2b_usuariosesService.create(payload as UserCreate)).cre2b_usuariosid; }
    }
}

export async function deleteEntity(section: DataSection, id: string) {
    switch (section) {
        case "aplicaciones": return Cre2b_aplicacionsService.delete(id);
        case "modulos": return Cre2b_modulosService.delete(id);
        case "roles": return Cre2b_rolsService.delete(id);
        case "usuarios": return Cre2b_usuariosesService.delete(id);
    }
}

async function assertCurrentVersion(section: DataSection, id: string, expected?: number) {
    if (expected == null) return;
    let version: number | undefined;
    switch (section) {
        case "aplicaciones": version = requireData(await Cre2b_aplicacionsService.get(id, { select: ["versionnumber"] })).versionnumber; break;
        case "modulos": version = requireData(await Cre2b_modulosService.get(id, { select: ["versionnumber"] })).versionnumber; break;
        case "roles": version = requireData(await Cre2b_rolsService.get(id, { select: ["versionnumber"] })).versionnumber; break;
        case "usuarios": version = requireData(await Cre2b_usuariosesService.get(id, { select: ["versionnumber"] })).versionnumber; break;
    }
    if (String(version) !== String(expected))
        throw new Error("Este registro fue modificado por otra persona. Actualiza los datos antes de volver a guardar.");
}

async function assertUniqueFields(section: DataSection, editingId: string | null, form: FormState) {
    if (section === "usuarios" && !form.email) return;
    const escape = (value: string) => value.replaceAll("'", "''");
    const definitions = {
        aplicaciones: ["cre2b_aplicacionid", `cre2b_nombre eq '${escape(form.name)}'`],
        modulos: ["cre2b_moduloid", `cre2b_nombre eq '${escape(form.name)}'`],
        roles: ["cre2b_rolid", `cre2b_nombre eq '${escape(form.name)}' or cre2b_alias eq '${escape(form.alias)}'`],
        usuarios: ["cre2b_usuariosid", `cre2b_email eq '${escape(form.email)}'`],
    } as const;
    const [idField, baseFilter] = definitions[section];
    const filter = editingId ? `(${baseFilter}) and ${idField} ne ${editingId}` : baseFilter;
    let exists = false;
    switch (section) {
        case "aplicaciones": exists = requireData(await Cre2b_aplicacionsService.getAll({ filter, select: [idField], top: 1, maxPageSize: 1 })).length > 0; break;
        case "modulos": exists = requireData(await Cre2b_modulosService.getAll({ filter, select: [idField], top: 1, maxPageSize: 1 })).length > 0; break;
        case "roles": exists = requireData(await Cre2b_rolsService.getAll({ filter, select: [idField], top: 1, maxPageSize: 1 })).length > 0; break;
        case "usuarios": exists = requireData(await Cre2b_usuariosesService.getAll({ filter, select: [idField], top: 1, maxPageSize: 1 })).length > 0; break;
    }
    if (exists) throw new Error(section === "usuarios" ? "Ya existe un usuario con este correo." : "Ya existe un registro con el mismo nombre o identificador.");
}

export async function fetchApplication(id: string) {
    return requireData(await Cre2b_aplicacionsService.get(id));
}

export async function syncModuleRoles(roleId: string, selectedIds: string[]) {
    const current = await fetchModuleRoles(roleId);
    const added: string[] = [];
    const removed: string[] = [];
    try {
        for (const moduleId of selectedIds.filter((id) => !current.some((relation) => relation._cre2b_modulo_value === id))) {
            const relation = requireData(await Cre2b_modulos_rolesesService.create({ "cre2b_Modulo@odata.bind": `/cre2b_modulos(${moduleId})`, "cre2b_Rol@odata.bind": `/cre2b_rols(${roleId})` } as ModuleRoleCreate));
            added.push(relation.cre2b_modulos_rolesid);
        }
        for (const relation of current.filter((item) => !selectedIds.includes(item._cre2b_modulo_value ?? ""))) {
            await Cre2b_modulos_rolesesService.delete(relation.cre2b_modulos_rolesid);
            if (relation._cre2b_modulo_value) removed.push(relation._cre2b_modulo_value);
        }
    } catch (error) {
        await Promise.allSettled(added.map((id) => Cre2b_modulos_rolesesService.delete(id)));
        await Promise.allSettled(removed.map((moduleId) => Cre2b_modulos_rolesesService.create({ "cre2b_Modulo@odata.bind": `/cre2b_modulos(${moduleId})`, "cre2b_Rol@odata.bind": `/cre2b_rols(${roleId})` } as ModuleRoleCreate)));
        throw error;
    }
}
export async function syncUserRoles(userId: string, selectedIds: string[]) {
    const current = await fetchUserRoles(userId);
    const added: string[] = [];
    const removed: string[] = [];
    try {
        for (const roleId of selectedIds.filter((id) => !current.some((relation) => relation._cre2b_rol_value === id))) {
            const relation = requireData(await Cre2b_usuarios_rolesesService.create({ "cre2b_Usuario@odata.bind": `/cre2b_usuarioses(${userId})`, "cre2b_Rol@odata.bind": `/cre2b_rols(${roleId})` } as UserRoleCreate));
            added.push(relation.cre2b_usuarios_rolesid);
        }
        for (const relation of current.filter((item) => !selectedIds.includes(item._cre2b_rol_value ?? ""))) {
            await Cre2b_usuarios_rolesesService.delete(relation.cre2b_usuarios_rolesid);
            if (relation._cre2b_rol_value) removed.push(relation._cre2b_rol_value);
        }
    } catch (error) {
        await Promise.allSettled(added.map((id) => Cre2b_usuarios_rolesesService.delete(id)));
        await Promise.allSettled(removed.map((roleId) => Cre2b_usuarios_rolesesService.create({ "cre2b_Usuario@odata.bind": `/cre2b_usuarioses(${userId})`, "cre2b_Rol@odata.bind": `/cre2b_rols(${roleId})` } as UserRoleCreate)));
        throw error;
    }
}
