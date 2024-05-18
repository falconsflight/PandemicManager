import React, { useState } from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ToastAndroid,
  Alert, Modal, Pressable
} from 'react-native';

import { PlayerView } from './Player';
import * as Colors from './lib/Colors';
import { PlayerCard, InfectionCard } from './Card';

/*
TO DO LIST:
Event Card logic:
- Resilient Population
- One Quiet Night
- Forecast

Log of Events list:
- Any player action
- Any card draw

Epidemic logic:
- Infection rate display
- Update infection rate => Every 2 times it is updated, increase the number by 1; Upper limit of 4

Show turn order?
Display how many player cards remain
*/

const App: () => Node = () => {
  const playerDeckDrawLimit = 2;
  const initialInfectionRate = 2;
  const epidemicLevel = 5;
  const cityCards = require('./lib/CityCards.json');
  const eventCards = require('./lib/EventCards.json');

  const createInfectionCards = () => {
    let cards = [];
    cityCards.cities.map((card) => 
      cards.push({type:"Infection", name: card.name, color: Colors.InfectionCard})
    );
    return shuffle(cards);
  }

  const createCityCards = () => {
    let cards = [];
    cityCards.cities.map((card) => 
      cards.push({type:"City", name: card.name, population: card.population, color: getColorForVirus(card.color)})
    );
    return cards;
  };
  
  const createEventCards = () => {
    let cards = [];
    eventCards.eventCards.map((card) => 
      cards.push({type:"Event", name:card.name})
    );
    return cards;
  };
  
  const createEpidemicCards = () => {
    let cards = [];
    for(let i = 1; i <= epidemicLevel; i++){
      cards.push({type:"Epidemic", name: i});
    }
    return cards;
  };
  
  const shuffle = (deck) => {
    let i = deck.length - 1;
    for (; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }
    return deck;
  };
  
  const [modalVisible, setModalVisible] = useState(false);
  const [infectionDeck, setInfectionDeck] = useState(createInfectionCards());
  const [infectionDiscardPile, setInfectionDiscardPile] = useState([]);
  const [playerDeck, setPlayerDeck] = useState([]);
  const [playerDiscardPile, setPlayerDiscardPile] = useState([]);
  const [players, setPlayers] = useState(createPlayers());
  const [startGame, setStartGame] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState(players[0]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [drawCount, setDrawCount] = useState(playerDeckDrawLimit);
  const [infectionDrawCount, setInfectionDrawCount] = useState(initialInfectionRate);
  const [infectionRate, setInfectionRate] = useState(initialInfectionRate);
  const [epidemicCount, setEpidemicCount] = useState(0);

  const endTurn = () => {
    let nextPlayer = currentPlayerIndex + 1;
    const totalPlayers = players.length;
    if(nextPlayer >= totalPlayers){
      nextPlayer = 0;
    }
    setDrawCount(playerDeckDrawLimit);
    setCurrentPlayerIndex(nextPlayer);
    setCurrentPlayer(players[nextPlayer]);
    setInfectionDrawCount(infectionRate);
  };

  const toast = (message) => {
    ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.TOP);
  };
  
  const drawPlayerCard = (player) => {
    if(drawCount == 0){
      toast("You can't draw any more city cards. Infect cities by drawing from the infection deck.");
    }else{ 
      const drawnCard = drawCard(playerDeck);
      if (drawnCard !== undefined){
        if(drawnCard.type == "Epidemic"){
          handleEpidemic();
          return;
        }
        player.hand.push(drawnCard);
        //Hack to send a state change hook
        //so the UI will redraw
        setDrawCount(drawCount-1);
      }else{
        toast("GAME OVER! Resetting game...");
        resetGame();
      }
    }
  };

  const handleEpidemic = () => {
    //update the infection deck
    let bottomCard = infectionDeck[0];
    let newInfectionDeck = infectionDeck.slice(1);
    infectionDiscardPile.push(bottomCard);
    let newDiscardPile = shuffle(infectionDiscardPile);

    setInfectionDeck([...newInfectionDeck,...newDiscardPile]);
    setInfectionDiscardPile([]);
    setDrawCount(drawCount-1);

    if(epidemicCount == 2){
      setInfectionRate(infectionRate+1);
      setEpidemicCount(0);
    }else{
      setEpidemicCount(epidemicCount+1);
    }

    alert("EPIDEMIC! "+bottomCard.name+" has been infected!");
  };

  const resetGame = () => {
    setInfectionDeck(createInfectionCards());
    setInfectionDiscardPile([]);
    setPlayerDeck([]);
    setPlayerDiscardPile([]);
    setPlayers(createPlayers());
    setStartGame(true);
    setCurrentPlayer(players[0]);
    setCurrentPlayerIndex(0);
    setDrawCount(playerDeckDrawLimit);
    setInfectionDrawCount(initialInfectionRate);
    setInfectionRate(initialInfectionRate);
    setEpidemicCount(0);
  };

  const drawCard = (deck) => {
    if(deck.length > 0){return deck.pop();}
  };

  const displayInfectionDiscardPile = () => {
    if(infectionDiscardPile !== undefined){
      return infectionDiscardPile.map((card) => <InfectionCard key={card.name} name={card.name} color={card.color}></InfectionCard>);
    }else{
      return '';
    }
  };

  const displayTopInfectionDiscard = () => {
    let lastDiscard = infectionDiscardPile.slice(-1)[0];
    if(lastDiscard !== undefined){
      return <InfectionCard key={lastDiscard.name} name={lastDiscard.name} color={lastDiscard.color}></InfectionCard>;
    }else{
      return '';
    }
  };

  const drawInfectionCard = () => {
    if(drawCount > 0){
      toast("You must draw "+drawCount+" city card(s) before infecting more cities");
    }else{
      let card = infectionDeck.pop();
      infectionDiscardPile.push(card);
      setInfectionDrawCount(infectionDrawCount-1);
      if(infectionDrawCount-1 == 0){
        toast("Cities infected. Ending "+currentPlayer.name+"'s turn");
        endTurn();
      }
    }
  };

  const displayPlayerDiscardPile = () => {
    if(playerDiscardPile !== undefined){
      return playerDiscardPile.map((card) => 
      <PlayerCard 
      key={card.name}
      type={card.type} 
      name={card.name} 
      population={card.population} 
      color={card.color} 
      description={card.description}>
      </PlayerCard>);
    }else{
      return '';
    }
  };

  const displayTopPlayerDiscard = () => {
    let lastDiscard = playerDiscardPile.slice(-1)[0];
    if(lastDiscard !== undefined){
      return <PlayerCard 
      type={lastDiscard.type} 
      name={lastDiscard.name} 
      population={lastDiscard.population} 
      color={lastDiscard.color} 
      description={lastDiscard.description}></PlayerCard>;
    }else{
      return '';
    }
  };

  const displayPlayers = () => {
    return [].concat(players)
      .sort((a,b) => (a.turnOrder < b.turnOrder || (currentPlayerIndex + 1 != a.turnOrder)) ? 1 : -1)
      .map((player) => <PlayerView key={player.role} name={player.name} role={player.role} hand={player.hand} discardFunc={playCard}></PlayerView>
    );
  };

  const playCard = (playerName, card) => {
    let activePlayer = players.filter((player) => player.name == playerName)[0];
    if(activePlayer !== undefined){
      let updatedHand = activePlayer.hand.filter((cardInHand) => card.name != cardInHand.name);
      if(updatedHand == undefined){
        toast("Can't find card in"+activePlayer.name+"'s hand");
      }else{
        toast(activePlayer.name+" played "+card.name);
        activePlayer.hand = updatedHand;
        setPlayerDiscardPile([...playerDiscardPile, card]);
      }
    }
  };

  const seedPlayerDeck = (deck) => {
    let epidemicDeck = createEpidemicCards();

    let cardsPerGroup = deck.length / epidemicDeck.length;
    let numberOfGroups = deck.length / cardsPerGroup;
    
    let tempArray = [];
    for (let i = 1; i <= numberOfGroups; i++){
      let tempGroupList = [];
      tempArray.push(tempGroupList);
    }

    let counter = 0;
    while(deck.length > 0){
      tempArray[counter].push(deck.pop());
      if(counter >= tempArray.length - 1){
        counter = 0;
      }else{
        counter++;
      }
    }

    tempArray.map((group) => {
      group.push(epidemicDeck.pop());
      shuffle(group);
    });

    shuffle(tempArray);

    return tempArray.flat();
  };

  const intializeInfections = () => {
    let cards = [];
    for(let i = 0; i<6; i++){
      cards.push(infectionDeck.pop());
    }
    return cards;
  }

  if(startGame){
    let initialDeck = shuffle([...createCityCards(), ...createEventCards()]);
    players.map((player) => {
      for (let i=0; i < 6-players.length; i++){
        player.hand.push(initialDeck.pop());
      }
    });
    setPlayerDeck(seedPlayerDeck(initialDeck));
    setInfectionDiscardPile(intializeInfections());
    setStartGame(false);
  }

  return (
    <View style={{height:"100%", width:"100%", backgroundColor:"#011882"}}>
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View>
          <View style={[styles.sectionContainer, {flex: 1, flexWrap: "wrap", flexDirection: "row", padding: 10, justifyContent: 'center'}]}>
              <TouchableOpacity onPress={() => drawInfectionCard()}>
                <InfectionCard drawCount={infectionDrawCount} color={Colors.InfectionCard}></InfectionCard>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>{displayTopInfectionDiscard()}</TouchableOpacity>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{currentPlayer.name}'s Turn</Text>
              <Button
                title="End Turn" 
                onPress ={
                  () => {endTurn()}
                }
              ></Button>
            </View>
            <View
            style={{flex: 1, flexWrap: "wrap", flexDirection: "column", padding: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: "green"}}
            >
              <Text style={{color: Colors.White}}>{playerDeck.length} Cards Left</Text>
              <View
            style={{flex: 1, flexWrap: "wrap", flexDirection: "row", padding: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.White}}>
                <TouchableOpacity onPress={() => drawPlayerCard(currentPlayer)}>
                  <PlayerCard drawCount={drawCount} color={Colors.PlayerCard}></PlayerCard>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>{displayTopPlayerDiscard()}</TouchableOpacity>
              </View>
              {/* <Button
                style={{paddingRight: 10}}
                title={"Draw Card (" + drawCount + ")"}
                onPress ={
                  () => {drawPlayerCard(currentPlayer)}
                }
              ></Button> */}
            </View>
            {displayPlayers()}
          </View>
        </ScrollView>
      </SafeAreaView>
    <SafeAreaView>
      <View style={styles.centeredView}>
        <ScrollView>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(!modalVisible)}
            style= {{height:100}}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.sectionTitle}>Infection Discards</Text>
                <Text style={styles.modalText}>{displayInfectionDiscardPile()}</Text>
                <Text style={styles.sectionTitle}>Player Discards</Text>
                <Text style={styles.modalText}>{displayPlayerDiscardPile()}</Text>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={styles.textStyle}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </SafeAreaView>
  </View>
  );
};

const createPlayers = () => {
  return ([
    {name:"Jacob", role:"Medic", turnOrder: 1, hand:[]},
    {name:"Emily", role:"Researcher", turnOrder: 2, hand:[]},
    {name:"Luke", role:"Contingency Planner", turnOrder: 3, hand:[]},
  ]);
};

const getColorForVirus = (color) => {
  switch(color){
    case "Blue":
      return Colors.BlueVirus
    case "Red":
      return Colors.RedVirus
    case "Yellow":
      return Colors.YellowVirus
    case "Black":
      return Colors.BlackVirus
    default: 
      return Colors.White;
  }
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    color: Colors.White
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.Gray,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default App;


/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 

import React, { useState } from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [isPressed, setIsPressed] = useState(false);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.js</Text> to change this
            screen and then come back to see your edits. Here is my contribution!
          </Section>
          <Section title="Test Section">
            <Button
            onPress ={() => {
              setIsPressed(true)
              }}
            disabled={isPressed}
            title={isPressed ? "I'm Pressed!" : "Press me!"}
              >
              </Button>
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
*/