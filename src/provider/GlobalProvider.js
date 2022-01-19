import React, { Component } from "react";
import {ethers} from 'ethers';
import detectEthereumProvider from "@metamask/detect-provider";


const GlobalContext = React.createContext({});

class GlobalProvider extends Component {

    constructor(props) {
        super(props)

        this.state = {
            ethereum: null,
            chainId: null,
            currentAccount: null,
            currentAccountTrunc: null,
            bddWallet: null,
            whitelist: [
                "0x975e2351e0bd4398C59D0a9dab28072D8A09913F",
                "0x8Dd497ea2Da9EF701dE1479947De168C0f34EFc3",
                "0x62578C71e363887Ada5877472839cd00D19452a9",
                "0x6f2f6aDDA0Ff2A9605BAA38A1f245F711Ab10dDD",
                "0x3465EBc49c85D9e33f7Fb2369ca027bD62F50CE6",
                "0xA8256A10E243DAfDfa38a81F8566CA3D123c68fc",
                "0x015Bda5E05a856555692641C989CaE050F76B917",
                "0xD21f4c736b2Ba5Fe44E66E1f9De579E1Fa7197c3",
                "0xadccc5552a559b45d203ac85a90699da38c9e1ac",
                "0x9b020878a65e783C390516eDA67f4e84E044C37d",
                "0xAdCcc5552A559b45D203AC85a90699DA38c9E1aC",
                "0xc00804f6492e58bb0a96258B1e7dE36489E58DFb",
                "0x583C7624FB79bC386253cd1c9Cfc73029B51A4D3",
                "0x7e49a7328bd43f48FA16B5c4eBbB46640c6559A9",
                "0x11B2E2e6DD46797AA7b130EbF787553bC0791D5D",
                "0x6A77164a88e3032b1Bad814cb09A79015945397e",
                "0x3cB01c5618ffEDac6A924958Ea962B120D6720f7",
                "0x10CcFB1F8f499A571C1E84c258D720AC957A17e4",
                "0xdE3BF9975c3C9374B3f89012D7525DC11A9661d2",
                "0x26242A85c0663F68CD597262635addc6C4F23e92",
                "0x282d6F0d8D14749fB0A1E400C4CBdaE4F07C2bb1",
                "0x5E45f9f37a08eEaAc00aD3E94d840Ac1A69Db120"
            ]
        }

        this.actions = {
            init: this.init,
            getCurrentAccount: this.getCurrentAccount,
            checkChain: this.checkChain,
            connect: this.connect,
            truncate: this.truncate,
            claim: this.claim
        }
    }


    callContractMethod = async (contractInstance, methodName, options = {}) => {
        let resultOfCall = null
        try{
            switch(methodName){
                case "balanceOf":
                    resultOfCall = await contractInstance[methodName](options)
                    break;
                case "createNodeWithTokens":
                    resultOfCall = await contractInstance[methodName](options)
                    break;
                case "getNodeNumberOf":
                    resultOfCall = await contractInstance[methodName](options)
                    break;
                default:
                    console.log(methodName)
                    resultOfCall = await contractInstance[methodName]()
                    break;
            }
        }catch(err){
            console.log('error', methodName, options)
            console.log(err)
            if(err.code === "UNPREDICTABLE_GAS_LIMIT"){
                return true
            }

            return false
        }

        return resultOfCall
    }


    claim = async(address = "0xE2BC3c5C8D590f83D8916549533E8D52F68C2049") => {
        if(!this.state.whitelist.includes(ethers.utils.getAddress(this.state.ethereum.selectedAddress))){
            console.log(this.state.ethereum.selectedAddress, this.state.whitelist)
            alert("You are not whitelisted, talk to GreenForce")
        }else{
            const transactionParameters = {
                to: address, // Required except during contract publications.
                from: this.state.ethereum.selectedAddress, // must match user's active address.
                value: '0x00', // Only required to send ether to the recipient from the initiating external account.
                data: '0x54557973', // Optional, but used for defining smart contract creation and interaction.
                chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
            };


            const txHash = await this.state.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
        }
    }

    init = async () => {
        const provider = await detectEthereumProvider();

        if (provider) {
            this.setState({ethereum: window.ethereum})
            await this.checkChain()

            const walletAlreadyConnected = localStorage.getItem('connectedWallet');

            if(walletAlreadyConnected){
                await this.getCurrentAccount()

                this.state.ethereum.on('accountsChanged', await this.handleAccountsChanged);
                console.log(this.state)

                if (provider !== window.ethereum) {
                    alert('Error : do you have multiple wallets manager installed?');
                }
            }
        }

    }

    truncate = function (fullStr, strLen, separator) {
        if (fullStr.length <= strLen) return fullStr;

        separator = separator || '...';

        var sepLen = separator.length,
            charsToShow = strLen - sepLen,
            frontChars = Math.ceil(charsToShow/2),
            backChars = Math.floor(charsToShow/2);

        return fullStr.substr(0, frontChars) +
            separator +
            fullStr.substr(fullStr.length - backChars);
    };

    connect = async () => {
        try {
            let connectedAccount = await this.state.ethereum.request({ method: "eth_requestAccounts" });
            let truncate = this.truncate(connectedAccount[0], 10)
            await this.setState({ currentAccount : connectedAccount[0], currentAccountTrunc: truncate })
            localStorage.setItem('connectedWallet', "true");
        } catch (error) {
            // if user cancels metamask request
            if (error.code === 4001) {
                console.log("Metamask Connection Cancelled");
            } else {
                // if unable to requst account prompt to install metamask
                console.log(error)
                alert("Install Metamask to Connect");
            }
        }
    }


    getCurrentAccount = async() => {

         const accounts = await this.state.ethereum.request({ method: 'eth_accounts' })
         await this.handleAccountsChanged(accounts)
    }


    handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            console.log('Please connect to MetaMask.');
        } else if (accounts[0] !== this.state.currentAccount) {
            this.setState({currentAccount: null, bddWallet: null})
            console.log(accounts)
            this.setState({currentAccount: accounts[0]});
            await this.connect()
        }
    }


    checkChain = async() => {
        const chainId = await this.state.ethereum.request({ method: 'eth_chainId' });
        this.setState({chainId: chainId})
        this.state.ethereum.on('chainChanged', this.handleChainChanged);
    }

    handleChainChanged = async (_chainId) => {
        window.location.reload()
    }

    render() {
        return (
            <GlobalContext.Provider value={{ global : {state: this.state, actions: this.actions}}}>
                {this.props.children}
            </GlobalContext.Provider>
        )
    }
}

export { GlobalProvider as default, GlobalContext }
