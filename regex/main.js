// インポート
import { Parser} from "./parse.js";
import { buildNFA } from "./build.js";
import { epsilon_nfa_to_dfa, minimize_dfa, order_states, simplify_state_name, putTable } from "./convert.js";
// エクスポート
export { alphabet };

// 入力記号集合
let alphabet = ["a", "b"];
const labels = ['(', ')', '|', '*'];

// 入力された正規表現（初期値）
let text = "a(ab*|ba)*|b(a|b)*";

// 正規表現の入力欄
const input_regex = document.getElementById("input_regex");
input_regex.placeholder = "正規表現を入力";
input_regex.value = text;

// 入力記号を表示する
function display_alphabet() {
    const alphabet_wrap = document.getElementById("alphabet_wrap");
    alphabet_wrap.innerHTML = ""; // 初期化

    for (let i = 0; i < alphabet.length; i++) {
        // 入力欄
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "入力記号名を入力";
        input.value = alphabet[i];
        // 入力されたとき
        input.addEventListener("input", () => {
            alphabet[i] = input.value;
        });

        // 削除ボタン
        const button = document.createElement("button");
        button.textContent = "削除";
        // クリックされたとき
        button.addEventListener("click", () => {
            alphabet.splice(i, 1);
            display_alphabet();
        });

        // 入力欄と削除ボタンを追加
        const container = document.createElement("div");
        container.appendChild(input);
        container.appendChild(button);
        alphabet_wrap.appendChild(container);
    }
}

// 入力記号を追加するボタン
function add_symbol() {
    const alphabet_wrap = document.getElementById("alphabet_wrap");

    // 入力欄
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "入力記号名を入力";
    alphabet_wrap.appendChild(input);

    // 削除ボタン
    const button = document.createElement("button");
    button.textContent = "削除";

    // 入力記号を追加
    alphabet.push("");

    // 入力欄と削除ボタンを追加
    const container = document.createElement("div");
    container.appendChild(input);
    container.appendChild(button);
    alphabet_wrap.appendChild(container);

    // 表示
    display_alphabet();
}

// ボタンを表示する
function display_buttons(a) {
    const buttons_wrap = document.getElementById("buttons_wrap");
    buttons_wrap.innerHTML = ""; // 初期化

    // 表示するボタンの名前
    const combined = [...a, ...labels];

    combined.forEach(label => {
        // ボタン
        const button = document.createElement('button');
        button.textContent = label;
        // クリックされたとき
        button.addEventListener('click', () => {
            const start = input_regex.selectionStart;
            const end   = input_regex.selectionEnd;
            const value = input_regex.value;

            // カーソル位置に入力
            input_regex.value = value.slice(0, start) + label + value.slice(end);
            // 新しいカーソル位置
            const newCursorPosition = start + label.length;
            // カーソル位置を挿入した直後にセット
            input_regex.selectionStart = input_regex.selectionEnd = newCursorPosition;
            // フォーカス
            input_regex.focus();
        });
        // ボタンを追加
        buttons_wrap.appendChild(button);
    });
}

// DFAと構文木を表示
function display_output() {
    // 構文木を生成
    const parser = new Parser(input_regex.value);
    const ast = parser.parse();

    const nfa = buildNFA(ast, alphabet); // ε-NFA
    const dfa = epsilon_nfa_to_dfa(nfa); // DFA
    const min_dfa = minimize_dfa(dfa); // 最簡形DFA
    const ordered_min_dfa = order_states(min_dfa); // 整序後のDFA
    const simplified_dfa = simplify_state_name(ordered_min_dfa);
    // 状態遷移表を表示
    putTable(simplified_dfa, "minimized_dfa");
}

// 表示
display_alphabet();
display_buttons(alphabet);
display_output();

// 入力記号を追加
document.getElementById("add_symbol_button").addEventListener("click", () => {
    add_symbol();
});

// 入力を消去
document.getElementById("delete_regex_button").addEventListener("click", () => {
    const start = input_regex.selectionStart;
    const end   = input_regex.selectionEnd;
    const value = input_regex.value;

    // 消去
    if (start !== end) {
        // 選択範囲があればそのまま削除
        input_regex.value = value.slice(0, start) + value.slice(end);
        input_regex.selectionStart = input_regex.selectionEnd = start;
    } else {
        // 1文字だけ左を削除
        input_regex.value = value.slice(0, start - 1) + value.slice(end);
        input_regex.selectionStart = input_regex.selectionEnd = start - 1;
    }
    
    input_regex.focus();
});

// 入力を全て消去
document.getElementById("delete_all_regex_button").addEventListener("click", () => {
    input_regex.value = "";
    input_regex.focus();
});

// ボタンの表示を更新
document.getElementById("renew").addEventListener("click", () => {
    display_buttons(alphabet);
});

// 最簡形DFAを表示
document.getElementById("minimize_dfa_button").addEventListener("click", () => {
    display_output();
})
