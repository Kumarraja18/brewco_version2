import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function Menu(){
  const { bookingId } = useParams()
  const navigate = useNavigate()
  
  const [menuItems] = useState([
    { id: 1, name: 'Single Shot Espresso', price: 3.50, category: 'brew & co Classics' },
    { id: 2, name: 'Double Shot Espresso', price: 4.00, category: 'brew & co Classics' },
    { id: 3, name: 'Signature Cappuccino', price: 5.00, category: 'brew & co Signature' },
    { id: 4, name: 'Creamy Latte', price: 5.25, category: 'brew & co Signature' },
    { id: 5, name: 'Iced Brew Cold Coffee', price: 4.75, category: 'Cold Brew' },
    { id: 6, name: 'Caramel Cold Brew', price: 5.50, category: 'Cold Brew' },
    { id: 7, name: 'Butter Croissant', price: 3.75, category: 'Pastries' },
    { id: 8, name: 'Chocolate Croissant', price: 4.25, category: 'Pastries' },
    { id: 9, name: 'Artisan Sourdough Sandwich', price: 7.50, category: 'Brunch' },
    { id: 10, name: 'Garden Salad', price: 6.75, category: 'Brunch' }
  ])

  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)

  const handleAddToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id)
    if (existingItem) {
      const updated = cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      )
      setCart(updated)
      setTotal(total + item.price)
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
      setTotal(total + item.price)
    }
  }

  const handleRemoveFromCart = (itemId) => {
    const item = cart.find(i => i.id === itemId)
    if (item) {
      setTotal(total - (item.price * item.quantity))
      setCart(cart.filter(i => i.id !== itemId))
    }
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Please add items to cart')
      return
    }
    navigate('/payment', { state: { cartItems: cart, total, bookingId } })
  }

  const categories = [...new Set(menuItems.map(item => item.category))]

  return (
    <div className="page menu">
      <h2>brew & co Menu</h2>
      <p className="subtitle">Booking ID: {bookingId}</p>

      <div className="menu-container">
        <div className="menu-items">
          {categories.map(category => (
            <section key={category}>
              <h3>{category}</h3>
              <div className="items-list">
                {menuItems.filter(item => item.category === category).map(item => (
                  <div key={item.id} className="menu-item">
                    <div>
                      <h4>{item.name}</h4>
                      <p className="price">${item.price.toFixed(2)}</p>
                    </div>
                    <button 
                      className="btn small primary"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="cart">
          <h3>Your Order</h3>
          {cart.length === 0 ? (
            <p className="empty">No items added</p>
          ) : (
            <>
              <ul className="cart-items">
                {cart.map(item => (
                  <li key={item.id}>
                    <span>{item.name} × {item.quantity}</span>
                    <span className="price">${(item.price * item.quantity).toFixed(2)}</span>
                    <button 
                      className="btn-remove"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <div className="cart-total">
                <strong>Total: ${total.toFixed(2)}</strong>
              </div>
              <button 
                className="btn primary full"
                onClick={handleCheckout}
              >
                Proceed to Payment
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
