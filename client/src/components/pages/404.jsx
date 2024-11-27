import React from 'react'
import {useNavigate} from 'react'

function PageNotFound() {
  const navigate=useNavigate()

  return (
    <>
    <div>404 page Not found</div>
    <button onClick={()=>navigate('/login')}>Login</button>
    </>
    
  )
}

export default PageNotFound
