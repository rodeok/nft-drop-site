import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react'
import '../styles/globals.css'

const MyApp = ({ Component, pageProps }) => {
    return (
        <ThirdwebProvider
            desiredChainId={ChainId.Rinkeby}
            chainRpc={{
                [ChainId.Rinkeby]: 'https://rinkeby.infura.io/v3/b71c41379a1d4c0ca532ff701141106a',
            }}
        >
            <Component {...pageProps} />
        </ThirdwebProvider>
    )
}

export default MyApp