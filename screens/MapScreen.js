import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Button, Overlay, Input } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

import AsyncStorage from '@react-native-async-storage/async-storage';
import socketIOClient from "socket.io-client";


var socket = socketIOClient("http://192.168.1.38:3000");

export default function MapScreen() {

  const [currentLatitude, setCurrentLatitude] = useState(0);
  const [currentLongitude, setCurrentLongitude] = useState(0);
  const [otherLatitude, setOtherLatitude] = useState(0);
  const [otherLongitude, setOtherLongitude] = useState(0);
  const [addPOI, setAddPOI] = useState(false);
  const [listPOI, setListPOI] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const [titrePOI, setTitrePOI] = useState();
  const [descPOI, setDescPOI] = useState();

  const [tempPOI, setTempPOI] = useState();

  

  useEffect(() => {

    async function askPermissions() {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === 'granted') {
        Location.watchPositionAsync({ distanceInterval: 2 },
          (location) => {
            setCurrentLatitude(location.coords.latitude)
            setCurrentLongitude(location.coords.longitude);
            socket.emit("sendPosition", {latitude: location.coords.latitude, longitude: location.coords.longitude} )
          }
        );
      }
    }
    askPermissions();
  }, []);

  
  useEffect(() => { 
    socket.on('sendPosition', (positionData)=> {
      setOtherLatitude(positionData.latitude);
      setOtherLongitude(positionData.longitude)

 });

  }, [setOtherLatitude]);

  
  useEffect(() => {

    var initPOI = () => {
      AsyncStorage.getItem("POI", function(error, data) {
        if(data !== null){
      setListPOI(JSON.parse(data));
        } 
     })}
     initPOI()
  }, []);

  var selectPOI = (e) => {
    if (addPOI) {
      setAddPOI(false);
      setIsVisible(true);
      setTempPOI({ latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude });
    }
  }

  var handleSubmit = () => {
    setListPOI([...listPOI, { longitude: tempPOI.longitude, latitude: tempPOI.latitude, titre: titrePOI, description: descPOI }]);
    setIsVisible(false);
    setTempPOI();
    setDescPOI();
    setTitrePOI();
    AsyncStorage.setItem("POI", JSON.stringify(listPOI))
  }


  var markerPOI = listPOI.map((POI, i) => {
    return <Marker key={i} pinColor="blue" coordinate={{ latitude: POI.latitude, longitude: POI.longitude }}
      title={POI.titre}
      description={POI.description}
    />
  });
  var isDisabled = false;
  if (addPOI) {
    isDisabled = true;
  }

  return (
    <View style={{ flex: 1 }} >
      <Overlay
        isVisible={isVisible}
        onBackdropPress={() => { setIsVisible(false) }}
      >
        <View>
          <Input
            containerStyle={{ marginBottom: 25 }}
            placeholder='titre'
            onChangeText={(val) => setTitrePOI(val)}

          />

          <Input
            containerStyle={{ marginBottom: 25 }}
            placeholder='description'
            onChangeText={(val) => setDescPOI(val)}

          />

          <Button
            title="Ajouter POI"
            buttonStyle={{ backgroundColor: "#eb4d4b" }}
            onPress={() => handleSubmit()}
            type="solid"
          />
        </View>
      </Overlay>

      <MapView
        onPress={(e) => { selectPOI(e) }}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 48.866667,
          longitude: 2.333333,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker key={"currentPos"}
          pinColor="red"
          title="Hello"
          description="I'am here"
          coordinate={{ latitude: currentLatitude, longitude: currentLongitude }}
        />

        <Marker key={"otherPos"}
          pinColor="green"
          title="Jade"
          description="I'am here"
          coordinate={{ latitude: otherLatitude, longitude: otherLongitude }}
        />
        {markerPOI}
      </MapView>
      <Button
        disabled={isDisabled}
        title="Add POI"
        icon={
          <Icon
            name="map-marker"
            size={20}
            color="#ffffff"
          />
        }
        buttonStyle={{ backgroundColor: "#eb4d4b" }}
        type="solid"
        onPress={() => setAddPOI(true)} />
    </View>
  );
}

