import React from 'react';
import './style.less';

export default function Game(): JSX.Element {
  const BoxStyle = {
    display: 'flex',
    justifyContent: 'center',
  };

  const Square = ({ value, onClick }: { value: number; onClick: () => void }) => {
    return (
      <button className="square" onClick={e => onClick()}>
        {value}
      </button>
    );
  };

  const Board = () => {
    const [squares, setSquares] = React.useState(Array(9).fill(null));
    const [xIsNext, setXisNext] = React.useState('');
    let [count, setCount] = React.useState(0);
    const winner = calculateWinner(squares);

    const handleClick = (index: number) => {
      const square: string[] = squares.slice();
      if (!square[index]) {
        if (xIsNext === 'X') {
          square[index] = 'X';
          setXisNext('O');
        } else {
          square[index] = 'O';
          setXisNext('X');
        }
        setCount(() => ++count);
        setSquares(square);
      }
    };

    const renderSquare = (index: number) => {
      return <Square value={squares[index]} onClick={() => !winner && handleClick(index)} />;
    };

    let [status, setStatus] = React.useState('');
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      count === 9 ? (status = 'The game was not settled !') : (status = 'Next player: ' + xIsNext);
    }

    const reset = () => {
      setCount(0);
      setXisNext('');
      setSquares([]);
      setStatus('');
    };

    return (
      <div>
        <div style={{ display: 'flex' }}>
          <div className="status">{status}</div>
          {count === 9 && !winner && (
            <button style={{ marginLeft: 20 }} onClick={() => reset()}>
              Reset
            </button>
          )}
          {winner && (
            <button style={{ marginLeft: 20 }} onClick={() => reset()}>
              Again
            </button>
          )}
        </div>
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
