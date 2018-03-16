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
		if ( value.length <= limit ) {
			return value;
		} else if ( completeWords && value.length > limit ) {
			limit = value.substr(0, 13).lastIndexOf(' ');
		} else if ( !completeWords && value.length > limit) {
			return value.substr(0, limit) + ellipsis;
		}
	}
}
