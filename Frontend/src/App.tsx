import Navbar from "./components/Navbar"
import useAuthStore from "./hook/useAuthStore"
import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import SettingPage from "./pages/SettingPage"
import ProfilePage from "./pages/ProfilePage"

const App = () => {

  const {user, checkAuth} = useAuthStore();
  useEffect( () => {
    checkAuth()
  }, [checkAuth])
  console.log(user)

  return (
    <div>
      <Navbar/>  
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/setting" element={<SettingPage/>} />
        <Route path="/profile" element={<ProfilePage/>} />
      </Routes>
    </div>
  )
}

export default App


