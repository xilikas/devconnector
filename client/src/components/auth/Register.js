import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { registerUser } from "../../actions/authActions";
import TextFieldGroup from "../common/TextFieldGroup";

class Register extends Component {
    constructor() {
        super();

        // Setting up component state; initializing empty fields
        this.state = {
            name: "",
            email: "",
            password: "",
            password2: "",
            errors: {}
        };

        // Bind "this" to components
        // this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    // If user is logged in, redirect to dashboard
    componentDidMount() {
        if (this.props.auth.isAuthenticated)
            this.props.history.push("/dashboard");
    }

    // Test for certain properties; assigns to component state
    componentWillReceiveProps(nextProps) {
        if (nextProps.errors) this.setState({ errors: nextProps.errors });
    }

    // Every keypress will activate this function; set keypresses to component state
    onChange = e => {
        /*
        onChange(e) {
            this.setState({ [e.target.name]: e.target.value });
        }
        */
        // Instead of doing above, can rewrite as arrow function
        this.setState({ [e.target.name]: e.target.value });
    };

    onSubmit(e) {
        // Does not submit form in normal way
        e.preventDefault();

        const newUser = {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            password2: this.state.password2
        };

        // Use this.props.history to redirect from within action
        this.props.registerUser(newUser, this.props.history);

        // Making POST request to /api/users/register backend
        // Don't need "...localhost:5000" because of proxy value in package.json
        // Will be re-implemented in Redux; just testing API
        // axios
        //     .post("/api/users/register", newUser)
        //     .then(res => console.log(res.data))
        //     .catch(err => this.setState({ errors: err.response.data }));
    }

    render() {
        const { errors } = this.state;
        // const errors = this.state.errors; => same thing as above. { curlyBraces } pulls the object out

        return (
            <div className="register">
                <div className="container">
                    <div className="row">
                        <div className="col-md-8 m-auto">
                            <h1 className="display-4 text-center">Sign Up</h1>
                            <p className="lead text-center">
                                Create your DevConnector account
                            </p>
                            <form noValidate onSubmit={this.onSubmit}>
                                <TextFieldGroup
                                    name="name"
                                    placeholder="Name"
                                    value={this.state.name}
                                    onChange={this.onChange}
                                    error={errors.name}
                                />
                                <TextFieldGroup
                                    name="email"
                                    placeholder="Email Address"
                                    type="email"
                                    value={this.state.email}
                                    onChange={this.onChange}
                                    error={errors.email}
                                    info="This site uses Gravatar to pull profile images. Please use associated Gravatar email address if desired."
                                />
                                <TextFieldGroup
                                    name="password"
                                    placeholder="Password"
                                    type="password"
                                    value={this.state.password}
                                    onChange={this.onChange}
                                    error={errors.password}
                                />
                                <TextFieldGroup
                                    name="password2"
                                    placeholder="Confirm Password"
                                    type="password"
                                    value={this.state.password2}
                                    onChange={this.onChange}
                                    error={errors.password2}
                                />
                                <input
                                    type="submit"
                                    className="btn btn-info btn-block mt-4"
                                />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Register.propTypes = {
    registerUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

// Get from application state
const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { registerUser }
)(withRouter(Register));
