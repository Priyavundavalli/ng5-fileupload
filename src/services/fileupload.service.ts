import { Injectable } from '@angular/core';
import { DpbFile } from '../interfaces/dpbFile.interface';
import { Observable } from 'rxjs/Observable';
import {
	HttpRequest,
	HttpClient,
	HttpEvent,
	HttpEventType,
	HttpParams
} from '@angular/common/http';
import { DpbFilesCore } from '../core/files';

import { map, tap } from 'rxjs/operators';
import { DpbResponse } from '../interfaces/dpbResponse.interface';
import { Subject } from 'rxjs/Subject';
import { DpbFilesValidation, DpbIndividualFileValidation } from '../interfaces/dpbFileValidation.interface';
import { DpbFileUploadOptions } from '../interfaces/fileUploadOptions.interface';

@Injectable()
export class FileUploadService {

	public onComplete$: Subject<void> = new Subject();
	public onProgress$: Subject<DpbResponse> = new Subject<DpbResponse>();
	public onError$: Subject<any> = new Subject();
	public onInit$: Subject<DpbResponse> = new Subject<DpbResponse>();
	public onValidate$: Subject<{validation: DpbFilesValidation, individualValidation: DpbIndividualFileValidation}> = new Subject<any>();

	private _rules: {
		maxQuantity: number,
		maxSize: number,
		maxSizePerFile: number,
		extensions: string[]
	};

	private _inProgress: boolean;

	private _files: Array<File>;

	constructor(private _http: HttpClient) {
		this._rules = {
			maxQuantity: 5,
			maxSize: 3072,
			maxSizePerFile: 3072,
			extensions: ['jpg', 'pdf', 'png']
		};
		this._inProgress = false;
	}

	/**
	 * @description method that send files to end-point
	 * @param url api address
	 * @param files an array with files for upload
	 * @param params optional parameters for send to end-point
	 */
	public uploadFile(url, files: Array<DpbFile>, params?: HttpParams): Observable<any> {
		this._files = DpbFilesCore.parseToFileArray(files);

		if ( !this.isValid() ) {
			return;
		}

		if ( this._inProgress ) {
			return;
		}

		this._inProgress = true;

		const formData: FormData = new FormData();
		this._files.forEach((f) => {
			formData.append('upload[]', f, f.name);
		});

		if ( params !== undefined && params !== null ) {
			params.keys().forEach((index) => {
				formData.append(index, params.get(index));
			});
		}

		const req = new HttpRequest('POST', url, formData, {
			reportProgress: true
		});

		return this._http
			.request(req)
			.pipe(
				map((event, index) =>
					this.getEventMessage(event, this._files, index)
				),
				tap(
					message => this.showProgress(message),
					err => this.showError(err),
					() => this.showComplete()
				)
			);
	}

	private isValid(): boolean {
		let isValid = true;
		const validation: DpbFilesValidation = {
			operation: 'onSend',
			tags: []
		};
		const individualValidation: DpbIndividualFileValidation = {
			operation: 'onSend',
			info: []
		};

		if ( this._files !== undefined ) {
			if ( this._files.length > this._rules.maxQuantity ) {
				validation.tags.push('LIMIT_EXCEEDED');
			}

			let size = 0;

			this._files.forEach((f: File) => {
				size = f.size + size;
				const tags: string[] = [];

				const splName: string[] = f.name.split('.');
				const ext: string = splName[splName.length - 1].toLowerCase();

				if ( (f.size / 1024) > this._rules.maxSizePerFile ) {
					tags.push('FILE_LIMIT_SIZE_EXCEEDED');
				}
				if ( this._rules.extensions.indexOf(ext) < 0 ) {
					tags.push('FILE_INVALID_EXTENSION');
				}

				if ( tags.length > 0 ) {
					individualValidation.info.push({
						name: f.name,
						tags: tags
					});
				}
			});
			size = size / 1024;

			if ( size > this._rules.maxSize ) {
				validation.tags.push('LIMIT_SIZE_EXCEEDED');
			}
		} else {
			validation.tags.push('FILES_NOT_FOUND');
		}

		if ( validation.tags.length > 0 || individualValidation.info.length > 0 ) {
			isValid = false;

			this.onValidate$.next({validation, individualValidation});
		}

		return isValid;
	}

	/**
	 * @description method that returns status of request.
	 * @param event event type
	 * @param file array of files
	 * @param index times that it is called
	 */
	public getEventMessage(event: HttpEvent<any>, file: Array<File>, index): DpbResponse {
		if (event.type === HttpEventType.UploadProgress) {
			const percentDone = Math.round(100 * event.loaded / event.total);

			const res: DpbResponse = {
				type: HttpEventType.UploadProgress,
				percent: percentDone,
				complete: false
			} as DpbResponse;

			this.onProgress$.next(res);
			return res;
		} else if ( event.type === HttpEventType.Sent ) {
			const res: DpbResponse = {
				type: HttpEventType.Sent,
				percent: null,
				complete: false
			} as DpbResponse;

			this.onInit$.next(res);
			return res;
		} else if ( event.type === HttpEventType.Response ) {
			return {
				type: HttpEventType.Response,
				percent: null,
				complete: true
			} as DpbResponse;
		} else {
			return {
				type: event.type,
				percent: null,
				complete: null
			} as DpbResponse;
		}
	}

	/**
	 * @description method that shows the message progress
	 * @param message message that's returned of request callback.
	 */
	public showProgress(message: any) {
	}

	/**
	 * @description method that returns an error event.
	 * @param err parameter that's returned as callback parameter of the
	 * request event.
	 */
	public showError(err: any) {
		this.onError$.next(err);
	}

	/**
	 * @description method that fire a complete event when the request is done.
	 */
	public showComplete() {
		this.onComplete$.next();
		this._inProgress = true;
	}

	public setMaxFiles(max: number) {
		this._rules.maxQuantity = max;
	}

	public setMaxSize(max: number) {
		this._rules.maxSize = max;
	}

	public setMaxSizePerFile(max: number) {
		this._rules.maxSizePerFile = max;
	}

	public setExtensions(exts: string[]) {
		this._rules.extensions = exts;
	}
}
