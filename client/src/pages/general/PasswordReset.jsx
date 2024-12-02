import { useState } from 'react'
import heroImg from '../../assets/reset.png'
import logo from '../../assets/logo_cap.png'
import { useNavigate, useParams } from 'react-router'
import { toast, ToastContainer } from 'react-toastify'
import axios from 'axios'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const navigate=useNavigate()
  const {token}= useParams();
  

  const handleSubmit =async (e) => {
    e.preventDefault()
    try {
      
      const response = await axios.post(`http://localhost:3000/admin/reset/${token}`,{password})

      toast.success("Password reset successfull , You can login with your new password. ");
      setTimeout(() => {
        navigate('/login')
      }, 3000);

    } catch (error) {
      console.log(error.message);
      toast.error( "An error occured, Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
    
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white">
        <div className="flex items-center gap-1">
          <img src={logo} alt="" />
          <span className="text-xl font-semibold">codemy</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Don't have account?</span>
          <button onClick={()=>navigate("/signup")} className="px-4 py-2 text-sm font-medium text-orange-500 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            Create Account
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          {/* Left Side - Illustration */}
          <div className="hidden md:block">
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 bg-purple-50 rounded-full ml-[-120px] mt-10"></div>
              <img
                src={heroImg}
                alt="Person with key illustration"
                className="relative z-10 w-[450px] object-contain ml-[-40px] mt-16"
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="max-w-md mx-auto w-full space-y-6 p-4 mt-16">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Reset your password
              </h1>
              <p className="text-gray-600">
                Enter your new password below. Make sure it's strong and unique.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Reset Password
              </button>
            </form>

            <div className="text-center">
              <a onClick={()=>navigate("/login")} className="text-sm text-orange-500 hover:underline cursor-pointer">
                Back to Sign In
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

