import { Component } from '@angular/core';
import { FacebookLoginService } from './services/FacebookLoginService';
import { SettingsService } from './services/SettingsService';

@Component({
  moduleId: module.id,
  selector: 'app',
  templateUrl: 'app.component.html',
  providers: [FacebookLoginService, SettingsService]
})
export class AppComponent { 
    private userFbAccessToken: string = null; 
    constructor(private userSettings: SettingsService,
                private fbService: FacebookLoginService) { 
    }

    public loginToFacebook(){
        this.userFbAccessToken = this.userSettings.getFbToken();
        if (!this.userFbAccessToken || this.userFbAccessToken === '') {
            this.fbService.loginToFacebook()
                .then((result) => {
                    this.userSettings.saveFbToken(result); 
                }); 
        }
    }
}
