import Navbar from "./components/Navbar"
import useAuthStore from "./hook/useAuthStore"
import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Loader } from "lucide-react"
import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import SettingPage from "./pages/SettingPage"
import ProfilePage from "./pages/ProfilePage"

const App = () => {

  const {authUser, checkAuth, isCheckingAuth} = useAuthStore();
  useEffect( () => {
    checkAuth()
  }, [checkAuth])
  console.log("authUser:", authUser);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    )
  }
  return (
    <div>
      <Navbar/>  
      <Routes>
        <Route path="/" element={authUser ? <HomePage/> : <Navigate to="/login" />} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/setting" element={<SettingPage/>} />
        <Route path="/profile" element={authUser ? <ProfilePage/> : <Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App


