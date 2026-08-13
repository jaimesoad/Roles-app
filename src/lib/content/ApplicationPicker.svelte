<script lang="ts">
    import { onMount } from "svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import { toast } from "svelte-sonner";
    import { fetchApplication, fetchPage, type Application } from "$lib/data";
    import { LatestSearch } from "$lib/content/latest-search";
    let { value = $bindable(), initial }: { value: string; initial: Application[] } = $props();
    let options = $state.raw<Application[]>([]);
    let query = $state("");
    let skipToken = $state<string>();
    let searching = $state(false);
    let loadingMore = $state(false);
    const search = new LatestSearch();

    function merge(records: Application[], replace = false) {
        const selected = options.find((item) => item.id === value);
        const source = replace ? records : [...options, ...records];
        if (selected) source.unshift(selected);
        options = [...new Map(source.map((item) => [item.id, item])).values()];
    }
    async function run(valueToSearch: string, requestId: number) {
        searching = true;
        try {
            const page = await fetchPage("aplicaciones", valueToSearch);
            if (!search.isCurrent(requestId)) return;
            merge(page.data as Application[], true);
            skipToken = page.skipToken;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudieron buscar las aplicaciones.");
        } finally {
            if (search.isCurrent(requestId)) searching = false;
        }
    }
    function schedule(valueToSearch: string) {
        search.schedule((requestId) => void run(valueToSearch, requestId));
    }
    async function loadMore() {
        if (!skipToken || loadingMore) return;
        loadingMore = true;
        try {
            const page = await fetchPage("aplicaciones", query, skipToken);
            merge(page.data as Application[]);
            skipToken = page.skipToken;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudieron cargar más aplicaciones.");
        } finally { loadingMore = false; }
    }
    onMount(() => {
        merge(initial);
        if (value && !initial.some((item) => item.id === value))
            void fetchApplication(value).then((item) => merge([item])).catch((error) => toast.error(error instanceof Error ? error.message : "No se pudo cargar la aplicación seleccionada."));
        return () => search.cancel();
    });
</script>

<div class="space-y-2">
    <span class="block text-sm font-medium">Aplicación</span>
    <div class="relative">
        <Input bind:value={query} oninput={(event) => schedule(event.currentTarget.value)} placeholder="Buscar aplicación..." />
        {#if searching}<LoaderCircle class="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />{/if}
    </div>
    <Select.Root type="single" bind:value>
        <Select.Trigger>{options.find((item) => item.id === value)?.name ?? "Seleccionar aplicación"}</Select.Trigger>
        <Select.Content>{#each options as application (application.id)}<Select.Item value={application.id} label={application.name ?? "Sin nombre"}>{application.name ?? "Sin nombre"}</Select.Item>{/each}</Select.Content>
    </Select.Root>
    {#if skipToken}<Button type="button" variant="ghost" size="sm" class="w-full" onclick={loadMore} disabled={loadingMore}>{#if loadingMore}<LoaderCircle class="animate-spin" />{/if}Cargar 20 aplicaciones más</Button>{/if}
</div>
