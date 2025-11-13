
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Post1 from './pages/Post1';
import Post2 from './pages/Post2';
import Post3 from './pages/Post3';
import Story1 from './pages/Story1';
import Story2 from './pages/Story2';
import Story3 from './pages/Story3';
import Tweet from './pages/Tweet';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post1" element={<Post1 />} />
        <Route path="/post2" element={<Post2 />} />
        <Route path="/post3" element={<Post3 />} />
        <Route path="/story1" element={<Story1 />} />
        <Route path="/story2" element={<Story2 />} />
        <Route path="/story3" element={<Story3 />} />
        <Route path="/tweet" element={<Tweet />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
