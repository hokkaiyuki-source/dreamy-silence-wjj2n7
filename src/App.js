import React, { useState, useEffect } from "react";

const STORAGE_KEY = "pw_characters_v1";

// 空のキャラクターを作る関数
function createEmptyCharacter() {
  return {
    id: Date.now().toString(),
    name: "",
    gender: "",
    age: "",
    capacity: "",
    appearance: "",
    image: "", // 外見画像（Base64）
    powerRecovery: "",
    properties: Array.from({ length: 8 }, () => ({
      name: "",
      look: "",
      genre: "",
      strength: "",
      notes: "",
      broken: false,
    })),
  };
}

export default function App() {
  const [characters, setCharacters] = useState([]);
  const [currentView, setCurrentView] = useState("list"); // "list" or "sheet"
  const [editing, setEditing] = useState(null); // 編集中のキャラ

  // 起動時に localStorage から読み込む
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCharacters(JSON.parse(saved));
      }
    } catch (e) {
      console.error("読み込みエラー:", e);
    }
  }, []);

  // characters が変わるたびに保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    } catch (e) {
      console.error("保存エラー:", e);
    }
  }, [characters]);

  // 一覧から「新規作成」
  const handleCreateNew = () => {
    const fresh = createEmptyCharacter();
    setEditing(fresh);
    setCurrentView("sheet");
  };

  // 一覧から「編集」
  const handleEdit = (id) => {
    const found = characters.find((c) => c.id === id);
    if (found) {
      // コピーして編集用に
      setEditing(JSON.parse(JSON.stringify(found)));
      setCurrentView("sheet");
    }
  };

  // キャラ削除
  const handleDelete = (id) => {
    if (!window.confirm("このキャラクターを削除しますか？")) return;
    setCharacters(characters.filter((c) => c.id !== id));
  };

  // シート側の基本情報変更
  const updateBasic = (field, value) => {
    setEditing({ ...editing, [field]: value });
  };

  // シート側のプロパティ変更
  const updateProperty = (index, field, value) => {
    const props = [...editing.properties];
    props[index] = { ...props[index], [field]: value };
    setEditing({ ...editing, properties: props });
  };

  // 保存（新規 or 上書き）
  const handleSave = () => {
    if (!editing) return;
    if (!editing.name) {
      alert("名前は必須です！");
      return;
    }

    setCharacters((prev) => {
      const exists = prev.find((c) => c.id === editing.id);
      if (exists) {
        // 上書き
        return prev.map((c) => (c.id === editing.id ? editing : c));
      } else {
        // 新規追加
        return [...prev, editing];
      }
    });

    setCurrentView("list");
    setEditing(null);
  };

  // 外見画像の読み込み
  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updateBasic("image", event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 画面切り替え
  if (currentView === "list") {
    // 🗂 キャラクター一覧画面
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f1e8",
          padding: "16px",
          fontFamily: '"Yu Gothic", system-ui, sans-serif',
          color: "#333",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "16px",
            letterSpacing: "0.08em",
          }}
        >
          PLASTICA: Wonderers キャラクター倉庫
        </h1>

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto 12px",
            textAlign: "right",
          }}
        >
          <button
            onClick={handleCreateNew}
            style={{
              padding: "6px 12px",
              border: "1px solid #555",
              background: "#eee",
              cursor: "pointer",
            }}
          >
            ＋ 新規キャラクター作成
          </button>
        </div>

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            background: "#fff",
            border: "1px solid #ccc",
            padding: "8px",
          }}
        >
          {characters.length === 0 && (
            <p style={{ textAlign: "center", margin: "12px 0" }}>
              まだキャラクターがいません。「新規キャラクター作成」から作成してください。
            </p>
          )}

          {characters.map((ch) => (
            <div
              key={ch.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              {/* サムネイル */}
              {ch.image ? (
                <img
                  src={ch.image}
                  alt="thumb"
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "4px",
                    border: "1px dashed #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    color: "#999",
                  }}
                >
                  no img
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold" }}>
                  {ch.name || "(名前未設定)"}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {ch.gender && `性別:${ch.gender} `}
                  {ch.age && ` 年齢:${ch.age} `}
                  {ch.capacity && ` キャパ:${ch.capacity}`}
                </div>
              </div>

              <button
                onClick={() => handleEdit(ch.id)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #555",
                  background: "#eee",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(ch.id)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #a33",
                  background: "#fbeaea",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#a33",
                }}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✏️ シート画面
  if (!editing) {
    // 何かの拍子で editing が null になった保険
    setCurrentView("list");
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f1e8",
        padding: "16px",
        fontFamily: '"Yu Gothic", system-ui, sans-serif',
        color: "#333",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "16px",
          letterSpacing: "0.08em",
        }}
      >
        PLASTICA: Wonderers キャラクターシート
      </h1>

      {/* 上部ボタン */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto 8px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => {
            if (
              window.confirm(
                "保存していない変更は失われます。一覧に戻りますか？"
              )
            ) {
              setEditing(null);
              setCurrentView("list");
            }
          }}
          style={{
            padding: "4px 8px",
            border: "1px solid #555",
            background: "#eee",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          ← 一覧に戻る
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: "4px 12px",
            border: "1px solid #055",
            background: "#e0f5f3",
            cursor: "pointer",
            fontSize: "12px",
            color: "#055",
          }}
        >
          保存する
        </button>
      </div>

      {/* 基本情報 */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto 16px",
          padding: "12px",
          background: "#fff",
          border: "1px solid #ccc",
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <input
            placeholder="名前"
            value={editing.name}
            onChange={(e) => updateBasic("name", e.target.value)}
          />
          <input
            placeholder="性別"
            value={editing.gender}
            onChange={(e) => updateBasic("gender", e.target.value)}
          />
          <input
            placeholder="年齢"
            value={editing.age}
            onChange={(e) => updateBasic("age", e.target.value)}
          />
          <input
            placeholder="キャパシティ"
            value={editing.capacity}
            onChange={(e) => updateBasic("capacity", e.target.value)}
          />
        </div>

        {/* 外見テキスト */}
        <div style={{ marginBottom: "8px" }}>
          <textarea
            placeholder="外見／その他メモ"
            value={editing.appearance}
            onChange={(e) => updateBasic("appearance", e.target.value)}
            rows={3}
            style={{ width: "100%", resize: "vertical" }}
          />
        </div>

        {/* 画像アップロード */}
        <div>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "4px",
            }}
          >
            外見画像
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files[0])}
          />
          {editing.image && (
            <div
              style={{
                marginTop: "8px",
                textAlign: "center",
                border: "1px solid #ccc",
                padding: "4px",
                background: "#fafafa",
              }}
            >
              <img
                src={editing.image}
                alt="外見"
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* プロパティ一覧 */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}
      >
        {editing.properties.map((p, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #ccc",
              padding: "8px",
              fontSize: "13px",
            }}
          >
            <div style={{ marginBottom: "4px", fontWeight: "bold" }}>
              プロパティ {i + 1}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr",
                gap: "4px",
                marginBottom: "4px",
              }}
            >
              <input
                placeholder="プロパティ名"
                value={p.name}
                onChange={(e) => updateProperty(i, "name", e.target.value)}
              />
              <input
                placeholder="外見"
                value={p.look}
                onChange={(e) => updateProperty(i, "look", e.target.value)}
              />
              <input
                placeholder="ジャンル（生存/技術/対話など）"
                value={p.genre}
                onChange={(e) => updateProperty(i, "genre", e.target.value)}
              />
              <input
                placeholder="強度（+3 / +6など）"
                value={p.strength}
                onChange={(e) => updateProperty(i, "strength", e.target.value)}
              />
            </div>
            <div>
              <textarea
                placeholder="備考／特殊能力"
                value={p.notes}
                onChange={(e) => updateProperty(i, "notes", e.target.value)}
                rows={2}
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "4px",
              }}
            >
              <input
                type="checkbox"
                checked={p.broken}
                onChange={(e) => updateProperty(i, "broken", e.target.checked)}
                style={{ marginRight: "4px" }}
              />
              故障中
            </label>
          </div>
        ))}
      </div>

      {/* パワーなど（最低限） */}
      <div
        style={{
          maxWidth: "900px",
          margin: "16px auto 0",
          padding: "8px",
          background: "#fff",
          border: "1px solid #ccc",
        }}
      >
        <div style={{ marginBottom: "8px" }}>
          <input
            placeholder="パワー回復値"
            value={editing.powerRecovery}
            onChange={(e) => updateBasic("powerRecovery", e.target.value)}
          />
        </div>
        {/* ここに判定修正値やダメージ欄も後で追加できる */}
      </div>
    </div>
  );
}
