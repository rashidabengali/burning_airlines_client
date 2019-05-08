import React, { Component } from 'react';
import { Button, FormGroup, FormControl } from "react-bootstrap";
import "./Login.css";
import axios from 'axios';

const SERVER_URL = 'https://powerpuffairlines.herokuapp.com/users.json';

// alert('Logged in');
// this.props.userHasAuthenticated(true);

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: ""
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault();
    // store user id
    // via windows localstorage
    let user_id = -1;
    //const getUser_id = () => {
      axios.get(SERVER_URL).then((results) => {
        //this.setState({user_id: results.data});
        const userslist = results.data;
        for (let i=0; i<userslist.length; i++) {
          if (userslist[i].email === this.state.email) {
            user_id = userslist[i].id;
            break;
          }
        }
      });
      //}
    //};
    //getUser_id()

    // //if (typeof (Storage) !== "undefined") {
		// localStorage.setItem('user_id', user_id);
    // //}
    // // direct to homepage
    const urlstr = window.location.href + "home";
    window.location.replace(urlstr);
  }

  render() {
    return (
      <div className="Login">
        <form onSubmit={this.handleSubmit} action="/home">
          <FormGroup controlId="email" bsSize="large">
            Email
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            Password
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
          >
            Login
          </Button>
        </form>
      </div>
    );
  }
}
