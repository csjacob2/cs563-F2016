import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, JsonpModule } from '@angular/http';
import { AppComponent }   from './app.component';
import { HomeComponent }   from './components/home/home.component';
import { SettingsComponent }   from './components/settings/settings.component';
import { Ng2BootstrapModule, AlertModule, TabsModule } from 'ng2-bootstrap/ng2-bootstrap';
import { SelectModule } from 'ng2-select/ng2-select';

@NgModule({
    imports:[BrowserModule,
             HttpModule,
             Ng2BootstrapModule,
             AlertModule,
             TabsModule,
             SelectModule],
    declarations:[AppComponent,
                  HomeComponent,
                  SettingsComponent],
    bootstrap:[AppComponent]
})
export class AppModule { }
