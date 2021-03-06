import Link from 'next/link'

const CreateMenu = ({ active }) => {
  return (
    <div className="text-center my-2">
      <h5 className="py-2">What would you like to swap today?</h5>
      <ul className="tab tab-block">
        <li className={`tab-item ${active === 'lightning' ? 'active' : ''}`}><Link href="/make/lightning"><a>Lightning Network Bitcoin</a></Link></li>
        <li className={`tab-item ${active === 'evm' ? 'active' : ''}`}><Link href="/make/evm"><a>EVM Assets (Ether, Tokens, etc.)</a></Link></li>
      </ul>
    </div>
  )
}

export default CreateMenu
