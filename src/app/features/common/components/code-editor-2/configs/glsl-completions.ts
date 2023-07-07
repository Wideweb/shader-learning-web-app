import { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import PrefixTree from '../../../services/prefix-tree';

const COMPLETION_LIST: Completion[] = [
    { label: 'if', detail: '' },
    { label: 'uniform', detail: '' },

    { label: 'vec2', detail: '(float x, float y) => vec2' },
    { label: 'vec3', detail: '(float x, float y, float z) => vec3' },
    { label: 'vec4', detail: '(float x, float y, float z, float w) => vec4' },

    { label: 'ivec2', detail: '(int x, int y) => ivec2' },
    { label: 'ivec3', detail: '(int x, int y, int z) => ivec3' },
    { label: 'ivec4', detail: '(int x, int y, int z, int w) => ivec4' },

    { label: 'bvec2', detail: '(bool x, bool y) => bvec2' },
    { label: 'bvec3', detail: '(bool x, bool y, bool z) => bvec3' },
    { label: 'bvec4', detail: '(bool x, bool y, bool z, bool w) => bvec4' },

    { label: 'mat2', detail: '(vec2 column1, vec2 column2) => mat2' },
    { label: 'mat3', detail: '(vec3 column1, vec3 column2, vec3 column3) => mat3' },
    { label: 'mat4', detail: '(vec4 column1, vec4 column2, vec4 column3, vec4 column4) => mat4' },

    { label: 'bvec3', detail: '(bool x, bool y, bool z) => bvec3' },
    { label: 'bvec4', detail: '(bool x, bool y, bool z, bool w) => bvec4' },

    { label: 'radians', detail: '(T degrees) => T' },
    { label: 'degrees', detail: '(T radians) => T' },
    { label: 'sin', detail: '(T radians) => T' },
    { label: 'cos', detail: '(T radians) => T' },
    { label: 'tan', detail: '(T radians) => T' },
    { label: 'asin', detail: '(T x) => radians' },
    { label: 'acos', detail: '(T x) => radians' },
    { label: 'atan', detail: '(T x) => radians' },
    { label: 'abs', detail: '(T x) => T' },
    { label: 'pow', detail: '(T base, T exponent) => T' },
    { label: 'exp', detail: '(T x) => e^x' },
    { label: 'log', detail: '(T x) => T' },
    { label: 'exp2', detail: '(T x) => 2^x' },
    { label: 'sqrt', detail: '(T x) => T' },
    { label: 'inversesqrt', detail: '(T x) => T' },
    { label: 'sign', detail: '(T x) => T' },
    { label: 'floor', detail: '(T x) => T' },
    { label: 'fract', detail: '(T x) => T' },
    { label: 'ceil', detail: '(T x) => T' },
    { label: 'mod', detail: '(T x, T y) => T' },
    { label: 'min', detail: '(T x, T y) => T' },
    { label: 'max', detail: '(T x, T y) => T' },
    { label: 'mix', detail: '(T start, T end, T weight) => T' },
    { label: 'step', detail: '(T edge, T x) => T' },
    { label: 'smoothstep', detail: '(T edge0, T edge1, T x) => T' },
    { label: 'clamp', detail: '(T x, T min, T max) => T' },
    { label: 'length', detail: '(T x) => float' },
    { label: 'distance', detail: '(T p0, T p1) => float' },
    { label: 'dot', detail: '(T v0, T v1) => float' },
    { label: 'cross', detail: '(vec3 v0, vec3 v1) => vec3' },
    { label: 'normalize', detail: '(T v) => T' },
    { label: 'reflect', detail: '(T v, T normal) => T' },
    { label: 'refract', detail: '(T v, T normal, float eta) => T' },
    { label: 'matrixCompMult', detail: '(mat m0, mat m1) => mat' },
    { label: 'lessThan', detail: '(vec v0, vec v1) => bvec' },
    { label: 'lessThanEqual', detail: '(vec v0, vec v1) => bvec' },
    { label: 'greaterThan', detail: '(vec v0, vec v1) => bvec' },
    { label: 'greaterThanEqual', detail: '(vec v0, vec v1) => bvec' },
    { label: 'equal', detail: '(vec v0, vec v1) => bvec' },
    { label: 'notEqual', detail: '(vec v0, vec v1) => bvec' },
    { label: 'any', detail: '(bvec v) => bool' },
    { label: 'all', detail: '(bvec v) => bool' },
    { label: 'not', detail: '(bvec v) => bvec' },
    { label: 'texture', detail: '(sampler2D sampler, vec2 p, [float bias]) => vec4' },
    { label: 'dFdx', detail: '(T value) => T' },
    { label: 'dFdy', detail: '(T value) => T' },
    { label: 'fwidth', detail: '(T value) => T' },

    { label: 'sampler2D', detail: '' },
    { label: 'gl_FragColor', detail: 'vec4' },
    { label: 'gl_FragCoord', detail: 'vec4' },
    { label: 'gl_Position', detail: 'vec4' },

    { label: 'bool', detail: '' },
    { label: 'float', detail: '' },
    { label: 'int', detail: '' },
];

const COMPLETION_TREE = new PrefixTree<Completion>((item) => item.label);
COMPLETION_LIST.forEach(completion => COMPLETION_TREE.addItem(completion));

export const glslCompletions = (context: CompletionContext): CompletionResult | null => {
    let word = context.matchBefore(/\w*/);
    if (!word || (word.from == word.to && !context.explicit)) {
        return null
    }
    
    return {
        from: word.from,
        options: COMPLETION_TREE.find(word.text),
    }
}