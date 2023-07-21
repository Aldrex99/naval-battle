import SocketManagerProvider from "./Contexts/SocketManagerContext.jsx";
import UserProvider from "./Contexts/UserContext.jsx";
import MatchProvider from "./Contexts/MatchContext.jsx";
import MainPages from "./Pages/MainPages.jsx";

export default function App() {
  return (
    <SocketManagerProvider>
      <UserProvider>
        <MatchProvider>
          <MainPages />
        </MatchProvider>
      </UserProvider>
    </SocketManagerProvider>
  );
}