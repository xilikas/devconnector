import classnames from "classnames";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import React, { Component } from "react";
import { connect } from "react-redux";
import { registerUser } from "../../actions/authActions";

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
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className={classnames(
                                            // first param: classes always in effect
                                            // second param: conditional classes
                                            // errors comes from the state
                                            "form-control form-control-lg",
                                            {
                                                "is-invalid": errors.name
                                            }
                                        )}
                                        placeholder="Name"
                                        name="name"
                                        value={this.state.name}
                                        onChange={this.onChange}
                                    />
                                    {errors.name && ( // Will only appear is errors.name exists (API returned an error)
                                        <div className="invalid-feedback">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        className={classnames(
                                            "form-control form-control-lg",
                                            {
                                                "is-invalid": errors.email
                                            }
                                        )}
                                        placeholder="Email Address"
                                        name="email"
                                        value={this.state.email}
                                        onChange={this.onChange}
                                    />
                                    <div className="invalid-feedback">
                                        {errors.email}
                                    </div>
                                    <small className="form-text text-muted">
                                        This site uses Gravatar so if you want a
                                        profile image, use a Gravatar email
                                    </small>
                                </div>
                                <div className="form-group">
                                    <input
                                        type="password"
                                        className={classnames(
                                            "form-control form-control-lg",
                                            {
                                                "is-invalid": errors.password
                                            }
                                        )}
                                        placeholder="Password"
                                        name="password"
                                        value={this.state.password}
                                        onChange={this.onChange}
                                    />
                                    <div className="invalid-feedback">
                                        {errors.password}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <input
                                        type="password"
                                        className={classnames(
                                            "form-control form-control-lg",
                                            {
                                                "is-invalid": errors.password2
                                            }
                                        )}
                                        placeholder="Confirm Password"
                                        name="password2"
                                        value={this.state.password2}
                                        onChange={this.onChange}
                                    />
                                    <div className="invalid-feedback">
                                        {errors.password2}
                                    </div>
                                </div>
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
