import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, JsonpModule } from '@angular/http';
import { AppComponent }   from './app.component';
import { HomeComponent }   from './components/home/home.component';
import { Ng2BootstrapModule, AlertModule, TabsModule } from 'ng2-bootstrap/ng2-bootstrap';

@NgModule({
    imports:[BrowserModule,
             HttpModule,
             Ng2BootstrapModule,
             AlertModule,
             TabsModule],
    declarations:[AppComponent,
                  HomeComponent],
    bootstrap:[AppComponent]
})
export class AppModule { }
