import { BrowserRouter, Routes, Route } from "react-router-dom";
import Success from "./pages/Success";
import Failure from "./pages/Failure";
import Pending from "./pages/Pending";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/success" element={<Success />} />
        <Route path="/failure" element={<Failure />} />
        <Route path="/pending" element={<Pending />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

