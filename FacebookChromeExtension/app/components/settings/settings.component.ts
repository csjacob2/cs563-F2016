import { Component } from '@angular/core';
import { Http, Headers } from '@angular/http'; 
import { FacebookLoginService } from '../../services/FacebookLoginService'

@Component({
  selector: 'app-settings',
  templateUrl: '/components/settings/settings.component.html',
  providers: [FacebookLoginService]
})
export class SettingsComponent {
    constructor(private fbService: FacebookLoginService) { 
    }

    public loginToFacebook(): void {
        this.fbService.loginToFacebook(); 
    } 
}

