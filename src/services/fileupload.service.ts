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

/**
 * @author Marcelo Rafael <marcelo.rafael.feil@gmail.com>
 * @description Service to control file upload rule and functionalities.
 * 				With this service, is possible to change file extensions rules, general files size and
 * 				individual file size. You can observe if have any error or if any validation exception is
 * 				fired.
 * ** VALIDATION TAGS **
 * * LIMIT_EXCEEDED: when the quantity of files, exceed the specified number
 * * LIMIT_SIZE_EXCEEDED: when size of all files, exceed the size allowed
 * * FILES_NOT_FOUND: when there are not files in the queue.
 * * FILE_LIMIT_SIZE_EXCEEDED: when a specific file, exceed the allowed size.
 * * FILE_INVALID_EXTENSION: when a specifc file, has a invalid extension.
 */

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
	private _validations: DpbFilesValidation;
	private _individualValidations: DpbIndividualFileValidation;

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

				if ( f.size > this._rules.maxSizePerFile ) {
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
		this._validations = validation;
		this._individualValidations = individualValidation;

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

	/**
	 * @description if the number files selected for user, exceed the number configured here,
	 * a validaiton exception is fired and the request is canceled.
	 * @param max number with max files allowed
	 */
	public setMaxFiles(max: number) {
		this._rules.maxQuantity = max;
	}

	/**
	 * @description if the size of all files exceed the number especified here, the application
	 * fire an exception validate error and request is canceled.
	 * @param max number with general max size (KBytes) allowed.
	 */
	public setMaxSize(max: number) {
		this._rules.maxSize = max;
	}

	/**
	 * @description if the size of file, exceed the number especified here, the application
	 * fire an exception validate error and request is canceled.
	 * @param max number with individual max file size (KBytes) allowed.
	 */
	public setMaxSizePerFile(max: number) {
		this._rules.maxSizePerFile = max;
	}

	/**
	 * @description if the file extension there's not in array specified here, a
	 * validate exception is fired and the request is canceled.
	 * @param exts array with extensions (without point). Is not necessary pass
	 * extension in lower and uppercase, just lowercase.
	 */
	public setExtensions(exts: string[]) {
		this._rules.extensions = exts;
	}

	/**
	 * @returns an array of strings with allowed extensions.
	 */
	public getExtensions(): string[] {
		return this._rules.extensions;
	}

	/**
	 * @description method to returns the validation rules.
	 * @example
	 * // verify if there's any error in all or individual files. Returns true or false.
	 * validations().hasErrros();
	 * @example
	 * // verify if there's any error. This sub-method, returns true or false.
	 * validations().hasGeneralErrors();
	 * @example
	 * // verify if there's a specific error. This sub-method, returns true or false.
	 * validations().getError('NOT_FOUND');
	 * @example
	 * // verify if there are errors in especific files. Returns true or false.
	 * validations().hasIndividualErrors();
	 * @example
	 * // verify if there's a specific error in specifc file. Returns true or false.
	 * validations().get(0).getError('FILE_INVALID_EXTENSION');
	 * @example
	 * // returns an array with individual validation exceptions
	 * validations().getIndividualValidations();
	 */
	public validations(): Object {
		return {
			hasErrors: () => {
				const individualErrors: boolean = (this._individualValidations !== undefined && this._individualValidations.info.length > 0);
				const generalErrors: boolean = (this._validations !== undefined && this._validations.tags.length > 0);
				return ( individualErrors || generalErrors );
			},
			hasGeneralErrors: () => {
				return ( this._validations !== undefined && this._validations.tags.length > 0 );
			},
			getError: (key) => {
				return ( this._validations !== undefined && this._validations.tags.indexOf(key) >= 0 );
			},
			hasIndividualErrors: () => {
				return ( this._individualValidations !== undefined && this._individualValidations.info.length > 0 );
			},
			get: (key) => {
				if ( this._individualValidations.info[key] !== undefined ) {
					return {
						getError: (tag) => {
							return ( this._individualValidations.info[key].tags !== undefined && this._individualValidations.info[key].tags.indexOf(tag) >= 0 );
						}
					};
				}
			},
			getIndividualValidations: () => {
				return this._individualValidations.info;
			}
		};
	}
}
