import { useEvmSwapTaker } from '../../hooks'

const EvmSwapTakerController = ({ peer }) => {
  const { taker, maker, ...swap } = useEvmSwapTaker({ peer })
  return (
    <>
      <h3>Evm Taker</h3>
      <pre>{JSON.stringify(swap, null, 2)}</pre>
      {(() => {
        if (!swap.makerSwap) {
          return 'Fetching swap details...'
        }
        if (!swap.makerSwap.recipient) {
          return 'Please confirm your address + the swap...'
        }
        if (!swap.signedTakerSwap) {
          return 'Waiting for maker to sign his swap...'
        }
        if (!swap.preImage) {
          return 'Waiting for taker to publish the preImage...'
        }
        if (!swap.makerTxHash) {
          return 'Relaying...'
        }
        return (
          <>
            <div>Transactions:</div>
            <pre>{JSON.stringify(maker.provider.txs[swap.makerTxHash], null, 2)}</pre>
            <pre>{JSON.stringify(taker.provider.txs[swap.takerTxHash], null, 2)}</pre>
          </>
        )
      })()}
    </>
  )
}

export default EvmSwapTakerController