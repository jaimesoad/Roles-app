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
