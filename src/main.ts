import 'codemirror/mode/clike/clike';
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/anyword-hint'

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/features/app/app.module';
import * as CodeMirror from 'codemirror';

function scriptHint(editor: any, keywords: any, getToken: any, options: any) {
  // Find the token at the cursor
  var cur = editor.getCursor(), token = getToken(editor, cur);
  // if (/\b(?:string|comment)\b/.test(token.type)) return;
  // var innerMode = CodeMirror.innerMode(editor.getMode(), token.state);
  // token.state = innerMode.state;

  // // If it's not a 'word-style' token, ignore the token.
  // if (!/^[\w$_]*$/.test(token.string)) {
  //   token = {start: cur.ch, end: cur.ch, string: "", state: token.state,
  //            type: token.string == "." ? "property" : null};
  // } else if (token.end > cur.ch) {
  //   token.end = cur.ch;
  //   token.string = token.string.slice(0, cur.ch - token.start);
  // }

  // var tprop = token;
  // // If it is a property, find out what it is a property of.
  // while (tprop.type == "property") {
  //   tprop = getToken(editor, CodeMirror.Pos(cur.line, tprop.start));
  //   if (tprop.string != ".") return;
  //   tprop = getToken(editor, CodeMirror.Pos(cur.line, tprop.start));
  //   if (!context) var context = [];
  //   context.push(tprop);
  // }
  return {
    list: ['vec2', 'vec3'],
    from: CodeMirror.Pos(cur.line, token.start),
    to: CodeMirror.Pos(cur.line, token.end)
  };
}

function javascriptHint(editor: any, options: any) {
  console.log(editor);
  console.log(options);
  return scriptHint(editor, ['vec', 'vec2', 'vec3'], (e: any, cur: any) => e.getTokenAt(cur), options);
};

// CodeMirror.registerHelper("hint", "clike", javascriptHint);
// CodeMirror.registerHelper("hint", "x-shader/x-fragment", javascriptHint);

var WORD = /[\w$]+/, RANGE = 500;

  // CodeMirror.registerHelper("hint", "anyword", (editor: any, options: any) => {
  //   var word = options && options.word || WORD;
  //   var range = options && options.range || RANGE;
  //   var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
  //   var end = cur.ch, start = end;
  //   while (start && word.test(curLine.charAt(start - 1))) --start;
  //   var curWord = start != end && curLine.slice(start, end);

  //   var list = options && options.list || [], seen: any = {};
  //   var re = new RegExp(word.source, "g");
  //   for (var dir = -1; dir <= 1; dir += 2) {
  //     var line = cur.line, endLine = Math.min(Math.max(line + dir * range, editor.firstLine()), editor.lastLine()) + dir;
  //     for (; line != endLine; line += dir) {
  //       var text = editor.getLine(line), m: any;
  //       while (m = re.exec(text)) {
  //         if (line == cur.line && m[0] === curWord) continue;
  //         if ((!curWord || m[0].lastIndexOf(curWord, 0) == 0) && !Object.prototype.hasOwnProperty.call(seen, m[0])) {
  //           seen[m[0]] = true;
  //           list.push(m[0]);
  //         }
  //       }
  //     }
  //   }
  //   return {list: list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
  // });

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
