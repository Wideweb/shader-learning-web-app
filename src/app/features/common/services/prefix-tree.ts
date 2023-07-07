export interface PrefixTreeNodeIdProvider<T> {
    get(item: T): string
}

export class PrefixTreeNode<T> {
    public char: string = '';

    public children: PrefixTreeNode<T>[] = [];

    public complete: boolean = false;

    public data: T | null = null;
}

export default class PrefixTree<T> {
    public root: PrefixTreeNode<T> = new PrefixTreeNode<T>();

    constructor(private getId: ((item: T) => string)) { }

    public addItem(data: T) {
        this.add(this.root, data, 0);
    }

    private add(node: PrefixTreeNode<T>, data: T, index: number) {
        if (index >= this.getId(data).length) {
            node.data = data;
            node.complete = true;
            return;
        }

        const child = node.children.find(c => c.char == this.getId(data)[index]);
        if (!child) {
            const newNode = new PrefixTreeNode<T>();
            newNode.char = this.getId(data)[index];
            node.children.push(newNode);
            this.add(newNode, data, index + 1);
            return;
        }

        this.add(child, data, index + 1);
    }

    public find(word: string): T[] {
        const result: T[] = [];

        const node = this.findNode(this.root, word, 0);
        if (node == null) {
            return [];
        }

        this.collect(node, result);
        return result;
    }

    private findNode(node: PrefixTreeNode<T>, word: string, index: number): PrefixTreeNode<T> | null {
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

    private collect(node: PrefixTreeNode<T>, result: T[]) {
        if (node.complete) {
            result.push(node.data!);
        }

        for (const child of node.children) {
            this.collect(child, result);
        }
    }
}