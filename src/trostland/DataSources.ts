import { MergedUser, SeismicUser, BungieUser, SpreadsheetUser } from './Model';

/**
 * bungie.net users data source
 */
export class BungieNetDataSource {
  
  constructor() {
    
  }
  
  async getUsers() {
    let chaosUsers = await this.addClanRoster(3135419);
    let juggsUsers = await this.addClanRoster(3285991);
    let pathsUsers = await this.addClanRoster(3909446);
    let userMap = new Map<string, BungieUser[]>();
    userMap.set('chaos', chaosUsers);
    userMap.set('juggernauts', juggsUsers);
    userMap.set('pathfinders', pathsUsers);
    return userMap;
  }
  
  
  async bungieGet(endpoint) {
    let bungoApiKey = '84e133a91eea4882b9a0bf6f404ef782';
    let bungoParam = { headers: {  'X-API-Key': bungoApiKey} };
    let apiRootPath = 'https://www.bungie.net/Platform';
    let url = apiRootPath + endpoint;
    let fetchResponse = await fetch(url, bungoParam);
    let reportJson = await fetchResponse.json();
    return reportJson;
  }
  
  async addClanRoster(clanId : number) {
    let usersArray = new Array<BungieUser>();
    let chaosList = await this.bungieGet(`/GroupV2/${clanId}/Members/`);
    console.log(chaosList);
    console.log(`code: ${chaosList.ErrorCode}  |  status: ${chaosList.ErrorStatus}`)

    let items = chaosList.Response.results;
    
    console.log(items);

    for (const item of items) {

      let basicName = item.bungieNetUserInfo.displayName;
      let bungieName = item.bungieNetUserInfo.supplementalDisplayName;
      let bungieId = item.destinyUserInfo.membershipId;
      let lastOnline = new Date(item.lastOnlineStatusChange * 1000);
      
      let currentDate = new Date();
      let timePassed = +currentDate - +lastOnline;

      let daysPassed = Math.round(timePassed / 86400000 / 1 * 10) / 10;
      
      let profileUrl = `https://www.bungie.net/7/en/User/Profile/3/${bungieId}`;
      
      let bUser = new BungieUser(basicName, bungieName, profileUrl, daysPassed);
      usersArray.push(bUser);
    }
    
    return usersArray;
  }

}

/**
 * Spreadsheet users data source
 */
export class SpreadsheetDataSource {
  
  // constructor() {
    
  // }
  
  // openFile() {
  //   let inputElement = document.createElement('input');
  //   inputElement.type = 'file';
  //   inputElement.accept = '.txt, .tsv';
  //   inputElement.onchange = this.onFileChange;
  //   inputElement.click();
  // }
  
  /**
   * Loads the file from event arguments and send it to reading
   */
  async onFileChange(event) {
		let fileList = event.target.files;
		let file = fileList[0];
		let data = await file.text();
		let ssUsers = await this.readSpreadsheetTsv(data);
    
    return ssUsers;
	}
	
  /**
   * Reades tsv text into array of SpreadsheetUsers
   */
	async readSpreadsheetTsv(tsvText) {
    
		let lines = tsvText.split('\n');
		let items = new Map<string, Array<SpreadsheetUser>>();
    let rowNumber = 0;
    
    let currentArray = null;
    
		for (let line of lines){
      rowNumber++;
      
			let parts = line.split('\t');
			let sgName = parts[0];
			let bnName = parts[1];
      
      if (sgName == 'chaos' || sgName == 'juggernauts' || sgName == 'pathfinders') {
        currentArray = new Array<SpreadsheetUser>();
        items.set(sgName, currentArray);
        continue;
      }
        
			let newUser = new SpreadsheetUser(rowNumber, sgName, bnName);
			currentArray.push(newUser);
		}
    
    console.log(items);
		
		return items;
	}
  
}