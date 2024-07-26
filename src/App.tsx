import { View, Text, Button } from 'react-native';
import { NavigationContainer, NavigationContainerRefWithCurrent, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createHistoryRouter, createRoute, createRouterControls } from 'atomic-router';
import { RouterProvider } from 'atomic-router-react';
import { createEvent, createStore, sample } from 'effector';
import { createGate, useGate, useUnit } from 'effector-react';
import { Action, Blocker, History, Listener, Location } from 'history';

function HomeScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('home2')}
      />
    </View>
  );
}

function HomeScreen2({ navigation }: any) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen2</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('home3')}
      />
    </View>
  );
}

function HomeScreen3({ navigation }: any) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen3</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('home')}
      />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export const $history = createStore<any>(null as never, {
  serialize: "ignore",
});

const routes = {
  home: createRoute(),
  home2: createRoute(),
  home3: createRoute(),
}

const routesMap = [
  { path: '/home', route: routes.home },
  { path: '/home2', route: routes.home2 },
  { path: '/home3', route: routes.home3 },
]

type CreateRouterControls = ReturnType<typeof createRouterControls>;


const controls: CreateRouterControls = createRouterControls();



const router = createHistoryRouter({
  routes: routesMap,
  controls,
});

const AppGate = createGate<{
  navigation: NavigationContainerRefWithCurrent<any>
}>();


sample({
  clock: AppGate.open,
  fn: ({ navigation }) => createRactNativeHistory({ navigation }),
  target: $history,
});

const start = createEvent()

sample({
  clock: start,
  source: $history,
  target: router.setHistory,
});


function App() {
  const navigationRef = useNavigationContainerRef();

  globalThis.navigationRef = navigationRef

  useGate(AppGate, {
    navigation: navigationRef,
  })

  const startEv = useUnit(start)

  return (
    <RouterProvider router={router}>
      <NavigationContainer ref={navigationRef} onReady={() => startEv()}>
        <Stack.Navigator>
          <Stack.Screen name="/home" component={HomeScreen} />
          <Stack.Screen name="/home2" component={HomeScreen2} />
          <Stack.Screen name="/home3" component={HomeScreen3} />
        </Stack.Navigator>
      </NavigationContainer>
    </RouterProvider>
  );
}

function createRactNativeHistory({ navigation }: {
  navigation: NavigationContainerRefWithCurrent<any>
}): History {

  function createHref(to: any): string {
    console.log(to)

    return typeof to === 'string' ? to : JSON.stringify(to);
  }

  function push(to: any): void {
    navigation.navigate(to);
  }

  function replace(to: any): void {
    navigation.reset({
      index: 0,
      routes: [{ name: to }],
    });
  }

  function go(n: number): void {
    if (n < 0) {
      for (let i = n; i < 0; i++) {
        navigation.goBack();
      }
    } else if (n > 0) {
      for (let i = 0; i < n; i++) {
        navigation.navigate(navigation.getRootState().routes[navigation.getRootState().index + 1].name);
      }
    }
  }

  const listeners: Array<Listener> = [];
  const blockers: Array<Blocker> = [];

  const history: History = {
    // @ts-expect-error but in code exists
    get index(): number {
      return navigation.getRootState().index;
    },

    get action(): Action {
      // This is a placeholder. Adjust based on your needs.
      return Action.Push;
    },

    get location(): Location {
      // Convert navigation state to a Location object
      const state = navigation.getRootState();

      console.log(state)

      console.log(
        {
          pathname: state.routes[state.index].name,
          search: '',
          state: state.routes[state.index].params,
          hash: '',
          key: state.key, // Ensure key is included
        }
      )

      return {
        pathname: state.routes[state.index].name,
        search: '',
        state: state.routes[state.index].params,
        hash: '',
        key: state.key, // Ensure key is included
      };
    },

    createHref,

    push,

    replace,

    go,

    back: function back(): void {
      go(-1);
    },

    forward: function forward(): void {
      go(1);
    },

    listen: function listen(listener: Listener): () => void {
      listeners.push(listener);

      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },

    block: function block(blocker: Blocker): () => void {
      blockers.push(blocker);

      return () => {
        const index = blockers.indexOf(blocker);
        if (index > -1) {
          blockers.splice(index, 1);
        }
      };
    },

    // Dummy implementations to satisfy History interface
    createPath: (location) => {
      throw new Error("createPath");

      return location.pathname;
    },

    // Additional methods not used in this implementation
    goBack: function () {
      go(-1);
    },

    goForward: function () {
      go(1);
    },

    length: 0,
  };

  return history;
}

export default App;