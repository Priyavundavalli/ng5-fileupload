export interface DpbIndividualFileValidation {
	operation: string;
	info: FileValidationInfo[];
}

export interface DpbFilesValidation {
	operation: string;
	tags: String[];
}

export interface FileValidationInfo {
	name: string;
	tags: String[];
}
