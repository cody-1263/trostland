<script lang="ts">
	import MergedRoster from './MergedRoster.svelte';
  import { MergedUser, SeismicUser, BungieUser, SpreadsheetUser } from './Model';
	
	let seismicUsers = new Array<SeismicUser>();
  let bungieUsers = new Array<BungieUser>();
  let spreadsheetUsers = new Array<SpreadsheetUser>();
  let mergedUsers = new Array<MergedUser>();
	
	function addBungieUsers() {
    bungieUsers = new Array<BungieUser>();
    bungieUsers.push(new BungieUser('cody', 'cody#1263', 'https://seismicgaming.eu/profile/17373-sg-cody', 2));
    bungieUsers.push(new BungieUser('Mash', 'Mash1987#4982', 'https://seismicgaming.eu/profile/17373-sg-cody', 1));
    bungieUsers.push(new BungieUser('Jowaaaa', 'Jowaaaa#2194', 'https://seismicgaming.eu/profile/17373-sg-cody', 12));
    bungieUsers.push(new BungieUser('MadGuy', 'MadGuy#1087', 'https://seismicgaming.eu/profile/17373-sg-cody', 300));
    bungieUsers.push(new BungieUser('Rony', 'Ronyfield#8237', 'https://seismicgaming.eu/profile/17373-sg-cody', 6));
	}
	
	function addSeismicUsers() {
    seismicUsers = new Array<SeismicUser>();
    seismicUsers.push(new SeismicUser('SG_cody', 'https://seismicgaming.eu/profile/17373-sg-cody', 3));
    seismicUsers.push(new SeismicUser('SG_Mash', 'https://seismicgaming.eu/profile/17373-sg-cody', 8));
    seismicUsers.push(new SeismicUser('SG_Jowaaaa', 'https://seismicgaming.eu/profile/17373-sg-cody', 36));
    seismicUsers.push(new SeismicUser('SG_MadGuy', 'https://seismicgaming.eu/profile/17373-sg-cody', 267));
    seismicUsers.push(new SeismicUser('SG_Rony', 'https://seismicgaming.eu/profile/17373-sg-cody', 3));
	}
  
  function addSpreadsheetUsers() {
    spreadsheetUsers = new Array<SpreadsheetUser>();
    spreadsheetUsers.push(new SpreadsheetUser(12, 'SG_cody', 'cody#1263'));
    spreadsheetUsers.push(new SpreadsheetUser(69, 'SG_Mash', 'Mash1987#4982'));
    spreadsheetUsers.push(new SpreadsheetUser(42, 'SG_Jowaaaa', 'Jowaaaa#2194'));
    spreadsheetUsers.push(new SpreadsheetUser(120, 'SG_MadGuy', 'MadGuy#1087'));
    spreadsheetUsers.push(new SpreadsheetUser(4896, 'SG_Rony', 'Ronyfield#8237'));
  }
	
	function mergeUsers() {
    mergedUsers = new Array<MergedUser>();
		mergedUsers.push(new MergedUser(spreadsheetUsers[0], seismicUsers[0], bungieUsers[0]));
    mergedUsers.push(new MergedUser(spreadsheetUsers[1], seismicUsers[1], bungieUsers[0]));
    mergedUsers.push(new MergedUser(spreadsheetUsers[2], seismicUsers[2], bungieUsers[0]));
    mergedUsers.push(new MergedUser(spreadsheetUsers[3], seismicUsers[3], bungieUsers[0]));
    mergedUsers.push(new MergedUser(spreadsheetUsers[4], seismicUsers[4], bungieUsers[0]));
    mergedUsers.push(new MergedUser(spreadsheetUsers[0], null,            null          ));
    mergedUsers.push(new MergedUser(spreadsheetUsers[0], seismicUsers[0], null          ));
    mergedUsers.push(new MergedUser(null,                seismicUsers[0], bungieUsers[0]));
    mergedUsers = mergedUsers;
	}
  
  function fillData() {
    addSpreadsheetUsers();
    addSeismicUsers();
    addBungieUsers();
    mergeUsers();
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
		
		<div class="btn-item-done">
			<img class="icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/480px-Flat_tick_icon.svg.png" alt="">
			<div> Bungie users: 467</div>
		</div>
		
	  <div class="btn-item-done">
			<img class="icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/480px-Flat_tick_icon.svg.png" alt="">
			<div> Seismic users: 467</div>
	  </div>
		
		
		{#if mergedUsers.length > 0}
			<div class="btn-item-done">
				<img class="icon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flat_tick_icon.svg/480px-Flat_tick_icon.svg.png" alt="">
				<div> Merged users: 467</div>
			</div>
		{:else}
		  <button  class="btn-item-action" on:click={fillData}>
				<img class="icon" src="https://icon-library.com/images/document-icon-png/document-icon-png-17.jpg" alt="">
				<div> Load spreadsheet</div>
			</button>
		{/if}
	
	  
		
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

