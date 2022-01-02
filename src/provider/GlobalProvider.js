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
            whitelist: ["0x975e2351e0bd4398C59D0a9dab28072D8A09913F"]
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
