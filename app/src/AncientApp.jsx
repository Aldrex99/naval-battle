import {useEffect, useState} from 'react'
import socketIO from 'socket.io-client'
import {ChartBarIcon} from "@heroicons/react/24/solid/index.js";

const url = 'https://naval-battle-server.osc-fr1.scalingo.io/';

const socket = socketIO(url, {
  reconnectionAttempts: 50,
  reconnectionDelay: 5000,
});

function transformLetterToNumber(letter) {
  switch (letter) {
    case 'A':
      return 1
    case 'B':
      return 2
    case 'C':
      return 3
    case 'D':
      return 4
    case 'E':
      return 5
    case 'F':
      return 6
    case 'G':
      return 7
    case 'H':
      return 8
    case 'I':
      return 9
    case 'J':
      return 10
    default:
      return 0
  }
}

const boatList = [
  { name: 'carrier', size: 5 },
  { name: 'battleship', size: 4 },
  { name: 'cruiser', size: 3 },
  { name: 'submarine', size: 3 },
  { name: 'destroyer', size: 2 },
]

function allPositionByStartAndEndPosition(startX, startY, endX, endY) {
  const allPosition = [];
  allPosition.push(startX?.toString() + ',' + startY?.toString())
  allPosition.push(endX?.toString() + ',' + endY?.toString())

  if (startX === endX) {
    for (let i = startY + 1; i < endY; i++) {
      allPosition.push(startX.toString() + ',' + i.toString())
    }
  } else {
    for (let i = startX + 1; i < endX; i++) {
      allPosition.push(i.toString() + ',' + startY.toString())
    }
  }
  return allPosition
}

function lenghtIsGood(startX, startY, endX, endY, boatType) {
  const allPosition = allPositionByStartAndEndPosition(startX, startY, endX, endY)
  const boatSize = boatList.find((boat) => boat.name === boatType).size
  return allPosition.length === boatSize
}

function isPositionAvailable(startX, startY, endX, endY, otherUserBoat) {
  const allOtherUserBoatPosition = otherUserBoat.map((boat) => {
    return allPositionByStartAndEndPosition(boat.startX, boat.startY, boat.endX, boat.endY)
  }).flat()
  const allPosition = allPositionByStartAndEndPosition(startX, startY, endX, endY)

  return allPosition.every((position) => !allOtherUserBoatPosition.includes(position))
}

function onlyVerticalOrHorizontal(startX, startY, endX, endY) {
  return startX === endX || startY === endY
}

function isPositionValid(startX, startY, endX, endY, boatType, otherBoatPosition) {
  return (lenghtIsGood(startX, startY, endX, endY, boatType) && isPositionAvailable(startX, startY, endX, endY, otherBoatPosition) && onlyVerticalOrHorizontal(startX, startY, endX, endY))
}

export default function App() {
  const [username, setUsername] = useState('')
  const [isConnectedToServer, setIsConnectedToServer] = useState(false)
  const [isInLobby, setIsInLobby] = useState(false)
  const [isInGame, setIsInGame] = useState(false)
  const [userInLobby, setUserInLobby] = useState([])
  const [userBoatPosition, setUserBoatPosition] = useState([])
  const [tempUserBoatPosition, setTempUserBoatPosition] = useState([])
  const [errorInput, setErrorInput] = useState({})
  const [isReadyForPlacement, setIsReadyForPlacement] = useState(false)
  const [opponent, setOpponent] = useState('')

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnectedToServer(true)
    });

    socket.on('lobby.enroll', (data) => {
      console.log(data)
    });

    socket.on('lobby.enroll.error', (data) => {
      console.log(data)
    });

    socket.on('lobby.enroll.success', () => {
      setIsInLobby(true)
      console.log('success')
    });

    socket.on('lobby.user.joined', (data) => {
      const newUserInLobby = [...userInLobby, data]
      setUserInLobby(newUserInLobby)
      console.log("user joined", data)
    });

    socket.on('lobby.user.left', (data) => {
      const newUserInLobby = userInLobby.filter((user) => user.id !== data.id)
      setUserInLobby(newUserInLobby)
      console.log("user left", data)
    });

    socket.on('lobby.match.found', (data) => {
      setIsInLobby(false)
      setIsInGame(true)
      setOpponent(data)
      console.log("match found", data)
    });

    socket.on('disconnect', () => {
      setIsConnectedToServer(false)
      console.log("disconnect")
    });

    return () => {
      socket.disconnect()
    }
  },[]);

  function handleConnection() {
    if (socket) {
      console.log("connection attempt")
      if (username.length < 3) {
        return
      }
      socket.emit('lobby.enroll.username', username)
    }
  }

  function handleDisconnect() {
    setIsInLobby(false)
  }

  function colorByBoatType(boatType) {
    switch (boatType) {
      case 'carrier':
        return ' bg-red-500'
      case 'battleship':
        return ' bg-green-500'
      case 'cruiser':
        return ' bg-yellow-500'
      case 'submarine':
        return ' bg-blue-500'
      case 'destroyer':
        return ' bg-purple-500'
      default:
        return ' bg-gray-500'
    }
  }

  function colorTempByBoatType(boatType) {
    switch (boatType) {
      case 'carrier':
        return ' bg-red-300'
      case 'battleship':
        return ' bg-green-300'
      case 'cruiser':
        return ' bg-yellow-300'
      case 'submarine':
        return ' bg-blue-300'
      case 'destroyer':
        return ' bg-purple-300'
      default:
        return ' bg-gray-300'
    }
  }

  function classForColor(actualPosition) {
    const boat = userBoatPosition.find((boat) => allPositionByStartAndEndPosition(boat.startX, boat.startY, boat.endX, boat.endY).includes(actualPosition))
    const tempBoat = tempUserBoatPosition.find((boat) => allPositionByStartAndEndPosition(boat.startX, boat.startY, boat.endX, boat.endY).includes(actualPosition))
    console.log(boat)
    if (boat) {
      return colorByBoatType(boat.ship)
    } else if (tempBoat) {
      return colorTempByBoatType(tempBoat.ship)
    } else {
      return ''
    }
  }

  function generateTable() {
    const table = []
    for (let i = 0; i < 10; i++) {
      const children = []
      for (let j = 0; j < 11; j++) {
        children.push(
          <td key={j}
            id={j !== 0 ? `${j},${i+1}` : ""}
            className={`
            w-10 h-10 text-center text-sm
            ${j !== 0 ? classForColor(`${j},${i+1}`) : ""}
            `}
        >{j === 0 ? i + 1 : ""}</td>)
      }
      table.push(<tr key={i} className="divide-x divide-orange-400">{children}</tr>)
    }
    return (
      <table className="table-auto divide-y divide-orange-400 border-2 border-orange-400">
        <thead>
        <tr className="divide-x divide-orange-400">
          <th className="w-10 h-10"></th>
          <th className="w-10 h-10">A</th>
          <th className="w-10 h-10">B</th>
          <th className="w-10 h-10">C</th>
          <th className="w-10 h-10">D</th>
          <th className="w-10 h-10">E</th>
          <th className="w-10 h-10">F</th>
          <th className="w-10 h-10">G</th>
          <th className="w-10 h-10">H</th>
          <th className="w-10 h-10">I</th>
          <th className="w-10 h-10">J</th>
        </tr>
        </thead>
        <tbody className="divide-y divide-orange-400">
          {table}
        </tbody>
      </table>
    )
  }

  function generateOpponentTable() {
    const table = []
    for (let i = 0; i < 10; i++) {
      const children = []
      for (let j = 0; j < 11; j++) {
        children.push(<td key={j}
                          id={j !== 0 ? `${j},${i+1}` : ""}
                          className={`w-10 h-10 text-center text-sm`}
        >{j === 0 ? i + 1 : ""}</td>)
      }
      table.push(<tr key={i} className="divide-x divide-orange-400">{children}</tr>)
    }
    return (
      <table className="table-auto divide-y divide-orange-400 border-2 border-orange-400">
        <thead>
        <tr className="divide-x divide-orange-400">
          <th className="w-10 h-10"></th>
          <th className="w-10 h-10">A</th>
          <th className="w-10 h-10">B</th>
          <th className="w-10 h-10">C</th>
          <th className="w-10 h-10">D</th>
          <th className="w-10 h-10">E</th>
          <th className="w-10 h-10">F</th>
          <th className="w-10 h-10">G</th>
          <th className="w-10 h-10">H</th>
          <th className="w-10 h-10">I</th>
          <th className="w-10 h-10">J</th>
        </tr>
        </thead>
        <tbody className="divide-y divide-orange-400">
        {table}
        </tbody>
      </table>
    )
  }

  function setBoatPosition(position, boatType, positionType, idForError) {
    const newErrorInput = {...errorInput}
    delete newErrorInput[idForError]
    delete newErrorInput[boatType]
    setErrorInput(newErrorInput)

    const alreadyPlacedList = tempUserBoatPosition
    const verticalValue = Number(transformLetterToNumber(position.split('')[0]));
    let horizontalValue;
    if (position.length === 3) {
      horizontalValue = Number((position.split('')[1]) + position.split('')[2]);
    } else {
      horizontalValue = Number(position.split('')[1]);
    }

    if (verticalValue === 0 || horizontalValue === 0 || verticalValue > 10 || horizontalValue > 10) {
      setErrorInput({...errorInput, [idForError]: 'Position invalide'})
    }

    const alreadyPlaced = alreadyPlacedList.find((boat) => boat.ship === boatType);
    if (alreadyPlaced) {
      if (positionType === 'start') {
        const newBoat = {
          ...alreadyPlaced,
          startX: verticalValue,
          startY: horizontalValue,
        };

        const newTempBoatList = alreadyPlacedList.filter((boat) => boat.ship !== boatType);
        setTempUserBoatPosition([...newTempBoatList, newBoat]);

        if (!isPositionValid(newBoat.startX, newBoat.startY, newBoat.endX, newBoat.endY, boatType, userBoatPosition)) {
          return setErrorInput({...errorInput, [boatType]: 'Position invalide'});
        }

        const newBoatList = userBoatPosition.filter((boat) => boat.ship !== boatType);
        setUserBoatPosition([...newBoatList, newBoat]);
      } else if (positionType === 'end') {
        const newBoat = {
          ...alreadyPlaced,
          endX: verticalValue,
          endY: horizontalValue,
        };

        const newTempBoatList = alreadyPlacedList.filter((boat) => boat.ship !== boatType);
        setTempUserBoatPosition([...newTempBoatList, newBoat]);

        if (!isPositionValid(newBoat.startX, newBoat.startY, newBoat.endX, newBoat.endY, boatType, userBoatPosition)) {
          return setErrorInput({...errorInput, [boatType]: 'Position invalide'})
        }

        const newBoatList = alreadyPlacedList.filter((boat) => boat.ship !== boatType)
        setUserBoatPosition([...newBoatList, newBoat])
      }
    } else {
      if (positionType === 'start') {
        const newBoat = {
          ship: boatType,
          startX: verticalValue,
          startY: horizontalValue,
        };

        setTempUserBoatPosition([...tempUserBoatPosition, newBoat])
        setUserBoatPosition([...userBoatPosition, newBoat])
      } else if (positionType === 'end') {
        const newBoat = {
          ship: boatType,
          endX: verticalValue,
          endY: horizontalValue,
        };

        setTempUserBoatPosition([...tempUserBoatPosition, newBoat])
        setUserBoatPosition([...userBoatPosition, newBoat])
      }
    }
  }

  useEffect(() => {
    console.log(userBoatPosition)
    if (userBoatPosition.length === 5) {
      setIsReadyForPlacement(true)
    } else {
      setIsReadyForPlacement(false)
    }
  }, [userBoatPosition])

  function handleValidatePlacement() {
    if (userBoatPosition.length !== 5) {
      return setErrorInput({...errorInput, placement: 'Vous devez placer 5 bateaux'})
    }
    setIsReadyForPlacement(false)
  }

  return (
    <div className="bg-slate-800 w-screen h-screen text-gray-200 flex flex-col p-2 justify-center">
      <h1 className="text-2xl font-semibold text-center pb-2">La bataille navale</h1>
      <div className="flex flex-row justify-center gap-2">

        {!isInLobby && !isInGame && (
          <div className="flex flex-col gap-2">
            <label className="text-center p-2 text-orange-400">Nom d'utilisateur</label>
            <input
              className="rounded-md p-2 text-gray-700 outline-none border-2 border-white focus:border-orange-400 focus:border-2"
              type="text"
              placeholder={'Nom d\'utilisateur'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              className="rounded-md p-2 bg-orange-400 text-gray-800 font-semibold"
              onClick={() => handleConnection()}
            >
              Se connecter
            </button>
            <p className={`${isConnectedToServer ? "text-green-500" : "text-red-500"} text-center`}>
              <ChartBarIcon className="inline w-4 h-4" /> {isConnectedToServer ? 'Serveur disponible' : 'Serveur indisponible'}
            </p>
          </div>
        )}

        {isInLobby && (
          <div className="flex flex-col gap-2">
            <p className="text-center">Vous êtes connecté en tant que {username}</p>
            <p className="text-center">Vous êtes dans le lobby</p>
            <p className="text-center">Utilisateurs dans le lobby : <span className="font-semibold text-orange-400">{userInLobby.length}</span></p>
            <div className="text-center">
              <p>Utilisateurs dans le lobby :</p>
              <ul className="list-disc list-inside">
                {userInLobby.map((user) => (
                  <li key={user.id}>{user}</li>
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
        )}

        {isInGame && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-center w-screen gap-16">
              <div>
                <p className="text-center">Placez vos bateaux</p>
                <div className="flex flex-col justify-center w-56">
                  {boatList.map((boat) => (
                    <div key={boat.name} className="flex flex-col p-1">
                      <p className="text-center">{boat.name} <span>{errorInput[boat.name]}</span></p>
                      <div className="flex flex-row justify-around h-20 border">
                        <div className="flex flex-col justify-center">
                          <p className="text-center">Début</p>
                          <input
                            type="text"
                            placeholder="A1"
                            className={`mx-auto rounded-md w-12 text-gray-700 outline-none border-2 border-white focus:border-orange-400 focus:border-2 ${errorInput[boat.name] ? 'border-red-500' : ''}`}
                            onChange={(e) => setBoatPosition(e.target.value, boat.name, 'start', boat.name)}
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-center">Fin</p>
                          <input
                            type="text"
                            placeholder="A1"
                            className={`mx-auto rounded-md w-12 text-gray-700 outline-none border-2 border-white focus:border-orange-400 focus:border-2 ${errorInput[boat.name] ? 'border-red-500' : ''}`}
                            onChange={(e) => setBoatPosition(e.target.value, boat.name, 'end', boat.name)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-around">
                <div className="flex flex-row gap-4">
                  <div>
                    <p className="text-center">Vous</p>
                    {generateTable()}
                  </div>
                  <div>
                    <p className="text-center">Adversaire : {opponent}</p>
                    {generateOpponentTable()}
                  </div>
                </div>
                  {isReadyForPlacement && (
                    <button
                      className="rounded-md p-2 bg-orange-400 hover:bg-red-500 text-gray-800 font-semibold"
                      onClick={() => handleValidatePlacement()}
                    >
                      Valider le placement
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}