<script lang="ts">
	import MergedRoster from './MergedRoster.svelte';
  import { MergedUser, SeismicUser, BungieUser, SpreadsheetUser, Merger } from './Model';
	import { BungieNetDataSource, SpreadsheetDataSource } from './DataSources';
	
	let seismicUsers = new Array<SeismicUser>();
  let bungieUsers = new Array<BungieUser>();
  let spreadsheetUsers = new Array<SpreadsheetUser>();
  let mergedUsers = new Array<MergedUser>();
	
	/**
	 * Processes user tsv file input
	 * @param e
	 */
	function onTsvFileOpen(e) {
		let tsvReader = new SpreadsheetDataSource();
		tsvReader.onFileChange(e).then(function (users) {
			spreadsheetUsers = users;
			mergedUsers = new Array<MergedUser>();
			for (let su of spreadsheetUsers) {
				mergedUsers.push(new MergedUser(su,null,null));
			}
		});
	}
	
	/**
	 * Processes bungie button click and loads bungie users
	 */
	function onBungieLoadClick() {
		let bnds = new BungieNetDataSource();
		bnds.getUsers().then(function (users) {
			bungieUsers = users;
			let merger = new Merger();
			let newMergedUsers = merger.mergeUsers(bungieUsers, seismicUsers, spreadsheetUsers);
			mergedUsers = newMergedUsers;
		});
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
		margin-top: 1rem;
		margin-bottom: 0.5rem;
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
	
	.btn-item-done {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 200px;
		background: #fff0;
	}
	
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
</style>

<!-- - - - - - - - - - - - - - - - - - - - - - - - - -  -->

<div class="root-div">
	
	<!-- buttons -->
	
	<div class="btn-panel">
		
		<input class="inputfile" name="file" id="file" type="file" accept=".txt, .tsv" on:change={onTsvFileOpen} style="opacity: 0; width: 0;">
		<label for="file">
			<div  class="btn-item-action" >
				<img class="icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/480px-Flat_tick_icon.svg.png" alt="">
				<div>OPEN FILE</div>
			</div>
		</label>
		
		<button  class="btn-item-action" on:click={onBungieLoadClick}>
			<img class="icon" src="https://icon-library.com/images/document-icon-png/document-icon-png-17.jpg" alt="">
			<div> Load bungie</div>
		</button>
		
		<!-- <div class="btn-item-done">
			<img class="icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/480px-Flat_tick_icon.svg.png" alt="">
			<div> Bungie users: 467</div>
		</div>
		
	  <div class="btn-item-done">
			<img class="icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/480px-Flat_tick_icon.svg.png" alt="">
			<div> Seismic users: 467</div>
	  </div> -->
		
		
		<!-- {#if mergedUsers.length > 0}
			<div class="btn-item-done">
				<img class="icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/480px-Flat_tick_icon.svg.png" alt="">
				<div> Merged users: {mergedUsers.length}</div>
			</div>
		{:else}
		  <button  class="btn-item-action" on:click={onBungieLoadClick}>
				<img class="icon" src="https://icon-library.com/images/document-icon-png/document-icon-png-17.jpg" alt="">
				<div> Load bungie</div>
			</button>
		{/if} -->
	
	  
		
	</div>
	
	<!-- lists -->
	
	<div class="title">
		Merged users
	</div>

	<MergedRoster {mergedUsers}/>

	<!-- <div class="title">
		Bungie users
	</div>

	<BungieNetList {bungieUsers}/>

	<div class="title">
		Seismic users
	</div>

	<SeismicRosterList {seismicUsers}/>

	<div class="title">
		Spreadsheet users
	</div>

	<SpreadsheetRosterList {spreadsheetUsers}/> -->

	<div style="height: 10rem">

	</div>

</div>

