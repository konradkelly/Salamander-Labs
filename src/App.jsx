import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Videos from './pages/Videos.jsx'

function App() {

  return (
    <>
      <Home />
      <Videos />
    </>
  )
}

export default App
