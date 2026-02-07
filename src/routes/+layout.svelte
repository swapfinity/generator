<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import "@picocss/pico/css/pico.indigo.min.css";
	import "@picocss/pico/css/pico.colors.min.css"
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
