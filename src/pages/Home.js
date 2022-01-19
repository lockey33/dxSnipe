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
                    {!this.context.global.state.currentAccount ?
                        <button onClick={() =>
                            this.connectWallet()} style={{width: "15%", lineHeight: "17px"}}
                                className="coolButton smallMarginRight">Connect</button>
                        : <></>
                    }

                    {this.context.global.state.currentAccount &&
                        <button onClick={() =>
                            this.connectWallet()} style={{width: "15%",lineHeight: "17px"}} className="coolButton smallMarginRight">
                            {this.context.global.state.currentAccount ?
                                "Connected: " + this.context.global.state.currentAccountTrunc : "Connect Wallet"}

                        </button>
                    }
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
