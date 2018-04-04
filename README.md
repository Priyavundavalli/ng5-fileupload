# Getting started
Install ng5-fileupload via:

`npm install --save ng5-file-upload`

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