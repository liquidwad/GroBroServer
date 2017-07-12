import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';

import { AppComponent } from './app.component';

import { HomeComponent } from './components/pages/home.component';
import { RelayComponent } from './components/relays/relay.component';
import { RelaysComponent } from './components/relays/relays.component';
import { SensorComponent } from './components/sensors/sensor.component';
import { SensorsComponent } from './components/sensors/sensors.component';

/* Settings */
import { TempSettingsComponent } from './components/settings/temp-settings.component'; 

import { BroService } from './services/bro.service';

const config: SocketIoConfig = { url: 'https://grobroserver-liquidwad.c9users.io:8080', options: {} };

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'temperature', component: TempSettingsComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    
    /* Relays */
    RelayComponent,
    RelaysComponent,
    
    /* Sensors */
    SensorComponent,
    SensorsComponent,
    
    /* Settings */
    TempSettingsComponent,
    
    /* Pages */
    HomeComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      //{ enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    FormsModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [
    BroService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
