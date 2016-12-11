import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers } from '@angular/http'; 
import { FacebookLoginService } from '../../services/FacebookLoginService';
import { SettingsPO, RulePO, RuleOperation} from '../../presentation_objects/SettingsPO';
import { ClassifierService } from '../../services/ClassifyService';
import { SettingsService } from '../../services/SettingsService';
import { Observable } from 'rxjs';

@Component({
  moduleId: module.id,
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  providers: [FacebookLoginService, ClassifierService, SettingsService]
})
export class SettingsComponent {
    @Input() userFbAccessToken: string;     
    public categoryOptions: Array<string>; 
    public friendGroupOptions: Array<string>; 
    public validOperations: Array<string> = ['Do not share', 'Share']
    public isLoading: boolean = true; 
    public userSettings: SettingsPO; 

    constructor(private classifier: ClassifierService, 
                private fbService: FacebookLoginService,
                private settingsService: SettingsService) { 
    }

     ngOnInit(){
        this.userSettings = this.loadSettings(); 
        this.validOperations = this.getValidOperations(); 
        this.isLoading = true; 
        this.friendGroupOptions = this.fbService.getFacebookFriendGroups('not implemented'); 
        this.classifier.getCategories()
            .subscribe((categories) => {
                var tempCategories = []; 
                this.categoryOptions = Object.keys(categories); 
                this.isLoading = false; 
            }); 
    }

    public saveSettings(): void {
        let settings = new SettingsPO(); 
        settings.Rules = this.userSettings.Rules.map((item) => {
                if (item.Operation.hasOwnProperty('id')) {
                    var rule = new RulePO(); 
                    rule.Operation = (<any>item.Operation).id;
                    rule.Category = item.Category.map((cat) => { return cat.id });  
                    rule.FriendGroups = item.FriendGroups.id; 
                    return rule; 
                } else {
                    return item; 
                }
            }); 

        this.settingsService.saveUserSettings(settings); 
    } 

    public getValidOperations(): Array<string> {
        var values = [];
        for (var enumMember in RuleOperation) {
           var isValueProperty = parseInt(enumMember, 10) >= 0
           if (isValueProperty) {
             values.push(RuleOperation[enumMember]);
           }
        }
        return values; 
    }

    public addRule(): void {
        var newRule = new RulePO(); 
        this.userSettings.Rules.push(newRule); 
    }

    public deleteRule(index: number): void {
        this.userSettings.Rules.splice(index, 1); 
    }

    public updateFriendGroupsForRule(index: number, value: any): void {
        this.userSettings.Rules[index].FriendGroups = value; 
    }

    public updateOperationForRule(index: number, value: any): void {
        this.userSettings.Rules[index].Operation = value; 
    }
    
    public updateCategoryForRule(index: number, value: Array<any>): void {
        this.userSettings.Rules[index].Category = value; 
    }

    private loadSettings(): SettingsPO {
        //var rawSettings = localStorage.getItem(this.localSettingName); 
        //var settings = JSON.parse(rawSettings);
        //console.log(settings);  
        //if (settings === null) {
        //    settings = new SettingsPO(); 
        //    settings.Rules = []; 
        //    var newRule = new RulePO();
        //    settings.Rules.push(newRule); 
        //}
        return this.settingsService.getUserSettings();
    }
}

