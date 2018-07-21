import React from "react";

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
