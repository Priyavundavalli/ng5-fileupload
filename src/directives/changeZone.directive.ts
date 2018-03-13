import { Directive, ElementRef, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DpbFile } from '../interfaces/dpbFile.interface';
import { DpbFilesCore } from '../core/files';

@Directive({
	selector: '[dpbChangeZone]'
})
export class DpbChangeZoneDirective implements OnInit {

	private _ele: HTMLInputElement;
	public changedFiles$: Subject<Array<DpbFile>> = new Subject();

	constructor(
		private _ref: ElementRef
	) {
		this._ele = _ref.nativeElement;
	}

	ngOnInit() {
		this._ele.addEventListener('change', (e) => {
			this.changedFiles$.next(DpbFilesCore.parse(this._ele.files));
		});
	}

}
