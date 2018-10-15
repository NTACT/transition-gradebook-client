
const largeMin = 1100;
const mediumMax = largeMin - 1;
const mediumMin = 700;
const smallMax = mediumMin - 1;

export const large = `screen and (min-width: ${largeMin}px)`;
export const medium = `screen and (min-width: ${mediumMin}px) and (max-width: ${mediumMax}px)`;
export const mediumOrSmall = `screen and (max-width: ${mediumMax}px)`;
export const small = `screen and (max-width: ${smallMax}px)`;
