import { DeleteOutlined, UploadOutlined, SendOutlined, CloseOutlined, MessageFilled } from '@ant-design/icons';
import { Avatar, Button, FormControl, FormHelperText, InputAdornment, OutlinedInput, TextField } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import io from "socket.io-client";
import { isAuthenticated } from '../../../components/auth/auth';
import { Signup } from '../../auth/Signup/Signup';
import './Popup.css';

let socket;
export const Popup = (props) => {
    const receiver = '618f8c0ad136d9bf4a704fdd';
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
        ENDPOINT = "https://chat-board-3.herokuapp.com/"; // The url of the domain on which you are hosting your backend in production mode
    }
    else {
        ENDPOINT = "http://localhost:8000";    // The url of the backend server in developement mode
    }


    const openForm = () => {
        document.getElementById("myForm").style.display = "block";
        document.getElementById("open-button").style.display = "none";
    }

    const closeForm = () => {
        document.getElementById("myForm").style.display = "none";
        document.getElementById("open-button").style.display = "block";
    }
    const submitHandler = async (e) => {
        e.preventDefault();
    };

    useEffect(() => {
        if (window.location.href.includes('confirm-email')) {
            return true;
        }
        else if (isAuthenticated().verification == false) {
            props.history.push('/verify-email');
        } else {
            return true;
        }

        return () => {

        }
    }, []);



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
        myDiv && myDiv.scrollIntoView({ behavior: 'smooth' });
    }



    useEffect(() => {
        socket = io(ENDPOINT)
        socket.emit("join", { userId: user._id, username: user.username }, () => {

        });

        socket.emit('Get Online Status', { receiver });

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
        closeForm();
        getSpecificUserChat();
        getUserById();
        scrolltobottom();
        socket.emit('Get Online Status', { receiver });
        return () => {

        }
    }, []);


    const deleteChatHandler = async (chatId, senderId) => {
        socket.emit("Delete Chat", { chatId: chatId, receiverId: receiver, userId: senderId });
    }

    return (
        <div className='chat-container'>
            <button className="open-button" id='open-button' onClick={() => openForm()}><MessageFilled /></button>
            <div className="chat-popup" id="myForm">
                <div>
                    <div className="close-container">
                        <button type="button" className="btn cancel" onClick={() => closeForm()}><CloseOutlined /></button>
                    </div>
                    {
                        isAuthenticated() ?
                            <div className='body'>

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
                            :
                            <Signup />
                    }
                </div>
                <form onSubmit={submitHandler} className="form-container">
                    <div className='input-container'>
                        <FormControl sx={{ m: 1, width: '100%', borderWidth: '2px' }} variant="outlined">
                            <OutlinedInput
                                style = {{borderRadius: '32px'}}
                                id="outlined-adornment-weight"
                                value={chatMessage}
                                onChange={onChange}
                                placeholder = 'Message'
                                endAdornment={<InputAdornment position="end"><SendOutlined onClick={submitChatHandler}/></InputAdornment>}
                                aria-describedby="outlined-weight-helper-text"
                                inputProps={{
                                    'aria-label': 'weight',
                                }}
                            />
                        </FormControl>
                    </div>
                </form>
            </div>
        </div>
    )
}
