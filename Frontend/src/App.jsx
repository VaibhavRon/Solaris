import {Navigate, Route,Routes} from 'react-router-dom'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Verify from './Pages/Verify'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'
import HomePage from './Pages/HomePage'
import ForgotPassword from './Pages/ForgotPassword'
import ResetPage from './Pages/ResetPage'

const RedirectAuthenticatedUser=({children})=>{
    const{isAuthenticated,user}=useAuthStore();
    if(isAuthenticated && user.isVerified)
    {
      return <Navigate to="/" replace/>
    }
    return children;
}

const ProtectectedRoute=({children})=>{
  const{ isAuthenticated , user }=useAuthStore();
  if(!isAuthenticated)
  {
    return <Navigate to="/login" replace/>
  }
  if(!user.isVerified)
  {
    return <Navigate to='/verify' replace/>
  }
  return children;
}

function App() {
  const{checkAuth,isAuthenticated,user}=useAuthStore();

  useEffect(()=>{
    checkAuth()
  },[checkAuth])

  console.log(isAuthenticated,user)
  return (
    <>
      <div className='min-h-screen min-w-screen bg-gradient-to-br from-gray-800 via-green-800 to-darkgreen-800 flex justify-center items-center relative overflow-hidden' >
      <Routes>
        <Route path="/" element={
          <ProtectectedRoute><HomePage/></ProtectectedRoute>
        }/>
        <Route path="/signup" element={
          <RedirectAuthenticatedUser>
            <Signup/>
          </RedirectAuthenticatedUser>}/>
        <Route path="/login" element={
          <RedirectAuthenticatedUser>
            <Login/>
          </RedirectAuthenticatedUser>}/>
        <Route path="/verify" element={<Verify/>}></Route>
        <Route path="/forgot-password" element={<ForgotPassword/>}></Route>
        <Route path="/reset-password/:token" element={<RedirectAuthenticatedUser><ResetPage/></RedirectAuthenticatedUser>}/>
      </Routes>
      </div>
    </>
  )
}

export default App
