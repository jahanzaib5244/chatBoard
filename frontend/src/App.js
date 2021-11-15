import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './index.css'
import { Login } from './pages/auth/Login/Login';
import { Popup } from './pages/chat/UserChat/Popup';
import { Chat } from './pages/chat/AdminChat/Chat';
import { ChatBody } from './pages/chat/AdminChat/ChatBody';
import AdminRoute from './routes/AdminRoute';

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <div>
          <div>
            <Switch>
              <Route exact path='/' component={Popup} />
              <Route exact path='/login' component={Login} />
              {/* <Route exact path='/signup' component={Signup} /> */}

              <AdminRoute exact path='/admin/chat' component={Chat} />
              <AdminRoute exact path='/chat/:id' component={ChatBody} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    </div>

  )
}

export default App;