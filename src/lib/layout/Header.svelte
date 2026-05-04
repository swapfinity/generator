<script>
	import PackageDrawer from '$lib/input/package/components/PackageDrawer.svelte';
</script>

<div class="header-container bottom-divider">
	<div class="highlight logo">Swapfinity Label Generator</div>
	<PackageDrawer />
</div>

<style lang="scss">
	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		font-size: 2rem;
		font-weight: bold;
		padding: 0.25rem 0;
	}
</style>
