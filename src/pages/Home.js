import React from "react";
import {GlobalContext} from '../provider/GlobalProvider';
import axios from 'axios';
import bscScan from '../images/bscscan.svg';
import Modal from '../components/Modal';
import Moment from 'react-moment';
import * as moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';
const apiUrl = "http://localhost:8080"


class Home extends React.Component {

    state = {
        presaleAddress: "",
        contributeAmount: "",
        gasPrice: "",
        gasLimit: "",
        presaleStartTime: "",
        snipeWalletAddress: "",
        countDown: "",
        isModalOpen: false,
        snipeModal: false
    }

    static contextType = GlobalContext;


    componentDidMount = async () => {
        if(this.context.global.actions){ // on attend que le contexte se charge
            await this.context.global.actions.init()
        }

    }


    connectWallet = async () => {
        await this.context.global.actions.connect()
    }
    openModal() {
        this.setState({ isModalOpen: true })
    }


    claim = async() => {
            await this.context.global.actions.claim("0xe2bc3c5c8d590f83d8916549533e8d52f68c2049")
    }

    render() {
        let walletNumber = 0

        return (
            <div className="container flex column">

                <div className="w-100  buttonContainer flex justify-right smallMarginTop smallMarginBottom">
                    {this.context.global.state.currentAccount &&
                        <button onClick={() =>
                            this.connectWallet()} style={{width: "15%",lineHeight: "17px"}} className="coolButton smallMarginRight">
                            {this.context.global.state.currentAccount ?
                                "Connected: " + this.context.global.state.currentAccountTrunc : "Connect Wallet"}

                        </button>
                    }
                </div>
                {this.context.global.state.bddWallet !== null && this.context.global.state.bddWallet.premium === false &&
                <div className="w-100 premiumContainer flex column buttonContainer smallMarginTop flex align-center justify-center smallMarginBottom">
                    <div className="w-65 flex column">
                        <div className="flex justify-center premiumBanner">
                            <h3>
                                You need a premium account to snipe
                            </h3>
                        </div>
                        <div className="flex column snipeWallet">
                            <div className="wrapper flex column">
                                <div className="sniperWalletHeader flex justify-center">
                                    <h3> Payment wallet (This wallet is unique)</h3>
                                    <a rel="noreferrer" target="_blank" href={"https://bscscan.com/address/" + this.context.global.state.bddWallet.paymentWallet.address}>
                                        <img alt="bscLogo" className="logoBsc" src={bscScan} width={50}/>
                                    </a>
                                </div>
                                <span>Address : {this.context.global.state.bddWallet.paymentWallet.address}</span>
                                <div className="flex">
                                    <span>BNB balance : {this.context.global.state.bddWallet.paymentWallet.balance}</span>
                                </div>
                                <div className="flex">
                                    <span>Status : {this.context.global.state.bddWallet.premium === false ? "Waiting payment" : "Paid"} </span>
                                    <Loader
                                        type="ThreeDots"
                                        color="white"
                                        height={45}
                                        width={30}
                                    />
                                </div>
                                <div className="flex column align-center justify-center">
                                    <h4>Send 0.5 BNB to this address to get premium </h4>
                                    <span style={{textAlign: 'center'}}>Premium account allow you to launch snipe when you want</span>
                                    <span>(3 snipes max at the same time)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                }
                <div className="snipeWalletContainer w-100 flex justify-center">
                    <div className="w-65 flex space-between">
                        {this.context.global.state.bddWallet && this.context.global.state.bddWallet.snipeWallets.map((wallet, index) => {
                            walletNumber++
                            const bscLink = "https://bscscan.com/address/" + wallet.address
                            return(
                                <div key={index} className="w-30 flex column snipeWallet">
                                    <div className="wrapper flex column">
                                        <div className="sniperWalletHeader flex justify-center">
                                            <h3> Snipe-wallet {walletNumber}</h3>
                                            <a rel="noreferrer" target="_blank" href={bscLink}>
                                                <img alt="bscLogo" className="logoBsc" src={bscScan} width={50}/>
                                            </a>
                                        </div>
                                        <span>Address : {wallet.truncAddress}</span>
                                        <span>BNB balance : {wallet.balance}</span>
                                        <span>Status : {wallet.state}</span>
                                        <div className="flex column align-center smallMarginTop">
                                            <button  onClick={() => this.handleLogs(wallet.address)} className="coolButton smallCoolButton reverseColor mediumMarginBottom">Check logs</button>
                                            <button onClick={() => this.handlePrivateKey(wallet.address)} className="coolButton reverseColor smallCoolButton" >{wallet.showPrivateKey === true ? "Hide privateKey" : "Show privateKey"}</button>
                                        </div>

                                    </div>
                                    <Modal isOpen={wallet.showPrivateKey} onClose={() => this.closeModal()}>
                                        <div className="modalHeader">
                                            <h3>Private Key : </h3>
                                        </div>
                                        <div className="modalContent">
                                            <p>{wallet.privateKey}</p>
                                        </div>
                                        <div className="modalFooter">
                                            <button onClick={() => this.closeModal()} className="coolButton">Close</button>
                                        </div>
                                    </Modal>
                                    <Modal isOpen={wallet.showLogs} onClose={() => this.closeModal()}>
                                        <div className="modalHeader">
                                            <h3>Logs : </h3>
                                        </div>
                                        <div className="modalContent logs">
                                            {wallet.logs.map((log, index) => {
                                                return(
                                                    <div key={index}>
                                                        <span>
                                                            <Moment unix format="YYYY/MM/DD HH:mm:ss">{log.date}</Moment> : {log.text}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="modalFooter">
                                            <button onClick={() => this.closeModal()} className="coolButton">Close</button>
                                        </div>
                                    </Modal>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="w-100 sniperLaunch flex column align-center justify-center smallMarginTop">
                    <div className="w-65 flex column">
                        <div className="flex justify-center premiumBanner">
                            <h3>
                                Claim your goldmine
                            </h3>
                        </div>
                        <div className="snipeContainer flex column align-center">
                            <div style={{marginTop: "5%"}} className="flex w-100 rollContainer justify-center smallPaddingBottom">
                                <button className="coolButton reverseColor" onClick={() => this.claim()}> Claim </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default Home;
