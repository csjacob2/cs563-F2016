import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers } from '@angular/http'; 
import { FacebookLoginService } from '../../services/FacebookLoginService';
import { ClassifierService } from '../../services/ClassifyService';
import { SettingsService } from '../../services/SettingsService';
import { Observable } from 'rxjs';
import { SettingsPO, RulePO, RuleOperation} from '../../presentation_objects/SettingsPO';

@Component({
  moduleId: module.id,
  selector: 'app-home',
  templateUrl: 'home.component.html',
  providers: [FacebookLoginService, ClassifierService, SettingsService]
})
export class HomeComponent {
    @Input() userFbAccessToken: string; 
    public assignedCategories: Array<string>; 
    public assignedFBGroups: Array<string>;
    public userComment: string; 
    private userSettings: SettingsPO; 

    constructor(private classifier: ClassifierService,
                private settingService: SettingsService) { 
    }

   ngOnInit(){
        this.userSettings = this.settingService.getUserSettings(); 
   }

    public analyzeComent(): void {
        if (this.userComment !== undefined && this.userComment !== '') {
            this.classifier.classifyComment(this.userComment)
                .subscribe((results) => {
                    this.assignedCategories = results; 
                    this.assignedFBGroups = this.findFriendGroups(this.assignedCategories); 
                }); 
        }
    }

    private findFriendGroups(categories: Array<string>): Array<string> {
        var applicableRules = this.findApplicableRulesForCommentCategories(categories); 
        var postToFbGroups = applicableRules.map((item) => {
            var test = RuleOperation.Send; 
            if(item.Operation === RuleOperation.Send) {
                return item.FriendGroups; 
            }
        }).filter((item) => { 
            if (item !== undefined) {
                return true;
            }}); 

        var doNotPostToFbGroups = applicableRules.map((item) => {
            if(item.Operation === RuleOperation.DoNotSend) {
                return item.FriendGroups; 
            }
        }).filter((item) => { 
            if (item !== undefined) {
                return true;
            }});; 

        for(var i =0; i < doNotPostToFbGroups.length; ++i) {
                var idxGroup = doNotPostToFbGroups.indexOf(postToFbGroups[i]); 
                if (idxGroup > -1) {
                    postToFbGroups.splice(idxGroup,1); 
                }
        }
        return postToFbGroups; 
    }

    private findApplicableRulesForCommentCategories(categories: Array<string>): Array<RulePO> {
       return this.userSettings.Rules.filter((item) => {
            for(var i = 0; i < categories.length; ++i){
                return item.Category.indexOf(categories[i]) !== -1; 
            }
       }); 
    }
}

