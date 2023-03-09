interface Iresult {
  rows: {}[];
}
// Использовать если в результате запроса к db должна вернуться только 1 строка
export const validateDbResponse = (result: Iresult): false | object => {
  const { rows } = result;
  if (rows.length !== 1) return false;
  else return rows[0];
};
