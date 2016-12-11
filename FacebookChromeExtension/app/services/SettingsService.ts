import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SettingsPO, RulePO, RuleOperation} from '../presentation_objects/SettingsPO';

@Injectable()
export class SettingsService {
    public localSettingName: string = 'userFBCASettings';
    public localFbTokenName: string = 'userFbToken';
    constructor() { 
    }
    
    public saveUserSettings(settings: any): void {
        localStorage.setItem(this.localSettingName, JSON.stringify(settings)); 
    } 

    public getUserSettings(): SettingsPO {
        var rawSettings = localStorage.getItem(this.localSettingName); 
        var tempSettings = JSON.parse(rawSettings);
        if (tempSettings === null) {
            let settings = new SettingsPO(); 
            settings.Rules = []; 
            var newRule = new RulePO();
            settings.Rules.push(newRule); 
            return settings; 
        }

        return <SettingsPO>tempSettings; 
    }

    public saveFbToken(fbToken: string): void {
        localStorage.setItem(this.localFbTokenName, fbToken);  
    }

    public getFbToken(): string {
        return localStorage.getItem(this.localFbTokenName); 
    }
}


