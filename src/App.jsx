import { useEffect, useState } from "react"
import { io } from "socket.io-client"

const socket = io("https://turd-backend-1ztr.onrender.com/")

function App() {

  const [bubbles, setBubbles] = useState([])
  const [turd, setTurd] = useState(null)
  const [winner, setWinner] = useState(null)

  useEffect(() => {

    // connection debug (optional)
    socket.on("connect", () => {
      console.log("socket connected")
    })

    // receive turd position
    socket.on("turd", (data) => {
  setTurd(data)

  // 🔊 PLAY SOUND WHEN SPAWNED
  if (data) {
    const audio = new Audio("/spawn.mp3")
    audio.volume = 1
    audio.play()
  }
})

    // click bubbles
    socket.on("bubble", (data) => {
      setBubbles((prev) => [...prev, data])

      setTimeout(() => {
        setBubbles((prev) => prev.slice(1))
      }, 1500)
    })

    // winner event
    socket.on("winner", (data) => {
      setWinner(data)

      setTimeout(() => {
        setWinner(null)
      }, 3000)
    })

    return () => {
      socket.off("turd")
      socket.off("bubble")
      socket.off("winner")
    }

  }, [])

  const handleClick = (e) => {

    const rect = e.currentTarget.getBoundingClientRect()

    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    socket.emit("click", {
      x,
      y,
      user: "viewer"
    })
  }

  return (
    <div
      onClick={handleClick}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        cursor: "crosshair",
        background: "transparent"
      }}
    >

      {/* CLICK BUBBLES */}
      {bubbles.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.5)",
            border: "1px solid white",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            animation: "pop 0.6s ease-out forwards"
          }}
        />
      ))}

      {/* 💩 TURD (VISIBLE BUT SMALL) */}
      {turd && (
  <img
    src="/turd.png"
    alt="turd"
    style={{
      position: "absolute",
      left: `${turd.x}%`,
      top: `${turd.y}%`,
      transform: "translate(-50%, -50%)",
      width: "18px",
      height: "18px",
      pointerEvents: "none",
      opacity: 0.85
    }}
  />
)}

      {/* WINNER POPUP */}
      {winner && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "black",
            color: "white",
            padding: "10px 20px",
            borderRadius: "10px",
            fontSize: "18px",
            pointerEvents: "none"
          }}
        >
          💩 {winner.user} found the turd!
        </div>
      )}

    </div>
  )
}

export default App