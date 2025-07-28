🚧 現在の不要な処理（削除予定）

現在のバックエンドでは、以下の working_backend.py に記述された静的 Q&A ルート が有効になっており、常に 8 件限定 のハードコードされた質問応答しか返せない振る舞いをしています。

# working_backend.py より
qa_dataset = [  # ここに 8 件の Q&A ペアのみが定義されている
    {"id": "1", "question": "FastAPIとは何ですか？", …},
    …  # 合計8エントリ
]

@app.post("/api/search")
def search_similar_questions(request: SearchRequest):
    similar_items = simple_similarity_search(request.question, qa_dataset, top_k=5)
    return SearchResponse(...)

このルートは不要となる予定です。

本番用ルート（backend/app 以下の Embedding→VectorSearch→Completion）にのみ依存させるよう、
working_backend.py の静的検索ルートは 削除

## Excelファイルを用いたQ\&A機能の概要

現在の挙動を以下の手順で、ローカルパスに配置したExcelファイルから質問・回答データを読み込み、Embeddingを生成して検索・UIに表示するフローを実装します。

### 1. 前提条件

* Python環境に `openai`、`pandas`、`faiss`（または任意のベクトルDBクライアント） をインストール
* `.env` に `OPENAI_API_KEY` を設定してあります
* 対象のExcelファイルを以下のように配置してある：

  ```text
  C:\Users\8961078\Desktop\Claude\empower\Example1.xlsx
  C:\Users\8961078\Desktop\Claude\empower\Example2.xlsx
  C:\Users\8961078\Desktop\Claude\empower\Example3.xlsx
  C:\Users\8961078\Desktop\Claude\empower\Example4.xlsx
  C:\Users\8961078\Desktop\Claude\empower\Example5.xlsx
  ```

### 2. データ読み込み

1. `pandas` を使い、各Excelファイルの B列（ヘッダ名: `Q`）を読み込む。
2. 同じ行に対応する日本語質問（`Q`）、日本語回答（C列など任意の列）を取得。

```python
import glob
import pandas as pd

files = glob.glob(r"C:\Users\8961078\Desktop\Claude\*.xlsx")
records = []
for path in files:
    df = pd.read_excel(path)
    for idx, row in df.iterrows():
        records.append({
            "id": f"{path.stem}-{idx}",
            "question": str(row['B']),
            "answer": str(row['A']),  # A列に回答がある想定
        })
```

### 3. Embedding生成とデータ保持

1. `openai` クライアントで `embeddings.create` を呼び出し、`text-embedding-3-large` 等でテキストをベクトル化。
2. ベクトル、ID、質問文、回答文をまとめてストレージ（ファイル・データベース）に保存。

```python
from openai import OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

for rec in records:
    emb = client.embeddings.create(
        model="text-embedding-3-large",
        input=rec['question']
    ).data[0].embedding
    # ストレージに保存
    store_embedding(rec['id'], emb, rec['question'], rec['answer'])
```

### 4. 質問応答フロー　＜　これが一番重要です。

1. ユーザーからの質問を受け取る（例: `/api/search` エンドポイント）。
2. 質問文をEmbeddings APIでベクトル化。
3. 保存済みベクトルとコサイン類似度で検索し、Top-k=5 を取得。
4. 取得結果を選択肢としてフロントに返し、ユーザーに選択を促す。
5. ユーザー選択後、該当IDの回答文をUIに表示。

### 5. UI側連携イメージ　＜　できるだけ現在の形式を保ってください。

```json
// /api/search のレスポンス例
{
  "candidates": [
    { "id": "Example1-0", "question": "～?", "score": 0.95 },
    ... 5 件 ...
  ]
}
```

```javascript
// フロントで選択後 /api/answer?id=Example1-0 へリクエスト
// レスポンス: { answer: "該当データの日本語回答" }
```

---

エラーが出た際は治るまでコーディングを続けて、エラーが出なくなったら作業を止めてhttp://localhost:3000のリンクを出力してください。

追加の改善
# Medical Chatbot README

このドキュメントでは、社内向けMedicalチャットボットの初期表示・FAQ動作・フィードバック動作について仕様をまとめています。

---

## 1. 初期画面表示

- **目的**  
  ユーザーが何も操作していない状態で、FAQ一覧をカテゴリ別に提示します。

- **カテゴリタブ**  
  - Excelマスター（`FAQマスタ.xlsx`）の「カテゴリ」列をそのまま反映  
    - 例：`Terms of use important handling` → `重要事項説明`  
  - 「すべて」タブ：全FAQを表示  
  - 「その他FAQ」タブ：上記カテゴリに該当しないFAQを表示  
- **削除機能**  
  - ダークモード切替機能は不要のため削除

---

## 2. FAQ表示・ボタン動作

1. **FAQ項目クリック**  
   - 該当QAをアコーディオン等で展開表示  
2. **“FAQを表示”ボタン**  
   - 質問後に再度FAQ一覧を正しくレンダリング  
   - 以前の「押してもFAQが出ない」不具合を修正

---

## 3. 回答後のフィードバック

- **文言表示**  
  回答後に「この回答で解決しましたか？」を表示  
  - 「はい」押下：そのまま会話を継続  
  - 「いいえ」押下：以下の文言＋入力欄を表示  
    ```
    申し訳ございません。
    現在のQA集にご要望の回答が見つかりませんでした。
    フィードバックのため、下記フォームにご質問内容を入力してください。
    [────────────────────────────]  ← 質問内容入力欄
    ```

---

## 4. UI／レスポンシブ

- **UIデザイン**  
  - 既存スタイルをそのまま使用（色・フォント変更不要）  
- **レスポンシブ対応**  
  - モバイル／タブレットでも最適化済みとする

---

## 5. 開発・実装上の注意

- FAQカテゴリはコード内にハードコーディングせず、必ずExcelマスターから読み込むこと  
- 英語キーの日本語マッピング例を参考に、他カテゴリも同様に変換を行う  
- “FAQを表示”ボタン押下時の再レンダリング処理を確実に実装  
- フィードバック入力欄は動的に表示／非表示を切り替えられる構造にする  
