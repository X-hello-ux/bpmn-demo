import React from 'react';
import './style.less';

export default function Game(): JSX.Element {
  document.title = '井字棋';

  const BoxStyle = {
    display: 'flex',
    justifyContent: 'center',
  };

  const Square = ({
    value,
    onClick,
    onContextMenu,
  }: {
    value: number;
    onClick: () => void;
    onContextMenu: () => void;
  }) => {
    return (
      <button className="square" onClick={e => onClick()} onContextMenu={e => onContextMenu()}>
        {value}
      </button>
    );
  };

  const Board = () => {
    const [squares, setSquares] = React.useState(Array(9).fill(null));
    const [xIsNext, setXisNext] = React.useState('');

    const handleClick = (index: number) => {
      const square: string[] = squares.slice();
      ((!square[index] && xIsNext === 'X') || xIsNext === '') && (square[index] = 'X');
      setSquares(square);
      setXisNext('O');
    };

    const handleContextMenu = (index: number) => {
      const square: string[] = squares.slice();
      ((!square[index] && xIsNext === 'O') || xIsNext === '') && (square[index] = 'O');
      setSquares(square);
      setXisNext('X');
    };

    const renderSquare = (index: number) => {
      return (
        <Square
          value={squares[index]}
          onClick={() => handleClick(index)}
          onContextMenu={() => handleContextMenu(index)}
        />
      );
    };

    const winner = calculateWinner(squares);
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + xIsNext;
    }

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="board-row">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="board-row">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>
    );
  };

  const calculateWinner = (squares: string[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  return (
    <div style={BoxStyle}>
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    </div>
  );
}
