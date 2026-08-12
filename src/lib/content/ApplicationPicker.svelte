<script lang="ts">
    import { onMount } from "svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import { toast } from "svelte-sonner";
    import { fetchApplication, fetchPage } from "$lib/accessia/dataverse-repository";
    import { LatestSearch } from "$lib/accessia/latest-search";
    import type { Cre2b_aplicacions } from "../../generated/models/Cre2b_aplicacionsModel";

    let { value = $bindable(), initial }: { value: string; initial: Cre2b_aplicacions[] } = $props();
    let options = $state<Cre2b_aplicacions[]>([]);
    let query = $state("");
    let skipToken = $state<string>();
    let searching = $state(false);
    let loadingMore = $state(false);
    const search = new LatestSearch();

    function merge(records: Cre2b_aplicacions[], replace = false) {
        const selected = options.find((item) => item.cre2b_aplicacionid === value);
        const source = replace ? records : [...options, ...records];
        if (selected) source.unshift(selected);
        options = [...new Map(source.map((item) => [item.cre2b_aplicacionid, item])).values()];
    }
    async function run(valueToSearch: string, requestId: number) {
        searching = true;
        try {
            const page = await fetchPage("aplicaciones", valueToSearch);
            if (!search.isCurrent(requestId)) return;
            merge(page.data as Cre2b_aplicacions[], true);
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
            merge(page.data as Cre2b_aplicacions[]);
            skipToken = page.skipToken;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "No se pudieron cargar más aplicaciones.");
        } finally { loadingMore = false; }
    }
    onMount(() => {
        merge(initial);
        if (value && !initial.some((item) => item.cre2b_aplicacionid === value))
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
        <Select.Trigger>{options.find((item) => item.cre2b_aplicacionid === value)?.cre2b_nombre ?? "Seleccionar aplicación"}</Select.Trigger>
        <Select.Content>{#each options as application}<Select.Item value={application.cre2b_aplicacionid} label={application.cre2b_nombre ?? "Sin nombre"}>{application.cre2b_nombre ?? "Sin nombre"}</Select.Item>{/each}</Select.Content>
    </Select.Root>
    {#if skipToken}<Button type="button" variant="ghost" size="sm" class="w-full" onclick={loadMore} disabled={loadingMore}>{#if loadingMore}<LoaderCircle class="animate-spin" />{/if}Cargar 20 aplicaciones más</Button>{/if}
</div>
