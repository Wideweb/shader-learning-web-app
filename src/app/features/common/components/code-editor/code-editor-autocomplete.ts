import * as CodeMirror from "codemirror";

const HINTS: CodeMirror.Hint[] = [
    { text: 'vec2', displayText: 'vec2(float x, float y): vec2' },
    { text: 'vec3', displayText: 'vec3(float x, float y, float z): vec3' },
    { text: 'vec4', displayText: 'vec4(float x, float y, float z, float w): vec4' },
  
    { text: 'ivec2', displayText: 'ivec2(int x, int y): ivec2' },
    { text: 'ivec3', displayText: 'ivec3(int x, int y, int z): ivec3' },
    { text: 'ivec4', displayText: 'ivec4(int x, int y, int z, int w): ivec4' },
  
    { text: 'bvec2', displayText: 'bvec2(bool x, bool y): bvec2' },
    { text: 'bvec3', displayText: 'bvec3(bool x, bool y, bool z): bvec3' },
    { text: 'bvec4', displayText: 'bvec4(bool x, bool y, bool z, bool w): bvec4' },
  
    { text: 'mat2', displayText: 'mat2(vec2 column1, vec2 column2): mat2' },
    { text: 'mat3', displayText: 'mat3(vec3 column1, vec3 column2, vec3 column3): mat3' },
    { text: 'mat4', displayText: 'mat4(vec4 column1, vec4 column2, vec4 column3, vec4 column4): mat4' },
  
    { text: 'bvec3', displayText: 'bvec3(bool x, bool y, bool z): bvec3' },
    { text: 'bvec4', displayText: 'bvec4(bool x, bool y, bool z, bool w): bvec4' },
  
    { text: 'radians', displayText: 'radians(T degrees): T' },
    { text: 'degrees', displayText: 'degrees(T radians): T' },
    { text: 'sin', displayText: 'sin(T radians): T' },
    { text: 'cos', displayText: 'sin(T radians): T' },
    { text: 'tan', displayText: 'sin(T radians): T' },
    { text: 'asin', displayText: 'asin(T x): radians' },
    { text: 'acos', displayText: 'acos(T x): radians' },
    { text: 'atan', displayText: 'atan(T x): radians' },
    { text: 'abs', displayText: 'abs(T x): T' },
    { text: 'pow', displayText: 'pow(T base, T exponent): T' },
    { text: 'exp', displayText: 'exp(T x): e^x' },
    { text: 'log', displayText: 'log(T x): T' },
    { text: 'exp2', displayText: 'exp2(T x): 2^x' },
    { text: 'sqrt', displayText: 'sqrt(T x): T' },
    { text: 'inversesqrt', displayText: 'inversesqrt(T x): T' },
    { text: 'sign', displayText: 'sign(T x): T' },
    { text: 'floor', displayText: 'floor(T x): T' },
    { text: 'fract', displayText: 'fract(T x): T' },
    { text: 'ceil', displayText: 'ceil(T x): T' },
    { text: 'mod', displayText: 'mod(T x, T y): T' },
    { text: 'min', displayText: 'min(T x, T y): T' },
    { text: 'max', displayText: 'max(T x, T y): T' },
    { text: 'mix', displayText: 'mix(T start, T end, T weight): T' },
    { text: 'step', displayText: 'step(T edge, T x): T' },
    { text: 'smoothstep', displayText: 'smoothstep(T edge0, T edge1, T x): T' },
    { text: 'clamp', displayText: 'clamp(T x, T min, T max): T' },
    { text: 'length', displayText: 'length(T x): float' },
    { text: 'distance', displayText: 'length(T p0, T p1): float' },
    { text: 'dot', displayText: 'dot(T v0, T v1): float' },
    { text: 'cross', displayText: 'cross(vec3 v0, vec3 v1): vec3' },
    { text: 'normalize', displayText: 'normalize(T v): T' },
    { text: 'reflect', displayText: 'reflect(T v, T normal): T' },
    { text: 'refract', displayText: 'refract(T v, T normal, float eta): T' },
    { text: 'matrixCompMult', displayText: 'matrixCompMult(mat m0, mat m1): mat' },
    { text: 'lessThan', displayText: 'lessThan(vec v0, vec v1): bvec' },
    { text: 'lessThanEqual', displayText: 'lessThanEqual(vec v0, vec v1): bvec' },
    { text: 'greaterThan', displayText: 'greaterThan(vec v0, vec v1): bvec' },
    { text: 'greaterThanEqual', displayText: 'greaterThanEqual(vec v0, vec v1): bvec' },
    { text: 'equal', displayText: 'equal(vec v0, vec v1): bvec' },
    { text: 'notEqual', displayText: 'notEqual(vec v0, vec v1): bvec' },
    { text: 'any', displayText: 'any(bvec v): bool' },
    { text: 'all', displayText: 'all(bvec v): bool' },
    { text: 'not', displayText: 'not(bvec v): bvec' },
    { text: 'texture', displayText: 'texture(sampler2D sampler, vec2 p, [float bias]): vec4' },
    { text: 'dFdx', displayText: 'dFdx(T value): T' },
    { text: 'dFdy', displayText: 'dFdy(T value): T' },
    { text: 'fwidth', displayText: 'fwidth(T value): T' },
  
    { text: 'sampler2D', displayText: 'sampler2D' },
    { text: 'uniform', displayText: 'uniform' },
    { text: 'gl_FragCoord', displayText: 'gl_FragCoord: vec4' },

    { text: 'bool', displayText: 'bool' },
    { text: 'float', displayText: 'float' },
    { text: 'int', displayText: 'int' },
];

class Node {
    public char: string | null = null;

    public children: Node[] = [];

    public complete: boolean = false;

    public hint: CodeMirror.Hint | null = null;
}

class Tree {
    public root: Node = new Node();

    public addHint(hint: CodeMirror.Hint) {
        this.add(this.root, hint, 0);
    }

    private add(node: Node, hint: CodeMirror.Hint, index: number) {
        if (index >= hint.text.length) {
            node.hint = hint;
            node.complete = true;
            return;
        }

        const child = node.children.find(c => c.char == hint.text[index]);
        if (!child) {
            const newNode = new Node();
            newNode.char = hint.text[index];
            node.children.push(newNode);
            this.add(newNode, hint, index + 1);
            return;
        }

        this.add(child, hint, index + 1);
    }

    public find(word: string): CodeMirror.Hint[] {
        const result: CodeMirror.Hint[] = [];

        const node = this.findNode(this.root, word, 0);
        if (node == null) {
            return [];
        }

        this.collect(node, result);
        return result;
    }

    private findNode(node: Node, word: string, index: number): Node | null {
        if (index == word.length) {
            return node;
        }

        for (const child of node.children) {
            if (child.char == word[index]) {
                return this.findNode(child, word, index + 1);
            }
        }
        return null
    }

    private collect(node: Node, result: CodeMirror.Hint[]) {
        if (node.complete) {
            result.push(node.hint!);
        }

        for (const child of node.children) {
            this.collect(child, result);
        }
    }
}

export class CodeEditorAutocomplete {

    private tree = new Tree();

    public constructor() {
        HINTS.forEach(hint => this.tree.addHint(hint));
    }
    
    public showHints(editor: CodeMirror.Editor, options: CodeMirror.ShowHintOptions): CodeMirror.Hints | null {
        let list: CodeMirror.Hint[] = [];
    
        const cur = editor.getCursor();
        let token = editor.getTokenAt(cur);

        console.log(token);
    
        if (!token.type || /\b(?:string|comment)\b/.test(token.type)) {
            return null;
        }
    
        if (!['variable', 'type', 'keyword'].includes(token.type)) {
            return null;
        }

        const type = this.findVariableType(editor, cur.line, editor.getLineTokens(cur.line).findIndex(t => t.start == token.start));
        if (type) {
            return null;
        }
    
        const innerMode = CodeMirror.innerMode(editor.getMode(), token.state);
        token.state = innerMode.state;
    
        const prevToken = editor.getTokenAt(CodeMirror.Pos(cur.line, token.start - 1));
        if (prevToken && prevToken.type == 'variable') {
            return null;
        }
    
        if (token.end > cur.ch) {
            token.end = cur.ch;
            token.string = token.string.slice(0, cur.ch - token.start);
        }
    
        const startLine = editor.firstLine();
        const endLine = editor.lastLine();
        const seen: Map<string, boolean> = new Map<string, boolean>();
    
        for (let line = startLine; line <= endLine; line ++) {
            const lineTokens = editor.getLineTokens(line);
            for (let i = 0; i < lineTokens.length; i++) {
                const lineToken = lineTokens[i];
        
                if (line == cur.line && lineToken.string === token.string) {
                    continue;
                }
        
                if (seen.has(lineToken.string)) {
                    continue;
                }
        
                if (!lineToken.string.startsWith(token.string)) {
                    continue;
                }
        
                if (lineToken.type != 'variable') {
                    continue;
                }
        
                const type = this.findVariableType(editor, line, i);
                if (!type) {
                    continue;
                }
        
                list.push({text: lineToken.string, displayText: `${lineToken.string}: ${type}`});
                seen.set(lineToken.string, true);
            }
        }
    
        list = list.concat(this.tree.find(token.string));
    
        return {
            list: list,
            from: CodeMirror.Pos(cur.line, token.start),
            to: CodeMirror.Pos(cur.line, token.end)
        }
    }
    
    private findVariableType(editor: CodeMirror.Editor, tokenLine: number, tokenPos: number): string | null {
        const lineTokens = editor.getLineTokens(tokenLine);
    
        if (tokenPos - 2 >= 0 && lineTokens[tokenPos - 2] && lineTokens[tokenPos - 2].type == 'type') {
            return lineTokens[tokenPos - 2].string;
        }
    
        for (let prevLine = tokenLine - 1; prevLine >= 0; prevLine--)
        {
            const prevLineTokens = editor.getLineTokens(prevLine);
            for (let i = prevLineTokens.length - 1; i >= 0; i--)
            {
                if (!prevLineTokens[i].type) {
                continue;
                }
        
                if (prevLineTokens[i].type != 'type') {
                return null;
                }
        
                return prevLineTokens[i].string;
            }
        }
    
        return null;
    }
}