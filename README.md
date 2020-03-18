# 🧬 MetaSwap

Cross-chain swaps with metatransactions

![metaswap](./basics2.png)

The is the most basic possible overview of a Metaswap. Read on to find out implementation details.

## Overview

MetaSwap is a protocol that leverages metatransactions to enable instant, 'economically-trustless', 'gassless' swaps between multiple assets, EVM chains, and Lightning invoices.

Currently, MetaSwap allows two parties to swap between any of the following:

- Lightning Network
- Any EVM chain base coin (ETH, ETC, RSK, TRX, etc.)
- Any ERC20 token on any of these chains

Potentially, it supports any other other asset (such as NFTs or other token standards).

Right now **MetaSwap is just a technical demo** that demonstrates an absolutely minimal proof of concept implementation of the protocol and a basic UI to help understand this flow. MetaSwap was built for fun as a side project, so do not expect production level attention to detail, code quality or security guarantees.

This repo includes:

- A contract; MetaSwap.sol in `/contracts/`
- A frontend; metaswap.io in `/app/`

### Demo

The easiest way to see how it works is to watch this demo video:

https://youtu.be/EtT9lcJenIk

A demo version of metaswap is deployed to https://metaswap.io/make. It has hard-coded accounts with no security to enable easy in-person demoing on a mobile phone. It is currently only enabled for Lightning Network, Kovan and Rinkeby.

### Why?

Hopefully this mechanism can inspire similar projects to improve cross chain interoperability.

## Advantages of MetaSwap

Compared to other swap systems such as atomic swaps or submarine swaps, MetaSwaps have some benefits:

- Users don't need any existing assets on the chain they wish to on-ramp into
- Swaps are FAST; they are 'settled' off-chain, so from the user's point of view they can happen instantly
- Only a single transaction per asset per swap is required; less gas is consumed overall
- The recipient address on either side of the swap can be any address, so users can swap directly into an exchange account or cold storage wallet
- Users can pay for the transaction relay fee in any asset; swaps can happen even if neither party has Ether
- Swaps are effectively settled off-chain, preventing certain types of frontrunning

## How does MetaSwap work?

The system is quite simple, and relies on the following core process.

For each side of the swap, there are 4 accounts involved:

- "Deposit Account", maker/taker who deposits and can withdraw funds that are locked on chain
- "Signer", an address that the deposit account can delegate the ability to make swaps (useful for mobile swapping)
- "Recipient", any address to receive swap
- "Relayer", to be rewarded for publishing the swap

At least one side of the swap must have have deposited swappable assets in to the MetaSwap.sol contract on an EVM chain. These deposited assets will then be locked for X number of blocks (a cooldown period can be triggered before they are withdrawn again).

The current demo implements communication between parties via WebRTC, with messages encryped using their signer addresses.

Once the swappable funds are deposited, a swap can take place.

- A `preImage` (random string of data) is generated by the `maker` of the swap
- The `maker` hashes this `preImage` to create a `preImageHash`
- The `maker` offers a the `taker` some amount of an asset that will be sent if the `preImage` is revealed on chain
- The `taker` agrees to the swap by responding with a `recipient` address
- The `maker` creates and shares a signed metatransaction that will send the funds to the `taker` if the `preImage` is revealed on-chain

At this point, the `taker` knows that if the `preImage` is revealed, it can be published along with the `maker`s metatransaction to claim this side of the swap. So how can `taker` convince the `maker` to reveal the `preImage`?

- In the case of Lightning, The `maker` provides a Lightning Invoice that will reveal the `preImage` upon payment (he generates an invoice and uses the same `preImageHash`).
- In the case of an EVM chain, the `taker`, who has also deposited into MetaSwap.sol, signs a metatransaction with the other side of the swap using the _same_ `preImageHash` as the `maker`, knowing that the `maker` will reveal it on-chain to claim their side of the swap.

The metatransaction that is revealed on-chain contains following properties along with a signature:

- `address` Address of the contract itself
- `nonce` Incrementing nonce 
- `recipient` Where swapped funds are sent
- `account` Maker or Taker deposit address
- `asset` 0x0 for Ether or a token address
- `amount` Asset of the swapped amount
- `expiration` Timestamp of expiration date of swap
- `relayerAddress` Address of relayer
- `relayerAsset` Asset to reward relayer
- `relayerAmount` Amount of relayer reward
- `relayerExpiration` A time period that the primary relayer gets (other relayers can publish after this)
- `preImageHash` A hash of the `preImage` that will be revealed to settle the swap
- `signature` the above variables are concatenated, hashed, and signed
- `preImage` The random string that can be revealed along with the signature to process a swap

See the `swap` function in Metaswap.sol to see specifics on how this metatransaction is crafted.

### Punishment for cheating

But there is an obvious way to cheat this system; either the `maker` or the `taker` can simply publish a bunch of metaswaps to themselves and drain their deposited funds before the legitimate buyer has chance to take out their side of the swap.

There is a simple way to make cheating a lot more difficult - by having a rate limit. If either side publishes too many metatransactions, then they will lose all of their funds. The current implementation of this rate limit is based on a proportion of the available funds. The default setting for this demo is 20% -- if one side tries to cheat, he will need to cheat more than 5 parties simultaneously to make a profit, and even this is not guaranteed.

This is what is meant by "economically-trustless"; if a side cheats, they risk losing their entire deposit.

This rate limit approach is pretty basic, and can certainly be improved in future versions. It could rate limit by transaction number, and/or other parameters to make the possibility of cheating nearly zero; another mechanism could be submit a proof of fraud to cancel the opposite side of the swap.

## Improvements for future versions

The existing version of MetaSwap is an absolute minimal proof of concept that demonstrates a happy-path scenario. There are various improvements that could be made to improve this MetaSwap reference implementation and/or additional layers to this ecosystem.

- More documentation once some things are finalised
- Good quality code and testing
- Validation to prevent every edge case
- Dedicated signalling server
- Add additional networks; Ethereum, Etheruem Classic, Rootstock, Tron, etc.
- Better punishment systems
- Ability to submit a proof of fraud to cancel the opposite side of the swap
- Relayer commitments and punishment for not relaying
- Integration with relay pools such as GTN
- Explore integrating liquidity pools such as Uniswap
- Alternative communication between peers (not just WebRTC/peer.js, maybe whisper?)

## License

The contents of this repo (both `app` and `contracts`) are made available under the MIT License.
