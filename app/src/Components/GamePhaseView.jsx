import { SocketManagerContext } from "../Contexts/SocketManagerContext";
import { MatchContext } from "../Contexts/MatchContext";
import { UserContext } from "../Contexts/UserContext";
import {useContext, useEffect, useState} from "react";
import {colorByBoatType} from "../Utils/Divers.jsx";
import {getAllCoordinates} from "../Utils/Coordinates.jsx";
import {FireIcon} from "@heroicons/react/24/outline/index.js";
import {tableHeader} from "../Utils/Table.jsx";


export default function GamePhaseView() {
  const socket = useContext(SocketManagerContext);
  const { opponent, userShips, userShoots, setUserShoots, userTurn } = useContext(MatchContext);
  const { username } = useContext(UserContext);
  const [placementMatrix, setPlacementMatrix] = useState(Array(10).fill(Array(10).fill({shipPresent: false, shipType: '', position: '', orientation: ''})));
  const [userShootsMatrix, setUserShootsMatrix] = useState(Array(10).fill(Array(10).fill({shot: false, hit: false})));

  useEffect(() => {
    if (socket !== null) {
      socket.on('game.your-turn.shot.error', (data) => {
        console.log("game.your-turn.shot.error");
        console.log("data", data);
      });
      socket.on('game.your-turn.shoot.fired', (data) => {
        console.log("game.your-turn.shoot.fired");
        console.log("data", data);
      });
      socket.on('game.opponent-turn.shoot.received', (data) => {
        console.log("game.opponent-turn.shoot.received");
        console.log("data", data);
      });
      socket.on('game.your-turn.shoot.success', (data) => {
        console.log("game.your-turn.shoot.success");
        console.log("data", data);
      });
      socket.on('game.your-turn.shoot.miss', (data) => {
        console.log("game.your-turn.shoot.miss");
        console.log("data", data);
      });
    }
  }, [socket]);

  useEffect(() => {
    const newPlacementMatrix = Array(10).fill(Array(10).fill({shipPresent: false, shipType: '', position: '', orientation: ''})).map((row, i) => row.map((cell, j) => {
      for (let placement of userShips) {
        const coordinates = getAllCoordinates(placement.startX, placement.startY, placement.endX, placement.endY);
        for (let coordinate of coordinates) {
          if (coordinate.x === j+1 && coordinate.y === i+1) {
            return {shipPresent: true, shipType: placement.ship, position: coordinate.position, orientation: coordinate.orientation};
          }
        }
      }
      return {shipPresent: false, shipType: '', position: '', orientation: ''};
    }));
    setPlacementMatrix(newPlacementMatrix);
  }, [userShips]);

  useEffect(() => {
    const newUserShootsMatrix = Array(10).fill(Array(10).fill({shoot: false, hit: false})).map((row, i) => row.map((cell, j) => {
      for (let shoot of userShoots) {
        if (shoot.x === j+1 && shoot.y === i+1) {
          return {shoot: true, hit: shoot.hit};
        }
      }
      return {shoot: false, hit: false};
    }));
    setUserShootsMatrix(newUserShootsMatrix);
    console.log(userShoots)
  }, [userShoots]);

  return (
    <div className="w-full h-full flex lg:flex-row flex-col items-center justify-center">
      <div id="user-part" className="lg:w-1/2 w-full h-full border-2 flex flex-col items-center justify-center">
        <table className="table-auto divide-y divide-orange-400 border-2 border-orange-400">
          {tableHeader()}
          <tbody className="divide-y divide-orange-400">
          {Array(10).fill().map((_, i) => (
            <tr key={i} className="divide-x divide-orange-400">
              <td className="w-10 h-10">{i + 1}</td>
              {Array(10).fill().map((_, j) => (
                <td key={j} className={`w-10 h-10 ${placementMatrix[i][j].shipPresent ? colorByBoatType(placementMatrix[i][j].shipType) : ""} ${placementMatrix[i][j].position === 'start' && placementMatrix[i][j].orientation === 'horizontal' ? "rounded-l-full" : ""} ${placementMatrix[i][j].position === 'end' && placementMatrix[i][j].orientation === 'horizontal' ? "rounded-r-full" : ""} ${placementMatrix[i][j].position === 'start' && placementMatrix[i][j].orientation === 'vertical' ? "rounded-t-full" : ""} ${placementMatrix[i][j].position === 'end' && placementMatrix[i][j].orientation === 'vertical' ? "rounded-b-full" : ""}`} title={placementMatrix[i][j].shipPresent ? placementMatrix[i][j].shipType : ""}></td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
      <div className="lg:w-64 w-full lg:h-full h-32 border-2 border-green-500 flex flex-col justify-center">
        {userTurn === true ? (
          <p className="text-orange-400 font-semibold">C'est à toi de jouer</p>
        ) : (
          <p className="text-cyan-400 font-semibold">C'est à {opponent} de jouer</p>
        )}

      </div>
      <div id="opponent-part" className="lg:w-1/2 w-full h-full border-2 border-red-500 flex flex-col items-center justify-center">
        <table className="table-auto divide-y divide-cyan-400 border-2 border-cyan-400">
          {tableHeader(true)}
          <tbody className="divide-y divide-cyan-400">
          {Array(10).fill().map((_, i) => (
            <tr key={i} className="divide-x divide-cyan-400">
              <td className="w-10 h-10">{i + 1}</td>
              {Array(10).fill().map((_, j) => (
                <td
                  key={j}
                  className={`w-10 h-10 rounded-full ${userShootsMatrix[i][j].shoot ? userShootsMatrix[i][j].hit ? "bg-red-500" : "bg-white" : "cursor-pointer"}`}
                  onClick={() => {
                    if (socket !== null) {
                      if (userShootsMatrix[i][j].shoot === false) {
                        socket.emit('game.round.shot', {x: j+1, y: i+1});
                        console.log('game.round.shot', {x: j+1, y: i+1});
                        setUserShoots([...userShoots, {x: j+1, y: i+1, hit: false}]);
                      }
                    }
                  }}
                >
                  <FireIcon className={`w-8 h-8 m-auto text-transparent ${!userShootsMatrix[i][j].shoot && "hover:text-orange-500"}`} />
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}