import { useContext, useEffect, useState } from "react";
import { SocketManagerContext } from "../Contexts/SocketManagerContext.jsx";
import { UserContext } from "../Contexts/UserContext.jsx";

export default function LobbyPage() {
  const socket = useContext(SocketManagerContext);
  const {username, setUsername} = useContext(UserContext);
  const [userInLobby, setUserInLobby] = useState([username]);

  useEffect(() => {
    if (socket !== null) {
      socket.on('lobby.enroll.joined', (users) => {
        console.log(users)
        setUserInLobby([...userInLobby, users]);
      });
      socket.on('lobby.enroll.left', (users) => {
        console.log(users)
        const newUserInLobby = userInLobby.filter((user) => user !== users);
        setUserInLobby(newUserInLobby);
      });
    }
  }, [socket]);

  const handleDisconnect = () => {
    socket.disconnect();
    setUsername('');
  }

  return (
    <div className="flex flex-col gap-2 w-1/3">
      <p className="text-center">Votre pseudo <span className="text-orange-400 font-semibold">{username}</span></p>
      <div className="text-center bg-gray-900/50 rounded-xl p-4">
        <p className="text-orange-400 pb-2">{userInLobby.length} utilisateurs dans le lobby :</p>
        <ul className="list-none list-inside">
          {userInLobby.map((user, idx) => (
            <li key={idx}>{user}</li>
          ))}
        </ul>
      </div>
      <button
        className="rounded-md p-2 bg-orange-400 text-gray-800 font-semibold"
        onClick={() => handleDisconnect()}
      >
        Se déconnecter
      </button>
    </div>
  )
}