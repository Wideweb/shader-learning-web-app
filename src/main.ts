import 'codemirror/mode/clike/clike';
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/anyword-hint'

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/features/app/app.module';

import {marked} from 'marked';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

function sanitize(str: String) {
  return str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
}

marked.use({
  renderer: {
    image(src, title, alt) {
      const width = title?.split(" ")?.find(it => it.startsWith("w:"))?.slice(2);
      const height = title?.split(" ")?.find(it => it.startsWith("h:"))?.slice(2)

      let out = `<img class="markdown-image" `;
      out += `src="${sanitize(src!)}" `;
      out += `alt="${sanitize(alt)}" `;

      if (width || height) {
        out += `style="`

        if (width) {
          out += `max-width:${sanitize(width)};`;
        }

        if (height) {
          out += `max-height:${sanitize(height)};`
        }

        out += `" `;
      }

      out += `>`;

      if (alt) {
        out += `<p class="markdown-image-alt">${sanitize(alt)}</p>`
      }
      
      return out;
    }
  }
})
