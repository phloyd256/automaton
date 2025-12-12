// エクスポート
export { buildNFA };

// NFAを生成
function makeAutomaton(states, alphabet, transition, initial, accept) {
    return {
        states: states, // 状態集合
        alphabet: alphabet, // 入力記号集合
        transition: transition, // 遷移集合
        initial: initial, // 初期状態
        accept: accept // 受理状態集合
    };
}

// 状態数カウント
let stateCount = 0;
// 新しい状態を生成
function newState() {
    return "q" + (stateCount++);
}

// 構文木からNFAを生成
function buildNFA(node, alphabet) {
    stateCount = 0;  // リセット

    // NFAを生成
    return build(node, alphabet);
}

// 構文木からNFAを生成
function build(node, alphabet) {
    switch (node.type) {
        // 文字
        case "char":
            return buildChar(node.ch, alphabet);
        // 連接
        case "concat":
            return buildConcat(build(node.left, alphabet), build(node.right, alphabet));
        // 選択
        case "union":
            return buildUnion(build(node.left, alphabet), build(node.right, alphabet));
        // クロージャ
        case "star":
            return buildStar(build(node.expr, alphabet));
        default:
            throw "unknown node type: " + node.type; // エラー
    }
}

// トンプソン法

// 文字
function buildChar(ch, alphabet) {
    let s = newState();
    let t = newState();

    // 状態集合
    let states = [s, t];
    // 遷移関数
    let transition = makeTransition(states.length, alphabet.length);
    transition[states.indexOf(s)][alphabet.indexOf(ch)].push(t);
    // 初期状態
    let initial = s;
    // 受理状態集合
    let accept = [t];

    return makeAutomaton(states, alphabet, transition, initial, accept);
}

// 連接
function buildConcat(A, B) {
    // 状態集合
    let states = [...A.states, ...B.states];
    // 入力記号集合
    let alphabet = A.alphabet; // = B.alphabet
    // 遷移関数
    let transition = makeTransition(states.length, alphabet.length);

    // 遷移関数をコピー
    for (let i = 0; i < A.states.length; i++) {
        transition[i] = A.transition[i];
        if (i === A.states.indexOf(A.accept[0])) {
            transition[i][alphabet.length].push(B.initial);
        }
    }
    for (let i = 0; i < B.states.length; i++) {
        transition[i + A.states.length] = B.transition[i];
    }

    // 初期状態
    let initial = A.initial;
    // 受理状態集合
    let accept = B.accept;

    return makeAutomaton(states, alphabet, transition, initial, accept);
}

// 選択
function buildUnion(A, B) {
    let s = newState();
    let t = newState();

    // 状態集合
    let states = [s, ...A.states, ...B.states, t];
    // 入力記号集合
    let alphabet = A.alphabet; // = B.alphabet
    // 遷移関数
    let transition = makeTransition(states.length, alphabet.length);

    // 遷移関数をコピー
    transition[0][alphabet.length] = [A.initial, B.initial];

    for (let i = 0; i < A.states.length; i++) {
        transition[i + 1] = A.transition[i];
        if (i === A.states.indexOf(A.accept[0])) {
            transition[i + 1][alphabet.length].push(t);
        }
    }
    for (let i = 0; i < B.states.length; i++) {
        transition[i + A.states.length + 1] = B.transition[i];
        if (i === B.states.indexOf(B.accept[0])) {
            transition[i + A.states.length + 1][alphabet.length].push(t);
        }
    }

    // 初期状態
    let initial = s;
    // 受理状態集合
    let accept = [t];

    return makeAutomaton(states, alphabet, transition, initial, accept);
}

// クロージャ
function buildStar(A) {
    let s = newState();

    // 状態集合
    let states = [s, ...A.states];
    // 入力記号集合
    let alphabet = A.alphabet;
    // 遷移関数
    let transition = makeTransition(states.length, alphabet.length);

    // 遷移関数をコピー
    transition[0][alphabet.length] = [A.initial];

    for (let i = 0; i < A.states.length; i++) {
        transition[i + 1] = A.transition[i];
        if (i === A.states.indexOf(A.accept[0])) {
            transition[i + 1][alphabet.length].push(s);
        }
    }

    // 初期状態
    let initial = s;
    // 受理状態集合
    let accept = [s];

    return makeAutomaton(states, alphabet, transition, initial, accept);
}

// 遷移関数の型を作る: n×(m+1)
function makeTransition(n, m) {
    let transition = [];
    for (let i = 0; i < n; i++) {
        transition[i] = [];
        for (let j = 0; j < m + 1; j++) {
            transition[i][j] = [];
        }
    }
    return transition;
}
