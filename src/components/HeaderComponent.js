import React from "react";
import { GlobalContext } from '../provider/GlobalProvider';
import "../styles/main.css";
import "../styles/header.css";
import Aim from "../images/aim.svg";

class HeaderComponent extends React.Component {

    state = {
    }

    static contextType = GlobalContext;

    componentDidMount = async () => {
    }

    render() {
        return (
            <div className="headerContainer flex column justify-center align-center">
                <div className="headerGroup flex align-center">
                    <h2>Claim dAPP</h2>
                </div>


            </div>
        )
    }
}
export default HeaderComponent;
