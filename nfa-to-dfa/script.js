// インポート
import { epsilon_nfa_to_dfa, minimize_dfa, order_states, putTable } from "../shared/automaton-core.js";

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
		[["q0"], [], []],
	],
	// 初期状態
	initial: "q0",
	// 受理状態集合
	accept: ["q2"]
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
		// 初期状態に該当したら初期状態をnullにする
		if (deletedState === nfa.initial) {
			nfa.initial = null;
		}
		// 受理状態に該当したら受理状態集合から削除する
		if (nfa.accept.includes(deletedState)) {
			nfa.accept = nfa.accept.filter(name => name !== deletedState);
		}
		// 状態を削除
		nfa.states.splice(i, 1);
	}
	// 遷移関数の行を削除
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

let dfa_A = epsilon_nfa_to_dfa(A);
let ordered_dfa_A = order_states(dfa_A);
let min_dfa_A = minimize_dfa(dfa_A);
let ordered_min_dfa_A = order_states(min_dfa_A);
// DFAを表示
putTable(ordered_dfa_A, "converted");
// 最簡形DFAを表示
putTable(ordered_min_dfa_A,"minimized");

// 状態追加
document.getElementById("add_state_button").addEventListener("click", () => addState(A));
// 入力記号追加
document.getElementById("add_symbol_button").addEventListener("click", () => addSymbol(A));

// 変換後のDFAと最簡形DFAを表示
document.getElementById("convert").addEventListener("click", () => {
	dfa_A = epsilon_nfa_to_dfa(A);
	ordered_dfa_A = order_states(dfa_A);
	min_dfa_A = minimize_dfa(dfa_A);
	ordered_min_dfa_A = order_states(min_dfa_A);
	// DFAを表示
	putTable(ordered_dfa_A, "converted");
	// 最簡形DFAを表示
	putTable(ordered_min_dfa_A,"minimized");
});
