<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Toaster } from "$lib/components/ui/sonner/index.js";
    import { toast as sonnerToast } from "svelte-sonner";
    import {
        ArrowLeft,
        LoaderCircle,
        Plus,
        RefreshCw,
        Search,
    } from "@lucide/svelte";
    import { onMount } from "svelte";
    import { ModeWatcher } from "mode-watcher";
    import type {
        Application,
        Module,
        Role,
        User,
        ModuleRole,
        UserRole,
    } from "$lib/data";
    import {
        createEmptyForm,
        mapRecords,
        sectionMeta as meta,
        type DataSection,
        type FormState,
        type Section,
        type ViewRecord,
    } from "$lib/content/domain";
    import HomeDashboard from "$lib/content/HomeDashboard.svelte";
    import SectionTabs from "$lib/content/SectionTabs.svelte";
    import AppHeader from "$lib/content/AppHeader.svelte";
    import RecordsList from "$lib/content/RecordsList.svelte";
    import EntityFields from "$lib/content/EntityFields.svelte";
    import RelationPicker from "$lib/content/RelationPicker.svelte";
    import {
        deleteEntity,
        fetchEntityCounts,
        fetchMissingModules,
        fetchMissingRoles,
        fetchModuleRoles,
        fetchPage,
        fetchUserRoles,
        initialPageRequests,
        saveEntity,
        syncModuleRoles as persistModuleRoles,
        syncUserRoles as persistUserRoles,
    } from "$lib/data";
    import { LatestSearch } from "$lib/content/latest-search";

    let section = $state<Section>("inicio");
    let query = $state("");
    let relationQuery = $state("");
    let modalOpen = $state(false);
    let editingId = $state<string | null>(null);
    let loading = $state(true);
    let saving = $state(false);
    let loadError = $state("");
    let loadWarning = $state("");
    let applications = $state.raw<Application[]>([]);
    let modules = $state.raw<Module[]>([]);
    let roles = $state.raw<Role[]>([]);
    let users = $state.raw<User[]>([]);
    let moduleRoles: ModuleRole[] = [];
    let userRoles: UserRole[] = [];
    let nextTokens = $state<Record<DataSection, string | undefined>>({
        aplicaciones: undefined,
        modulos: undefined,
        roles: undefined,
        usuarios: undefined,
    });
    let loadingMore = $state(false);
    let searching = $state(false);
    let counts = $state.raw<Record<DataSection, number>>({
        aplicaciones: 0,
        modulos: 0,
        roles: 0,
        usuarios: 0,
    });
    const sectionSearch = new LatestSearch();
    const relationSearch = new LatestSearch();
    function emptyForm(): FormState {
        return createEmptyForm(applications[0]?.id);
    }
    let form = $state<FormState>(emptyForm());

    function replaceRecords(kind: DataSection, data: unknown[]) {
        if (kind === "aplicaciones") applications = data as Application[];
        if (kind === "modulos") modules = data as Module[];
        if (kind === "roles") roles = data as Role[];
        if (kind === "usuarios") users = data as User[];
    }
    function appendRecords(kind: DataSection, data: unknown[]) {
        if (kind === "aplicaciones")
            applications = [...applications, ...(data as Application[])];
        if (kind === "modulos") modules = [...modules, ...(data as Module[])];
        if (kind === "roles") roles = [...roles, ...(data as Role[])];
        if (kind === "usuarios") users = [...users, ...(data as User[])];
    }
    async function loadData() {
        sectionSearch.cancel();
        relationSearch.cancel();
        loading = true;
        loadError = "";
        loadWarning = "";
        const requests = initialPageRequests();
        const results = await Promise.allSettled(requests);
        const names = ["aplicaciones", "módulos", "roles", "usuarios"];
        const errors: string[] = [];
        const data = results.map((result, index) => {
            if (result.status === "rejected") {
                errors.push(
                    `${names[index]}: ${result.reason instanceof Error ? result.reason.message : "error de consulta"}`,
                );
                return null;
            }
            if (!result.value.success) {
                const error = result.value.error;
                errors.push(
                    `${names[index]}: ${error instanceof Error ? error.message : "acceso denegado o consulta inválida"}`,
                );
                return null;
            }
            return result.value.data;
        });
        if (data[0]) applications = data[0] as Application[];
        if (data[1]) modules = data[1] as Module[];
        if (data[2]) roles = data[2] as Role[];
        if (data[3]) users = data[3] as User[];
        const keys: Array<keyof typeof nextTokens> = [
            "aplicaciones",
            "modulos",
            "roles",
            "usuarios",
        ];
        results.forEach((result, index) => {
            if (result.status === "fulfilled" && result.value.success)
                nextTokens[keys[index]] = result.value.skipToken;
        });
        const failedTables = errors.length;
        try {
            counts = await fetchEntityCounts();
        } catch (error) {
            errors.push(
                `conteos: ${error instanceof Error ? error.message : "no disponibles"}`,
            );
        }
        if (failedTables === requests.length) {
            loadError = `No se obtuvo acceso a Dataverse. Abre la aplicación desde el enlace “Local Play” de Power Apps, no directamente desde localhost. ${errors[0]}`;
        } else if (errors.length) {
            loadWarning = `Algunas tablas no pudieron cargarse: ${errors.join(" · ")}`;
        }
        loading = false;
    }
    async function loadMore(kind: DataSection) {
        const skipToken = nextTokens[kind];
        if (!skipToken || loadingMore) return;
        loadingMore = true;
        try {
            const relationKind =
                section === "roles"
                    ? "modulos"
                    : section === "usuarios"
                      ? "roles"
                      : undefined;
            const searchTerm =
                relationKind === kind && modalOpen
                    ? relationQuery
                    : section === kind
                      ? query
                      : "";
            const page = await fetchPage(kind, searchTerm, skipToken);
            appendRecords(kind, page.data);
            nextTokens[kind] = page.skipToken;
        } catch (error) {
            sonnerToast.error(
                error instanceof Error
                    ? error.message
                    : "No se pudo cargar la siguiente página.",
            );
        } finally {
            loadingMore = false;
        }
    }
    async function searchSection(
        kind: DataSection,
        value: string,
        requestId: number,
        controller: LatestSearch,
    ) {
        searching = true;
        try {
            const page = await fetchPage(kind, value);
            if (!controller.isCurrent(requestId)) return;
            replaceRecords(kind, page.data);
            nextTokens[kind] = page.skipToken;
        } catch (error) {
            sonnerToast.error(
                error instanceof Error
                    ? error.message
                    : "Dataverse no pudo completar la búsqueda.",
            );
        } finally {
            if (controller.isCurrent(requestId)) searching = false;
        }
    }
    function scheduleSearch(kind: DataSection, value: string) {
        sectionSearch.schedule(
            (requestId) =>
                void searchSection(kind, value, requestId, sectionSearch),
        );
    }
    function scheduleRelationSearch(value: string) {
        const kind: DataSection = section === "roles" ? "modulos" : "roles";
        relationSearch.schedule(
            (requestId) =>
                void searchSection(kind, value, requestId, relationSearch),
        );
    }
    function viewRecords() {
        return mapRecords(section, applications, modules, roles, users);
    }
    function goTo(next: Section) {
        section = next;
        query = "";
        if (next !== "inicio") {
            const requestId = sectionSearch.start();
            void searchSection(next, "", requestId, sectionSearch);
        }
    }
    function newRecord() {
        editingId = null;
        relationQuery = "";
        form = emptyForm();
        modalOpen = true;
        if (section === "roles" || section === "usuarios") {
            const kind: DataSection = section === "roles" ? "modulos" : "roles";
            const requestId = relationSearch.start();
            void searchSection(kind, "", requestId, relationSearch);
        }
    }
    async function editRecord(record: ViewRecord) {
        editingId = record.id;
        relationQuery = "";
        form = { ...emptyForm(), name: record.name };
        form.originalVersion = record.raw.version;
        switch (section) {
            case "aplicaciones": {
                const application = record.raw as Application;
                form.link = application.link ?? "";
                break;
            }
            case "modulos": {
                const module = record.raw as Module;
                form.priority =
                    module.priority == null ? "" : String(module.priority);
                form.appId = module.applicationId ?? applications[0]?.id ?? "";
                break;
            }
            case "roles": {
                const role = record.raw as Role;
                form.alias = role.alias ?? "";
                moduleRoles = await fetchModuleRoles(record.id);
                form.relatedIds = moduleRoles
                    .map((relation) => relation.moduleId)
                    .filter((id): id is string => Boolean(id));
                modules = [
                    ...modules,
                    ...(await fetchMissingModules(form.relatedIds, modules)),
                ];
                break;
            }
            case "usuarios": {
                const user = record.raw as User;
                form.email = user.email ?? "";
                form.department = user.department ?? "";
                form.position = user.position ?? "";
                userRoles = await fetchUserRoles(record.id);
                form.relatedIds = userRoles
                    .map((relation) => relation.roleId)
                    .filter((id): id is string => Boolean(id));
                roles = [
                    ...roles,
                    ...(await fetchMissingRoles(form.relatedIds, roles)),
                ];
                break;
            }
            case "inicio":
                return;
        }
        modalOpen = true;
    }
    async function openEditor(record: ViewRecord) {
        try {
            await editRecord(record);
        } catch (error) {
            sonnerToast.error(
                error instanceof Error
                    ? error.message
                    : "No fue posible cargar las relaciones del registro.",
            );
        }
    }
    async function saveRecord(event: SubmitEvent) {
        event.preventDefault();
        saving = true;
        const wasEditing = editingId !== null;
        let createdId: string | undefined;
        try {
            if (section === "inicio")
                throw new Error(
                    "No se puede guardar un registro desde la vista de inicio.",
                );
            const id = await saveEntity(section, editingId, form);
            if (!wasEditing && (section === "roles" || section === "usuarios"))
                createdId = id;
            if (section === "roles")
                await persistModuleRoles(id, form.relatedIds);
            if (section === "usuarios")
                await persistUserRoles(id, form.relatedIds);
            modalOpen = false;
            sonnerToast.success(
                `${editingId ? "Cambios guardados" : "Registro creado"} correctamente`,
            );
            await loadData();
        } catch (error) {
            if (createdId && section !== "inicio") {
                try {
                    await deleteEntity(section, createdId);
                } catch {
                    sonnerToast.error(
                        "No se pudo revertir completamente el registro creado. Actualiza la vista y revisa Dataverse.",
                    );
                }
            }
            sonnerToast.error(
                error instanceof Error
                    ? error.message
                    : "No fue posible guardar en Dataverse.",
            );
        } finally {
            saving = false;
        }
    }
    onMount(() => {
        void loadData();
        return () => {
            sectionSearch.cancel();
            relationSearch.cancel();
        };
    });
</script>

<ModeWatcher defaultMode="system" />

<svelte:head
    ><title>Roles application</title><meta
        name="description"
        content="Administración de aplicaciones, módulos, roles y usuarios"
    /></svelte:head
>
<div class="min-h-screen bg-muted/40 text-foreground">
    <AppHeader onHome={() => goTo("inicio")} />
    <main class="mx-auto max-w-375 px-5 py-8 lg:px-8 lg:py-10">
        {#if section === "inicio"}
            <HomeDashboard {counts} {loading} onNavigate={goTo} />
        {:else}
            {@const currentMeta = meta[section]}
            <div
                class="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
            >
                <div>
                    <Button
                        variant="ghost"
                        class="mb-4 -ml-2"
                        onclick={() => goTo("inicio")}
                        ><ArrowLeft /> Volver</Button
                    >
                    <h1 class="text-3xl font-bold">{currentMeta.title}</h1>
                    <p class="mt-2 text-sm text-muted-foreground">
                        {currentMeta.subtitle}
                    </p>
                </div>
                <Button onclick={newRecord} size="lg" disabled={loading}
                    ><Plus /> Crear {currentMeta.singular}</Button
                >
            </div>
            <SectionTabs value={section as DataSection} onChange={goTo} />
            <section
                class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
                <div
                    class="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div class="relative w-full sm:max-w-sm">
                        <Search
                            class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        /><Input
                            bind:value={query}
                            oninput={(event) =>
                                scheduleSearch(
                                    section as DataSection,
                                    event.currentTarget.value,
                                )}
                            placeholder={section === "usuarios"
                                ? "Buscar por nombre, correo, departamento o posición..."
                                : `Buscar ${currentMeta.title.toLowerCase()}...`}
                            class="pl-9"
                        />
                        {#if searching}<LoaderCircle
                                class="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                            />{/if}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onclick={loadData}
                        disabled={loading}
                        ><RefreshCw class={loading ? "animate-spin" : ""} /> Actualizar</Button
                    >
                </div>
                <RecordsList
                    records={viewRecords()}
                    {loading}
                    error={loadError}
                    warning={loadWarning}
                    hasMore={Boolean(nextTokens[section as DataSection])}
                    {loadingMore}
                    onRetry={loadData}
                    onEdit={openEditor}
                    onLoadMore={() => loadMore(section as DataSection)}
                />
            </section>
        {/if}
    </main>
</div>

{#if section !== "inicio"}
    <Dialog.Root bind:open={modalOpen}>
        <Dialog.Content class="max-h-[92vh] overflow-y-auto sm:max-w-xl">
            <Dialog.Header>
                <Dialog.Title
                    >{editingId ? "Editar" : "Crear"}
                    {meta[section].singular}</Dialog.Title
                >
                <Dialog.Description
                    >Campos personalizados del esquema Dataverse.</Dialog.Description
                >
            </Dialog.Header>
            <form onsubmit={saveRecord} class="space-y-5">
                <EntityFields
                    section={section as DataSection}
                    bind:form
                    {applications}
                />
                {#if section === "roles" || section === "usuarios"}{@const options =
                        section === "roles"
                            ? modules.map((x) => ({
                                  id: x.id,
                                  name: x.name,
                              }))
                            : roles.map((x) => ({
                                  id: x.id,
                                  name: x.name,
                              }))}
                    <RelationPicker
                        title={section === "roles"
                            ? "Módulos relacionados"
                            : "Roles asignados"}
                        placeholder={section === "roles"
                            ? "Buscar módulos..."
                            : "Buscar roles..."}
                        {options}
                        bind:selectedIds={form.relatedIds}
                        bind:query={relationQuery}
                        {searching}
                        hasMore={Boolean(
                            nextTokens[
                                section === "roles" ? "modulos" : "roles"
                            ],
                        )}
                        {loadingMore}
                        onSearch={scheduleRelationSearch}
                        onLoadMore={() =>
                            loadMore(section === "roles" ? "modulos" : "roles")}
                    />{/if}
                <Dialog.Footer>
                    <Button
                        variant="outline"
                        onclick={() => (modalOpen = false)}
                        disabled={saving}>Cancelar</Button
                    ><Button type="submit" disabled={saving}
                        >{#if saving}<LoaderCircle
                                class="animate-spin"
                            />{/if}{editingId
                            ? "Guardar cambios"
                            : "Crear registro"}</Button
                    >
                </Dialog.Footer>
            </form>
        </Dialog.Content>
    </Dialog.Root>
{/if}
<Toaster position="top-center" richColors />
