/// <reference path="../../typings/globals/filewriter/index.d.ts" />
/// <reference path="../../typings/globals/filesystem/index.d.ts" />
/// <reference path="../../typings/globals/chrome/index.d.ts" />

import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http'; 
import {FacebookService, FacebookLoginResponse, FacebookInitParams} from 'ng2-facebook-sdk';

@Injectable()
export class FacebookLoginService {
    private access_token: any; 
    private clientId:string = '542796552575480'; 
    private clientSecret:string = "61a2c1d4e62ecce005d826e39a9dc8f6";
    private redirectUri:string ='https://' + chrome.runtime.id +
                                '.chromiumapp.org/provider_cb';
    private redirectRe:RegExp = new RegExp(this.redirectUri + '[#\?](.*)');

    constructor(private http: Http) { 
    }
    
    public loginToFacebook(): void {
        this.getToken(); 
    }

    public getFacebookAccessToken(): string {
        ///not implemented
        return "";
    }

    private parseRedirectFragment(fragment: string): {} {
        var pairs = fragment.split(/&/);
        var values = {};

        pairs.forEach(function(pair) {
            var nameval = pair.split(/=/);
            values[nameval[0]] = nameval[1];
        });

        return values;
    }

    private handleProviderResponse(values: any): void {
        this.setAccessToken(values.access_token);
    }

    private setAccessToken(token: any): void {
      this.access_token = token;
      //callback(null, access_token);
    }

    private getToken(): void {
        var options = {
          interactive: true,
          url:'https://www.facebook.com/dialog/oauth?client_id=' + this.clientId +
              '&reponse_type=token' +
              '&access_type=online' +
              '&redirect_uri=' + encodeURI(this.redirectUri) + 
              '&scope=read_custom_friendlists'
        }
        chrome.identity.launchWebAuthFlow(options, (redirectUri) => {
          if (chrome.runtime.lastError) {
            ///add error handling logic. 
            return;
          }

          var matches = redirectUri.match(this.redirectRe);
          if (matches && matches.length > 1) {
            this.handleProviderResponse(this.parseRedirectFragment(matches[1]));
          }
          else {
            console.error("There was an error with the response from facebook."); 
          }
        });
    }
}


