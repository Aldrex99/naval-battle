import {SocketManagerContext} from '../Contexts/SocketManagerContext';
import {MatchContext} from '../Contexts/MatchContext';
import {useEffect, useState, useContext} from 'react';
import {getAllCoordinates, getCoordinates} from '../Utils/Coordinates';
import {colorByBoatType, capitalizeFirstLetter} from "../Utils/Divers";
import {tableHeader} from "../Utils/Table.jsx";

function checkShipSize(startX, startY, endX, endY, size) {
  if (startX === endX) {
    if (Math.abs(startY - endY) + 1 !== size) {
      return false;
    }
  } else if (startY === endY) {
    if (Math.abs(startX - endX) + 1 !== size) {
      return false;
    }
  } else {
    return false;
  }
  return true;
}

const boatList = [
  { name: 'carrier', size: 5 },
  { name: 'battleship', size: 4 },
  { name: 'cruiser', size: 3 },
  { name: 'submarine', size: 3 },
  { name: 'destroyer', size: 2 },
];

export default function PositionPhaseView() {
  const socket = useContext(SocketManagerContext);
  const {setUserShips} = useContext(MatchContext);
  const [tempPlacement, setTempPlacement] = useState([
    {ship: 'carrier', startX: 1, startY: 1, endX: 1, endY: 5},
    {ship: 'battleship', startX: 3, startY: 1, endX: 3, endY: 4},
    {ship: 'cruiser', startX: 5, startY: 1, endX: 7, endY: 1},
    {ship: 'submarine', startX: 7, startY: 3, endX: 7, endY: 5},
    {ship: 'destroyer', startX: 9, startY: 1, endX: 10, endY: 1},
  ]);
  const [placementError, setPlacementError] = useState([]);
  const [placementErrorDisplayed, setPlacementErrorDisplayed] = useState([]);
  const [placementMatrix, setPlacementMatrix] = useState(Array(10).fill(Array(10).fill(false)));
  const [allBoatsPlaced, setAllBoatsPlaced] = useState(false);
  const [boatValid, setBoatValid] = useState([]);
  const [placementDone, setPlacementDone] = useState(false);
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});

  useEffect(() => {
    if (socket !== null) {
      socket.on('game.ship.position.error', (error) => {
        const oldBoatValid = [...boatValid];

        // check if oldBoatValid contains ship
        if (oldBoatValid.includes(error)) {
          oldBoatValid.splice(oldBoatValid.indexOf(error), 1);
          setBoatValid(oldBoatValid);
        }
      });
      socket.on('game.ship.position.success', (ship) => {
        const oldBoatValid = [...boatValid];

        // check if oldBoatValid contains ship
        if (!oldBoatValid.includes(ship)) {
          oldBoatValid.push(ship);
          setBoatValid(oldBoatValid);
        }
      });
      socket.on('game.ship.position.done', () => {
        setPlacementDone(true);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (boatValid.length === 5) {
      setUserShips(tempPlacement);
    }
  }, [boatValid]);

  useEffect(() => {
    const newPlacementMatrix = Array(10).fill(Array(10).fill({shipPresent: false, shipType: '', position: '', orientation: ''})).map((row, i) => row.map((cell, j) => {
      for (let placement of tempPlacement) {
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
    if (tempPlacement.length === boatList.length) {
      setAllBoatsPlaced(true);
    }
  }, [tempPlacement]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({x: e.clientX, y: e.clientY});
    }

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const handleTempPlacement = (e) => {
    e.preventDefault();
    const start = e.target.start.value;
    const end = e.target.end.value;
    const boatName = e.target.start.name;
    const tempPlacementTest = tempPlacement.filter((placement) => placement.ship !== boatName);

    try {
    // check if boat name is valid
    const boatNameTest = boatList.find((boat) => boat.name === boatName);
    if (boatNameTest === undefined) {
      throw new Error('boat name');
    }

    // check if start and end are valid
    if (start.length < 2 || start.length > 3) {
      throw new Error('start length');
    }
    if (end.length < 2 || end.length > 3) {
      throw new Error('end length');
    }

    const {startX, startY, endX, endY} = getCoordinates(start, end);

    // check if coordinates are valid
    if (startX < 1 || startX > 10 || startY < 1 || startY > 10 || endX < 1 || endX > 10 || endY < 1 || endY > 10) {
      throw new Error('out of bounds');
    }

    // check if boat is placed horizontally or vertically
    if (startX !== endX && startY !== endY) {
      throw new Error('not horizontal or vertical');
    }

    // check if size is valid
    const validSize = checkShipSize(startX, startY, endX, endY, boatNameTest.size);
    if (!validSize) {
      throw new Error('invalid size');
    }

    // check if boat is placed on another boat
    const coordinates = getAllCoordinates(startX, startY, endX, endY);
    const coordinatesTest = tempPlacementTest.filter((placement) => {
      return coordinates.some((coordinate) => {
        return coordinate.x >= placement.startX && coordinate.x <= placement.endX && coordinate.y >= placement.startY && coordinate.y <= placement.endY;
      });
    });
    if (coordinatesTest.length > 0) {
      throw new Error('on another boat');
    }

    // delete all errors related to the boat
    const newPlacementError = placementError.filter((error) => error.boat !== boatName);
    setPlacementError(newPlacementError);


    // if the boat is already placed remove it from tempPlacement and add it again
    const newTempPlacement = [...tempPlacementTest, {ship: boatName, startX: startX, startY: startY, endX: endX, endY: endY}];
    setTempPlacement(newTempPlacement);
    } catch (e) {
      if (placementError.some((error) => error.boat === boatName && error.errorType === e.message)) {
        return;
      }
      switch (e.message) {
        case 'boat name':
          const boatNameError = {
            boat: boatName,
            errorType: 'boat name',
            message: 'Le nom du bateau est invalide'
          };
          setPlacementError([...placementError, boatNameError]);
          break;
        case 'start length':
          const startLengthError = {
            boat: boatName,
            errorType: 'start length',
            message: 'La longueur de la coordonnée de départ est invalide'
          }
          setPlacementError([...placementError, startLengthError]);
          break;
        case 'end length':
          const endLengthError = {
            boat: boatName,
            errorType: 'end length',
            message: 'La longueur de la coordonnée de fin est invalide'
          }
          setPlacementError([...placementError, endLengthError]);
          break;
        case 'out of bounds':
          const outOfBoundsError = {
            boat: boatName,
            errorType: 'out of bounds',
            message: 'Les coordonnées sont en dehors de la grille'
          }
          setPlacementError([...placementError, outOfBoundsError]);
          break;
        case 'not horizontal or vertical':
          const notHorizontalOrVerticalError = {
            boat: boatName,
            errorType: 'not horizontal or vertical',
            message: 'Le bateau doit être placé horizontalement ou verticalement'
          }
          setPlacementError([...placementError, notHorizontalOrVerticalError]);
          break;
        case 'invalid size':
          const invalidSizeError = {
            boat: boatName,
            errorType: 'invalid size',
            message: 'La taille du bateau est invalide'
          }
          setPlacementError([...placementError, invalidSizeError]);
          break;
        case 'on another boat':
          const onAnotherBoatError = {
            boat: boatName,
            errorType: 'on another boat',
            message: 'Le bateau est placé sur un autre bateau'
          }
          setPlacementError([...placementError, onAnotherBoatError]);
          break;
        default:
          break;
      }
    }
  }

  const handlePlacement = () => {
    if (tempPlacement.length !== boatList.length) {
      return;
    }
    setUserShips(tempPlacement);
    tempPlacement.map((placement) => {
      socket.emit('game.ship.position', placement);
    });
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {placementErrorDisplayed.length > 0 && (
        <div
          className="absolute border h-fit top-0 left-0 border-red-500 rounded-xl bg-red-300/75 p-2 text-red-700"
          style={{top: mousePosition.y, left: mousePosition.x + 20}}
        >
          {placementErrorDisplayed.length > 0 && (
            placementErrorDisplayed.map((error) => (
                <p key={error.errorType}>{error.message}</p>
              ))
          )}
        </div>
      )}
      <h1 className="text-2xl">Positionnement des bateaux</h1>
      <div className="w-full h-full flex lg:flex-row flex-col items-center justify-center gap-4">
        <div id='boat-placement' className="lg:w-1/2 w-full h-full flex flex-col items-center justify-center gap-2">
          {boatList.map((boat) => (
            <div
              key={boat.name}
              className={`flex flex-row h-20 w-full items-center px-2 border-2 rounded-2xl ${placementError.some((error) => error.boat === boat.name) ? 'border-red-500' : 'border-transparent'}`}
              onMouseEnter={() => {
                if (placementError.some((error) => error.boat === boat.name)) {
                  setPlacementErrorDisplayed(placementError.filter((error) => error.boat === boat.name));
                }
              }}
              onMouseLeave={() => {
                setPlacementErrorDisplayed([]);
              }}
            >
              <div className="flex flex-col gap-2 lg:w-1/5 md:w-2/5 w-1/5">
                <p className="h-fit">{capitalizeFirstLetter(boat.name)}</p>
                <div className="flex flex-row gap-2 px-1 w-full justify-center">
                  {Array(boat.size).fill().map((_, i) => (
                    <div key={i} className={`w-3 h-3 ${colorByBoatType(boat.name)} rounded-full`}></div>
                  ))}
                </div>
              </div>
              <form className="flex flex-row justify-around lg:w-4/5 md:w-3/5 w-4/5" onSubmit={handleTempPlacement}>
                <div className="p-1 flex flex-row gap-2">
                  <label htmlFor="start" className="pr-1 text-orange-400">Début</label>
                  <input
                    className="p-1 text-sm w-20 bg-transparent border rounded-md outline-none"
                    type="text"
                    id="start"
                    name={boat.name}
                    placeholder="A1" />
                </div>
                <div className="p-1 flex flex-row gap-2">
                  <label htmlFor="end" className="pr-1 text-orange-400">Fin</label>
                  <input
                    className="p-1 text-sm w-20 bg-transparent border rounded-md outline-none"
                    type="text"
                    id="end"
                    name={boat.name}
                    placeholder="A5" />
                </div>
                <button
                  type="submit"
                  className="py-1 px-4 bg-teal-500 hover:bg-teal-700 text-xs rounded-md"
                >
                  Valider
                </button>
              </form>
            </div>
          ))}
          <div className="flex flex-row lg:w-2/3 w-full justify-around">
            <button
              type="button"
              className="py-2 px-4 bg-red-500 hover:bg-teal-700 rounded-md"
              onClick={() => {
                setTempPlacement([]);
                setBoatValid([]);
                setPlacementError([]);
                setPlacementErrorDisplayed([]);
                setPlacementMatrix(Array(10).fill(Array(10).fill({shipPresent: false, shipType: '', position: '', orientation: ''})));
              }}
            >
              Réinitialiser
            </button>
            {!placementDone ? (
              <button
                type="button"
                className={`py-2 px-4 bg-teal-500 rounded-md ${allBoatsPlaced ? 'hover:bg-teal-700' : 'opacity-75 cursor-not-allowed'}`}
                disabled={!allBoatsPlaced}
                onClick={handlePlacement}
              >
                Valider définitivement
              </button>
            ) : (
              <div
                className={`py-2 px-4 bg-teal-500 rounded-md`}
              >
                Placement validé
              </div>
            )}
          </div>
        </div>
        <div id='placement-visualisation' className="lg:w-1/2 w-full h-full flex flex-col items-center justify-center">
          <div className="flex flex-row gap-2">
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
        </div>
      </div>
    </div>
  );
}