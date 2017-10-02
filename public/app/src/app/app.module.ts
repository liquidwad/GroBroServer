import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { DndModule } from 'ng2-dnd';
import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
import { D3Service } from 'd3-ng2-service';

import { AppComponent } from './app.component';

import { HomeComponent } from './components/pages/home.component';
import { RelayComponent } from './components/relays/relay.component';
import { RelaysComponent } from './components/relays/relays.component';
import { SensorComponent } from './components/sensors/sensor.component';
import { SensorsComponent } from './components/sensors/sensors.component';
import { RulesComponent } from './components/rules/rules.component';
import { AddRulesComponent } from './components/rules/add-rules.component';
import { EditRulesComponent } from './components/rules/edit-rules.component';
import { GroupComponent } from './components/rules/group.component';

/* PIPES */
import { ConditionFilter } from './pipes/condition-filter.pipe';

/* Settings */
import { SettingsComponent } from './components/settings/settings.component'; 
import { LedSettingsComponent } from './components/settings/led-settings.component';

/* Services */
import { BroService } from './services/bro.service';

const config: SocketIoConfig = { url: 'https://grobroserver-liquidwad.c9users.io:8080', options: {} };

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'rules', component: RulesComponent }
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
    SettingsComponent,
    LedSettingsComponent,
    
    /* Pages */
    HomeComponent,
    RulesComponent,
    AddRulesComponent,
    EditRulesComponent,
    GroupComponent,
    
    ConditionFilter
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      //{ enableTracing: true } // <-- debugging purposes only
    ),
    ModalModule.forRoot(),
    BootstrapModalModule,
    BrowserModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    DndModule.forRoot()
  ],
  providers: [
    BroService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
