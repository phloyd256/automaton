// ε-NFA（初期値）
let A = {
  // 状態集合
  states: ["q0", "q1", "q2"],
  // 入力記号集合
  alphabet: ["0", "1"],
  // 遷移関数
  transition: [
    [[], ["q1"], ["q1"]],
    [["q2"], ["q1"], []],
    [[], [], []],
  ],
  // 初期状態
  initial: "q0",
  // 受理状態集合
  accept: ["q2"],
};

// 編集可能な状態遷移表を作成
function renderTable(nfa) {
  const table_wrap = document.getElementById("editable");
  table_wrap.innerHTML = ""; // 初期化
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const tbody = document.createElement("tbody");

  // 状態の数
  let stateCount = nfa.states.length;
  // 入力記号の数
  let symbolCount = nfa.alphabet.length;
  // 列の数
  let columCount = symbolCount + 4;

  // ヘッダーの作成
  for (let i = 0; i < columCount; i++) {
    const th = document.createElement("th");
    
    if (i === 0) {
      th.style.width = "200px";
      th.innerHTML = "状態";
    } else if (i === 1) {
      th.style.width = "70px";
      th.innerHTML = "初期状態";
    } else if (i === 2) {
      th.style.width = "70px";
      th.innerHTML = "受理状態";
    } else if (i < columCount - 1) {
      th.style.width = "200px";
      // 入力欄
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "入力記号名を入力";
      input.value = nfa.alphabet[i - 3];
      // 入力記号名を更新
      input.addEventListener("input", () => {
        nfa.alphabet[i - 3] = input.value;
      });
      // 入力欄をセルに追加
      th.appendChild(input);
      // 削除ボタン
      const button = document.createElement("button");
      button.textContent = "削除";
      // 押されたら更新
      button.addEventListener("click", () => {
        deleteSymbol(nfa, i - 3);
      });
      // ボタンをセルに追加
      th.appendChild(button);
    } else {
      th.style.width = "200px";
      th.innerHTML = "ε-動作";
    }
    // セルを行に追加
    headerRow.appendChild(th);
  }
  // 行をヘッダーに追加
  thead.appendChild(headerRow);

  // ボディの作成
  for (let i = 0; i < stateCount; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < columCount; j++) {
      const td = document.createElement("td");
      if (j === 0) {
        // 入力欄
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "状態名を入力";
        input.value = nfa.states[i];
        // 状態名を更新
        input.addEventListener("input", () => {
          const oldName = nfa.states[i];
          const newName = input.value;
          // 初期状態の更新
          if (nfa.initial === oldName){
            nfa.initial = newName;
          }
          // 受理状態の更新
          if (nfa.accept.includes(oldName)) {
            nfa.accept = nfa.accept.map(st => st === oldName ? newName : st);
          }
          // 状態名の更新
          nfa.states[i] = newName;
        });
        // 入力欄をセルに追加
        td.appendChild(input);
        // 削除ボタン
        const button = document.createElement("button");
        button.textContent = "削除";
        // 押されたら更新
        button.addEventListener("click", () => {
          deleteState(nfa, i);
        });
        // ボタンをセルに追加
        td.appendChild(button);
      } else if (j === 1) {
        // ラジオボタン
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "initial";
        // 初期状態にチェック
        if (nfa.states[i] === nfa.initial) {
          input.checked = true;
        }
        // 初期状態を更新
        input.addEventListener("change", () => {
          if (input.checked) nfa.initial = nfa.states[i];
        });
        // ラジオボタンをセルに追加
        td.appendChild(input);
      } else if (j === 2) {
        // チェックボックス
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = "accept";
        // 受理状態にチェック
        if (nfa.accept.includes(nfa.states[i])) {
          input.checked = true;
        }
        // 受理状態を更新
        input.addEventListener("change", () => {
          if (input.checked) {
            nfa.accept.push(nfa.states[i]);
          } else if (!input.checked && nfa.accept.includes(nfa.states[i])) {
            nfa.accept = nfa.accept.filter(name => name !== nfa.states[i])
          }
        });
        // チェックボックスをセルに追加
        td.appendChild(input);
      } else {
        for (let k = 0; k < nfa.transition[i][j - 3].length; k++) {
          // 入力欄
          const input = document.createElement("input");
          input.type = "text";
          input.placeholder = "状態名を入力";
          input.value = nfa.transition[i][j - 3][k];
          // 遷移表を更新
          input.addEventListener("change", () => {
            nfa.transition[i][j - 3][k] = input.value;
          });
          // 入力欄をセルに追加
          td.appendChild(input);
        }
        // ボタンを入れるdiv
        const button_container = document.createElement("div");
        // 追加ボタン
        const add_button = document.createElement("button");
        add_button.textContent = "追加";
        // 押されたら更新
        add_button.addEventListener("click", () => {
          nfa.transition[i][j - 3].push("");
          renderTable(nfa);
        });
        // 追加ボタンをdivに追加
        button_container.appendChild(add_button);
        // 削除ボタン
        const delete_button = document.createElement("button");
        delete_button.textContent = "削除";
        // 押されたら更新
        delete_button.addEventListener("click", () => {
          if (nfa.transition[i][j - 3].length > 0) {
            nfa.transition[i][j - 3].pop();
          }
          renderTable(nfa);
        });
        // 削除ボタンをdivに追加
        button_container.appendChild(delete_button);
        // divをセルに追加
        td.appendChild(button_container);
      }
      // セルを行に追加
      tr.appendChild(td);
    }
    // 行をボディに追加
    tbody.appendChild(tr);
  }

  // ヘッダーとボディをテーブルに追加
  table.appendChild(thead);
  table.appendChild(tbody);

  // 完成したテーブルを追加
  table_wrap.appendChild(table);
}

// 状態を追加
function addState(nfa) {
  // 新しい状態の名前は空文字にする
  nfa.states.push("");
  // 行を追加
  let row = [];
  for (let i = 0; i < nfa.alphabet.length + 1; i++) {
    row.push([]);
  }
  nfa.transition.push(row);

  // 更新
  renderTable(nfa);
}

// 入力記号を追加
function addSymbol(nfa) {
  // 新しい入力記号の名前は空文字にする
  nfa.alphabet.push("");
  nfa.transition.forEach((row) => {
    row.splice(-1, 0, []);
  });

  // 更新
  renderTable(nfa);
}

// 状態を削除
function deleteState(nfa, i) {
  if (i >= 0 && i < nfa.states.length) {
    let deletedState = nfa.states[i];
    // 初期状態に該当する状態が削除されたら初期状態をnullにする
    if (deletedState === nfa.initial) {
      nfa.initial = null;
    }
    nfa.states.splice(i, 1);
  }
  if (i >= 0 && i < nfa.transition.length) {
    nfa.transition.splice(i, 1);
  }

  // 更新
  renderTable(nfa);
}

// 入力記号を削除
function deleteSymbol(nfa, i) {
  if (i >= 0 && i < nfa.alphabet.length) {
    nfa.alphabet.splice(i, 1);
  }
  for (let j = 0; j < nfa.states.length; j++) {
    nfa.transition[j].splice(i, 1);
  }

  // 更新
  renderTable(nfa);
}

// 最初に表を表示
renderTable(A);

// 状態遷移表（結果）を作成
function putTable(dfa, id) {
  const table_wrap = document.getElementById(id);
  table_wrap.innerHTML = ""; // 初期化
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const tbody = document.createElement("tbody");

  // 状態の数
  let stateCount = dfa.states.length;
  // 入力記号の数
  let symbolCount = dfa.alphabet.length;
  // 列の数
  let columCount = symbolCount + 4;

  // 表ヘッダーの作成
  for (let i = 0; i < columCount; i++) {
    const th = document.createElement("th");
    if (i === 0) {
      th.innerHTML = "状態";
    } else if (i === 1) {
      th.innerHTML = "初期状態";
    } else if (i === 2) {
      th.innerHTML = "受理状態";
    } else if (i < columCount - 1) {
      th.innerHTML = dfa.alphabet[i - 3];
    } else {
      th.innerHTML = "ε-動作"; // いらない
    }
    // セルを行に追加
    headerRow.appendChild(th);
  }
  // 行をヘッダーに追加
  thead.appendChild(headerRow);

  // ボディの作成
  for (let i = 0; i < stateCount; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < columCount; j++) {
      const td = document.createElement("td");
      if (j === 0) {
        td.innerHTML = dfa.states[i];
      } else if (j === 1) {
        // 初期状態に印
        if (dfa.states[i] === dfa.initial) {
          td.innerHTML = "〇";
        }
      } else if (j === 2) {
        // 受理状態に印
        if (dfa.accept.includes(dfa.states[i])) {
          td.innerHTML = "〇";
        }
      } else if (j <= columCount - 2) {
        td.innerHTML = dfa.transition[i][j - 3][0];
      } else {
        td.innerHTML = "";
      }
      // セルを行に追加
      tr.appendChild(td);
    }
    // 行をボディに追加
    tbody.appendChild(tr);
  }

  // ヘッダーとボディをテーブルに追加
  table.appendChild(thead);
  table.appendChild(tbody);

  // 完成したテーブルを追加
  table_wrap.appendChild(table);
}

// e-閉包を求める
// states === [] なら [] が返される
function epsilon_closure(nfa, states) {
  const epsilonIndex = nfa.alphabet.length; // ε遷移が格納されている列のindex
  const closure = new Set(states); // 探索開始状態はそのままε-閉包に入る
  const stack = [...states]; // スタック

  while (stack.length > 0) {
    const state = stack.pop(); // 要素（状態）を取得
    const i = nfa.states.indexOf(state); // その状態のindexを取得
    if (i === -1) continue; // 要素が見つからなかったら次のループへ

    const epsTransitions = nfa.transition[i][epsilonIndex]; // ε遷移を取得

    if (epsTransitions) {
      for (const nextState of epsTransitions) {
        if (!closure.has(nextState)) {
          closure.add(nextState); // 新登場の状態を登録
          stack.push(nextState); // 未探索の状態をスタックに追加
        }
      }
    }
  }

  return Array.from(closure);
}

// ε-NFAをDFAに変換
function epsilon_nfa_to_dfa(nfa) {
  const dfa = {
    states: [],
    alphabet: [...nfa.alphabet],
    transition: [],
    initial: null,
    accept: [],
  };

  const epsilonIndex = nfa.alphabet.length; // ε遷移が格納されている列のindex

  // DFAの初期状態
  const start = epsilon_closure(nfa, [nfa.initial]);
  const startName = start.sort().join(",");
  dfa.initial = startName;

  // 未処理のセットを積む
  const queue = [start];
  const seen = new Set([startName]);

  // DFA状態を登録
  dfa.states.push(startName);
  dfa.transition.push([]);

  // メインループ
  while (queue.length > 0) {
    const currentSet = queue.shift();
    const currentName =
      currentSet.length === 0 ? "Φ" : currentSet.sort().join(",");
    const rowIndex = dfa.states.indexOf(currentName);

    // 各入力記号ごとに遷移後の状態を調べる
    for (let symIndex = 0; symIndex < nfa.alphabet.length; symIndex++) {
      const moveSet = new Set();

      // currentSet 内の各状態に対してシンボル遷移
      for (const s of currentSet) {
        const i = nfa.states.indexOf(s);
        if (i === -1) continue;

        const nextArr = nfa.transition[i][symIndex];
        if (!nextArr) continue;

        for (const t of nextArr) {
          if (t != null) moveSet.add(t);
        }
      }

      // さらにε-閉包
      const closureSet = epsilon_closure(nfa, Array.from(moveSet));
      const closureName =
        closureSet.length === 0 ? "Φ" : closureSet.sort().join(",");

      // 遷移を記録
      if (!dfa.transition[rowIndex]) dfa.transition[rowIndex] = [];
      dfa.transition[rowIndex][symIndex] = [closureName];

      // 新しい状態なら登録
      if (closureName && !seen.has(closureName)) {
        seen.add(closureName);
        queue.push(closureSet);
        dfa.states.push(closureName);
        dfa.transition.push([]);
      }
    }
  }

  // 受理状態を決定
  for (const st of dfa.states) {
    if (st === "Φ") continue;
    const group = st.split(",");
    if (group.some((s) => nfa.accept.includes(s))) {
      dfa.accept.push(st);
    }
  }

  // ε遷移を追加（空集合）
  for (let i = 0; i < dfa.states.length; i++) {
    dfa.transition[i].push([]);
  }

  return dfa;
}

// k-等価法によるDFA最小化

// k-等価からk+1-等価を求める
function next_equivalence(P, dfa) {
  const alphabet = dfa.alphabet;
  const transition = dfa.transition;
  const states = dfa.states;

  let new_P = []; // k+1-等価のブロック

  for (let outer_block of P) {
    let block_groups = []; // 同じ遷移パターンの状態をまとめる

    for (let q of outer_block) {
      let pattern = [];

      // qの遷移パターンを調べる
      for (let a of alphabet) {
        // 状態qのインデックスを取得
        let q_index = states.indexOf(q);
        if (q_index === -1) continue;

        // 遷移先の取得
        let next_states = transition[q_index][alphabet.indexOf(a)];
        let next_state = next_states[0];

        // 遷移先がどのブロックに属するか
        for (let i = 0; i < P.length; i++) {
          if (P[i].includes(next_state)) {
            pattern.push(i);
            break;
          }
        }
      }

      // 同じパターンを持つブロックがすでにあるか確認
      let found_group = false;
      for (let group of block_groups) {
        let repr_state = group[0];
        let repr_pattern = [];

        for (let a of alphabet) {
          let repr_index = states.indexOf(repr_state);
          let next_states = transition[repr_index][alphabet.indexOf(a)];
          let next_state = next_states[0];

          for (let j = 0; j < P.length; j++) {
            if (P[j].includes(next_state)) {
              repr_pattern.push(j);
              break;
            }
          }
        }

        // 遷移パターンが同じものを追加
        if (JSON.stringify(repr_pattern) === JSON.stringify(pattern)) {
          group.push(q);
          found_group = true;
          break;
        }
      }

      if (!found_group) {
        block_groups.push([q]);
      }
    }

    new_P.push(...block_groups);
  }

  return new_P;
}

// 2次元配列が同じか異なるかを判定
function arrays_equal(a, b) {
  if (a.length !== b.length) return false; // 外側配列の長さが違うなら false

  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false; // 内側配列の長さが違うなら false

    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false; // 要素が違うなら false
    }
  }

  return true; // 全部一致
}

// 最簡形を構成するPを求める
function minimize_dfa_states(dfa) {
  const states = dfa.states;
  const accept = dfa.accept;

  // 初期分割 P0: 受理状態と非受理状態
  let P = [];
  let accept_block = states.filter((s) => accept.includes(s));
  let non_accept_block = states.filter((s) => !accept.includes(s));
  if (accept_block.length > 0) P.push(accept_block);
  if (non_accept_block.length > 0) P.push(non_accept_block);

  while (true) {
    let new_P = next_equivalence(P, dfa);

    // P と new_P が同じなら安定 → 終了
    if (arrays_equal(P, new_P)) {
      break;
    }

    P = new_P;
  }

  return P;
}

// DFAを最簡形に変換
function minimize_dfa(dfa) {
  const states = dfa.states;
  const alphabet = dfa.alphabet;
  const transition = dfa.transition;
  const initial = dfa.initial;
  const accept = dfa.accept;

  // 最小化に必要な状態の分割を求める
  const P = minimize_dfa_states(dfa);

  // 最小化後の状態名を作成（ブロック内の状態をソートして結合）
  const min_states = P.map((block) => block.slice().sort().join(","));

  // 各元状態を最小化後の状態名にマッピング
  const block_map = {};
  P.forEach((block, i) => {
    block.forEach((q) => {
      block_map[q] = min_states[i];
    });
  });

  // 最小化後の遷移関数を作成
  const min_transition = [];
  min_states.forEach((min_state, i) => {
    const row = [];
    const representative = P[i][0]; // ブロックの代表状態を使う
    alphabet.forEach((a, j) => {
      // 元状態の遷移
      const q_index = states.indexOf(representative);
      const next_states = transition[q_index][j];
      const next_state = next_states.length > 0 ? next_states[0] : "Φ";
      row.push([block_map[next_state]]);
    });
    row.push([]); // ε-動作
    min_transition.push(row);
  });

  // 最小化後の初期状態と受理状態
  const min_initial = block_map[initial];
  const min_accept = Array.from(new Set(accept.map((q) => block_map[q])));

  return {
    states: min_states,
    alphabet: alphabet,
    transition: min_transition,
    initial: min_initial,
    accept: min_accept,
  };
}

// DFAの状態集合と遷移関数の順番を整える関数
function order_states(dfa) {
  const states = dfa.states;
  const alphabet = dfa.alphabet;
  const transition = dfa.transition;
  const initial = dfa.initial;

  // 初期状態のインデックス
  const init_index = states.indexOf(initial);

  // BFS 用キュー
  let queue = [initial];
  let visited = new Set([initial]);

  // 新しい順序の状態リスト
  let new_states = [initial];

  // BFS 開始
  while (queue.length > 0) {
    const q = queue.shift();
    const q_index = states.indexOf(q);

    // 全入力記号について遷移先を調べる
    for (let a of alphabet) {
      const a_index = alphabet.indexOf(a);
      const next_list = transition[q_index][a_index];
      const next_state = next_list[0];

      if (!visited.has(next_state)) {
        visited.add(next_state);
        queue.push(next_state);
        new_states.push(next_state);
      }
    }
  }

  // 新しい順序に合わせて transition を並べ替える
  let new_transition = new_states.map((s) => {
    let row = [];
    let old_index = states.indexOf(s);

    alphabet.forEach((a, a_index) => {
      const next_list = transition[old_index][a_index];
      const next_state = next_list[0];
      row.push([next_state]);
    });

    return row;
  });

  // 受理状態も順序を整理（順序を変えるだけ）
  let new_accept = new_states.filter((s) => dfa.accept.includes(s));

  // 新しい DFA を返す
  return {
    states: new_states,
    alphabet: alphabet,
    transition: new_transition,
    initial: initial,
    accept: new_accept,
  };
}

// 状態追加
document.getElementById("add_state_button").addEventListener("click", () => addState(A));
// 入力記号追加
document.getElementById("add_symbol_button").addEventListener("click", () => addSymbol(A));

// 変換後のDFAを表示
document.getElementById("epsilon_nfa_to_dfa_button").addEventListener("click", () => {
  dfa_A = epsilon_nfa_to_dfa(A);
  ordered_dfa_A = order_states(dfa_A);
  putTable(ordered_dfa_A, "converted");
});
// 変換後の最簡形DFAを表示
document.getElementById("minimize_dfa_button").addEventListener("click", () => {
  dfa_A = epsilon_nfa_to_dfa(A);
  min_dfa_A = minimize_dfa(dfa_A);
  ordered_min_dfa_A = order_states(min_dfa_A);
  putTable(ordered_min_dfa_A,"minimized");
});
