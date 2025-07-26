import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import Chat from './components/Chat';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <Icon name="brain" size={24} color="#333" style={styles.icon} />
          <Text style={styles.header}>MotivAI</Text>
        </View>
        <Chat />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    marginRight: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});
