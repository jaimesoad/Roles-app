<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import type { FormState } from "../domain";
    let { form = $bindable() }: { form: FormState } = $props();
</script>

<label class="block"
    ><span class="mb-2 block text-sm font-medium">Alias</span><Input
        bind:value={form.alias}
    /></label
>
