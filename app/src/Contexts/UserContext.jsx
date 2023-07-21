import { createContext } from 'react';
import { useState } from 'react';

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('test');

  const value = {
    username: username,
    setUsername: setUsername,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;