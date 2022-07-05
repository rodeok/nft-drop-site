import Head from 'next/head'
import Image from 'next/image'
import { useAddress, useDisconnect, useMetamask,useNFTDrop } from '@thirdweb-dev/react'
import Login from '../components/Login'
import Header from "../components/Header"
import Hero from "../components/Hero"
import NFTDisplay from "../components/NFTDisplay"
import { useEffect, useState } from 'react'
import { useAllowlist } from '../utils/allowList'
import Loading from '../components/Loading'
import useFetcher from '../utils/fetch'
const styles = {
  wrapper: 'flex min-h-screen bg-[#1d1d1d] text-gray-200',
  container: 'flex flex-col lg:flex-row flex-1 p-5 pb-20 lg:p-10 space-y-10 lg:space-y-0',
  infoSection: 'lg:w-2/3 px-10',
  mobileDisplaySection: 'h-[300px] flex w-full lg:hidden lg:w-1/3 mt-4',
  desktopDisplaySection: 'hidden lg:flex flex-1 lg:w-1/3',
}

export default function Home() {
  const address = useAddress()
  const connectWithMetaMask = useMetamask()
  const disconnect = useDisconnect()
  const [loading, setLoading] = useState(false)
  const allowlist = useAllowlist()
  const [inAllowlist, setInAllowlist] = useState([])
  const [claimedSupply, setClaimedSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [nftPrice, setNFTPrice] = useState(0)
  const [claimPhases, setClaimPhases] = useState([])
  const fetcher = useFetcher()
  const isAdmin = address === process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS
  const nftDrop = useNFTDrop(process.env.NEXT_PUBLIC_NFT_DROP_ADDRESS )
  useEffect(() => {
    if (!address) return

    const checkAllowlist = async () => {
        setLoading(true)

        try {
            const inAllowlist = await allowlist.check(address)
            setInAllowlist(inAllowlist)
        } catch (error) {
            console.log(error)
        }
    }

    checkAllowlist()
}, [address])
  const joinAllowlist = async () => {
    setLoading(true)

    try {
        const success = await allowlist.join(address)
        if (success) setInAllowlist(true)
    } catch (error) {
        console.log(error)
    } finally {
        setLoading(false)
    }
}
const mintNFT = async () => {
  if (!nftDrop) return

  setLoading(true)
  try {
      const quantity = 1
      const transaction = await nftDrop.claimTo(address, quantity)

      const claimedNFT = transaction[0]
      if (claimedNFT) await allowlist.update(address)
  } catch (error) {
      console.log(error)
  } finally {
      setLoading(false)
  }

}
const downloadAllowlist = async () => {
  setLoading(true)

  try {
      await allowlist.download()
  } catch (error) {
      console.log(error)
  } finally {
      setLoading(false)
  }
}
useEffect(() =>{
  if (!address) return 

  const getNFTDropDetails = async () => {
    try{
      const {claimedSupply, totalSupply,nftPrice,claimPhases} = await fetcher.get("/api/get-nft-drop")
      setClaimedSupply(claimedSupply)
      setTotalSupply(totalSupply)
      setNFTPrice(nftPrice)
      setClaimPhases(claimPhases)
    } catch(error){
      console.log(error)
    }finally{
      setLoading(false)
    }
  }

  getNFTDropDetails()
}, [address])
  return (
    <>
    {address ? (
   
    <div className={styles.wrapper}>
      {/* header */}
     <Head>
      <title>Home | NFT Drop</title>
     </Head>

     {loading && <Loading/>}
     {/* header ends */}
     <div className={styles.container}>
   <section className={styles.infoSection}>
{/*  */}
    <Header logout={disconnect} isAdmin={isAdmin}  inAllowlist={inAllowlist} joinAllowlist={joinAllowlist} downloadAllowlist={downloadAllowlist} ></Header>
    <div className={styles.mobileDisplaySection}>
    <NFTDisplay/>  
      </div>
    {/* <div className={styles.mobileDisplaySection}>
      Claim Phases
    </div> */}
    <Hero claimPhases={claimPhases} inAllowlist={inAllowlist}  claimedSupply={claimedSupply} totalSupply={totalSupply} nftPrice={nftPrice} mintNFT={mintNFT}/>
   </section>
   <section>
   <NFTDisplay/>
   </section>
     </div>
    </div>
    ):(
      <div>
       <Login login={connectWithMetaMask}/>
      </div>
    )}
    </>
  )
}
