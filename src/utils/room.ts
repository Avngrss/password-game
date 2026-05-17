export const getRoomIdFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const room = params.get("room");
  return room && room.trim() ? room.trim().toUpperCase() : null;
};

export const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const setRoomIdInUrl = (roomId: string) => {
  const newUrl = `${window.location.pathname}?room=${roomId}`;
  window.history.pushState({ path: newUrl }, "", newUrl);
};
