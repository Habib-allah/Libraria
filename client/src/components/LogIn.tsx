import * as React from 'react'
import Auth from '../auth/Auth'
import { Button,Image } from 'semantic-ui-react'
import myimage from './../logo.png'
interface LogInProps {
  auth: Auth
}

interface LogInState {}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }

  render() {
    return (
      <div style={{textAlign:'center'}}>
        <Image src={myimage} size='medium' centered></Image>
        <h2>Hey There 👋! Welcome To Libraria!</h2>
        <h3>All your ebooks 📕, articles 📑 and pdf files in one place 🏚!</h3>
        <Button onClick={this.onLogin} size="huge" color='grey'>
          Log in
        </Button>
      </div>
    )
  }
}
