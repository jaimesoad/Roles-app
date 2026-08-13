<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import ApplicationPicker from "../ApplicationPicker.svelte";
    import type { Application } from "$lib/data";
    import type { FormState } from "../domain";
    let {
        form = $bindable(),
        applications,
    }: { form: FormState; applications: Application[] } = $props();
</script>

<div class="grid gap-4 sm:grid-cols-2">
    <label
        ><span class="mb-2 block text-sm font-medium">Prioridad</span><Input
            bind:value={form.priority}
            type="number"
            min={0}
        /></label
    ><ApplicationPicker bind:value={form.appId} initial={applications} />
</div>
