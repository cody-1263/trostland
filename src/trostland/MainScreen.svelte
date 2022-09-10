<script lang="ts">
	import MergedRoster from './MergedRoster.svelte';
  import { MergedUser, Merger } from './Model';
	
  let chaosUsers = new Array<MergedUser>();
	let juggernautsUsers = new Array<MergedUser>();
	let pathfindersUsers = new Array<MergedUser>();
	let emptyUsers = new Array<MergedUser>();
		
	let mainMerger = new Merger();
	
	let displayChaos = true;
	let displayJuggernauts = true;
	let displayPathfinders = true;
	let displayEmpty = true;
	function switchChaosVisibility() { displayChaos = !displayChaos }
	function switchJuggernautsVisibility() { displayJuggernauts = !displayJuggernauts }
	function switchPathfindersVisibility() { displayPathfinders = !displayPathfinders }
	function switchEmptyVisibility() { displayEmpty = !displayEmpty }

	/** Reloads UI arrays from the model (mainMerger) */
	function reloadArrays() {
		chaosUsers       = mainMerger.mergedUsers.get('chaos');
		juggernautsUsers = mainMerger.mergedUsers.get('juggernauts');
		pathfindersUsers = mainMerger.mergedUsers.get('pathfinders');
		emptyUsers       = mainMerger.mergedUsers.get('empty');
	}
	
	/** Processes user tsv file inputv */
	async function onTsvFileOpen(e) {
		await mainMerger.openTsvFile(e);
		mainMerger.mergeUsers();
		reloadArrays();
	}
	
	async function onHtmlFileOpen(e) {
		await mainMerger.openHtmlFile(e);
		mainMerger.mergeUsers();
		reloadArrays();
	}
	
	/** Processes bungie button click and loads bungie users */
	async function onBungieLoadClick() {
		await mainMerger.loadBungieUsers();
		mainMerger.mergeUsers();
		reloadArrays();
	}
	
	
</script>

<style>
	.root-div {
		background: #222;
		margin: -24px -8px;
		padding: 12px;
	}
	
	.title {
		font-size: 1.2 rem;
		font-weight: bold;
		color: #ddd;
		/* margin-top: 1rem;
		margin-bottom: 0.5rem; */
	}
	
	.btn-panel {
		height: 72px;
		display: flex;
		align-items: center;
		justify-content: space-around;
		color: #ddd;
		margin: 0px 32px;
		background: #fff0;
	}
	
	/* .btn-item-done {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 200px;
		background: #fff0;
	} */
	
	.btn-item-action {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		gap: 8px;
		width: 200px;
		height: 32px;
		background: #fff1;
		padding: 0px;
		margin: 0px;
		color: #ddd;
		border: solid #fff2 1px;
		border-radius: 8px;
	}
	.btn-item-action:active{
		border: solid #fff4 1px;
		background: #fff2;
	}
	
	.icon {
		width: 16px;
		height: 16px;
	}
	
	.btn-hide {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		gap: 8px;
		width: 200px;
		height: 40px;
		background: #fff1;
		padding: 0px;
		margin: 0px;
		color: #ddd;
		border: solid #fff2 1px;
		border-radius: 8px;
		margin: 8px;
	}
</style>

<!-- - - - - - - - - - - - - - - - - - - - - - - - - -  -->

<div class="root-div">
	
	<!-- buttons -->
	
	<div class="btn-panel">
		
		<input class="inputfile" name="file" id="file" type="file" accept=".tsv" on:change={onTsvFileOpen} style="opacity: 0; width: 0;">
		<label for="file">
			<div  class="btn-item-action" >
				<img class="icon" src="./fileicon.png" alt="">
				<div>OPEN FILE</div>
			</div>
		</label>
		
		<button  class="btn-item-action" on:click={onBungieLoadClick}>
			<img class="icon" src="./fileicon.png" alt="">
			<div> Load bungie</div>
		</button>
		
		<input class="inputfile" name="htmlFile" id="htmlFile" type="file" accept=".html" on:change={onHtmlFileOpen} style="opacity: 0; width: 0;">
		<label for="htmlFile">
			<div  class="btn-item-action" >
				<img class="icon" src="./htmlicon.png" alt="">
				<div>OPEN HTML</div>
			</div>
		</label>
		
	</div>
	
	<!-- lists -->
	
	
	<!-- <button class="btn-hide" on:click="{switchChaosVisibility}">
		<div class="title"> CHAOS </div>
	</button>
	{#if displayChaos}
		<MergedRoster mergedUsers = {chaosUsers}/>
	{/if} -->
	
	<button class="btn-hide" on:click="{switchJuggernautsVisibility}">
		<div class="title"> JUGGERNAUTS </div>
	</button>
	{#if displayJuggernauts}
		<MergedRoster mergedUsers = {juggernautsUsers}/>
	{/if}
	
	<button class="btn-hide" on:click="{switchPathfindersVisibility}">
		<div class="title"> PATHFINDERS </div>
	</button>
	{#if displayPathfinders}
		<MergedRoster mergedUsers = {pathfindersUsers}/>
	{/if}
	
	<button class="btn-hide" on:click="{switchEmptyVisibility}">
		<div class="title"> noclan </div>
	</button>
	{#if displayEmpty}
		<MergedRoster mergedUsers = {emptyUsers}/>
	{/if}

	<div style="height: 10rem">

	</div>

</div>

