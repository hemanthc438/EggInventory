import { useEffect, useState } from 'react'
import {collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebaseConfig'
import { Link } from 'react-router-dom'

function Body() {
  const [eater, setEater] = useState("")
  const [eaters,setEaters] = useState([])
  
  useEffect(()=>{  
      fetchEaters()
    },[])
    const fetchEaters = async() =>{
      try{
        const querySnapshot = await getDocs(collection(db,'eaters'))
        const eatersData = querySnapshot.docs.map((doc)=>({
            id:doc.data().id,
            eaterName:doc.data().eaterName
        }))
        setEaters(eatersData)
      }catch(e){
        console.error(e.message)
      }
    }
  const addEater = async() =>{
    if(!eater){
      return
    }
    try{
      const data = {
          eaterName:eater,
          eggs:{
            totalEggs:0,
            boxes:0
          }}
      const eaterRef = doc(collection(db,'eaters'))
      await setDoc(eaterRef,data)
      await updateDoc(eaterRef,{
        id:eaterRef.id
      })
      clearInput()
      fetchEaters()
    }
    catch (e)
    {console.error(e.message)}
  }
  const clearInput = () =>{
    setEater("")
  }
  return (
    <div className="flex justify-center min-h-screen bg-neutral-300">
      <div className="flex flex-col rounded w-100">
        <input 
          className="bg-white exo-regular rounded p-2 mt-5 w-full"
          placeholder='add Eater'
          value={eater}
          onChange={(e)=>setEater(e.target.value)}

        ></input>
        <button 
          className="bg-white rounded p-2 mt-2 w-full cursor-pointer exo-regular"
          onClick={addEater}>
          Add Eater
        </button>
        <div className='grid m-3 grid-cols-2 cursor-pointer'>
        {
          eaters.map((eat)=>
            (
            <Link to={'profile/'+eat.id} key={eat.id} >
                <p className='m-2 p-2 grid place-items-center h-35 bg-green-200 rounded anton-regular text-2xl'>{eat.eaterName.charAt(0).toUpperCase()+eat.eaterName.slice(1)}</p>
            </Link>
          ))
        }
        </div>
        </div>
    </div>
  )
}

export default Body