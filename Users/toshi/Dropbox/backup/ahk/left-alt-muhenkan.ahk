SendMode("Input")
SetWorkingDir(A_ScriptDir)

; 状態変数の初期化
altKeyPressed := false
altKeyPressTime := 0
isChrome := false

; 左Altが押されたときのハンドラ
LAlt:: {
    global altKeyPressed, altKeyPressTime, isChrome
    altKeyPressed := true
    altKeyPressTime := A_TickCount

    ; Chromeがアクティブかどうかを確認
    activeWin := WinGetProcessName("A")
    isChrome := InStr(activeWin, "chrome") > 0

    ; Altキーの通常の動作を抑制せず、そのまま通す
    Send("{LAlt down}")
    return
}

; 左Altが離されたときのハンドラ
LAlt Up:: {
    global altKeyPressed, altKeyPressTime, isChrome

    if (altKeyPressed) {
        altKeyPressed := false
        pressDuration := A_TickCount - altKeyPressTime

        ; Altキーを離す
        Send("{LAlt up}")

        ; 押下時間と判定結果に基づいて処理
        if (isChrome) {
            if (pressDuration < 100) {  ; 0.1秒未満
                Send("{vk1D}")
            }
            ; 0.1秒以上の場合は既にAltキーが送信されているのでそのまま
        } else {
            ; Chrome以外の場合は常に無変換キーを送信
            Send("{vk1D}")
        }
    }
    return
}