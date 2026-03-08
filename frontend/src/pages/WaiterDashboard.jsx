import React, { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axiosClient'
import toast from 'react-hot-toast'
import '../styles/dashboard.css'
import { FaInbox, FaFire, FaBell, FaCheckCircle, FaUser, FaUtensils, FaConciergeBell, FaFlagCheckered, FaWalking } from 'react-icons/fa'

const STATUS_META = {
  CONFIRMED:       { label: 'New',        bg: '#faf5ef', border: '#d4c0a8', color: '#6f4e37', dot: '#a67c52' },
  SENT_TO_KITCHEN: { label: 'In Kitchen',  bg: '#fff8f0', border: '#f5d9b0', color: '#b45309', dot: '#d97706' },
  PREPARING:       { label: 'Preparing',   bg: '#fff8f0', border: '#f5d9b0', color: '#b45309', dot: '#f59e0b' },
  READY:           { label: 'Ready',       bg: '#f0fdf4', border: '#86efac', color: '#16a34a', dot: '#22c55e' },
  DELIVERED:       { label: 'Delivered',   bg: '#faf8f5', border: '#e2d5c8', color: '#8b6f63', dot: '#a67c52' },
}

const FILTERS = [
  { key: 'ALL',             label: 'All' },
  { key: 'CONFIRMED',       label: 'New' },
  { key: 'SENT_TO_KITCHEN', label: 'In Kitchen' },
  { key: 'READY',           label: 'Ready' },
  { key: 'DELIVERED',       label: 'Delivered' },
]

export default function WaiterDashboard() {
  const { user } = useContext(AuthContext)
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')
  const [live, setLive]       = useState(true)

  useEffect(() => {
    loadOrders()
    const iv = setInterval(loadOrders, 8000)
    return () => clearInterval(iv)
  }, [])

  const loadOrders = async () => {
    try {
      const res = await api.get('/waiter/orders')
      setOrders(res.data || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  const sendToKitchen = async (orderId) => {
    try {
      await api.put(`/waiter/orders/${orderId}/send-to-kitchen`)
      toast.success('Sent to kitchen!')
      loadOrders()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const markDelivered = async (orderId) => {
    try {
      await api.put(`/waiter/orders/${orderId}/deliver`)
      toast.success('Order delivered!')
      loadOrders()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const confirmedCount  = orders.filter(o => o.status === 'CONFIRMED').length
  const inKitchenCount  = orders.filter(o => ['SENT_TO_KITCHEN','PREPARING'].includes(o.status)).length
  const readyCount      = orders.filter(o => o.status === 'READY').length
  const deliveredCount  = orders.filter(o => o.status === 'DELIVERED').length

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  const filterCount = (key) => key === 'ALL' ? orders.length
    : key === 'CONFIRMED' ? confirmedCount
    : key === 'SENT_TO_KITCHEN' ? inKitchenCount
    : key === 'READY' ? readyCount
    : deliveredCount

  if (loading) return (
    <div className="dashboard-page brew-spinner-container">
      <div className="brew-spinner" />
    </div>
  )

  return (
    <div className="dashboard-page" style={{ padding: 0, background: '#f0ebe4' }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #2e241f 0%, #4a3427 55%, #6f4e37 100%)',
        padding: '36px 40px 90px', position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%',
          background:'rgba(166,124,82,0.12)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-100, left:'35%', width:350, height:350, borderRadius:'50%',
          background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />

        <div style={{ maxWidth:1160, margin:'0 auto', position:'relative', zIndex:1,
          display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <span style={{ fontSize:'1.3rem', color:'rgba(245,233,220,0.8)' }}><FaConciergeBell /></span>
              <span style={{ color:'rgba(245,233,220,0.6)', fontSize:'0.72rem', fontWeight:700,
                letterSpacing:'2.5px', textTransform:'uppercase' }}>Brew &amp; Co · Waiter</span>
            </div>
            <h1 style={{ color:'#fff', fontSize:'1.9rem', fontWeight:900, margin:'0 0 6px',
              letterSpacing:'-0.5px' }}>
              Hey, {user?.firstName}!
            </h1>
            <p style={{ color:'rgba(245,233,220,0.7)', fontSize:'0.88rem', margin:0 }}>
              Manage order flow · auto-refreshing every 8s
            </p>
          </div>

          {/* Live indicator */}
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.08)',
            border:'1px solid rgba(245,233,220,0.18)', borderRadius:30, padding:'8px 18px',
            backdropFilter:'blur(8px)' }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#a3e635',
              boxShadow:'0 0 8px #a3e635', display:'inline-block' }} />
            <span style={{ color:'rgba(255,255,255,0.85)', fontSize:'0.76rem', fontWeight:600 }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (overlaps hero) ── */}
      <div style={{ maxWidth:1160, margin:'-60px auto 0', padding:'0 28px 60px', position:'relative', zIndex:2 }}>

        {/* ── STAT CARDS ── */}
        <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', marginBottom:24 }}>
          {[
            { icon:<FaInbox size={20} color="#fff" />, count: confirmedCount, label:'New Orders',      sub:'Need to send to kitchen',
              accent:'#6f4e37', shadow:'rgba(111,78,55,0.18)' },
            { icon:<FaUtensils size={20} color="#fff" />, count: inKitchenCount, label:'In Kitchen',       sub:'Chef is working on it',
              accent:'#b45309', shadow:'rgba(180,83,9,0.18)' },
            { icon:<FaBell size={20} color="#fff" />, count: readyCount,     label:'Ready to Deliver', sub:'Pick up now!',
              accent:'#16a34a', shadow:'rgba(22,163,74,0.18)' },
            { icon:<FaCheckCircle size={20} color="#fff" />, count: deliveredCount, label:'Delivered',        sub:'Today\'s completed orders',
              accent:'#a67c52', shadow:'rgba(166,124,82,0.18)' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{
              boxShadow: `0 4px 20px ${s.shadow}, 0 1px 4px rgba(0,0,0,0.05)`,
              borderTop: `3px solid ${s.accent}`,
              display:'flex', alignItems:'center', gap:16, textAlign:'left', padding:'20px 22px'
            }}>
              <div style={{ width:48, height:48, borderRadius:14, flexShrink:0,
                background: s.accent, display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:'1.4rem' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize:'1.9rem', fontWeight:900, color:'#2e241f', lineHeight:1.1 }}>{s.count}</div>
                <div style={{ fontSize:'0.8rem', fontWeight:700, color:'#2e241f', marginTop:3 }}>{s.label}</div>
                <div style={{ fontSize:'0.7rem', color:'#8b6f63', marginTop:2 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── WORKFLOW BANNER ── */}
        <div className="glass-card" style={{ padding:'18px 24px', marginBottom:24,
          background:'#fffdf9', borderLeft:'4px solid #a67c52' }}>
          <div style={{ fontSize:'0.68rem', fontWeight:700, color:'#8b6f63',
            letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:12 }}>Your Workflow</div>
          <div style={{ display:'flex', alignItems:'center', gap:0, overflowX:'auto', paddingBottom:2 }}
            className="hide-scrollbar">
            {[
              { label:'Owner Confirms', icon:<FaUser size={16} />, done:true, active:false },
              { label:'Send to Kitchen', icon:<FaUtensils size={16} />, done: inKitchenCount>0||readyCount>0||deliveredCount>0, active: confirmedCount>0 },
              { label:'Chef Prepares',  icon:<FaUtensils size={16} />, done: readyCount>0||deliveredCount>0, active: inKitchenCount>0 },
              { label:'You Deliver',    icon:<FaConciergeBell size={16} />, done: deliveredCount>0, active: readyCount>0 },
              { label:'Done',           icon:<FaFlagCheckered size={16} />, done: deliveredCount>0, active:false },
            ].map((s, i, arr) => (
              <React.Fragment key={i}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                  minWidth:88, textAlign:'center', flexShrink:0 }}>
                  <div style={{
                    width:40, height:40, borderRadius:'50%', fontSize:'1rem',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color: s.done || s.active ? '#fff' : '#8b6f63',
                    background: s.done ? '#6f4e37' : s.active ? '#a67c52' : '#f0ebe4',
                    border: s.active ? '2px solid #6f4e37' : s.done ? '2px solid #6f4e37' : '2px solid #d4c0a8',
                    boxShadow: s.active||s.done ? '0 3px 10px rgba(111,78,55,0.25)' : 'none',
                    transition:'all 0.3s'
                  }}>{s.icon}</div>
                  <span style={{ fontSize:'0.66rem', fontWeight: s.active?700:500,
                    color: s.done||s.active ? '#6f4e37' : '#8b6f63', lineHeight:1.3 }}>{s.label}</span>
                </div>
                {i < arr.length-1 && (
                  <div style={{ flex:1, height:2, minWidth:16, marginBottom:20,
                    background: arr[i+1].done||arr[i+1].active ? 'linear-gradient(90deg,#6f4e37,#a67c52)' : '#e2d5c8',
                    transition:'all 0.4s' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── FILTER PILLS ── */}
        <div style={{ display:'flex', gap:8, marginBottom:22, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#8b6f63',
            textTransform:'uppercase', letterSpacing:'1px', marginRight:4 }}>Filter</span>
          {FILTERS.map(f => {
            const active = filter === f.key
            return (
              <button key={f.key}
                className={`admin-filter-pill${active ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
                style={{ display:'flex', alignItems:'center', gap:6 }}>
                {f.label}
                <span style={{
                  background: active ? 'rgba(255,255,255,0.25)' : '#f0ebe4',
                  color: active ? '#fff' : '#6f4e37',
                  borderRadius:20, padding:'0 7px', fontSize:'0.7rem', fontWeight:700
                }}>{filterCount(f.key)}</span>
              </button>
            )
          })}
        </div>

        {/* ── ORDER CARDS ── */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">No Orders</div>
            <div className="empty-state__text">No orders here</div>
            <div className="empty-state__subtext">
              {filter === 'ALL' ? 'New confirmed orders will appear automatically.'
                : `No orders with status "${filter}" right now.`}
            </div>
          </div>
        ) : (
          <div className="cards-grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))' }}>
            {filtered.map(order => {
              const meta = STATUS_META[order.status] || STATUS_META.DELIVERED
              const isAction = ['CONFIRMED','READY'].includes(order.status)
              return (
                <div key={order.id} className="glass-card" style={{
                  display:'flex', flexDirection:'column', gap:0, overflow:'hidden',
                  border: isAction ? `1.5px solid ${meta.border}` : '1px solid rgba(166,124,82,0.15)',
                  boxShadow: isAction
                    ? `0 6px 24px ${meta.dot}28, 0 2px 8px rgba(0,0,0,0.06)`
                    : '0 2px 12px rgba(42,30,24,0.07)',
                  transition:'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                >
                  {/* Colored top strip */}
                  <div style={{ height:3, background:`linear-gradient(90deg,${meta.dot},${meta.dot}66)` }} />

                  <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:14, flex:1 }}>

                    {/* Header */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <div style={{ fontSize:'0.62rem', fontWeight:700, color:'#8b6f63',
                          letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:3 }}>Order</div>
                        <div style={{ fontWeight:800, fontSize:'0.95rem', color:'#2e241f',
                          fontFamily:'monospace, monospace' }}>#{order.orderRef}</div>
                      </div>
                      <span style={{ background:meta.bg, color:meta.color,
                        border:`1px solid ${meta.border}`, borderRadius:20,
                        padding:'4px 12px', fontSize:'0.72rem', fontWeight:700,
                        display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                        <span style={{ width:6, height:6, borderRadius:'50%',
                          background:meta.dot, display:'inline-block',
                          boxShadow: order.status==='READY' ? `0 0 6px ${meta.dot}` : 'none' }} />
                        {meta.label}
                      </span>
                    </div>

                    {/* Type + Table pills */}
                    <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                      <span style={{ background:'#faf5ef', border:'1px solid #e2d5c8',
                        borderRadius:8, padding:'4px 10px', fontSize:'0.74rem', fontWeight:600, color:'#6f4e37' }}>
                        {order.orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}
                      </span>
                      {order.cafeTable && (
                        <span style={{ background:'#faf5ef', border:'1px solid #e2d5c8',
                          borderRadius:8, padding:'4px 10px', fontSize:'0.74rem', fontWeight:600, color:'#a67c52' }}>
                          Table {order.cafeTable.tableNumber}
                        </span>
                      )}
                      {order.orderItems?.length > 0 && (
                        <span style={{ background:'#faf5ef', border:'1px solid #e2d5c8',
                          borderRadius:8, padding:'4px 10px', fontSize:'0.74rem', fontWeight:600, color:'#8b6f63' }}>
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Items list */}
                    {order.orderItems?.length > 0 && (
                      <div style={{ background:'#faf8f5', borderRadius:10, padding:'10px 14px',
                        border:'1px solid #f0ebe4' }}>
                        {order.orderItems.slice(0, 3).map((item, idx) => (
                          <div key={idx} style={{ display:'flex', justifyContent:'space-between',
                            alignItems:'center', marginBottom: idx < Math.min(order.orderItems.length,3)-1 ? 7 : 0 }}>
                            <span style={{ fontSize:'0.78rem', color:'#2e241f', fontWeight:500 }}>
                              {item.menuItem?.name || item.name}
                              <span style={{ color:'#8b6f63', fontWeight:400 }}> × {item.quantity}</span>
                            </span>
                            <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#6f4e37' }}>
                              ₹{(parseFloat(item.unitPrice||0)*item.quantity).toFixed(0)}
                            </span>
                          </div>
                        ))}
                        {order.orderItems.length > 3 && (
                          <div style={{ fontSize:'0.7rem', color:'#8b6f63', marginTop:7, textAlign:'center' }}>
                            +{order.orderItems.length-3} more
                          </div>
                        )}
                      </div>
                    )}

                    {/* Total */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                      paddingTop:10, borderTop:'1px dashed #e2d5c8' }}>
                      <span style={{ fontSize:'0.8rem', color:'#8b6f63', fontWeight:500 }}>Grand Total</span>
                      <span style={{ fontSize:'1.2rem', fontWeight:900, color:'#2e241f' }}>
                        ₹{parseFloat(order.grandTotal||0).toFixed(0)}
                      </span>
                    </div>

                    {/* Action */}
                    {order.status === 'CONFIRMED' && (
                      <button className="brew-btn brew-btn--primary"
                        onClick={() => sendToKitchen(order.id)}
                        style={{ width:'100%', padding:'12px', fontSize:'0.88rem', borderRadius:10,
                          display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                        Send to Kitchen
                      </button>
                    )}
                    {order.status === 'SENT_TO_KITCHEN' && (
                      <div style={{ textAlign:'center', padding:'11px', borderRadius:10,
                        background:'#fff8f0', border:'1px solid #f5d9b0',
                        color:'#b45309', fontWeight:600, fontSize:'0.84rem' }}>
                        Waiting for chef...
                      </div>
                    )}
                    {order.status === 'PREPARING' && (
                      <div style={{ textAlign:'center', padding:'11px', borderRadius:10,
                        background:'#fff8f0', border:'1px solid #f5d9b0',
                        color:'#b45309', fontWeight:600, fontSize:'0.84rem' }}>
                        Chef is preparing...
                      </div>
                    )}
                    {order.status === 'READY' && (
                      <button className="brew-btn brew-btn--success"
                        onClick={() => markDelivered(order.id)}
                        style={{ width:'100%', padding:'12px', fontSize:'0.88rem', borderRadius:10,
                          display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                        Mark as Delivered
                      </button>
                    )}
                    {order.status === 'DELIVERED' && (
                      <div style={{ textAlign:'center', padding:'11px', borderRadius:10,
                        background:'#f0fdf4', border:'1px solid #bbf7d0',
                        color:'#16a34a', fontWeight:600, fontSize:'0.84rem' }}>
                        Delivered
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes brewSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
