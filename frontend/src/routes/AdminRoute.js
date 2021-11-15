import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { isAuthenticated } from '../components/auth/auth';

  const AdminRoute = ({component: Component, ...rest}) =>  {
    return (
       <Route  
           {...rest}
           render = {(props) => 
            //    isAuthenticated() && isAuthenticated().role === 1 
            true
               ? (
                   <Component {...props} />
               ) : 
               (
                   <Redirect to = '/null'/>
               )
           }
           />
    )
};

export default AdminRoute;
