import { MergedUser, SeismicUser, BungieUser, SpreadsheetUser } from './Model';

export class BungieNetDataSource {
  
  constructor() {
    
  }
  
  async getUsers() {
    let allUsers = new Array<BungieUser>();
    await this.addClanRoster(3285991, allUsers);
    return allUsers;
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
  
  async addClanRoster(clanId : number, usersArray : Array<BungieUser>) {
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
  }

}