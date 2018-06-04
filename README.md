# Getting started
Install ng5-fileupload via:

`npm install --save ng5-fileupload`

Once installed, you need to import our main module:

`import { FileUploadModule } from 'ng5-fileupload';`

After imported the file module, is necessary to increase the module in imports place in the app.module.

```
import { FileUploadModule } from 'ng5-fileupload';

@NgModule({
    declarations: [ AppComponent, ... ],
    imports: [ FileUploadModule, ... ],
    bootstrap: [ AppComponent ]
})
export class AppModule {
}
```

# Integration

After followed the installation, the next step is integrate the component in your project.

For a basic integration, is just necessary call `fielupload` in your template file. Follow it:
```
<fileupload></fileupload>
```
With this tags, the component will appear on page with available features: Drag n' drop and explorer window to select files.

## FileUploadComponent
You can call the component of FileUpload within other file angular component for have access of all methods available in it component. For it, you need call the FileUpload in your angular component:
```
import { FileUploadComponent } from 'ng5-fileupload';
export class AppComponent implements OnInit {
	@ViewChild(FileUploadComponent)
	private _fileUploadCmp: FileUploadComponent;
	...
}
```

# FileUploadService

With this service, you will control some functionalities of FileUpload component. First is necessary inject this service in your angular component:
```
{ FileUploadServices } from 'ng5-fileupload';
...
export class AppComponent implements OnInit {
	constructor(
		public filSer: FileUploadService
	) {
		...
	}
}
```

## Extensions
With FileUploadService, you can set allowed extensions. When the request is fired, the component will check configured rules and than, case the files doesn't respect this rules, the component will fire a validation exception.
The extensions rules, can be setted like this:
```
this.filSer.setExtensions(['jpg', 'png', 'pdf']);
```

Note that you can spend an array with all desired extensions. But note too, that the extensions there not have a point in their beginning. You need spend just the extension abbreviation like the above example.

## Max files
You can restrict the number of files that the use can choose:
```
this.fileSer.setMaxFiles(5);
```
Therefore, the component will not allow more than 5 files.

## Max size
You can specify the general max size. With this, the component will calculate total size of all files added to upload and than, case the result to be more than max size, a validation exception will be fired.

Is necessary to spend the value as KBytes:
```
this.filSer.setMaxSize(3072);
```

## Max size per file
You can especify the max size per file. The value is the size in KBytes:
```
this.filSer.setMaxSizePerFile(3072);
```
Independ of you setted a value with `setMaxSize()`, the component will to respect both rules.

## Validations
Now, we need to show to user, the validation exceptions, right?
For this, we will use the method `validations()`. This method, has some sub-methods:
* hasErrors(): returns a boolean if there are any validation exception;
* hasGeneralErrors(): when is not because an especifc file. Example: Max size exception;
* hasIndividualErrors(): when there are individual erros. Example: invalid extesion;
* getError(key: string): use to verify if there is an specifc general error;
* get(key: number): use to access the key of the invalid file. Within this method, there is an other method, `getError(key: string)` with same purpose of above method;
* getIndividualValidations(): use to returns all files with individual validation exception.

### Show validation messages
```
<ul *ngIf="filSer.validations().hasErrors()">
	<li *ngIf="filSer.validations().getError("LIMIT_EXCEEDED")">
		The max allowed quantity of files, was exceeded.
	</li>
	<li *ngIf="filSer.validations().getError("LIMIT_SIZE_EXCEEDED")">
		The max size allowed, was exceeded.
	</li>
	<li *ngIf="filSer.validations().getError("FILES_NOT_FOUND")">
		You need to attach files.
	</li>
	<ng-container *ngFor="let item of filSer.validations().getIndividualValidations(); let i = index;">
		<li *ngIf="filSer.validations().get(i).getError("FILE_LIMIT_SIZE_EXCEEDED")">
			The file {{item.name}} exceeded the max file size allowed.
		</li>	
		<li *ngIf="filSer.validations().get(i).getError("FILE_INVALID_EXTENSION")">
			The file {{item.name}} has invalid extension.
		</li>	
	</ng-container>
</ul>
```
