import { SocketManagerContext } from "../Contexts/SocketManagerContext.jsx"
import { MatchContext } from "../Contexts/MatchContext.jsx"
import { useContext, useState, useEffect } from "react";

import LoginPage from "./LoginPage.jsx";
import LobbyPage from "./LobbyPage.jsx";
import MatchPage from "./MatchPage.jsx";

export default function MainPages() {
  const socket = useContext(SocketManagerContext);
  const {setOpponent} = useContext(MatchContext);
  const [isInLobby, setIsInLobby] = useState(false);
  const [isInMatch, setIsInMatch] = useState(false);

  useEffect(() => {
    if (socket !== null) {
      socket.on('lobby.enroll.success', () => {
        setIsInLobby(true);
      });
      socket.on('lobby.enroll.error', () => {
        setIsInLobby(false);
      });
      socket.on('lobby.match.found', (data) => {
        setIsInLobby(false);
        setIsInMatch(true);
        setOpponent(data);
      });
      socket.on('disconnect', () => {
        setIsInLobby(false);
        setIsInMatch(false);
        socket.connect();
      });
      socket.onAny((event, ...args) => {
        console.log("onAny event MainPages", event, args);
      });
    }
  }, [socket]);

  return (
    <div className="bg-slate-800 -w-screen max-w-screen min-h-screen text-gray-200 flex flex-col px-2 py-3 items-center text-center justify-center select-none">
      {!isInLobby && !isInMatch &&
        <LoginPage />
      }
      {isInLobby && !isInMatch &&
        <LobbyPage />
      }
      {!isInLobby && isInMatch &&
        <MatchPage />
      }
    </div>
  );
}