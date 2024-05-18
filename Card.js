import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image
} from 'react-native';

import * as Colors from './lib/Colors';

class InfectionCard extends Component {
  render(){
      return(
        <View
        style={[styles.infectionCard, {backgroundColor: this.props.color}]}>
            {this.props.name != undefined &&
                <Text style={styles.cardText}>{this.props.name}</Text>
            }
            {this.props.drawCount != undefined &&
            <>
                <Text style={{color: Colors.White, fontWeight: "bold"}}>Draw Card ({this.props.drawCount})</Text>
                <Image style={[styles.backgroundImage]} source={require('./lib/pandemic.png')}></Image>
            </>
            }
       </View>
      );
  }
}

class PlayerCard extends Component {
    render(){
        const {type, name, population, color, description, drawCount} = this.props;
        switch(type){
            case 'City':
                return(
                    <CityCard name={name}
                    population={population}
                    color={color}/>
                );
            case 'Event':
                return(
                    <EventCard name={name}
                    description={description}/>
                );
            default:
                return(
                <View style={[styles.playerCard, {backgroundColor: color}]}>
                    <Text style={{color: Colors.White, fontWeight: "bold"}}>Draw Card ({drawCount})</Text>
                    <Image style={[styles.backgroundImage]} source={require('./lib/first_aid_icon.png')}></Image>
                </View>);
        }
    }
}

const CityCard = ({name, population, color}) => {
    return (
        <View
         style={[styles.playerCard, {backgroundColor: color}]}
        >
            <Text style={styles.cardText}>
                {name}
            </Text>
            <Image style={[styles.tinyLogo]} source={getImageForVirus(color)}></Image>
            {/* <Text style=
            {[
                styles.cityCardText
            ]}>{population}
            </Text> */}
        </View>
    );
}

const EventCard = ({name, description}) => {
    return (
        <View
         style={[styles.playerCard, {backgroundColor: Colors.EventCard}]}
        >
            <Text 
             style={styles.cardText}
             >
                 {name}
            </Text>
            {/* <Text 
             style={styles.cityCardText}
            >
                 {description}
            </Text> */}
        </View>
    );
}

const images = {
    BlackVirus: require('./lib/black_virus_icon.png'),
    YellowVirus: require('./lib/yellow_virus_icon.png'),
    RedVirus: require('./lib/blue_virus_icon.png'),
    BlueVirus: require('./lib/red_virus_icon.png'),
};

const getImageForVirus = (color) => {
    switch(color){
        case(Colors.BlackVirus):
            return images.BlackVirus;
        case(Colors.YellowVirus):
            return images.YellowVirus;
        case(Colors.RedVirus):
            return images.RedVirus;
        case(Colors.BlueVirus):
            return images.BlueVirus;
        default: return '';
    }
};

const styles = StyleSheet.create({
    playerCard:{
        height: 100,
        width: 75,
        padding: 5,
        borderRadius: 10,
        margin: 5,
        elevation: 5,
    },
    cardText:{
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: Colors.White,
        borderRadius: 10
    },
    infectionCard:{
        height: 75,
        width: 100,
        color: Colors.White,
        padding: 5,
        borderRadius: 10,
        margin: 5,
        elevation: 5
    },
    tinyLogo: {
        width: 40,
        height: 40,
        alignSelf: 'center',
        position: 'absolute',
        top: '50%',
        opacity: .75
    },
    backgroundImage: {
        position: 'relative',
        width: 50,
        height: 50,
        alignSelf: 'center'
    }
});

export {
    PlayerCard,
    InfectionCard
};