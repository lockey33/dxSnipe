import React, { Component } from "react";
import axios from 'axios';
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
            bddWallet: null
        }

        this.actions = {
            init: this.init,
            checkProvider: this.checkProvider,
            getCurrentAccount: this.getCurrentAccount,
            checkChain: this.checkChain,
            connect: this.connect,
            sendTransaction: this.sendTransaction,
            checkWallet: this.checkWallet,
            snipe: this.snipe,
            updateWalletState: this.updateWalletState,
            listenBnb: this.listenBnb,
            listenPayment: this.listenPayment,
            truncate: this.truncate,
            setPremiumNow: this.setPremiumNow,
        }
    }

    setPremiumNow = async (paymentAddress, buyerAddress) => {
        const response = await axios.post('http://localhost:8080/setPremium', {paymentAddress: paymentAddress, buyerAddress: buyerAddress})
        console.log(response.data)
        return response.data
    }

    listenBnb = async () => {
        const snipeWallets = this.state.bddWallet.snipeWallets
        const response = await axios.post('http://localhost:8080/listenBnb', snipeWallets)
        console.log(response.data)
        return response.data
    }

    listenPayment = async () => {
        const paymentWallet = this.state.bddWallet.paymentWallet.address
        const response = await axios.post('http://localhost:8080/listenPayment', {paymentWallet: paymentWallet})
        console.log(response.data)
        return response.data
    }

    snipe = async (snipeObject) => {
        snipeObject.buyerAddress = this.state.currentAccount
        const response = await axios.post('http://localhost:8080/dxSnipe', snipeObject)
        console.log(response.data)
        return response.data
    }

    checkWallet = async (walletAddress) => {
        const response = await axios.post('http://localhost:8080/checkWallet', {walletAddress: walletAddress})

        this.setState({bddWallet: response.data[0]})
        return response.data[0]
    }

    updateWalletState = async (bddWallet) => {
        this.setState({bddWallet: bddWallet})
        const response = await axios.post('http://localhost:8080/updateWallet', {bddWallet})
        return response
    }


    init = async () => {
        const provider = await detectEthereumProvider();

        if (provider) {
            this.setState({ethereum: window.ethereum})
            await this.checkChain()

            const walletAlreadyConnected = localStorage.getItem('connectedWallet');

            if(walletAlreadyConnected){
                await this.getCurrentAccount()
                await this.checkWallet(this.state.currentAccount)

                this.state.ethereum.on('accountsChanged', await this.handleAccountsChanged);
                console.log(this.state)

                if (provider !== window.ethereum) {
                    alert('Error : do you have multiple wallets manager installed?');
                }
            }
        } else {
            alert('Please install MetaMask to use this site');
        }


    }

    connect = async () => {
        try {
            const connectedAccount = await this.state.ethereum.request({ method: "eth_requestAccounts" });
            await this.setState({ currentAccount : connectedAccount[0] })
            await this.checkWallet(this.state.currentAccount)
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
         console.log(accounts)
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
