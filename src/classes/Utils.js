export const delay = (callback, timeOut = 20) => setTimeout(callback, timeOut);

export const randomId = (length = 6) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export const randomIdOnlyNumber = (length = 6) => {
  let result = '';
  const characters = '123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export const sortRandom = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5)
}

export const stringContains = (arrayOfString, longString) => {
  return arrayOfString.some(v => longString.includes(v))
}

export const createArray = (number) => {
  if (!number) return []
  return [...Array(number).keys()]
}