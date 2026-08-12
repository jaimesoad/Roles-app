<script lang="ts">
    import { Badge } from "$lib/components/ui/badge/index.js";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";
    import { sectionMeta, type DataSection } from "./domain";

    let {
        counts,
        loading,
        onNavigate,
    }: {
        counts: Record<DataSection, number>;
        loading: boolean;
        onNavigate: (section: DataSection) => void;
    } = $props();
</script>

<section class="mb-10 max-w-3xl">
    <Badge variant="secondary" class="mb-4">Panel de administración</Badge>
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Gestión de roles general
    </h1>
    <p class="mt-3 text-muted-foreground">
        Configura aplicaciones y controla quién puede acceder a cada
        funcionalidad desde un solo lugar.
    </p>
</section>

<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {#each Object.entries(sectionMeta) as [key, item]}
        <button
            onclick={() => onNavigate(key as DataSection)}
            class="group flex min-h-56 flex-col rounded-2xl border border-border bg-card p-6 text-left text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40"
        >
            <span
                class="mb-8 grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                ><item.icon class="size-5" /></span
            >
            <span class="text-lg font-bold">{item.title}</span>
            <span class="mt-2 flex-1 text-sm leading-6 text-muted-foreground"
                >{item.subtitle}</span
            >
            <span
                class="mt-5 flex items-center gap-1 text-sm font-semibold text-primary"
                >Gestionar <ChevronRight class="size-4" /></span
            >
        </button>
    {/each}
</section>

<section class="mt-8 rounded-2xl border border-border bg-card p-6">
    <h2 class="font-bold">Registros en Dataverse</h2>
    <div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {#each Object.entries(counts) as [key, count]}
            <div class="rounded-xl bg-muted p-4">
                <p class="text-2xl font-bold">{loading ? "—" : count}</p>
                <p class="text-xs text-muted-foreground">
                    {sectionMeta[key as DataSection].title}
                </p>
            </div>
        {/each}
    </div>
</section>
