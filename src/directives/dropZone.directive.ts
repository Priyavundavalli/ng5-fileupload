import { Directive, OnInit, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DpbFile } from '../interfaces/dpbFile.interface';
import { DpbFilesCore } from '../core/files';

@Directive({
	selector: '[dpbDropZone]'
})
export class DpbDropZoneDirective implements OnInit {

	private _ele: HTMLElement;
	public dragOver$: Subject<any> = new Subject();
	public dragLeave$: Subject<any> = new Subject();
	public drop$: Subject<any> = new Subject();
	private files: Array<DpbFile>;

	constructor(
		_ref: ElementRef
	) {
		this._ele = _ref.nativeElement;
	}

	ngOnInit() {
		this._ele.addEventListener('dragover', (e) => this.dragOver(e));
		this._ele.addEventListener('dragleave', (e) => this.dragLeave(e));
		this._ele.addEventListener('drop', (e) => this.drop(e));
	}

	private dragOver(e): void {
		e.stopPropagation();
		e.preventDefault();

		e.dataTransfer.dropEffect = 'copy';
		this.dragOver$.next(e.dataTransfer);
	}

	private dragLeave(e): void {
		this.dragLeave$.next(e.dataTransfer);
	}

	private drop(e): void {
		e.stopPropagation();
		e.preventDefault();

		try {
			const files: FileList = e.dataTransfer.files;
			this.files = DpbFilesCore.parse(files);
			this.drop$.next(this.files);
		} catch (e) {
			console.error('Não foi possível concluir a operação.');
			console.error(e);
		}
	}
}
