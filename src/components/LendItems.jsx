import { collection, doc, getDoc, getDocs, increment, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../../firebaseConfig";
import { getExchangeId } from "../constants/common";
import Balances from "./Balances";

const LendItems = () =>{
    const {id} = useParams()
    const [eaters,setEaters] = useState([])
    const [currentEater,setCurrentEater]= useState([])
    const [otherEaters,setOtherEaters] = useState([])
    const [selectedEater,setSelectedEater] = useState('')
    const [borrow,setBorrow] = useState({})
    const [quantity,setQuantity] = useState(0)
    const [exchangeData,setExchangeData] = useState([])
    const [lendMessage,setLendMessage] = useState('')
    const [borrowMessage,setBorrowMessage] = useState('')
    const [isSeeExchange,setIsSeeExchange] = useState(false)
    const navigate = useNavigate()
    useEffect(()=>{
        fetchEaters()
    },[])
    useEffect(()=>{
        getCurrentEater()
    },[eaters],[exchangeData])
    useEffect(()=>{
        isExchangeExist()
    },[selectedEater])
    const fetchEaters = async() =>{
        const eaterSnapshot = await getDocs(collection(db,'eaters'))
        const eaterData = eaterSnapshot.docs.map((doc)=>doc.data())
        setEaters(eaterData)
    }
    const getCurrentEater = () =>{
        const eater = eaters.filter((eater)=>eater.id==id)
        setCurrentEater(eater[0])
        setOtherEaters(eaters.filter((eater)=>eater.id!=id))
    }
    const capitaliseName =(name)=>{
        return name?.charAt(0).toUpperCase()+name?.slice(1)
    }
    const handleSelection = (e) => {
        setSelectedEater(e.target.value)
        setQuantity(0)
        console.log(e.target.value)
        const borrower = otherEaters.filter((eater)=>eater.id==e.target.value)
        setBorrow(borrower[0])
        const exchangeId = getExchangeId(currentEater.id,borrower[0]?.id)
        isExchangeExist(borrower[0]?.id)
    }
    const handleLending = async() =>{
        const borrower = otherEaters.filter((eater)=>eater.id==selectedEater)
        setBorrow(borrower[0])
        const exchangeId = getExchangeId(currentEater.id,borrower[0]?.id)
        const exchangeRef = doc(db,'exchanges',exchangeId)
        console.log("borrower:",borrower)
        const messageRef = doc(collection(db,'messages'))
        const lenderRef = doc(db,'eaters',currentEater?.id)
        const borrowerRef = doc(db,'eaters',borrower[0]?.id)
        if(parseInt(quantity)>parseInt(currentEater.eggs.totalEggs)){
            alert("ne daggara anni levu broo")
            return
        }
        else{
            try{
                const exchangeData = (await (getDoc(exchangeRef))).data()
                await updateDoc(borrowerRef,{
                    'eggs.totalEggs':increment(Number(quantity))
                })
                await updateDoc(lenderRef,{
                    'eggs.totalEggs':increment(-Number(quantity))
                })
                await updateDoc(exchangeRef,{
                    'eater1.totalExchange':exchangeData?.eater1.id==currentEater.id?increment(-Number(quantity)):increment(Number(quantity)),
                    'eater2.totalExchange':exchangeData?.eater1.id==currentEater.id?increment(Number(quantity)):increment(-Number(quantity))
                })
                await setDoc(messageRef,{
                    lenderId: currentEater?.id,
                    lenderName: currentEater?.eaterName,
                    borrowerId:borrower[0]?.id,
                    borrowerName:borrower[0]?.eaterName,
                    eggs:Number(quantity),
                    lendedAt:serverTimestamp()
                })

                navigate(`/profile/${id}`)
            }catch(e){
                console.error(e.message)
            }
        }
        setQuantity(0)
    }
    const isExchangeExist = async(selectorId) =>{
        const borrower = otherEaters.filter((eater)=>eater.id==selectorId)
        const exchangeId = getExchangeId(currentEater.id,selectorId || selectedEater)
        const exchangeRef = doc(db,'exchanges',exchangeId)
        const  exchangeDoc = await getDoc(exchangeRef)
        const exchangeData = exchangeDoc.data()
        setExchangeData(exchangeData)
        try{
        if(!exchangeDoc.exists())
        {
            await setDoc(exchangeRef,{
                exchangeId:exchangeId,
                eater1:{
                    id:currentEater?.id,
                    totalExchange:0
                },
                eater2:{
                    id:borrower[0]?.id,
                    totalExchange:0
                }
            })   
        }
        }catch(e){
            console.error("isExchangeExist: ",e.message)
        }
    }
    const handleSeeExchange = () =>{
        const borrower = otherEaters.filter((eater)=>eater.id==selectedEater)
        let message=''
        setIsSeeExchange(!isSeeExchange)
        if(exchangeData?.eater1?.id==currentEater?.id){
            if(exchangeData?.eater1.totalExchange<0){
                message = (`${borrower[0]?.eaterName} owes you ${exchangeData?.eater2?.totalExchange} eggs`)
            }
            else{
                message = (`You owe ${exchangeData?.eater1?.totalExchange} eggs to ${borrower[0]?.eaterName}`)
            }
        }else{
            if(exchangeData?.eater2?.totalExchange<0){
                message = (`${borrower[0]?.eaterName} owes you ${exchangeData?.eater1?.totalExchange} eggs`)
            }
            else{
                message = (`You owe ${exchangeData?.eater2?.totalExchange} eggs to ${borrower[0]?.eaterName}`)
            }
        }
        navigate(`/balances/${selectedEater}`, { state: { currentEater, lendMessage: message } });

    }
    return (
        <div className="flex bg-neutral-300 justify-center min-h-screen">
            <div className="flex flex-col items-center w-100" >
                <Link to={`/profile/${id}`} replace>
                    <p className="m-5 text-2xl exo-regular">Lended by <span className="anton-regular">{capitaliseName(currentEater?.eaterName)}</span></p>
                </Link>
                <div className="mt-2 grid grid-cols-2">
                <p className="pl-4 exo-regular">Borrowed by</p>
                <select
                    id="dropdown"
                    value={selectedEater}
                    onChange={(e)=>{handleSelection(e)}}
                    className="bg-white rounded p-1 mr-4"
                    >
                        {
                            ["please select",...otherEaters].map((eater)=>(
                                <option key={eater.id?eater.id:""} value={eater.id?eater.id:""}>{eater.eaterName?eater.eaterName:"please select"}</option>
                            ))
                        }
                </select>
                </div>
                {
                    selectedEater!=""?(<>
                    <div className="mt-3 mb-3 grid grid-cols-2 items-center">
                        <label className="pr-8 exo-regular text-right">Quantity</label>
                        <input 
                            type="number"
                            value={quantity}
                            onChange={(e)=>setQuantity(e.target.value)}
                            className="bg-white rounded p-1"
                        />
                        </div>
                        <button 
                    onClick={handleLending}
                    disabled={quantity==0}    
                    className={`m-2 p-1 bg-red-400 w-1/2 disabled:opacity-50 rounded`}>
                        Lend
                    </button>
                    {/* <Link 
                        to={`/balances/${selectedEater}`} 
                        replace
                        state={{currentEater,lendMessage}}
                        > */}
                        <button
                            className="text-indigo-800"
                            onClick={()=>handleSeeExchange()}>
                                Check balances 
                        </button>
                    {/* </Link> */}
                </>
                    ):(<></>)  
                }
                <div>
                {/* {
                    exchangeData?.eater1?.id===currentEater?.id?(exchangeData?.eater1?.totalExchange<0)?
                    <h1>You owe {exchangeData?.eater2?.totalExchange} eggs</h1>:
                    <h1>{borrow?.eaterName} owe {exchangeData?.eater1?.totalExchange} eggs</h1>:
                    (exchangeData?.eater2?.totalExchange<0)?
                    <h1>You owe {exchangeData?.eater2?.totalExchange} eggs</h1>:
                    <h1>{borrow?.eaterName} owe {exchangeData?.eater1?.totalExchange} eggs</h1>
                } */}
                <h1>{borrowMessage}</h1>
                </div>
            </div>
        </div>
    )
}
export default LendItems;