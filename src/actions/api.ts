export interface IHistoryEntry {
  role: "function" | "user" | "model" | "system" ;
  parts: { text: string }[];
}

export type IHistory = IHistoryEntry[];



export async function getNextStory(history:IHistory, text: string) {
  const URI = 'https://us-west1-gen-rpg.cloudfunctions.net/storyteller';

  return fetch(URI, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ history: history, text:text }),
  }).then((response) => response.json()).then((data) => {
    return data
  });
}

export async function setStory(text: string) {
  const URI = 'https://us-west1-gen-rpg.cloudfunctions.net/storyteller-1';

  fetch(URI, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text:text }),
  }).then((response) => response.json()).then((data) => {
    return data
  });
}