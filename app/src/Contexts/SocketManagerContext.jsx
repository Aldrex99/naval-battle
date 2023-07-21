import { createContext } from 'react';
import SocketIO from 'socket.io-client';
import { useState, useEffect } from 'react';

const url = 'https://naval-battle-server.osc-fr1.scalingo.io/';

export const SocketManagerContext = createContext();

const SocketManagerProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = SocketIO(url);
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    console.log("socket", socket);
  }, [socket]);

  return (
    <SocketManagerContext.Provider value={socket}>
      {children}
    </SocketManagerContext.Provider>
  );
}

export default SocketManagerProvider;