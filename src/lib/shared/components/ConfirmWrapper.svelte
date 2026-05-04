<script lang="ts">
	// props
	interface ConfirmWrapperProps {
		text: string;
		onConfirm: () => void;
		trigger: any;
	}

	let { text, onConfirm, trigger }: ConfirmWrapperProps = $props();

	let open = $state(false);

	const handleConfirm = () => {
		open = false;
		onConfirm();
	};

	const openConfirm = () => {
		open = true;
	};
</script>

<div class="wrapper">
	<button class="trigger" onclick={openConfirm}>
		{@render trigger()}
	</button>

	{#if open}
		<div class="panel">
			<p>{text}</p>
			<button onclick={handleConfirm}>Confirm</button>
			<button onclick={() => (open = false)}>Cancel</button>
		</div>
	{/if}
</div>

<style lang="scss">
	.trigger {
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 10;
		padding: 0;
		cursor: default;
		border-radius: 0;
		border: none;
	}
</style>
