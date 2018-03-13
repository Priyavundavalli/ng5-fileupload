import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './components/fileUpload.component';
import { DpbDropZoneDirective } from './directives/dropZone.directive';
import { DpbChangeZoneDirective } from './directives/changeZone.directive';
import { TruncatePipe } from './pipe/truncate.pipe';

@NgModule({
	imports: [CommonModule],
	exports: [FileUploadComponent],
	declarations: [FileUploadComponent, DpbDropZoneDirective, DpbChangeZoneDirective, TruncatePipe],
	providers: []
})
export class FileUploadModule {}
