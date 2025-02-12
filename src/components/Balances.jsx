import { useEffect, useState } from "react";
import { Link, replace, useLocation, useNavigate, useParams } from "react-router-dom";
import { getExchangeId } from "../constants/common";
import { collection, doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const Balances = () =>{
    const eater = useLocation()
    const {id} = useParams()
    const [exchangeData,setExchangeData] = useState([])
    const [exchangeId,setExchangeId] = useState("")
    const navigate = useNavigate()
    console.log("id",id)
    // console.log("casdjhcwdjc:",{params})
    console.log("eatersdfa",eater)
    useEffect(()=>{
        getExchanges()
    },[])
    const getExchanges = async() =>{
        const exchangeId = getExchangeId(id,eater?.state?.currentEater?.id)
        setExchangeId(exchangeId)
        const exchangeRef = doc(db,'exchanges',exchangeId)
        const exchange = await getDoc(exchangeRef)
        if(exchange.exists())
        setExchangeData(exchange.data())
    }
    const handleSettle = async() =>{
        const quantity = exchangeData?.eater1?.totalExchange<0? -(exchangeData?.eater1?.totalExchange):exchangeData?.eater1?.totalExchange
        if(eater?.state?.currentEater?.eggs?.totalEggs<quantity){
            alert("Anni eggs leb bro ne daggara... sad life!")
            return
        }
        const settleRef = doc(db,'eaters',id)
        const messageRef = doc(collection(db,'messages'))
        const settleDoc = await getDoc(settleRef)
        const data = settleDoc.data()
        try{
            if(data?.eggs?.totalEggs<quantity){
                alert("Asal eh dhairyam tho settle kodtunnav ra!")
                return
            }
            const exchangeRef = doc(db,'exchanges',exchangeId)
            const eaterRef = doc(db,'eaters',eater?.state?.currentEater?.id)
            await updateDoc(exchangeRef,{
                'eater1.totalExchange':0,
                'eater2.totalExchange':0
            })
            await updateDoc(eaterRef,{
                'eggs.totalEggs':increment(-Number(quantity))
            })
            await updateDoc(settleRef,{
                'eggs.totalEggs':increment(Number(quantity))
            })
            await setDoc(messageRef,{
                                lenderId: eater?.state?.currentEater?.id,
                                lenderName: eater?.state?.currentEater?.eaterName,
                                borrowerId:id,
                                borrowerName:data?.eaterName,
                                eggs:Number(quantity),
                                lendedAt:serverTimestamp(),
                                settle:true
                            })
            navigate(`/lend/${eater?.state?.currentEater?.id}`)
        }catch(e){
            console.error(e.message)
        }
    } 
    return (
        <div className="flex bg-neutral-300 justify-center min-h-screen">
            <div className="flex flex-col  items-center w-100">
            <Link to={`/lend/${eater?.state?.currentEater?.id}`} replace>
                <h1 className="text-3xl m-10 text-black rowdies-bold">Balances</h1>
            </Link>{
                !eater?.state?.lendMessage.includes(' 0 ') && !eater?.state?.lendMessage.includes(' undefined ')?<h1 className="exo-regular">{eater?.state?.lendMessage}</h1>:<h1 className="rowdies-bold text-xl">Settled Up!!!</h1>
            }
            {
                eater?.state?.lendMessage.includes("eggs to") && !eater?.state?.lendMessage.includes(' 0 ') && !eater?.state?.lendMessage.includes(' undefined ')?
                (<button
                    className="m-2 p-2 w-1/2 rowdies-light text-xl bg-red-400 rounded" 
                    onClick={()=>handleSettle()}
                >Settle</button>):(<></>)
            }
            </div>
        </div>
    )
}
export default Balances;