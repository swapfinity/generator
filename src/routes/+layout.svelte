<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '@picocss/pico/css/pico.indigo.min.css';
	import '@picocss/pico/css/pico.colors.min.css';
	import '../global.scss';
	import Header from '$lib/layout/Header.svelte';
	import Footer from '$lib/layout/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="container-fluid app">
	<Header />
	<main>
		{@render children()}
	</main>
	<Footer />
</div>

<style lang="scss">
	.app {
		display: grid;
		height: 100vh;
		grid-template-rows: auto 1fr auto;
	}
</style>
