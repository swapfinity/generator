<script lang="ts">
	import * as jscad from '@jscad/modeling';
	const { measurements, booleans } = jscad;

	import type { Geom3 } from '@jscad/modeling/src/geometries/types';
	import { onDestroy, onMount } from 'svelte';
	import { Focus } from 'lucide-svelte';

	// consts
	const RESIZE_TIMEOUT_MS = 50;
	const DEFAULT_CAMERA_POSITION = [5, -20, 30];
	const CAMERA_STATE_OVERRIDE = { position: DEFAULT_CAMERA_POSITION };
	const CAMERA_Y_OFFSET = 0.01; // prevents camera flipping in top-down view
	const GRID_ENTITY = {
		visuals: {
			drawCmd: 'drawGrid',
			show: true,
			transparent: true,
			useVertexColors: false
		},
		size: [200, 200],
		ticks: [10, 1],
		color: [0.5, 0.5, 0.5, 0.3],
		subColor: [0.5, 0.5, 0.5, 0.1]
	};

	// props
	interface ModelViewerProps {
		geometryToRender: Geom3 | Geom3[] | null;
	}
	let { geometryToRender }: ModelViewerProps = $props();

	let viewerContainer: HTMLDivElement;
	let resizeObserver: ResizeObserver;
	let animationFrameId: number;

	// renderer state
	let rendererFunction: any = null;
	let renderOptions: any = null;
	let entitiesFromSolidsFunction: any = null;
	let camera: any = null;
	let perspectiveCamera: any = null;
	let renderState: any = null;
	let orbitControls: any = null;
	let updateView: boolean = true; // initial update needed

	let isRendererReady = $state(false);

	/**
	 * Refresh the entities in the viewer on change.
	 */
	$effect(() => {
		if (!isRendererReady) {
			return;
		}

		const refreshedEntities = geometryToRender
			? entitiesFromSolidsFunction({}, geometryToRender)
			: [];
		renderOptions.entities = [...refreshedEntities, GRID_ENTITY];
		rendererFunction(renderOptions);
	});

	/**
	 * Initial setup of the jscad renderer.
	 */
	onMount(async () => {
		if (!viewerContainer) {
			return;
		}

		// load JSCAD modules in onMount because window is needed for renderer
		const jscadRegl = await import('@jscad/regl-renderer');
		const { prepareRender, drawCommands, cameras, controls, entitiesFromSolids } = jscadRegl;
		entitiesFromSolidsFunction = entitiesFromSolids;

		// init camera & controls
		perspectiveCamera = cameras.perspective;
		camera = Object.assign({}, perspectiveCamera.defaults, CAMERA_STATE_OVERRIDE);
		perspectiveCamera.setProjection(camera, camera, {
			width: viewerContainer.clientWidth,
			height: viewerContainer.clientHeight
		});

		orbitControls = controls.orbit;

		renderState = {
			camera: camera,
			controls: orbitControls.defaults
		};

		rendererFunction = prepareRender({
			glOptions: { container: viewerContainer }
		});

		renderOptions = {
			camera: renderState.camera,
			drawCommands: {
				drawGrid: drawCommands.drawGrid,
				drawMesh: drawCommands.drawMesh,
				drawAxis: drawCommands.drawAxis,
				drawLines: drawCommands.drawLines
			},
			entities: [],
			rendering: {
				background: [0.12, 0.12, 0.12, 1.0], // sets the background color of the canvas
				ambientLightAmount: 0.4,
				diffuseLightAmount: 0.5,
				specularLightAmount: 0.02,
				materialShininess: 1.0
			}
		};

		let rotateDelta = [0, 0];
		let zoomDelta = 0;
		let pointerDown = false;
		let lastX = 0;
		let lastY = 0;

		const updateAndRender = () => {
			if (rotateDelta[0] || rotateDelta[1]) {
				const updated = orbitControls.rotate(
					{ controls: renderState.controls, camera: renderState.camera, speed: 0.002 },
					rotateDelta
				);
				renderState.controls = { ...renderState.controls, ...updated.controls };
				rotateDelta = [0, 0];
				updateView = true;
			}

			if (zoomDelta) {
				const updated = orbitControls.zoom(
					{ controls: renderState.controls, camera: renderState.camera, speed: 0.08 },
					zoomDelta
				);
				renderState.controls = { ...renderState.controls, ...updated.controls };
				zoomDelta = 0;
				updateView = true;
			}

			if (updateView || renderState.controls.changed) {
				updateView = false;

				const updates = orbitControls.update({
					controls: renderState.controls,
					camera: renderState.camera
				});
				renderState.controls = { ...renderState.controls, ...updates.controls };
				renderState.camera.position = updates.camera.position;
				perspectiveCamera.update(renderState.camera);
				rendererFunction(renderOptions);
			}

			animationFrameId = window.requestAnimationFrame(updateAndRender);
		};

		// add controls to viewer container
		viewerContainer.onpointerdown = (ev) => {
			pointerDown = true;
			lastX = ev.pageX;
			lastY = ev.pageY;
			viewerContainer.setPointerCapture(ev.pointerId);
		};
		viewerContainer.onpointermove = (ev) => {
			if (!pointerDown) {
				return;
			}
			rotateDelta[0] -= lastX - ev.pageX;
			rotateDelta[1] -= ev.pageY - lastY;
			lastX = ev.pageX;
			lastY = ev.pageY;
		};
		viewerContainer.onpointerup = (ev) => {
			pointerDown = false;
			viewerContainer.releasePointerCapture(ev.pointerId);
		};
		viewerContainer.onwheel = (ev) => {
			ev.preventDefault();
			zoomDelta += ev.deltaY;
		};

		// add resizeObserver to handle resizing
		let resizeTimeout: ReturnType<typeof setTimeout>;
		resizeObserver = new ResizeObserver(() => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				const width = viewerContainer.clientWidth;
				const height = viewerContainer.clientHeight;
				perspectiveCamera.setProjection(camera, camera, { width, height });
				perspectiveCamera.update(camera);
				fitCameraToGeometry();
			}, RESIZE_TIMEOUT_MS);
		});

		resizeObserver.observe(viewerContainer);

		animationFrameId = window.requestAnimationFrame(updateAndRender);

		isRendererReady = true;
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
		cancelAnimationFrame(animationFrameId);
	});

	const fitCameraToGeometry = () => {
		if (!isRendererReady || !geometryToRender) {
			return;
		}

		const unionedGeoms = jscad.booleans.union(geometryToRender);

		// get dimensions & center of the geom3
		const [[minX, minY, minZ], [maxX, maxY, maxZ]] = measurements.measureBoundingBox(unionedGeoms);
		const width = maxX - minX;
		const height = maxY - minY;
		const center = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];

		// calculate aspect ratio & field of views
		const aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
		const verticalFov = camera.fov;
		const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);

		// calculate the distance needed to cover the whole geometry
		const distanceForHeight = height / (2 * Math.tan(verticalFov / 2));
		const distanceForWidth = width / (2 * Math.tan(horizontalFov / 2));
		const distance = Math.max(distanceForHeight, distanceForWidth);

		// update camera target & position
		camera.target = [...center];
		camera.position = [center[0], center[1] - CAMERA_Y_OFFSET, center[2] + distance * 1.1];

		renderState.controls = { ...orbitControls.defaults };
		renderState.camera = camera;

		perspectiveCamera.update(camera);
		updateView = true;
	};
</script>

<div class="viewer-container">
	<div bind:this={viewerContainer} class="jscad-container"></div>
	<button class="reset-view-button icon-button" onclick={fitCameraToGeometry}>
		<Focus />
	</button>
</div>

<style lang="scss">
	.viewer-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.jscad-container {
		width: 100%;
		height: 100%;
		background: var(--pico-background-color);
		touch-action: none;
		border-radius: var(--pico-border-radius);
		background-color: var(--pico-card-background-color);
		border: var(--pico-border-width) solid var(--pico-card-border-color);
	}

	.reset-view-button {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
	}
</style>
