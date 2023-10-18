import "./App.css";
import Header from "./component/layout/Header/Header";
import Footer from "./component/layout/Footer/Footer";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import webFont from "webfontloader";
import React, { Fragment, useState } from "react";
import Home from "./component/Home/Home";
import ProductDetails from "./component/Product/ProductDetails.js";
import Products from "./component/Product/Products";
import Search from "./component/Product/Search";
import LoginSignUp from "./component/User/LoginSignUp";
import store from "./store";
import { loadUser } from "./actions/userActions";
import UserOptions from "./component/layout/Header/UserOptions";
import { useSelector } from "react-redux";
import Profile from "./component/User/Profile";
// import ProtectedRoute from './component/Route/ProtectedRoute';
import UpdateProfile from "./component/User/UpdateProfile";
import UpdatePassword from "./component/User/UpdatePassword";
import ForgotPassword from './component/User/ForgotPassword'
import ResetPassword from './component/User/ResetPassword'
import Cart from './component/Cart/Cart'
import Shipping from './component/Cart/Shipping'
import ConfirmOrder from "./component/Cart/ConfirmOrder"
import axios from "axios";
import Payment from "./component/Cart/Payment";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import OrderSuccess from "./component/Cart/OrderSuccess";
import MyOrders from "./component/Order/MyOrders"
import OrderDetails from "./component/Order/OrderDetails"
import Dashboard from "./component/Admin/Dashboard";
import ProductList from "./component/Admin/ProductList";
import NewProduct from "./component/Admin/NewProduct";
import UpdateProduct from "./component/Admin/UpdateProduct";
import OrderList from "./component/Admin/OrderList";
import ProcessOrder from "./component/Admin/ProcessOrder";
import UserList from "./component/Admin/UserList";
import UpdateUser from "./component/Admin/UpdateUser";
import ProductReviews from "./component/Admin/ProductReviews";
import About from "./component/layout/About/About";
import Contact from './component/layout/Contact/Contact'
import NotFound from "./component/layout/NotFound/NotFound";

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const [stripeApiKey, setStripeApiKey] = useState("");

  async function getStripeApiKey() {
    const { data } = await axios.get("/api/v1/stripeapikey");

    setStripeApiKey(data.stripeApiKey);
  }

  React.useEffect(() => {
    webFont.load({
      google: { families: ["Roboto", "Droid sans", "chilanka"] },
    });

    store.dispatch(loadUser());
    getStripeApiKey()
  }, []);

  window.addEventListener("contextmenu", (e) => e.preventDefault());

  return (
    <Fragment>
      <Router>
        <Header />
        {isAuthenticated && <UserOptions user={user} />}
        {/* {isAuthenticated && <Profile user={user} />} */}
        
        <Routes>
        
          <Route exact path="/" Component={Home} />
          <Route exact path="/about" Component={About} />
          <Route exact path="/contact" Component={Contact} />

          <Route exact path="/product/:id" Component={ProductDetails} />
          <Route exact path="/products" Component={Products} />
          <Route path="/products/:keyword" Component={Products} />
          <Route exact path="/search" Component={Search} />
         
          <Route exact path="/account" Component={Profile} /> 
                
          <Route exact path="/me/update" Component={UpdateProfile} />
          <Route exact path="/password/update" Component={UpdatePassword} /> 
          <Route exact path="/password/forgot" Component={ForgotPassword} />
          <Route exact path="/password/reset/:token" Component={ResetPassword} />
          <Route exact path="/login" Component={LoginSignUp} />
          <Route exact path="/cart" Component={Cart} />
          <Route exact path="/shipping" Component={Shipping} />
          <Route exact path="/order/confirm" Component={ConfirmOrder} />
          
         {stripeApiKey && (
           <Route exact path="/process/payment" element={
             <Elements stripe={loadStripe(stripeApiKey)}>
              <Payment />
            </Elements>
          }/>
          )}


          <Route exact path="/success" Component={OrderSuccess} />
          <Route exact path="/orders" Component={MyOrders} />
          <Route exact path="/order/:id" Component={OrderDetails} />
          
          <Route exact path="/admin/dashboard" Component={Dashboard} />
          <Route exact path="/admin/products" Component={ProductList} />
          <Route exact path="/admin/product" Component={NewProduct} />
          <Route exact path="/admin/product/:id" Component={UpdateProduct} />
          <Route exact path="/admin/orders" Component={OrderList} />
          <Route exact path="/admin/order/:id" Component={ProcessOrder} />
          <Route exact path="/admin/users" Component={UserList} />
          <Route exact path="/admin/user/:id" Component={UpdateUser} />

          <Route exact path="/admin/reviews" Component={ProductReviews} />

          <Route Component={  window.location.pathname === "/process/payment" ? null : NotFound  } />
        </Routes>
        <Footer />
      </Router>
    </Fragment>
  );
}

export default App;
