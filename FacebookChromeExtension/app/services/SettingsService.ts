import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SettingsPO, RulePO, RuleOperation} from '../presentation_objects/SettingsPO';

@Injectable()
export class SettingsService {
    public localSettingName: string = 'userFBCASettings';
    constructor() { 
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
        } else {
            let settings = new SettingsPO();
            settings.Rules = tempSettings.Rules.map((item) => {
                var rule = new RulePO(); 
                rule.Operation = (<any>RuleOperation)[item.Operation.id];
                rule.Category = item.Category.map((cat) => { return cat.id });  
                rule.FriendGroups = item.FriendGroups.id; 
                return rule; 
            }); 
            return settings; 
        }
    }
}


