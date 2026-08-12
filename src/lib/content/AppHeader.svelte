<script lang="ts">
    import { Badge } from "$lib/components/ui/badge/index.js";
    import CircleCheck from "@lucide/svelte/icons/circle-check";
    import ShieldCheck from "@lucide/svelte/icons/shield-check";
    let { onHome }: { onHome: () => void } = $props();
</script>

<header
    class="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur"
>
    <div
        class="mx-auto flex h-16 max-w-375 items-center justify-between px-5 lg:px-8"
    >
        <button
            class="flex items-center gap-3"
            onclick={onHome}
            aria-label="Ir al inicio"
        >
            <span
                class="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"
                ><ShieldCheck class="size-5" /></span
            >
            <span class="text-left"
                ><span class="block text-sm font-bold">Accessia</span><span
                    class="block text-xs text-muted-foreground"
                    >Gestión de accesos</span
                ></span
            >
        </button>
        <Badge variant="outline"><CircleCheck /> Dataverse</Badge>
    </div>
</header>
