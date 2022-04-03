import { SpreadsheetDataSource, BungieNetDataSource, SeismicDataSource } from './DataSources';


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
  lastOnlineText: string;

  constructor(name: string, profileUrl: string, lastOnlineText: string) {
    this.seismicName = name;
    this.lastOnlineText = lastOnlineText;
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





// - - - - - - - - - - - - - - - - - - - - - - - - 








export class Merger {
  
  /** Lists of users imported from spreadsheet */
  private spreadsheetUsers: Map<string, Array<SpreadsheetUser>>;
  
  /** Lists of users imported from bungie.net */
  private bungieUsers: Map<string, Array<BungieUser>>;
  
  /** Lists of users imported from seismic website */
  private seismicUsers: Array<SeismicUser>;
  
  mergedUsers: Map<string, Array<MergedUser>>;
  
  clanNames: Array<string>;
  
  
  /* ------------ 0. Constructor ------------ */
  
  
  constructor() {
    
    this.clanNames = new Array<string>();
    this.clanNames.push("chaos");
    this.clanNames.push("juggernauts");
    this.clanNames.push("pathfinders");
    this.clanNames.push("empty");
    
    this.spreadsheetUsers = new Map<string, Array<SpreadsheetUser>>();
    this.bungieUsers      = new Map<string, Array<BungieUser>>();
    this.seismicUsers     = new Array<SeismicUser>();
    this.mergedUsers      = new Map<string, Array<MergedUser>>();
    
    for (let clanName of this.clanNames) {
      this.spreadsheetUsers.set(clanName, new Array<SpreadsheetUser>());
      this.bungieUsers.set(clanName, new Array<BungieUser>());
      this.mergedUsers.set(clanName, new Array<MergedUser>());
    }
  }
  
  
  /* ------------ 1. Users merging ------------ */
  
  
  /** Merges three profiles of each user in one container when they match each other */
  mergeUsers() {
    
    let hashLength = 5;
    
    let mergedSeismicUsers = new Array<SeismicUser>();
    
    for (let clanKey of this.clanNames){
      
      if (clanKey == "empty")
        continue;
      
      let mergedClanUsers = new Array<MergedUser>();
      let mergedBungieClanUsers = new Array<BungieUser>();
      
      let spreadsheetClanUsers = this.spreadsheetUsers.get(clanKey);
      let bungieClanUsers = this.bungieUsers.get(clanKey);
      
      // 1. Merge spreadsheet users
      for (let ssUser of spreadsheetClanUsers) {
        
        let mergedUser = new MergedUser(null, null, null);
        mergedUser.spreadsheetUser = ssUser;
        
        // 1.1. Find matching Seismic user
        let ssSeismicNameHash = ssUser.seismicName.toLowerCase().replace('sg_', '').substring(0, hashLength);
        for (let sgUser of this.seismicUsers) {
          let sgNameHash = sgUser.seismicName.toLowerCase().replace('sg_', '').substring(0, hashLength);
          if (ssSeismicNameHash == sgNameHash) {
            mergedUser.seismicUser = sgUser;
            mergedSeismicUsers.push(sgUser);
            break;
          } 
        }
        
        // 1.2. Find matching Bungie user
        let ssBungieNameHash = ssUser.bungieName.toLowerCase().substring(0, hashLength);
        for (let bnUser of bungieClanUsers) {
          let bnNameHash = bnUser.bungieName.toLowerCase().substring(0, hashLength);
          if (ssBungieNameHash == bnNameHash) {
            mergedUser.bungieUser = bnUser;
            mergedBungieClanUsers.push(bnUser);
            break;
          } 
        }
        
        mergedClanUsers.push(mergedUser);
      }
      
      // 2. Find unmatched bungie users and create MergedUsers for them
      let unmatchedBungieUsers = new Array<BungieUser>();
      for (let bnUser of bungieClanUsers) {
        if (mergedBungieClanUsers.includes(bnUser, 0) == false)
          unmatchedBungieUsers.push(bnUser);
      }
      
      for (let bnUser of unmatchedBungieUsers) {
        let mergedUser = new MergedUser(null, null, null);
          mergedUser.bungieUser = bnUser;
          mergedClanUsers.push(mergedUser);
      }
      
      // 3. Insert created MergedUsers in the dictionary
      this.mergedUsers.set(clanKey, mergedClanUsers);
    }
    
    this.fillEmptyClanUsers();
  }
  
  /** Find unmatched Seismic users and create MergedUsers for them in 'empty' clan */
  fillEmptyClanUsers() {
    
    // 1. Find all matched seismic users
    let matchedSeismicUsers = new Set<SeismicUser>();
    for (let clanUsers  of this.mergedUsers.values()) {
      for (let clanUser of clanUsers) {
        if (clanUser.seismicUser != null)
          matchedSeismicUsers.add(clanUser.seismicUser);
      }
    }
    
    // 2. Find unmatched users and create MergedUser objects for them
    let mergedEmptyClanUsers = new Array<MergedUser>();
    for (let sgUser of this.seismicUsers) {
      if (matchedSeismicUsers.has(sgUser))
        continue;
        
      let mergedUser = new MergedUser(null, sgUser, null);
      mergedEmptyClanUsers.push(mergedUser);
    }
    this.mergedUsers.set('empty', mergedEmptyClanUsers);
  }
  
  /* ------------ 4. Spreadsheet reading ------------ */
   
  async openTsvFile(e) {
    let tsvDataSource = new SpreadsheetDataSource();
    let tsvUsers = await tsvDataSource.onFileChange(e);
    this.spreadsheetUsers.set('chaos', tsvUsers.get('chaos'));
    this.spreadsheetUsers.set('juggernauts', tsvUsers.get('juggernauts'));
    this.spreadsheetUsers.set('pathfinders', tsvUsers.get('pathfinders'));
  }
  
  async loadBungieUsers() {
    let bungieDataSource = new BungieNetDataSource();
    let bnUsers = await bungieDataSource.getUsers();
    this.bungieUsers.set('chaos', bnUsers.get('chaos'));
    this.bungieUsers.set('juggernauts', bnUsers.get('juggernauts'));
    this.bungieUsers.set('pathfinders', bnUsers.get('pathfinders'));
  }
  
  async openHtmlFile(e) {
    let sgds = new SeismicDataSource();
    let sgUsers = await sgds.onFileChange(e);
    this.seismicUsers = sgUsers;
  }
  
}