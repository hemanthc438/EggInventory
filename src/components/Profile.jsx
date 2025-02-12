import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../../firebaseConfig";
import getMobileBrand, { dateFormat } from "../constants/common";
import getDeviceBrand from "../constants/common";
const Profile = () =>{
    const {id} = useParams()
    const [isAddEggs,setIsAddEggs] = useState(false)
    const [eggs,setEggs] = useState('')
    const [usedEggs,setUsedEggs] = useState('')
    const [isEggsUsed,setIsEggsUsed] = useState(true)
    const [messages,setMessages] = useState([])
    const [borrowMessages,setBorrowMessages] = useState([])
    const [allMessages,setAllMessages] = useState([])
    const [eaterData,setEaterData]=useState({eggs:{
        totalEggs:0,
        boxes:0
    }})
    useEffect(()=>{
        const docSnap = doc(db,'eaters',id)
        const unSubscribe = onSnapshot(docSnap,(snapshot)=>{
            if(snapshot.exists()){
                setEaterData(snapshot.data())
            } 
        },[])
        return () => unSubscribe;
    },[])
    useEffect(()=>{
        const q = query(collection(db,'messages'),where('lenderId','==',id),orderBy('lendedAt','desc'))
        const q1 = query(collection(db,'messages'),where('borrowerId','==',id),orderBy('lendedAt','desc'))

        const unSubscribe = onSnapshot(q, (qs) => {
            setMessages(qs.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        });
    
        const unSubscribe1 = onSnapshot(q1, (qs) => {
            setBorrowMessages(qs.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        });
        // const unSubscribe = onSnapshot(q,(qs)=>{
        //     const messageArray = []
        //     qs.forEach((doc)=>{
        //         messageArray.push({...doc.data(),id:doc.id})
        //     })
        //     setMessages([...messageArray])
        // })
        // const unSubscribe1 = onSnapshot(q1,(qs)=>{
        //     const messageArray = []
        //     qs.forEach((doc)=>{
        //         messageArray.push({...doc.data(),id:doc.id})
        //     })
        //     setBorrowMessages([...messageArray])
        // })
        return () => {unSubscribe() 
            unSubscribe1()}
    },[])
    useEffect(() => {
        const messageArray = [...messages, ...borrowMessages]
        const sortedMessages = messageArray.sort((a,b)=>{
            b.lendedAt?.toMillis()-a.lendedAt?.toMillis()
        })
        console.log(sortedMessages)
        setAllMessages(sortedMessages);
    }, [messages, borrowMessages]);
    // const updateEggs = async() =>{
    //     try{
    //         await updateDoc(doc(db,'eaters',id),{
    //             eggs:{
    //                 totalEggs:0,
    //                 boxes:0
    //             }
    //         })
    //     }catch(e){
    //         console.error(e.message)
    //     }
    // }
    const handleEggs = async(c, op) =>{
        const device = getDeviceBrand();
        if(c==undefined && op!="-"){
            isAddEggs?setIsAddEggs(false):setIsAddEggs(true)
            return
        }
        if(c>eaterData?.eggs?.totalEggs && op=='-'){
            alert("Anni eggs lev bro ne daggara! appu teesko")
            return
        }
        if(!c.trim()){
            alert('Eggs enno cheppu ra daffa')
            return
        }
        try{
            eaterData.eggs.totalEggs = eval(`${eaterData.eggs.totalEggs} ${op} ${parseInt(c)}`)
            setEggs('')
            setIsAddEggs(false)
            setUsedEggs('')
            if(op=="+")
            {
                await updateDoc(doc(db,'eaters',id),{
                    'eggs.totalEggs' : Number(eaterData.eggs.totalEggs),
                    lastAdded : serverTimestamp(), 
                    lastEggsAdded:parseInt(c),
                    updatedFrom: device
                })
            }else{
                await updateDoc(doc(db,'eaters',id),{
                    'eggs.totalEggs' : Number(eaterData.eggs.totalEggs),
                    lastUsed : serverTimestamp(),
                    lastEggsUsed : parseInt(c),
                    updatedFrom: device
                })
            }

        }catch(e){
            console.error(e.message)
        }
    }
    
    return (
        <div className="flex bg-neutral-300 justify-center min-h-screen">
            <div className="flex flex-col  items-center w-100">
            <Link to={'/'}>
            <h1 className="text-3xl m-10 text-black rowdies-bold">{eaterData?.eaterName?.charAt(0).toUpperCase()+eaterData?.eaterName?.slice(1)}</h1>
            </Link>
            <div className="flex flex-col w-full items-center">
            <p className="anton-regular">Basket: {eaterData?.eggs?.totalEggs} Eggs</p>
            <button className="bg-white rounded p-2 mt-5 w-full cursor-pointer exo-regular" onClick={()=>handleEggs()}>Add Eggs to basket!</button>
            {isAddEggs?(<div className="flex justify-between grid grid-cols-2 w-full m-2">
                            <input 
                                type="number"
                                min="0"
                                placeholder="add eggs"
                                value={eggs}
                                onChange={(e)=>setEggs(e.target.value)}
                                className="exo-regular p-2 mr-2 rounded bg-white"
                            />
                            <button 
                                className=" ml-2 rounded exo-regular bg-green-200 cursor-pointer"
                                onClick={()=>handleEggs(eggs,'+')}
                            >Add</button>
                        </div>
                        ):(<></>)}
                        </div>
                <div className="grid grid-cols-2 w-full mt-3">
                    <input 
                        type="number"
                        min="0"
                        placeholder="did u use eggs?"
                        className="bg-white rounded p-2 mr-2"
                        value={usedEggs}
                        onChange={(e)=>setUsedEggs(e.target.value)}
                    />
                    <button 
                        className="ml-2 bg-green-200 rounded cursor-pointer"
                        onClick={()=>handleEggs(usedEggs,'-')}>
                            Use
                    </button>
                </div>
                <div className="m-5">
                    <Link to={`/lend/${id}`} replace>
                        <button className="p-3 bg-red-400 rounded-3xl cursor-pointer">Did u lend eggs?</button>
                    </Link>
                </div>
                <div className="w-full ">
                    {eaterData.lastAdded && (
                        <p className="p-3 w-full grid place-items-center items-center text-neutral-500 rowdies-light border-t-1 border-neutral-400">{eaterData?.lastEggsAdded} eggs added on {dateFormat(eaterData?.lastAdded)}</p>
                    )}
                    {eaterData.lastUsed && (
                        <p className="p-3 w-full grid place-items-center text-neutral-500 rowdies-light">{eaterData?.lastEggsUsed} eggs used on {dateFormat(eaterData?.lastUsed)}</p>
                    )}
                    {eaterData.updatedFrom && (
                        <p className="p-2 rowdies-lighter grid place-items-center w-full text-neutral-500 rowdies-light border-b-1 border-neutral-400 text-xs">Updated by {eaterData?.updatedFrom}</p>
                    )}
                </div>
                <div className=" flex flex-col items-center overflow-y-auto max-h-screen">
                    <p className="p-2 rowdies-regular ">History</p>
                    {
                        allMessages.sort((a, b) => b.lendedAt.seconds - a.lendedAt.seconds).map((message)=>(
                            message?.lenderId==id?message?.settle?(
                            <div className="flex flex-col"><p className="p-2 exo-regular text-xs"><span className="">You settled</span> {message?.eggs} eggs to {message?.borrowerName} on {dateFormat(message?.lendedAt)}</p></div>
                        ):(
                            <div className="flex flex-col"><p className="p-2 exo-regular text-xs">You <span className="text-green-500">lended</span> {message?.eggs} eggs to {message?.borrowerName} on {dateFormat(message?.lendedAt)}</p></div>
                        ):message?.settle?(                            
                            <div className="flex flex-col"><p className="p-2 exo-regular text-xs"> {message?.lenderName}<span className=""> settled</span> {message?.eggs} eggs on {dateFormat(message?.lendedAt)}</p></div>
                        ):(                           
                            <div className="flex flex-col"><p className="p-2 exo-regular text-xs">You <span className="text-red-500">borrowed</span> {message?.eggs} eggs from {message?.lenderName} on {dateFormat(message?.lendedAt)}</p></div>
                        )))
                    }
                </div>
            </div>
        </div>
    )
}
export default Profile;