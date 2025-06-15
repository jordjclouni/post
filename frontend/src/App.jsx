import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Place from "./pages/Place";
import Home from "./pages/Home";
import SearchBooks from "./pages/SearchBooks";
import About from "./pages/About";
import Profile from "./pages/UserProfile";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import { AuthProvider } from "./context/AuthContext"; // Импортируйте AuthProvider
import AddBook from "./pages/AddBook";
import AdminPanel from "./pages/AdminPanel";
import AdminSafeShelves from "./pages/AdminSafeShelves";
import AdminGenres from "./pages/AdminGenres";
import AdminAuthors from "./pages/AdminAuthors";
import Inventory from "./pages/Inventory";
import BookExchange from "./pages/BookExchange";
import Forum from './pages/Forum';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import TopicDiscussion from "./pages/TopicDiscussion";
import AdminUsers from "./pages/AdminUsers";
import SearchBooksOnHand from "./pages/SearchBooksOnHand";
import Messages from "./pages/Messages";
import Messenger from "./pages/Messenger";
import FavoriteBooks from "./pages/FavoriteBooks";
import BookDetail from "./pages/BookDetail";
import AdminBook from "./pages/AdminBook";
import Notifications from "./pages/Notifications";

<Routes>
  {/* ... другие маршруты ... */}
  <Route path="/profile" element={<UserProfile />} />
  <Route path="/edit-profile" element={<EditProfile />} />
</Routes>

// Внутри маршрутов (например, в <Routes>):

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/place" element={<Place />} />
          <Route path="/search" element={<SearchBooks />} />
          <Route path="/about" element={<About />} />
          <Route path="/addbook" element={<AddBook />} />
          <Route path="/profile" element={<Profile />}/>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/safe-shelves" element={<AdminSafeShelves />} />
          <Route path="/admin/genres" element={<AdminGenres />} />
          <Route path="/admin/authors" element={<AdminAuthors />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/exchange" element={<BookExchange />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/topic/:id" element={<TopicDiscussion />} />
          <Route path="/search-books-on-hand" element={<SearchBooksOnHand />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messenger" element={<Messenger />} />
          <Route path="/favorites" element={<FavoriteBooks />} />
          <Route path="/book/:bookId" element={<BookDetail />} />
          <Route path="/admin/book" element={<AdminBook />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/notifications" element={<Notifications />} />


          
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          

          {/* Модальные окна */}
          <Route path="/login" element={<LoginModal />} />                 
          <Route path="/register" element={<RegisterModal />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
