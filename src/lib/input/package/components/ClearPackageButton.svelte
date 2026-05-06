<script lang="ts">
	import { Trash2 } from 'lucide-svelte';
	import { packageStore } from '../package.svelte';
	import ConfirmButton from '$lib/shared/components/ConfirmButton.svelte';
</script>

<ConfirmButton disabled={packageStore.isEmpty} onConfirm={() => packageStore.clear()}>
	<Trash2 /> Clear All
</ConfirmButton>
