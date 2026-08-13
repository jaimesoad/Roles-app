/*
 * ÚNICO PUNTO DE CONEXIÓN CON DATAVERSE
 *
 * Cuando cambies el origen de datos, este es el único archivo que debes tocar.
 * 1. Cambia los imports generados de abajo.
 * 2. Actualiza una sola vez cada columna dentro de SCHEMA.
 * 3. Ejecuta `npm run check`.
 *
 * Los componentes nunca deben importar archivos de `src/generated`.
 */
// CAMBIA SOLAMENTE ESTOS IMPORTS SI LOS ARCHIVOS GENERADOS TIENEN OTRO NOMBRE.
import { Cre2b_aplicacionsService as ApplicationsService } from "../generated/services/Cre2b_aplicacionsService";
import { Cre2b_modulosService as ModulesService } from "../generated/services/Cre2b_modulosService";
import { Cre2b_rolsService as RolesService } from "../generated/services/Cre2b_rolsService";
import { Cre2b_usuariosesService as UsersService } from "../generated/services/Cre2b_usuariosesService";
import { Cre2b_modulos_rolesesService as ModuleRolesService } from "../generated/services/Cre2b_modulos_rolesesService";
import { Cre2b_usuarios_rolesesService as UserRolesService } from "../generated/services/Cre2b_usuarios_rolesesService";
import type { Cre2b_aplicacions as ApplicationRow } from "../generated/models/Cre2b_aplicacionsModel";
import type { Cre2b_modulos as ModuleRow } from "../generated/models/Cre2b_modulosModel";
import type { Cre2b_rols as RoleRow } from "../generated/models/Cre2b_rolsModel";
import type { Cre2b_usuarioses as UserRow } from "../generated/models/Cre2b_usuariosesModel";
import type { Cre2b_modulos_roleses as ModuleRoleRow } from "../generated/models/Cre2b_modulos_rolesesModel";
import type { Cre2b_usuarios_roleses as UserRoleRow } from "../generated/models/Cre2b_usuarios_rolesesModel";
import {
  PAGE_SIZE,
  validateForm,
  type DataSection,
  type FormState,
} from "./content/domain";

// CAMBIA SOLAMENTE LOS VALORES DE ESTE OBJETO CUANDO CAMBIEN LAS COLUMNAS.
const SCHEMA = {
  common: { active: "statecode", version: "versionnumber" },
  applications: {
    id: "cre2b_aplicacionid",
    name: "cre2b_nombre",
    link: "cre2b_link",
    entitySet: "cre2b_aplicacions",
  },
  modules: {
    id: "cre2b_moduloid",
    name: "cre2b_nombre",
    priority: "cre2b_prioridad",
    applicationId: "_cre2b_aplicacion_value",
    applicationName: "cre2b_aplicacionname",
    applicationBind: "cre2b_Aplicacion@odata.bind",
    entitySet: "cre2b_modulos",
  },
  roles: {
    id: "cre2b_rolid",
    name: "cre2b_nombre",
    alias: "cre2b_alias",
    entitySet: "cre2b_rols",
  },
  users: {
    id: "cre2b_usuariosid",
    name: "cre2b_nombre",
    email: "cre2b_email",
    department: "cre2b_departamento",
    position: "cre2b_posicion",
    entitySet: "cre2b_usuarioses",
  },
  moduleRoles: {
    id: "cre2b_modulos_rolesid",
    moduleId: "_cre2b_modulo_value",
    roleId: "_cre2b_rol_value",
    moduleBind: "cre2b_Modulo@odata.bind",
    roleBind: "cre2b_Rol@odata.bind",
  },
  userRoles: {
    id: "cre2b_usuarios_rolesid",
    userId: "_cre2b_usuario_value",
    roleId: "_cre2b_rol_value",
    userBind: "cre2b_Usuario@odata.bind",
    roleBind: "cre2b_Rol@odata.bind",
  },
} as const;

export type BaseEntity = {
  id: string;
  name?: string;
  active: boolean;
  version?: number;
};
export type Application = BaseEntity & { link?: string };
export type Module = BaseEntity & {
  priority?: number;
  applicationId?: string;
  applicationName?: string;
};
export type Role = BaseEntity & { alias?: string };
export type User = BaseEntity & {
  email?: string;
  department?: string;
  position?: string;
};
export type ModuleRole = { id: string; moduleId?: string; roleId?: string };
export type UserRole = { id: string; userId?: string; roleId?: string };
export type EntityRecord = Application | Module | Role | User;

type OperationResult<T> = {
  success: boolean;
  data: T;
  error?: unknown;
  skipToken?: string;
};
type ApplicationCreate = Parameters<typeof ApplicationsService.create>[0];
type ModuleCreate = Parameters<typeof ModulesService.create>[0];
type RoleCreate = Parameters<typeof RolesService.create>[0];
type UserCreate = Parameters<typeof UsersService.create>[0];
type ModuleRoleCreate = Parameters<typeof ModuleRolesService.create>[0];
type UserRoleCreate = Parameters<typeof UserRolesService.create>[0];

function field<T>(record: object, name: string) {
  return (record as Record<string, unknown>)[name] as T | undefined;
}

const mapApplication = (record: ApplicationRow): Application => ({
  id: field<string>(record, SCHEMA.applications.id)!,
  name: field(record, SCHEMA.applications.name),
  link: field(record, SCHEMA.applications.link),
  active: field(record, SCHEMA.common.active) === 0,
  version: field(record, SCHEMA.common.version),
});
const mapModule = (record: ModuleRow): Module => ({
  id: field<string>(record, SCHEMA.modules.id)!,
  name: field(record, SCHEMA.modules.name),
  priority: field(record, SCHEMA.modules.priority),
  applicationId: field(record, SCHEMA.modules.applicationId),
  applicationName: field(record, SCHEMA.modules.applicationName),
  active: field(record, SCHEMA.common.active) === 0,
  version: field(record, SCHEMA.common.version),
});
const mapRole = (record: RoleRow): Role => ({
  id: field<string>(record, SCHEMA.roles.id)!,
  name: field(record, SCHEMA.roles.name),
  alias: field(record, SCHEMA.roles.alias),
  active: field(record, SCHEMA.common.active) === 0,
  version: field(record, SCHEMA.common.version),
});
const mapUser = (record: UserRow): User => ({
  id: field<string>(record, SCHEMA.users.id)!,
  name: field(record, SCHEMA.users.name),
  email: field(record, SCHEMA.users.email),
  department: field(record, SCHEMA.users.department),
  position: field(record, SCHEMA.users.position),
  active: field(record, SCHEMA.common.active) === 0,
  version: field(record, SCHEMA.common.version),
});
const mapModuleRole = (record: ModuleRoleRow): ModuleRole => ({
  id: field<string>(record, SCHEMA.moduleRoles.id)!,
  moduleId: field(record, SCHEMA.moduleRoles.moduleId),
  roleId: field(record, SCHEMA.moduleRoles.roleId),
});
const mapUserRole = (record: UserRoleRow): UserRole => ({
  id: field<string>(record, SCHEMA.userRoles.id)!,
  userId: field(record, SCHEMA.userRoles.userId),
  roleId: field(record, SCHEMA.userRoles.roleId),
});

function buildSearchFilter(kind: DataSection, value: string) {
  const term = value.trim().replaceAll("'", "''");
  if (!term) return undefined;
  const contains = (column: string) => `contains(${column},'${term}')`;
  switch (kind) {
    case "aplicaciones":
      return `${contains(SCHEMA.applications.name)} or ${contains(SCHEMA.applications.link)}`;
    case "modulos":
      return contains(SCHEMA.modules.name);
    case "roles":
      return `${contains(SCHEMA.roles.name)} or ${contains(SCHEMA.roles.alias)}`;
    case "usuarios":
      return [
        SCHEMA.users.name,
        SCHEMA.users.email,
        SCHEMA.users.department,
        SCHEMA.users.position,
      ]
        .map(contains)
        .join(" or ");
  }
}

export function requireData<T>(result: OperationResult<T>): T {
  if (!result.success)
    throw result.error ?? new Error("Dataverse no completó la operación.");
  return result.data;
}

export function initialPageRequests() {
  return [
    ApplicationsService.getAll({
      orderBy: [`${SCHEMA.applications.name} asc`],
      top: PAGE_SIZE,
      maxPageSize: PAGE_SIZE,
    }).then((result) => ({ ...result, data: result.data.map(mapApplication) })),
    ModulesService.getAll({
      orderBy: [`${SCHEMA.modules.priority} asc`, `${SCHEMA.modules.name} asc`],
      top: PAGE_SIZE,
      maxPageSize: PAGE_SIZE,
    }).then((result) => ({ ...result, data: result.data.map(mapModule) })),
    RolesService.getAll({
      orderBy: [`${SCHEMA.roles.name} asc`],
      top: PAGE_SIZE,
      maxPageSize: PAGE_SIZE,
    }).then((result) => ({ ...result, data: result.data.map(mapRole) })),
    UsersService.getAll({
      orderBy: [`${SCHEMA.users.name} asc`],
      top: PAGE_SIZE,
      maxPageSize: PAGE_SIZE,
    }).then((result) => ({ ...result, data: result.data.map(mapUser) })),
  ] as const;
}

async function countPages<T>(
  request: (skipToken?: string) => Promise<OperationResult<T[]>>,
) {
  let count = 0;
  let skipToken: string | undefined;
  do {
    const result = await request(skipToken);
    count += requireData(result).length;
    skipToken = result.skipToken;
  } while (skipToken);
  return count;
}

export async function fetchEntityCounts(): Promise<
  Record<DataSection, number>
> {
  const [aplicaciones, modulos, roles, usuarios] = await Promise.all([
    countPages((skipToken) =>
      ApplicationsService.getAll({
        select: [SCHEMA.applications.id],
        top: PAGE_SIZE,
        maxPageSize: PAGE_SIZE,
        skipToken,
      }),
    ),
    countPages((skipToken) =>
      ModulesService.getAll({
        select: [SCHEMA.modules.id],
        top: PAGE_SIZE,
        maxPageSize: PAGE_SIZE,
        skipToken,
      }),
    ),
    countPages((skipToken) =>
      RolesService.getAll({
        select: [SCHEMA.roles.id],
        top: PAGE_SIZE,
        maxPageSize: PAGE_SIZE,
        skipToken,
      }),
    ),
    countPages((skipToken) =>
      UsersService.getAll({
        select: [SCHEMA.users.id],
        top: PAGE_SIZE,
        maxPageSize: PAGE_SIZE,
        skipToken,
      }),
    ),
  ]);
  return { aplicaciones, modulos, roles, usuarios };
}

export async function fetchPage(
  kind: DataSection,
  search = "",
  skipToken?: string,
): Promise<{ data: EntityRecord[]; skipToken?: string }> {
  const common = {
    top: PAGE_SIZE,
    maxPageSize: PAGE_SIZE,
    skipToken,
    filter: buildSearchFilter(kind, search),
  };
  switch (kind) {
    case "aplicaciones": {
      const result = await ApplicationsService.getAll({
        ...common,
        orderBy: [`${SCHEMA.applications.name} asc`],
      });
      return {
        data: requireData(result).map(mapApplication),
        skipToken: result.skipToken,
      };
    }
    case "modulos": {
      const result = await ModulesService.getAll({
        ...common,
        orderBy: [
          `${SCHEMA.modules.priority} asc`,
          `${SCHEMA.modules.name} asc`,
        ],
      });
      return {
        data: requireData(result).map(mapModule),
        skipToken: result.skipToken,
      };
    }
    case "roles": {
      const result = await RolesService.getAll({
        ...common,
        orderBy: [`${SCHEMA.roles.name} asc`],
      });
      return {
        data: requireData(result).map(mapRole),
        skipToken: result.skipToken,
      };
    }
    case "usuarios": {
      const result = await UsersService.getAll({
        ...common,
        orderBy: [`${SCHEMA.users.name} asc`],
      });
      return {
        data: requireData(result).map(mapUser),
        skipToken: result.skipToken,
      };
    }
  }
}

async function fetchAllRelations<T>(
  request: (skipToken?: string) => Promise<OperationResult<T[]>>,
) {
  const records: T[] = [];
  let skipToken: string | undefined;
  do {
    const result = await request(skipToken);
    records.push(...requireData(result));
    skipToken = result.skipToken;
  } while (skipToken);
  return records;
}

export const fetchModuleRoles = (roleId: string) =>
  fetchAllRelations<ModuleRoleRow>((skipToken) =>
    ModuleRolesService.getAll({
      filter: `${SCHEMA.moduleRoles.roleId} eq ${roleId}`,
      top: PAGE_SIZE,
      maxPageSize: PAGE_SIZE,
      skipToken,
    }),
  ).then((records) => records.map(mapModuleRole));
export const fetchUserRoles = (userId: string) =>
  fetchAllRelations<UserRoleRow>((skipToken) =>
    UserRolesService.getAll({
      filter: `${SCHEMA.userRoles.userId} eq ${userId}`,
      top: PAGE_SIZE,
      maxPageSize: PAGE_SIZE,
      skipToken,
    }),
  ).then((records) => records.map(mapUserRole));

export async function fetchMissingModules(ids: string[], loaded: Module[]) {
  const missing = ids.filter(
    (id) => !loaded.some((record) => record.id === id),
  );
  return Promise.all(
    missing.map(async (id) =>
      mapModule(requireData(await ModulesService.get(id))),
    ),
  );
}
export async function fetchMissingRoles(ids: string[], loaded: Role[]) {
  const missing = ids.filter(
    (id) => !loaded.some((record) => record.id === id),
  );
  return Promise.all(
    missing.map(async (id) => mapRole(requireData(await RolesService.get(id)))),
  );
}

export async function saveEntity(
  section: DataSection,
  editingId: string | null,
  form: FormState,
) {
  validateForm(section, form);
  if (editingId)
    await assertCurrentVersion(section, editingId, form.originalVersion);
  await assertUniqueFields(section, editingId, form);
  switch (section) {
    case "aplicaciones": {
      const payload = {
        [SCHEMA.applications.name]: form.name,
        [SCHEMA.applications.link]: form.link,
      } as ApplicationCreate;
      return field<string>(
        requireData(
          editingId
            ? await ApplicationsService.update(editingId, payload)
            : await ApplicationsService.create(payload),
        ),
        SCHEMA.applications.id,
      )!;
    }
    case "modulos": {
      const payload = {
        [SCHEMA.modules.name]: form.name,
        [SCHEMA.modules.priority]:
          form.priority === "" ? undefined : Number(form.priority),
        [SCHEMA.modules.applicationBind]: form.appId
          ? `/${SCHEMA.applications.entitySet}(${form.appId})`
          : undefined,
      } as ModuleCreate;
      return field<string>(
        requireData(
          editingId
            ? await ModulesService.update(editingId, payload)
            : await ModulesService.create(payload),
        ),
        SCHEMA.modules.id,
      )!;
    }
    case "roles": {
      const payload = {
        [SCHEMA.roles.name]: form.name,
        [SCHEMA.roles.alias]: form.alias,
      } as RoleCreate;
      return field<string>(
        requireData(
          editingId
            ? await RolesService.update(editingId, payload)
            : await RolesService.create(payload),
        ),
        SCHEMA.roles.id,
      )!;
    }
    case "usuarios": {
      const payload = {
        [SCHEMA.users.name]: form.name,
        [SCHEMA.users.email]: form.email,
        [SCHEMA.users.department]: form.department,
        [SCHEMA.users.position]: form.position,
      } as UserCreate;
      return field<string>(
        requireData(
          editingId
            ? await UsersService.update(editingId, payload)
            : await UsersService.create(payload),
        ),
        SCHEMA.users.id,
      )!;
    }
  }
}

export async function deleteEntity(section: DataSection, id: string) {
  switch (section) {
    case "aplicaciones":
      return ApplicationsService.delete(id);
    case "modulos":
      return ModulesService.delete(id);
    case "roles":
      return RolesService.delete(id);
    case "usuarios":
      return UsersService.delete(id);
  }
}

async function assertCurrentVersion(
  section: DataSection,
  id: string,
  expected?: number,
) {
  if (expected == null) return;
  let version: number | undefined;
  switch (section) {
    case "aplicaciones":
      version = field(
        requireData(
          await ApplicationsService.get(id, {
            select: [SCHEMA.common.version],
          }),
        ),
        SCHEMA.common.version,
      );
      break;
    case "modulos":
      version = field(
        requireData(
          await ModulesService.get(id, { select: [SCHEMA.common.version] }),
        ),
        SCHEMA.common.version,
      );
      break;
    case "roles":
      version = field(
        requireData(
          await RolesService.get(id, { select: [SCHEMA.common.version] }),
        ),
        SCHEMA.common.version,
      );
      break;
    case "usuarios":
      version = field(
        requireData(
          await UsersService.get(id, { select: [SCHEMA.common.version] }),
        ),
        SCHEMA.common.version,
      );
      break;
  }
  if (String(version) !== String(expected))
    throw new Error(
      "Este registro fue modificado por otra persona. Actualiza los datos antes de volver a guardar.",
    );
}

async function assertUniqueFields(
  section: DataSection,
  editingId: string | null,
  form: FormState,
) {
  if (section === "usuarios" && !form.email) return;
  const escape = (value: string) => value.replaceAll("'", "''");
  const definitions = {
    aplicaciones: [
      SCHEMA.applications.id,
      `${SCHEMA.applications.name} eq '${escape(form.name)}'`,
    ],
    modulos: [
      SCHEMA.modules.id,
      `${SCHEMA.modules.name} eq '${escape(form.name)}'`,
    ],
    roles: [
      SCHEMA.roles.id,
      `${SCHEMA.roles.name} eq '${escape(form.name)}' or ${SCHEMA.roles.alias} eq '${escape(form.alias)}'`,
    ],
    usuarios: [
      SCHEMA.users.id,
      `${SCHEMA.users.email} eq '${escape(form.email)}'`,
    ],
  } as const;
  const [idField, baseFilter] = definitions[section];
  const filter = editingId
    ? `(${baseFilter}) and ${idField} ne ${editingId}`
    : baseFilter;
  let exists = false;
  switch (section) {
    case "aplicaciones":
      exists =
        requireData(
          await ApplicationsService.getAll({
            filter,
            select: [idField],
            top: 1,
            maxPageSize: 1,
          }),
        ).length > 0;
      break;
    case "modulos":
      exists =
        requireData(
          await ModulesService.getAll({
            filter,
            select: [idField],
            top: 1,
            maxPageSize: 1,
          }),
        ).length > 0;
      break;
    case "roles":
      exists =
        requireData(
          await RolesService.getAll({
            filter,
            select: [idField],
            top: 1,
            maxPageSize: 1,
          }),
        ).length > 0;
      break;
    case "usuarios":
      exists =
        requireData(
          await UsersService.getAll({
            filter,
            select: [idField],
            top: 1,
            maxPageSize: 1,
          }),
        ).length > 0;
      break;
  }
  if (exists)
    throw new Error(
      section === "usuarios"
        ? "Ya existe un usuario con este correo."
        : "Ya existe un registro con el mismo nombre o identificador.",
    );
}

export async function fetchApplication(id: string) {
  return mapApplication(requireData(await ApplicationsService.get(id)));
}

export async function syncModuleRoles(roleId: string, selectedIds: string[]) {
  const current = await fetchModuleRoles(roleId);
  const added: string[] = [];
  const removed: string[] = [];
  try {
    for (const moduleId of selectedIds.filter(
      (id) => !current.some((relation) => relation.moduleId === id),
    )) {
      const relation = requireData(
        await ModuleRolesService.create({
          [SCHEMA.moduleRoles.moduleBind]:
            `/${SCHEMA.modules.entitySet}(${moduleId})`,
          [SCHEMA.moduleRoles.roleBind]:
            `/${SCHEMA.roles.entitySet}(${roleId})`,
        } as ModuleRoleCreate),
      );
      added.push(field<string>(relation, SCHEMA.moduleRoles.id)!);
    }
    for (const relation of current.filter(
      (item) => !selectedIds.includes(item.moduleId ?? ""),
    )) {
      await ModuleRolesService.delete(relation.id);
      if (relation.moduleId) removed.push(relation.moduleId);
    }
  } catch (error) {
    await Promise.allSettled(added.map((id) => ModuleRolesService.delete(id)));
    await Promise.allSettled(
      removed.map((moduleId) =>
        ModuleRolesService.create({
          [SCHEMA.moduleRoles.moduleBind]:
            `/${SCHEMA.modules.entitySet}(${moduleId})`,
          [SCHEMA.moduleRoles.roleBind]:
            `/${SCHEMA.roles.entitySet}(${roleId})`,
        } as ModuleRoleCreate),
      ),
    );
    throw error;
  }
}
export async function syncUserRoles(userId: string, selectedIds: string[]) {
  const current = await fetchUserRoles(userId);
  const added: string[] = [];
  const removed: string[] = [];
  try {
    for (const roleId of selectedIds.filter(
      (id) => !current.some((relation) => relation.roleId === id),
    )) {
      const relation = requireData(
        await UserRolesService.create({
          [SCHEMA.userRoles.userBind]: `/${SCHEMA.users.entitySet}(${userId})`,
          [SCHEMA.userRoles.roleBind]: `/${SCHEMA.roles.entitySet}(${roleId})`,
        } as UserRoleCreate),
      );
      added.push(field<string>(relation, SCHEMA.userRoles.id)!);
    }
    for (const relation of current.filter(
      (item) => !selectedIds.includes(item.roleId ?? ""),
    )) {
      await UserRolesService.delete(relation.id);
      if (relation.roleId) removed.push(relation.roleId);
    }
  } catch (error) {
    await Promise.allSettled(added.map((id) => UserRolesService.delete(id)));
    await Promise.allSettled(
      removed.map((roleId) =>
        UserRolesService.create({
          [SCHEMA.userRoles.userBind]: `/${SCHEMA.users.entitySet}(${userId})`,
          [SCHEMA.userRoles.roleBind]: `/${SCHEMA.roles.entitySet}(${roleId})`,
        } as UserRoleCreate),
      ),
    );
    throw error;
  }
}
