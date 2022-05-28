import { MergedUser, SeismicUser, BungieUser, SpreadsheetUser } from './Model';

/**
 * bungie.net users data source
 */
export class BungieNetDataSource {
  
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
      //console.log(item);
      
      let basicName = "[REDACTED]";
      let bungieName = "[REDACTED]";
      let bungieId = "[REDACTED]";
       
      if (item.bungieNetUserInfo != undefined) {
        basicName = item.bungieNetUserInfo.displayName;
        bungieName = item.bungieNetUserInfo.supplementalDisplayName;
        bungieId = item.destinyUserInfo.membershipId;
      }
      else if (item.destinyUserInfo) {
        let name = item.destinyUserInfo.bungieGlobalDisplayName;
        let code = item.destinyUserInfo.bungieGlobalDisplayNameCode;
        basicName = name;
        bungieName = name + '#' + code;
        bungieId = item.destinyUserInfo.membershipId;
      }
      
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
	async readSpreadsheetTsv(tsvText : string) {
    
		let lines = tsvText.split('\n');
		let items = new Map<string, Array<SpreadsheetUser>>();
    let rowNumber = 0;
    
    let currentArray = null;
    
		for (let line of lines){
      rowNumber++;
      
			let parts = line.split('\t');
			let sgName = parts[0].trim();
			let bnName = parts[1].trim();
      
      console.log(`${rowNumber} : ${sgName} : ${bnName}`);
      
      if (sgName.length == 0 && bnName.length == 0) {
        continue;
      }
        
      if (sgName == 'Chaos' || sgName == 'Juggernauts' || sgName == 'Pathfinders') {
        currentArray = new Array<SpreadsheetUser>();
        items.set(sgName.toLowerCase(), currentArray);
        continue;
      }
        
			let newUser = new SpreadsheetUser(rowNumber, sgName, bnName);
			currentArray.push(newUser);
		}
    
    console.log(items);
		
		return items;
	}
}


/**
 * Seismic website data source 
 */
export class SeismicDataSource {
  
  /** Loads the file from event arguments and send it to reading */
  async onFileChange(event) {
    let fileList = event.target.files;
    let file = fileList[0];
    let data = await file.text();
    let sgUsers = this.readSeismicRosterText(data);
    return sgUsers;
  }
  
  /** Reads seismic roster html text into SeismicUsers */
  readSeismicRosterText(data:string) {
    
    let parser = new DOMParser();
    const htmlDoc = parser.parseFromString(data, "text/html");
    let tableRows = htmlDoc.getElementsByTagName("table")[0].rows;
    
    let newSeismicUsers = new Array<SeismicUser>();
    
    for (let trElement of tableRows) {
      
      let nameElement = trElement.getElementsByClassName('alc-event-results-cell__player-nickname')[0];
      let timeagoElement = trElement.getElementsByClassName('highlight')[0];
      let linkElement = trElement.getElementsByClassName('btn-default-alt')[0];
      let imageElement = trElement.getElementsByClassName('lazy')[0];
      
      if (nameElement != undefined && timeagoElement != undefined && linkElement != undefined) {
        let name = nameElement.textContent.trim();
        let timeago = timeagoElement.textContent.trim();
        let link = linkElement.getAttribute("href");
        let imageUrl = imageElement.getAttribute("data-src");
        let newUser = new SeismicUser(name, link, timeago);
        newUser.imageUrl = imageUrl;
        newUser.lastOnlineStatus = 'okay';
        if (timeago.includes('month'))
          newUser.lastOnlineStatus = 'danger';
          if (timeago.includes('Never'))
          newUser.lastOnlineStatus = 'danger';
        if (timeago.includes('3 weeks'))
          newUser.lastOnlineStatus = 'warning';
        newSeismicUsers.push(newUser);
      }
    }
    
    return newSeismicUsers;
  }
}