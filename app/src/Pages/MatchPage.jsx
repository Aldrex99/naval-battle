import { SocketManagerContext } from "../Contexts/SocketManagerContext.jsx";
import { MatchContext } from "../Contexts/MatchContext.jsx";
import { UserContext } from "../Contexts/UserContext.jsx";
import { useContext, useEffect, useState } from "react";
import PositionPhaseView from "../Components/PositionPhaseView.jsx";
import GamePhaseView from "../Components/GamePhaseView.jsx";

export default function MatchPage() {
  const socket = useContext(SocketManagerContext);
  const {opponent, positionPhase, setPositionPhase, gamePhase, setGamePhase, setUserTurn} = useContext(MatchContext);

  useEffect(() => {
    if (socket !== null) {
      socket.on('game.ship.position.start', () => {
        console.log('game.ship.position.start')
        setGamePhase(false);
        setPositionPhase(true);
      });
      socket.on('game.start', () => {
        console.log('game.start')
        setPositionPhase(false);
        setGamePhase(true);
      });
      socket.on('game.your-turn.start', () => {
        console.log("game.your-turn.start");
        setUserTurn(true);
      });
      socket.on('game.opponent-turn.start', () => {
        console.log("game.opponent-turn.start");
        setUserTurn(false);
      });
    }
  }, [socket]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <p className="text-2xl">Match en cours contre {opponent}</p>
      {positionPhase &&
        <PositionPhaseView />
      }

      {gamePhase &&
        <GamePhaseView />
      }
    </div>
  );
}