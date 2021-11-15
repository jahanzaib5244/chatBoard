import { Avatar, Grid } from '@mui/material';
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { isAuthenticated } from '../auth/auth' 


export const ChatLayout = (props) => {
  const user = isAuthenticated();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getAllUsers();
    return () => {

    }
  }, []);


  const getAllUsers = async () => {
    await axios.get('/api/users/get').then(res => {
      const filteringUsers = res.data.filter(filUser => filUser._id !== user._id);
      setUsers(filteringUsers);
      console.log(users);
    })
  }

  return (
    <div className = 'admin'>
      {
        props.usersSide ?
          <>
            <div>
              <Grid container spacing={2}>
                <Grid item xs={2}>
                  <div className = 'sidebar'>
                    <div>
                      {
                        users.map(user => {
                          return (
                            <a href={'/chat/' + user._id} className = 'user-container'>
                                <Avatar sx={{ background: 'rgb(255, 87, 34)' }}>{user.fullName ? user.fullName.charAt(0) : 'X'}</Avatar>
                                <h2>{user.fullName}</h2>
                            </a>

                          )
                        })
                      }
                    </div>
                  </div>
                </Grid>
                <Grid className = 'chat-box' item xs={10}>
                  {props.children}
                </Grid>
              </Grid>
            </div>
          </>

          :
          props.children
      }

    </div>
  )
}
