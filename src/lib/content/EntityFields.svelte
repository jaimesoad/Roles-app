<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import type { Cre2b_aplicacions } from "../../generated/models/Cre2b_aplicacionsModel";
    import type { FormState, DataSection } from "./domain";
    import ApplicationFields from "./forms/ApplicationFields.svelte";
    import ModuleFields from "./forms/ModuleFields.svelte";
    import RoleFields from "./forms/RoleFields.svelte";
    import UserFields from "./forms/UserFields.svelte";
    let {
        section,
        form = $bindable(),
        applications,
    }: {
        section: DataSection;
        form: FormState;
        applications: Cre2b_aplicacions[];
    } = $props();
</script>

<label class="block"
    ><span class="mb-2 block text-sm font-medium">Nombre</span><Input
        bind:value={form.name}
        required
    /></label
>
{#if section === "aplicaciones"}<ApplicationFields
        bind:form
    />{:else if section === "modulos"}<ModuleFields
        bind:form
        {applications}
    />{:else if section === "roles"}<RoleFields bind:form />{:else}<UserFields
        bind:form
    />{/if}
