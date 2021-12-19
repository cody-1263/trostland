export class BungieUser {
  /** General account name */
  accountName: string;
  /** Bungie name (useruser#1234) */
  bungieName: string;
  id: number;
  url: string;
  lastOnlineDate: Date;
  lastOnlineDaysAgo: number;

  constructor(name: string, bungieName: string, profileUrl: string, daysAgo: number) {
    this.accountName = name;
    this.bungieName = bungieName;
    this.id = -1;
    this.url = profileUrl;
    this.lastOnlineDaysAgo = daysAgo;
  }
  
}

/** Seismic Gaming user descriptor */
export class SeismicUser {
  seismicName: string;
  url: string;
  lastOnlineText: number;
  lastOnlineDaysAgo: number;

  constructor(name: string, profileUrl: string, daysAgo: number) {
    this.seismicName = name;
    this.lastOnlineDaysAgo = daysAgo;
    this.lastOnlineText = null;
    this.url = profileUrl;
  }
}

export class SpreadsheetUser {
  seismicName: string;
  bungieName: string;
  rowNumber: number;
  
  constructor(rownum: number, sname: string, bname: string) {
    this.seismicName = sname;
    this.bungieName = bname;
    this.rowNumber = rownum;
  }
}

/** Bungie + Seismic + Spreadsheet user links */
export class MergedUser {
  spreadsheetUser: SpreadsheetUser;
  seismicUser: SeismicUser;
  bungieUser: BungieUser;
  
  constructor(ssUser: SpreadsheetUser, sgUser: SeismicUser, bnUser: BungieUser) {
    this.spreadsheetUser = ssUser;
    this.seismicUser = sgUser;
    this.bungieUser = bnUser;
  }
}





// - - - - - - - - - -- - - - - - - - - - - - - - - 








export class Merger {
  
  /** Merges three profiles of each user in one container when they match each other */
  mergeUsers(bungieUsers: Array<BungieUser>, seismicUsers: Array<SeismicUser>, spreadsheetUsers: Array<SpreadsheetUser>) {
    
    let hashLength = 6;
    let mergedUsers = new Array<MergedUser>();
    let mergedSeismicUsers = new Array<SeismicUser>();
    let mergedBungieUsers = new Array<BungieUser>();
    
    // 1. Merge spreadsheet users
    for (let ssUser of spreadsheetUsers) {
      
      let mergedUser = new MergedUser(null, null, null);
      mergedUser.spreadsheetUser = ssUser;
      mergedUsers.push(mergedUser);
      
      // 1.1. Find matching Seismic user
      let ssSeismicNameHash = ssUser.seismicName.toLowerCase().substring(0, hashLength);
      for (let sgUser of seismicUsers) {
        let sgNameHash = sgUser.seismicName.toLowerCase().substring(0, hashLength);
        if (ssSeismicNameHash == sgNameHash) {
          mergedUser.seismicUser = sgUser;
          mergedSeismicUsers.push(sgUser);
          break;
        } 
      }
      
      // 1.2. Find matching Bungie user
      let ssBungieNameHash = ssUser.bungieName.toLowerCase().substring(0, hashLength);
      for (let bnUser of bungieUsers) {
        let bnNameHash = bnUser.bungieName.toLowerCase().substring(0, hashLength);
        if (ssBungieNameHash == bnNameHash) {
          mergedUser.bungieUser = bnUser;
          mergedBungieUsers.push(bnUser);
          break;
        } 
      }
    }
    
    // 2. Merge unmatched seismic users with unmatched bungie users
    let unmatchedBungieUsers = new Array<BungieUser>();
    let unmatchedSeismicUsers = new Array<SeismicUser>();
    for (let bnUser of bungieUsers)
      if (mergedBungieUsers.includes(bnUser, 0) == false)
        unmatchedBungieUsers.push(bnUser);
    for (let sgUser of seismicUsers)
      if (mergedSeismicUsers.includes(sgUser, 0) == false)
        unmatchedSeismicUsers.push(sgUser);
        
    for (let sgUser of unmatchedSeismicUsers) {
      let mergedUser = new MergedUser(null, null, null);
      mergedUser.seismicUser = sgUser;
      mergedUsers.push(mergedUser);
      
      let sgNameHash = sgUser.seismicName.toLowerCase().substring(0, hashLength);
      for (let bnUser of unmatchedBungieUsers) {
        let bnAccountNameHash = bnUser.accountName.toLowerCase().substring(0, hashLength);
        let bnBungieNameHash  = bnUser.bungieName.toLowerCase().substring(0, hashLength);
        if (sgNameHash == bnAccountNameHash || sgNameHash == bnBungieNameHash) {
          mergedUser.bungieUser = bnUser;
          mergedBungieUsers.push(bnUser);
          break;
        } 
      }
    }
    
    for (let bnUser of bungieUsers) {
      if (mergedBungieUsers.includes(bnUser, 0) == false) {
        let mergedUser = new MergedUser(null, null, null);
        mergedUser.bungieUser = bnUser;
        mergedUsers.push(mergedUser);
      }
    }
    
    return mergedUsers;
  }
  
  /** Reads input tab-separated text and creates spreadsheet user objects from it */
  readSpreadsheet(text: string) {
    let ssUserList = new Array<SpreadsheetUser>();
    let lines = text.split(/\r?\n/);
    for (let i = 3; i < lines.length; i++) {
      let line =  lines[i];
      let segments = line.split('\t');
      let sgName = segments[0].trim();
      let bnName = segments[1].trim();
      
      if (sgName.length == 0 && bnName.length == 0)
        continue;
        
      let ssUser = new SpreadsheetUser(null, null, null);
      ssUser.seismicName = sgName;
      ssUser.bungieName = bnName;
      ssUser.rowNumber = i;
      ssUserList.push(ssUser);
    }
    
    return ssUserList;
  }
  
  /** Exapmple of text file reading in a browser */
  subscribeToInputElementChange() {
    // var fr = new FileReader();
    // fr.onload = function(){
    //   document.getElementById('output').textContent = fr.result;
    // }
    // fr.readAsText(this.files[0]);
  }
}