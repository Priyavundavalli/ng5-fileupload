import { HttpEventType } from '@angular/common/http';

export interface DpbResponse {
	type: HttpEventType;
	complete: boolean;
	percent: number;
	response: any;
}
