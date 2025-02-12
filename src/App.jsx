import Body from "./components/Body";
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import Profile from "./components/Profile";
import LendItems from "./components/LendItems";
import Balances from "./components/Balances";
const App = () =>{
  const routerApp = createBrowserRouter([
    {
      path:"/",
      element:<Body/>
    },{
      path:'/profile/:id',
      element:<Profile/>
    },{
      path:'lend/:id',
      element:<LendItems/>
    },{
      path:'balances/:id',
      element:<Balances/>
    }
  ])
  return (
    <RouterProvider router={routerApp}/>
  )
}
export default App;