import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FileUploadModule } from '../../src';

@NgModule({
	imports: [BrowserModule, FileUploadModule],
	declarations: [AppComponent],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}
