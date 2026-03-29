<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../global.scss';
	import Header from '$lib/layout/Header.svelte';
	import Footer from '$lib/layout/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	<Header />
	<main style="min-height: 0;">
		{@render children()}
	</main>
	<Footer />
</div>

<style lang="scss">
	.app {
		display: grid;
		height: 100dvh;
		padding: calc(var(--pico-spacing) / 2) var(--pico-spacing);
		grid-template-rows: auto 1fr auto;
	}
</style>
