import { Component } from '@angular/core';
import { Http, Headers } from '@angular/http'; 
import { FacebookLoginService } from '../../services/FacebookLoginService'

@Component({
  selector: 'app-home',
  templateUrl: '/components/home/home.component.html',
  providers: [FacebookLoginService]
})
export class HomeComponent {
    constructor(private fbService: FacebookLoginService) { 
    }

    public loginToFacebook(): void {
        this.fbService.loginToFacebook(); 
    } 
}

