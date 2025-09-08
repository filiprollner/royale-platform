import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Lobby } from './pages/Lobby';
import { Room } from './pages/Room';
import { Design } from './pages/Design';

function App() {
  return (
    <div className="min-h-screen bg-ink">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/design" element={<Design />} />
      </Routes>
    </div>
  );
}

export default App;
