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

    public postComment(): void {
        this.assignedCategories = []; 
        this.assignedFBGroups = []; 
        this.userComment = ''; 
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
            if(<any>RuleOperation[item.Operation] === RuleOperation.Send) {
                return item.FriendGroups; 
            }
        });

        postToFbGroups = postToFbGroups.filter((item, pos) => { 
            if (item !== undefined && postToFbGroups.indexOf(item) === pos) {
                return true;
            }}); 

        var doNotPostToFbGroups = applicableRules.map((item) => {
            if(<any>RuleOperation[item.Operation] === RuleOperation.DoNotSend) {
                return item.FriendGroups; 
            }
        });  

        doNotPostToFbGroups = doNotPostToFbGroups.filter((item, pos) => { 
            if (item !== undefined && doNotPostToFbGroups.indexOf(item) === pos) {
                return true;
            }}); 

        for(var i =0; i < doNotPostToFbGroups.length; ++i) {
                var idxGroup = postToFbGroups.indexOf(doNotPostToFbGroups[i]); 
                if (idxGroup > -1) {
                    postToFbGroups.splice(idxGroup,1); 
                }
        }
        return postToFbGroups; 
    }

    private findApplicableRulesForCommentCategories(categories: Array<string>): Array<RulePO> {
       return this.userSettings.Rules.filter((item) => {
            for(var i = 0; i < categories.length; ++i){
                 if (item.Category.indexOf(categories[i]) !== -1){
                     return true; 
                 } 
            }
            return false; 
       }); 
    }
}

