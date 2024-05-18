import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity
} from 'react-native';
import { PlayerCard } from './Card';
import * as Colors from './lib/Colors';


class PlayerView extends Component {

    removeCardFromHand(card){
        this.props.discardFunc(this.props.name, card);
    }

    render(){
      let {name,role,hand} = this.props;
      const displayHand = () => {
        if(hand != undefined){
            return hand.map(
                (card) => 
                    <TouchableOpacity key={card.type+card.name} onPress={() => this.removeCardFromHand(card)}>
                        <PlayerCard 
                        type={card.type} 
                        name={card.name} 
                        population={card.population} 
                        color={card.color} 
                        description={card.description}></PlayerCard>
                    </TouchableOpacity>
                );
        }
      };
      return(
        <PlayerSection name={name} role={role}>
            {displayHand()}
        </PlayerSection>
      );
  }
}

const PlayerSection = ({children, name, role}) => {
    return (
      <View style={styles.playerView}>
        <View style={styles.playerTitle}>
            <Text style={styles.playerNameText}>{name}</Text>
            <Text style={styles.playerRoleText}>the {role}</Text>
        </View>
        <View 
         style={{
                flex: 1,
                flexDirection: "row",
                flexWrap: "wrap",
            }}
        >
            {children}
        </View>
      </View>
    );
  };

const styles = StyleSheet.create({
    playerView: {
        margin: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: Colors.PlayerView,
        elevation: 5
    },
    playerTitle: {
        borderBottomColor: "#8f8f8f",
        borderBottomWidth: 2,
        marginBottom : 5,
        paddingLeft: 5,
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    playerNameText: {
        marginRight: '5%',
        fontSize: 24,
        fontWeight: '600',
        color: Colors.White,
    },
    playerRoleText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.White,
    },
});

export{
    PlayerView
};