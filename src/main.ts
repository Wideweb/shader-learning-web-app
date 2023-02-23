import 'codemirror/mode/clike/clike';
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/anyword-hint'

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/features/app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
