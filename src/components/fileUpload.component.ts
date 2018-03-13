import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import {DpbDropZoneDirective} from '../directives/dropZone.directive';
import { Subject } from 'rxjs/Subject';
import { DpbFile } from '../interfaces/dpbFile.interface';
import { DpbChangeZoneDirective } from '../directives/changeZone.directive';

@Component({
	selector: 'fileUpload',
	templateUrl: 'fileUpload.component.html',
	styleUrls: [ 'fileUpload.component.scss' ]
})
export class FileUploadComponent implements OnInit {

	@ViewChild(DpbDropZoneDirective)
	public dpbDropDirective: DpbDropZoneDirective;
	@ViewChild(DpbChangeZoneDirective)
	public dpbChangeDirective: DpbChangeZoneDirective;

	public onAddFiles$: Subject<any> = new Subject();
	public onChange$: Subject<any> = new Subject();
	private _files: Array<DpbFile> = new Array<DpbFile>();
	private _ele: HTMLElement;

	constructor(
		_ref: ElementRef
	) {
		this._ele = _ref.nativeElement;
		console.log('Fileupload works!');
	}

	ngOnInit() {
		this.dpbDropDirective.dragOver$.subscribe((e) => {
			this._ele.classList.add('dpb-dpz-onDragOver');
		});
		this.dpbDropDirective.dragLeave$.subscribe((e) => {
			this._ele.classList.remove('dpb-dpz-onDragOver');
		});

		this.dpbDropDirective.drop$.subscribe((files: Array<DpbFile>) => {
			this.onAddFiles$.next(files);
			this.onChange$.next(files);
			this.addFiles(files);
		});
		this.dpbChangeDirective.changedFiles$.subscribe((files: Array<DpbFile>) => {
			this.onAddFiles$.next(files);
			this.onChange$.next(files);
			this.addFiles(files);
		});
	}

	public addFiles(files: Array<DpbFile>): void {
		files.forEach((f: DpbFile) => {
			this._files.push(f);
		});
	}

	public deleteFile($index: number): void {
		this._files.splice($index, 1);
		this.onChange$.next(this._files);
	}

	public hasFiles(): boolean {
		return (this._files.length > 0);
	}

	public getFiles(): Array<DpbFile> {
		return this._files;
	}
}
