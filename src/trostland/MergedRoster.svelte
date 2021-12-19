<script lang="ts">
  import type { MergedUser } from './Model';
	export let mergedUsers: Array<MergedUser>;
</script>

<style>
	.bn-item {
		height: 80px;
    max-width: 640px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #eee1;
		border: solid 1px;
		margin: 12px;
		border-radius: 8px;
		gap: 16px;
		padding-left: 16px;
	}
	.bn-item:hover {
		border: solid #fff4 1px;
	}
	
	.bn-subitem {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.bn-bungie-icon {
		height: 18px;
		width: 18px;
	}
	.bn-account-name {
		color: #ddd;
	}
	.bn-bungie-name {
		color: #ddd;
		font-size: 0.8rem;
		width: 128px;
		opacity: 0.6;
	}
	.text-red {
		color: #ff6e6e;
	}
	.text-yellow {
		color: #ffb46e;
	}
</style>

{#each mergedUsers as u}
  <div class="bn-item">
		
		<!-- SPREADSHEET info -->
		
		<div class="bn-subitem">
			{#if u.spreadsheetUser != null}
				<img src="https://cdn-icons-png.flaticon.com/512/2965/2965327.png" alt="" class="bn-bungie-icon">
				<div>
					<div class="bn-account-name">{u.spreadsheetUser.seismicName}</div>
					<div class="bn-bungie-name">{u.spreadsheetUser.bungieName}</div>
					<div class="bn-bungie-name">row {u.spreadsheetUser.rowNumber}</div>
				</div>
			{:else}
			<div style="width:162px"> </div>
			{/if}
		</div>
		
		
		<!-- BUNGIE info -->
		<div class="bn-subitem">
			{#if u.bungieUser != null}
			<a href="https://seismicgaming.eu/profile/16750-sg-jowaaaa">
				<img src="https://help.bungie.net/hc/article_attachments/360094766612/shield.png" alt="" class="bn-bungie-icon">
			</a>
				<div>
					<div class="bn-account-name">{u.bungieUser.accountName}</div>
					<div class="bn-bungie-name">{u.bungieUser.bungieName}</div>
					{#if u.bungieUser.lastOnlineDaysAgo > 56}
						<div class="bn-bungie-name text-red">{u.bungieUser.lastOnlineDaysAgo} days ago</div>
					{:else if u.bungieUser.lastOnlineDaysAgo > 28}
						<div class="bn-bungie-name text-yellow">{u.bungieUser.lastOnlineDaysAgo} days ago</div>
					{:else}
						<div class="bn-bungie-name">{u.bungieUser.lastOnlineDaysAgo} days ago</div>
					{/if}
				</div>
			{:else}
			<div style="width:162px"> </div>
			{/if}
		</div>
		
		<!-- SEISMIC info -->
		
		<div class="bn-subitem">
			{#if u.seismicUser != null}
				<a href="https://seismicgaming.eu/profile/16750-sg-jowaaaa">
					<img src="https://seismicgaming.eu/assets/images/esports/logo.png" alt="" class="bn-bungie-icon">
				</a>
				<div>
					<div class="bn-account-name">{u.seismicUser.seismicName}</div>
					<div class="bn-bungie-name"> _ </div>
					{#if u.seismicUser.lastOnlineDaysAgo > 56}
						<div class="bn-bungie-name text-red">{u.seismicUser.lastOnlineDaysAgo} days ago</div>
					{:else if u.seismicUser.lastOnlineDaysAgo > 28}
						<div class="bn-bungie-name text-yellow">{u.seismicUser.lastOnlineDaysAgo} days ago</div>
					{:else}
						<div class="bn-bungie-name">{u.seismicUser.lastOnlineDaysAgo} days ago</div>
					{/if}
				</div>
			{:else}
			<div style="width:162px"> </div>
			{/if}
		</div>
		
		
		
  </div>
{:else}
  Nothing to do here!
{/each}