import { router, socket } from "../routes.js";

export default function renderScreen1() {
  const app = document.getElementById("app");
  app.innerHTML = `
        <h1>Clasificaciones</h1>
        <div id='Lista'></div>
    `;

// Al cargar la página emite que se ha  unido para que el servidor
// envíe los jugadores, en caso de que se recargue la página o 
// se abra una nueva y una partida ya hubiese comenzado
  socket.emit("clasificationJoined")
  

// Imprime los jugadores enviados por el servidor
  socket.on("Players", (data) => {
    const list = document.getElementById('Lista');
    list.innerHTML = '';
    const userData = data.players;
    userData.forEach(user => {
      const p = document.createElement('p');
      p.innerText = user.nickname + ' ' + user.points
      list.appendChild(p);
    });
  });

// Cada que un jugador se recibe de nuevo la lista
// para actualizarse
  socket.on("userJoined", (data) => {
    const list = document.getElementById('Lista');
    list.innerHTML = '';
    const players = data.players;
    const sortedPlayers = players.sort((a, b) => b.points - a.points);
    sortedPlayers.forEach((user,index) => {
      const p = document.createElement('p');
      p.innerText = `${index + 1}. ${user.nickname} - ${user.points}`;
      list.appendChild(p);
    });
  });

// Cuando hay un ganador navega automáticamente
// a la screen2, guardando el winner en el sessionStorage
// para que la screen2 la use
  socket.on("gameWinner", (winner) => {
    sessionStorage.setItem("winner", JSON.stringify(winner));
    router.navigateTo("/screen2");
  });
  
}
