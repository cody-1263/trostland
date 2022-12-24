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
	
	input {
		padding: 0;
		margin: 0;
		align-items: left;
		height: 0;
		width: 0;
		opacity: 0;
	}
	
	button {
		padding: 0;
		margin: 0;
	}
	
	label {
		padding: 0;
		margin: 0;
	}
	
	a {
		color: #5cb1bf;
	}
	
	.root-div {
		background: #222;
		margin: -24px -8px;
		padding: 12px;
	}
	
	.title {
		font-size: 1.2 rem;
		font-weight: bold;
		color: #ddd;
	}
	
	.btn-panel {
		height: 6rem;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 1rem;
		color: #ddd;
		margin: 0px 32px;
		background: #fff0;
	}
	
	.btn-item-action {
		display: grid;
		grid-template-columns: 3rem 1fr;
		grid-template-rows: 1fr 1fr;
		margin: 0;
		width: 16rem;
		height: 4rem;
		background: #fff1;
		color: #ddd;
		border: solid #fff2 1px;
		border-radius: 8px;
	}
	.btn-item-action:hover{
		border: solid #fff4 1px;
		background: #fff2;
	}
	.btn-item-action:active{
		border: solid #fff8 1px;
		background: #fff4;
	}
	
	.btn-icon {
		width: 32px;
		height: 32px;
		margin: auto;
		grid-row: 1 / span 2;
		grid-column: 1;
	}
	.btn-caption {
		grid-row: 1;
		grid-column: 2;
		font-size: 1rem;
		margin-top: auto;
		margin-bottom: 0;
		margin-left: 0;
		margin-right: auto;
	}
	.btn-description {
		grid-row: 2;
		grid-column: 2;
		font-size: 0.8rem;
		opacity: 0.5;
		margin-top: 0;
		margin-bottom: auto;
		margin-left: 0;
		margin-right: auto;
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
	}
</style>

<!-- - - - - - - - - - - - - - - - - - - - - - - - - -  -->

<div class="root-div">
	
	<!-- help -->
	
	<div style="height: 1rem;"></div>
	<a href="https://cdn.discordapp.com/attachments/478295827962658826/1056264087119614042/image.png" target="_blank" style="margin-left: 4rem;">How to use the tool</a>
	
	<!-- buttons -->
	
	<div class="btn-panel">
		
		<div style="height: 4rem;">
			<label for="file">
				<div  class="btn-item-action" >
					<img class="btn-icon" src="./img/google-sheets-48.png" alt="">
					<div class="btn-caption">1. Open .tsv</div>
					<div class="btn-description">Upload spreadsheet info</div>
				</div>
			</label>
			<input class="inputfile" name="file" id="file" type="file" accept=".tsv" on:change={onTsvFileOpen}>
		</div>
		
		
		<button  class="btn-item-action" on:click={onBungieLoadClick}>
			<img class="btn-icon" src="./img/destiny-2-96.png" alt="">
			<div class="btn-caption">2. Load bungie.net</div>
			<div class="btn-description">Download bungie.net rosters</div>
		</button>
		
		<div style="height: 4rem;">
			<label for="htmlFile">
				<div  class="btn-item-action" >
					<img class="btn-icon" src="./img/seismic-logo-240.png" alt="">
					<div class="btn-caption">3. Open .html</div>
					<div class="btn-description">Upload seismic website roster</div>
				</div>
			</label>
			<input class="inputfile" name="htmlFile" id="htmlFile" type="file" accept=".html" on:change={onHtmlFileOpen} style="opacity: 0; width: 0;">
		</div>
		
		
	</div>
	
	
	<div style="height: 2rem;"></div>
	
	
	
	<!-- lists -->
	
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

