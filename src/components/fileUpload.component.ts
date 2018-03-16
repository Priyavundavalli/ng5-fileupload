import {
	Component,
	ViewChild,
	ViewChildren,
	OnInit,
	ElementRef,
	QueryList,
	AfterViewInit
} from '@angular/core';
import { DpbDropZoneDirective } from '../directives/dropZone.directive';
import { Subject } from 'rxjs/Subject';
import { DpbFile } from '../interfaces/dpbFile.interface';
import { DpbChangeZoneDirective } from '../directives/changeZone.directive';
import { DpbFileUploadOptions } from '../interfaces/fileUploadOptions.interface';

@Component({
	selector: 'fileUpload',
	templateUrl: 'fileUpload.component.html',
	styleUrls: ['fileUpload.component.scss']
})
export class FileUploadComponent implements OnInit, AfterViewInit {
	@ViewChild(DpbDropZoneDirective)
	public dpbDropDirective: DpbDropZoneDirective;
	@ViewChildren(DpbChangeZoneDirective)
	public dpbChangeDirective: QueryList<DpbChangeZoneDirective>;

	public onAddFiles$: Subject<any> = new Subject();
	public onChange$: Subject<any> = new Subject();
	private _files: Array<DpbFile> = new Array<DpbFile>();
	private _ele: Element;
	private _ele_fileUpload: HTMLElement;

	private _options: DpbFileUploadOptions;

	constructor(_ref: ElementRef) {
		this._ele_fileUpload = _ref.nativeElement;
		this._options = {
			classes: {
				fileUpload: '',
				placeholder: '',
				placeholderSub: '',
				placeholderOnDragOver: '',
				onDragOver: '',
				fileUploadList: '',
				fileUploadListHeader: '',
				fileUploadListBody: '',
				fileUploadListItem: '',
				buttonAdd: '',
				buttonRemoveAll: '',
				buttonRemove: '',
				actionContent: ''
			},
			texts: {
				placeholder: 'Arraste e solte os arquivos aqui',
				placeholderSub: 'ou clique aqui para selecionar os arquivos.',
				placeholderOnDragOver: 'Solte os arquivos.',
				columnIcon: '',
				columnName: 'Nome',
				columnSize: 'Tamanho',
				columnOptions: '',
				buttonAdd: 'Adicionar Arquivos',
				buttonRemove: 'x',
				buttonRemoveAll: 'Apagar Todos',
				inputFileTitle: 'Clique ou arraste os arquivos para cá.',
				inputButtonAddTitle: 'Clique para adicionar arquivos.'
			}
		};
	}

	ngOnInit() {
		this._ele = this._ele_fileUpload.querySelector('.dpb-fileupload');

		this.dpbDropDirective.dragOver$.subscribe(e => {
			this._ele.classList.add('dpb-dpz-onDragOver');
		});
		this.dpbDropDirective.dragLeave$.subscribe(e => {
			this._ele.classList.remove('dpb-dpz-onDragOver');
		});

		this.dpbDropDirective.drop$.subscribe((files: Array<DpbFile>) => {
			this.onAddFiles$.next(files);
			this.onChange$.next(files);
			this.addFiles(files);
			this._ele.classList.remove('dpb-dpz-onDragOver');
		});
	}

	ngAfterViewInit() {
		this.dpbChangeDirective.forEach(c => {
			c.changedFiles$.subscribe((files: Array<DpbFile>) => {
				this.onAddFiles$.next(files);
				this.onChange$.next(files);
				this.addFiles(files);
			});
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
		return this._files.length > 0;
	}

	public getFiles(): Array<DpbFile> {
		return this._files;
	}

	public deleteAllFiles() {
		this._files = new Array<DpbFile>();
	}

	public setOptions(opts: DpbFileUploadOptions) {
		const obj = Object.keys(opts);

		Object.keys(opts).forEach((i) => {
			Object.keys(opts[i]).forEach((k) => {
				if (this._options[i][k] !== undefined) {
					this._options[i][k] = opts[i][k];
				}
			});
		});
	}

	public getOptions(): DpbFileUploadOptions {
		return this._options;
	}
}
