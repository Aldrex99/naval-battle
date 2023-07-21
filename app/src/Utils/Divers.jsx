export function letterToNumber(letter) {
  return letter.charCodeAt(0) - 64;
}

export function numberToLetter(number) {
  return String.fromCharCode(number + 64);
}

export function colorByBoatType(boatType) {
  switch (boatType) {
    case 'carrier':
      return 'bg-indigo-400'
    case 'battleship':
      return 'bg-rose-400'
    case 'cruiser':
      return 'bg-sky-400'
    case 'submarine':
      return 'bg-lime-400'
    case 'destroyer':
      return 'bg-amber-400'
    default:
      return 'bg-gray-500'
  }
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}