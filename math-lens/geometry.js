export function cropBounds(rect, viewport, bitmap) {
  const {left, top, right, bottom} = rect;
  if (![left, top, right, bottom, viewport.width, viewport.height, bitmap.width, bitmap.height].every(Number.isFinite)) throw new Error('Некорректная геометрия снимка.');
  if (viewport.width <= 0 || viewport.height <= 0 || bitmap.width <= 0 || bitmap.height <= 0 || right <= left || bottom <= top) throw new Error('Пустая область задания.');
  if (left < 0 || top < 0 || right > viewport.width || bottom > viewport.height) throw new Error('Задание обрезано. Уменьши масштаб страницы, чтобы задание и все ответы были видны целиком.');
  const sx = bitmap.width / viewport.width, sy = bitmap.height / viewport.height;
  const x = Math.floor(left * sx), y = Math.floor(top * sy);
  return {x, y, width: Math.ceil(right * sx) - x, height: Math.ceil(bottom * sy) - y};
}
