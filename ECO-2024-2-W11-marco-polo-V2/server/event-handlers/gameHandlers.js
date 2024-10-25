
const { assignRoles } = require("../utils/helpers")


const joinGameHandler = (socket, db, io) => {
  return (user) => {
    db.players.push({ id: socket.id, ...user })
    console.log(db.players)
    io.emit("userJoined", db)
  }
}

const startGameHandler = (socket, db, io) => {
  return () => {
    db.players = assignRoles(db.players)

    db.players.forEach((element) => {
      io.to(element.id).emit("startGame", element.role)
    })
  }
}

const notifyMarcoHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter(
      (user) => user.role === "polo" || user.role === "polo-especial"
    )

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Marco!!!",
        userId: socket.id,
      })
    })
  }
}

const notifyPoloHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter((user) => user.role === "marco")

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Polo!!",
        userId: socket.id,
      })
    })
  }
}

const onSelectPoloHandler = (socket, db, io) => {
  return (userID) => {
    const myUser = db.players.find((user) => user.id === socket.id)
    const poloSelected = db.players.find((user) => user.id === userID)

    if (poloSelected.role === "polo-especial") {
      // Añadir puntos al marco si el polo especial es capturado y 
      // restarle al polo especial
      db.players.map(user => {  
        if (user.role === 'marco'){
          user.points = user.points + 50
        } else if (user.role === 'polo-especial') {
          user.points = user.points - 10
        }
        return user;
      })
      io.emit("Players", db);
      db.players.forEach((element) => {
        io.to(element.id).emit("notifyGameOver", {
          message: `El marco ${myUser.nickname} ha ganado esta ronda, ${poloSelected.nickname} ha sido capturado`,
        })
      })
    } else {
    // Añadir puntos al polo-especila si el marco no lo captura y 
    // restarle al marco
      db.players.map(user => {  
        if (user.role === 'marco'){
          user.points = user.points - 10
        } else if (user.role === 'polo-especial') {
          user.points = user.points + 10
        }
        return user;
      })
      io.emit("Players", db);
      db.players.forEach((element) => {
        io.to(element.id).emit("notifyGameOver", {
          message: `El marco ${myUser.nickname} ha perdido esta ronda`,
        })
      })
    }
    // Después de añadir puntos, se verifica si alguien ganó y
    // le emite a la clasificationPage quien ganó
    const winner = db.players.find(user => user.points >= 100)
    if (winner) {
      io.emit("gameWinner", winner)
      console.log(winner);
    } else {
      console.log("el juego continúa");
    }
  }
}

  // Envía la lista de jugadores a la clasificationPage
  // cuando un usuario se une o carga la pantalla
  const clasificationOnHandler = (socket, db, io) =>{
    return () =>{
      if (db.players.length > 0){
        io.emit('Players', db)
      } else {
        console.log('Error: datos aun no disponibles');
      }
    }
  }

module.exports = {
  joinGameHandler,
  startGameHandler,
  notifyMarcoHandler,
  notifyPoloHandler,
  onSelectPoloHandler,
  clasificationOnHandler,
}
