<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import { crossfade } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { sectionMeta, type DataSection } from "./domain";

    let {
        value,
        onChange,
    }: { value: DataSection; onChange: (value: DataSection) => void } =
        $props();
    const [sendTab, receiveTab] = crossfade({
        duration: 260,
        easing: quintOut,
    });
</script>

<Tabs.Root
    {value}
    onValueChange={(next) => onChange(next as DataSection)}
    class="mb-6"
>
    <Tabs.List>
        {#each Object.entries(sectionMeta) as [key, item] (key)}
            <Tabs.Trigger
                value={key}
                class="relative data-active:bg-transparent data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-transparent"
            >
                {#if value === key}
                    <span
                        class="absolute inset-0 rounded-md bg-background shadow-sm dark:border dark:border-input dark:bg-input/30"
                        in:receiveTab={{ key: "active-tab" }}
                        out:sendTab={{ key: "active-tab" }}
                    ></span>
                {/if}
                <span class="relative z-10 inline-flex items-center gap-1.5"
                    ><item.icon /> {item.title}</span
                >
            </Tabs.Trigger>
        {/each}
    </Tabs.List>
</Tabs.Root>
