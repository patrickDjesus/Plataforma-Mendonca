let gameActive = false;

export const setGameActive = (active: boolean) => {
  gameActive = active;
};

export const isGameActive = () => gameActive;