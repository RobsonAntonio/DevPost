import React, { useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import styled from 'styled-components';


import AuthRoutes from './auth.routes';
import AppRoutes from './app.routes';

import { AuthContext } from '../contexts/auth'


function Routes() {

    const { signed, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#36393f'
                }}>
                <ActivityIndicator size={50} color="#E52246" />
            </View>

        )
    }
    return (
        signed ? <AppRoutes /> : <AuthRoutes />
    );
}


export default Routes;