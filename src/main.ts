import 'codemirror/mode/clike/clike';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/features/app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
