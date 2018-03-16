import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FileUploadModule } from '../../src';
import { FileUploadService } from '../../src/services/fileupload.service';

@NgModule({
	imports: [BrowserModule, FileUploadModule],
	declarations: [AppComponent],
	providers: [ FileUploadService ],
	bootstrap: [AppComponent]
})
export class AppModule {}
