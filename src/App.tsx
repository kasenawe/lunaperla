import { BrowserRouter, Routes, Route } from "react-router-dom";
import Success from "./pages/Success";
import Failure from "./pages/Failure";
import Pending from "./pages/Pending";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AccountAddresses from "./pages/AccountAddresses";
import CartPage from "./pages/Cart";
import { CartProvider } from "./cart/CartContext";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/success" element={<Success />} />
          <Route path="/failure" element={<Failure />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/account/addresses" element={<AccountAddresses />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
