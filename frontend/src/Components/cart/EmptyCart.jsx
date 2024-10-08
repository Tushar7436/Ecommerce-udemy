import { Link } from "react-router-dom"

const EmptyCart = ({message}) => {
  return (
    <div className="emptycart_container">
      <h1>Your <span>Cart</span> Is Currently <span>Empty!</span> </h1>
      <p>Continue browsing <Link to={'/product'} className="link">
         <span>here</span>
        </Link> 
       </p>
      <h2> <span>{message}</span> </h2>

    </div>
  )
}

export default EmptyCart