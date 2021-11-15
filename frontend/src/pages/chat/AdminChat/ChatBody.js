import { DeleteOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import io from "socket.io-client";
import { isAuthenticated } from '../../../components/auth/auth';
import { ChatLayout } from '../../../components/chat/ChatLayout';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import './Admin.css';
import { Button, FormControl, Grid, InputAdornment, OutlinedInput } from '@mui/material';


let socket;
export const ChatBody = (props) => {
  const receiver = props.match.params.id;
  const user = isAuthenticated();
  const [chatMessage, setChatMessage] = useState("");
  const [getMessage, setGetMessage] = useState([]);
  const [typingMessage, setTypingMessage] = useState('');
  const [onlineMessage, setOnlineMessage] = useState('');
  const [receiverHeader, setReceiverHeader] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  let ENDPOINT;
  if (process.env.NODE_ENV === 'production') {
    ENDPOINT = "https://mychatapp786.herokuapp.com/"; // The url of the domain on which you are hosting your backend in production mode
  }
  else {
    ENDPOINT = "http://localhost:8000";    // The url of the backend server in developement mode
  }


  const onChange = e => {
    setChatMessage(e.target.value);
  };


  const getSpecificUserChat = async () => {
    await axios.post(`/api/chats/ind-chat`, { userId: user._id, receiverId: receiver }, {
      headers: {
        authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(res => {
      if (res.status === 200) {
        setGetMessage(res.data.result);
      }
      else {
        setGetMessage('');
      }
    })
  }


  const getUserById = async () => {
    await axios.get(`/api/users/get/${receiver}`).then(res => {
      setReceiverHeader(res.data);
    })
  }

  const scrolltobottom = () => {
    var myDiv = document.getElementById("myDiv");
    myDiv.scrollIntoView({ behavior: 'smooth' });
  }



  useEffect(() => {
    socket = io(ENDPOINT)
    socket.emit("join", { userId: user._id, username: user.username }, () => {

    });

    socket.emit('Get Online Status', { receiver });

    socket.on("Outputting Online Status", online => {
      setOnlineMessage(online);
    });

    socket.on("Output Chat Message", messageFromBackend => {
      setGetMessage(messageFromBackend);
      scrolltobottom();
    });

    return () => {
      // socket.disconnect();
    }
  }, [ENDPOINT]);

  const submitChatHandler = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setLoading(true);
    setTypingMessage("");
    let type = "Text";
    chatMessage &&
      await socket.emit("Input Chat Message", {
        message: chatMessage,
        userId: user._id,
        username: user.username,
        receiver: receiver,
        nowTime: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
        type
      });
    setChatMessage("");
    scrolltobottom();
    setLoading(false);

  }

  setTimeout(() => {
    setTypingMessage("");
  }, 2000);



  useEffect(() => {
    // closeForm();
    getSpecificUserChat();
    getUserById();
    scrolltobottom();
    socket.emit('Get Online Status', { receiver });
    socket.on("Outputting Online Status", online => {
      setOnlineMessage(online);
    });
    return () => {

    }
  }, []);


  const deleteChatHandler = async (chatId, senderId) => {
    socket.emit("Delete Chat", { chatId: chatId, receiverId: receiver, userId: senderId });
  }

  return (
    <ChatLayout usersSide>
      <div className='admin-chat-body'>
        <div style={{ position: 'relative' }}>
          <div className='header-avatar'>
            <div className='name-container'>
              <div>
                <Avatar sx={{ background: 'rgb(255, 87, 34)' }}>{receiverHeader.fullName ? receiverHeader.fullName.charAt(0) : 'close'}</Avatar>
              </div>
              <div>
                <h4 className='name'>{receiverHeader.fullName}</h4>
                <p className='online'>{onlineMessage}</p>
              </div>
            </div>
            <div className='info-container'>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <div>Name:</div>
                </Grid>
                <Grid item xs={8}>
                  <div>{receiverHeader.fullName}</div>
                </Grid>
                <Grid item xs={4}>
                  <div>Email:</div>
                </Grid>
                <Grid item xs={8}>
                  <div>{receiverHeader.email}</div>
                </Grid>
                <Grid item xs={4}>
                  <div>Phone:</div>
                </Grid>
                <Grid item xs={8}>
                  <div>{receiverHeader.phone}</div>
                </Grid>
              </Grid>
            </div>
          </div>
        </div>

        <div>
          <div style={{ overflowX: 'hidden', marginTop: '0px', height: '71vh', overflowY: 'auto' }}>
            {
              getMessage && getMessage.map(chat => {
                return (
                  <>
                    <div className='message-container'>
                      {
                        chat.sender._id !== user._id &&
                        <div className='receiver each'>
                          <div className='d-flex'>
                            <Avatar sx={{ background: 'rgb(255, 87, 34)' }}>{receiverHeader.fullName ? receiverHeader.fullName.charAt(0) : 'X'}</Avatar>
                            <div>
                              <p className='time '>{moment(chat.timeOfSending, 'dddd, MMMM Do YYYY, h:mm:ss a').fromNow()}</p>
                              <p className='message'>{chat.message}</p>
                            </div>
                          </div>
                        </div>
                      }
                      {
                        chat.sender._id === user._id &&
                        <div className='sender each'>
                          <div className='d-flex'>
                            <Avatar sx={{ background: 'rgb(255, 87, 34)' }}>{chat.sender.fullName ? chat.sender.fullName.charAt(0) : 'X'}</Avatar>
                            <div>
                              <p className='time '>{moment(chat.timeOfSending, 'dddd, MMMM Do YYYY, h:mm:ss a').fromNow()}</p>
                              <div>
                                <p className='message'>{chat.message}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                      }
                    </div>
                  </>
                )
              })
            }
            <div id='myDiv'>
            </div>
          </div>
          <div style={{ position: 'fixed', bottom: '0px', width: '80%' }}>
            <div className='input-container'>
              {/* <TextField value={chatMessage} id="standard-basic" label="Type message here..." variant="standard" onChange={onChange} />
              <Button variant="contained" endIcon={<SendOutlined />} onClick={submitChatHandler}>
                Send
              </Button> */}
              <FormControl sx={{ m: 1, width: '100%', borderWidth: '2px' }} variant="outlined">
                <OutlinedInput
                  style={{ borderRadius: '32px' }}
                  id="outlined-adornment-weight"
                  value={chatMessage}
                  onChange={onChange}
                  placeholder='Message'
                  endAdornment={<InputAdornment position="end"><SendOutlined onClick={submitChatHandler} /></InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                />
              </FormControl>
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>

  )
}
