import React from 'react';
import { View, Text } from 'react-native';
import {Container, Title} from './styles'


function Header() {
 return (
   <Container>
      <Title>
        Dev 
        <Text style={{fontStyle: 'italic', color: '#e52246'}} >Post</Text> 
      </Title>
   </Container>
  );
}

export default Header;