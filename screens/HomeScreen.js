import React, {useEffect, useState} from 'react';
import { StyleSheet, ImageBackground, Text } from 'react-native';

import {Button, Input} from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

import {connect} from 'react-redux';


import AsyncStorage from '@react-native-async-storage/async-storage';

function HomeScreen(props) {
    const [pseudo, setPseudo] = useState('');
    const [userName, setUserName] = useState('');


    useEffect(() => {
      var initUser = () => {
        AsyncStorage.getItem("userName", function(error, data) {
          console.log(data)
        if(data !== null){
        setUserName(data)
        }
      })};
      initUser()
    },[])


    var welcome = ''
    if(userName == '') {
      welcome = <Input
        containerStyle = {{marginBottom: 25, width: '70%'}}
        inputStyle={{marginLeft: 10}}
        placeholder='John'
        leftIcon={
            <Icon
            name='user'
            size={24}
            color="#eb4d4b"
            />
        }
        onChangeText={(val) => setPseudo(val)}
      />
    } else {
      welcome = <Text style={{marginBottom : 20, fontSize : 15}}>Welcome back {userName}</Text>
    }

    const saveUsername = (userName) => {
      AsyncStorage.setItem("userName", userName)
      setUserName(userName)
    }

    const resetUser = () => {
      AsyncStorage.clear()
      setUserName('')
    }

    
    return (
    <ImageBackground source={require('../assets/home.jpg')} style={styles.container}>

      {welcome}

        <Button
            icon={
                <Icon
                name="arrow-right"
                size={20}
                color="#eb4d4b"
                />
            }

            title="Go to Map"
            type="solid"
            style={{marginBottom : 10}}
            onPress={() => {saveUsername(pseudo); props.onSubmitPseudo(pseudo); props.navigation.navigate('BottomNavigator', { screen: 'Map' })}}
        />

        <Button
            title="Reset User"
            type="solid"
            onPress={() => {resetUser()}}
        />

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


function mapDispatchToProps(dispatch) {
    return {
      onSubmitPseudo: function(pseudo) { 
        dispatch( {type: 'savePseudo', pseudo: pseudo }) 
      }
    }
  }
  
  export default connect(
      null, 
      mapDispatchToProps
  )(HomeScreen);