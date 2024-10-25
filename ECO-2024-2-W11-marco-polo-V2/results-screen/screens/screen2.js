import { router, socket } from "../routes.js";

export default function renderScreen2() {
  const app = document.getElementById("app");
  app.innerHTML = `
        <h1>Ganador</h1>
        <h3 id="Winner"></h3> 
        <div id='Lista'></div>
        <button id='order'>Ordenar alfabéticamente</button> 
        <button id='clasificationPage'>Volver a la página de clasificaciones</button> 
    `;

    // La avisa al servidor cuando se une 
    // para que envíe la lista de jugadores
    socket.emit("clasificationJoined")

    const clasificationPage = document.getElementById('clasificationPage')
    clasificationPage.addEventListener('click', () => {
      router.navigateTo('/')
    })

    //Resaltar el ganador
    const h1 = document.getElementById('Winner');
    const winnerData = sessionStorage.getItem("winner")
    const winner = JSON.parse(winnerData);
    h1.innerText = winner.nickname;


    socket.on("gameWinner", (winner) => {
      const h1 = document.getElementById('Winner');
      h1.innerText = '';
      h1.innerText = winner.nickname;
    })

    // Mostrar los jugadores según la puntuación de mayor a menor
    // y los guarda en sessionStorage para ser usado por el boton
    // que los ordena alfabéticamente
    socket.on("Players", (data) => {
      const list = document.getElementById('Lista');
      list.innerHTML = '';
      const currentPlayers = data.players;
      const sortedPlayers = currentPlayers.sort((a, b) => b.points - a.points);
      sessionStorage.setItem("playersList", JSON.stringify(currentPlayers));
      sortedPlayers.forEach((user,index) => {
        const p = document.createElement('p');
        p.innerText = `${index + 1}. ${user.nickname}. ${user.points}`;
        list.appendChild(p);
      });
    });

    // Event listener para el botón de ordenar alfabéticamente
    const orderButton = document.getElementById('order');
    const storedPlayers = JSON.parse(sessionStorage.getItem("playersList"));
    orderButton.addEventListener('click', () => {
    const list = document.getElementById('Lista');
    list.innerHTML = '';
    // Ordenar jugadores alfabéticamente por nickname
    const sortedPlayers = storedPlayers.sort((a, b) => a.nickname.localeCompare(b.nickname));
    list.innerHTML = ''; 
    sortedPlayers.forEach((user, index) => {
      const p = document.createElement('p');
      p.innerText = `${index + 1}. ${user.nickname} - ${user.points}`;
      list.appendChild(p);
    });
  });
}
