<script lang="ts">
    import { Badge } from "$lib/components/ui/badge/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import Pencil from "@lucide/svelte/icons/pencil";
    import Search from "@lucide/svelte/icons/search";
    import type { ViewRecord } from "./domain";

    let {
        records,
        loading,
        error,
        warning,
        hasMore,
        loadingMore,
        onRetry,
        onEdit,
        onLoadMore,
    }: {
        records: ViewRecord[];
        loading: boolean;
        error: string;
        warning: string;
        hasMore: boolean;
        loadingMore: boolean;
        onRetry: () => void;
        onEdit: (record: ViewRecord) => void;
        onLoadMore: () => void;
    } = $props();
</script>

{#if loading}
    <div class="grid min-h-80 place-items-center">
        <div class="text-center text-sm text-muted-foreground">
            <LoaderCircle class="mx-auto mb-3 size-6 animate-spin" />Consultando
            Dataverse…
        </div>
    </div>
{:else if error}
    <div class="grid min-h-80 place-items-center p-8 text-center">
        <div>
            <p class="font-semibold">No se pudieron cargar los datos</p>
            <p class="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
            <Button class="mt-4" onclick={onRetry}>Reintentar</Button>
        </div>
    </div>
{:else}
    {#if warning}<div
            class="border-b border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
        >
            {warning}
        </div>{/if}
    <div class="min-h-80 divide-y divide-border">
        {#each records as record (record.id)}
            <article
                class="grid gap-3 p-4 hover:bg-muted/50 sm:grid-cols-[minmax(220px,1.2fr)_minmax(180px,1fr)_110px_42px] sm:items-center sm:px-5"
            >
                <div class="flex min-w-0 items-center gap-3">
                    <span
                        class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-bold text-primary"
                        >{record.name.slice(0, 2).toUpperCase()}</span
                    >
                    <div class="min-w-0">
                        <p class="truncate text-sm font-semibold">
                            {record.name}
                        </p>
                        <p class="truncate text-xs text-muted-foreground">
                            {record.detail}
                        </p>
                    </div>
                </div>
                <p class="truncate text-sm">{record.relation}</p>
                <Badge
                    variant={record.active ? "default" : "secondary"}
                    class="w-fit">{record.active ? "Activo" : "Inactivo"}</Badge
                >
                <Button
                    variant="ghost"
                    size="icon"
                    onclick={() => onEdit(record)}
                    aria-label={`Editar ${record.name}`}><Pencil /></Button
                >
            </article>
        {:else}
            <div class="grid min-h-80 place-items-center text-center">
                <div>
                    <Search class="mx-auto mb-3 size-8 text-muted-foreground" />
                    <p class="font-semibold">No hay registros</p>
                    <p class="text-sm text-muted-foreground">
                        No existen datos que coincidan con la búsqueda.
                    </p>
                </div>
            </div>
        {/each}
    </div>
    {#if hasMore}<div class="border-t border-border p-4 text-center">
            <Button
                variant="outline"
                onclick={onLoadMore}
                disabled={loadingMore}
                >{#if loadingMore}<LoaderCircle
                        class="animate-spin"
                    />{/if}Cargar 20 más</Button
            >
        </div>{/if}
{/if}
