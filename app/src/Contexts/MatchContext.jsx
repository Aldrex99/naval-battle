import { createContext } from 'react';
import { useState } from 'react';

export const MatchContext = createContext();

const MatchProvider = ({ children }) => {
  const [opponent, setOpponent] = useState('opponentTest');
  const [positionPhase, setPositionPhase] = useState(false);
  const [gamePhase, setGamePhase] = useState(false);
  const [userShips, setUserShips] = useState([]);
  const [userTurn, setUserTurn] = useState(false);
  const [userShoots, setUserShoots] = useState([]);

  const value = {
    opponent: opponent,
    setOpponent: setOpponent,
    positionPhase: positionPhase,
    setPositionPhase: setPositionPhase,
    gamePhase: gamePhase,
    setGamePhase: setGamePhase,
    userShips: userShips,
    setUserShips: setUserShips,
    userTurn: userTurn,
    setUserTurn: setUserTurn,
    userShoots: userShoots,
    setUserShoots: setUserShoots
  }

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  );
}

export default MatchProvider;