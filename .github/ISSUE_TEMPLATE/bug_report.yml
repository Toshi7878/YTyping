name: 🐛 バグ報告
description: バグを報告する
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        バグ報告ありがとうございます。以下の情報を記入してください。

  - type: textarea
    id: description
    attributes:
      label: バグの説明
      description: バグの内容を詳しく説明してください
      placeholder: できるだけ具体的に記述してください
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: 再現手順
      description: バグを再現するための手順を記述してください
      placeholder: |
        1. '...' に移動
        2. '....' をクリック
        3. '....' までスクロール
        4. エラーが発生
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: 期待する動作
      description: 本来期待される動作を記述してください
    validations:
      required: true

  - type: dropdown
    id: browsers
    attributes:
      label: 発生したブラウザ
      multiple: true
      options:
        - Chrome
        - Firefox
        - Safari
        - Edge
        - その他
