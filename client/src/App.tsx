import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SeasonKeyBar from './components/SeasonKeyBar';
import TickerTape from './components/TickerTape';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Playbook from './pages/Playbook';
import History from './pages/History';
import Charts from './pages/Charts';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Screener from './pages/Screener';

export default function App() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
      <TickerTape />
      <Header />
      <SeasonKeyBar />
      <Routes>
        <Route path="/"           element={<Dashboard />} />
        <Route path="/learn"      element={<Learn />} />
        <Route path="/playbook"   element={<Playbook />} />
        <Route path="/history"    element={<History />} />
        <Route path="/charts"     element={<Charts />} />
        <Route path="/about"      element={<About />} />
        <Route path="/portfolio"  element={<Portfolio />} />
        <Route path="/screener"   element={<Screener />} />
      </Routes>
    </div>
  );
}
