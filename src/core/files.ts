import { DpbFile } from '../interfaces/dpbFile.interface';

export class DpbFilesCore {
	private static _files: Array<DpbFile>;

	public static parse(files: FileList): Array<DpbFile> {
		DpbFilesCore._files = new Array<DpbFile>();
		for ( let i = 0; i < files.length; i ++ ) {
			const file: File = files.item(i);

			const splExt: string[] = file.name.split('.');
			const ext: string = splExt[splExt.length - 1];

			const dpbFile: DpbFile = {
				name: file.name,
				extension: ext,
				size: DpbFilesCore.countSize(file.size),
				file: file
			};

			this._files.push(dpbFile);
		}
		return this._files;
	}

	public static countSize(size: number): string {
		let sizeType: string;
		sizeType = 'Bytes';

		if ( size >= 1024 ) {
			size = size / 1024;
			sizeType = 'KB';
		}
		if ( size >= 1024 ) {
			size = size / 1024;
			sizeType = 'MB';
		}
		if ( size >= 1024 ) {
			size = size / 1024;
			sizeType = 'GB';
		}
		if ( size >= 1024 ) {
			size = size / 1024;
			sizeType = 'TB';
		}

		size = Math.round(size);
		return size.toString() + sizeType;
	}

	public static parseToFileArray(files: Array<DpbFile>): Array<File> {
		const fileArray: Array<File> = new Array();

		files.forEach((f, index) => {
			fileArray.push(f.file);
		});

		return fileArray;
	}
}
