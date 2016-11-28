import { Component } from '@angular/core';
import { Http, Headers } from '@angular/http'; 
import { FacebookLoginService } from '../../services/FacebookLoginService';
import { ClassifierService } from '../../services/ClassifyService';
import { Observable } from 'rxjs';

@Component({
  moduleId: module.id,
  selector: 'app-home',
  templateUrl: 'home.component.html',
  providers: [FacebookLoginService, ClassifierService]
})
export class HomeComponent {
    public assignedCategories: Array<string>; 
    public assignedFBGroups: Array<string>;
    public userComment: string; 

    constructor(private fbService: FacebookLoginService, private classifier: ClassifierService) { 
    }

    public analyzeComent(): void {
        if (this.userComment !== undefined && this.userComment !== '') {
            this.classifier.classifyComment(this.userComment)
                .subscribe((results) => {
                    this.assignedCategories = results; 
                }); 
        }
    }

    public loginToFacebook(): void {
        this.fbService.loginToFacebook(); 
    } 
}

