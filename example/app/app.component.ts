import { Component, ViewEncapsulation, ViewChild, OnInit, Sanitizer } from '@angular/core';
import { FileUploadComponent } from '../../src/components/fileUpload.component';
import { FileUploadService } from '../../src/services/fileupload.service';
import { Subscription } from 'rxjs/Subscription';
import { HttpEventType, HttpParams } from '@angular/common/http';
import { DpbResponse } from '../../src/interfaces/dpbResponse.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

	@ViewChild(FileUploadComponent)
	private _fileUp: FileUploadComponent;
	private _upProg: Subscription;

	constructor(
		private _filSer: FileUploadService
	) {

	}

	ngOnInit() {

		this._fileUp.setOptions({
			classes: {
				buttonAdd: 'ui right labeled green icon tiny button',
				buttonRemoveAll: 'ui button red tiny'
			},
			texts: {
				buttonAdd: 'Adicionar <i class="ui icon plus"></i>'
			}
		});

		this._filSer.onValidate$.subscribe((validation) => {
			console.log(validation.validation.tags);
			console.log(validation.individualValidation.info);
		});
		this._filSer.setMaxSize(3000027);
		this._filSer.setMaxSizePerFile(3000027);
		this._filSer.setExtensions(['exe']);
	}

	public sendFiles() {

		this._filSer.onComplete$.subscribe((e) => {
			console.log('COMPLETO!');
		});

		this._filSer.onProgress$.subscribe((e) => {
			console.log(e.percent + '%');
		});

		this._filSer.onError$.subscribe(() => {
			console.error('ERROUR!');
		});

		try {
			this._upProg = this._filSer.uploadFile(
				'https://hookb.in/ZB77kXQ2',
				this._fileUp.getFiles()
			).subscribe((response: DpbResponse) => {
				if ( response.type === HttpEventType.UploadProgress ) {
				} else if ( response.type === HttpEventType.Response ) {
					console.log('E acabou!');
				}
			});
		} catch (e) {
			console.error('Não foi possível enviar o arquivo');
			console.error(e);
		}
	}

	public abort() {
		this._upProg.unsubscribe();
	}
}
