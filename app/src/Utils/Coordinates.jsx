import {letterToNumber} from "./Divers";

/**
 * Récupère toutes les coordonnées entre deux points en définissant la position de chaque point (start, middle, end) et l'orientation (vertical, horizontal)
 * @param startX
 * @param startY
 * @param endX
 * @param endY
 * @return {*[]}
 */
export function getAllCoordinates(startX, startY, endX, endY) {
  let coordinates = [];
  let position = 'start';
  let orientation = startX === endX ? 'vertical' : 'horizontal';
  if (orientation === 'vertical') {
    for (let i = startY; i <= endY; i++) {
      position = i === startY ? 'start' : (i === endY ? 'end' : 'middle');
      coordinates.push({x: startX, y: i, position, orientation});
    }
  }
  if (orientation === 'horizontal') {
    for (let i = startX; i <= endX; i++) {
      position = i === startX ? 'start' : (i === endX ? 'end' : 'middle');
      coordinates.push({x: i, y: startY, position, orientation});
    }
  }
  return coordinates;
}

/**
 * Convertit des coordonnées comme (A1) en coordonnées numériques (1,1) pour 2 points (start, end) et retourne un objet avec les coordonnées
 * @param start
 * @param end
 * @return {{endY: number, endX : number, startY: number, startX : number}}
 */

export function getCoordinates(start, end) {
  let startX;
  let startY;
  let endX;
  let endY;

  // get exploitable coordinates
  if (start.length === 3) {
    startX = letterToNumber(start[0]);
    startY = parseInt(start[1] + start[2]);
  }
  if (start.length === 2) {
    startX = letterToNumber(start[0]);
    startY = parseInt(start[1]);
  }
  if (end.length === 3) {
    endX = letterToNumber(end[0]);
    endY = parseInt(end[1] + end[2]);
  }
  if (end.length === 2) {
    endX = letterToNumber(end[0]);
    endY = parseInt(end[1]);
  }

  return {
    startX,
    startY,
    endX,
    endY,
  }
}