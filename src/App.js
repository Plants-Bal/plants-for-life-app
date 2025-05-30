import React, { useContext } from 'react';

// Assume these contexts are defined in their own files and imported
// e.g., import { NavigationContext } from './contexts/NavigationContext';
// For this example, we'll use the existing direct context imports
import { NavigationContext } from './NavigationContext'; // Or wherever you define it
import { CartContext } from './CartContext';         // Or wherever you define it
import { AuthContext } from './AuthContext';           // Or wherever you define it

// Import your Page Components
import HomePage from './pages/HomePage';
import ProductList from './pages/ProductList'; // Or ShopPage, ProductPage etc.
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminPage from './pages/AdminPage'; // Manages Products
import AdminManageOrdersPage from './pages/AdminManageOrdersPage';

// Import any specific icons used directly in App.js layout
import { ErrorIcon } from './components/Icons'; // Assuming Icons.js or similar

// Constants (could also be in a separate constants.js file)
const APP_NAME = "Plants for Life";

function App() {
  const { currentPage, navigateTo } = useContext(NavigationContext);
  const { cartItemCount } = useContext(CartContext);
  const { isAdmin, isLoadingAuth, userId, currentUser, logOutUser } = useContext(AuthContext);

  const NavLink = ({ page, children, action }) => (
    <button
      onClick={action ? action : () => navigateTo(page)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${currentPage === page && !action ? 'bg-green-600 text-white shadow-sm' : 'text-gray-700 hover:bg-green-100 hover:text-green-700'}
        ${(page === 'admin' || page === 'admin-orders') && (!isAdmin || (currentUser && currentUser.isAnonymous)) ? 'hidden' : ''}
        ${(page === 'my-orders' || page === 'user-profile') && (!currentUser || currentUser.isAnonymous) ? 'hidden' : ''}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => navigateTo('home')} className="flex items-center text-green-600 hover:text-green-700 transition-colors">
                {/* Icon was removed from header, keeping only text */}
                <span className="font-bold text-2xl ml-2">{APP_NAME}</span>
              </button>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <NavLink page="home">Home</NavLink>
              <NavLink page="products">Shop</NavLink>
              <NavLink page="cart"> Cart {cartItemCount > 0 && ( <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full"> {cartItemCount} </span> )} </NavLink>

              {isLoadingAuth ? (
                <span className="text-xs text-gray-400 px-3 py-2 animate-pulse">Loading...</span>
              ) : currentUser && !currentUser.isAnonymous ? (
                <>
                  <NavLink page="my-orders">My Orders</NavLink>
                  <NavLink page="user-profile">My Profile</NavLink>
                  {isAdmin && <NavLink page="admin">Manage Products</NavLink>}
                  {isAdmin && <NavLink page="admin-orders">Manage Orders</NavLink>}
                  <span className="text-sm text-gray-600 hidden md:inline px-2" title={currentUser.email}>{currentUser.email && currentUser.email.length > 15 ? currentUser.email.substring(0,12) + "..." : currentUser.email}</span>
                  <NavLink page="logout" action={logOutUser}>Logout</NavLink>
                </>
              ) : (
                <>
                  <NavLink page="login">Login</NavLink>
                  <NavLink page="signup">Signup</NavLink>
                </>
              )}
               {currentUser && currentUser.isAnonymous && !isLoadingAuth && (
                 <span className="text-xs text-gray-400 px-3 py-2 hidden sm:inline-block" title={`Anonymous User ID: ${userId}`}>Guest</span>
               )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'products' && <ProductList />}
        {currentPage === 'cart' && <CartPage />}
        {currentPage === 'checkout' && <CheckoutPage />}
        {currentPage === 'login' && <LoginPage />}
        {currentPage === 'signup' && <SignupPage />}
        {currentPage === 'my-orders' && <OrderHistoryPage />}
        {currentPage === 'user-profile' && <UserProfilePage />}
        {currentPage === 'admin' && isAdmin && !(currentUser && currentUser.isAnonymous) && <AdminPage />}
        {currentPage === 'admin-orders' && isAdmin && !(currentUser && currentUser.isAnonymous) && <AdminManageOrdersPage />}

        {((currentPage === 'admin' || currentPage === 'admin-orders') && (!isAdmin || (currentUser && currentUser.isAnonymous)) && !isLoadingAuth) && (
            <div className="container mx-auto px-4 py-16 text-center"> <ErrorIcon className="h-16 w-16 text-red-400 mx-auto mb-4"/> <h2 className="text-2xl font-semibold text-gray-800 mb-3">Admin Access Denied</h2> <p className="text-gray-600">You must be logged in with an authorized admin account.</p> </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white text-center p-8 mt-12">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p className="text-xs text-gray-400 mt-1">A React & Firebase E-commerce Demo.</p>
      </footer>
    </div>
  );
}

export default App;