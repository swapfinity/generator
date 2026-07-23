<script>
	import PackageDrawer from '$lib/input/package/components/PackageDrawer.svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<div class="header-container bottom-divider">
	<div class="left-header-container">
		<div class="highlight logo">Swapfinity Label Generator</div>
		<nav>
			<ul>
				<li>
					<a
						href={resolve('/')}
						aria-current={page.url.pathname === resolve('/') ? 'page' : undefined}
						class="nav-element"
					>
						Generator
					</a>
				</li>
				<li>
					<a
						href={resolve('/templates')}
						aria-current={page.url.pathname === `${resolve('/templates')}/`
							? 'page'
							: undefined}
						class="nav-element"
					>
						Templates
					</a>
				</li>
			</ul>
		</nav>
	</div>
	<PackageDrawer />
</div>

<style lang="scss">
	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.left-header-container {
		display: flex;
		align-items: center;
		gap: calc(3 * var(--pico-spacing));
	}

	.logo {
		font-size: 2rem;
		font-weight: bold;
		padding: 0.25rem 0;
	}

	.nav-element[aria-current] {
		text-decoration: underline;
		color: var(--pico-primary);
	}
</style>
