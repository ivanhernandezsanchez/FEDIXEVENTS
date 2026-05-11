import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Contact from "./pages/Contact";
import ProductDetail from "./components/ProductDetail";
import Checkout from "./pages/Checkout";
import NotFound from "./components/NotFound";
import OrderHistory from "./pages/OrderHistory";
import PrivateRoute from "./components/PrivateRoute";

import IntranetLayout from "./layouts/IntranetLayout";
import Login from "./pages/Intranet/Login";
import Register from "./pages/Intranet/Register";
import Dashboard from "./pages/Intranet/Dashboard";
import Users from "./pages/Intranet/Users";
import Orders from "./pages/Intranet/Orders";
import Products from "./pages/Intranet/Products";
import WorksCouncil from "./pages/Intranet/WorksCouncil";
import WorksCouncilMembers from "./pages/Intranet/WorksCouncilMembers";
import WorksCouncilLegal from "./pages/Intranet/WorksCouncilLegal";
import WorksCouncilContractInfo from "./pages/Intranet/WorksCouncilContractInfo";
import WorksCouncilAgreements from "./pages/Intranet/WorksCouncilAgreements";
import WorksCouncilObjectives from "./pages/Intranet/WorksCouncilObjectives";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/activity/:id"
          element={<ProductDetail addToCart={() => {}} />}
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute roles={["customer"]}>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute roles={["customer"]}>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute roles={["customer"]}>
              <OrderHistory />
            </PrivateRoute>
          }
        />

        <Route path="/intranet" element={<IntranetLayout />}>
          <Route index element={<Navigate to="/intranet/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="dashboard"
            element={
              <PrivateRoute roles={["admin"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="users"
            element={
              <PrivateRoute roles={["admin"]}>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="orders"
            element={
              <PrivateRoute roles={["admin"]}>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="products"
            element={
              <PrivateRoute roles={["admin"]}>
                <Products />
              </PrivateRoute>
            }
          />
          <Route
            path="works-council"
            element={
              <PrivateRoute roles={["admin"]}>
                <WorksCouncil />
              </PrivateRoute>
            }
          />
          <Route path="committee" element={<Navigate to="/intranet/works-council" replace />} />
          <Route
            path="works-council/members"
            element={
              <PrivateRoute roles={["admin"]}>
                <WorksCouncilMembers />
              </PrivateRoute>
            }
          />
          <Route
            path="works-council/legal"
            element={
              <PrivateRoute roles={["admin"]}>
                <WorksCouncilLegal />
              </PrivateRoute>
            }
          />
          <Route
            path="works-council/contract-info"
            element={
              <PrivateRoute roles={["admin"]}>
                <WorksCouncilContractInfo />
              </PrivateRoute>
            }
          />
          <Route
            path="works-council/agreements"
            element={
              <PrivateRoute roles={["admin"]}>
                <WorksCouncilAgreements />
              </PrivateRoute>
            }
          />
          <Route
            path="works-council/objectives"
            element={
              <PrivateRoute roles={["admin"]}>
                <WorksCouncilObjectives />
              </PrivateRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
