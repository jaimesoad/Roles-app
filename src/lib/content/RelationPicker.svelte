<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import Search from "@lucide/svelte/icons/search";

    type Option = { id: string; name?: string };
    let {
        title,
        placeholder,
        options,
        selectedIds = $bindable(),
        query = $bindable(),
        searching,
        hasMore,
        loadingMore,
        onSearch,
        onLoadMore,
    }: {
        title: string;
        placeholder: string;
        options: Option[];
        selectedIds: string[];
        query: string;
        searching: boolean;
        hasMore: boolean;
        loadingMore: boolean;
        onSearch: (value: string) => void;
        onLoadMore: () => void;
    } = $props();

    function update(id: string, checked: boolean) {
        selectedIds = checked
            ? [...new Set([...selectedIds, id])]
            : selectedIds.filter((value) => value !== id);
    }
</script>

<fieldset>
    <legend class="mb-2 text-sm font-medium">{title}</legend>
    <div class="relative mb-2">
        <Search
            class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        /><Input
            bind:value={query}
            oninput={(event) => onSearch(event.currentTarget.value)}
            {placeholder}
            class="pl-9"
        />{#if searching}<LoaderCircle
                class="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
            />{/if}
    </div>
    <div
        class="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border p-2"
    >
        {#each options as option}<label
                class="flex cursor-pointer items-center gap-3 rounded-lg p-2.5 hover:bg-muted"
                ><Checkbox
                    checked={selectedIds.includes(option.id)}
                    onCheckedChange={(checked) =>
                        update(option.id, checked === true)}
                /><span class="text-sm">{option.name ?? "Sin nombre"}</span
                ></label
            >{:else}<p class="p-3 text-center text-sm text-muted-foreground">
                No hay coincidencias en esta página.
            </p>{/each}
    </div>
    {#if hasMore}<Button
            variant="ghost"
            size="sm"
            class="mt-2 w-full"
            onclick={onLoadMore}
            disabled={loadingMore}
            >{#if loadingMore}<LoaderCircle class="animate-spin" />{/if}Cargar
            20 opciones más</Button
        >{/if}
</fieldset>
