import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateOrder from './pages/CreateOrder';
import OrderStatus from './pages/OrderStatus';
import Services from './pages/Services';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pedido/:id" element={<OrderStatus />} />
        <Route path="/servicios" element={<Services />} />
        <Route path="/solicitud" element={<CreateOrder />} />
      </Routes>
    </Layout>
  );
}
