<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import type { FormState } from "../domain";
    let { form = $bindable() }: { form: FormState } = $props();
</script>

<div class="grid gap-4 sm:grid-cols-2">
    <label
        ><span class="mb-2 block text-sm font-medium">Correo electrónico</span
        ><Input bind:value={form.email} type="email" required /></label
    ><label
        ><span class="mb-2 block text-sm font-medium">Departamento</span><Input
            bind:value={form.department}
        /></label
    >
</div>
<label class="block"
    ><span class="mb-2 block text-sm font-medium">Posición</span><Input
        bind:value={form.position}
    /></label
>
