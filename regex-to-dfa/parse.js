// インポート
import { alphabet } from "./script.js";
// エクスポート
export { Parser };

// 文字
class CharNode {
    constructor(ch) {
        this.type = "char";
        this.ch = ch;
    }
}

// 連接
class ConcatNode {
    constructor(left,right){
        this.type = "concat";
        this.left = left;
        this.right = right;
    }
}

// 選択
class UnionNode {
    constructor(left,right){
        this.type = "union";
        this.left = left;
        this.right = right;
    }
}

// クロージャ
class StarNode {
    constructor(expr){
        this.type = "star";
        this.expr = expr;
    }
}

class Tokenizer {
    constructor(text) {
        this.text = text;
        this.pos = 0;
    }

    peek(){
        return this.text[this.pos] || null;
    }

    next(){
        return this.text[this.pos++] || null;
    }
}

class Parser {
    constructor(text){
        this.tok = new Tokenizer(text);
    }

    parse(){
        return this.parseAlt();
    }

    parseAlt(){
        let node = this.parseConcat();
        while(this.tok.peek() === '|'){
            this.tok.next();
            node = new UnionNode(node, this.parseConcat());
        }
        return node;
    }

    parseConcat(){
        let node = this.parseRepeat();
        while(true){
            const c = this.tok.peek();
            if(!c || c === ')' || c === '|') break;
            node = new ConcatNode(node, this.parseRepeat());
        }
        return node;
    }

    parseRepeat(){
        let node = this.parseBase();
        while(this.tok.peek() === '*'){
            this.tok.next();
            node = new StarNode(node);
        }
        return node;
    }

    parseBase(){
        const c = this.tok.peek();

        if(c === '('){
            this.tok.next();
            const node = this.parseAlt();
            if(this.tok.peek() !== ')') throw "expected )";
            this.tok.next();
            return node;
        }

        if(alphabet.includes(c)){ // 文字ならtrue
            this.tok.next();
            return new CharNode(c);
        }

        throw "unexpected char: " + c;
    }
}
