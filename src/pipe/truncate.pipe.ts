import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
	transform(
		value: string,
		limit: number = 25,
		completeWords: boolean = false,
		ellipsis: string = '...'
	) {
		if (completeWords && value.length > limit) {
			limit = value.substr(0, limit).lastIndexOf(' ');
		} else {
			return value;
		}
		return value.substr(0, limit) + ellipsis;
	}
}
