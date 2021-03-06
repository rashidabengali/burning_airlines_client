import React, {Component} from 'react';
import axios from 'axios';
import UserProfile from './UserProfile';
import './../App.css';
import { Link } from 'react-router-dom';

class Reservation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      planeRows: 0,
      planeCols: 0,
      takenseats: "",
      seats: 0,
      flight_URL: '',
      planename: '',
      origin: '',
      destination: '',
      flightnum: '',
      flightdate: ''
    }
    this.getFlight = this.getFlight.bind(this);
    this.getFlightURL = this.getFlightURL.bind(this);
    //UserProfile.setName("testuser");
    //UserProfile.setUserId(1);

  };

  getFlightURL() {
    const flight_id = this.props.match.params.flightid;
    const flight_URL = "https://powerpuffairlines.herokuapp.com/flights/" + flight_id + ".json"; //make dynamic
    this.setState({ flight_URL: flight_URL });

  }


  getFlight () {
    if (this.state.flight_URL===null) {
      this.getFlightURL();
    }
    axios.get(this.state.flight_URL).then((results) => {
      if (results!==null && results.data!==null && results.data.takenseats!==undefined) {
        let fr = results.data.origin;
        if (fr === null || fr === "") {
          fr = results.data.origin_code;
        }
        let t = results.data.destination;
        if (t === null || t === "") {
          t = results.data.destination_code;
        }
        this.setState({ takenseats: results.data.takenseats, seats: results.data.seats, from: fr, to: t, planename: results.data.planename, flightnum: results.data.flightnumber, flightdate: results.data.flightdate });
      }
    });
  }

  componentDidMount () {
    this.getFlightURL();
    this.getFlight();

    const plane_id = this.props.match.params.planeid;
    const plane_URL = "https://powerpuffairlines.herokuapp.com/planes/" + plane_id + ".json";

    axios.get(plane_URL).then((results) => {
      this.setState({planeRows: results.data.rows, planeCols: results.data.cols });
      setInterval(this.getFlight, 3000);
    })
  }

  render() {
    //console.log(this.state.flight_URL);
    //this.getFlightURL();
    //this.getFlight();

    return (
      <div>
      <h1>Flight Reservation for { this.state.flightnum }</h1> 
      <h2>Flying from { this.state.from } to { this.state.to } 
      <br />on { this.state.flightdate } (Plane: {this.state.planename})</h2>
      <DisplaySeats planeRows={this.state.planeRows} planeCols={this.state.planeCols} flightid={this.props.match.params.flightid} takenseats={this.state.takenseats} seats={this.state.seats} />

      <Link to={ "/flights/" }><button className="selectpayment" >Payment Done</button></Link>
      <p>
          <Link to="/home">Back to Home</Link>
      </p>
      </div>
    )
  }
};

class DisplaySeats extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedSeat: '',
      username: UserProfile.getName(),
      user_id: UserProfile.getUserId()
    }

  }

  /* creating a table of seats */
  displayRow = (rows, cols) => {
    let aisle = 2;
    if (cols%2===0) {
      //even
      aisle = cols/2;
    } 

    let table = [];
    for (let i=0; i<rows; i++) {
      let eachRow = [];
      for (let j=0; j<cols; j++) {
        if (j===aisle) {
          eachRow.push(<td className="aisle" style={{pointerEvents: 'none', borderRadius: '0px', disabled: true, hover: 'none'}}>XX</td>);
        }
        eachRow.push(<Seat onSelectSeat={this.handleSeatSelection} datacol={j} datarow={i} selectedSeat= {this.state.selectedSeat} takenseats={this.props.takenseats} seats={this.props.seats} />)
        // onClick={this._onClick} >{`C: ${j} R: ${i}`}
      }
      table.push(<tr data-row={i}>{eachRow}</tr>)
    }
    return (
      table
    );
  }
  /* latest seat selected by user is passed into this*/
  handleSeatSelection = (seat) => {
    this.setState({selectedSeat: seat});
  }

  /*This is the button event handler, the seat number which is selected is being passed into it which has to be used in post request further*/

  /* button is enabled only after a selection */

  handleSubmit = () => {
    const user_id = UserProfile.getUserId();
    console.log(user_id);
    console.log(this.props.flightid);
    console.log(this.state.selectedSeat);
    const hotseat = this.state.selectedSeat.trim();
    let canAddSeat = true;

    let startseats = "";
    if (this.props.takenseats!==null) {
      startseats = this.props.takenseats.trim();
      //check if already there, for validation
      canAddSeat = !(startseats.includes(hotseat));
    }

    if (hotseat!==null && hotseat!=="" && canAddSeat===true ) {
      const rs_url = "https://powerpuffairlines.herokuapp.com/reservations.json";
      axios.post(rs_url, { user_id: this.state.user_id, flight_id: this.props.flightid, seatnumber: hotseat }).then((result) =>{
      //post actions
      });

      const flight_URL = "https://powerpuffairlines.herokuapp.com/flights/" + this.props.flightid + ".json"; //make dynamic
      
      const takenseats = startseats + "," + hotseat + ",";

      axios.put(flight_URL, { takenseats: takenseats, seats: (this.props.seats - 1) }).then((result) =>{
        //post actions
      });
    }

  }

  render() {
    return (
      <div className="seatdisplay">
      <div className="seatdisplay">
      {this.displayRow(this.props.planeRows, this.props.planeCols)}
      </div>
      <p></p>
      <button className="selectpayment" disabled={!this.state.selectedSeat} onClick={this.handleSubmit}>Select</button>
      </div>
    );
  }
};

class Seat extends React.Component {
  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this)
  }

  /* selectedSeat state is initially blank in the parent class DisplaySeats and it is being passed to this child class Seat as props so that the click <td> innertext(seatNumber) can be stored inside selectedSeat and the seatNumber can be passed into the onSelectSeat function as an argument */
  _onClick(e) {
      const seat = e.currentTarget.innerText;
      console.log("onClick==" + seat);
      this.setState({selectedSeat: seat})
      this.props.onSelectSeat(seat);
  }

  render() {
    //console.log(this.props.takenseats);
    const takenseats = this.props.takenseats;

    //const seatNumber = "" + ( (this.props.datacol + 1) + 9).toString(36).toUpperCase() + (this.props.datarow + 1);
    const seatNumber = "" + (this.props.datarow + 1) + ( (this.props.datacol + 1) + 9).toString(36).toUpperCase();
    //console.log(seatNumber);

    let className = this.props.selectedSeat === seatNumber ? 'clicked' : '';
    if (takenseats!==null && takenseats!=="") {
      className = takenseats.includes(seatNumber + ",") ? 'taken' : className;
    }

    if (className==="taken") {
      return (
        <td onClick={this._onClick} className="taken" id={seatNumber} style={{pointerEvents: 'none', disabled: true, hover: 'none'}}>
        {seatNumber}
        </td>
      );
    } else {
      return (
        <td onClick={this._onClick} className={className} id={seatNumber}>
        {seatNumber}
        </td>
      );
    }
  }
}

export default Reservation;
