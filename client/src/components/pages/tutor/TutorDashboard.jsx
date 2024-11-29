import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { logoutTutor, selectTutor } from '../../../store/tutorSlice'

function TutorDashboard() {
  const navigate=useNavigate()
  const dispatch = useDispatch()
  const tutor= useSelector(selectTutor);
  
  return (
    <>
     <div>TutorDashboard</div>
     <button onClick={()=>dispatch(logoutTutor(tutor))}>Log Out</button>
    </>
   
  )
}

export default TutorDashboard