<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";

    let counter = $state(0);
</script>

<p>{counter}</p>

<Button onclick={() => counter++}> Click me</Button>
