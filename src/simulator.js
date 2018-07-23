import React from "react";
import Engine from "./engine/engine.js"

class Simulator extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "profile": ""
        }
    }

    inputHandler = (e) => {
        this.setState({"profile": e.target.value});
    }

    componentDidMount = () => {
        self.simc_callbacks = {
            "loaded": function() {
                console.log("loaded");
            },
            "update_progress": function(progress) {
                console.log(progress);
            }
        };

        this.simc = Engine();
    }

    render = () => {
        return (
            <div>
                <textarea rows="30" cols="50"
                    placeholder="Paste profile here!"
                    onChange={this.inputHandler}
                    value={this.state.profile} />
                <textarea rows="30" cols="50"
                    placeholder="Output"
                    readOnly />
            </div>
        )
    }
}

export default Simulator;
