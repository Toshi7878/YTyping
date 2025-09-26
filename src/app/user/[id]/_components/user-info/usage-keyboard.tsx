interface KeyBoardProps {
  keyboard: string
}

const KeyBoard = ({ keyboard }: KeyBoardProps) => {
  if (!keyboard) {
    return <p>使用キーボードは未設定です</p>
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">使用キーボード:</span>
      <span>{keyboard}</span>
    </div>
  )
}

export default KeyBoard
