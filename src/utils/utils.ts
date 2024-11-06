export function clearAppkitLocalStorage() {
  const keys = Object.keys(localStorage);

  keys.forEach((key) => {
    if (key.includes("appkit")) {
      localStorage.removeItem(key);
    }
  });
}

export function isEmpty(str?: string) {
  return !str || str.length === 0 || str == '""';
}

export function formatTimestamp(timestamp: number | string) {
  const date = new Date(parseFloat(timestamp.toString()));

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
