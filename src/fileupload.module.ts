import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './components/fileUpload.component';
import { DpbDropZoneDirective } from './directives/dropZone.directive';
import { DpbChangeZoneDirective } from './directives/changeZone.directive';
import { TruncatePipe } from './pipe/truncate.pipe';
import { FileUploadService } from './services/fileupload.service';
import { HttpClientModule } from '@angular/common/http';
import { SafePipe } from './pipe/safe.pipe';

@NgModule({
	imports: [CommonModule, HttpClientModule],
	exports: [FileUploadComponent, DpbChangeZoneDirective],
	declarations: [
		FileUploadComponent,
		DpbDropZoneDirective,
		DpbChangeZoneDirective,
		TruncatePipe,
		SafePipe
	],
	providers: [FileUploadService]
})
export class FileUploadModule {}
