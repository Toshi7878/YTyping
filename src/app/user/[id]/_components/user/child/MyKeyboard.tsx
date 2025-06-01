interface MyKeyBoardProps {
  myKeyboard: string;
}

const MyKeyBoard = ({ myKeyboard }: MyKeyBoardProps) => {
  if (!myKeyboard) {
    return <p>使用キーボードは未設定です</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">使用キーボード:</span>
      <span>{myKeyboard}</span>
    </div>
  );
};

export default MyKeyBoard;
