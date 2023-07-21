import {ChartBarIcon} from "@heroicons/react/24/solid/index.js";
import {useState, useContext, useEffect} from "react";
import {SocketManagerContext} from "../Contexts/SocketManagerContext.jsx";
import {UserContext} from "../Contexts/UserContext.jsx";

export default function LoginPages() {
  const socket = useContext(SocketManagerContext);
  const {username, setUsername} = useContext(UserContext);
  const [isConnected, setIsConnected] = useState(false);


  useEffect(() => {
    if (socket !== null) {
      socket.on('connect', () => {
        console.log('connected')
        setIsConnected(true);
      });
      socket.on('disconnect', () => {
        console.log('disconnected')
        setIsConnected(false);
      });
    }
  }, [socket]);

  function handleConnection() {
    socket.emit('lobby.enroll.username', username);
  }

  return (
    <div className="flex flex-col gap-4 w-1/3">
      <h1 className="text-2xl font-semibold text-orange-500">Bienvenue renseigner votre Pseudo pour rejoindre le lobby</h1>
      <label htmlFor="username" className="text-center p-2 text-orange-400 sr-only">Nom d'utilisateur</label>
      <input
        id="username"
        className="rounded-md p-2 text-gray-700 outline-none border-2 border-white focus:border-orange-400 focus:border-2"
        type="text"
        placeholder={'Pseudo'}
        value={username.toString()}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        className="rounded-md p-2 bg-orange-400 text-gray-800 font-semibold"
        onClick={() => handleConnection()}
      >
        Se connecter
      </button>
      <p className={`${isConnected ? "text-green-500" : "text-red-500"} text-center`}>
        <ChartBarIcon className="inline w-4 h-4" /> {isConnected ? 'Serveur disponible' : 'Serveur indisponible'}
      </p>
    </div>
  )
}